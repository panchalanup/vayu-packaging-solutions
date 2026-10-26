/**
 * Sustainability note (#27): only claims we can stand behind.
 * - Corrugated board is paper and goes in paper/cardboard recycling.
 * - Board saved: blank area of this made-to-measure box vs the next standard size that would fit the same contents.
 */

import type { BoxDesign, BoxDimensions } from '@/types/boxDesigner';
import { getBlankSizeCm } from './blankSize';

// VERIFY-LATER[DSG-18]: replace with the owner's real list of stock / standard carton sizes (inside, cm)
export const STANDARD_SIZES_CM: readonly BoxDimensions[] = [
  { length: 15, width: 10, height: 10 },
  { length: 20, width: 15, height: 10 },
  { length: 25, width: 20, height: 15 },
  { length: 30, width: 20, height: 15 },
  { length: 30, width: 25, height: 20 },
  { length: 35, width: 25, height: 20 },
  { length: 40, width: 30, height: 25 },
  { length: 45, width: 35, height: 30 },
  { length: 50, width: 40, height: 30 },
  { length: 60, width: 40, height: 40 },
];

type Input = Pick<BoxDesign, 'template' | 'dimensions' | 'ply' | 'flutes' | 'lidDepth'>;

export interface BoardSaving {
  /** Smallest standard size that holds the same contents, or null when none is big enough */
  standard: BoxDimensions | null;
  /** This design matches a standard size */
  isStandard: boolean;
  /** Board saved per box (m²) and as a share of the standard box */
  savedM2: number;
  savedPct: number;
}

const fits = (inside: BoxDimensions, std: BoxDimensions) =>
  std.height >= inside.height &&
  ((std.length >= inside.length && std.width >= inside.width) || (std.length >= inside.width && std.width >= inside.length));

export function boardSaving(design: Input): BoardSaving {
  const own = getBlankSizeCm(design).areaM2;
  const d = design.dimensions;
  const candidates = STANDARD_SIZES_CM.filter((s) => fits(d, s))
    .map((s) => ({ s, area: getBlankSizeCm({ ...design, dimensions: s }).areaM2 }))
    .sort((a, b) => a.area - b.area);
  const best = candidates[0];
  if (!best) return { standard: null, isStandard: false, savedM2: 0, savedPct: 0 };
  const isStandard = best.s.length === d.length && best.s.width === d.width && best.s.height === d.height;
  const savedM2 = Math.max(0, best.area - own);
  return {
    standard: best.s,
    isStandard,
    savedM2: Math.round(savedM2 * 1000) / 1000,
    savedPct: best.area > 0 ? Math.round((savedM2 / best.area) * 100) : 0,
  };
}
