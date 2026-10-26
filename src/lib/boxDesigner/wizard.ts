/**
 * Guided "Find my box" rules (#15).
 * Four plain questions (what, how heavy, how fragile, how it travels) plus an optional product size become a
 * recommended style, inside size, ply and flute, each with a one-line reason the user can read.
 * Only styles with a 3D model are recommended (see styleAvailability). Indicative guidance, not an engineering
 * calculation: the quote team confirms the board.
 */

import type { BoxDimensions, BoxTemplate, FluteType, PlyType } from '@/types/boxDesigner';
import { recommendInsideSize } from './fit';
import { suggestPly } from './strength';
import { hasStyleModel, styleName } from './styleAvailability';

export type ProductType =
  | 'apparel'
  | 'electronics'
  | 'food'
  | 'bakery'
  | 'pizza'
  | 'cosmetics'
  | 'books'
  | 'footwear'
  | 'gifts'
  | 'bottles'
  | 'industrial'
  | 'other';

export type Fragility = 'sturdy' | 'some' | 'fragile';
export type ShippingMethod = 'courier' | 'local' | 'retail' | 'pallet' | 'export';

export interface WizardAnswers {
  product: ProductType;
  weightKg: number;
  fragility: Fragility;
  shipping: ShippingMethod;
  /** Product size in cm; null = use a typical size for the product type */
  productSize: BoxDimensions | null;
}

export interface WizardRecommendation {
  template: BoxTemplate;
  dimensions: BoxDimensions;
  ply: PlyType;
  flutes: FluteType[];
  /** Padding added on each side (cm) */
  paddingCm: number;
  reasons: string[];
}

export const PRODUCT_OPTIONS: { id: ProductType; label: string; hint: string }[] = [
  { id: 'apparel', label: 'Clothing', hint: 'T-shirts, sarees, kidswear' },
  { id: 'electronics', label: 'Electronics', hint: 'Gadgets, chargers, small appliances' },
  { id: 'food', label: 'Food & grocery', hint: 'Jars, packs, dry fruits' },
  { id: 'bakery', label: 'Bakery & sweets', hint: 'Cakes, mithai, cookies' },
  { id: 'pizza', label: 'Pizza', hint: 'Takeaway and delivery' },
  { id: 'cosmetics', label: 'Beauty', hint: 'Skincare, candles, kits' },
  { id: 'books', label: 'Books & paper', hint: 'Books, diaries, prints' },
  { id: 'footwear', label: 'Footwear', hint: 'Shoes, sandals' },
  { id: 'gifts', label: 'Gifts', hint: 'Hampers, festive kits' },
  { id: 'bottles', label: 'Bottles', hint: 'Oil, wine, sauces (1 L)' },
  { id: 'industrial', label: 'Industrial parts', hint: 'Spares, hardware, machinery' },
  { id: 'other', label: 'Something else', hint: 'We will start from a standard carton' },
];

export const FRAGILITY_OPTIONS: { id: Fragility; label: string; hint: string }[] = [
  { id: 'sturdy', label: 'Sturdy', hint: 'Clothes, books, tins' },
  { id: 'some', label: 'Needs some care', hint: 'Electronics, boxed goods' },
  { id: 'fragile', label: 'Fragile', hint: 'Glass, ceramics, cakes' },
];

export const SHIPPING_OPTIONS: { id: ShippingMethod; label: string; hint: string }[] = [
  { id: 'courier', label: 'Courier / e-commerce', hint: 'Parcels handled many times' },
  { id: 'local', label: 'Local delivery', hint: 'Own vans, short trips' },
  { id: 'retail', label: 'On a shop shelf', hint: 'Display and carry home' },
  { id: 'pallet', label: 'Pallets / trucks', hint: 'Stacked high in a warehouse' },
  { id: 'export', label: 'Export', hint: 'Containers, long journeys, humidity' },
];

/** Typical product size when the user does not know it (cm, L × W × H) */
export const TYPICAL_PRODUCT_SIZE: Record<ProductType, BoxDimensions> = {
  apparel: { length: 28, width: 21, height: 4 },
  electronics: { length: 20, width: 14, height: 8 },
  food: { length: 24, width: 18, height: 14 },
  bakery: { length: 22, width: 22, height: 7 },
  pizza: { length: 30, width: 30, height: 3.5 },
  cosmetics: { length: 16, width: 11, height: 7 },
  books: { length: 24, width: 17, height: 4 },
  footwear: { length: 30, width: 19, height: 10 },
  gifts: { length: 22, width: 22, height: 10 },
  bottles: { length: 9, width: 9, height: 31 },
  industrial: { length: 38, width: 28, height: 24 },
  other: { length: 28, width: 18, height: 13 },
};

/** Air or cushioning to leave on each side (cm). VERIFY-LATER[DSG-60]: confirm padding guidance with production */
export const PADDING_CM: Record<Fragility, number> = { sturdy: 0.5, some: 1, fragile: 2.5 };

const PLIES: PlyType[] = ['3-ply', '5-ply', '7-ply'];
const bump = (ply: PlyType): PlyType => PLIES[Math.min(PLIES.length - 1, PLIES.indexOf(ply) + 1)];

