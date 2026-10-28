/**
 * Site-level schema: WebSite (home page) and Blog (blog index, referenced by every Article's isPartOf).
 */

import { SEO_CONFIG } from '../config';
import type { BlogPost } from '@/constants/blogs';

export const getWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SEO_CONFIG.siteUrl}/#website`,
  url: `${SEO_CONFIG.siteUrl}/`,
  name: SEO_CONFIG.siteName,
  inLanguage: SEO_CONFIG.defaultLanguage,
  publisher: { '@type': 'Organization', name: SEO_CONFIG.organizationName, url: SEO_CONFIG.siteUrl },
});

export const getBlogIndexSchema = (posts: Pick<BlogPost, 'slug' | 'title' | 'description' | 'date' | 'updated'>[]) => ({
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': `${SEO_CONFIG.siteUrl}/blogs#blog`,
  url: `${SEO_CONFIG.siteUrl}/blogs`,
  name: 'Vayu Packaging Blog',
  description: 'Plain-language guides on corrugated boxes, board and strength, sizing, and designing boxes in 3D.',
  inLanguage: SEO_CONFIG.defaultLanguage,
  publisher: { '@type': 'Organization', name: SEO_CONFIG.organizationName, url: SEO_CONFIG.siteUrl },
  blogPost: posts.map((p) => ({
    '@type': 'BlogPosting',
    headline: p.title,
    description: p.description,
    url: `${SEO_CONFIG.siteUrl}/blogs/${p.slug}`,
    datePublished: p.date,
    dateModified: p.updated ?? p.date,
  })),
});
