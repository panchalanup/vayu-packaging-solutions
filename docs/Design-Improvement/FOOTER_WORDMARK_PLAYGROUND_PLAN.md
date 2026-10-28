# Footer wordmark playground: plan

Replaces the static outlined "VAYU" at the bottom of `src/components/site/SiteFooter.tsx` (line ~165) with an
interactive, on-brand toy that makes people smile, play and remember the site, then nudges them to the 3D designer.

## 1. Research (what makes people say "wow", and how it is built)

| Pattern seen on the web | How it is built | What we take |
|---|---|---|
| Giant wordmark footers (Awwwards "big typography / footer" collections, SOL Health, No graphism, WDNN) | Huge type, GSAP ScrollTrigger reveal or curtain-reveal parallax | A big, confident entrance on scroll |
| Cursor-proximity type (21st.dev "variable font cursor proximity", Framer "Footer Field", Elastic Footer) | Per-letter distance to pointer drives font axes or transform, spring physics, falloff curve | Letters lean away from or toward the cursor and spring back |
| Physics letters you can grab and throw (Flashform on Awwwards, AUW Studio "3D interactive footer" on Contra, Framer "Gravity Type Drop", "Falling Tags") | Matter.js rigid bodies, mouse constraint, GSAP/ScrollTrigger to start when visible, rAF sync of DOM or canvas | Real weight, collisions, throw with true velocity |
| Accessibility of the better ones (Footer Field) | `prefers-reduced-motion` shows the still wordmark | Static fallback, keyboard buttons |

None of these have a packaging identity, which is our opening.

## 2. Concept: "Stencil crate"

The footer wordmark is **VAYU stencilled on a corrugated crate**: chunky, blocky stencil letters (like the marks
printed on shipping cartons) made of kraft corrugated board with visible flute lines and a strip of packing tape.

1. **Entrance**: when the footer scrolls into view the four letters drop from above with real physics and bounce
   to rest on a floor line, landing in reading order. It feels like a delivery arriving.
2. **Grab and throw**: drag any letter with mouse or finger; release to throw it; letters collide with each other,
   the floor and the side walls. Heavy cardboard feel (low bounce, some friction).
3. **Cursor presence**: moving the pointer near the letters nudges a gentle lean (proximity falloff), so even a
   passive visitor sees it react.
4. **"Drop a box" button** (and tap or click on empty floor): small kraft boxes with tape rain in and pile up.
   **Each box carries a random cutout from our own sticker library** (mango, shoe, gift, cake, jar...). It quietly
   advertises the designer. After 8 boxes a line appears: "Full pallet. Design your own box in 3D →" linking to
   `/box-designer?src=footer.playground`.
5. **Tidy up** button: letters and boxes fly back to their home positions (reset animation).
6. Hint text that fades after the first touch: "Go on, grab a letter".

Deliberately not included: sound, cursor hijacking, anything that blocks scrolling, anything that autoplays loudly.

## 3. Implementation notes

- **Physics**: `matter-js` (add dependency), **dynamically imported** only when the footer is within one screen of
  the viewport and the device tier allows it, so it is never in the main bundle.
- **Letter bodies**: compound bodies made of rectangles (V, A, Y, U drawn as blocky stencil letters from straight
  strips), so collisions are exact with no polygon decomposition. The same geometry renders as SVG paths.
- **Rendering**: SVG (letters and boxes as `<g>` with transforms updated from bodies in one rAF loop). Corrugation
  look: an SVG `<pattern>` of flute stripes plus top and inner shadow gradients, kraft palette from the site tokens,
  a tape strip across one letter. Boxes: small rects with tape and an `<image>` of a sticker.
- **Loop discipline**: fixed timestep; sleeps when the footer is off-screen (IntersectionObserver), when the tab is
  hidden, and when all bodies are at rest; wakes on interaction.
- **Pointer**: pointer events with capture; `touch-action: none` only on the letter hit areas while dragging;
  page scroll is never blocked elsewhere; wheel is never intercepted.
- **Responsive**: wordmark scales with container width (the old `22vw` size); physics world scaled in CSS pixels;
  recompute walls and homes on resize; on phones fewer boxes (max 6).
- **Tiers and a11y** (reuse `src/lib/motion/siteTier.ts`, `tokens.ts`): reduced motion, low tier, Save-Data, no
  WebGL requirement (this is SVG, so only reduced motion, low tier and Save-Data disable physics): show the static
  stencil wordmark with only a hover lift. The playground region is `role="group"` with a short label; the two
  buttons are real, keyboard-focusable buttons (Drop a box, Tidy up); letters themselves are decorative
  (`aria-hidden`) and the footer keeps a real text "Vayu Packaging Solutions" for screen readers and SEO.
- **Brand and policy**: original geometry only; stickers come from our existing library (credits already on
  `/image-credits`); no third-party code copied (study techniques only); analytics events with no personal data:
  `footer_play_grab`, `footer_play_drop_box`, `footer_play_cta` (use `useEventTracker`).
- **Performance budget**: matter-js chunk loaded lazily (report its size), no layout thrash, 60 fps desktop,
  at least 30 fps mid-range phone, tested through the capture harness.

## 4. Acceptance

- Looks great at 390, 768, 1440 and 1920 px wide; letters always readable as VAYU at rest.
- Drag, throw, collide, stack boxes, tidy up all work with mouse and touch; scrolling the page still works
  everywhere, including over the playground.
- Static fallback for reduced motion, low tier and no-JS prerender (the prerendered HTML keeps the wordmark text).
- No console errors; tests for geometry, layout scaling and settle logic; tsc, vitest and build pass; no new
  content in the main bundle beyond a small lazy loader.

## 5. Later ideas (not now)

- Seasonal skins (Diwali lights on the crate, monsoon drops) via a single flag.
- "Type your brand" mode: visitors type their brand name and it becomes crate letters, with a link to design a box
  with that text (reuses the designer text tool).
- Share a screenshot of your pile.
