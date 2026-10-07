/**
 * Lightweight SVG posters for the hero: the flat RSC dieline (cut = solid, crease = dashed) and a sealed box.
 * Generated from the same RSC geometry as the 3D rig, so the poster and the live box always match.
 */

import { useMemo } from 'react';
import { computeRscLayout } from '@/lib/boxDesigner/rig/rscLayout';
import { HERO_BOX } from './foldStore';

const T = 0.66;

export function DielinePoster({ className = '' }: { className?: string }) {
  const { panels, creases, cuts, view } = useMemo(() => {
    const layout = computeRscLayout(HERO_BOX, T);
    const yTop = Math.max(...layout.walls.map((w) => w.y1 + w.topFlap.depth));
    const yBottom = Math.min(...layout.walls.map((w) => w.y0 - w.bottomFlap.depth));
    // SVG y grows downward
    const Y = (y: number) => yTop - y;

    const rects: { x: number; y: number; w: number; h: number }[] = [];
    const creaseLines: string[] = [];
    const cutPaths: string[] = [];

    let x = 0;
    layout.walls.forEach((wall, i) => {
      rects.push({ x, y: Y(wall.y1), w: wall.span, h: wall.y1 - wall.y0 });
      creaseLines.push(`M${x} ${Y(wall.y1)}H${x + wall.span}`, `M${x} ${Y(wall.y0)}H${x + wall.span}`);
      if (i > 0) creaseLines.push(`M${x} ${Y(wall.y0)}V${Y(wall.y1)}`);

      const t = wall.topFlap;
      const tx = x + t.x0;
      rects.push({ x: tx, y: Y(wall.y1 + t.depth), w: t.width, h: t.depth });
      cutPaths.push(`M${tx} ${Y(wall.y1)}V${Y(wall.y1 + t.depth)}H${tx + t.width}V${Y(wall.y1)}`);

      const b = wall.bottomFlap;
      const bx = x + b.x0;
      rects.push({ x: bx, y: Y(wall.y0), w: b.width, h: b.depth });
      cutPaths.push(`M${bx} ${Y(wall.y0)}V${Y(wall.y0 - b.depth)}H${bx + b.width}V${Y(wall.y0)}`);

      x += wall.span;
      if (i === layout.walls.length - 1) cutPaths.push(`M${x} ${Y(wall.y0)}V${Y(wall.y1)}`);
    });

    const tab = layout.tab;
    rects.push({ x: -tab.width, y: Y(tab.y0 + tab.height), w: tab.width, h: tab.height });
    cutPaths.push(`M0 ${Y(tab.y0 + tab.height)}L${-tab.width} ${Y(tab.y0 + tab.height - 1.5)}V${Y(tab.y0 + 1.5)}L0 ${Y(tab.y0)}`);
    creaseLines.push(`M0 ${Y(layout.walls[0].y0)}V${Y(layout.walls[0].y1)}`);

    const pad = 6;
    return {
      panels: rects,
      creases: creaseLines.join(''),
      cuts: cutPaths.join(''),
      view: `${-tab.width - pad} ${-pad} ${x + tab.width + pad * 2} ${yTop - yBottom + pad * 2}`,
    };
  }, []);

  return (
    <svg viewBox={view} className={className} role="img" aria-label="Flat corrugated box dieline: solid lines are cuts, dashed lines are creases">
      <g fill="var(--kraft-300)">
        {panels.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} />
        ))}
      </g>
      <path d={cuts} fill="none" stroke="var(--ink-900)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <path d={creases} fill="none" stroke="var(--ink-900)" strokeWidth="1" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Isometric sealed box with the tape strip across the top seam */
export function SealedPoster({ className = '' }: { className?: string }) {
  const L = HERO_BOX.length;
  const W = HERO_BOX.width;
  const H = HERO_BOX.height;
  const c = Math.cos(Math.PI / 6);
  const s = 0.5;
  const P = (x: number, y: number, z: number) => `${(x - z) * c},${(x + z) * s - y}`;

  const top = [P(0, H, 0), P(L, H, 0), P(L, H, W), P(0, H, W)].join(' ');
  const front = [P(0, 0, W), P(L, 0, W), P(L, H, W), P(0, H, W)].join(' ');
  const side = [P(L, 0, 0), P(L, 0, W), P(L, H, W), P(L, H, 0)].join(' ');
  const tape = [P(0, H, W / 2 - 2.4), P(L, H, W / 2 - 2.4), P(L, H, W / 2 + 2.4), P(0, H, W / 2 + 2.4)].join(' ');
  const tapeFront = [P(0, H, W / 2 - 2.4), P(0, H - 6, W / 2 - 2.4), P(0, H - 6, W / 2 + 2.4), P(0, H, W / 2 + 2.4)].join(' ');
  const seam = `M${P(0, H, W / 2)}L${P(L, H, W / 2)}`;

  return (
    <svg viewBox={`${-W * c - 4} ${-H - 4} ${(L + W) * c + 8} ${(L + W) * s + H + 8}`} className={className} role="img" aria-label="Sealed corrugated box with tape across the top">
      <polygon points={side} fill="#B8935F" />
      <polygon points={front} fill="var(--kraft-400)" />
      <polygon points={top} fill="var(--kraft-300)" />
      <path d={seam} stroke="var(--ink-900)" strokeOpacity="0.35" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <polygon points={tape} fill="#E9D9BC" fillOpacity="0.85" />
      <polygon points={tapeFront} fill="#E9D9BC" fillOpacity="0.75" />
      <g fill="none" stroke="var(--ink-900)" strokeOpacity="0.5" strokeWidth="1" vectorEffect="non-scaling-stroke">
        <polygon points={top} />
        <polygon points={front} />
        <polygon points={side} />
      </g>
    </svg>
  );
}
