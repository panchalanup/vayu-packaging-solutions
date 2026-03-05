/**
 * SEO Module Index
 * Central export point for all SEO functionality
 */

// Configuration
export { SEO_CONFIG, SEO_KEYWORDS, OG_DEFAULTS, TWITTER_DEFAULTS } from './config';

// Metadata
export { PAGE_METADATA, LOCATION_METADATA, INDUSTRY_METADATA, type PageMeta } from './metadata/pages';
export { BLOG_SEO_METADATA, BLOG_CATEGORY_KEYWORDS, BLOG_COMMON_FAQS, type BlogSEOMeta } from './metadata/blogs';

// Schema.org Structured Data
export * from './schema';

// Components (re-export for convenience)
export { MetaTags } from '@/components/SEO/MetaTags';
export { StructuredData } from '@/components/SEO/StructuredData';

// Types
export type {
  SEOMetadata,
  OpenGraphMetadata,
  TwitterCardMetadata,
  StructuredDataProps,
  MetaTagsProps,
  BreadcrumbItem,
  FAQItem,
} from '@/types/seo';
