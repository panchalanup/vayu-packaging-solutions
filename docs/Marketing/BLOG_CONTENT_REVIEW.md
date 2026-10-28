# Blog content review

Reviewed 2026-10-27. Scope: all 34 posts in `public/content/blogs/*.md`, plus `src/constants/blogs.ts`, `src/seo/metadata/blogs.ts` and `src/content/blogCtas.ts`. Slugs were not changed. `BlogPost.tsx`, `vercel.json` and the sitemap were not touched.

## At a glance

| Area | Result |
|---|---|
| Posts read in full | 34 of 34 |
| Posts rewritten from scratch | 7 (the Jan to Feb 2025 guides, see below) |
| Posts edited in place | 27 |
| Invented stories, statistics, prices, certificates and guarantees removed | about 40, all in the 7 old guides |
| Technical errors corrected | 12 |
| Tool-accuracy fixes (styles, tab names, features, numbers) | about 25 |
| FAQ entries trimmed so every post has 3 to 5 | 28 removed across 17 posts |
| Link lists trimmed to at most 5, "Features you will use" tables removed | 12 lists, 7 tables |
| Titles, meta descriptions, reading times, `updated` dates rewritten | 34 each |
| New `VERIFY-LATER` markers | BLOG-200 to BLOG-215 (16); BLOG-20, 27 and 28 rewritten; BLOG-30 resolved |
| Word count | 68,800 to 58,400 (less filler) |

Gate: `npx vitest run src/content` passes (10 tests). `npx tsc -p tsconfig.app.json --noEmit` was clean on the last run; earlier runs reported errors only in other agents' in-progress `tools/calculators` and `ToolsIndex.tsx` files.

## Site-wide findings

### 1. The seven oldest guides were the worst problem
`types-of-corrugated-boxes`, `corrugated-wall-differences`, `flute-types-guide`, `gsm-calculation-strength`, `burst-strength-ect-guide`, `box-measurements-guide` and `kraft-paper-grades` (Jan to Feb 2025) were written as generic marketing and contained, among other things:

- **Made-up customer stories** presented as fact (an e-commerce owner losing ₹1,20,000, a laptop distributor saving ₹16,90,000 a month, a pump exporter with "0% damage", an iPhone-brand review quote, a ceramics maker, a cosmetics brand "35% more sales").
- **Invented statistics and prices** (damage rates, "67% of buyers read the packaging", price ranges per box and per kg of paper, courier savings, test-lab costs).
- **Invented certificates and promises about Vayu**: "BIS-certified lab reports with every order", "free replacement if boxes do not meet certified specifications", "FSSAI certification documentation", "FSC-certified virgin kraft and BIS-certified recycled kraft available", "meets EU food safety standards".
- **Wrong or misleading technical content** (list below).

All seven were rewritten: shorter, accurate, honest, with a designer CTA near the top and the end, a quote link, 4 FAQs and 4 related links each. Remaining uncertain facts carry `VERIFY-LATER` markers.

Technical errors found and fixed:

