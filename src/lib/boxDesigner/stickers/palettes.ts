/**
 * Curated colour palettes for "Surprise me" and the quick tint swatches. Original combinations, no brand colours.
 * board = box colour, colours = sticker tints and accents (first is the main accent).
 */

export interface StickerPalette {
  id: string;
  name: string;
  board: string;
  colours: string[];
}

export const STICKER_PALETTES: StickerPalette[] = [
  { id: 'kraft-green', name: 'Natural kraft', board: '#C9A86C', colours: ['#2E5E2E', '#F4EBD8', '#8A4B2A', '#1F1A14'] },
  { id: 'fresh-produce', name: 'Fresh produce', board: '#F4EFE4', colours: ['#E5483B', '#3C8D40', '#F2A31B', '#1F1A14'] },
  { id: 'bakery-warm', name: 'Bakery', board: '#FBEFD9', colours: ['#B5532C', '#E8A33D', '#6B3A1F', '#FFFFFF'] },
  { id: 'fashion-ink', name: 'Fashion', board: '#1F1F24', colours: ['#F3E9DC', '#D9A441', '#C4586B', '#FFFFFF'] },
  { id: 'fresh-blue', name: 'Fresh blue', board: '#E8F1FB', colours: ['#1A6FE6', '#0B3D91', '#F2C230', '#FFFFFF'] },
  { id: 'festive', name: 'Festive', board: '#7A1F2B', colours: ['#F2C230', '#FFF3D6', '#E58A2B', '#FFFFFF'] },
  { id: 'soft-pastel', name: 'Soft pastel', board: '#F6E7EC', colours: ['#C4586B', '#7FB6A5', '#F2C97C', '#4A3F5C'] },
  { id: 'tech-dark', name: 'Tech', board: '#14181F', colours: ['#3DDC97', '#4DA3FF', '#FFFFFF', '#9AA4B2'] },
];

/** Swatches shown in the tint picker when there is no brand kit */
export const BASIC_TINTS = ['#111111', '#FFFFFF', '#1A6FE6', '#B3261E', '#2E7D32', '#E3B53C'];

/** Pick the palette that suits a box type best (by recommended category keywords); falls back to the first */
export function paletteFor(templateCategory: string | null | undefined, index = 0): StickerPalette {
  const key = (templateCategory ?? '').toLowerCase();
  const preferred =
    /fruit|produce|veg|farm/.test(key) ? ['fresh-produce', 'kraft-green']
    : /food|bak|cake|sweet/.test(key) ? ['bakery-warm', 'kraft-green']
    : /cloth|fashion|apparel|shoe|jewel/.test(key) ? ['fashion-ink', 'soft-pastel']
    : /beauty|wellness|cosmetic/.test(key) ? ['soft-pastel', 'fashion-ink']
    : /electron|gadget|tech/.test(key) ? ['tech-dark', 'fresh-blue']
    : /gift|festive|retail/.test(key) ? ['festive', 'soft-pastel']
    : [];
  const pool = [...preferred, ...STICKER_PALETTES.map((p) => p.id)].map((id) => STICKER_PALETTES.find((p) => p.id === id)!);
  return pool[((index % pool.length) + pool.length) % pool.length];
}
