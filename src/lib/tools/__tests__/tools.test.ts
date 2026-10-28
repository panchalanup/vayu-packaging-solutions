/**
 * Calculator logic for /tools/*: formulas checked against worked examples (hand calculations and the strategy doc's test vectors).
 */

import { describe, expect, it } from 'vitest';
import { assessVolumetric, volumetricKg } from '../volumetric';
import { assessLoading, cartonCbm, CONTAINERS, layoutCount, rectCount } from '../cbm';
import { bestArrangement, recommendBoxSize, USE_CASES } from '../boxSize';
import { comparePlies, ectKnmToLbIn, ectLbInToKnm, estimateStrength, mcKeeLbf, mcKeeN, plyBoard } from '../boxStrength';
import { assessBoxWeight, defaultLayers } from '../boxWeight';
import { compareCosts, costPerOrder, indicativeBoxPrice } from '../packagingCost';
import { boxCompressionN } from '@/lib/boxDesigner/strength';
import { designerHandoffHref, quoteHandoffHref, toolSrc, whatsappHandoffHref } from '../shared';
import { parseQuotePrefill } from '@/lib/quotePrefill';
import { designFromPresetParams } from '@/lib/boxDesigner/landingPreset';
import { DEFAULT_DESIGN } from '@/lib/boxDesigner/designCodec';

const box = { length: 30, width: 20, height: 15 };

describe('volumetric weight', () => {
  it('matches the doc test vector: 30 x 20 x 15 cm = 1.8 kg at 5000, 2.25 kg at 4000', () => {
    expect(volumetricKg(box, 5000)).toBeCloseTo(1.8, 6);
    expect(volumetricKg(box, 4000)).toBeCloseTo(2.25, 6);
    expect(volumetricKg(box, 6000)).toBeCloseTo(1.5, 6);
  });

  it('charges the larger of actual and volumetric weight', () => {
    const light = assessVolumetric({ dims: box, actualKg: 1, divisor: 5000 })!;
    expect(light.winner).toBe('volumetric');
    expect(light.chargeableKg).toBeCloseTo(1.8, 6);
    expect(light.extraKg).toBeCloseTo(0.8, 6);
    const heavy = assessVolumetric({ dims: box, actualKg: 3, divisor: 5000 })!;
    expect(heavy.winner).toBe('actual');
    expect(heavy.chargeableKg).toBe(3);
    expect(heavy.extraKg).toBe(0);
    expect(heavy.breakEvenDims).toBeUndefined();
  });

  it('finds the break-even box and the cost', () => {
    const r = assessVolumetric({ dims: box, actualKg: 1, divisor: 5000, ratePerKg: 50, parcels: 10 })!;
    expect(r.breakEvenVolumeCm3).toBe(5000);
    // same proportions as 30 x 20 x 15 at 5000 cm3, rounded down to 0.5 cm
    const d = r.breakEvenDims!;
    expect(d.length * d.width * d.height).toBeLessThanOrEqual(5000);
    expect(d.length / d.width).toBeCloseTo(1.5, 0);
    expect(r.costPerParcel).toBeCloseTo(90, 6);
    expect(r.costTotal).toBeCloseTo(900, 6);
  });

  it('shows what a smaller box saves and never goes below the actual weight', () => {
    const r = assessVolumetric({ dims: box, actualKg: 1.7, divisor: 5000 })!;
    const [s10, s20] = r.scenarios;
    expect(s10.volumetricKg).toBeCloseTo(1.62, 6);
    expect(s10.chargeableKg).toBeCloseTo(1.7, 6);
    expect(s20.chargeableKg).toBeCloseTo(1.7, 6);
    expect(s10.savedKg).toBeCloseTo(0.1, 6);
  });

  it('rejects invalid input', () => {
    expect(assessVolumetric({ dims: { length: 0, width: 1, height: 1 }, divisor: 5000 })).toBeNull();
    expect(assessVolumetric({ dims: box, divisor: 0 })).toBeNull();
  });
});

