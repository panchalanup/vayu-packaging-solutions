/**
 * Article Schema
 * Schema.org structured data for blog posts
 */

import { SEO_CONFIG } from '../config';
import { BlogPost } from '@/constants/blogs';
import { compactTitle } from '../meta';

/** "8 min read" to ISO 8601 "PT8M" (schema.org timeRequired) */
export const readingTimeToIso = (readingTime: string): string | undefined => {
  const m = /(\d+)/.exec(readingTime);
  return m ? `PT${m[1]}M` : undefined;
};

export interface ArticleSchemaExtras {
  /** Words in the article body, counted from the markdown */
  wordCount?: number;
  /** Keywords for the article (from BLOG_SEO_METADATA); defaults to the title */
  keywords?: string[];
  /** Reading time in minutes counted from the markdown; defaults to the registry's readingTime string */
  readingMinutes?: number;
}

/** `ogImage`: the article's exported /blog-images/*-og.png (scripts/illustrations/export-seo.mjs), if it has one */
export const getArticleSchema = (post: BlogPost, ogImage?: string, extras: ArticleSchemaExtras = {}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  '@id': `${SEO_CONFIG.siteUrl}/blogs/${post.slug}#article`,
  // Google asks for headlines under 110 characters
  headline: post.title.length <= 110 ? post.title : compactTitle(post.title, 110),
  description: post.description,
  image: {
    '@type': 'ImageObject',
    // Only exported OG rasters are trusted; anything else falls back to the default share image
    url: `${SEO_CONFIG.siteUrl}${ogImage && /^\/blog-images\/[a-z0-9-]+-og\.png$/.test(ogImage) ? ogImage : SEO_CONFIG.defaultImage}`,
    width: 1200,
    height: 630,
  },
  
  // Author
  author: {
    '@type': 'Organization',
    name: post.author,
    url: SEO_CONFIG.siteUrl,
  },
  
  // Publisher
  publisher: {
    '@type': 'Organization',
    name: SEO_CONFIG.organizationName,
    logo: {
      '@type': 'ImageObject',
      url: `${SEO_CONFIG.siteUrl}${SEO_CONFIG.logo}`,
      width: 400,
      height: 100,
    },
  },
  
  // Dates
  datePublished: post.date,
  dateModified: post.updated ?? post.date,
  
  // Article Details
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${SEO_CONFIG.siteUrl}/blogs/${post.slug}`,
  },
  
  // Category
  articleSection: post.category,
  
  // Keywords
  keywords: extras.keywords?.length ? extras.keywords.join(', ') : post.title,
  ...(extras.wordCount ? { wordCount: extras.wordCount } : {}),
  
  // Reading Time (ISO 8601 duration)
  timeRequired: extras.readingMinutes ? `PT${extras.readingMinutes}M` : readingTimeToIso(post.readingTime),
  
  // Language
  inLanguage: 'en-IN',
  
  // Is Part Of
  isPartOf: {
    '@type': 'Blog',
    '@id': `${SEO_CONFIG.siteUrl}/blogs#blog`,
    name: 'Vayu Packaging Blog',
  },
});

export const getBlogPostingSchema = (post: BlogPost) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  '@id': `${SEO_CONFIG.siteUrl}/blogs/${post.slug}#blogposting`,
  headline: post.title,
  description: post.description,
  image: `${SEO_CONFIG.siteUrl}/blog-images/${post.slug}-hero.jpg`,
  
  author: {
    '@type': 'Organization',
    name: post.author,
    url: SEO_CONFIG.siteUrl,
  },
  
  publisher: {
    '@type': 'Organization',
    name: SEO_CONFIG.organizationName,
    logo: {
      '@type': 'ImageObject',
      url: `${SEO_CONFIG.siteUrl}${SEO_CONFIG.logo}`,
    },
  },
  
  datePublished: post.date,
  dateModified: post.date,
  
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${SEO_CONFIG.siteUrl}/blogs/${post.slug}`,
  },
  
  articleBody: 'Full article content here', // Will be populated with actual content
  wordCount: 2000, // Update based on actual word count
  
  about: {
    '@type': 'Thing',
    name: 'Corrugated Boxes',
  },
  
  mentions: [
    {
      '@type': 'Product',
      name: 'Corrugated Boxes',
    },
  ],
});

export default getArticleSchema;
