/**
 * The sitemap is generated from src/seo/pages.ts. These tests make sure nothing indexable can be left out:
 * every registry entry (blog post, designer landing, product, industry) and every static route in App.tsx has a page,
 * the committed public/sitemap.xml matches, and URLs and titles are unique.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { BLOG_POSTS } from '@/constants/blogs';
import { PRODUCTS } from '@/content/products';
import { INDUSTRY_PAGES } from '@/content/industries';
import { availableLandings } from '@/content/designerLandings';
import { SEO_CONFIG } from '../config';
import { canonicalFor } from '../meta';
import { extractFaqs } from '@/lib/blogMarkdown';
import { getSeoPages } from '../pages';
import { AI_CRAWLERS, buildLlmsTxt, buildRobotsTxt, buildSitemapXml, ROBOTS_DISALLOW } from '../sitemap';

const root = path.resolve(__dirname, '../../..');
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');
const readBlogMarkdown = (slug: string) => {
  const file = path.join(root, 'public/content/blogs', `${slug}.md`);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : undefined;
};

const pages = getSeoPages({ readBlogMarkdown });
const paths = new Set(pages.map((p) => p.path));
const fix = 'Run "npm run seo:files" and commit public/sitemap.xml, robots.txt and llms.txt.';

describe('seo pages list', () => {
  it('has a page for every blog post, designer landing, product and industry', () => {
    for (const post of BLOG_POSTS) expect(paths, `blog ${post.slug}`).toContain(`/blogs/${post.slug}`);
    for (const l of availableLandings()) expect(paths, `landing ${l.slug}`).toContain(`/box-designer/${l.slug}`);
    for (const p of PRODUCTS) expect(paths, `product ${p.slug}`).toContain(`/products/${p.slug}`);
    for (const i of INDUSTRY_PAGES) expect(paths, `industry ${i.slug}`).toContain(`/industries/${i.slug}`);
  });

  it('covers every static route declared in App.tsx (add new pages to src/seo/pages.ts)', () => {
    const app = read('src/App.tsx');
    // Routes that are intentionally not indexable: the iframe embed, admin screens and the 404 catch-all
    const skip = (p: string) => p === '*' || p.startsWith('/embed/') || p.startsWith('/admin') || p.includes(':') || !p.startsWith('/');
    const routes = [...app.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]).filter((p) => !skip(p));
    expect(routes.length).toBeGreaterThan(8);
    for (const route of routes) expect(paths, `App.tsx route ${route} has no entry in src/seo/pages.ts`).toContain(route);
  });

  it('has unique canonical URLs, titles and descriptions of a sensible length', () => {
    const urls = pages.map((p) => canonicalFor(p.path));
    expect(new Set(urls).size).toBe(urls.length);
    const titles = pages.map((p) => p.title);
    expect(new Set(titles).size, 'duplicate <title>').toBe(titles.length);
    const descriptions = pages.map((p) => p.description);
    expect(new Set(descriptions).size, 'duplicate meta description').toBe(descriptions.length);
    for (const p of pages) {
      expect(p.title.length, `title of ${p.path}`).toBeGreaterThan(10);
      expect(p.title.length, `title of ${p.path} is ${p.title.length} chars; keep it under ~80`).toBeLessThanOrEqual(80);
      expect(p.description.length, `description of ${p.path}`).toBeGreaterThanOrEqual(60);
      expect(p.description.length, `description of ${p.path}`).toBeLessThanOrEqual(320);
    }
  });

  it('gives every blog page article schema with dates, and FAQPage schema when the article has a FAQ section', () => {
    for (const p of pages.filter((x) => x.kind === 'blog')) {
      const article = p.jsonLd.find((d) => (d as { '@type'?: string })['@type'] === 'Article') as Record<string, unknown> | undefined;
      expect(article, p.path).toBeDefined();
      expect(article?.datePublished, p.path).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(article?.dateModified, p.path).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(String(article?.timeRequired), p.path).toMatch(/^PT\d+M$/);
      expect(Number(article?.wordCount), p.path).toBeGreaterThan(300);
      const md = readBlogMarkdown(p.slug as string) as string;
      const faqs = extractFaqs(md);
      // A FAQ-style heading must parse into question and answer pairs (format: "## Frequently asked questions" then "### Question")
      if (/^##\s+(frequently asked questions|faqs?|common questions)\s*$/im.test(md)) expect(faqs.length, `FAQ section of ${p.path} did not parse`).toBeGreaterThanOrEqual(2);
      expect(p.jsonLd.some((d) => (d as { '@type'?: string })['@type'] === 'FAQPage'), `FAQPage schema for ${p.path}`).toBe(faqs.length > 0);
    }
  });
});

describe('generated files', () => {
  it('sitemap lists every page once, with a valid lastmod', () => {
    const xml = buildSitemapXml(pages);
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBe(pages.length);
    expect(new Set(locs).size).toBe(locs.length);
    for (const loc of locs) expect(loc.startsWith(SEO_CONFIG.siteUrl)).toBe(true);
    for (const [, d] of xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(xml).toContain('<image:loc>');
  });

  it('public/sitemap.xml, robots.txt and llms.txt are up to date', () => {
    const committed = read('public/sitemap.xml');
    const expected = buildSitemapXml(pages);
    const locs = (xml: string) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
    expect(locs(committed), `public/sitemap.xml is stale (a page was added or removed). ${fix}`).toEqual(locs(expected));
    // Same lastmod per URL. Titles inside <image:title> follow post titles, which other people edit, so the file is not compared byte for byte.
    const lastmods = (xml: string) => [...xml.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)].map((m) => `${m[1]} ${m[2]}`).sort();
    expect(lastmods(committed), `public/sitemap.xml has stale lastmod dates. ${fix}`).toEqual(lastmods(expected));
    expect(read('public/robots.txt'), `public/robots.txt is stale. ${fix}`).toBe(buildRobotsTxt());
    const llms = read('public/llms.txt');
    for (const p of pages.filter((x) => x.kind === 'blog' || x.kind === 'landing' || x.kind === 'tool')) expect(llms, `public/llms.txt misses ${p.path}. ${fix}`).toContain(canonicalFor(p.path));
  });

  it('robots.txt points at the sitemap, blocks private paths and welcomes AI crawlers', () => {
    const robots = buildRobotsTxt();
    expect(robots).toContain(`Sitemap: ${SEO_CONFIG.siteUrl}/sitemap.xml`);
    for (const p of ROBOTS_DISALLOW) expect(robots).toContain(`Disallow: ${p}`);
    for (const bot of AI_CRAWLERS) expect(robots).toContain(`User-agent: ${bot}`);
    expect(robots).not.toMatch(/^Disallow:\s*\/\s*$/m);
  });
});
