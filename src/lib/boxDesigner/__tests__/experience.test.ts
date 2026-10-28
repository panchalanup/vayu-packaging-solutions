/**
 * Workstream C pure logic: onboarding, guided wizard, templates, print checks, brand kit, my designs,
 * spec sheet data, studio helpers, embed params and landing pages.
 */

import { describe, expect, it } from 'vitest';
import type { BoxDesign } from '@/types/boxDesigner';
import { DEFAULT_DESIGN, parseDesign, serializeDesign } from '../designCodec';
import { memoryStore } from '../localStore';
import { ONBOARDING_KEY, ONBOARDING_STEPS, advanceOnboarding, hasSeenOnboarding, markOnboardingSeen } from '../onboarding';
import { recommendBox, TYPICAL_PRODUCT_SIZE, type WizardAnswers } from '../wizard';
import { availableTemplates, designFromTemplate, DESIGN_TEMPLATES, findTemplate } from '../templates';
import { contrastRatio, imagePrintSize, runPrintChecks } from '../printChecks';
import {
  addBrandColour,
  loadBrandKit,
  loadRecentColours,
  normaliseHex,
  parseColourInput,
  pushRecentColour,
  saveBrandKit,
  BRAND_KIT_KEY,
  MAX_RECENT_COLOURS,
} from '../brandKit';
import { deleteDesign, duplicateDesign, listDesigns, loadVersion, MAX_VERSIONS, MY_DESIGNS_KEY, renameDesign, saveDesign } from '../myDesigns';
import { buildSpecSheetData, designReference } from '../specSheet';
import {
  embedSnippet,
  loadQualityPref,
  palletLayout,
  pickVideoMime,
  qualityToTier,
  saveQualityPref,
  shotPixelRatio,
  stackPlacements,
  MAX_PALLET_BOXES,
  PALLET,
} from '../studio';
import { parseEmbedParams } from '../embed';
import { ALL_LANDINGS, availableLandings, DESIGNER_LANDINGS, findLanding, landingDesignerHref } from '@/content/designerLandings';
import { STYLES } from '../styles';

const design = (patch: Partial<BoxDesign> = {}): BoxDesign => ({ ...DEFAULT_DESIGN, ...patch });

describe('onboarding', () => {
  it('shows once and is remembered', () => {
    const store = memoryStore();
    expect(hasSeenOnboarding(store)).toBe(false);
    markOnboardingSeen('skipped', store);
    expect(hasSeenOnboarding(store)).toBe(true);
    expect(store.getItem(ONBOARDING_KEY)).toBe('skipped');
  });

  it('treats missing storage as seen (never nags)', () => {
    expect(hasSeenOnboarding(null)).toBe(true);
  });

  it('advances on next or on the matching action only', () => {
    expect(advanceOnboarding(0, 'face')).toBe(0);
    expect(advanceOnboarding(0, 'rotate')).toBe(1);
    expect(advanceOnboarding(1, 'next')).toBe(2);
    expect(advanceOnboarding(ONBOARDING_STEPS.length - 1, 'next')).toBeNull();
  });
});

describe('guided wizard', () => {
  const base: WizardAnswers = { product: 'apparel', weightKg: 1, fragility: 'sturdy', shipping: 'courier', productSize: null };
  const all = () => true;

  it('recommends a mailer for light e-commerce apparel', () => {
    const rec = recommendBox(base, all);
    expect(rec.template).toBe('mailer');
    expect(rec.ply).toBe('3-ply');
    expect(rec.flutes).toEqual(['E']);
    expect(rec.reasons.length).toBeGreaterThanOrEqual(3);
  });

  it('falls back to RSC when the preferred style has no model', () => {
    expect(recommendBox(base, (s) => s === 'rsc').template).toBe('rsc');
  });

  it('steps the board up for export and picks heavy styles for heavy goods', () => {
    const rec = recommendBox({ ...base, product: 'industrial', weightKg: 30, shipping: 'export' }, all);
    expect(rec.ply).toBe('7-ply');
    expect(['fol', 'rsc']).toContain(rec.template);
    expect(rec.flutes).toEqual(['C', 'B', 'C']);
  });

  it('pizza gets a pizza box; fragile goods get more padding', () => {
    expect(recommendBox({ ...base, product: 'pizza' }, all).template).toBe('pizza');
    const sturdy = recommendBox({ ...base, product: 'electronics', shipping: 'local' }, all);
    const fragile = recommendBox({ ...base, product: 'electronics', shipping: 'local', fragility: 'fragile' }, all);
    expect(fragile.paddingCm).toBeGreaterThan(sturdy.paddingCm);
    expect(fragile.dimensions.length).toBeGreaterThan(sturdy.dimensions.length);
  });

  it('fits the box around a given product size (length ≥ width, inside > product)', () => {
    const rec = recommendBox({ ...base, productSize: { length: 10, width: 25, height: 8 } }, all);
    expect(rec.dimensions.length).toBeGreaterThanOrEqual(rec.dimensions.width);
    expect(rec.dimensions.length).toBeGreaterThan(25);
    expect(rec.dimensions.height).toBeGreaterThan(8);
  });

  it('never recommends a die-cut style at 7-ply', () => {
    const rec = recommendBox({ ...base, product: 'pizza', weightKg: 35 }, all);
    expect(rec.ply === '7-ply' && ['mailer', 'pizza', 'tray'].includes(rec.template)).toBe(false);
  });

  it('has a typical size for every product', () => {
    for (const size of Object.values(TYPICAL_PRODUCT_SIZE)) expect(size.length).toBeGreaterThan(0);
  });
});

