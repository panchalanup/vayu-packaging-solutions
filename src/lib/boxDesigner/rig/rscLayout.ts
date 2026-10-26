/**
 * Slotted-carton layout (FEFCO 0201 RSC and its family: 0200 HSC, 0203 FOL, sleeve, telescope parts)
 * Pure geometry: wall spans and heights, flap sizes, slots, glue tab and the flat-blank extents. Shared by the 3D
 * rig and the dieline export so the two can never drift apart.
 *
 * Conventions (scene units = cm):
 *  - The entered dimensions are INSIDE dimensions (trade convention for RSC orders).
 *  - Board thickness t: outside = inside + 2t (length, width) and + one t per flap layer (height).
 *  - Walls in chain order: front (+Z), right (+X), back (-Z), left (-X). The glue tab hangs off the front
 *    wall's left end and is glued inside the left wall.
 *  - Major flaps sit on the longer walls and close on top of the minor flaps. To stack cleanly each wall stops
 *    short of the outside by the flap layers that close outside its own flap, exactly like a real carton.
 *  - Full overlap (FEFCO 0203): the two major flaps reach across the box; the later one closes on the outside,
 *    so each end has three layers (minor, inner major, outer major).
 */

import type { BoxDimensions, BoxFace } from '@/types/boxDesigner';

export type EdgeKind = 'cut' | 'mitre';

export interface SlabEdges {
  left: EdgeKind;
  right: EdgeKind;
  bottom: EdgeKind;
  top: EdgeKind;
}

export type WallId = 'front' | 'right' | 'back' | 'left';

export const WALL_ORDER: readonly WallId[] = ['front', 'right', 'back', 'left'];

/** Closing order of a flap layer: minor first, then major; `outer` is the second major of a full-overlap end */
export type FlapStage = 'minor' | 'major' | 'outer';

/** Quarter turns (0-3) of the artwork on a surface so it reads upright where the surface ends up */
export type PrintTurns = 0 | 1 | 2 | 3;

export interface FlapLayout {
  /** Offset of the flap from the wall's start, along the wall (cm) */
  x0: number;
  /** Flap width along the score line (cm) */
  width: number;
  /** Flap depth away from the score line (cm) */
  depth: number;
  /** Printable face id, or null for flaps the user cannot decorate */
  face: BoxFace | null;
  stage: FlapStage;
  printTurns: PrintTurns;
}

export interface WallLayout {
  id: WallId;
  face: BoxFace;
  printTurns: PrintTurns;
  /** Outside width of the wall (cm) */
  span: number;
  /** Vertical extent of the wall, box bottom = 0 (cm) */
  y0: number;
  y1: number;
  major: boolean;
  topFlap: FlapLayout;
  bottomFlap: FlapLayout;
}

export interface RscLayout {
  kind: 'rsc';
  inside: { length: number; width: number; height: number };
  outside: { length: number; width: number; height: number };
  thickness: number;
  /** false for HSC (FEFCO 0200), sleeve and telescope parts: open top */
  topFlaps: boolean;
  /** false for a sleeve: open at both ends */
  bottomFlaps: boolean;
  /** FEFCO 0203: the major flaps overlap fully (top / bottom) */
  overlapTop: boolean;
  overlapBottom: boolean;
  /** Gap between the major flaps where they meet on top / underneath (cm) */
  gap: number;
  /** Slot cut between neighbouring flaps (cm) */
  slot: number;
  /** Depth of a meeting (non-overlap) flap: half the shorter side */
  flapDepth: number;
  /** Deepest flap at each end, 0 when the end has no flaps (cm) */
  topDepth: number;
  bottomDepth: number;
  walls: [WallLayout, WallLayout, WallLayout, WallLayout];
  tab: { width: number; height: number; y0: number };
  blank: { length: number; height: number };
  /**
   * Part of the RSC fold timeline this carton uses: 1 = full (sealed top), 0.72 = open top, 0.5 = tube.
   * The public progress 0..1 is scaled by it, so every style's slider ends assembled.
   */
  timelineEnd: number;
}

