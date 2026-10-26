/**
 * Fold choreography for die-cut cartons (mailer, pizza, tray). One progress value u (0..1) -> every hinge angle.
 *
 *   u = 0      flat blank, print side up
 *   0 -> .12   the blank turns over (print side down, the way it is folded on the bench)
 *   .12 -> .28 front and back walls up; the lid rises with the back wall and relaxes backwards
 *   .24 -> .36 ears fold in
 *   .32 -> .46 side walls up
 *   .44 -> .60 side walls roll over the ears (strip, then inner wall)
 *   .54 -> .66 front (and tray back) roll over
 *   u = .68    OPEN LID (tray: assembled at .66)
 *   .68 -> .78 lid dust flaps and tuck flap fold
 *   .76 -> 1   lid closes
 */

import type { DieFold } from './dieCutLayout';

export interface DieCutPose {
  /** Rotation of the whole blank about X: -PI/2 = print side up (flat), +PI/2 = assembled orientation */
  flip: number;
  angles: Record<DieFold, number>;
}

const HALF_PI = Math.PI / 2;
/** An open lid leans back like real board springs */
const LID_OPEN = (-20 * Math.PI) / 180;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const segment = (u: number, a: number, b: number) => easeInOutCubic(clamp01((u - a) / (b - a)));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export function dieCutPoseFromProgress(progress: number): DieCutPose {
  const u = Number.isFinite(progress) ? clamp01(progress) : 1;
  const fold = (a: number, b: number) => HALF_PI * segment(u, a, b);
  const lid = u < 0.76 ? LID_OPEN * segment(u, 0.18, 0.3) : lerp(LID_OPEN, HALF_PI, segment(u, 0.76, 1));
  return {
    flip: -HALF_PI + Math.PI * segment(u, 0, 0.12),
    angles: {
      front: fold(0.12, 0.28),
      back: fold(0.14, 0.28),
      ears: fold(0.24, 0.36),
      sides: fold(0.32, 0.46),
      sideRoll: fold(0.44, 0.54),
      sideInner: fold(0.5, 0.6),
      frontRoll: fold(0.54, 0.6),
      frontInner: fold(0.58, 0.66),
      backRoll: fold(0.54, 0.6),
      backInner: fold(0.58, 0.66),
      lidFlaps: fold(0.68, 0.76),
      tuck: fold(0.7, 0.78),
      lid,
    },
  };
}
