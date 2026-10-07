/**
 * To-scale corrugated board cross-section, generated from getBoardSpec() (flute heights, pitch, liner).
 * Values are indicative industry figures (see boardSpecs.ts).
 */

import { AnimatePresence, motion } from 'framer-motion';
import { getBoardSpec } from '@/lib/boxDesigner/boardSpecs';
import type { PlyType } from '@/types/boxDesigner';
import { EASE } from '@/lib/motion/tokens';

// Tallest board (7-ply ≈ 10.4 mm) sets a fixed height so plies compare true to scale.
// "compact" is for phones: a narrower drawing so the SVG's labels stay ≥ 10px when it scales to ~360px wide.
const layout = (compact: boolean) => {
  const pxPerMm = compact ? 18 : 22;
  const width = compact ? 250 : 520;
  return { pxPerMm, width, labelX: width + 14, viewW: width + (compact ? 128 : 180), viewH: 10.6 * pxPerMm + 40, font: compact ? 10.5 : 11 };
};
type Layout = ReturnType<typeof layout>;

interface Row {
  kind: 'liner' | 'flute';
  y: number;
  label: string;
  d?: string;
}

function rowsFor(ply: PlyType, L: Layout): Row[] {
  const { pxPerMm: PX_PER_MM, width: WIDTH, viewH: VIEW_H } = L;
  const spec = getBoardSpec(ply);
  const liner = spec.linerMm * PX_PER_MM;
  const rows: Row[] = [];
  // Centre each board vertically so 3-ply doesn't hug the top of the fixed-height frame
  let y = (VIEW_H - spec.caliperMm * PX_PER_MM) / 2;
  const linerNames = spec.layers.length === 1 ? ['outer liner', 'inner liner'] : ['outer liner', ...spec.layers.slice(1).map(() => 'middle liner'), 'inner liner'];

  spec.layers.forEach((layer, i) => {
    rows.push({ kind: 'liner', y: y + liner / 2, label: linerNames[i] });
    y += liner;
    const h = layer.heightMm * PX_PER_MM;
    const half = (layer.pitchMm * PX_PER_MM) / 2;
    const mid = y + h / 2;
    let d = `M0 ${mid}`;
    // Quadratic apex = (mid + control) / 2, so these controls make each crest touch its liner
    for (let x = 0, up = true; x < WIDTH; x += half, up = !up) {
      d += ` Q${x + half / 2} ${up ? y - h / 2 : y + h * 1.5} ${Math.min(WIDTH, x + half)} ${mid}`;
    }
    rows.push({ kind: 'flute', y: mid, label: `${layer.flute}-flute ${layer.heightMm} mm`, d });
    y += h;
  });
  rows.push({ kind: 'liner', y: y + liner / 2, label: linerNames[linerNames.length - 1] });
  return rows;
}

export function BoardCrossSection({ ply, animate = true, compact = false, className }: { ply: PlyType; animate?: boolean; compact?: boolean; className?: string }) {
  const L = layout(compact);
  const { width: WIDTH, labelX: LABEL_X, viewW: VIEW_W, viewH: VIEW_H } = L;
  const rows = rowsFor(ply, L);
  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className={className} role="img" aria-label={`${ply} board cross-section, to scale`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.g key={ply} exit={animate ? { opacity: 0, transition: { duration: 0.18 } } : undefined}>
          {rows.map((row, i) => (
            <motion.g
              key={i}
              initial={animate ? { opacity: 0, y: -8 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, ease: EASE.fold, delay: animate ? i * 0.04 : 0 }}
            >
              {row.kind === 'liner' ? (
                <line x1="0" x2={WIDTH} y1={row.y} y2={row.y} stroke="var(--paper-100)" strokeWidth={3} />
              ) : (
                <motion.path
                  d={row.d}
                  fill="none"
                  stroke="var(--kraft-300)"
                  strokeWidth={1.5}
                  initial={animate ? { pathLength: 0 } : false}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.48, ease: EASE.fold, delay: animate ? 0.1 + i * 0.04 : 0 }}
                />
              )}
              <line x1={WIDTH + 4} x2={LABEL_X - 4} y1={row.y} y2={row.y} stroke="var(--paper-muted)" strokeOpacity="0.5" />
              <text
                x={LABEL_X}
                y={row.y}
                dominantBaseline="middle"
                fill={row.kind === 'flute' ? 'var(--cyan-400)' : 'var(--paper-muted)'}
                style={{ fontFamily: 'var(--font-mono)', fontSize: L.font, letterSpacing: '0.04em' }}
              >
                {row.label}
              </text>
            </motion.g>
          ))}
        </motion.g>
      </AnimatePresence>
    </svg>
  );
}
