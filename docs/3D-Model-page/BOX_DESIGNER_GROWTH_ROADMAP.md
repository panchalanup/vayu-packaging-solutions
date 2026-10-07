# 3D Box Designer: Growth & Brand-Value Roadmap

Planning document only. Nothing here is built yet.
Route: `/box-designer` · Code: `src/pages/BoxDesigner.tsx`, `src/components/BoxDesigner/*`, `src/lib/boxDesigner/*`

---

## 1. Where the tool stands today

Built and tested (October 2026):
- Realistic 3D corrugated carton: real board thickness, visible flute layers on the edges, studio lighting, soft shadow, smooth fold from flat blank to open top to sealed.
- Box styles RSC (FEFCO 0201) and HSC (0200); exact inside dimensions; 3/5/7-ply with flute choice; 10 colour presets + custom colour applied to the whole board.
- Artwork editor: drag logos and text, size, rotation, fonts, colours, layers; handling marks.
- Undo/redo, autosave, share link, save/open design file, clean high-resolution PNG, dieline SVG/PDF at 1:1, WhatsApp/email quote to Vayu.
- Mobile layout with bottom sheet; WebGL fallback; lazy-loaded 3D code; 49 automated tests.

Known gaps (carry-over):
| Gap | Note |
|---|---|
| Mailer box (FEFCO 0427) has no 3D model | Listed as "coming soon" |
| No cut-away / "show inside" view | Open top stop covers most of the need |
| `/compare-quote` ignores the spec the designer sends | Small change on the quote page |
| Board thickness values are industry estimates | Confirm with supplier; they feed 3D, dieline and quote text |
| Real-device QA not done (iOS Safari, Android, low-end GPUs) | Needs a person with devices |
| cm only (no mm/inch) | SEO copy mentioned mm/inch earlier |
| Open owner decisions: per-flap vs six-surface artwork, strikethrough price copy, blog claims (cost estimate) | See section 7 |

---

## 2. Principles for choosing what to add

1. **Turn visitors into leads.** Every feature should shorten the path from "I like my box" to "Vayu has my enquiry".
2. **Make the design look expensive.** The tool is a showroom; polish is brand value.
3. **Be honest about price and spec.** Estimates are labelled as estimates; board specs come from real supplier data.
4. **Cheap to run.** Prefer client-side features. Add a backend only where it clearly pays (leads, saved designs).

Priority key: **P1** high impact / modest effort · **P2** strong value · **P3** later / larger bet. Effort: S (≤2 days), M (3-5), L (1-2 weeks), XL (2+ weeks).

---

## 3. Lead generation and sales (highest business impact)

| # | Idea | Why it helps | Priority | Effort |
|---|---|---|---|---|
| 1 | **Instant price estimate** from size, ply, colour, print, quantity, with MOQ price slabs and a clear "indicative" label | Customers decide faster; filters serious enquiries; the blog already promises it | P1 | M |
| 2 | **"Send my design to Vayu" lead form**: name, phone, email, quantity, delivery city + the design attached (share link, spec, PNG) into the existing Google Sheet CRM | Captures leads with context instead of a blank WhatsApp message | P1 | M |
| 3 | **Prefill `/compare-quote`** from the design (size, ply, style) | Removes retyping; closes the known gap | P1 | S |
| 4 | **Quantity and tiers** ("100 / 500 / 1000 / 5000 boxes: price per box falls") | Nudges larger orders | P1 | S |
| 5 | **Delivery estimate by pincode** (uses existing locations data) | Reduces "can you deliver to me?" calls | P2 | M |
| 6 | **Request sample / mock-up** button with address capture | Converts hesitant buyers; high-intent signal | P2 | S |
| 7 | **Reorder**: reopen a previous design by link or code and request the same box again | Repeat business is the most profitable | P2 | M |
| 8 | **Lead follow-up automation**: confirmation email/WhatsApp with the design image and a quote ETA | Professional impression, faster response | P2 | M |
| 9 | **Admin view of designer enquiries** in the existing admin portal (spec, preview, status) | Sales team sees designs, not just text | P2 | M |

