/**
 * Type definitions for 3D Box Designer
 */

/**
 * Box styles. RSC-family styles share the hinge-chain rig; mailer/pizza/tray use the die-cut rig;
 * telescope is a base plus a lid. See docs/3D-Model-page/BOX_DESIGNER_IMPLEMENTATION_PLAN.md
 */
/** Every box style id (single list: the codec enum and the registry tests read it). Append new styles here. */
export const BOX_TEMPLATE_IDS = [
  'rsc',
  'hsc',
  'fol',
  'sleeve',
  'telescope',
  'mailer',
  'pizza',
  'tray',
  // phase 2, slotted family
  'carry',
  'produce',
  'produce-tray',
  'tuck-end',
  'crash-lock',
  'one-two-three',
  // phase 2, die-cut and two-part family
  'window-mailer',
  'cake-box',
  'clamshell',
  'shelf-tray',
  'slide-box',
  'book-box',
] as const;
export type BoxTemplate = (typeof BOX_TEMPLATE_IDS)[number];

/** Display unit only: the design always stores centimetres */
export type LengthUnit = 'mm' | 'cm' | 'in';

/** Print finish preview */
export type PrintFinish = 'matte' | 'gloss';

export type PlyType = '3-ply' | '5-ply' | '7-ply';

export type FluteType = 'A' | 'B' | 'C' | 'E' | 'F';


/** Printable surfaces. Lid faces are used by telescope (separate lid) and mailer/pizza (hinged lid). */
export type BoxFace =
  | 'front'
  | 'back'
  | 'left'
  | 'right'
  | 'top-front'
  | 'top-back'
  | 'top-left'
  | 'top-right'
  | 'bottom'
  | 'lid'
  | 'lid-front'
  | 'lid-back'
  | 'lid-left'
  | 'lid-right';

export const BOX_FACES: readonly BoxFace[] = [
  'front',
  'back',
  'left',
  'right',
  'top-front',
  'top-back',
  'top-left',
  'top-right',
  'bottom',
  'lid',
  'lid-front',
  'lid-back',
  'lid-left',
  'lid-right',
];

export interface BoxDimensions {
  length: number;  // cm
  width: number;   // cm
  height: number;  // cm
}

export interface FaceImage {
  face: BoxFace;
  imageUrl: string;
  imageFile?: File;
  position: { x: number; y: number };  // 0-1 normalized coordinates
  scale: number;                        // 0.1-2.0
  rotation: number;                     // 0-360 degrees
}

export interface TextElement {
  id: string;
  face: BoxFace;
  text: string;
  font: string;
  size: number;                         // 10-200pt
  color: string;                        // HEX color
  position: { x: number; y: number };  // 0-1 normalized coordinates
  rotation: number;                     // 0-360 degrees
  align: 'left' | 'center' | 'right';
}

export interface BoxTemplateConfig {
  id: BoxTemplate;
  name: string;
  shortName: string;
  fefco: string;
  description: string;
  icon: string;
  /** false = selectable for quotes but without a 3D model yet */
  available: boolean;
}

/**
 * Optional openings (schema v3). Only offered for styles that support them (`style.openings`).
 * Hand holes, vents and the window are drawn as cut-out decals; the dieline always shows the true cut lines.
 */
export interface DesignOptions {
  handHoles: boolean;
  vents: boolean;
  window: boolean;
  /** Window size as a fraction of the panel (0.2-0.9) */
  windowRatio: number;
  /** Front wall cut-down as a fraction of the height (display trays; 0 = none) */
  frontCut: number;
}

export interface StickerPattern {
  /** Gap between tiles as a fraction of the sticker size */
  spacing: number;
  /** Degrees the tile grid is rotated */
  angle: number;
  /** Offset every other row by half a tile */
  stagger: boolean;
}

/** A cutout (sticker) placed on a surface (schema v3). Artwork is referenced by id; the library loads lazily. */
export interface StickerPlacement {
  id: string;
  /** Library id (see src/lib/boxDesigner/stickers) */
  stickerId: string;
  face: BoxFace;
  /** Centre, 0-1 of the surface. For a pattern this is the phase of the tile grid. */
  position: { x: number; y: number };
  /** Longest side as a fraction of the surface's shorter side (0.02-1.5) */
  scale: number;
  /** Degrees, -360..360 */
  rotation: number;
  /** Mirrored left to right */
  flip: boolean;
  /** 0.05-1 */
  opacity: number;
  /** One-colour tint (#rrggbb) over the whole sticker; null = original colours */
  tint: string | null;
  locked: boolean;
  /** Tiled across the whole surface when set */
  pattern: StickerPattern | null;
}

/** Design-wide cap on stickers */
export const MAX_STICKERS = 80;

/** Everything that defines a design (single source of truth, saved, shared and undoable) */
export interface BoxDesign {
  template: BoxTemplate;
  dimensions: BoxDimensions;
  ply: PlyType;
  flutes: FluteType[];
  colorHex: string;
  showIcons: boolean;
  faceImages: FaceImage[];
  textElements: TextElement[];
  /** Display unit for dimensions (storage stays cm) */
  unit: LengthUnit;
  /** Order quantity used for the estimate and the enquiry */
  quantity: number;
  finish: PrintFinish;
  /** Inside liner colour; null = same as the outside board */
  insideColorHex: string | null;
  /** Telescope lid depth (cm); null = automatic (about a third of the height) */
  lidDepth: number | null;
  /** Optional design name chosen by the user */
  name: string;
  /** Cutouts (stickers) on any surface (schema v3) */
  stickers: StickerPlacement[];
  /** Openings: hand holes, vents, window (schema v3) */
  options: DesignOptions;
}

export interface ExportOptions {
  format: 'pdf' | 'png' | 'jpg' | 'json';
  includeSpecs: boolean;
  includeAllFaces: boolean;
  quality?: number;  // For image exports (0-1)
}

export type ShareFormat = 'whatsapp' | 'email';

export interface ShareOptions {
  format: ShareFormat;
  includeImage: boolean;
  message?: string;
}
