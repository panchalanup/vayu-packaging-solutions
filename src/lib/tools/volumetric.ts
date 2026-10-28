/**
 * Volumetric (dimensional) weight: L x W x H (cm) / divisor = kg. Chargeable weight is the larger of actual and volumetric.
 * Couriers use different divisors and rules by service; VERIFY-LATER[MKT-04]: the 5000 default and the 4000/6000 options are
 * common choices, not any courier's rate card. Flyer rules, minimum weights and slabs are not modelled.
 */

import type { BoxDimensions } from '@/types/boxDesigner';
import { round, validDims, volumeCm3 } from './shared';

export const DIVISORS = [4000, 5000, 6000] as const;
export const DEFAULT_DIVISOR = 5000;
/** Volume reductions shown as "what if the box were smaller" */
export const SHRINK_STEPS_PCT = [10, 20, 30] as const;

export const volumetricKg = (dims: BoxDimensions, divisor: number): number =>
  validDims(dims) && divisor > 0 ? volumeCm3(dims) / divisor : NaN;

export interface VolumetricInput {
  dims: BoxDimensions;
  /** Actual (dead) weight of one packed parcel, kg */
  actualKg?: number;
  divisor: number;
  /** Parcels per shipment run (default 1) */
  parcels?: number;
  /** Rate per kg the person enters from their own rate card */
  ratePerKg?: number;
}

export interface ShrinkScenario {
  pct: number;
  volumetricKg: number;
  chargeableKg: number;
  savedKg: number;
  savedCost?: number;
}

export interface VolumetricResult {
  volumeCm3: number;
  volumetricKg: number;
  actualKg?: number;
  chargeableKg: number;
  /** Which weight sets the charge */
  winner: 'volumetric' | 'actual' | 'equal' | 'unknown';
  /** Kg billed above the real weight (0 when actual wins) */
  extraKg: number;
  costPerParcel?: number;
  costTotal?: number;
  /** Box volume (cm3) at which volumetric weight equals the actual weight */
  breakEvenVolumeCm3?: number;
  /** Box with the same proportions at the break-even volume, sides rounded down to 0.5 cm (cm) */
  breakEvenDims?: BoxDimensions;
  scenarios: ShrinkScenario[];
}

const floorHalf = (v: number) => Math.floor(v * 2 + 1e-9) / 2;

export function assessVolumetric(input: VolumetricInput): VolumetricResult | null {
  if (!validDims(input.dims) || !(input.divisor > 0)) return null;
  const volume = volumeCm3(input.dims);
  const vol = volume / input.divisor;
  const actual = input.actualKg !== undefined && Number.isFinite(input.actualKg) && input.actualKg > 0 ? input.actualKg : undefined;
  const rate = input.ratePerKg !== undefined && Number.isFinite(input.ratePerKg) && input.ratePerKg > 0 ? input.ratePerKg : undefined;
  const parcels = input.parcels && Number.isFinite(input.parcels) && input.parcels > 0 ? Math.round(input.parcels) : 1;

  const chargeable = actual === undefined ? vol : Math.max(actual, vol);
  const winner: VolumetricResult['winner'] =
    actual === undefined ? 'unknown' : Math.abs(vol - actual) < 1e-9 ? 'equal' : vol > actual ? 'volumetric' : 'actual';
  const extraKg = actual === undefined ? 0 : Math.max(0, vol - actual);
  const costPerParcel = rate ? chargeable * rate : undefined;

  const breakEvenVolume = actual !== undefined ? actual * input.divisor : undefined;
  let breakEvenDims: BoxDimensions | undefined;
  if (breakEvenVolume !== undefined && actual !== undefined && vol > actual) {
    const k = Math.cbrt(breakEvenVolume / volume);
    breakEvenDims = {
      length: floorHalf(input.dims.length * k),
      width: floorHalf(input.dims.width * k),
      height: floorHalf(input.dims.height * k),
    };
  }

  const scenarios = SHRINK_STEPS_PCT.map((pct): ShrinkScenario => {
    const v = (vol * (100 - pct)) / 100;
    const c = actual === undefined ? v : Math.max(actual, v);
    return { pct, volumetricKg: v, chargeableKg: c, savedKg: chargeable - c, savedCost: rate ? (chargeable - c) * rate : undefined };
  });

  return {
    volumeCm3: volume,
    volumetricKg: vol,
    actualKg: actual,
    chargeableKg: chargeable,
    winner,
    extraKg,
    costPerParcel,
    costTotal: costPerParcel !== undefined ? round(costPerParcel * parcels, 2) : undefined,
    breakEvenVolumeCm3: breakEvenVolume,
    breakEvenDims,
    scenarios,
  };
}