/** Preferred styles per product and shipping, best first; RSC is always the final fallback */
function stylePreferences(a: WizardAnswers): BoxTemplate[] {
  const heavy = a.weightKg > 12 || a.shipping === 'pallet' || a.shipping === 'export';
  if (a.product === 'pizza') return ['pizza', 'mailer', 'tray'];
  if (heavy || a.product === 'industrial') return a.weightKg > 25 ? ['fol', 'rsc'] : ['rsc'];
  if (a.product === 'bakery') return a.shipping === 'retail' ? ['tray', 'telescope', 'mailer'] : ['mailer', 'telescope', 'tray'];
  if (a.product === 'footwear') return ['telescope', 'mailer'];
  if (a.product === 'gifts') return a.shipping === 'retail' ? ['telescope', 'mailer'] : ['mailer', 'telescope'];
  if (a.product === 'bottles') return ['rsc'];
  if (['apparel', 'cosmetics', 'books', 'electronics'].includes(a.product) && a.weightKg <= 5) {
    return a.shipping === 'retail' ? ['telescope', 'mailer', 'hsc'] : ['mailer'];
  }
  if (a.shipping === 'retail') return ['hsc', 'rsc'];
  return ['rsc'];
}

const STYLE_REASON: Partial<Record<BoxTemplate, string>> = {
  rsc: 'A regular slotted carton is the most economical, strongest-per-rupee shipping box.',
  fol: 'Full-overlap flaps give a double layer top and bottom for heavy loads.',
  hsc: 'An open-top tray carton suits shelf display and lidded packs.',
  mailer: 'A tuck-top mailer opens like a gift and needs no tape: great for e-commerce unboxing.',
  pizza: 'A shallow pizza box keeps the slice flat and vents easily.',
  tray: 'A die-cut tray shows off the product and stacks neatly.',
  telescope: 'A lid-and-base box feels premium and reopens cleanly.',
  sleeve: 'A sleeve slides over a tray or product to carry the branding.',
};

function chooseFlutes(ply: PlyType, template: BoxTemplate, a: WizardAnswers): FluteType[] {
  const printLed = ['mailer', 'pizza', 'tray', 'telescope', 'sleeve'].includes(template) || a.shipping === 'retail';
  if (ply === '3-ply') {
    if (a.fragility === 'fragile') return ['C'];
    return printLed ? ['E'] : ['B'];
  }
  if (ply === '5-ply') return printLed ? ['E', 'B'] : ['B', 'C'];
  return ['C', 'B', 'C'];
}

export function recommendBox(
  answers: WizardAnswers,
  isAvailable: (style: BoxTemplate) => boolean = hasStyleModel
): WizardRecommendation {
  const weight = Number.isFinite(answers.weightKg) ? Math.min(100, Math.max(0.05, answers.weightKg)) : 1;
  const a = { ...answers, weightKg: weight };
  const reasons: string[] = [];

  // Board: lightest ply that carries the weight, one step up for rough or long journeys
  let ply = suggestPly(weight, a.fragility === 'fragile');
  reasons.push(`${ply} board carries about ${weight} kg${a.fragility === 'fragile' ? ' with headroom for fragile goods' : ''}.`);
  if ((a.shipping === 'export' || a.shipping === 'pallet') && ply !== '7-ply') {
    ply = bump(ply);
    reasons.push(`Stepped up to ${ply} for ${a.shipping === 'export' ? 'long, humid export journeys' : 'stacking on pallets'}.`);
  } else if (a.shipping === 'courier' && a.fragility !== 'sturdy' && weight > 3 && ply === '3-ply') {
    ply = bump(ply);
    reasons.push('Stepped up to 5-ply because courier parcels are dropped and stacked many times.');
  }

  // Style: first preferred style that has a 3D model and suits the board (die-cut styles stay at 3/5-ply)
  const dieCut = (s: BoxTemplate) => s === 'mailer' || s === 'pizza' || s === 'tray';
  const template =
    stylePreferences(a).find((s) => isAvailable(s) && !(dieCut(s) && ply === '7-ply')) ?? 'rsc';
  reasons.unshift(STYLE_REASON[template] ?? `${styleName(template)} suits this product.`);

  const requestedPadding = PADDING_CM[a.fragility];
  const product = answers.productSize ?? TYPICAL_PRODUCT_SIZE[a.product];
  // Same rule as the fit checker (product + padding each side + a little ease, rounded up to 0.5 cm)
  const fit = recommendInsideSize({ product, paddingCm: requestedPadding, fragile: a.fragility === 'fragile', weightKg: weight });
  const dimensions = fit.inside;
  const paddingCm = fit.paddingCm;
  if (fit.tooLarge) reasons.push('Your product is larger than the designer can show (1 m a side); we will size it for you in the quote.');
  reasons.push(
    answers.productSize
      ? `Inside size leaves ${paddingCm} cm around your product${a.fragility === 'fragile' ? ' for bubble wrap or foam' : ''}.`
      : `Inside size is based on a typical ${PRODUCT_OPTIONS.find((p) => p.id === a.product)?.label.toLowerCase() ?? 'product'}; enter your product size for a snug fit.`
  );

  const flutes = chooseFlutes(ply, template, a);
  reasons.push(
    flutes.includes('E')
      ? `${flutes.join('')} flute gives a smooth surface for sharp printing.`
      : flutes[0] === 'C' && flutes.length === 1
        ? 'C flute adds cushioning for fragile goods.'
        : `${flutes.join('')} flute balances strength and cost.`
  );

  return { template, dimensions, ply, flutes, paddingCm, reasons };
}
