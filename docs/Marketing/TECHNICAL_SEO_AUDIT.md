# Technical SEO audit and fixes

Scope: how well search engines and AI crawlers can read vayupackaging.vercel.app, and what was changed to fix it.
Audit date: 2026-10-27. Branch: design-improvement. Companion docs: `docs/Completed/SEO_IMPLEMENTATION_GUIDE.md`, `docs/Completed/BACKLINKS_STRATEGY.md`, `docs/Marketing/KEYWORD_AND_GROWTH_STRATEGY.md`.

## 1. What crawlers got before

The site is a Vite + React single-page app. `dist/index.html` was a 5 kB shell with an empty `<div id="root">`, and Vercel served that same file for every URL.

| Check | Before |
|---|---|
| Initial HTML of a blog post | Empty shell. Title, description, canonical, Open Graph and JSON-LD were all added by JavaScript (react-helmet-async) after the markdown was fetched from `/content/blogs/<slug>.md`. Crawlers that do not run JS (many AI crawlers, Bing in some cases, WhatsApp/LinkedIn link previews) saw the home page title and `og:url` on every URL and no article text. |
| Headings, internal links, FAQ text | None in the HTML. |
| Duplicate head tags | The shell's generic title, description, robots and `og:*` tags stayed in `<head>` and Helmet added a second set. |
| Canonical | Pages without an explicit canonical used `window.location.href`, so `?template=`, `?style=` and `?utm_*` URLs canonicalised to themselves. `/privacy` and `/image-credits` passed a relative canonical (invalid). |
| Share images | `PAGE_METADATA.*.ogImage` was spread into `MetaTags`, which reads `image`, so it was ignored (harmless, because most of those files never existed). Blog and landing share cards were fine. |
| Structured data | Organization and LocalBusiness carried an invented `aggregateRating` (4.8 from 150 reviews) and `award: [BIS, ISO, FSSAI]`. Both are unverified claims and can trigger a Google manual action. The designer SoftwareApplication pointed at a screenshot URL that does not exist. Article `timeRequired` was "8 min read" (must be ISO 8601), `dateModified` always equalled `datePublished`, no word count, no keywords. FAQPage schema was never produced for blog FAQs. |
| Sitemap | Hand-maintained. It was complete (all posts and 18 landings) but every `lastmod` was a stale date, and nothing stopped a new post being forgotten (a test only checked blog slugs). No image entries. |
| robots.txt | Allowed everything, no `Disallow` for `/admin`, `/embed/`, `/api/`, `Crawl-delay: 0` (ignored by Google), no explicit AI crawler rules. |
| Routing | The Vercel rewrite sent every unknown URL, including missing `/content/blogs/x.md` and missing `.js` files, to `index.html` with status 200 (soft 404s). |
| Titles | Blog titles were up to 136 characters before the brand suffix (cut off in results). The content team has since shortened them; a safeguard now exists (see 2.7). |
| Internal linking | Good: every post has at least 6 internal links; one post (`wholesalers-spec-price-share-boxes`) had no inbound link from another post. |
| Core Web Vitals risks | First-load entry chunk 722 kB (226 kB gzip). It included zod, react-hook-form and the admin drawer, none of which a visitor needs to see the home page. Fonts are self-hosted with `font-display: swap` and two preloads (fine). The blog hero image had no priority hint; markdown images had no width/height. 33 designer screenshots weigh 12 MB in total (lazy-loaded). |
| Redirects for old URLs | None needed: route names have not changed since the first blog commit. A few common alternates were added (2.6). |

## 2. What was changed

### 2.1 Build-time prerender (the main fix)

`npm run build` is now `build-files` -> `vite build` -> `postbuild`:

1. `scripts/seo/build-files.mjs` writes `public/sitemap.xml`, `robots.txt`, `llms.txt` from the page list.
2. `vite build` as before.
3. `scripts/seo/postbuild.mjs` loads the TypeScript sources through Vite's SSR loader, renders one HTML file per indexable page into `dist/<route>/index.html`, and checks each one (title, canonical, description, h1, share image, at least 120 words, unique title). The build fails if a page cannot be rendered.

