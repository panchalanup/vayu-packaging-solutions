/**
 * Kinetic headline: every word slides up out of its own mask, staggered. Transform only. It plays once, on mount or
 * when it scrolls into view. The real text is on the element (aria-label) and the animated words are hidden from
 * assistive tech, so screen readers and search engines read a normal heading. Reduced motion shows it at rest.
 * variant="blur" swaps the mask-rise for a blur-in (see .sw-blur in index.css).
 */

import { createElement, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useSiteTier } from '@/lib/motion/siteTier';

interface SplitWordsProps {
  text: string;
  as?: 'span' | 'h1' | 'h2' | 'p';
  className?: string;
  /** Words (without punctuation) that get the accent colour */
  accent?: string[];
  accentClass?: string;
  /** Play right away instead of waiting to scroll into view */
  mount?: boolean;
  /** Milliseconds before the first word */
  delay?: number;
  /** Milliseconds between words */
  stagger?: number;
  id?: string;
  /** 'rise' (default): each word slides up out of a mask. 'blur': each word resolves from a soft blur (display text only; the low tier gets 'rise') */
  variant?: 'rise' | 'blur';
}

export function SplitWords({ text, as = 'span', className, accent = [], accentClass = 'text-green-400', mount = false, delay = 0, stagger = 70, id, variant = 'rise' }: SplitWordsProps) {
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);
  const { tier } = useSiteTier();
  const blur = variant === 'blur' && tier !== 'low';

  useEffect(() => {
    const el = ref.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setOn(true);
      return;
    }
    if (mount) {
      const frame = requestAnimationFrame(() => setOn(true));
      return () => cancelAnimationFrame(frame);
    }
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mount]);

  const words = text.split(' ');
  return createElement(
    as,
    { ref, id, className: cn('sw', blur && 'sw-blur', on && 'sw-in', className), 'aria-label': text },
    words.map((w, i) => (
      <span key={`${w}-${i}`} aria-hidden="true">
        <span className="sw-w">
          <span className={cn('sw-i', accent.includes(w.replace(/[.,!?]/g, '')) && accentClass)} style={{ ['--d' as string]: `${delay + i * stagger}ms` }}>
            {w}
          </span>
        </span>
        {i < words.length - 1 ? ' ' : null}
      </span>
    ))
  );
}
