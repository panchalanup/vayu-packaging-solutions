# 3D Box Designer Showcase Page: Plan

| | |
|---|---|
| **Version** | 1.0, 16 Nov 2026 |
| **Status** | Planning only. No code has been changed. |
| **What** | One long, cinematic page that sells the 3D Box Designer to two audiences: box **manufacturers** (who show it to their customers) and box **buyers** (who design for themselves). It is built from multiple full-screen "hero" chapters with scroll animation. |
| **Route** | `/3d-box-designer` (recommended; see §7.1) |
| **Written for** | The product owner (Vayu) and the developer(s) who will build it |
| **Builds on** | `BOX_DESIGNER_IMPLEMENTATION_PLAN.md` (what the tool does), `../Design-Improvement/DESIGN_IMPROVEMENT_PLAN.md` §4, §5 and §8 (visual language, tokens, motion system), `../Marketing/KEYWORD_AND_GROWTH_STRATEGY.md` (segments S1–S7, keywords C10/C11) |

> **Conventions.** These are the same as the other plans.
> - **[DRAFT COPY]** marks wording that is a proposal.
> - Unknown facts never block the build: use the default and mark the spot `VERIFY-LATER[SHW-NN]` (SHW = showcase).
> - Images: no AI images. Use original SVG, or real screenshots and recordings of our own tool.
> - Wireframes are ASCII: desktop about 1280 px and mobile about 375 px.

---

## 0. Summary

The designer already does far more than most visitors will discover by opening it. That includes:
- 1:1 dieline PDF and SVG, spec-sheet proof PDF with an approval block, and share links.
- Presentation mode, embed widget, turntable video, GLB/USDZ, pallet view, strength guide, fit checker, indicative ₹ estimate and 74 templates.

This page turns those features into a story that a manufacturer or a buyer can follow in about two minutes of scrolling:

> **Design it → Fold it → Read the dieline → Share it → Approve it → Make it.**

The page is a sequence of **10 chapters**. Each one is a full-viewport, hero-grade section with one headline moment.

The signature moment is **"The Unfold"** (Ch. 2):
1. A sealed, branded box opens and unfolds flat as you scroll.
2. It becomes the real dieline. Cut lines draw solid, fold lines draw dashed red, and dimensions snap in.
3. It lands as the actual PDF page you can download.

A sticky **audience switch**, "I buy boxes / I make boxes", rewrites the copy and CTAs of each chapter for the reader. One URL serves both pitches, and `?for=maker` lets you send manufacturers a direct link.

Every visual comes from the tool's own code (`dielineForDesign`, the box rig, `specSheet`) or from recordings of the tool. The page can never promise something the product doesn't do.

**One product gap must close first (§6).** Today the dieline PDF shows cut and score lines, a glue label and a one-line legend. It does **not** print panel dimensions, panel names or the overall blank size. The page's core promise is "proper die-cut dimensions and where to fold", so Phase 0 adds those to the PDF.

---

## 1. Research: who reads this page and what convinces them

### 1.1 Box manufacturers and converters (segment S6, plus Vayu's own sales team)

**Who:** Small and mid-size corrugators and converters. In India they are mostly MSMEs: 10,000+ semi-automatic units and around 350 automatic corrugators. Their sales reps and owners deal with customers directly, often over WhatsApp.

**Their day:**
1. A buyer sends a rough size, often in inches, with "same as last time but bigger".
2. The rep sketches or explains the box. Sometimes the plant makes a physical sample on a CAD cutting table.
3. They send a flat PDF proof and wait for approval, then repeat for 2–3 rounds.
4. They quote while kraft-paper prices change weekly.

| Pain (what the research shows) | What the page must show the tool does about it |
|---|---|
| Customers can't read a flat proof. Problems such as a logo hidden under a tuck flap or text across a fold only show up after production. A flat proof is "not usually a 3-dimensional mockup of the box". | The same design shown **flat and folded, linked**. Hover a panel on the dieline and it lights up on the 3D box (Ch. 3). |
| Proofs go through 2–3 review rounds, and "version confusion" causes a large share of delays. | Share link = one source of truth. The **spec sheet PDF** carries a reference number, date and approval signature block (Ch. 5). |
| Artwork is often made before the structure is locked. A small size change means a new dieline. | The dieline regenerates instantly from L×W×H. "Change the size, the dieline follows" (Ch. 2). |
| Physical samples cost money and days: about US$39–300 and 7–20 days per supplier sample. | "Approve the shape in 3D before you cut a sample." This is framed as **fewer** sample rounds, not none. |
| Leads arrive vague ("need boxes, send rate"). | Enquiries arrive with the full spec, preview, quantity and city (existing `LeadForm`, admin "Designer enquiries"). |
| No 3D or website tool of their own. Competitors' tools target designers, not plants. | **Presentation mode** for meetings, an **embed widget** for their own website, and **turntable video** for their catalogue (Ch. 6). |

**What convinces them:** watching the meeting scenario happen (tablet → turntable → share link → signed proof). Feature lists don't. Plain trade language does: ply, flute, BF, FEFCO code, score and crease. They are allergic to hype.

**Objections to answer on the page:**
- "Is it free?"
- "Is my customer's data safe?" (Share links carry only the spec, never images or personal data. This is already true; see `ExportPanel.tsx:36`.)
- "Does the dieline match my machine?" Allowances are indicative, and the plant sets final allowances. This matches `VERIFY-LATER[DSG-40]`.
- "Will my customer see Vayu's brand?" `VERIFY-LATER[SHW-01]`, see §13.

### 1.2 Box buyers (segments S1–S5: D2C brands, small shops, e-commerce sellers, traders, exporters)

| Pain | What the page must show |
|---|---|
| Don't know the box style names (RSC, mailer, tuck-end) or the right size | The visual style picker and the "Find my box" wizard. Product size + padding → recommended inside size (fit checker). |
| Fear of ordering wrong. MOQs (often 500–5,000) make a mistake expensive. | "See it before you pay for 500." A realistic 3D preview with their logo, plus a strength verdict ("good for ~X kg, stack N high"). |
| Want a price now, not "we'll call you" | Instant indicative ₹ estimate with quantity tiers 100/500/1,000/5,000, clearly labelled indicative. |
| Their designer or printer asks for "the dieline" | The download moment: a **1:1 mm PDF** with cut, fold, glue and dimensions (Ch. 3, Ch. 9). |
| Need to show a co-founder, boss or client | Share link, WhatsApp share, 4× product shot, 360° video |
| No time, no sign-up | "No sign-up. Works on your phone." This is already true. |

**What convinces them:** a box that looks like *theirs* within 60 seconds. This is already a product rule, so the hero lets them type a size and see it live (Ch. 1).

### 1.3 Designers, agencies and students (S7, secondary)

