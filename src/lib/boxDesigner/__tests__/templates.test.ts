/**
 * Template validity (phase 2): every template points at a real style and real faces, uses real library stickers,
 * stays inside the size limits and survives the codec and the share link. Also search and Quick start suggestions.
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { MAX_STICKERS } from '@/types/boxDesigner';
import { loadAllCategories } from '../stickers/library';
import { SCALE_LIMITS } from '../stickers/placement';
import { DIMENSION_LIMITS, PLY_OPTIONS } from '../constants';
import { decodeShareHash, encodeShareHashDetailed, parseDesign, serializeDesign } from '../designCodec';
import { getStyle, STYLES } from '../styles/registry';
import {
  DESIGN_TEMPLATES,
  TEMPLATE_CATEGORIES,
  POPULAR_TEMPLATE_IDS,
  availableTemplates,
  designFromTemplate,
  findTemplate,
  matchTemplates,
  suggestedTemplates,
} from '../templates';

const LEGACY_IDS = [
  'ecommerce-shipper',
  'apparel-mailer',
  'subscription-box',
  'pizza-box',
  'bakery-tray',
  'wine-bottle',
  'gift-box',
  'shoe-box',
  'display-tray',
  'export-carton',
  'heavy-duty',
  'moving-box',
  'product-sleeve',
];

let libraryIds = new Set<string>();
beforeAll(async () => {
  libraryIds = new Set((await loadAllCategories()).map((s) => s.id));
});

describe('template catalogue', () => {
  it('has 40+ templates with unique ids and keeps the original ids', () => {
    expect(DESIGN_TEMPLATES.length).toBeGreaterThanOrEqual(40);
    const ids = DESIGN_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of LEGACY_IDS) expect(findTemplate(id), id).toBeDefined();
    for (const id of POPULAR_TEMPLATE_IDS) expect(findTemplate(id), id).toBeDefined();
  });

  it('every template has a known category, and every category has templates', () => {
    const known = new Set(TEMPLATE_CATEGORIES.map((c) => c.id));
    for (const t of DESIGN_TEMPLATES) expect(known.has(t.category), t.id).toBe(true);
    for (const c of TEMPLATE_CATEGORIES) expect(DESIGN_TEMPLATES.some((t) => t.category === c.id), c.id).toBe(true);
  });

  it('uses the new styles where they fit', () => {
    const used = new Set(DESIGN_TEMPLATES.map((t) => t.style));
    for (const style of ['produce', 'produce-tray', 'cake-box', 'window-mailer', 'clamshell', 'slide-box', 'book-box', 'shelf-tray', 'tuck-end', 'crash-lock', 'carry'] as const) {
      expect(used.has(style), style).toBe(true);
    }
  });

  it('has a name, a one-line blurb and no unverifiable claims', () => {
    const banned = /organic|certified|certification|fssai|iso ?\d|guarantee|award|premium|best[- ]sell|100 ?%|eco[- ]friendly/i;
    for (const t of DESIGN_TEMPLATES) {
      expect(t.name.length, t.id).toBeGreaterThan(2);
      expect(t.blurb.length, t.id).toBeGreaterThan(8);
      expect(t.blurb.includes('\n'), t.id).toBe(false);
      const words = [t.name, t.blurb, ...t.tags, ...t.texts.map((x) => x.text)].join(' | ');
      expect(banned.test(words), `${t.id}: ${words}`).toBe(false);
    }
  });
});

describe('every template is valid', () => {
  it('style exists in the registry and the size and board are within limits', () => {
    for (const t of DESIGN_TEMPLATES) {
      expect(STYLES.some((s) => s.id === t.style), `${t.id} style ${t.style}`).toBe(true);
      for (const v of [t.dimensions.length, t.dimensions.width, t.dimensions.height]) {
        expect(v, t.id).toBeGreaterThanOrEqual(DIMENSION_LIMITS.min);
        expect(v, t.id).toBeLessThanOrEqual(DIMENSION_LIMITS.max);
      }
      const ply = PLY_OPTIONS.find((p) => p.id === t.ply)!;
      expect(ply.flutes.some((f) => f.join('') === t.flutes.join('')), `${t.id} flutes ${t.flutes.join('')} for ${t.ply}`).toBe(true);
      expect(t.colorHex).toMatch(/^#[0-9a-f]{6}$/i);
      if (t.insideColorHex) expect(t.insideColorHex).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('art, text and stickers sit on faces the style has', () => {
    for (const t of DESIGN_TEMPLATES) {
      const faces = getStyle(t.style).faces;
      if (t.art) expect(faces, `${t.id} art face`).toContain(t.art.face);
      for (const text of t.texts) expect(faces, `${t.id} text on ${text.face}`).toContain(text.face);
      for (const sticker of t.stickers) expect(faces, `${t.id} sticker ${sticker.id} on ${sticker.face}`).toContain(sticker.face);
    }
  });

  it('sticker ids resolve in the library and placements are in range', () => {
    expect(libraryIds.size).toBeGreaterThan(400);
    for (const t of DESIGN_TEMPLATES) {
      expect(t.stickers.length, t.id).toBeLessThanOrEqual(6);
      for (const sticker of t.stickers) {
        expect(libraryIds.has(sticker.id), `${t.id}: unknown sticker ${sticker.id}`).toBe(true);
        expect(sticker.x).toBeGreaterThanOrEqual(0);
        expect(sticker.x).toBeLessThanOrEqual(1);
        expect(sticker.y).toBeGreaterThanOrEqual(0);
        expect(sticker.y).toBeLessThanOrEqual(1);
        expect(sticker.scale).toBeGreaterThanOrEqual(SCALE_LIMITS.min);
        expect(sticker.scale).toBeLessThanOrEqual(SCALE_LIMITS.max);
        if (sticker.tint) expect(sticker.tint).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  it('openings are only asked for on styles that can cut them', () => {
    for (const t of DESIGN_TEMPLATES) {
      const style = getStyle(t.style);
      const caps = { ...style.openings, ...style.forcedOpenings };
      if (t.options.handHoles) expect(caps.hand, `${t.id} hand holes`).toBe(true);
      if (t.options.vents) expect(caps.vents, `${t.id} vents`).toBe(true);
      if (t.options.window) expect(caps.window, `${t.id} window`).toBe(true);
      if (t.options.frontCut) expect(t.style, `${t.id} front cut`).toBe('shelf-tray');
    }
  });

  it('sample text fits its face (rough width estimate)', () => {
    for (const t of DESIGN_TEMPLATES) {
      for (const text of t.texts) {
        const faceWidth = text.face === 'left' || text.face === 'right' ? t.dimensions.width : t.dimensions.length;
        const width = text.text.length * 0.6 * text.size * 0.03528;
        expect(width, `${t.id} "${text.text}" ${text.size}pt on ${faceWidth} cm`).toBeLessThanOrEqual(faceWidth * 0.95);
        expect(text.size).toBeGreaterThanOrEqual(10);
        expect(text.size).toBeLessThanOrEqual(200);
      }
    }
  });
});

describe('designFromTemplate', () => {
  it('fills stickers and options, keeps unit and quantity', () => {
    const mango = designFromTemplate(findTemplate('mango-carton')!, { unit: 'in', quantity: 2000 });
    expect(mango.template).toBe('produce');
    expect(mango.unit).toBe('in');
    expect(mango.quantity).toBe(2000);
    expect(mango.options.vents).toBe(true);
    expect(mango.options.handHoles).toBe(true);
    expect(mango.stickers.map((s) => s.stickerId)).toContain('mango');
    expect(new Set(mango.stickers.map((s) => s.id)).size).toBe(mango.stickers.length);
    const cake = designFromTemplate(findTemplate('cake-window-box')!);
    expect(cake.options.window).toBe(true);
    expect(designFromTemplate(findTemplate('snack-counter-tray')!).options.frontCut).toBeGreaterThan(0);
  });

  it('legacy templates still build with their logo and no stickers', () => {
    const d = designFromTemplate(findTemplate('ecommerce-shipper')!);
    expect(d.faceImages).toHaveLength(1);
    expect(d.stickers).toEqual([]);
    expect(d.options.vents).toBe(false);
  });

  it('every template survives the codec and a share-link round trip', () => {
    for (const t of DESIGN_TEMPLATES) {
      const d = designFromTemplate(t, { unit: 'mm', quantity: 1200 });
      expect(d.stickers.length).toBeLessThanOrEqual(MAX_STICKERS);

      const json = parseDesign(serializeDesign(d, { includeImages: true }));
      expect(json, t.id).not.toBeNull();
      expect(json!.stickers.length, t.id).toBe(d.stickers.length);
      expect(json!.options, t.id).toEqual(d.options);

      const shared = encodeShareHashDetailed(d);
      expect(shared.droppedStickers, `${t.id} share link too long`).toBe(0);
      expect(shared.droppedTexts, t.id).toBe(0);
      const back = decodeShareHash(shared.hash);
      expect(back, t.id).not.toBeNull();
      expect(back!.template).toBe(t.style);
      expect(back!.stickers.map((s) => [s.stickerId, s.face])).toEqual(d.stickers.map((s) => [s.stickerId, s.face]));
      expect(back!.options).toEqual(d.options);
      expect(back!.textElements.length).toBe(d.textElements.length);
    }
  });
});

describe('gallery search and quick start', () => {
  it('lists every template when the style has a model', () => {
    expect(availableTemplates().length).toBe(DESIGN_TEMPLATES.length);
  });

  it('finds templates by name, tag, category and style, every word must match', () => {
    const ids = (q: string) => matchTemplates(DESIGN_TEMPLATES, q, (s) => getStyle(s).name).map((t) => t.id);
    expect(ids('mango')).toContain('mango-carton');
    expect(ids('aam')).toContain('mango-carton');
    expect(ids('cake')).toContain('cake-window-box');
    expect(ids('produce vent')).toContain('apple-tray');
    expect(ids('mailer apparel')).toContain('apparel-mailer');
    expect(ids('zzzz')).toEqual([]);
    expect(matchTemplates(DESIGN_TEMPLATES, '   ').length).toBe(DESIGN_TEMPLATES.length);
  });

  it('suggests templates of the current style first, then popular ones, without duplicates', () => {
    const forMailer = suggestedTemplates('mailer', 4);
    expect(forMailer).toHaveLength(4);
    expect(forMailer[0].style).toBe('mailer');
    expect(new Set(forMailer.map((t) => t.id)).size).toBe(4);
    const forClamshell = suggestedTemplates('clamshell', 4);
    expect(forClamshell.filter((t) => t.style === 'clamshell').length).toBeGreaterThanOrEqual(2);
    expect(suggestedTemplates('rsc', 3)[0].id).toBe('ecommerce-shipper');
    expect(suggestedTemplates('rsc', 2, [])).toEqual([]);
  });
});
