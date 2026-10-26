/**
 * Embed (#37): parse the iframe query string (?style=&l=&w=&h=, cm) into a starting design.
 * SECURITY: untrusted input; style is an enum of modelled styles and sizes are range-checked numbers.
 */

import { z } from 'zod';
import type { BoxDesign, BoxTemplate } from '@/types/boxDesigner';
import { DEFAULT_DESIGN } from './designCodec';
import { DIMENSION_LIMITS } from './constants';
import { getStyle } from './styles';
import { modelledStyles } from './styleAvailability';

const dim = z.coerce.number().finite().min(DIMENSION_LIMITS.min).max(DIMENSION_LIMITS.max);

/** Pure: parse the embed query string into a starting design (bad values fall back to defaults) */
export function parseEmbedParams(search: string): BoxDesign {
  const params = new URLSearchParams(search);
  const styles = modelledStyles();
  const styleParsed = z.enum(styles as [BoxTemplate, ...BoxTemplate[]]).safeParse(params.get('style'));
  const style = styleParsed.success ? styleParsed.data : DEFAULT_DESIGN.template;
  const defaults = getStyle(style).defaultDims;
  const read = (key: string, fallback: number) => {
    const r = dim.safeParse(params.get(key) ?? undefined);
    return r.success ? Math.round(r.data * 10) / 10 : fallback;
  };
  return {
    ...DEFAULT_DESIGN,
    template: style,
    dimensions: { length: read('l', defaults.length), width: read('w', defaults.width), height: read('h', defaults.height) },
    // The site's own designer settles board; the embed keeps a sensible default
    ply: style === 'mailer' || style === 'pizza' || style === 'tray' ? '3-ply' : DEFAULT_DESIGN.ply,
    flutes: style === 'mailer' || style === 'pizza' || style === 'tray' ? ['E'] : DEFAULT_DESIGN.flutes,
  };
}

