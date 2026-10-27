/**
 * Guided "Find my box" rules (#15).
 * Four plain questions (what, how heavy, how fragile, how it travels) plus an optional product size become a
 * recommended style, inside size, ply and flute, each with a one-line reason the user can read.
 * Only styles with a 3D model are recommended (see styleAvailability). Indicative guidance, not an engineering
 * calculation: the quote team confirms the board.
 */

import type { BoxDimensions, BoxFace, BoxTemplate, DesignOptions, FluteType, PlyType, StickerPlacement } from '@/types/boxDesigner';
import { recommendInsideSize } from './fit';
import { suggestPly } from './strength';
import { hasStyleModel, styleName } from './styleAvailability';
import { getStyle } from './styles/registry';
import { stickersFromTemplate, type TemplateSticker } from './templates';

export type ProductType =
  | 'apparel'
  | 'electronics'
  | 'food'
  | 'fruit'
  | 'cake'
  | 'bakery'
  | 'pizza'
  | 'cosmetics'
  | 'books'
  | 'footwear'
  | 'gifts'
  | 'bottles'
  | 'jars'
  | 'toys'
  | 'displays'
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
  /** Cut-outs to switch on for the recommended style (a full set of booleans, so a previous style's setting never lingers) */
  options: Pick<DesignOptions, 'handHoles' | 'vents' | 'window'> & Partial<Pick<DesignOptions, 'frontCut'>>;
  /** A sample cutout or two on the recommended style (library ids); build placements with wizardStickers() */
  stickers: TemplateSticker[];
  reasons: string[];
}

