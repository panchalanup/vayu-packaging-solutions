/**
 * Dieline (flat blank) generator for every style
 *  - slotted family (RSC 0201, HSC 0200, FOL 0203, sleeve): tab + four panels with their flaps
 *  - telescope: base and lid blanks on one sheet
 *  - die-cut (mailer / pizza / tray, 0427 family): drawn from the same hinge tree as the 3D model
 * Built from the same layouts as the 3D model so the two always agree.
 * Units are millimetres at 1:1. Solid black = cut, dashed red = score (fold).
 */

import type { RscLayout } from './rig/rscLayout';
import type { TelescopeLayout } from './rig/telescopeLayout';
import { flatBounds, flatPoint, walkFlat, type DieCutLayout } from './rig/dieCutLayout';
import { FACE_NAMES } from './styles/faceNames';

export interface DielineLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  kind: 'cut' | 'score';
}

export interface DielineLabel {
  x: number;
  y: number;
  text: string;
  size: number;
}

export interface Dieline {
  width: number;
  height: number;
  lines: DielineLine[];
  labels: DielineLabel[];
  /** Blank pieces in mm (telescope has two) */
  pieces: { width: number; height: number }[];
}

export interface DielineMeta {
  title: string;
  board: string;
  /** Kept for older callers; the layout already knows whether it has top flaps */
  topFlaps?: boolean;
}

const r = (n: number) => Math.round(n * 10) / 10;
const MARGIN = 20;
const FOOTER = 40;

/** Slotted blank drawn at an offset (mm); returns its lines, labels and size */
function slottedBlank(layout: RscLayout, ox: number, oy: number, name = '') {
  const mm = (cm: number) => cm * 10;
  const t = mm(layout.thickness);
  const tab = mm(layout.tab.width);
  const slot = Math.max(mm(layout.slot), 3);
  const layerCount = (layout.topFlaps ? (layout.overlapTop ? 3 : 2) : 0) + (layout.bottomFlaps ? (layout.overlapBottom ? 3 : 2) : 0);
  // score to score: inside height plus about half a caliper per flap layer
  // VERIFY-LATER[DSG-40]: confirm score allowances with the die maker
  const wallH = mm(layout.inside.height) + (layerCount / 2) * t;
  const topDepth = mm(layout.topDepth);
  const bottomDepth = mm(layout.bottomDepth);

  const lines: DielineLine[] = [];
  const labels: DielineLabel[] = [];
  const cut = (x1: number, y1: number, x2: number, y2: number) => lines.push({ x1, y1, x2, y2, kind: 'cut' });
  const score = (x1: number, y1: number, x2: number, y2: number) => lines.push({ x1, y1, x2, y2, kind: 'score' });

  const yTopScore = oy + topDepth;
  const yBottomScore = yTopScore + wallH;
  const xTab = ox;
  let x = xTab + tab;

  // glue tab (tapered)
  const taper = Math.min(15, wallH / 4);
  cut(x, yTopScore, xTab, yTopScore + taper);
  cut(xTab, yTopScore + taper, xTab, yBottomScore - taper);
  cut(xTab, yBottomScore - taper, x, yBottomScore);
  score(x, yTopScore, x, yBottomScore);
  labels.push({ x: xTab + tab / 2, y: (yTopScore + yBottomScore) / 2, text: 'glue', size: 8 });

  layout.walls.forEach((wall, i) => {
    const w = mm(wall.span);
    const x0 = x;
    const x1 = x + w;
    if (layout.topFlaps) score(x0, yTopScore, x1, yTopScore);
    else cut(x0, yTopScore, x1, yTopScore);
    if (layout.bottomFlaps) score(x0, yBottomScore, x1, yBottomScore);
    else cut(x0, yBottomScore, x1, yBottomScore);
    if (i < 3) score(x1, yTopScore, x1, yBottomScore);
    else cut(x1, yTopScore, x1, yBottomScore);

    // flaps, separated by slots
    const fx0 = x0 + (i === 0 ? 0 : slot / 2);
    const fx1 = x1 - (i === 3 ? 0 : slot / 2);
    const flap = (yScore: number, yEdge: number) => {
      cut(fx0, yScore, fx0, yEdge);
      cut(fx0, yEdge, fx1, yEdge);
      cut(fx1, yEdge, fx1, yScore);
    };
    if (layout.topFlaps) flap(yTopScore, yTopScore - mm(wall.topFlap.depth));
    if (layout.bottomFlaps) flap(yBottomScore, yBottomScore + mm(wall.bottomFlap.depth));

    const label = name ? `${name} ${wall.id}` : wall.id;
    labels.push({ x: (x0 + x1) / 2, y: (yTopScore + yBottomScore) / 2, text: `${label} ${r(w)} mm`, size: 10 });
    x = x1;
  });

  return {
    lines,
    labels,
    width: x - ox,
    height: topDepth + wallH + bottomDepth,
    wallH,
    flap: Math.max(topDepth, bottomDepth),
  };
}

