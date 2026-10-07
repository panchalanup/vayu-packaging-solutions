import { describe, expect, it } from 'vitest';
import { PRODUCT_SLUGS, PRODUCTS, getProduct, getRelatedProducts } from '../products';
import { PRODUCTS as QUOTE_PRODUCTS } from '@/lib/quoteSchema';
import { parseQuotePrefill, quoteHref } from '@/lib/quotePrefill';

describe('products content', () => {
  it('has exactly the agreed slugs, each once', () => {
    expect(PRODUCTS.map((p) => p.slug).sort()).toEqual([...PRODUCT_SLUGS].sort());
    expect(new Set(PRODUCTS.map((p) => p.slug)).size).toBe(PRODUCTS.length);
  });

  it('every product has 2-4 FAQs, specs, an image and valid related slugs', () => {
    for (const p of PRODUCTS) {
      expect(p.faq.length, p.slug).toBeGreaterThanOrEqual(2);
      expect(p.faq.length, p.slug).toBeLessThanOrEqual(4);
      expect(p.specs.length, p.slug).toBeGreaterThan(3);
      expect(p.image.src, p.slug).toBeTruthy();
      expect(getRelatedProducts(p).length, p.slug).toBe(p.related.length);
      expect(p.related, p.slug).not.toContain(p.slug);
    }
  });

  it('supplies carry width, micron, length and core rows', () => {
    for (const slug of ['bopp-tape', 'stretch-film', 'bubble-wrap', 'pp-strapping'] as const) {
      const labels = getProduct(slug)!.specs.map((r) => r.label).join('|');
      expect(labels).toMatch(/Width/);
      expect(labels).toMatch(/micron/i);
      expect(labels).toMatch(/Length/);
      expect(labels).toMatch(/Core/);
    }
  });

  it('ply pages carry a to-scale cross-section; BCT/ECT stay "on request"', () => {
    for (const slug of ['3-ply', '5-ply', '7-ply'] as const) {
      const p = getProduct(slug)!;
      expect(p.crossSection).toBe(slug);
      expect(p.specs.find((r) => r.label === 'BCT / ECT')?.value).toMatch(/on request/i);
    }
  });

  it('quote links are accepted by the quote pre-fill allow-lists', () => {
    for (const p of PRODUCTS) {
      expect(QUOTE_PRODUCTS).toContain(p.quoteProduct);
      const prefill = parseQuotePrefill(quoteHref({ product: p.quoteProduct, src: `product.${p.slug}` }).split('?')[1]);
      expect(prefill.product, p.slug).toBe(p.quoteProduct);
      expect(prefill.src, p.slug).toBe(`product.${p.slug}`);
      const sample = parseQuotePrefill(quoteHref({ intent: 'sample', product: p.quoteProduct, src: `product.${p.slug}.sample` }).split('?')[1]);
      expect(sample.intent, p.slug).toBe('sample');
      expect(sample.src, p.slug).toBe(`product.${p.slug}.sample`);
    }
  });

  it('unknown slugs return undefined', () => {
    expect(getProduct('nope')).toBeUndefined();
    expect(getProduct(undefined)).toBeUndefined();
    expect(getProduct('__proto__')).toBeUndefined();
  });
});