describe('CBM and loading', () => {
  it('CBM per carton and total', () => {
    expect(cartonCbm({ length: 50, width: 40, height: 30 })).toBeCloseTo(0.06, 9);
    const r = assessLoading({
      carton: { length: 50, width: 40, height: 30 },
      qty: 500,
      container: CONTAINERS[0],
      usablePct: 85,
      pallet: { lengthMm: 1200, widthMm: 1000, maxLoadHeightCm: 150 },
    })!;
    expect(r.totalCbm).toBeCloseTo(30, 6);
  });

  it('counts rectangles on a floor, including a two-block layout', () => {
    expect(rectCount(100, 100, 50, 50)).toBe(4);
    expect(rectCount(100, 100, 60, 60)).toBe(1);
    // 120 x 100 floor, 40 x 30 items: 3 x 3 = 9 one way, 4 x 2... best is 10
    expect(rectCount(120, 100, 40, 30)).toBeGreaterThanOrEqual(9);
    expect(rectCount(0, 100, 10, 10)).toBe(0);
  });

  it('picks the best way to stand a carton', () => {
    // 100 cm cube in a 590 x 235 x 239 cm container: 5 x 2 per layer, 2 layers
    const r = layoutCount(CONTAINERS[0].internalCm, { length: 100, width: 100, height: 100 });
    expect(r.perLayer).toBe(10);
    expect(r.layers).toBe(2);
    expect(r.count).toBe(20);
  });

  it('takes the lowest of volume, layout and weight', () => {
    const base = {
      carton: { length: 50, width: 40, height: 30 },
      qty: 1000,
      container: CONTAINERS[0],
      usablePct: 85,
      pallet: { lengthMm: 1200, widthMm: 1000, maxLoadHeightCm: 150 },
    };
    const volumeBound = assessLoading(base)!.container;
    // 590 x 235 x 239 cm = 33.14 CBM; 85% of that over 0.06 CBM per carton is about 469
    expect(volumeBound.byVolume).toBe(469);
    expect(volumeBound.perContainer).toBe(Math.min(volumeBound.byVolume, volumeBound.byLayout.count));
    const heavy = assessLoading({ ...base, grossKg: 100 })!.container;
    expect(heavy.byWeight).toBe(280);
    expect(heavy.perContainer).toBe(280);
    expect(heavy.limitedBy).toBe('weight');
    expect(heavy.containersNeeded).toBe(4);
  });

  it('loads cartons on a pallet within the height limit', () => {
    const r = assessLoading({
      carton: { length: 40, width: 30, height: 25 },
      qty: 1000,
      grossKg: 10,
      container: CONTAINERS[1],
      usablePct: 85,
      pallet: { lengthMm: 1200, widthMm: 1000, maxLoadHeightCm: 150 },
    })!.pallet;
    // 120 x 100 floor, 150 cm load height: standing 25 cm up gives 6 layers, standing 30 cm up gives 5; either way at least 60 cartons
    expect(r.layout.layers).toBeGreaterThanOrEqual(5);
    expect(r.cartonsPerPallet).toBeGreaterThanOrEqual(60);
    expect(r.cartonsPerPallet).toBe(r.layout.perLayer * r.layout.layers);
    expect(r.palletWeightKg).toBe(r.cartonsPerPallet * 10);
    expect(r.palletsPerContainer).toBeGreaterThan(0);
  });
});

