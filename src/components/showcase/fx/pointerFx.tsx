/**
 * Pointer effects for desktop (a mouse over something that can hover). All of them are no-ops on touch screens and
 * with reduced motion, and all write transforms or CSS variables only, throttled to one animation frame.
 *   usePointerFx : sets --mx / --my (pointer position inside the element, for a spotlight) and optionally tilts it
 *   Magnetic     : the child is pulled a little toward the pointer when it comes near
 */

import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { cn } from '@/lib/utils';

const canHover = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function usePointerFx(ref: RefObject<HTMLElement>, { tilt = 0 }: { tilt?: number } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !canHover()) return;
    let frame = 0;
    let px = 0;
    let py = 0;
    let rect = el.getBoundingClientRect();
    const apply = () => {
      frame = 0;
      el.style.setProperty('--mx', `${px}px`);
      el.style.setProperty('--my', `${py}px`);
      if (tilt) {
        const rx = ((px / rect.width) - 0.5) * 2 * tilt;
        const ry = -((py / rect.height) - 0.5) * 2 * tilt;
        el.style.transform = `perspective(900px) rotateX(${ry.toFixed(2)}deg) rotateY(${rx.toFixed(2)}deg)`;
      }
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      px = e.clientX - rect.left;
      py = e.clientY - rect.top;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const enter = () => {
      rect = el.getBoundingClientRect();
      el.dataset.fx = 'on';
    };
    const leave = () => {
      delete el.dataset.fx;
      if (tilt) el.style.transform = '';
    };
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [ref, tilt]);
}

export function Magnetic({ children, strength = 0.32, className }: { children: ReactNode; strength?: number; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const w = wrap.current;
    const i = inner.current;
    if (!w || !i || !canHover()) return;
    let frame = 0;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      i.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      frame = Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = w.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * strength;
      ty = (e.clientY - (r.top + r.height / 2)) * strength;
      kick();
    };
    const leave = () => {
      tx = 0;
      ty = 0;
      kick();
    };
    w.addEventListener('pointermove', move);
    w.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(frame);
      w.removeEventListener('pointermove', move);
      w.removeEventListener('pointerleave', leave);
    };
  }, [strength]);

  // the wrapper is a little larger than the button, so the pull starts as the pointer approaches
  return (
    <div ref={wrap} className={cn('inline-block p-3 -m-3', className)}>
      <div ref={inner} className="will-change-transform">
        {children}
      </div>
    </div>
  );
}
