/**
 * Size rule when the user switches box style: a size they never changed (still the previous style's default or the
 * app default) follows the new style's default so RSC -> pizza does not leave a deep pizza box; a size they chose is kept.
 * Pure (no three.js) so it can be tested directly.
 */

import type { BoxDimensions, BoxTemplate } from '@/types/boxDesigner';
import { DEFAULT_DIMENSIONS } from '../constants';
import { getStyle } from './registry';

const same = (a: BoxDimensions, b: BoxDimensions) => a.length === b.length && a.width === b.width && a.height === b.height;

/** Dimensions to use after switching from `from` to `to`, given the current size */
export function dimensionsAfterStyleSwitch(from: BoxTemplate, to: BoxTemplate, current: BoxDimensions): BoxDimensions {
  const untouched = same(current, getStyle(from).defaultDims) || same(current, DEFAULT_DIMENSIONS);
  return untouched ? { ...getStyle(to).defaultDims } : current;
}
