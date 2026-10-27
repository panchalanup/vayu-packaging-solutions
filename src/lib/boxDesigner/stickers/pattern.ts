/**
 * Pattern fill maths: where the tiles of a repeated sticker go on a surface.
 * Pure (pixels in, positions out) so it is easy to test and shared by the print layer and the 2D editor preview.
 */

import type { StickerPattern } from '@/types/boxDesigner';

export interface Tile {
  x: number;
  y: number;
}

/** Hard cap on tiles per surface so a tiny sticker with zero spacing cannot freeze the page */
export const MAX_PATTERN_TILES = 1600;

/** Centre-to-centre distance between tiles */
export function patternStep(sizePx: number, spacing: number): number {
  return Math.max(2, sizePx * (1 + Math.max(0, spacing)));
}

/**
 * Tile centres covering a width x height surface.
 * The grid is rotated by `angle` about the surface centre and shifted by `phase` (0-1 of the surface, 0.5 = none),
 * `stagger` offsets every other row by half a tile. Tiles that cannot touch the surface are skipped. When the grid
 * would exceed MAX_PATTERN_TILES the step grows so the cap holds.
 */
export function patternTiles(
  width: number,
  height: number,
  sizePx: number,
  pattern: StickerPattern,
  phase: { x: number; y: number } = { x: 0.5, y: 0.5 }
): { tiles: Tile[]; step: number } {
  if (!(width > 0) || !(height > 0) || !(sizePx > 0)) return { tiles: [], step: 0 };
  let step = patternStep(sizePx, pattern.spacing);
  const wanted = (width * height) / (step * step);
  if (wanted > MAX_PATTERN_TILES * 0.8) step *= Math.sqrt(wanted / (MAX_PATTERN_TILES * 0.8));

  const angle = ((pattern.angle || 0) * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const cx = width / 2;
  const cy = height / 2;
  const offsetX = (phase.x - 0.5) * width;
  const offsetY = (phase.y - 0.5) * height;
  // the grid is shifted by the phase, so it must reach as far as the surface diagonal from the shifted centre
  const reach = Math.hypot(width, height) + sizePx;
  const n = Math.ceil(reach / step) + 1;
  const half = sizePx * 0.75; // generous: a rotated tile can poke out by this much

  const tiles: Tile[] = [];
  for (let j = -n; j <= n; j++) {
    const shift = pattern.stagger && Math.abs(j) % 2 === 1 ? step / 2 : 0;
    for (let i = -n; i <= n; i++) {
      const u = i * step + shift;
      const v = j * step;
      const x = cx + offsetX + u * cos - v * sin;
      const y = cy + offsetY + u * sin + v * cos;
      if (x < -half || y < -half || x > width + half || y > height + half) continue;
      tiles.push({ x, y });
      if (tiles.length >= MAX_PATTERN_TILES) return { tiles, step };
    }
  }
  return { tiles, step };
}
