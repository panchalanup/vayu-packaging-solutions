/**
 * Dieline (flat blank) generator for every style
 *  - slotted family (RSC 0201, HSC 0200, FOL 0203, sleeve): tab + four panels with their flaps
 *  - telescope: base and lid blanks on one sheet
 *  - die-cut (mailer / pizza / tray, 0427 family): drawn from the same hinge tree as the 3D model
 * Built from the same layouts as the 3D model so the two always agree.
 * Units are millimetres at 1:1. Solid black = cut, dashed red = score (fold), thin blue = dimension.
 * Dimension lines, the legend swatches and the print-scale ruler live in separate arrays (dims / keys / ruler) so the
 * cut and score line data that pricing, strength and the tests read stays exactly as it was.
 */

import type { FlapLayout, RscLayout, WallLayout } from './rig/rscLayout';
import { openingOutlines, type OpeningMap, type PanelOpening } from './rig/openings';
import type { TelescopeLayout } from './rig/telescopeLayout';
import type { SlideLayout } from './rig/slideLayout';
import { flatBounds, flatPoint, walkFlat, type DieCutLayout } from './rig/dieCutLayout';
import { FACE_NAMES } from './styles/faceNames';
import type { BoxFace } from '@/types/boxDesigner';

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

/** Axis-aligned dimension line (mm). `group` lets a page reveal them in steps (panels, then flaps, then the whole blank) */
export interface DielineDim {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  text: string;
  group: 'panel' | 'depth' | 'glue' | 'blank';
}

/** Legend swatch: a short sample of a line style, drawn next to its caption in the footer */
export interface DielineKey {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  kind: 'cut' | 'score' | 'dim';
}

/** A printable panel on the sheet (mm): lets a page link a shape on the flat blank to the same face on the 3D box */
export interface DielinePanel {
  face: BoxFace;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** Print-scale check bar: measure it with a ruler after printing (ticks every 10 mm) */
export interface DielineRuler {
  x: number;
  y: number;
  length: number;
}

export interface Dieline {
  width: number;
  height: number;
  lines: DielineLine[];
  labels: DielineLabel[];
  /** Blank pieces in mm (telescope has two) */
  pieces: { width: number; height: number }[];
  /** Dimension lines (older callers may build a Dieline without them) */
  dims?: DielineDim[];
  keys?: DielineKey[];
  ruler?: DielineRuler | null;
  panels?: DielinePanel[];
}

export interface DielineMeta {
  title: string;
  board: string;
  /** Kept for older callers; the layout already knows whether it has top flaps */
  topFlaps?: boolean;
}

const r = (n: number) => Math.round(n * 10) / 10;
const MARGIN = 20;
/** Space under the blank for the title, details, legend, print notes and the ruler */
const FOOTER = 64;
export const DIM_COLOR = '#0b5cad';
const DIM_TEXT = 5;
const MM_PRINT_NOTE = "Print at 100% (Actual size), never 'fit to page'. The bar below must measure the length shown.";
const MM_ALLOWANCE_NOTE = 'Allowances are indicative: confirm score and flap allowances with your manufacturer.';

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
  const dims: DielineDim[] = [];
  const panels: DielinePanel[] = [];
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
    dims.push({ x1: x0, y1: oy - 6, x2: x1, y2: oy - 6, text: `${r(w)}`, group: 'panel' });
    panels.push({ face: wall.face, x0, y0: yTopScore, x1, y1: yBottomScore });
    for (const [flapLayout, fy0, fy1] of [
      [wall.topFlap, yTopScore - mm(wall.topFlap.depth), yTopScore],
      [wall.bottomFlap, yBottomScore, yBottomScore + mm(wall.bottomFlap.depth)],
    ] as const) {
      if (flapLayout.face && flapLayout.depth > 0) {
        panels.push({ face: flapLayout.face, x0: x0 + mm(flapLayout.x0), y0: fy0, x1: x0 + mm(flapLayout.x0 + flapLayout.width), y1: fy1 });
      }
    }
    x = x1;
  });

  const blankW = x - ox;
  const blankH = topDepth + wallH + bottomDepth;
  const yEdge = oy + blankH;
  // wall height (score to score) and glue tab on the left, flap depths on the right, whole blank on the outside
  dims.push({ x1: ox - 7, y1: yTopScore, x2: ox - 7, y2: yBottomScore, text: `${r(wallH)}`, group: 'panel' });
  dims.push({ x1: ox, y1: yBottomScore + 6, x2: xTab + tab, y2: yBottomScore + 6, text: `${r(tab)}`, group: 'glue' });
  if (topDepth > 0.5) dims.push({ x1: x + 7, y1: oy, x2: x + 7, y2: yTopScore, text: `${r(topDepth)}`, group: 'depth' });
  if (bottomDepth > 0.5) dims.push({ x1: x + 7, y1: yBottomScore, x2: x + 7, y2: yEdge, text: `${r(bottomDepth)}`, group: 'depth' });
  dims.push({ x1: ox, y1: yEdge + 8, x2: x, y2: yEdge + 8, text: `Blank width ${r(blankW)} mm`, group: 'blank' });
  dims.push({ x1: ox - 15, y1: oy, x2: ox - 15, y2: yEdge, text: `Blank height ${r(blankH)} mm`, group: 'blank' });

  return {
    lines,
    labels,
    dims,
    panels,
    width: blankW,
    height: blankH,
    wallH,
    flap: Math.max(topDepth, bottomDepth),
  };
}

