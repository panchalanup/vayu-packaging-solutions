# 3D Box Designer, Phase 2: more styles, more templates, cutouts (stickers)

Builds on `BOX_DESIGNER_IMPLEMENTATION_PLAN.md` (phase 1, done). Same conventions apply (section 2 there):
VERIFY-LATER for unknown facts, no AI images, privacy-safe analytics, additive edits in shared files, tests for pure
logic, gate = `npx tsc -p tsconfig.app.json --noEmit` + `npx vitest run` + `npm run build`.

## 1. Why (user view)

| Who | Problem today | What phase 2 gives them |
|---|---|---|
| Fruit/veg sellers, farmers, FPOs | "None of the 8 styles looks like a fruit box" | Ventilated produce cartons, open trays, hand-hole carry boxes, ready templates with fruit art |
| Apparel, footwear, handloom | Boxes look generic | Garment mailers, tuck-end and crash-lock boxes, shoe/sleeve boxes, templates with fashion art |
| Bakers, sweet shops, cloud kitchens | Cake/sweet/takeaway shapes missing | Window cake box, sweet box, takeaway clamshell, tray + sleeve |
| Gifting, cosmetics, electronics | Want premium retail shapes | Tuck-end carton, slide box, window box, gable carry box |
| Everyone | Can only add one logo per surface and plain text | **Cutouts**: hundreds of ready stickers they can drop, resize, recolour, repeat as a pattern: instant "how will it look" |
| Manufacturers demoing | Need variety to show a customer in minutes | 40+ templates and 20+ styles from one tool |

Product rule (unchanged): first success under 60 seconds, defaults everywhere, advanced options collapsed, works on
a phone, playful but not a circus (see image policy memory: restrained, professional).

## 2. Market reference (what exists in the real world)

Sources: FEFCO groups (0200 slotted, 0300 telescope, 0400 folder/tray, 0500 slide, 0700 ready-glued); supplier pages
for cake, gable, tuck-top and window boxes; produce packaging literature (vent and hand holes cut compression
strength by 10-40%, cooling gains flatten past about 7-8% vent area). FEFCO codes for individual new styles are not
reliable across sources, so the registry stores a code only where certain and marks the rest
`VERIFY-LATER[DSG-NN]`; names are the market names buyers search for.

## 3. New box styles (target 20+ styles total, from 8)

Group the picker: **Shipping**, **Retail & gifts**, **Food & bakery**, **Fruit & produce**, **Display**.
Each style = registry entry + layout + fold pose + rig + dieline + faces + tests + icon + best-for text + landing
page entry + at least one template.

Build in two parallel rig families (variants of rigs that already exist, so cost is moderate):

**Family 1, slotted rigs** (`rscLayout`, `foldPose`, `boxRig`):
| Style | Notes |
|---|---|
| Carry box with hand holes | RSC + two hand holes on the short walls (opening) |
| Ventilated produce carton | RSC + vent slots on walls (opening); mango/apple/grape sizes as templates |
| Open produce tray (HSC) | HSC with low walls and vents |
| Tuck-end carton | Tube with tuck flaps both ends (cosmetics, soap, small retail) |
| Crash-lock (auto) bottom box | Tube with lock-bottom panels, tuck or flaps on top; heavy bottles, jars |
| 1-2-3 bottom box | Variant of crash-lock; mark the difference in `bestFor` |
| Wide-flap overlap wrap / sleeve variants | Only if time; sleeve already exists |

**Family 2, die-cut and telescope rigs** (`dieCutLayout`, `dieCutRig`, `telescopeLayout`, `panelRig`):
| Style | Notes |
|---|---|
| Window mailer / window cake box | Mailer or tray + lid with a film window (opening, glossy translucent look) |
| Takeaway clamshell (lunch/burger) | Shallow hinged lid with front tuck; optional window |
| Shelf display tray | Tray with a cut-down front (front height ratio) |
| Slide box (tray + sleeve) | Two parts: tray slides out of printed sleeve (FEFCO 05xx family; code VERIFY-LATER) |
| Book-style flip-lid box | Hinged lid on the long side, tuck closure (gifts, books, hampers) |
| Gable carry box | Roof top with built-in handle; stretch goal, drop if the geometry is not clean |

Deferred (need different construction, say so in the UI roadmap, not "coming soon" cards): hexagon, pillow, round
tubes, rigid magnetic boxes, bag-in-box.

