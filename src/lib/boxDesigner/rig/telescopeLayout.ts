/**
 * Telescope box (lid + base, FEFCO 03xx family built from two slotted parts):
 *  - base: an HSC (open top, bottom flaps) of the inside size
 *  - lid:  an HSC 2t larger (it slides over the base), lidDepth deep, with full-overlap flaps so its top is one
 *          unbroken printable panel; it is turned upside down (about Z) to sit on the base
 * Lid wall faces are named for where they end up after the turn (the rig's right wall becomes the box's left).
 */

import type { BoxDimensions } from '@/types/boxDesigner';
import { computeRscLayout, smooth, type PrintTurns, type RscLayout, type ViewExtents } from './rscLayout';

export interface TelescopeLayout {
  kind: 'telescope';
  base: RscLayout;
  lid: RscLayout;
  thickness: number;
  lidDepth: number;
  inside: { length: number; width: number; height: number };
  outside: { length: number; width: number; height: number };
}

/** Lid slides over the base with this much play per side (cm) */
export const LID_CLEARANCE = 0.05;
/** Fold progress where both parts are assembled and the lid waits beside the base */
export const TELESCOPE_LID_OFF = 0.6;

/** Default lid depth: about a third of the height, at least 3 cm (never deeper than the base) */
export function resolveLidDepth(height: number, lidDepth: number | null): number {
  const H = Number.isFinite(height) && height > 0 ? height : 1;
  const auto = Math.round(Math.max(3, H / 3) * 10) / 10;
  const wanted = lidDepth != null && Number.isFinite(lidDepth) ? lidDepth : auto;
  return Math.min(H, Math.max(Math.min(H, 1), wanted));
}

export function computeTelescopeLayout(dims: BoxDimensions, thicknessCm: number, lidDepth: number | null): TelescopeLayout {
  const base = computeRscLayout(dims, thicknessCm, { topFlaps: false });
  const t = base.thickness;
  const depth = resolveLidDepth(base.inside.height, lidDepth);
  const frontBackMajor = base.outside.length + 2 * LID_CLEARANCE >= base.outside.width + 2 * LID_CLEARANCE;
  // print rotation of the lid top so artwork reads upright from the front (see rig/telescopeRig orientation notes)
  const lidTurns: PrintTurns = frontBackMajor ? 0 : 1;
  const lid = computeRscLayout(
    {
      length: base.outside.length + 2 * LID_CLEARANCE,
      width: base.outside.width + 2 * LID_CLEARANCE,
      height: depth,
    },
    t,
    {
      topFlaps: false,
      overlapBottom: true,
      exactThickness: true,
      wallFaces: ['lid-front', 'lid-left', 'lid-back', 'lid-right'],
      wallTurns: 2,
      bottomOuterFace: 'lid',
      bottomOuterTurns: lidTurns,
    }
  );
  return {
    kind: 'telescope',
    base,
    lid,
    thickness: t,
    lidDepth: depth,
    inside: base.inside,
    outside: {
      length: lid.outside.length,
      width: lid.outside.width,
      height: base.outside.height + 3 * t,
    },
  };
}

/** Camera framing: both blanks side by side when flat, both parts beside each other at lid-off, one box closed */
export function getTelescopeViewExtents(layout: TelescopeLayout, foldProgress: number): ViewExtents {
  const u = Number.isFinite(foldProgress) ? Math.min(1, Math.max(0, foldProgress)) : 1;
  const { base, lid, outside } = layout;
  const flatRadius = 0.5 * Math.hypot(Math.max(base.blank.length, lid.blank.length), base.blank.height + lid.blank.height) * 0.9;
  const pairRadius = 0.5 * Math.hypot(base.outside.length + lid.outside.length + 4, outside.width, base.outside.height);
  const closedRadius = 0.5 * Math.hypot(outside.length, outside.width, outside.height);
  const standing = smooth(0.05, 0.4, u);
  const closing = smooth(TELESCOPE_LID_OFF, 1, u);
  const assembled = flatRadius + (pairRadius - flatRadius) * standing;
  const radius = assembled + (closedRadius - assembled) * closing;
  const height = base.outside.height + (outside.height - base.outside.height) * closing;
  return {
    radius,
    center: [0, layout.thickness + (height / 2 - layout.thickness) * standing, 0],
    shadowRadius: Math.max(flatRadius, pairRadius, closedRadius),
  };
}
