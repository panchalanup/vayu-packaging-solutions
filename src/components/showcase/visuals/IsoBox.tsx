/**
 * An isometric box that eases between sizes, with an optional product floating inside it. Everything is updated
 * straight on the SVG attributes in one animation-frame loop (no React render per frame), and only while it is moving.
 * The scale follows the box so a small box and a big one both fill the frame, and the three size readouts ride the
 * edges. Dimensions are centimetres in, millimetres on screen.
 */

import { useEffect, useRef } from 'react';
import type { BoxDimensions } from '@/types/boxDesigner';
import { fitScale, iso, isoBounds, prismFaces } from '../fx/iso';

const W = 520;
const H = 420;

interface IsoBoxProps {
  box: BoxDimensions;
  product?: BoxDimensions | null;
  className?: string;
  label: string;
}

const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function IsoBox({ box, product, className, label }: IsoBoxProps) {
  const els = useRef<Record<string, SVGElement | null>>({});
  const current = useRef<number[] | null>(null);
  const set = (key: string) => (el: SVGElement | null) => {
    els.current[key] = el;
  };

  const draw = (v: number[]) => {
    const [L, Wd, Ht, l, w, h] = v;
    const b = isoBounds(L, Wd, Ht);
    const s = fitScale(b, W, H, 0.18);
    const ox = W / 2 - ((b.minX + b.maxX) / 2) * s;
    const oy = H / 2 - ((b.minY + b.maxY) / 2) * s - 6;
    const boxFaces = prismFaces(L, Wd, Ht, s, ox, oy);
    const prodFaces = prismFaces(l, w, h, s, ox, oy, (L - l) / 2, (Wd - w) / 2, (Ht - h) / 2);
    const put = (key: string, points: string) => els.current[key]?.setAttribute('points', points);
    put('bTop', boxFaces.top);
    put('bLeft', boxFaces.left);
    put('bRight', boxFaces.right);
    put('pTop', prodFaces.top);
    put('pLeft', prodFaces.left);
    put('pRight', prodFaces.right);
    // size readouts sit on the three visible edges
    const place = (key: string, x: number, y: number, dx: number, dy: number, text: string) => {
      const el = els.current[key];
      if (!el) return;
      const p = iso(x, y, 0, s);
      el.setAttribute('x', String(Math.round((p.x + ox + dx) * 10) / 10));
      el.setAttribute('y', String(Math.round((p.y + oy + dy) * 10) / 10));
      el.textContent = text;
    };
    place('tL', L / 2, Wd, -18, 22, String(Math.round(L * 10)));
    place('tW', L, Wd / 2, 22, 22, String(Math.round(Wd * 10)));
    const top = iso(L, Wd, Ht / 2, s);
    const th = els.current.tH;
    if (th) {
      th.setAttribute('x', String(Math.round((top.x + ox + 20) * 10) / 10));
      th.setAttribute('y', String(Math.round((top.y + oy + 4) * 10) / 10));
      th.textContent = String(Math.round(Ht * 10));
    }
    const shadow = els.current.shadow;
    if (shadow) {
      const c = iso(L / 2, Wd / 2, 0, s);
      shadow.setAttribute('cx', String(Math.round(c.x + ox)));
      shadow.setAttribute('cy', String(Math.round(c.y + oy + 8)));
      shadow.setAttribute('rx', String(Math.round(((L + Wd) / 2) * s * 0.7)));
      shadow.setAttribute('ry', String(Math.round(((L + Wd) / 2) * s * 0.22)));
    }
  };

  useEffect(() => {
    const target = [box.length, box.width, box.height, product?.length ?? 0.01, product?.width ?? 0.01, product?.height ?? 0.01];
    const productEls = ['pTop', 'pLeft', 'pRight'];
    productEls.forEach((k) => els.current[k]?.setAttribute('opacity', product ? '1' : '0'));
    // the first draw grows out of a smaller box, so the scene arrives with a little motion
    const from = current.current ?? target.map((n, i) => (i < 3 ? n * 0.55 : n * 0.4));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      current.current = target;
      draw(target);
      return;
    }
    let frame = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 720);
      const v = from.map((a, i) => lerp(a, target[i], ease(p)));
      current.current = v;
      draw(v);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // draw only reads refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box.length, box.width, box.height, product?.length, product?.width, product?.height, !!product]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={label}>
      <ellipse ref={set('shadow')} cx={W / 2} cy={H - 90} rx={150} ry={40} fill="#000" opacity="0.28" />
      <g className="sc-chip">
        {/* the product, solid */}
        <polygon ref={set('pLeft')} fill="#B8B2A6" stroke="#0F1A14" strokeOpacity="0.4" strokeWidth="1" />
        <polygon ref={set('pRight')} fill="#CFC8BB" stroke="#0F1A14" strokeOpacity="0.4" strokeWidth="1" />
        <polygon ref={set('pTop')} fill="#E9E1D3" stroke="#0F1A14" strokeOpacity="0.4" strokeWidth="1" />
        {/* the box around it, see-through */}
        <polygon ref={set('bLeft')} fill="#C9A87C" fillOpacity="0.2" stroke="#E2C79B" strokeWidth="1.8" strokeLinejoin="round" />
        <polygon ref={set('bRight')} fill="#C9A87C" fillOpacity="0.28" stroke="#E2C79B" strokeWidth="1.8" strokeLinejoin="round" />
        <polygon ref={set('bTop')} fill="#E2C79B" fillOpacity="0.14" stroke="#E2C79B" strokeWidth="1.8" strokeLinejoin="round" />
      </g>
      {(['tL', 'tW', 'tH'] as const).map((k) => (
        <text key={k} ref={set(k)} textAnchor="middle" fontSize="15" fill="#3DBA5A" fontFamily="var(--font-mono)" style={{ fontVariantNumeric: 'tabular-nums' }} />
      ))}
    </svg>
  );
}
