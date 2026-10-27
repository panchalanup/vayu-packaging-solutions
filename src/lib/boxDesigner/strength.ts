/**
 * Strength guidance (#22), in plain words.
 * McKee: BCT (N) = 5.87 × ECT (N/mm) × √(caliper mm × outside perimeter mm).
 * Safe stacking load = BCT / safety factor (humidity, time under load, pallet overhang).
 * Stack height = boxes the bottom box can carry + itself, capped by a hand-stacking height.
 * Indicative only: real strength depends on paper grades (GSM, BF), humidity and handling.
 */

import type { BoxDesign, PlyType } from '@/types/boxDesigner';
import { getBoardSpec, getBoardThicknessCm } from './boardSpecs';
import { openingArea, type OpeningKind } from './rig/openings';
import { layoutForDesign, type DesignLayoutInput } from './styles/designLayout';
import { getLayoutFaceSizes, getLayoutOpenings } from './styles/registry';

export const MCKEE_K = 5.87;
// VERIFY-LATER[DSG-12]: typical edge crush (kN/m = N/mm) for our usual paper combinations per ply
export const ECT_N_PER_MM: Record<PlyType, number> = { '3-ply': 4.5, '5-ply': 7.5, '7-ply': 11 };
// VERIFY-LATER[DSG-13]: stacking safety factor (3 for dry, short storage; 4-5 for humid or long storage)
export const STACK_SAFETY_FACTOR = 4;
// VERIFY-LATER[DSG-14]: recommended maximum contents per box by ply (handling and burst guidance)
export const CONTENT_LIMIT_KG: Record<PlyType, number> = { '3-ply': 8, '5-ply': 20, '7-ply': 40 };
/** Hand-stacking limit in a warehouse (cm) */
export const MAX_STACK_HEIGHT_CM = 200;
const G = 9.81;
const PLIES: PlyType[] = ['3-ply', '5-ply', '7-ply'];

// VERIFY-LATER[DSG-72]: produce-packaging literature reports that vent and hand holes cut stacking (compression)
// strength by roughly 10-40% depending on size, position and count, and that cooling gains flatten past about 7-8%
// vent area. Used as a warning range only, never as a number in the estimate.
export const OPENING_LOSS_RANGE_PCT = [10, 40] as const;
export const VENT_AREA_USEFUL_PCT = 8;

/** Kinds of cut-out the design actually has (hand holes, vents, windows) */
export function openingKinds(design: DesignLayoutInput): Set<OpeningKind> {
  const kinds = new Set<OpeningKind>();
  for (const list of Object.values(getLayoutOpenings(layoutForDesign(design)))) for (const o of list ?? []) kinds.add(o.kind);
  return kinds;
}

/** Plain-words warnings about holes, vents and windows (empty when the design has none) */
export function openingWarnings(design: DesignLayoutInput): string[] {
  const layout = layoutForDesign(design);
  const openings = getLayoutOpenings(layout);
  const sizes = getLayoutFaceSizes(layout);
  const notes: string[] = [];
  let ventCm2 = 0;
  let wallCm2 = 0;
  let loadBearing = false;
  for (const [face, list] of Object.entries(openings)) {
    if (!list?.length) continue;
    const size = sizes[face as keyof typeof sizes];
    const vents = list.filter((o) => o.kind === 'vent');
    ventCm2 += openingArea(vents);
    if (size) wallCm2 += size.widthCm * size.heightCm;
    if (list.some((o) => o.kind !== 'window')) loadBearing = true;
  }
  if (loadBearing) {
    const [lo, hi] = OPENING_LOSS_RANGE_PCT;
    notes.push(
      `Hand holes and vents reduce stacking strength, often by about ${lo}-${hi}% depending on size and position. Treat the stack figure as a guide and test a sample before a full order.`
    );
  }
  const ventPct = wallCm2 > 0 ? (ventCm2 / wallCm2) * 100 : 0;
  if (ventPct > VENT_AREA_USEFUL_PCT) {
    notes.push(`Vents cover about ${Math.round(ventPct)}% of those walls; cooling gains level off past roughly ${VENT_AREA_USEFUL_PCT}%, so fewer slots keep more strength.`);
  }
  return notes;
}

export type StrengthRating = 'overloaded' | 'light' | 'good' | 'strong';

