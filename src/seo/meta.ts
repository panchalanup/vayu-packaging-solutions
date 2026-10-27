/**
 * Pure helpers that turn page data into final <head> values.
 * Used by the runtime <MetaTags> component AND the build-time prerender (src/seo/prerender), so a prerendered page
 * and the client-rendered page always carry the same title, canonical and share image.
 * Keep free of React and browser globals.
 */

import { SEO_CONFIG } from './config';

/** Longest title (brand included) that search results show without cutting it off, roughly 600px */
export const TITLE_BUDGET = 70;

/**
 * Shortens a long page title to its main clause: "Understanding Flutes: A Complete Guide for Buyers" becomes
 * "Understanding Flutes". Splits at the first colon, dash or question mark when the first part is a real phrase.
 * Titles that already fit, or cannot be split cleanly, come back unchanged.
 */
export function compactTitle(title: string, max = 65): string {
  const t = title.trim();
  if (t.length <= max) return t;
  const m = /^(.{22,}?)(\?|\s[:–—-]\s|:\s)/.exec(t);
  if (!m) return t;
  const head = m[2] === '?' ? `${m[1]}?` : m[1];
  return head.length <= max ? head : t;
}

/**
 * "Page title | Brand". The brand is appended only when the whole title still fits the search-result budget, and
 * titles that already carry a separator are used as written. Over-long titles are first compacted (see compactTitle).
 */
export function buildFullTitle(title: string): string {
  if (title.includes('|')) return title;
  const t = compactTitle(title);
  const withBrand = `${t} | ${SEO_CONFIG.siteName}`;
  return withBrand.length <= TITLE_BUDGET ? withBrand : t;
}

/** Absolute URL for a site path, or the URL unchanged when it is already absolute */
export const absoluteUrl = (pathOrUrl: string): string => {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SEO_CONFIG.siteUrl}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
};

/**
 * Canonical for a path: absolute, no query string or hash, no trailing slash (except the home page).
 * Query strings (utm_*, ?template=, ?style=) must never become the canonical URL.
 */
export const canonicalFor = (pathOrUrl: string): string => {
  const full = absoluteUrl(pathOrUrl).replace(/[?#].*$/, '');
  const trimmed = full.replace(/\/+$/, '');
  return trimmed === SEO_CONFIG.siteUrl ? `${SEO_CONFIG.siteUrl}/` : trimmed;
};

// Page metadata names per-page OG files that were never created (/og-about.jpg ...), so only paths that really exist
// in /public are used; anything else falls back to the default image.
// VERIFY-LATER[SEO-01]: design per-page OG images (1200x630) and add them to KNOWN_OG_IMAGES.
const KNOWN_OG_IMAGES = ['/og-image.jpg'];
// /blog-images/*-og.png are exported from the blog illustrations (scripts/illustrations/export-seo.mjs)
const BLOG_OG = /^\/blog-images\/[a-z0-9-]+-og\.png$/;
// /og/box-designer-*.png are the designer landing share cards (scripts/illustrations/export-designer-og.mjs)
const DESIGNER_OG = /^\/og\/box-designer-[a-z0-9-]+\.png$/;

/** Share-image path that is known to exist, else the default */
export const resolveOgImagePath = (image?: string): string => {
  if (!image) return SEO_CONFIG.defaultImage;
  if (/^https?:\/\//i.test(image) || KNOWN_OG_IMAGES.includes(image) || BLOG_OG.test(image) || DESIGNER_OG.test(image)) return image;
  return SEO_CONFIG.defaultImage;
};

export const resolveOgImageUrl = (image?: string): string => absoluteUrl(resolveOgImagePath(image));
