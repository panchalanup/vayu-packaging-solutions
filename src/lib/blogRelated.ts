/**
 * Blog discovery helpers shared by the article page and the build-time prerender:
 * related posts by shared tags, previous / next navigation, and the "Try this in the 3D designer" deep link.
 * Pure data functions (no React), so tests can check every post gets sensible results.
 */

import { BLOG_POSTS, type BlogPost } from '@/constants/blogs';
import { BLOG_TAGS, type BlogTag } from '@/content/blogCtas';

const tagsOf = (slug: string): BlogTag[] => BLOG_TAGS[slug] ?? [];

/** Tags that appear on most articles say little about how close two posts are, so they score less */
const GENERIC_TAGS: BlogTag[] = ['designer'];

/**
 * Related articles: shared tags first (a specific shared tag counts double a generic one), then the same
 * category, then the newer post. Posts with no overlap at all are never returned.
 */
export function getRelatedByTags(slug: string, limit = 3, posts: BlogPost[] = BLOG_POSTS): BlogPost[] {
  const current = posts.find((p) => p.slug === slug);
  if (!current) return [];
  const mine = tagsOf(slug);
  return posts
    .filter((p) => p.slug !== slug)
    .map((p, index) => {
      const shared = tagsOf(p.slug).filter((t) => mine.includes(t));
      const score = shared.reduce((n, t) => n + (GENERIC_TAGS.includes(t) ? 1 : 3), 0) + (p.category === current.category ? 2 : 0);
      return { post: p, score, index };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date) || a.index - b.index)
    .slice(0, limit)
    .map((x) => x.post);
}

/** Chronological order (date, then registry order) so posts published on the same day keep a stable sequence */
export function chronological(posts: BlogPost[] = BLOG_POSTS): BlogPost[] {
  return posts
    .map((p, index) => ({ p, index }))
    .sort((a, b) => a.p.date.localeCompare(b.p.date) || a.index - b.index)
    .map((x) => x.p);
}

/** Older ("previous") and newer ("next") articles; undefined at either end of the archive */
export function getAdjacentPosts(slug: string, posts: BlogPost[] = BLOG_POSTS): { previous?: BlogPost; next?: BlogPost } {
  const ordered = chronological(posts);
  const i = ordered.findIndex((p) => p.slug === slug);
  if (i < 0) return {};
  return { previous: ordered[i - 1], next: ordered[i + 1] };
}

/**
 * Which designer page each article should open: a style landing page (/box-designer/<slug>) when the article is about
 * one box type, otherwise the designer itself. Landing slugs are checked against the real list by a test.
 */
const DESIGNER_TARGET_BY_SLUG: Record<string, string> = {
  'ecommerce-mailer-box-unboxing': 'mailer-box',
  'pizza-bakery-box-design': 'pizza-box',
  'apparel-footwear-mailer-shoe-boxes': 'shoe-box',
  'festive-gift-hamper-boxes': 'gift-box',
  'export-cartons-5-ply-7-ply': 'heavy-duty-box',
  'box-stacking-strength-guide': 'shipping-carton',
  'types-of-corrugated-boxes': 'shipping-carton',
  'corrugated-wall-differences': 'heavy-duty-box',
  'packaging-mistakes-small-business': 'shipping-carton',
  'find-right-box-size': 'shipping-carton',
  'box-measurements-guide': 'shipping-carton',
};

const DESIGNER_TARGET_BY_TAG: Partial<Record<BlogTag, string>> = {
  'uc-produce': 'fruit-box',
  'uc-fashion': 'window-mailer-box',
  'uc-cake': 'cake-box',
  'uc-takeaway': 'takeaway-box',
};

export const designerTargetSlug = (slug: string): string | undefined =>
  DESIGNER_TARGET_BY_SLUG[slug] ?? tagsOf(slug).map((t) => DESIGNER_TARGET_BY_TAG[t]).find(Boolean);

export const ALL_DESIGNER_TARGET_SLUGS: string[] = [...new Set([...Object.values(DESIGNER_TARGET_BY_SLUG), ...(Object.values(DESIGNER_TARGET_BY_TAG) as string[])])];

/**
 * Deep link from an article to the designer with tracking: utm_* for analytics and src=blog.<slug>, the same
 * "where did this come from" convention quoteHref() uses (src is [a-z0-9.-], at most 60 characters).
 */
export function designerDeepLink(slug: string): string {
  const target = designerTargetSlug(slug);
  const src = `blog.${slug}`.toLowerCase().replace(/[^a-z0-9.-]/g, '-').slice(0, 60);
  const q = new URLSearchParams({ utm_source: 'blog', utm_medium: 'article', utm_campaign: slug, utm_content: 'try-3d-designer', src });
  return `${target ? `/box-designer/${target}` : '/box-designer'}?${q.toString()}`;
}

/** Lower-case display names of the landing pages above (a test keeps these equal to the real landing names) */
export const DESIGNER_TARGET_NAMES: Record<string, string> = {
  'mailer-box': 'mailer box',
  'pizza-box': 'pizza box',
  'shoe-box': 'shoe box',
  'gift-box': 'gift box',
  'heavy-duty-box': 'heavy-duty box',
  'shipping-carton': 'shipping carton',
  'fruit-box': 'fruit box',
  'window-mailer-box': 'window mailer box',
  'cake-box': 'cake box',
  'takeaway-box': 'takeaway box',
};

export interface DesignerCard {
  title: string;
  body: string;
  label: string;
  href: string;
}

/** Copy and link for the "Try this in the 3D designer" card at the end of an article */
export function getDesignerCard(slug: string): DesignerCard {
  const target = designerTargetSlug(slug);
  const name = target ? DESIGNER_TARGET_NAMES[target] : undefined;
  return {
    title: 'Try this in the 3D designer',
    body: name
      ? `Open the free ${name} designer, set your own size, add your logo and watch it fold. No sign-up.`
      : 'Set your own size, pick the board, add your logo and watch the box fold. Free, no sign-up.',
    label: name ? `Design my ${name}` : 'Open the 3D designer',
    href: designerDeepLink(slug),
  };
}
