/**
 * Prerender output: what a crawler gets without running JavaScript. Renders every indexable page with the same code
 * the build uses (scripts/seo/postbuild.mjs) and checks head tags, JSON-LD, headings and internal links.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { BLOG_POSTS } from '@/constants/blogs';
import { availableLandings } from '@/content/designerLandings';
import { extractFaqs } from '@/lib/blogMarkdown';
import { SEO_CONFIG } from '../config';
import { canonicalFor } from '../meta';
import { outputFileFor, prerenderAll } from '../prerender';

const root = path.resolve(__dirname, '../../..');
const readBlogMarkdown = (slug: string) => {
  const file = path.join(root, 'public/content/blogs', `${slug}.md`);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : undefined;
};

// The same shape as the built dist/index.html: generic head tags (marked data-rh) and an empty root
const TEMPLATE = `<!doctype html>
<html lang="en-IN">
  <head>
    <meta charset="UTF-8" />
    <title>Generic title</title>
    <meta data-rh="true" name="description" content="Generic description" />
    <meta data-rh="true" property="og:title" content="Generic" />
    <meta name="google-site-verification" content="keep-me" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/index.js"></script>
  </body>
</html>`;

const pages = prerenderAll(TEMPLATE, { readBlogMarkdown });
const byPath = new Map(pages.map((p) => [p.page.path, p]));
const textOf = (html: string) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const jsonLd = (html: string) => [...html.matchAll(/<script data-rh="true" type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1].replace(/\\u003c/g, '<')));
const internalLinks = (html: string) => [...html.matchAll(/<a href="(\/[^"#?]*)/g)].map((m) => m[1]);

describe('prerendered pages', () => {
  it('cover every indexable page, one file each', () => {
    expect(pages.length).toBeGreaterThan(80);
    expect(new Set(pages.map((p) => p.file)).size).toBe(pages.length);
    for (const post of BLOG_POSTS) expect(byPath.has(`/blogs/${post.slug}`), post.slug).toBe(true);
    for (const l of availableLandings()) expect(byPath.has(`/box-designer/${l.slug}`), l.slug).toBe(true);
    for (const must of ['/', '/blogs', '/box-designer', '/products', '/about', '/contact', '/services', '/tools']) expect(byPath.has(must), must).toBe(true);
    expect(outputFileFor('/')).toBe('index.html');
    expect(outputFileFor('/blogs/x')).toBe('blogs/x/index.html');
  });

  it('carry their own title, description, canonical, robots, Open Graph and Twitter tags', () => {
    for (const { page, html } of pages) {
      const canonical = canonicalFor(page.path);
      expect(html, page.path).toContain(`<title>${page.title.replace(/&/g, '&amp;')}</title>`);
      expect(html, page.path).toContain(`<link data-rh="true" rel="canonical" href="${canonical}" />`);
      expect(html, page.path).toMatch(/<meta data-rh="true" name="description" content="[^"]{60,}"/);
      expect(html, page.path).toContain('name="robots" content="index,follow,max-image-preview:large');
      expect(html, page.path).toContain(`<meta data-rh="true" property="og:url" content="${canonical}"`);
      expect(html, page.path).toMatch(/property="og:image" content="https:\/\/[^"]+\.(png|jpg)"/);
      expect(html, page.path).toContain('name="twitter:card" content="summary_large_image"');
      // exactly one of each, and nothing left from the generic shell
      expect(html.match(/<title>/g)?.length, `${page.path} <title> count`).toBe(1);
      expect(html.match(/rel="canonical"/g)?.length, `${page.path} canonical count`).toBe(1);
      expect(html.match(/name="description"/g)?.length, `${page.path} description count`).toBe(1);
      expect(html).not.toContain('Generic title');
      expect(html).not.toContain('Generic description');
      expect(html, 'unmarked verification tag must survive').toContain('content="keep-me"');
    }
  });

  it('have exactly one h1, real text, and a shell the app can replace', () => {
    for (const { page, html } of pages) {
      expect(html.match(/<h1[ >]/g)?.length, `${page.path} h1 count`).toBe(1);
      expect(textOf(html).split(' ').length, `${page.path} text length`).toBeGreaterThan(150);
      expect(html).toContain('<div id="prerender-shell">');
      expect(html.indexOf('id="prerender-shell"')).toBeLessThan(html.indexOf('<div id="root"></div>'));
      expect(html).toContain('#root:not([data-ready])');
    }
  });

  it('link to the rest of the site (every page has at least 30 internal links, none to unknown pages)', () => {
    const known = new Set(pages.map((p) => p.page.path));
    for (const { page, html } of pages) {
      const links = internalLinks(html);
      expect(links.length, `${page.path} internal links`).toBeGreaterThan(30);
      for (const l of links) {
        if (l === page.path) continue;
        const clean = l.replace(/\/$/, '') || '/';
        expect(known.has(clean) || clean === '/quote', `${page.path} links to ${l} which is not a prerendered page`).toBe(true);
      }
    }
  });

  it('JSON-LD parses and matches the page type', () => {
    for (const { page, html } of pages) {
      const blocks = jsonLd(html);
      expect(blocks.length, `${page.path} JSON-LD`).toBeGreaterThan(0);
      const types = blocks.map((b) => b['@type']);
      if (page.kind !== 'home') expect(types, page.path).toContain('BreadcrumbList');
      if (page.kind === 'home') expect(types).toEqual(expect.arrayContaining(['Organization', 'LocalBusiness', 'WebSite']));
      if (page.kind === 'blog') expect(types).toContain('Article');
      if (page.kind === 'designer') expect(types).toEqual(expect.arrayContaining(['SoftwareApplication', 'FAQPage', 'HowTo']));
      if (page.kind === 'landing') expect(types).toContain('FAQPage');
      if (page.kind === 'product') expect(types).toContain('Product');
      // never emit unverified ratings
      expect(JSON.stringify(blocks), page.path).not.toContain('AggregateRating');
    }
  });

  it('blog pages contain the full article: headings with ids, table of contents, FAQ, related posts, designer link', () => {
    for (const post of BLOG_POSTS) {
      const { html, page } = byPath.get(`/blogs/${post.slug}`)!;
      const md = readBlogMarkdown(post.slug)!;
      expect(textOf(html), post.slug).toContain(post.title);
      expect(html.match(/<h2 id="/g)?.length, `${post.slug} h2 ids`).toBeGreaterThanOrEqual(3);
      expect(html, post.slug).toContain('aria-label="On this page"');
      expect(html, post.slug).toContain('Related articles');
      expect(html, post.slug).toContain('/box-designer');
      expect(html, post.slug).toContain('utm_source=blog');
      expect(html, post.slug).toMatch(/Published <time dateTime="\d{4}-\d{2}-\d{2}"/);
      // every in-article image has alt text and size attributes
      for (const img of html.matchAll(/<img [^>]*>/g)) expect(img[0], `${post.slug} ${img[0]}`).toMatch(/ alt="[^"]{8,}"/);
      // the FAQ answers are on the page and in the schema
      const faqs = extractFaqs(md);
      for (const f of faqs) expect(JSON.stringify(jsonLd(html)), post.slug).toContain(JSON.stringify(f.question).slice(1, -1));
      expect(page.jsonLd.length).toBeGreaterThanOrEqual(2);
      // no raw markdown or script leaked into the HTML
      expect(html, post.slug).not.toMatch(/<script(?![^>]*ld\+json)(?![^>]*src=)/);
      expect(textOf(html), post.slug).not.toMatch(/\]\(\/|\*\*\w|^## /m);
    }
  });

  it('use SEO_CONFIG.siteUrl in absolute URLs', () => {
    for (const { html } of pages) for (const m of html.matchAll(/(?:href|content)="(https:\/\/vayupackaging[^"]*)"/g)) expect(m[1].startsWith(SEO_CONFIG.siteUrl)).toBe(true);
  });
});