function finish(lines: DielineLine[], labels: DielineLabel[], contentW: number, contentH: number, pieces: Dieline['pieces'], meta: DielineMeta, detail: string, dims: DielineDim[] = [], panels: DielinePanel[] = []): Dieline {
  const width = contentW + 2 * MARGIN;
  const bottom = MARGIN + contentH;
  const text = (x: number, y: number, t: string, size: number) => labels.push({ x, y, text: t, size });
  text(MARGIN, bottom + 24, meta.title, 9);
  text(MARGIN, bottom + 35, `${meta.board} | ${detail} | scale 1:1`, 6);

  // legend: a swatch of each line style beside its caption
  const keys: DielineKey[] = [];
  const keyY = bottom + 45;
  (
    [
      ['cut', 'Cut (die cuts through)'],
      ['score', 'Fold (crease / score)'],
      ['dim', 'Dimension, mm'],
    ] as const
  ).forEach(([kind, caption], i) => {
    const x = MARGIN + i * 62;
    keys.push({ x1: x, y1: keyY - 1.5, x2: x + 12, y2: keyY - 1.5, kind });
    text(x + 15, keyY, caption, 5);
  });
  text(MARGIN, bottom + 53, MM_PRINT_NOTE, 5);
  text(MARGIN, bottom + 59, MM_ALLOWANCE_NOTE, 5);

  // 100 mm check bar (50 mm on very small blanks, none if even that does not fit)
  const room = contentW;
  const rulerLength = room >= 100 ? 100 : room >= 50 ? 50 : 0;
  const ruler = rulerLength ? { x: MARGIN, y: bottom + 66, length: rulerLength } : null;
  if (ruler) text(ruler.x + ruler.length + 3, ruler.y + 1.5, `${ruler.length} mm`, 5);

  return { width, height: bottom + MARGIN + FOOTER, lines, labels, pieces, dims, keys, ruler, panels };
}

