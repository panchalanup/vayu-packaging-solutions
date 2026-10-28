/**
 * Sticker search and recommendations (pure, no loading).
 */

import type { StickerDef, StickerFilters } from './types';
import { categoryName } from './categories';

const norm = (value: string) => value.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').trim();

function scoreSticker(sticker: StickerDef, tokens: string[]): number {
  const name = norm(sticker.name);
  const id = sticker.id.toLowerCase();
  const tags = sticker.tags.map(norm);
  const cat = norm(categoryName(sticker.category));
  let total = 0;
  for (const token of tokens) {
    let best = 0;
    if (name === token) best = 100;
    else if (name.startsWith(token)) best = 80;
    else if (tags.includes(token)) best = 70;
    else if (name.split(/[\s-]+/).some((w) => w.startsWith(token))) best = 60;
    else if (tags.some((t) => t.startsWith(token))) best = 50;
    else if (name.includes(token) || id.includes(token)) best = 30;
    else if (tags.some((t) => t.includes(token))) best = 20;
    else if (cat.includes(token)) best = 10;
    if (best === 0) return 0; // every word must match something
    total += best;
  }
  return total;
}

/** Filter by category/kind, then rank by the query (all words must match). An empty query keeps library order. */
export function matchStickers(all: StickerDef[], query = '', filters: StickerFilters = {}): StickerDef[] {
  const pool = all.filter((s) => (!filters.category || s.category === filters.category) && (!filters.kind || s.kind === filters.kind));
  const tokens = norm(query).split(/\s+/).filter(Boolean).slice(0, 6);
  if (!tokens.length) return pool;
  return pool
    .map((s, index) => ({ s, index, score: scoreSticker(s, tokens) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((r) => r.s);
}

/** Category ids worth showing first for a box style */
const STYLE_CATEGORIES: Record<string, string[]> = {
  rsc: ['shipping-marks', 'badges-labels', 'patterns', 'contact-icons'],
  hsc: ['shipping-marks', 'badges-labels', 'patterns'],
  fol: ['shipping-marks', 'badges-labels', 'contact-icons'],
  sleeve: ['patterns', 'gifts-festive', 'badges-labels', 'shapes-frames'],
  telescope: ['gifts-festive', 'beauty-wellness', 'shapes-frames', 'badges-labels'],
  mailer: ['clothing', 'beauty-wellness', 'shapes-frames', 'badges-labels'],
  pizza: ['bakery-food', 'badges-labels', 'drinks'],
  tray: ['fruits-veg', 'bakery-food', 'badges-labels'],
  // phase 2 styles
  carry: ['gifts-festive', 'home-kitchen', 'fruits-veg', 'badges-labels'],
  produce: ['fruits-veg', 'flowers-plants', 'badges-labels'],
  'produce-tray': ['fruits-veg', 'flowers-plants', 'badges-labels'],
  'tuck-end': ['beauty-wellness', 'electronics', 'shapes-frames', 'badges-labels'],
  'crash-lock': ['bakery-food', 'drinks', 'beauty-wellness', 'badges-labels'],
  'one-two-three': ['bakery-food', 'drinks', 'beauty-wellness', 'badges-labels'],
  'window-mailer': ['clothing', 'animals-kids', 'shapes-frames', 'badges-labels'],
  'cake-box': ['bakery-food', 'drinks', 'gifts-festive', 'badges-labels'],
  clamshell: ['bakery-food', 'drinks', 'badges-labels'],
  'shelf-tray': ['bakery-food', 'beauty-wellness', 'shapes-frames', 'badges-labels'],
  'slide-box': ['gifts-festive', 'beauty-wellness', 'shapes-frames', 'badges-labels'],
  'book-box': ['gifts-festive', 'clothing', 'shapes-frames', 'badges-labels'],
};

/** Template category (any wording used by the template gallery) to sticker categories, by keyword */
const TEMPLATE_KEYWORDS: [RegExp, string[]][] = [
  [/fruit|produce|veg|farm/, ['fruits-veg', 'flowers-plants', 'badges-labels']],
  [/food|bak|cake|sweet|snack|takeaway|kitchen|restaurant/, ['bakery-food', 'drinks', 'fruits-veg', 'badges-labels']],
  [/cloth|fashion|apparel|garment|shoe|foot|jewel/, ['clothing', 'footwear-accessories', 'badges-labels']],
  [/beauty|wellness|cosmetic|soap|skin/, ['beauty-wellness', 'flowers-plants', 'badges-labels']],
  [/electron|gadget|tech/, ['electronics', 'shipping-marks', 'badges-labels']],
  [/gift|festive|retail|wedding|diwali|hamper/, ['gifts-festive', 'shapes-frames', 'badges-labels', 'flowers-plants']],
  [/home|decor/, ['home-kitchen', 'flowers-plants', 'badges-labels']],
  [/toy|kid|pet|animal/, ['animals-kids', 'shapes-frames', 'badges-labels']],
  [/plant|flower/, ['flowers-plants', 'shapes-frames']],
  [/ship|export|industrial|ecommerce|commerce|courier|subscription/, ['shipping-marks', 'badges-labels', 'contact-icons']],
];

export function recommendedCategories(style: string, templateCategory?: string | null): string[] {
  const out: string[] = [];
  const add = (ids: string[]) => ids.forEach((id) => out.includes(id) || out.push(id));
  const key = (templateCategory ?? '').toLowerCase();
  if (key) for (const [pattern, ids] of TEMPLATE_KEYWORDS) if (pattern.test(key)) add(ids);
  add(STYLE_CATEGORIES[style] ?? STYLE_CATEGORIES.rsc);
  return out;
}

/** A varied row of suggestions (round-robin across the recommended categories). Falls back to the whole library. */
export function pickRecommended(all: StickerDef[], style: string, templateCategory?: string | null, limit = 12): StickerDef[] {
  const cats = recommendedCategories(style, templateCategory);
  const buckets = cats
    .map((c) => all.filter((s) => s.category === c && s.kind !== 'pattern'))
    .filter((b) => b.length > 0);
  const out: StickerDef[] = [];
  for (let round = 0; out.length < limit; round++) {
    let added = false;
    for (const bucket of buckets) {
      if (round < bucket.length && out.length < limit) {
        out.push(bucket[round]);
        added = true;
      }
    }
    if (!added) break;
  }
  if (out.length === 0) return all.filter((s) => s.kind !== 'pattern').slice(0, limit);
  return out;
}
