/**
 * Type definitions for 3D Box Designer
 */

export type BoxTemplate = 'rsc' | 'hsc' | 'die-cut' | 'mailer';

export type PlyType = '3-ply' | '5-ply' | '7-ply';

export type BoxFace = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';

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

export interface BoxTemplateConfig {
  id: BoxTemplate;
  name: string;
  description: string;
  icon: string;
}

export interface PlyConfig {
  id: PlyType;
  name: string;
  thickness: number;  // mm
  strength: string;
  color: string;
  textureUrl?: string;
}

export interface BoxDesign {
  id?: string;
  template: BoxTemplate;
  dimensions: BoxDimensions;
  ply: PlyType;
  faceImages: FaceImage[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ExportOptions {
  format: 'pdf' | 'png' | 'jpg' | 'json';
  includeSpecs: boolean;
  includeAllFaces: boolean;
  quality?: number;  // For image exports (0-1)
}
