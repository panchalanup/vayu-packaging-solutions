/**
 * finderPrefill: Packaging Finder hand-off from the URL and the Box Designer's router state.
 * SECURITY under test: URL params and history.state are untrusted; only allow-listed or in-range values survive.
 */

import { describe, expect, it } from 'vitest';
import { designerHref, parseFinderPrefill } from '../finderPrefill';
import { decodeShareHash } from '../boxDesigner/designCodec';

describe('parseFinderPrefill', () => {
  it('returns {} when there is nothing to read', () => {
    expect(parseFinderPrefill('')).toEqual({});
    expect(parseFinderPrefill('', null)).toEqual({});
    expect(parseFinderPrefill('', 'nonsense')).toEqual({});
  });

  it('reads l, w, h (mm), ply, style and qty from the URL', () => {
    expect(parseFinderPrefill('?l=300&w=200&h=150&ply=5&style=RSC&qty=2000')).toEqual({
      length_mm: 300,
      width_mm: 200,
      height_mm: 150,
      ply: '5-ply',
      style: 'rsc',
      quantity: 2000,
    });
  });

  it('accepts ply written as 5-ply', () => {
    expect(parseFinderPrefill('?ply=7-ply').ply).toBe('7-ply');
  });

  it('drops off-list and malicious values', () => {
    const enc = encodeURIComponent;
    expect(parseFinderPrefill(`?ply=${enc('javascript:alert(1)')}&style=${enc('<script>')}&l=9&w=99999&h=abc&qty=-5`)).toEqual({});
  });

  it('caps the quantity', () => {
    expect(parseFinderPrefill('?qty=1000001')).toEqual({});
    expect(parseFinderPrefill('?qty=1000000').quantity).toBe(1_000_000);
  });

  it('converts Box Designer state from cm to mm', () => {
    const state = { boxDesign: { dimensions: { length: 30, width: 20.5, height: 15 }, ply: '3-ply', template: 'hsc', faceImages: [] } };
    expect(parseFinderPrefill('', state)).toEqual({
      length_mm: 300,
      width_mm: 205,
      height_mm: 150,
      ply: '3-ply',
      style: 'hsc',
    });
  });

  it('lets URL params win over router state', () => {
    const state = { boxDesign: { dimensions: { length: 30, width: 20, height: 15 }, ply: '3-ply' } };
    const result = parseFinderPrefill('?l=500&ply=7', state);
    expect(result.length_mm).toBe(500);
    expect(result.width_mm).toBe(200);
    expect(result.ply).toBe('7-ply');
  });

  it('ignores a malformed boxDesign in router state', () => {
    expect(parseFinderPrefill('', { boxDesign: { dimensions: { length: 'x', width: {}, height: null }, ply: 5 } })).toEqual({});
    expect(parseFinderPrefill('', { boxDesign: 'str' })).toEqual({});
    expect(parseFinderPrefill('', { boxDesign: { dimensions: { length: 1e9, width: 0.1, height: -3 } } })).toEqual({});
  });
});

describe('designerHref', () => {
  it('needs all three sizes', () => {
    expect(designerHref({})).toBeNull();
    expect(designerHref({ length_mm: 300, width_mm: 200 })).toBeNull();
  });

  it('links to the designer with a decodable share hash in cm', () => {
    const href = designerHref({ length_mm: 300, width_mm: 200, height_mm: 150 }, '7-ply');
    expect(href).toMatch(/^\/box-designer#design=[A-Za-z0-9_-]+$/);
    const design = decodeShareHash(href!.slice('/box-designer'.length));
    expect(design?.dimensions).toEqual({ length: 30, width: 20, height: 15 });
    expect(design?.ply).toBe('7-ply');
  });

  it('clamps sizes to the designer limits', () => {
    const href = designerHref({ length_mm: 20, width_mm: 4000, height_mm: 150 });
    const design = decodeShareHash(href!.slice('/box-designer'.length));
    expect(design?.dimensions).toEqual({ length: 5, width: 100, height: 15 });
  });
});
