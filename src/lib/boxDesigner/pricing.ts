/**
 * Instant indicative estimate (#1, #4).
 * per box = (board + print + finish) on the flat blank area × wastage + conversion, × quantity-tier factor,
 *           + one-time setup (plates per colour, cutting die for die-cut styles) spread over the quantity.
 * Every rate is a named constant so the owner can tune it in one place. The UI always labels the result
 * "indicative" and shows a range, never a single binding price.
 */

import type { BoxDesign, BoxTemplate, PlyType } from '@/types/boxDesigner';
import { getBlankSizeCm } from './blankSize';

/** Order quantity slabs shown as chips */
export const QUANTITY_TIERS = [100, 500, 1000, 5000] as const;
export type QuantityTier = (typeof QUANTITY_TIERS)[number];

// VERIFY-LATER[DSG-03]: board cost per m² of blank (paper + corrugation), ex-GST, per ply. Placeholders.
export const BOARD_RATE_PER_M2: Record<PlyType, number> = { '3-ply': 28, '5-ply': 50, '7-ply': 74 };
// VERIFY-LATER[DSG-04]: trim and set-up waste on the corrugator / cutter
export const WASTAGE_FACTOR = 1.1;
// VERIFY-LATER[DSG-05]: flexo print cost per colour per m² of blank
export const PRINT_RATE_PER_COLOUR_M2 = 3.5;
// VERIFY-LATER[DSG-06]: one-time printing plate cost per colour
export const PLATE_COST_PER_COLOUR = 1800;
// VERIFY-LATER[DSG-07]: one-time cutting die for die-cut styles (mailer, pizza, tray)
export const DIE_COST = 4000;
// VERIFY-LATER[DSG-08]: gloss varnish per m²
export const GLOSS_RATE_PER_M2 = 5;
// VERIFY-LATER[DSG-09]: white top liner premium on the board rate
export const WHITE_LINER_PREMIUM = 0.08;
// VERIFY-LATER[DSG-10]: slotting, stitching/gluing, bundling per box
export const CONVERSION_PER_BOX = 1.5;
// VERIFY-LATER[DSG-11]: short-run premium / volume discount per slab
export const TIER_FACTOR: Record<QuantityTier, number> = { 100: 1.3, 500: 1, 1000: 0.94, 5000: 0.86 };
/** ± spread shown around the midpoint so nobody reads it as a firm price */
export const ESTIMATE_SPREAD = 0.15;
/** Die-cut styles need a cutting die */
export const DIE_CUT_STYLES: readonly BoxTemplate[] = ['mailer', 'pizza', 'tray'];
/** Board colours that are the natural paper (no flood print) */
const NATURAL_BOARD = ['#c9a87c', '#d9b77e', '#8b6f47'];
const WHITE_BOARD = ['#f5f5f0', '#ffffff'];

export type BoardSurface = 'kraft' | 'white' | 'flood';

export function boardSurfaceOf(colorHex: string): BoardSurface {
  const hex = colorHex.toLowerCase();
  if (NATURAL_BOARD.includes(hex)) return 'kraft';
  if (WHITE_BOARD.includes(hex)) return 'white';
  return 'flood';
}

/**
 * Print colours implied by the design: any image counts as full colour (4, CMYK);
 * otherwise one per distinct text colour; a coloured (non-kraft, non-white) board adds a flood colour. Max 4.
 */
export function countPrintColours(design: Pick<BoxDesign, 'faceImages' | 'textElements' | 'colorHex'>): number {
  const flood = boardSurfaceOf(design.colorHex) === 'flood' ? 1 : 0;
  if (design.faceImages.length > 0) return 4;
  const textColours = new Set(design.textElements.filter((t) => t.text.trim()).map((t) => t.color.toLowerCase())).size;
  return Math.min(4, textColours + flood);
}

/** The slab a quantity falls into (below 100 uses the 100 slab) */
export function tierFor(quantity: number): QuantityTier {
  let tier: QuantityTier = QUANTITY_TIERS[0];
  for (const t of QUANTITY_TIERS) if (quantity >= t) tier = t;
  return tier;
}

export type EstimateInput = Pick<
  BoxDesign,
  'template' | 'dimensions' | 'ply' | 'flutes' | 'lidDepth' | 'finish' | 'colorHex' | 'faceImages' | 'textElements'
> & { quantity: number };

export interface Estimate {
  quantity: number;
  tier: QuantityTier;
  areaM2: number;
  colours: number;
  /** Midpoint per box (₹, ex-GST) */
  perBox: number;
  low: number;
  high: number;
  /** Midpoint order total (₹, ex-GST, ex-delivery) */
  total: number;
  /** One-time plates + die included in the per-box figure */
  setup: number;
  breakdown: { board: number; print: number; finish: number; conversion: number; setupPerBox: number };
}

const money = (n: number) => Math.round(n * 100) / 100;

export function estimatePrice(input: EstimateInput): Estimate {
  const quantity = Math.max(1, Math.round(Number.isFinite(input.quantity) ? input.quantity : 1));
  const tier = tierFor(quantity);
  const { areaM2 } = getBlankSizeCm(input);
  const colours = countPrintColours(input);
  const surface = boardSurfaceOf(input.colorHex);
  const sheet = areaM2 * WASTAGE_FACTOR;

  const boardRate = BOARD_RATE_PER_M2[input.ply] * (surface === 'white' ? 1 + WHITE_LINER_PREMIUM : 1);
  const board = sheet * boardRate;
  const print = sheet * colours * PRINT_RATE_PER_COLOUR_M2;
  const finish = input.finish === 'gloss' ? sheet * GLOSS_RATE_PER_M2 : 0;
  const conversion = CONVERSION_PER_BOX;
  const setup = colours * PLATE_COST_PER_COLOUR + (DIE_CUT_STYLES.includes(input.template) ? DIE_COST : 0);
  const setupPerBox = setup / quantity;

  const perBox = (board + print + finish + conversion) * TIER_FACTOR[tier] + setupPerBox;
  return {
    quantity,
    tier,
    areaM2,
    colours,
    perBox: money(perBox),
    low: money(perBox * (1 - ESTIMATE_SPREAD)),
    high: money(perBox * (1 + ESTIMATE_SPREAD)),
    total: Math.round(money(perBox) * quantity),
    setup,
    breakdown: {
      board: money(board),
      print: money(print),
      finish: money(finish),
      conversion: money(conversion),
      setupPerBox: money(setupPerBox),
    },
  };
}

/** Estimates for every quantity slab (for the tier chips) */
export function estimateTiers(input: Omit<EstimateInput, 'quantity'>): { tier: QuantityTier; estimate: Estimate }[] {
  return QUANTITY_TIERS.map((tier) => ({ tier, estimate: estimatePrice({ ...input, quantity: tier }) }));
}

/** ₹12.40 / ₹1,24,000 */
export function formatRupees(value: number, decimals: 0 | 2 = 2): string {
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}