function finish(lines: DielineLine[], labels: DielineLabel[], contentW: number, contentH: number, pieces: Dieline['pieces'], meta: DielineMeta, detail: string): Dieline {
  const width = contentW + 2 * MARGIN;
  const bottom = MARGIN + contentH;
  labels.push({ x: MARGIN, y: bottom + MARGIN + 6, text: meta.title, size: 9 });
  labels.push({
    x: MARGIN,
    y: bottom + MARGIN + 20,
    text: `${meta.board} | ${detail} | cut = solid, score = dashed | scale 1:1`,
    size: 7,
  });
  return { width, height: bottom + MARGIN + FOOTER, lines, labels, pieces };
}

/** Slotted family (RSC, HSC, FOL, sleeve) */
export function buildDieline(layout: RscLayout, meta: DielineMeta): Dieline {
  const b = slottedBlank(layout, MARGIN, MARGIN);
  return finish(b.lines, b.labels, b.width, b.height, [{ width: b.width, height: b.height }], meta,
    `wall height ${r(b.wallH)} mm | flap ${r(b.flap)} mm | blank ${r(b.width)} x ${r(b.height)} mm`);
}

/** Telescope: base blank on top, lid blank below it */
export function buildTelescopeDieline(layout: TelescopeLayout, meta: DielineMeta): Dieline {
  const base = slottedBlank(layout.base, MARGIN, MARGIN, 'base');
  const gap = 30;
  const lid = slottedBlank(layout.lid, MARGIN, MARGIN + base.height + gap, 'lid');
  const width = Math.max(base.width, lid.width);
  return finish(
    [...base.lines, ...lid.lines],
    [...base.labels, ...lid.labels],
    width,
    base.height + gap + lid.height,
    [
      { width: base.width, height: base.height },
      { width: lid.width, height: lid.height },
    ],
    meta,
    `base ${r(base.width)} x ${r(base.height)} mm, lid ${r(lid.width)} x ${r(lid.height)} mm (lid depth ${r(layout.lidDepth * 10)} mm)`
  );
}

interface Seg {
  a: [number, number];
  b: [number, number];
}

const EPS = 1e-6;

/** Remove the parts of a cut that lie on a score (a hinge shares its parent's edge) */
function subtractScores(cutSeg: Seg, scores: Seg[]): Seg[] {
  const horizontal = Math.abs(cutSeg.a[1] - cutSeg.b[1]) < EPS;
  const vertical = Math.abs(cutSeg.a[0] - cutSeg.b[0]) < EPS;
  if (!horizontal && !vertical) return [cutSeg];
  const axis = horizontal ? 0 : 1;
  const fixed = horizontal ? cutSeg.a[1] : cutSeg.a[0];
  let intervals: [number, number][] = [[Math.min(cutSeg.a[axis], cutSeg.b[axis]), Math.max(cutSeg.a[axis], cutSeg.b[axis])]];
  for (const s of scores) {
    const sameLine = horizontal
      ? Math.abs(s.a[1] - fixed) < EPS && Math.abs(s.b[1] - fixed) < EPS
      : Math.abs(s.a[0] - fixed) < EPS && Math.abs(s.b[0] - fixed) < EPS;
    if (!sameLine) continue;
    const lo = Math.min(s.a[axis], s.b[axis]);
    const hi = Math.max(s.a[axis], s.b[axis]);
    intervals = intervals.flatMap(([p, q]) => {
      if (hi <= p + EPS || lo >= q - EPS) return [[p, q] as [number, number]];
      const out: [number, number][] = [];
      if (lo > p + EPS) out.push([p, lo]);
      if (hi < q - EPS) out.push([hi, q]);
      return out;
    });
  }
  return intervals.map(([p, q]) =>
    horizontal ? { a: [p, fixed], b: [q, fixed] } : { a: [fixed, p], b: [fixed, q] }
  );
}

