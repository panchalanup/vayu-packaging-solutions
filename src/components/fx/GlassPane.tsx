/**
 * A bar of frosted glass, built from how real soda-lime glass behaves:
 *  - frost:   an etched surface scatters light, so what is behind it blurs and goes slightly milky (backdrop blur);
 *             iron oxide in ordinary glass gives a faint green cast
 *  - face:    Fresnel reflection, about 4% straight on (n ≈ 1.52) and rising toward grazing angles, so the outer edge
 *             reads a little brighter; plus a soft specular highlight of the light source that slides as the mouse
 *             moves (desktop) or as the page scrolls (touch)
 *  - glint:   one light sweep across the pane when it turns to glass
 *  - soften:  a lighter blur along the feather, so the scatter tapers off (a progressive blur)
 * There is no separate edge strip: the pane runs a little past the bar on the side that faces the page and fades out
 * there (a feathered mask), so content melts into the glass instead of meeting a line. Every layer fades on its own:
 * fading a parent would cut its children off from what is behind them (a backdrop root) and the blur would pop in at
 * the end. The low tier gets one blur that fades over the whole feather, and no moving highlight or glint.
 *
 * Put it as the first child of a positioned element that has its own stacking context (fixed + z-index).
 */

import { useEffect, useRef, useState } from 'react';
import { useSiteTier } from '@/lib/motion/siteTier';

interface GlassPaneProps {
  tone: 'paper' | 'ink';
  /** Glass visible */
  on: boolean;
  /** The host is slid out of view: hide the feather, which hangs outside the host */
  hidden?: boolean;
  /** Which side faces the page content (the header's bottom, the phone bar's top) */
  edge?: 'top' | 'bottom';
}

export function GlassPane({ tone, on, hidden = false, edge = 'bottom' }: GlassPaneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { tier, reducedMotion } = useSiteTier();
  const rich = tier !== 'low';
  const [glint, setGlint] = useState(0);
  const wasOn = useRef(on);

  // one sweep of light when the pane turns to glass
  useEffect(() => {
    if (on && !wasOn.current && rich && !reducedMotion) setGlint((g) => g + 1);
    wasOn.current = on;
  }, [on, rich, reducedMotion]);

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

  return (
    <div ref={ref} aria-hidden="true" className="glass-pane" data-tone={tone} data-edge={edge} data-on={on} data-hidden={hidden} data-rich={rich}>
      <div className="glass-pane__frost" />
      {rich && <div className="glass-pane__soften" />}
      <div className="glass-pane__face" />
      {glint > 0 && <div key={glint} className="glass-pane__glint" />}
    </div>
  );
}
