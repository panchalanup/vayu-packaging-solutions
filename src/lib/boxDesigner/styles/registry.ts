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
import {
  computeDieCutLayout,
  DIE_CUT_OPEN_STOP,
  getDieCutFaceSizes,
  type DieCutLayout,
} from '../rig/dieCutLayout';
import { getSlideViewExtents, type SlideLayout } from '../rig/slideLayout';
import { DIE_CUT_PHASE2_STYLES } from './phase2DieCut';
import type { OpeningCaps, OpeningMap, OpeningSpec } from '../rig/openings';
import { mergeOpenings, resolveOpeningSpec } from '../rig/openings';
import { buildDieCutDieline, buildDieline, buildSlideDieline, buildTelescopeDieline, type Dieline, type DielineMeta } from '../dieline';

export type CartonLayout = RscLayout | TelescopeLayout | DieCutLayout | SlideLayout;
export type RigKind = 'slotted' | 'telescope' | 'diecut' | 'slide';

/** Picker groups, in display order */
export type StyleGroup = 'Shipping' | 'Retail & gifts' | 'Food & bakery' | 'Fruit & produce' | 'Display';

export interface FoldStop {
  label: string;
  /** Fold percentage 0..100 */
  value: number;
}

export interface StyleLayoutOptions {
  /** Telescope lid depth (cm); null = automatic */
  lidDepth?: number | null;
  /** Resolved cut-outs (hand holes, vents, window); a style only uses what it offers */
  openings?: OpeningSpec;
  /** Shelf tray: how much of the front wall is cut away (design option `frontCut`, 0..0.9; 0 = style default) */
  frontCut?: number;
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
  /** Picker group */
  group?: StyleGroup;
  /** Cut-outs the style can offer (the design options switch them on) */
  openings?: OpeningCaps;
  /** Cut-outs that are always part of the style (window mailer, cake box): the UI hides their toggle */
  forcedOpenings?: OpeningCaps;
  /** What an option left undefined means for this style (a carry box has hand holes unless switched off) */
  openingDefaults?: Partial<OpeningSpec>;
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

/** Cut-outs a slotted style actually draws: the design options, limited to what the style offers */
const openingsOf = (id: BoxTemplate, options?: StyleLayoutOptions): OpeningSpec => {
  const style = getStyle(id);
  return resolveOpeningSpec(style.openings, options?.openings, style.openingDefaults, style.forcedOpenings);
};

const TUCK_FACES: BoxFace[] = ['lid', ...WALLS, 'bottom'];

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

