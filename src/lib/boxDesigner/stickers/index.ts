/** Sticker (cutout) engine: registry, bitmaps, pattern maths, placement helpers and generators. */
export * from './types';
export * from './registry';
export * from './placement';
export * from './pattern';
export * from './palettes';
export { generateSurprise, seededRandom } from './surprise';
export { matchStickers, pickRecommended, recommendedCategories } from './search';
export { getStickerBitmap, cachedAspect, sizeBucket, applyTint } from './image';
