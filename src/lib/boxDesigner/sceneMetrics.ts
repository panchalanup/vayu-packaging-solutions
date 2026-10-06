/**
 * Scene metrics
 * Pure helpers that size the camera, orbit limits and shadow frustum from the box dimensions.
 * Scene units are centimetres (1 unit = 1 cm). No three.js import so this stays cheap to load and testable.
 */

import type { BoxDimensions } from '@/types/boxDesigner';

/** Normalised default camera direction (front-right, above) used for the initial and "fit" views */
export const DEFAULT_VIEW_DIRECTION: readonly [number, number, number] = (() => {
  const v: [number, number, number] = [0.43, 0.5, 0.71];
  const len = Math.hypot(...v);
  return [v[0] / len, v[1] / len, v[2] / len];
})();

/** Padding applied around the bounding sphere when fitting the camera */
export const FIT_MARGIN = 1.25;

/**
 * Bounding-sphere radius of the assembled carton.
 * Non-finite or non-positive inputs are clamped so a bad value can never produce NaN camera positions.
 */
export function getBoxRadius(dims: BoxDimensions): number {
  const safe = (n: number) => (Number.isFinite(n) && n > 0 ? n : 1);
  const l = safe(dims.length);
  const w = safe(dims.width);
  const h = safe(dims.height);
  return 0.5 * Math.sqrt(l * l + w * w + h * h);
}

/** Orbit target: centre of the assembled carton (it stands on y = 0) */
export function getBoxCenter(dims: BoxDimensions): [number, number, number] {
  const h = Number.isFinite(dims.height) && dims.height > 0 ? dims.height : 1;
  return [0, h / 2, 0];
}

/**
 * Camera distance at which a sphere of `radius` fits the viewport on its tighter axis.
 * @param fovDeg vertical field of view in degrees
 * @param aspect viewport width / height
 */
export function getFitDistance(
  radius: number,
  fovDeg: number,
  aspect: number,
  margin: number = FIT_MARGIN
): number {
  const vHalf = (fovDeg * Math.PI) / 360;
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
  const hHalf = Math.atan(Math.tan(vHalf) * safeAspect);
  const half = Math.min(vHalf, hHalf);
  return (radius * margin) / Math.sin(half);
}

/** Orbit distance limits derived from the box size (close enough to inspect edges, far enough to see context) */
export function getCameraLimits(radius: number): { min: number; max: number } {
  return { min: radius * 0.4, max: radius * 8 };
}

/** Directional-light shadow frustum fitted to the box so large boxes are not clipped and small ones stay sharp */
export function getShadowFrustum(radius: number): {
  half: number;
  near: number;
  far: number;
  lightDistance: number;
} {
  const lightDistance = radius * 4;
  return {
    half: radius * 1.6,
    near: Math.max(0.1, lightDistance - radius * 2.5),
    far: lightDistance + radius * 3,
    lightDistance,
  };
}
