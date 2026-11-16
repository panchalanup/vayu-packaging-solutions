# 3D Box Designer: "Experience" page, cleaned story page and new Tools menu

| | |
|---|---|
| **Version** | 1.0, 16 Nov 2026 |
| **Status** | Decided after owner feedback on the first showcase build. Implementation follows this plan. |
| **Replaces** | The screenshot-and-paragraph chapters of `BOX_DESIGNER_SHOWCASE_PAGE_PLAN.md` (chapters 4-9). Chapters 1-3 (sticky 3D stage, unfold, dieline anatomy) stay. |

## 1. What the owner said

The first build explained too much: screenshots, cards, paragraphs. The wanted feeling is the one on the reference
galleries (Dribbble hero-section, Unsection, Supahero): **a visitor should enjoy it, not feel they have to read it.**
Also: the Tools dropdown mixed the new page into an unrelated list. It needs structure and a better dropdown.

## 2. Design rules (apply to both pages)

1. **One idea per screen, at most 6 words as the headline, at most one short line under it.** Motion explains; text names.
2. **No screenshots of our own UI as decoration.** Visuals are live: the real 3D box, the real dieline, drawn SVG.
3. **Big type, big object, empty space.** Fewer things on screen, each larger.
4. **Every animation is scroll-linked or a one-shot on entry**, and uses only `transform` and `opacity` (plus
   `stroke-dashoffset` for line drawing). One WebGL canvas at most, none on slow networks / low tier.
5. **Controls are tiny and obvious** (colour dots, style icons, one slider), never forms.

## 3. Pages

### 3.1 `/3d-box-designer/experience` (new, cinematic)

Full-bleed dark film, one sticky full-screen stage that never leaves while scenes scroll over it.

| Scene | On screen | Words |
|---|---|---|
| 1 Hero | Large live 3D box on ink, slow orbit, drag to turn, 5 colour dots recolour it live, style icons | "Design a box." / "Watch it fold." |
| 2 Unfold | Box opens, lays flat, dieline draws itself, dimensions snap in | One giant word at a time: Open · Flat · Cut · Fold · Measure |
| 3 Print | The finished dieline on a white sheet, "1:1" and a download button | "Print-ready." |
| 4 Any box | Two counter-moving rows of box illustrations (all styles) | "Any box." + live count |
| 5 Share | Animated flow: laptop, link, phone, signed page | "Share. Approve." |
| 6 Two sides | Two big hover tiles (maker / buyer) | "Make. Buy." |
| 7 Close | Huge marquee line + one button | "Your next box starts flat." |

### 3.2 `/3d-box-designer` (existing, cleaned)

Keep: sticky stage hero, unfold, anatomy (text cut to one short line per beat; panel labels hide when too narrow).
Replace: screenshot grid, share screenshots, scenarios, before/after, split text and export text cards with the same
animated visuals (style marquee, animated share flow) and four compact download chips. FAQ stays, collapsed, for SEO.

## 4. Tools menu

Research (sources at the end) says: nested hover flyouts frustrate (the panel closes, the pointer has to retrace);
two tiers belong in one flat panel; open on hover **and** click **and** keyboard; short hover-intent delay; `aria-expanded`;
Esc closes; two levels maximum on mobile.

**Decision:** one "Tools" trigger opens one panel with two tiers side by side:

```
┌ Tools ───────────────────────────────────────────────────────────┐
│ 3D Box Designer ›  │  Open the designer          Find my box       │
│ Free calculators › │  See it in action           Templates         │
│ Packaging Finder › │  How it works               [live preview]    │
└──────────────────────────────────────────────────────────────────┘
```

Left = categories; right = that category's items and a small live preview. Hover, focus or click on a category swaps
the right side **in place** (no flyout to chase). Mobile: an accordion inside the menu, one level.
Built on Radix NavigationMenu (already installed): keyboard, Esc, outside click and `aria-expanded` come with it.

## 5. Sources

- NN/g, menu design: https://www.nngroup.com/articles/menu-design/
- Smashing Magazine, when hover mega-menus fail: https://smashingmagazine.com/2021/05/frustrating-design-patterns-mega-dropdown-hover-menus/
- Level Access, accessible navigation menus: https://www.levelaccess.com/blog/accessible-navigation-menus-pitfalls-and-best-practices/
- A11y Collective, accessible mega menu: https://www.a11y-collective.com/blog/accessible-mega-menu/
- Chrome, scrollytelling guidance (use CSS sticky, not scroll-listener layout): https://developer.chrome.com/docs/modern-web-guidance/guides/ui-behaviors/scrollytelling

## 6. Implementation status (16 Nov 2026)

Built and verified in headless Edge (desktop 1440, phone 390), on the dev server and on a production build.

| Item | State |
|---|---|
| `/3d-box-designer/experience` film (hero, unfold, print, any box, share, two sides, close) | Done |
| `/3d-box-designer` cleaned: screenshots, scenarios, before/after, text cards removed; style marquee, share drawing, four download chips added | Done |
| Tools menu: two-tier panel (desktop), accordion (mobile); the old flat dropdown entry for the page removed | Done |
| Dieline PDF/SVG: dimension lines, key, 100 mm bar (Phase 0 of the first plan) | Done |
| SEO: both pages in sitemap, prerender, JSON-LD, `vercel.json` rewrites | Done |

