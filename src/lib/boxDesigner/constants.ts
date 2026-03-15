/**
 * Constants for Box Designer
 */

import { BoxTemplateConfig, PlyConfig, BoxColor, FluteType } from '@/types/boxDesigner';

export const BOX_TEMPLATES: BoxTemplateConfig[] = [
  {
    id: 'rsc',
    name: 'Regular Slotted Container (RSC)',
    description: 'Most common box style for general packaging',
    icon: 'Box',
  },
  {
    id: 'hsc',
    name: 'Half Slotted Container (HSC)',
    description: 'Open-top design, ideal for display',
    icon: 'PackageOpen',
  },
  {
    id: 'die-cut',
    name: 'Die-Cut Box',
    description: 'Custom shapes and designs',
    icon: 'Scissors',
  },
  {
    id: 'mailer',
    name: 'Mailer Box',
    description: 'Self-locking design for e-commerce',
    icon: 'Mail',
  },
];

export interface FluteSpec {
  type: FluteType;
  height: number;  // mm
  spacing: number; // flutes per foot
  description: string;
}

export const FLUTE_TYPES: Record<FluteType, FluteSpec> = {
  'A': {
    type: 'A',
    height: 4.8,
    spacing: 33,
    description: 'A-flute: Excellent cushioning, good stacking strength',
  },
  'B': {
    type: 'B',
    height: 2.4,
    spacing: 47,
    description: 'B-flute: Good printing surface, space-efficient',
  },
  'C': {
    type: 'C',
    height: 3.6,
    spacing: 39,
    description: 'C-flute: Most common, balanced performance',
  },
  'E': {
    type: 'E',
    height: 1.2,
    spacing: 90,
    description: 'E-flute: Thin profile, excellent print quality',
  },
  'F': {
    type: 'F',
    height: 0.8,
    spacing: 125,
    description: 'F-flute: Ultra-thin micro-flute, premium packaging',
  },
};

export const PLY_OPTIONS: PlyConfig[] = [
  {
    id: '3-ply',
    name: '3-Ply (Light Duty)',
    thickness: 2.5,
    strength: 'Light duty - Up to 5kg',
    color: '#D4B896',  // Light warm tan - matches screenshot
    fluteType: 'E',
    roughness: 0.92,  // Very matte, no shine
    metalness: 0.0,   // Cardboard has no metallic properties
  },
  {
    id: '5-ply',
    name: '5-Ply (Medium Duty)',
    thickness: 4.0,
    strength: 'Medium duty - Up to 15kg',
    color: '#C9A87C',  // Perfect kraft tan from screenshot
    fluteType: 'C',
    roughness: 0.93,  // Very matte cardboard finish
    metalness: 0.0,   // No metallic shine
  },
  {
    id: '7-ply',
    name: '7-Ply (Heavy Duty)',
    thickness: 6.0,
    strength: 'Heavy duty - Up to 30kg',
    color: '#B89968',  // Darker kraft but still natural
    fluteType: 'B',
    roughness: 0.95,  // Roughest surface for heavy-duty cardboard
    metalness: 0.0,   // No metallic properties
  },
];

export const DEFAULT_DIMENSIONS = {
  length: 30,  // cm
  width: 20,   // cm
  height: 15,  // cm
};

export const DIMENSION_LIMITS = {
  min: 5,    // cm
  max: 100,  // cm
};

export const DEFAULT_PLY: PlyConfig['id'] = '5-ply';

export const DEFAULT_TEMPLATE: BoxTemplateConfig['id'] = 'rsc';

export const DEFAULT_FLUTE: FluteType = 'C';

export interface BoxColorConfig {
  id: BoxColor;
  name: string;
  description: string;
  color: string;
}

export const BOX_COLOR_OPTIONS: BoxColorConfig[] = [
  {
    id: 'kraft',
    name: 'Natural Kraft',
    description: 'Classic brown cardboard finish',
    color: '#C9A87C',
  },
  {
    id: 'white',
    name: 'White Coated',
    description: 'Bright white for premium look',
    color: '#F5F5F0',
  },
  {
    id: 'brown',
    name: 'Dark Brown',
    description: 'Rich brown kraft paper',
    color: '#8B6F47',
  },
];

export const DEFAULT_BOX_COLOR: BoxColor = 'kraft';
