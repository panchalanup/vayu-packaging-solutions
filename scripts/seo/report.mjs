/**
 * SEO content report (npm run seo:report): blog posts with fewer than 3 internal links, posts no other post links to,
 * missing image alt text, title and description lengths. Read-only; exits 1 only for hard failures (broken links,
 * images without alt text) so it can run in CI.
 */
import fs from 'node:fs';
import path from 'node:path';
import { root, withViteModules } from './load.mjs';

const dir = path.join(root, 'public/content/blogs');
const markdown = Object.fromEntries(fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort().map((f) => [f.replace(/\.md$/, ''), fs.readFileSync(path.join(dir, f), 'utf8')]));

await withViteModules(async (load) => {
  const { auditBlogLinks } = await load('/src/seo/linkGraph.ts');
  const { extractImages, extractFaqs, countWords } = await load('/src/lib/blogMarkdown.ts');
  const { getSeoPages } = await load('/src/seo/pages.ts');
  const audit = auditBlogLinks(markdown);
  let hard = 0;

  console.log(`\nBLOG INTERNAL LINKS (${audit.posts.length} posts)`);
  console.log('slug'.padEnd(46), 'out', 'in', 'posts', 'designer', 'other');
  for (const p of audit.posts) console.log(p.slug.padEnd(46), String(p.outbound.length).padStart(3), String(p.inbound.length).padStart(2), String(p.toPosts).padStart(5), String(p.toDesigner).padStart(8), String(p.toOther).padStart(5), p.outbound.length < 3 ? '  <-- fewer than 3 internal links' : '', p.inbound.length === 0 ? '  <-- orphan (no article links here)' : '');
  console.log(`\nThin (<3 internal links): ${audit.thin.map((p) => p.slug).join(', ') || 'none'}`);
  console.log(`Orphans (no inbound article links): ${audit.orphans.map((p) => p.slug).join(', ') || 'none'}`);
  if (audit.broken.length) {
    hard += audit.broken.length;
    console.log(`BROKEN article links: ${audit.broken.map((b) => `${b.from} -> ${b.to}`).join(', ')}`);
  }

  console.log('\nIMAGES');
  for (const [slug, md] of Object.entries(markdown)) for (const img of extractImages(md)) if (img.alt.length < 8) { hard += 1; console.log(`  ${slug}: image ${img.src} has missing or too-short alt text`); }

  console.log('\nTITLES AND DESCRIPTIONS (blog pages)');
  const pages = getSeoPages({ readBlogMarkdown: (s) => markdown[s] }).filter((p) => p.kind === 'blog');
  for (const p of pages) {
    const flags = [p.title.length > 70 ? `title ${p.title.length} chars` : '', p.description.length > 175 ? `description ${p.description.length} chars` : '', p.description.length < 90 ? `description ${p.description.length} chars (short)` : '', extractFaqs(markdown[p.slug]).length ? '' : 'no FAQ section', countWords(markdown[p.slug]) < 600 ? `only ${countWords(markdown[p.slug])} words` : ''].filter(Boolean);
    if (flags.length) console.log(`  ${p.slug}: ${flags.join(', ')}`);
  }
  process.exitCode = hard ? 1 : 0;
});
