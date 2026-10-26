import { describe, it, expect } from 'vitest';
import { DEFAULT_DESIGN } from '../designCodec';
import { formatDimensions, fromUnit, parseLength, toUnit, limitsInUnit } from '../units';
import { estimatePrice, estimateTiers, tierFor, countPrintColours, QUANTITY_TIERS } from '../pricing';
import { assessStrength, suggestPly, boxCompressionN } from '../strength';
import { recommendInsideSize, FRAGILE_MIN_PADDING_CM } from '../fit';
import { estimateDelivery, matchDestination, jobTypeOf } from '../delivery';
import { boardSaving } from '../sustainability';
import { fallbackBlankSize, getBlankSizeCm } from '../blankSize';
import { designerLeadSubmissionSchema, formatDesignerLeadForSheet } from '@/lib/designerLeadSchema';
import type { BoxDesign, BoxTemplate } from '@/types/boxDesigner';

const design: BoxDesign = { ...DEFAULT_DESIGN };

describe('units', () => {
  it('converts cm to and from mm / in', () => {
    expect(toUnit(30, 'mm')).toBe(300);
    expect(toUnit(25.4, 'in')).toBe(10);
    expect(fromUnit(300, 'mm')).toBe(30);
    expect(fromUnit(10, 'in')).toBe(25.4);
  });
  it('parses typed values with commas and unit suffixes', () => {
    expect(parseLength('12,5', 'cm')).toBe(12.5);
    expect(parseLength(' 300 mm', 'mm')).toBe(30);
    expect(Number.isNaN(parseLength('abc', 'cm'))).toBe(true);
    expect(Number.isNaN(parseLength('-4', 'cm'))).toBe(true);
  });
  it('formats dimensions and limits per unit', () => {
    expect(formatDimensions({ length: 30, width: 20, height: 15 }, 'mm')).toBe('300 × 200 × 150 mm');
    expect(limitsInUnit({ min: 5, max: 100 }, 'mm')).toEqual({ min: 50, max: 1000, step: 5 });
  });
});

describe('blank size adapter', () => {
  it('gives a positive area for every style', () => {
    const styles: BoxTemplate[] = ['rsc', 'hsc', 'fol', 'sleeve', 'telescope', 'mailer', 'pizza', 'tray'];
    for (const template of styles) {
      const b = fallbackBlankSize({ ...design, template });
      expect(b.areaM2).toBeGreaterThan(0);
    }
  });
  it('orders slotted styles by board use: sleeve < hsc < rsc < fol', () => {
    const area = (template: BoxTemplate) => getBlankSizeCm({ ...design, template }).areaM2;
    expect(area('sleeve')).toBeLessThan(area('hsc'));
    expect(area('hsc')).toBeLessThan(area('rsc'));
    expect(area('rsc')).toBeLessThan(area('fol'));
    expect(getBlankSizeCm({ ...design, template: 'telescope' }).pieces).toBe(2);
  });
});

describe('pricing', () => {
  it('picks the right quantity slab', () => {
    expect(tierFor(50)).toBe(100);
    expect(tierFor(500)).toBe(500);
    expect(tierFor(4999)).toBe(1000);
    expect(tierFor(20000)).toBe(5000);
  });
  it('gets cheaper per box with quantity and more expensive with ply', () => {
    const tiers = estimateTiers(design);
    expect(tiers.map((t) => t.tier)).toEqual([...QUANTITY_TIERS]);
    for (let i = 1; i < tiers.length; i++) expect(tiers[i].estimate.perBox).toBeLessThan(tiers[i - 1].estimate.perBox);
    const p3 = estimatePrice({ ...design, ply: '3-ply', flutes: ['B'], quantity: 1000 }).perBox;
    const p7 = estimatePrice({ ...design, ply: '7-ply', flutes: ['C', 'B', 'C'], quantity: 1000 }).perBox;
    expect(p7).toBeGreaterThan(p3);
  });
  it('adds print and setup cost for artwork and a range around the midpoint', () => {
    const plain = estimatePrice({ ...design, quantity: 500 });
    const printed = estimatePrice({
      ...design,
      quantity: 500,
      faceImages: [{ face: 'front', imageUrl: 'data:image/png;base64,AA==', position: { x: 0.5, y: 0.5 }, scale: 1, rotation: 0 }],
    });
    expect(printed.colours).toBe(4);
    expect(printed.setup).toBeGreaterThan(0);
    expect(printed.perBox).toBeGreaterThan(plain.perBox);
    expect(plain.low).toBeLessThan(plain.perBox);
    expect(plain.high).toBeGreaterThan(plain.perBox);
    expect(plain.total).toBe(Math.round(plain.perBox * 500));
  });
  it('counts print colours from text and coloured board', () => {
    expect(countPrintColours(design)).toBe(0);
    expect(countPrintColours({ ...design, colorHex: '#2E4F7F' })).toBe(1);
    const t = { id: 'a', face: 'front' as const, text: 'Hi', font: 'Inter', size: 20, color: '#111111', position: { x: 0, y: 0 }, rotation: 0, align: 'left' as const };
    expect(countPrintColours({ ...design, textElements: [t, { ...t, id: 'b', color: '#ff0000' }] })).toBe(2);
  });
  it('is never NaN for odd quantities', () => {
    expect(Number.isFinite(estimatePrice({ ...design, quantity: NaN }).perBox)).toBe(true);
  });
});

