/**
 * Sticker (cutout) library types.
 * The library itself lives in ./library (one manifest module per category, produced by the assets workstream) and
 * is loaded lazily, so opening the designer never downloads it. A placeholder pack is used until it exists.
 */

/** colour = full-colour art, mono = one-colour icon, pattern = seamless tile meant to be repeated */
export type StickerKind = 'colour' | 'mono' | 'pattern';

export interface StickerDef {
  /** Short, stable, lowercase kebab id; designs and share links store only this */
  id: string;
  name: string;
  category: string;
  /** Search words (include transliterations where natural, e.g. "aam mango") */
  tags: string[];
  kind: StickerKind;
  /** Image URL (svg or png), resolved by the bundler */
  src: string;
}

export interface StickerCategory {
  id: string;
  name: string;
  /** Known only after the category has loaded */
  count?: number;
}

export interface StickerFilters {
  category?: string | null;
  kind?: StickerKind | null;
}

/** What a manifest module may export: a default array, or any named array of sticker definitions */
export type StickerManifestModule = { default?: unknown } & Record<string, unknown>;
