/**
 * quotePrefill: URL pre-fill parsing and quoteHref building.
 * SECURITY under test: every value from the URL is checked against an allow-list or numeric range;
 * anything else is dropped (never passed through to the form).
 */

import { describe, expect, it } from 'vitest';
import { parseQuotePrefill, quoteHref } from '../quotePrefill';

describe('parseQuotePrefill', () => {
  it('returns an empty object for an empty query', () => {
    expect(parseQuotePrefill('')).toEqual({});
    expect(parseQuotePrefill('?')).toEqual({});
  });

  it('accepts allow-listed values and numeric sizes', () => {
    expect(parseQuotePrefill('?intent=sample&product=5-ply&qty=1k-5k&l=300&w=200&h=150&industry=fmcg&src=home.hero.quote')).toEqual({
      intent: 'sample',
      product: '5-ply',
      qty: '1k-5k',
      l: 300,
      w: 200,
      h: 150,
      industry: 'fmcg',
      src: 'home.hero.quote',
    });
  });

  it('rejects an unknown product, intent and industry', () => {
    expect(parseQuotePrefill('?product=11-ply&intent=hack&industry=weapons')).toEqual({});
  });

  it('rejects javascript: and markup in every text parameter', () => {
    const enc = encodeURIComponent;
    const result = parseQuotePrefill(
      `?product=${enc('javascript:alert(1)')}&intent=${enc('<img onerror=x>')}&industry=${enc('javascript:1')}&src=${enc('javascript:alert(1)')}&ply=${enc('<script>')}`
    );
    expect(result).toEqual({});
  });

  it('rejects an unsafe src (uppercase, spaces, slashes, too long)', () => {
    expect(parseQuotePrefill('?src=Has%20Space').src).toBeUndefined();
    expect(parseQuotePrefill('?src=a%2Fb').src).toBeUndefined();
    expect(parseQuotePrefill(`?src=${'a'.repeat(61)}`).src).toBeUndefined();
    expect(parseQuotePrefill(`?src=${'a'.repeat(60)}`).src).toHaveLength(60);
  });

  it('drops sizes outside 10 to 5000 mm and non-numbers', () => {
    expect(parseQuotePrefill('?l=9&w=5001&h=abc')).toEqual({});
    expect(parseQuotePrefill('?l=-100&w=Infinity&h=NaN')).toEqual({});
    expect(parseQuotePrefill('?l=10&w=5000')).toEqual({ l: 10, w: 5000 });
  });

  it('rounds decimal sizes', () => {
    expect(parseQuotePrefill('?l=300.6')).toEqual({ l: 301 });
  });

  it('maps ply=3|5|7 to a product', () => {
    expect(parseQuotePrefill('?ply=5').product).toBe('5-ply');
    expect(parseQuotePrefill('?ply=7-ply').product).toBe('7-ply');
    expect(parseQuotePrefill('?ply=9').product).toBeUndefined();
  });

  it('prefers an explicit product over ply', () => {
    expect(parseQuotePrefill('?product=die-cut&ply=5').product).toBe('die-cut');
  });

  describe('quantity bands', () => {
    const band = (qty: string) => parseQuotePrefill(`?qty=${qty}`).qty;

    it('keeps a valid band as is', () => {
      expect(band('recurring')).toBe('recurring');
      expect(band('25k%2B')).toBe('25k+');
    });

    it('turns a raw number into a band at the boundaries', () => {
      expect(band('500')).toBe('500-1k');
      expect(band('999')).toBe('500-1k');
      expect(band('1000')).toBe('1k-5k');
      expect(band('4999')).toBe('1k-5k');
      expect(band('5000')).toBe('5k-25k');
      expect(band('24999')).toBe('5k-25k');
      expect(band('25000')).toBe('25k+');
    });

    it('ignores zero, negatives and text', () => {
      expect(band('0')).toBeUndefined();
      expect(band('-5')).toBeUndefined();
      expect(band('lots')).toBeUndefined();
    });
  });
});

describe('quoteHref', () => {
  it('returns /quote when there is nothing to add', () => {
    expect(quoteHref()).toBe('/quote');
    expect(quoteHref({ product: undefined, src: '' })).toBe('/quote');
  });

  it('builds a stable, readable URL', () => {
    expect(quoteHref({ src: 'finder.result', product: '5-ply', l: 300, qty: 2000 })).toBe(
      '/quote?product=5-ply&qty=1k-5k&l=300&src=finder.result'
    );
  });

  it('drops unknown keys and off-list values instead of passing them through', () => {
    const href = quoteHref({
      product: 'javascript:alert(1)',
      src: '<script>',
      redirect: 'https://evil.example',
      l: 99999,
      industry: 'fmcg',
    });
    expect(href).toBe('/quote?industry=fmcg');
  });

  it('round-trips through parseQuotePrefill', () => {
    const href = quoteHref({ intent: 'callback', product: '7-ply', qty: 30000, l: 450, w: 300, h: 200, industry: 'pharma', src: 'x.y' });
    expect(parseQuotePrefill(href.split('?')[1])).toEqual({
      intent: 'callback',
      product: '7-ply',
      qty: '25k+',
      l: 450,
      w: 300,
      h: 200,
      industry: 'pharma',
      src: 'x.y',
    });
  });

  it('only ever produces an internal path', () => {
    expect(quoteHref({ src: '//evil.example' })).toBe('/quote');
    expect(quoteHref({ src: 'ok' }).startsWith('/quote')).toBe(true);
  });
});