/** Slotted family (RSC, HSC, FOL, sleeve) */
export function buildDieline(layout: RscLayout, meta: DielineMeta): Dieline {
  const b = slottedBlank(layout, MARGIN, MARGIN);
  return finish(b.lines, b.labels, b.width, b.height, [{ width: b.width, height: b.height }], meta,
    `wall height ${r(b.wallH)} mm | flap ${r(b.flap)} mm | blank ${r(b.width)} x ${r(b.height)} mm${cutOutNote(layout.openings)}`, b.dims, b.panels);
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
    `base ${r(base.width)} x ${r(base.height)} mm, lid ${r(lid.width)} x ${r(lid.height)} mm (lid depth ${r(layout.lidDepth * 10)} mm)${cutOutNote({ ...layout.base.openings, ...layout.lid.openings })}`,
    [...base.dims, ...lid.dims],
    [...base.panels, ...lid.panels]
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
  const panels: DielinePanel[] = [];

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
      // size as it reads on the sheet: panels in rotated frames swap width and height
      const [ax, ay] = p(x0, y0);
      const [bx, by] = p(x1, y1);
      panels.push({ face: node.face, x0: Math.min(ax, bx), y0: Math.min(ay, by), x1: Math.max(ax, bx), y1: Math.max(ay, by) });
      labels.push({ x: cx, y: cy + 7, text: `${r(Math.abs(bx - ax))} x ${r(Math.abs(by - ay))} mm`, size: 6 });
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
  const dims: DielineDim[] = [
    { x1: MARGIN, y1: MARGIN + h + 8, x2: MARGIN + w, y2: MARGIN + h + 8, text: `Blank width ${r(w)} mm`, group: 'blank' },
    { x1: MARGIN - 9, y1: MARGIN, x2: MARGIN - 9, y2: MARGIN + h, text: `Blank height ${r(h)} mm`, group: 'blank' },
  ];
  return finish(lines, labels, w, h, [{ width: w, height: h }], meta,
    `blank ${r(w)} x ${r(h)} mm | depth ${r(layout.inside.height * 10)} mm inside`, dims, panels);
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
  const shiftDim = (d: DielineDim): DielineDim => ({ ...d, y1: d.y1 + dy, y2: d.y2 + dy });
  const shiftPanel = (pn: DielinePanel): DielinePanel => ({ ...pn, y0: pn.y0 + dy, y1: pn.y1 + dy });
  // the part dielines carry their own footer text; keep only the surface labels (name and size, which sit inside the blank)
  const surfaceLabels = (d: Dieline, extraY: number) =>
    d.labels.filter((t) => t.y < MARGIN + d.pieces[0].height).map((t) => ({ ...t, y: t.y + extraY }));
  const trayMm = tray.pieces[0];
  const sleeveMm = sleeve.pieces[0];
  return finish(
    [...tray.lines, ...sleeve.lines.map(shift)],
    [...surfaceLabels(tray, 0), ...surfaceLabels(sleeve, dy)],
    Math.max(trayMm.width, sleeveMm.width),
    trayH + gap + sleeveH,
    [trayMm, sleeveMm],
    meta,
    `tray ${r(trayMm.width)} x ${r(trayMm.height)} mm, sleeve ${r(sleeveMm.width)} x ${r(sleeveMm.height)} mm`,
    [...(tray.dims ?? []), ...(sleeve.dims ?? []).map(shiftDim)],
    [...(tray.panels ?? []), ...(sleeve.panels ?? []).map(shiftPanel)]
  );
}

/** y (mm) of the blank's bottom edge: everything below it is the footer (title, legend, notes, ruler) */
export const dielineBlankBottom = (d: Dieline): number => d.height - MARGIN - FOOTER;

/** True for the footer captions, false for the names and sizes written on the panels */
export const isFooterLabel = (d: Dieline, t: DielineLabel): boolean => t.y > dielineBlankBottom(d) + 12;

const escapeXml = (s: string) => s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!);

/** Drawing primitives for one dimension line, shared by the SVG, PDF and on-page renderers so they always agree */
export interface DimGeometry {
  /** Main line plus an end tick at each end: [x1, y1, x2, y2] */
  segments: [number, number, number, number][];
  /** Caption anchor (centre of the text); `vertical` captions read bottom to top */
  text: { x: number; y: number; vertical: boolean; size: number };
}

const TICK = 2;

export function dimGeometry(d: DielineDim): DimGeometry {
  const vertical = Math.abs(d.x1 - d.x2) < 1e-6;
  const segments: DimGeometry['segments'] = [[d.x1, d.y1, d.x2, d.y2]];
  if (vertical) {
    segments.push([d.x1 - TICK, d.y1, d.x1 + TICK, d.y1], [d.x2 - TICK, d.y2, d.x2 + TICK, d.y2]);
    return { segments, text: { x: d.x1 - 1.4, y: (d.y1 + d.y2) / 2, vertical: true, size: DIM_TEXT } };
  }
  segments.push([d.x1, d.y1 - TICK, d.x1, d.y1 + TICK], [d.x2, d.y2 - TICK, d.x2, d.y2 + TICK]);
  return { segments, text: { x: (d.x1 + d.x2) / 2, y: d.y1 - 1.4, vertical: false, size: DIM_TEXT } };
}

/** Ruler ticks: [x1, y1, x2, y2] every 10 mm, taller every 50 mm, plus the bar itself */
export function rulerSegments(ruler: DielineRuler): [number, number, number, number][] {
  const out: [number, number, number, number][] = [[ruler.x, ruler.y, ruler.x + ruler.length, ruler.y]];
  for (let mm = 0; mm <= ruler.length; mm += 10) {
    const tall = mm % 50 === 0;
    out.push([ruler.x + mm, ruler.y - (tall ? 3 : 1.8), ruler.x + mm, ruler.y + (tall ? 3 : 1.8)]);
  }
  return out;
}