---

## 4. Brand value and "wow" experience

| # | Idea | Why it helps | Priority | Effort |
|---|---|---|---|---|
| 10 | **Branded product shots**: export on a styled background (studio, wooden table, warehouse), with soft reflections and Vayu watermark option | Shareable images that look like real marketing photos | P1 | M |
| 11 | **Turntable video / GIF export** (360° spin, or folding animation) | Highly shareable on Instagram and WhatsApp | P2 | M |
| 12 | **Mock-up scenes**: show the box with a product inside, stacked on a pallet, in a courier bag, held by a hand (flat images composited with the designed box) | Customers see their brand in use | P2 | L |
| 13 | **Print finishes preview**: matte vs gloss varnish, foil/emboss hint, kraft-on-white inside | Premium upsell, looks luxurious | P2 | L |
| 14 | **Real brand colours**: pick a Pantone/CMYK-like swatch or paste a hex, with a note that print colour is confirmed on proof | Brands care about exact colour | P2 | S |
| 15 | **Guided mode** ("I'm shipping jars / apparel / food, 2 kg, fragile") that suggests style, size, ply and flute | Great for non-experts; positions Vayu as expert | P1 | M |
| 16 | **Product-first starting points**: templates such as "E-commerce shipper", "Apparel box", "Pizza/Food", "Gift hamper" with sample artwork | Faster first success, better first impression | P2 | M |
| 17 | **Trust strip**: sample production photos, client logos, "made in Ahmedabad", turnaround time next to the tool | Credibility where decisions are made | P1 | S |
| 18 | **Polish pass**: onboarding hint ("drag to rotate, click a face to add your logo"), empty-state coaching, subtle sounds off by default, micro-animations | Feels like a premium product | P2 | S |

---

## 5. More box types and manufacturing intelligence

| # | Idea | Why it helps | Priority | Effort |
|---|---|---|---|---|
| 19 | **Mailer box (FEFCO 0427)** 3D + dieline | Biggest e-commerce category; already advertised "soon" | P1 | L |
| 20 | **More styles**: full-overlap (0203), die-cut tray, pizza box, telescopic lid-and-base, sleeve, shoe box, gift box | Wider catalogue from one tool | P2 | XL (each M-L) |
| 21 | **Inserts and dividers** (bottle partitions, foam/cardboard inserts) | Upsell for fragile goods | P3 | L |
| 22 | **Strength guidance**: show estimated stacking strength / max load from size + board (BCT-style formula), with a clear disclaimer | Customers pick the right ply; avoids wrong orders | P2 | M |
| 23 | **Fit checker**: enter product size and get the recommended inside size with padding | Solves the most common sizing mistake | P1 | S |
| 24 | **Unit toggle** (mm / cm / inch) | Matches how buyers specify | P1 | S |
| 25 | **Print-ready file check**: warn when artwork is low resolution, too close to a fold, or crosses a score line | Fewer reprint disputes | P2 | M |
| 26 | **Full-blank artwork on the dieline** (print continues across flaps as a flat sheet) with bleed and safe-area guides | What printers actually need | P2 | L |
| 27 | **Sustainability panel**: recyclable, % recycled content, FSC option, material saved vs a standard size | Strong selling point for modern brands | P3 | S |

---

## 6. Customer accounts and collaboration

| # | Idea | Why it helps | Priority | Effort |
|---|---|---|---|---|
| 28 | **Optional sign-in / email magic link** to keep designs in a "My designs" list | Return visits and reorders | P2 | L |
| 29 | **Team sharing and comments** on a design (view link, comment, approve) | B2B approvals without email chains | P3 | L |
| 30 | **Version history** of a design | Confidence to experiment | P3 | M |
| 31 | **Approval sign-off**: customer approves the final digital proof, stored with the order | Fewer disputes | P3 | M |
| 32 | **Brand kit**: save logo, colours and fonts once; apply to any box | Speeds repeat designs | P3 | M |

---

## 7. Growth, SEO and analytics

