/**
 * Type definitions for 3D Box Designer
 */

/**
 * Box styles. RSC-family styles share the hinge-chain rig; mailer/pizza/tray use the die-cut rig;
 * telescope is a base plus a lid. See docs/3D-Model-page/BOX_DESIGNER_IMPLEMENTATION_PLAN.md
 */
export type BoxTemplate = 'rsc' | 'hsc' | 'fol' | 'sleeve' | 'telescope' | 'mailer' | 'pizza' | 'tray';

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
