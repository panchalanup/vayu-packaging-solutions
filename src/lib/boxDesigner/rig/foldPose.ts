/**
 * Fold choreography for an RSC carton
 * One progress value u (0..1) -> every hinge angle. Pure, so it is unit-tested and cheap to call every frame.
 *
 *   u = 0     flat blank lying on the ground, print side up
 *   0 -> .30  walls fold around the score lines (staggered) -> a tube lying on its side; glue tab tucks in first
 *   .30 -> .50 the tube is stood upright
 *   .50 -> .72 bottom minor flaps, then bottom major flaps close; top flaps relax slightly outward
 *   u = .72   OPEN TOP
 *   .72 -> .86 top minor flaps close
 *   .84 -> 1  top major flaps close on top of them
 *   u = 1     SEALED
 */

export interface RigPose {
  /** Rotation of the whole tube about X: -PI/2 = lying (flat blank), 0 = standing */
  tilt: number;
  /** Wall hinge angles front->right, right->back, back->left (0 = flat, PI/2 = folded) */
  walls: [number, number, number];
  /** Glue tab hinge angle (0 = flat, PI/2 = tucked inside) */
  tab: number;
  /** Flap angles: 0 = in line with the wall, PI/2 = closed, negative = splayed outward */
  topMajor: number;
  topMinor: number;
  bottomMajor: number;
  bottomMinor: number;
  /** Second major flap of a full-overlap end (FEFCO 0203); equals the major angle otherwise */
  topOuter: number;
  bottomOuter: number;
}

export interface PoseOptions {
  /** Full-overlap ends close in three steps: minor, inner major, outer major */
  overlapTop?: boolean;
  overlapBottom?: boolean;
}

export const FOLD_STOPS = { flat: 0, openTop: 0.72, sealed: 1 } as const;

const HALF_PI = Math.PI / 2;
/** Resting angle of open top flaps (slightly outward, like real board springs back) */
const RELAXED = (-10 * Math.PI) / 180;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** Eased progress of a sub-range [a, b] of the timeline */
const segment = (u: number, a: number, b: number) => easeInOutCubic(clamp01((u - a) / (b - a)));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export function poseFromProgress(progress: number, options: PoseOptions = {}): RigPose {
  const u = Number.isFinite(progress) ? clamp01(progress) : 1;

  const relax = RELAXED * segment(u, 0.45, 0.6);
  const close = (a: number, b: number) => (u < a ? relax : lerp(RELAXED, HALF_PI, segment(u, a, b)));
  let topMinor: number;
  let topMajor: number;
  let topOuter: number;
  if (options.overlapTop) {
    topMinor = close(0.72, 0.81);
    topMajor = close(0.8, 0.9);
    topOuter = close(0.89, 1);
  } else {
    topMinor = close(0.72, 0.86);
    topMajor = close(0.84, 1);
    topOuter = topMajor;
  }
  const bottomMinor = HALF_PI * (options.overlapBottom ? segment(u, 0.5, 0.58) : segment(u, 0.5, 0.61));
  const bottomMajor = HALF_PI * (options.overlapBottom ? segment(u, 0.57, 0.65) : segment(u, 0.6, 0.72));
  const bottomOuter = options.overlapBottom ? HALF_PI * segment(u, 0.64, 0.72) : bottomMajor;

  return {
    tilt: -HALF_PI * (1 - segment(u, 0.3, 0.5)),
    walls: [
      HALF_PI * segment(u, 0.0, 0.24),
      HALF_PI * segment(u, 0.03, 0.27),
      HALF_PI * segment(u, 0.06, 0.3),
    ],
    // The tab must be tucked before the last wall closes over it
    tab: HALF_PI * segment(u, 0.03, 0.22),
    bottomMinor,
    bottomMajor,
    bottomOuter,
    topMinor,
    topMajor,
    topOuter,
  };
}
