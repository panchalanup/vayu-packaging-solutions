/** Playground layout: wordmark scale, stage size and home positions from the container width (pure). */

import { LETTERS, LETTER_HEIGHT, LETTER_OFFSETS, WORDMARK_UNITS } from '@/components/site/footer/stencilLetters';

/** Height of the floor band at the bottom of the stage (px) */
export const FLOOR_H = 28;
/** Height of the button row above the stage (px) */
export const CONTROLS_H = 60;
const MAX_SCALE = 2.8;
const MIN_WIDTH = 240;

export interface PlaygroundLayout {
  width: number;
  stageH: number;
  /** y of the floor surface */
  floorY: number;
  /** px per letter unit */
  k: number;
  letterH: number;
  /** top-left of each letter's bounding box when at rest */
  homes: { x: number; y: number }[];
  boxW: number;
  boxH: number;
  /** boxes alive at once; older ones are tidied away */
  maxBoxes: number;
  /** boxes dropped before the "design your own" line appears */
  ctaAfter: number;
  /** Matter gravity.y: a fall across the stage takes about 0.7 s */
  gravityY: number;
  compact: boolean;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function computeLayout(containerWidth: number): PlaygroundLayout {
  const width = Math.round(Math.max(MIN_WIDTH, containerWidth));
  const compact = width < 640;
  const fill = compact ? 0.88 : 0.8;
  const k = clamp((width * fill) / WORDMARK_UNITS, 0.5, MAX_SCALE);
  const letterH = LETTER_HEIGHT * k;
  const stageH = Math.round(Math.max(280, letterH * 1.6 + FLOOR_H));
  const floorY = stageH - FLOOR_H;
  const x0 = (width - WORDMARK_UNITS * k) / 2;
  const homes = LETTERS.map((_, i) => ({ x: x0 + LETTER_OFFSETS[i] * k, y: floorY - letterH }));
  const boxW = clamp(Math.round(k * 30), 46, 78);
  const maxBoxes = compact ? 6 : 14;
  return {
    width,
    stageH,
    floorY,
    k,
    letterH,
    homes,
    boxW,
    boxH: Math.round(boxW * 0.78),
    maxBoxes,
    ctaAfter: Math.min(8, maxBoxes),
    gravityY: stageH / 250,
    compact,
  };
}