### Openings (hand holes, vents, windows)
Real holes would need boolean geometry; v1 renders them as **cut-out decals**: a dark cavity with inner edge
shading for holes and vents, a pale translucent film for windows, so the look is right without topology changes.
The **dieline always shows the true cut lines**. Design option fields (schema v3): `handHoles`, `vents`,
`window` booleans plus window size ratio, only offered when the style supports them (`style.openings`).
Estimates add a small cost line (die cost) and the strength panel warns about vent/hand-hole strength loss
(ventilation cuts compression strength, source above; exact percentages VERIFY-LATER).

## 4. Templates (target 40+, from 13)

Template = style + size + board + colour + finish + opening options + sticker composition + sample text, all
original (no third-party brands, no certificates, no claims). Categories (extend `TEMPLATE_CATEGORIES`, add a
search box and a "for this style" filter):

- Fruit & produce: mango carton, apple tray, grape box, banana carton, citrus carton, berry punnet-style tray,
  vegetable crate, dry fruits gift box, farm-fresh hamper
- Food & bakery: cake box (window), cupcake box, sweet/mithai box, cookie box, pizza, burger/takeaway, bakery tray,
  honey and jam jar box, spice box, tea and coffee box
- Clothing & fashion: T-shirt mailer, saree/garment box, kids wear, shoe box, sandal box, handloom, accessories,
  jewellery gift box, watch box
- Beauty & wellness: soap box, perfume carton, skincare set, candle box, incense
- Electronics & gadgets: phone accessory, earbuds, charger, small appliance
- Gifts & festive: gift box, hamper, Diwali, wedding favour, rakhi, corporate gifting, Christmas (neutral, no
  religious figures in generated art)
- Home & kitchen, toys, stationery and books, pet products, plants and flowers
- Shipping & export: e-commerce shipper, export carton, heavy-duty, subscription box

Templates reference stickers by id (section 5), so they stay tiny and share links work.

## 5. Cutouts (sticker library and editor)

**Meaning:** ready-made cut-out graphics (fruits, products, icons, badges, patterns) a user drops on any surface.

### Content (target 250+ items, 10+ categories)
- Fruits & vegetables, bakery & food, drinks, clothing & fashion, footwear & accessories, beauty & wellness,
  electronics, gifts & festive, home & kitchen, flowers & plants, animals and kids, shipping & handling marks,
  badges & labels (generic words only: Handmade, Fresh, New, Sale, Gift, Premium; **no** Organic, Vegan, Certified,
  Food-grade, ISO or similar claims), shapes & frames, seamless patterns (dots, stripes, leaves, geometric, check),
  contact icons (phone, mail, web, location; **no** third-party brand logos).
- Sourcing, in order: (1) open-licence **colour emoji/illustration sets with a permissive licence** (e.g. MIT or
  Apache-2.0 sets such as Fluent Emoji flat or Noto Emoji; Twemoji needs CC-BY credit): the agent **verifies the
  licence in the package or repo itself**, records author and licence in `src/content/imageCredits.ts`, shows them
  on `/image-credits`, and ships only a curated subset; (2) `lucide-react` (already installed, ISC) for
  one-colour icons; (3) **original SVG** drawn by us (badges, shapes, frames, patterns, shipping marks) with
  a generator script like `scripts/illustrations`. No AI-generated art.
- Every item: `id` (short, stable, kebab), `name`, `category`, `tags[]` (search words incl. Hindi/Gujarati
  transliterations where natural, e.g. "aam mango"), `kind: 'colour' | 'mono' | 'pattern'`, `src` (lazy URL).
- Packaging: one lazy module per category (`import.meta.glob` with `?url`, `eager:false`) so the designer bundle
  does not grow; thumbnails load on scroll; total library under about 1.5 MB, each SVG optimised.

### Editor (one place: the Artwork tab)
- New **Cutouts** section next to Image and Text: category chips, search, "Recommended for this box" row (by style
  and template category), grid of thumbnails, one tap to add on the selected surface (or the first printable
  surface), double tap = add and select.
- Unlimited stickers per surface (cap 80 per design). Per sticker: move, scale, rotate, flip, opacity, **tint to
  one colour** (works for every sticker via canvas `source-in`, so users can match brand colour), duplicate,
  delete, layer order, lock. Keyboard: Delete, Ctrl+D, arrows nudge, [ ] layer order. Pointer handles on canvas.
- **Pattern fill**: repeat one sticker as a tiled pattern across a surface (spacing, size, angle, offset);
  "Apply to all surfaces".
