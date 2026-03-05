/**
 * SEO TypeScript Types
 * Type definitions for SEO-related functionality
 */

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  image?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export interface OpenGraphMetadata {
  type?: 'website' | 'article' | 'product';
  title: string;
  description: string;
  url: string;
  image: string;
  imageWidth?: number;
  imageHeight?: number;
  siteName?: string;
  locale?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

export interface TwitterCardMetadata {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  creator?: string;
  title: string;
  description: string;
  image: string;
}

export interface StructuredDataProps {
  type: 'Organization' | 'LocalBusiness' | 'Product' | 'Article' | 'BreadcrumbList' | 'FAQPage' | 'BlogPosting';
  data: any;
}

export interface MetaTagsProps {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}
