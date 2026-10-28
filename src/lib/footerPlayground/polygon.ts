/** Tiny convex-polygon helpers used to check the stencil letter geometry (pure, no DOM). */

export type Pt = readonly [number, number];

/** Shoelace area; positive for the winding the letters use (clockwise on screen, y down) */
export function signedArea(p: readonly Pt[]): number {
  let s = 0;
  for (let i = 0; i < p.length; i++) {
    const [x1, y1] = p[i];
    const [x2, y2] = p[(i + 1) % p.length];
    s += x1 * y2 - x2 * y1;
  }
  return s / 2;
}

export function centroid(p: readonly Pt[]): { x: number; y: number } {
  const a = signedArea(p);
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < p.length; i++) {
    const [x1, y1] = p[i];
    const [x2, y2] = p[(i + 1) % p.length];
    const f = x1 * y2 - x2 * y1;
    cx += (x1 + x2) * f;
    cy += (y1 + y2) * f;
  }
  return { x: cx / (6 * a), y: cy / (6 * a) };
}

export function isConvex(p: readonly Pt[], eps = 1e-9): boolean {
  for (let i = 0; i < p.length; i++) {
    const [ax, ay] = p[i];
    const [bx, by] = p[(i + 1) % p.length];
    const [cx, cy] = p[(i + 2) % p.length];
    if ((bx - ax) * (cy - by) - (by - ay) * (cx - bx) < -eps) return false;
  }
  return true;
}

export function bounds(polys: readonly (readonly Pt[])[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of polys) {
    for (const [x, y] of p) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  return { minX, minY, maxX, maxY };
}

/** Sutherland-Hodgman: clip convex `subject` by convex `clip` (both with positive signedArea) */
function clipConvex(subject: Pt[], clip: readonly Pt[]): Pt[] {
  let out = subject;
  for (let i = 0; i < clip.length && out.length; i++) {
    const [ax, ay] = clip[i];
    const [bx, by] = clip[(i + 1) % clip.length];
    const side = (p: Pt) => (bx - ax) * (p[1] - ay) - (by - ay) * (p[0] - ax);
    const input = out;
    out = [];
    for (let j = 0; j < input.length; j++) {
      const cur = input[j];
      const prev = input[(j + input.length - 1) % input.length];
      const sc = side(cur);
      const sp = side(prev);
      if (sc >= 0) {
        if (sp < 0) out.push(intersect(prev, cur, sp, sc));
        out.push(cur);
      } else if (sp >= 0) {
        out.push(intersect(prev, cur, sp, sc));
      }
    }
  }
  return out;
}

function intersect(a: Pt, b: Pt, sa: number, sb: number): Pt {
  const t = sa / (sa - sb);
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** Area shared by two convex polygons */
export function overlapArea(a: readonly Pt[], b: readonly Pt[]): number {
  const clipped = clipConvex([...a], b);
  return clipped.length < 3 ? 0 : Math.abs(signedArea(clipped));
}
