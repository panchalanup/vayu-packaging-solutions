/**
 * Box compression strength (BCT) and stacking estimate, simplified McKee formula.
 *   BCT (lbf) = 5.87 x ECT (lb/in) x sqrt(caliper (in) x perimeter (in))      [ECT 32, caliper 0.125 in, perimeter 56 in -> about 497 lbf]
 * The same formula in SI (ECT in N/mm = kN/m, caliper and perimeter in mm) gives newtons; it reuses MCKEE_K from the designer.
 * Indicative only: a quick estimate, not a rating. Confirm with a lab compression test.
 */

import type { BoxDimensions, PlyType } from '@/types/boxDesigner';
import { getBoardSpec } from '@/lib/boxDesigner/boardSpecs';
import { ECT_N_PER_MM, MAX_STACK_HEIGHT_CM, MCKEE_K, STACK_SAFETY_FACTOR } from '@/lib/boxDesigner/strength';
import { validDims } from './shared';

const G = 9.81;
const PLIES: PlyType[] = ['3-ply', '5-ply', '7-ply'];
/** 1 kN/m = 5.71 lb/in */
export const LBIN_PER_KNM = 5.71;
export const MM_PER_IN = 25.4;

/** Safety factor choices (3 dry and short storage, 4 default, 5 humid or long storage); VERIFY-LATER[DSG-13] */
export const SAFETY_FACTORS = [3, 4, 5] as const;
export const HUMID_SAFETY_FACTOR = 5;
export { STACK_SAFETY_FACTOR };

// VERIFY-LATER[DSG-72]: vents and hand holes cut stacking strength by roughly 10-40% (see lib/boxDesigner/strength.ts).
// 25% is the midpoint of that range, offered as an editable default, not a measured value.
export const DEFAULT_OPENINGS_PENALTY_PCT = 25;

export const ectKnmToLbIn = (knm: number): number => knm * LBIN_PER_KNM;
export const ectLbInToKnm = (lbin: number): number => lbin / LBIN_PER_KNM;

/** Imperial McKee, as published: lbf */
export const mcKeeLbf = (ectLbIn: number, caliperIn: number, perimeterIn: number): number =>
  ectLbIn > 0 && caliperIn > 0 && perimeterIn > 0 ? MCKEE_K * ectLbIn * Math.sqrt(caliperIn * perimeterIn) : 0;

/** SI McKee: newtons from ECT (N/mm), caliper (mm), outside perimeter (mm) */
export const mcKeeN = (ectNmm: number, caliperMm: number, perimeterMm: number): number =>
  ectNmm > 0 && caliperMm > 0 && perimeterMm > 0 ? MCKEE_K * ectNmm * Math.sqrt(caliperMm * perimeterMm) : 0;

/** Typical board for a ply: ECT (kN/m) and caliper (mm) the designer uses */
export const plyBoard = (ply: PlyType): { ectKnm: number; caliperMm: number } => ({ ectKnm: ECT_N_PER_MM[ply], caliperMm: getBoardSpec(ply).caliperMm });

export interface StrengthInput {
  /** Inside size, cm (height optional) */
  inside: Pick<BoxDimensions, 'length' | 'width'> & { height?: number };
  ectKnm: number;
  caliperMm: number;
  safetyFactor: number;
  /** Weight of one filled box, kg (optional) */
  boxWeightKg?: number;
  /** Strength lost to vents / hand holes, % (0 for a plain box) */
  penaltyPct?: number;
}

export interface StrengthEstimate {
  perimeterMm: number;
  bctN: number;
  bctKgf: number;
  bctLbf: number;
  /** BCT after the openings penalty */
  usableKgf: number;
  allowableKg: number;
  /** Boxes in the stack, bottom box included (needs a box weight) */
  stackHigh?: number;
  stackLimitedBy?: 'load' | 'height';
  rating?: 'light' | 'good' | 'strong';
}

export function estimateStrength(input: StrengthInput): StrengthEstimate | null {
  const { length, width } = input.inside;
  if (![length, width, input.ectKnm, input.caliperMm].every((v) => Number.isFinite(v) && v > 0)) return null;
  const sf = Number.isFinite(input.safetyFactor) && input.safetyFactor >= 1 ? input.safetyFactor : STACK_SAFETY_FACTOR;
  const penalty = Math.min(90, Math.max(0, input.penaltyPct ?? 0));
  const t = input.caliperMm;
  const perimeterMm = 2 * (length * 10 + 2 * t + (width * 10 + 2 * t));
  const bctN = mcKeeN(input.ectKnm, t, perimeterMm);
  const bctKgf = bctN / G;
  const usableKgf = bctKgf * (1 - penalty / 100);
  const allowableKg = usableKgf / sf;

  const out: StrengthEstimate = { perimeterMm, bctN, bctKgf, bctLbf: bctN / 4.448, usableKgf, allowableKg };
  const weight = input.boxWeightKg !== undefined && Number.isFinite(input.boxWeightKg) && input.boxWeightKg > 0 ? input.boxWeightKg : undefined;
  if (weight !== undefined) {
    const byLoad = Math.floor(allowableKg / weight + 1e-9) + 1;
    const h = input.inside.height;
    const outsideHeightCm = h !== undefined && h > 0 ? h + 4 * (t / 10) : undefined;
    const byHeight = outsideHeightCm ? Math.max(1, Math.floor(MAX_STACK_HEIGHT_CM / outsideHeightCm)) : Infinity;
    out.stackHigh = Math.max(1, Math.min(byLoad, byHeight));
    out.stackLimitedBy = byLoad <= byHeight ? 'load' : 'height';
    out.rating = out.stackHigh >= 6 ? 'strong' : out.stackHigh >= 3 ? 'good' : 'light';
  }
  return out;
}

export interface PlyComparison {
  ply: PlyType;
  ectKnm: number;
  caliperMm: number;
  bctKgf: number;
  allowableKg: number;
  stackHigh?: number;
}

/** The same box in 3, 5 and 7-ply (designer's typical boards): for "move to 5-ply" advice */
export function comparePlies(input: Omit<StrengthInput, 'ectKnm' | 'caliperMm'>): PlyComparison[] {
  return PLIES.flatMap((ply) => {
    const board = plyBoard(ply);
    const e = estimateStrength({ ...input, ...board });
    return e ? [{ ply, ...board, bctKgf: e.bctKgf, allowableKg: e.allowableKg, stackHigh: e.stackHigh }] : [];
  });
}