describe('templates', () => {
  it('only lists templates whose style has a model', () => {
    expect(availableTemplates((s) => s === 'rsc').every((t) => t.style === 'rsc')).toBe(true);
    expect(availableTemplates().length).toBe(DESIGN_TEMPLATES.length);
  });

  it('every template builds a valid design that survives the codec, with art on a face of its style', () => {
    for (const t of DESIGN_TEMPLATES) {
      const d = designFromTemplate(t, { unit: 'in', quantity: 1000 });
      expect(d.unit).toBe('in');
      expect(d.quantity).toBe(1000);
      const round = parseDesign(serializeDesign(d, { includeImages: true }));
      expect(round, t.id).not.toBeNull();
      expect(round!.faceImages.length).toBe(t.art ? 1 : 0);
      const faces = STYLES.find((s) => s.id === t.style)!.faces;
      for (const img of d.faceImages) expect(faces, t.id).toContain(img.face);
      for (const text of d.textElements) expect(faces, t.id).toContain(text.face);
    }
  });

  it('finds templates by id only', () => {
    expect(findTemplate('pizza-box')?.style).toBe('pizza');
    expect(findTemplate('nope')).toBeUndefined();
    expect(findTemplate(null)).toBeUndefined();
  });
});

describe('print checks', () => {
  const sizes = { front: { widthCm: 30, heightCm: 15 } };

  it('computes printed size and dpi with the print layer fit rule', () => {
    const p = imagePrintSize({ widthCm: 30, heightCm: 15 }, { width: 1000, height: 1000 }, 1);
    expect(p.widthCm).toBeCloseTo(15);
    expect(Math.round(p.dpi)).toBe(169);
  });

  it('flags low-resolution images', () => {
    const d = design({ faceImages: [{ face: 'front', imageUrl: 'data:image/png;base64,x', position: { x: 0.5, y: 0.5 }, scale: 1, rotation: 0 }] });
    const issues = runPrintChecks(d, sizes, { front: { width: 300, height: 300 } });
    expect(issues.find((i) => i.id === 'img-dpi-front')?.severity).toBe('error');
    expect(runPrintChecks(d, sizes, { front: { width: 4000, height: 4000 } }).some((i) => i.id === 'img-dpi-front')).toBe(false);
  });

  it('flags artwork over the edge and near a fold', () => {
    const at = (x: number) =>
      design({ faceImages: [{ face: 'front', imageUrl: 'data:image/png;base64,x', position: { x, y: 0.5 }, scale: 0.5, rotation: 0 }] });
    const px = { front: { width: 4000, height: 4000 } };
    expect(runPrintChecks(at(0.02), sizes, px).find((i) => i.id === 'img-edge-front')?.severity).toBe('error');
    expect(runPrintChecks(at(0.5), sizes, px).some((i) => i.id === 'img-edge-front')).toBe(false);
  });

  it('flags small text and low-contrast text, and selects the right face', () => {
    const d = design({
      colorHex: '#C9A87C',
      textElements: [
        { id: 't1', face: 'front', text: 'tiny', font: 'Inter', size: 5, color: '#111111', position: { x: 0.5, y: 0.5 }, rotation: 0, align: 'center' },
        { id: 't2', face: 'front', text: 'pale', font: 'Inter', size: 30, color: '#D0B088', position: { x: 0.5, y: 0.5 }, rotation: 0, align: 'center' },
      ],
    });
    const issues = runPrintChecks(d, sizes);
    expect(issues.find((i) => i.id === 'txt-size-t1')?.severity).toBe('error');
    expect(issues.some((i) => i.id === 'txt-contrast-t2')).toBe(true);
    expect(issues.every((i) => i.face === 'front')).toBe(true);
    // errors first
    expect(issues[0].severity).toBe('error');
  });

  it('ignores faces the style does not have', () => {
    const d = design({ textElements: [{ id: 'x', face: 'lid', text: 'hi', font: 'Inter', size: 4, color: '#000000', position: { x: 0.5, y: 0.5 }, rotation: 0, align: 'center' }] });
    expect(runPrintChecks(d, sizes)).toEqual([]);
  });

  it('contrast ratio matches WCAG endpoints', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21);
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1);
  });
});

