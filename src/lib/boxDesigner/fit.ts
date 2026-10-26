/**
 * Fit checker (#23): product size + padding (+ fragile) -> recommended INSIDE box size.
 * inside = product + 2 × padding per side + a small ease so the product slides in, rounded up to 0.5 cm,
 * length ≥ width (trade convention). Values are cm; the UI converts with units.ts.
 */

import type { BoxDimensions, PlyType } from '@/types/boxDesigner';
import { DIMENSION_LIMITS } from './constants';
import { suggestPly } from './strength';

// VERIFY-LATER[DSG-15]: minimum cushioning per side for fragile goods (bubble wrap / foam)
export const FRAGILE_MIN_PADDING_CM = 2.5;
/** Default padding per side for non-fragile goods */
export const DEFAULT_PADDING_CM = 1;
/** Total clearance so the product (or the padded bundle) slides in without force */
export const FIT_EASE_CM = 0.3;

export interface FitInput {
  product: BoxDimensions;
  paddingCm: number;
  fragile: boolean;
  weightKg?: number;
}

export interface FitResult {
  inside: BoxDimensions;
  paddingCm: number;
  /** Padding was raised to the fragile minimum */
  paddingRaised: boolean;
  /** Some side exceeds what the designer can model */
  tooLarge: boolean;
  /** Some side was raised to the designer's minimum */
  raisedToMin: boolean;
  suggestedPly?: PlyType;
}

const roundUpHalf = (cm: number) => Math.ceil(cm * 2 - 1e-9) / 2;

export function validProduct(product: BoxDimensions): boolean {
  return [product.length, product.width, product.height].every((v) => Number.isFinite(v) && v > 0 && v <= 500);
}

export function recommendInsideSize(input: FitInput): FitResult {
  const requested = Number.isFinite(input.paddingCm) && input.paddingCm >= 0 ? input.paddingCm : DEFAULT_PADDING_CM;
  const paddingCm = input.fragile ? Math.max(requested, FRAGILE_MIN_PADDING_CM) : requested;
  const grow = (v: number) => roundUpHalf(v + 2 * paddingCm + FIT_EASE_CM);

  const a = grow(input.product.length);
  const b = grow(input.product.width);
  const raw = { length: Math.max(a, b), width: Math.min(a, b), height: grow(input.product.height) };
  const values = [raw.length, raw.width, raw.height];
  const tooLarge = values.some((v) => v > DIMENSION_LIMITS.max);
  const raisedToMin = values.some((v) => v < DIMENSION_LIMITS.min);
  const clamp = (v: number) => Math.min(DIMENSION_LIMITS.max, Math.max(DIMENSION_LIMITS.min, v));

  return {
    inside: { length: clamp(raw.length), width: clamp(raw.width), height: clamp(raw.height) },
    paddingCm,
    paddingRaised: paddingCm > requested,
    tooLarge,
    raisedToMin,
    suggestedPly:
      input.weightKg !== undefined && Number.isFinite(input.weightKg) && input.weightKg > 0
        ? suggestPly(input.weightKg, input.fragile)
        : undefined,
  };
}

/** Same size within half a millimetre */
export function sameSize(a: BoxDimensions, b: BoxDimensions): boolean {
  return Math.abs(a.length - b.length) < 0.05 && Math.abs(a.width - b.width) < 0.05 && Math.abs(a.height - b.height) < 0.05;
}
