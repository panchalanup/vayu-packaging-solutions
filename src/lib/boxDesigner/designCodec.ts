/**
 * Design codec
 * Validates and (de)serialises a BoxDesign for autosave, JSON import/export and share links.
 * SECURITY: every external input (URL hash, imported file, localStorage) is untrusted. It is parsed with a strict
 * zod schema, size-capped, and only data:image URLs are accepted for artwork. Text is only ever drawn to canvas.
 */

import { z } from 'zod';
import { BOX_FACES, BOX_TEMPLATE_IDS, MAX_STICKERS, type BoxDesign, type BoxFace, type DesignOptions, type StickerPlacement } from '@/types/boxDesigner';
import { DEFAULT_BOX_COLOR, DEFAULT_DIMENSIONS, DEFAULT_PLY, DEFAULT_TEMPLATE, DIMENSION_LIMITS, PLY_OPTIONS } from './constants';

/** v2 added unit, quantity, finish, insideColorHex, lidDepth, name and more styles; v3 added stickers and options. v1 and v2 files still load */
export const DESIGN_SCHEMA_VERSION = 3;
/** Imported JSON files (with embedded images) */
export const MAX_IMPORT_BYTES = 25 * 1024 * 1024;
/** Share links carry no images and must stay URL-friendly */
export const MAX_SHARE_CHARS = 8000;
/** Default order quantity for estimates. VERIFY-LATER[DSG-01]: confirm typical MOQ with the owner */
export const DEFAULT_QUANTITY = 500;

const face = z.enum(BOX_FACES as [BoxFace, ...BoxFace[]]);
const unit = z.number().finite().min(0).max(1);
const point = z.object({ x: unit, y: unit });
const dim = z.number().finite().min(DIMENSION_LIMITS.min).max(DIMENSION_LIMITS.max);

const imageSchema = z.object({
  face,
  imageUrl: z.string().max(MAX_IMPORT_BYTES).regex(/^data:image\/(png|jpeg|webp|svg\+xml);base64,/),
  position: point,
  scale: z.number().finite().min(0.05).max(2),
  rotation: z.number().finite().min(-360).max(360),
});

const textSchema = z.object({
  id: z.string().min(1).max(64),
  face,
  text: z.string().max(500),
  font: z.string().max(64),
  size: z.number().finite().min(4).max(400),
  color: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i),
  position: point,
  rotation: z.number().finite().min(-360).max(360),
  align: z.enum(['left', 'center', 'right']),
});

