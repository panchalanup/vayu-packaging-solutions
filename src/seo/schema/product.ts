/**
 * Product Schema
 * Schema.org structured data for product pages
 */

import { SEO_CONFIG } from '../config';

export interface ProductSchemaData {
  name: string;
  description: string;
  image: string;
  sku?: string;
  category?: string;
  brand?: string;
  offers?: {
    price?: string;
    priceCurrency?: string;
    availability?: string;
    priceValidUntil?: string;
  };
}

export const getProductSchema = (product: ProductSchemaData) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: product.image,
  
  // Brand
  brand: {
    '@type': 'Brand',
    name: product.brand || SEO_CONFIG.organizationName,
  },
  
  // Manufacturer
  manufacturer: {
    '@type': 'Organization',
    name: SEO_CONFIG.organizationName,
  },
  
  // SKU
  sku: product.sku || product.name.toLowerCase().replace(/\s+/g, '-'),
  
  // Category
  category: product.category || 'Corrugated Boxes',
  
  // Offers
  offers: {
    '@type': 'Offer',
    url: SEO_CONFIG.siteUrl,
    priceCurrency: product.offers?.priceCurrency || 'INR',
    price: product.offers?.price || 'Contact for quote',
    availability: product.offers?.availability || 'https://schema.org/InStock',
    priceValidUntil: product.offers?.priceValidUntil,
    seller: {
      '@type': 'Organization',
      name: SEO_CONFIG.organizationName,
    },
  },
  
  // Aggregate Rating
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: SEO_CONFIG.aggregateRating.ratingValue,
    reviewCount: SEO_CONFIG.aggregateRating.reviewCount,
    bestRating: SEO_CONFIG.aggregateRating.bestRating,
    worstRating: SEO_CONFIG.aggregateRating.worstRating,
  },
});

// Pre-defined product schemas for main product categories
export const PRODUCT_SCHEMAS = {
  // Corrugated Boxes
  '3-ply': getProductSchema({
    name: '3-Ply Corrugated Boxes',
    description: 'Lightweight yet durable single wall corrugated boxes. Ideal for small and medium-weight products like apparel, accessories, and books.',
    image: `${SEO_CONFIG.siteUrl}/src/assets/Products/PROD-1.png`,
    category: 'Single Wall Corrugated Boxes',
    sku: '3PLY-STD',
  }),
  
  '5-ply': getProductSchema({
    name: '5-Ply Corrugated Boxes',
    description: 'Double wall strength corrugated boxes for heavier products. Perfect for electronics, home appliances, and FMCG goods.',
    image: `${SEO_CONFIG.siteUrl}/src/assets/Products/PROD-2.png`,
    category: 'Double Wall Corrugated Boxes',
    sku: '5PLY-STD',
  }),
  
  '7-ply': getProductSchema({
    name: '7-Ply Corrugated Boxes',
    description: 'Maximum protection triple wall corrugated boxes for heavy-duty shipping. Used for industrial parts, machinery, and export packaging.',
    image: `${SEO_CONFIG.siteUrl}/src/assets/Products/PROD-3.png`,
    category: 'Triple Wall Corrugated Boxes',
    sku: '7PLY-HD',
  }),
  
  'die-cut': getProductSchema({
    name: 'Die-Cut Boxes',
    description: 'Custom-shaped boxes designed to fit your product perfectly. Reduces material waste and enhances unboxing experience.',
    image: `${SEO_CONFIG.siteUrl}/src/assets/Products/PROD-4.png`,
    category: 'Custom Corrugated Boxes',
    sku: 'DIECUT-CUSTOM',
  }),
  
  'printed': getProductSchema({
    name: 'Printed Packaging Boxes',
    description: 'Full-color printed corrugated boxes that showcase your brand. Available in flexo and offset printing.',
    image: `${SEO_CONFIG.siteUrl}/src/assets/Products/PROD-5.png`,
    category: 'Branded Packaging',
    sku: 'PRINT-CUSTOM',
  }),
  
  'food-grade': getProductSchema({
    name: 'Food-Grade Boxes',
    description: 'FSSAI compliant corrugated boxes for food and beverage packaging with food-safe coatings.',
    image: `${SEO_CONFIG.siteUrl}/src/assets/Products/PROD-6.png`,
    category: 'Food Packaging',
    sku: 'FOOD-FSSAI',
  }),
  
  // Packaging Materials
  'bopp-tape': getProductSchema({
    name: 'BOPP Packaging Tape',
    description: 'High-quality BOPP (Biaxially Oriented Polypropylene) adhesive tape for secure sealing of corrugated boxes. Available in brown and transparent.',
    image: `${SEO_CONFIG.siteUrl}/og-image.jpg`,
    category: 'Packaging Tapes',
    sku: 'TAPE-BOPP',
  }),
  
  'stretch-film': getProductSchema({
    name: 'Stretch Film',
    description: 'Durable stretch wrap film for pallet wrapping and bundling. Available in manual and machine grade with superior cling properties.',
    image: `${SEO_CONFIG.siteUrl}/og-image.jpg`,
    category: 'Stretch Films',
    sku: 'FILM-STRETCH',
  }),
  
  'bubble-wrap': getProductSchema({
    name: 'Bubble Wrap',
    description: 'Protective bubble packaging in roll or sheet form. Small and large bubble options available. Anti-static variants for electronics.',
    image: `${SEO_CONFIG.siteUrl}/og-image.jpg`,
    category: 'Protective Packaging',
    sku: 'WRAP-BUBBLE',
  }),
  
  'pp-strapping': getProductSchema({
    name: 'PP Strapping Bands',
    description: 'Durable polypropylene strapping for heavy-duty packaging. Ideal for securing large shipments and pallets.',
    image: `${SEO_CONFIG.siteUrl}/og-image.jpg`,
    category: 'Strapping Materials',
    sku: 'STRAP-PP',
  }),
};

export default getProductSchema;