| Post | Error | Fix |
|---|---|---|
| box-measurements-guide | Said the industry standard is **outside** dimensions. The corrugated trade and the 3D Box Designer both use **inside** dimensions, so this contradicted ten other posts. | Rewritten around inside dimensions. |
| box-measurements-guide | Volumetric weight example divided inches by 5,000 (the divisor is for cm and kg): 7.68 kg shown, actual 12.6 kg. | Rewritten in cm with a checked example (40 × 30 × 25 cm = 6 kg). |
| flute-types-guide | "Flutes per foot" column held per-metre figures (A 108 to 122 is per metre; per foot is about 33). | Column is now per metre, with a note. |
| flute-types-guide | E flute 1.6 mm, C flute 4 mm and AAA triple wall presented as standard. | Ranges, triple wall shown as C + B + C. |
| gsm-calculation-strength | "Total GSM = top + fluting + bottom" ignores the fluting take-up factor (about 1.3 to 1.5), so board weight was understated. | Worked example (about 456 GSM, not 420). |
| gsm-calculation-strength | BF (bursting factor) never explained, though suppliers quote it. | Defined (BF = burst kg/cm² × 1000 ÷ GSM) with an example. |
| gsm-calculation-strength | A strength-by-GSM table and "price per GSM" comparison that no standard supports. | Removed; replaced by "compare layers, BF and ECT". |
| burst-strength-ect-guide | ECT values "23, 26, 32, 40, 44, 55" are US ratings in lb/in but were mixed with kg/cm. | Units explained (1 kg/cm is about 0.98 kN/m; 32 lb/in is about 5.6 kN/m). |
| burst-strength-ect-guide | "Required ECT = load ÷ perimeter" is not a real formula. | Replaced by the McKee formula, linked to the stacking guide. |
| burst-strength-ect-guide | "IS 1060:1992" cited as the test standard for corrugated board. | Only ISO 2759 and ISO 3037 named; Indian standard numbers marked VERIFY-LATER. |
| corrugated-wall-differences | ISPM 15 "compliant" triple wall boxes, -20 to 50 °C ratings, "insurers require triple wall". ISPM 15 applies to wood pallets and crates, not cartons. | Removed; ISPM 15 now described correctly. |
| kraft-paper-grades | Fibre length, "10 to 30% lower", "30 to 40% less energy" and price per kg figures with no source. | Removed or made qualitative. |

### 2. The designer posts were mostly honest, but the tool moved on
The 27 newer posts were already careful (indicative language, VERIFY markers, no invented stories). What needed fixing was **drift from the shipped tool**:

- "Eight box styles" and 8-style lists in `3d-box-designer-tool-free`, `how-to-use-3d-box-designer`, `box-manufacturers-3d-presentations` and `packaging-mistakes-small-business`: now 20 styles, 74 templates, 512 cutouts.
- **UI names.** The tool has five tabs: **Edit Box, Customize, Showcase, Price & order, Actions**. Posts said "Artwork tab", "Export panel", "shot studio from the export area", "size panel" and "strength panel". Fixed in 14 places; `how-to-use-3d-box-designer` now has a short "how the screen is organised" paragraph.
- **Angle presets** in `packaging-product-shots-360-video` were wrong (real presets: 3/4 hero, front, side, top, back 3/4). Video clips are 8 seconds, not "6 to 10".
- **Dieline and artwork.** `how-to-add-cutouts-box-design` said cutouts appear in the dieline file. The dieline SVG and PDF carry structure only (`dieline.ts` has no artwork). Corrected, and `dielines-explained` now agrees (marker BLOG-214).
- `dielines-explained` said the dieline tool covered only RSC and HSC; dielines now exist for every style (slotted, telescope, slide, die-cut).
- Verified against code and left as is: fit checker defaults (1 cm padding, 2.5 cm fragile, 0.3 cm ease, round up to 0.5 cm), estimate tiers 100, 500, 1,000 and 5,000 with a ±15% range, McKee strength maths (worked example in the stacking guide reproduces: 5-ply B + C, 400 × 300 × 300 mm gives about 439 kg crush strength, 110 kg safe load, 6 high by height cap), print-check thresholds (150 and 90 dpi, 0.5 cm, 8 and 6 pt, 10 MB, SVG, PNG, JPG, WebP), units mm, cm and in, 74 templates in 13 categories (counts per category match), 20 styles in 5 groups (6, 7, 3, 2, 2), windows only on styles that offer them (20 to 85% slider), all `/box-designer/:style` landing links resolve.