They want a free, accurate dieline and a 3D proof to send to clients. They are served by Ch. 3 and Ch. 9; the page needs no separate chapter for them.

### 1.4 How competitors pitch, and the gap we own

| Tool | How they pitch | Gap this page fills |
|---|---|---|
| **Pacdora** (4M+ users) | Hero = three static tool cards (mockup, AI design, dieline maker). Category tiles, then feature blocks. Audience: designers. No manufacturer or business pitch on the homepage. | We pitch the **manufacturer ↔ customer loop**, which nobody shows. We also offer India specifics: ply/BF, ₹, Indian templates such as mango carton, mithai and saree, and WhatsApp. |
| **Packhelp** | Shop-first hero with an inline-icon headline. The editor gets one section ("world's easiest way…") with a 3D preview. Logo wall of big brands. | We have no logo wall (TEST-02 in the design plan), so we **prove with the process and real files** instead of logos. |
| GoVisually / Die Cut Templates | Pure dieline utilities | No 3D, no estimate, no supplier. Our "flat ↔ folded, linked" view beats them. |

**Rule:** never claim better renders than Pacdora (marketing plan §151). Compete on the workflow, not on render beauty.

### 1.5 Research → page principles

1. **Show the file, not adjectives.** The PDF, the spec sheet and the share link are the heroes. Real downloadable samples (Ch. 9).
2. **Every visual is the real tool.** Render dielines from `dielineForDesign()`, the 3D from the real rig, and loops from the tool's own recorder. No mock UI that drifts from the product.
3. **Two audiences, one story.** Same chapters, with the copy and CTAs switched by the audience toggle. No two half-pages.
4. **Prove with process, not statistics.** We have no usage stats or logos, so we never invent them. Scenario stories are labelled "Example".
5. **Trade language.** Use cut, crease/score, glue flap, FEFCO 0201, ply, flute and 1:1 mm. Add a hover glossary for buyers.
6. **One headline moment per screen.** This is the existing motion rule §8.1.

---

## 2. Design references

The three galleries (Dribbble `hero-section` tag, Unsection hero category, Supahero) show only names and thumbnails in a crawl. The patterns below come from the sites they feature, which are well-known live heroes. "Borrow" means the technique, never the look or the brand.

| Reference (gallery) | Pattern | Where we borrow it | What we don't copy |
|---|---|---|---|
| **Apple MacBook Pro / iMac** (Supahero) | Pinned, scroll-scrubbed product sequence. The object transforms while captions change at fixed beats. | **Ch. 2 The Unfold**: box → flat → dieline → PDF | Glossy black stage. Ours is paper and ink. |
| **Linear** (Supahero) | Dark hero, product UI in perspective with a soft glow, very tight type. Feature grid with tiny looping demos. | Ch. 4 bento loops. Ink-section treatment of the presentation-mode screenshot. | Gradient glow. We use one light source and a crop-mark frame. |
| **Raycast / Resend** (Supahero) | One hero object (3D) dead centre with light, minimal copy and one CTA | Ch. 10 closing hero: one live box, slow turntable | Abstract 3D objects. Ours is the real box rig. |
| **Stripe** (Supahero) | Audience segmentation; "for X / for Y" pathways in the same visual language | The **audience switch** and Ch. 6 split | Animated gradient mesh |
| **Attio / Notion** (Supahero) | Product UI with floating annotation cards that point at real UI parts | **Ch. 3 PDF anatomy** hotspots and callouts | — |
| **Calendly** "Scheduling" (Unsection) | Shows a *flow between two people* (send → pick → confirmed) as the hero | **Ch. 5 Share & approve**: maker ⇄ customer loop | Their illustration style |
| **Home "ROI Estimate"** (Unsection) | Calculator *in* the hero: the visitor types and the result updates live | **Ch. 1**: type L×W×H in the hero and the box resizes | — |
| **Podium "Control Panels"** (Unsection) | Indexed hero carousel "01 / 03" | **Ch. 7 A day with the tool**: three scenario slides | Autoplay. Ours is manual and swipeable. |
| **Pleo "Expense Cards"** (Unsection) | Physical objects floating with depth over the UI | Ch. 9 export "file cards" fanning out like a deck | — |
| **Oura "Product Introduction"** (Unsection) | Hotspots on a product with short labelled facts | Ch. 3 hotspots on the dieline | — |
| **Glide "Customer Stories"** (Unsection) | Story cards with role, situation and outcome | Ch. 7 scenarios (labelled examples, not testimonials) | Fake quotes |
| **Tesla / Rivian** (Supahero) | Full-bleed media sections, sparse type, two CTAs | Ch. 6 split hero (maker = ink, buyer = paper) | Photography. We use recordings of the tool. |
| **Dribbble trends** (tag page) | Bento grids, kinetic headline type, 3D objects, split layouts, glass cards | Bento (Ch. 4), split (Ch. 6), kinetic word swap in the H1 (Ch. 1) | Glassmorphism. It is banned except the nav (design plan §5.4). |

**House style stays.** Use the "print-production kit" from design plan §4.3: dieline strokes (solid = cut, dashed = crease), crop marks, registration target, mono spec labels, flute wave, paper grain. Use Clash Display, Satoshi and Geist Mono, and the paper/ink/kraft/green tokens. This page is where that visual language is *literally true*, because the dieline motif becomes the product.

---

## 3. Page concept and structure

### 3.1 Big idea: "Every box starts flat." [DRAFT COPY]

It continues the site concept "Built flat. Ships strong." The page follows one example box, a branded kraft mailer for a fictional "Your Brand" logo placeholder, from idea to approved proof.

### 3.2 Chapters and rhythm

| # | Chapter | Theme | Headline moment | Pinned? |
|---|---|---|---|---|
| 1 | **Hero: Design a box in 60 s** | PAPER | Type a size and the 3D box resizes live | No |
| 2 | **The Unfold** | PAPER → INK | Sealed box unfolds into the dieline and the dieline draws itself | **Yes, +200vh desktop** |
| 3 | **Anatomy of your PDF** | INK | Hover a panel on the dieline and it lights on the 3D box | No |
| 4 | **Make it yours** | PAPER | Bento grid of looping feature demos | No |
| 5 | **Share it. Get it approved.** | KRAFT-TINT | Maker ⇄ customer loop animates step by step | **Yes, +120vh desktop** |
| 6 | **Built for both sides of the order** | INK / PAPER split | Split screen wipes as you choose a side | No |
| 7 | **A day with the tool** | PAPER | 01 / 03 scenario slides | No |
| 8 | **Before vs after** | PAPER | Drag the slider from "the old way" to "with the designer" | No |
| 9 | **What you take away** | INK | Export cards fan out; download real sample files | No |
| 10 | **Your next box starts flat** (+ FAQ) | PAPER → INK footer | One live box on a slow turntable, two CTAs | No |

