/**
 * Mid-article spec card (§9.7): chosen by an article's tags, so each guide links to the page a reader
 * who just learned this topic is most likely to want next.
 * VERIFY-LATER[BLOG-02]: tags are derived by hand from each article's topic (no tags field exists in
 * src/constants/blogs.ts yet), and the card copy is a default.
 */

import { quoteHref } from '@/lib/quotePrefill';

export type BlogTag = 'ply' | 'strength' | 'sizing' | 'material' | 'designer' | 'types';

export const BLOG_TAGS: Record<string, BlogTag[]> = {
  'types-of-corrugated-boxes': ['types', 'ply'],
  'corrugated-wall-differences': ['ply', 'strength'],
  'flute-types-guide': ['ply', 'material'],
  'gsm-calculation-strength': ['strength', 'material'],
  'burst-strength-ect-guide': ['strength'],
  'box-measurements-guide': ['sizing'],
  'kraft-paper-grades': ['material'],
  '3d-box-designer-tool-free': ['designer', 'sizing'],
};

export interface BlogCtaCard {
  tag: BlogTag;
  eyebrow: string;
  title: string;
  body: string;
  label: string;
  /** Internal path only (rendered through <Cta>) */
  href: (slug: string) => string;
  intent: 'quote' | 'navigate' | 'finder' | 'designer';
}

/** First matching tag wins, in this priority order */
const CARDS: BlogCtaCard[] = [
  {
    tag: 'designer',
    eyebrow: 'Try it',
    title: 'Design your box in 3D before you order',
    body: 'Set the size and board, add your logo and see it fold. Then send the design with your quote.',
    label: 'Open the 3D designer',
    href: () => '/box-designer',
    intent: 'designer',
  },
  {
    tag: 'sizing',
    eyebrow: 'Sizing',
    title: 'Not sure of your box size?',
    body: 'Enter your product size and weight. The Packaging Finder suggests a spec.',
    label: 'Find my box spec',
    href: () => '/compare-quote',
    intent: 'finder',
  },
  {
    tag: 'strength',
    eyebrow: 'Specs',
    title: 'Need 5-ply boxes? See specs',
    body: 'Double wall for heavier goods. Strength test reports are available on request.',
    label: 'See 5-ply specs',
    href: () => '/products/5-ply',
    intent: 'navigate',
  },
  {
    tag: 'ply',
    eyebrow: 'Specs',
    title: 'Compare 3, 5 and 7-ply boxes',
    body: 'See thickness, flutes and best uses side by side, then ask for a price.',
    label: 'See the ply range',
    href: () => '/products',
    intent: 'navigate',
  },
  {
    tag: 'material',
    eyebrow: 'Specs',
    title: 'Talk to us about board and paper',
    body: 'Tell us what you ship and we will recommend the board, flute and paper grade.',
    label: 'Get a recommendation',
    href: (slug) => quoteHref({ product: 'not-sure', src: `blog.${slug}.mid` }),
    intent: 'quote',
  },
  {
    tag: 'types',
    eyebrow: 'Specs',
    title: 'Found the box type you need?',
    body: 'Get a price for 3, 5 or 7-ply boxes in your size.',
    label: 'Get a quote',
    href: (slug) => quoteHref({ src: `blog.${slug}.mid` }),
    intent: 'quote',
  },
];

export function pickBlogCta(slug: string): BlogCtaCard {
  const tags = BLOG_TAGS[slug] ?? [];
  return CARDS.find((card) => tags.includes(card.tag)) ?? CARDS[CARDS.length - 1];
}