### 3. Consistency
- **Inside versus outside:** every post now says inside dimensions. "ID" is the shorthand.
- **Ply naming:** 3-ply = single wall, 5-ply = double wall, 7-ply = triple wall, used the same way everywhere. Board thickness harmonised to about 3, 6 to 7 and 10 mm (indicative, BLOG-203).
- **Ply guidance:** the wall guide, the types guide and the stacking guide now agree with the designer's placeholder content limits (about 8, 20 and 40 kg per box); the earlier "3-ply for 10 kg, sometimes" was reworded.
- **Dates:** no post is dated after 2026-10-27. Frontmatter `date` and `src/constants/blogs.ts` `date` match for all 34. Added an optional `updated` field (set to 2026-10-27 on every post revised here) to the `BlogPost` interface and to frontmatter. Nothing reads it yet; the SEO agent can use it for `dateModified`.
- **Company numbers:** none of the posts now quotes a company statistic, so nothing conflicts with `src/content/facts.ts`. The only MOQ mention is in `box-price-estimate-guide` (BLOG-25): the designer shows a 100-box tier while `FACTS.moqBoxes` is 500.
- **Duplicate paragraphs:** no identical paragraphs remain across posts. Three food posts still share the *idea* of a food-contact caution (pizza, cake, takeaway), each worded for its food. `vents-hand-holes-windows-box-design` and `fruit-vegetable-ventilated-boxes` both quoted the 10 to 40% and 7 to 8% figures at length; the fruit post now keeps one short paragraph and links to the vents post.
- **Tone:** removed the "game-changing", "perfect" and "Goldilocks" style language, the repeated "Features you will use" tables in seven posts and the long "Where to go next" lists (7 to 10 links, now 5 at most).
- **Legacy copies:** `src/content/blogs/*.md` (7 files) is **not referenced by any code**; the site fetches only `public/content/blogs`. The legacy copies had drifted (old email) and held the invented claims. They are now synced from the public versions with the `VERIFY-LATER` comments stripped, so IDs are not listed twice. Recommendation: delete the folder.

### 4. Keyword cannibalisation

| Cluster | Posts competing | Differentiation applied |
|---|---|---|
| Box styles | `box-styles-in-3d`, `which-box-style-should-you-choose`, `types-of-corrugated-boxes` | styles-in-3d is now "how the 8 core styles are built" (RSC, HSC, FOL, mailer); the picker is "by product, 20 styles"; the types guide is "ply, style, print, food contact". Focus keywords: "RSC HSC FOL mailer box styles", "which box style to choose", "types of corrugated boxes". |
| Inside size | `box-measurements-guide`, `find-right-box-size` | measuring guide = L × B × H, inside vs outside, spec, volumetric weight, pallets. Size guide = padding, ease and the fit checker. Titles now say so. |
| The tool itself | `3d-box-designer-tool-free`, `how-to-use-3d-box-designer` | overview "Free 3D Box Designer" versus step-by-step guide. Focus keywords "free 3D box designer" and "how to use 3D box designer". |
| Strength | `burst-strength-ect-guide`, `box-stacking-strength-guide`, `corrugated-wall-differences`, `gsm-calculation-strength` | burst/ECT = what the tests mean and what to put in a spec; stacking = BCT, McKee and stack height; wall = construction; GSM = paper weight and BF. |
| Produce | `fruit-vegetable-ventilated-boxes`, `mango-apple-grape-packing-boxes`, `vents-hand-holes-windows-box-design` | vents post = the general opening trade-off; fruit post = planning a produce box; mango post = three fruits and export caution. |
| Food | `pizza-bakery-box-design`, `cake-sweet-bakery-boxes`, `takeaway-tiffin-pizza-boxes-cloud-kitchens` | pizza post refocused on **pizza sizes** (focus "pizza box sizes"), bakery content left to the cake post, takeaway post covers clamshell, pizza and carry choices. |
| Apparel and mailers | `apparel-footwear-mailer-shoe-boxes`, `clothing-saree-footwear-boxes`, `ecommerce-mailer-box-unboxing` | apparel = basics (garment mailer, shoe box); clothing-saree = newer styles (window mailer, tuck-end, slide, book); mailer = e-commerce unboxing. Cross-linked both ways. |
| Templates and ideas | `box-design-templates-tour`, `box-design-ideas-in-5-minutes`, `how-to-add-cutouts-box-design` | tour = what is in a template; ideas = 20 recipes; cutouts = how-to. Distinct enough; kept. |

