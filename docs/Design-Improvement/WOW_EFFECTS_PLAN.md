# Vayu website: effects, polish and UI-fix plan

**Date:** 17 Nov 2026 · **Status:** plan only. The UI bugs in §3.1 were fixed in this pass. Nothing in §5 onward is built yet.
**Relates to:** [DESIGN_IMPROVEMENT_PLAN.md](DESIGN_IMPROVEMENT_PLAN.md) §8 (motion system). This plan **amends §8.3 and §8.7** (see §4) so that blur and glass are allowed under strict rules.

---

## Contents

0. [How to read this plan](#0-how-to-read-this-plan)
1. [Summary](#1-summary)
2. [How this was researched](#2-how-this-was-researched)
3. [UI bug audit](#3-ui-bug-audit)
4. [Motion rules, revised](#4-motion-rules-revised)
5. [Foundation to build first](#5-foundation-to-build-first)
6. [Effect catalogue (FX-01 to FX-30)](#6-effect-catalogue)
7. [Page-by-page application map](#7-page-by-page-application-map)
8. [Phases and order of work](#8-phases-and-order-of-work)
9. [QA and test plan](#9-qa-and-test-plan)
10. [Not adopted](#10-not-adopted)
11. [Reference library](#11-reference-library)
12. [Open questions](#12-open-questions)

---

## 0. How to read this plan

- **BUG-nn** is a UI defect found in the audit. **FX-nn** is an effect from the catalogue. Pages in §7 refer to both by ID.
- **Priority:** P1 = the next build, P2 = after P1 ships and is measured, P3 = nice to have.
- **Cost** is the runtime cost on a mid-range Android phone: very low / low / med / high.
- **Effort** is a rough estimate: S ≤ half a day, M ≈ 1 day, L ≈ 2–3 days.
- Every FX item lists four things: what it looks like, where it goes, how to build it, and its fallback for touch screens, reduced motion and the low tier. An effect without a fallback is not done.
- Unknown facts follow the house rule: use what is in the code and mark it `VERIFY-LATER[FX-nn]`. Nothing here blocks on the owner.

---

## 1. Summary

**Theme: "Craft, not circus".** Top design sites get their wow from a few quiet techniques done with care, not from many loud ones. Vayu's version has three ingredients:

1. **Tactile material.** Paper grain already exists on the cream sections; ink grain is added on the dark ones. SVG lines draw themselves the way a dieline is plotted. Boxes and dielines are the visuals.
2. **Light and glass, only on floating things.** A frosted nav, menus, the dock and dialogs. A soft light follows the pointer across card grids. One traveling border light on the single most important button per screen.
3. **Continuity.** Headlines resolve from a soft blur, numbers roll instead of jumping, pages cross-fade and a product card grows into its page, and the process cards stack as you scroll.

**The ten moves that matter most, in order:**

| # | Move | FX | Where it shows |
|---|---|---|---|
| 1 | Glass nav 2.0: real frosted glass with a light edge, every page | FX-01 | Global |
| 2 | Cursor spotlight + border glow on every card grid | FX-06 | Products, industries, tools, services, Tools menu |
| 3 | Blur-in headlines for section titles (not the LCP H1) | FX-03 | Every page |
| 4 | Ink grain + ambient light pools on dark sections | FX-05, FX-23 | Dark sections, CTA bands, footer |
| 5 | Route cross-fade + product/blog card → page morph | FX-13, FX-14 | All navigation |
| 6 | Rolling numbers in stats, calculators, prices | FX-10 | Home, about, tools, finder, designer |
| 7 | Sticky stacking cards for "Dieline to dispatch" | FX-12 | Home S6, services |
| 8 | Self-drawing SVG lines (dieline, map routes, process icons) | FX-24 | Home, locations, 404, product pages |
| 9 | Morphing glass mega menu + staggered mobile menu | FX-16, FX-17 | Global |
| 10 | Form craft: focus glow, step slide, drawn success check | FX-19 | Quote, contact, finder |

The whole set adds no runtime dependency. framer-motion, GSAP, Lenis and the existing `showcase/fx` helpers cover it. Most of it is CSS.

---

## 2. How this was researched

### 2.1 Site audit (our own pages)

- A headless Edge job ([scripts/screenshots/jobs/site-audit.mjs](../../scripts/screenshots/jobs/site-audit.mjs), new) loaded **20 public routes at 1440 px and 390 px**: 40 page loads and **280 screenshots**, 7 per page from top to bottom.
- It walked each page so reveals, lazy images and count-ups ran, and it recorded DOM checks:
  - sideways overflow
  - broken images and missing alt text
  - hover lifts inside clipping boxes
  - clipped text
  - small tap targets
- Automated results: **0 sideways overflow, 0 broken images, 0 missing alt, 0 console errors or warnings** on all 40 loads. The "clipped text" hits were all screen-reader-only labels, so they are not bugs.
- Four reviewers each inspected 70 screenshots for visual defects. Every finding I acted on was re-checked against the source and re-shot after the fix (§3.1).

### 2.2 Reference research

About **110 references** were gathered from these sources (full list in §11):

- Awwwards: Sites of the Day, especially packaging, industrial and manufacturing sites
- Codrops tutorials and demos
- Made in Webflow (industrial category) and Framer and Webflow template roundups
- Unsection, Godly and SaaSFrame
- Aceternity UI, Magic UI, Motion Primitives, React Bits and Cult UI
- Craft write-ups by Josh Comeau, Emil Kowalski, Ryan Mulligan, Bramus and Jhey Tompkins
- Chrome, web.dev and caniuse data for browser support as of late 2026

### 2.3 What the best sites actually do

| Site / source | What they apply | What we take |
|---|---|---|
| **Yucca Packaging** (packaging, Awwwards SOTD Jan 2026) | Scroll-led industry pages; an interactive loyalty calculator as the "wow" | Our tools *are* the wow. Make calculators feel alive (FX-10, FX-20) |
| **epple** (packaging expert, Awwwards HM Sep 2026) | Data visualisation, infographic process section with mouse interaction | Process as a visual (FX-12, FX-24) |
| **CRYOX** (industrial, Awwwards Nominee 2026) | Horizontal scroll section | Desktop-only, optional (FX-25) |
| **Q-Industrial**, **CARBO** (industrial) | 3D product + motion storytelling | We already have the 3D box. Reuse it, don't add more |
| **Polymer Workshop** (manufacturer, SOTD) | Blur-on-hover focus | Sibling dimming on grids (FX-27, opacity only) |
| **Ferrumpipe** (industrial, SOTD) | Heavy GSAP scroll nav; **accessibility scored only 6.33** | A warning: no scroll-jacking |
| Linear *(from general knowledge; their "liquid glass" post was fetched)* | Frosted glass material, spotlight/glare cards, crisp short motion | FX-01, FX-06 |
| Stripe *(general knowledge + Lokesh Dhakar / Builder.io breakdowns)* | Morphing dropdown panel; WebGL gradient | FX-16; gradient only as static light pools (FX-23) |
| Apple product pages *(general knowledge + Jhey / Tyler Gaw tutorials)* | Text that fills as you scroll; pinned storytelling | FX-11; pinned storytelling already on /experience |
| Vercel / Raycast *(general knowledge)* | Border-glow grids, grain, layered inset shadows | FX-05, FX-06, FX-22 |
| Family / Benji Taylor *(secondary)* | Digits that roll, commas that slide | FX-10 |
| Emil Kowalski, web.dev, Chrome | <300 ms UI motion; never animate a blur radius on big areas; reduced motion swaps motion for fades | §4 rules |

**Trend signal for 2026:** reviewers report a move **away from heavy motion and autoplay** toward fast, textured, depth-y pages, and fatigue with look-alike "aurora + particles" templates. That supports the restrained direction.

---

## 3. UI bug audit

### 3.1 Fixed in this pass (verified in a re-shoot)

| ID | Bug | Where | Fix | File |
|---|---|---|---|---|
| BUG-01 | **Style tiles' top edge clipped on hover** (the reported bug). The marquee row clips on both axes and the tile rises 6 px | /3d-box-designer, /experience | `py-2` headroom inside each row and `-my-2` on the wrapper, so the layout is unchanged; the border colour now fades instead of snapping | [StyleMarquee.tsx](../../src/components/showcase/visuals/StyleMarquee.tsx) |
| BUG-02 | **Last film scene drawn over the hero after a jump to the top** (Home key, tap on the status bar, restored scroll). The jump's only scroll event was skipped while the stage was far away, and nothing re-ran it. "Print-ready." sat on the H1 and the download buttons on the CTA | /experience (desktop + phone), /3d-box-designer (stale "03" caption) | Re-run the scroll update when the stage comes back near the viewport | [ScrollyShowcase.tsx](../../src/components/showcase/ScrollyShowcase.tsx) |
| BUG-03 | Flute waves overshoot the board and hook back into the labels. The last partial wave's control point lay past the end | Home S3, product detail | Whole half-waves, clipped to the board width | [BoardCrossSection.tsx](../../src/components/home/BoardCrossSection.tsx) |
| BUG-04 | Fact chips flush to the screen edge on phones (`snap-start` ignored the padding) | Home, about, locations, products | `scroll-px-4` | [Blocks.tsx](../../src/components/site/Blocks.tsx) |
| BUG-05 | "WhatsApp" label touching its border in the phone dock (an equal share of 87 px is too narrow) | Every page, phone | WhatsApp and Call size to their label, Get quote takes the rest; 16 px gutter | [ContactDock.tsx](../../src/components/site/ContactDock.tsx) |
| BUG-06 | Blog card excerpts showed half a line below the "…" (`line-clamp` box stretched by `flex-1`) | /blogs, related posts | The spare height moves to a wrapper | [BlogCard.tsx](../../src/components/BlogCard.tsx) |
| BUG-07 | **`VERIFY-LATER[MKT-…]` markers visible to visitors** in calculator notes | 4 tool pages | Markers moved into code comments | [toolPages.ts](../../src/content/toolPages.ts) |
| BUG-08 | Email split mid-word: "…gmail.co / m" (`break-all`) | Footer, home contact, about | New `EmailText`: may wrap only before "@" | [Blocks.tsx](../../src/components/site/Blocks.tsx), SiteFooter, ProofAndContact, About |
| BUG-09 | Small display headings read as one word ("Howtouseit"): Clash Display has a narrow word space | ~54 headings at h3 size and below | `word-spacing: 0.1em` on Clash at h3/2xl/xl/lg only. Big headlines unchanged | [index.css](../../src/index.css) |
| BUG-10 | FAQ list sat ~10 px left of its heading (`ml-[33.333%]` ignores the grid gap) | Services, locations, industry pages | `ml-[calc((100%+2rem)/3)]`, which is the split header's column 5 | Services, Locations, IndustryDetail |
| BUG-11 | "Get the E- / commerce spec." heading split at the hyphen | Industry CTA band | Industry name kept on one line | [IndustryDetail.tsx](../../src/pages/IndustryDetail.tsx) |
| BUG-12 | Fragility options had different heights | /compare-quote | Option chip fills its grid cell | [InputForm.tsx](../../src/components/CompareQuote/InputForm.tsx) |
| BUG-13 | Analytics buttons showed no selected state; "Contact us" link floated centred | /privacy | `aria-pressed` + filled style for the current choice; link `self-start` | [Privacy.tsx](../../src/pages/Privacy.tsx) |

Checks after the fixes: `tsc` clean · ESLint clean on the changed files (one pre-existing fast-refresh warning in ContactDock) · **869/869 tests pass** · re-shoot shows each spot fixed and 0 console problems.

### 3.2 Open bugs (to fix in Phase 0, §8)

| ID | Sev. | Bug | Where | Proposed fix |
|---|---|---|---|---|
| BUG-20 | Med | **Two near-identical closing CTA bands back to back:** the page's `CtaBand`, then the footer's "Built flat. Ships strong. / Get a quote". On /quote the footer button links to the page you are on | About, services, locations, products, product detail, industries, contact, finder, /quote | Add a `footerCta` prop on `Layout` (default on) and turn it off where the page ends with a `CtaBand`, and on /quote. Or make the footer band a different idea (brochure, WhatsApp) |
| BUG-21 | Med | Contact "Call me back" tab promises "Name and mobile is enough" but shows the full 3-step quote wizard | /contact | Give `QuoteForm` a `callback` mode: name + mobile + optional time, one step |
| BUG-22 | Med | The floating "I buy / I make boxes" switch covers the FAQ and the footer letters | /3d-box-designer | Hide it with an IntersectionObserver once the FAQ or footer is in view; add bottom padding so it never covers the last line |
| BUG-23 | Med | Lone last card: 10 products in a 3-column grid leave "PP strapping" alone | /products | Group boxes and supplies under two headings, or add a "Need something else? Ask us" tile to fill the row |
| BUG-24 | Med | Blog table is half-width inside a full-width bordered box, with a blank spacer column | /blogs/box-measurements-guide (check others) | Table `width: 100%` inside `.table-wrapper`; remove the empty spacer column in the markdown |
| BUG-25 | Med | All 64 posts render at once (~30,000 px on a phone) | /blogs | 12 at a time with "Show more" (count rolls with FX-10); keep all links in the prerendered HTML for SEO |
| BUG-26 | Med | Board diagram floats in a big dark panel with ~115 px empty above and below | /products/:slug | Size the panel to the drawing; add the datasheet beside it as on home S3 |
| BUG-27 | Low–Med | Stacked section padding: two same-colour sections each add `section-y`, so ~170–230 px of empty band | Home 05→06, tools index, tool page FAQ, finder → FAQ | Halve the top padding when a section follows one of the same theme (`[data-theme=x]+[data-theme=x]`) |
| BUG-28 | Low–Med | CTA band buttons ragged: top-aligned while the heading sits lower; third button or text link wraps alone | About, locations | `items-end`; primary + secondary on one row, text links in a row of their own under them |
| BUG-29 | Low–Med | 404 buttons wrap raggedly: "WhatsApp us" alone | /does-not-exist | Equal 2×2 grid (phone: full-width stack) |
| BUG-30 | Low–Med | A paragraph repeats the hero paragraph word for word | /locations "Packaging distribution in Gujarat" | Rewrite (content) |
| BUG-31 | Low | Hyphen and unit breaks: "7-" / "ply", "C-" / "flute", "1-" / "colour", "~6.6" / "mm", "L" / "× B × H" | About, products, product detail, industry, blog title | A `nowrap()` content helper that adds U+00A0 around units and wraps hyphenated terms; `text-wrap: pretty` on body copy |
| BUG-32 | Low–Med | Spec-table labels wrap to three lines on phones | /products/:slug | Stack the label over the value below `sm` |
| BUG-33 | Low | "Not sure, help me" checkbox squeezed beside the "Inside size" label | Quote form (home, quote, contact) | Move it under the L/W/H inputs |
| BUG-34 | Low | Footer: "Drop a box / Tidy up" left-aligned while "Go on, grab a letter" is centred; ~230 px drop zone reads as empty on phones | Footer | Centre the controls with the caption; on phones, shorten the drop zone or show the letters resting in it |
| BUG-35 | Low | Text links are cyan ("Read article", "Contact us") but green elsewhere ("Open calculator") | Blog cards, privacy | Pick one link colour token (recommend cyan for inline links, green for CTAs) and apply it the same way everywhere |
| BUG-36 | Low | Mobile /experience "02.3 Flat." and the /3d-box-designer unfold show an empty stage when 3D is off. Captured headless, so it may also hit low-tier phones | /experience, /3d-box-designer | Check with `?quality=low`; make sure the 2D poster and dieline stay visible on the low tier |
| BUG-37 | Low | Share-flow labels ~7 px and low contrast on phones | /3d-box-designer ShareSection | Min 11 px; paper-muted on ink |
| BUG-38 | Low | "Take it with you." pill buttons uneven widths | /3d-box-designer | 2-column equal grid |
| BUG-39 | Low | Size-card thumbnails (white box on beige) almost vanish | /box-designer/:style | Kraft board colour for the thumbnail, or a darker card |
| BUG-40 | Low | Tool page: "Copy result" bold vs "Share" regular; worked-example paragraph indented ~10 px; formula block wraps mid-expression | /tools/:slug | Match weights; align indent; `white-space: nowrap` per formula term |
| BUG-41 | Low | Make./Buy. tiles end with one-word last lines | /experience | `text-wrap: pretty` |
| BUG-42 | Low | Quick-pick template row clips the focus ring top (horizontal scroller with no top padding) | Designer Quick start | `-mt-1 pt-1` on the scroller |
| BUG-43 | Perf | The phone menu scrim **animates `backdrop-filter` 0 → 12 px over the full screen** (Chrome's guidance: never animate a blur radius on large areas) | Mobile menu | Keep the blur fixed at 12 px and fade the layer's opacity (FX-17) |
| BUG-44 | Perf | `will-change: transform` set permanently in CSS on `.fx-tilt` cards | /experience tiles | Set it from script only while the pointer is over the card |
| BUG-45 | Check | Quote step-1 card looked empty (heading + footer, no fields) in one capture; probably caught mid-mount | /quote phone | Confirm on a real phone that first paint never shows an empty card |

---

## 4. Motion rules, revised

These replace the matching lines in DESIGN_IMPROVEMENT_PLAN §8.3 and §8.7. Everything else in §8 (tokens, tiers, library split, "no scroll-jacking", "LCP H1 never starts at opacity 0") still stands.

### 4.1 What changes

| Old rule | New rule |
|---|---|
| "No `filter: blur()` reveals anywhere." | **Blur reveals are allowed for display text only**: headings, big words and stat labels, at most 3 lines. Radius ≤ **8 px** at the start, played **once**, never scrubbed, never on images, paragraphs or whole sections. High and medium tiers only; low tier and reduced motion get an opacity fade. Never on the LCP element. |
| "No glassmorphism except the frosted sticky nav." | **Glass is allowed on floating surfaces only**: nav, menus, phone dock, WhatsApp button, toasts, dialogs and sheets, sticky filter bars. Never on content cards. One `.glass` recipe for all of them (FX-01). |
| "Never animate … `filter` or `box-shadow`." | Unchanged for `box-shadow` (fade a pre-rendered shadow layer's opacity instead). `filter: blur` is animated only in two places: the display-text rule above, and **cards sinking behind a stack** (FX-12): scroll-driven, covered cards only, ≤ 6 px (4 px on phones), off on the low tier and with reduced motion. **`backdrop-filter` radius is never animated**; fade the layer instead. |
| Custom cursors / cursor-follow "not adopted" | Custom cursors stay out. **A light that follows the pointer inside a card grid is allowed** (FX-06): desktop with a fine pointer only, and the native cursor is never replaced. |

### 4.2 Blur and glass budget

- `backdrop-filter`: ≤ **16 px** on desktop, ≤ **12 px** on phones. At most **two** glass layers on screen at once (e.g. nav + dock), never one stacked on another.
- Glass always has a semi-opaque base (≥ 60% on ink, ≥ 70% on paper), so text stays WCAG AA over any content.
- `@supports not (backdrop-filter: blur(1px))` → solid fallback at 92% opacity.
- Low tier and Save-Data: glass becomes solid and the progressive-blur edges become a gradient fade.

### 4.3 Performance budget (enforced in review and in §9)

| Metric | Budget |
|---|---|
| LCP (mobile, 4G, mid Android) | ≤ 2.5 s, unchanged from today |
| INP | ≤ 200 ms; pointer and scroll handlers write CSS variables in rAF and never call `setState` per frame |
| CLS | ≤ 0.05; tickers use tabular numbers and reserve width |
| Added JS for the foundation (§5) | ≤ 6 KB gzip; no new runtime dependency |
| Concurrent looping animations in one viewport | ≤ 2 (e.g. one marquee + one border beam) |
| Off-screen work | All loops pause via IntersectionObserver or `document.hidden` |

### 4.4 Tier matrix for the new effects

| Effect | High | Medium | Low / Save-Data | Reduced motion | Touch |
|---|---|---|---|---|---|
| Glass (FX-01, 18) | 16 px | 12 px | solid | static glass (it does not move) | same as tier |
| Blur-in text (FX-03) | 8 px + rise | 6 px + rise | fade 150 ms | fade 150 ms | same as tier |
| Spotlight / glow (FX-06) | on | on | off | static border | off |
| Border beam (FX-07) | on | on | static gradient border | static | on |
| Route transitions (FX-13/14) | morph + fade | fade | none | none | same as tier |
| Stacking cards (FX-12) | scale + dim | scale | plain sticky | plain list | short cards |
| Grain (FX-05) | on | on | on (static, it is cheap) | on | on |
| Light pools (FX-23) | slow drift | static | off | static | static |

---

## 5. Foundation to build first

The `showcase/fx` folder already has good, accessible primitives: `Reveal`, `SplitWords`, `usePointerFx`, `Magnetic`, `CountUp`, `AnimatedNumber`, `VelocityMarquee`, `ScrollProgress` and `useInView`. Today they serve only the 3D-designer pages. **Step one is to make them site-wide**, then add the few missing pieces.

| # | Item | File(s) | Notes |
|---|---|---|---|
| F1 | Move `src/components/showcase/fx/*` → `src/components/fx/*` (re-export from the old path for one release) | new folder | No behaviour change |
| F2 | Effect tokens: `--glass-bg-ink`, `--glass-bg-paper`, `--glass-blur` (16/12 px), `--glow-green` (`rgb(61 186 90 / .22)`), `--beam-speed` (4 s), `--blur-in` (8 px) | [index.css](../../src/index.css) `:root` + [tokens.ts](../../src/lib/motion/tokens.ts) | One source for CSS and JS |
| F3 | CSS utilities: `.glass`, `.glass-edge`, `.ink-grain`, `.fx-glow` (border glow), `.fx-beam`, `.fx-shine`, `.sd-reveal` (scroll-driven reveal), `.text-pretty` | index.css `@layer components` | Each with its `@supports` and reduced-motion branch |
| F4 | `<SpotlightGrid>`: one `pointermove` per grid writes `--x/--y` on each card in rAF | `fx/SpotlightGrid.tsx` | Generalises today's per-tile `usePointerFx` |
| F5 | `SplitWords` gains `variant="blur"` (FX-03) beside today's mask rise | `fx/SplitWords.tsx` | Same API, so pages swap with one prop |
| F6 | `<ProgressiveBlur side="top|bottom|left|right" layers={4}>` | `fx/ProgressiveBlur.tsx` | FX-02 |
| F7 | `useSiteFx()`: wraps `detectSiteTier()` and returns which FX are on | [siteTier.ts](../../src/lib/motion/siteTier.ts) | Every effect asks this one hook, so `?quality=low` turns them all off together |
| F8 | `useViewTransitionNavigate()` + a global click handler for internal `<a>`/`<Link>`, using `document.startViewTransition` + `flushSync` | `lib/motion/viewTransition.ts` | Needed because the app uses `<BrowserRouter>` (React Router 6.30.3). RR's `viewTransition` prop only works with data routers. Keep `PageTransition` as the fallback |
| F9 | `<RouteProgress>`: 2 px green bar shown when a lazy route takes > 150 ms | `fx/RouteProgress.tsx` | FX-15 |
| F10 | `nowrap()` content helper (BUG-31) | `lib/text.ts` | Typographic hygiene |

---

## 6. Effect catalogue

Each entry: **Looks like** · **Where** · **Build** · **Fallback** · **Cost / Effort / Priority** · **References** (numbers point to §11).

### A. Blur and glass

**FX-01 Glass nav 2.0**
- **Looks like:** once you scroll, the header becomes real frosted ink or paper glass. Colours of the content passing beneath bleed through softly, a 1 px light line runs along its top edge, and the "paper stack" shadow sits under it. Today it is `backdrop-blur-md` over 85% opacity, so the blur barely shows.
- **Where:** [SiteNavbar.tsx](../../src/components/site/SiteNavbar.tsx) condensed state. The same `.glass` recipe is reused by FX-16/17/18.
- **Build (done on Home, `components/fx/GlassPane.tsx`):** modelled on soda-lime glass. **Frost**: backdrop blur 16 px (12 px on phones) with a little extra saturation and light, a faint iron-oxide green and a fine etched grain. **Face**: Fresnel reflection (about 4% straight on, brighter toward the edges) and a soft specular highlight that follows the mouse (desktop) or drifts with scroll (touch). **Lip**: a 10 px clear polished edge below the pane, greener (seen through the thickness), with a bright total-internal-reflection rim, a faint dispersion fringe and a glint that runs along it with the light. In Chromium the lip is a real lens (SVG displacement inside `backdrop-filter`, red/green/blue bent slightly differently), so content passing under the edge is magnified; Safari and Firefox get the same edge without the lens. One light sweep when the pane appears. Every layer fades its own opacity (fading a parent would cut the blur off mid-fade). The phone bar uses the same pane with its edge on top.
- **Fallback:** solid 92% on low tier and when unsupported. Firefox: avoid `overflow` + `border-radius` on sticky ancestors (known bug).
- **Cost** low · **Effort** S · **P1** · Refs [B1–B4]

**FX-02 Progressive blur edges**
- **Looks like:** content melts into blur toward an edge, iOS-style, instead of a flat gradient fade.
- **Where:**
  - ends of the style marquee (`VelocityMarquee` uses gradient spans today)
  - phone chip rows (FactStrip, blog categories), which also signal "scroll for more" (BUG-04 follow-up)
  - bottom of tall image panels
  - the sticky summary in tools
- **Build:** `<ProgressiveBlur>` with 4 stacked layers. Layer *n* gets `backdrop-filter: blur(2ⁿ px)` and a banded `mask-image`.
- **Fallback:** today's gradient on low tier and Firefox if it stutters.
- **Cost** med · **Effort** M · **P2** · Refs [B5–B10]

**FX-03 Blur-in headlines**
- **Looks like:** section headings resolve word by word from soft (8 px) to sharp while rising 0.3 em. 40 ms stagger, about 500 ms in total.
- **Where:** every `SectionHeader` H2, `CtaBand` titles, the /experience big words (some keep the mask rise), stat labels. **Not** the hero H1 (LCP), and not paragraphs.
- **Build:** `SplitWords variant="blur"`: per-word `filter: blur(var(--blur-in))`, opacity and transform with a CSS transition, started by the existing `useInView`. `aria-label` keeps the full sentence.
- **Fallback:** fade 150 ms on low tier and reduced motion. Content is visible without JS (hidden state only exists after the observer starts, like `Reveal`).
- **Cost** low · **Effort** S · **P1** · Refs [T1–T5]

**FX-04 Reveal system v2: scroll-driven where supported**
- **Looks like:** the same quiet rise + fade as today, but it runs off the main thread.
- **Where:** replaces most `Reveal` use on content pages.
- **Build:** `.sd-reveal { animation: rise linear both; animation-timeline: view(); animation-range: entry 0% entry 40%; }` inside `@supports (animation-timeline: view())`. The default state is visible. The browser support note in §11 covers Firefox's late arrival, so keep the IO-based `Reveal` as the fallback.
- **Fallback:** existing `Reveal`.
- **Cost** very low · **Effort** S · **P2** · Refs [S1–S4]

**FX-27 Focus dim on grid hover (opacity only)**
- **Looks like:** hovering one card in a grid dims its siblings to 70%. The blur version from Polymer Workshop is skipped as too costly.
- **Where:** home industries grid, services industry cards.
- **Build:** `.grid:has(> :hover) > :not(:hover) { opacity: .7 }` under `@media (hover:hover)`.
- **Cost** very low · **Effort** S · **P3**

### B. Light and texture

**FX-05 Ink grain**
- **Looks like:** fine film grain on the flat ink sections, like kraft board under light. The match for the existing `.paper-grain` on cream.
- **Where:** home S3 (InsideTheBoard), CtaBand, the footer, the /experience dark scenes, the designer showcase stage.
- **Build:** `.ink-grain::after`, a static `feTurbulence` data-URI (baseFrequency 0.8, stitchTiles), opacity 0.06, `mix-blend-mode: overlay`, `pointer-events: none`. **Never animated.**
- **Cost** very low · **Effort** S · **P1** · Refs [L9–L13]

**FX-06 Cursor spotlight + border glow on card grids**
- **Looks like:** a soft green light follows the pointer across a grid. Card borders light up where it passes, and cards near the pointer glow faintly (the Linear/Vercel signature).
- **Where:** ProductCard grid, home Industries and RangeIndex, ToolsIndex, Services industry cards, Tools mega-menu items, designer template gallery, /experience tiles (replacing `fx-spot`).
- **Build:** `<SpotlightGrid>` (F4). Each card's `::before` is a `radial-gradient(400px at var(--x) var(--y), var(--glow-green), transparent 60%)` masked to the border with `mask-composite: exclude`; `::after` is a 15% inner glow. No React render per move.
- **Fallback:** touch and low tier keep the static border with today's hover border colour. Reduced motion: static.
- **Cost** low · **Effort** M · **P1** · Refs [L1–L8]

**FX-07 Border beam (one per screen)**
- **Looks like:** a thin green light travels slowly around the edge of the single most important button or card in view.
- **Where:**
  - the recommended result card in the Packaging Finder
  - the primary button of each `CtaBand`
  - "Open the designer" on the 3D showcase close
  - the active step in the quote form
- **Not** on the nav "Get a quote" (always visible, so it would loop forever).
- **Build:** `@property --angle`; `conic-gradient(from var(--angle), transparent 70%, var(--green-400))` on the border box with a solid padding box; 4 s linear. Paused off-screen via `animation-play-state`.
- **Fallback:** static gradient border.
- **Cost** low · **Effort** S · **P2** · Refs [L14–L19]

**FX-08 Button shine + press**
- **Looks like:** on hover a soft diagonal highlight glides across the primary button once. On press it shrinks to 0.98. The existing folded-corner flap stays.
- **Where:** `Cta` `primary` variant only. Never combined with FX-07 on the same button.
- **Build:** `::after` linear-gradient translated with `transform` over 600 ms; `active:scale-[.98]`.
- **Cost** very low · **Effort** S · **P2** · Refs [L20]

**FX-09 Magnetic CTA**
- **Looks like:** the button drifts up to 6 px toward the pointer and springs back.
- **Where:** home hero CTA, CtaBand primary, footer CTA. The `Magnetic` component already exists and is used on /experience.
- **Fallback:** none needed (no effect on touch or with reduced motion).
- **Cost** low · **Effort** S · **P2**

**FX-23 Ambient light pools**
- **Looks like:** two or three very soft, pre-blurred radial lights (deep green, a trace of cyan) behind dark headings. On high tier they drift a few px; elsewhere they are static. This is our restrained answer to "aurora" and Stripe's gradient.
- **Where:** CtaBand, footer top, Services and Products heroes if they become ink, the /experience close.
- **Build:** absolutely positioned `radial-gradient` layers (no filter), animated with `transform` only over 30 s; paused off-screen.
- **Fallback:** static on medium tier and reduced motion; off on low tier.
- **Cost** low · **Effort** S · **P2** · Refs [L21–L26]

### C. Text and numbers

**FX-10 Rolling numbers**
- **Looks like:**
  - stats count up once (today's behaviour)
  - **live values roll digit by digit** when inputs change: calculator results, finder prices, designer price, blog "Show more" count
- **Where:** StatLedger, About capacity grid (5+ / 250+ / 5M+ / 50+ is static on phones today), every `/tools/:slug` result, compare-quote prices, designer price panel.
- **Build:** extend the existing `AnimatedNumber` with a per-digit roll (each digit is a 0–9 column translated in Y, `tabular-nums`, width reserved). NumberFlow (~9 KB) is an optional alternative. The real number always sits in the text or `aria-label`.
- **Cost** low · **Effort** M · **P1** · Refs [T10–T12]

**FX-11 Text that fills as you scroll (one line per page)**
- **Looks like:** a single statement fills from muted to ink, word by word, as it crosses the screen (Apple style).
- **Where:** home "Recyclable by design" band (flat today), About opening statement, Services intro.
- **Build:** pure CSS: `background-clip: text` and a `background-size` animation on `animation-timeline: view()`, inside `@supports`.
- **Fallback:** **fully filled** text when unsupported, never stuck muted.
- **Cost** very low · **Effort** S · **P2** · Refs [T6–T9]

**FX-28 Typography hygiene**
- `text-wrap: balance` on all headings (PageHero already does) and `pretty` on body copy.
- `nowrap()` for units and hyphenated terms (BUG-31, BUG-41).
- **Cost** none · **Effort** S · **P1**

**FX-30 Velocity marquee for trust strips**
- **Looks like:** the existing scroll-reactive marquee carrying certifications, industries served or box styles; pauses on hover and focus.
- **Where:** home S2 TrustBar (if logos stay unavailable, `VERIFY-LATER[TEST-01]`, use industries plus box styles).
- **Cost** low · **Effort** S · **P3**

### D. Scroll

**FX-12 Sticky stacking process cards**
- **Looks like:** "Dieline → Print → Corrugate → Die-cut → QC → Dispatch" cards pin and stack. Each new card slides over the last, and the covered card **sinks behind: it shrinks, dims and goes soft (blur up to 6 px)**, more with every card piled on top. One idea per card, with the existing process illustrations. **Built on Home** (`DielineToDispatch.tsx`): each card's depth comes from how far the next card has slid over it.
- **Where:** home S6 `DielineToDispatch`, Services "how we work".
- **Build:** `position: sticky; top: calc(var(--nav-h) + n*12px)`. The scale and brightness of the previous card run on a CSS `view()` timeline; framer `useScroll` is the fallback.
- **Fallback:** on phones, cards ≤ 70svh with stacking only (no scale). Reduced motion and low tier: a plain list.
- **Cost** low–med · **Effort** M · **P1** · Refs [S5–S9]

**FX-24 Self-drawing lines**
- **Looks like:** SVG strokes plot themselves like a cutting table: dieline cut and crease lines, map routes, process icons and dimension arrows (with `stroke-dashoffset`).
- **Where:**
  - home process icons
  - **GujaratMap routes drawing out from Ahmedabad** (locations, the flattest page in the audit)
  - product-detail diagrams
  - the 404 dieline (FX-29)
  - tool result box drawings
- **Build:** `pathLength="1"` + dash offset transition on view; 600–900 ms; stagger ≤ 6 paths.
- **Fallback:** drawn (static).
- **Cost** very low · **Effort** M · **P1**

**FX-25 Pinned horizontal range (desktop only)**
- **Looks like:** on desktop, vertical scroll moves a sideways strip of box styles or products. Phones get a native swipe carousel with `scroll-snap` and progressive-blur edges.
- **Where:** optional for home S4 RangeIndex or the products page "Box styles" strip.
- **Build:** GSAP ScrollTrigger pin (already loaded on home). Max +120vh, with a visible "Skip" link.
- **Cost** med · **Effort** M · **P3** · Refs [S10–S13]. Only if the home page still feels flat after P1/P2.

**FX-26 Blog reading kit**
- **Looks like:**
  - a 2 px green progress line (exists as `ReadingProgress`; make sure it is `scaleX` only)
  - the table-of-contents marker slides between headings
  - images open in a glass lightbox
  - code and spec snippets get copy feedback (FX-20)
- **Where:** /blogs/:slug.
- **Cost** very low · **Effort** S · **P2** · Refs [S14–S16]

### E. Navigation and pages

**FX-13 Route transitions**
- **Looks like:** a 200 ms cross-fade between pages. The nav and phone dock stay perfectly still (they have their own `view-transition-name`).
- **Where:** all internal navigation.
- **Build:** F8. CSS `::view-transition-old/new(root)` fade, wrapped in `@media (prefers-reduced-motion: no-preference)`. Samsung Internet supports same-document view transitions from v23; unsupported browsers navigate normally with today's 150 ms `PageTransition` fade.
- **Cost** low · **Effort** M · **P1** · Refs [N1–N4]

**FX-14 Card → page morph**
- **Looks like:** the clicked product card's illustration grows into the product page's hero image; the same for blog card → post header and style tile → designer landing.
- **Where:** /products → /products/:slug, /blogs → /blogs/:slug, StyleMarquee and landings → /box-designer/:style.
- **Build:** set `view-transition-name: hero-media` on **only the clicked card** just before navigating, and the same name on the destination hero.
- **Fallback:** FX-13 fade.
- **Cost** low–med · **Effort** M · **P2** · Refs [N2, N5–N7]

**FX-15 Route progress line**
- **Looks like:** a thin green line across the top while a lazy page chunk loads. It only appears after 150 ms, so fast loads show nothing.
- **Where:** global (F9).
- **Cost** very low · **Effort** S · **P2** · Refs [N8, N9]

**FX-16 Morphing glass mega menu**
- **Looks like:** the Tools two-tier panel (and Products/Industries if they become panels) is one glass sheet. Moving between categories **resizes and slides** the sheet instead of swapping it. The preview on the right blurs in (4 px → 0, 200 ms), and items get FX-06 light.
- **Where:** [ToolsMegaMenu.tsx](../../src/components/site/ToolsMegaMenu.tsx).
- **Build:** framer `layout` on the sheet background + `AnimatePresence` crossfade of contents; 100 ms hover intent; Esc and arrow keys as today.
- **Cost** low–med · **Effort** M · **P2** · Refs [N10–N13]

**FX-17 Mobile menu polish**
- **Looks like:** the sheet is glass. Links rise in with a 30 ms stagger (≤ 250 ms total). The blurred page behind keeps its scroll lock, but the scrim now **fades a fixed 12 px blur layer** instead of animating the radius (BUG-43).
- **Where:** [MenuScrim.tsx](../../src/components/site/MenuScrim.tsx), [ToolsMobileMenu.tsx](../../src/components/site/ToolsMobileMenu.tsx), the SiteNavbar sheet.
- **Cost** low · **Effort** S · **P1**

**FX-18 One glass family for floating UI**
- **Looks like:** the phone dock, WhatsApp button, audience switch, toasts (Sonner), dialogs and sheets all share the `.glass` recipe, so the floating layer feels like one material.
- **Where:** ContactDock, the WhatsApp FAB, the /3d-box-designer audience switch (BUG-22), the Sonner toaster theme, Radix dialogs.
- **Cost** low · **Effort** S · **P1**

**FX-29 404 that folds wrong**
- **Looks like:** the 404 dieline draws itself (FX-24), tries to fold, one flap goes the wrong way and it flops flat with a small paper settle. It plays once, then rests.
- **Where:** [NotFound.tsx](../../src/pages/NotFound.tsx) `BrokenDieline`.
- **Build:** SVG transforms (skew/rotate per panel) with the `ease-fold` token; no 3D needed.
- **Fallback:** static drawing.
- **Cost** very low · **Effort** M · **P3**

### F. Micro-interactions and forms

**FX-19 Form craft**
- **Looks like:**
  - inputs get a cyan focus ring that grows from 0 to 3 px `outline-offset` (120 ms)
  - errors slide in 4 px under the field
  - the wizard steps slide 24 px with a cross-fade (as in §8.8)
  - submit turns into a spinner, then a **check mark that draws itself**
  - the reference number settles in with a 400 ms digit scramble (the only scramble on the site)
- **Where:** QuoteForm (home, /quote, /contact), compare-quote InputForm, the designer enquiry.
- **Build:** CSS `:focus-visible` / `:user-invalid`; framer `pathLength` for the check.
- **Cost** very low · **Effort** M · **P1** · Refs [M10–M12]

**FX-20 Copy and share feedback**
- **Looks like:** the copy icon morphs into a check for 1.5 s; the "Copied" label rolls in. One quiet Sonner toast, no confetti.
- **Where:** tool pages ("Copy result"), blog share, designer share link, embed snippet.
- **Cost** very low · **Effort** S · **P2**

**FX-21 Image "develop" reveal**
- **Looks like:** credited photos (ImageSlot) appear from a tiny blurred placeholder that cross-fades to the sharp image, like a print developing. Illustrations reveal with a short `clip-path` wipe from the crease line.
- **Where:** [ImageSlot.tsx](../../src/components/site/ImageSlot.tsx), product and industry heroes.
- **Build:** a pre-blurred 16 px LQIP as background (generated by the existing `seo:images` script; `VERIFY-LATER[FX-21]` that it can emit LQIPs), with an opacity cross-fade. The filter is never animated. `clip-path: inset()` on view for SVGs.
- **Cost** low · **Effort** M · **P2**

**FX-22 Card depth on hover**
- **Looks like:** cards rise 2–4 px. A pre-rendered soft shadow fades in under them, and the illustration tilts up to 5° toward the pointer (box-shaped things suit tilt).
- **Where:** ProductCard, BlogCard, ToolsIndex cards, designer landing size cards, StyleMarquee tiles (with BUG-01 headroom).
- **Build:** `transform` + `::after` shadow opacity; the existing `usePointerFx({ tilt: 5 })` on the image only. **Check every lifted card sits in a container with ≥ 8 px headroom** (the BUG-01 lesson; the audit job's `liftClip` check finds them).
- **Cost** low · **Effort** S · **P1**

---

## 7. Page-by-page application map

Today = what the audit saw. The ★ items are the page's single "headline moment" (§8.1 rule: one per screen).

### Global (every page)

| Element | Today | Add | IDs | P |
|---|---|---|---|---|
| Nav | Thin blur over 85% opacity | Real glass + light edge | FX-01 | P1 |
| Tools mega menu | Two-tier panel | Morphing glass sheet, spotlight items, blur-in preview | FX-16, FX-06 | P2 |
| Phone menu | Blur scrim (animated radius) | Fixed-blur fade, staggered links, glass sheet | FX-17, BUG-43 | P1 |
| Phone dock / WhatsApp FAB / toasts / dialogs | Mixed styles | One glass family | FX-18 | P1 |
| Page changes | 150 ms fade | View-transition fade, stable chrome; progress line | FX-13, FX-15 | P1/P2 |
| Section headings | Static or rise | Blur-in words | FX-03 | P1 |
| Primary buttons | Folded-corner flap | + shine + press; magnetic on 1–2 per page | FX-08, FX-09 | P2 |
| Dark sections | Flat ink | Ink grain + light pools on CTA bands | FX-05, FX-23 | P1/P2 |
| CTA bands | Duplicate with footer | Dedupe (BUG-20); ★ border beam on the primary | FX-07 | P1 |
| Footer | Stencil-crate playground (strong) | Grain; centred controls (BUG-34); ambient light on "Built flat." | FX-05, FX-23 | P2 |
| Typography | Mostly balanced | Balance/pretty everywhere, `nowrap()` | FX-28 | P1 |

### Home (`/`)

| Section | Today | Add | IDs | P |
|---|---|---|---|---|
| S1 The Fold (hero) | 3D fold, paper grain, crop marks; LCP H1 | Keep. FactStrip edges get progressive blur on phones; magnetic hero CTA. **No blur on the H1** | FX-02, FX-09 | P2 |
| S2 Trust bar | Stat ledger | Rolling numbers; optional velocity marquee | FX-10, FX-30 | P1/P3 |
| S3 Inside the Board | Ply switcher + datasheet (good) | Ink grain; datasheet values roll when ply changes; lines draw on switch (already pathLength) | FX-05, FX-10 | P1 |
| S4 Range index | Grid with crop marks | Spotlight grid + card depth; optional pinned horizontal strip | FX-06, FX-22, FX-25 | P1/P3 |
| S5 Industries | Tabs + illustrated cards | Spotlight; focus dim on desktop | FX-06, FX-27 | P1/P3 |
| S6 Dieline to dispatch | Process illustrations | ★ **Sticky stacking cards**, with icons drawing themselves | FX-12, FX-24 | P1 |
| S7 Order your way | Cards | Card depth | FX-22 | P2 |
| S8 Proof | Price-driver bars and testimonial card (flat) | Bars fill on view (transform `scaleX`); testimonial swipe with snap | FX-04 | P2 |
| "Recyclable by design" band | Thin line in a tall band (flat) | ★ Text fills as you scroll | FX-11 | P2 |
| S9 Talk to us (quote form) | 3-step form | Form craft | FX-19 | P1 |

### Products (`/products`, `/products/:slug`)

| Section | Add | IDs | P |
|---|---|---|---|
| Hero (right half empty) | A small isometric stack of the three ply boxes that assemble on load (SVG, transforms) | FX-24 | P2 |
| Filter chips | Sticky glass filter bar on scroll; chips slide the active pill (`layoutId`) | FX-18 | P2 |
| Product grid | Spotlight grid + depth + tilt; fix lone last card (BUG-23) | FX-06, FX-22 | P1 |
| Card → detail | ★ Illustration morphs into the detail hero | FX-14 | P2 |
| Detail: board panel | Resize panel (BUG-26); datasheet numbers roll | FX-10 | P1 |
| Detail: spec table | Stack on phones (BUG-32); rows reveal as a group | FX-04 | P1 |

### Industries (`/industries/:slug`) and Services (`/services`)

| Section | Add | IDs | P |
|---|---|---|---|
| Hero (Services right half empty) | Industry illustration collage that settles in with depth (illustrations exist) | FX-21 | P2 |
| Problem / spec / why cards (sparse) | Spotlight + a small product illustration per card (art exists) | FX-06 | P2 |
| Industry cards (Services) | Spotlight, focus dim | FX-06, FX-27 | P1 |
| "Beyond the box" list (flat) | Icons draw themselves; rows group-reveal | FX-24 | P2 |
| How we work | ★ Stacking cards (shares FX-12) | FX-12 | P2 |
| FAQ | Already aligned (BUG-10); accordion height animation via `interpolate-size` where supported | — | P3 |

### About (`/about`) and Locations (`/locations`)

| Section | Add | IDs | P |
|---|---|---|---|
| About opening statement | ★ Text fills on scroll | FX-11 | P2 |
| Capacity grid (static) | Rolling numbers | FX-10 | P1 |
| Made / sourced → QC → you flow (good) | Connector lines draw between cards | FX-24 | P2 |
| Locations hero (right half empty) | ★ **Gujarat map: routes draw out from the Ahmedabad hub**, city dots pulse once | FX-24 | P1 |
| City cards (text only) | Spotlight; distance or delivery-days number rolls | FX-06, FX-10 | P2 |

### Quote, Contact, Packaging Finder

| Page | Add | IDs | P |
|---|---|---|---|
| /quote (no visual in hero) | A small dieline-to-box line drawing beside the bullets; ★ form craft + drawn success check | FX-24, FX-19 | P1 |
| /contact | Callback mode (BUG-21); channel rows get spotlight | FX-19, FX-06 | P1 |
| /compare-quote | Step slide; ★ border beam on the recommended result; prices roll; "How it works" steps draw | FX-19, FX-07, FX-10, FX-24 | P1 |

### Tools (`/tools`, `/tools/:slug`)

| Section | Add | IDs | P |
|---|---|---|---|
| Tools index (six plain cards) | Spotlight grid; **each card shows a live mini preview**: a number ticking or a small box/container line drawing | FX-06, FX-10, FX-24 | P1 |
| Calculator results | ★ Rolling result numbers; small box drawing with dimension arrows that redraws on change | FX-10, FX-24 | P1 |
| Copy / share | Icon morph feedback; consistent weights (BUG-40) | FX-20 | P2 |

### Blog (`/blogs`, `/blogs/:slug`)

| Section | Add | IDs | P |
|---|---|---|---|
| Index | "Show more" pagination (BUG-25); category chips with progressive-blur edge; card depth | FX-02, FX-22 | P1 |
| Card → post | Illustration morphs into the post header | FX-14 | P2 |
| Post | Reading kit (progress, TOC marker, glass lightbox); table fix (BUG-24) | FX-26 | P2 |

### 3D designer pages (`/3d-box-designer`, `/experience`, `/box-designer/:style`)

These are already the richest pages. Keep them; only align them with the shared system.

| Section | Add | IDs | P |
|---|---|---|---|
| Showcase / experience big words | Mix mask-rise with blur-in (alternate per scene) | FX-03 | P2 |
| Tiles, Make./Buy. | `fx-spot` → shared SpotlightGrid; `will-change` only on hover (BUG-44) | FX-06 | P2 |
| Audience switch | Glass; hides near the FAQ and footer (BUG-22) | FX-18 | P1 |
| Style marquee | Progressive-blur ends | FX-02 | P2 |
| Designer landings (plain) | Hero box slowly opens its lid (existing fold logic, poster on low tier); size cards with depth (BUG-39) | FX-22 | P2 |
| The designer app itself | **No new effects.** It is a tool; keep it fast | — | — |

### Legal and system pages

| Page | Add | P |
|---|---|---|
| /privacy, /image-credits | Typography hygiene only | P3 |
| 404 | ★ The dieline that folds wrong (FX-29); 2×2 buttons (BUG-29) | P3 |

---

## 8. Phases and order of work

| Phase | Content | Effort | Exit check |
|---|---|---|---|
| **0. Bugs** | BUG-20 to BUG-45 (§3.2) | ~3 days | Audit job re-run: no new issues; owner sign-off on BUG-20 option |
| **1. Foundation + global** | F1–F10; FX-01, 03, 05, 06, 13, 17, 18, 19, 22, 28 | ~6 days | Tier matrix (§4.4) holds on `?quality=high/medium/low`; Lighthouse budgets (§4.3) |
| **2. Signature moments** | FX-10, 12, 24 (home S6, locations map, tools, finder), FX-07 | ~5 days | One ★ per page live; reduced-motion pass |
| **3. Continuity + depth** | FX-02, 04, 08, 09, 11, 14, 15, 16, 20, 21, 23, 26 | ~6 days | View-transition QA on Chrome, Safari, Firefox, Samsung Internet |
| **4. Optional** | FX-25, 27, 29, 30 | ~3 days | Only if pages still feel flat after measuring 1–3 |

Ship each phase on its own branch and PR; measure (§9) before starting the next.

---

## 9. QA and test plan

1. **Screenshot audit:** `node scripts/screenshots/qa.mjs scripts/screenshots/jobs/site-audit.mjs` before and after each phase (env `AUDIT_ROUTES`, `AUDIT_VIEWS`, `AUDIT_SHOTS` narrow it). The `liftClip` check catches BUG-01-type clipping; `docOverflow` and `wide` catch sideways scroll.
2. **Reduced motion:** run the job with emulated `prefers-reduced-motion: reduce`. Add a CDP `Emulation.setEmulatedMedia` switch to the job (`AUDIT_RM=1`). Every FX must show its fallback and all content.
3. **Tiers:** `?quality=low|medium|high` on home, products, tools, /experience. Low tier: no glass blur, no spotlight, no light pools.
4. **Browsers:** Chrome/Edge, Safari 18+ (iPhone), Firefox desktop, **Samsung Internet** (common in India; no cross-document VT, same-document VT from v23).
5. **Performance:** Lighthouse mobile on home, products, a tool page and a blog post. Compare against the §4.3 budgets. Chrome Performance panel: no long tasks > 50 ms during pointer moves over a spotlight grid, and the frame rate holds when scrolling with glass nav + dock on a 4× CPU throttle.
6. **Accessibility:**
   - keyboard through the nav, mega menu, quote form and finder
   - focus is always visible (BUG-42 class of issue)
   - every split or rolled text keeps its full string for screen readers
   - glass contrast is AA
7. **Unit tests:** `npm test` stays green. Add tests for `nowrap()`, `useSiteFx()` tier mapping, and the scroll-jump case (BUG-02) in `sceneLogic`.
8. **Real devices:** one mid-range Android (e.g. Samsung A-series) and one iPhone, on 4G, for each phase.

---

## 10. Not adopted

Avoided on purpose, following the research and the owner's "not a circus" rule:

- Custom cursors, cursor trails, sound.
- Scroll-jacking: forced smooth scroll on touch, pinned horizontal sections on phones, hijacked keyboard scroll. (Ferrumpipe's 6.33 accessibility score is the cautionary tale.)
- Preloaders or intro animations that hold content back; any hero H1 that starts at opacity 0.
- Animated grain, live WebGL gradient backgrounds, particles, meteors, generic aurora.
- Liquid-glass or gooey SVG filters (several are Chrome-only and CPU-heavy).
- Letter-by-letter splits or scramble on body copy. (Scramble is used once, on the quote reference number.)
- Image-sequence scroll scrubs. Our 3D box and SVG dielines do this at a fraction of the bytes.
- Stacking several attention effects on one element (beam + shine + magnet + glow).
- AI-generated imagery for any effect. Visuals stay SVG illustrations and credited open-licence photos (image policy).

---

## 11. Reference library

URLs were collected with web search and fetch on 17 Nov 2026. *(secondary)* means a third-party summary; product homepages named in §2.3 without a link were not fetched.

**Browser support**
- animation-timeline: https://caniuse.com/mdn-css_properties_animation-timeline_view · Interop 2026: https://web.dev/blog/interop-2026 · https://hacks.mozilla.org/2026/02/launching-interop-2026/ · https://blogs.windows.com/msedgedev/2026/02/12/microsoft-edge-and-interop-2026/
- View transitions: https://caniuse.com/view-transitions · https://caniuse.com/cross-document-view-transitions · https://developer.chrome.com/docs/web-platform/view-transitions/same-document · https://developer.chrome.com/docs/web-platform/view-transitions/cross-document · https://reactrouter.com/how-to/view-transitions
- backdrop-filter: https://caniuse.com/css-backdrop-filter · text-wrap: https://caniuse.com/css-text-wrap-balance
- Entry/exit: https://web.dev/blog/baseline-entry-animations · https://developer.chrome.com/blog/entry-exit-animations · https://www.smashingmagazine.com/2025/01/transitioning-top-layer-entries-display-property-css
- Height auto: https://developer.chrome.com/docs/css-ui/animate-to-height-auto · https://www.joshwcomeau.com/snippets/html/interpolate-size/
- Native progressive blur proposal: https://lists.w3.org/Archives/Public/public-css-archive/2026Jan/0001.html

**Industrial / packaging showcase sites**
- Yucca Packaging: https://www.awwwards.com/sites/yucca-packaging · https://yucca.co.za/
- epple: https://www.awwwards.com/sites/epple · https://vs-epple.de/
- Q-Industrial: https://webflow.com/made-in-webflow/website/q-coatings-site · https://www.q-industrial.com
- CARBO: https://www.awwwards.com/sites/carbo · https://carbo.tech/
- CRYOX: https://www.awwwards.com/sites/cryox · https://cryox.be/en
- Ferrumpipe: https://awwwards.com/sites/ferrumpipe · Polymer Workshop: https://awwwards.com/sites/polymer-workshop
- DETRA: https://www.awwwards.com/sites/detra · Coffman Engineers: https://www.awwwards.com/sites/coffman-engineers · collection: https://www.awwwards.com/BroworksDesign/collections/industry-websites/
- Made in Webflow industrial: https://webflow.com/made-in-webflow/industrial%20website · https://webflow.com/made-in-webflow/website/sas-industrial-solutions · https://webflow.com/made-in-webflow/website/ac-tech-website · https://webflow.com/made-in-webflow/website/pip25 · https://webflow.com/templates/html/manufactt-website-template
- Section libraries and roundups: https://unsection.com/ · https://www.unsection.com/category/feature-section-design · https://app.unsection.com/industry/energy-and-utilities · https://uiuxshowcase.com/resources/godly-website/ *(secondary)* · https://veloxthemes.com/blog/best-saas-framer-templates · https://www.saasframe.io/examples/raycast-landing-page
- Trends: https://www.designrush.com/agency/website-design-development/trends/web-design-trends · https://www.getresponse.com/blog/landing-page-design-trends

**Blur and glass**
- [B1] https://www.joshwcomeau.com/css/backdrop-filter/
- [B2] https://web.dev/articles/backdrop-filter
- [B3] https://linear.app/now/linear-liquid-glass
- [B4] https://developer.chrome.com/blog/animated-blur/
- [B5] https://codepen.io/devyatov/pen/yygZMqm
- [B6] https://devs-love-coffee.vercel.app/blog/making-apple-progressive-blur-on-web
- [B7] https://dev.to/xujunhao/recreating-ios-style-gradient-blur-on-the-web-4d45
- [B8] https://cult-ui.com/docs/components/edge-blur
- [B9] https://www.framer.com/marketplace/components/gradient-blur/ · https://21st.dev/@dillionverma/components/progressive-blur.md
- [B10] https://tympanus.net/codrops/2024/07/02/progressive-blur-effect-using-webgl-with-ogl-and-glsl-shaders/
- Drawers and dialogs: https://github.com/emilkowalski/vaul · https://developer.chrome.com/docs/modern-web-guidance/guides/ui-behaviors/animate-element-entry-exit

**Light, glow, texture**
- [L1] https://frontendmasters.com/blog/glowing-hover-effect/
- [L2] https://learnhowto.vercel.app/blog/css/mastering-the-spotlight-effect-on-hover-a-deep-dive-with-css-and-javascript
- [L3] https://dev.to/justalever/javascript-mouse-tracking-glow-effect-with-tailwind-css-jhg
- [L4] https://dev.to/kadenwildauer/modern-card-hover-animations-css-and-javascript-3cg3
- [L5] https://tympanus.net/codrops/?p=72017
- [L6] https://ui.aceternity.com/components/card-spotlight
- [L7] https://ui.aceternity.com/components/glare-card
- [L8] https://dev.to/bholmesdev/a-shiny-on-hover-effect-that-follows-your-mouse-css-4d5b
- [L9] https://css-tricks.com/?p=351302
- [L10] https://www.freecodecamp.org/news/grainy-css-backgrounds-using-svg-filters/
- [L11] https://wildandfreetools.com/blog/grainy-noise-css-gradient-generator
- [L12] https://codyhouse.co/ds/components/info/noise-background
- [L13] https://cssmatic.com/gen-noise-texture.html
- [L14] https://ryanmulligan.dev/blog/css-property-new-style/
- [L15] https://codetv.dev/blog/animated-css-gradient-border
- [L16] https://codepen.io/hexagoncircle/pen/eYwLqJx
- [L17] https://codepen.io/t_afif/pen/gOQMMMj
- [L18] https://magicui.design/docs/components/border-beam
- [L19] https://magicui.design/docs/components/shine-border
- [L20] https://freefrontend.com/code/mouse-tracking-linear-shine-button-2026-02-04/
- [L21] https://www.bram.us/2021/10/13/how-to-create-the-stripe-website-gradient-effect
- [L22] https://shaders.paper.design/grain-gradient · https://shaders.paper.design/static-mesh-gradient · https://npmjs.com/package/@paper-design/shaders-react
- [L23] https://ui.aceternity.com/components/aurora-background
- [L24] https://21st.dev/@manuarora700/components/lamp.md
- [L25] https://greensock.com/forums/topic/24837-animating-gradients/
- [L26] https://tympanus.net/codrops/2024/07/18/how-to-create-distortion-and-grain-effects-on-scroll-with-shaders-in-three-js/

**Text and numbers**
- [T1] https://tympanus.net/codrops/2024/04/23/blurry-text-reveal-on-scroll · https://tympanus.net/Development/ScrollBlurTypography · https://www.github.com/codrops/ScrollBlurTypography
- [T2] https://21st.dev/motion-primitives/text-effect/default
- [T3] https://www.awwwards.com/inspiration/text-blur-reveal-dolsten-co
- [T4] https://gsap.com/docs/v3/Plugins/SplitText/ · https://webflow.com/blog/gsap-splittext-rewrite · https://gsap.com/blog/3-13/
- [T5] https://tympanus.net/codrops/2025/05/14/from-splittext-to-morphsvg-5-creative-demos-using-free-gsap-plugins/ · https://www.osmo.supply/resource/masked-text-reveal · https://motion.dev/examples/react-split-text
- [T6] https://codepen.io/jh3y/pen/eYbYydG
- [T7] https://tylergaw.com/blog/css-scroll-driven-write-on/
- [T8] https://cruip.com/?p=162374
- [T9] https://www.cssscript.com/highlight-text-scroll-animation-timeline/ · https://www.builder.io/blog/view-timeline
- [T10] https://github.com/barvian/number-flow
- [T11] https://magicui.design/llms.txt
- [T12] https://tessl.io/registry/skills/github/cristicretu/family-taste-skill/design-with-taste *(secondary)*
- Scramble: https://motion.dev/docs/react-scramble-text · https://motion.dev/examples/react-scramble-text-hover · https://21st.dev/motion-primitives/text-scramble/default
- Marquee: https://ryanmulligan.dev/blog/css-marquee · https://shop.smashingmagazine.com/2024/04/infinite-scrolling-logos-html-css/ · https://webdesign.tutsplus.com/how-to-build-horizontal-marquee-effects-with-gsap--cms-108794t · https://fylgja.dev/ui/sliders/marquee/

**Scroll**
- [S1] https://tympanus.net/codrops/2024/01/17/a-practical-introduction-to-scroll-driven-animations-with-css-scroll-and-view
- [S2] https://scroll-driven-animations.style
- [S3] https://ryanmulligan.dev/blog/scroll-driven-animations/
- [S4] https://developer.chrome.com/blog/scroll-triggered-animations · https://ryanmulligan.dev/blog/scroll-triggered-animations-style-queries/
- [S5] https://scroll-driven-animations.style/demos/stacking-cards/css/
- [S6] https://codyhouse.co/tutorials/how-stacking-cards
- [S7] https://tympanus.net/codrops/2024/01/31/on-scroll-animation-ideas-for-sticky-sections
- [S8] https://tympanus.net/codrops/2024/03/06/on-scroll-3d-stack-motion-effect
- [S9] https://codeshack.io/sticky-stacking-cards-scroll-effect/
- [S10] https://www.elegantthemes.com/blog/divi-resources/how-to-automatically-scroll-horizontally-when-scrolling-vertically-with-divi-gsap
- [S11] https://webdesign.tutsplus.com/create-horizontal-scroll-animations-with-gsap-scrolltrigger--cms-108881t
- [S12] https://tympanus.net/codrops/2022/01/03/building-a-scrollable-and-draggable-timeline-with-gsap/
- [S13] https://www.osmo.supply/resource/horizontal-scrolling-sections
- [S14] https://flaviocopes.com/css-scroll-driven-animations/
- [S15] https://krijnhoetmer.nl/log/2026/07/making-a-reading-progress-indicator
- [S16] https://bram.us/2021/07/21/a-pure-css-remaining-reading-time-indicator-with-scroll-timeline
- Pinned and zoom: https://css-tricks.com/?p=308477 · https://tympanus.net/codrops/2026/03/11/svg-mask-transitions-on-scroll-with-gsap-and-scrolltrigger/ · https://tympanus.net/codrops/2025/10/29/building-a-layered-zoom-scroll-effect-with-gsap-scrollsmoother-and-scrolltrigger/

**Navigation and pages**
- [N1] https://reactrouter.com/how-to/view-transitions
- [N2] https://developer.chrome.com/docs/web-platform/view-transitions/same-document
- [N3] https://developer.chrome.com/blog/view-transitions-in-2025
- [N4] https://tympanus.net/codrops/2026/02/02/building-a-scroll-revealed-webgl-gallery-with-gsap-three-js-astro-and-barba-js/
- [N5] https://motion.dev/docs/react-layout-animations
- [N6] https://motion.dev/examples/react-shared-layout-animation
- [N7] https://jakub.kr/work/shared-layout-animations
- [N8] https://camoa.github.io/dev-guides/css/css-craft/skeleton-and-loading-states *(secondary)*
- [N9] https://playbook.ebay.com/design-system/components/loading-skeleton
- [N10] https://lokeshdhakar.com/dev-201-stripe.coms-main-navigation/
- [N11] https://builder.io/blog/stripe-menus
- [N12] https://codyhouse.co/gem/stripe-navigation
- [N13] https://css-tricks.com/?p=272368

**Micro-interactions and forms**
- [M1] https://framer.university/blog/how-to-make-magnetic-buttons-in-framer · https://ruvebal.github.io/web-atelier-udit/lessons/en/gsap/overview/demos/16-magnetic-buttons.html
- [M2] https://ui.aceternity.com/components/3d-card-effect · https://ui.aceternity.com/components/comet-card · https://codeshack.io/3d-tilt-card-effect-js/
- [M3] https://design.hagicode.com/designs/raycast/ *(secondary)*
- [M4] https://lucide-animated.com/llms.txt · https://www.producthunt.com/products/lucide-motion
- [M10] https://emilkowal.ski/ui/great-animations
- [M11] https://emilkowal.ski/ui/building-a-toast-component · https://www.github.com/emilkowalski/sonner
- [M12] https://www.github.com/emilkowalski/vaul

**Accessibility and performance**
- https://web.dev/articles/prefers-reduced-motion · https://web.dev/learn/accessibility/motion · https://www.tatianamac.com/posts/prefers-reduced-motion
- https://thoughtworks.com/radar/languages-and-frameworks/lenis · https://motion.dev/docs/lenis · https://bugzilla.mozilla.org/show_bug.cgi?id=1584859
- https://developer.mozilla.org/en/docs/Web/CSS/will-change
- https://web.dev/articles/optimize-inp · https://web.dev/articles/optimize-long-tasks

**Not adopted, for the record**
- Liquid glass: https://blog.logrocket.com/how-create-liquid-glass-effects-css-and-svg/ · https://webdesign.tutsplus.com/liquid-glass-effect-svg-filters--cms-109200t · https://github.com/shuding/liquid-glass
- Gooey: https://tympanus.net/codrops/2015/03/10/creative-gooey-effects/ · https://tympanus.net/codrops/2020/04/28/morphing-gooey-text-hover-effect · https://visualcinnamon.com/2015/05/gooey-effect
- Image distortion: https://tympanus.net/codrops/2018/04/10/webgl-distortion-hover-effects/ · https://tympanus.net/codrops/2019/10/21/how-to-create-motion-hover-effects-with-image-distortions-using-three-js/

---

## 12. Open questions

None of these block the work. Defaults are in brackets.

1. **BUG-20:** drop the footer CTA band on pages that end with their own band, or keep it and change its message? [Drop it there; keep it on pages without a band.]
2. **Link colour:** cyan for inline links and green for CTAs, applied everywhere? [Yes.]
3. **Blog pagination size:** [12 per page with "Show more"; all links stay in the prerendered HTML.]
4. **FX-25 pinned horizontal strip:** only if the home page still feels flat after Phases 1–3? [Yes, decide after measuring.]
5. `VERIFY-LATER[FX-21]`: can `seo:images` emit 16 px LQIP placeholders, or does that need a new step?
