/**
 * Footer wordmark playground (docs/Design-Improvement/FOOTER_WORDMARK_PLAYGROUND_PLAN.md).
 * This small gate decides between the still crate wordmark (reduced motion, low tier, Save-Data, no IntersectionObserver,
 * or a failed load) and the live physics stage, which is a lazy chunk fetched only when the footer is within a screen of
 * the viewport. Both use the same layout, so nothing jumps when one replaces the other.
 */

import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSiteTier } from '@/lib/motion/siteTier';
import { computeLayout, CONTROLS_H } from '@/lib/footerPlayground/layout';
import StaticWordmark from './StaticWordmark';

const PlaygroundStage = lazy(() => import('./PlaygroundStage'));

const MAX_WIDTH = 1600;

function useContainerWidth(ref: React.RefObject<HTMLElement>) {
  const [width, setWidth] = useState(() => (typeof window === 'undefined' ? 1200 : Math.min(window.innerWidth, MAX_WIDTH)));
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setWidth((w) => (Math.abs(w - el.clientWidth) >= 1 && el.clientWidth > 0 ? el.clientWidth : w));
    read();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

export default function FooterPlayground() {
  const site = useSiteTier();
  const ref = useRef<HTMLDivElement>(null);
  const width = useContainerWidth(ref);
  const layout = useMemo(() => computeLayout(width), [width]);
  const [near, setNear] = useState(false);
  const [failed, setFailed] = useState(false);

  const live = !site.reducedMotion && site.tier !== 'low' && !failed && typeof IntersectionObserver !== 'undefined';

  useEffect(() => {
    const el = ref.current;
    if (!live || !el || near) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: '100% 0px 100% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [live, near]);

  return (
    <div
      ref={ref}
      role="group"
      aria-label="Vayu Packaging Solutions wordmark"
      className="relative mx-auto w-full max-w-[1600px]"
      style={{ height: live ? CONTROLS_H + layout.stageH : layout.stageH }}
    >
      <p className="sr-only">Vayu Packaging Solutions</p>
      {live ? (
        near && (
          <Suspense fallback={null}>
            <PlaygroundStage layout={layout} onFail={() => setFailed(true)} />
          </Suspense>
        )
      ) : (
        <StaticWordmark layout={layout} />
      )}
    </div>
  );
}
