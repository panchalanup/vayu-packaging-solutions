/**
 * Box style registry: one entry per style, and layout-level helpers that dispatch on the layout kind.
 * Everything else (3D scene, artwork editor, export, estimate, templates) reads styles from here, never from
 * `template === 'rsc'` checks. Pure (no three.js) so it can be used by any page or test.
 *
 *   getStyle(id)                              -> StyleDefinition (names, FEFCO code, best-for, icon, stops, defaults)
 *   getStyle(id).computeLayout(dims, t, opts) -> CartonLayout (rsc | telescope | diecut)
 *   getLayoutFaceSizes / getLayoutViewExtents / buildLayoutDieline / getRigKey  (any CartonLayout)
 * For a whole BoxDesign (board thickness included) use styles/designLayout.ts.
 */

import type { BoxDimensions, BoxFace, BoxTemplate } from '@/types/boxDesigner';
import { computeRscLayout, getFaceSizes, getViewExtents, smooth, type FaceSizes, type RscLayout, type ViewExtents } from '../rig/rscLayout';
import { computeTelescopeLayout, getTelescopeViewExtents, TELESCOPE_LID_OFF, type TelescopeLayout } from '../rig/telescopeLayout';
import { computeDieCutLayout, DIE_CUT_OPEN_STOP, getDieCutFaceSizes, type DieCutLayout } from '../rig/dieCutLayout';
import { buildDieCutDieline, buildDieline, buildTelescopeDieline, type Dieline, type DielineMeta } from '../dieline';

export type CartonLayout = RscLayout | TelescopeLayout | DieCutLayout;
export type RigKind = 'slotted' | 'telescope' | 'diecut';

export interface FoldStop {
  label: string;
  /** Fold percentage 0..100 */
  value: number;
}

export interface StyleLayoutOptions {
  /** Telescope lid depth (cm); null = automatic */
  lidDepth?: number | null;
}

export interface StyleDefinition {
  id: BoxTemplate;
  name: string;
  shortName: string;
  /** FEFCO code (empty when the style has no single code) */
  fefco: string;
  description: string;
  /** Who / what it is for, shown on the style cards */
  bestFor: string;
  /** 24x24 line icon (SVG path data, stroke only) */
  iconPath: string;
  rigKind: RigKind;
  defaultDims: BoxDimensions;
  /** Named points of the fold slider */
  foldStops: FoldStop[];
  /** Printable surfaces in display order (the layout decides their sizes) */
  faces: BoxFace[];
  computeLayout(dims: BoxDimensions, thicknessCm: number, options?: StyleLayoutOptions): CartonLayout;
}

const WALLS: BoxFace[] = ['front', 'back', 'left', 'right'];
const TOPS: BoxFace[] = ['top-front', 'top-back', 'top-left', 'top-right'];
const SEALED_STOPS: FoldStop[] = [
  { label: 'Flat', value: 0 },
  { label: 'Open top', value: 72 },
  { label: 'Sealed', value: 100 },
];
const ASSEMBLED_STOPS: FoldStop[] = [
  { label: 'Flat', value: 0 },
  { label: 'Half way', value: 50 },
  { label: 'Assembled', value: 100 },
];
const LID_STOPS: FoldStop[] = [
  { label: 'Flat', value: 0 },
  { label: 'Open lid', value: Math.round(DIE_CUT_OPEN_STOP * 100) },
  { label: 'Closed', value: 100 },
];