describe('box size from product size', () => {
  it('arranges a quantity as a compact grid', () => {
    const a = bestArrangement({ length: 10, width: 10, height: 5 }, 4)!;
    expect(a.nx * a.ny * a.nz).toBe(4);
    // 4 flat items: stacking 4 high (10 x 10 x 20) has the same volume as 2 x 2 x 1 (20 x 20 x 5)? 2000 vs 2000, the cube-like grid wins
    expect(a.bundle.length * a.bundle.width * a.bundle.height).toBe(2000);
    expect(bestArrangement({ length: 10, width: 10, height: 5 }, 0)).toBeNull();
  });

  it('adds padding on both sides plus the fit ease, rounded up to 0.5 cm', () => {
    // 20 x 10 x 5 cm product, 1 cm padding per side: 22.3 -> 22.5, 12.3 -> 12.5, 7.3 -> 7.5
    const r = recommendBoxSize({ product: { length: 20, width: 10, height: 5 }, qty: 1, paddingCm: 1, ply: '3-ply', useCase: 'mailer' })!;
    expect(r.inside).toEqual({ length: 22.5, width: 12.5, height: 7.5 });
    expect(r.outside.length).toBeGreaterThan(r.inside.length);
    expect(r.fillPct).toBeCloseTo(((20 * 10 * 5) / (22.5 * 12.5 * 7.5)) * 100, 6);
    expect(r.style).toBe('mailer');
  });

  it('finds the next common size that fits and suggests a ply for heavy contents', () => {
    const r = recommendBoxSize({ product: { length: 28, width: 18, height: 10 }, qty: 1, paddingCm: 0.5, ply: '5-ply', useCase: 'shipper', weightKg: 12 })!;
    expect(r.nearestCommon).toBeDefined();
    expect(r.suggestedPly).toBe('5-ply');
    const n = r.nearestCommon!;
    expect([n.length, n.width, n.height].sort((a, b) => b - a)[0]).toBeGreaterThanOrEqual(Math.max(r.inside.length, r.inside.width, r.inside.height));
  });

  it('maps every use case to a real designer style', () => {
    for (const u of USE_CASES) expect(u.style).toMatch(/^[a-z-]+$/);
  });
});

describe('box strength (simplified McKee)', () => {
  it('matches the doc test vector: ECT 32 lb/in, caliper 0.125 in, perimeter 56 in = about 497 lbf', () => {
    expect(mcKeeLbf(32, 0.125, 56)).toBeCloseTo(497, 0);
  });

  it('SI and imperial forms agree', () => {
    const lbf = mcKeeLbf(32, 0.125, 56);
    const n = mcKeeN(ectLbInToKnm(32), 0.125 * 25.4, 56 * 25.4);
    expect(n / 4.448).toBeCloseTo(lbf, 0);
  });

  it('agrees with the designer strength helper at its own typical board', () => {
    const board = plyBoard('5-ply');
    expect(mcKeeN(board.ectKnm, board.caliperMm, 1500)).toBeCloseTo(boxCompressionN('5-ply', board.caliperMm, 1500), 6);
  });

  it('converts kN/m and lb/in', () => {
    expect(ectKnmToLbIn(1)).toBeCloseTo(5.71, 6);
    expect(ectLbInToKnm(5.71)).toBeCloseTo(1, 6);
  });

  it('allowable load is BCT after the openings penalty over the safety factor; stack counts the bottom box', () => {
    const base = { inside: { length: 40, width: 30, height: 10 }, ectKnm: 7.5, caliperMm: 6.4, safetyFactor: 4, boxWeightKg: 10 };
    const plain = estimateStrength(base)!;
    expect(plain.allowableKg).toBeCloseTo(plain.bctKgf / 4, 6);
    expect(plain.stackHigh).toBe(Math.floor(plain.allowableKg / 10) + 1);
    const vented = estimateStrength({ ...base, penaltyPct: 25 })!;
    expect(vented.usableKgf).toBeCloseTo(plain.bctKgf * 0.75, 6);
    expect(vented.allowableKg).toBeLessThan(plain.allowableKg);
  });

  it('rates the stack and caps it by reach height', () => {
    const tall = estimateStrength({ inside: { length: 40, width: 30, height: 90 }, ectKnm: 11, caliperMm: 9, safetyFactor: 3, boxWeightKg: 1 })!;
    expect(tall.stackLimitedBy).toBe('height');
    expect(tall.stackHigh).toBeLessThanOrEqual(2);
    expect(estimateStrength({ inside: { length: 0, width: 30 }, ectKnm: 7.5, caliperMm: 6, safetyFactor: 4 })).toBeNull();
  });

  it('is stronger in 5-ply than 3-ply at the same size', () => {
    const rows = comparePlies({ inside: { length: 40, width: 30, height: 30 }, safetyFactor: 4, boxWeightKg: 8 });
    expect(rows.map((r) => r.ply)).toEqual(['3-ply', '5-ply', '7-ply']);
    expect(rows[1].bctKgf).toBeGreaterThan(rows[0].bctKgf);
    expect(rows[2].bctKgf).toBeGreaterThan(rows[1].bctKgf);
  });
});

