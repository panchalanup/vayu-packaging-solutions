/**
 * Style picker data and filtering (pure, no React): group tabs, search with aliases, the "Popular" row, the
 * "What are you packing?" chips and the "Options" hint shown on each style card.
 * StylePicker.tsx only renders what this file returns, so the rules are unit-tested here.
 */

import type { BoxTemplate } from '@/types/boxDesigner';
import { STYLES, STYLE_GROUPS, getStyle, getStyleGroup, type StyleDefinition, type StyleGroup } from './registry';

export type PickerGroup = 'All' | StyleGroup;
export const PICKER_GROUPS: readonly PickerGroup[] = ['All', ...STYLE_GROUPS];

/** The styles most people start from (shown first in the "Popular" row) */
export const POPULAR_STYLE_IDS: readonly BoxTemplate[] = ['rsc', 'mailer', 'telescope', 'produce', 'cake-box', 'tuck-end', 'window-mailer', 'carry'];

/** Extra words people type that the style name does not contain (lower case) */
export const STYLE_ALIASES: Record<BoxTemplate, readonly string[]> = {
  rsc: ['shipping', 'courier', 'parcel', 'carton', 'corrugated', 'cardboard', 'ecommerce', 'e-commerce', 'moving', 'storage', 'regular slotted'],
  hsc: ['open top', 'bin', 'lid', 'half slotted', 'display bin'],
  fol: ['heavy', 'export', 'full overlap', 'long items', 'machinery'],
  sleeve: ['wrap', 'band', 'open tube', 'bundle', 'outer sleeve'],
  telescope: ['shoe', 'shoes', 'footwear', 'lid and base', 'gift', 'hamper', 'two piece', 'garment', 'saree'],
  mailer: ['mailer', 'subscription', 'unboxing', 'tuck front', 'apparel', 'clothes', 'tshirt', 't-shirt', 'book'],
  pizza: ['pizza', 'flat', 'bakery', 'tart', 'flatbread'],
  tray: ['bakery', 'display', 'open', 'no lid', 'cupcake'],
  carry: ['handle', 'hand hole', 'hand holes', 'carry', 'hamper', 'sweets', 'mithai', 'moving', 'appliance'],
  produce: ['fruit', 'fruits', 'mango', 'aam', 'apple', 'grape', 'banana', 'vegetable', 'veg', 'farm', 'vent', 'vents', 'ventilated', 'orange', 'citrus', 'fresh'],
  'produce-tray': ['fruit', 'berry', 'berries', 'tomato', 'punnet', 'market', 'open tray', 'vegetable', 'strawberry'],
  'tuck-end': ['cosmetic', 'cosmetics', 'soap', 'perfume', 'cream', 'medicine', 'pharma', 'card', 'folding carton', 'retail'],
  'crash-lock': ['bottle', 'bottles', 'jar', 'jars', 'auto bottom', 'snap lock', 'heavy', 'oil', 'sauce', 'honey'],
  'one-two-three': ['123', '1-2-3', 'bottom', 'food', 'light', 'snack', 'sweet'],
  'window-mailer': ['window', 'clear', 'see through', 'mailer', 'apparel', 'cosmetics', 'gift', 'film'],
  'cake-box': ['cake', 'pastry', 'pastries', 'sweet', 'mithai', 'bakery', 'window', 'cupcake', 'dessert', 'hamper'],
  clamshell: ['burger', 'sandwich', 'lunch', 'takeaway', 'take away', 'meal', 'food', 'hinged', 'wrap', 'fries'],
  'shelf-tray': ['shelf', 'counter', 'display', 'pos', 'retail', 'snack', 'cut down', 'point of sale', 'fmcg'],
  'slide-box': ['drawer', 'sleeve', 'matchbox', 'cosmetic', 'electronics', 'gadget', 'earbuds', 'premium', 'gift', 'tray and sleeve'],
  'book-box': ['book', 'flip', 'flip top', 'hinged', 'keepsake', 'gift', 'hamper', 'magnetic look'],
};

export interface PackingChip {
  id: string;
  label: string;
  /** Styles that suit it, best first */
  styles: readonly BoxTemplate[];
}