- **Magic helpers (playful, optional)**: "Surprise me" (random curated palette + sticker arrangement for this box
  type), "Match brand colour" (tint all), industry colour palettes.
- Print pipeline: drawn in `textures/printLayer.ts` with images, text and handling marks; included in dieline
  PDF, PNG, product shots, video, spec sheet, presentation mode. Print check: warn if a sticker crosses a fold.
- Share links include stickers (id + placement only, a few bytes each), so a shared link shows the full design.
  Saved designs and My designs keep them. Schema v3 (v1 and v2 still load).

## 6. Experience upgrades that make 20+ styles usable

- **Style picker**: group tabs + search + "Popular" row, cards show best-for text and a tiny 3D thumbnail
  (`BoxThumbnail`), "what product are you packing?" chips filter styles. Keyboard and mobile friendly.
- **Template gallery**: category tabs, search, style filter, preview on hover; loading a template animates the fold.
- **Wizard** (`wizard.ts`): extend rules to recommend the new styles (produce -> ventilated; cake -> window cake box).
- **Landing pages**: new `/box-designer/:style` entries for each new style (SEO copy, FAQ, sitemap) + share cards.
- Estimates, strength, dieline, blank size, units, lead form, presentation, product shots must work for **every**
  style because they read the registry.

## 7. Schema v3 (single shared change, do first)

`BoxDesign` gains: `stickers: StickerPlacement[]` (`id`, `stickerId`, `face`, `position`, `scale`, `rotation`,
`flip`, `opacity`, `tint: string|null`, `locked`, `pattern: null | {spacing, angle}`), and `options`
(`handHoles`, `vents`, `window`, `windowRatio`, `frontCut` as needed by styles). New template ids are added to
`BoxTemplate` and the codec enum by the style agents; the codec keeps `v1`/`v2` readable and caps sizes.

## 8. Workstreams (run in parallel, then integrate)

| Id | Owner of | Output |
|---|---|---|
| E | schema v3, `stickers/` engine (`lib/boxDesigner/stickers/*`), `printLayer.ts`, `ArtworkEditor.tsx`, new `CutoutPanel`, `StickerLayer` UI, share/save, print check | Sticker editor end to end with a placeholder pack of ~12 items |
| F | `src/assets/stickers/**`, `src/lib/boxDesigner/stickers/library/*` (manifest per category), `scripts/stickers/*`, `imageCredits.ts` | 250+ curated items, manifest, licences verified and credited |
| G1 | slotted family: `rscLayout`, `foldPose`, `boxRig`, openings in `panelRig`, registry entries | Family 1 styles + openings system |
| G2 | die-cut and telescope family: `dieCutLayout`, `dieCutRig`, `telescopeLayout/Rig`, registry entries | Family 2 styles |
| H (after E, F, G) | templates 40+, style picker UX, gallery, wizard rules, landing pages, estimate/strength rules for new styles, sitemap | Integration and polish |
| I (after H) | blogs and screenshots | Articles for fruit, clothing, bakery, gifting, cutouts how-to, new styles, with real screenshots |
| QA (last) | headless browser pass over every style and template | Bug fixes, screenshots |

Rule for G1/G2: Family 2 consumes the openings API from G1 (`panelRig`); G1 publishes it first, G2 starts with
layout work and picks it up when present.

## 9. Acceptance

- 20+ styles each fold flat to assembled, artwork on every printable face, true dieline, correct estimate.
- 250+ cutouts, search works, add/move/scale/rotate/flip/tint/duplicate/delete/pattern all undoable, autosaved,
  shareable; opening the designer does not download the whole library.
- 40+ templates open in one tap and look good; phone layout checked.
- No new console errors; tests added for layouts, poses, dielines, sticker codec, pattern maths, template
  validity (every template id, style, sticker id resolves); build size delta reported.

## 10. Risks and decisions (VERIFY-LATER, nothing blocks)

| Item | Default taken |
|---|---|
| Licence of the colour sticker set | Prefer MIT/Apache sets; agent verifies in the repo and credits; fall back to original SVG if unclear |
| FEFCO codes for new styles | Only where certain; others marked VERIFY-LATER[DSG-NN] |
| Strength loss from vents/holes | Use the 10-40% literature range as a warning, not a number in estimates |
| Festive art | Neutral symbols only (diya, lantern, stars, lights); no deity images |
| Gable carry box | Dropped if geometry is not clean in one pass |
