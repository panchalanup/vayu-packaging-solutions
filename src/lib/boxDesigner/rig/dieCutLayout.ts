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
import { windowFor, type OpeningMap, type OpeningSpec } from './openings';
import type { PrintTurns, SlabEdges } from './rscLayout';

/**
 * Phase 2 variants of the same hinge tree: clamshell and book (single-wall base, lid on the back wall), shelf tray
 * (tray with a cut-down front) and sleeve (the slide-box cover: bottom, front, top and a glue flap, open ends).
 */
export type DieCutVariant = 'mailer' | 'pizza' | 'tray' | 'clamshell' | 'shelf' | 'book' | 'sleeve';
/** Which fold choreography the carton uses (see dieCutPose) */
export type DieSchedule = 'full' | 'single' | 'sleeve';
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
  | 'tuck'
  | 'tongue';

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
  schedule: DieSchedule;
  /** Cut-outs per printable face (window on the lid): decals in 3D, real cut lines in the dieline */
  openings?: OpeningMap;
}

export interface DieCutOptions {
  /** Shelf tray: front wall height as a share of the side walls (0.15 .. 1) */
  frontRatio?: number;
  /** Resolved openings; only the window is used (on the lid) */
  openings?: OpeningSpec;
}

/** Fold-slider stop where the lid is open, for the single-wall schedule (full schedule: DIE_CUT_OPEN_STOP) */
export const DIE_CUT_SINGLE_OPEN_STOP = 0.58;
/** Shelf tray: front wall height share when the design does not choose one */
export const DEFAULT_FRONT_RATIO = 0.45;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const safeDim = (value: number) => (Number.isFinite(value) && value > 0 ? Math.max(1, value) : 1);

const CUT: SlabEdges = { left: 'cut', right: 'cut', bottom: 'cut', top: 'cut' };
const edges = (patch: Partial<SlabEdges>): SlabEdges => ({ ...CUT, ...patch });
const NO_AO: DieAo = { left: false, right: false, bottom: false, top: false };

export const DIE_CUT_OPEN_STOP = 0.68;
const TRAY_END = 0.66;

