/**
 * Dieline (flat blank) generator for every style
 *  - slotted family (RSC 0201, HSC 0200, FOL 0203, sleeve): tab + four panels with their flaps
 *  - telescope: base and lid blanks on one sheet
 *  - die-cut (mailer / pizza / tray, 0427 family): drawn from the same hinge tree as the 3D model
 * Built from the same layouts as the 3D model so the two always agree.
 * Units are millimetres at 1:1. Solid black = cut, dashed red = score (fold).
 */

import type { FlapLayout, RscLayout, WallLayout } from './rig/rscLayout';
import { openingOutlines, type OpeningMap, type PanelOpening } from './rig/openings';
import type { TelescopeLayout } from './rig/telescopeLayout';
import type { SlideLayout } from './rig/slideLayout';
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

/**
 * Real cut lines for cut-outs (hand holes, vents, windows). `cxMm, cyMm` is the panel centre on the sheet (mm);
 * opening coordinates are panel-local cm from that centre, +y up. `mapPoint` turns a panel-local offset in mm
 * (+y up) into a sheet offset when the panel is rotated or flipped on the sheet (default: +x right, +y up).
 * Returns the number of cut-outs appended.
 */
export function appendOpeningCuts(
  lines: DielineLine[],
  openings: readonly PanelOpening[] | undefined,
  cxMm: number,
  cyMm: number,
  mapPoint: (px: number, py: number) => [number, number] = (px, py) => [px, -py]
): number {
  if (!openings) return 0;
  for (const opening of openings) {
    for (const outline of openingOutlines(opening)) {
      const pts = outline.map(([x, y]) => {
        const [dx, dy] = mapPoint(x * 10, y * 10);
        return [cxMm + dx, cyMm + dy] as [number, number];
      });
      pts.forEach((a, i) => {
        const b = pts[(i + 1) % pts.length];
        lines.push({ x1: a[0], y1: a[1], x2: b[0], y2: b[1], kind: 'cut' });
      });
    }
  }
  return openings.length;
}

