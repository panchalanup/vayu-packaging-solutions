/**
 * Dieline annotations (showcase Phase 0): dimension lines, legend swatches and the print-scale ruler.
 * They sit beside the cut/score lines, so every style gets them without changing the line data the estimate reads.
 */

import { describe, it, expect } from 'vitest';
import { STYLES, getStyle } from '../styles/registry';
import { dielineForDesign } from '../styles/designLayout';
import { DEFAULT_DESIGN } from '../designCodec';
import { dielineToPdf, dielineToSvg, dimGeometry, rulerSegments, type Dieline } from '../dieline';
import type { BoxDesign, BoxTemplate } from '@/types/boxDesigner';

const design = (template: BoxTemplate): BoxDesign => ({ ...DEFAULT_DESIGN, template, dimensions: { ...getStyle(template).defaultDims } });
const number = (text: string) => Number(/(\d+(?:\.\d+)?)/.exec(text)?.[1]);

describe.each(STYLES.map((s) => [s.id, s.name] as const))('dieline annotations: %s', (id) => {
  const d: Dieline = dielineForDesign(design(id));

  it('has dimension lines, a legend and a ruler', () => {
    expect(d.dims?.length).toBeGreaterThan(0);
    expect(d.keys).toHaveLength(3);
    expect(d.ruler).not.toBeNull();
  });

  it('reports each blank piece width and height exactly (blank dimensions equal the piece sizes)', () => {
    const blank = (d.dims ?? []).filter((x) => x.group === 'blank');
    const widths = blank.filter((x) => /width/.test(x.text)).map((x) => number(x.text));
    const heights = blank.filter((x) => /height/.test(x.text)).map((x) => number(x.text));
    const piecesW = d.pieces.map((p) => Math.round(p.width * 10) / 10);
    const piecesH = d.pieces.map((p) => Math.round(p.height * 10) / 10);
    expect(widths).toEqual(piecesW);
    expect(heights).toEqual(piecesH);
  });

  it('keeps every dimension line, label, key and the ruler inside the page', () => {
    const inside = (x: number, y: number) => x >= 0 && x <= d.width && y >= 0 && y <= d.height;
    for (const dim of d.dims ?? []) {
      for (const [a, b, c, e] of dimGeometry(dim).segments) {
        expect(inside(a, b)).toBe(true);
        expect(inside(c, e)).toBe(true);
      }
    }
    for (const k of d.keys ?? []) expect(inside(k.x1, k.y1) && inside(k.x2, k.y2)).toBe(true);
    for (const t of d.labels) expect(inside(t.x, t.y)).toBe(true);
    for (const [a, b, c, e] of rulerSegments(d.ruler!)) expect(inside(a, b) && inside(c, e)).toBe(true);
  });

  it('draws axis-aligned dimension lines only', () => {
    for (const dim of d.dims ?? []) expect(dim.x1 === dim.x2 || dim.y1 === dim.y2).toBe(true);
  });

  it('writes the annotations into the SVG at 1:1 and escapes nothing unsafe', () => {
    const svg = dielineToSvg(d);
    expect(svg).toContain('#0b5cad');
    expect(svg).toContain(`width="${Math.round(d.width * 10) / 10}mm"`);
    expect(svg).not.toMatch(/<script/i);
    expect(svg).toContain('Blank width');
  });
});

describe('print-scale ruler', () => {
  it('is 100 mm on a normal blank and measures 100 mm in the SVG user units (1 unit = 1 mm)', () => {
    const d = dielineForDesign(design('rsc'));
    expect(d.ruler?.length).toBe(100);
    const bar = rulerSegments(d.ruler!)[0];
    expect(bar[2] - bar[0]).toBe(100);
    // 11 ticks: 0, 10 ... 100
    expect(rulerSegments(d.ruler!)).toHaveLength(1 + 11);
  });

  it('shrinks to 50 mm, then disappears, when the blank is too narrow', () => {
    const small = { ...design('mailer'), dimensions: { length: 6, width: 4, height: 2 } };
    const d = dielineForDesign(small);
    expect([100, 50, undefined]).toContain(d.ruler?.length);
    if (d.width - 40 < 50) expect(d.ruler).toBeNull();
  });
});

describe('slotted blank dimension groups', () => {
  const d = dielineForDesign(design('rsc'));
  const group = (g: string) => (d.dims ?? []).filter((x) => x.group === g);

  it('has four panel widths across the top plus the wall height', () => {
    const horizontalPanels = group('panel').filter((x) => x.y1 === x.y2);
    expect(horizontalPanels).toHaveLength(4);
    expect(group('panel').filter((x) => x.x1 === x.x2)).toHaveLength(1);
  });

  it('dimensions the glue flap and both flap depths on a full RSC', () => {
    expect(group('glue')).toHaveLength(1);
    expect(group('depth')).toHaveLength(2);
  });

  it('panel widths and the glue flap add up to the blank width', () => {
    const sum = group('panel').filter((x) => x.y1 === x.y2).reduce((n, x) => n + number(x.text), 0) + number(group('glue')[0].text);
    expect(sum).toBeCloseTo(d.pieces[0].width, 0);
  });
});

describe('dieline PDF', () => {
  it('renders every style with annotations without throwing', async () => {
    for (const s of STYLES) {
      const blob = await dielineToPdf(dielineForDesign(design(s.id)));
      expect(blob.size).toBeGreaterThan(1000);
    }
  });
});
