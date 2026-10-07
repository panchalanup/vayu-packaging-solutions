import { describe, it, expect } from 'vitest';
import {
  DEFAULT_VIEW_DIRECTION,
  getBoxCenter,
  getBoxRadius,
  getCameraLimits,
  getFitDistance,
  getShadowFrustum,
} from '../sceneMetrics';

describe('sceneMetrics', () => {
  it('computes the bounding-sphere radius of the assembled carton', () => {
    expect(getBoxRadius({ length: 30, width: 20, height: 15 })).toBeCloseTo(19.526, 2);
    expect(getBoxRadius({ length: 100, width: 100, height: 100 })).toBeCloseTo(86.6, 1);
  });

  it('never returns NaN for bad dimensions', () => {
    const r = getBoxRadius({ length: NaN, width: -5, height: Infinity });
    expect(Number.isFinite(r)).toBe(true);
    expect(r).toBeGreaterThan(0);
  });

  it('centres the orbit target on the box height', () => {
    expect(getBoxCenter({ length: 30, width: 20, height: 15 })).toEqual([0, 7.5, 0]);
  });

  it('fits a larger box further away than a smaller one', () => {
    const near = getFitDistance(getBoxRadius({ length: 15, width: 10, height: 10 }), 45, 1.6);
    const far = getFitDistance(getBoxRadius({ length: 50, width: 40, height: 30 }), 45, 1.6);
    expect(far).toBeGreaterThan(near * 2.5);
  });

  it('uses the tighter axis on portrait viewports', () => {
    const landscape = getFitDistance(20, 45, 1.6);
    const portrait = getFitDistance(20, 45, 0.5);
    expect(portrait).toBeGreaterThan(landscape);
  });

  it('keeps the whole sphere inside the vertical field of view', () => {
    const radius = 20;
    const d = getFitDistance(radius, 45, 2, 1);
    // tangent line to the sphere must lie within the half-FOV
    const angular = Math.asin(radius / d);
    expect(angular).toBeLessThanOrEqual((45 * Math.PI) / 360 + 1e-9);
  });

  it('derives orbit limits from the box size (no fixed 25 cm minimum)', () => {
    const { min, max } = getCameraLimits(4.3); // 5 cm cube
    expect(min).toBeLessThan(2);
    expect(max).toBeGreaterThan(30);
  });

  it('fits the shadow frustum to the box', () => {
    const small = getShadowFrustum(5);
    const big = getShadowFrustum(87);
    expect(big.half).toBeGreaterThan(small.half * 10);
    expect(big.far).toBeGreaterThan(big.near);
    expect(small.near).toBeGreaterThan(0);
  });

  it('exposes a unit default view direction', () => {
    expect(Math.hypot(...DEFAULT_VIEW_DIRECTION)).toBeCloseTo(1, 6);
  });
});