describe('box weight and paper cost', () => {
  const sample = (over = {}) => ({
    lengthMm: 400,
    widthMm: 300,
    heightMm: 250,
    jointMm: 35,
    layers: defaultLayers('3-ply'),
    qty: 1000,
    ...over,
  });

  it('builds layers per ply', () => {
    expect(defaultLayers('3-ply')).toHaveLength(3);
    expect(defaultLayers('5-ply')).toHaveLength(5);
    expect(defaultLayers('7-ply')).toHaveLength(7);
  });

  it('works the blank size and weight by hand: 400 x 300 x 250 mm, joint 35, 150 / 120 / 150 GSM', () => {
    const r = assessBoxWeight(sample())!;
    expect(r.blankLengthMm).toBe(1435);
    expect(r.blankWidthMm).toBe(550);
    expect(r.areaM2).toBeCloseTo(0.78925, 6);
    // B flute take-up 1.35: 150 + 120 x 1.35 + 150 = 462 g/m2
    expect(r.weightG).toBeCloseTo(0.78925 * 462, 4);
    expect(r.paperCostPerBox).toBeUndefined();
  });

  it('costs paper only when every layer has a rate', () => {
    const layers = defaultLayers('3-ply').map((l) => ({ ...l, ratePerKg: 50 }));
    const r = assessBoxWeight(sample({ layers, addOnPerBox: 2 }))!;
    expect(r.paperCostPerBox).toBeCloseTo((r.weightG / 1000) * 50, 6);
    expect(r.totalPerBox).toBeCloseTo((r.weightG / 1000) * 50 + 2, 6);
    expect(r.orderTotal).toBeCloseTo(r.totalPerBox! * 1000, 4);
    expect(r.perKgFinished).toBeCloseTo(r.totalPerBox! / (r.weightG / 1000), 6);
    const partial = defaultLayers('3-ply').map((l, i) => ({ ...l, ratePerKg: i === 0 ? 50 : undefined }));
    expect(assessBoxWeight(sample({ layers: partial }))!.paperCostPerBox).toBeUndefined();
  });

  it('rejects bad input', () => {
    expect(assessBoxWeight(sample({ lengthMm: 0 }))).toBeNull();
    expect(assessBoxWeight(sample({ layers: [] }))).toBeNull();
  });
});

describe('packaging cost per order', () => {
  const common = { monthlyOrders: 1000, packedKg: 1, divisor: 5000, ratePerKg: 50, slabKg: 0.5, damageCost: 400, switchingCost: 6000 };
  const current = { dims: { length: 30, width: 20, height: 15 }, boxCost: 20, extrasPerOrder: 5, damagePct: 2 };
  const proposed = { dims: { length: 25, width: 18, height: 12 }, boxCost: 16, extrasPerOrder: 5, damagePct: 2 };

  it('bills the larger weight, rounded up to the slab', () => {
    const c = costPerOrder(current, common)!;
    expect(c.volumetricKg).toBeCloseTo(1.8, 6);
    expect(c.chargeableKg).toBeCloseTo(1.8, 6);
    expect(c.billedKg).toBeCloseTo(2, 6);
    expect(c.shipping).toBeCloseTo(100, 6);
    expect(c.damage).toBeCloseTo(8, 6);
    expect(c.total).toBeCloseTo(20 + 5 + 100 + 8, 6);
  });

  it('compares now with proposed and works out saving and payback', () => {
    const r = compareCosts({ ...common, current, proposed })!;
    // 25 x 18 x 12 = 5400 cm3 -> 1.08 kg -> 1.5 kg slab = 75
    expect(r.proposed.billedKg).toBeCloseTo(1.5, 6);
    expect(r.proposed.total).toBeCloseTo(16 + 5 + 75 + 8, 6);
    expect(r.savingPerOrder).toBeCloseTo(133 - 104, 6);
    expect(r.savingPerMonth).toBeCloseTo(29000, 4);
    expect(r.savingPerYear).toBeCloseTo(348000, 3);
    expect(r.paybackMonths).toBeCloseTo(6000 / 29000, 6);
  });

  it('has no payback when nothing is saved', () => {
    const r = compareCosts({ ...common, current, proposed: current })!;
    expect(r.savingPerMonth).toBe(0);
    expect(r.paybackMonths).toBeUndefined();
  });

  it('gives an indicative Vayu price from the designer estimator', () => {
    const price = indicativeBoxPrice({ length: 25, width: 18, height: 12 }, '5-ply', 1000)!;
    expect(price).toBeGreaterThan(0);
    expect(indicativeBoxPrice({ length: 0, width: 1, height: 1 }, '5-ply', 100)).toBeNull();
  });
});