### 5. Metadata
All 34 titles are 60 characters or fewer (they are also the page H1, and the site appends " | Vayu Packaging Solutions" to the title tag). All meta descriptions are 140 to 160 characters, with a benefit and an action, and the focus keyword appears naturally. The `description` field in `src/constants/blogs.ts` (shown under the H1 and on cards) uses the same text. Because the renderer strips a leading H1 only when it equals the post title, every markdown H1 and frontmatter title was updated together with `blogs.ts`.

### 6. Other site-wide notes for the owner
- **Pizza preset vs reality.** The pizza preset and template are 31 × 31 × 5 cm "for a 12 inch pizza" (30.5 cm). That leaves 0.5 cm. The pizza post now says "snug"; consider 32 cm in the tool.
- **Burger preset** is 15 cm on the landing page and 14 cm in the template (BLOG-88).
- **Estimate vs MOQ.** The designer shows a 100-box tier but `FACTS.moqBoxes` is 500 (BLOG-25).
- **Mid-article card copy** in `blogCtas.ts` says "Strength test reports are available on request." Please confirm that is true (see owner questions).
- **Placeholder rates** in the tool (board rates, plate and die costs, ECT values, production days) are still flagged `VERIFY-LATER[DSG-xx]` in code. No post publishes them; the posts only describe how the estimate behaves.

## Owner questions (new markers BLOG-200 to BLOG-215)

| ID | Post | Question |
|---|---|---|
| BLOG-200 | types-of-corrugated-boxes | Is 8 / 20 / 40 kg a fair "comfortable contents" guide for 3, 5 and 7-ply? |
| BLOG-201 | types-of-corrugated-boxes | Which print routes do you offer (flexo, litho-laminated, digital), and the minimum order for each? |
| BLOG-202 | types-of-corrugated-boxes | What exactly can you state and document for food-contact boxes (board, adhesive, coating, papers)? |
| BLOG-203 | corrugated-wall-differences | Do the thickness ranges (3 to 5, 6 to 8, 10 to 15 mm) match the boards you actually run? |
| BLOG-204 | flute-types-guide | Confirm flute heights and counts against your corrugator's profiles. |
| BLOG-205 | gsm-calculation-strength | Which take-up factors (1.3 to 1.5) does your corrugator use? |
| BLOG-206 | gsm-calculation-strength | What liner and fluting GSM do you stock for 3, 5 and 7-ply? |
| BLOG-207 | burst-strength-ect-guide | Which tests do you run (burst, ECT, BCT, moisture) and can you supply reports on request? |
| BLOG-208 | burst-strength-ect-guide | Which Indian standard numbers do your customers quote? Only ISO 2759 and ISO 3037 are named for now. |
| BLOG-209 | box-measurements-guide | Confirm the 2.8 mm and 6.6 mm board thickness figures. |
| BLOG-210 | box-measurements-guide | Is 5,000 the divisor for the couriers your customers use? |
| BLOG-211 | kraft-paper-grades | Which paper grade names do you use (kraft liner, semi-kraft, test liner, duplex, white top)? |
| BLOG-212 | kraft-paper-grades | Which paper grades do you supply for food contact, and what documents come with them? |
| BLOG-213 | kraft-paper-grades | Can you supply FSC or PEFC certified paper? (No such claim is made until confirmed.) |
| BLOG-214 | how-to-add-cutouts-box-design | Do the spec sheet PDF's three views show placed cutouts? |
| BLOG-215 | how-to-add-cutouts-box-design | Does `/image-credits` list the sticker sources (MIT and ISC icon sets plus original SVGs)? |

Existing markers retained: BLOG-21 to 29 (designer guides), 50 to 57, 70 to 89, 100 to 106. BLOG-30 was removed because the overview now matches the shipped tool; BLOG-20 was removed for the same reason; BLOG-27 and BLOG-28 were rewritten to the residual questions.

