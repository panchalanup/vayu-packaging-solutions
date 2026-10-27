/**
 * Calculator pages: copy rules (answer length, FAQ count), links to real blogs and tools, route list, sitemap coverage,
 * and the worked examples in the copy against the real formulas.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getToolPage, TOOL_PAGES, TOOL_ROUTES, TOOLS_INDEX_PATH } from '../toolPages';
import { BLOG_POSTS } from '@/constants/blogs';
import { assessVolumetric } from '@/lib/tools/volumetric';
import { assessLoading, CONTAINERS } from '@/lib/tools/cbm';
import { recommendBoxSize } from '@/lib/tools/boxSize';
import { mcKeeLbf } from '@/lib/tools/boxStrength';
import { assessBoxWeight, defaultLayers } from '@/lib/tools/boxWeight';
import { compareCosts } from '@/lib/tools/packagingCost';
import { toolSrc } from '@/lib/tools/shared';

const words = (s: string) => s.trim().split(/\s+/).length;

describe('tool page content', () => {
  it('has the six calculators with unique slugs and matching paths', () => {
    expect(TOOL_PAGES.map((t) => t.slug)).toEqual([
      'volumetric-weight-calculator',
      'cbm-calculator',
      'box-size-calculator',
      'box-strength-calculator',
      'box-weight-calculator',
      'packaging-cost-calculator',
    ]);
    expect(new Set(TOOL_PAGES.map((t) => t.slug)).size).toBe(TOOL_PAGES.length);
    for (const t of TOOL_PAGES) expect(t.path).toBe(`/tools/${t.slug}`);
    expect(TOOL_ROUTES).toEqual([TOOLS_INDEX_PATH, ...TOOL_PAGES.map((t) => t.path)]);
    expect(getToolPage('cbm-calculator')?.name).toMatch(/CBM/);
    expect(getToolPage('nope')).toBeUndefined();
  });

  it.each(TOOL_PAGES.map((t) => [t.slug, t] as const))('%s follows the page rules', (_slug, t) => {
    expect(words(t.answer)).toBeGreaterThanOrEqual(40);
    expect(words(t.answer)).toBeLessThanOrEqual(60);
    expect(t.faqs.length).toBeGreaterThanOrEqual(4);
    expect(t.faqs.length).toBeLessThanOrEqual(6);
    expect(t.howTo.steps.length).toBeGreaterThanOrEqual(3);
    expect(t.metaDescription.length).toBeLessThanOrEqual(200);
    expect(t.metaTitle.length).toBeLessThanOrEqual(90);
    // the H1 and the title carry the main keyword
    expect(t.keywords[0].split(' ').every((w) => (t.h1 + ' ' + t.metaTitle).toLowerCase().includes(w))).toBe(true);
    expect(toolSrc(t.slug).length).toBeLessThanOrEqual(60);
    expect(t.relatedBlogs.length).toBeGreaterThanOrEqual(3);
    for (const slug of t.relatedBlogs) expect(BLOG_POSTS.some((b) => b.slug === slug), `blog ${slug}`).toBe(true);
    for (const slug of t.relatedTools) {
      expect(slug).not.toBe(t.slug);
      expect(getToolPage(slug), `tool ${slug}`).toBeDefined();
    }
  });

  it('does not state courier rules as fact (the volumetric page names no courier)', () => {
    const text = JSON.stringify(getToolPage('volumetric-weight-calculator')).toLowerCase();
    for (const courier of ['delhivery', 'bluedart', 'blue dart', 'dtdc', 'fedex', 'dhl', 'india post', 'ecom express', 'xpressbees', 'shiprocket']) {
      expect(text).not.toContain(courier);
    }
  });

  it('every tool route is in public/sitemap.xml', () => {
    const xml = readFileSync(resolve(__dirname, '../../../public/sitemap.xml'), 'utf-8');
    for (const route of TOOL_ROUTES) expect(xml).toContain(`<loc>https://vayupackaging.vercel.app${route}</loc>`);
  });
});

describe('worked examples in the copy match the formulas', () => {
  it('volumetric: 30 x 20 x 15 cm, 1 kg', () => {
    const base = { dims: { length: 30, width: 20, height: 15 }, actualKg: 1 };
    expect(assessVolumetric({ ...base, divisor: 5000 })!.chargeableKg).toBeCloseTo(1.8, 6);
    expect(assessVolumetric({ ...base, divisor: 4000 })!.volumetricKg).toBeCloseTo(2.25, 6);
    expect(assessVolumetric({ ...base, divisor: 6000 })!.volumetricKg).toBeCloseTo(1.5, 6);
    expect(assessVolumetric({ ...base, divisor: 5000 })!.scenarios[1].volumetricKg).toBeCloseTo(1.44, 6);
  });

  it('cbm: 500 cartons of 50 x 40 x 30 cm', () => {
    const r = assessLoading({ carton: { length: 50, width: 40, height: 30 }, qty: 500, container: CONTAINERS[0], usablePct: 85, pallet: { lengthMm: 1200, widthMm: 1000, maxLoadHeightCm: 150 } })!;
    expect(r.cbmPerCarton).toBeCloseTo(0.06, 9);
    expect(r.totalCbm).toBeCloseTo(30, 6);
    expect(r.container.byVolume).toBe(469);
    expect(CONTAINERS[0].internalCm.length * CONTAINERS[0].internalCm.width * CONTAINERS[0].internalCm.height / 1e6).toBeCloseTo(33.1, 1);
  });

  it('box size: 20 x 10 x 5 cm with 1 cm padding', () => {
    const r = recommendBoxSize({ product: { length: 20, width: 10, height: 5 }, qty: 1, paddingCm: 1, ply: '3-ply', useCase: 'mailer' })!;
    expect(r.inside).toEqual({ length: 22.5, width: 12.5, height: 7.5 });
    expect(Math.round(r.fillPct)).toBe(47);
  });

  it('strength: ECT 32, caliper 0.125 in, perimeter 56 in', () => {
    const lbf = mcKeeLbf(32, 0.125, 56);
    expect(Math.round(lbf)).toBe(497);
    expect(Math.round(lbf / 2.2046)).toBe(225);
    expect(Math.round(lbf / 2.2046 / 4)).toBe(56);
    expect(Math.floor(56.4 / 10) + 1).toBe(6);
  });

  it('box weight: 400 x 300 x 250 mm 3-ply', () => {
    const r = assessBoxWeight({ lengthMm: 400, widthMm: 300, heightMm: 250, jointMm: 35, layers: defaultLayers('3-ply'), qty: 1 })!;
    expect(r.blankLengthMm).toBe(1435);
    expect(r.blankWidthMm).toBe(550);
    expect(r.areaM2.toFixed(3)).toBe('0.789');
    expect(Math.round(r.weightG)).toBe(365);
  });

  it('packaging cost: the example in the copy', () => {
    const r = compareCosts({
      monthlyOrders: 1000,
      packedKg: 1,
      divisor: 5000,
      ratePerKg: 50,
      slabKg: 0.5,
      damageCost: 400,
      switchingCost: 0,
      current: { dims: { length: 30, width: 20, height: 15 }, boxCost: 20, extrasPerOrder: 5, damagePct: 2 },
      proposed: { dims: { length: 25, width: 18, height: 12 }, boxCost: 16, extrasPerOrder: 5, damagePct: 2 },
    })!;
    expect(r.now.total).toBeCloseTo(133, 6);
    expect(r.proposed.total).toBeCloseTo(104, 6);
    expect(r.savingPerMonth).toBeCloseTo(29000, 4);
  });
});