export const PRODUCT_OPTIONS: { id: ProductType; label: string; hint: string }[] = [
  { id: 'apparel', label: 'Clothing', hint: 'T-shirts, sarees, kidswear' },
  { id: 'electronics', label: 'Electronics', hint: 'Gadgets, chargers, small appliances' },
  { id: 'food', label: 'Food & grocery', hint: 'Packs, dry fruits, spices' },
  { id: 'fruit', label: 'Fruit & vegetables', hint: 'Mangoes, apples, greens, flowers' },
  { id: 'cake', label: 'Cakes', hint: 'Birthday and celebration cakes' },
  { id: 'bakery', label: 'Bakery & sweets', hint: 'Mithai, cookies, pastries' },
  { id: 'pizza', label: 'Pizza', hint: 'Takeaway and delivery' },
  { id: 'cosmetics', label: 'Beauty', hint: 'Skincare, candles, kits' },
  { id: 'books', label: 'Books & paper', hint: 'Books, diaries, prints' },
  { id: 'footwear', label: 'Footwear', hint: 'Shoes, sandals' },
  { id: 'gifts', label: 'Gifts', hint: 'Hampers, festive kits' },
  { id: 'bottles', label: 'Bottles', hint: 'Oil, wine, sauces (1 L)' },
  { id: 'jars', label: 'Jars', hint: 'Honey, jam, pickles, candles' },
  { id: 'toys', label: 'Toys & kids', hint: 'Toys, kits, games' },
  { id: 'displays', label: 'Shop displays', hint: 'Counter and shelf trays' },
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
  fruit: { length: 34, width: 24, height: 12 },
  cake: { length: 23, width: 23, height: 10 },
  bakery: { length: 22, width: 22, height: 7 },
  pizza: { length: 30, width: 30, height: 3.5 },
  cosmetics: { length: 16, width: 11, height: 7 },
  books: { length: 24, width: 17, height: 4 },
  footwear: { length: 30, width: 19, height: 10 },
  gifts: { length: 22, width: 22, height: 10 },
  bottles: { length: 9, width: 9, height: 31 },
  jars: { length: 8, width: 8, height: 11 },
  toys: { length: 24, width: 18, height: 8 },
  displays: { length: 26, width: 18, height: 8 },
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
  const retail = a.shipping === 'retail';
  if (a.product === 'pizza') return ['pizza', 'mailer', 'tray'];
  // Produce: a ventilated carton, or an open tray for soft fruit; heavy and export loads stay in the carton
  if (a.product === 'fruit') {
    if (heavy) return ['produce', 'rsc'];
    return a.fragility === 'fragile' ? ['produce-tray', 'produce'] : ['produce', 'produce-tray'];
  }
  // Counter displays are light; only a heavy load falls through to a plain carton
  if (a.product === 'displays' && a.weightKg <= 12) return ['shelf-tray', 'hsc'];
  if (heavy || a.product === 'industrial') return a.weightKg > 25 ? ['fol', 'rsc'] : ['rsc'];
  if (a.product === 'cake') return ['cake-box', 'tray', 'mailer'];
  if (a.product === 'bakery') return a.shipping === 'courier' ? ['clamshell', 'mailer', 'tray'] : ['tray', 'clamshell', 'telescope'];
  if (a.product === 'footwear') return ['telescope', 'mailer'];
  if (a.product === 'gifts') {
    if (retail) return ['slide-box', 'telescope', 'book-box'];
    return a.shipping === 'courier' ? ['mailer', 'book-box', 'telescope'] : ['book-box', 'slide-box', 'telescope'];
  }
  if (a.product === 'bottles' || a.product === 'jars') return ['crash-lock', 'tuck-end', 'rsc'];
  if (a.product === 'cosmetics' && a.weightKg <= 5) return retail ? ['tuck-end', 'slide-box', 'telescope'] : ['tuck-end', 'mailer', 'slide-box'];
  if (a.product === 'apparel' && a.weightKg <= 5) return retail ? ['tuck-end', 'mailer', 'telescope'] : ['mailer', 'window-mailer', 'tuck-end'];
  if (a.product === 'toys' && a.weightKg <= 5) return retail ? ['window-mailer', 'tuck-end', 'carry'] : ['window-mailer', 'mailer', 'carry'];
  if (a.product === 'books' && a.weightKg <= 5) return retail ? ['book-box', 'telescope', 'mailer'] : ['mailer', 'book-box'];
  if (a.product === 'electronics' && a.weightKg <= 5) return retail ? ['slide-box', 'telescope', 'mailer', 'hsc'] : ['mailer'];
  if (retail) return ['hsc', 'rsc'];
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
  produce: 'A ventilated produce carton lets air move through the fruit and has hand holes for carrying.',
  'produce-tray': 'An open ventilated tray keeps soft fruit in a single layer and is quick to pack.',
  'cake-box': 'A cake box with a window lid shows the cake and keeps the sides clean.',
  clamshell: 'A hinged clamshell protects bakery items and opens easily for takeaway.',
  'window-mailer': 'A mailer with a window lets the buyer see the product before opening.',
  'tuck-end': 'A tuck-end carton is the classic retail pack for cosmetics and small goods.',
  'crash-lock': 'A crash-lock carton ships flat and its self-locking bottom holds the weight of bottles and jars.',
  'slide-box': 'A slide box (tray and sleeve) gives a gift a smooth reveal.',
  'book-box': 'A hinged book-style box suits gifts, books and keepsakes.',
  'shelf-tray': 'A tray with a cut-down front lets shoppers pick products straight off the counter.',
  carry: 'A carry box has hand holes so it can be lifted and taken home.',
};

/** Die-cut and two-part styles are made from 3 or 5-ply board only, never 7-ply */
const DIE_CUT_STYLES: BoxTemplate[] = ['mailer', 'pizza', 'tray', 'window-mailer', 'cake-box', 'clamshell', 'shelf-tray', 'slide-box', 'book-box'];

/** Styles where the print matters most: a fine flute gives sharper artwork */
const PRINT_LED_STYLES: BoxTemplate[] = [...DIE_CUT_STYLES, 'telescope', 'sleeve', 'tuck-end', 'crash-lock'];

/** Cut-outs worth switching on for the recommended style and product (only what the style can cut is ever drawn) */
export function wizardOptions(template: BoxTemplate, a: Pick<WizardAnswers, 'product' | 'weightKg'>): WizardRecommendation['options'] {
  const style = getStyle(template);
  const caps = { ...style.openings, ...style.forcedOpenings };
  const options: WizardRecommendation['options'] = { handHoles: false, vents: false, window: false };
  if (a.product === 'fruit') {
    options.vents = !!caps.vents;
    options.handHoles = !!caps.hand;
  }
  // a window shows the product: forced on for cake and window styles, offered for bakery goods, toys and gifts
  if (style.forcedOpenings?.window) options.window = true;
  else if (caps.window && ['bakery', 'toys'].includes(a.product)) options.window = true;
  if (caps.hand && template === 'carry') options.handHoles = true;
  if (template === 'shelf-tray') options.frontCut = 0.5;
  return options;
}

