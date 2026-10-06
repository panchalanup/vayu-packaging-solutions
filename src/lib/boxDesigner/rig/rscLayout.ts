/**
 * RSC (FEFCO 0201) layout
 * Pure geometry of a Regular Slotted Container: wall spans and heights, flap sizes, slots, glue tab and the
 * flat-blank extents. Shared by the 3D rig (and later the dieline export) so the two can never drift apart.
 *
 * Conventions (scene units = cm):
 *  - The entered dimensions are INSIDE dimensions (trade convention for RSC orders).
 *  - Board thickness t: outside = inside + 2t (length, width) and + 4t (height: two flap layers top and bottom).
 *  - Walls in chain order: front (+Z), right (+X), back (-Z), left (-X). The glue tab hangs off the front
 *    wall's left end and is glued inside the left wall.
 *  - Major flaps sit on the longer walls and close on top of the minor flaps. To stack cleanly the major walls are
 *    2t taller (t at the top and t at the bottom), exactly like the extra flap layer in a real carton.
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

export interface FlapLayout {
  /** Offset of the flap from the wall's start, along the wall (cm) */
  x0: number;
  /** Flap width along the score line (cm) */
  width: number;
  /** Flap depth away from the score line (cm) */
  depth: number;
  /** Printable face id, or null for flaps the user cannot decorate (bottom) */
  face: BoxFace | null;
}

export interface WallLayout {
  id: WallId;
  face: BoxFace;
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
  inside: { length: number; width: number; height: number };
  outside: { length: number; width: number; height: number };
  thickness: number;
  /** false for HSC (FEFCO 0200): open top, flaps only on the bottom */
  topFlaps: boolean;
  /** Gap between the major flaps where they meet on top / underneath (cm) */
  gap: number;
  /** Slot cut between neighbouring flaps (cm) */
  slot: number;
  flapDepth: number;
  walls: [WallLayout, WallLayout, WallLayout, WallLayout];
  tab: { width: number; height: number; y0: number };
  blank: { length: number; height: number };
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Sanitise a dimension: non-finite or tiny values fall back to a safe minimum (never NaN geometry) */
const safeDim = (value: number) => (Number.isFinite(value) && value > 0 ? Math.max(1, value) : 1);

export function computeRscLayout(
  dims: BoxDimensions,
  thicknessCm: number,
  options: { topFlaps?: boolean } = {}
): RscLayout {
  const topFlaps = options.topFlaps ?? true;
  const L = safeDim(dims.length);
  const W = safeDim(dims.width);
  const H = safeDim(dims.height);
  const smallest = Math.min(L, W, H);
  const t = clamp(Number.isFinite(thicknessCm) ? thicknessCm : 0.4, 0.05, smallest * 0.1);

  const Lo = L + 2 * t;
  const Wo = W + 2 * t;
  const Ho = H + (topFlaps ? 4 : 2) * t;

  // Real cartons: ~3 mm gap at the centre seam and a slot of about one caliper between flaps
  const gap = Math.min(0.3, 0.06 * Math.min(L, W));
  const slot = Math.min(Math.max(0.3, t), 0.1 * Math.min(L, W));
  const flapDepth = Math.min(Lo, Wo) / 2 - gap / 2;

  // The longer walls carry the major flaps (tie -> front/back)
  const frontBackMajor = L >= W;

  const wall = (id: WallId, span: number, major: boolean): WallLayout => {
    // Minor flaps must fit between the inner faces of the major walls
    const minorWidth = Math.max(0.1, span - 2 * t - 0.04);
    const flapWidth = major ? Math.max(0.1, span - slot) : minorWidth;
    const flapX0 = (span - flapWidth) / 2;
    return {
      id,
      face: id,
      span,
      y0: major ? 0 : t,
      y1: major || !topFlaps ? Ho : Ho - t,
      major,
      topFlap: { x0: flapX0, width: flapWidth, depth: flapDepth, face: `top-${id}` as BoxFace },
      bottomFlap: { x0: flapX0, width: flapWidth, depth: flapDepth, face: null },
    };
  };

  const walls: RscLayout['walls'] = [
    wall('front', Lo, frontBackMajor),
    wall('right', Wo, !frontBackMajor),
    wall('back', Lo, frontBackMajor),
    wall('left', Wo, !frontBackMajor),
  ];

  // Manufacturer's joint: ~3 cm tab, kept clear of the floor and ceiling flap layers
  const tabWidth = clamp(3, 0.5, 0.35 * Math.min(L, W));
  const tabHeight = Math.max(0.5, H - 0.6);
  const tab = { width: tabWidth, height: tabHeight, y0: 2 * t + (H - tabHeight) / 2 };

  return {
    inside: { length: L, width: W, height: H },
    outside: { length: Lo, width: Wo, height: Ho },
    thickness: t,
    topFlaps,
    gap,
    slot,
    flapDepth,
    walls,
    tab,
    blank: { length: 2 * (Lo + Wo) + tabWidth, height: Ho + 2 * flapDepth },
  };
}

/** Smoothstep helper (0..1) */
const smooth = (edge0: number, edge1: number, x: number) => {
  const k = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return k * k * (3 - 2 * k);
};

/**
 * What the camera should frame for a given fold progress (0 = flat blank, 1 = sealed):
 * radius of the bounding sphere and the orbit centre. `shadowRadius` covers every pose.
 * Open flaps count: an open-top carton is a flap-depth taller than a sealed one, and while the bottom
 * flaps are still open it stands on their tips (see foldPose timings).
 */
export function getViewExtents(
  layout: RscLayout,
  foldProgress: number
): { radius: number; center: [number, number, number]; shadowRadius: number } {
  const { outside, blank, thickness, flapDepth } = layout;
  const u = Number.isFinite(foldProgress) ? Math.min(1, Math.max(0, foldProgress)) : 1;

  const bottomOpen = 1 - smooth(0.6, 0.72, u);
  const topOpen = layout.topFlaps ? 1 - smooth(0.78, 1, u) : 0;
  const standingHeight = outside.height + flapDepth * (bottomOpen + topOpen);
  const standingRadius = 0.5 * Math.hypot(outside.length, outside.width, standingHeight);
  const flatRadius = 0.5 * Math.hypot(blank.length, blank.height) * 0.9;

  const standing = smooth(0.05, 0.5, u);
  const sealedRadius = 0.5 * Math.hypot(outside.length, outside.width, outside.height + (layout.topFlaps ? 2 : 1) * flapDepth);
  return {
    radius: flatRadius + (standingRadius - flatRadius) * standing,
    center: [0, thickness + (standingHeight / 2 - thickness) * standing, 0],
    shadowRadius: Math.max(sealedRadius, flatRadius),
  };
}

/** Real size (cm) of every printable surface: walls and, when present, top flaps */
export function getFaceSizes(layout: RscLayout): Partial<Record<BoxFace, { widthCm: number; heightCm: number }>> {
  const sizes: Partial<Record<BoxFace, { widthCm: number; heightCm: number }>> = {};
  for (const wall of layout.walls) {
    sizes[wall.face] = { widthCm: wall.span, heightCm: wall.y1 - wall.y0 };
    if (layout.topFlaps && wall.topFlap.face) {
      sizes[wall.topFlap.face] = { widthCm: wall.topFlap.width, heightCm: wall.topFlap.depth };
    }
  }
  return sizes;
}
