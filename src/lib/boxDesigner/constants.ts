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

export const PLY_OPTIONS: PlyConfig[] = [
  {
    id: '3-ply',
    name: '3-Ply (Light Duty)',
    thickness: 2.5,
    strength: 'Light duty - Up to 5kg',
    color: '#D4A574',
  },
  {
    id: '5-ply',
    name: '5-Ply (Medium Duty)',
    thickness: 4.0,
    strength: 'Medium duty - Up to 15kg',
    color: '#C89B5C',
  },
  {
    id: '7-ply',
    name: '7-Ply (Heavy Duty)',
    thickness: 6.0,
    strength: 'Heavy duty - Up to 30kg',
    color: '#B88A47',
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