/** One library cutout per product (a second for some), a neutral, factual image of the thing being packed */
const PRODUCT_STICKERS: Record<ProductType, string[]> = {
  apparel: ['t-shirt'],
  electronics: ['headphones'],
  food: ['jar'],
  fruit: ['orange', 'leaf-sprig'],
  cake: ['cake-slice'],
  bakery: ['cookie'],
  pizza: ['pizza'],
  cosmetics: ['lotion', 'lotus'],
  books: ['graduation-cap'],
  footwear: ['sneaker'],
  gifts: ['gift', 'ribbon'],
  bottles: ['water-drop'],
  jars: ['honey'],
  toys: ['teddy-bear', 'star'],
  displays: ['tag-label'],
  industrial: ['gear'],
  other: ['package'],
};

/**
 * Where the sample cutouts go: on the lid when the style has a plain one, else on the front wall. Windowed lids, open
 * trays and slotted cartons use the front; vented produce cartons keep them above the vent slots; a shelf tray keeps a
 * small one on the strip of front wall that remains.
 */
export function wizardStickerSpecs(
  template: BoxTemplate,
  product: ProductType,
  options: Pick<DesignOptions, 'window' | 'vents'>
): TemplateSticker[] {
  const style = getStyle(template);
  const ids = PRODUCT_STICKERS[product] ?? [];
  // a window on a slotted carton is on the front wall, on a die-cut box it is on the lid: keep the cutouts clear of it
  const windowOnFront = options.window && style.rigKind === 'slotted';
  const windowOnLid = options.window && style.rigKind !== 'slotted';
  const hasLid = style.faces.includes('lid');
  const onLid = hasLid && !windowOnLid && (style.rigKind !== 'slotted' || windowOnFront);
  const face: BoxFace = onLid ? 'lid' : style.faces.includes('front') ? 'front' : style.faces[0];
  if (template === 'shelf-tray') return ids.slice(0, 1).map((id) => ({ id, face, x: 0.1, y: 0.84, scale: 0.22 }));
  if (options.vents && face === 'front') return ids.slice(0, 2).map((id, i) => ({ id, face, x: i === 0 ? 0.17 : 0.83, y: 0.16, scale: 0.3 }));
  const pair = ids.slice(0, 2);
  const solo = pair.length === 1;
  const big = onLid ? 0.5 : 0.45;
  return pair.map((id, i) => ({ id, face, x: solo ? 0.5 : i === 0 ? 0.35 : 0.72, y: 0.5, scale: i === 0 ? big : 0.26 }));
}

/** Placements for the recommendation (fresh ids each call) */
export function wizardStickers(rec: Pick<WizardRecommendation, 'stickers'>): StickerPlacement[] {
  return stickersFromTemplate({ stickers: rec.stickers });
}

function chooseFlutes(ply: PlyType, template: BoxTemplate, a: WizardAnswers): FluteType[] {
  const printLed = PRINT_LED_STYLES.includes(template) || a.shipping === 'retail';
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
  const dieCut = (s: BoxTemplate) => DIE_CUT_STYLES.includes(s);
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

  const options = wizardOptions(template, a);
  if (options.vents && options.handHoles) reasons.push('Ventilation slots and hand holes are switched on for this carton.');
  else if (options.vents) reasons.push('Ventilation slots are switched on so the fruit can breathe.');
  else if (options.window) reasons.push('A window is switched on so the product shows.');
  const stickers = wizardStickerSpecs(template, a.product, options);
  if (stickers.length) reasons.push('A sample cutout is placed on the box. Swap or remove it in the Artwork tab.');

  return { template, dimensions, ply, flutes, paddingCm, options, stickers, reasons };
}
