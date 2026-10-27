/**
 * Sticker placement helpers: create, move between layers, duplicate, geometry on a surface.
 * Pure functions over StickerPlacement[], used by the editor, templates and the "surprise me" generator.
 *
 * How to add stickers to a template: build placements with makeSticker(), e.g.
 *   stickers: [makeSticker('fruit-mango', 'front', { position: { x: 0.3, y: 0.5 }, scale: 0.5 })]
 * (stickerId must exist in the library; unknown ids are simply not drawn).
 */

import { MAX_STICKERS, type BoxFace, type StickerPattern, type StickerPlacement } from '@/types/boxDesigner';
import type { StickerKind } from './types';

export const SCALE_LIMITS = { min: 0.02, max: 1.5 } as const;
export const DEFAULT_PATTERN: StickerPattern = { spacing: 0.25, angle: 0, stagger: false };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const clamp01 = (v: number) => clamp(v, 0, 1);

let counter = 0;
export function newStickerId(): string {
  counter = (counter + 1) % 1_000_000;
  return `st-${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

/** A pattern tile starts as a repeated, fairly small sticker; everything else as one medium sticker */
export function defaultScaleFor(kind: StickerKind | undefined): number {
  return kind === 'pattern' ? 0.18 : 0.32;
}

export function makeSticker(
  stickerId: string,
  face: BoxFace,
  overrides: Partial<Omit<StickerPlacement, 'id' | 'stickerId' | 'face'>> & { kind?: StickerKind } = {}
): StickerPlacement {
  const { kind, ...rest } = overrides;
  const isPattern = kind === 'pattern' && rest.pattern === undefined;
  return {
    id: newStickerId(),
    stickerId,
    face,
    position: { x: 0.5, y: 0.5 },
    scale: defaultScaleFor(kind),
    rotation: 0,
    flip: false,
    opacity: 1,
    tint: null,
    locked: false,
    pattern: isPattern ? { ...DEFAULT_PATTERN, spacing: 0 } : null,
    ...rest,
  };
}

/** Keep every numeric field inside the schema's ranges (used after drags, imports and generators) */
export function clampSticker(s: StickerPlacement): StickerPlacement {
  return {
    ...s,
    position: { x: clamp01(s.position.x), y: clamp01(s.position.y) },
    scale: clamp(s.scale, SCALE_LIMITS.min, SCALE_LIMITS.max),
    rotation: clamp(Math.round(s.rotation), -360, 360),
    opacity: clamp(s.opacity, 0.05, 1),
    pattern: s.pattern
      ? { spacing: clamp(s.pattern.spacing, 0, 3), angle: clamp(Math.round(s.pattern.angle), -360, 360), stagger: s.pattern.stagger }
      : null,
  };
}

export const canAddStickers = (list: StickerPlacement[], count = 1) => list.length + count <= MAX_STICKERS;

/** Size on a surface in px: the longest side is scale x the surface's shorter side */
export function stickerBoxPx(surfaceW: number, surfaceH: number, scale: number, aspect: number): { w: number; h: number } {
  const longest = Math.max(1, scale * Math.min(surfaceW, surfaceH));
  return aspect >= 1 ? { w: longest, h: longest / aspect } : { w: longest * aspect, h: longest };
}

export type LayerMove = 'front' | 'back' | 'forward' | 'backward';

/** Reorder one sticker relative to the other stickers on the same surface (array order = draw order) */
export function moveLayer(list: StickerPlacement[], id: string, move: LayerMove): StickerPlacement[] {
  const index = list.findIndex((s) => s.id === id);
  if (index === -1) return list;
  const face = list[index].face;
  const sameFace = list.map((s, i) => (s.face === face ? i : -1)).filter((i) => i !== -1);
  const pos = sameFace.indexOf(index);
  let target: number;
  if (move === 'front') target = sameFace.length - 1;
  else if (move === 'back') target = 0;
  else if (move === 'forward') target = Math.min(sameFace.length - 1, pos + 1);
  else target = Math.max(0, pos - 1);
  if (target === pos) return list;
  // rebuild the order of this face's stickers inside the slots they already occupy
  const ordered = sameFace.map((i) => list[i]);
  const [item] = ordered.splice(pos, 1);
  ordered.splice(target, 0, item);
  const next = list.slice();
  sameFace.forEach((slot, k) => (next[slot] = ordered[k]));
  return next;
}

export function duplicateSticker(list: StickerPlacement[], id: string): { list: StickerPlacement[]; created: StickerPlacement | null } {
  const source = list.find((s) => s.id === id);
  if (!source || !canAddStickers(list)) return { list, created: null };
  const created = clampSticker({
    ...source,
    id: newStickerId(),
    locked: false,
    position: { x: source.position.x + 0.04, y: source.position.y + 0.06 },
    pattern: source.pattern ? { ...source.pattern } : null,
  });
  const index = list.findIndex((s) => s.id === id);
  const next = list.slice();
  next.splice(index + 1, 0, created);
  return { list: next, created };
}

/** Copy one sticker onto every other surface in `faces` (skipping surfaces that already have the same sticker and size) */
export function applyToAllFaces(list: StickerPlacement[], id: string, faces: BoxFace[]): StickerPlacement[] {
  const source = list.find((s) => s.id === id);
  if (!source) return list;
  const next = list.slice();
  for (const face of faces) {
    if (face === source.face) continue;
    if (!canAddStickers(next)) break;
    const duplicate = next.some(
      (s) => s.face === face && s.stickerId === source.stickerId && !!s.pattern === !!source.pattern && s.tint === source.tint && Math.abs(s.scale - source.scale) < 1e-6
    );
    if (duplicate) continue;
    next.push({ ...source, id: newStickerId(), face, locked: false, pattern: source.pattern ? { ...source.pattern } : null, position: { ...source.position } });
  }
  return next;
}

/** Tint every unlocked sticker (patterns included) to one colour; null restores the original colours */
export function tintAll(list: StickerPlacement[], colour: string | null): StickerPlacement[] {
  return list.map((s) => (s.locked ? s : { ...s, tint: colour }));
}

/** Nudge by a fraction of the surface, clamped */
export function nudge(s: StickerPlacement, dx: number, dy: number): StickerPlacement {
  return { ...s, position: { x: clamp01(s.position.x + dx), y: clamp01(s.position.y + dy) } };
}
