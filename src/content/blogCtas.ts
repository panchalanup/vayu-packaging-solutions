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
  | 'dg-stack'
  | 'dg-cutouts'
  | 'dg-templates'
  | 'dg-picker'
  | 'dg-ideas'
  | 'dg-openings'
  // Use cases for the phase 2 styles: each links to its style landing page
  | 'uc-produce'
  | 'uc-fashion'
  | 'uc-cake'
  | 'uc-takeaway'
  // Size charts and calculators (blog writer N1): each links to the calculator or preset the article is about
  | 'n1-volumetric'
  | 'n1-sizes'
  | 'n1-mailer'
  | 'n1-cake'
  | 'n1-cbm'
  | 'n1-choose'
  // Buying and technical guides (blog writer N2): each links to the designer or calculator view the article is about
  | 'bg-order'
  | 'bg-moq'
  | 'bg-cost'
  | 'uc-seller'
  | 'tg-capacity'
  | 'tg-spec';

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
  // Use Cases for phase 2 styles (Workstream I1)
  'fruit-vegetable-ventilated-boxes': ['uc-produce', 'designer', 'strength'],
  'mango-apple-grape-packing-boxes': ['uc-produce', 'designer', 'sizing'],
  'clothing-saree-footwear-boxes': ['uc-fashion', 'designer', 'sizing'],
  'cake-sweet-bakery-boxes': ['uc-cake', 'designer', 'sizing'],
  'takeaway-tiffin-pizza-boxes-cloud-kitchens': ['uc-takeaway', 'designer', 'sizing'],
  'how-to-add-cutouts-box-design': ['dg-cutouts', 'designer'],
  'box-design-templates-tour': ['dg-templates', 'designer'],
  'which-box-style-should-you-choose': ['dg-picker', 'designer', 'types'],
  'box-design-ideas-in-5-minutes': ['dg-ideas', 'designer', 'types'],
  'vents-hand-holes-windows-box-design': ['dg-openings', 'designer', 'strength'],
  // Buying and technical guides (blog writer N2)
  'how-to-order-custom-printed-boxes-india': ['bg-order', 'designer', 'types'],
  'minimum-order-quantity-custom-boxes': ['bg-moq', 'designer', 'types'],
  'packing-for-amazon-flipkart-meesho': ['uc-seller', 'designer', 'sizing'],
  'how-many-kg-can-corrugated-box-hold': ['tg-capacity', 'strength', 'ply'],
  'reading-box-spec-ply-bf-gsm': ['tg-spec', 'ply', 'material'],
  'what-does-a-5-ply-box-cost': ['bg-cost', 'designer', 'types'],
  // Size charts, calculators and buying guide (Workstream N1)
  'volumetric-weight-calculator-india': ['n1-volumetric', 'sizing'],
  'standard-corrugated-box-sizes-india': ['n1-sizes', 'sizing'],
  'mailer-box-sizes-tshirt-kurti-saree-jewellery': ['n1-mailer', 'uc-fashion', 'designer', 'sizing'],
  'cake-box-size-chart': ['n1-cake', 'uc-cake', 'designer', 'sizing'],
  'cbm-calculator-cartons-per-container': ['n1-cbm', 'sizing', 'strength'],
  'choose-corrugated-box-manufacturer-ahmedabad': ['n1-choose', 'types', 'designer'],
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
    tag: 'n1-volumetric',
    eyebrow: 'Free calculator',
    title: 'Check what a courier may bill for your box',
    body: 'Enter the box size and weight, pick a divisor and see how much a smaller box would save.',
    label: 'Open the volumetric weight calculator',
    href: () => '/tools/volumetric-weight-calculator',
    intent: 'navigate',
  },
  {
    tag: 'n1-cbm',
    eyebrow: 'Free calculator',
    title: 'Work out CBM and cartons per container',
    body: 'Enter the carton size, quantity and weight to see CBM, cartons per pallet and per container.',
    label: 'Open the CBM calculator',
    href: () => '/tools/cbm-calculator',
    intent: 'navigate',
  },
  {
    tag: 'n1-sizes',
    eyebrow: 'Free calculator',
    title: 'Not on the chart? Work out your own size',
    body: 'Enter your product size and padding to get the inside and outside box size, then open it in 3D.',
    label: 'Open the box size calculator',
    href: () => '/tools/box-size-calculator',
    intent: 'navigate',
  },
  {
    tag: 'n1-mailer',
    eyebrow: 'Try it',
    title: 'Open a T-shirt mailer in 3D',
    body: 'Start from 30.5 x 24.5 x 5.5 cm inside, change it to your folded size and fold the box.',
    label: 'Open a T-shirt mailer',
    href: (slug) => `/box-designer?style=mailer&l=30.5&w=24.5&h=5.5&ply=3-ply&fl=E&src=blog.${slug}.mid`,
    intent: 'designer',
  },
  {
    tag: 'n1-cake',
    eyebrow: 'Try it',
    title: 'Open a 1 kg cake box in 3D',
    body: 'Start from 25 x 25 x 12 cm inside with a window, then change it to your cake board.',
    label: 'Open a 1 kg cake box',
    href: (slug) => `/box-designer?style=cake-box&l=25&w=25&h=12&ply=3-ply&fl=E&col=F5F5F0&opt=window&src=blog.${slug}.mid`,
    intent: 'designer',
  },
  {
    tag: 'n1-choose',
    eyebrow: 'Try it',
    title: 'Get comparable quotes from the same file',
    body: 'Set your size and board in the designer, check the indicative estimate, then send the same spec to every supplier.',
    label: 'Start from my spec',
    href: () => '/box-designer',
    intent: 'designer',
  },
  {
    tag: 'dg-styles',
    eyebrow: 'Try it',
    title: 'Try the styles on your size',
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
    tag: 'dg-cutouts',
    eyebrow: 'Try it',
    title: 'Put cutouts on your own box',
    body: 'Pick a sticker, tint it to your brand colour, repeat it as a pattern and fold the box.',
    label: 'Add cutouts in 3D',
    href: () => '/box-designer',
    intent: 'designer',
  },
  {
    tag: 'dg-templates',
    eyebrow: 'Try it',
    title: 'Start from a ready box design',
    body: 'Open one of 74 templates for fruit, food, fashion or gifts, then make it yours.',
    label: 'Browse templates',
    href: () => '/box-designer',
    intent: 'designer',
  },
  {
    tag: 'dg-picker',
    eyebrow: 'Try it',
    title: 'Find the style for your product',
    body: 'Tap what you are packing and the style picker shows the best matches first.',
    label: 'Open the style picker',
    href: () => '/box-designer',
    intent: 'designer',
  },
  {
    tag: 'dg-ideas',
    eyebrow: 'Try it',
    title: 'Build one of these in 5 minutes',
    body: 'Choose the idea closest to your product and recreate it in the free 3D designer.',
    label: 'Build my box',
    href: () => '/box-designer',
    intent: 'designer',
  },
  {
    tag: 'dg-openings',
    eyebrow: 'Try it',
    title: 'Try vents, hand holes or a window',
    body: 'Switch an opening on, see it on the box and read the strength note before you decide.',
    label: 'Try cut-outs in 3D',
    href: () => '/box-designer',
    intent: 'designer',
  },
  {
    tag: 'uc-produce',
    eyebrow: 'Try it',
    title: 'Design a ventilated fruit box',
    body: 'Set the size for your fruit, switch vents and hand holes on and off, and see the dieline cut lines.',
    label: 'Design a fruit box',
    href: () => '/box-designer/fruit-box',
    intent: 'designer',
  },
  {
    tag: 'uc-fashion',
    eyebrow: 'Try it',
    title: 'Design a clothing or footwear box',
    body: 'Pick a window mailer, saree box or shoe box, set the folded size and add your label.',
    label: 'Design a window mailer',
    href: () => '/box-designer/window-mailer-box',
    intent: 'designer',
  },
  {
    tag: 'uc-cake',
    eyebrow: 'Try it',
    title: 'Design a window cake box',
    body: 'Size it from your cake board, set the window and add your bakery name.',
    label: 'Design a cake box',
    href: () => '/box-designer/cake-box',
    intent: 'designer',
  },
  {
    tag: 'uc-takeaway',
    eyebrow: 'Try it',
    title: 'Design a takeaway box',
    body: 'Size a clamshell from your wrapped food and your delivery bag, then add your brand.',
    label: 'Design a takeaway box',
    href: () => '/box-designer/takeaway-box',
    intent: 'designer',
  },
  {
    tag: 'bg-order',
    eyebrow: 'Try it',
    title: 'Start your order with a 3D spec',
    body: 'Set the style, size and board, add your logo, then send the design with your quote request.',
    label: 'Open a mailer box in 3D',
    href: () => '/box-designer?style=mailer&l=30&w=22&h=8&ply=3-ply&fl=B',
    intent: 'designer',
  },
  {
    tag: 'bg-moq',
    eyebrow: 'Try it',
    title: 'See how quantity moves the price',
    body: 'Open a box and compare 100, 500, 1,000 and 5,000 in the Price & order tab. It is an indicative range, not a quote.',
    label: 'Compare quantities',
    href: () => '/box-designer?style=rsc&l=30&w=22&h=15&ply=3-ply&fl=B',
    intent: 'designer',
  },
  {
    tag: 'bg-cost',
    eyebrow: 'Try it',
    title: 'Run your own estimate',
    body: 'Change the size, ply, print colours and quantity and watch the indicative range move.',
    label: 'Get an instant estimate',
    href: () => '/box-designer?style=rsc&l=40&w=30&h=25&ply=5-ply&fl=BC',
    intent: 'designer',
  },
  {
    tag: 'uc-seller',
    eyebrow: 'Try it',
    title: 'Size a seller mailer in 3D',
    body: 'Start from a mailer, set the folded size from your product and check the fit before you order.',
    label: 'Design a mailer box',
    href: () => '/box-designer/mailer-box',
    intent: 'designer',
  },
  {
    tag: 'tg-capacity',
    eyebrow: 'Calculator',
    title: 'Estimate how much your box can stack',
    body: 'Enter the inside size, board and the weight of one packed box. The free calculator shows an indicative stack height.',
    label: 'Open the strength calculator',
    href: () => '/tools/box-strength-calculator',
    intent: 'navigate',
  },
  {
    tag: 'tg-spec',
    eyebrow: 'Try it',
    title: 'Turn a spec line into a 3D box',
    body: 'Pick the ply, set the size and watch the board thickness change, then ask for a quote that spells out the papers.',
    label: 'Open a 5-ply box',
    href: () => '/box-designer?style=rsc&l=40&w=30&h=25&ply=5-ply&fl=BC',
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
    body: 'Double wall for heavier goods.',
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