describe('strength', () => {
  it('follows McKee', () => {
    expect(boxCompressionN('5-ply', 6.6, 1000)).toBeCloseTo(5.87 * 7.5 * Math.sqrt(6600), 3);
    expect(boxCompressionN('3-ply', 0, 1000)).toBe(0);
  });
  it('stronger board stacks higher', () => {
    const a = assessStrength({ ...design, ply: '3-ply', flutes: ['B'] }, 5);
    const b = assessStrength({ ...design, ply: '7-ply', flutes: ['C', 'B', 'C'] }, 5);
    expect(b.bctN).toBeGreaterThan(a.bctN);
    expect(b.stackHigh).toBeGreaterThanOrEqual(a.stackHigh);
    expect(a.headline).toMatch(/stack \d+ high/);
  });
  it('flags overload and suggests a stronger ply', () => {
    const r = assessStrength({ ...design, ply: '3-ply', flutes: ['B'] }, 15);
    expect(r.rating).toBe('overloaded');
    expect(r.suggestPly).toBe('5-ply');
    expect(suggestPly(45)).toBe('7-ply');
    expect(suggestPly(7, true)).toBe('5-ply');
  });
});

describe('fit checker', () => {
  it('adds padding and ease, rounds up and puts the longer side first', () => {
    const r = recommendInsideSize({ product: { length: 18, width: 24, height: 9.2 }, paddingCm: 1, fragile: false });
    expect(r.inside).toEqual({ length: 26.5, width: 20.5, height: 11.5 });
  });
  it('raises padding for fragile goods', () => {
    const r = recommendInsideSize({ product: { length: 20, width: 10, height: 10 }, paddingCm: 0.5, fragile: true, weightKg: 7 });
    expect(r.paddingCm).toBe(FRAGILE_MIN_PADDING_CM);
    expect(r.paddingRaised).toBe(true);
    expect(r.suggestedPly).toBe('5-ply');
  });
  it('flags products too big for the designer', () => {
    expect(recommendInsideSize({ product: { length: 120, width: 10, height: 10 }, paddingCm: 1, fragile: false }).tooLarge).toBe(true);
  });
});

describe('delivery', () => {
  it('matches cities by name and pincode', () => {
    const surat = matchDestination('surat');
    expect(surat.kind === 'city' && surat.city.id).toBe('surat');
    const gnr = matchDestination('382010');
    expect(gnr.kind === 'city' && gnr.city.id).toBe('gandhinagar');
    expect(matchDestination('380015').kind).toBe('city');
    expect(matchDestination('400001').kind).toBe('india');
    expect(matchDestination('365601').kind).toBe('gujarat');
    expect(matchDestination('').kind).toBe('unknown');
  });
  it('adds production days to transit', () => {
    const plain = estimateDelivery('Ahmedabad', 'plain');
    expect(plain.total).toEqual([4, 7]);
    expect(estimateDelivery('', 'printed').total).toBeNull();
    expect(jobTypeOf({ template: 'mailer', faceImages: [], textElements: [] })).toBe('dieCut');
  });
});

describe('sustainability', () => {
  it('reports board saved against the next standard size', () => {
    const own = boardSaving({ ...design, dimensions: { length: 27, width: 18, height: 12 } });
    expect(own.standard).toEqual({ length: 30, width: 20, height: 15 });
    expect(own.savedPct).toBeGreaterThan(0);
    expect(boardSaving(design).isStandard).toBe(true);
    expect(boardSaving({ ...design, dimensions: { length: 100, width: 100, height: 100 } }).standard).toBeNull();
  });
});

describe('designer lead schema', () => {
  const lead = {
    kind: 'designer',
    name: 'Asha Patel',
    phone: '98250 12345',
    email: '',
    quantity: 1000,
    place: 'Surat',
    sample: true,
    note: '',
    spec: { style: 'rsc', l: 300, w: 200, h: 150, unit: 'cm', ply: '5-ply', flutes: 'BC', colour: '#C9A87C', finish: 'matte', printColours: 0, images: 0, texts: 0, name: '' },
    shareUrl: 'https://vayupackaging.com/box-designer#design=abc_DEF-123',
    preview: 'data:image/jpeg;base64,/9j/4AAQ',
    website: '',
    elapsedMs: 9000,
  };
  it('accepts a valid enquiry and formats it for the sheet', () => {
    const parsed = designerLeadSubmissionSchema.safeParse(lead);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const row = formatDesignerLeadForSheet(parsed.data);
      expect(row.phone).toBe('9825012345');
      expect(row.requirements).toContain('300 × 200 × 150 mm');
    }
  });
  it('rejects foreign links, script previews and bad phones', () => {
    expect(designerLeadSubmissionSchema.safeParse({ ...lead, shareUrl: 'javascript:alert(1)' }).success).toBe(false);
    expect(designerLeadSubmissionSchema.safeParse({ ...lead, preview: 'data:text/html;base64,PHNjcmlwdD4=' }).success).toBe(false);
    expect(designerLeadSubmissionSchema.safeParse({ ...lead, phone: '12345' }).success).toBe(false);
  });
});

describe('compare-quote prefill from a design', () => {
  it('round-trips size, ply, style and quantity through the finder parser', async () => {
    const { finderHrefFromDesign, parseFinderPrefill } = await import('@/lib/finderPrefill');
    const href = finderHrefFromDesign({ ...design, template: 'mailer', quantity: 2000 });
    expect(href.startsWith('/compare-quote?')).toBe(true);
    expect(parseFinderPrefill(href.split('?')[1])).toEqual({
      length_mm: 300,
      width_mm: 200,
      height_mm: 150,
      ply: '5-ply',
      style: 'mailer',
      quantity: 2000,
    });
  });
});
