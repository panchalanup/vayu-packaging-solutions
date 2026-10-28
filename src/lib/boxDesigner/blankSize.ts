/**
 * Flat blank (dieline) size per style, used by the estimate, strength and sustainability maths.
 *
 * ADAPTER: Workstream A is building the style registry (src/lib/boxDesigner/styles/), which will expose the real
 * blank size for every style. Until it lands, this file approximates the die-cut styles from FEFCO proportions and
 * uses the existing RSC layout for the slotted family. When the registry is available, switch getBlankSizeCm to it
 * (one line, marked SWITCH below) and keep the fallback for tests.
 */

import type { BoxDesign, BoxDimensions, BoxTemplate } from '@/types/boxDesigner';
import { getBoardSpec, getBoardThicknessCm } from './boardSpecs';
import { computeRscLayout } from './rig/rscLayout';
import { blankSizeForDesign } from './styles/designLayout';

export interface BlankSize {
  /** Blank extents (cm); area is the bounding rectangle the corrugator has to supply */
  lengthCm: number;
  heightCm: number;
  areaM2: number;
  /** Separate pieces (telescope = lid + base) */
  pieces: number;
}

type BlankInput = Pick<BoxDesign, 'template' | 'dimensions' | 'ply' | 'flutes' | 'lidDepth'>;

const toArea = (pieces: { l: number; h: number }[]): BlankSize => {
  const areaM2 = pieces.reduce((sum, p) => sum + (p.l * p.h) / 10_000, 0);
  // Report the largest piece as the blank extents
  const main = pieces.reduce((a, b) => (a.l * a.h >= b.l * b.h ? a : b));
  return { lengthCm: round1(main.l), heightCm: round1(main.h), areaM2: Math.round(areaM2 * 10_000) / 10_000, pieces: pieces.length };
};

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Approximate blank for a style when the style registry is not available */
export function fallbackBlankSize(input: BlankInput): BlankSize {
  const board = getBoardSpec(input.ply, input.flutes);
  const t = getBoardThicknessCm(board, input.dimensions);
  const { length: L, width: W, height: H } = input.dimensions;
  const rsc = (dims: BoxDimensions, topFlaps: boolean) => computeRscLayout(dims, t, { topFlaps });

  switch (input.template as BoxTemplate) {
    case 'rsc': {
      const b = rsc(input.dimensions, true).blank;
      return toArea([{ l: b.length, h: b.height }]);
    }
    case 'hsc': {
      const layout = rsc(input.dimensions, false);
      // HSC has flaps on one side only
      return toArea([{ l: layout.blank.length, h: layout.outside.height + layout.flapDepth }]);
    }
    case 'fol': {
      // FEFCO 0203: every flap is the full outside width deep
      const layout = rsc(input.dimensions, true);
      return toArea([{ l: layout.blank.length, h: layout.outside.height + 2 * layout.outside.width }]);
    }
    case 'sleeve': {
      const layout = rsc(input.dimensions, false);
      return toArea([{ l: layout.blank.length, h: H + 2 * t }]);
    }
    case 'telescope': {
      // Base: HSC at full height. Lid: HSC 2t larger, lidDepth deep (auto = a third of the height)
      const lid = input.lidDepth ?? Math.max(2, Math.round((H / 3) * 10) / 10);
      const base = rsc(input.dimensions, false);
      const lidLayout = rsc({ length: L + 2 * t, width: W + 2 * t, height: lid }, false);
      return toArea([
        { l: base.blank.length, h: base.outside.height + base.flapDepth },
        { l: lidLayout.blank.length, h: lidLayout.outside.height + lidLayout.flapDepth },
      ]);
    }
    case 'mailer':
    case 'pizza': {
      // FEFCO 0427 family, approximated: base + back + lid + tuck along the length; double side walls and dust
      // flaps across the width. VERIFY-LATER[DSG-02]: replace with the registry's real dieline extents.
      // front double wall (2H) + base (W) + back wall (H) + lid (W) + lid tuck (H)
      const l = 2 * W + 4 * H + 6 * t;
      const h = L + 4 * H + 6 * t;
      return toArea([{ l, h }]);
    }
    case 'tray': {
      // Mailer base without the lid: base + double walls on all four sides
      const l = W + 4 * H + 4 * t;
      const h = L + 4 * H + 4 * t;
      return toArea([{ l, h }]);
    }
    default: {
      const b = rsc(input.dimensions, true).blank;
      return toArea([{ l: b.length, h: b.height }]);
    }
  }
}

/** Blank size for a design, from the style registry's dieline (same numbers the die maker sees) */
export function getBlankSizeCm(input: BlankInput): BlankSize {
  return blankSizeForDesign(input);
}
