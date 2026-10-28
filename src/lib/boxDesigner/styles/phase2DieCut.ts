/**
 * Phase 2, die-cut and two-part family: window mailer, window cake box, takeaway clamshell, shelf display tray,
 * slide box and book-style flip-lid box. They reuse the die-cut hinge tree (rig/dieCutLayout) and, for the slide
 * box, the two-part pattern of the telescope (rig/slideLayout + slideRig). Spread into STYLES by registry.ts.
 * Type-only import from the registry, so there is no runtime cycle.
 *
 * Gable carry box: NOT built. Its roof, built-in handle and gusset folds do not fit the hinge tree without a new
 * rig, so (per the phase 2 plan) it is dropped rather than shipped rough.
 */

import { computeDieCutLayout, DIE_CUT_OPEN_STOP, DIE_CUT_SINGLE_OPEN_STOP } from '../rig/dieCutLayout';
import { NO_OPENINGS, type OpeningSpec } from '../rig/openings';
import { computeSlideLayout, SLIDE_TRAY_OUT } from '../rig/slideLayout';
import type { BoxFace } from '@/types/boxDesigner';
import type { FoldStop, StyleDefinition, StyleLayoutOptions } from './registry';

const WALLS: BoxFace[] = ['front', 'back', 'left', 'right'];

const LID_STOPS: FoldStop[] = [
  { label: 'Flat', value: 0 },
  { label: 'Open lid', value: Math.round(DIE_CUT_OPEN_STOP * 100) },
  { label: 'Closed', value: 100 },
];
const SINGLE_LID_STOPS: FoldStop[] = [
  { label: 'Flat', value: 0 },
  { label: 'Open lid', value: Math.round(DIE_CUT_SINGLE_OPEN_STOP * 100) },
  { label: 'Closed', value: 100 },
];
const ASSEMBLED_STOPS: FoldStop[] = [
  { label: 'Flat', value: 0 },
  { label: 'Half way', value: 50 },
  { label: 'Assembled', value: 100 },
];
const SLIDE_STOPS: FoldStop[] = [
  { label: 'Flat', value: 0 },
  { label: 'Tray out', value: Math.round(SLIDE_TRAY_OUT * 100) },
  { label: 'Closed', value: 100 },
];

/** Window styles always have their window: the design's own on/off option is ignored, the size ratio is kept */
const withWindow = (options?: StyleLayoutOptions): OpeningSpec => ({ ...(options?.openings ?? NO_OPENINGS), window: true });

/** Shelf tray: the design option is the share cut away; 0 means "not chosen" and takes the style default */
const frontRatioFor = (options?: StyleLayoutOptions): number | undefined =>
  options?.frontCut && options.frontCut > 0 ? 1 - options.frontCut : undefined;

