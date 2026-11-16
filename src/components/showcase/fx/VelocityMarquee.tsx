/**
 * A marquee that reacts to your scrolling: it drifts on its own and speeds up and leans (skew) with the page's scroll
 * speed, then settles. One animation frame loop per marquee, only while it is on screen, transform only; with reduced
 * motion it does not move. The track is the content twice, so wrapping by one copy's width has no seam.
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// --- shared scroll speed (px/s), computed from scroll events, decaying with time so no loop is needed ---------
let lastY = 0;
let lastT = 0;
let vel = 0;
let lastEvent = 0;
let started = false;

function onScroll() {
  const now = performance.now();
  const y = window.scrollY;
  const dt = Math.max(1, now - lastT);
  vel = vel * 0.6 + ((y - lastY) / dt) * 1000 * 0.4;
  lastY = y;
  lastT = now;
  lastEvent = now;
}

function startScrollSpeed() {
  if (started || typeof window === 'undefined') return;
  started = true;
  lastY = window.scrollY;
  lastT = performance.now();
  window.addEventListener('scroll', onScroll, { passive: true });
}

export const scrollSpeed = (): number => vel * Math.exp(-(performance.now() - lastEvent) / 140);

// ---------------------------------------------------------------------------------------------------------------

const FADE = { paper: 'from-background', ink: 'from-ink-900', 'ink-950': 'from-ink-950' } as const;

interface VelocityMarqueeProps {
  children: ReactNode;
  /** Resting speed, px per second */
  speed?: number;
  reverse?: boolean;
  /** How strongly scroll speed adds to the drift and leans the row (0 = not at all) */
  reactive?: number;
  className?: string;
  trackClassName?: string;
  /** Background the row sits on, so its ends can fade into it (two static gradients; a moving mask would be repainted every frame) */
  fade?: 'paper' | 'ink' | 'ink-950';
}

export default function VelocityMarquee({ children, speed = 42, reverse = false, reactive = 1, className, trackClassName, fade = 'ink' }: VelocityMarqueeProps) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    startScrollSpeed();
    const first = tr.firstElementChild as HTMLElement | null;
    if (!first) return;

    let w = first.getBoundingClientRect().width;
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => (w = first.getBoundingClientRect().width)) : null;
    ro?.observe(first);

    const dir = reverse ? 1 : -1;
    let x = reverse ? -w : 0;
    let frame = 0;
    let last = 0;
    let hover = false;
    const tick = (t: number) => {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016;
      last = t;
      const v = scrollSpeed() * reactive;
      const drift = (hover ? speed * 0.25 : speed) + Math.min(Math.abs(v) * 0.14, 900);
      x += dir * drift * dt;
      if (w > 0) {
        if (!reverse && x <= -w) x += w;
        if (reverse && x >= 0) x -= w;
      }
      const skew = Math.max(-7, Math.min(7, v / 420));
      tr.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0) skewX(${(-skew).toFixed(2)}deg)`;
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: '10% 0px' });
    io.observe(el);
    const enter = () => (hover = true);
    const leave = () => (hover = false);
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);
    return () => {
      stop();
      io.disconnect();
      ro?.disconnect();
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
    };
  }, [speed, reverse, reactive]);

  return (
    <div ref={root} className={cn('relative overflow-hidden', className)}>
      <div ref={track} className={cn('flex w-max will-change-transform', trackClassName)}>
        <div className="flex shrink-0 gap-4 pr-4">{children}</div>
        <div className="flex shrink-0 gap-4 pr-4" aria-hidden="true">
          {children}
        </div>
      </div>
      <span aria-hidden="true" className={cn('pointer-events-none absolute inset-y-0 left-0 w-[7%] bg-gradient-to-r to-transparent', FADE[fade])} />
      <span aria-hidden="true" className={cn('pointer-events-none absolute inset-y-0 right-0 w-[7%] bg-gradient-to-l to-transparent', FADE[fade])} />
    </div>
  );
}
