/**
 * Stencil VAYU geometry (original). Every letter is a handful of convex polygons built from straight strips,
 * in a unit space that is 100 high. The same polygons are drawn as SVG and used as exact compound physics bodies,
 * so no polygon decomposition is needed. Polygons wind clockwise on screen (y down) and meet at shared edges.
 * The small gaps (V seam, A crossbar, Y neck, U base) are the stencil bridges.
 */

import { type Pt } from '@/lib/footerPlayground/polygon';

export const LETTER_HEIGHT = 100;
/** Space after each letter, in letter units (Y and U get extra room: the open top of the Y runs into the U) */
export const LETTER_GAPS: readonly number[] = [18, 18, 26];

export interface Tape {
  x: number;
  y: number;
  w: number;
  h: number;
  /** degrees */
  rot: number;
}

export interface StencilLetter {
  char: 'V' | 'A' | 'Y' | 'U';
  width: number;
  polys: Pt[][];
  tape?: Tape;
}

/** Mirror across the vertical axis of a letter `width` wide, keeping the clockwise winding */
const mirror = (poly: Pt[], width: number): Pt[] => poly.map(([x, y]): Pt => [width - x, y]).reverse();

function buildV(): StencilLetter {
  const width = 88;
  const left: Pt[] = [[0, 0], [26, 0], [42, 72.7], [42, 100], [22, 100]];
  return { char: 'V', width, polys: [left, mirror(left, width)] };
}

function buildA(): StencilLetter {
  const width = 94;
  const s = 0.34; // lean of the legs (horizontal units per unit of height)
  const legW = 26;
  const apexL = 34; // left edge of the flat apex
  const outerL = (y: number) => apexL - s * y;
  const outerR = (y: number) => apexL + legW + s * y;
  // inner edges: left leg x = apexL + legW - s*y, right leg x = apexL + s*y; they cross at yCross
  const yCross = legW / (2 * s);
  const apex: Pt[] = [[apexL, 0], [apexL + legW, 0], [outerR(yCross), yCross], [outerL(yCross), yCross]];
  const leftLeg: Pt[] = [
    [outerL(yCross), yCross],
    [outerL(yCross) + legW, yCross],
    [outerL(100) + legW, 100],
    [outerL(100), 100],
  ];
  const rightLeg = mirror(leftLeg, width);
  // crossbar between the inner edges, inset by a stencil gap
  const gap = 3;
  const inL = (y: number) => apexL + legW - s * y;
  const inR = (y: number) => apexL + s * y;
  const y0 = 66;
  const y1 = 80;
  const bar: Pt[] = [
    [inL(y0) + gap, y0],
    [inR(y0) - gap, y0],
    [inR(y1) - gap, y1],
    [inL(y1) + gap, y1],
  ];
  return { char: 'A', width, polys: [apex, leftLeg, rightLeg, bar] };
}

function buildY(): StencilLetter {
  const width = 90;
  const s = 0.5;
  const armW = 26;
  const stemW = 38;
  const cx = width / 2;
  const yMeet = (cx - armW) / s; // inner edges meet on the centre line
  const leftArm: Pt[] = [[0, 0], [armW, 0], [armW + s * yMeet, yMeet], [s * yMeet, yMeet]];
  const rightArm = mirror(leftArm, width);
  const stemL = cx - stemW / 2;
  const yStem = (stemL - 0) / s; // outer edges reach the stem
  const neck: Pt[] = [[s * yMeet, yMeet], [width - s * yMeet, yMeet], [width - stemL, yStem], [stemL, yStem]];
  const stem: Pt[] = [[stemL, yStem + 4], [stemL + stemW, yStem + 4], [stemL + stemW, 100], [stemL, 100]];
  return {
    char: 'Y',
    width,
    polys: [leftArm, rightArm, neck, stem],
    tape: { x: cx, y: yStem + 2, w: 46, h: 12, rot: -6 },
  };
}

function buildU(): StencilLetter {
  const width = 86;
  const stemW = 26;
  const stemL: Pt[] = [[0, 0], [stemW, 0], [stemW, 72], [0, 72]];
  const stemR: Pt[] = [[width - stemW, 0], [width, 0], [width, 72], [width - stemW, 72]];
  const base: Pt[] = [[0, 76], [width, 76], [width, 88], [width - 12, 100], [12, 100], [0, 88]];
  return { char: 'U', width, polys: [stemL, stemR, base] };
}

export const LETTERS: readonly StencilLetter[] = [buildV(), buildA(), buildY(), buildU()];

/** Width of the whole wordmark in letter units (letters plus gaps) */
export const WORDMARK_UNITS = LETTERS.reduce((sum, l) => sum + l.width, 0) + LETTER_GAPS.reduce((a, g) => a + g, 0);

/** Left edge of each letter inside the wordmark, in letter units */
export const LETTER_OFFSETS: readonly number[] = (() => {
  let x = 0;
  return LETTERS.map((l) => {
    const at = x;
    x += l.width + (LETTER_GAPS[LETTERS.indexOf(l)] ?? 0);
    return at;
  });
})();

export const pointsAttr = (poly: readonly Pt[]) => poly.map(([x, y]) => `${+x.toFixed(2)},${+y.toFixed(2)}`).join(' ');
