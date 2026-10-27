/**
 * Every registered style works across the designer surfaces that read the registry (picker, landing pages, embed,
 * estimate, spec sheet, lead form, blank size) and the style picker's filtering rules (search aliases, packing chips).
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { STYLES, STYLE_GROUPS, getStyle, getStyleGroup } from '../styles/registry';
import { blankSizeForDesign, faceSizesForDesign } from '../styles/designLayout';
import { DEFAULT_DESIGN } from '../designCodec';
import { DIMENSION_LIMITS } from '../constants';
import { DESIGNER_STYLES, styleName as leadStyleName } from '../../designerLeadSchema';
import { ALL_LANDINGS, availableLandings, findLanding, landingDesignerHref } from '@/content/designerLandings';
import { NO_LANDING_REASONS } from '@/content/designerLandingsPhase2';
import { parseEmbedParams } from '../embed';
import { estimatePrice } from '../pricing';
import { buildSpecSheetData } from '../specSheet';
import { jobTypeOf } from '../delivery';
import { designFromPresetParams, presetQuery } from '../landingPreset';
import { findTemplate } from '../templates';
import {
  NO_FILTER,
  PACKING_CHIPS,
  PICKER_GROUPS,
  POPULAR_STYLE_IDS,
  filterStyles,
  groupStyles,
  matchesQuery,
  optionHints,
} from '../styles/picker';
import type { BoxDesign, BoxTemplate } from '@/types/boxDesigner';

const design = (template: BoxTemplate): BoxDesign => ({ ...DEFAULT_DESIGN, template, dimensions: { ...getStyle(template).defaultDims } });
const ids = (list: readonly { id: string }[]) => list.map((s) => s.id);

describe('every style is complete', () => {
  it('has 20 styles', () => {
    expect(STYLES.length).toBe(20);
  });

  for (const style of STYLES) {
    describe(style.id, () => {
      it('has a group, an icon, names, best-for text and fold stops from flat to closed', () => {
        expect(STYLE_GROUPS).toContain(getStyleGroup(style));
        expect(style.iconPath.length).toBeGreaterThan(10);
        expect(style.name.length).toBeGreaterThan(2);
        expect(style.shortName.length).toBeGreaterThan(0);
        expect(style.bestFor.length).toBeGreaterThan(5);
        expect(style.foldStops[0].value).toBe(0);
        expect(style.foldStops[style.foldStops.length - 1].value).toBe(100);
      });

      it('has a name in the lead schema', () => {
        expect(DESIGNER_STYLES).toContain(style.id);
        expect(leadStyleName(style.id as (typeof DESIGNER_STYLES)[number])).not.toBe(style.id);
      });

      it('has a blank size and a size for every printable face', () => {
        const d = design(style.id);
        const blank = blankSizeForDesign(d);
        expect(blank.areaM2).toBeGreaterThan(0);
        expect(blank.lengthCm).toBeGreaterThan(0);
        const faces = faceSizesForDesign(d);
        for (const face of style.faces) {
          expect(faces[face], `${style.id} ${face}`).toBeDefined();
          expect(faces[face]!.widthCm).toBeGreaterThan(0);
          expect(faces[face]!.heightCm).toBeGreaterThan(0);
        }
      });

      it('has a landing page or an explicit reason', () => {
        const landed = ALL_LANDINGS.some((l) => l.style === style.id);
        expect(landed || !!NO_LANDING_REASONS[style.id], `${style.id} needs a landing page or a reason`).toBe(true);
        if (landed) expect(NO_LANDING_REASONS[style.id]).toBeUndefined();
      });

      it('opens in the embed with its own default size and options', () => {
        const parsed = parseEmbedParams(`?style=${style.id}`);
        expect(parsed.template).toBe(style.id);
        expect(parsed.dimensions).toEqual(style.defaultDims);
        if (style.openingDefaults?.handHoles && style.openings?.hand) expect(parsed.options.handHoles).toBe(true);
        if (style.forcedOpenings?.window) expect(parsed.options.window).toBe(true);
      });

      it('prices, builds a spec sheet and has a delivery job type', () => {
        const d = design(style.id);
        const est = estimatePrice({ ...d, quantity: 500 });
        expect(Number.isFinite(est.perBox) && est.perBox > 0).toBe(true);
        const sheet = buildSpecSheetData(d);
        expect(sheet.rows.length).toBeGreaterThan(3);
        expect(sheet.rows.find((r) => r.label === 'Style')?.value).toContain(style.name);
        expect(jobTypeOf(d)).toBe(['diecut', 'slide'].includes(style.rigKind) ? 'dieCut' : 'plain');
      });

      it('is found by its own name in the picker', () => {
        expect(filterStyles({ ...NO_FILTER, query: style.shortName }).map((s) => s.id)).toContain(style.id);
      });
    });
  }
});

describe('style picker', () => {
  it('lists every style once across the group tabs', () => {
    expect(PICKER_GROUPS[0]).toBe('All');
    const all = filterStyles(NO_FILTER);
    expect(all.length).toBe(STYLES.length);
    const byGroup = PICKER_GROUPS.slice(1).flatMap((g) => filterStyles({ ...NO_FILTER, group: g }));
    expect(ids(byGroup).sort()).toEqual(ids(STYLES).sort());
    expect(groupStyles(all).reduce((n, g) => n + g.styles.length, 0)).toBe(STYLES.length);
  });

  it('popular styles exist and are unique', () => {
    expect(new Set(POPULAR_STYLE_IDS).size).toBe(POPULAR_STYLE_IDS.length);
    for (const id of POPULAR_STYLE_IDS) expect(STYLES.some((s) => s.id === id)).toBe(true);
  });

  it('finds styles by everyday words', () => {
    const find = (query: string) => ids(filterStyles({ ...NO_FILTER, query }));
    expect(find('cake')).toContain('cake-box');
    expect(find('mango')).toContain('produce');
    expect(find('shoe')).toContain('telescope');
    expect(find('mailer')).toEqual(expect.arrayContaining(['mailer', 'window-mailer']));
    expect(find('MANGOES')).toContain('produce');
    expect(find('zzzzzz')).toEqual([]);
    expect(matchesQuery(getStyle('rsc'), '')).toBe(true);
  });

  it('packing chips only list real styles, best first, and combine with the group tab', () => {
    expect(PACKING_CHIPS.map((c) => c.id)).toEqual(['fruits', 'cake', 'clothes', 'shoes', 'cosmetics', 'gifts', 'electronics', 'bottles', 'books']);
    for (const chip of PACKING_CHIPS) {
      for (const id of chip.styles) expect(STYLES.some((s) => s.id === id), `${chip.id} ${id}`).toBe(true);
      expect(ids(filterStyles({ ...NO_FILTER, packing: chip.id }))).toEqual([...chip.styles]);
    }
    expect(ids(filterStyles({ group: 'Fruit & produce', query: '', packing: 'fruits' }))).toEqual(['produce', 'produce-tray']);
    const display = filterStyles({ group: 'Display', query: '', packing: 'fruits' });
    expect(display.every((st) => getStyleGroup(st) === 'Display')).toBe(true);
    expect(display.every((st) => PACKING_CHIPS[0].styles.includes(st.id))).toBe(true);
    expect(filterStyles({ group: 'Shipping', query: 'cake', packing: 'fruits' })).toEqual([]);
  });

  it('shows an options hint for styles with cut-outs', () => {
    expect(optionHints(getStyle('produce'))).toEqual(expect.arrayContaining(['Vents', 'Hand holes']));
    expect(optionHints(getStyle('cake-box'))).toContain('Window included');
    expect(optionHints(getStyle('carry'))).toContain('Hand holes');
    expect(optionHints(getStyle('rsc'))).toEqual([]);
  });
});

describe('landing pages', () => {
  it('has unique slugs, three FAQs and three benefits on every new page, and resolvable related pages', () => {
    const slugs = ALL_LANDINGS.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const fresh = ALL_LANDINGS.filter((l) => !l.templateId);
    expect(fresh.length).toBe(10);
    for (const l of fresh) {
      expect(l.faqs.length, l.slug).toBe(3);
      expect(l.benefits?.length, l.slug).toBe(3);
      expect(l.bestFor.length, l.slug).toBeGreaterThanOrEqual(3);
      expect(l.sizes.length, l.slug).toBe(3);
      expect(l.metaTitle.length, l.slug).toBeLessThanOrEqual(70);
      expect(l.metaDescription.length, l.slug).toBeLessThanOrEqual(175);
      expect(l.related?.length ?? 0, l.slug).toBeGreaterThan(0);
      expect(l.preset?.style, l.slug).toBe(l.style);
    }
    for (const l of ALL_LANDINGS) for (const r of l.related ?? []) expect(slugs, `${l.slug} -> ${r}`).toContain(r);
  });

  it('routes every landing and keeps the old slugs', () => {
    expect(availableLandings().length).toBe(ALL_LANDINGS.length);
    for (const old of ['shipping-carton', 'mailer-box', 'pizza-box', 'shoe-box', 'gift-box', 'bakery-box', 'heavy-duty-box', 'box-sleeve']) {
      expect(findLanding(old), old).toBeDefined();
    }
    for (const l of ALL_LANDINGS) if (l.templateId) expect(findTemplate(l.templateId)?.style, l.slug).toBe(l.style);
  });

  it('opens the designer with a preset that round-trips and stays inside the limits', () => {
    for (const l of ALL_LANDINGS.filter((x) => x.preset)) {
      const preset = l.preset!;
      const href = landingDesignerHref(l);
      expect(href.startsWith('/box-designer?style=')).toBe(true);
      const built = designFromPresetParams(presetQuery(preset), DEFAULT_DESIGN)!;
      expect(built.template).toBe(preset.style);
      expect(built.dimensions).toEqual(preset.dims);
      expect(built.ply).toBe(preset.ply);
      expect(built.flutes).toEqual(preset.flutes);
      for (const key of preset.options ?? []) expect(built.options[key], `${l.slug} ${key}`).toBe(true);
      // typical-size links keep the preset and swap the size
      for (const s of l.sizes) {
        for (const v of [s.dims.length, s.dims.width, s.dims.height]) expect(v, `${l.slug} ${s.label}`).toBeGreaterThanOrEqual(DIMENSION_LIMITS.min);
        const sized = designFromPresetParams(new URLSearchParams(landingDesignerHref(l, s.dims).split('?')[1]), DEFAULT_DESIGN)!;
        expect(sized.dimensions).toEqual(s.dims);
        expect(sized.template).toBe(l.style);
      }
    }
  });

  it('ignores bad preset values', () => {
    expect(designFromPresetParams(new URLSearchParams('style=nope'), DEFAULT_DESIGN)).toBeNull();
    expect(designFromPresetParams(new URLSearchParams(''), DEFAULT_DESIGN)).toBeNull();
    const d = designFromPresetParams(new URLSearchParams('style=carry&l=99999&w=abc&h=-1&ply=9-ply&fl=ZZ&col=notacolour&opt=window,evil&wr=5'), DEFAULT_DESIGN)!;
    expect(d.template).toBe('carry');
    expect(d.dimensions).toEqual(getStyle('carry').defaultDims);
    expect(d.ply).toBe(DEFAULT_DESIGN.ply);
    expect(d.colorHex).toBe(DEFAULT_DESIGN.colorHex);
    expect(d.options.window).toBe(false); // a carry box cannot cut a window
    expect(d.options.windowRatio).toBe(DEFAULT_DESIGN.options.windowRatio);
    expect(d.options.handHoles).toBe(true); // the style's own default
  });

  it('is listed in the sitemap and has a share card', () => {
    const root = process.cwd();
    const sitemap = fs.readFileSync(path.join(root, 'public/sitemap.xml'), 'utf8');
    for (const l of ALL_LANDINGS) {
      expect(sitemap, l.slug).toContain(`<loc>https://vayupackaging.vercel.app/box-designer/${l.slug}</loc>`);
      expect(fs.existsSync(path.join(root, `public/og/box-designer-${l.slug}.png`)), `og ${l.slug}`).toBe(true);
    }
  });
});