// VERIFY-LATER[DSG-41]: confirm the FEFCO codes for telescope (0320) and pizza / tray (0427 family) with the owner
export const STYLES: readonly StyleDefinition[] = [
  {
    id: 'rsc',
    name: 'Regular Slotted Container (RSC)',
    shortName: 'RSC',
    fefco: '0201',
    description: 'The standard shipping carton: four flaps top and bottom that meet in the middle.',
    bestFor: 'Shipping, storage, moving and e-commerce',
    iconPath: 'M3 8l9-4 9 4v9l-9 4-9-4z M3 8l9 4 9-4 M12 12v9 M7.5 6l9 4',
    rigKind: 'slotted',
    defaultDims: { length: 30, width: 20, height: 15 },
    foldStops: SEALED_STOPS,
    faces: [...WALLS, ...TOPS],
    computeLayout: (dims, t) => computeRscLayout(dims, t),
  },
  {
    id: 'hsc',
    name: 'Half Slotted Container (HSC)',
    shortName: 'HSC',
    fefco: '0200',
    description: 'Open top, flaps only on the bottom.',
    bestFor: 'Display bins, trays and boxes with a separate lid',
    iconPath: 'M3 9l9 4 9-4 M3 9v8l9 4 9-4V9 M12 13v8 M3 9l9-4 9 4',
    rigKind: 'slotted',
    defaultDims: { length: 30, width: 20, height: 15 },
    foldStops: ASSEMBLED_STOPS,
    faces: WALLS,
    computeLayout: (dims, t) => computeRscLayout(dims, t, { topFlaps: false }),
  },
  {
    id: 'fol',
    name: 'Full Overlap Container (FOL)',
    shortName: 'FOL',
    fefco: '0203',
    description: 'The outer flaps reach right across, giving a double-thick top and bottom.',
    bestFor: 'Heavy or long items, rough handling, high stacks',
    iconPath: 'M3 8l9-4 9 4v9l-9 4-9-4z M3 8l9 4 9-4 M12 12v9 M5 7l9 4 M7 6l9 4',
    rigKind: 'slotted',
    defaultDims: { length: 40, width: 25, height: 20 },
    foldStops: SEALED_STOPS,
    faces: [...WALLS, ...TOPS],
    computeLayout: (dims, t) => computeRscLayout(dims, t, { overlapTop: true, overlapBottom: true }),
  },
  {
    id: 'sleeve',
    name: 'Sleeve (open tube)',
    shortName: 'Sleeve',
    fefco: '',
    description: 'Four walls and a glue joint, open at both ends. Slides over a tray or bundles products.',
    bestFor: 'Outer sleeves, bundling, long products',
    iconPath: 'M4 7l8-3 8 3v10l-8 3-8-3z M4 7l8 3 8-3 M12 10v10',
    rigKind: 'slotted',
    defaultDims: { length: 30, width: 20, height: 10 },
    foldStops: ASSEMBLED_STOPS,
    faces: WALLS,
    computeLayout: (dims, t) => computeRscLayout(dims, t, { topFlaps: false, bottomFlaps: false }),
  },
  {
    id: 'telescope',
    name: 'Telescope box (lid and base)',
    shortName: 'Telescope',
    fefco: '0320',
    description: 'A base with a separate lid that slides over it. The lid top is one clean print panel.',
    bestFor: 'Gift boxes, shoe boxes, premium and retail packs',
    iconPath: 'M3 9l9-4 9 4v3l-9 4-9-4z M3 12v5l9 4 9-4v-5 M3 9l9 4 9-4 M12 13v3',
    rigKind: 'telescope',
    defaultDims: { length: 30, width: 20, height: 10 },
    foldStops: [
      { label: 'Flat', value: 0 },
      { label: 'Lid off', value: Math.round(TELESCOPE_LID_OFF * 100) },
      { label: 'Closed', value: 100 },
    ],
    faces: ['lid', 'lid-front', 'lid-back', 'lid-left', 'lid-right', ...WALLS],
    computeLayout: (dims, t, options) => computeTelescopeLayout(dims, t, options?.lidDepth ?? null),
  },
  {
    id: 'mailer',
    name: 'Mailer box (tuck front)',
    shortName: 'Mailer',
    fefco: '0427',
    description: 'Die-cut box with a hinged lid, tuck front and double side walls. No tape needed.',
    bestFor: 'E-commerce, subscription boxes, unboxing',
    iconPath: 'M3 11l9 4 9-4v6l-9 4-9-4z M3 11l9-4 9 4 M12 15v6 M12 7l-2-4 9-1 2 9',
    rigKind: 'diecut',
    defaultDims: { length: 25, width: 18, height: 8 },
    foldStops: LID_STOPS,
    faces: ['lid', ...WALLS],
    computeLayout: (dims, t) => computeDieCutLayout(dims, t, 'mailer'),
  },
  {
    id: 'pizza',
    name: 'Pizza box',
    shortName: 'Pizza',
    fefco: '0427',
    description: 'A flat, square mailer with a big printable lid.',
    bestFor: 'Pizza, bakery, flat food and apparel',
    iconPath: 'M2 13l10 4 10-4v3l-10 4-10-4z M2 13l10-4 10 4 M12 17v3 M8 12.5a4 1.5 0 1 0 8 0a4 1.5 0 1 0-8 0',
    rigKind: 'diecut',
    defaultDims: { length: 30, width: 30, height: 5 },
    foldStops: LID_STOPS,
    faces: ['lid', ...WALLS],
    computeLayout: (dims, t) => computeDieCutLayout(dims, t, 'pizza'),
  },
  {
    id: 'tray',
    name: 'Tray (die-cut, no lid)',
    shortName: 'Tray',
    fefco: '0427',
    description: 'The mailer base on its own: double walls all round, open top.',
    bestFor: 'Bakery, produce, display and shelf-ready packs',
    iconPath: 'M3 12l9 4 9-4v4l-9 4-9-4z M3 12l9-4 9 4 M12 16v4',
    rigKind: 'diecut',
    defaultDims: { length: 30, width: 20, height: 6 },
    foldStops: ASSEMBLED_STOPS,
    faces: WALLS,
    computeLayout: (dims, t) => computeDieCutLayout(dims, t, 'tray'),
  },
];