describe('brand kit and colours', () => {
  it('parses hex and RGB input', () => {
    expect(normaliseHex('abc')).toBe('#AABBCC');
    expect(parseColourInput('#c9a87c')).toBe('#C9A87C');
    expect(parseColourInput('rgb(201, 168, 124)')).toBe('#C9A87C');
    expect(parseColourInput('201 168 124')).toBe('#C9A87C');
    expect(parseColourInput('300,0,0')).toBeNull();
    expect(parseColourInput('red')).toBeNull();
  });

  it('saves, loads and validates the kit', () => {
    const store = memoryStore();
    const kit = addBrandColour(addBrandColour({ name: 'Acme', logoUrl: null, colours: [], font: 'Inter' }, '#123456'), '123456');
    expect(kit.colours).toEqual(['#123456']);
    expect(saveBrandKit(kit, store)).toBe(true);
    expect(loadBrandKit(store)).toEqual(kit);
    // tampered storage falls back to an empty kit
    store.setItem(BRAND_KIT_KEY, JSON.stringify({ logoUrl: 'javascript:alert(1)' }));
    expect(loadBrandKit(store).logoUrl).toBeNull();
  });

  it('keeps recent colours most-recent-first, deduplicated and capped', () => {
    const store = memoryStore();
    for (let i = 0; i < 15; i++) pushRecentColour(`#0000${i.toString(16).padStart(2, '0')}`, store);
    pushRecentColour('#000003', store);
    const recent = loadRecentColours(store);
    expect(recent[0]).toBe('#000003');
    expect(recent.length).toBe(MAX_RECENT_COLOURS);
    expect(new Set(recent).size).toBe(recent.length);
  });
});

describe('my designs', () => {
  it('creates entries, adds versions and restores them', () => {
    const store = memoryStore();
    const first = saveDesign(design({ colorHex: '#111111' }), { now: 1 }, store);
    expect(first.ok).toBe(true);
    const id = first.entry!.id;
    saveDesign(design({ colorHex: '#222222' }), { id, now: 2 }, store);
    const [entry] = listDesigns(store);
    expect(entry.versions.length).toBe(2);
    expect(loadVersion(entry, 0)!.colorHex).toBe('#222222');
    expect(loadVersion(entry, 1)!.colorHex).toBe('#111111');
  });

  it('caps versions', () => {
    const store = memoryStore();
    const id = saveDesign(design(), { now: 0 }, store).entry!.id;
    for (let i = 1; i < MAX_VERSIONS + 5; i++) saveDesign(design(), { id, now: i }, store);
    expect(listDesigns(store)[0].versions.length).toBe(MAX_VERSIONS);
  });

  it('renames, duplicates and deletes', () => {
    const store = memoryStore();
    const id = saveDesign(design(), { name: 'A', now: 1 }, store).entry!.id;
    expect(renameDesign(id, 'Bakery box', store)[0].name).toBe('Bakery box');
    expect(duplicateDesign(id, store, 5).length).toBe(2);
    expect(deleteDesign(id, store).length).toBe(1);
  });

  it('drops images when storage is full', () => {
    const base = memoryStore();
    const limited = {
      ...base,
      setItem: (k: string, v: string) => {
        if (v.length > 4000) throw new Error('QuotaExceededError');
        base.setItem(k, v);
      },
    };
    const big = design({ faceImages: [{ face: 'front', imageUrl: `data:image/png;base64,${'A'.repeat(6000)}`, position: { x: 0.5, y: 0.5 }, scale: 1, rotation: 0 }] });
    const result = saveDesign(big, {}, limited);
    expect(result.ok).toBe(true);
    expect(result.imagesDropped).toBe(true);
    expect(loadVersion(listDesigns(limited)[0])!.faceImages).toEqual([]);
  });

  it('ignores invalid stored entries', () => {
    const store = memoryStore({ [MY_DESIGNS_KEY]: JSON.stringify([{ id: '<script>', name: 1 }]) });
    expect(listDesigns(store)).toEqual([]);
  });
});

