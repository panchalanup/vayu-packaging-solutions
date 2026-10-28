# 3D Box Designer: Implementation Plan (all waves)

Source of ideas: `BOX_DESIGNER_GROWTH_ROADMAP.md` (item numbers `#n` refer to it). This file is the single brief for
everyone implementing it. Read it once; do not re-derive it.

---

## 1. Who uses the tool and what they need

| Audience | Their problem | What makes the tool worth it |
|---|---|---|
| **End users** (D2C brands, small shops, e-commerce sellers, first-time buyers) | Don't know box styles, ply or the right size; fear ordering wrong; want to see their brand; want a price | Guided "find my box", fit checker, many styles with pictures, instant indicative price, realistic preview with their logo, one-tap enquiry |
| **Wholesalers / traders** | Need a fast spec and a quote in bulk; must show options to their own buyers | Quantity tiers, mm/cm/inch, strength guidance, spec sheet PDF, compare-quote prefill, share link |
| **Box manufacturers** (using it to demo to their customers) | Need a polished showroom on a laptop/tablet in front of a client; send a proof afterwards | Presentation mode (clean full screen, turntable), styled product shots and video, stacked/pallet view, spec sheet / proof PDF, dieline, GLB/AR model, embeddable widget |

Product rules: the first success (a box that looks like *theirs*) must happen in under 60 seconds; every panel has a
sensible default; nothing requires sign-up; advanced options are progressive (collapsed until wanted); everything
works on a phone; it should feel playful (instant feedback, smooth animation, satisfying fold).

## 2. Conventions (apply everywhere)

- Unknown business facts never block: use a sensible value and mark `// VERIFY-LATER[DSG-NN]: what to confirm`
  (DSG = designer; pick the next free number with `grep -rn "VERIFY-LATER\[DSG" src api`).
- Prices, strength and delivery are **indicative** and labelled so in the UI.
- Images: no AI images. Original SVG illustrations (`scripts/illustrations`, `npm run illustrations`) or real
  screenshots of our own tool only.
- Analytics: `useEventTracker().trackEvent(name, props)`; props carry style/ply/step/method only, never artwork, text
  or personal data.
- Security: all external input through zod; numbers range-checked; no `dangerouslySetInnerHTML` with user data.
- Match surrounding code style (comment density, Tailwind tokens, shadcn components in `src/components/ui`).
- Each workstream adds Vitest tests for its pure logic. Gate: `npx tsc -p tsconfig.app.json --noEmit`,
  `npx vitest run`, `npm run build`. Other workstreams edit in parallel, so a transient error in a file you do not
  own is not yours; re-run before reporting.
- Shared files (`src/pages/BoxDesigner.tsx`, `DesignerSidePanel.tsx`, `IconSidebar.tsx`, `ExportPanel.tsx`,
  `src/App.tsx`, `public/sitemap.xml`): make small, additive edits only, re-read just before each edit.

## 3. Foundation (done)

`BoxDesign` schema v2 (`src/types/boxDesigner.ts`, `src/lib/boxDesigner/designCodec.ts`; v1 still loads):
`template` now `rsc | hsc | fol | sleeve | telescope | mailer | pizza | tray`, plus `unit`, `quantity`, `finish`,
`insideColorHex`, `lidDepth`, `name`.

## 4. Workstreams

### A. Style engine and realism (owner of `src/lib/boxDesigner/rig/*`, `dieline.ts`, `BoxScene.tsx`, `BoxDesigner3D.tsx`, `constants.ts` templates, `BoxFace`, `BoxSpecPanel.tsx`)
1. **Style registry** (`src/lib/boxDesigner/styles/`): one entry per style with id, name, FEFCO code, description,
   best-for, a small SVG/icon, rig kind, layout fn, printable faces + `getFaceSizes`, fold stops, view extents,
   dieline builder, default dims. Everything else (artwork editor, export, quote) reads from it, never `if rsc`.
2. RSC-family via the existing rig: **FOL 0203** (full-overlap top/bottom flaps; offset overlapping flaps by t),
   **sleeve** (walls only, open both ends), **telescope lid + base** (two HSC rigs; lid inverted, 2t larger,
   `lidDepth`; fold animation lifts the lid off).
