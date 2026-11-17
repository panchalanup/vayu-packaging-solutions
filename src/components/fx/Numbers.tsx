/**
 * Numbers that move. Both write the text straight into the element (no React render per frame) and keep the real
 * final value in the page text / aria-label, so nothing depends on the animation. Reduced motion shows the final value.
 *   CountUp        : counts up from 0 once, when it scrolls into view
 *   AnimatedNumber : eases from the number it shows to a new one whenever `value` changes
 */

import { useEffect, useLayoutEffect, useRef } from 'react';

const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function tween(from: number, to: number, ms: number, write: (n: number) => void): () => void {
  let frame = 0;
  const t0 = performance.now();
  const tick = (now: number) => {
    const p = Math.min(1, (now - t0) / ms);
    write(from + (to - from) * easeOut(p));
    if (p < 1) frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

interface NumberProps {
  value: number;
  format?: (n: number) => string;
  className?: string;
}

export function CountUp({ value, format = (n) => String(Math.round(n)), className }: NumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced() || typeof IntersectionObserver === 'undefined') return;
    el.textContent = format(0);
    let stop = () => {};
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        stop = tween(0, value, 1500, (n) => {
          el.textContent = format(n);
        });
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stop();
      el.textContent = format(value);
    };
    // format is a stable inline function in the callers; the value is what matters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <span ref={ref} className={className} aria-label={format(value)}>
      {format(value)}
    </span>
  );
}

export function AnimatedNumber({ value, format = (n) => String(Math.round(n)), className }: NumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced()) {
      el.textContent = format(value);
      shown.current = value;
      return;
    }
    const from = shown.current;
    const stop = tween(from, value, 650, (n) => {
      shown.current = n;
      el.textContent = format(n);
    });
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <span ref={ref} className={className} aria-live="polite">
      {format(value)}
    </span>
  );
}