Total pinned scroll is at most 320vh on desktop. Each pin has a visible "Skip animation" link (motion rule §8.1.3).

### 3.3 Persistent UI

- **Chapter rail** (desktop ≥ 1024 px): a fixed left column with mono labels `01 DESIGN · 02 UNFOLD · 03 DIELINE · 04 CUSTOMISE · 05 SHARE · 06 WHO · 07 DAY · 08 COMPARE · 09 EXPORTS · 10 START`. A thin progress line runs between them, and clicking jumps to that chapter. On mobile it becomes a top progress bar with the current chapter name.
- **Audience switch**: a segmented control in the sticky nav, `I buy boxes | I make boxes`.
  - Default: buyer.
  - Read `?for=maker`, then remember the choice per viewer in localStorage, wrapped in try/catch.
  - It swaps copy and CTA variants per chapter with a 180 ms cross-fade.
  - It never hides content. Maker-only chapters stay visible to buyers.
  - Copy lives in one content file, `src/content/designerShowcase.ts`, as `{ buyer, maker }` pairs.
- **Sticky CTA bar** (mobile only, after Ch. 1): `Open the designer` plus a WhatsApp icon. It hides while a pin is active.

---

## 4. Chapter blueprints

Each chapter lists:
- **Goal**, **Copy** [DRAFT COPY] for the buyer variant and the maker variant
- **Visual**, **Motion** (desktop / mobile / reduced motion)
- **Data source**, **CTA**, **Event**

### Ch. 1: Hero, "Design a box in 60 seconds"

**Goal:** first success in the hero itself. The visitor sees a box change because of what *they* typed.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ⌜ 01 — DESIGN                                    [I buy boxes | I make boxes] ⌝│
│                                                                              │
│  Design your box.                         ┌──────────────────────────────┐   │
│  See it [fold ▾] in 3D.                   │                              │   │
│  Download the dieline.                    │     live 3D mailer box       │   │
│                                           │     (turntable, your size)   │   │
│  Type a size, see your box, get the       │   ┌ dieline ghost behind ┐   │   │
│  1:1 die-cut PDF. Free, no sign-up.       │   └ in hairline strokes ─┘   │   │
│                                           └──────────────────────────────┘   │
│  ┌ L 300 ┐ × ┌ W 200 ┐ × ┌ H 100 ┐ [mm▾]   ◉ Mailer ○ Shipping ○ Gift ○ Pizza│
│  [ Design your box — free → ]  [ I make boxes: see how → ]                    │
│  NO SIGN-UP · 1:1 MM DIELINE PDF · INDICATIVE ₹ PRICE · WORKS ON PHONE       │
│ ⌞                                                                          ⌟ │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Copy (buyer):** H1 "Design your box. See it fold in 3D. Download the dieline." The word "fold" cycles through **fold → open → ship**. This is a kinetic word swap, but the H1 itself is static text for LCP; only the swapped word animates. Sub: "Type a size, see your box, get the 1:1 die-cut PDF. Free, no sign-up."
- **Copy (maker):** H1 "Show customers their box before you cut a sample." Sub: "A free 3D designer for your sales meetings, your website and your proofs."
- **Visual:** the live 3D box from the slim `BoxRig` (reuse `src/components/home/hero/HeroCanvas.tsx`). Behind it, the matching dieline is drawn as a faint ghost SVG, generated by `dielineForDesign()` for the same size. The size inputs and four style chips sit under the copy (the Home "ROI estimate" pattern).
- **Motion:**
  - *Desktop/medium tier:* on load the box is sealed and does one slow 20° orbit. Typing a size animates the box dimensions over 280 ms with `ease-fold`. The ghost dieline re-draws (stroke-dashoffset, 480 ms). Changing the style chip swaps the rig with a quick fold-out/fold-in.
  - *Low tier / no WebGL:* the SVG poster (`Posters.tsx`) shows the box, and the inputs still update the dieline SVG. The 3D is never downloaded on low tier.
  - *Reduced motion:* instant size changes, no orbit.
- **CTA:**
  - Primary: `Design your box — free` → `/box-designer?style=<chip>&l=&w=&h=` (cm, the existing deep-link format). It carries the size the visitor typed, so their work isn't lost.
  - Secondary: `I make boxes: see how` sets the switch to maker and scrolls to Ch. 5.
- **Data:** `DIMENSION_LIMITS`, `parseEmbedParams` rules for range-checking, and `units.ts` for mm/cm/inch.
- **Events:** `showcase_hero_size_change` (style and unit only), `showcase_cta_click {chapter:1, variant}`.

### Ch. 2: "The Unfold" (signature moment)

**Goal:** make "where to fold" and "die-cut dimensions" *physically obvious*. This is the chapter people remember and share.

**Desktop timeline (pinned +200vh; the scroll progress p maps to the stage):**

| p | 3D / SVG stage | Caption (mono index + line) |
|---|---|---|
| 0.00–0.15 | Sealed branded mailer, hero angle. Tape strip peels off. | `02.1 YOUR BOX, SEALED` |
| 0.15–0.40 | Lid opens, then flaps open (fold u 1.0 → 0.35, the reverse of the home fold) | `02.2 OPEN EVERY FLAP` |
| 0.40–0.60 | Walls unfold flat onto the ground plane. The camera tilts to top-down orthographic-like (FOV eases from 35° to 15°). | `02.3 FLAT: THIS IS THE BLANK` |
| 0.60–0.75 | The 3D blank cross-fades into the **SVG dieline** at the same screen position. Cut lines draw in solid ink, then score lines draw in dashed red. | `02.4 SOLID = CUT · DASHED = FOLD` |
| 0.75–0.90 | Dimension callouts snap in one by one: panel widths L, W, L, W; height; flap depth; glue flap; overall blank size. Mono labels, tabular numbers. | `02.5 EVERY PANEL, MEASURED IN MM` |
| 0.90–1.00 | The dieline shrinks into an A-series page frame with crop marks and the legend footer. It becomes the "PDF". A `Download this PDF` button appears. | `02.6 YOUR 1:1 DIE-CUT PDF` |

- **Theme:** the background floods from paper to ink around p = 0.6, as the dieline appears. This is the big contrast moment, the same technique as home S3.
- **Mobile / medium tier:** not pinned. The section becomes a **six-step stepper** (swipe or tap). Each step plays its part of the animation once over 480 ms. The 3D appears only on the medium tier; on the low tier each step shows a pre-rendered SVG frame.
- **Reduced motion:** six static frames side by side (two rows of three on desktop, a vertical list on mobile), each with its caption.
- **Data:** the stage uses the *same* design object as Ch. 1, so if the visitor typed 300×200×100 in the hero, the unfold shows *their* box and *their* dimensions. This is the "it's real" proof. The SVG comes from `dielineToSvg(dielineForDesign(design))`, with the new dimension layer from §6.
- **CTA:** `Download this PDF` runs the real `dielineToPdf` for their design in the page. jsPDF is lazy-loaded, as today. Secondary: `Open in designer`.
- **Event:** `showcase_unfold_complete`, `showcase_pdf_download {source:'unfold'}`.

