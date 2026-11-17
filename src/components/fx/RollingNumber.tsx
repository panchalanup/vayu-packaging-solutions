/**
 * A number whose digits roll like an odometer: each digit is a 0-9 column that slides to its value, staggered from the
 * right, once when it scrolls into view and again whenever `value` changes. The real number is always in the page text
 * (sr-only), and the visible digits start at the final value, so server-rendered pages and no-JS show the right number.
 * Digits use tabular figures so the width never changes. Reduced motion shows the final value.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { EASE } from '@/lib/motion/tokens';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const COLUMN = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const EASING = `cubic-bezier(${EASE.paper.join(',')})`;

type Phase = 'final' | 'zero' | 'roll';

function Digit({ digit, phase, order }: { digit: number; phase: Phase; order: number }) {
  return (
    <span aria-hidden="true" className="inline-block overflow-hidden align-bottom" style={{ height: '1em', padding: '0.1em 0', margin: '-0.1em 0', boxSizing: 'content-box' }}>
      <span
        className="flex flex-col"
        style={{
          transform: `translateY(-${phase === 'zero' ? 0 : digit}em)`,
          transition: phase === 'roll' ? `transform 1000ms ${EASING} ${order * 70}ms` : undefined,
        }}
      >
        {COLUMN.map((d) => (
          <span key={d} style={{ height: '1em', lineHeight: 1 }}>
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

interface RollingNumberProps {
  value: number;
  suffix?: string;
  locale?: string;
  className?: string;
}

export function RollingNumber({ value, suffix = '', locale = 'en-IN', className }: RollingNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = useState<Phase>('final');
  const text = value.toLocaleString(locale);

  // Before the first paint on the client: park the digits at zero until the number is seen (reduced motion keeps 'final')
  useIsoLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined') return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top > window.innerHeight * 0.9 || r.bottom < 0) setPhase('zero');
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase('roll');
          io.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const chars = [...text];
  const digitsFromRight = chars.filter((c) => /\d/.test(c)).length;
  let seen = 0;
  return (
    <span ref={ref} className={cn('tabular inline-flex', className)}>
      {chars.map((ch, i) => {
        if (!/\d/.test(ch)) {
          return (
            <span key={i} aria-hidden="true">
              {ch}
            </span>
          );
        }
        seen += 1;
        return <Digit key={i} digit={Number(ch)} phase={phase} order={digitsFromRight - seen} />;
      })}
      {suffix && <span aria-hidden="true">{suffix}</span>}
      <span className="sr-only">
        {text}
        {suffix}
      </span>
    </span>
  );
}
