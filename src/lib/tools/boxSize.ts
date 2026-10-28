/**
 * Box size from product size: product (x quantity per box) + padding -> INSIDE size, then OUTSIDE size and fill efficiency.
 * Inside = bundle + 2 x padding + the designer's fit ease (FIT_EASE_CM), rounded up to 0.5 cm. Padding is also left between items.
 * Outside = inside + 2 x board thickness per side (approximate; VERIFY-LATER[MKT-06]: confirm against the mill's real caliper).
 */

import type { BoxDimensions, BoxTemplate, PlyType } from '@/types/boxDesigner';
import { getBoardSpec } from '@/lib/boxDesigner/boardSpecs';
import { FIT_EASE_CM } from '@/lib/boxDesigner/fit';
import { suggestPly } from '@/lib/boxDesigner/strength';
import { validDims, volumeCm3 } from './shared';
import { volumetricKg } from './volumetric';

export type UseCase = 'mailer' | 'shipper' | 'food' | 'gift';

export const USE_CASES: readonly { id: UseCase; label: string; style: BoxTemplate }[] = [
  { id: 'mailer', label: 'Mailer (e-commerce)', style: 'mailer' },
  { id: 'shipper', label: 'Shipping carton', style: 'rsc' },
  { id: 'food', label: 'Food or bakery', style: 'tray' },
  { id: 'gift', label: 'Gift box', style: 'tuck-end' },
];

/** Padding presets, mm per side */
export const PADDING_PRESETS_MM = [5, 10, 20] as const;
export const MAX_ITEMS_PER_BOX = 120;

// VERIFY-LATER[MKT-06]: a starter list of round inside sizes (cm), not a published standard. Align with the
// standard-sizes chart once that article is final.
export const COMMON_SIZES_CM: readonly BoxDimensions[] = [
  { length: 15, width: 10, height: 10 },
  { length: 20, width: 15, height: 10 },
  { length: 25, width: 20, height: 10 },
  { length: 30, width: 20, height: 15 },
  { length: 30, width: 25, height: 20 },
  { length: 35, width: 25, height: 20 },
  { length: 40, width: 30, height: 25 },
  { length: 45, width: 35, height: 30 },
  { length: 50, width: 40, height: 30 },
  { length: 60, width: 40, height: 40 },
];

const roundUpHalf = (cm: number) => Math.ceil(cm * 2 - 1e-9) / 2;
const sortedDesc = (d: BoxDimensions) => [d.length, d.width, d.height].sort((a, b) => b - a);

export interface Arrangement {
  nx: number;
  ny: number;
  nz: number;
  /** Size of the grouped products (no padding), cm */
  bundle: BoxDimensions;
}

/** Best 1 x N, 2 x N ... grid of identical products (product kept in the orientation entered): smallest volume, then most cube-like */
export function bestArrangement(product: BoxDimensions, qty: number, gapCm = 0): Arrangement | null {
  if (!validDims(product) || !Number.isFinite(qty) || qty < 1 || qty > MAX_ITEMS_PER_BOX) return null;
  const n = Math.round(qty);
  let best: { arr: Arrangement; volume: number; longest: number } | null = null;
  for (let nx = 1; nx <= n; nx++) {
    if (n % nx) continue;
    for (let ny = 1; ny <= n / nx; ny++) {
      if ((n / nx) % ny) continue;
      const nz = n / nx / ny;
      const bundle: BoxDimensions = {
        length: nx * product.length + (nx - 1) * gapCm,
        width: ny * product.width + (ny - 1) * gapCm,
        height: nz * product.height + (nz - 1) * gapCm,
      };
      const volume = volumeCm3(bundle);
      const longest = Math.max(bundle.length, bundle.width, bundle.height);
      if (!best || volume < best.volume - 1e-9 || (Math.abs(volume - best.volume) < 1e-9 && longest < best.longest)) {
        best = { arr: { nx, ny, nz, bundle }, volume, longest };
      }
    }
  }
  return best?.arr ?? null;
}

export interface BoxSizeInput {
  product: BoxDimensions;
  qty: number;
  /** Padding per side, cm */
  paddingCm: number;
  ply: PlyType;
  useCase: UseCase;
  /** Contents weight per box, kg (optional, only used to suggest a ply) */
  weightKg?: number;
}

export interface BoxSizeResult {
  arrangement: Arrangement;
  inside: BoxDimensions;
  outside: BoxDimensions;
  caliperMm: number;
  fillPct: number;
  nearestCommon?: BoxDimensions;
  style: BoxTemplate;
  /** Volumetric weight of the outside size at /5000, kg (a teaser only) */
  volumetricKg5000: number;
  suggestedPly?: PlyType;
}

export function recommendBoxSize(input: BoxSizeInput): BoxSizeResult | null {
  const padding = Number.isFinite(input.paddingCm) && input.paddingCm >= 0 ? input.paddingCm : 0;
  const arrangement = bestArrangement(input.product, input.qty, padding);
  if (!arrangement) return null;
  const { bundle } = arrangement;
  const grow = (v: number) => roundUpHalf(v + 2 * padding + FIT_EASE_CM);
  const a = grow(bundle.length);
  const b = grow(bundle.width);
  const inside: BoxDimensions = { length: Math.max(a, b), width: Math.min(a, b), height: grow(bundle.height) };
  const caliperMm = getBoardSpec(input.ply).caliperMm;
  const t = caliperMm / 10;
  const outside: BoxDimensions = {
    length: Math.round((inside.length + 2 * t) * 10) / 10,
    width: Math.round((inside.width + 2 * t) * 10) / 10,
    height: Math.round((inside.height + 2 * t) * 10) / 10,
  };
  const productVolume = volumeCm3(input.product) * Math.round(input.qty);
  const insideSorted = sortedDesc(inside);
  const nearestCommon = COMMON_SIZES_CM.filter((c) => {
    const s = sortedDesc(c);
    return s[0] >= insideSorted[0] && s[1] >= insideSorted[1] && s[2] >= insideSorted[2];
  }).sort((p, q) => volumeCm3(p) - volumeCm3(q))[0];
  const style = USE_CASES.find((u) => u.id === input.useCase)?.style ?? 'rsc';
  const weight = input.weightKg !== undefined && Number.isFinite(input.weightKg) && input.weightKg > 0 ? input.weightKg : undefined;
  return {
    arrangement,
    inside,
    outside,
    caliperMm,
    fillPct: Math.min(100, (productVolume / volumeCm3(inside)) * 100),
    nearestCommon,
    style,
    volumetricKg5000: volumetricKg(outside, 5000),
    suggestedPly: weight !== undefined ? suggestPly(weight) : undefined,
  };
}