const STYLE_SVG = {
  cut: 'stroke="#000" stroke-width="0.5"',
  score: 'stroke="#d0021b" stroke-width="0.5" stroke-dasharray="4 2"',
  dim: `stroke="${DIM_COLOR}" stroke-width="0.3"`,
} as const;

export function dielineToSvg(d: Dieline): string {
  const seg = (a: number, b: number, c: number, e: number, style: string) => `<line x1="${r(a)}" y1="${r(b)}" x2="${r(c)}" y2="${r(e)}" ${style}/>`;
  const lines = d.lines.map((l) => seg(l.x1, l.y1, l.x2, l.y2, STYLE_SVG[l.kind])).join('\n');
  const dimLines = (d.dims ?? [])
    .map((dim) => {
      const g = dimGeometry(dim);
      const t = g.text;
      const text = `<text x="${r(t.x)}" y="${r(t.y)}" font-size="${t.size}" font-family="Arial" fill="${DIM_COLOR}" text-anchor="middle"${
        t.vertical ? ` transform="rotate(-90 ${r(t.x)} ${r(t.y)})"` : ''
      }>${escapeXml(dim.text)}</text>`;
      return `${g.segments.map((s) => seg(...s, STYLE_SVG.dim)).join('\n')}\n${text}`;
    })
    .join('\n');
  const keys = (d.keys ?? []).map((k) => seg(k.x1, k.y1, k.x2, k.y2, STYLE_SVG[k.kind])).join('\n');
  const ruler = d.ruler ? rulerSegments(d.ruler).map((s) => seg(...s, 'stroke="#000" stroke-width="0.3"')).join('\n') : '';
  const labels = d.labels
    .map((t) => `<text x="${r(t.x)}" y="${r(t.y)}" font-size="${t.size}" font-family="Arial" fill="#333" ${t.size >= 10 ? 'text-anchor="middle"' : ''}>${escapeXml(t.text)}</text>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${r(d.width)}mm" height="${r(d.height)}mm" viewBox="0 0 ${r(d.width)} ${r(d.height)}">
${lines}
${dimLines}
${keys}
${ruler}
${labels}
</svg>`;
}

/** PDF at 1:1 on a page sized to the blank (jsPDF is loaded only when needed) */
export async function dielineToPdf(d: Dieline): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: [d.width, d.height], orientation: d.width > d.height ? 'landscape' : 'portrait' });
  const stroke = (kind: 'cut' | 'score' | 'dim' | 'ruler') => {
    if (kind === 'cut' || kind === 'ruler') doc.setDrawColor(0, 0, 0);
    else if (kind === 'score') doc.setDrawColor(208, 2, 27);
    else doc.setDrawColor(11, 92, 173);
    if (kind === 'score') doc.setLineDashPattern([4, 2], 0);
    else doc.setLineDashPattern([], 0);
    doc.setLineWidth(kind === 'dim' || kind === 'ruler' ? 0.2 : 0.3);
  };
  for (const l of d.lines) {
    stroke(l.kind);
    doc.line(l.x1, l.y1, l.x2, l.y2);
  }
  for (const k of d.keys ?? []) {
    stroke(k.kind);
    doc.line(k.x1, k.y1, k.x2, k.y2);
  }
  stroke('dim');
  for (const dim of d.dims ?? []) {
    for (const [a, b, c, e] of dimGeometry(dim).segments) doc.line(a, b, c, e);
  }
  if (d.ruler) {
    stroke('ruler');
    for (const [a, b, c, e] of rulerSegments(d.ruler)) doc.line(a, b, c, e);
  }
  doc.setLineDashPattern([], 0);
  doc.setTextColor(11, 92, 173);
  for (const dim of d.dims ?? []) {
    const { text } = dimGeometry(dim);
    doc.setFontSize(text.size * 2.2);
    if (text.vertical) doc.text(dim.text, text.x, text.y, { align: 'center', angle: 90 });
    else doc.text(dim.text, text.x, text.y, { align: 'center' });
  }
  doc.setTextColor(51, 51, 51);
  for (const t of d.labels) {
    doc.setFontSize(t.size * 2.2);
    doc.text(t.text, t.x, t.y, { align: t.size >= 10 ? 'center' : 'left' });
  }
  return doc.output('blob');
}
