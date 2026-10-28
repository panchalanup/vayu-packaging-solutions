import { describe, expect, it } from 'vitest';
import { BLOG_POSTS } from '@/constants/blogs';
import { BLOG_TAGS } from '@/content/blogCtas';
import { availableLandings } from '@/content/designerLandings';
import { ALL_DESIGNER_TARGET_SLUGS, DESIGNER_TARGET_NAMES, chronological, designerDeepLink, designerTargetSlug, getAdjacentPosts, getDesignerCard, getRelatedByTags } from '../blogRelated';

describe('related posts by shared tags', () => {
  it('returns up to three other posts for every article, never itself, never duplicates', () => {
    for (const post of BLOG_POSTS) {
      const related = getRelatedByTags(post.slug, 3);
      expect(related.length, post.slug).toBeGreaterThanOrEqual(2);
      expect(related.length).toBeLessThanOrEqual(3);
      expect(related.map((p) => p.slug)).not.toContain(post.slug);
      expect(new Set(related.map((p) => p.slug)).size).toBe(related.length);
    }
  });

  it('puts topic matches first: a ventilated produce box links to another produce article', () => {
    expect(BLOG_TAGS[getRelatedByTags('fruit-vegetable-ventilated-boxes', 1)[0].slug]).toContain('uc-produce');
    // strength articles surface other strength articles first
    expect(BLOG_TAGS[getRelatedByTags('burst-strength-ect-guide', 1)[0].slug]).toContain('strength');
  });

  it('is empty for an unknown slug', () => {
    expect(getRelatedByTags('nope')).toEqual([]);
  });
});

describe('previous and next', () => {
  it('walk the whole archive once, oldest to newest', () => {
    const ordered = chronological();
    expect(ordered.length).toBe(BLOG_POSTS.length);
    for (let i = 0; i < ordered.length; i++) {
      const { previous, next } = getAdjacentPosts(ordered[i].slug);
      expect(previous?.slug).toBe(ordered[i - 1]?.slug);
      expect(next?.slug).toBe(ordered[i + 1]?.slug);
    }
    for (let i = 1; i < ordered.length; i++) expect(ordered[i].date >= ordered[i - 1].date).toBe(true);
  });
});

describe('"Try this in the 3D designer" deep link', () => {
  const landings = new Map(availableLandings().map((l) => [l.slug, l]));

  it('only points at landing pages that exist, with a display name', () => {
    for (const slug of ALL_DESIGNER_TARGET_SLUGS) {
      expect(landings.has(slug), `no landing page /box-designer/${slug}`).toBe(true);
      // The card copy uses a short generic name (landing names get reworded by the content team)
      expect(DESIGNER_TARGET_NAMES[slug], `${slug} needs a display name in DESIGNER_TARGET_NAMES`).toMatch(/^[a-z -]{4,}$/);
    }
  });

  it('carries utm_* and src=blog.<slug> and stays a site-relative link', () => {
    for (const post of BLOG_POSTS) {
      const href = designerDeepLink(post.slug);
      expect(href).toMatch(/^\/box-designer(\/[a-z-]+)?\?/);
      const q = new URL(href, 'https://example.com').searchParams;
      expect(q.get('utm_source')).toBe('blog');
      expect(q.get('utm_medium')).toBe('article');
      expect(q.get('utm_campaign')).toBe(post.slug);
      expect(q.get('src')).toMatch(/^blog\.[a-z0-9.-]{1,55}$/);
    }
  });

  it('opens the matching style for use-case articles and the designer for general ones', () => {
    expect(designerTargetSlug('cake-sweet-bakery-boxes')).toBe('cake-box');
    expect(designerTargetSlug('ecommerce-mailer-box-unboxing')).toBe('mailer-box');
    expect(designerDeepLink('flute-types-guide').startsWith('/box-designer?')).toBe(true);
    expect(getDesignerCard('cake-sweet-bakery-boxes').label).toBe('Design my cake box');
    expect(getDesignerCard('flute-types-guide').label).toBe('Open the 3D designer');
  });
});