describe('hand-off links', () => {
  it('builds a safe src from the slug', () => {
    expect(toolSrc('volumetric-weight-calculator')).toBe('tools.volumetric-weight-calculator');
    expect(toolSrc('Bad_Slug!')).toBe('tools.badslug');
  });

  it('designer link carries the size as a preset the designer accepts', () => {
    const href = designerHandoffHref({ slug: 'box-size-calculator', dimsCm: { length: 22.5, width: 12.5, height: 7.5 }, style: 'mailer', ply: '3-ply' });
    expect(href.startsWith('/box-designer?')).toBe(true);
    const q = new URLSearchParams(href.split('?')[1]);
    expect(q.get('src')).toBe('tools.box-size-calculator');
    const design = designFromPresetParams(q, DEFAULT_DESIGN)!;
    expect(design.template).toBe('mailer');
    expect(design.dimensions).toEqual({ length: 22.5, width: 12.5, height: 7.5 });
    expect(design.ply).toBe('3-ply');
  });

  it('designer link clamps to the designer range and opens plain without a size', () => {
    const q = new URLSearchParams(designerHandoffHref({ slug: 'cbm-calculator', dimsCm: { length: 300, width: 2, height: 10 } }).split('?')[1]);
    expect(q.get('l')).toBe('100');
    expect(q.get('w')).toBe('5');
    expect(designerHandoffHref({ slug: 'cbm-calculator' })).toBe('/box-designer?src=tools.cbm-calculator');
  });

  it('quote link uses mm, a ply product, a quantity band and the src', () => {
    const href = quoteHandoffHref({ slug: 'box-size-calculator', dimsCm: { length: 22.5, width: 12.5, height: 7.5 }, ply: '5-ply', qty: 2000 });
    const p = parseQuotePrefill(href.split('?')[1]);
    expect(p).toMatchObject({ l: 225, w: 125, h: 75, product: '5-ply', qty: '1k-5k', src: 'tools.box-size-calculator' });
  });

  it('quote link drops sizes the quote form cannot take', () => {
    const p = parseQuotePrefill(quoteHandoffHref({ slug: 'cbm-calculator', dimsCm: { length: 900, width: 20, height: 20 } }).split('?')[1]);
    expect(p.l).toBeUndefined();
    expect(p.w).toBe(200);
  });

  it('WhatsApp message names the tool and the numbers, with no personal data', () => {
    const href = whatsappHandoffHref({ toolName: 'Box Size Calculator', slug: 'box-size-calculator', summary: 'Inside size 22.5 x 12.5 x 7.5 cm.' });
    const text = decodeURIComponent(href.split('?text=')[1]);
    expect(href.startsWith('https://wa.me/')).toBe(true);
    expect(text).toContain('/tools/box-size-calculator');
    expect(text).toContain('22.5 x 12.5 x 7.5 cm');
  });
});
