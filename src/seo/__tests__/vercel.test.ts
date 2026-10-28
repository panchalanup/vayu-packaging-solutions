/**
 * vercel.json routing: every prerendered page is served from its own static file, everything else falls back to the
 * SPA shell, and static assets are never rewritten to HTML.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { getSeoPages } from '../pages';
import { outputFileFor } from '../prerender';

interface Rewrite {
  source: string;
  destination: string;
}
const root = path.resolve(__dirname, '../../..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8')) as { rewrites: Rewrite[]; headers: { source: string }[] };

/** Minimal emulation of Vercel's path matching: ":name" is one path segment, a "(...)" group is a regular expression */
function match(source: string, url: string): Record<string, string> | null {
  if (source.includes('(')) return new RegExp(`^${source}$`).test(url) ? {} : null;
  const names: string[] = [];
  const pattern = source.replace(/:([a-zA-Z]+)/g, (_, n: string) => {
    names.push(n);
    return '([^/]+)';
  });
  const m = new RegExp(`^${pattern}/?$`).exec(url);
  if (!m) return null;
  return Object.fromEntries(names.map((n, i) => [n, m[i + 1]]));
}

const resolve = (url: string): string | undefined => {
  for (const r of config.rewrites) {
    const params = match(r.source, url);
    if (params) return r.destination.replace(/:([a-zA-Z]+)/g, (_, n: string) => params[n]);
  }
  return undefined;
};

describe('vercel.json rewrites', () => {
  it('serve every prerendered page from its static file (home is served by index.html itself)', () => {
    for (const page of getSeoPages().filter((p) => p.path !== '/')) {
      expect(resolve(page.path), `no rewrite sends ${page.path} to ${outputFileFor(page.path)}`).toBe(`/${outputFileFor(page.path)}`);
    }
  });

  it('send app-only routes to the SPA shell, not to a prerendered page', () => {
    for (const url of ['/admin/login', '/admin/dashboard', '/embed/box-designer', '/something-unknown']) expect(resolve(url), url).toBe('/app-shell.html');
  });

  it('never rewrite static files or API calls to HTML', () => {
    for (const url of ['/content/blogs/x.md', '/assets/index-abc.js', '/sitemap.xml', '/robots.txt', '/llms.txt', '/og-image.jpg', '/blog-images/x-og.png', '/api/quote', '/brochures/a.pdf', '/fonts/a.woff2', '/ToolData/x.csv']) {
      expect(resolve(url), url).toBeUndefined();
    }
  });

  it('sets content types for sitemap, robots and llms.txt', () => {
    const sources = config.headers.map((h) => h.source);
    for (const s of ['/sitemap.xml', '/robots.txt', '/llms.txt']) expect(sources).toContain(s);
  });
});