const BY_ID = new Map(STYLES.map((s) => [s.id, s]));

/** Style definition; unknown ids fall back to RSC */
export function getStyle(id: BoxTemplate | string): StyleDefinition {
  return BY_ID.get(id as BoxTemplate) ?? STYLES[0];
}

export const STYLE_IDS: readonly BoxTemplate[] = STYLES.map((s) => s.id);

/** Real size (cm) of every printable surface, as the artwork is laid out */
export function getLayoutFaceSizes(layout: CartonLayout): FaceSizes {
  switch (layout.kind) {
    case 'rsc':
      return getFaceSizes(layout);
    case 'telescope':
      return { ...getFaceSizes(layout.lid), ...getFaceSizes(layout.base) };
    case 'diecut':
      return getDieCutFaceSizes(layout);
  }
}

function getDieCutViewExtents(layout: DieCutLayout, foldProgress: number): ViewExtents {
  const p = Number.isFinite(foldProgress) ? Math.min(1, Math.max(0, foldProgress)) : 1;
  const u = p * layout.timelineEnd;
  const { outside, blank, thickness, hasLid } = layout;
  const flatRadius = 0.5 * Math.hypot(blank.length, blank.height) * 0.9;
  const lidOpen = hasLid ? smooth(0.14, 0.3, u) * (1 - smooth(0.76, 1, u)) : 0;
  const height = outside.height + lidOpen * outside.width * 0.94;
  const depth = outside.width + lidOpen * outside.width * 0.34;
  const standing = smooth(0.1, 0.45, u);
  const standingRadius = 0.5 * Math.hypot(outside.length, depth, height);
  return {
    radius: flatRadius + (standingRadius - flatRadius) * standing,
    center: [0, thickness + (height / 2 - thickness) * standing, 0],
    shadowRadius: Math.max(flatRadius, 0.5 * Math.hypot(outside.length, outside.width * 1.34, outside.height + outside.width)),
  };
}

/** What the camera should frame for a fold progress (0 = flat blank, 1 = assembled) */
export function getLayoutViewExtents(layout: CartonLayout, foldProgress: number): ViewExtents {
  switch (layout.kind) {
    case 'rsc':
      return getViewExtents(layout, foldProgress);
    case 'telescope':
      return getTelescopeViewExtents(layout, foldProgress);
    case 'diecut':
      return getDieCutViewExtents(layout, foldProgress);
  }
}

/** 1:1 dieline for any style */
export function buildLayoutDieline(layout: CartonLayout, meta: DielineMeta): Dieline {
  switch (layout.kind) {
    case 'rsc':
      return buildDieline(layout, meta);
    case 'telescope':
      return buildTelescopeDieline(layout, meta);
    case 'diecut':
      return buildDieCutDieline(layout, meta);
  }
}

/**
 * Which rig a layout needs. A rig can be updated in place for any layout with the same key; a different key
 * means a new rig (style switch only, never on resize).
 */
export function getRigKey(layout: CartonLayout): string {
  switch (layout.kind) {
    case 'rsc':
      return 'slotted';
    case 'telescope':
      return 'telescope';
    case 'diecut':
      return layout.hasLid ? 'diecut-lid' : 'diecut-tray';
  }
}

/** Outside dimensions (cm) of the assembled carton */
export function getLayoutOutside(layout: CartonLayout): { length: number; width: number; height: number } {
  return layout.outside;
}