Measured (production build, headless Edge; 3D runs on the CPU renderer there, so 3D frame times are pessimistic):
- Page animation with 3D off: median frame 16.7 ms, 0 long tasks on the film page, 0 to 4 slow frames per ~350 scrolled.
- Page-specific JS: film 4.2 KB gzip, how-it-works 8.4 KB (was 24.5 KB); the 238 KB three.js chunk loads only on medium/high tiers.
- Slow 3G: heading 8.5 s, controls usable about 10 s, no 3D download (browser reports 2G/3G). Fast 3G: usable about 3 s, 3D arrives in the background.
- Nav logos converted PNG to WebP (143 KB and 118 KB down to 23 KB and 22 KB).

Open items (not done, none block the pages):
- `?present=1` deep link into the designer's presentation mode does not exist (SHW-02); maker CTAs open the plain designer.
- CSP is report-only and its `frame-src` does not list `'self'`; enforcing it later would block the same-origin embed preview iframe on the how-it-works page.
- Shared site weight sets time-to-usable on slow networks: main JS (about 205 KB gzip), three Satoshi font files (about 75 KB), and `public/favicon.ico` (about 300 KB, fetched in the background).
- The navbar's menu button overflows a 320 px screen by about 17 px (existing nav, clipped, not scrollable).
- Real-device pass (mid-range Android, iPhone) still to do; 3D frame rates here are from a software renderer.

## 7. Round 2 (16 Nov 2026): bugs from the owner's screenshots and the "wow" upgrade

**Bugs fixed, with the real cause of each**

| Report | Cause | Fix |
|---|---|---|
| Box flaps overlap and blink while it turns | Z-fighting: a wall's top-edge strip (corrugated cross-section) is in exactly the same plane as the closed lid's top face at the far hinge, so the winner flipped with the camera angle. Measured by capturing frames 0.45 degrees apart: the strip toggled on and off. | `panelRig.ts`: the two edge materials get a positive `polygonOffset`, so the printed face always wins the tie. Verified on a repeat sequence (stable across frames). Also: the canvas now fits near/far to the box every frame. |
| Download PDF fails ("Could not make the file"), also in the designer | Dev only: `jspdf` is loaded on demand, so Vite never pre-bundled it and answered `504 Outdated Optimize Dep` on first use. Production was never affected. | `vite.config.ts` `optimizeDeps.include` lists every on-demand package. If it still fails once, restart `npm run dev`. |
| Print buttons sit on top of the "Print-ready." text | Words and buttons were on two separate layers positioned independently; a short wide window wrapped the word to two lines. | Buttons are part of the same text block as the word. Type size now follows min(width, height). |
| Mobile Tools menu ugly | A long accordion with hints squeezed beside names, on a see-through panel. | Drill-down: "Tools >" row, then one screen with a featured 3D Designer card, a 2-column grid of short calculator names, the Finder. Solid panel. |

**Film page upgrade** (all transform/opacity, off on touch and with reduced motion where it is a pointer effect):
intro assembly (flat sheet folds into the box on load, "Fold again" replays it), box leans toward the cursor and a soft
light follows it, floating feature labels, kinetic word-mask headlines, a glowing laser head that rides the cut line as it
draws, scroll-speed-reactive marquees, spotlight/tilt tiles, magnetic buttons, counting numbers, a top progress line, and
a **live price scene** driven by the designer's real estimate engine.

**Tried and removed:** a blueprint grid. Five ways of drawing it (masked layer, CSS transition, promoted layer, SVG pattern,
SVG line path) each cost frames in the CPU-rendered benchmark, so it was dropped. Lesson recorded in `scripts/showcase/qa.mjs --mode bench`
(unfold-only pacing with one layer switched off at a time).

**Measured** (headless Edge, CPU rendering): phone-size, 3D off: 16.8 ms 95th percentile, 0 long tasks. Desktop-size, 3D off:
16.7 ms median, but more frames over 33 ms than before the upgrade; the same JavaScript runs on the phone size with none,
so this is pixel-fill cost of the CPU renderer. Not yet measured on a real GPU.

## 8. Round 3 (16 Nov 2026): more hero scenes, one after another

The owner asked for more "wow" hero sections down the page, each useful and not only decorative. The filter: a scene earns its place only if it answers a question a buyer actually has, using the designer's own logic (no invented numbers).

| Scene | Question it answers | Real logic behind it | Visual |
|---|---|---|---|
| Size it | "What size box do I need for my product?" | `lib/boxDesigner/fit.ts` (product + cushioning, fragile switch) | Isometric box with the product inside; "Use this size" feeds the shared design |
| Test it | "Will it survive stacking?" | `strength.ts` (McKee estimate), board ply choice | Crush rig: press comes down, gauge climbs, wall buckles; board cross-section drops in layer by layer |
| Price it | "What will it cost?" | `pricing.ts` `estimatePrice`, shared quantity | Per-box price count-up and tier bars |
| Stack it | "How many fit in a container?" | `tools/cbm.ts` (pallet and container fill) | Isometric 20 / 40 / 40 HC container filling with cartons |
| Share it, Sides | existing | | |
| Make it | "How do I order this?" | `LeadForm` to `/api/quote` with the spec attached | Recap card (box, board, quantity, price) and the send / WhatsApp actions |

Shared state: `useShowcaseValue` gives every scene one `boxDesign` (hero design + chosen ply + quantity), so a size picked in "Size it" changes the strength test, price, container load and the recap.

Performance: the new scenes are SVG plus CSS (transform/opacity only), started when they scroll into view (`useInView`), with no extra canvas and no new dependency. Reduced motion shows the end state of each.

Verified: desktop and phone (390 px) screenshots of every scene and interaction, no console errors, 869 unit tests, typecheck, lint, production build. Not verified: frame rate on a real GPU phone (the test browser renders on CPU). Prerendered SEO body for the new scenes is not updated yet.