Each prerendered file has its own `<title>`, description, canonical, robots, Open Graph and Twitter tags, JSON-LD, and a content shell in `<body>`: headings with ids, the full article text (same react-markdown pipeline and URL allow-lists as the live page), table of contents, FAQ, related posts, previous/next, the designer deep link, header and footer navigation with links to every product, industry, box style, calculator and the newest guides.

Coverage: 99 pages at the time of writing = home, about, services, products + 10 product pages, 6 industry pages, locations, contact, quote, Packaging Finder, `/tools` + 6 calculators, `/box-designer` + 18 style landings, `/blogs` + 46 posts, privacy, image credits. Output is about 2.4 MB of HTML in 3.8 s.

How the app takes over: the shell sits in front of `<div id="root">`, and the root is hidden (`visibility: hidden`, still laid out) until the app has rendered. `src/lib/prerender.ts` then removes the shell and reveals the root in one step, so there is no flash and no hydration mismatch (the app uses `createRoot`, not `hydrateRoot`). Blog posts hold the hand-over until the article text has loaded. An 8 s timer in `src/main.tsx` reveals the app anyway if a route never hands over. If JavaScript fails, the shell stays visible.

All injected head tags carry `data-rh="true"`, the attribute react-helmet-async manages, so Helmet replaces them instead of duplicating them. The generic tags in `index.html` got the same attribute, which also fixes the duplicate title/description/og tags on routes that are not prerendered.

Verified in headless Edge against the built output: with JS off every prerendered page shows its own title, canonical, one h1, JSON-LD and body text (blog post: 14,000 characters, 10 table-of-contents links, designer card, previous/next); with JS on the head has exactly one title, canonical and description, the shell is gone and the page is interactive.

### 2.2 Routing (`vercel.json`)

- Explicit rewrites send each prerendered route to its own file (`/blogs/:slug` -> `/blogs/:slug/index.html` and so on), so prerendered pages win without depending on directory-index behaviour.
- Everything else (admin, embed) falls back to `/app-shell.html`, the original empty shell. `dist/index.html` is now the prerendered home page.
- The fallback no longer swallows static files: missing `.md`, `.js`, `.css`, `.json`, images and fonts return a real 404. Unknown `/blogs/<x>` style URLs return a real 404 using `dist/404.html` (the app boots and redirects visitors to the index).
- Redirects (308): `/blog`, `/blog/:slug`, `/designer`, `/3d-box-designer`, `/packaging-finder`, `/about-us`, `/contact-us`, `/index.html`.
- `sitemap.xml` was served with `Cache-Control: private`; now `public, max-age=0, must-revalidate`. `llms.txt` header added.
- A test (`src/seo/__tests__/vercel.test.ts`) checks that every prerendered page has a rewrite and that assets and API calls are never rewritten to HTML.

### 2.3 Sitemap, robots, llms.txt (generated)

- `src/seo/pages.ts` is the single page list (title, description, image, lastmod, JSON-LD per page). Blog `lastmod` is `updated ?? date` (new optional `updated` field in `src/constants/blogs.ts`; set it when an article is corrected). Static pages use `STATIC_LASTMOD`.
- `public/sitemap.xml`: 99 URLs with accurate `lastmod` and `<image:image>` entries for every blog post and designer landing (their share cards).
- `public/robots.txt`: allow all, disallow `/admin`, `/embed/`, `/api/`, explicit allow for GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended, Applebot-Extended, and the sitemap line.
- `public/llms.txt`: plain index of key pages, tools, box styles and guides for AI assistants.
- Tests (`src/seo/__tests__/sitemap.test.ts`): every blog post, landing, product and industry has a page; every static `<Route>` in `App.tsx` has an entry (so the next new page, such as the calculators, cannot be missed); canonical URLs, titles and descriptions are unique; committed sitemap has the same URLs and lastmods as the generator; robots blocks private paths.
- When a test says the files are stale: `npm run seo:files` and commit the three files.

### 2.4 Head tags and schema

