/**
 * Landing-page presets: a style landing page opens the designer with a starting design (style, inside size, board,
 * colour, cut-out options) carried in the query string: ?style=cake-box&l=28&w=22&h=7&ply=3-ply&fl=E&opt=window&col=ffffff
 * SECURITY: the query is untrusted input; every value is an enum or a range-checked number, anything else is ignored.
 * Pure (no React), tested in __tests__/designerStyles.test.ts.
 */

import { z } from 'zod';
import type { BoxDesign, BoxDimensions, DesignOptions, FluteType, PlyType } from '@/types/boxDesigner';
import { DIMENSION_LIMITS } from './constants';
import { DESIGNER_STYLES } from '@/lib/designerLeadSchema';
import { getStyle, getStyleGroup } from './styles/registry';
import { optionsAfterStyleSwitch } from './styles/switchStyle';

type OptionKey = 'handHoles' | 'vents' | 'window';

export interface LandingPreset {
  style: BoxDesign['template'];
  dims: BoxDimensions;
  ply: PlyType;
  flutes: FluteType[];
  /** Board colour (#rrggbb); the designer default when left out */
  colorHex?: string;
  /** Cut-outs to switch on (a style can only cut what it offers) */
  options?: OptionKey[];
  /** Window size as a share of the panel (0.2-0.9) */
  windowRatio?: number;
}

const PLIES: Record<string, { ply: PlyType; flutes: number }> = {
  '3-ply': { ply: '3-ply', flutes: 1 },
  '5-ply': { ply: '5-ply', flutes: 2 },
  '7-ply': { ply: '7-ply', flutes: 3 },
};
const OPTION_KEYS: OptionKey[] = ['handHoles', 'vents', 'window'];
const dim = z.coerce.number().finite().min(DIMENSION_LIMITS.min).max(DIMENSION_LIMITS.max);

/** Query string for a preset, optionally at another size (cm) */
export function presetQuery(preset: LandingPreset, dims: BoxDimensions = preset.dims): URLSearchParams {
  const q = new URLSearchParams({ style: preset.style, l: String(dims.length), w: String(dims.width), h: String(dims.height), ply: preset.ply, fl: preset.flutes.join('') });
  if (preset.colorHex) q.set('col', preset.colorHex.replace('#', ''));
  if (preset.options?.length) q.set('opt', preset.options.join(','));
  if (preset.windowRatio) q.set('wr', String(preset.windowRatio));
  return q;
}

/** A design from preset query params on top of `base`; null when there is no (valid) `style` param */
export function designFromPresetParams(params: URLSearchParams, base: BoxDesign): BoxDesign | null {
  const styleParsed = z.enum(DESIGNER_STYLES).safeParse(params.get('style'));
  if (!styleParsed.success) return null;
  const style = styleParsed.data;
  const def = getStyle(style);
  const read = (key: string, fallback: number) => {
    const r = dim.safeParse(params.get(key) ?? undefined);
    return r.success ? Math.round(r.data * 10) / 10 : fallback;
  };
  const dimensions: BoxDimensions = {
    length: read('l', def.defaultDims.length),
    width: read('w', def.defaultDims.width),
    height: read('h', def.defaultDims.height),
  };
  const plyInfo = PLIES[params.get('ply') ?? ''];
  const fl = params.get('fl') ?? '';
  const flutesOk = !!plyInfo && /^[ABCEF]+$/.test(fl) && fl.length === plyInfo.flutes;
  const col = params.get('col') ?? '';
  const asked = new Set((params.get('opt') ?? '').split(',').filter((k): k is OptionKey => (OPTION_KEYS as string[]).includes(k)));
  // Start from the style's own defaults (hand holes on a carry box...), then add what the preset asks for
  const options: DesignOptions = optionsAfterStyleSwitch(base.template, style, base.options);
  // only cut-outs the style offers (a carry box has no window)
  const CAP: Record<OptionKey, 'hand' | 'vents' | 'window'> = { handHoles: 'hand', vents: 'vents', window: 'window' };
  for (const key of OPTION_KEYS) if (asked.has(key) && def.openings?.[CAP[key]]) options[key] = true;
  const wr = Number(params.get('wr'));
  if (Number.isFinite(wr) && wr >= 0.2 && wr <= 0.9) options.windowRatio = wr;
  // Handling marks (glass, this side up, keep dry) belong on shipping and produce cartons, not on a cake box or a gift box
  const showIcons = ['Shipping', 'Fruit & produce'].includes(getStyleGroup(def));
  const next: BoxDesign = { ...base, template: style, dimensions, options, showIcons };
  if (plyInfo && flutesOk) {
    next.ply = plyInfo.ply;
    next.flutes = fl.split('') as FluteType[];
  }
  if (/^[0-9a-f]{6}$/i.test(col)) next.colorHex = `#${col}`;
  return next;
}
