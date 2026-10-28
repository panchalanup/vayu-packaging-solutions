/**
 * Build-time prerender entry (loaded by scripts/seo/postbuild.mjs through Vite's ssrLoadModule).
 * Returns one static HTML document per indexable page; the script writes them into dist/.
 */

import { getSeoPages, type SeoPage } from '@/seo/pages';
import { renderBody, type BodyContext } from './body';
import { applySiteUrl, composeDocument } from './document';

export interface PrerenderedPage {
  page: SeoPage;
  /** Output path relative to dist/: "index.html" or "blogs/foo/index.html" */
  file: string;
  html: string;
}

export const outputFileFor = (path: string): string => (path === '/' ? 'index.html' : `${path.replace(/^\/+|\/+$/g, '')}/index.html`);

export function prerenderAll(template: string, ctx: BodyContext): PrerenderedPage[] {
  const base = applySiteUrl(template);
  return getSeoPages({ readBlogMarkdown: ctx.readBlogMarkdown }).map((page) => ({
    page,
    file: outputFileFor(page.path),
    html: composeDocument(base, page, renderBody(page, ctx)),
  }));
}

export * from './document';
