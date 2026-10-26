/**
 * Blog registry consistency: every post in src/constants/blogs.ts must have its markdown, SEO entry, OG raster,
 * thumbnail, CTA tags and sitemap entry, and internal article links must point at real posts. Catches the
 * "added the post in one registry but not another" mistakes when several people add articles in parallel.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { BLOG_CATEGORIES, BLOG_POSTS } from '@/constants/blogs';
import { BLOG_IMAGES } from '@/constants/images';
import { BLOG_SEO_METADATA, BLOG_CATEGORY_KEYWORDS } from '@/seo/metadata/blogs';
import { BLOG_TAGS, pickBlogCta } from '../blogCtas';
import { CATEGORY_META } from '@/components/BlogMeta';

const root = path.resolve(__dirname, '../../..');
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');
const slugs = new Set(BLOG_POSTS.map((p) => p.slug));

describe('blog registry', () => {
  it('has unique slugs and known categories', () => {
    expect(slugs.size).toBe(BLOG_POSTS.length);
    for (const post of BLOG_POSTS) expect(BLOG_CATEGORIES, post.slug).toContain(post.category);
    for (const category of BLOG_CATEGORIES) expect(CATEGORY_META[category], category).toBeDefined();
    for (const category of BLOG_CATEGORIES.filter((c) => c !== 'All')) expect(BLOG_CATEGORY_KEYWORDS[category], category).toBeDefined();
  });

  it('every post has markdown, SEO, an exported OG image, a thumbnail and CTA tags', () => {
    for (const post of BLOG_POSTS) {
      expect(fs.existsSync(path.join(root, 'public/content/blogs', `${post.slug}.md`)), `${post.slug}.md`).toBe(true);
      const seo = BLOG_SEO_METADATA[post.slug];
      expect(seo, `SEO for ${post.slug}`).toBeDefined();
      expect(seo.ogImage, post.slug).toMatch(/^\/blog-images\/[a-z0-9-]+-og\.png$/);
      expect(fs.existsSync(path.join(root, 'public', seo.ogImage as string)), seo.ogImage).toBe(true);
      expect(BLOG_IMAGES[post.thumbnail as keyof typeof BLOG_IMAGES], `thumbnail ${post.thumbnail}`).toBeTruthy();
      expect(BLOG_TAGS[post.slug]?.length, `tags for ${post.slug}`).toBeGreaterThan(0);
      expect(pickBlogCta(post.slug).href(post.slug)).toMatch(/^\/[^/]/);
    }
  });

  it('every post is in the sitemap', () => {
    const sitemap = read('public/sitemap.xml');
    for (const slug of slugs) expect(sitemap, slug).toContain(`/blogs/${slug}</loc>`);
  });

  it('internal article links point at real posts, and designer screenshots are listed for capture', () => {
    const shotsFile = path.join(root, 'scripts/screenshots/shots.json');
    const shots = fs.existsSync(shotsFile) ? new Set((JSON.parse(fs.readFileSync(shotsFile, 'utf8')) as { file: string }[]).map((s) => s.file)) : new Set<string>();
    for (const slug of slugs) {
      const md = read(`public/content/blogs/${slug}.md`);
      for (const [, target] of md.matchAll(/\]\(\/blogs\/([a-z0-9-]+)\)/g)) expect(slugs, `${slug} links to /blogs/${target}`).toContain(target);
      for (const [, file] of md.matchAll(/\]\(\/blog-images\/designer\/([a-z0-9-]+\.png)\)/g)) expect(shots, `${slug} uses ${file}`).toContain(file);
    }
  });
});
