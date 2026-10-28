/**
 * Turns the built SPA shell (dist/index.html) into a per-page static document: page-specific <head> tags (title,
 * description, canonical, robots, Open Graph, Twitter, JSON-LD) plus the content shell in <body>.
 *
 * Every injected head tag carries data-rh="true", the attribute react-helmet-async manages: when the app boots,
 * Helmet replaces these tags with its own copies instead of adding a second set (no duplicate title or canonical).
 */

import { SEO_CONFIG, OG_DEFAULTS, TWITTER_DEFAULTS } from '@/seo/config';
import { absoluteUrl, canonicalFor, resolveOgImageUrl } from '@/seo/meta';
import type { SeoPage } from '@/seo/pages';

const attr = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const text = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** JSON for a <script>: "<" is escaped so the data can never close the tag */
const json = (value: unknown) => JSON.stringify(value, null, 2).replace(/</g, '\u003c');

const meta = (key: 'name' | 'property', name: string, content: string) => `<meta data-rh="true" ${key}="${attr(name)}" content="${attr(content)}" />`;

export const ROBOTS_INDEX = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';

export function headTags(page: SeoPage): string {
  const canonical = canonicalFor(page.path);
  const image = resolveOgImageUrl(page.image);
  const robots = page.noindex ? 'noindex,follow' : ROBOTS_INDEX;
  const tags: string[] = [
    `<title>${text(page.title)}</title>`,
    meta('name', 'description', page.description),
    ...(page.keywords.length ? [meta('name', 'keywords', page.keywords.join(', '))] : []),
    `<link data-rh="true" rel="canonical" href="${attr(canonical)}" />`,
    meta('name', 'robots', robots),
    meta('name', 'googlebot', robots),
    meta('property', 'og:type', page.ogType),
    meta('property', 'og:title', page.title),
    meta('property', 'og:description', page.description),
    meta('property', 'og:url', canonical),
    meta('property', 'og:image', image),
    meta('property', 'og:image:width', String(OG_DEFAULTS.imageWidth)),
    meta('property', 'og:image:height', String(OG_DEFAULTS.imageHeight)),
    meta('property', 'og:site_name', OG_DEFAULTS.siteName),
    meta('property', 'og:locale', OG_DEFAULTS.locale),
  ];
  if (page.ogType === 'article' && page.publishedTime) {
    tags.push(meta('property', 'article:published_time', page.publishedTime));
    if (page.modifiedTime) tags.push(meta('property', 'article:modified_time', page.modifiedTime));
    if (page.author) tags.push(meta('property', 'article:author', page.author));
  }
  tags.push(
    meta('name', 'twitter:card', TWITTER_DEFAULTS.card),
    meta('name', 'twitter:site', TWITTER_DEFAULTS.site),
    meta('name', 'twitter:title', page.title),
    meta('name', 'twitter:description', page.description),
    meta('name', 'twitter:image', image),
    meta('name', 'author', page.author || SEO_CONFIG.organizationName),
    meta('name', 'publisher', SEO_CONFIG.organizationName),
  );
  if (SEO_CONFIG.googleSiteVerification) tags.push(meta('name', 'google-site-verification', SEO_CONFIG.googleSiteVerification));
  for (const data of page.jsonLd) tags.push(`<script data-rh="true" type="application/ld+json">${json(data)}</script>`);
  return tags.map((t) => `    ${t}`).join('\n');
}

/**
 * Shell styling. Kept tiny and scoped to #prerender-shell. While the shell is on screen the app root is hidden but
 * still laid out, so the swap (src/lib/prerender.ts) is a single paint.
 */
export const SHELL_CSS = `#root:not([data-ready]){position:absolute;left:0;top:0;width:100%;visibility:hidden}
#prerender-shell{max-width:760px;margin:0 auto;padding:24px 16px 48px;line-height:1.6;font-size:1rem}
#prerender-shell header ul,#prerender-shell footer ul,#prerender-shell nav ul{display:flex;flex-wrap:wrap;gap:.25rem 1rem;list-style:none;margin:0;padding:0}
#prerender-shell ol{padding-left:1.25rem}
#prerender-shell nav[aria-label=Breadcrumb] ol{display:flex;flex-wrap:wrap;gap:.25rem .75rem;list-style:none;padding:0;font-size:.875rem}
#prerender-shell h1{font-size:2rem;line-height:1.2;margin:.5rem 0 1rem}
#prerender-shell h2{font-size:1.4rem;line-height:1.3;margin:2rem 0 .5rem}
#prerender-shell h3{font-size:1.1rem;margin:1.25rem 0 .4rem}
#prerender-shell a{text-decoration:underline}
#prerender-shell img{max-width:100%;height:auto}
#prerender-shell table{border-collapse:collapse;display:block;overflow-x:auto}
#prerender-shell th,#prerender-shell td{border:1px solid rgba(128,128,128,.4);padding:.4rem .6rem;text-align:left}`;

/** Removes the generic head tags of the base shell that the page replaces (all are marked data-rh, plus <title>) */
export function stripGenericHead(template: string): string {
  return template
    .replace(/[ \t]*<title>[\s\S]*?<\/title>\r?\n?/i, '')
    .replace(/[ \t]*<meta data-rh="true"[^>]*>\r?\n?/gi, '')
    .replace(/[ \t]*<!-- Primary Meta Tags[^>]*-->\r?\n?/i, '');
}

export function composeDocument(template: string, page: SeoPage, bodyHtml: string): string {
  const head = `${headTags(page)}\n    <style data-prerender>${SHELL_CSS}</style>\n  `;
  let html = stripGenericHead(template).replace('</head>', `${head}</head>`);
  const shell = `<div id="prerender-shell">${bodyHtml}</div>\n    `;
  if (!html.includes('<div id="root"></div>')) throw new Error('prerender: <div id="root"></div> not found in the built index.html');
  html = html.replace('<div id="root"></div>', `${shell}<div id="root"></div>`);
  return html;
}

/** Replaces the default site origin in the base shell when VITE_SITE_URL points at a custom domain */
export function applySiteUrl(template: string, fromOrigin = 'https://vayupackaging.vercel.app'): string {
  return fromOrigin === SEO_CONFIG.siteUrl ? template : template.split(fromOrigin).join(SEO_CONFIG.siteUrl);
}

export { absoluteUrl };
