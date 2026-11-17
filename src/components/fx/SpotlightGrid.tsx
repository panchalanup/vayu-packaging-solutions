/**
 * A light that follows the mouse across a grid of cards: the cards' borders light up where it passes and the nearest
 * cards glow faintly. One pointermove listener on the grid writes --x / --y on each direct child that has .fx-glow
 * (one animation frame per move, no React render). Mouse only: touch and reduced motion keep the plain cards.
 */

import { createElement, useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';

interface SpotlightGridProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'ul' | 'ol';
  children: ReactNode;
}

export function SpotlightGrid({ as = 'div', children, ...rest }: SpotlightGridProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      frame = 0;
      for (const card of Array.from(el.children) as HTMLElement[]) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--x', `${(x - r.left).toFixed(0)}px`);
        card.style.setProperty('--y', `${(y - r.top).toFixed(0)}px`);
      }
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      el.dataset.fx = 'on';
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const leave = () => {
      delete el.dataset.fx;
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, []);

  return createElement(as, { ref, ...rest }, children);
}