  // ---- Phase 2, slotted family (workstream G1) ------------------------------------------------------------------
  // VERIFY-LATER[DSG-70]: FEFCO codes for the carry, ventilated produce, tuck-end, crash-lock and 1-2-3 styles are left
  // empty (sources disagree); the open produce tray is an HSC (0200). Confirm with the owner before showing codes.
  {
    id: 'carry',
    name: 'Carry box with hand holes',
    shortName: 'Carry box',
    fefco: '',
    group: 'Shipping',
    description: 'A sealed slotted carton with a hand hole in each short wall, so it can be lifted and carried.',
    bestFor: 'Gifts and hampers to carry, sweets, appliances, moving and storage',
    iconPath: 'M3 8l9-4 9 4v9l-9 4-9-4z M3 8l9 4 9-4 M12 12v9 M5.5 12.8l4 1.6',
    rigKind: 'slotted',
    openings: { hand: true },
    openingDefaults: { handHoles: true },
    defaultDims: { length: 40, width: 30, height: 25 },
    foldStops: SEALED_STOPS,
    faces: [...WALLS, ...TOPS],
    computeLayout: (dims, t, options) => computeRscLayout(dims, t, { openings: openingsOf('carry', options) }),
  },
  {
    id: 'produce',
    name: 'Ventilated produce carton',
    shortName: 'Produce carton',
    fefco: '',
    group: 'Fruit & produce',
    description: 'A sealed slotted carton with vent slots and hand holes for airflow, cooling and carrying.',
    bestFor: 'Mangoes, apples, grapes, vegetables and other fresh produce',
    iconPath: 'M3 8l9-4 9 4v9l-9 4-9-4z M3 8l9 4 9-4 M12 12v9 M5.5 11.5v3.5 M7.5 12.5v3.5 M9.5 13.5v3.5',
    rigKind: 'slotted',
    openings: { hand: true, vents: true },
    openingDefaults: { vents: true, handHoles: true },
    defaultDims: { length: 40, width: 30, height: 20 },
    foldStops: SEALED_STOPS,
    faces: [...WALLS, ...TOPS],
    computeLayout: (dims, t, options) => computeRscLayout(dims, t, { openings: openingsOf('produce', options) }),
  },
  {
    id: 'produce-tray',
    name: 'Open produce tray (HSC)',
    shortName: 'Produce tray',
    fefco: '0200',
    group: 'Fruit & produce',
    description: 'A low open tray with vent slots: stackable, easy to fill and see into.',
    bestFor: 'Berries, tomatoes, small fruit, market and shelf display',
    iconPath: 'M3 11l9 4 9-4 M3 11v5l9 4 9-4v-5 M12 15v5 M3 11l9-4 9 4 M6 13.5v2 M8.5 14.5v2 M11 15.5v2',
    rigKind: 'slotted',
    openings: { hand: true, vents: true },
    openingDefaults: { vents: true },
    defaultDims: { length: 40, width: 30, height: 12 },
    foldStops: ASSEMBLED_STOPS,
    faces: WALLS,
    computeLayout: (dims, t, options) => computeRscLayout(dims, t, { topFlaps: false, openings: openingsOf('produce-tray', options) }),
  },
  {
    id: 'tuck-end',
    name: 'Tuck-end carton',
    shortName: 'Tuck-end',
    fefco: '',
    group: 'Retail & gifts',
    description: 'A folding carton: a tube with a lid flap and tuck tab at each end. Opens and closes without tape.',
    bestFor: 'Cosmetics, soap, small retail packs, cards and light gifts',
    iconPath: 'M7 8l5-3 5 3v10l-5 3-5-3z M7 8l5 3 5-3 M12 11v10 M9 6.5l5-2.5 1.5 2',
    rigKind: 'slotted',
    openings: { window: true },
    defaultDims: { length: 12, width: 8, height: 14 },
    foldStops: SEALED_STOPS,
    faces: TUCK_FACES,
    computeLayout: (dims, t, options) =>
      computeRscLayout(dims, t, { topClosure: 'tuck', bottomClosure: 'tuck', openings: openingsOf('tuck-end', options) }),
  },
  {
    id: 'crash-lock',
    name: 'Crash-lock bottom box',
    shortName: 'Crash-lock',
    fefco: '',
    group: 'Retail & gifts',
    description: 'The bottom locks itself when the box is opened out (pre-glued), with a tuck top. Strong for heavy items.',
    bestFor: 'Bottles, jars, heavier retail packs and quick-to-set-up packing lines',
    iconPath: 'M5 5h14v10l-7 5-7-5z M5 15l7 1 7-1 M12 16v4 M5 15l7 5 M19 15l-7 5',
    rigKind: 'slotted',
    openings: { window: true },
    // VERIFY-LATER[DSG-71]: the 3D crash-lock bottom is two overlapping long flaps; confirm the crease pattern with the die maker
    defaultDims: { length: 20, width: 15, height: 25 },
    foldStops: SEALED_STOPS,
    faces: TUCK_FACES,
    computeLayout: (dims, t, options) =>
      computeRscLayout(dims, t, {
        topClosure: 'tuck',
        bottomClosure: 'lock',
        overlapBottom: true,
        openings: openingsOf('crash-lock', options),
      }),
  },
  {
    id: 'one-two-three',
    name: '1-2-3 bottom box',
    shortName: '1-2-3 bottom',
    fefco: '',
    group: 'Retail & gifts',
    description: 'Three bottom flaps fold in order 1, 2, 3 and lock, with a tuck top. Lighter than crash-lock, quick to set up by hand.',
    bestFor: 'Light to medium retail packs, food and gift items packed by hand (crash-lock suits heavier goods)',
    iconPath: 'M4 8h16v11H4z M4 13h16 M9 8v11 M14 8v11',
    rigKind: 'slotted',
    openings: { window: true },
    defaultDims: { length: 20, width: 15, height: 20 },
    foldStops: SEALED_STOPS,
    faces: TUCK_FACES,
    computeLayout: (dims, t, options) =>
      computeRscLayout(dims, t, {
        topClosure: 'tuck',
        overlapBottom: true,
        bottomOuterFace: 'bottom',
        openings: openingsOf('one-two-three', options),
      }),
  },
  ...DIE_CUT_PHASE2_STYLES,
];

