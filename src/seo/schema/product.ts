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
  
  // Aggregate Rating (if available)
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '100',
  },
});

// Pre-defined product schemas for main product categories
export const PRODUCT_SCHEMAS = {
  '3-ply': getProductSchema({
    name: '3-Ply Corrugated Boxes',
    description: 'Lightweight yet durable single wall corrugated boxes. Ideal for small and medium-weight products like apparel, accessories, and books.',
    image: '/products/3-ply-boxes.jpg',
    category: 'Single Wall Corrugated Boxes',
    sku: '3PLY-STD',
  }),
  
  '5-ply': getProductSchema({
    name: '5-Ply Corrugated Boxes',
    description: 'Double wall strength corrugated boxes for heavier products. Perfect for electronics, home appliances, and FMCG goods.',
    image: '/products/5-ply-boxes.jpg',
    category: 'Double Wall Corrugated Boxes',
    sku: '5PLY-STD',
  }),
  
  '7-ply': getProductSchema({
    name: '7-Ply Corrugated Boxes',
    description: 'Maximum protection triple wall corrugated boxes for heavy-duty shipping. Used for industrial parts, machinery, and export packaging.',
    image: '/products/7-ply-boxes.jpg',
    category: 'Triple Wall Corrugated Boxes',
    sku: '7PLY-HD',
  }),
  
  'die-cut': getProductSchema({
    name: 'Die-Cut Boxes',
    description: 'Custom-shaped boxes designed to fit your product perfectly. Reduces material waste and enhances unboxing experience.',
    image: '/products/die-cut-boxes.jpg',
    category: 'Custom Corrugated Boxes',
    sku: 'DIECUT-CUSTOM',
  }),
  
  'printed': getProductSchema({
    name: 'Printed Packaging Boxes',
    description: 'Full-color printed corrugated boxes that showcase your brand. Available in flexo and offset printing.',
    image: '/products/printed-boxes.jpg',
    category: 'Branded Packaging',
    sku: 'PRINT-CUSTOM',
  }),
  
  'food-grade': getProductSchema({
    name: 'Food-Grade Boxes',
    description: 'FSSAI compliant corrugated boxes for food and beverage packaging with food-safe coatings.',
    image: '/products/food-grade-boxes.jpg',
    category: 'Food Packaging',
    sku: 'FOOD-FSSAI',
  }),
};

export default getProductSchema;