describe('spec sheet data', () => {
  it('lists the spec in the chosen unit with a stable reference', () => {
    const d = design({ unit: 'mm', quantity: 2500, name: 'Kavya mailer' });
    const data = buildSpecSheetData(d, new Date('2026-10-26T10:00:00Z'));
    expect(data.title).toBe('Kavya mailer');
    const row = (label: string) => data.rows.find((r) => r.label === label)?.value;
    expect(row('Inside size (L × W × H)')).toBe('300 × 200 × 150 mm');
    expect(row('Quantity')).toBe('2,500');
    expect(row('Finish')).toBe('Matte');
    expect(data.reference).toMatch(/^VB-[0-9A-F]{6}$/);
    expect(designReference(d)).toBe(data.reference);
    expect(designReference(design({ quantity: 100 }))).not.toBe(data.reference);
    // outside is larger than inside
    expect(row('Outside size (approx.)')).not.toBe(row('Inside size (L × W × H)'));
  });
});

describe('studio helpers', () => {
  it('caps shot resolution to the GPU limit', () => {
    expect(shotPixelRatio(1000, 600, 2, 16384)).toBe(2);
    expect(shotPixelRatio(1500, 900, 4, 4096)).toBeCloseTo(4096 / 1500);
    expect(shotPixelRatio(3000, 2000, 4, 16384)).toBeCloseTo(8192 / 3000);
  });

  it('prefers MP4, falls back to WebM, or null', () => {
    expect(pickVideoMime((m) => m.startsWith('video/mp4'))?.ext).toBe('mp4');
    expect(pickVideoMime((m) => m === 'video/webm')?.mime).toBe('video/webm');
    expect(pickVideoMime(() => false)).toBeNull();
    expect(pickVideoMime(() => { throw new Error('x'); })).toBeNull();
  });

  it('lays out a stack of six and a pallet within limits', () => {
    expect(stackPlacements({ length: 30, width: 20, height: 15 }).length).toBe(5);
    const pallet = palletLayout({ length: 40, width: 30, height: 30 });
    expect(pallet.perRow * pallet.perCol).toBeGreaterThanOrEqual(9);
    expect(pallet.layers).toBe(5);
    expect(pallet.positions.length).toBe(pallet.perRow * pallet.perCol * pallet.layers);
    const tiny = palletLayout({ length: 5, width: 5, height: 5 });
    expect(tiny.positions.length).toBeLessThanOrEqual(MAX_PALLET_BOXES);
    for (const p of pallet.positions) expect(Math.abs(p.x)).toBeLessThanOrEqual(PALLET.length / 2);
  });

  it('stores the quality preference', () => {
    const store = memoryStore();
    expect(loadQualityPref(store)).toBe('auto');
    saveQualityPref('saver', store);
    expect(loadQualityPref(store)).toBe('saver');
    expect(qualityToTier('saver')).toBe('low');
    expect(qualityToTier('auto')).toBeNull();
  });

  it('builds an embed snippet with numeric, sanitised params', () => {
    const html = embedSnippet('https://example.com', { style: 'mailer"><script>', l: 30.04, w: 23, h: 6 });
    expect(html).toContain('/embed/box-designer?style=mailerscript&l=30&w=23&h=6');
    expect(html).not.toContain('<script>');
  });

  it('keeps the hyphen of hyphenated style ids so the embed opens that style', () => {
    expect(embedSnippet('https://example.com', { style: 'window-mailer', l: 28, w: 22, h: 7 })).toContain('style=window-mailer&');
  });
});

describe('embed params', () => {
  it('accepts valid params and falls back on bad ones', () => {
    const ok = parseEmbedParams('?style=pizza&l=31&w=31&h=5');
    expect(ok.template).toBe('pizza');
    expect(ok.dimensions).toEqual({ length: 31, width: 31, height: 5 });
    const bad = parseEmbedParams('?style=evil&l=9999&w=abc');
    expect(bad.template).toBe(DEFAULT_DESIGN.template);
    expect(bad.dimensions.length).toBeLessThanOrEqual(100);
  });
});

describe('landing pages', () => {
  it('every landing points at a template of the same style', () => {
    for (const l of DESIGNER_LANDINGS) expect(findTemplate(l.templateId)?.style, l.slug).toBe(l.style);
    expect(availableLandings().length).toBe(ALL_LANDINGS.length);
  });

  it('includes the slugs the blogs link to', () => {
    for (const slug of ['mailer-box', 'pizza-box', 'shoe-box', 'gift-box', 'shipping-carton']) expect(findLanding(slug), slug).toBeDefined();
  });

  it('builds designer links with the template and size', () => {
    const l = findLanding('pizza-box')!;
    expect(landingDesignerHref(l, { length: 26, width: 26, height: 5 })).toBe('/box-designer?template=pizza-box&l=26&w=26&h=5');
  });
});
