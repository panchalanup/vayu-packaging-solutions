/**
 * Guided wizard, phase 2: produce, cake, bakery, apparel, jar and bottle, cosmetics, gift and display products go to
 * the right new styles, the recommendation switches on the matching openings and adds a sample cutout from the library.
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { loadAllCategories } from '../stickers/library';
import { getStyle, STYLES } from '../styles/registry';
import {
  PRODUCT_OPTIONS,
  TYPICAL_PRODUCT_SIZE,
  recommendBox,
  wizardStickers,
  type ProductType,
  type ShippingMethod,
  type WizardAnswers,
} from '../wizard';
import type { BoxTemplate } from '@/types/boxDesigner';

const base: WizardAnswers = { product: 'apparel', weightKg: 1, fragility: 'sturdy', shipping: 'courier', productSize: null };
const all = () => true;
const rec = (patch: Partial<WizardAnswers>, isAvailable: (s: BoxTemplate) => boolean = all) => recommendBox({ ...base, ...patch }, isAvailable);

let libraryIds = new Set<string>();
beforeAll(async () => {
  libraryIds = new Set((await loadAllCategories()).map((s) => s.id));
});

describe('wizard products', () => {
  it('lists the new products and has a typical size and a label for each', () => {
    const ids = PRODUCT_OPTIONS.map((p) => p.id);
    for (const id of ['fruit', 'cake', 'jars', 'toys', 'displays'] as const) expect(ids).toContain(id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of PRODUCT_OPTIONS) {
      expect(TYPICAL_PRODUCT_SIZE[p.id].length, p.id).toBeGreaterThan(0);
      expect(p.hint.length, p.id).toBeGreaterThan(3);
    }
  });
});

describe('wizard style rules', () => {
  it('sends produce to a ventilated carton, or an open tray when it is fragile', () => {
    expect(rec({ product: 'fruit', weightKg: 5, shipping: 'local' }).template).toBe('produce');
    expect(rec({ product: 'fruit', weightKg: 2, shipping: 'local', fragility: 'fragile' }).template).toBe('produce-tray');
  });

  it('keeps heavy and export produce in the ventilated carton with a stronger board', () => {
    const heavy = rec({ product: 'fruit', weightKg: 20, shipping: 'export' });
    expect(heavy.template).toBe('produce');
    expect(heavy.ply).toBe('7-ply');
    expect(rec({ product: 'fruit', weightKg: 20, shipping: 'export' }, (s) => s === 'rsc').template).toBe('rsc');
  });

  it('sends cakes to the window cake box, bakery goods to a tray or clamshell', () => {
    expect(rec({ product: 'cake', fragility: 'fragile', shipping: 'local' }).template).toBe('cake-box');
    expect(rec({ product: 'bakery', shipping: 'retail' }).template).toBe('tray');
    expect(rec({ product: 'bakery', shipping: 'local' }).template).toBe('tray');
    expect(rec({ product: 'bakery', shipping: 'courier' }).template).toBe('clamshell');
    expect(rec({ product: 'bakery', shipping: 'retail' }, (s) => s !== 'tray').template).toBe('clamshell');
  });

  it('sends apparel to a mailer, or a tuck-end carton on a shop shelf', () => {
    expect(rec({ product: 'apparel' }).template).toBe('mailer');
    expect(rec({ product: 'apparel', shipping: 'retail' }).template).toBe('tuck-end');
  });

  it('sends jars and bottles to a crash-lock carton', () => {
    expect(rec({ product: 'jars', weightKg: 1 }).template).toBe('crash-lock');
    expect(rec({ product: 'bottles', weightKg: 2, fragility: 'fragile' }).template).toBe('crash-lock');
  });

  it('sends cosmetics to a tuck-end carton, and gifts to a slide, book or telescope box', () => {
    expect(rec({ product: 'cosmetics', shipping: 'retail' }).template).toBe('tuck-end');
    expect(rec({ product: 'cosmetics' }).template).toBe('tuck-end');
    expect(rec({ product: 'gifts', shipping: 'retail' }).template).toBe('slide-box');
    expect(rec({ product: 'gifts', shipping: 'local' }).template).toBe('book-box');
    expect(['slide-box', 'book-box', 'telescope', 'mailer']).toContain(rec({ product: 'gifts', shipping: 'courier' }).template);
    expect(rec({ product: 'gifts', shipping: 'retail' }, (s) => s === 'telescope').template).toBe('telescope');
  });

  it('sends counter displays to a shelf tray', () => {
    expect(rec({ product: 'displays', shipping: 'retail', weightKg: 3 }).template).toBe('shelf-tray');
    expect(rec({ product: 'displays', shipping: 'retail', weightKg: 3 }, (s) => s !== 'shelf-tray').template).toBe('hsc');
  });

  it('keeps the old rules: pizza, light apparel courier, heavy industrial', () => {
    expect(rec({ product: 'pizza' }).template).toBe('pizza');
    expect(rec({}).template).toBe('mailer');
    expect(['fol', 'rsc']).toContain(rec({ product: 'industrial', weightKg: 30, shipping: 'export' }).template);
  });

  it('never picks a die-cut style at 7-ply and always returns a style that exists', () => {
    const dieCut: BoxTemplate[] = ['mailer', 'pizza', 'tray', 'window-mailer', 'cake-box', 'clamshell', 'shelf-tray', 'slide-box', 'book-box'];
    const shippings: ShippingMethod[] = ['courier', 'local', 'retail', 'pallet', 'export'];
    for (const p of PRODUCT_OPTIONS) {
      for (const shipping of shippings) {
        for (const weightKg of [0.5, 4, 15, 40]) {
          const r = rec({ product: p.id as ProductType, shipping, weightKg });
          expect(STYLES.some((s) => s.id === r.template), `${p.id}/${shipping}/${weightKg}`).toBe(true);
          if (r.ply === '7-ply') expect(dieCut.includes(r.template), `${p.id}/${shipping}/${weightKg} -> ${r.template}`).toBe(false);
          expect(r.reasons.length).toBeGreaterThanOrEqual(3);
        }
      }
    }
  });
});

describe('wizard options and cutouts', () => {
  it('switches on vents and hand holes for a produce carton, vents for a tray', () => {
    const carton = rec({ product: 'fruit', weightKg: 5, shipping: 'local' });
    expect(carton.options).toMatchObject({ vents: true, handHoles: true, window: false });
    const tray = rec({ product: 'fruit', weightKg: 2, shipping: 'local', fragility: 'fragile' });
    expect(tray.template).toBe('produce-tray');
    expect(tray.options.vents).toBe(true);
  });

  it('switches on the window for a cake box and a window mailer, a front cut for a shelf tray', () => {
    expect(rec({ product: 'cake' }).options.window).toBe(true);
    expect(rec({ product: 'toys', shipping: 'courier' }).options.window).toBe(true);
    expect(rec({ product: 'displays', shipping: 'retail', weightKg: 3 }).options.frontCut).toBeGreaterThan(0);
  });

  it('leaves openings off where they make no sense', () => {
    expect(rec({ product: 'apparel' }).options).toEqual({ handHoles: false, vents: false, window: false });
    expect(rec({ product: 'cosmetics' }).options.vents).toBe(false);
  });

  it('only asks for openings the recommended style can cut', () => {
    for (const p of PRODUCT_OPTIONS) {
      for (const shipping of ['courier', 'local', 'retail', 'export'] as ShippingMethod[]) {
        const r = rec({ product: p.id, shipping, weightKg: 3 });
        const style = getStyle(r.template);
        const caps = { ...style.openings, ...style.forcedOpenings };
        if (r.options.handHoles) expect(caps.hand, `${p.id}/${shipping} ${r.template} hand`).toBe(true);
        if (r.options.vents) expect(caps.vents, `${p.id}/${shipping} ${r.template} vents`).toBe(true);
        if (r.options.window) expect(caps.window, `${p.id}/${shipping} ${r.template} window`).toBe(true);
      }
    }
  });

  it('adds a sample cutout or two, from the library, on faces the style has', () => {
    expect(libraryIds.size).toBeGreaterThan(400);
    for (const p of PRODUCT_OPTIONS) {
      for (const shipping of ['courier', 'local', 'retail', 'export'] as ShippingMethod[]) {
        const r = rec({ product: p.id, shipping, weightKg: 3 });
        expect(r.stickers.length, `${p.id}/${shipping}`).toBeGreaterThanOrEqual(1);
        expect(r.stickers.length).toBeLessThanOrEqual(2);
        const faces = getStyle(r.template).faces;
        for (const s of r.stickers) {
          expect(libraryIds.has(s.id), `${p.id}: unknown sticker ${s.id}`).toBe(true);
          expect(faces, `${p.id}/${shipping} ${r.template} sticker face ${s.face}`).toContain(s.face);
          expect(s.x).toBeGreaterThanOrEqual(0);
          expect(s.x).toBeLessThanOrEqual(1);
          expect(s.y).toBeGreaterThanOrEqual(0);
          expect(s.y).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it('keeps cutouts off the window of a cake box and off the vent slots of a produce carton', () => {
    const cake = rec({ product: 'cake' });
    expect(cake.stickers.every((s) => s.face === 'front')).toBe(true);
    const fruit = rec({ product: 'fruit', weightKg: 5, shipping: 'local' });
    expect(fruit.stickers.every((s) => s.face === 'front' && s.y < 0.3)).toBe(true);
  });

  it('builds fresh placements from the recommendation', () => {
    const r = rec({ product: 'gifts', shipping: 'retail' });
    const placed = wizardStickers(r);
    expect(placed.map((s) => s.stickerId)).toEqual(r.stickers.map((s) => s.id));
    expect(new Set(placed.map((s) => s.id)).size).toBe(placed.length);
    expect(placed.every((s) => s.opacity === 1 && s.pattern === null)).toBe(true);
  });

  it('adds a plain reason line about the cut-outs', () => {
    expect(rec({ product: 'fruit', weightKg: 5, shipping: 'local' }).reasons.join(' ')).toMatch(/Ventilation slots and hand holes/);
    expect(rec({ product: 'cake' }).reasons.join(' ')).toMatch(/window/i);
  });
});
