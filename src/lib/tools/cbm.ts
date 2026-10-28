/**
 * CBM (cubic metres) and container / pallet loading estimate.
 * CBM per carton = L x W x H (cm) / 1,000,000. Cartons per container is the lowest of three limits: usable volume,
 * a simple floor-grid layout, and payload weight. This is NOT 3D bin-packing: layers of identical cartons on a grid,
 * with up to two blocks per layer, so real loading can fit a few more or fewer. Confirm with your freight forwarder.
 */

import type { BoxDimensions } from '@/types/boxDesigner';
import { validDims, volumeCm3 } from './shared';

export interface ContainerSpec {
  id: '20ft' | '40ft' | '40ft-hc';
  name: string;
  /** Typical internal size, cm */
  internalCm: BoxDimensions;
  /** Typical payload limit, kg (editable in the calculator) */
  payloadKg: number;
}

// VERIFY-LATER[MKT-05]: typical internal sizes and payloads of standard containers differ a little by line and age
// (sources quote about 33, 67 and 76 CBM). Shown as editable starting points, never as a guarantee.
export const CONTAINERS: readonly ContainerSpec[] = [
  { id: '20ft', name: '20 ft', internalCm: { length: 590, width: 235, height: 239 }, payloadKg: 28000 },
  { id: '40ft', name: '40 ft', internalCm: { length: 1203, width: 235, height: 239 }, payloadKg: 26500 },
  { id: '40ft-hc', name: '40 ft high cube', internalCm: { length: 1203, width: 235, height: 269 }, payloadKg: 26000 },
];

/** Default share of the container volume that cartons can really fill (gaps, dunnage, door space) */
export const DEFAULT_USABLE_PCT = 85;

// VERIFY-LATER[MKT-05]: pallet sizes (mm, length x width) in common use; 1200 x 1000 is the default
export const PALLET_PRESETS = [
  { id: '1200x1000', name: '1200 x 1000 mm', lengthMm: 1200, widthMm: 1000 },
  { id: '1200x800', name: '1200 x 800 mm', lengthMm: 1200, widthMm: 800 },
] as const;
/** Default load height above the pallet deck, cm (a common handling limit; check with your carrier) */
export const DEFAULT_PALLET_LOAD_HEIGHT_CM = 150;
/** Pallet deck height, cm (VERIFY-LATER[MKT-05]) */
export const PALLET_DECK_CM = 15;

const EPS = 1e-9;
const fit = (space: number, size: number) => Math.floor(space / size + EPS);

export const cartonCbm = (dims: BoxDimensions): number => (validDims(dims) ? volumeCm3(dims) / 1_000_000 : NaN);

function blockCount(L: number, W: number, a: number, b: number): number {
  let best = 0;
  for (let n = 0; n <= fit(L, a); n++) {
    const first = n * fit(W, b);
    const rest = fit(L - n * a, b) * fit(W, a);
    best = Math.max(best, first + rest);
  }
  return best;
}

/**
 * How many a x b rectangles fit on an L x W floor: all-one-orientation grids, plus two-block layouts
 * (n columns one way, the rest turned). A fast estimate, not an optimal packing.
 */
export function rectCount(L: number, W: number, a: number, b: number): number {
  if (![L, W, a, b].every((v) => Number.isFinite(v) && v > 0)) return 0;
  return Math.max(blockCount(L, W, a, b), blockCount(L, W, b, a), blockCount(W, L, a, b), blockCount(W, L, b, a));
}

export interface LayoutResult {
  count: number;
  perLayer: number;
  layers: number;
  /** Carton side that stands upright (cm) */
  upright: number;
}

/** Best of the three ways to stand a carton, in a space of floor L x W and height H (cm) */
export function layoutCount(space: BoxDimensions, carton: BoxDimensions): LayoutResult {
  const sides = [carton.length, carton.width, carton.height];
  let best: LayoutResult = { count: 0, perLayer: 0, layers: 0, upright: carton.height };
  for (let i = 0; i < 3; i++) {
    const upright = sides[i];
    const [a, b] = sides.filter((_, j) => j !== i);
    const layers = fit(space.height, upright);
    const perLayer = rectCount(space.length, space.width, a, b);
    if (layers * perLayer > best.count) best = { count: layers * perLayer, perLayer, layers, upright };
  }
  return best;
}

