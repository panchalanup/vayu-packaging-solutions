/**
 * A floating slab of liquid glass (the iOS 26 material): the header capsule and the menu panels. Built from how a
 * thick, clear, rounded slab behaves:
 *  - lens:     the rounded rim is a convex surface, so it bends what is behind it toward the middle; the bend is
 *              strongest at the very edge and fades to nothing a little way in, and the flat middle stays clear
 *  - frost:    a light scatter on the bar, a heavier one on menus, so their text stays readable over anything
 *  - rim:      a thin specular line where the edge catches the light, brightest toward the light source, which
 *              follows the mouse on desktop and drifts with scroll on touch
 *  - depth:    a soft inner glow and a soft drop shadow, so the slab floats above the page
 *  - ripple:   when a panel surfaces, its rim bends hard and wobbles back to rest, like the surface of water settling
 * The lens is a Chromium-only SVG filter inside backdrop-filter, with a displacement map drawn for the slab's exact
 * size and corner radius, so it is smooth all the way round and only ever pulls pixels from inside the glass. Other
 * browsers and the low tier get the same slab without the bend.
 *
 * Put it as the first child of a positioned element that isolates its stacking (`isolate`); it fills that element
 * unless a class says otherwise. Never fade an ancestor's opacity: that cuts the glass off from the page behind it.
 */

import { useEffect, useId, useRef, useState } from 'react';
import { useSiteTier } from '@/lib/motion/siteTier';

/** How far in from the rim the surface curves, and the largest shift there (CSS px), per variant */
const SHAPE = { bar: { bevel: 12, shift: 10 }, panel: { bevel: 18, shift: 12 } } as const;
/** The ripple: how much harder the rim bends at first, how fast that dies away, the wobble period and length (ms) */
const RIPPLE = { boost: 1.6, decay: 230, period: 320, length: 950 };

type Variant = keyof typeof SHAPE;

type NavigatorBrands = Navigator & { userAgentData?: { brands?: { brand: string }[] } };

/** Chromium renders SVG filters inside backdrop-filter; Safari and Firefox do not */
function supportsBackdropLens(): boolean {
  if (typeof navigator === 'undefined' || typeof CSS === 'undefined') return false;
  const brands = (navigator as NavigatorBrands).userAgentData?.brands;
  return !!brands?.some((b) => /Chromium/i.test(b.brand)) && CSS.supports('backdrop-filter', 'url(#x)');
}

/** feDisplacementMap scale: one channel step either side of 128 covers ±scale/2 px */
const scaleFor = (variant: Variant) => SHAPE[variant].shift * 2 + 2;

const maps = new Map<string, string>();

/**
 * Displacement map for a rounded rectangle w × h with corner radius r (r = h/2 is a capsule): red moves pixels
 * sideways, green up and down (128 = no move). Each pixel in the bevel samples from further toward the middle, by an
 * amount that eases from the full shift at the rim to 0 at the bevel's inner end (zero slope there, so the bend has no
 * visible start). Cached by size, since menus mount afresh each time they open.
 */
function lensMap(w: number, h: number, radius: number, variant: Variant): string {
  const r = Math.min(radius, w / 2, h / 2);
  const key = `${w}x${h}r${r}${variant}`;
  const cached = maps.get(key);
  if (cached) return cached;
  const { shift } = SHAPE[variant];
  const scale = scaleFor(variant);
  // the bevel never reaches past the corner curve, so the straight sides and the corners join without a seam
  const bevel = Math.min(SHAPE[variant].bevel, r);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      // offset from the nearest point of the inner rectangle (the corner centres and the lines between them)
      const dx = px - Math.min(Math.max(px, r), w - r);
      const dy = py - Math.min(Math.max(py, r), h - r);
      let nx = 0;
      let ny = 0;
      let depth: number;
      if (dx || dy) {
        const len = Math.hypot(dx, dy);
        depth = r - len;
        nx = dx / len;
        ny = dy / len;
      } else {
        // along a straight side: the nearest edge is straight out
        const edges = [px, w - px, py, h - py];
        depth = Math.min(...edges);
        const side = edges.indexOf(depth);
        nx = side === 0 ? -1 : side === 1 ? 1 : 0;
        ny = side === 2 ? -1 : side === 3 ? 1 : 0;
      }
      let ox = 0;
      let oy = 0;
      if (depth < bevel) {
        const t = 1 - Math.max(depth, 0) / bevel;
        const m = shift * t * t;
        ox = -nx * m;
        oy = -ny * m;
      }
      const i = (y * w + x) * 4;
      img.data[i] = Math.round(255 * (0.5 + ox / scale));
      img.data[i + 1] = Math.round(255 * (0.5 + oy / scale));
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const url = canvas.toDataURL('image/png');
  maps.set(key, url);
  return url;
}