export function computeDieCutLayout(
  dims: BoxDimensions,
  thicknessCm: number,
  variant: DieCutVariant,
  options: DieCutOptions = {}
): DieCutLayout {
  if (variant === 'sleeve') return computeSleeveLayout(dims, thicknessCm);
  const L = safeDim(dims.length);
  const W = safeDim(dims.width);
  const H = safeDim(dims.height);
  const smallest = Math.min(L, W, H);
  const t = clamp(Number.isFinite(thicknessCm) ? thicknessCm : 0.4, 0.05, smallest * 0.1);
  // clamshell and book box: single-wall base (ears glued inside the side walls), lid hinged on the back wall
  const single = variant === 'clamshell' || variant === 'book';
  const hasLid = variant === 'mailer' || variant === 'pizza' || single;

  const X = L / 2 + (single ? 1 : 3) * t; // outer face of the side walls
  const Z = W / 2 + (single ? 1 : 2) * t; // outer face of the front / back walls
  const Hs = H + t; // side and front walls: base (t) + inside height
  const Hb = hasLid ? Hs + t : Hs; // back wall carries the lid
  const c = 0.05; // clearance so tucked panels never touch the floor
  // shelf tray: the front wall is cut down to a share of the side walls
  const wantedFront = options.frontRatio != null && Number.isFinite(options.frontRatio) ? options.frontRatio : DEFAULT_FRONT_RATIO;
  const Hf = variant === 'shelf' ? clamp(Hs * clamp(wantedFront, 0.15, 1), Math.min(Hs, 3 * t + 1), Hs) : Hs;

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
  /** Ears on both ends of an end wall (front/back), folding back along the side walls */
  const ears = (prefix: string, halfSpan: number, cutaway: boolean, wallHeight: number) => {
    const earHigh = Math.max(earLow + 0.2, wallHeight - t - c);
    return [
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
  };

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
    { x0: -endHalf, x1: endHalf, y0: 0, y1: Hf },
    edges({ bottom: 'mitre', top: 'mitre', left: 'mitre', right: 'mitre' }),
    { x: 0, y: Z, side: 'top', inset: 0, fold: 'front' },
    [
      ...ears('front', endHalf, true, Hf),
      ...(single ? [] : [rollOver('front', Hf, innerHalf, 2 * t, ['frontRoll', 'frontInner'], true)]),
    ],
    { face: 'front', cutaway: true, ao: { left: false, right: false, bottom: true, top: false } }
  );

  const book = variant === 'book';
  const lidHalf = single ? X : endHalf; // a single-wall lid also covers the side wall tops
  const lidDepth = 2 * Z + (book ? t : 0); // the book lip hangs outside the front wall
  const tuckDepth = Math.max(0.5, Math.min(Hs - 2 * t - c, 0.75 * Hs));
  const dustDepth = Math.max(0.5, Math.min(Hs - 2 * t - c, 0.7 * Hs));
  const dustLow = t + 0.1;
  const dustHigh = Math.max(dustLow + 0.2, lidDepth - 3 * t - 0.1);
  // dust flaps fold down inside the inner side walls (mailer) or inside the glued ears (clamshell)
  const lidInset = lidHalf - (single ? L / 2 - t : L / 2);
  // book lip: hangs over the front wall, its tongue goes through the wall (the tuck closure)
  const lipDepth = Math.min(Math.max(Hs * 0.5, 2 * t + 1.5), Math.max(2 * t + 1.5, Hs - 3 * t));
  const tongueDepth = 2 * t + 1.2;
  const tongueHalf = Math.min(4, Math.max(1, L * 0.15));

  const lidChildren: DieNode[] = book
    ? [
        node(
          'lip',
          { x0: -lidHalf, x1: lidHalf, y0: 0, y1: lipDepth },
          edges({ bottom: 'mitre', top: 'mitre' }),
          { x: 0, y: lidDepth, side: 'top', inset: 0, fold: 'tuck' },
          [
            node('tongue', { x0: -tongueHalf, x1: tongueHalf, y0: 0, y1: tongueDepth }, edges({ bottom: 'mitre' }), {
              x: 0,
              y: lipDepth,
              side: 'top',
              inset: 0,
              fold: 'tongue',
            }),
          ],
          // the lip reads upright from the front after the same half turn as the lid
          { face: 'lid-front', printTurns: 2 }
        ),
      ]
    : [
        node(
          'tuck',
          { x0: -(L / 2 - t - 0.1), x1: L / 2 - t - 0.1, y0: 0, y1: tuckDepth },
          CUT,
          { x: 0, y: lidDepth, side: 'top', inset: Z - W / 2, fold: 'tuck' }
        ),
        node('dust-l', { x0: dustLow, x1: dustHigh, y0: 0, y1: dustDepth }, CUT, {
          x: -lidHalf,
          y: 0,
          side: 'left',
          inset: lidInset,
          fold: 'lidFlaps',
        }),
        node('dust-r', { x0: -dustHigh, x1: -dustLow, y0: 0, y1: dustDepth }, CUT, {
          x: lidHalf,
          y: 0,
          side: 'right',
          inset: lidInset,
          fold: 'lidFlaps',
        }),
      ];

  const lid = node(
    'lid',
    { x0: -lidHalf, x1: lidHalf, y0: 0, y1: lidDepth },
    edges(book ? { bottom: 'mitre', top: 'mitre' } : { bottom: 'mitre' }),
    { x: 0, y: Hb, side: 'top', inset: 0, fold: 'lid' },
    lidChildren,
    // the lid's +y points to the front when closed: half a turn reads upright from the front
    { face: 'lid', printTurns: 2, ao: NO_AO }
  );

  const back = node(
    'back',
    { x0: -endHalf, x1: endHalf, y0: 0, y1: Hb },
    edges({ bottom: 'mitre', top: 'mitre', left: 'mitre', right: 'mitre' }),
    { x: 0, y: -Z, side: 'bottom', inset: 0, fold: 'back' },
    [
      ...ears('back', endHalf, false, Hs),
      ...(hasLid ? [lid] : [rollOver('back', Hs, innerHalf, 2 * t, ['backRoll', 'backInner'], false)]),
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
      single ? [] : [rollOver(id, Hs, sideHalf, 3 * t, ['sideRoll', 'sideInner'], false)],
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

  const win = hasLid && options.openings?.window ? windowFor(2 * lidHalf, lidDepth, options.openings.windowRatio) : null;
  const flat = flatBounds(root);
  return {
    kind: 'diecut',
    variant,
    hasLid,
    inside: { length: L, width: W, height: H },
    outside: { length: 2 * X, width: 2 * Z + (book ? t : 0), height: Hb },
    thickness: t,
    root,
    blank: { length: flat.x1 - flat.x0, height: flat.y1 - flat.y0 },
    timelineEnd: hasLid ? 1 : TRAY_END,
    schedule: single ? 'single' : 'full',
    ...(win ? { openings: { lid: [win] } } : {}),
  };
}

/**
 * Slide-box sleeve: a tube open at both ends that the tray slides out of. `inside` is the clear opening:
 * length = along the slide direction, width x height = the cross section.
 *
 * Blank (one strip): bottom panel in the middle, the front wall up one side with the top panel hinged on it, and the
 * back wall on the other side; a glue flap on the top panel's far edge folds down inside the back wall.
 */
export function computeSleeveLayout(inside: BoxDimensions, thicknessCm: number): DieCutLayout {
  const Li = safeDim(inside.length);
  const Wi = safeDim(inside.width);
  const Hi = safeDim(inside.height);
  const t = clamp(Number.isFinite(thicknessCm) ? thicknessCm : 0.4, 0.05, Math.min(Li, Wi, Hi) * 0.1);
  const Xs = Li / 2;
  const Zs = Wi / 2 + t;
  const Hw = Hi + 2 * t; // bottom + inside + top
  const flapDepth = clamp(Hi * 0.5, 0.8, 2);
  const wallAo: DieAo = { left: false, right: false, bottom: true, top: false };

  const node = (
    id: string,
    rect: DieRect,
    edgeKinds: SlabEdges,
    hinge: DieHinge | null,
    children: DieNode[] = [],
    extra: Partial<Pick<DieNode, 'face' | 'cutaway' | 'ao'>> = {}
  ): DieNode => ({
    id,
    face: extra.face ?? null,
    printTurns: 0,
    rect,
    edges: edgeKinds,
    ao: extra.ao ?? NO_AO,
    cutaway: extra.cutaway ?? false,
    hinge,
    children,
  });

  const glue = node('glue', { x0: -(Xs - 0.6), x1: Xs - 0.6, y0: 0, y1: flapDepth }, CUT, {
    x: 0,
    y: 2 * Zs,
    side: 'top',
    inset: t, // hangs against the inside of the back wall
    fold: 'lidFlaps',
  });
  const top = node(
    'lid',
    { x0: -Xs, x1: Xs, y0: 0, y1: 2 * Zs },
    edges({ bottom: 'mitre' }),
    { x: 0, y: Hw, side: 'top', inset: 0, fold: 'lid' },
    [glue],
    { face: 'lid' }
  );
  const front = node(
    'front',
    { x0: -Xs, x1: Xs, y0: 0, y1: Hw },
    edges({ bottom: 'mitre', top: 'mitre' }),
    { x: 0, y: Zs, side: 'top', inset: 0, fold: 'front' },
    [top],
    { face: 'lid-front', cutaway: true, ao: wallAo }
  );
  // one board thick lower, so the top panel rests on it
  const back = node(
    'back',
    { x0: -Xs, x1: Xs, y0: 0, y1: Hw - t },
    edges({ bottom: 'mitre' }),
    { x: 0, y: -Zs, side: 'bottom', inset: 0, fold: 'back' },
    [],
    { face: 'lid-back', ao: wallAo }
  );
  const root = node('base', { x0: -Xs, x1: Xs, y0: -Zs, y1: Zs }, edges({ bottom: 'mitre', top: 'mitre' }), null, [front, back], {
    face: 'bottom',
    ao: { left: false, right: false, bottom: true, top: true },
  });

  const flat = flatBounds(root);
  return {
    kind: 'diecut',
    variant: 'sleeve',
    hasLid: false,
    inside: { length: Li, width: Wi, height: Hi },
    outside: { length: 2 * Xs, width: 2 * Zs, height: Hw },
    thickness: t,
    root,
    blank: { length: flat.x1 - flat.x0, height: flat.y1 - flat.y0 },
    timelineEnd: 1,
    schedule: 'sleeve',
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