### Ch. 3: "Anatomy of your PDF"

**Goal:** a buyer understands every line of the PDF. A maker sees it is production-literate.

```
┌──────────────────────────────── INK ─────────────────────────────────────────┐
│ 03 — READ YOUR DIELINE                                                       │
│ Every line on your PDF, explained.                                           │
│                                                                              │
│  ┌──────────── dieline (SVG) ─────────────┐   ┌──── 3D box (same design) ──┐ │
│  │ ┌──┬─────┬──┬─────┬┐   ① cut line       │   │                            │ │
│  │ │  │FRONT│  │BACK ││   ② fold (score)   │◀─▶│   hovered panel glows       │ │
│  │ ├┄┄┼┄┄┄┄┄┼┄┄┼┄┄┄┄┄┼┤   ③ glue flap      │   │   on the folded box         │ │
│  │ └──┴─────┴──┴─────┴┘   ④ panel size     │   └────────────────────────────┘ │
│  └──────────────────────────────────────────┘   [ Flat ⟷ Folded ] slider       │
│  ① CUT — solid black. The die cuts through the board here.                    │
│  ② FOLD — dashed red. Creased, not cut; the box folds here.                    │
│  ③ GLUE FLAP — joins the last wall to the first (manufacturer's joint).        │
│  ④ PANEL — 300 × 100 mm (inside). ⑤ FLAP DEPTH ⑥ BLANK SIZE ⑦ BOARD & SCALE    │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Hotspots (7):**
  1. Cut line
  2. Fold/score line
  3. Glue flap
  4. Panel names and sizes
  5. Flap depth
  6. Overall blank size, with a "this is the sheet the plant cuts from" note
  7. Footer legend: board spec and "Print at 100% / Actual size, never 'fit to page'"
- **Hotspot behaviour:** each is a numbered pin on the SVG. Hovering or focusing it highlights the matching lines (others dim to 30%) and shows an annotation card (the Attio/Oura pattern). The list under the figure mirrors the pins, so it works without hover. This is the accessible version too.
- **Linked flat ⟷ folded:** hovering a panel on the dieline highlights the same face on the 3D box, and the reverse. A `Flat ⟷ Folded` slider drives the fold pose.
  - It reuses the stage canvas from Ch. 2 (see §5.1), so it is not a second WebGL canvas.
  - On mobile: tap a pin, and a bottom card shows the explanation plus a small *pre-rendered* image of the highlighted face. No second canvas.
- **Maker variant copy adds:** "Allowances are indicative. Your plant sets final allowances for your flute and machine." This addresses DSG-40 honestly, and makers respect it.
- **Hover glossary:** "score", "flute", "FEFCO 0427" and "blank" get dotted underlines with tooltip definitions, reusing the blog glossary wording where it exists.
- **Event:** `showcase_hotspot {id}` (id only).

### Ch. 4: "Make it yours" (feature bento)

**Goal:** show breadth quickly. Each tile is a tiny, *real* loop of the tool doing one thing.

```
┌──────────────────────┬────────────┬────────────┐
│ 74 TEMPLATES         │ YOUR LOGO  │ BRAND      │
│ (gallery scroll loop)│ (drop-in)  │ COLOURS    │
├────────────┬─────────┴────────────┼────────────┤
│ STYLE      │ WINDOWS, HANDLES,    │ FIT        │
│ PICKER     │ VENTS (cutout loop)  │ CHECKER    │
│ FEFCO codes├────────────┬─────────┴────────────┤
│            │ STRENGTH   │ ₹ ESTIMATE · TIERS   │
│            │ "~X kg"    │ 100 / 500 / 1k / 5k  │
└────────────┴────────────┴──────────────────────┘
```

- **Tiles (9):**
  1. Templates: the count is read from `templates.ts` at build time and never hard-coded.
  2. Style picker with FEFCO codes: the count comes from the style registry.
  3. Logo/artwork upload
  4. Brand colours and brand kit
  5. Cutouts: windows, handles, vents
  6. Finish (matte/gloss) and inside print
  7. Fit checker
  8. Strength guidance
  9. Indicative ₹ estimate and quantity tiers
- **Media:**
  - 4–6 s muted looping **video recordings of the real tool** (WebM + MP4, 720p, ≤ 400 KB each). They are produced by a Playwright capture script (§5.4). They play only while in view; otherwise a poster frame shows (the existing PNGs in `public/blog-images/designer/`).
  - On the low tier and with reduced motion: posters only, and a "play" button.
- **Hover (desktop):** the tile lifts 2 px, crop marks appear (motif §4.3), and a deep link appears, e.g. "Try cutouts →" → `/box-designer?panel=cutouts`. If panel deep links don't exist yet, link to `/box-designer` only (`VERIFY-LATER[SHW-02]`).
- **Buyer vs maker:** same tiles. The maker variant changes three captions: "Quote faster" on estimate, "Answer 'will it hold?' in the meeting" on strength, and "Match their brand on the spot" on colours.
- **Event:** `showcase_bento_open {tile}`.

### Ch. 5: "Share it. Get it approved." (the loop)

**Goal:** the manufacturer's "aha". This is the daily workflow, compressed.

**Desktop pinned +120vh: five beats on a two-lane diagram.**

```
 MANUFACTURER (laptop/tablet)                         CUSTOMER (phone)
 ┌───────────────────────┐                            ┌────────────┐
 │ ① Presentation mode    │ ── ② share link ────────▶ │ ③ opens 3D │
 │   turntable, big spec  │    (chat bubble card)     │   rotates, │
 └───────────────────────┘                            │   folds    │
 ┌───────────────────────┐ ◀── ④ "approved, 1000 pcs" │            │
 │ ⑤ Spec-sheet PDF with  │                            └────────────┘
 │   ref no., date, signs │ ──▶ enquiry in Admin "Designer enquiries"
 └───────────────────────┘
