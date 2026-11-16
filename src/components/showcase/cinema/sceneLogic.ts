/**
 * The calculations behind the interactive scenes of the film (pure, tested). Every number comes from logic the site
 * already ships: the designer's fit checker, its strength estimate and the CBM / container tool. Nothing here is a
 * made-up figure, and all of it stays labelled indicative on the page.
 */

import type { BoxDesign, BoxDimensions, PlyType } from '@/types/boxDesigner';
import { PLY_OPTIONS } from '@/lib/boxDesigner/constants';
import { getBoardSpec } from '@/lib/boxDesigner/boardSpecs';
import { recommendInsideSize, type FitResult } from '@/lib/boxDesigner/fit';
import { assessStrength } from '@/lib/boxDesigner/strength';
import { CONTAINERS, DEFAULT_PALLET_LOAD_HEIGHT_CM, DEFAULT_USABLE_PCT, assessLoading, type ContainerSpec } from '@/lib/tools/cbm';
import { paintersOrder } from '../fx/iso';

// --- Size it ------------------------------------------------------------------------------------------------------

export interface ProductPreset {
  id: string;
  label: string;
  /** Typical product size, cm */
  dims: BoxDimensions;
  fragile: boolean;
  weightKg: number;
}

// VERIFY-LATER[SHW-08]: typical sizes and weights of everyday products, for the demo only
export const PRODUCTS: readonly ProductPreset[] = [
  { id: 'phone', label: 'Phone', dims: { length: 16, width: 8, height: 1 }, fragile: true, weightKg: 0.2 },
  { id: 'mug', label: 'Mug', dims: { length: 10, width: 10, height: 10 }, fragile: true, weightKg: 0.4 },
  { id: 'bottle', label: 'Bottle', dims: { length: 7, width: 7, height: 25 }, fragile: true, weightKg: 1.1 },
  { id: 'book', label: 'Book', dims: { length: 24, width: 17, height: 3 }, fragile: false, weightKg: 0.6 },
  { id: 'shirt', label: 'T-shirt', dims: { length: 30, width: 24, height: 3 }, fragile: false, weightKg: 0.3 },
  { id: 'shoes', label: 'Shoes', dims: { length: 32, width: 20, height: 12 }, fragile: false, weightKg: 1.2 },
];

export interface SizeResult extends FitResult {
  product: ProductPreset;
}

export function sizeFor(productId: string, fragile?: boolean): SizeResult {
  const product = PRODUCTS.find((p) => p.id === productId) ?? PRODUCTS[0];
  const isFragile = fragile ?? product.fragile;
  const fit = recommendInsideSize({ product: product.dims, paddingCm: 1, fragile: isFragile, weightKg: product.weightKg });
  return { ...fit, product };
}

// --- Test it ------------------------------------------------------------------------------------------------------

/** First flute combination of a ply (what the designer picks by default) */
export const flutesFor = (ply: PlyType) => PLY_OPTIONS.find((p) => p.id === ply)?.flutes[0] ?? PLY_OPTIONS[0].flutes[0];

export interface BoardTestResult {
  /** Load at which the box is expected to fail, kg */
  failKg: number;
  /** Load the stack should carry with the safety factor, kg */
  safeKg: number;
  stackHigh: number;
  caliperMm: number;
  /** Number of liners and flutes in the board, for the cross-section drawing */
  liners: number;
  flutes: number;
}

export function boardTest(design: Pick<BoxDesign, 'template' | 'dimensions' | 'lidDepth'>, ply: PlyType): BoardTestResult {
  const flutes = flutesFor(ply);
  const result = assessStrength({ template: design.template, dimensions: design.dimensions, lidDepth: design.lidDepth, ply, flutes });
  const board = getBoardSpec(ply, flutes);
  const fluteCount = ply === '3-ply' ? 1 : ply === '5-ply' ? 2 : 3;
  return {
    failKg: Math.round(result.bctKg),
    safeKg: Math.round(result.safeLoadKg),
    stackHigh: result.stackHigh,
    caliperMm: board.caliperMm,
    liners: fluteCount + 1,
    flutes: fluteCount,
  };
}

// --- Stack it -----------------------------------------------------------------------------------------------------

export interface LoadingView {
  container: ContainerSpec;
  perContainer: number;
  fillPct: number;
  cbmPerCarton: number;
  limitedBy: 'volume' | 'layout' | 'weight';
  cartonsPerPallet: number;
  palletsPerContainer: number;
  /** Representative cubes for the drawing: columns along the length, across the width, layers up */
  grid: { nx: number; ny: number; nz: number };
  /** How many of those cubes are filled */
  filledCubes: number;
}

const CUBE_CM = 78;

export function cubeGrid(container: ContainerSpec): { nx: number; ny: number; nz: number } {
  const { length, width, height } = container.internalCm;
  return { nx: Math.max(1, Math.round(length / CUBE_CM)), ny: Math.max(1, Math.round(width / CUBE_CM)), nz: Math.max(1, Math.round(height / CUBE_CM)) };
}

/** Cubes to light, deepest first, floor to ceiling (how a container is actually loaded), as painter's-ordered cells */
export function filledCells(grid: { nx: number; ny: number; nz: number }, count: number): { x: number; y: number; z: number }[] {
  const cells: { x: number; y: number; z: number }[] = [];
  for (let x = 0; x < grid.nx; x++) for (let z = 0; z < grid.nz; z++) for (let y = 0; y < grid.ny; y++) cells.push({ x, y, z });
  return paintersOrder(cells.slice(0, Math.max(0, Math.min(cells.length, count))));
}

/** Outside size of a carton from its inside size: the board adds its thickness on each side */
export function outsideCarton(design: Pick<BoxDesign, 'dimensions' | 'ply' | 'flutes'>): BoxDimensions {
  const t = (getBoardSpec(design.ply, design.flutes).caliperMm / 10) * 2;
  const { length, width, height } = design.dimensions;
  return { length: length + t, width: width + t, height: height + t };
}

export function loadingFor(design: Pick<BoxDesign, 'dimensions' | 'ply' | 'flutes'>, containerId: ContainerSpec['id'], qty: number): LoadingView | null {
  const container = CONTAINERS.find((c) => c.id === containerId) ?? CONTAINERS[0];
  const result = assessLoading({
    carton: outsideCarton(design),
    qty,
    container: { internalCm: container.internalCm, payloadKg: container.payloadKg },
    usablePct: DEFAULT_USABLE_PCT,
    pallet: { lengthMm: 1200, widthMm: 1000, maxLoadHeightCm: DEFAULT_PALLET_LOAD_HEIGHT_CM },
  });
  if (!result) return null;
  const grid = cubeGrid(container);
  const total = grid.nx * grid.ny * grid.nz;
  return {
    container,
    perContainer: result.container.perContainer,
    fillPct: result.container.fillPct,
    cbmPerCarton: result.cbmPerCarton,
    limitedBy: result.container.limitedBy,
    cartonsPerPallet: result.pallet.cartonsPerPallet,
    palletsPerContainer: result.pallet.palletsPerContainer,
    grid,
    filledCubes: Math.round((total * result.container.fillPct) / 100),
  };
}