export interface StrengthResult {
  bctN: number;
  /** Compression strength expressed as kg-force (easier to read) */
  bctKg: number;
  safeLoadKg: number;
  maxContentKg: number;
  /** Weight the stack figure is based on (entered weight, or the recommended maximum) */
  contentKg: number;
  stackHigh: number;
  stackLimitedBy: 'load' | 'height';
  rating: StrengthRating;
  headline: string;
  detail: string;
  /** A stronger board when this one is not enough */
  suggestPly?: PlyType;
  /** Warnings about hand holes, vents and windows (see openingWarnings) */
  warnings: string[];
}

/** Lightest board that carries the weight (fragile goods get 25% headroom) */
export function suggestPly(weightKg: number, fragile = false): PlyType {
  const need = weightKg * (fragile ? 1.25 : 1);
  return PLIES.find((p) => CONTENT_LIMIT_KG[p] >= need) ?? '7-ply';
}

export function boxCompressionN(ply: PlyType, caliperMm: number, perimeterMm: number): number {
  if (!(caliperMm > 0) || !(perimeterMm > 0)) return 0;
  return MCKEE_K * ECT_N_PER_MM[ply] * Math.sqrt(caliperMm * perimeterMm);
}

const nextPly = (ply: PlyType): PlyType | undefined => PLIES[PLIES.indexOf(ply) + 1];

export function assessStrength(
  design: Pick<BoxDesign, 'dimensions' | 'ply' | 'flutes' | 'template'> & { lidDepth?: number | null; options?: Partial<BoxDesign['options']> },
  contentKg?: number
): StrengthResult {
  const board = getBoardSpec(design.ply, design.flutes);
  const t = getBoardThicknessCm(board, design.dimensions);
  const { length, width, height } = design.dimensions;
  const perimeterMm = 2 * (length + 2 * t + (width + 2 * t)) * 10;
  const outsideHeightCm = height + 4 * t;

  const bctN = boxCompressionN(design.ply, board.caliperMm, perimeterMm);
  const bctKg = bctN / G;
  const safeLoadKg = bctKg / STACK_SAFETY_FACTOR;
  const maxContentKg = CONTENT_LIMIT_KG[design.ply];
  const entered = contentKg !== undefined && Number.isFinite(contentKg) && contentKg > 0 ? contentKg : undefined;
  const weight = entered ?? maxContentKg;

  const byLoad = Math.floor(safeLoadKg / weight) + 1;
  const byHeight = Math.max(1, Math.floor(MAX_STACK_HEIGHT_CM / outsideHeightCm));
  const stackHigh = Math.max(1, Math.min(byLoad, byHeight));
  const stackLimitedBy = byLoad <= byHeight ? 'load' : 'height';

  const plyName = design.ply;
  let rating: StrengthRating;
  let headline: string;
  let detail: string;
  let suggest: PlyType | undefined;

  if (entered !== undefined && entered > maxContentKg) {
    rating = 'overloaded';
    suggest = suggestPly(entered);
    headline = `${round(entered)} kg is heavy for ${plyName}. Try ${suggest === design.ply ? 'a stronger board' : suggest}.`;
    detail = `${plyName} is comfortable up to about ${maxContentKg} kg per box.`;
  } else {
    rating = stackHigh >= 6 ? 'strong' : stackHigh >= 3 ? 'good' : 'light';
    headline = `Good for up to ~${round(entered ?? maxContentKg)} kg per box, stack ${stackHigh} high.`;
    detail =
      stackLimitedBy === 'height'
        ? `Stack height is limited by reach (about ${MAX_STACK_HEIGHT_CM / 100} m), not by the board.`
        : `The bottom box can carry about ${round(safeLoadKg)} kg safely (${round(bctKg)} kg crush strength ÷ ${STACK_SAFETY_FACTOR}).`;
    if (rating === 'light') suggest = nextPly(design.ply);
  }

  return {
    bctN: Math.round(bctN),
    bctKg: round(bctKg),
    safeLoadKg: round(safeLoadKg),
    maxContentKg,
    contentKg: weight,
    stackHigh,
    stackLimitedBy,
    rating,
    headline,
    detail,
    suggestPly: suggest,
    warnings: openingWarnings({ ...design, lidDepth: design.lidDepth ?? null }),
  };
}

function round(n: number): number {
  return n >= 10 ? Math.round(n) : Math.round(n * 10) / 10;
}