- `src/seo/meta.ts` holds the shared logic for full title, canonical and share image, used by both `MetaTags` and the prerender, so both emit identical values. Canonical is now always absolute with no query string, hash or trailing slash.
- Robots meta now includes `max-image-preview:large, max-snippet:-1, max-video-preview:-1`.
- Removed duplicate `viewport` and a conflicting `theme-color` from `MetaTags` (the shell already sets them).
- Removed the unverified `aggregateRating` and `award` from Organization and LocalBusiness, `contactOption: TollFree` (a mobile number), and the non-existent screenshot URL (`VERIFY-LATER[SEO-RATING]`, `VERIFY-LATER[CERT-01]`).
- New schema: `WebSite` on home, `Blog` (with `blogPost` list) on `/blogs`, FAQPage for the home FAQ, BreadcrumbList on Packaging Finder, quote, privacy and image credits.
- Article schema: `dateModified` from `updated`, ISO `timeRequired`, `wordCount`, `keywords` from the SEO metadata, headline capped at 110 characters.
- Hard-coded origins in schema and `WEBSITE_URL` now follow `SEO_CONFIG.siteUrl`, which reads `VITE_SITE_URL` (see 4).

### 2.5 Blog pages (`src/pages/BlogPost.tsx`, `Blogs.tsx`)

Already present and kept: table of contents, breadcrumbs (visual and schema), author box, share buttons (WhatsApp, LinkedIn, X, copy link), published date, related posts.
Added:
- FAQPage schema extracted from each post's "Frequently asked questions" section (`extractFaqs`, every current post parses; the live page and the prerender use the same function).
- Reading time and word count computed from the text (220 words per minute) instead of the hand-typed string; "Updated" date shown when `updated` differs from `date`.
- Related posts by shared tags (`src/lib/blogRelated.ts`, scoring: specific tag 3, generic "designer" tag 1, same category 2) instead of category only.
- Previous / next navigation in publication order.
- "Try this in the 3D designer" card: deep link to the matching `/box-designer/<style>` (for example mailer, pizza, shoe, gift, heavy-duty, fruit, window mailer, cake, takeaway) or `/box-designer`, with `utm_source=blog&utm_medium=article&utm_campaign=<slug>&utm_content=try-3d-designer` and `src=blog.<slug>` (the same `src` convention as `quoteHref`).
- Images in articles carry `width` and `height` from a generated table (`src/content/blogImageSizes.ts`, `npm run seo:images`), `loading="lazy"` and `decoding="async"`; the featured image has `fetchpriority="high"`.

### 2.6 Content checks that fail the build or the tests

- Every markdown image needs alt text of at least 12 characters and must exist in `/public` (or be queued in `scripts/screenshots/shots.json`), and must have a size in `blogImageSizes.ts`.
- Every post has at least 3 distinct internal links, no link points at a missing post, and at most 6 posts may have no inbound link from another post.
- Every FAQ section must parse into question and answer pairs.
- `npm run seo:report` prints the full table: internal links out and in per post, thin posts (under 3 links), orphans, images without alt text, title and description lengths, posts without a FAQ or under 600 words. Current result: no thin posts; four orphans (`wholesalers-spec-price-share-boxes` and three recent posts: `cake-box-size-chart`, `choose-corrugated-box-manufacturer-ahmedabad`, `packing-for-amazon-flipkart-meesho`). Link to them from one or two related older posts.

### 2.7 Titles

`buildFullTitle` adds " | Vayu Packaging Solutions" only when the whole title fits 70 characters, and compacts titles over 65 characters to their first clause ("A: B" becomes "A"). Titles written with a pipe are used as written. A test caps every page title at 80 characters.

### 2.8 Core Web Vitals quick wins