export interface RscLayoutOptions {
  topFlaps?: boolean;
  bottomFlaps?: boolean;
  overlapTop?: boolean;
  overlapBottom?: boolean;
  /** Use the thickness as given (a telescope lid must match its base even when shallow) */
  exactThickness?: boolean;
  /** Face ids of the walls in chain order front, right, back, left (default: the wall ids) */
  wallFaces?: [BoxFace, BoxFace, BoxFace, BoxFace];
  wallTurns?: PrintTurns;
  /** Printable face of the outermost bottom flap (telescope lid top), with its print rotation */
  bottomOuterFace?: BoxFace;
  bottomOuterTurns?: PrintTurns;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Sanitise a dimension: non-finite or tiny values fall back to a safe minimum (never NaN geometry) */
const safeDim = (value: number) => (Number.isFinite(value) && value > 0 ? Math.max(1, value) : 1);

export function computeRscLayout(dims: BoxDimensions, thicknessCm: number, options: RscLayoutOptions = {}): RscLayout {
  const topFlaps = options.topFlaps ?? true;
  const bottomFlaps = options.bottomFlaps ?? true;
  const overlapTop = topFlaps && !!options.overlapTop;
  const overlapBottom = bottomFlaps && !!options.overlapBottom;
  const L = safeDim(dims.length);
  const W = safeDim(dims.width);
  const H = safeDim(dims.height);
  const smallest = Math.min(L, W, H);
  const rawT = Number.isFinite(thicknessCm) ? thicknessCm : 0.4;
  const t = options.exactThickness ? clamp(rawT, 0.05, 2) : clamp(rawT, 0.05, smallest * 0.1);

  const layers = (present: boolean, overlap: boolean) => (present ? (overlap ? 3 : 2) : 0);
  const nb = layers(bottomFlaps, overlapBottom);
  const nt = layers(topFlaps, overlapTop);

  const Lo = L + 2 * t;
  const Wo = W + 2 * t;
  const Ho = H + (nb + nt) * t;

  // Real cartons: ~3 mm gap at the centre seam and a slot of about one caliper between flaps
  const gap = Math.min(0.3, 0.06 * Math.min(L, W));
  const slot = Math.min(Math.max(0.3, t), 0.1 * Math.min(L, W));
  const flapDepth = Math.min(Lo, Wo) / 2 - gap / 2;

  // The longer walls carry the major flaps (tie -> front/back)
  const frontBackMajor = L >= W;
  // Full overlap: major flaps reach across the box (stopping just short of the far wall); minors as deep as fits
  const across = frontBackMajor ? Wo : Lo;
  const along = frontBackMajor ? Lo : Wo;
  const overlapMajor = Math.max(0.5, across - t - 0.1);
  const overlapMinor = Math.min(overlapMajor, along / 2 - gap / 2);
  // In a full-overlap end the later wall of the major pair closes last, on the outside
  const outerIndex = frontBackMajor ? 2 : 3;

  const stageOf = (index: number, major: boolean, overlap: boolean): FlapStage =>
    !major ? 'minor' : overlap && index === outerIndex ? 'outer' : 'major';
  /** How far a wall stops short of the outside: one t per flap layer that closes outside its own flap */
  const inset = (stage: FlapStage, overlap: boolean) =>
    stage === 'outer' ? 0 : stage === 'major' ? (overlap ? t : 0) : overlap ? 2 * t : t;

  const faces = options.wallFaces ?? (['front', 'right', 'back', 'left'] as const);
  const wallTurns = options.wallTurns ?? 0;
  const outermostBottom: FlapStage = overlapBottom ? 'outer' : 'major';

  const wall = (index: number, id: WallId, span: number, major: boolean): WallLayout => {
    // Minor flaps must fit between the inner faces of the major walls
    const minorWidth = Math.max(0.1, span - 2 * t - 0.04);
    const flapWidth = major ? Math.max(0.1, span - slot) : minorWidth;
    const flapX0 = (span - flapWidth) / 2;
    const topStage = stageOf(index, major, overlapTop);
    const bottomStage = stageOf(index, major, overlapBottom);
    const depthFor = (overlap: boolean) => (overlap ? (major ? overlapMajor : overlapMinor) : flapDepth);
    // only one bottom flap carries the lid face (with meeting flaps, the later wall of the pair)
    const carriesLid = bottomFlaps && !!options.bottomOuterFace && bottomStage === outermostBottom && index === outerIndex;
    return {
      id,
      face: faces[index],
      printTurns: wallTurns,
      span,
      y0: bottomFlaps ? inset(bottomStage, overlapBottom) : 0,
      y1: topFlaps ? Ho - inset(topStage, overlapTop) : Ho,
      major,
      topFlap: {
        x0: flapX0,
        width: flapWidth,
        depth: depthFor(overlapTop),
        face: topFlaps ? (`top-${id}` as BoxFace) : null,
        stage: topStage,
        printTurns: 0,
      },
      bottomFlap: {
        x0: flapX0,
        width: flapWidth,
        depth: depthFor(overlapBottom),
        face: carriesLid ? options.bottomOuterFace! : null,
        stage: bottomStage,
        printTurns: carriesLid ? options.bottomOuterTurns ?? 0 : 0,
      },
    };
  };

  const walls: RscLayout['walls'] = [
    wall(0, 'front', Lo, frontBackMajor),
    wall(1, 'right', Wo, !frontBackMajor),
    wall(2, 'back', Lo, frontBackMajor),
    wall(3, 'left', Wo, !frontBackMajor),
  ];

  // Manufacturer's joint: ~3 cm tab, kept clear of the floor and ceiling flap layers
  const tabWidth = clamp(3, 0.5, 0.35 * Math.min(L, W));
  const tabHeight = Math.max(0.5, H - 0.6);
  const tab = { width: tabWidth, height: tabHeight, y0: nb * t + (H - tabHeight) / 2 };

  const maxDepth = (key: 'topFlap' | 'bottomFlap') => Math.max(...walls.map((w) => w[key].depth));
  const topDepth = topFlaps ? maxDepth('topFlap') : 0;
  const bottomDepth = bottomFlaps ? maxDepth('bottomFlap') : 0;

  return {
    kind: 'rsc',
    inside: { length: L, width: W, height: H },
    outside: { length: Lo, width: Wo, height: Ho },
    thickness: t,
    topFlaps,
    bottomFlaps,
    overlapTop,
    overlapBottom,
    gap,
    slot,
    flapDepth,
    topDepth,
    bottomDepth,
    walls,
    tab,
    blank: { length: 2 * (Lo + Wo) + tabWidth, height: Ho + topDepth + bottomDepth },
    timelineEnd: topFlaps ? 1 : bottomFlaps ? 0.72 : 0.5,
  };
}

/** Smoothstep helper (0..1) */
export const smooth = (edge0: number, edge1: number, x: number) => {
  const k = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return k * k * (3 - 2 * k);
};

export interface ViewExtents {
  radius: number;
  center: [number, number, number];
  /** Radius that covers every fold pose (shadow frustum) */
  shadowRadius: number;
}

/**
 * What the camera should frame for a given fold progress (0 = flat blank, 1 = assembled):
 * radius of the bounding sphere and the orbit centre. `shadowRadius` covers every pose.
 * Open flaps count: an open-top carton is a flap-depth taller than a sealed one, and while the bottom
 * flaps are still open it stands on their tips (see foldPose timings).
 */
export function getViewExtents(layout: RscLayout, foldProgress: number): ViewExtents {
  const { outside, blank, thickness, topDepth, bottomDepth } = layout;
  const p = Number.isFinite(foldProgress) ? Math.min(1, Math.max(0, foldProgress)) : 1;
  const u = p * layout.timelineEnd;

  const bottomOpen = 1 - smooth(0.6, 0.72, u);
  const topOpen = layout.topFlaps ? 1 - smooth(0.78, 1, u) : 0;
  const standingHeight = outside.height + bottomDepth * bottomOpen + topDepth * topOpen;
  const standingRadius = 0.5 * Math.hypot(outside.length, outside.width, standingHeight);
  const flatRadius = 0.5 * Math.hypot(blank.length, blank.height) * 0.9;

  const standing = smooth(0.05, 0.5, u);
  const sealedRadius = 0.5 * Math.hypot(outside.length, outside.width, outside.height + topDepth + bottomDepth);
  return {
    radius: flatRadius + (standingRadius - flatRadius) * standing,
    center: [0, thickness + (standingHeight / 2 - thickness) * standing, 0],
    shadowRadius: Math.max(sealedRadius, flatRadius),
  };
}

export type FaceSizes = Partial<Record<BoxFace, { widthCm: number; heightCm: number }>>;

/** Surface size as the artwork sees it: a quarter turn swaps width and height */
export const turned = (turns: number, width: number, height: number) =>
  turns % 2 ? { widthCm: height, heightCm: width } : { widthCm: width, heightCm: height };

/** Real size (cm) of every printable surface: walls and any printable flaps */
export function getFaceSizes(layout: RscLayout): FaceSizes {
  const sizes: FaceSizes = {};
  for (const wall of layout.walls) {
    sizes[wall.face] = turned(wall.printTurns, wall.span, wall.y1 - wall.y0);
    for (const flap of [wall.topFlap, wall.bottomFlap]) {
      if (flap.face) sizes[flap.face] = turned(flap.printTurns, flap.width, flap.depth);
    }
  }
  return sizes;
}
