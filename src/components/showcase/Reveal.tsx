/**
 * One-shot reveal on scroll: a CSS transition on opacity and transform, started by an IntersectionObserver.
 * No animation library, no per-frame JavaScript. Content is fully visible without JavaScript or with reduced motion
 * (the hidden state only exists once the observer is running), so a failed script can never leave a blank page.
 */

import { createElement, useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Milliseconds, for a staggered group (keep it small: 40 ms steps, at most six) */
  delay?: number;
  /** Distance to rise, in px */
  rise?: number;
}

type Phase = 'visible' | 'hidden' | 'shown';

export function Reveal({ children, as = 'div', className, delay = 0, rise = 16 }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState<Phase>('visible');

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // already on screen at mount: leave it alone (no flash of hidden content above the fold)
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) return;
    setPhase('hidden');
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPhase('shown');
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return createElement(
    as,
    {
      ref,
      className: cn('transition-[opacity,transform] duration-slow ease-paper', phase === 'hidden' && 'opacity-0', className),
      style: {
        transform: phase === 'hidden' ? `translateY(${rise}px)` : undefined,
        transitionDelay: phase === 'shown' && delay ? `${delay}ms` : undefined,
      },
    },
    children
  );
}
