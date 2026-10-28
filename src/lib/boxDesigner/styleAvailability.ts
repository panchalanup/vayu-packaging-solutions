/**
 * Which box styles have a working 3D model.
 * Templates, the guided wizard, landing pages and the embed only offer styles that can be shown in 3D, so they all
 * ask here instead of hard-coding style ids. Derived from the style registry (every registered style has a model).
 */

import type { BoxTemplate } from '@/types/boxDesigner';
import { STYLES, getStyle } from './styles/registry';

export function hasStyleModel(style: BoxTemplate): boolean {
  return STYLES.some((s) => s.id === style);
}

export function modelledStyles(): BoxTemplate[] {
  return STYLES.map((s) => s.id);
}

export function styleName(style: BoxTemplate): string {
  return STYLES.some((s) => s.id === style) ? getStyle(style).shortName : String(style).toUpperCase();
}