const countOpenings = (map: OpeningMap) => Object.values(map).reduce((n, list) => n + (list?.length ?? 0), 0);
const cutOutNote = (map: OpeningMap) => (countOpenings(map) > 0 ? ` | ${countOpenings(map)} cut-out${countOpenings(map) > 1 ? 's' : ''}` : '');

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

  /** Crash-lock: diagonal fold lines from the bottom corners of a long wall's lock flap */
  const lockCreases = (wall: WallLayout, x0: number, x1: number) => {
    const flap = wall.bottomFlap;
    if (flap.depth <= 0) return;
    const d = Math.min(mm(flap.depth), (x1 - x0) / 2);
    const y = oy + topDepth + wallH;
    score(x0 + mm(flap.x0), y, x0 + mm(flap.x0) + d * 0.6, y + d * 0.6);
    score(x0 + mm(flap.x0) + mm(flap.width), y, x0 + mm(flap.x0) + mm(flap.width) - d * 0.6, y + d * 0.6);
  };

  const appendWallCuts = (wall: WallLayout, x0: number, w: number) => {
    const yMid = oy + topDepth + wallH / 2;
    const yTop = oy + topDepth;
    const yBottom = yTop + wallH;
    const wallList = layout.openings[wall.face];
    if (wallList) appendOpeningCuts(lines, wallList, x0 + w / 2, yMid);
    const topList = wall.topFlap.face ? layout.openings[wall.topFlap.face] : undefined;
    if (topList && wall.topFlap.depth > 0) {
      appendOpeningCuts(lines, topList, x0 + mm(wall.topFlap.x0 + wall.topFlap.width / 2), yTop - mm(wall.topFlap.depth) / 2);
    }
    const bottomList = wall.bottomFlap.face ? layout.openings[wall.bottomFlap.face] : undefined;
    if (bottomList && wall.bottomFlap.depth > 0) {
      appendOpeningCuts(lines, bottomList, x0 + mm(wall.bottomFlap.x0 + wall.bottomFlap.width / 2), yBottom + mm(wall.bottomFlap.depth) / 2);
    }
  };

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

  /** Tuck-end and lock closures: each wall end is its own shape (flap x range, depth, tuck tab or nothing) */
  const closureEdge = (flap: FlapLayout, x0: number, x1: number, y: number, dir: 1 | -1) => {
    if (flap.depth <= 0) {
      cut(x0, y, x1, y);
      return;
    }
    const fx0 = x0 + mm(flap.x0);
    const fx1 = fx0 + mm(flap.width);
    cut(x0, y, fx0, y);
    score(fx0, y, fx1, y);
    cut(fx1, y, x1, y);
    const yEdge = y + dir * mm(flap.depth);
    // small corner chamfers so the flap clears its neighbours when folding
    const c = Math.min(4, mm(flap.depth) / 4, mm(flap.width) / 8);
    cut(fx0, y, fx0, yEdge - dir * (flap.tuck ? 0 : c));
    if (!flap.tuck) {
      cut(fx0, yEdge - dir * c, fx0 + c, yEdge);
      cut(fx0 + c, yEdge, fx1 - c, yEdge);
      cut(fx1 - c, yEdge, fx1, yEdge - dir * c);
    } else {
      score(fx0, yEdge, fx1, yEdge);
    }
    cut(fx1, yEdge - dir * (flap.tuck ? 0 : c), fx1, y);
    if (flap.tuck) {
      const tx0 = x0 + mm(flap.tuck.x0);
      const tx1 = tx0 + mm(flap.tuck.width);
      const tEdge = yEdge + dir * mm(flap.tuck.depth);
      const tc = Math.min(6, mm(flap.tuck.depth) * 0.6);
      cut(tx0, yEdge, tx0, tEdge - dir * tc);
      cut(tx0, tEdge - dir * tc, tx0 + tc, tEdge);
      cut(tx0 + tc, tEdge, tx1 - tc, tEdge);
      cut(tx1 - tc, tEdge, tx1, tEdge - dir * tc);
      cut(tx1, tEdge - dir * tc, tx1, yEdge);
    }
  };

  layout.walls.forEach((wall, i) => {
    const w = mm(wall.span);
    const x0 = x;
    const x1 = x + w;
    const customTop = layout.topFlaps && layout.closures.top !== 'flaps';
    const customBottom = layout.bottomFlaps && layout.closures.bottom !== 'flaps';
    if (customTop) closureEdge(wall.topFlap, x0, x1, yTopScore, -1);
    else if (layout.topFlaps) score(x0, yTopScore, x1, yTopScore);
    else cut(x0, yTopScore, x1, yTopScore);
    if (customBottom) closureEdge(wall.bottomFlap, x0, x1, yBottomScore, 1);
    else if (layout.bottomFlaps) score(x0, yBottomScore, x1, yBottomScore);
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
    if (layout.topFlaps && !customTop) flap(yTopScore, yTopScore - mm(wall.topFlap.depth));
    if (layout.bottomFlaps && !customBottom) flap(yBottomScore, yBottomScore + mm(wall.bottomFlap.depth));
    if (customBottom && layout.closures.bottom === 'lock') lockCreases(wall, x0, x1);

    // cut-outs: panel centre -> sheet position (panel +y is up on the sheet, so sheet y = centre - y)
    appendWallCuts(wall, x0, w);

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
    `wall height ${r(b.wallH)} mm | flap ${r(b.flap)} mm | blank ${r(b.width)} x ${r(b.height)} mm${cutOutNote(layout.openings)}`);
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
    `base ${r(base.width)} x ${r(base.height)} mm, lid ${r(lid.width)} x ${r(lid.height)} mm (lid depth ${r(layout.lidDepth * 10)} mm)${cutOutNote({ ...layout.base.openings, ...layout.lid.openings })}`
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
  const openingLines: DielineLine[] = [];

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
      const cutOuts = layout.openings?.[node.face];
      if (cutOuts?.length) {
        // panel-local offset (mm, +y up) -> sheet offset, through the panel's place in the flat blank
        const mid = [(x0 + x1) / 2, (y0 + y1) / 2] as const;
        appendOpeningCuts(openingLines, cutOuts, cx, cy, (px, py) => {
          const [sx, sy] = p(mid[0] + px / 10, mid[1] + py / 10);
          return [sx - cx, sy - cy];
        });
      }
    }
  });

  const lines: DielineLine[] = [];
  for (const s of scores) lines.push({ x1: s.a[0], y1: s.a[1], x2: s.b[0], y2: s.b[1], kind: 'score' });
  lines.push(...openingLines);
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

/** Slide box: tray blank on top, sleeve blank below it (each drawn by the die-cut builder) */
export function buildSlideDieline(layout: SlideLayout, meta: DielineMeta): Dieline {
  const gap = 30;
  const tray = buildDieCutDieline(layout.tray, meta);
  const sleeve = buildDieCutDieline(layout.sleeve, meta);
  const trayH = tray.pieces[0].height;
  const sleeveH = sleeve.pieces[0].height;
  const dy = trayH + gap;
  const shift = (l: DielineLine): DielineLine => ({ ...l, y1: l.y1 + dy, y2: l.y2 + dy });
  // the part dielines carry their own footer text (size < 10); keep only the surface labels
  const surfaceLabels = (d: Dieline, extraY: number) =>
    d.labels.filter((t) => t.size >= 10).map((t) => ({ ...t, y: t.y + extraY }));
  const trayMm = tray.pieces[0];
  const sleeveMm = sleeve.pieces[0];
  return finish(
    [...tray.lines, ...sleeve.lines.map(shift)],
    [...surfaceLabels(tray, 0), ...surfaceLabels(sleeve, dy)],
    Math.max(trayMm.width, sleeveMm.width),
    trayH + gap + sleeveH,
    [trayMm, sleeveMm],
    meta,
    `tray ${r(trayMm.width)} x ${r(trayMm.height)} mm, sleeve ${r(sleeveMm.width)} x ${r(sleeveMm.height)} mm`
  );
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
