/**
 * Design codec
 * Validates and (de)serialises a BoxDesign for autosave, JSON import/export and share links.
 * SECURITY: every external input (URL hash, imported file, localStorage) is untrusted. It is parsed with a strict
 * zod schema, size-capped, and only data:image URLs are accepted for artwork. Text is only ever drawn to canvas.
 */

import { z } from 'zod';
import type { BoxDesign } from '@/types/boxDesigner';
import { DEFAULT_BOX_COLOR, DEFAULT_DIMENSIONS, DEFAULT_PLY, DEFAULT_TEMPLATE, DIMENSION_LIMITS, PLY_OPTIONS } from './constants';

export const DESIGN_SCHEMA_VERSION = 1;
/** Imported JSON files (with embedded images) */
export const MAX_IMPORT_BYTES = 25 * 1024 * 1024;
/** Share links carry no images and must stay URL-friendly */
export const MAX_SHARE_CHARS = 8000;

const face = z.enum(['front', 'back', 'left', 'right', 'top-front', 'top-back', 'top-left', 'top-right', 'bottom']);
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

const designSchema = z.object({
  v: z.literal(DESIGN_SCHEMA_VERSION),
  template: z.enum(['rsc', 'hsc', 'mailer']),
  dimensions: z.object({ length: dim, width: dim, height: dim }),
  ply: z.enum(['3-ply', '5-ply', '7-ply']),
  flutes: z.array(z.enum(['A', 'B', 'C', 'E', 'F'])).min(1).max(3),
  colorHex: z.string().regex(/^#[0-9a-f]{6}$/i),
  showIcons: z.boolean(),
  faceImages: z.array(imageSchema).max(9).default([]),
  textElements: z.array(textSchema).max(60).default([]),
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
    const result = designSchema.safeParse(JSON.parse(json));
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

/** Share links carry the spec and text (not images, which stay on the designer's device) */
export function encodeShareHash(design: BoxDesign): string {
  return `#design=${toBase64Url(serializeDesign(design, { includeImages: false }))}`;
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
