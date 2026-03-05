/**
 * Breadcrumb Schema
 * Schema.org structured data for breadcrumb navigation
 */

import { SEO_CONFIG } from '../config';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export const getBreadcrumbSchema = (items: BreadcrumbItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url.startsWith('http') ? item.url : `${SEO_CONFIG.siteUrl}${item.url}`,
  })),
});

// Common breadcrumb patterns
export const PAGE_BREADCRUMBS = {
  home: [
    { name: 'Home', url: '/' },
  ],
  
  about: [
    { name: 'Home', url: '/' },
    { name: 'About Us', url: '/about' },
  ],
  
  products: [
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
  ],
  
  services: [
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
  ],
  
  blogs: [
    { name: 'Home', url: '/' },
    { name: 'Blogs', url: '/blogs' },
  ],
  
  contact: [
    { name: 'Home', url: '/' },
    { name: 'Contact Us', url: '/contact' },
  ],
};

// Helper to generate blog breadcrumbs
export const getBlogBreadcrumbs = (blogTitle: string, blogSlug: string): BreadcrumbItem[] => [
  { name: 'Home', url: '/' },
  { name: 'Blogs', url: '/blogs' },
  { name: blogTitle, url: `/blogs/${blogSlug}` },
];

// Helper to generate product breadcrumbs
export const getProductBreadcrumbs = (productName: string, productId?: string): BreadcrumbItem[] => [
  { name: 'Home', url: '/' },
  { name: 'Products', url: '/products' },
  { name: productName, url: productId ? `/products/${productId}` : '/products' },
];

export default getBreadcrumbSchema;