3. New **die-cut rig** (#19, #20) reusing `panelGeometry`: **mailer 0427** (tuck-front lid, double side walls with
   dust flaps), **pizza** (shallow mailer variant), **tray** (mailer base without lid). Same public API as `BoxRig`
   (`update/setPose/setColor/setSelected/setHovered/getPrintSurfaces/setPrint/enableSurfaceDetail/dispose`), so
   `BoxScene` holds a common `CartonRig` interface. Fold 0 = flat blank, sealed = closed lid.
4. Dieline SVG/PDF for every style (#26-lite), 1:1 mm, cut/score.
5. **Finishes** (#13): `finish` matte/gloss (roughness/clearcoat), `insideColorHex` (white-lined kraft inside).
6. Style picker in `BoxSpecPanel`: visual card grid of all styles with "best for" text.
7. **Cut-away / show-inside** (#44): toggle that hides the front wall.
8. Tests: layout maths per style, pose ranges, dieline line counts, codec round-trip with new faces.

### B. Sales, estimate and lead capture (owner of `src/lib/boxDesigner/{pricing,strength,fit,units,delivery}.ts`, new `EstimatePanel`, `LeadForm`, `TrustStrip`, `CompareQuote.tsx`, `api/`, Google Apps Script files, admin)
1. **Units** mm/cm/inch (#24): `units.ts` helpers + toggle used by all dimension inputs (coordinate small edits with A).
2. **Fit checker** (#23): product L×W×H + padding + "fragile?" → recommended inside size, one tap to apply.
3. **Instant estimate + quantity tiers** (#1, #4): formula from board area (dieline blank area), ply, print
   colours, finish, quantity slabs 100/500/1000/5000; per-box and total; "indicative" label. Rates as named
   constants marked VERIFY-LATER.
4. **Strength guidance** (#22): McKee BCT estimate from caliper + perimeter (ECT from ply), stacking load with
   safety factor, plain-language verdict ("good for up to ~X kg per box, stack N high").
5. **Lead form "Send my design to Vayu"** (#2, #6): name, phone, email, quantity, city/pincode, sample request
   checkbox, note; attaches spec, share link and PNG preview (data URL, size-capped); posts through the existing
   quote/CRM path (`api/quote.ts`, Apps Script). Success screen with next steps and WhatsApp fallback.
6. **Prefill `/compare-quote`** (#3) from the design.
7. **Delivery estimate by pincode/city** (#5) from `src/content/locations.ts` (indicative days).
8. **Trust strip** (#17) beside/below the tool using `FACTS` from `src/content/facts.ts` (no invented claims).
9. **Funnel analytics** (#35): designer_style_change, designer_artwork_added, designer_estimate_view,
   designer_lead_open, designer_lead_submit, designer_export (+ format), designer_template_used, designer_wizard_done.
10. **Admin "Designer enquiries"** (#9) list in the admin portal reading the CRM sheet + Apps Script follow-up email
    (#8). Deploy steps documented for the owner (VERIFY-LATER).
11. **Sustainability panel** (#27): recyclable, board saved vs next standard size, no unverifiable claims.

**Status (B done):** logic in `src/lib/boxDesigner/{units,blankSize,pricing,strength,fit,delivery,sustainability,funnel,leadPreview}.ts`
(tests: `__tests__/sales.test.ts`); UI in `EstimatePanel` ("Price & order" tab), `FitChecker` (Edit tab), `UnitToggle` /
`UnitDimensionField`, `LeadForm`, `TrustStrip`; lead schema `src/lib/designerLeadSchema.ts`; admin
`/admin/enquiries`. Board area uses `blankSize.ts`, an adapter to switch to A's style registry in one line.
Rates and facts to confirm: `grep -rn "VERIFY-LATER\[DSG" src api GOOGLE_APPS_SCRIPT_ADMIN_CRM.js`.
C: fire `designer_template_used` / `designer_wizard_done` with `useDesignerTracker()` from `funnel.ts`.

**Owner steps (Apps Script follow-up + designer enquiries):**
1. Open the admin CRM Google Sheet > Extensions > Apps Script, replace the code with `GOOGLE_APPS_SCRIPT_ADMIN_CRM.js`.
   Check `OWNER_EMAIL`, `WHATSAPP_NUMBER` and change `SHARED_TOKEN` from the placeholder.
2. Deploy > Manage deployments > edit the existing web app > Version: New version > Deploy (the URL stays the same).
   Approve the new Gmail (MailApp) permission when asked.
3. In the editor, run `installDesignerFollowUpTrigger` once (daily 10:00 follow-up for enquiries still "new" after
   48 h). Optionally run `sendDesignerFollowUps` once to test.
4. In Vercel > Settings > Environment variables set `CRM_WEBHOOK_URL` (the web-app URL) and `CRM_TOKEN` (the new
   token), keep `LEAD_WEBHOOK_URL`, then redeploy. Put the same token in `src/config/adminSheets.ts`. (VERIFY-LATER[DSG-19])
5. Send a test from the designer ("Price & order" > Send my design to Vayu): expect the lead-sheet row, a
   "DesignerEnquiries" row, the owner email with preview, and the enquiry under Admin > Designer enquiries.

### C. Experience, presentation and growth (owner of new components `Onboarding`, `GuidedWizard`, `TemplateGallery`, `PresentationMode`, `ShotStudio`, `SpecSheet`, `PrintCheck`, `BrandKit`, `MyDesigns`, `StudioEnvironment.tsx`, `Canvas3D.tsx` backgrounds, `src/pages/BoxDesignerLanding.tsx`, `src/pages/BoxDesignerEmbed.tsx`)
1. **Onboarding** (#18): 3-step coach marks on first visit (rotate, click a face, get a quote), dismissible,
   remembered; empty-state hints in the artwork panel; micro-animations.
2. **Guided mode "Find my box"** (#15): product type, weight, fragility, shipping method → style, size (uses B's fit
   checker), ply, flute; applied with one tap and explained.
3. **Templates gallery** (#16): E-commerce shipper, Apparel mailer, Pizza, Gift (telescope), Shoe box, Bakery tray,
   Export carton, Wine/bottle, Subscription box... each with sample SVG artwork and spec.
4. **Product shots** (#10): backgrounds (studio, warm wood, concrete, brand colour), angle presets, optional
   watermark, 2x/4x PNG.
5. **Turntable / fold video** (#11): MediaRecorder WebM (MP4 when supported), 360 spin or fold animation, 6-10 s.
6. **Scenes** (#12-lite): stacked boxes / pallet view (instanced clones) and size reference (A4 sheet / 1 L bottle
   silhouettes) for real-size feel.
7. **Presentation mode** for manufacturers: chrome-free full screen, auto turntable, large spec overlay, keyboard
   arrows to step through fold stops and variants.
8. **Spec sheet / proof PDF** (#31-lite): one page with 3 views, dims in chosen unit, board, finish, quantity,
   dieline thumbnail, "customer approval" signature block, date.
9. **Print-ready checks** (#25): low-res image, artwork near fold / over edge, text too small; warnings list with
   click-to-select.
10. **Brand kit** (#32) and **My designs + version snapshots** (#7, #28-lite, #30) in localStorage (no accounts).
11. **Brand colours** (#14): hex/RGB input, recent colours, "print colour confirmed on proof" note.
12. **3D model download** GLB + USDZ and iOS AR Quick Look link (#40-lite).
13. **Quality setting** auto/high/battery saver (#45) and privacy-safe 3D error reporting via analytics (#46).
14. **Landing pages** (#33) `/box-designer/:style` (mailer-box, pizza-box, shoe-box, gift-box, shipping-carton...)
    with SEO copy that open the designer preconfigured; **embed route** `/embed/box-designer` + copy-snippet (#37);
    share-card OG images per style (#34); sitemap entries.

### D. Blogs and reach (owner of `src/constants/blogs.ts`, `src/seo/metadata/blogs.ts`, `src/content/blogCtas.ts`, `public/content/blogs/*`, `scripts/illustrations/scenes-blog.mjs`, `export-seo.mjs`, blog SVGs, `public/sitemap.xml`)
Write many useful articles aimed at the three audiences (how-to, use cases per industry, feature guides, buyer
education), each with an original SVG thumbnail + OG raster and real screenshots of the tool
(`public/blog-images/designer/*.png`, captured after A-C land).

## 5. Deferred, with reasons

| Item | Why not now |
|---|---|
| Accounts / sign-in (#28), team comments (#29), server-stored approvals (#31) | Need a backend and owner decision (roadmap §10.6); covered for now by local "My designs", share links and the proof PDF |
| A/B tests (#36) | Needs traffic and an experiment service |
| Multilingual UI (#38) | Translations must be reviewed by a native speaker; strings are kept in one place to make it easy later |
| Visual regression in CI (#42), real-device QA (#41) | Need CI browsers / a person with devices |
| Full-blank artwork across flaps (#26 full) | Large; per-face artwork already exports with the dieline |
| Inserts and dividers (#21) | Lower priority; revisit after style engine |