/** Die-cut family: every panel outline from the hinge tree; hinge edges are scores */
export function buildDieCutDieline(layout: DieCutLayout, meta: DielineMeta): Dieline {
  const bounds = flatBounds(layout.root);
  // base frame +y is the front: draw the front at the bottom of the sheet (SVG y grows downward)
  const toMm = ([x, y]: [number, number]): [number, number] => [
    MARGIN + (x - bounds.x0) * 10,
    MARGIN + (bounds.y1 - y) * 10,
  ];
  const cuts: Seg[] = [];
  const scores: Seg[] = [];
  const labels: DielineLabel[] = [];

  walkFlat(layout.root, (node, frame) => {
    const { x0, x1, y0, y1 } = node.rect;
    const p = (x: number, y: number) => toMm(flatPoint(frame, x, y));
    const bottom = { a: p(x0, y0), b: p(x1, y0) };
    const others = [
      { a: p(x1, y0), b: p(x1, y1) },
      { a: p(x1, y1), b: p(x0, y1) },
      { a: p(x0, y1), b: p(x0, y0) },
    ];
    if (node.hinge) scores.push(bottom);
    else cuts.push(bottom);
    cuts.push(...others);

    if (node.face) {
      const [cx, cy] = p((x0 + x1) / 2, (y0 + y1) / 2);
      labels.push({ x: cx, y: cy, text: FACE_NAMES[node.face] ?? node.face, size: 10 });
    }
  });

  const lines: DielineLine[] = [];
  for (const s of scores) lines.push({ x1: s.a[0], y1: s.a[1], x2: s.b[0], y2: s.b[1], kind: 'score' });
  for (const c of cuts) {
    for (const piece of subtractScores(c, scores)) {
      if (Math.hypot(piece.b[0] - piece.a[0], piece.b[1] - piece.a[1]) < 0.05) continue;
      lines.push({ x1: piece.a[0], y1: piece.a[1], x2: piece.b[0], y2: piece.b[1], kind: 'cut' });
    }
  }

  const w = (bounds.x1 - bounds.x0) * 10;
  const h = (bounds.y1 - bounds.y0) * 10;
  return finish(lines, labels, w, h, [{ width: w, height: h }], meta,
    `blank ${r(w)} x ${r(h)} mm | depth ${r(layout.inside.height * 10)} mm inside`);
}

const escapeXml = (s: string) => s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!);

export function dielineToSvg(d: Dieline): string {
  const lines = d.lines
    .map(
      (l) =>
        `<line x1="${r(l.x1)}" y1="${r(l.y1)}" x2="${r(l.x2)}" y2="${r(l.y2)}" ${
          l.kind === 'cut' ? 'stroke="#000" stroke-width="0.5"' : 'stroke="#d0021b" stroke-width="0.5" stroke-dasharray="4 2"'
        }/>`
    )
    .join('\n');
  const labels = d.labels
    .map((t) => `<text x="${r(t.x)}" y="${r(t.y)}" font-size="${t.size}" font-family="Arial" fill="#333" ${t.size >= 10 ? 'text-anchor="middle"' : ''}>${escapeXml(t.text)}</text>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${r(d.width)}mm" height="${r(d.height)}mm" viewBox="0 0 ${r(d.width)} ${r(d.height)}">
${lines}
${labels}
</svg>`;
}

/** PDF at 1:1 on a page sized to the blank (jsPDF is loaded only when needed) */
export async function dielineToPdf(d: Dieline): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: [d.width, d.height], orientation: d.width > d.height ? 'landscape' : 'portrait' });
  for (const l of d.lines) {
    if (l.kind === 'cut') {
      doc.setDrawColor(0, 0, 0);
      doc.setLineDashPattern([], 0);
    } else {
      doc.setDrawColor(208, 2, 27);
      doc.setLineDashPattern([4, 2], 0);
    }
    doc.setLineWidth(0.3);
    doc.line(l.x1, l.y1, l.x2, l.y2);
  }
  doc.setLineDashPattern([], 0);
  doc.setTextColor(51, 51, 51);
  for (const t of d.labels) {
    doc.setFontSize(t.size * 2.2);
    doc.text(t.text, t.x, t.y, { align: t.size >= 10 ? 'center' : 'left' });
  }
  return doc.output('blob');
}
