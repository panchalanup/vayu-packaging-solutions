/**
 * "Surprise me": a random but tasteful arrangement for this box type. One hero sticker and a few small ones on the
 * main surface, a quiet pattern or a single small sticker on a few other surfaces, in a curated colour palette.
 * Seeded, so it is testable; every call with a different seed gives a different result.
 */

import { MAX_STICKERS, type BoxFace, type StickerPlacement } from '@/types/boxDesigner';
import type { StickerDef } from './types';
import { makeSticker, clampSticker } from './placement';
import { paletteFor, type StickerPalette } from './palettes';
import { pickRecommended } from './search';

export interface SurpriseInput {
  style: string;
  templateCategory?: string | null;
  faces: Partial<Record<BoxFace, { widthCm: number; heightCm: number }>>;
  library: StickerDef[];
  seed?: number;
}

export interface SurpriseResult {
  stickers: StickerPlacement[];
  /** Suggested box colour */
  board: string;
  palette: StickerPalette;
}

/** Small deterministic PRNG (mulberry32) */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const area = (s: { widthCm: number; heightCm: number }) => s.widthCm * s.heightCm;

export function generateSurprise(input: SurpriseInput): SurpriseResult {
  const seed = input.seed ?? Math.floor(Math.random() * 2 ** 31);
  const rand = seededRandom(seed);
  const between = (lo: number, hi: number) => lo + (hi - lo) * rand();
  const pick = <T,>(list: T[]): T => list[Math.floor(rand() * list.length)];

  const palette = paletteFor(input.templateCategory, Math.floor(rand() * 64));
  const pool = pickRecommended(input.library, input.style, input.templateCategory, 24);
  const patterns = input.library.filter((s) => s.kind === 'pattern');
  const faceEntries = (Object.entries(input.faces) as [BoxFace, { widthCm: number; heightCm: number }][]).filter(([, s]) => s && area(s) > 0);
  const out: StickerPlacement[] = [];
  if (!pool.length || !faceEntries.length) return { stickers: out, board: palette.board, palette };

  const bySize = [...faceEntries].sort((a, b) => area(b[1]) - area(a[1]));
  const primary = (faceEntries.find(([f]) => f === 'front') ?? bySize[0])[0];
  const tintFor = (s: StickerDef): string | null => (s.kind === 'colour' ? null : pick(palette.colours.slice(0, 3)));

  // hero on the main surface
  const hero = pick(pool);
  const heroX = between(0.4, 0.6);
  const heroY = between(0.42, 0.55);
  out.push(
    makeSticker(hero.id, primary, {
      position: { x: heroX, y: heroY },
      scale: between(0.42, 0.58),
      rotation: Math.round(between(-8, 8)),
      tint: tintFor(hero),
    })
  );

  // a few small ones around it (rejection sampling keeps them apart)
  const spots: { x: number; y: number }[] = [{ x: heroX, y: heroY }];
  const smalls = 3 + Math.floor(rand() * 4);
  for (let i = 0, tries = 0; i < smalls && tries < 80; tries++) {
    const x = between(0.08, 0.92);
    const y = between(0.1, 0.9);
    if (spots.some((p) => Math.hypot(p.x - x, p.y - y) < 0.24)) continue;
    spots.push({ x, y });
    const s = pick(pool);
    out.push(makeSticker(s.id, primary, { position: { x, y }, scale: between(0.1, 0.18), rotation: Math.round(between(-30, 30)), flip: rand() < 0.3, tint: tintFor(s) }));
    i++;
  }

  // other surfaces: a quiet pattern (or one small sticker), largest first
  for (const [face] of bySize.filter(([f]) => f !== primary).slice(0, 3)) {
    if (out.length >= MAX_STICKERS) break;
    if (patterns.length && rand() < 0.7) {
      const tile = pick(patterns);
      out.push(
        makeSticker(tile.id, face, {
          kind: 'pattern',
          scale: between(0.14, 0.24),
          opacity: Math.round(between(0.15, 0.3) * 100) / 100,
          tint: pick(palette.colours.slice(0, 3)),
          pattern: { spacing: between(0.3, 0.9), angle: pick([0, 15, 30, 45]), stagger: rand() < 0.6 },
        })
      );
    } else {
      const s = pick(pool);
      out.push(makeSticker(s.id, face, { scale: between(0.22, 0.34), tint: tintFor(s), rotation: Math.round(between(-10, 10)) }));
    }
  }

  return { stickers: out.slice(0, MAX_STICKERS).map(clampSticker), board: palette.board, palette };
}
