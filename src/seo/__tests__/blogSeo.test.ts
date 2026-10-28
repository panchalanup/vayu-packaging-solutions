/**
 * Blog content checks that protect search visibility: image alt text and size attributes, internal linking,
 * FAQ extraction and the markdown helpers behind the article schema. Fails with a message that names the post.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { BLOG_POSTS } from '@/constants/blogs';
import { BLOG_IMAGE_SIZES } from '@/content/blogImageSizes';
import { countWords, extractFaqs, extractHeadings, extractImages, extractInternalLinks, markdownToPlainText, readingMinutes } from '@/lib/blogMarkdown';
import { auditBlogLinks } from '../linkGraph';
import { collectSizes } from '../../../scripts/seo/image-sizes.mjs';

const root = path.resolve(__dirname, '../../..');
const markdown: Record<string, string> = Object.fromEntries(
  BLOG_POSTS.map((p) => [p.slug, fs.readFileSync(path.join(root, 'public/content/blogs', `${p.slug}.md`), 'utf8')]),
);

/** Minimum characters of alt text that can describe an image. "image", "photo" or "" do not. */
const MIN_ALT = 12;

describe('blog images', () => {
  it('every image has descriptive alt text', () => {
    for (const [slug, md] of Object.entries(markdown)) {
      for (const img of extractImages(md)) {
        expect(img.alt.length, `${slug}: image ${img.src} needs descriptive alt text (at least ${MIN_ALT} characters)`).toBeGreaterThanOrEqual(MIN_ALT);
        expect(img.alt, `${slug}: alt text for ${img.src} should describe the picture, not name the file`).not.toMatch(/\.(png|jpe?g|svg|webp)$/i);
      }
    }
  });

  it('every local image exists (designer screenshots may be queued for capture in scripts/screenshots/shots.json)', () => {
    const shotsFile = path.join(root, 'scripts/screenshots/shots.json');
    const queued = new Set(fs.existsSync(shotsFile) ? (JSON.parse(fs.readFileSync(shotsFile, 'utf8')) as { file: string }[]).map((s) => `/blog-images/designer/${s.file}`) : []);
    for (const [slug, md] of Object.entries(markdown)) {
      for (const img of extractImages(md)) {
        if (!img.src.startsWith('/') || queued.has(img.src)) continue;
        expect(fs.existsSync(path.join(root, 'public', img.src)), `${slug}: ${img.src} is missing from /public and not queued in shots.json`).toBe(true);
      }
    }
  });

  it('width and height are known for every image (run "npm run seo:images" after adding images)', () => {
    const fresh = collectSizes() as Record<string, { width: number; height: number }>;
    for (const [src, size] of Object.entries(fresh)) {
      expect(BLOG_IMAGE_SIZES[src], `src/content/blogImageSizes.ts has no size for ${src}. Run "npm run seo:images".`).toEqual(size);
    }
  });
});

describe('blog internal links', () => {
  const audit = auditBlogLinks(markdown);

  it('has no broken links to other articles', () => {
    expect(audit.broken).toEqual([]);
  });

  it('every article has at least 3 distinct internal links', () => {
    expect(audit.thin.map((p) => `${p.slug} (${p.outbound.length})`), 'run "npm run seo:report" for the full link table').toEqual([]);
  });

  it('almost no article is an orphan (no other article links to it)', () => {
    // Orphans are still reachable from /blogs, the footer, related lists and previous/next links, but a link from a
    // relevant article is the strongest internal signal. Budget of 6 so a fresh post is not blocked; keep the list short, "npm run seo:report" shows it.
    expect(audit.orphans.map((p) => p.slug).length, `orphans: ${audit.orphans.map((p) => p.slug).join(', ')}`).toBeLessThanOrEqual(6);
  });
});

describe('every article has a FAQ block that becomes FAQPage schema', () => {
  it('parses at least two question and answer pairs', () => {
    const missing = BLOG_POSTS.filter((p) => extractFaqs(markdown[p.slug]).length < 2).map((p) => p.slug);
    // A brand-new post may not have a FAQ yet; the budget keeps that visible without blocking a release
    expect(missing.length, `posts without a parsable FAQ: ${missing.join(', ')}`).toBeLessThanOrEqual(4);
  });
});

describe('markdown helpers', () => {
  const fence = '```';
  const md = [
    '---',
    'title: "x"',
    '---',
    '',
    '# Title',
    '',
    'Intro with a [link](/blogs/a) and an ![image alt text here](/blog-images/x.png).',
    '',
    '## One',
    '',
    'Text **bold** here.',
    '',
    fence,
    '## not a heading',
    '[not](/a-link)',
    fence,
    '',
    '### Sub',
    '',
    '## Frequently asked questions',
    '',
    '### What is A?',
    'It is **A**, see [this](/blogs/a).',
    '',
    '### What is B?',
    'B is next.',
    'More B.',
    '',
    '---',
    '',
    '## After',
    '',
  ].join('\n');

  it('plain text drops formatting, links keep their label', () => {
    expect(markdownToPlainText('A **bold** [link](/x) and ![img](/i.png) `code`')).toBe('A bold link and code');
  });

  it('headings ignore code fences', () => {
    expect(extractHeadings(md).map((h) => `${h.level}:${h.text}`)).toEqual(['2:One', '3:Sub', '2:Frequently asked questions', '3:What is A?', '3:What is B?', '2:After']);
  });

  it('FAQ pairs stop at the next section and are plain text', () => {
    expect(extractFaqs(md)).toEqual([
      { question: 'What is A?', answer: 'It is A, see this.' },
      { question: 'What is B?', answer: 'B is next. More B.' },
    ]);
    expect(extractFaqs('## Nothing here')).toEqual([]);
  });

  it('images and internal links are found outside fences only', () => {
    expect(extractImages(md)).toEqual([{ alt: 'image alt text here', src: '/blog-images/x.png' }]);
    expect(extractInternalLinks(md)).toEqual(['/blogs/a', '/blogs/a']);
  });

  it('counts words and reading time', () => {
    expect(countWords('one two three')).toBe(3);
    expect(readingMinutes('word '.repeat(660))).toBe(3);
    expect(readingMinutes('short')).toBe(1);
  });
});