| # | Idea | Why it helps | Priority | Effort |
|---|---|---|---|---|
| 33 | **Product landing pages that open the designer pre-configured** ("Mailer box for 5 kg", "Pizza box 12 inch") | Captures search traffic with an interactive result | P1 | M |
| 34 | **Share cards**: shared links show a rendered preview image (Open Graph) | Better click-through from WhatsApp/social | P2 | M |
| 35 | **Funnel analytics** (design started, ply changed, artwork added, export, enquiry sent) in the existing analytics | See where people drop off; tune the tool | P1 | S |
| 36 | **A/B tests** on call-to-action wording and placement | Lift enquiry rate | P3 | M |
| 37 | **Embeddable widget** for partners, resellers and blog posts | Distribution | P3 | M |
| 38 | **Multilingual UI** (Hindi, Gujarati) | Wider local reach | P2 | M |
| 39 | **Missing SEO assets**: the three referenced preview images, fresh OG image from the new render, updated blog screenshots | Cheap win after the visual upgrade | P1 | S |
| 40 | **AR preview** (view the box at real size on a phone via WebXR/Quick Look) | Impressive demo; helps size decisions | P3 | L |

---

## 8. Technical and quality investments

| # | Idea | Why it helps | Priority | Effort |
|---|---|---|---|---|
| 41 | **Real-device QA pass** and performance budget (target 55 fps laptop, 30 fps mid phone) | Protects the first impression on real hardware | P1 | S-M |
| 42 | **Automated visual regression** (reuse the headless screenshot harness) in CI | Stops accidental look changes | P2 | M |
| 43 | **Component tests** for the editors and export panel | Safer future changes | P2 | M |
| 44 | **Cut-away / "show inside" view** | Customers inspect the interior and edges | P3 | S |
| 45 | **Quality settings** in the UI (auto, high, battery saver) | Smooth on older phones | P3 | S |
| 46 | **Error reporting** for the 3D view (privacy-safe) | Find problems customers never report | P2 | S |
| 47 | **Accessibility audit** (screen reader, keyboard-only walkthrough, contrast) | Inclusive and a quality signal | P2 | M |

---

## 9. Suggested sequence

**Wave 1 (about 2-3 weeks): turn the tool into a lead machine**
Quote prefill (3), lead form into the CRM (2), quantity tiers + instant estimate (1, 4), fit checker (23), unit toggle (24), trust strip (17), funnel analytics (35), SEO image refresh (39), real-device QA (41).

**Wave 2 (about 3-4 weeks): brand polish and reach**
Mailer box (19), branded product shots (10), turntable export (11), guided mode (15), product-first templates (16), share cards (34), landing pages (33), print-ready checks (25), strength guidance (22).

**Wave 3 (later): retention and scale**
Accounts and reorder (7, 28), admin view of designs (9), team sharing/approvals (29, 31), more box types (20), finishes (13), multilingual (38), AR (40).

---

## 10. Decisions needed from the owner

1. **Pricing**: can we publish indicative prices? If yes, share rate cards by ply/size/quantity (or approve a formula) and the wording for "indicative".
2. **Supplier data**: confirm board thickness per ply/flute and which flute combinations you actually stock.
3. **Lead handling**: who receives design enquiries (WhatsApp, email, Google Sheet, admin portal) and expected response time to promise on the page.
4. **Scope of box styles**: which 2-3 styles after Mailer sell most.
5. **Brand**: logo/watermark rules for exported images, preferred mock-up scenes, trust content (client logos, photos) available to use.
6. **Accounts**: is sign-in acceptable, or should designs stay link-based?
7. **Copy and claims**: the struck-through "₹399" price, "free forever", any strength/weight claims, and the blog's mentions of cost estimate and PDF.

---

## 11. How success will be measured

| Metric | Why |
|---|---|
| Designer visits to design started | Is the hero and loading experience working |
| Design started to artwork added | Engagement depth |
| Design started to enquiry sent (conversion) | The main business number |
| Enquiries with a design attached vs without | Quality of leads |
| Quote requests to orders | Real revenue impact |
| Share and download counts | Brand reach |
| Mobile share of sessions and their conversion | Is mobile worth more investment |

Data Classification: Internal