// VERIFY-LATER[DSG-80]: FEFCO codes for window mailer (0427 family), cake box, clamshell, shelf tray, slide box
// (05xx family) and book box are not confirmed; only the window mailer carries the mailer's 0427 until the owner checks.
// VERIFY-LATER[DSG-81]: confirm the real window film sizes and the sleeve/tray clearance (0.15 cm) with the die maker
export const DIE_CUT_PHASE2_STYLES: StyleDefinition[] = [
  {
    id: 'window-mailer',
    name: 'Window mailer box',
    shortName: 'Window mailer',
    fefco: '0427',
    description: 'A tuck-front mailer with a film window in the lid, so the product shows before the box is opened.',
    bestFor: 'Apparel, gifts, cosmetics and small retail products',
    iconPath: 'M3 11l9 4 9-4v6l-9 4-9-4z M3 11l9-4 9 4 M12 15v6 M8 11l4-1.7 4 1.7-4 1.7z',
    rigKind: 'diecut',
    group: 'Retail & gifts',
    openings: { window: true },
    forcedOpenings: { window: true },
    defaultDims: { length: 28, width: 22, height: 7 },
    foldStops: LID_STOPS,
    faces: ['lid', ...WALLS],
    computeLayout: (dims, t, options) => computeDieCutLayout(dims, t, 'mailer', { openings: withWindow(options) }),
  },
  {
    id: 'cake-box',
    name: 'Window cake box',
    shortName: 'Cake box',
    fefco: '',
    description: 'A square hinged-lid box with a big window in the lid. Square and deep enough for a cake or a sweet tray.',
    bestFor: 'Cakes, pastries, sweets and gift hampers',
    iconPath: 'M4 10l8-3 8 3v7l-8 3-8-3z M4 10l8 3 8-3 M12 13v7 M9 10.5a3 1.2 0 1 0 6 0a3 1.2 0 1 0-6 0',
    rigKind: 'diecut',
    group: 'Food & bakery',
    openings: { window: true },
    forcedOpenings: { window: true },
    defaultDims: { length: 25, width: 25, height: 12 },
    foldStops: LID_STOPS,
    faces: ['lid', ...WALLS],
    computeLayout: (dims, t, options) => computeDieCutLayout(dims, t, 'pizza', { openings: withWindow(options) }),
  },
  {
    id: 'clamshell',
    name: 'Takeaway clamshell',
    shortName: 'Clamshell',
    fefco: '',
    description: 'A single-wall food box with the lid hinged on the back wall and a front tuck. No tape, no glue to close.',
    bestFor: 'Burgers, sandwiches, lunch and takeaway meals',
    iconPath: 'M3 14v3l9 4 9-4v-3 M3 14l9 4 9-4 M3 14l2-7 9 3 M21 14l-4-6-3 2',
    rigKind: 'diecut',
    group: 'Food & bakery',
    openings: { window: true },
    defaultDims: { length: 20, width: 18, height: 8 },
    foldStops: SINGLE_LID_STOPS,
    faces: ['lid', ...WALLS],
    computeLayout: (dims, t, options) => computeDieCutLayout(dims, t, 'clamshell', { openings: options?.openings }),
  },
  {
    id: 'shelf-tray',
    name: 'Shelf display tray',
    shortName: 'Shelf tray',
    fefco: '',
    description: 'A tray with a cut-down front so the products show and can be picked straight off the shelf.',
    bestFor: 'Shop shelves, counter displays, snacks and small retail packs',
    iconPath: 'M3 14l9 4 9-4v3l-9 4-9-4z M3 14V6l9 4v8 M21 14V6l-9 4',
    rigKind: 'diecut',
    group: 'Display',
    defaultDims: { length: 30, width: 20, height: 12 },
    foldStops: ASSEMBLED_STOPS,
    faces: WALLS,
    computeLayout: (dims, t, options) => computeDieCutLayout(dims, t, 'shelf', { frontRatio: frontRatioFor(options) }),
  },
  {
    id: 'slide-box',
    name: 'Slide box (tray and sleeve)',
    shortName: 'Slide box',
    fefco: '',
    description: 'A tray that slides out of a printed sleeve. Two parts, one reveal.',
    bestFor: 'Gifts, cosmetics, electronics and premium retail packs',
    iconPath: 'M4 8l8-3 8 3v6l-8 3-8-3z M4 8l8 3 8-3 M12 11v6 M14 20h7 M19 18l2 2-2 2',
    rigKind: 'slide',
    group: 'Retail & gifts',
    defaultDims: { length: 22, width: 16, height: 6 },
    foldStops: SLIDE_STOPS,
    faces: ['lid', 'lid-front', 'lid-back', 'bottom', ...WALLS],
    computeLayout: (dims, t) => computeSlideLayout(dims, t),
  },
  {
    id: 'book-box',
    name: 'Book-style flip-lid box',
    shortName: 'Book box',
    fefco: '',
    description: 'The lid is hinged along the long side like a book, and a lip with a tuck tongue closes it.',
    bestFor: 'Gifts, books, hampers and keepsake boxes',
    iconPath: 'M4 9l8-3 8 3v9l-8 3-8-3z M4 9l8 3 8-3 M12 12v9 M4 9l-1-3 9-3',
    rigKind: 'diecut',
    group: 'Retail & gifts',
    openings: { window: true },
    defaultDims: { length: 28, width: 20, height: 6 },
    foldStops: SINGLE_LID_STOPS,
    faces: ['lid', 'lid-front', ...WALLS],
    computeLayout: (dims, t, options) => computeDieCutLayout(dims, t, 'book', { openings: options?.openings }),
  },
];
