/**
 * Product Catalog Schema
 * ItemList schema for displaying product catalog in search results
 */

import { SEO_CONFIG } from '../config';

export const getProductCatalogSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Vayu Packaging Solutions - Product Catalog',
  description: 'Complete range of packaging materials including corrugated boxes, tapes, stretch films, bubble wraps, and strapping materials',
  numberOfItems: 10,
  itemListElement: [
    // Corrugated Boxes
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'Product',
        name: '3-Ply Corrugated Boxes',
        image: `${SEO_CONFIG.siteUrl}/src/assets/Products/PROD-1.png`,
        description: 'Lightweight single wall corrugated boxes for small to medium products',
        offers: {
          '@type': 'Offer',
          price: 'Contact for quote',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'Product',
        name: '5-Ply Corrugated Boxes',
        image: `${SEO_CONFIG.siteUrl}/src/assets/Products/PROD-2.png`,
        description: 'Double wall boxes for heavy products and electronics',
        offers: {
          '@type': 'Offer',
          price: 'Contact for quote',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'Product',
        name: '7-Ply Corrugated Boxes',
        image: `${SEO_CONFIG.siteUrl}/src/assets/Products/PROD-3.png`,
        description: 'Heavy-duty triple wall boxes for export and industrial use',
        offers: {
          '@type': 'Offer',
          price: 'Contact for quote',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 4,
      item: {
        '@type': 'Product',
        name: 'Die-Cut Custom Boxes',
        image: `${SEO_CONFIG.siteUrl}/src/assets/Products/PROD-4.png`,
        description: 'Custom-shaped boxes for perfect product fit',
        offers: {
          '@type': 'Offer',
          price: 'Contact for quote',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 5,
      item: {
        '@type': 'Product',
        name: 'Printed Packaging Boxes',
        image: `${SEO_CONFIG.siteUrl}/src/assets/Products/PROD-5.png`,
        description: 'Full-color branded corrugated boxes',
        offers: {
          '@type': 'Offer',
          price: 'Contact for quote',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 6,
      item: {
        '@type': 'Product',
        name: 'Food-Grade Boxes',
        image: `${SEO_CONFIG.siteUrl}/src/assets/Products/PROD-6.png`,
        description: 'FSSAI certified boxes for food packaging',
        offers: {
          '@type': 'Offer',
          price: 'Contact for quote',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        },
      },
    },
    // Packaging Materials
    {
      '@type': 'ListItem',
      position: 7,
      item: {
        '@type': 'Product',
        name: 'BOPP Packaging Tape',
        image: `${SEO_CONFIG.siteUrl}/og-image.jpg`,
        description: 'High-quality adhesive tape for box sealing',
        offers: {
          '@type': 'Offer',
          price: 'Contact for quote',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 8,
      item: {
        '@type': 'Product',
        name: 'Stretch Film',
        image: `${SEO_CONFIG.siteUrl}/og-image.jpg`,
        description: 'Pallet wrap and bundling stretch film',
        offers: {
          '@type': 'Offer',
          price: 'Contact for quote',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 9,
      item: {
        '@type': 'Product',
        name: 'Bubble Wrap',
        image: `${SEO_CONFIG.siteUrl}/og-image.jpg`,
        description: 'Protective bubble packaging for fragile items',
        offers: {
          '@type': 'Offer',
          price: 'Contact for quote',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 10,
      item: {
        '@type': 'Product',
        name: 'PP Strapping Bands',
        image: `${SEO_CONFIG.siteUrl}/og-image.jpg`,
        description: 'Durable strapping for heavy-duty packaging',
        offers: {
          '@type': 'Offer',
          price: 'Contact for quote',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        },
      },
    },
  ],
});

export default getProductCatalogSchema;
