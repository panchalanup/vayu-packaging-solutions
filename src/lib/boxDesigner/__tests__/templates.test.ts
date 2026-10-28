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
import { getLayoutOpenings, getStyle, STYLES } from '../styles/registry';
import { faceSizesForDesign, layoutForDesign } from '../styles/designLayout';
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

  it('sample text and stickers keep clear of the handling marks (bottom right of the front)', () => {
    const PT = 0.03528;
    for (const t of DESIGN_TEMPLATES.filter((x) => x.showIcons)) {
      const { length: W, height: H } = t.dimensions;
      // same geometry as drawShippingIcons in textures/printLayer.ts
      const margin = 0.9;
      const gap = 0.25;
      const size = Math.min(3.6, H * 0.26, (W * 0.5 - 2 * gap) / 3);
      const total = 3 * size + 2 * gap;
      const mark = { x0: W - margin - total, x1: W - margin, y0: H - margin - size, y1: H - margin };
      const clear = (x0: number, x1: number, y0: number, y1: number) => x1 <= mark.x0 || x0 >= mark.x1 || y1 <= mark.y0 || y0 >= mark.y1;
      for (const text of t.texts.filter((x) => x.face === 'front')) {
        const w = Math.max(...text.text.split('\n').map((l) => l.length)) * 0.6 * text.size * PT;
        const h = text.size * PT * 1.2 * text.text.split('\n').length;
        const cx = text.position.x * W;
        const cy = text.position.y * H;
        expect(clear(cx - w / 2, cx + w / 2, cy - h / 2, cy + h / 2), `${t.id} text "${text.text}" overlaps the handling marks`).toBe(true);
      }
      for (const st of t.stickers.filter((x) => x.face === 'front')) {
        const half = (st.scale * Math.min(W, H)) / 2;
        const cx = st.x * W;
        const cy = st.y * H;
        expect(clear(cx - half, cx + half, cy - half, cy + half), `${t.id} sticker ${st.id} overlaps the handling marks`).toBe(true);
      }
    }
  });

  it('sample text and stickers sit inside the real printable face and clear of cut-outs', () => {
    const PT = 0.03528;
    const problems: string[] = [];
    // wide, thin artwork (dividers, ribbons) is not square: only check it by its centre
    const WIDE = /divider|ribbon|banner|stripe|border|frame/;
    type Box = { cx: number; cy: number; w: number; h: number };
    const outside = (face: { widthCm: number; heightCm: number }, b: Box) =>
      b.cx - b.w / 2 < -0.05 || b.cx + b.w / 2 > face.widthCm + 0.05 || b.cy - b.h / 2 < -0.05 || b.cy + b.h / 2 > face.heightCm + 0.05;
    const hits = (a: Box, o: Box) => Math.abs(a.cx - o.cx) < (a.w + o.w) / 2 && Math.abs(a.cy - o.cy) < (a.h + o.h) / 2;
    for (const t of DESIGN_TEMPLATES) {
      const design = designFromTemplate(t);
      const sizes = faceSizesForDesign(design);
      const openings = getLayoutOpenings(layoutForDesign(design));
      const items: { label: string; face: NonNullable<(typeof t.stickers)[number]['face']>; box: Box; checkEdges: boolean; fill: number }[] = [];
      for (const st of t.stickers) {
        const f = sizes[st.face];
        if (!f) {
          problems.push(`${t.id}: no ${st.face} face`);
          continue;
        }
        const side = st.scale * Math.min(f.widthCm, f.heightCm);
        items.push({ label: `${t.id} sticker ${st.id}`, face: st.face, box: { cx: st.x * f.widthCm, cy: st.y * f.heightCm, w: side, h: side }, checkEdges: !WIDE.test(st.id), fill: 0.75 });
      }
      for (const tx of t.texts) {
        const f = sizes[tx.face];
        if (!f) continue;
        const lines = tx.text.split('\n');
        const w = Math.max(...lines.map((l) => l.length)) * 0.6 * tx.size * PT;
        const h = tx.size * PT * 1.2 * lines.length;
        items.push({ label: `${t.id} text "${tx.text}"`, face: tx.face, box: { cx: tx.position.x * f.widthCm, cy: tx.position.y * f.heightCm, w, h }, checkEdges: true, fill: 1 });
      }
      for (const it of items) {
        const f = sizes[it.face]!;
        if (it.checkEdges && outside(f, it.box)) problems.push(`${it.label} (${it.face}) spills over the edge of a ${f.widthCm.toFixed(1)} x ${f.heightCm.toFixed(1)} cm face`);
        // openings are measured from the panel centre, +y up; artwork y runs down
        for (const o of openings[it.face] ?? []) {
          const ob: Box = { cx: f.widthCm / 2 + o.cx, cy: f.heightCm / 2 - o.cy, w: o.width, h: o.height };
          if (hits({ ...it.box, w: it.box.w * it.fill, h: it.box.h * it.fill }, ob)) problems.push(`${it.label} (${it.face}) overlaps a ${o.kind} cut-out`);
        }
      }
    }
    expect(problems).toEqual([]);
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
