/**
 * Die-cut carton layout: mailer (FEFCO 0427), pizza box (shallow 0427 variant) and tray (0427 base, no lid).
 * Pure geometry as a hinge tree: the base panel is the root; every other panel hangs off an edge of its parent.
 * The same tree drives the 3D rig (DieCutRig), the flat-blank extents and the dieline, so they always agree.
 *
 * Node frame: the panel's outer (printed) face is at z = 0, the inner face at z = -t; x runs along the hinge,
 * y away from it. A child hinges on its parent's outer face line (mitred scores, like the RSC rig).
 *
 * Base frame: x = box length (left/right), y = box width (+y = front), outer face down when assembled.
 *
 * Construction (inside L x W x H, board t), following the real 0427:
 *  - side walls are double: outer wall, a 3t roll-over strip and an inner wall; the ears of the front and back
 *    walls are trapped in the t gap between them (so outside length = L + 6t)
 *  - the front is double too (outer, 2t strip, inner); the lid tuck sits just behind it (outside width = W + 4t)
 *  - the back wall is t taller than the sides so the closed lid rests on the side walls; the lid's dust flaps
 *    tuck inside the side walls
 *  - tray: no lid; the back is doubled like the front
 */

import type { BoxDimensions, BoxFace } from '@/types/boxDesigner';
import type { PrintTurns, SlabEdges } from './rscLayout';

export type DieCutVariant = 'mailer' | 'pizza' | 'tray';
export type HingeSide = 'top' | 'bottom' | 'left' | 'right';
export type DieFold =
  | 'front'
  | 'back'
  | 'ears'
  | 'sides'
  | 'sideRoll'
  | 'sideInner'
  | 'frontRoll'
  | 'frontInner'
  | 'backRoll'
  | 'backInner'
  | 'lid'
  | 'lidFlaps'
  | 'tuck';

