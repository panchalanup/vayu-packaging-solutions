/**
 * Post-build prerender: turns dist/index.html (the empty SPA shell) into one static HTML document per indexable page
 * (home, marketing pages, products, industries, blog index, every blog post, /box-designer and every
 * /box-designer/:style landing). Each document carries the page's own title, description, canonical, Open Graph,
 * Twitter tags, JSON-LD and a full-content shell (headings, text, internal links) that crawlers read without running JS.
 * The React app then boots as usual and swaps the shell out (src/lib/prerender.ts).
 *
 * Also writes the generic SPA shell as dist/app-shell.html (vercel.json rewrites unknown URLs to it) and copies
 * sitemap.xml, robots.txt and llms.txt into dist.
 *
 * Run: node scripts/seo/postbuild.mjs (the build script does it right after "vite build").
 */
import fs from 'node:fs';
import path from 'node:path';
import { root, withViteModules } from './load.mjs';

const dist = path.join(root, 'dist');
const indexFile = path.join(dist, 'index.html');
if (!fs.existsSync(indexFile)) throw new Error('dist/index.html not found: run "vite build" first');

const started = Date.now();
const template = fs.readFileSync(indexFile, 'utf8');
if (template.includes('id="prerender-shell"')) throw new Error('dist/index.html is already prerendered: run "vite build" again');

const blogs = path.join(root, 'public/content/blogs');
const readBlogMarkdown = (slug) => {
  const file = path.join(blogs, `${slug}.md`);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : undefined;
};

const write = (rel, content) => {
  const file = path.join(dist, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};

await withViteModules(async (load) => {
  const { prerenderAll, applySiteUrl } = await load('/src/seo/prerender/index.ts');
  const { getSeoPages } = await load('/src/seo/pages.ts');
  const { buildSitemapXml, buildRobotsTxt, buildLlmsTxt } = await load('/src/seo/sitemap.ts');

  // Generic shell for everything that is not prerendered (admin, embed, unknown URLs). Keep it before index.html is replaced.
  // 404.html: Vercel serves it with a real 404 status for unknown /blogs/<slug> style URLs; the app boots and redirects visitors.

  write('app-shell.html', applySiteUrl(template));
  write('404.html', applySiteUrl(template));

  const pages = prerenderAll(template, { readBlogMarkdown });
  const problems = [];
  const titles = new Map();
  for (const { page, file, html } of pages) {
    const checks = {
      title: /<title>[^<]+<\/title>/.test(html),
      canonical: /<link data-rh="true" rel="canonical" href="https?:\/\/[^"]+"/.test(html),
      description: /<meta data-rh="true" name="description" content="[^"]{20,}"/.test(html),
      h1: /<h1[ >]/.test(html),
      ogImage: /property="og:image" content="https?:\/\//.test(html),
      text: html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ').split(/\s+/).length > 120,
    };
    for (const [name, ok] of Object.entries(checks)) if (!ok) problems.push(`${page.path}: missing ${name}`);
    if (titles.has(page.title)) problems.push(`${page.path}: same <title> as ${titles.get(page.title)}`);
    titles.set(page.title, page.path);
    write(file, html);
  }
  if (problems.length) throw new Error(`prerender checks failed:\n${problems.join('\n')}`);

  const all = getSeoPages({ readBlogMarkdown });
  write('sitemap.xml', buildSitemapXml(all));
  write('robots.txt', buildRobotsTxt());
  write('llms.txt', buildLlmsTxt(all));

  const kb = pages.reduce((n, p) => n + p.html.length, 0) / 1024;
  console.log(`seo: prerendered ${pages.length} pages (${kb.toFixed(0)} kB) in ${((Date.now() - started) / 1000).toFixed(1)}s; sitemap, robots, llms written to dist/`);
});
