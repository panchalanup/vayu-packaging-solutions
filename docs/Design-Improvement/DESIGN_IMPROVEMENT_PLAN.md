# Vayu Packaging Solutions: Website Design and UX Improvement Plan

| | |
|---|---|
| **Version** | 1.0, 6 Oct 2026 |
| **Status** | Planning only. No code has been changed. |
| **Scope** | Every public page of the marketing site. The admin portal is out of scope, except for the security issues listed in §16. |
| **Decisions already locked with the owner** | Hybrid "one-stop packaging partner" positioning · Eco-Industrial visual direction · keep the existing AI images for now, inside a swappable image-slot system · a scroll-folding 3D box as the home-page hero |
| **Written for** | The product owner (Vayu) and the developer(s) who will build it |

> **How to read this document**
> - §1–§4 cover *why* and *what*: strategy, audit, users and concept.
> - §5–§11 cover *how*: design system, page blueprints, conversion, motion, images, performance.
> - §12–§16 cover references, roadmap, metrics, owner inputs and risks.
> - **[OWNER]** means the business must confirm a fact or asset. **It never blocks the build.** Build with the existing value from §0 and mark it in code with `VERIFY-LATER` (§0.2).
> - **[DRAFT COPY]** means the wording is a proposal waiting for approval.
> - Wireframes are ASCII sketches: desktop is about 1280 px wide and mobile about 375 px.

---

## 0. Build-now policy (overrides every other "blocked on owner" statement)

**Goal: implement the design immediately.** No missing, unverified or contradictory fact blocks any phase. Where this document says an input is needed, use the default below, take images from the existing assets, and flag the spot in code so the owner can review it later.

### 0.1 Rules

1. **Never wait for an owner input.** Use the existing value from `src/constants/index.ts`, the existing pages or the table in §0.3.
2. **Contradictions are resolved by a default, not by a question.** Pick the default in §0.3, ship it, and leave a marker.
3. **Existing images are used as-is** (see §10.4), including AI images. Only skip an image if it shows a fictitious third-party brand (`h4.png`); use another image from the same folder instead.
4. **Hidden-until-real sections (S8, About gallery) are now shown** with the existing content, each carrying a marker.
5. **Everything flagged is reviewed later** by searching the repo for the marker. Removing the marker means the value is confirmed.

### 0.2 The marker

Every uncertain value, claim, image or placeholder gets a comment containing the exact token **`VERIFY-LATER`**, plus a short reason and an ID:

```tsx
// VERIFY-LATER[FACT-02]: client count conflicts with ABOUT_CONTENT (250+ vs 5,000+). Using 250+.
export const CLIENTS = '250+';
```

- In JSX use `{/* VERIFY-LATER[IMG-03]: AI image, replace with real photo */}`.
- In CSS use `/* VERIFY-LATER[BRAND-01]: ... */`.
- Data files may also carry `verify: 'FACT-02'` on the object so the UI can later list them.
- Review command: `grep -rn "VERIFY-LATER" src`.
- The marker has **no runtime effect** and nothing in the UI mentions it.

### 0.3 Default values to use now

| ID | Topic | Conflict or gap | **Default to build with** | Source |
|---|---|---|---|---|
| FACT-01 | Years in business | "5+ years" vs "over a decade" | **5+ years** | `STATS.yearsExperience` |
| FACT-02 | Client count | "250+" vs "5,000+" | **250+ happy clients** | `STATS.happyClients` |
| FACT-03 | Boxes delivered | none | **5M+** | `STATS.boxesDelivered` |
| FACT-04 | Reach | "50+ cities" / "pan-India" vs Gujarat-only pages | **50+ cities served**, with Gujarat as the home region | `STATS.citiesServed`, `Index.tsx` |
| FACT-05 | Distributor or manufacturer | Hero says distributor, gallery says facility | **"Direct mill sourcing + custom converting"**: say "we source from certified mills and supply custom boxes". Use "Vayu Packaging" without "manufacturer" or "distributor" in headlines | `WHY_VAYU` |
| FACT-06 | Made in-house vs sourced | unknown | S4 badge shows **"Sourced from vetted mills"** on boxes and **"Custom-made to order"** on printed/die-cut | `WHY_VAYU[0]` |
| FACT-07 | MOQ | none | **500 boxes** | `BUSINESS_DETAILS` |
| FACT-08 | Dispatch | none | **48 hours on standard sizes** | `BUSINESS_DETAILS` |
| FACT-09 | Warehouses | "warehouses across India" unverified | Keep the existing wording | `BUSINESS_DETAILS.dispatchDescription` |
| FACT-10 | Certificates | ISO/BIS claimed without a number | **Keep the existing ISO/BIS chips and "BIS certified"** text, no certificate numbers | `KEY_FEATURES_EXTENDED`, gallery |
| FACT-11 | Phone, WhatsApp, email | none | Phone and WhatsApp **+91 85116 58600**; email `vayu.packagingsolutions@gmail.com` | `CONTACT_INFO` |
| FACT-12 | Address | none | **Mondeal Heights, SG Highway, Ahmedabad, Gujarat 380015** | `CONTACT_INFO` |
| FACT-13 | Reply SLA / hours | none | **"Reply within 2 working hours"**, Mon–Sat 10:00–19:00 | placeholder |
| FACT-14 | GSTIN, Udyam, legal name | none | Show **legal name = Vayu Packaging Solutions**; render GSTIN and Udyam as `—` in a hidden element until supplied | placeholder |
| FACT-15 | Capacity, QC counts, sample turnaround (S6) | none | Use **"Custom sizes · 3, 5 and 7 ply"**, **"48-hour dispatch"** and **"Samples on request"** as the three data points; no invented numbers | placeholder |
| FACT-16 | Industries and recommended specs | none | `INDUSTRIES` list; spec text from `distributionUseCases` and the Finder CSV (`public/ToolData`) | existing |
| FACT-17 | Board test values (BCT/ECT/burst) | none | Show the **indicative caliper values only**; others as **"On request"** | §6 S3 |
| FACT-18 | Lead destination | none | Reuse the **existing contact-form Google Apps Script** (`GOOGLE_APPS_SCRIPT_UPDATED.js`) | existing |
| FACT-19 | Sample policy | none | **"Samples available on request"**, no price or quantity | placeholder |
| FACT-20 | Anchor price | none | **Omit** (an optional element, not a block) | — |
| FACT-21 | Copyright | hard-coded 2025 | `© {new Date().getFullYear()}` | B4 |
| TEST-01 | Testimonials | placeholder-looking | **Reuse the existing testimonials** from `src/pages/Index.tsx` and `TestimonialsSection.tsx`; show initials in place of photos | existing |
| TEST-02 | Client logos (S2) | none | **Skip the logo marquee**; S2 shows the stat ledger and the industry chips only | — |
| IMG-01 | Hero and process images | AI, garbled text | Use `hero-section/h1,h2,h3,h5` per §10.4. Keep the h3 crop. Use no caption such as "Inside Vayu" | existing |
| IMG-02 | About / gallery photos | AI facility shots | **Show `Gallery/g1…g19`** with neutral titles ("Warehouse", "Storage", "Dispatch"); drop the "G-1" badges | existing |
| IMG-03 | Product images | existing | `Products/PROD-1…6.png` | existing |
| IMG-04 | Supplies image | gap | Reuse `PROD-1.png` with a crop | existing |
| IMG-05 | Hero 3D box artwork | no approval | Logo on one face, single colour | `logo-horizontal.png` |
| BRAND-01 | Logo SVG and exact hex | PNG only | Use **the PNG** now and the sampled hexes in §5.1 | existing |
| DOM-01 | Custom domain / email | none | Keep `vercel.app` and Gmail | existing |

### 0.4 Effect on the phases

- **P0 is now a code pass, not a wait.** Apply the defaults above, add markers, and fix the garbled-text image crop. It takes less than a day and blocks nothing.
- **P1–P5 start immediately and in any order the developer likes.** Every "Owner must supply first" column in §13 and every "Needed by" in §15 is **informational only**.
- **The marker review** is a separate, later task (§15).

---

## Table of contents

