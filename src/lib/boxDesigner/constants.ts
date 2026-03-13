/**
 * Constants for Box Designer
 */

import { BoxTemplateConfig, PlyConfig } from '@/types/boxDesigner';

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

export type FluteType = 'A' | 'B' | 'C' | 'E';

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
};

export const PLY_OPTIONS: PlyConfig[] = [
  {
    id: '3-ply',
    name: '3-Ply (Light Duty)',
    thickness: 2.5,
    strength: 'Light duty - Up to 5kg',
    color: '#D4A574',
    fluteType: 'E',
    roughness: 0.8,
    metalness: 0.05,
  },
  {
    id: '5-ply',
    name: '5-Ply (Medium Duty)',
    thickness: 4.0,
    strength: 'Medium duty - Up to 15kg',
    color: '#C89B5C',
    fluteType: 'C',
    roughness: 0.75,
    metalness: 0.08,
  },
  {
    id: '7-ply',
    name: '7-Ply (Heavy Duty)',
    thickness: 6.0,
    strength: 'Heavy duty - Up to 30kg',
    color: '#B88A47',
    fluteType: 'B',
    roughness: 0.7,
    metalness: 0.1,
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