const BY_ID = new Map(STYLES.map((s) => [s.id, s]));

/** Style definition; unknown ids fall back to RSC */
export function getStyle(id: BoxTemplate | string): StyleDefinition {
  return BY_ID.get(id as BoxTemplate) ?? STYLES[0];
}

export const STYLE_IDS: readonly BoxTemplate[] = STYLES.map((s) => s.id);

export const STYLE_GROUPS: readonly StyleGroup[] = ['Shipping', 'Retail & gifts', 'Food & bakery', 'Fruit & produce', 'Display'];

/** Picker group of the styles built before groups existed */
const BASE_GROUPS: Partial<Record<BoxTemplate, StyleGroup>> = {
  rsc: 'Shipping',
  hsc: 'Shipping',
  fol: 'Shipping',
  sleeve: 'Shipping',
  mailer: 'Shipping',
  telescope: 'Retail & gifts',
  pizza: 'Food & bakery',
  tray: 'Display',
};

/** Picker group of a style (its own `group`, else the base table, else Shipping) */
export function getStyleGroup(style: Pick<StyleDefinition, 'id' | 'group'>): StyleGroup {
  return style.group ?? BASE_GROUPS[style.id] ?? 'Shipping';
}

/** Real size (cm) of every printable surface, as the artwork is laid out */
export function getLayoutFaceSizes(layout: CartonLayout): FaceSizes {
  switch (layout.kind) {
    case 'rsc':
      return getFaceSizes(layout);
    case 'telescope':
      return { ...getFaceSizes(layout.lid), ...getFaceSizes(layout.base) };
    case 'diecut':
      return getDieCutFaceSizes(layout);
    case 'slide':
      return { ...getDieCutFaceSizes(layout.sleeve), ...getDieCutFaceSizes(layout.tray) };
  }
}

function getDieCutViewExtents(layout: DieCutLayout, foldProgress: number): ViewExtents {
  const p = Number.isFinite(foldProgress) ? Math.min(1, Math.max(0, foldProgress)) : 1;
  const u = p * layout.timelineEnd;
  const { outside, blank, thickness, hasLid } = layout;
  const flatRadius = 0.5 * Math.hypot(blank.length, blank.height) * 0.9;
  const single = layout.schedule === 'single';
  const lidOpen = hasLid ? smooth(single ? 0.2 : 0.14, 0.3, u) * (1 - smooth(single ? 0.72 : 0.76, 1, u)) : 0;
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
    case 'slide':
      return getSlideViewExtents(layout, foldProgress);
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
    case 'slide':
      return buildSlideDieline(layout, meta);
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
      // phase 2 variants with another hinge tree need their own rig
      return (layout.hasLid ? 'diecut-lid' : 'diecut-tray') + (['clamshell', 'book', 'sleeve'].includes(layout.variant) ? `-${layout.variant}` : '');
    case 'slide':
      return 'slide';
  }
}

/**
 * Cut-outs of a layout of any kind, merged per face: slotted layouts carry `openings`, telescope merges lid and
 * base, die-cut / other layouts may carry an optional `openings` field of the same shape.
 */
export function getLayoutOpenings(layout: CartonLayout): OpeningMap {
  if (layout.kind === 'telescope') return mergeOpenings(layout.base.openings, layout.lid.openings);
  const own = (layout as { openings?: OpeningMap }).openings;
  return own ?? {};
}

/** Outside dimensions (cm) of the assembled carton */
export function getLayoutOutside(layout: CartonLayout): { length: number; width: number; height: number } {
  return layout.outside;
}