Plain questions that need an answer, not a marker:

1. Do you hold any certificates (BIS, ISO, FSSAI, FSC)? None are claimed now.
2. Do you offer sample boxes, replacement policies or test reports? None are promised now. `blogCtas.ts` still says "Strength test reports are available on request."
3. Is the minimum order 500 boxes, and are 100-box orders accepted?
4. What are your real lead times, festive-season lead times and delivery coverage? No post states any.
5. May other box makers embed the designer, and where do their enquiries go (BLOG-50)?

## Per-post review

"Questions" lists what the owner still has to confirm. Every post also got a new title, description, reading time and `updated` date.

| Post | Issues found | What I changed | Questions for owner |
|---|---|---|---|
| types-of-corrugated-boxes | Invented stories and prices, "FSSAI compliant" food-grade claims, invented print minimums, no designer CTA. | Rewritten: four choices (board, style, print, food contact), honest food-contact wording, CTAs, 4 FAQs. | BLOG-200, 201, 202 |
| corrugated-wall-differences | Invented specs and stories, ISPM 15 misapplied to cartons, invented compression figures and insurer claims. | Rewritten with correct wall/ply table, McKee link, decision table. 10 kg case aligned with the tool. | BLOG-203 |
| flute-types-guide | Per-foot error, wrong E and C heights, invented stories and prices, "AAA" triple wall. | Rewritten with corrected table, B + C and C + B + C combinations, choice table. | BLOG-204 |
| gsm-calculation-strength | Total GSM ignored take-up, BF missing, invented strength and price tables, "BIS-certified test reports for all our boxes". | Rewritten: GSM, BF, worked board weight, how to compare quotes. | BLOG-205, 206 |
| burst-strength-ect-guide | Units mixed, wrong ECT formula, wrong standard cited, "replace free" guarantee, certified-lab claims. | Rewritten: two tests, units table, McKee link, what to ask for. | BLOG-207, 208 |
| box-measurements-guide | Said outside dimensions are standard (wrong), volumetric weight maths wrong, invented story. | Rewritten around inside dimensions, correct maths, pallet note, spec table. | BLOG-209, 210 |
| kraft-paper-grades | Invented figures and case studies, FSC/BIS "available" claims, food-contact overstatement. | Rewritten, qualitative, grade names table, honest food and sustainability notes. | BLOG-211, 212, 213 |
| 3d-box-designer-tool-free | "Eight box styles", one superlative in the title, stale marker, mixed related links. | 20 styles, 74 templates, 512 cutouts, five tabs, new related links, new title. BLOG-30 resolved. | None |
| how-to-use-3d-box-designer | Style list out of date, no screen orientation, 7 related links, 6 FAQs. | Tabs explained, tab names added to steps, WebP, related links and FAQs trimmed. BLOG-20 resolved. | None |
| box-styles-in-3d | Overlaps the picker post, 6 FAQs. | Reframed as the 8 core styles, link to the picker, FAQs trimmed. | BLOG-21 (FEFCO codes) |
| find-right-box-size | Thickness 3 to 4 mm vs 2.8 mm example, tab name. | Harmonised, tab name, link to picker. | BLOG-22, 23 |
| box-price-estimate-guide | "500 to 1,000 often lowers noticeably" overstated (tool factor is 6%), plate reuse unqualified. | Reworded, tab name added, quote wording. | BLOG-24, 25 |
| logo-artwork-on-boxes | Related link to kraft paper irrelevant, 6 FAQs. | Customize tab, better related links, FAQs trimmed. Thresholds verified. | BLOG-26 |
| dielines-explained | Said only RSC/HSC export, "we generate the production drawing", an unverifiable panel-direction tip, "Export" tab. | Marker rewritten, Actions tab, wording softened, tip removed. | BLOG-27 |
| packaging-product-shots-360-video | Wrong angle presets, "6 to 10 s" clips, tab name. | Corrected to code, Showcase tab, AR test flagged. | BLOG-28 |
| box-stacking-strength-guide | Promised test reports, tab name. | Reworded, Price & order tab. Maths verified. | BLOG-29 |
| box-manufacturers-3d-presentations | Eight-style list, "no paid tier", 8-link list, 7 FAQs. | 20 styles, softened, 5 links, 5 FAQs. | BLOG-50 |
| wholesalers-spec-price-share-boxes | 7-link list, 7 FAQs. | 5 links, 4 FAQs. | None |
| ecommerce-mailer-box-unboxing | "Features you will use" filler, 7 FAQs, no link to newer apparel post. | Removed filler, 5 FAQs, new links. | None |
| pizza-bakery-box-design | Overlapped cake and takeaway posts, 7-inch row vs the tool's 8-inch preset, three food notes, cake advice outdated. | Rewritten around pizza sizes (8, 10, 12 inch), short bakery section, new title and focus keyword. | BLOG-52, 53 |
| apparel-footwear-mailer-shoe-boxes | Overlaps clothing-saree, filler table, 7 FAQs. | Cross-linked, filler removed, 5 FAQs. | BLOG-54 |
| festive-gift-hamper-boxes | Only telescope boxes mentioned, filler, 7 FAQs. | Added book, slide and carry boxes, 5 FAQs. | BLOG-55 (festive lead times) |
| export-cartons-5-ply-7-ply | Filler table, 6 FAQs. | Removed filler, Price & order tab, 5 links, 5 FAQs. | BLOG-56, 57 |
| packaging-mistakes-small-business | 10-link list, 7 FAQs. | 5 links, 5 FAQs. | None |
| how-to-add-cutouts-box-design | "Artwork tab", dieline-contains-cutouts claim, credit claim unverified. | Customize tab, claim corrected, two markers. | BLOG-100, 101, 214, 215 |
| box-design-templates-tour | "Edit tab", "Artwork tab", 6 FAQs. | Names fixed, FAQs trimmed. Counts verified (74, 13 categories). | BLOG-102 |
| which-box-style-should-you-choose | Opening was history rather than the reader's problem, "(Updated)" in title, 6 FAQs. | New opening, new title, FAQs trimmed. Groups and counts verified. | BLOG-103 |
| box-design-ideas-in-5-minutes | "Artwork tab". | Customize tab. | BLOG-104 |
| vents-hand-holes-windows-box-design | Panel name, 6 FAQs. | Edit Box tab, 4 FAQs. Opening rules verified against the style registry. | BLOG-105, 106 |
| fruit-vegetable-ventilated-boxes | Duplicated the vents post, long link list, 6 FAQs. | Strength section condensed to link to the vents post, 5 links, 5 FAQs. | BLOG-70 to 73 |
| mango-apple-grape-packing-boxes | "Hindi word keri" (keri is not Hindi), filler table, 6 FAQs. | Fixed, filler removed, 5 links, 5 FAQs. | BLOG-74 to 78 |
| clothing-saree-footwear-boxes | 9-link list, 6 FAQs. | 5 links, 5 FAQs. | BLOG-79 to 81 |
| cake-sweet-bakery-boxes | Filler table, 8-link list, 6 FAQs, pointer to the pizza and bakery guide. | Filler removed, 5 links, 5 FAQs, pizza pointer updated. | BLOG-82 to 85 |
| takeaway-tiffin-pizza-boxes-cloud-kitchens | "31 cm for 12 inch pizza" overstated fit, filler table, 6 FAQs. | "Snug fit" wording, filler removed, 5 links, 5 FAQs. | BLOG-86 to 89 |

## How to re-run the checks

- `npx vitest run src/content` verifies slugs, SEO entries, links to other posts and screenshot listings.
- `grep -rn "VERIFY-LATER\[BLOG" public/content/blogs` lists the open questions.
- Title and description lengths: every `title` in `src/constants/blogs.ts` is at most 60 characters, every `metaDescription` in `src/seo/metadata/blogs.ts` is 140 to 160.