0. [Build-now policy](#0-build-now-policy-overrides-every-other-blocked-on-owner-statement)
1. [Executive summary](#1-executive-summary)
2. [Current-state audit](#2-current-state-audit)
3. [Users and their first questions](#3-users-and-their-first-questions)
4. [Creative concept: "Built flat. Ships strong."](#4-creative-concept-built-flat-ships-strong)
5. [Design system](#5-design-system)
6. [Home page blueprint](#6-home-page-blueprint)
7. [Site-wide conversion system](#7-site-wide-conversion-system)
8. [Motion system](#8-motion-system)
9. [Inner pages](#9-inner-pages)
10. [Image-slot system and photography](#10-image-slot-system-and-photography)
11. [Performance, accessibility and SEO budgets](#11-performance-accessibility-and-seo-budgets)
12. [Reference library](#12-reference-library)
13. [Phased roadmap](#13-phased-roadmap)
14. [Success metrics](#14-success-metrics)
15. [Owner inputs checklist](#15-owner-inputs-checklist)
16. [Risks and mitigations](#16-risks-and-mitigations)
- [Appendix A: Audit findings mapped to this plan](#appendix-a-audit-findings-mapped-to-this-plan)
- [Appendix B: Glossary](#appendix-b-glossary)
- [Summary](#summary)

---

## 1. Executive summary

### The concept in one line

**"Built flat. Ships strong."** The site tells the life story of a box. It starts as a precisely engineered flat dieline, folds into strength, and goes out into the world ("Vayu" means wind or air).

The visual language comes from the packaging trade itself: dielines, crop marks, spec sheets and corrugated flutes. A buyer should sense *"these people really know packaging"* before reading a word. No other website looks like this, yet it is plainly the right look for this business.

### The five biggest changes

| # | Change | Why it matters to a buyer |
|---|---|---|
| 1 | **The first screen answers the buyer.** It says what we make, the minimum order (MOQ), dispatch time, the ply range and that we issue GST invoices, and offers two clear actions (Get a quote / WhatsApp us). Beside it, a 3D Vayu box folds itself up from a flat dieline. | The buyer decides within seconds whether we can supply them. Today the hero says almost nothing concrete. |
| 2 | **Proof instead of claims.** One agreed set of facts. Open labelling of what we make in-house versus what we source. Board specs taken from real geometry. Anything we cannot prove is removed. | Procurement teams distrust vague or contradictory claims. The current site contradicts itself (see §2). |
| 3 | **A distinctive brand system that matches the logo.** Paper, kraft, ink, Vayu green and air cyan. Clash Display + Satoshi + Geist Mono type. Decorative details borrowed from print production. | The current blue shadcn template looks like thousands of other sites and does not match the green/cyan logo. |
| 4 | **Ways to convert on every page.** Sticky nav, one "Get a quote" destination, a WhatsApp-first action bar on mobile, a 3-step quote form, and click tracking on every CTA. | Today the nav scrolls away, WhatsApp is buried in the footer, and "Get a Quote" goes to two different pages. |
| 5 | **Motion that explains, at 60 fps.** Two scroll-driven signature moments ("The Fold" and "Inside the Board"), quiet reveals everywhere else, tiered by device and safe for reduced-motion users. The page also becomes much lighter. | It gives the "wow" without the jank. Today's 3 MB JavaScript bundle, 2 MB+ PNG images and about 80 blur animations hurt mid-range Android phones. |

### Phases at a glance

| Phase | What ships | Effort |
|---|---|---|
| **P0** Content truth | Defaults from §0.3 applied; uncertain values marked `VERIFY-LATER` | under 1 day, no owner input needed |
| **P1** Foundations | Design tokens, fonts, route splitting, image pipeline, `Cta`, sticky nav, WhatsApp button and mobile bar, motion config, security quick wins | 5–6 days |
| **P2** Conversion | `/quote` page, 3-step form, Contact redesign, Packaging Finder fixes and hand-offs | 4–5 days |
| **P3** Home rebuild | All nine home sections, hero shown as a static poster image | 6–8 days |
| **P4** Signature motion | Live 3D fold hero, "Inside the Board" timeline, Lenis + GSAP, device tiers | 6–9 days |
| **P5** Inner pages | Product detail pages, industries, About, Locations, blog, Box Designer restyle, 404 | 8–12 days |

The 3D work comes deliberately late, in P4. It is the riskiest piece, and P3 already delivers a complete, high-converting page without it.

---

## 2. Current-state audit

### 2.1 Snapshot

- **Stack:** Vite + React 18 + TypeScript + Tailwind 3 + shadcn/ui.
  - framer-motion 12 is the only animation library actually used.
  - `gsap` is installed but never imported.
  - There is no smooth-scroll library.
- **Home page today, in order:**
  1. Hero carousel: 5 slides, auto-advancing every 5 s
  2. Stats band
  3. Video "How Vayu Packaging Works"
  4. "How It Works" timeline, which repeats the same 4 steps as the video
  5. Facility gallery
  6. Gujarat distribution (map, cities, SEO text)
  7. Quick CTA
  8. Testimonials

  Source: `src/pages/Index.tsx`.
- **Five home-section components exist but are rendered nowhere:** `AboutSection`, `ServicesSection`, `CTASection`, `ContactSection`, `TestimonialsSection`.

### 2.2 Findings

**Trust (T)**

| ID | Finding | Evidence |
|---|---|---|
| T1 | **The site cannot decide whether Vayu is a distributor or a manufacturer.** The hero says "Trusted Corrugated Box **Distributor**", while the gallery says "our **state-of-the-art facility**" and the process says "Your boxes are **manufactured**". | `src/constants/index.ts:161-167`, `src/components/FacilityGallery.tsx`, `src/components/ProcessTimeline.tsx:4-41` |
| T2 | **The numbers contradict each other.** One place says "5+ years / 250+ clients"; the About story says "founded over a decade ago / 5,000+ businesses". | `src/constants/index.ts:29-54` vs `:172-177` |
| T3 | **The imagery is AI-generated but labelled as real.** It is captioned "Inside Vayu Packaging". Hero h3 shows garbled text on the certificates. Hero h4 shows a fictional "BOXC" brand on the truck. The hero alt texts describe a cargo plane and a container ship, neither of which appears in the images. | `src/assets/hero-section/*`, `src/constants/images.ts:73-94` |
| T4 | **ISO and BIS claims have no certificate number or document.** | Gallery trust chips, `ProcessTimeline` |
| T5 | **The testimonials look like placeholders.** Generic names, hard-coded 5 stars, no photos or logos, and the same text duplicated in two files. | `src/pages/Index.tsx:238-270`, `src/components/TestimonialsSection.tsx` |
| T6 | **No client logos, capacity figures, machinery, GSTIN/Udyam number, team or founder anywhere.** | — |
| T7 | **The SEO says we sell BOPP tape, stretch film, bubble wrap and strapping, but no page shows them.** | `src/seo/metadata/pages.ts`, `src/pages/Products.tsx:66-69` |

**Hierarchy and content (H)**

| ID | Finding | Evidence |
|---|---|---|
| H1 | **Every section uses the same layout:** centred eyebrow, H2, paragraph, card grid. | All home sections |
| H2 | **"How it works" appears twice in a row** (the video section, then the timeline). | `VideoSection.tsx`, `ProcessTimeline.tsx` |
| H3 | **The home page has no product overview, industries section, MOQ or lead-time callout**, even though that data already exists in the constants. | `src/constants/index.ts:59-80` |
| H4 | **The heaviest block on the home page is mostly SEO text.** The Gujarat distribution section has a map, two cards and a CTA card. | `src/pages/Index.tsx:144-214` |
| H5 | **Two "dark" sections sit back to back, and they are not really dark** (`section-dark` is 96% lightness against a 98% page). | `src/index.css` |
| H6 | **The gallery looks unfinished.** It shows debug-style "G-1" badges and "Facility View N" titles. | `FacilityGallery.tsx:94-97`, `images.ts:208-342` |

**Conversion (C)**

| ID | Finding | Evidence |
|---|---|---|
| C1 | **The navbar is not sticky**, so every CTA scrolls out of view. | `Navbar.tsx:157` |
| C2 | **"Get a Quote" goes to two different places:** `/compare-quote` from the hero, `/contact` from the quick CTA. | `HeroSection.tsx:128`, `Index.tsx:227` |
| C3 | **WhatsApp is only a footer icon, and the phone link is hidden on mobile.** There is no floating action or bottom bar. | `Navbar.tsx:327-367`, `Footer.tsx` |
| C4 | **Eight generic CTA buttons on the home page.** "Learn More", "Our Services" and similar. | `Index.tsx` |
| C5 | **Internal links use `<a href>`, so each click reloads the whole page** and re-downloads the bundle. | `Index.tsx:205-230`, `ProcessTimeline.tsx:177-184`, most inner pages |
| C6 | **The Contact page phone and email are plain text, not tappable links.** The form has no quantity or product field and sends no analytics. | `src/pages/Contact.tsx:92-101` |
| C7 | **The Packaging Finder ignores what the Box Designer hands over, and hard-codes quantity to 50.** | `src/pages/CompareQuote.tsx:193-199`, `BoxDesigner.tsx:154-158` |

**Performance (P)**

| ID | Finding | Evidence |
|---|---|---|
| P1 | **Everything ships in one ~3 MB JavaScript chunk.** All routes, including admin and jsPDF, are imported eagerly. | `src/App.tsx:13-36`, `dist/` build (built before commit `03628ce`, so measure again) |
| P2 | **83 MB of PNG assets, at 2–2.7 MB each.** No WebP/AVIF, no `srcset`, no width/height attributes. | `src/assets/*` |
| P3 | **The hero image (the largest element on first paint) is a 2.4 MB PNG** with no preload or `fetchpriority`. Every carousel slide fetches another ~2 MB. | `HeroSection.tsx` |
| P4 | **About 80 `filter: blur()` reveals across 18 files**, plus a global `will-change` workaround. | `src/index.css:46-58` |
| P5 | **Fonts load via a render-blocking `@import`.** The body silently falls back to the system font because of a cascade bug, and Lora loads on every page. | `src/index.css:1,65-67`, `src/styles/blog.css:7` |
| P6 | **A 5.2 MB video with no poster frame. A 20 MB brochure PDF downloaded from the navbar.** | `src/assets/video/`, `public/brochures/` |
| P7 | **Unused dependencies:** `gsap` (until this plan uses it), `mapbox-gl`, embla, recharts. | `package.json` |

**Accessibility (A)**

| ID | Finding | Evidence |
|---|---|---|
| A1 | **No `prefers-reduced-motion` support for page animations.** | No `MotionConfig` / `useReducedMotion` |
| A2 | **The hero carousel auto-advances with no pause control (WCAG 2.2.2), and its 8 px dots are too small to tap.** | `HeroSection.tsx:161-174` |
| A3 | **Gallery tiles cannot be reached by keyboard, and the Tools menu opens only on hover.** | `FacilityGallery.tsx:61-68`, `Navbar.tsx:202-205` |
| A4 | **Some text fails contrast:** eyebrows on `section-dark` are about 4.3:1, and the light end of the gradient stat numbers is about 2.6:1. | `index.css` utilities |
| A5 | **Emoji are used as icons**, so screen readers announce them. | `VideoSection.tsx:131-144`, gallery chips |
| A6 | **No skip link and no `<header>` landmark.** NotFound renders outside the layout. | `Layout.tsx`, `NotFound.tsx` |
| A7 | **The table of contents is desktop-only and opens on hover only.** | `TableOfContents.tsx` |

**Brand consistency (B)**

| ID | Finding | Evidence |
|---|---|---|
| B1 | **The main colour is blue `#1A6EE6`, but the logo is green and cyan.** | `src/index.css:70-108`, `src/assets/logo-horizontal.png` |
| B2 | **Off-palette colours crept in:** a green brochure button, purple reading bar, blue/purple/green/orange blog categories, and an indigo Box Designer "mac" theme. | `Navbar.tsx:272`, `ReadingProgress.tsx:44`, `BlogCard.tsx:34-39`, `index.css:8-24` |
| B3 | **The `.glow-amber` utility is actually blue, and `section-dark` is actually light.** Misleading names. | `src/index.css` |
| B4 | **The copyright is hard-coded as "© 2025".** | `src/constants/index.ts:23` |
| B5 | **Page-level OG images point at files that do not exist.** | `src/seo/metadata/pages.ts`, `blogs.ts` |

### 2.3 Keep / fix / remove

| Keep | Fix | Remove |
|---|---|---|
| SEO components (`MetaTags`, `StructuredData`, `src/seo/*`) | Fact set (T1, T2) | Placeholder testimonials (T5) |
| The analytics engine (`useEventTracker`) | Navbar: sticky, accessible, theme-aware | "G-1" badges, "Facility View N" titles |
| 3D Box Designer engine (rig, perf tiers, WebGL fallback) | Body font bug; font loading | ISO/BIS chips until there is proof (T4) |
| Packaging Finder logic and CSV data | Finder hand-off and quantity bug (C7) | Duplicate "How it works" (H2) |
| Blog content (8 articles) | Contact links and form (C6) | 5 unused section components, `App.css`, dead Mapbox CSS |
| Product data (`images.ts:130-179`) | Image pipeline (P2, P3) | Hero carousel (replaced by The Fold) |
| Gujarat city content | Move to `/locations` | Confetti on brochure download (replace with a quiet success toast) |

---

## 3. Users and their first questions

### 3.1 Personas

| | **Priya: Procurement Manager** | **Arjun: D2C / e-commerce founder** | **Rameshbhai: MSME factory owner** | **Sunil: Warehouse and logistics manager** |
|---|---|---|---|---|
| **Works at** | FMCG or pharma plant (Sanand, Vapi, Ahmedabad) | Online brand (Surat, Ahmedabad) | Auto parts, ceramics (Morbi), engineering | 3PL warehouse or distributor |
| **Device and context** | Desktop at work, comparing 3–5 vendors in tabs | Mobile, arrives from Instagram or Google, between other tasks | Mobile, often prefers WhatsApp or a call; may prefer Gujarati | Desktop and mobile, needs standard sizes fast |
| **Needs** | Specs (ply, GSM, BF, burst), consistent quality, GST invoice, lead times, vendor credibility | Branded mailer boxes, low MOQ, quick samples, clear prices | Heavy-duty 5/7-ply, a reliable price, someone to talk to | Stock sizes, 48-hour dispatch, repeat orders |
| **Worries** | Supplier fails an audit, inconsistent batches | Too-high MOQ, ugly print, being ignored as a small buyer | Paying more than the local supplier, boxes collapsing in transit | Stock-outs, late trucks |
| **What convinces them** | Datasheets, certificates with numbers, company facts, client logos | Visual examples, the 3D designer, fast WhatsApp replies | Plain talk, local presence (Ahmedabad), visible capacity | Dispatch promise, stock list, service area |
| **Preferred channel** | Email and quote form | WhatsApp | Phone or WhatsApp | Quote form or phone |

### 3.2 The question ladder

Every home section answers exactly one of these questions, in this order:

| Moment | Buyer's question | Answered by | Must be visible |
|---|---|---|---|
| **First 5 seconds** | *What do you make, and is it for me?* | S1 hero: H1, subline, fact strip | Above the fold on desktop **and** mobile |
| | *How do I contact you?* | S1 CTAs, sticky nav, mobile action bar | Always |
| **First scroll** | *Who else trusts you?* | S2 trust bar | Within one scroll |
| | *Is your quality real?* | S3 Inside the Board | Within two scrolls |
| | *Do you have exactly what I need?* | S4 Range, S5 Industries | |
| **Deep read** | *Can you handle my volume, every month?* | S6 Dieline to Dispatch | |
| **Decision moment** | *How do I order, and what will it cost?* | S7 Order your way | |
| | *Is anyone like me happy?* | S8 Proof | |
| | *Let me talk to someone now.* | S9 Talk to us, and the CTA bar everywhere | |

### 3.3 Jobs to be done

- *When I need boxes for a new product, I want to know quickly whether this supplier can meet my spec and volume, so I can shortlist them without a call.*
- *When I'm comparing quotes, I want specs I can check (ply, flute, thickness, test values), so I can justify my choice internally.*
- *When I'm a small brand, I want to see a sample and a price before committing, so I don't get locked into a big MOQ.*
- *When I'm reordering, I want to message someone on WhatsApp and get a confirmed dispatch date.*

### 3.4 Entry points and journeys

| Entry | Lands on | Ideal path |
|---|---|---|
| Google: "corrugated box manufacturer Ahmedabad" | Home | S1 → S3 → S4 → **Get a quote** |
| Google: "5 ply box price" or "types of flute" | Blog post | Article → mid-article spec card → product detail page → quote |
| Google Business Profile | Home or Contact | Contact → WhatsApp |
| Instagram or a referral (mobile) | Home | S1 → mobile action bar → **WhatsApp** |
| Shared 3D design link | Box Designer | Designer → **Quote this design** → `/quote` pre-filled |

---

## 4. Creative concept: "Built flat. Ships strong."

### 4.1 The big idea

Every box starts life as a flat, precisely engineered sheet called a dieline. It gets its strength from layers (liners and flutes), and its purpose is to travel. The site tells that same story: **Flat → Folded → Layered → Shipped.**

The logo, a leaf "V" with a drop of water ("Vayu" is air), adds the environmental side: corrugated board is paper-based and recyclable.

### 4.2 Design principles

1. **Answer first, prove second.** Every section opens with the buyer's answer, then backs it up.
2. **Show the spec.** Use numbers, units and datasheets instead of adjectives. "≈6.6 mm double wall" beats "premium quality".
3. **Honest by design.** Made-in-house versus sourced is labelled. Illustrative images are never captioned as facts. Unverified claims never ship.
4. **Paper and precision.** Warm, tactile surfaces (paper, kraft) paired with engineering detail (hairlines, monospace labels, crop marks).
5. **Fast is a feature.** A buyer on a mid-range Android phone over 4G gets the same answers in under 2.5 s.

### 4.3 Signature visual language: the "print-production kit"

| Motif | What it is | Where it's used | Rule |
|---|---|---|---|
| **Dieline strokes** | Solid line = cut, dashed line = crease (the real industry convention) | Hero poster, card hover states, section dividers, the 404 page | Lines are 1 px on paper and 1.5 px on ink, never thicker |
| **Crop marks ⌜ ⌝ ⌞ ⌟** | Corner marks used on print sheets | Frame the hero, featured images, and cards on hover | Decorative only (`aria-hidden`); appear on hover or reveal |
| **Registration target ⊕** | Printers' alignment mark | Small loading indicator; section index bullet | At most one per viewport |
| **Monospace spec labels** | `PLY · FLUTE · CALIPER` in Geist Mono, uppercase, tracking 0.08em | Section indexes ("02 — STRENGTH"), datasheets, fact strip | Always a real label paired with a value, never decoration only |
| **Flute wave** | The sine-wave profile of corrugated board | Section dividers, Inside the Board, the loader | Drawn with SVG stroke animation, once |
| **Colour bar** | A small strip of brand-colour chips, like the CMYK bar on a print proof | Footer and the Box Designer header | Only in those two places |
| **Paper grain** | Static noise texture at 3–4% opacity | Paper and kraft backgrounds | A tiny tiled image (≤ 6 KB), never an animated filter |

### 4.4 Tone of voice

- Plain, confident and specific. *"Dispatch in 48 hours on stock sizes"*, not *"lightning-fast delivery"*.
- Numbers use units and Indian formatting: ₹12.40/box, 1,00,000 boxes/month **[OWNER]**.
- Superlatives ("best", "leading", "No. 1") are banned unless they can be backed up.
- Second person: *"Tell us what you ship."*
- Gujarati and Hindi versions are a possible later phase, not in this scope.

### 4.5 Light and dark rhythm on the home page

```
S1 Hero ........... PAPER   (warm off-white, kraft grain)
S2 Trust bar ...... PAPER   (hairline divided)
S3 Inside Board ... INK     (ink spreads from the box edge, the big contrast moment)
S4 Range .......... PAPER
S5 Industries ..... KRAFT-TINT (paper-200)
S6 Dispatch ....... PAPER
S7 Order your way . PAPER with one INK tile (3D Designer)
S8 Proof .......... KRAFT-TINT
S9 Talk to us ..... INK
Footer ............ INK (deeper, ink-950)
```

---

## 5. Design system

### 5.1 Colour tokens

All contrast ratios below were calculated with the WCAG 2.x relative-luminance formula. "AA" means at least 4.5:1 for normal text; "AA-large" means at least 3:1 for text 24 px and up, or 18.66 px bold and up.

| Token | Hex | Role | Contrast | Verdict |
|---|---|---|---|---|
| `paper-50` | `#FBF8F3` | Page background | — | — |
| `paper-100` | `#F4EFE6` | Alternate section, cards on kraft | — | — |
| `paper-200` | `#E9E1D3` | Kraft-tint sections, input fills | — | — |
| `kraft-300` | `#D9BB91` | Kraft panels, illustration | Ink on it: 9.73:1 | AA |
| `kraft-400` | `#C49A6C` | Kraft accents, illustration | On paper-50: 2.42:1 | **Decorative only**, never text on paper |
| `kraft-700` | `#8A6440` | Kraft-coloured text and labels on paper | On paper-50: 4.98:1 · on paper-100: 4.61:1 | AA |
| `ink-950` | `#0A120D` | Footer | — | — |
| `ink-900` | `#0F1A14` | Main text; dark sections | On paper-50: 16.83:1 · on paper-200: 13.73:1 | AAA |
| `ink-800` | `#17231C` | Cards on ink | Muted paper text on it: 7.58:1 | AA |
| `ink-500` | `#4A5A50` | Muted text on paper | On paper-50: 6.91:1 · on paper-100: 6.39:1 | AA |
| `paper-muted` | `#A9B4AC` | Muted text on ink | On ink-900: 8.33:1 | AAA |
| `green-400` | `#3DBA5A` | Accent text, buttons **on ink** | On ink-900: 7.10:1 (ink text on it: 7.10:1) | AAA |
| `green-500` | `#2E9B47` | Logo green: large headings, illustration | On paper-50: 3.36:1 | **AA-large / decorative only** |
| `green-600` | `#23803A` | **Primary button** (white text); green text on paper | White on it: 4.98:1 · on paper-50: 4.70:1 | AA |
| `green-700` | `#1B6A2F` | Primary hover and pressed | White on it: 6.67:1 | AA |
| `cyan-400` | `#1FB5E0` | "Air" accent and focus ring **on ink** | On ink-900: 7.42:1 · on paper-50: 2.27:1 | AAA on ink; **never on paper** |
| `cyan-700` | `#066A8D` | Links and focus ring **on paper** | On paper-50: 5.74:1 · 100: 5.31:1 · 200: 4.68:1 | AA |
| `warning-700` | `#9A5B13` | Warnings | On paper-50: 5.11:1 | AA |
| `error-700` | `#B42318` | Errors | On paper-50: 6.21:1 | AA |
| `success` | = `green-600` | Success | — | AA |

**Rules**
- Exactly one accent colour does the work: **Vayu green** for actions. Cyan is a small detail only: focus rings, links, the "air" particle in the logo, and data highlights in Inside the Board.
- Every leftover colour is retired: indigo `#6b6bff`, purple `#667eea → #764ba2`, the green brochure gradient, and the blog category colours. Blog categories become kraft, ink, green or cyan **chips with icons**.
- **[OWNER]** Supply the logo as an SVG with exact brand hex values. The greens above were sampled from the PNG and may need small adjustments.

### 5.2 Mapping to the existing shadcn variables

shadcn components read HSL variables in `src/index.css`. Redefining those variables re-skins the whole component library without touching component code.

```css
/* src/index.css (illustrative). SECURITY: design tokens only. Never put secrets, endpoints or
   user data in CSS custom properties; they are publicly readable in the shipped stylesheet. */
@layer base {
  :root {
    --background: 38 50% 97%;        /* paper-50  #FBF8F3 */
    --foreground: 147 27% 8%;        /* ink-900   #0F1A14 */
    --card: 39 39% 93%;              /* paper-100 #F4EFE6 */
    --muted: 38 33% 87%;             /* paper-200 #E9E1D3 */
    --muted-foreground: 142 10% 32%; /* ink-500   #4A5A50 */
    --primary: 135 57% 32%;          /* green-600 #23803A */
    --primary-foreground: 0 0% 100%;
    --accent: 196 92% 29%;           /* cyan-700 #066A8D (links, focus) */
    --ring: 196 92% 29%;
    --border: 147 27% 8% / 0.12;     /* hairline ink at 12% */
    --radius: 0.625rem;              /* 10px */
  }
  [data-theme="ink"] {               /* applied per section, not a site-wide dark mode */
    --background: 147 27% 8%;
    --foreground: 38 41% 93%;
    --primary: 134 51% 48%;          /* green-400 #3DBA5A */
    --primary-foreground: 147 27% 8%;
    --ring: 193 76% 50%;             /* cyan-400  #1FB5E0 */
  }
}
```

Sections switch theme with `data-theme="ink"`. The navbar reads the current section's theme to switch itself (§7.1). A site-wide dark mode toggle is **not** in scope.

### 5.3 Typography

| Role | Family | Licence | Weights | Loading |
|---|---|---|---|---|
| Display and headings | **Clash Display** (Indian Type Foundry, via Fontshare) | ITF Free Font License: free for commercial and web use. **Check the licence file bundled with the download.** | 500, 600 | Self-hosted woff2, Latin subset, `font-display: swap`, **preload 600** |
| Body and UI | **Satoshi** (ITF, Fontshare) | ITF Free Font License (same check) | 400, 500, 700 | Self-hosted woff2, **preload 400** |
| Spec labels and data | **Geist Mono** (Vercel) | SIL OFL | 400, 500 | Self-hosted woff2, not preloaded |
| Long-form blog articles | **Lora** (existing) | SIL OFL | 400, 400i, 600 | **Loaded on blog routes only** |

- Remove the `@import` from `src/index.css:1` and the system-font override at `src/index.css:65-67`. Use `<link rel="preload">` in `index.html` for the two critical files.
- Total font budget: **≤ 150 KB** for the critical path.
- Turn on `font-variant-numeric: tabular-nums` for every number in a stat or spec.

**Type scale** (fluid; mobile → desktop)

| Token | Size (`clamp`) | Line height | Weight | Use |
|---|---|---|---|---|
| `display-xl` | `clamp(2.6rem, 1.4rem + 5.2vw, 5.75rem)` | 0.98 | Clash 600 | Hero H1 only |
| `display-l` | `clamp(2.1rem, 1.3rem + 3.4vw, 4rem)` | 1.02 | Clash 600 | Section statements (S3, S9) |
| `h2` | `clamp(1.75rem, 1.2rem + 2.2vw, 3rem)` | 1.08 | Clash 500 | Section headings |
| `h3` | `clamp(1.25rem, 1.05rem + 0.8vw, 1.625rem)` | 1.2 | Satoshi 700 | Card and row titles |
| `body-l` | `clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)` | 1.55 | Satoshi 400 | Lead paragraphs |
| `body` | `1rem` (16 px) | 1.6 | Satoshi 400 | Default |
| `small` | `0.875rem` | 1.5 | Satoshi 500 | Meta, helper text |
| `label` | `0.75rem` | 1.3 | Geist Mono 500, uppercase, tracking 0.08em | Section indexes, spec labels, fact strip |

- Line length: body text 60–72 characters (`max-w-[68ch]`).
- Headings never fade in letter by letter if they are the largest element on first paint (§8.3).

### 5.4 Layout, spacing and shape

- **Grid:** 12 columns, max content width **1280 px** (1440 px for full-bleed media), gutter 24 px (32 px at `xl` and above).
- **Side padding:** **16 px on mobile**, 24 px on tablet, 40 px on desktop. No horizontal scroll at 320 px.
- **Breakpoints:** Tailwind defaults (`sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536).
- **Spacing scale:** 4 pt (4, 8, 12, 16, 24, 32, 48, 64, 96, 128). Section vertical padding is `clamp(64px, 10vw, 144px)`.
- **Radius:** 6 px for inputs and chips, **10 px for buttons**, 14 px for cards and media, full pill for badges. The industrial feel calls for crisp corners, not bubbly ones.
- **Elevation:** hairline borders first (`ink / 12%`). A single soft "paper stack" shadow, `0 1px 0 ink/6%, 0 8px 24px -12px ink/18%`, only on floating UI (nav, popovers, the WhatsApp button). No glassmorphism except the frosted sticky nav.
- **Imagery shape:** 4:5 and 3:2 on paper sections; 16:9 only for video.

### 5.5 Iconography

- **lucide-react** (already installed) at stroke 1.5, 20 or 24 px. No emoji as UI icons (fixes A5).
- Custom SVG icons, drawn in the same style:
  - flute profile
  - ply stack (3, 5, 7)
  - dieline
  - pallet
  - truck

### 5.6 Component inventory

| Component | Purpose | Key states and variants | Accessibility notes |
|---|---|---|---|
| `Cta` | Every call to action; tracked; uses router `Link` for internal links | `primary`, `secondary`, `whatsapp`, `call`, `link`; sizes `md`/`lg`; loading | Visible focus ring (cyan); minimum 44×44 px touch target; external links say they open WhatsApp |
| `SectionHeader` | Mono index ("02 — STRENGTH"), H2, optional lead | `align: left` (default) / `split` | Index is real text, not an image |
| `FactStrip` | MOQ · dispatch · ply · GST chips | `paper` / `ink` | `<dl>` semantics |
| `StatLedger` | Hairline-divided rows of verified stats | Count-up on reveal | Final value always in the DOM; `aria-live` off |
| `LogoMarquee` | Client logos (with permission) | Pause on hover/focus; static grid when reduced motion | Pause button; logos have `alt` set to the company name |
| `SpecTable` | Datasheet rows (label / value / unit / note) | Compact / full | Real `<table>` with `<th scope>` |
| `MadeSourcedBadge` | "◆ Made in-house" / "◇ Sourced & QC-checked" | Two variants | Text label, not colour only |
| `ImageSlot` | Every image (see §10) | `illustrative` / `photo`; aspect per breakpoint | Required `alt`; caption blocked when the image is illustrative |
| `TabSwitcher` | Industries, ply switcher | Vertical (desktop) / chip scroller (mobile) | WAI-ARIA Tabs pattern, arrow keys |
| `QuoteForm` | 3-step quote / sample / callback | Inline / page / sheet | Labels tied to inputs, error summary, inputs never block the "Next" button |
| `WhatsAppFab` | Desktop floating WhatsApp button | Shows after 30% scroll | `aria-label` "Chat with Vayu on WhatsApp (opens WhatsApp)" |
| `MobileActionBar` | WhatsApp · Call · Get quote | Hidden on `/quote`, `/box-designer`, and while the keyboard is open | Safe-area padding; ≥ 48 px tall |
| `FaqAccordion` | FAQ with FAQPage schema | — | Radix Accordion (already installed) |
| `CropMarks`, `FluteDivider`, `DielineFrame` | Brand decorations | — | `aria-hidden="true"` |
| `Navbar` | Sticky, shrinking, theme-aware | Transparent / condensed / ink | Skip link; Tools menu opens on click and keyboard; `aria-expanded` |
| `Footer` | Mega footer with company facts | — | `<footer>` landmark; current year computed automatically (fixes B4) |

---

## 6. Home page blueprint

### 6.0 Page map

| # | Section | Theme | Buyer question | Desktop height | Pinned? | Signature motion |
|---|---|---|---|---|---|---|
| S1 | **The Fold** (hero) | Paper | What do you make? Is it for me? | 100svh + 120vh scroll | Yes (desktop, high tier) | 3D dieline → sealed box |
| S2 | **Trust bar** | Paper | Who trusts you? | ~40vh | No | Logo marquee, count-ups |
| S3 | **Inside the Board** | Ink | Is your quality real? | 100vh + 150vh scroll | Yes (desktop, high tier) | Ink floods in from the edge; layers split 3 → 5 → 7 |
| S4 | **Range Index** | Paper | Do you have what I need? | auto | No (sticky image) | Image clip-path swap |
| S5 | **Industries** | Kraft-tint | Is it right for my use case? | auto | No | Tab indicator `layoutId`, panel cross-fade |
| S6 | **Dieline to Dispatch** | Paper | Can you handle my volume? | auto | No (sticky image) | Step-driven image cross-fade |
| S7 | **Order your way** | Paper + ink tile | How do I order? What does it cost? | auto | No | Price-driver bars fill in |
| S8 | **Proof** | Kraft-tint | Is anyone like me happy? | auto | No | Quote mark draws in |
| S9 | **Talk to us** | Ink | Let me talk to someone. | auto | No | Form step slides |
| — | **Footer** | Ink-950 | Company facts | auto | No | Wordmark outline draws once |

**At most two pinned moments, both early.** Everything after S3 scrolls normally, so the page never feels as if it has taken over the user's scroll.

---

### S1: "The Fold" (hero)

**Answers:** *What do you make, and is it for me?* · **Primary CTA:** Get a quote · **Secondary:** WhatsApp us

**Desktop wireframe**

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ [Vayu logo]     Products  Industries  Tools ▾  About  Blog     ☎ Call   [Get a quote] │  nav: transparent, 72px
├──────────────────────────────────────────────────────────────────────────────────┤
│ ⌜                                                                              ⌝ │
│   CORRUGATED BOXES & PACKAGING SUPPLIES · AHMEDABAD     ┌──────────────────────┐ │
│                                                         │                      │ │
│   Corrugated boxes,                                     │   ╭─ ─ ─ ─ ─ ─ ─╮    │ │
│   engineered to your spec —                             │   │  LIVE 3D BOX  │    │ │
│   and everything you                                    │   │  flat dieline │    │ │
│   need to ship them.                                    │   │  → folds →    │    │ │
│                                                         │   │  sealed + tape│    │ │
│   3, 5 & 7-ply · printed · die-cut · food-grade —       │   ╰─ ─ ─ ─ ─ ─ ─╯    │ │
│   plus tapes, stretch film & strapping.                 │                      │ │
│   One partner, one invoice.                             │  01 ━━━━ 02 ──── 03  │ │
│                                                         │  Cut & creased to    │ │
│   [ Get a quote  → ]    ( WhatsApp us )                 │  your exact size     │ │
│                                                         └──────────────────────┘ │
│   MOQ 500 boxes │ Stock sizes in 48 hrs │ 3·5·7-ply │ GST invoice   ↓ Scroll to fold │
│ ⌞                                                       Skip animation ↓       ⌟ │
└──────────────────────────────────────────────────────────────────────────────────┘
  columns: copy = 5/12, canvas = 7/12. Crop marks frame the hero.
```

**Mobile wireframe**

```
┌─────────────────────────┐
│ [logo]          [Quote] │  56px, sticky
├─────────────────────────┤
│ BOXES & SUPPLIES · AMD  │  mono label
│ Corrugated boxes,       │
│ engineered to your      │
│ spec — and everything   │
│ to ship them.           │  display-xl ≈ 42px
│ 3/5/7-ply · printed ·   │
│ die-cut · food-grade    │
│ ┌─────────────────────┐ │
│ │  3D box / poster    │ │  ~42svh
│ │  01 Cut & creased   │ │
│ └─────────────────────┘ │
│ MOQ 500 · 48 hrs · GST  │  horizontally scrollable chips
├─────────────────────────┤
│ [WhatsApp][Call][Quote] │  MobileActionBar (fixed)
└─────────────────────────┘
```

**Content [DRAFT COPY]**
- **Eyebrow (mono):** CORRUGATED BOXES & PACKAGING SUPPLIES · AHMEDABAD
- **H1 options:**
  - **A (recommended, keyword-rich):** "Corrugated boxes, engineered to your spec — and everything you need to ship them."
  - **B:** "From flat sheet to sealed shipment. Corrugated boxes built for how you ship."
  - **C:** "Boxes that arrive the way they left."
- **Subline:** "3, 5 & 7-ply · printed · die-cut · food-grade — plus tapes, stretch film & strapping. One partner, one invoice, delivered across Gujarat and India." **[OWNER: confirm the coverage claim]**
- **Fact strip:** MOQ 500 boxes · Stock sizes dispatched in 48 hrs* · 3 / 5 / 7-ply · GST invoice
  - *Footnote:* "*Stock sizes, Ahmedabad dispatch." **[OWNER: exact scope of the 48-hour promise]**
- **Fold captions** (change as the user scrolls):
  - "01 Cut & creased to your exact size"
  - "02 Strength set by ply & flute"
  - "03 Sealed, taped & dispatched"

**Motion spec**

| Element | Trigger | Animation | Timing | Reduced motion | Low tier |
|---|---|---|---|---|---|
| H1 | First paint | **None.** It is the largest element on first paint and must render on the first frame. | — | Same | Same |
| Eyebrow, subline, CTAs, fact strip | Load | Rise 16 px + fade, staggered 40 ms | 480 ms, `ease-paper`, starts at 120 ms | Fade only, 150 ms | Fade only |
| Poster image | First paint | Static `poster-flat.avif` (the rig rendered flat, same camera as the 3D scene) | — | `poster-sealed.avif` | `poster-sealed.avif` |
| 3D canvas | After `load` and idle | Mounts behind the poster, renders its first frame, then the poster cross-fades out | 280 ms | Not loaded | **Not loaded** (Three.js never downloaded) |
| Intro fold | Canvas ready | Fold progress tweens 0 → 0.35 on its own. If the user has already scrolled, it jumps to the scroll position instead. | 1.4 s, `ease-fold` | — | — |
| Scroll fold | Scroll (pinned, +120vh) | GSAP ScrollTrigger maps scroll to `poseFromProgress(0.35 → 1)` and snaps at `FOLD_STOPS.openTop` (0.72) | `scrub: 0.6` on desktop | — | — |
| Tape strip | Progress 0.85 → 1 | A BOPP tape plane scales across the top seam, a quiet nod to the one-stop range | Scroll-linked | — | — |
| Caption stepper | At 0.30 / 0.72 / 1.0 | Caption cross-fades; progress rail fills | 280 ms | Shows the final caption | Shows all three as a list |
| "Scroll to fold" cue | Idle 2 s | Chevron nudges 4 px, twice, then stops | 2 × 600 ms | Hidden | Hidden |

**Engineering notes**
- Reuse `poseFromProgress()` and `FOLD_STOPS` from `src/lib/boxDesigner/rig/foldPose.ts:29-41`, and the `BoxRig` class from `src/lib/boxDesigner/rig/boxRig.ts:133`, in a **slim hero canvas** with no designer UI, no OrbitControls and no editing.
- Render only when progress changes (`frameloop="demand"`). Throttle rendering to 30 fps while the canvas is off-screen, and dispose of it once S3 fully covers it.
- Box art is the Vayu logo printed in one colour (green-600 on kraft) on two faces **[OWNER: approve the print artwork]**.
- The tier comes from `detectPerfTier()` + `isWebGLAvailable()` + Save-Data + reduced motion (§8.6). The existing `?quality=` override (`parseTierOverride`) stays for QA and support.
- Kill switch: a build-time flag `VITE_HERO_3D=off` serves the poster-only hero.

**Acceptance criteria**
- On mobile at 375 × 667, the H1, subline, fact strip and at least part of the box are all visible above the fold.
- The H1 is the LCP element. LCP ≤ 2.5 s on a mid-range Android over 4G (Lighthouse mobile preset).
- The "Skip animation" link moves focus to S2.

---

### S2: Trust bar

**Answers:** *Who else trusts you?* · **CTA:** none (keeps momentum)

```
DESKTOP
┌──────────────────────────────────────────────────────────────────────────────────┐
│ TRUSTED BY TEAMS ACROSS GUJARAT                                    [⏸ Pause]     │
│ ‹  LOGO   LOGO   LOGO   LOGO   LOGO   LOGO   LOGO   LOGO   LOGO   LOGO  ›  (loop)  │
│──────────────────────────────────────────────────────────────────────────────────│
│  [N]+            │  [N]+              │  [N]                │  [N]+             │
│  years supplying │  businesses served │  boxes per month    │  cities delivered │
└──────────────────────────────────────────────────────────────────────────────────┘
MOBILE: marquee (smaller logos), then a 2×2 stat ledger.
```

- **Content:** a `LogoMarquee` of 8–12 client logos, **each with written permission [OWNER]**, plus a `StatLedger` built from the **single agreed fact set [OWNER]**.
- **Fallback if no logos are cleared:**
  - industry pictograms with "Serving e-commerce, FMCG, pharma, auto…"
  - the Google Business rating and review count (if the owner has one), linked
  - "References available on request →"
- **Motion:**
  - CSS marquee at 40 s per loop, paused on hover and focus, static grid under reduced motion.
  - Count-ups run once over 1.2 s; the final value is always in the DOM.

---

### S3: "Inside the Board"

**Answers:** *Is your quality real? Which ply do I need?* · **CTA:** Which ply do I need? → Packaging Finder, pre-filled with the ply

```
DESKTOP (pinned while scrolling through 3 states)
┌──────────────────────────────── INK ─────────────────────────────────────────────┐
│ 02 — STRENGTH                                                                    │
│ Strength you can specify.                                                        │
│ Every Vayu box starts with the right board. Pick a wall — see what's inside.     │
│                                                                                  │
│  ┌──────────────────────────────────────┐   ┌───────────── DATASHEET ─────────┐  │
│  │ ════════════════════  outer liner    │   │ PLY        5-ply · double wall  │  │
│  │ ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿  B-flute 2.4mm │   │ FLUTES     B + C                │  │
│  │ ════════════════════  middle liner   │   │ CALIPER    ≈ 6.6 mm (indicative)│  │
│  │ ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿  C-flute 3.6mm │   │ BEST FOR   heavier e-com, FMCG  │  │
│  │ ════════════════════  inner liner    │   │            outers, appliances   │  │
│  └──────────────────────────────────────┘   │ BCT / ECT  [OWNER: test report] │  │
│                                             │ [Which ply do I need? →]        │  │
│   ( 3-ply )   ( 5-ply ● )   ( 7-ply )       └─────────────────────────────────┘  │
│                                                          Skip animation ↓        │
└──────────────────────────────────────────────────────────────────────────────────┘

MOBILE (not pinned)
┌─────────────────────────┐
│ 02 — STRENGTH           │
│ Strength you can        │
│ specify.                │
│ ‹ [3-ply] [5-ply] [7-ply] ›   ← scroll-snap cards, swipe
│ ┌─────────────────────┐ │
│ │ cross-section SVG   │ │
│ │ datasheet rows      │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

**Data comes from code, not guesses**

`getBoardSpec()` and `DEFAULT_PLY_FLUTES` in `src/lib/boxDesigner/boardSpecs.ts` already hold flute heights, flute pitch and caliper (liner thickness 0.2 mm; flute heights from `FLUTE_TYPES` in `src/lib/boxDesigner/constants.ts:44-50`):

| Ply | Wall | Default flutes | Caliper |
|---|---|---|---|
| 3-ply | Single | B | 2.4 + 2×0.2 = **≈ 2.8 mm** |
| 5-ply | Double | B + C | 2.4 + 3.6 + 3×0.2 = **≈ 6.6 mm** |
| 7-ply | Triple | C + B + C | 3.6 + 2.4 + 3.6 + 4×0.2 = **≈ 10.4 mm** |

- The SVG cross-section is **generated from these numbers**, so the flute wave amplitude and pitch are true to scale.
- These are indicative industry figures, and the code says so too. The datasheet labels them "indicative" until confirmed **[OWNER]**.
- **BCT, ECT, burst factor, GSM and BF rows appear only when the owner supplies lab or supplier test reports.** Until then those rows show "Test report on request →".

**Motion spec**

| Element | Trigger | Animation | Timing | Reduced motion / low / mobile |
|---|---|---|---|---|
| Section entry | Top of S3 reaches 60% of the viewport | **Ink floods in:** a circular clip-path expands from the bottom-right (where the hero box's edge sat) and the theme switches from paper to ink. A pre-rendered close-up of the sealed box corner scales 1 → 2.4 and fades out as the cross-section fades in. No WebGL is used here. | 600 ms scroll-linked | Instant theme switch; no zoom |
| Ply change | Scroll position (pinned +150vh): 3 states with snapping | Layers separate 8 px vertically with a stagger; the new flute **draws** (stroke-dashoffset) and the new liner slides in; datasheet values tick | Each step 480 ms `ease-fold` | Three cross-sections side by side, static |
| Ply buttons | Click or keyboard | Jump the timeline to that label (snapping) | 480 ms | Switch instantly |
| Datasheet numbers | Step settles | Tick up | ≤ 600 ms | Final value |

- **Tracking:** `anatomy_ply_view {ply}`, and `cta_click {id: "home.anatomy.finder", ply}`.

---

### S4: Range Index

**Answers:** *Do you have exactly what I need, and who makes it?* · **CTA per row:** Get price → (`/quote?product=…`)

```
DESKTOP
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 03 — RANGE                         One partner. Every box —                      │
│                                    and everything around it.                     │
│ ┌──────────────────────────┐                                                     │
│ │                          │  01  Corrugated shipping boxes      ◆ Made in-house  │
│ │   STICKY IMAGE SLOT      │      3·5·7-ply RSC · MOQ 500 · 5–7 days   Get price →│
│ │   (swaps per hovered /   │  ───────────────────────────────────────────────────│
│ │    focused row,          │  02  Die-cut & mailer boxes          ◆ Made in-house │
│ │    clip-path reveal)     │  ───────────────────────────────────────────────────│
│ │                          │  03  Printed & branded boxes         ◆ Made in-house │
│ │  ⌞ illustrative ⌟        │  ───────────────────────────────────────────────────│
│ └──────────────────────────┘  04  Food-grade boxes                ◇ Sourced & QC  │
│                               ───────────────────────────────────────────────────│
│                               05  Packaging supplies              ◇ Sourced & QC  │
│                                   BOPP tape · stretch film · bubble wrap · PP strap│
│                                                       View full range → /products │
└──────────────────────────────────────────────────────────────────────────────────┘
MOBILE: accordion rows; the expanded row shows its own image (4:3) and the spec chips.
(Badges and lead times above are placeholders — [OWNER] confirms per product.)
```

- **Why open labelling:**
  - The hybrid model is a strength, not something to hide.
  - Procurement will find out anyway; saying it up front builds trust.
  - "Sourced & QC-checked" tells buyers the same quality gate applies to everything.
- **Content source:** extend the product data in `src/constants/images.ts:130-179` with `madeOrSourced`, `moq`, `leadTime`, `slug` and `industries`. Add the five supplies, which are currently only in SEO metadata (T7).
- **Motion:**
  - Row hover/focus swaps the image with a clip-path inset reveal (Motion, 480 ms `ease-paper`).
  - The row underline draws from left to right (CSS, 180 ms).
  - Crop marks appear on the image corners.
  - Under reduced motion the image swaps instantly.

---

### S5: Industries switcher

**Answers:** *Is it right for my use case?* · **CTA:** Get the {industry} spec → (`/quote?industry=…`), and "Read more" → `/industries/:slug` (P5)

```
DESKTOP (kraft-tint)
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 04 — INDUSTRIES        Built for what you ship.                                  │
│ ┌────────────────┐  ┌────────────────────────────────────────────────────────┐   │
│ │▌ E-commerce    │  │ THE PROBLEM   Crushed corners and returns in courier   │   │
│ │  FMCG          │  │               networks.                                │   │
│ │  Electronics   │  │ OUR SPEC      3-ply B-flute mailer, 1-colour print     │   │
│ │  Food & Bev    │  │ WHY IT WORKS  B-flute resists crush; prints crisply    │   │
│ │  Pharma        │  │ ┌──────────────────────────────┐                       │   │
│ │  Automotive    │  │ │ image slot 16:10             │  [Get the e-com spec →]│   │
│ └────────────────┘  │ └──────────────────────────────┘                       │   │
│                     └────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────┘
MOBILE: horizontally scrolling industry chips above a single stacked panel.
```

- **Content:** reuse `INDUSTRIES` (`src/constants/index.ts:70`) and the problem/solution pairs in `distributionUseCases` (`src/pages/Index.tsx:32-45`). **[OWNER]** confirms the recommended spec per industry.
- **Motion:**
  - The active-tab bar uses Motion `layoutId` (280 ms).
  - The panel cross-fades with AnimatePresence (`mode="wait"`, 280 ms).
- **Accessibility:** WAI-ARIA Tabs pattern with arrow-key support.

---

### S6: "Dieline to Dispatch"

**Answers:** *Can you handle my volume, reliably, every month?* · **CTA:** See our capacity → `/about#capacity`

This one section **replaces** three current ones: VideoSection, ProcessTimeline and FacilityGallery.

```
DESKTOP
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 05 — HOW WE DELIVER        From dieline to dispatch.                             │
│ ┌──────────────────────────┐                                                     │
│ │                          │   01  Spec & sample                                 │
│ │   STICKY IMAGE           │       We size, spec and sample before you commit.   │
│ │   cross-fades per        │       [N] samples a week [OWNER]                    │
│ │   active step            │   ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──   │
│ │                          │   02  Board & print                                 │
│ │   ▶ Watch 60s            │       In-house corrugation & flexo print [OWNER]    │
│ │                          │   03  Convert & QC                                  │
│ └──────────────────────────┘       Die-cut, glue/stitch; checks every batch      │
│  ● ○ ○ ○  progress rail          04  Pack & dispatch                             │
│                                      Stock sizes out in 48 hrs from Ahmedabad    │
└──────────────────────────────────────────────────────────────────────────────────┘
MOBILE: steps stack; each step shows its own image (3:2) above its text.
```

- **One real number per step [OWNER]:** capacity per month, number of QC checks, dispatch time, sample turnaround.
  - **No number, no claim:** the step shows text only.
- **Hybrid honesty:** step 02 reads "Made in-house: …" and "Sourced from vetted mills: …" **[OWNER]**.
- **Video:** becomes a "Watch 60s" button that opens a lightbox and loads the video only on click.
  - Add a poster frame, and compress to ≤ 2 MB for a 720p H.264 file.
  - **Keep it only if the footage is real;** otherwise hide it until a real shoot.
- **Motion:**
  - CSS `position: sticky` image, plus an IntersectionObserver that sets the active step.
  - The image cross-fades (280 ms) and the progress rail fills.
  - **No GSAP pin**, to stay within the motion budget.
  - Under reduced motion, images swap instantly.

---

### S7: "Order your way"

**Answers:** *How do I order? What will it cost?* · **CTAs:** WhatsApp us · Find my box spec · Design in 3D

```
DESKTOP
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 06 — ORDERING        Start the way that suits you.                               │
│ ┌──────────────────┐ ┌──────────────────────┐ ┌───────────────── INK ─────────┐  │
│ │ TALK TO US       │ │ PACKAGING FINDER     │ │ 3D BOX DESIGNER                │  │
│ │ WhatsApp or call │ │ [real UI screenshot] │ │ [real designer poster]         │  │
│ │ Reply < [N] hrs  │ │ Get a spec + price   │ │ Design, preview & share — free │  │
│ │ [WhatsApp us →]  │ │ range in 2 minutes   │ │ [Design in 3D →]               │  │
│ └──────────────────┘ │ [Find my box spec →] │ └────────────────────────────────┘  │
│                      └──────────────────────┘                                    │
│ HOW AN ORDER RUNS                                                                │
│ ① Enquire  ──▶  ② Approve spec / sample  ──▶  ③ Produce or source  ──▶  ④ Dispatch │
│   same day         [N] days [OWNER]              [N] days [OWNER]        48 hrs*   │
│                                                                                  │
│ WHAT DRIVES YOUR PRICE                         MOQ 500 · GST invoice · [terms]   │
│ Ply / wall      ▇▇▇▇▇▇▇▇                                                         │
│ Board area      ▇▇▇▇▇▇▇▇▇▇                                                       │
│ Print colours   ▇▇▇▇                                                             │
│ Quantity        ▇▇▇▇▇▇  (more = lower per box)                                   │
│ [Optional, OWNER-approved: "e.g. 3-ply 10×8×6 in from ₹[X]/box at 1,000 units"]  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

- **Why:** buyers rank price as their top information need (NN/g; see §12). Showing what drives the price is honest and still useful without a public price list.
  - An optional anchor price appears only if the owner approves it, and always with a "last updated" date.
- **Tool tiles:** show the **real product UI**, Linear-style (§12), as screenshots taken from the actual Finder and Designer. This turns the free tools into proof of capability.
- **Motion:**
  - The price-driver bars grow (`scaleX`, transform only) once on reveal (480 ms, 40 ms stagger).
  - The step connectors draw.
  - Under reduced motion, everything appears at its final state.

---

### S8: Proof deep-dive (shown now with existing testimonials, marked `VERIFY-LATER[TEST-01]`; see §0)

**Answers:** *Is anyone like me happy?*

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  “                                                │  CASE SNAPSHOT               │
│   Pull-quote from a real client, ≤ 30 words,      │  Company (logo)              │
│   about a specific outcome.                       │  Problem → Spec → Result     │
│                                       ”           │  e.g. "returns down [N]%"    │
│   — Name, Role, Company  [logo]                   │  [Read the story →]          │
│──────────────────────────────────────────────────────────────────────────────────│
│  RECYCLABLE BY DESIGN   Corrugated is paper-based & recyclable · [OWNER: recycled │
│  fibre %, FSC or other certifications — only if verified]                        │
└──────────────────────────────────────────────────────────────────────────────────┘
```

- **Show only when** at least one testimonial has **written consent**, a full name and a company. A logo is preferred.
- **Sustainability:** limit to statements that are true for corrugated board in general, plus verified Vayu-specific facts.
- **Motion:** the quote mark draws in (stroke, 600 ms) and the text fades in. That's all.

---

### S9: "Talk to us"

**Answers:** *Let me talk to someone now.* · **CTAs:** the quote form, WhatsApp, Call, Email

```
DESKTOP (INK)
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 07 — TALK TO US     Tell us what you ship.                                       │
│                     We'll spec it and price it.                                  │
│ ┌──────────── QUICK QUOTE ────────────────┐   WhatsApp   Chat now           →    │
│ │ ① What   ② Where & when   ③ You          │   Call       Mon–Sat [hrs]      →    │
│ │                                          │   Email      Reply in 1 day     →    │
│ │ Product  [3-ply][5-ply][7-ply][Die-cut]  │   ─────────────────────────────────  │
│ │          [Printed][Supplies][Not sure]   │   Office: SG Highway, Ahmedabad      │
│ │ Quantity [500–1k][1–5k][5–25k][25k+]     │   Delivering to Surat, Vadodara,     │
│ │ Size     L [   ] W [   ] H [   ] mm      │   Rajkot & more → All locations      │
│ │                              [Next →]    │                                      │
│ └──────────────────────────────────────────┘                                      │
│ FAQ                                                                              │
│ ▸ What is your minimum order?   ▸ How fast can you dispatch?   ▸ Do you send samples? │
│ ▸ Do you provide GST invoices?  ▸ What are your payment terms? ▸ Can you print our logo? │
└──────────────────────────────────────────────────────────────────────────────────┘
MOBILE: contact rows first (large tap targets), then the form as a 3-step sheet, then the FAQ.
```

- The form is the shared `QuoteForm` (§7.3) in inline mode.
- **FAQ:** add FAQPage structured data **only here, where the FAQ is visible.** Remove FAQ schema from pages that don't show one (§11.5).
- The Gujarat locations content moves to `/locations`; only this one line links to it.

---

### 6.10 Footer (mega, ink-950)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ Built flat. Ships strong.                                     [Get a quote →]    │
│                                                                                  │
│ PRODUCTS         INDUSTRIES        TOOLS               COMPANY        CONTACT     │
│ 3-ply boxes      E-commerce        Packaging Finder    About          WhatsApp    │
│ 5-ply boxes      FMCG              3D Box Designer     Locations      Call        │
│ 7-ply boxes      Electronics       Brochure (PDF, ≤3MB) Blog           Email       │
│ Die-cut          Food & Bev                            Privacy        Address     │
│ Printed          Pharma                                                Hours       │
│ Supplies         Automotive                                                       │
│──────────────────────────────────────────────────────────────────────────────────│
│ GSTIN [OWNER] · Udyam [OWNER] · Certificates [only if verified]                  │
│ ■■■■■ colour bar        © {current year} Vayu Packaging Solutions                 │
│ V A Y U  (outlined, oversized wordmark, draws once)                              │
└──────────────────────────────────────────────────────────────────────────────────┘
```

- Company registration facts in the footer carry real weight with Indian B2B buyers.
- The brochure must be **compressed to ≤ 3 MB**; the current file is 20 MB.

### 6.11 What happens to the current home sections

| Current | Decision |
|---|---|
| Hero carousel (5 slides, auto-advance) | **Replaced** by S1 The Fold |
| Stats band | **Merged** into the S2 stat ledger, after the facts are agreed |
| VideoSection | **Becomes** the "Watch 60s" lightbox in S6, real footage only |
| ProcessTimeline | **Merged** into S6 (removes the duplicate, H2) |
| FacilityGallery | Images become **slots** in S4 and S6; the full gallery moves to About once real photos exist |
| Distribution (map, cities, SEO text) | **Moved** to `/locations`, with one link from S9 |
| Quick CTA | **Replaced** by S7 and S9 |
| Testimonials (placeholders) | **Removed**; S8 appears once there is real, consented proof |
| `AboutSection`, `ServicesSection`, `CTASection`, `ContactSection`, `TestimonialsSection` (unused) | **Deleted** |

---

## 7. Site-wide conversion system

### 7.1 Navbar

| State | Behaviour |
|---|---|
| **Top of the hero** | Transparent over paper, 72 px tall, logo at full size |
| **Scrolled past 24 px** | Shrinks to 56 px; frosted paper background (`backdrop-filter: blur(12px)` on the **nav only**) plus a hairline border; the shrink takes 180 ms |
| **Over an ink section** | Switches to the ink variant (reads `data-theme` from the section underneath through one IntersectionObserver) |
| **Mobile, scrolling down** | Hides by translating up −100%; reappears on scroll-up. Never hides while the menu is open. |

- **Links:** Products · Industries · Tools ▾ (Packaging Finder, 3D Box Designer) · About · Blog.
  - "Home" is dropped; the logo does that job.
  - Locations goes in the footer and in the Contact page links.
- **Right side:** phone (`xl` screens and up) · **Get a quote** (primary).
- **Tools ▾** opens on **click and keyboard** (Radix DropdownMenu or NavigationMenu, both already installed) with `aria-expanded`. Hover opening only as an extra on fine-pointer devices (fixes A3).
- Remove the infinite `animate-ping` dot, the brochure confetti and the shimmer on the call link. The brochure moves to the footer and the About page.
- A **skip link** ("Skip to content") is the first focusable element (fixes A6).

### 7.2 CTA hierarchy and naming

| Level | Label | Destination | Where it appears |
|---|---|---|---|
| **Primary** | Get a quote | `/quote` (new) with pre-fill parameters | Nav, hero, product rows, industries, footer, mobile bar |
| **Secondary** | WhatsApp us | `https://wa.me/<number>?text=<page-aware message>` | Hero, S7, S9, floating button, mobile bar |
| **Tertiary** | Find my box spec | `/compare-quote` (UI name: Packaging Finder) | S3, S7, product pages |
| **Tool** | Design in 3D | `/box-designer` (with a preset when known) | S7, product pages |
| **Utility** | Call | `tel:` | Nav (xl), mobile bar, S9, Contact |

- **One meaning per label:** "Get a quote" **always** leads to `/quote` (fixes C2).
- Generic "Learn more", "Our services" and "Start your order" buttons are dropped.
- **Pre-fill parameters** (`/quote?…`): `product`, `ply`, `qty`, `l`, `w`, `h`, `industry`, `intent` (`quote` | `sample` | `callback`), `src` (the CTA id).
  - Validate every one against an allow-list. Show them only as text, never as HTML.
- **Pre-filled WhatsApp message**, for example: *"Hi Vayu, I'm interested in 5-ply boxes (from vayu…/products/5-ply). Please share a quote."*
  - It contains only the page context: no personal data, no tracking IDs.

### 7.3 `/quote` page and `QuoteForm`

**Three steps; one component used on Home (S9), `/quote` and `/contact`.**

| Step | Fields | Notes |
|---|---|---|
| **1 · What** | Intent (Quote / Sample / Call back) · Product chips (3-ply, 5-ply, 7-ply, Die-cut, Printed, Supplies, Not sure) · Quantity chips (500–1k, 1–5k, 5–25k, 25k+, Recurring monthly) · Size L×W×H in mm (optional) · Printing (None / 1–2 colours / Full colour) | Chips, not dropdowns: faster on mobile. Size is optional, with a "Not sure — help me" toggle. |
| **2 · Where & when** | Delivery city or PIN code · Needed by (this week / 2–4 weeks / just exploring) · Notes (optional) | The PIN code allows city lookup and serviceability later |
| **3 · You** | Name · Company · Mobile (+91) with "Reply on WhatsApp" ticked by default · Email (optional) · GSTIN (optional) · Consent line linking to the privacy notice | Only name and mobile are required |

- **Success screen:** "Thanks, {name}. We'll reply on WhatsApp within {SLA} **[OWNER]**." Then **[Continue on WhatsApp]** and **[Back to home]**.
- **Mobile:** each step is a full-height sheet with a sticky "Next" button that never sits under the keyboard; progress is shown as "Step 2 of 3".
- **Validation:** inline and on blur, with an error summary at the top on submit. Use `react-hook-form` + `zod`, both already in the codebase.
- **Security** (company policy: least privilege):
  - Keep drafts in `sessionStorage` only, never `localStorage`. Clear them on submit.
  - Spam control: a hidden honeypot field and a minimum time-to-submit check (for example 3 s).
  - **Do not post straight to a Google Apps Script URL from the browser.** Route submissions through a server-side function (for example a Vercel function) that re-validates every field, rate-limits by IP, and holds the Sheet/CRM write credentials in server-side environment variables (§16).
  - Restrict the lead Sheet to named staff only.
- **Tracking:** `quote_view`, `quote_step_complete {step}`, `quote_submit {intent, product, qtyBand, src}`, `quote_error {field}`.
  - **No personal data in analytics events:** no name, phone or email.

### 7.4 WhatsApp button and mobile action bar

| | Desktop `WhatsAppFab` | Mobile `MobileActionBar` |
|---|---|---|
| **Appears** | After 30% page scroll, or immediately on inner pages | Always (fixed bottom) |
| **Contents** | 56 px round button; tooltip "Chat on WhatsApp" | WhatsApp · Call · **Get quote** (the quote button takes half the width) |
| **Hidden on** | `/quote`, `/box-designer`, while the inline form is in view | Same, plus while the keyboard is open |
| **Motion** | Enters by scaling 0.9 → 1 with a fade (180 ms); no bouncing, no pulsing | Slides up once (280 ms) |
| **Layout** | Bottom-right, 24 px offset | `env(safe-area-inset-bottom)` padding; the page gets matching bottom padding so the footer is never covered |

### 7.5 Samples

- No separate form. "Order a sample" is an **intent** on the quote form (`/quote?intent=sample&product=…`).
- It appears as a secondary CTA on product detail pages and in S7.
- **[OWNER]** Sample policy: free or paid, how many, and turnaround time.

### 7.6 The `Cta` component and the analytics event list

- Every CTA renders through `Cta`:
  - **Internal links use React Router `Link`**, which stops full page reloads (fixes C5).
  - `tel:`, `mailto:` and `wa.me` links use `<a>`, with `rel="noopener noreferrer"` on external ones.
- Required props: `id` (for example `home.hero.quote`) and `intent`. The section name comes from a `SectionContext`.
- It calls the existing `useEventTracker().trackEvent` (`src/contexts/AnalyticsContext.tsx`).
- **Lint rule:** ban raw `<a href="/...">` for internal paths (a custom ESLint `no-restricted-syntax` rule).

```ts
// Illustrative props shape. SECURITY: `href` must be an internal path or one of the allow-listed
// schemes (tel:, mailto:, https://wa.me/); never pass user-supplied URLs (prevents open redirects
// and javascript: injection). Analytics payloads must never include personal data.
type CtaIntent = 'quote' | 'whatsapp' | 'call' | 'email' | 'finder' | 'designer' | 'navigate';
interface CtaProps { id: string; intent: CtaIntent; href: string; variant?: 'primary' | 'secondary' | 'whatsapp' | 'call' | 'link'; }
```

**Event list** (extends the events that already exist: `brochure_download`, `blog_click`, `gallery_image_view`, `tool_*`, `export_*`)

| Event | Payload (no personal data) | Fired from |
|---|---|---|
| `cta_click` | `id, intent, section, page` | Every `Cta` |
| `whatsapp_click` / `call_click` / `email_click` | `id, page` | Contact links everywhere |
| `quote_view` / `quote_step_complete` / `quote_submit` / `quote_error` | `step, intent, product, qtyBand, src` | `QuoteForm` |
| `finder_start` / `finder_result` / `finder_request_quote` | `ply, category` | Packaging Finder |
| `designer_open` / `designer_share` / `designer_request_quote` | `style, ply` | Box Designer |
| `hero_fold_complete` | `tier` | S1 (fires once, when progress reaches 1) |
| `anatomy_ply_view` | `ply` | S3 |
| `scroll_depth` | `25/50/75/100` | Existing `useScrollTracking` (defined but never called; turn it on) |
| `404_hit` | `path` | NotFound |

**Fix:** `DEBUG: true` currently logs analytics in production (`src/config/analytics.ts`). Set it from `import.meta.env.DEV`.

### 7.7 Reassurance text next to CTAs

Short lines beside forms and CTAs remove last-second doubts:

- "Reply on WhatsApp within {SLA}" **[OWNER]**
- "No obligation · No spam · GST invoice"
- "MOQ 500 · Samples available" **[OWNER]**

---

## 8. Motion system

### 8.1 Principles

1. **Motion explains how packaging is made.** Folding, layering, stacking, dispatching. Never decoration for its own sake.
2. **One headline moment per screen.** Everything else stays quiet.
3. **The user stays in control of scrolling.** Scroll drives animations but its speed is never changed beyond gentle smoothing. Pinned sections have a visible "Skip animation" link.
4. **Moves like paper.** Firm, short and decisive. No bounce, no elastic, no wobble.
5. **Works without motion or JavaScript.** Content is readable in DOM order with motion off.

### 8.2 Tokens

| Token | Value | Use |
|---|---|---|
| `dur-instant` | 100 ms | Press and hover feedback |
| `dur-quick` | 180 ms | Toggles, tabs, nav shrink, underline |
| `dur-base` | 280 ms | Panel swaps, small reveals, cross-fades |
| `dur-slow` | 480 ms | Section-group reveals, ply steps |
| `dur-cinematic` | 800 ms | Hero intro only |
| `ease-paper` | `cubic-bezier(0.22, 1, 0.36, 1)` | Entrances |
| `ease-fold` | `cubic-bezier(0.65, 0, 0.35, 1)` | State changes (matches the in-out cubic used in `foldPose.ts`) |
| `ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` at 0.7× duration | Exits |
| `stagger` | 40 ms per item, at most 6 items | Lists |
| `rise` | `translateY(16px)` → 0, opacity 0 → 1 | Default reveal |
| `scrub` | `0.6` on fine-pointer devices, `true` on touch | ScrollTrigger |

Define these once (`src/lib/motion/tokens.ts` + CSS custom properties) and use them in Motion, GSAP and CSS alike.

### 8.3 Choreography rules

- **One reveal per group, not one per element.** This cuts today's ~80 reveals to about 20 (fixes P4).
- **No `filter: blur()` reveals anywhere.** They are expensive on mobile GPUs. Remove the global `will-change` workaround in `src/index.css:46-58`.
- **Order:** heading → body → media → CTA. A CTA never moves after it is visible.
- **Trigger:** when 15% of the element is visible, once only. **Nothing above the fold waits for a scroll trigger.**
- **The LCP element (the hero H1) never starts at opacity 0.**
- Count-ups take at most 1.2 s, and the real number is always in the DOM.
- **Page transitions:** remove `AnimatePresence mode="wait"` around routes, which adds about 0.8 s to every navigation today. Use a 150 ms fade, or the View Transitions API where supported. Scroll goes to the top on navigation; the back button restores the scroll position.

### 8.4 Which library does what

| Library | Responsibility | Where it is loaded |
|---|---|---|
| **Lenis** (`lenis`) | Smooth scrolling, **only** on fine-pointer devices with motion allowed. Driven from `gsap.ticker`, calling `ScrollTrigger.update` on scroll. Off on touch devices, on `/box-designer`, and inside scrollable panels (`data-lenis-prevent`). | Home chunk (deferred) |
| **GSAP + ScrollTrigger** (`gsap`, already installed; `@gsap/react` for `useGSAP` cleanup) | **Only** the S1 fold and S3 anatomy pinned/scrubbed timelines. `gsap.matchMedia()` handles breakpoints and reduced motion. | Home chunk (deferred), and only for the high and medium tiers |
| **Motion** (framer-motion 12, already installed) | Reveals, tabs (`layoutId`), panel and form-step transitions, the floating button and bottom bar. Use `LazyMotion` + `domAnimation` + `m` components to shrink the bundle, with **`<MotionConfig reducedMotion="user">` at the app root** (fixes A1). | Global (small) |
| **CSS** | Hover and focus, underlines, the marquee, sticky positioning, nav shrink. `animation-timeline: view()` only as a progressive enhancement inside `@supports`; Firefox support is still limited. | Global |
| **Three.js / R3F** (already installed) | The S1 hero canvas (slim BoxRig) and the Box Designer | Lazy chunk; never on the low tier |

**GSAP licence:** GSAP, including ScrollTrigger and the former paid plugins, has been free for commercial use since April–May 2025 after Webflow acquired it. It is *free*, not open source, so **read the GSAP Standard License once before launch** (§16).

### 8.5 Signature timeline specification

**S1: The Fold** (desktop pin +120vh on high tier, +70vh on medium)

| Scroll progress | Fold `u` | Caption | Camera | Extras |
|---|---|---|---|---|
| Intro (on its own) | 0 → 0.35 | 01 Cut & creased | 3/4 view, slow 6° orbit | Dieline strokes visible on the flat sheet |
| 0 → 0.40 | 0.35 → 0.72 (snap `openTop`) | 02 Strength set by ply & flute | Moves 10% closer | — |
| 0.40 → 0.85 | 0.72 → 1.0 (`sealed`) | 03 Sealed, taped & dispatched | Settles to a hero angle | — |
| 0.85 → 1.0 | 1.0 | (holds) | Holds | Tape strip runs across the seam; `hero_fold_complete` fires |

**S3: Inside the Board** (desktop pin +150vh)

| Label | Scroll progress | Visual | Datasheet |
|---|---|---|---|
| `enter` | 0 → 0.15 | Ink floods in; the corner close-up scales up and fades out | — |
| `ply3` | 0.15 → 0.40 | Liner · B-flute · liner | 3-ply · single wall · ≈2.8 mm |
| `ply5` | 0.40 → 0.70 | + middle liner + C-flute (draws in) | 5-ply · double wall · ≈6.6 mm |
| `ply7` | 0.70 → 1.0 | + liner + C-flute (draws in) | 7-ply · triple wall · ≈10.4 mm |

Snapping goes to each label. The ply buttons jump to labels with `scrollTo` over 480 ms.

### 8.6 Device tiers

The tier is the existing `detectPerfTier(hints)` (`src/lib/boxDesigner/perfTier.ts`) plus `isWebGLAvailable()` (`src/lib/boxDesigner/webglSupport.ts`), plus `navigator.connection.saveData` and a 2g/3g `effectiveType`, plus `prefers-reduced-motion`. QA can override it with `?quality=high|medium|low`.

| Capability | **High** (desktop, good GPU) | **Medium** (typical Android, laptops with integrated graphics) | **Low** (software rendering, ≤ 2 GB RAM, Save-Data, no WebGL) | **Reduced motion** (any device) |
|---|---|---|---|---|
| Lenis | On (fine pointer) | Off | Off | Off |
| Hero 3D | Live; pixel ratio ≤ 2; real shadows | Live; pixel ratio ≤ 1.5; **baked contact shadow** (turn shadows off in `TIER_SETTINGS.medium` for the hero) | **Poster only; Three.js never downloaded** | `poster-sealed.avif` |
| Hero pin | +120vh | +70vh | None | None |
| S3 anatomy | Pinned +150vh scrub | Not pinned; tap or swipe to change ply with 280 ms transitions | Static cards | Three static cross-sections side by side |
| Reveals | Rise + fade | Rise + fade | Fade only, 150 ms | Fade only, 150 ms |
| Marquee | 40 s CSS loop | Same | Same | Static grid |
| Count-ups | 1.2 s | 1.2 s | Final value | Final value |
| Video | Lightbox on click | Same | Same | Same, no autoplay |

### 8.7 Motion budget (enforced in code review)

- At most **one** scrubbed timeline active at any moment.
- At most **one** WebGL canvas in the document. Dispose of the hero canvas once S3 fully covers it.
- At most **six** elements animating at the same time through Motion.
- Animate only `transform` and `opacity` (plus `clip-path` for image reveals and `stroke-dashoffset` for SVG lines). **Never** animate width, height, top, left, `filter` or `box-shadow`.
- `will-change` only during an active animation, never globally.
- Every animation must have a reduced-motion version (§8.6).

### 8.8 Micro-interactions

| Element | Interaction | Spec |
|---|---|---|
| Primary button | Hover: a small folded-corner flap appears top-right (clip-path); press: scale 0.98 | 180 ms `ease-paper`; flap is decorative |
| Hero primary CTA (desktop only) | Gentle magnetic pull toward the cursor (max 6 px) | Fine pointer only; off under reduced motion |
| Text links | Underline draws left to right | 180 ms |
| Cards and images | Crop marks fade in at the corners; image scales 1 → 1.03 | 280 ms |
| Stat numbers | Count-up once | ≤ 1.2 s, tabular numbers |
| Form steps | Next/back slide 24 px with a cross-fade | 280 ms; focus moves to the step heading |
| Toasts | Slide up 8 px + fade | 180 ms (Sonner, already installed; **remove the duplicate shadcn Toaster**) |
| Loader | Registration-target ⊕ rotates 90° per step | Only for waits longer than 400 ms |
| Brochure download | Quiet success toast "Brochure downloaded (2.8 MB)" | Replaces the confetti |

**Not adopted:** custom cursors, cursor-follow effects, scroll-jacking, parallax on text, or autoplaying sound. They add little for procurement visitors and cost responsiveness (INP) and accessibility.

---

## 9. Inner pages

### 9.1 Route map (no existing URL is renamed)

| Route | Status | Purpose |
|---|---|---|
| `/` | Redesign (§6) | Home |
| `/products` | Redesign | Filterable range index |
| `/products/:slug` | **New** | Product detail and spec |
| `/services` | Redesign, same URL, renamed in the UI "Industries & Services" | Industries hub plus service capabilities |
| `/industries/:slug` | **New** | Six industry pages |
| `/quote` | **New** | The quote form page |
| `/about` | Redesign | Company, the hybrid model, capacity, facts |
| `/contact` | Redesign | Contact channels and the form |
| `/locations` | Redesign; added to the footer and `sitemap.xml` | Gujarat network (takes over the home Distribution content) |
| `/blogs`, `/blogs/:slug` | Refine | Insights |
| `/compare-quote` | Restyle, same URL; UI name "Packaging Finder" | Spec and indicative price tool |
| `/box-designer` | Restyle shell | 3D designer |
| `*` | Redesign | 404 |

### 9.2 About: "The people behind the box"

```
┌ HERO (paper) ── "Packaging partner to [N]+ Gujarat businesses since [YEAR]." ── founder slot ┐
├ OUR MODEL ── diagram:  [Made in-house: …]  +  [Sourced from vetted mills: …]  →  ONE QC GATE  →  You ┤
├ CAPACITY (#capacity) ── StatLedger: board/month · machines · shifts · dispatch radius [OWNER] ┤
├ QUALITY ── how we check (steps) · certificates with number + PDF [OWNER, only if held] ┤
├ COMPANY FACTS ── legal name · GSTIN · Udyam · address · year founded (one canonical value) ┤
├ GALLERY ── "Inside Vayu" (real photos only; hidden until the shoot) ┤
└ CTA band ── Get a quote · Download brochure (≤3 MB) ┘
```

- Resolve the "over a decade / 5,000+ businesses" story copy against the single fact set (T2).
- Motion: the model diagram's arrows draw once; everything else uses quiet reveals.

### 9.3 Products index and product detail pages

**Index:** filter chips for Ply (3/5/7) · Type (RSC, die-cut, mailer, printed, food-grade, supplies) · Industry · Made/Sourced. The result grid shows an image slot, name, badge, a key-spec line and "Get price →". Filtering is client-side over one typed content file.

**Detail page (`/products/:slug`):**

```
┌ breadcrumb ─────────────────────────────────────────────────────────────────┐
│ [image slot 4:5]        5-ply corrugated boxes          ◆ Made in-house      │
│ (thumbs)                Double-wall strength for heavier goods.              │
│                         [Get price →]  (Order a sample)  (Design in 3D)      │
│                         MOQ 500 · 5–7 days · GST invoice                     │
├ SPEC TABLE ── ply · flutes · caliper (indicative) · GSM/BF range · BCT/ECT [OWNER] · size range · print options ┤
├ CROSS-SECTION ── reuses the S3 SVG at a fixed ply ┤
├ USE CASES & INDUSTRIES ── chips → /industries/:slug ┤
├ FAQ (visible) + FAQPage schema · Downloadable spec sheet (PDF) ┤
└ RELATED ── other plies · supplies that go with it (tape, stretch film) ┘
```

- **One typed content file** (for example `src/content/products.ts`) feeds the pages, Product schema, the sitemap, the quote form options and the Box Designer presets.
  - This keeps the SEO in line with what is visible (fixes T7).
- **Supplies** get their own spec tables: width, micron, length, core and so on **[OWNER]**.

### 9.4 Services → "Industries & Services" and `/industries/:slug`

- **Hub:**
  - six industry cards (problem → spec)
  - a "What we do" row (custom sizing, printing, sampling, scheduled replenishment **[OWNER: only services actually offered]**)
  - a band linking to the tools
- **Industry page:** problem → recommended specs (links to products) → proof (a case study when available) → FAQ → CTA "Get the {industry} spec".
- Fix: Services FAQ schema is currently emitted with no visible FAQ. Show the FAQ or drop the schema.

### 9.5 Contact

- Large channel rows with **real links**:
  - `wa.me` (WhatsApp)
  - `tel:` (Call)
  - `mailto:` (Email)
  - Hours and reply time.
  - Fixes C6.
  - Also check `SOCIAL_LINKS.phone`, which currently points to WhatsApp (`src/constants/index.ts:216`).
- The shared `QuoteForm` with intent pre-set to "Call back", plus a "Get a full quote" toggle.
- A **static map image** linking to Google Maps instead of an iframe. This is faster and has no third-party cookies.
- Mobile layout: channels first, then the form, then the map.

### 9.6 Locations: "Delivering across Gujarat"

- Takes over the home Distribution content: the city list, `distributionUseCases` and the SEO paragraph.
- A **static SVG map of Gujarat** with route lines drawn from Ahmedabad once on reveal (stroke-dashoffset, 800 ms). City dots are buttons that open a city card (typical transit time **[OWNER]**, industries served).
- Add `/locations` to the footer and `public/sitemap.xml`. Fix its relative canonical URL (`src/seo/metadata/pages.ts`).
- City-specific pages only if each has genuinely unique content, to avoid "doorway page" SEO penalties.

### 9.7 Blogs and blog posts

- **Index:**
  - featured article at the top (large)
  - category chips (kraft, ink, green or cyan, with icons, not rainbow colours)
  - search (client-side)
  - Indian date format (`en-IN`)
- **Post:**
  - Lora for the body text only; headings in Clash Display.
  - Reading progress bar in green-600 (replaces the purple).
  - **Table of contents:** sticky with the active section highlighted on desktop, a collapsible "On this page" on mobile; opens on click and keyboard (fixes A7).
  - **Mid-article spec card:** for example "Need 5-ply boxes? See specs →", chosen by the article's tags.
  - Author box with the founder's name and role.
  - Fix the markdown renderer, which replaces every image with a placeholder (`BlogPost.tsx:205-222`), and check `response.ok` on the markdown fetch.
- **Build:** pre-render articles at build time so the text is in the initial HTML (helps SEO). Choose the tool in a P5 spike.

### 9.8 Packaging Finder (`/compare-quote`)

- Restyle as a **3-step wizard** (Product → Size & weight → Handling & quantity) with a progress bar and Vayu tokens. Remove the emoji and raw gray colours.
- **Fix the hand-off bugs:**
  - Read the `?l,w,h,ply,style` parameters and `location.state.boxDesign` sent by the Box Designer.
  - Use the real quantity instead of the hard-coded 50 (`CompareQuote.tsx:193-199`); default to an editable 500.
  - Fix the transport `Select` not keeping its value.
  - Remove the artificial 800 ms delay.
- **Result screen:**
  - the recommended spec
  - an **indicative** per-unit price range, labelled "Indicative · prices updated {CSV date}" **[OWNER: review the CSV every quarter]**
  - **[Request this quote]** (→ `/quote`, pre-filled), **[Send to WhatsApp]** and **[Open in 3D]**

### 9.9 Box Designer shell (`/box-designer`)

- Keep the dense editor layout. **Re-skin the "mac" indigo tokens with Vayu tokens:** ink panels, green primary, and cyan selection in place of `#6b6bff` / `#6ea8ff` (`src/index.css:8-24`).
- **Slim page header:** "← Vayu" · design name · **[Quote this design]**, always visible.
- **Hero copy:** a short H1 with "Free · no sign-up" and a "Start designing ↓" scroll cue to the tool.
- No WhatsApp button or Lenis here; the mobile action bar is hidden.
- The growth items already planned in `docs/Completed/BOX_DESIGNER_GROWTH_ROADMAP.md` (pre-filled quote, lead form, price estimate) plug into §7.3.

### 9.10 404

- Rendered **inside the normal layout**, so the nav and footer appear (fixes A6).
- **Illustration:** a flat, unfolded dieline with one flap that "didn't fold right" (static SVG with a small crease animation that respects reduced motion).
- **Copy:** "This page didn't fold right." Links: Products · Get a quote · Packaging Finder · WhatsApp us.
- `noindex`; fire `404_hit {path}` so broken links can be found and fixed.

---

## 10. Image-slot system and photography

### 10.1 Why

The owner has decided to **keep the current AI-generated images for now** and replace them with real photos later. The design must therefore:

1. make swapping trivial (one file per slot, no code changes)
2. stop illustrative images from implying facts
3. be ready for the real shoot (a shot list mapped to slot IDs)

### 10.2 Slot registry

```ts
// src/content/imageSlots.ts (illustrative shape)
// SECURITY: images are public static assets. Never place documents, signatures, IDs or customer
// data in image slots; anything in src/assets ships to every visitor. Alt text is plain text, never HTML.
export interface ImageSlot {
  id: string;                         // e.g. 'home.process.convert'
  src: string;                        // source file in src/assets (AVIF/WebP generated at build)
  alt: string;                        // describes what is actually in the image
  kind: 'illustrative' | 'photo';     // 'illustrative' = AI or stock; 'photo' = real Vayu photo
  captionAllowed: boolean;            // forced false when kind === 'illustrative'
  aspect: { base: string; md?: string; lg?: string };  // e.g. { base: '4/3', lg: '4/5' }
  focal?: { x: number; y: number };   // object-position, 0..1
  priority?: boolean;                 // true only for the LCP poster
}
```

**Rules for `illustrative` images**
- **No factual captions.** Never "Inside Vayu", "Our facility" or "Our team". Section text may say what Vayu does; the image only sets the mood.
- **Crop out any embedded text or third-party branding.** Examples: the garbled certificates in h3, the "BOXC" truck in h4 (exclude h4 entirely).
- **Alt text describes what is literally shown**, for example "Corrugated sheets feeding into a converting machine". It must not claim the scene is Vayu's.
- **Swap path:** replace the file, set `kind: 'photo'`, and optionally turn on the caption. No layout change is needed because the aspect ratio is fixed per slot.

### 10.3 Pipeline

- **Build-time conversion** with `vite-imagetools` (or a similar Vite image plugin): generate **AVIF + WebP at 480 / 768 / 1200 / 1600 px** widths, and output `<picture>` with `srcset`, `sizes`, `width` and `height` (prevents layout shift).
- **Size limits per image:**
  - hero poster ≤ 80 KB (AVIF)
  - content images ≤ 180 KB at 1200 px
  - thumbnails ≤ 40 KB
- **Loading:** `loading="lazy"` + `decoding="async"` everywhere except the LCP poster, which gets `fetchpriority="high"` and a `<link rel="preload">`.
- **Clean up the source assets:**
  - Move the 2–2.7 MB PNG masters out of `src/assets` into a `design-masters/` folder that isn't bundled (or Git LFS).
  - Delete the unreferenced `hero-packaging*.jpg` files.
  - Shrink `logo-horizontal.png` (166 KB), or better, use the **SVG logo [OWNER]**.

### 10.4 Interim mapping (current AI images → slots)

| Slot ID | Interim image | What it shows | Notes |
|---|---|---|---|
| `home.hero.poster-flat` / `-sealed` | **3D render** from BoxRig | Vayu box flat / sealed | Rendered in-house; not a photo, so no truth issue |
| `home.anatomy.corner` | 3D render | Sealed box corner close-up | For the S3 "ink flood" |
| `home.range.corrugated` | `Products/PROD-1.png` | Stack of kraft RSC boxes | Good |
| `home.range.diecut` … `home.range.foodgrade` | `Products/PROD-2…6.png` | Per product | Check each for text or branding |
| `home.range.supplies` | **Gap**: 3D render or simple still life | Tape, film, strapping | New asset needed |
| `home.process.spec` | `hero-section/h5.png` | Consultation over box samples | Illustrative; no caption |
| `home.process.convert` | `hero-section/h2.png` | Corrugated sheets on a converting line | Illustrative |
| `home.process.qc` | `hero-section/h3.png` | **Crop to hands, caliper and box**, excluding the wall certificates | Garbled certificate text must not show |
| `home.process.dispatch` | `hero-section/h1.png` | Warehouse aisle with pallets | Illustrative |
| *(excluded)* | `hero-section/h4.png` | Truck with "BOXC" branding | **Do not use**: fictitious third-party brand |
| `about.gallery.*` | `Gallery/g1…g19.png` | Warehouse and facility scenes | **Shown now** with neutral titles; mark `VERIFY-LATER[IMG-02]`, replace with real photos later |
| `industries.*` | Best-fit gallery images | Per industry | Illustrative |

### 10.5 Shot list for the real shoot (do it once and fill every slot)

| # | Slot(s) | Shot | Direction |
|---|---|---|---|
| 1 | `home.process.convert`, `about.hero` | Corrugator or converting line running, operator in frame | Wide; available light plus one fill; motion blur on the sheets is fine |
| 2 | `home.process.print` | Flexo print unit with a Vayu-printed sheet | Close-up of the ink rollers; brand green visible |
| 3 | `home.process.qc` | BCT or burst tester in use, with the reading visible | Macro on the gauge; real numbers → real proof |
| 4 | `home.anatomy.edge`, product pages | **Flute macro**: cut edge of 3-, 5- and 7-ply board | Raking side light, plain paper background, **one per ply** |
| 5 | `home.process.dispatch` | Palletised Vayu boxes being loaded onto a truck | Golden hour or clean daylight; Vayu tape visible |
| 6 | `home.range.*`, `products.*` | Product still lifes (RSC, die-cut, mailer, printed, food-grade, supplies) | Paper-50 background, 4:5 and 1:1, consistent 35° light |
| 7 | `about.founder` | Founder portrait at the plant | Natural, not posed in a suit; 4:5 |
| 8 | `about.team` | Team group (production + office) | Wide; with everyone's consent |
| 9 | `home.process.spec` | Real consultation with a sample and dieline on the table | Hands and objects; faces optional |
| 10 | Video (S6 lightbox) | 60 s "dieline to dispatch" cut | 1080p master; 720p H.264 web version ≤ 2 MB plus a poster frame |

**Consent:** get a written release from every identifiable person. Do not photograph customer-branded boxes without that customer's permission.

---

## 11. Performance, accessibility and SEO budgets

### 11.1 Budgets (Lighthouse mobile preset plus field data)

| Metric | Budget | Today (approximate) |
|---|---|---|
| LCP (75th percentile, mobile) | **≤ 2.5 s** | Hero = 2.4 MB PNG behind a 3 MB bundle → likely well over 4 s (re-measure) |
| INP | **≤ 200 ms** | Unknown (measure) |
| CLS | **≤ 0.05** | Images have no width/height → at risk |
| Home JavaScript (initial, gzipped) | **≤ 180 KB** | ~3 MB uncompressed single chunk (P1) |
| 3D hero chunk (lazy, gzipped) | **≤ 250 KB** | n/a |
| Image bytes per mobile page (initial + first two screens) | **≤ 1.2 MB** | 10+ MB |
| Fonts (critical) | **≤ 150 KB**, 2 preloads | Render-blocking `@import` |
| Lighthouse mobile | Performance ≥ 90 · Accessibility ≥ 95 · SEO = 100 | Measure in P1 |

### 11.2 Build and architecture changes

- **Load each route on demand** with `React.lazy` + `Suspense`. Admin pages must be in their own chunks; this also takes admin code and config out of the public home bundle (§16).
- **`manualChunks`:** `three`/R3F, `gsap`+`lenis`, `jspdf`, `swiper` and `papaparse` each in their own chunk, loaded only by the routes that use them.
- **Remove unused dependencies:** `mapbox-gl`, embla (`ui/carousel`), recharts (`ui/chart`), canvas-confetti, the dead Mapbox CSS (`src/index.css:231-294`), and `src/App.css`.
- **Keep one toaster** (Sonner).
- **Long-cache headers** for hashed `/assets/*` in `vercel.json`, plus security headers (§16).

### 11.3 Home loading sequence

```
1. HTML + critical CSS
   + <link rel=preload> Clash Display 600, Satoshi 400 (woff2)
   + <link rel=preload fetchpriority=high> poster-flat.avif
2. First paint: H1 (LCP) + poster + fact strip + CTAs         ← target ≤ 2.5 s on 4G
3. Hydrate the home chunk (Motion via LazyMotion: features load asynchronously)
4. After `load` + requestIdleCallback:
     if tier ∈ {high, medium} and not reduced motion:
        import('./hero-3d')  → three + slim BoxRig + gsap/ScrollTrigger (+ lenis on high)
        mount canvas behind poster → first frame → cross-fade (280 ms) → intro fold
     else: stay on poster-sealed.avif (no 3D download)
5. Below-the-fold images lazy-load with fixed aspect ratios; S3 SVG is inline (no request)
```

### 11.4 Accessibility checklist (WCAG 2.2 AA)

- [ ] `<MotionConfig reducedMotion="user">` at the root; every animation has a reduced-motion version (§8.6)
- [ ] No auto-advancing carousel. Anything that moves for more than 5 s (the marquee) has a pause control (2.2.2)
- [ ] Skip link; landmarks `<header>`, `<nav>`, `<main>`, `<footer>`
- [ ] Pinned sections: DOM order matches the visual order, a "Skip animation" link, no focus traps
- [ ] Tools menu, tabs, accordion and gallery work by keyboard with visible focus (cyan-700 on paper, cyan-400 on ink, both ≥ 3:1 for non-text)
- [ ] Touch targets ≥ 24 px (2.5.8), and ≥ 44 px for primary actions
- [ ] All text meets the contrast table in §5.1; no text in kraft-400, green-500 or cyan-400 on paper
- [ ] Form labels tied to inputs (`htmlFor`/`id`); errors announced; required fields marked in text
- [ ] Alt text describes the real image content; decorations are `aria-hidden`
- [ ] No emoji used as icons
- [ ] Count-ups and marquees do not announce changes (`aria-live` off)
- [ ] Page language `en-IN` (already set)

### 11.5 SEO preservation checklist

- [ ] Keep `MetaTags` + `StructuredData` on every page; keep every existing URL
- [ ] **FAQPage schema only where the FAQ is visible.** Today it is emitted with no visible FAQ on Services, Products, Locations, CompareQuote and BoxDesigner
- [ ] **Product schema only for products shown on the page** (fixes T7 once supplies are added to `/products`)
- [ ] Create the missing OG images (`/og-about.jpg` etc.) or point them all at `/og-image.jpg`; fix `SEO_CONFIG.logo` (`src/seo/config.ts:39`)
- [ ] Add `/locations` and the new routes to `public/sitemap.xml`
- [ ] Keep the H1 keyword-rich ("Corrugated boxes …"); one H1 per page
- [ ] Pre-render blog articles (P5), and consider pre-rendering the marketing routes later
- [ ] Redirects only if a URL ever changes (none planned)

---

## 12. Reference library

**Status key:** ✅ the research verified the live page (or its Awwwards entry) on 6 Oct 2026 · ⚠️ could not be fully verified.

### 12.1 Packaging brands

| Site | What to borrow | Informs | Status |
|---|---|---|---|
| [Packhelp](https://www.packhelp.com/) | Hero with dual CTAs; a "Trusted by 125,300 companies" logo strip **directly under the hero**; navigation by industry; live 3D preview and sample packs | S1, S2, S5, S7 | ✅ |
| [Arka](https://www.arka.com/) | "From $X/unit" price anchors on product cards; sustainability badge near the hero; "Get free samples" as a main CTA | S4, S7, §7.5 | ✅ |
| [Smurfit Westrock](https://www.smurfitwestrock.com/) | A band of hard numbers (tonnes recycled, experience centres, certifications) and the circular-economy story | S2, S8, About | ✅ |
| [Yucca Packaging](https://yucca.co.za/) | **B2B packaging, Awwwards Site of the Day (31 Jan 2026).** Typography-led design, dark teal + beige, different scroll behaviour per industry | Overall art direction, S5 | ✅ (Awwwards entry) |
| [Notpla](https://www.notpla.com/) | Editorial, science-led explanation of materials | S3 tone | ✅ |
| [DS Smith](https://www.dssmith.com/) | A counter-example: generic corporate card grids | What to avoid | ✅ |

### 12.2 Industrial and manufacturing sites with award-level design

| Site | What to borrow | Informs | Status |
|---|---|---|---|
| [Terminal Industries](https://terminal-industries.com) | Scroll storytelling for an industrial or logistics product (Awwwards Site of the Month, Sep 2025). **Note its weaker accessibility score; don't copy that.** | S1, S6 | ✅ (Awwwards) |
| [Jonite](https://www.jonite.com/) | An established manufacturer (founded 1994) made to feel premium through big imagery, 3D and confident type (Site of the Day, Oct 2025) | Overall tone, About | ✅ (Awwwards) |
| [Q Industrial](https://www.q-industrial.com) | **One disciplined accent colour** on a neutral base; a motion timeline of the process | §5.1 accent rule, S6 | ✅ (Awwwards) |

### 12.3 Technique references

| Site | What to borrow | Informs | Status |
|---|---|---|---|
| [Apple AirPods Pro](https://www.apple.com/airpods-pro/) | Scroll-linked product storytelling; "a closer look" at inner components; each stat placed beside the feature it describes | S1, **S3** | ✅ |
| [Stripe](https://stripe.com/) | Clarity: 1–2 sentences per module, a band of numbers, logo carousel | S2, copy rules | ✅ |
| [Linear](https://linear.app/) | **Shows the real product UI in context**; motion polish; a scale claim | S7 tool tiles | ✅ |
| [Lusion](https://lusion.co/) | 3D storytelling paced by scroll | S1 | ✅ |
| [Lenis](https://lenis.dev/) (showcase lists jobs.netflix.com, landonorris.com) | Smooth scroll kept in sync with WebGL | §8.4 | ✅ |
| [GSAP showcase](https://gsap.com/showcase/) | ScrollTrigger pin/scrub patterns | §8.5 | ✅ |
| [Active Theory](https://activetheory.net/) | High-end WebGL | Inspiration only | ⚠️ content did not render |

### 12.4 Signature interaction examples

| Example | Relevance | Status |
|---|---|---|
| Codrops: *On-Scroll Folding 3D Cardboard Box* ([tutorial](https://tympanus.net/codrops/2022/12/13/how-to-code-an-on-scroll-folding-3d-cardboard-box-animation-with-three-js-and-gsap/), [MIT repo](https://github.com/uuuulala/Threejs-folding-cardboard-box-tutorial), [CodePen](https://codepen.io/ksenia-k/pen/dyjWPdp)) | The closest public precedent for S1. **We use our own BoxRig instead**, which already models real RSC panels and flaps. | ✅ repo · ⚠️ article returned 403 |
| [iyO exploded view](https://www.iyo.ai/iyo-one) ([Awwwards inspiration](https://www.awwwards.com/inspiration/interactive-webgl-exploded-view-iyo)) | An exploded-layers-on-scroll pattern → S3 ply separation | ✅ |
| [Pacdora 3D mockup generator](https://www.pacdora.com/tools/3d-shipping-box-mockup-generator) | Produces fold animations as MP4: a cheap source for a low-tier fallback loop video | ✅ |
| Codrops / Trionn (Jul 2026), [article](https://tympanus.net/codrops/2026/07/15/the-architecture-behind-trionn-coordinating-gsap-three-js-lenis-and-web-audio/) | How to coordinate GSAP + Three.js + Lenis in one architecture | ✅ |
| **Corrugated flute cross-section reveal** | **The research found no live example.** S3 is genuinely new. | — |

### 12.5 Research sources (B2B buyer behaviour)

| Source | Finding | Applied in |
|---|---|---|
| [NN/g: B2B Website Usability](https://www.nngroup.com/articles/b2b-usability/) | B2B sites reach 58% task success versus 66% for consumer sites; buyers rank price information first | S7, §7 |
| [NN/g: Show the price](https://www.nngroup.com/articles/show-price/) | Where exact prices aren't possible, show sample prices or ranges (2013, still widely cited) | S7 price drivers, Finder ranges |
| [Gartner, 25 Jun 2025](https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-sales-survey-finds-61-percent-of-b2b-buyers-prefer-a-rep-free-buying-experience) | 61% of B2B buyers prefer buying without a sales rep | Tools up front (S7), Finder, Designer |
| [Baymard: B2B research](https://baymard.com/research/b2b-electronic-components-machinery) | MOQ, volume pricing and shipping times are often missing at the point of decision (⚠️ verified from a summary only, not the full report) | Fact strip, S4 rows, S7 |
| [web.dev: Core Web Vitals](https://web.dev/articles/vitals) · [Animations guide](https://web.dev/articles/animations-guide) | LCP/INP/CLS thresholds; animate only transform and opacity | §8, §11 |
| [AiSensy × IndiaMART case study](https://aisensy.com/case-studies/indiamart) | Reports higher buyer conversion with WhatsApp (vendor case study, so directional only) | WhatsApp-first mobile, §7.4 |

---

## 13. Phased roadmap

| Phase | Scope | Effort | Owner must supply first | Exit criteria |
|---|---|---|---|---|
| **P0 Content truth** | Apply the §0.3 defaults in `src/constants/index.ts` and `ABOUT_CONTENT` (one value per fact); **add `VERIFY-LATER` markers** on the testimonials, ISO/BIS chips, "warehouses across India" and AI images; remove the "Inside Vayu" captions and "G-1" badges; fix hero alt text | under 1 d | Nothing (informational only, see §0) | One value per fact on the site; every uncertain value carries a marker |
| **P1 Foundations** | Tokens (§5.1–5.2), self-hosted fonts and the body-font fix, route-level lazy loading + `manualChunks`, image pipeline + slot registry, `Cta` + lint rule, sticky accessible navbar, `WhatsAppFab` + `MobileActionBar`, `MotionConfig` + blur reveals removed, page-transition delay removed, analytics `DEBUG` off in production, **security quick wins** (§16) | 5–6 d | WhatsApp Business number, reply SLA, business hours, SVG logo | Lighthouse mobile ≥ 80 on today's content; one primary CTA destination; reduced-motion respected |
| **P2 Conversion** | `/quote` + 3-step `QuoteForm` behind a server-side submit function, Contact redesign, Finder fixes (hand-off parameters, quantity, Select bug, delay), Finder/Designer → quote pre-fill, event list (§7.6) | 4–5 d | Where leads go (who, which Sheet or CRM), sample policy, privacy notice text | A lead can be submitted end-to-end from Home, Contact, Finder and Designer, and is tracked without personal data |
| **P3 Home rebuild** | S1 (static poster hero), S2–S9, footer, Distribution moved to `/locations`, dead components deleted, S3 as non-pinned cards | 6–8 d | Product list with made/sourced, MOQ and lead time per product; industry specs; capacity and QC facts per step; FAQ answers; logo permissions | Every buyer question in §3.2 answered in order; LCP ≤ 2.5 s; CLS ≤ 0.05 |
| **P4 Signature motion** | Lenis + GSAP, slim BoxRig hero canvas, rendered posters, intro and scroll fold, tape strip, S3 pinned timeline + ink flood, device tiers, kill switch, real-device QA | 6–9 d | Box print artwork approval; BCT/ECT/burst reports (or a decision to leave them out) | 60 fps on a mid-range Android (medium tier); low tier never downloads Three.js; INP ≤ 200 ms |
| **P5 Inner pages** | Product index + detail pages + spec sheets, Industries hub + pages, About, Locations (SVG map), blog refresh + pre-rendering, Finder wizard, Box Designer re-skin, 404 | 8–12 d | Real photography (§10.5), founder story, certificates, supply specs | All pages on the new system; sitemap and schema match visible content |

**Total: about 30–42 developer-days**, plus owner content time.

**Order rationale**
- **Truth** comes first (P0) and conversion plumbing early (P1–P2): both are low-risk and high-impact.
- The **page story** comes next (P3).
- **3D comes last**, so the riskiest work never blocks a better site from launching.

---

## 14. Success metrics

Measure a **baseline for 2–4 weeks before P1 ships**, using the existing analytics (`src/lib/analytics.ts`, events posted to the Google Sheet). **Set targets after the baseline.** No target numbers are invented here.

| Metric | Definition | Source |
|---|---|---|
| **Lead rate** | `quote_submit` per 1,000 sessions (and contact-form submits during transition) | Analytics |
| **Direct-contact rate** | (`whatsapp_click` + `call_click` + `email_click`) per 1,000 sessions | Analytics |
| **Story completion** | % of home sessions reaching S4 (`scroll_depth`), and `hero_fold_complete` | Analytics |
| **Engaged time** | Median time on page for home sessions that scroll | Existing page-exit timing |
| **Tool → quote** | `finder_request_quote` / `finder_result`; `designer_request_quote` / `designer_open` | Analytics |
| **Home bounce rate** | Single-page sessions with < 10 s engagement | Analytics |
| **Core Web Vitals** | LCP, INP, CLS at the 75th percentile, mobile | `web-vitals` (already collected) |
| **Lead quality** (qualitative) | % of leads the owner rates "real buyer" after the call | Owner, monthly |

---

## 15. Owner inputs checklist (later review, not a blocker)

**Nothing below blocks implementation.** Each item has a default in §0.3 and a `VERIFY-LATER` marker in code. When the owner is ready, run `grep -rn "VERIFY-LATER" src`, confirm or correct each value, then delete the marker. "Needed by" below means "ideally confirmed by".

| # | Input | Needed by | Notes |
|---|---|---|---|
| 1 | **One agreed fact set:** founding year, client count, boxes/month, cities served | P0 | Replaces both conflicting versions |
| 2 | **Made in-house vs sourced, per product** | P0 / P3 | Feeds the badges in S4 and on product pages |
| 3 | Certificates held (ISO, BIS, FSC…) with number and PDF, **or approval to drop the claims** | P0 | Unverified claims must go |
| 4 | WhatsApp Business number, reply SLA, business hours, who receives leads | P1 | |
| 5 | Logo as SVG; exact brand hex values | P1 | §5.1 greens are sampled from the PNG |
| 6 | Lead destination (Sheet or CRM), access list (named staff only), privacy notice text | P2 | DPDP Act 2023 |
| 7 | Sample policy (free or paid, quantity, turnaround) | P2 | |
| 8 | MOQ and lead time **per product**; exact scope of "48-hour dispatch" | P3 | |
| 9 | Recommended spec per industry (six industries) | P3 | |
| 10 | Capacity and QC numbers (one per S6 step) | P3 | No number → no claim |
| 11 | FAQ answers (MOQ, dispatch, samples, GST, payment terms, printing) | P3 | |
| 12 | Client logos and 2–3 testimonials **with written permission** | P3 / S8 | |
| 13 | Optional anchor price ("from ₹X/box at N units") with a review date | P3 | |
| 14 | Approval of the 3D box print artwork (logo placement, one colour) | P4 | |
| 15 | BCT / ECT / burst / GSM / BF per ply, from lab or supplier reports | P4 / P5 | Otherwise shown as "on request" |
| 16 | Supply specs (tape width/micron/length; stretch film; bubble wrap; strapping) | P5 | |
| 17 | Real photography and video per the shot list (§10.5) | P5 (any time) | Each one swaps into an existing slot |
| 18 | Founder story and portrait; team photo consent | P5 | |
| 19 | GSTIN, Udyam registration and legal name for the footer and About | P3 | Public registration facts |
| 20 | Custom domain + domain email (with SPF/DKIM/DMARC) instead of `vercel.app` / Gmail | Any time | Big trust gain for B2B |

---

## 16. Risks and mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | **Unverified claims** (ISO/BIS, testimonials, "warehouses across India", client and city counts) could breach consumer-protection and advertising rules (Consumer Protection Act 2019, ASCI code) and damage procurement trust | High (live today) | High | **Accepted for now to ship fast.** Each is marked `VERIFY-LATER`; conflicting numbers are reduced to one default (§0.3); review the markers **before any paid promotion or public launch announcement** |
| R2 | **AI images imply a real facility or team** (h3 garbled certificates, h4 "BOXC" truck) | High | Medium–High | Slot `kind: 'illustrative'` blocks captions; crop/exclude rules (§10.2); real shoot (§10.5) |
| R3 | **3D hero hurts LCP or INP on mid-range Android** | Medium | High | Poster-first loading, H1 as LCP, 3D after idle, tiers, low tier never downloads Three.js, kill switch, real-device QA in P4 |
| R4 | **Pinned scroll sections confuse users or break accessibility** | Medium | Medium | Max 2 pins, both early; skip links; no pins on touch/medium for S3; DOM order = visual order |
| R5 | **Lenis conflicts** with OrbitControls, dialogs and scroll locks | Medium | Low–Medium | Lenis off on `/box-designer`, touch devices and reduced motion; `data-lenis-prevent` on scroll panels; stop Lenis while dialogs are open |
| R6 | **GSAP licence terms** (free, not open source) | Low | Medium | Read the GSAP Standard License before P4; Motion-only fallback is possible for S3 |
| R7 | **Finder CSV prices go stale** and mislead buyers | Medium | Medium | "Indicative · updated {date}" label; quarterly owner review |
| R8 | **SEO regression** during the redesign | Low–Medium | High | No URL renames; keep MetaTags/StructuredData; schema = visible content; sitemap updated; monitor Search Console after each phase |
| R9 | **Fonts (ITF Free Font License)**: licence terms change or are misread | Low | Low | Keep the licence files in the repo; fallback pairing: Inter Tight + Instrument Serif (OFL) |
| R10 | **Content dependency**: owner inputs arrive late | Low | Low | No longer a blocker: §0 defaults are used and marked `VERIFY-LATER` |

### 16.1 Security and compliance

These are out of design scope, but **they must be fixed during P1–P2** under company policy (least privilege). Sensitive values are deliberately not reproduced here.

| # | Issue | Evidence | Recommendation (least privilege) |
|---|---|---|---|
| S1 | **The admin login check runs entirely in the browser.** The admin email and password hash ship in the public bundle, and the route guard is a `sessionStorage` flag, so anyone can bypass it from the browser console. | `src/config/adminAuth.ts`, `src/lib/admin-auth.ts` | Move to server-side authentication (a hosted auth provider or Vercel middleware with a signed session). **Rotate the password now.** Lazy-load admin routes so admin code leaves the public bundle (P1). |
| S2 | **Google Apps Script write URLs (analytics, contact form, admin CRM, invoices) are hard-coded in the browser code** and unauthenticated | `src/config/analytics.ts`, `src/lib/googleSheets.ts`, `src/config/adminSheets.ts` | Put a server-side function in front with input validation, rate limiting and a server-held secret. Restrict each Sheet to named staff. Treat the admin CRM endpoint as the highest priority. |
| S3 | **The signatory's signature image is publicly downloadable** (bundled through the eager admin imports) | `src/assets/anups-sign.png` via `src/components/admin/AdminDocumentPreview.tsx` | Remove it from `src/assets`; serve it only to authenticated admin sessions from protected storage. |
| S4 | **Visitor fingerprinting and IP geolocation (FingerprintJS, ipapi.co) without notice or consent**; analytics debug logging in production | `src/lib/analytics.ts`, `src/config/analytics.ts` | Add a consent banner and privacy notice (DPDP Act 2023); collect location and fingerprint only after consent; turn debug off in production. |
| S5 | **No security headers** | `vercel.json` | Add a Content-Security-Policy (allow-list fonts, Maps and the analytics endpoint), HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and `frame-ancestors 'none'`. |
| S6 | **Quote-form pre-fill parameters and WhatsApp text are user-controlled input** | New in §7.2 | Validate against an allow-list; render only as text; never echo into HTML or `href` without encoding. |

---

## Appendix A: Audit findings mapped to this plan

| Finding | Addressed in |
|---|---|
| T1 Distributor vs manufacturer | P0, §1 decisions, S4 badges, S6 step 02, About §9.2 |
| T2 Conflicting numbers | P0, owner input #1, S2 StatLedger |
| T3 AI images labelled as real | §10 (slot `kind`, crop/exclude rules), R2 |
| T4 ISO/BIS without proof | P0, owner input #3, About §9.2, footer |
| T5 Placeholder testimonials | P0, S8 (hidden until consent) |
| T6 No logos, capacity or company facts | S2, S6, footer §6.10, About §9.2, owner inputs #10, #12, #19 |
| T7 SEO lists supplies not shown | S4 row 05, §9.3 content file, §11.5 |
| H1 Repetitive layouts | §6 (each section uses a distinct layout), §4.5 rhythm |
| H2 Duplicate "how it works" | S6 merges Video + ProcessTimeline + Gallery |
| H3 No product, industry or MOQ overview | S1 fact strip, S4, S5 |
| H4 Distribution block heavy | Moved to `/locations` §9.6 |
| H5 Weak light/dark rhythm | §4.5, §5.2 `data-theme="ink"` |
| H6 Gallery looks unfinished | §6.11, §10.4 |
| C1 Nav not sticky | §7.1 |
| C2 Quote goes to two places | §7.2 (`/quote` only) |
| C3 No WhatsApp or mobile shortcut | §7.4 |
| C4 Generic CTAs | §7.2 naming |
| C5 `<a href>` full reloads | §7.6 `Cta` + lint rule |
| C6 Contact page links and form | §9.5, §7.3 |
| C7 Finder hand-off and quantity bugs | §9.8, P2 |
| P1 3 MB single bundle | §11.2, P1 |
| P2 83 MB of PNGs | §10.3 |
| P3 2.4 MB hero image | S1 poster ≤ 80 KB, §11.3 |
| P4 Blur reveals | §8.3, §8.7 |
| P5 Font loading and body-font bug | §5.3 |
| P6 Video and brochure size | S6 lightbox ≤ 2 MB, §6.10 brochure ≤ 3 MB |
| P7 Unused dependencies | §11.2 |
| A1 No reduced motion | §8.4 `MotionConfig`, §8.6 |
| A2 Carousel auto-advance, small dots | Carousel removed (S1) |
| A3 Gallery and Tools not keyboard accessible | §7.1, §11.4 |
| A4 Contrast | §5.1 computed tokens |
| A5 Emoji as icons | §5.5 |
| A6 Skip link, landmarks, 404 layout | §7.1, §9.10, §11.4 |
| A7 TOC hover-only, desktop-only | §9.7 |
| B1 Blue vs green logo | §5.1 Eco-Industrial palette |
| B2 Off-palette colours | §5.1 rules, §9.7, §9.9 |
| B3 Misleading utility names | §5.2 (tokens replace `section-dark` and `glow-amber`) |
| B4 Hard-coded © 2025 | §5.6 Footer |
| B5 Missing OG images | §11.5 |
| Security S1–S6 | §16.1 |

---

## Appendix B: Glossary

| Term | Meaning |
|---|---|
| **Ply** | Number of paper layers in the board. 3-ply = single wall (liner, flute, liner); 5-ply = double wall; 7-ply = triple wall. |
| **Flute** | The wavy middle layer that gives corrugated board its strength. Types A, B, C, E and F differ in height and pitch (`src/lib/boxDesigner/constants.ts:44-50`). |
| **Liner** | The flat paper facing glued to the flutes. |
| **Caliper** | Board thickness, in mm. |
| **GSM** | Grams per square metre: paper weight. |
| **BF** | Bursting factor: a paper-strength rating used widely in India. |
| **Burst strength** | Pressure needed to rupture the board (kg/cm²). |
| **ECT** | Edge Crush Test: how much edgewise compression the board resists. |
| **BCT** | Box Compression Test: how much top load a finished box withstands, which predicts how high boxes can be stacked. |
| **RSC** | Regular Slotted Container: the standard shipping box (the style the in-house `BoxRig` models). |
| **Dieline** | The flat 2D template of a box: solid lines are cut, dashed lines are folded (creased). |
| **MOQ** | Minimum order quantity. |
| **LCP / INP / CLS** | Core Web Vitals: how fast the largest element on first paint appears, how quickly the page responds to input, and how much the layout shifts. |
| **Pin / scrub** | A pinned section stays fixed while you scroll; scrubbing ties an animation's progress to the scroll position. |

---

## Summary

### Action Items
1. **Owner:** complete P0 inputs (§15 #1–#3), especially one fact set, made vs sourced per product, and the certificate status, so unverified claims can come off the live site.
2. **Developer:** start P1 (tokens, fonts, lazy routes, image pipeline, `Cta`, sticky nav, WhatsApp/mobile bar, `MotionConfig`) together with the **security quick wins**: rotate the admin password, lazy-load admin routes, remove the signature asset, turn analytics debug off.
3. **Developer:** build `/quote` with a server-side submit function (P2) before rebuilding the home page, so every new CTA has somewhere trustworthy to land.
4. **Owner:** book the real photo and video shoot using the slot-mapped shot list (§10.5); it can happen in parallel with any phase.
5. **Both:** approve the [DRAFT COPY] (hero H1 option A/B/C, section headlines) and the 3D box print artwork before P3 and P4.

### Key Decisions
- **Positioning:** hybrid "one-stop packaging partner", shown openly with Made in-house / Sourced & QC-checked badges.
- **Visual system:** Eco-Industrial (paper, kraft, ink, Vayu green, air cyan) with Clash Display + Satoshi + Geist Mono and a print-production decorative kit.
- **Home story:** nine sections following the buyer's question ladder. At most two pinned moments: **The Fold** (3D, reusing `BoxRig` / `poseFromProgress`) and **Inside the Board** (SVG generated from `getBoardSpec`).
- **Conversion:** one "Get a quote" destination (`/quote`), WhatsApp-first mobile action bar, 3-step form, every CTA tracked.
- **Motion stack:** Lenis + GSAP ScrollTrigger only for the two signature timelines; Motion for everything else; CSS for hover and marquee. No blur reveals; reduced motion respected; device-tiered.
- **Imagery:** current AI images stay as illustrative slots with no factual captions until real photography replaces them.
- **No URL renames;** only new routes are added.
- **3D ships last** (P4), behind a kill switch.

### Risks
- Unverified claims and AI imagery implying a real facility (R1, R2): **live today**.
- 3D and pinned-scroll performance and accessibility on mid-range Android (R3, R4): mitigated by poster-first loading, device tiers and a kill switch.
- Client-side admin auth, exposed Apps Script write endpoints, a public signature asset and fingerprinting without consent (§16.1): **security and compliance exposure, fix in P1–P2**.
- Owner content arriving late (R10): mitigated by phases P1–P2 needing little content and unfinished sections hiding themselves.

---

## Implementation status (updated 7 Oct 2026, end of day)

`tsc`, `npm run build`, `vitest` (146 tests) and lint all pass. Every public route was loaded in headless Edge on the production build at 1440×900 and 390×844: no console errors and no horizontal overflow. Not yet checked on a real phone or with real data.

**Review queue:** the owner asked that nothing block the build, so every unverified fact, image or claim is marked in code with `VERIFY-LATER[AREA-NN]` (55 unique markers). List them with `grep -rn "VERIFY-LATER" src api index.html`. Biggest groups: FACT (17, in `src/content/facts.ts`), IMG (5), SPEC (4).

### Done

| Phase | Item | Where |
|---|---|---|
| P0 | One fact set with `VERIFY-LATER` markers; hero alt texts fixed; AI mock-up images with fake brands or a fake licence stamp replaced or flagged (`IMG-05`) | `src/content/facts.ts`, `src/content/home.ts`, `src/constants/images.ts` |
| P1 | Design tokens, `data-theme` ink/kraft, type scale, Tailwind colours and fonts | `src/index.css`, `tailwind.config.ts` |
| P1 | **Fonts self-hosted** (Clash Display, Satoshi, Geist Mono, Lora), two preloads, no third-party font requests. (The earlier CDN link silently loaded only Clash Display, so Satoshi never loaded.) | `public/fonts/`, `index.html`, `src/styles/blog.css` |
| P1 | **Logo cut out to a transparent PNG**, plus a light-text variant used on dark navbar states (no more white box) | `src/assets/logo-horizontal*.png`, `SiteNavbar.tsx` |
| P1 | Route-level lazy loading, `manualChunks`, `MotionConfig`, 150 ms page fade. Main bundle is now ~200 KB gzipped (was ~3 MB uncompressed) | `src/App.tsx`, `vite.config.ts` |
| P1 | Motion tokens, device tiers (`?quality=`, `VITE_HERO_3D=off`), **Lenis smooth scroll** (high tier, fine pointer, off on `/box-designer` and `/admin`, synced with GSAP) | `src/lib/motion/` |
| P1 | `Cta`, `Section`, `SectionHeader`, `FactStrip`, `MadeSourcedBadge`, `StatLedger`, `ImageSlot`, decor, sticky theme-aware navbar, mega footer, `WhatsAppFab`, `MobileActionBar` | `src/components/site/` |
| P1 | Lint rule banning raw internal `<a href="/…">` | `eslint.config.js` |
| P1 | Unused code and packages removed: old home components, `Index.tsx`, `App.css`, dead map CSS, duplicate shadcn toaster; `mapbox-gl`, `embla`, `recharts`, `canvas-confetti`, `swiper` uninstalled | repo-wide |
| P2 | `/quote`, 3-step `QuoteForm`, server-side `api/quote.ts`, URL prefill with allow-lists | `src/pages/Quote.tsx`, `src/components/quote/`, `api/quote.ts` |
| P2 | Contact redesign (real `tel:`/`mailto:`/`wa.me`, shared form, static map card) | `src/pages/Contact.tsx` |
| P2 | Packaging Finder: 3-step wizard, prefill from Box Designer and URL, real quantity (default 500), `Select` bug and 800 ms delay fixed, "Indicative" prices, "Request this quote", `finder_*` events | `src/pages/CompareQuote.tsx`, `src/components/CompareQuote/`, `src/lib/finderPrefill.ts` |
| P2 | Box Designer re-skinned to Vayu tokens (cyan selection), slim header with always-visible "Quote this design", `designer_*` events | `src/pages/BoxDesigner.tsx`, `src/components/BoxDesigner/` |
| P3 | Home S1–S9, Distribution moved to `/locations`; mobile and overflow fixes (grid columns, hero H1 size, compact ply cross-section on phones) | `src/pages/Home.tsx`, `src/components/home/` |
| P4 | Hero fold (SVG posters, lazy 3D canvas, GSAP pin), "Inside the Board" with a cross-section from `getBoardSpec`, "Watch 60s" video lightbox | `src/components/home/` |
| P5 | Products index (filters synced to the URL) and 10 product detail pages from one typed file | `src/content/products.ts`, `src/pages/Products.tsx`, `ProductDetail.tsx` |
| P5 | Industries hub (`/services`) and `/industries/:slug` (6 pages) | `src/pages/Services.tsx`, `IndustryDetail.tsx`, `src/content/industries.ts` |
| P5 | About (hybrid model diagram, capacity), Locations (SVG Gujarat map with drawn routes, city cards, FAQ), 404 inside the layout with `404_hit` | `src/pages/About.tsx`, `Locations.tsx`, `NotFound.tsx` |
| P5 | Blog refresh: featured post, search, new chips, sticky and mobile ToC, safe markdown, real images, fetch error state, mid-article CTA cards | `src/pages/Blog*.tsx`, `src/components/Blog*.tsx`, `src/styles/blog.css` |
| SEO | Missing OG images fall back to `/og-image.jpg`; sitemap now has 35 URLs including new routes; FAQ and Product schema only where the content is visible | `MetaTags.tsx`, `public/sitemap.xml`, `src/seo/` |
| Security | Baseline headers + immutable caching in `vercel.json` (CSP is **Report-Only** for now); **analytics consent**: no fingerprint, no IP lookup and no stored ID until the visitor accepts; consent banner and draft `/privacy` page | `vercel.json`, `src/lib/consent.ts`, `ConsentBanner.tsx`, `Privacy.tsx` |

### Image replacement pass (8 Oct 2026)

The AI-generated images (hero, gallery, product, blog, about, services and the old `og-image.jpg`) were removed. Reason: they showed fake brands and a fake licence stamp, garbled text, and AI people that read as a real team.

| What | Now | Where |
|---|---|---|
| Products, supplies, industries, process steps 01 and 04, About, 8 blog thumbnails | Original vector illustrations in the site palette. No text claims, no fake brands | `src/assets/illustrations/*.svg`, generated by `npm run illustrations` (`scripts/illustrations/`) |
| Process steps 02 and 03, flute-types blog | Three licensed photos (CC0 and CC BY-SA from Wikimedia Commons) with a visible on-image credit badge | `src/assets/photos/`, `src/content/imageCredits.ts`, `ImageCredit.tsx` |
| Credits and licences | Public `/image-credits` page with ImageObject JSON-LD (licence, creator, creditText); linked from the footer; in the sitemap | `src/pages/ImageCredits.tsx` |
| Crawler-friendly rasters | Product JSON-LD now points at `/images/products/<slug>.png` (it used a `/src/assets/...` URL that does not exist in production). Blog OG images `/blog-images/*-og.png` exist now. New `og-image.jpg` at 1200×630 | `npm run illustrations:seo` |

Rules going forward: add a photo only if it is CC0, public domain, CC BY or CC BY-SA, has a named author, and gets an entry in `imageCredits.ts`. Never add AI-generated people or places. Real Vayu photos replace illustrations by setting `kind: 'photo'`.

### Still to do

**Owner or asset work (cannot be done in code)**
1. Answer the `VERIFY-LATER` queue, starting with `FACT-*` (one agreed set of numbers), `CERT-*`, `SPEC-*` and `SVC-01`.
2. Real photography and video per §10.5; swap into the slots and set `kind: 'photo'`. Until then the slots show original illustrations and credited open-licence photos (see the image replacement pass above). `IMG-07`: confirm where `factory-top-view.mp4` came from.
3. Compress the 20 MB brochure to ≤ 3 MB (`ASSET-01`) and the 5 MB factory video; add a video poster frame. No ffmpeg or Ghostscript was available in this environment.
4. Replace the 2–2.7 MB PNG masters with AVIF/WebP at several widths (§10.3). The pipeline is not built yet, so mobile image weight is still high. This is the biggest remaining speed win.
5. Per-page OG images at 1200×630 (`SEO-01`), the SVG logo, GSTIN/Udyam, real testimonials and client logos (`TEST-*`), WhatsApp number and reply SLA (`FACT-13`), privacy text review (`LEGAL-*`).
6. Custom domain and domain email.

**Code**
7. Switch the CSP from `Content-Security-Policy-Report-Only` to enforcing after checking every page in the browser console.
8. Security items not done: **S1** admin login still runs in the browser (move to server-side auth and rotate the password), **S2** the analytics and admin-CRM Apps Script URLs are still in client code (put them behind a server function like `api/quote.ts`), **S3** the signature image is still bundled. Also `api/quote.ts` falls back to the public script URL when `LEAD_WEBHOOK_URL` is unset (`SEC-02`) and its rate limit is per warm instance (`SEC-03`).
9. Get the initial JavaScript under the 180 KB gzipped budget (now ~200 KB), and re-check Lighthouse on a real mid-range Android phone (LCP, INP, CLS).
10. Test the pinned hero and "Inside the Board" on real devices; confirm the cyan selection in the 3D designer and a real form submit end to end.
11. Update `SOCIAL_LINKS.phone` in `src/constants/index.ts` (still a wa.me link), and the Designer HowTo schema's "millimeters or inches" (the tool uses cm).
12. `tsconfig.app.json` shows a TS 6 deprecation warning for `baseUrl`; add `@types/node` to the API config.
13. Remaining pre-existing lint errors are old `any` types, outside this redesign.

Data Classification: Internal
