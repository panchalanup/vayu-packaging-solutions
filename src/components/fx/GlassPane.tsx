/**
 * A pane of frosted glass with a clear, polished edge, built from how real soda-lime glass behaves:
 *  - frost:   an etched surface scatters light, so what is behind it blurs and goes slightly milky (backdrop blur);
 *             iron oxide in ordinary glass gives a faint green cast; a fine static grain is the etched texture
 *  - face:    Fresnel reflection, about 4% straight on (n ≈ 1.52) and rising toward grazing angles, so the faces read
 *             brighter at the top and bottom; plus a soft specular highlight of the light source that slides as the
 *             mouse moves (desktop) or as the page scrolls (touch)
 *  - lip:     the polished edge, seen through the glass's thickness: greener, and it refracts like a small lens, so it
 *             shows a magnified slice of what is behind it and breaks at the edge. Total internal reflection leaves a
 *             bright rim line, with a faint blue/orange dispersion fringe, and the highlight glints along it
 *  - glint:   one light sweep across the pane when it turns to glass
 * The lens is a Chromium-only SVG filter inside backdrop-filter, so it is used only there; other browsers get the same
 * edge without the magnification. Every layer fades on its own: fading a parent would cut its children off from what
 * is behind them (a backdrop root) and the blur would pop in at the end. The low tier gets the frost and edges only.
 *
 * Put it as the first child of a positioned element that has its own stacking context (fixed + z-index).
 */

import { useEffect, useId, useRef, useState } from 'react';
import { useSiteTier } from '@/lib/motion/siteTier';

const LIP_H = 10;

type NavigatorBrands = Navigator & { userAgentData?: { brands?: { brand: string }[] } };

/** Chromium renders SVG filters inside backdrop-filter; Safari and Firefox do not */
function supportsBackdropLens(): boolean {
  if (typeof navigator === 'undefined' || typeof CSS === 'undefined') return false;
  const brands = (navigator as NavigatorBrands).userAgentData?.brands;
  return !!brands?.some((b) => /Chromium/i.test(b.brand)) && CSS.supports('backdrop-filter', 'url(#x)');
}

/**
 * Displacement map for the lip: the green channel moves pixels up or down (0.5 = no move). The shift grows with the
 * square of the distance from the pane, like a rounded edge, so the strip shows a magnified slice of what is behind it
 * and never samples outside itself.
 */
function lensMap(width: number, edge: 'top' | 'bottom'): string {
  const sign = edge === 'bottom' ? -1 : 1;
  const stops = [0, 0.25, 0.5, 0.75, 1]
    .map((t) => {
      const g = Math.round(255 * (0.5 + sign * 0.5 * t * t));
      const offset = edge === 'bottom' ? t : 1 - t;
      return `<stop offset='${offset}' stop-color='rgb(128,${g},128)'/>`;
    })
    .join('');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${LIP_H}' preserveAspectRatio='none'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>${stops}</linearGradient></defs><rect width='100%' height='100%' fill='url(#g)'/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

interface GlassPaneProps {
  tone: 'paper' | 'ink';
  /** Glass visible */
  on: boolean;
  /** The host is slid out of view: hide the lip, which sits outside the host */
  hidden?: boolean;
  /** Which side faces the page content (the header's bottom, the phone bar's top) */
  edge?: 'top' | 'bottom';
}

export function GlassPane({ tone, on, hidden = false, edge = 'bottom' }: GlassPaneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lipRef = useRef<HTMLDivElement>(null);
  const filterId = `glass-lens-${useId().replace(/:/g, '')}`;
  const { tier, reducedMotion } = useSiteTier();
  const rich = tier !== 'low';
  const [lens] = useState(() => rich && supportsBackdropLens());
  const [lipWidth, setLipWidth] = useState(0);
  const [glint, setGlint] = useState(0);
  const wasOn = useRef(on);

  // one sweep of light when the pane turns to glass
  useEffect(() => {
    if (on && !wasOn.current && rich && !reducedMotion) setGlint((g) => g + 1);
    wasOn.current = on;
  }, [on, rich, reducedMotion]);

  // the lens map has to match the lip's width in px
  useEffect(() => {
    const lip = lipRef.current;
    if (!lens || !lip || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => setLipWidth(Math.round(entry.contentRect.width)));
    ro.observe(lip);
    return () => ro.disconnect();
  }, [lens]);

  // where the light source sits along the pane: follows the mouse on desktop, drifts back and forth with scroll on touch
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
      target = e.clientX / window.innerWidth;
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

  const lensOn = lens && lipWidth > 0;
  return (
    <div ref={ref} aria-hidden="true" className="glass-pane" data-tone={tone} data-edge={edge} data-on={on} data-hidden={hidden}>
      <div className="glass-pane__frost" />
      <div className="glass-pane__face" />
      <div ref={lipRef} className="glass-pane__lip" data-lens={lensOn} style={lensOn ? { backdropFilter: `url(#${filterId}) saturate(1.3)` } : undefined} />
      {glint > 0 && <div key={glint} className="glass-pane__glint" />}
      {lensOn && (
        <svg width="0" height="0" className="absolute" focusable="false">
          {/* Dispersion: red, green and blue are bent by slightly different amounts, then recombined */}
          <filter id={filterId} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feImage href={lensMap(lipWidth, edge)} x="0" y="0" width={lipWidth} height={LIP_H} preserveAspectRatio="none" result="map" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale="12" xChannelSelector="R" yChannelSelector="G" result="dr" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale="12.5" xChannelSelector="R" yChannelSelector="G" result="dg" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale="13" xChannelSelector="R" yChannelSelector="G" result="db" />
            <feColorMatrix in="dr" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
            <feColorMatrix in="dg" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
            <feColorMatrix in="db" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
            <feBlend in="r" in2="g" mode="screen" result="rg" />
            <feBlend in="rg" in2="b" mode="screen" result="rgb" />
            {/* a polished edge is never perfectly sharp */}
            <feGaussianBlur in="rgb" stdDeviation="0.35" />
          </filter>
        </svg>
      )}
    </div>
  );
}