export interface DieRect {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export interface DieAo {
  left: boolean;
  right: boolean;
  bottom: boolean;
  top: boolean;
}

export interface DieHinge {
  /** Hinge origin on the parent's outer face plane (parent frame) */
  x: number;
  y: number;
  side: HingeSide;
  /** The hinge slides this far back into the parent as it folds (double scores folded flat), cm */
  inset: number;
  fold: DieFold;
}

export interface DieNode {
  id: string;
  face: BoxFace | null;
  printTurns: PrintTurns;
  rect: DieRect;
  edges: SlabEdges;
  ao: DieAo;
  /** Removed by the cut-away view */
  cutaway: boolean;
  hinge: DieHinge | null;
  children: DieNode[];
}

export interface DieCutLayout {
  kind: 'diecut';
  variant: DieCutVariant;
  hasLid: boolean;
  inside: { length: number; width: number; height: number };
  outside: { length: number; width: number; height: number };
  thickness: number;
  root: DieNode;
  /** Flat blank extents (cm) */
  blank: { length: number; height: number };
  /** Part of the die-cut fold timeline this carton uses (tray ends before the lid) */
  timelineEnd: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const safeDim = (value: number) => (Number.isFinite(value) && value > 0 ? Math.max(1, value) : 1);

const CUT: SlabEdges = { left: 'cut', right: 'cut', bottom: 'cut', top: 'cut' };
const edges = (patch: Partial<SlabEdges>): SlabEdges => ({ ...CUT, ...patch });
const NO_AO: DieAo = { left: false, right: false, bottom: false, top: false };

export const DIE_CUT_OPEN_STOP = 0.68;
const TRAY_END = 0.66;

export function computeDieCutLayout(dims: BoxDimensions, thicknessCm: number, variant: DieCutVariant): DieCutLayout {
  const L = safeDim(dims.length);
  const W = safeDim(dims.width);
  const H = safeDim(dims.height);
  const smallest = Math.min(L, W, H);
  const t = clamp(Number.isFinite(thicknessCm) ? thicknessCm : 0.4, 0.05, smallest * 0.1);
  const hasLid = variant !== 'tray';

  const X = L / 2 + 3 * t; // outer face of the side walls
  const Z = W / 2 + 2 * t; // outer face of the front / back walls
  const Hs = H + t; // side and front walls: base (t) + inside height
  const Hb = hasLid ? Hs + t : Hs; // back wall carries the lid
  const c = 0.05; // clearance so tucked panels never touch the floor

  const node = (
    id: string,
    rect: DieRect,
    edgeKinds: SlabEdges,
    hinge: DieHinge | null,
    children: DieNode[] = [],
    extra: Partial<Pick<DieNode, 'face' | 'printTurns' | 'cutaway' | 'ao'>> = {}
  ): DieNode => ({
    id,
    face: extra.face ?? null,
    printTurns: extra.printTurns ?? 0,
    rect,
    edges: edgeKinds,
    ao: extra.ao ?? NO_AO,
    cutaway: extra.cutaway ?? false,
    hinge,
    children,
  });

  const earDepth = Math.max(0.5, Z - 2 * t - 0.2);
  const earLow = t + c;
  const earHigh = Math.max(earLow + 0.2, Hs - t - c);
  /** Ears on both ends of an end wall (front/back), folding back along the side walls */
  const ears = (prefix: string, halfSpan: number, cutaway: boolean) => [
    node(`${prefix}-ear-l`, { x0: earLow, x1: earHigh, y0: 0, y1: earDepth }, edges({ bottom: 'mitre' }), {
      x: -halfSpan,
      y: 0,
      side: 'left',
      inset: 0,
      fold: 'ears',
    }, [], { cutaway }),
    node(`${prefix}-ear-r`, { x0: -earHigh, x1: -earLow, y0: 0, y1: earDepth }, edges({ bottom: 'mitre' }), {
      x: halfSpan,
      y: 0,
      side: 'right',
      inset: 0,
      fold: 'ears',
    }, [], { cutaway }),
  ];

  /** Roll-over strip + inner panel on top of a wall (2t strip for end walls, 3t for side walls) */
  const rollOver = (
    prefix: string,
    wallHeight: number,
    halfWidth: number,
    strip: number,
    folds: [DieFold, DieFold],
    cutaway: boolean
  ) =>
    node(
      `${prefix}-roll`,
      { x0: -halfWidth, x1: halfWidth, y0: 0, y1: strip },
      edges({ bottom: 'mitre', top: 'mitre' }),
      { x: 0, y: wallHeight, side: 'top', inset: 0, fold: folds[0] },
      [
        node(
          `${prefix}-inner`,
          { x0: -halfWidth, x1: halfWidth, y0: 0, y1: Math.max(0.3, wallHeight - t - c) },
          edges({ bottom: 'mitre' }),
          { x: 0, y: strip, side: 'top', inset: 0, fold: folds[1] },
          [],
          { cutaway }
        ),
      ],
      { cutaway }
    );

  const endHalf = X - t; // end walls sit between the outer side walls
  const innerHalf = L / 2 - 0.02; // inner end panels fit between the inner side walls

  const front = node(
    'front',
    { x0: -endHalf, x1: endHalf, y0: 0, y1: Hs },
    edges({ bottom: 'mitre', top: 'mitre', left: 'mitre', right: 'mitre' }),
    { x: 0, y: Z, side: 'top', inset: 0, fold: 'front' },
    [...ears('front', endHalf, true), rollOver('front', Hs, innerHalf, 2 * t, ['frontRoll', 'frontInner'], true)],
    { face: 'front', cutaway: true, ao: { left: false, right: false, bottom: true, top: false } }
  );

  const lidDepth = 2 * Z;
  const tuckDepth = Math.max(0.5, Math.min(Hs - 2 * t - c, 0.75 * Hs));
  const dustDepth = Math.max(0.5, Math.min(Hs - 2 * t - c, 0.7 * Hs));
  const dustLow = t + 0.1;
  const dustHigh = Math.max(dustLow + 0.2, lidDepth - 3 * t - 0.1);
  const lidInset = endHalf - L / 2; // = 2t: dust flaps fold down inside the inner side walls

  const lid = node(
    'lid',
    { x0: -endHalf, x1: endHalf, y0: 0, y1: lidDepth },
    edges({ bottom: 'mitre' }),
    { x: 0, y: Hb, side: 'top', inset: 0, fold: 'lid' },
    [
      node(
        'tuck',
        { x0: -(L / 2 - t - 0.1), x1: L / 2 - t - 0.1, y0: 0, y1: tuckDepth },
        CUT,
        { x: 0, y: lidDepth, side: 'top', inset: 2 * t, fold: 'tuck' }
      ),
      node('dust-l', { x0: dustLow, x1: dustHigh, y0: 0, y1: dustDepth }, CUT, {
        x: -endHalf,
        y: 0,
        side: 'left',
        inset: lidInset,
        fold: 'lidFlaps',
      }),
      node('dust-r', { x0: -dustHigh, x1: -dustLow, y0: 0, y1: dustDepth }, CUT, {
        x: endHalf,
        y: 0,
        side: 'right',
        inset: lidInset,
        fold: 'lidFlaps',
      }),
    ],
    // the lid's +y points to the front when closed: half a turn reads upright from the front
    { face: 'lid', printTurns: 2, ao: NO_AO }
  );

  const back = node(
    'back',
    { x0: -endHalf, x1: endHalf, y0: 0, y1: Hb },
    edges({ bottom: 'mitre', top: 'mitre', left: 'mitre', right: 'mitre' }),
    { x: 0, y: -Z, side: 'bottom', inset: 0, fold: 'back' },
    [
      ...ears('back', endHalf, false),
      hasLid ? lid : rollOver('back', Hs, innerHalf, 2 * t, ['backRoll', 'backInner'], false),
    ],
    { face: 'back', ao: { left: false, right: false, bottom: true, top: false } }
  );

  const sideHalf = Z - t - c; // side roll-over runs between the end walls
  const side = (id: 'left' | 'right') =>
    node(
      id,
      { x0: -Z, x1: Z, y0: 0, y1: Hs },
      edges({ bottom: 'mitre', top: 'mitre' }),
      { x: id === 'left' ? -X : X, y: 0, side: id, inset: 0, fold: 'sides' },
      [rollOver(id, Hs, sideHalf, 3 * t, ['sideRoll', 'sideInner'], false)],
      { face: id, ao: { left: false, right: false, bottom: true, top: false } }
    );

  const root = node(
    'base',
    { x0: -X, x1: X, y0: -Z, y1: Z },
    edges({ bottom: 'mitre', top: 'mitre', left: 'mitre', right: 'mitre' }),
    null,
    [front, back, side('left'), side('right')],
    { ao: { left: true, right: true, bottom: true, top: true } }
  );

  const flat = flatBounds(root);
  return {
    kind: 'diecut',
    variant,
    hasLid,
    inside: { length: L, width: W, height: H },
    outside: { length: 2 * X, width: 2 * Z, height: Hb },
    thickness: t,
    root,
    blank: { length: flat.x1 - flat.x0, height: flat.y1 - flat.y0 },
    timelineEnd: hasLid ? 1 : TRAY_END,
  };
}

/** 2D affine of a node in the flat blank: point = origin + ux * x + uy * y */
export interface FlatFrame {
  ox: number;
  oy: number;
  ux: [number, number];
  uy: [number, number];
}

const SIDE_AXES: Record<HingeSide, { ux: [number, number]; uy: [number, number] }> = {
  top: { ux: [1, 0], uy: [0, 1] },
  bottom: { ux: [-1, 0], uy: [0, -1] },
  left: { ux: [0, 1], uy: [-1, 0] },
  right: { ux: [0, -1], uy: [1, 0] },
};

/** Visit every node with its frame in the flat blank (base frame coordinates) */
export function walkFlat(root: DieNode, visit: (node: DieNode, frame: FlatFrame, parent: DieNode | null) => void): void {
  const step = (node: DieNode, frame: FlatFrame, parent: DieNode | null) => {
    visit(node, frame, parent);
    for (const child of node.children) {
      const h = child.hinge!;
      const axes = SIDE_AXES[h.side];
      const ox = frame.ox + frame.ux[0] * h.x + frame.uy[0] * h.y;
      const oy = frame.oy + frame.ux[1] * h.x + frame.uy[1] * h.y;
      const mul = (v: [number, number]): [number, number] => [
        frame.ux[0] * v[0] + frame.uy[0] * v[1],
        frame.ux[1] * v[0] + frame.uy[1] * v[1],
      ];
      step(child, { ox, oy, ux: mul(axes.ux), uy: mul(axes.uy) }, node);
    }
  };
  step(root, { ox: 0, oy: 0, ux: [1, 0], uy: [0, 1] }, null);
}

export const flatPoint = (f: FlatFrame, x: number, y: number): [number, number] => [
  f.ox + f.ux[0] * x + f.uy[0] * y,
  f.oy + f.ux[1] * x + f.uy[1] * y,
];

export function flatBounds(root: DieNode): DieRect {
  const b = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
  walkFlat(root, (node, frame) => {
    for (const [x, y] of [
      [node.rect.x0, node.rect.y0],
      [node.rect.x1, node.rect.y1],
    ] as const) {
      const [px, py] = flatPoint(frame, x, y);
      b.x0 = Math.min(b.x0, px);
      b.x1 = Math.max(b.x1, px);
      b.y0 = Math.min(b.y0, py);
      b.y1 = Math.max(b.y1, py);
    }
  });
  return b;
}

/** Every node in tree order (stable: the rig builds panels in this order) */
export function dieNodes(root: DieNode): DieNode[] {
  const out: DieNode[] = [];
  walkFlat(root, (node) => out.push(node));
  return out;
}

/** Fixed topology signature: a rig built for one signature can be updated in place for any size */
export const dieTopology = (layout: DieCutLayout) => dieNodes(layout.root).map((n) => n.id).join(',');

export type FaceSizeMap = Partial<Record<BoxFace, { widthCm: number; heightCm: number }>>;

export function getDieCutFaceSizes(layout: DieCutLayout): FaceSizeMap {
  const sizes: FaceSizeMap = {};
  for (const n of dieNodes(layout.root)) {
    if (!n.face) continue;
    const w = n.rect.x1 - n.rect.x0;
    const h = n.rect.y1 - n.rect.y0;
    sizes[n.face] = n.printTurns % 2 ? { widthCm: h, heightCm: w } : { widthCm: w, heightCm: h };
  }
  return sizes;
}
