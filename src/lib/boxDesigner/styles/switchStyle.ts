/**
 * Size rule when the user switches box style: a size they never changed (still the previous style's default or the
 * app default) follows the new style's default so RSC -> pizza does not leave a deep pizza box; a size they chose is kept.
 * Pure (no three.js) so it can be tested directly.
 */

import type { BoxDimensions, BoxTemplate, DesignOptions } from '@/types/boxDesigner';
import { DEFAULT_DIMENSIONS } from '../constants';
import { getStyle } from './registry';

const same = (a: BoxDimensions, b: BoxDimensions) => a.length === b.length && a.width === b.width && a.height === b.height;

/** Dimensions to use after switching from `from` to `to`, given the current size */
export function dimensionsAfterStyleSwitch(from: BoxTemplate, to: BoxTemplate, current: BoxDimensions): BoxDimensions {
  const untouched = same(current, getStyle(from).defaultDims) || same(current, DEFAULT_DIMENSIONS);
  return untouched ? { ...getStyle(to).defaultDims } : current;
}

type OpeningOptions = Pick<DesignOptions, 'handHoles' | 'vents' | 'window'>;
const OPENING_KEYS = [
  ['handHoles', 'hand'],
  ['vents', 'vents'],
  ['window', 'window'],
] as const;

/** What an opening option means for a style when the user has not touched it (style default, or forced on) */
function untouchedValue(style: BoxTemplate, key: keyof OpeningOptions, cap: 'hand' | 'vents' | 'window'): boolean {
  const def = getStyle(style);
  if (!def.openings?.[cap]) return false;
  return !!def.forcedOpenings?.[cap] || !!def.openingDefaults?.[key];
}

/**
 * Opening options after switching style: an option the new style cannot cut is switched off; one the user never
 * changed (still the old style's default) follows the new style's default (carry box -> hand holes on);
 * one they chose is kept. Other option fields (windowRatio, frontCut) pass through.
 */
export function optionsAfterStyleSwitch(from: BoxTemplate, to: BoxTemplate, current: DesignOptions): DesignOptions {
  const next: DesignOptions = { ...current };
  const target = getStyle(to);
  for (const [key, cap] of OPENING_KEYS) {
    if (!target.openings?.[cap]) next[key] = false;
    else if (current[key] === untouchedValue(from, key, cap)) next[key] = untouchedValue(to, key, cap);
  }
  return next;
}
