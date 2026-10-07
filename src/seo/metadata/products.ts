/**
 * Product-detail metadata helper (the /products index entry lives in PAGE_METADATA.products).
 * SECURITY: static first-party content only.
 */

import { SEO_CONFIG } from '../config';
import type { PageMeta } from './pages';
import { moqLabel, type Product } from '@/content/products';

export function getProductMetadata(product: Product): PageMeta {
  const isBox = product.group === 'box';
  return {
    title: isBox ? `${product.name} | Custom sizes, ${moqLabel(product)}` : `${product.name} | Packaging supplies`,
    description: `${product.short} ${moqLabel(product)}. ${product.leadTime}. Get a price from Vayu Packaging Solutions, Ahmedabad.`.slice(0, 300),
    keywords: [product.name.toLowerCase(), `${product.name.toLowerCase()} Ahmedabad`, 'Vayu Packaging', ...product.useCases.map((u) => u.toLowerCase())],
    canonical: `${SEO_CONFIG.siteUrl}/products/${product.slug}`,
    ogImage: SEO_CONFIG.defaultImage,
  };
}
