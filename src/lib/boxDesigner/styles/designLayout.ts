/**
 * Design-level style helpers: everything a page needs from a BoxDesign (board thickness included).
 *   layoutForDesign(design)     -> the same CartonLayout the 3D model uses
 *   faceSizesForDesign(design)  -> printable surfaces in display order with real sizes (artwork editor)
 *   dielineForDesign(design)    -> 1:1 dieline (export)
 *   blankSizeForDesign(design)  -> flat blank pieces and board area (estimate, strength, sustainability)
 */

import type { BoxDesign } from '@/types/boxDesigner';
import { getBoardSpec, getBoardThicknessCm } from '../boardSpecs';
import { PLY_OPTIONS } from '../constants';
import type { FaceSizes } from '../rig/rscLayout';
import { resolveOpeningSpec } from '../rig/openings';
import type { Dieline } from '../dieline';
import { buildLayoutDieline, getLayoutFaceSizes, getStyle, type CartonLayout } from './registry';

export type DesignLayoutInput = Pick<BoxDesign, 'template' | 'dimensions' | 'ply' | 'flutes' | 'lidDepth'> & {
  /** Cut-out options (schema v3); older callers may leave them out */
  options?: Partial<BoxDesign['options']>;
};

export function layoutForDesign(design: DesignLayoutInput): CartonLayout {
  const board = getBoardSpec(design.ply, design.flutes);
  const thickness = getBoardThicknessCm(board, design.dimensions);
  const style = getStyle(design.template);
  const openings = resolveOpeningSpec(style.openings, design.options, style.openingDefaults, style.forcedOpenings);
  return style.computeLayout(design.dimensions, thickness, { lidDepth: design.lidDepth, openings, frontCut: design.options?.frontCut });
}

/** Printable surfaces of a layout, ordered as the style lists them */
export function orderedFaceSizes(template: BoxDesign['template'], layout: CartonLayout): FaceSizes {
  const sizes = getLayoutFaceSizes(layout);
  const ordered: FaceSizes = {};
  for (const face of getStyle(template).faces) if (sizes[face]) ordered[face] = sizes[face];
  for (const [face, size] of Object.entries(sizes)) if (!(face in ordered)) ordered[face as keyof FaceSizes] = size;
  return ordered;
}

export function faceSizesForDesign(design: DesignLayoutInput): FaceSizes {
  return orderedFaceSizes(design.template, layoutForDesign(design));
}

export function dielineForDesign(design: DesignLayoutInput): Dieline {
  const style = getStyle(design.template);
  const board = getBoardSpec(design.ply, design.flutes);
  const ply = PLY_OPTIONS.find((p) => p.id === design.ply) ?? PLY_OPTIONS[0];
  const { length, width, height } = design.dimensions;
  return buildLayoutDieline(layoutForDesign(design), {
    title: `${style.name}${style.fefco ? ` (FEFCO ${style.fefco})` : ''} - inside ${length} x ${width} x ${height} cm`,
    board: `${ply.name} ${ply.wall}, ${board.flutes.join('')} flute, ~${board.caliperMm} mm`,
  });
}

export interface BlankPieces {
  /** Largest piece extents (cm) */
  lengthCm: number;
  heightCm: number;
  /** Sum of the bounding rectangles of all pieces (m2) */
  areaM2: number;
  pieces: number;
}

/** Flat blank size from the dieline (same numbers the die maker sees) */
export function blankSizeForDesign(design: DesignLayoutInput): BlankPieces {
  const { pieces } = dielineForDesign(design);
  const cm = pieces.map((p) => ({ l: p.width / 10, h: p.height / 10 }));
  const main = cm.reduce((a, b) => (a.l * a.h >= b.l * b.h ? a : b));
  const area = cm.reduce((sum, p) => sum + (p.l * p.h) / 10_000, 0);
  return {
    lengthCm: Math.round(main.l * 10) / 10,
    heightCm: Math.round(main.h * 10) / 10,
    areaM2: Math.round(area * 10_000) / 10_000,
    pieces: cm.length,
  };
}
