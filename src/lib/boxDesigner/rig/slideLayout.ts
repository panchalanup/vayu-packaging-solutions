/**
 * Slide box (tray + printed sleeve, the FEFCO 05xx family): two separate parts.
 *  - tray:   the die-cut tray (double walls, open top) of the inside size
 *  - sleeve: a tube open at both ends, a hair bigger than the tray's outside, as long as the tray
 * The sleeve is a die-cut hinge tree too (see computeSleeveLayout), so the same rig and dieline code draws both.
 * Faces: the tray has front / back / left / right; the sleeve has lid (top), lid-front, lid-back and bottom.
 */

import type { BoxDimensions } from '@/types/boxDesigner';
import { computeDieCutLayout, computeSleeveLayout, type DieCutLayout } from './dieCutLayout';
import { smooth, type ViewExtents } from './rscLayout';

export interface SlideLayout {
  kind: 'slide';
  tray: DieCutLayout;
  sleeve: DieCutLayout;
  thickness: number;
  inside: { length: number; width: number; height: number };
  outside: { length: number; width: number; height: number };
}

/** Play between the tray and the sleeve (cm, total across width and height) */
export const SLIDE_CLEARANCE = 0.15;
/** Fold progress where both parts are made and the tray waits part-way out of the sleeve */
export const SLIDE_TRAY_OUT = 0.6;
/** Share of the tray length that is out of the sleeve at the "tray out" stop */
export const SLIDE_PULL = 0.75;

export function computeSlideLayout(dims: BoxDimensions, thicknessCm: number): SlideLayout {
  const tray = computeDieCutLayout(dims, thicknessCm, 'tray');
  const sleeve = computeSleeveLayout(
    {
      length: tray.outside.length,
      width: tray.outside.width + SLIDE_CLEARANCE,
      height: tray.outside.height + SLIDE_CLEARANCE,
    },
    tray.thickness
  );
  return {
    kind: 'slide',
    tray,
    sleeve,
    thickness: tray.thickness,
    inside: tray.inside,
    outside: { ...sleeve.outside },
  };
}

/** Camera framing: both blanks stacked when flat, sleeve with the tray pulled out, then one closed box */
export function getSlideViewExtents(layout: SlideLayout, foldProgress: number): ViewExtents {
  const u = Number.isFinite(foldProgress) ? Math.min(1, Math.max(0, foldProgress)) : 1;
  const { tray, sleeve, outside } = layout;
  const flatRadius =
    0.5 * Math.hypot(Math.max(tray.blank.length, sleeve.blank.length), tray.blank.height + sleeve.blank.height + 3) * 0.9;
  const pairRadius = 0.5 * Math.hypot(outside.length * (1 + SLIDE_PULL) + 3, outside.width, outside.height);
  const closedRadius = 0.5 * Math.hypot(outside.length, outside.width, outside.height);
  const standing = smooth(0.05, 0.4, u);
  const closing = smooth(SLIDE_TRAY_OUT, 1, u);
  const assembled = flatRadius + (pairRadius - flatRadius) * standing;
  return {
    radius: assembled + (closedRadius - assembled) * closing,
    center: [0, layout.thickness + (outside.height / 2 - layout.thickness) * standing, 0],
    shadowRadius: Math.max(flatRadius, pairRadius, closedRadius),
  };
}