```

| Beat | Visual | Caption [DRAFT COPY] |
|---|---|---|
| ① | Laptop frame with the `designer-presentation-mode.png` screenshot, upgraded to a 6 s recording | "In the meeting: full-screen 3D, arrow keys fold it." |
| ② | A link card flies along a dashed path (the dieline stroke motif) to the phone | "One link. No app, no sign-up for your customer." |
| ③ | Phone frame plays a recording of the shared design opening and rotating | "They spin it, fold it, see their logo on the right panel." |
| ④ | Reply bubble: "Looks good — 1,000 pcs?" | "Changes? Edit, send the new link. One version, not five PDFs." |
| ⑤ | Spec-sheet PDF page (`designer-spec-sheet-pdf.png`) slides up, and the signature block highlights | "Then send the proof: 3 views, full spec, dieline, approval signature." |

- **Chat visuals are generic.** Use neutral chat bubbles in site tokens. **No WhatsApp logo or UI replica.** The text may say "WhatsApp" because the share button exists, but it must not impersonate the app.
- **Buyer variant:** the lanes are relabelled **YOU → YOUR TEAM / DESIGNER → VAYU**. The story is "share with your co-founder, send the dieline to your designer, send the design to us for a price". It ends on the existing `LeadForm` flow ("Send my design to Vayu").
- **Mobile:** the lanes stack vertically. Beats reveal on scroll (no pin), one reveal per beat.
- **Reduced motion:** a static diagram with all five beats.
- **Privacy line, under the diagram:** "Share links carry only the box spec, never your images or personal data." This is true per `ExportPanel.tsx:36`. Keep it accurate if that changes.
- **Event:** `showcase_loop_complete`.

### Ch. 6: "Built for both sides of the order" (split hero)

**Goal:** an explicit pitch per audience. It is the Stripe "for X" and Tesla full-bleed pattern.

```
┌─────────────── INK: I MAKE BOXES ───────────┬──────── PAPER: I BUY BOXES ─────────┐
│ Win the order in the first meeting.          │ Get the right box the first time.   │
│ ▸ Presentation mode for client meetings      │ ▸ Find my box: product → style/size │
│ ▸ Embed the designer on your website         │ ▸ See your logo on a real 3D box    │
│ ▸ Proof PDF with approval block              │ ▸ Indicative ₹ price, 100–5,000 pcs │
│ ▸ Turntable video & 4× shots for catalogues  │ ▸ 1:1 dieline PDF for your printer  │
│ ▸ Pallet & stack view for bulk orders        │ ▸ Strength: "holds ~X kg, stack N"  │
│ [ Try presentation mode ] [ Get embed code ]  │ [ Find my box ] [ Design from scratch ]│
└──────────────────────────────────────────────┴─────────────────────────────────────┘
```

- **Motion:** the two halves start 50/50. Hovering a side (desktop) widens it to 60/40 over 280 ms. The side matching the audience switch starts at 60%. On mobile the halves stack, with the reader's side first.
- **Maker CTAs:**
  - `Try presentation mode` → `/box-designer?present=1` (`VERIFY-LATER[SHW-02]`; otherwise link to `/box-designer`).
  - `Get embed code` opens a dialog with the existing embed snippet (reuse the `designer-embed-snippet` UI) and links to blog #27.
- **Buyer CTAs:** `Find my box` → wizard (`GuidedWizard`). `Design from scratch` → `/box-designer`.
- **Embed preview:** a small live `iframe` of `/embed/box-designer?style=mailer&l=30&w=20&h=10`, loaded only on click ("Load live preview"). This keeps the one-WebGL-canvas budget.

### Ch. 7: "A day with the tool" (01 / 03 scenarios)

**Goal:** help the reader picture daily use. Uses the Podium indexed slides and Glide story cards.

- Each slide: role chip, time stamp, 3-step mini-timeline, one recording or screenshot, and an outcome line. All are labelled **"Example scenario"**. They are not testimonials.
- **Slide 01, maker:** "Sales rep at a corrugator · 10:30 client visit". Opens a template on a tablet, changes the size live in the meeting, puts presentation mode on the TV, and sends the share link plus spec sheet before leaving. *Outcome:* "Proof sent from the meeting room."
- **Slide 02, buyer:** "D2C founder · 11 pm, launching next month". Runs Find my box with a 250 g candle jar, adds logo and brand colour, checks the 500-pc estimate, and sends the design to Vayu. *Outcome:* "Price on WhatsApp next morning". The reply time is from FACT-13 (`VERIFY-LATER[SHW-03]`).
- **Slide 03, designer or trader:** "Packaging designer · client asked for a mithai box". Starts from the mithai template, downloads the dieline PDF and SVG to place artwork in their own software, and sends a 360° video for client sign-off. *Outcome:* "Artwork built on the right dieline from day one."
- **Controls:** manual arrows, swipe and keyboard; no autoplay. Progress shows as `01 / 03`. The audience switch picks the starting slide.

### Ch. 8: "Before vs after"

**Goal:** contrast the old workflow with the new one, without invented numbers.

- A **drag comparison slider** across two process strips:
  - **Before:** rough size over phone → flat PDF proof → "where is my logo?" → physical sample → revise → resend…
  - **After:** type size → 3D with logo → share link → proof PDF with signature → order.
- Each step is an icon (lucide, stroke 1.5) plus a mono label. The "before" strip uses dashed connectors that loop back, showing rework. The "after" strip is a straight line.
- **Numbers rule:**
  - Only use figures with a source on the page, e.g. "Most packaging projects budget 2–3 review rounds" with a source link.
  - Do **not** say "save 70% time".
  - Any Vayu-specific figure is `VERIFY-LATER[SHW-04]` and is omitted until confirmed.
- **Keyboard:** the slider is an `input[type=range]` with a visible label.

### Ch. 9: "What you take away" (export cards)

**Goal:** make the deliverables tangible. This is the strongest proof for both audiences.

- **Cards** fan out like a deck on enter (the Pleo floating-objects pattern). Each card shows a file icon, file type, what it's for, and **Download sample**:

| Card | Sample file (pre-generated at build from one preset design) | For |
|---|---|---|
| Dieline PDF, 1:1 mm | `showcase/sample-mailer-dieline.pdf` | Printer / die maker |
| Dieline SVG | `.svg` | Designer (Illustrator, Inkscape, CorelDRAW) |
| Spec sheet / proof PDF | `.pdf` with an approval block | Customer sign-off |
| Product shot 4× PNG | `.png` | Catalogue, listing, deck |
| Turntable / fold video | `.webm`/`.mp4` | WhatsApp status, Instagram, website |
| 3D model GLB / USDZ (AR) | `.glb` / `.usdz` | AR on phone, other 3D tools |
| Share link | copies a real link to the preset design | Anyone |

- **Sample files are generated from the real libraries by a build script** (`scripts/showcase/build-samples.mjs`, §5.4), so they always match the current output.
- **Motion:** stagger 40 ms × 7 cards (the budget allows at most 6 animating at once, so the 7th card waits). On hover the card rises and shows a thumbnail of the file's first page.
- **Event:** `showcase_sample_download {format}`.

### Ch. 10: Closing hero + FAQ

- **Closing hero:** "Your next box starts flat." [DRAFT COPY]
  - One live box, a slow turntable on paper, crop-mark frame (the Raycast/Resend single-object pattern).
  - Buyer CTA: `Design your box — free`. Maker CTA: `Book a 15-min demo` → the existing contact/lead path with a `source=showcase-maker` tag.
  - WhatsApp link via `whatsappHref` with a page-specific message.
- **FAQ** (accordion, `FAQPage` JSON-LD), 8 questions:
  1. Is it free?
  2. Do I need to sign up?
  3. Is the dieline production-ready? Answer: 1:1 mm, with cut and score marked; the plant confirms allowances for your flute.
  4. Which software opens the files?
  5. Can I put it on my website?
  6. Is my design private?
  7. Do prices include GST and delivery? Answer: indicative only; see the estimate panel.
  8. Can Vayu make the box I design?

---

## 5. Motion and 3D architecture

### 5.1 One stage canvas, many chapters

The budget is at most **one** WebGL canvas in the document (design plan §8.7). Plan:
- **`ShowcaseStage`**: a single R3F canvas in a `position: sticky` layer that spans **Ch. 1–3**. One `BoxRig` and one design object drive all three chapters:
  - Ch. 1: interactive size and style, turntable
  - Ch. 2: fold pose and camera scrubbed by GSAP ScrollTrigger
  - Ch. 3: the `Flat ⟷ Folded` slider plus face highlight (`setSelected` / `setHovered` on the rig, which already exist)
- After Ch. 3 leaves the viewport, the canvas is **disposed** (`rig.dispose()`, `gl.dispose()`).
- Ch. 10 mounts a fresh lightweight turntable canvas only when it comes within 1 viewport. It never coexists with the first one.
- The **dieline SVG layer** sits above the canvas in the same sticky container. The 3D → SVG hand-off at Ch. 2 p ≈ 0.6 lines up both through a shared orthographic projection: the camera ends top-down with a known pixel-per-mm, and the SVG `viewBox` is scaled to match.
  - A quick cross-fade (280 ms) hides any sub-pixel mismatch.
- **Shared state:** a tiny external store, like `foldStore.ts`, holding `{ design, foldU, highlightedFace, chapter }`. Both GSAP and React read it without re-renders.

### 5.2 Libraries (already installed)

| Concern | Tool |
|---|---|
| Pinned and scrubbed timelines (Ch. 2, Ch. 5) | GSAP + ScrollTrigger via `useGSAP`; `gsap.matchMedia()` for breakpoints and reduced motion |
| Smooth scroll | Lenis, fine pointer only, as on the home page |
| Reveals, tabs, switch cross-fade, cards | framer-motion (`LazyMotion`, `m`), tokens from `src/lib/motion/tokens.ts` |
| Dieline drawing | SVG `stroke-dasharray` / `stroke-dashoffset`. Score lines keep their dash pattern by animating a mask, not the dash. |
| Device tiers | `useSiteTier()`, `detectPerfTier`, `isWebGLAvailable`, `?quality=` override |

### 5.3 Tier matrix (this page)

| | High | Medium | Low / no WebGL | Reduced motion |
|---|---|---|---|---|
| Ch. 1 hero | Live 3D, orbit | Live 3D, pixel ratio ≤ 1.5, baked shadow | SVG poster + live SVG dieline | Live 3D or poster, no orbit |
| Ch. 2 | Pinned +200vh scrub | Stepper, 3D per step | Stepper, SVG frames | 6 static frames |
| Ch. 3 | Linked 3D + SVG | Linked 3D + SVG | SVG + pre-rendered face images | Same as low, no transitions |
| Ch. 4 loops | Autoplay in view | Autoplay in view | Poster + play button | Poster + play button |
| Ch. 5 | Pinned +120vh | Scroll reveals | Static diagram | Static diagram |
| Ch. 10 | Live turntable | Live turntable | Poster | Poster |

### 5.4 Real media pipeline (keeps the "no AI images" policy)

- **`scripts/showcase/capture-loops.mjs`** (Playwright):
  1. Opens `/box-designer` with a preset design.
  2. Drives each feature, using the tool's existing turntable/fold recorder where possible.
  3. Records 4–6 s clips.
  4. Exports WebM (VP9) + MP4 (H.264) at 720p, ≤ 400 KB each, plus a first-frame AVIF/PNG poster.
  5. Writes to `public/showcase/loops/`.
- **`scripts/showcase/build-samples.mjs`** (Node + the real libs): generates the Ch. 9 sample files from one preset ("Your Brand" kraft mailer 300×200×100 mm). These are dieline PDF/SVG, spec sheet PDF and a GLB, where it can run headless; otherwise capture GLB/USDZ through Playwright.
- **Posters for low tier and the six Ch. 2 frames:** SVG exports from `dielineToSvg` plus rendered stills captured by the same Playwright script.

### 5.5 Budgets

- **Performance:**
  - LCP ≤ 2.5 s on mid-range Android over 4G.
  - The H1 renders on the first frame and never starts at opacity 0.
  - Three.js chunk loads after idle on medium and high tiers only.
  - Total initial JS for the route (excluding the lazy 3D chunk) ≤ 180 KB gzip.
  - All loop videos are lazy, with `preload="none"` until near the viewport.
- **Motion:**
  - At most one scrubbed timeline active at once.
  - At most 6 elements animating at once.
  - Animate only transform, opacity, clip-path and stroke-dashoffset.
  - Every pin has a "Skip animation" link.

---

## 6. Phase 0: product changes the page depends on

The page promises "proper die-cut dimensions and where to fold". Today the PDF has cut (solid), score (dashed red), the "glue" label, the title and the legend `board | detail | cut = solid, score = dashed | scale 1:1` (`dieline.ts:222-231`, `dielineToPdf` `dieline.ts:401`).

Add the following in `dieline.ts`, with a new `kind: 'dim'` line type and labels. Keep it generic across all styles via the style registry.

1. **Panel names:** FRONT, BACK, LEFT, RIGHT, TOP FLAP, BOTTOM FLAP, LID, TUCK and GLUE FLAP, from the existing face names in `styles/faceNames.ts`. Use light grey text inside the panel.
2. **Dimension lines** with arrows and mm values:
   - each panel width along the top edge
   - wall height on the side
   - flap depth
   - glue-flap width
   - **overall blank size** (W × H of the sheet)
   Use a thin blue colour (`dim`), clearly different from cut and score. Values are in mm, with the chosen unit in brackets when it isn't mm.
3. **Legend box** in the footer: solid black = cut, dashed red = fold/score, blue = dimension. Plus "Print at 100% (Actual size). Do not 'fit to page'." and "Allowances indicative: confirm with your manufacturer" (DSG-40).
4. **A 100 mm verification bar** that people can measure with a ruler after printing. This is cheap and very convincing.
5. *(Optional, Phase 2)* **Bleed / safe-zone layer** (3 mm bleed, 5 mm safe area) as a separate toggle. No bleed exists today.
6. **Tests:**
   - dimension values equal the layout maths for every style
   - the legend and verification bar are present
   - the SVG and PDF line counts per kind
   - the codec round-trip is unchanged

Also confirm these, which pages link to (`VERIFY-LATER[SHW-02]`):
- whether deep links exist for `?present=1` and for opening a specific panel
- whether they need adding as small additive edits in `BoxDesigner.tsx`

---

## 7. Content, SEO and routing

### 7.1 Route

- **Recommended:** `/3d-box-designer`. It is keyword-rich ("3d box designer", "box design software"), distinct from the app (`/box-designer`) and avoids the `/box-designer/:style` landing pattern.
- **Alternative:** `/box-designer/how-it-works`. A static segment outranks `:style` in React Router v6, but the slug is weaker.
- **Linking in:**
  - Nav: "Box Designer" becomes a small menu with *Open the designer* and *How it works*.
  - Home S7 "Order your way" designer tile, blog CTAs (`blogCtas.ts`), the `3d-box-designer-tool-free` blog post and all 18 designer landing pages ("See how it works →").
  - The designer header gets a "?" link to this page.

### 7.2 Metadata

- **Title:** "Free 3D Box Designer with Die-Cut PDF | Vayu Packaging" (≤ 60 chars) [DRAFT COPY]
- **Description:** "Design your box in 3D, see where it folds, download a 1:1 die-cut dieline PDF and share it for approval. Free, no sign-up. For brands and box manufacturers." [DRAFT COPY]
- **H1:** the Ch. 1 buyer H1, server-rendered via the existing prerender (`scripts/seo/postbuild.mjs`) with buyer copy. The maker variant is client-side only.
- **JSON-LD:**
  - `SoftwareApplication` (applicationCategory DesignApplication, `offers.price` 0, operatingSystem Web)
  - `FAQPage` (Ch. 10)
  - `BreadcrumbList`
  - `HowTo` for the five-beat flow in Ch. 5 is optional.
- **OG image:** an SVG → PNG of the dieline-to-box composition via the existing `illustrations:seo` pipeline.
- **Sitemap:** add the route. Keywords targeted: C10 (design tools) and C11 (dielines) from the keyword strategy.
- **Content rule:** every Ch. 2–3 annotation is real text in the DOM, not only canvas, so the explanation of "cut vs score vs glue flap" is indexable.

---

## 8. Conversion and lead capture

| Audience | Primary CTA | Secondary | Where it lands | Tag |
|---|---|---|---|---|
| Buyer | `Design your box — free` (carries the Ch. 1 size) | `Find my box`, `Download sample PDF` | `/box-designer?...`, wizard, sample file | `source=showcase` |
| Maker | `Book a 15-min demo` | `Get embed code`, `Try presentation mode` | Contact/lead form with role "Manufacturer / converter" and company name, posted via the existing quote/CRM path | `source=showcase-maker` |
| Both | WhatsApp | — | `whatsappHref` with a page-specific message | — |

- The maker lead form adds two optional fields: "Monthly box volume" (ranges) and "Website URL (for embed)". Validate them with zod like the existing lead schema.
- **Funnel events:**
  - `showcase_view`
  - `showcase_audience_switch {to}`
  - `showcase_chapter_view {n}`: fire once per chapter
  - the events listed per chapter in §4
  - `showcase_cta_click {chapter, cta, audience}`
  - `showcase_sample_download {format}`

  Props carry ids and enums only, never sizes typed with personal context, artwork or text (existing analytics rule).

---

## 9. Accessibility

- Every animated chapter has a complete static, readable version in DOM order. Captions are real text, not canvas.
- The canvas has `role="img"` and an `aria-label` describing the current state ("Mailer box 300 × 200 × 100 mm, unfolded flat").
- Ch. 2 announces captions through a polite live region at most once per beat.
- Hotspots are buttons in tab order, with visible focus (cyan-400 on ink, cyan-700 on paper). Annotation cards are linked via `aria-describedby`. Esc closes a card.
- The audience switch is a radio group. The comparison slider and the fold slider are native range inputs with labels.
- Videos have no audio, a pause control, and a text caption below.
- Contrast follows the token table in design plan §5.1, so **cyan never appears on paper as text**. The dimension-blue for dieline annotations must reach at least 4.5:1 on white in the PDF and on paper in the SVG.

---

## 10. Files and components

| New | Purpose |
|---|---|
| `src/pages/BoxDesignerShowcase.tsx` | Route page; assembles the chapters; lazy-loads the stage |
| `src/content/designerShowcase.ts` | All copy as `{ buyer, maker }` pairs, FAQ, scenario slides, sample file list |
| `src/components/showcase/ShowcaseStage.tsx` + `stageStore.ts` | Sticky canvas + SVG layer shared by Ch. 1–3 |
| `src/components/showcase/ChapterRail.tsx`, `AudienceSwitch.tsx`, `MobileCtaBar.tsx` | Persistent UI |
| `src/components/showcase/ch/*.tsx` | `HeroDesign`, `Unfold`, `DielineAnatomy`, `FeatureBento`, `ShareLoop`, `SplitAudience`, `DayScenarios`, `BeforeAfter`, `ExportCards`, `ClosingHero` + `ShowcaseFaq` |
| `src/components/showcase/DielineSvg.tsx` | Renders a `Dieline` as React SVG with per-line ids, for draw-on and highlight. It reuses `dielineForDesign`, so it does not duplicate the SVG string builder. |
| `src/components/showcase/LoopVideo.tsx` | In-view play/pause, poster, tier-aware |
| `scripts/showcase/capture-loops.mjs`, `build-samples.mjs` | Real media and sample files (§5.4) |
| `public/showcase/**` | Loops, posters, sample files, OG |

**Edited (small, additive):**
- `src/App.tsx` (route)
- `src/components/site/SiteNavbar.tsx` (menu)
- `src/lib/boxDesigner/dieline.ts` (Phase 0)
- `src/content/blogCtas.ts`
- designer landing component (link)
- `public/sitemap.xml` and prerender route list
- `BoxDesigner.tsx` (deep-link params, if missing)

**Reused, not rebuilt:**
- `HeroCanvas` / `BoxRig`, `Posters.tsx`, `foldStore` pattern
- `Section`, `Cta`, `CropMarks`, `FactStrip`, `StatLedger`
- motion tokens, `useSiteTier`, `useEventTracker`, `whatsappHref`
- the embed parser, the spec sheet renderer, `LeadForm`

---

## 11. Phased build

| Phase | Scope | Done when |
|---|---|---|
| **0. Product truth** | §6 PDF dimensions, panel names, legend and 100 mm bar; deep-link params | The PDF for every style shows panel sizes and blank size, with tests passing. A printed PDF's 100 mm bar measures 100 mm. |
| **1. Skeleton** | Route, content file, all 10 chapters as static, accessible sections with posters and real copy, audience switch, FAQ, SEO, prerender | The page reads well with JS off. Lighthouse SEO and a11y ≥ 95. The audience switch swaps all copy. |
| **2. Stage + signature** | `ShowcaseStage`, Ch. 1 live size, Ch. 2 Unfold, Ch. 3 linked anatomy, tiers | Typing a size in Ch. 1 shows that exact size in Ch. 2 and the downloaded PDF. Pinned scrub at 60 fps on the high tier. Stepper on mobile. Reduced-motion frames shown. |
| **3. Media + loops** | Capture script, Ch. 4 bento loops, Ch. 5 loop, Ch. 9 sample files | All media is real tool output. Each loop is ≤ 400 KB. Samples regenerate with one command. |
| **4. Polish + conversion** | Ch. 6–8 and 10 motion, maker lead fields, events, nav and blog links, OG | Funnel events fire in GA debug. The maker lead arrives in the CRM with `source=showcase-maker`. |
| **5. QA** | Real-device pass (mid-range Android, iPhone, iPad for meetings), tier overrides, screenshots at 390 px and 1440 px into `docs/3D-Model-page/` | No horizontal scroll at 320 px. LCP ≤ 2.5 s on 4G. All pins have a skip link. |

**Gate for every phase:**
- `npx tsc -p tsconfig.app.json --noEmit`
- `npx vitest run`
- `npm run build`

---

## 12. Success metrics (first 60 days)

| Metric | Target (initial, revisit after 30 days) |
|---|---|
| Showcase → designer click-through | ≥ 25% of visitors |
| Ch. 2 Unfold completion (desktop) | ≥ 50% of those who reach it |
| Sample file downloads | Track. No target until a baseline exists. |
| Maker demo / embed requests | Track, `VERIFY-LATER[SHW-05]` for target |
| Designer enquiries with `source=showcase*` | Track vs `/box-designer` direct |
| Organic: impressions for C10/C11 keywords | Up vs the current baseline in `seo:report` |

---

## 13. Open questions (defaults used; none block the build)

| ID | Question | Default to build with |
|---|---|---|
| SHW-01 | What do we offer other manufacturers? Free embed with "Powered by Vayu" credit, or white-label? (Marketing plan MKT-01: they may be partners, not competitors.) | Free embed **with** credit. "White-label on request" text in the maker FAQ. |
| SHW-02 | Do `?present=1` and panel deep links exist? | Add them in Phase 0. Until then, link to `/box-designer`. |
| SHW-03 | Real reply time for designer enquiries | FACT-13 "within 2 working hours", Mon–Sat |
| SHW-04 | Any measured before/after figures (sample rounds saved, days to approval)? | Omit numbers. Use only sourced industry statements. |
| SHW-05 | Is there a sales capacity for maker demos? | "Book a 15-min demo" → existing lead path, WhatsApp fallback |
| SHW-06 | Example brand on the hero box | Neutral "Your Brand" mark plus the Vayu leaf on the inside flap. No real third-party brand. |
| SHW-07 | Route name | `/3d-box-designer` |

---

## 14. Risks

| Risk | Mitigation |
|---|---|
| The page over-promises "production-ready" | Phase 0 first. Allowances are labelled indicative (DSG-40). The FAQ states the plant confirms. |
| Too heavy: 3D + videos + pins | One canvas, disposed after Ch. 3. Tiers. Lazy media. Budgets enforced in review (§5.5). |
| Two audiences dilute the message | One story, switchable copy. Buyer is the default because it has the most traffic. `?for=maker` for outreach. |
| Pitching to manufacturers looks like courting competitors | Frame it as a partner tool (SHW-01). Never disparage plants. Vayu credit stays. |
| Chat visuals mistaken for real WhatsApp UI or a real customer | Generic bubbles in site tokens. "Example" labels on all scenarios. No names or photos of real people. |
| Media drifts from the product after updates | Loops and samples come from scripts and are regenerated in the release checklist. Counts are read from the code. |

---

## Sources (research for §1)

- Flat proofs hide placement problems; artwork made before the dieline is locked; outdated dieline versions; 2–3 review rounds:
  - [The Packaging Blog: why artwork problems cause delays](https://thepackagingblog-com.pages.dev/blog/09-print-artwork-files/)
  - [PageProof: packaging approval process](https://blog.pageproof.com/how-to-build-a-packaging-approval-process-that-prevents-costly-errors/)
  - [GoProof: design workflow brief to production](https://www.goproof.net/blog/packaging-design-workflow-brief-to-production)
  - [PackMojo: how to order custom printed boxes](https://packmojo.com/blog/how-to-order-custom-printed-boxes/)
  - [Packaging Digest: 7 artwork errors](https://www.packagingdigest.com/packaging-technologies/7-packaging-artwork-errors-to-avoid)
- Sample types, costs and lead times:
  - [PackMojo: why order a sample](https://packmojo.com/blog/3-reasons-why-ordering-a-custom-packaging-sample-is-important)
  - [Packwire](https://packwire.com/)
  - [Custom Box Makers FAQ](https://www.customboxmakers.com/faqs/)
  - [Retail Insider: rigid box timelines](https://retail-insider.com/articles/2026/08/the-retailers-guide-to-rigid-box-packaging-structures-timelines-and-what-to-ask-a-manufacturer/)
- MOQ as the main small-brand barrier:
  - [Packaging Digest: 3 struggles small brands have](https://www.packagingdigest.com/packaging-design/3-struggles-small-brands-have-with-packaging)
  - [How to Buy Packaging: volume](https://www.howtobuypackaging.com/packaging-volume/)
  - [noissue: MOQ meaning](https://ghost.noissue.co/moq-meaning-and-why-minimums-are-relevant-for-custom-packaging-2/)
- Indian corrugated sector structure and pressures:
  - [PrintWeek India](https://www.printweek.in/features/survival-of-corrugated-packaging-industry-at-stake-55335)
  - [KNN India](https://knnindia.co.in/news/newsdetails/sectors/others/corrugated-box-industry-seeks-relief-amid-rising-costs-production-disruptions)
  - [DC-MSME profile](https://dcmsme.gov.in/Corrugated%20Paper%20Board%20&%20Boxes%20by%20CSS%20Rao.pdf)
- Competitors:
  - [Pacdora homepage](https://www.pacdora.com/)
  - [Pacdora dieline to 3D](https://www.pacdora.com/tools/dieline-to-3d-mockup)
  - [TrustRadius: Pacdora](https://www.trustradius.com/products/pacdora/details)
  - [Packhelp homepage](https://www.packhelp.com/)
  - [Configurators auto-generate the dieline](https://configurator.uni.xyz/blogs/product-configurators-packaging-custom-boxes)
- Design galleries:
  - [Dribbble hero-section tag](https://dribbble.com/tags/hero-section)
  - [Unsection hero category](https://www.unsection.com/category/hero-section-design)
  - [Supahero](https://supahero.io/)
