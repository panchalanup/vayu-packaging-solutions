/**
 * Writes the generated SEO files into /public: sitemap.xml, robots.txt and llms.txt (from src/seo/pages.ts).
 * Run by "npm run build" (before vite build) and by "npm run seo:files". Commit the result; a test fails when
 * a blog post, landing page or product is missing from public/sitemap.xml.
 */
import fs from 'node:fs';
import path from 'node:path';
import { root, withViteModules } from './load.mjs';

const blogs = path.join(root, 'public/content/blogs');
const readBlogMarkdown = (slug) => {
  const file = path.join(blogs, `${slug}.md`);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : undefined;
};

await withViteModules(async (load) => {
  const { getSeoPages } = await load('/src/seo/pages.ts');
  const { buildSitemapXml, buildRobotsTxt, buildLlmsTxt } = await load('/src/seo/sitemap.ts');
  const pages = getSeoPages({ readBlogMarkdown });
  const files = { 'sitemap.xml': buildSitemapXml(pages), 'robots.txt': buildRobotsTxt(), 'llms.txt': buildLlmsTxt(pages) };
  for (const [name, content] of Object.entries(files)) fs.writeFileSync(path.join(root, 'public', name), content);
  console.log(`seo: wrote public/sitemap.xml (${pages.length} URLs), robots.txt, llms.txt`);
});
