/**
 * Mid-article spec card (§9.7): chosen by an article's tags, so each guide links to the page a reader
 * who just learned this topic is most likely to want next.
 * VERIFY-LATER[BLOG-02]: tags are derived by hand from each article's topic (no tags field exists in
 * src/constants/blogs.ts yet), and the card copy is a default.
 */

import { quoteHref } from '@/lib/quotePrefill';

export type BlogTag =
  | 'ply'
  | 'strength'
  | 'sizing'
  | 'material'
  | 'designer'
  | 'types'
  // Designer Guides: one card per designer feature, so each guide links to the feature it explains
  | 'dg-styles'
  | 'dg-fit'
  | 'dg-estimate'
  | 'dg-artwork'
  | 'dg-dieline'
  | 'dg-shots'
  | 'dg-stack';

export const BLOG_TAGS: Record<string, BlogTag[]> = {
  'types-of-corrugated-boxes': ['types', 'ply'],
  'corrugated-wall-differences': ['ply', 'strength'],
  'flute-types-guide': ['ply', 'material'],
  'gsm-calculation-strength': ['strength', 'material'],
  'burst-strength-ect-guide': ['strength'],
  'box-measurements-guide': ['sizing'],
  'kraft-paper-grades': ['material'],
  '3d-box-designer-tool-free': ['designer', 'sizing'],
  // Use Cases (Workstream D2)
  'box-manufacturers-3d-presentations': ['designer', 'types'],
  'wholesalers-spec-price-share-boxes': ['designer', 'sizing'],
  'ecommerce-mailer-box-unboxing': ['designer', 'sizing'],
  'pizza-bakery-box-design': ['designer', 'material'],
  'apparel-footwear-mailer-shoe-boxes': ['designer', 'sizing'],
  'festive-gift-hamper-boxes': ['designer', 'types'],
  'export-cartons-5-ply-7-ply': ['designer', 'strength', 'ply'],
  'packaging-mistakes-small-business': ['designer', 'sizing', 'strength'],
  // Designer Guides (Workstream D1)
  'how-to-use-3d-box-designer': ['designer', 'sizing'],
  'box-styles-in-3d': ['dg-styles', 'designer', 'types'],
  'find-right-box-size': ['dg-fit', 'designer', 'sizing'],
  'box-price-estimate-guide': ['dg-estimate', 'designer'],
  'logo-artwork-on-boxes': ['dg-artwork', 'designer'],
  'dielines-explained': ['dg-dieline', 'designer'],
  'packaging-product-shots-360-video': ['dg-shots', 'designer'],
  'box-stacking-strength-guide': ['dg-stack', 'designer', 'strength'],
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
    tag: 'dg-styles',
    eyebrow: 'Try it',
    title: 'Try all eight styles on your size',
    body: 'Set your inside size once, then click through the styles and watch each one fold.',
    label: 'Compare styles in 3D',
    href: () => '/box-designer',
    intent: 'designer',
  },
  {
    tag: 'dg-fit',
    eyebrow: 'Try it',
    title: 'Get the inside size from your product',
    body: 'Enter your product size and padding. The fit checker sets the box size in mm, cm or inches.',
    label: 'Open the fit checker',
    href: () => '/box-designer',
    intent: 'designer',
  },
  {
    tag: 'dg-estimate',
    eyebrow: 'Try it',
    title: 'See an indicative price for your box',
    body: 'Set the size, board and print, then compare 100, 500, 1,000 and 5,000 boxes.',
    label: 'Get an instant estimate',
    href: () => '/box-designer',
    intent: 'designer',
  },
  {
    tag: 'dg-artwork',
    eyebrow: 'Try it',
    title: 'Put your logo on a 3D box',
    body: 'Upload your logo, fold the box, and let the print checks catch problems before printing.',
    label: 'Add my logo',
    href: () => '/box-designer',
    intent: 'designer',
  },
  {
    tag: 'dg-dieline',
    eyebrow: 'Try it',
    title: 'Download a dieline for your box',
    body: 'Set the style, size and board, then export a 1:1 mm SVG or PDF dieline.',
    label: 'Get my dieline',
    href: () => '/box-designer',
    intent: 'designer',
  },
  {
    tag: 'dg-shots',
    eyebrow: 'Try it',
    title: 'Make a product shot of your box',
    body: 'Pick a background and an angle, download a sharp image or record a 360° spin.',
    label: 'Make a product shot',
    href: () => '/box-designer',
    intent: 'designer',
  },
  {
    tag: 'dg-stack',
    eyebrow: 'Try it',
    title: 'Check how high your box will stack',
    body: 'Enter the weight of one packed box and get a plain-language strength verdict.',
    label: 'Check my box strength',
    href: () => '/box-designer',
    intent: 'designer',
  },
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