const hexColour = z.string().regex(/^#[0-9a-f]{6}$/i);

export const DEFAULT_OPTIONS: DesignOptions = { handHoles: false, vents: false, window: false, windowRatio: 0.6, frontCut: 0 };

const optionsSchema = z
  .object({
    handHoles: z.boolean().default(false),
    vents: z.boolean().default(false),
    window: z.boolean().default(false),
    windowRatio: z.number().finite().min(0.2).max(0.9).default(0.6),
    frontCut: z.number().finite().min(0).max(0.9).default(0),
  })
  .default({ ...DEFAULT_OPTIONS });

const stickerSchema = z.object({
  id: z.string().min(1).max(64),
  stickerId: z.string().regex(/^[a-z0-9][a-z0-9._-]{0,63}$/i),
  face,
  position: point,
  scale: z.number().finite().min(0.02).max(1.5),
  rotation: z.number().finite().min(-360).max(360),
  flip: z.boolean(),
  opacity: z.number().finite().min(0.05).max(1),
  tint: hexColour.nullable(),
  locked: z.boolean(),
  pattern: z
    .object({
      spacing: z.number().finite().min(0).max(3),
      angle: z.number().finite().min(-360).max(360),
      stagger: z.boolean().default(false),
    })
    .nullable(),
});

const designSchema = z.object({
  v: z.union([z.literal(1), z.literal(2), z.literal(DESIGN_SCHEMA_VERSION)]),
  template: z.enum(BOX_TEMPLATE_IDS),
  dimensions: z.object({ length: dim, width: dim, height: dim }),
  ply: z.enum(['3-ply', '5-ply', '7-ply']),
  flutes: z.array(z.enum(['A', 'B', 'C', 'E', 'F'])).min(1).max(3),
  colorHex: z.string().regex(/^#[0-9a-f]{6}$/i),
  showIcons: z.boolean(),
  faceImages: z.array(imageSchema).max(BOX_FACES.length).default([]),
  textElements: z.array(textSchema).max(60).default([]),
  unit: z.enum(['mm', 'cm', 'in']).default('cm'),
  quantity: z.number().int().min(1).max(1_000_000).default(DEFAULT_QUANTITY),
  finish: z.enum(['matte', 'gloss']).default('matte'),
  insideColorHex: z.string().regex(/^#[0-9a-f]{6}$/i).nullable().default(null),
  lidDepth: dim.nullable().default(null),
  name: z.string().max(80).default(''),
  stickers: z.array(stickerSchema).max(MAX_STICKERS).default([]),
  options: optionsSchema,
});

export const DEFAULT_DESIGN: BoxDesign = {
  template: DEFAULT_TEMPLATE,
  dimensions: { ...DEFAULT_DIMENSIONS },
  ply: DEFAULT_PLY,
  flutes: PLY_OPTIONS.find((p) => p.id === DEFAULT_PLY)!.flutes[0],
  colorHex: DEFAULT_BOX_COLOR,
  showIcons: true,
  faceImages: [],
  textElements: [],
  unit: 'cm',
  quantity: DEFAULT_QUANTITY,
  finish: 'matte',
  insideColorHex: null,
  lidDepth: null,
  name: '',
  stickers: [],
  options: { ...DEFAULT_OPTIONS },
};

export function serializeDesign(design: BoxDesign, options: { includeImages: boolean }): string {
  const payload = {
    v: DESIGN_SCHEMA_VERSION,
    ...design,
    faceImages: options.includeImages
      ? design.faceImages.map(({ face, imageUrl, position, scale, rotation }) => ({ face, imageUrl, position, scale, rotation }))
      : [],
  };
  return JSON.stringify(payload);
}

/** Parse untrusted JSON into a design, or null when it is invalid */
export function parseDesign(json: string): BoxDesign | null {
  if (typeof json !== 'string' || json.length > MAX_IMPORT_BYTES) return null;
  try {
    const data = JSON.parse(json);
    // share links carry stickers in a compact form (see compactStickers)
    if (data && typeof data === 'object' && !Array.isArray(data) && 'stk' in data) {
      if (!('stickers' in data)) data.stickers = expandStickers(data.stk);
      delete data.stk;
    }
    const result = designSchema.safeParse(data);
    if (!result.success) return null;
    const { v: _version, ...design } = result.data;
    // flutes must be one of the stacks offered for the ply
    const ply = PLY_OPTIONS.find((p) => p.id === design.ply)!;
    const flutes = ply.flutes.find((stack) => stack.join('') === design.flutes.join('')) ?? ply.flutes[0];
    return { ...(design as BoxDesign), flutes };
  } catch {
    return null;
  }
}

const toBase64Url = (text: string) => {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (value: string) => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4);
  const binary = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
};

/**
 * Compact sticker form for share links: one tuple per sticker, no ids, no keys.
 * [stickerId, face, x, y, scale, rotation, flip, opacity, tint (no #) | null, locked, [spacing, angle, stagger] | null]
 */
type StickerTuple = [string, string, number, number, number, number, 0 | 1, number, string | null, 0 | 1, [number, number, 0 | 1] | null];

const round = (value: number, digits: number) => Math.round(value * 10 ** digits) / 10 ** digits;

export function compactStickers(stickers: StickerPlacement[]): StickerTuple[] {
  return stickers.map((s) => [
    s.stickerId,
    s.face,
    round(s.position.x, 3),
    round(s.position.y, 3),
    round(s.scale, 3),
    Math.round(s.rotation),
    s.flip ? 1 : 0,
    round(s.opacity, 2),
    s.tint ? s.tint.replace('#', '').toLowerCase() : null,
    s.locked ? 1 : 0,
    s.pattern ? [round(s.pattern.spacing, 2), Math.round(s.pattern.angle), s.pattern.stagger ? 1 : 0] : null,
  ]);
}

/** Inverse of compactStickers. Untrusted: entries that do not validate are dropped, never thrown on. */
export function expandStickers(raw: unknown): StickerPlacement[] {
  if (!Array.isArray(raw)) return [];
  const result: StickerPlacement[] = [];
  for (const item of raw.slice(0, MAX_STICKERS)) {
    if (!Array.isArray(item) || item.length < 11) continue;
    const [stickerId, faceName, x, y, scale, rotation, flip, opacity, tint, locked, pattern] = item;
    const candidate = {
      id: `st-${result.length}`,
      stickerId,
      face: faceName,
      position: { x, y },
      scale,
      rotation,
      flip: flip === 1,
      opacity,
      tint: typeof tint === 'string' ? `#${tint}` : null,
      locked: locked === 1,
      pattern: Array.isArray(pattern) ? { spacing: pattern[0], angle: pattern[1], stagger: pattern[2] === 1 } : null,
    };
    const parsed = stickerSchema.safeParse(candidate);
    if (parsed.success) result.push(parsed.data as StickerPlacement);
  }
  return result;
}

const SHARE_PREFIX = '#design=';

function buildShareHash(design: BoxDesign, stickers: StickerPlacement[], texts: BoxDesign['textElements'], keepName: boolean): string {
  const { faceImages: _images, stickers: _stickers, textElements: _texts, name, ...rest } = design;
  const payload: Record<string, unknown> = { v: DESIGN_SCHEMA_VERSION, ...rest, name: keepName ? name : '', textElements: texts };
  if (stickers.length) payload.stk = compactStickers(stickers);
  return `${SHARE_PREFIX}${toBase64Url(JSON.stringify(payload))}`;
}

export interface ShareEncoding {
  hash: string;
  droppedStickers: number;
  droppedTexts: number;
  nameDropped: boolean;
}

/**
 * Share links carry the spec, text and stickers (not images, which stay on the designer's device).
 * When the link would exceed MAX_SHARE_CHARS, the least important data is dropped step by step (design name, then
 * stickers: single stickers before patterns, newest first; then text) so the link is never too long or broken.
 */
export function encodeShareHashDetailed(design: BoxDesign): ShareEncoding {
  const fits = (hash: string) => hash.length - SHARE_PREFIX.length <= MAX_SHARE_CHARS;
  let stickers = design.stickers;
  let texts = design.textElements;

  let hash = buildShareHash(design, stickers, texts, true);
  if (fits(hash)) return { hash, droppedStickers: 0, droppedTexts: 0, nameDropped: false };

  hash = buildShareHash(design, stickers, texts, false);
  if (fits(hash)) return { hash, droppedStickers: 0, droppedTexts: 0, nameDropped: true };

  // single stickers (newest first) go before patterns (newest first)
  const order = [
    ...stickers.map((s, i) => [s, i] as const).filter(([s]) => !s.pattern).map(([, i]) => i).reverse(),
    ...stickers.map((s, i) => [s, i] as const).filter(([s]) => s.pattern).map(([, i]) => i).reverse(),
  ];
  const removed = new Set<number>();
  for (const index of order) {
    removed.add(index);
    stickers = design.stickers.filter((_, i) => !removed.has(i));
    hash = buildShareHash(design, stickers, texts, false);
    if (fits(hash)) return { hash, droppedStickers: removed.size, droppedTexts: 0, nameDropped: true };
  }

  for (let keep = texts.length - 1; keep >= 0; keep--) {
    texts = design.textElements.slice(0, keep);
    hash = buildShareHash(design, stickers, texts, false);
    if (fits(hash)) return { hash, droppedStickers: design.stickers.length, droppedTexts: design.textElements.length - keep, nameDropped: true };
  }

  hash = buildShareHash(design, [], [], false);
  return { hash, droppedStickers: design.stickers.length, droppedTexts: design.textElements.length, nameDropped: true };
}

export function encodeShareHash(design: BoxDesign): string {
  return encodeShareHashDetailed(design).hash;
}

export function decodeShareHash(hash: string): BoxDesign | null {
  const match = /[#&]design=([A-Za-z0-9_-]+)/.exec(hash);
  if (!match || match[1].length > MAX_SHARE_CHARS) return null;
  try {
    return parseDesign(fromBase64Url(match[1]));
  } catch {
    return null;
  }
}
