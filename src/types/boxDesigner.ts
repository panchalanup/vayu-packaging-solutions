/**
 * Type definitions for 3D Box Designer
 */

export type BoxTemplate = 'rsc' | 'hsc' | 'mailer';

export type PlyType = '3-ply' | '5-ply' | '7-ply';

export type FluteType = 'A' | 'B' | 'C' | 'E' | 'F';


export type BoxFace = 'front' | 'back' | 'left' | 'right' | 'top-front' | 'top-back' | 'top-left' | 'top-right' | 'bottom';

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
