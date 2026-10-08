/**
 * Product page schema, generated from src/content/products.ts so structured data only ever describes
 * products that are visible on the page (plan §11.5, fixes T7).
 * SECURITY: values come from static first-party content; JSON-LD is serialised with JSON.stringify
 * by <StructuredData>, never concatenated into HTML.
 */

import { SEO_CONFIG } from '../config';
import { PRODUCTS, type Product } from '@/content/products';

const abs = (path: string) => (path.startsWith('http') ? path : `${SEO_CONFIG.siteUrl}${path}`);

// VERIFY-LATER[SEO-02]: SEO_CONFIG.aggregateRating (4.8 / 150) is not backed by visible reviews, so it is
// deliberately NOT emitted here. Add aggregateRating only when real, visible reviews exist.
// Price is omitted on purpose: prices are quoted, and "Contact for quote" is not a valid schema.org price.
export function getProductDetailSchema(product: Product) {
  const url = `${SEO_CONFIG.siteUrl}/products/${product.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    description: product.short,
    // Stable, crawlable raster export of the illustration (npm run illustrations:seo). The bundled SVG URL is hashed per build.
    image: abs(`/images/products/${product.slug}.png`),
    category: product.group === 'box' ? 'Corrugated boxes' : 'Packaging supplies',
    sku: product.slug,
    url,
    brand: { '@type': 'Brand', name: SEO_CONFIG.organizationName },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: SEO_CONFIG.organizationName },
      ...(product.moqUnits
        ? { eligibleQuantity: { '@type': 'QuantitativeValue', minValue: product.moqUnits, unitText: 'boxes' } }
        : {}),
    },
  };
}

/** ItemList of every product card shown on /products (all 10 are visible there) */
export function getProductListSchema(products: Product[] = PRODUCTS) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Vayu Packaging Solutions product range',
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SEO_CONFIG.siteUrl}/products/${p.slug}`,
      name: p.name,
    })),
  };
}