interface LiquidGlassProps {
  tone: 'paper' | 'ink';
  /** Glass visible */
  on: boolean;
  /** bar: the light header capsule; panel: menus, with a heavier frost and a wider rim */
  variant?: Variant;
  /** Corner radius in px; leave out for a capsule */
  radius?: number;
  /** Ripple the rim each time the glass appears */
  ripple?: boolean;
  className?: string;
}

export function LiquidGlass({ tone, on, variant = 'bar', radius, ripple = false, className }: LiquidGlassProps) {
  const ref = useRef<HTMLDivElement>(null);
  const displaceRef = useRef<SVGFEDisplacementMapElement>(null);
  const filterId = `liquid-lens-${useId().replace(/:/g, '')}`;
  const { tier, reducedMotion } = useSiteTier();
  const rich = tier !== 'low';
  const [lens] = useState(() => rich && supportsBackdropLens());
  const [size, setSize] = useState({ w: 0, h: 0, map: '' });

  // the lens map has to match the slab's size in px
  useEffect(() => {
    const el = ref.current;
    if (!lens || !el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      const h = Math.round(entry.contentRect.height);
      if (w < 2 || h < 2) return;
      setSize((s) => (s.w === w && s.h === h ? s : { w, h, map: lensMap(w, h, radius ?? h / 2, variant) }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [lens, radius, variant]);

  // surfacing: the rim bends hard, then wobbles back to rest with a dying oscillation, like water settling
  const lensOn = lens && !!size.map;
  useEffect(() => {
    const node = displaceRef.current;
    if (!ripple || !lensOn || !on || !node || reducedMotion) return;
    const base = scaleFor(variant);
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = now - start;
      const k = t >= RIPPLE.length ? 0 : RIPPLE.boost * Math.exp(-t / RIPPLE.decay) * Math.cos((2 * Math.PI * t) / RIPPLE.period);
      node.setAttribute('scale', (base * (1 + k)).toFixed(2));
      if (t < RIPPLE.length) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      node.setAttribute('scale', String(base));
    };
  }, [ripple, lensOn, on, reducedMotion, variant]);

  // where the light source sits along the slab: follows the mouse on desktop, drifts with scroll on touch
  useEffect(() => {
    const el = ref.current;
    if (!el || !rich || reducedMotion) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let target = 0.3;
    let x = 0.3;
    let frame = 0;
    const loop = () => {
      x += (target - x) * 0.12;
      el.style.setProperty('--sheen-x', `${(x * 100).toFixed(2)}%`);
      frame = Math.abs(target - x) > 0.0005 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const box = el.getBoundingClientRect();
      target = Math.min(Math.max((e.clientX - box.left) / box.width, 0), 1);
      kick();
    };
    const onScroll = () => {
      const p = (window.scrollY / 1400) % 2;
      target = 0.15 + (p < 1 ? p : 2 - p) * 0.7;
      kick();
    };
    if (fine) window.addEventListener('pointermove', onMove, { passive: true });
    else window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, [rich, reducedMotion]);

  const style: Record<string, string> = {};
  if (radius !== undefined) style['--lg-radius'] = `${radius}px`;
  if (lensOn) style['--lens'] = `url(#${filterId})`;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={className ? `liquid-glass ${className}` : 'liquid-glass'}
      data-tone={tone}
      data-variant={variant}
      data-on={on}
      data-lens={lensOn}
      style={style}
    >
      {lensOn && (
        <svg width="0" height="0" className="absolute" focusable="false">
          <filter id={filterId} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feImage href={size.map} x="0" y="0" width={size.w} height={size.h} preserveAspectRatio="none" result="map" />
            <feDisplacementMap ref={displaceRef} in="SourceGraphic" in2="map" scale={scaleFor(variant)} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}
    </div>
  );
}
