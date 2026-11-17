/**
 * Isometric drawing helpers (pure). x runs to the lower right, y to the lower left, z is up, the viewer looks from the
 * front-right and above, so the visible faces of a prism are its top, its x = max face and its y = max face.
 */

const COS30 = Math.cos(Math.PI / 6);

export interface Pt {
  x: number;
  y: number;
}

export const iso = (x: number, y: number, z: number, s = 1): Pt => ({ x: (x - y) * COS30 * s, y: (x + y) * 0.5 * s - z * s });

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/** Screen bounds of an L x W x H prism at scale 1 */
export function isoBounds(L: number, W: number, H: number): Bounds {
  return { minX: -W * COS30, maxX: L * COS30, minY: -H, maxY: (L + W) * 0.5 };
}

/** Scale that fits the prism inside a width x height box with a margin (fraction of the box) */
export function fitScale(b: Bounds, width: number, height: number, margin = 0.08): number {
  const w = b.maxX - b.minX;
  const h = b.maxY - b.minY;
  if (w <= 0 || h <= 0) return 1;
  return Math.min((width * (1 - 2 * margin)) / w, (height * (1 - 2 * margin)) / h);
}

const points = (pts: Pt[]) => pts.map((p) => `${Math.round(p.x * 100) / 100},${Math.round(p.y * 100) / 100}`).join(' ');

export interface PrismFaces {
  top: string;
  left: string;
  right: string;
}

/**
 * The three visible faces of a prism with its near-left-bottom corner at (x0, y0, z0), size L x W x H, as SVG
 * `points` strings, scaled by s and moved by (ox, oy) on the screen.
 */
export function prismFaces(L: number, W: number, H: number, s: number, ox: number, oy: number, x0 = 0, y0 = 0, z0 = 0): PrismFaces {
  const p = (x: number, y: number, z: number): Pt => {
    const q = iso(x0 + x, y0 + y, z0 + z, s);
    return { x: q.x + ox, y: q.y + oy };
  };
  return {
    top: points([p(0, 0, H), p(L, 0, H), p(L, W, H), p(0, W, H)]),
    // the face at x = L (lower right)
    right: points([p(L, 0, 0), p(L, W, 0), p(L, W, H), p(L, 0, H)]),
    // the face at y = W (lower left)
    left: points([p(0, W, 0), p(L, W, 0), p(L, W, H), p(0, W, H)]),
  };
}

/** Painter's order for unit cells: farthest from the viewer first (smaller x + y, then lower z) */
export function paintersOrder<T extends { x: number; y: number; z: number }>(cells: T[]): T[] {
  return [...cells].sort((a, b) => a.x + a.y - (b.x + b.y) || a.z - b.z || a.x - b.x);
}