/** "What are you packing?" chips; each lists the styles that suit it, best first */
export const PACKING_CHIPS: readonly PackingChip[] = [
  { id: 'fruits', label: 'Fruits and veg', styles: ['produce', 'produce-tray', 'carry', 'tray', 'rsc', 'hsc'] },
  { id: 'cake', label: 'Cake and sweets', styles: ['cake-box', 'pizza', 'tray', 'slide-box', 'telescope', 'one-two-three', 'carry'] },
  { id: 'clothes', label: 'Clothes', styles: ['mailer', 'window-mailer', 'telescope', 'pizza', 'rsc'] },
  { id: 'shoes', label: 'Shoes', styles: ['telescope', 'rsc', 'book-box', 'fol'] },
  { id: 'cosmetics', label: 'Cosmetics', styles: ['tuck-end', 'slide-box', 'window-mailer', 'telescope', 'mailer', 'one-two-three'] },
  { id: 'gifts', label: 'Gifts', styles: ['telescope', 'book-box', 'slide-box', 'carry', 'window-mailer', 'mailer', 'cake-box'] },
  { id: 'electronics', label: 'Electronics', styles: ['slide-box', 'mailer', 'tuck-end', 'telescope', 'rsc', 'fol'] },
  { id: 'bottles', label: 'Bottles and jars', styles: ['crash-lock', 'one-two-three', 'tuck-end', 'rsc', 'fol', 'carry'] },
  { id: 'books', label: 'Books', styles: ['book-box', 'mailer', 'slide-box', 'rsc', 'telescope'] },
];

export interface PickerFilter {
  group: PickerGroup;
  query: string;
  /** Packing chip id, or null */
  packing: string | null;
}

export const NO_FILTER: PickerFilter = { group: 'All', query: '', packing: null };

export function isFiltered(f: PickerFilter): boolean {
  return f.group !== 'All' || f.query.trim() !== '' || f.packing !== null;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();

/** Everything a search can match for one style, lower case */
export function searchText(style: StyleDefinition): string {
  return norm(
    [style.name, style.shortName, style.bestFor, style.description, style.fefco, getStyleGroup(style), ...(STYLE_ALIASES[style.id] ?? [])].join(' ')
  );
}

/** Does a style match a free-text query (every word must appear somewhere; an empty query matches all) */
export function matchesQuery(style: StyleDefinition, query: string): boolean {
  const words = norm(query).split(' ').filter(Boolean);
  if (words.length === 0) return true;
  const hay = searchText(style);
  return words.every((w) => hay.includes(w));
}

/** The styles to show for a filter, in registry order (or best-first when a packing chip is active) */
export function filterStyles(filter: PickerFilter, styles: readonly StyleDefinition[] = STYLES): StyleDefinition[] {
  let out = styles.filter((s) => (filter.group === 'All' || getStyleGroup(s) === filter.group) && matchesQuery(s, filter.query));
  const chip = PACKING_CHIPS.find((c) => c.id === filter.packing);
  if (chip) {
    const rank = (id: BoxTemplate) => chip.styles.indexOf(id);
    out = out.filter((s) => rank(s.id) >= 0).sort((a, b) => rank(a.id) - rank(b.id));
  }
  return out;
}

/** Styles split by group, in group order (empty groups left out) */
export function groupStyles(styles: readonly StyleDefinition[]): { group: StyleGroup; styles: StyleDefinition[] }[] {
  return STYLE_GROUPS.map((group) => ({ group, styles: styles.filter((s) => getStyleGroup(s) === group) })).filter((g) => g.styles.length > 0);
}

export function popularStyles(): StyleDefinition[] {
  return POPULAR_STYLE_IDS.map((id) => getStyle(id));
}

/** Short "Options" hint for a card, e.g. ["Window", "Vents", "Hand holes"] */
export function optionHints(style: StyleDefinition): string[] {
  const hints: string[] = [];
  const caps = { ...style.openings };
  if (caps.window) hints.push(style.forcedOpenings?.window ? 'Window included' : 'Window');
  if (caps.vents) hints.push('Vents');
  if (caps.hand) hints.push('Hand holes');
  if (style.id === 'shelf-tray') hints.push('Cut-down front');
  if (style.id === 'telescope') hints.push('Lid depth');
  return hints;
}