export interface LoadingInput {
  carton: BoxDimensions;
  qty: number;
  /** Gross weight of one packed carton, kg (optional) */
  grossKg?: number;
  container: { internalCm: BoxDimensions; payloadKg: number };
  usablePct: number;
  pallet: { lengthMm: number; widthMm: number; maxLoadHeightCm: number };
}

export interface ContainerLoading {
  volumeCbm: number;
  byVolume: number;
  byLayout: LayoutResult;
  byWeight?: number;
  perContainer: number;
  limitedBy: 'volume' | 'layout' | 'weight';
  /** Share of the container's internal volume the loaded cartons occupy */
  fillPct: number;
  containersNeeded: number;
}

export interface PalletLoading {
  layout: LayoutResult;
  cartonsPerPallet: number;
  palletWeightKg?: number;
  palletsPerContainer: number;
  /** Cartons per container when palletised (one pallet layer, no double stacking) */
  cartonsPerContainer: number;
  palletsNeeded: number;
}

export interface LoadingResult {
  cbmPerCarton: number;
  totalCbm: number;
  container: ContainerLoading;
  pallet: PalletLoading;
}

export function assessLoading(input: LoadingInput): LoadingResult | null {
  if (!validDims(input.carton) || !validDims(input.container.internalCm)) return null;
  const qty = Number.isFinite(input.qty) && input.qty > 0 ? Math.round(input.qty) : 1;
  const per = cartonCbm(input.carton);
  const space = input.container.internalCm;
  const volumeCbm = volumeCm3(space) / 1_000_000;
  const usable = Math.min(100, Math.max(1, Number.isFinite(input.usablePct) ? input.usablePct : DEFAULT_USABLE_PCT));
  const grossKg = input.grossKg !== undefined && Number.isFinite(input.grossKg) && input.grossKg > 0 ? input.grossKg : undefined;

  const byVolume = Math.floor((volumeCbm * usable) / 100 / per + EPS);
  const byLayout = layoutCount(space, input.carton);
  const byWeight = grossKg !== undefined && input.container.payloadKg > 0 ? Math.floor(input.container.payloadKg / grossKg + EPS) : undefined;
  const perContainer = Math.max(0, Math.min(byVolume, byLayout.count, byWeight ?? Infinity));
  const limitedBy: ContainerLoading['limitedBy'] =
    byWeight !== undefined && byWeight <= byVolume && byWeight <= byLayout.count ? 'weight' : byVolume <= byLayout.count ? 'volume' : 'layout';

  // Pallet: the load height is capped by the container height minus the deck
  const loadHeight = Math.min(input.pallet.maxLoadHeightCm, space.height - PALLET_DECK_CM);
  const palletL = input.pallet.lengthMm / 10;
  const palletW = input.pallet.widthMm / 10;
  const layout = layoutCount({ length: palletL, width: palletW, height: Math.max(0, loadHeight) }, input.carton);
  const palletWeightKg = grossKg !== undefined ? layout.count * grossKg : undefined;
  const palletsPerContainer = rectCount(space.length, space.width, palletL, palletW);
  const palletByWeight =
    palletWeightKg !== undefined && palletWeightKg > 0 && input.container.payloadKg > 0 ? Math.floor(input.container.payloadKg / palletWeightKg + EPS) : Infinity;
  const palletsLoaded = Math.min(palletsPerContainer, palletByWeight);
  const palletised = palletsLoaded * layout.count;

  return {
    cbmPerCarton: per,
    totalCbm: per * qty,
    container: {
      volumeCbm,
      byVolume,
      byLayout,
      byWeight,
      perContainer,
      limitedBy,
      fillPct: Math.min(100, ((perContainer * per) / volumeCbm) * 100),
      containersNeeded: perContainer > 0 ? Math.ceil(qty / perContainer) : 0,
    },
    pallet: {
      layout,
      cartonsPerPallet: layout.count,
      palletWeightKg,
      palletsPerContainer: palletsLoaded,
      cartonsPerContainer: palletised,
      palletsNeeded: layout.count > 0 ? Math.ceil(qty / layout.count) : 0,
    },
  };
}