Entry chunk (first load, minified): 722.31 kB (226.26 kB gzip) -> 598.51 kB (190.42 kB gzip), a drop of 123.8 kB (35.8 kB gzip), 17 percent, even though the SEO work added code to it (604 kB / 191.5 kB gzip at the final build, after other teams added more content to the bundle).
- zod and react-hook-form left the entry (most of the saving): the plain option lists moved to `src/lib/quoteOptions.ts` (re-exported by `quoteSchema.ts`, so no import changed for the form or `api/quote.ts`).
- The home page quote form (`QuoteForm`, react-hook-form) loads when its section is 600 px from the viewport (`LazyOnView`), as a separate 4.7 kB gzip chunk.
- The admin drawer/dialog overlay moved into a lazy chunk; vaul and the dialog are no longer in the public bundle.
- Prerendered text paints before any JS runs, which should improve LCP on blog, landing and tool pages; the app swap adds no layout shift (the shell is removed, nothing visible moves).
- Already fine and left alone: self-hosted fonts with `font-display: swap` and preloads for the two above-the-fold weights, no third-party requests before interaction, hashed assets with immutable caching.
- Build: `vite build` plus 3.6 s for the prerender (the whole `npm run build` takes 27 to 37 s on this machine while other work is running; `vite build` alone was about 18 s before).

## 3. What remains

Owner decisions and facts (nothing blocks the build):
- `VERIFY-LATER[SEO-DOMAIN]`: the site lives on a vercel.app subdomain. Decide the real domain; then set `VITE_SITE_URL` in Vercel, add the domain, and 301 the old host. Canonicals, sitemap, schema, robots and `llms.txt` all follow it. Search Console treats a new domain as a new property.
- `VERIFY-LATER[SEO-RATING]`: add `aggregateRating` only when genuine reviews are shown on the page. The 4.8 / 150 figures still sit unused in `SEO_CONFIG` and should be deleted or replaced.
- `VERIFY-LATER[CERT-01]`: BIS, ISO and FSSAI claims remain in `SEO_CONFIG.certifications` (no longer emitted). Confirm before using them anywhere.
- `VERIFY-LATER[SEO-SOCIAL]`: `sameAs` links (facebook.com/vayupackaging, linkedin.com/company/vayu-packaging, X, Instagram) are guesses; confirm each profile exists or remove them. Same for the Twitter handle in `SEO_CONFIG`.
- `VERIFY-LATER[BLOG-01]`: articles are bylined to "Vayu Packaging Team" (Organization). A named author with role and a short bio page is a stronger trust signal.
- `VERIFY-LATER[SEO-01]`: only blog posts and designer landings have their own share card; other pages use `/og-image.jpg`.
- Two different `google-site-verification` tokens exist (`index.html` and `SEO_CONFIG.googleSiteVerification`). Keep both unless you know which property each belongs to.
- Copy mismatch seen while auditing: the contact page meta description says "response within 24 hours" while `FACTS.replySla` is 2 working hours (`VERIFY-LATER[FACT-13]`).

Technical follow-ups:
- Images: 33 designer screenshots in `public/blog-images/designer` total 12 MB (about 350 kB each) (plus 2.5 MB of OG PNGs). Convert screenshots to WebP/AVIF (no image tool such as sharp is installed here) and serve them with `srcset`.
- `public/brochures` is 21 MB (`VERIFY-LATER[ASSET-01]`, already noted).
- `STATIC_LASTMOD` in `src/seo/pages.ts` is maintained by hand for non-blog pages; update it when copy changes.
- The services FAQ lives inside `Services.tsx`, so its FAQPage schema is only added after JS runs (the visible text is prerendered). Move it to `src/content` to prerender the schema too.
- Home title is 78 characters; consider a shorter variant when keyword targets are settled.
- The 20 designer styles have 18 landing pages (`hsc`, `produce-tray`, `one-two-three` are intentionally merged, see `NO_LANDING_REASONS`).
- Hindi / Gujarati versions would need `hreflang` and a locale-aware prerender (the `alternateLanguages` config is unused).
- Google limits FAQ rich results to a few site types and has retired HowTo rich results; the schema is kept because it is valid, harmless and read by other engines and AI systems, but do not expect SERP features from it.
- Field data: after launch check CrUX / PageSpeed Insights for LCP, INP and CLS (the `web-vitals` package is installed; confirm it reports to analytics).

## 4. Owner checklist after deploy

Done by the build (no action):
- [x] Per-page title, description, canonical, Open Graph, Twitter, JSON-LD in static HTML for 99 pages
- [x] sitemap.xml, robots.txt and llms.txt generated, tested and committed
- [x] Real 404 for unknown posts and missing files
- [x] Image alt text, internal links and FAQ parsing enforced by tests

