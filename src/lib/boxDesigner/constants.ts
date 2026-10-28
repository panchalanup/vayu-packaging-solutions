/**
 * Constants for Box Designer
 */

import { BoxFace, BoxTemplateConfig, FluteType, PlyType } from '@/types/boxDesigner';
import { FACE_NAMES } from './styles/faceNames';
import { STYLES } from './styles/registry';

/** Style list for pickers and summaries, derived from the style registry (src/lib/boxDesigner/styles) */
export const BOX_TEMPLATES: BoxTemplateConfig[] = STYLES.map((style) => ({
  id: style.id,
  name: style.name,
  shortName: style.shortName,
  fefco: style.fefco,
  description: style.description,
  icon: style.id,
  available: true,
}));

export interface FluteSpec {
  type: FluteType;
  height: number; // mm
  spacing: number; // flutes per foot
  description: string;
}

export const FLUTE_TYPES: Record<FluteType, FluteSpec> = {
  A: { type: 'A', height: 4.8, spacing: 33, description: 'A-flute: maximum cushioning' },
  B: { type: 'B', height: 2.4, spacing: 47, description: 'B-flute: good print surface, crush resistant' },
  C: { type: 'C', height: 3.6, spacing: 39, description: 'C-flute: most common, balanced' },
  E: { type: 'E', height: 1.2, spacing: 90, description: 'E-flute: thin, excellent print quality' },
  F: { type: 'F', height: 0.8, spacing: 125, description: 'F-flute: micro-flute for premium retail' },
};

export interface PlyOption {
  id: PlyType;
  name: string;
  wall: string;
  useCase: string;
  /** Flute stacks offered for this ply (outer -> inner); the first is the default */
  flutes: FluteType[][];
}

export const PLY_OPTIONS: PlyOption[] = [
  {
    id: '3-ply',
    name: '3-Ply',
    wall: 'Single wall',
    useCase: 'Light products, e-commerce, retail',
    flutes: [['B'], ['C'], ['E']],
  },
  {
    id: '5-ply',
    name: '5-Ply',
    wall: 'Double wall',
    useCase: 'Heavier goods, stacking, export cartons',
    flutes: [['B', 'C'], ['E', 'B']],
  },
  {
    id: '7-ply',
    name: '7-Ply',
    wall: 'Triple wall',
    useCase: 'Industrial, machinery, bulk shipping',
    flutes: [['C', 'B', 'C']],
  },
];

export const DEFAULT_DIMENSIONS = {
  length: 30, // cm (inside)
  width: 20,
  height: 15,
};

export const DIMENSION_LIMITS = {
  min: 5, // cm
  max: 100, // cm
};

export const DEFAULT_PLY: PlyType = '5-ply';
export const DEFAULT_TEMPLATE: BoxTemplateConfig['id'] = 'rsc';
export const DEFAULT_FLUTE: FluteType = 'C';

export interface BoxColorConfig {
  id: string;
  name: string;
  color: string;
}

/** Board colour presets (any custom colour can also be picked) */
export const BOX_COLOR_OPTIONS: BoxColorConfig[] = [
  { id: 'kraft', name: 'Natural Kraft', color: '#C9A87C' },
  { id: 'golden', name: 'Golden Kraft', color: '#D9B77E' },
  { id: 'brown', name: 'Dark Brown', color: '#8B6F47' },
  { id: 'white', name: 'White Coated', color: '#F5F5F0' },
  { id: 'black', name: 'Matte Black', color: '#2B2B2D' },
  { id: 'red', name: 'Brick Red', color: '#A8352E' },
  { id: 'blue', name: 'Navy Blue', color: '#2E4F7F' },
  { id: 'green', name: 'Forest Green', color: '#3F6B4A' },
  { id: 'yellow', name: 'Sunflower', color: '#E3B53C' },
  { id: 'pink', name: 'Blush Pink', color: '#E6A9B8' },
];

export const DEFAULT_BOX_COLOR = BOX_COLOR_OPTIONS[0].color;

/** Human-readable surface names */
export const FACE_LABELS: Record<BoxFace, string> = FACE_NAMES;
