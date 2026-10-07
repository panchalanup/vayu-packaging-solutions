/**
 * Corrugated board specifications
 * Ply count -> wall construction -> flute stack -> caliper (thickness) and flute pitch.
 *
 *  3-ply = single wall  (liner + 1 flute + liner)
 *  5-ply = double wall  (2 flutes, 3 liners)
 *  7-ply = triple wall  (3 flutes, 4 liners)
 *
 * Values are indicative industry figures (flute heights from FLUTE_TYPES, 0.2 mm per liner).
 * They must be confirmed against supplier data (see docs/3D-Model-page plan, section 7).
 */

import { FLUTE_TYPES } from './constants';
import type { BoxDimensions, FluteType, PlyType } from '@/types/boxDesigner';

/** Paper liner thickness used for the caliper estimate (mm) */
export const LINER_MM = 0.2;

/** Default flute stack per ply, listed outer -> inner (B outside prints better on double wall) */
export const DEFAULT_PLY_FLUTES: Record<PlyType, FluteType[]> = {
  '3-ply': ['B'],
  '5-ply': ['B', 'C'],
  '7-ply': ['C', 'B', 'C'],
};

export interface FluteLayer {
  flute: FluteType;
  /** Flute height (mm) */
  heightMm: number;
  /** Distance between flute crests (mm) */
  pitchMm: number;
}

export interface BoardSpec {
  ply: PlyType;
  flutes: FluteType[];
  layers: FluteLayer[];
  linerMm: number;
  /** Total board thickness (mm) */
  caliperMm: number;
  /** Stable key for caching textures per construction */
  key: string;
}

const MM_PER_FOOT = 304.8;

export function getBoardSpec(ply: PlyType, flutes?: FluteType[]): BoardSpec {
  const stack = flutes && flutes.length > 0 ? flutes : DEFAULT_PLY_FLUTES[ply] ?? DEFAULT_PLY_FLUTES['5-ply'];
  const layers = stack.map((flute) => {
    const spec = FLUTE_TYPES[flute];
    return { flute, heightMm: spec.height, pitchMm: MM_PER_FOOT / spec.spacing };
  });
  const caliperMm = layers.reduce((sum, layer) => sum + layer.heightMm, 0) + LINER_MM * (layers.length + 1);
  return {
    ply,
    flutes: stack,
    layers,
    linerMm: LINER_MM,
    caliperMm: Math.round(caliperMm * 100) / 100,
    key: `${ply}:${stack.join('')}`,
  };
}

/**
 * Board thickness in scene units (cm), clamped so very small boxes stay well-formed:
 * the board may never exceed 10% of the smallest box dimension.
 */
export function getBoardThicknessCm(board: BoardSpec, dims: BoxDimensions): number {
  const smallest = Math.min(dims.length, dims.width, dims.height);
  const limit = Number.isFinite(smallest) && smallest > 0 ? smallest * 0.1 : 0.1;
  return Math.max(0.05, Math.min(board.caliperMm / 10, limit));
}
