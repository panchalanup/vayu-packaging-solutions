/**
 * Brand kit (#32) and brand colours (#14), kept in this browser only (no accounts).
 * A kit is a logo, up to eight brand colours and a preferred font; recent board colours are remembered separately.
 * SECURITY: everything read back from storage is validated with zod; logos must be data:image URLs and are only
 * ever drawn through <img>/canvas; analytics never see the kit.
 */

import { z } from 'zod';
import { browserStore, readJson, writeString, KeyValueStore } from './localStore';

export const BRAND_KIT_KEY = 'vayu-box-designer:brand-kit';
export const RECENT_COLOURS_KEY = 'vayu-box-designer:recent-colours';
export const MAX_BRAND_COLOURS = 8;
export const MAX_RECENT_COLOURS = 10;
/** Logos are downscaled on upload; this caps a hand-edited store */
const MAX_LOGO_CHARS = 3 * 1024 * 1024;

const hex = z.string().regex(/^#[0-9a-f]{6}$/i);

const kitSchema = z.object({
  name: z.string().max(60).default(''),
  logoUrl: z
    .string()
    .max(MAX_LOGO_CHARS)
    .regex(/^data:image\/(png|jpeg|webp|svg\+xml);base64,/)
    .nullable()
    .default(null),
  colours: z.array(hex).max(MAX_BRAND_COLOURS).default([]),
  font: z.string().max(64).regex(/^[a-z0-9 -]*$/i).default('Inter'),
});

export type BrandKit = z.infer<typeof kitSchema>;

export const EMPTY_BRAND_KIT: BrandKit = { name: '', logoUrl: null, colours: [], font: 'Inter' };

export function loadBrandKit(store: KeyValueStore | null = browserStore()): BrandKit {
  const parsed = kitSchema.safeParse(readJson(BRAND_KIT_KEY, store));
  return parsed.success ? parsed.data : { ...EMPTY_BRAND_KIT };
}

/** Returns false when it could not be saved (storage full: usually a very large logo) */
export function saveBrandKit(kit: BrandKit, store: KeyValueStore | null = browserStore()): boolean {
  const parsed = kitSchema.safeParse(kit);
  if (!parsed.success) return false;
  return writeString(BRAND_KIT_KEY, JSON.stringify(parsed.data), store);
}

export const isBrandKitEmpty = (kit: BrandKit) => !kit.logoUrl && kit.colours.length === 0 && !kit.name;

/** Add a colour to the kit (deduplicated, newest last, capped) */
export function addBrandColour(kit: BrandKit, colour: string): BrandKit {
  const c = normaliseHex(colour);
  if (!c || kit.colours.includes(c)) return kit;
  return { ...kit, colours: [...kit.colours, c].slice(-MAX_BRAND_COLOURS) };
}

export function removeBrandColour(kit: BrandKit, colour: string): BrandKit {
  return { ...kit, colours: kit.colours.filter((c) => c !== colour.toUpperCase()) };
}

export function loadRecentColours(store: KeyValueStore | null = browserStore()): string[] {
  const parsed = z.array(hex).max(MAX_RECENT_COLOURS * 2).safeParse(readJson(RECENT_COLOURS_KEY, store));
  return parsed.success ? parsed.data.map((c) => c.toUpperCase()).slice(0, MAX_RECENT_COLOURS) : [];
}

/** Remember a colour (most recent first) and return the new list */
export function pushRecentColour(colour: string, store: KeyValueStore | null = browserStore()): string[] {
  const c = normaliseHex(colour);
  const current = loadRecentColours(store);
  if (!c) return current;
  const next = [c, ...current.filter((x) => x !== c)].slice(0, MAX_RECENT_COLOURS);
  writeString(RECENT_COLOURS_KEY, JSON.stringify(next), store);
  return next;
}

/** "#abc", "abc123", "#AABBCC" -> "#AABBCC"; anything else -> null */
export function normaliseHex(value: string): string | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!m) return null;
  const v = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
  return `#${v.toUpperCase()}`;
}

/** Accepts hex or RGB ("rgb(12, 34, 56)", "12 34 56", "12,34,56") and returns "#RRGGBB", or null */
export function parseColourInput(value: string): string | null {
  const hexValue = normaliseHex(value);
  if (hexValue) return hexValue;
  const m = /^\s*(?:rgb\s*\(\s*)?(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*\)?\s*$/i.exec(value);
  if (!m) return null;
  const parts = [m[1], m[2], m[3]].map(Number);
  if (parts.some((p) => p > 255)) return null;
  return `#${parts.map((p) => p.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

export function hexToRgbString(hexValue: string): string {
  const c = normaliseHex(hexValue);
  if (!c) return '';
  return [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)).join(', ');
}