Needs you:
- [ ] Deploy, then confirm what crawlers see:
  `curl -s https://<site>/blogs/flute-types-guide | grep -E "<title>|rel=\"canonical\"|<h1"` (expect the post's own title, canonical and h1),
  `curl -sI https://<site>/blogs/does-not-exist` (expect 404), `curl -s https://<site>/sitemap.xml | head`, `curl -s https://<site>/robots.txt`.
- [ ] If the first command shows the home page title for a blog URL, directory rewrites are not applied: check that `vercel.json` was deployed and that the output directory is `dist`.
- [ ] Google Search Console: add the property (URL prefix, verified by the meta tag already in the page), then Sitemaps -> submit `sitemap.xml`.
- [ ] Search Console -> URL Inspection -> test live URL for `/`, `/box-designer`, one landing, one blog post: confirm "Page is indexable", the rendered HTML shows the article, and the Page fetch is successful. Click "Request indexing" for the home page, `/box-designer`, `/tools` and the top blog posts.
- [ ] Search Console -> Enhancements: check Breadcrumbs, FAQ, Article and Product reports after a week; fix any warning.
- [ ] Bing Webmaster Tools: import the site from Search Console and submit the sitemap (also feeds Copilot and several AI search tools). Add the token to `SEO_CONFIG.bingVerification`.
- [ ] Google Business Profile (see `docs/Completed/GOOGLE_BUSINESS_PROFILE_SETUP.md`): the address and phone in the schema must match the profile exactly.
- [ ] Decide the domain (`VERIFY-LATER[SEO-DOMAIN]`) before building backlinks (`docs/Completed/BACKLINKS_STRATEGY.md`), because links to a vercel.app address would have to be redirected later.
- [ ] Share one post on WhatsApp and LinkedIn and check the preview card (each post has its own title, description and 1200x630 image); use LinkedIn Post Inspector and the Facebook Sharing Debugger to refresh caches if needed.
- [ ] Run PageSpeed Insights on `/`, one blog post and `/box-designer` (mobile) and note LCP, INP, CLS as the baseline.

## 5. Adding content later (nothing to remember)

- New blog post: add it to `src/constants/blogs.ts` (and the SEO metadata, CTA tags, markdown and OG image as the registry test requires), run `npm run seo:files` and `npm run seo:images` if it has images, commit. The build prerenders it automatically. Set `updated: "YYYY-MM-DD"` when you correct an old post.
- New page: add the route in `App.tsx`, an entry in `src/seo/pages.ts`, a content block in `src/seo/prerender/body.tsx`, and a rewrite in `vercel.json`. Tests name whichever of these is missing.
- Weekly: `npm run seo:report`.

## 6. Files

New: `src/seo/pages.ts`, `meta.ts`, `sitemap.ts`, `linkGraph.ts`, `src/seo/prerender/{index,body,markdown}.tsx|ts`, `document.ts`, `src/seo/schema/site.ts`, `src/lib/blogRelated.ts`, `src/lib/prerender.ts`, `src/lib/quoteOptions.ts`, `src/content/blogImageSizes.ts`, `src/components/site/LazyOnView.tsx`, `src/components/admin/AdminEntityOverlay.tsx`, `scripts/seo/{load,build-files,postbuild,image-sizes,report}.mjs`, `public/llms.txt`, tests in `src/seo/__tests__/` and `src/lib/__tests__/blogRelated.test.ts`.
Changed: `package.json` (scripts), `vercel.json`, `index.html`, `public/sitemap.xml`, `public/robots.txt`, `src/App.tsx`, `src/main.tsx`, `src/components/SEO/MetaTags.tsx`, `src/components/TableOfContents.tsx`, `src/pages/{BlogPost,Blogs,Home,Quote,CompareQuote,Products}.tsx`, `src/components/home/ProofAndContact.tsx`, `src/lib/blogMarkdown.ts`, `src/lib/quoteSchema.ts`, `src/lib/quotePrefill.ts`, `src/content/products.ts`, `src/constants/{blogs,index}.ts`, `src/seo/config.ts`, `src/seo/schema/{article,boxDesigner,localBusiness,organization,softwareApplication,index}.ts`, `src/types/seo.ts`.
