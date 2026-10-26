/**
 * SEO landing pages for the 3D box designer (#33): /box-designer/:slug.
 * Each page explains one box type in plain words and opens the designer preconfigured from a template.
 * Copy is general packaging guidance only: no invented claims, customers, numbers or certifications.
 * Only pages whose style has a 3D model are routed and listed (see availableLandings).
 */

import type { BoxDimensions, BoxTemplate } from '@/types/boxDesigner';
import { findTemplate } from '@/lib/boxDesigner/templates';
import { hasStyleModel } from '@/lib/boxDesigner/styleAvailability';

export interface DesignerLanding {
  slug: string;
  templateId: string;
  style: BoxTemplate;
  /** Name used in links and breadcrumbs */
  name: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  h1: string;
  intro: string;
  bestFor: string[];
  sizes: { label: string; dims: BoxDimensions }[];
  tips: string[];
  faqs: { question: string; answer: string }[];
}

export const DESIGNER_LANDINGS: DesignerLanding[] = [
  {
    slug: 'shipping-carton',
    templateId: 'ecommerce-shipper',
    style: 'rsc',
    name: 'Shipping carton',
    metaTitle: 'Shipping Carton Designer: Design a Custom Corrugated Carton in 3D',
    metaDescription: 'Design a custom shipping carton (RSC) in 3D for free. Set the inside size, pick 3, 5 or 7-ply board, add your logo and download the dieline. No sign-up.',
    keywords: ['shipping carton design', 'custom corrugated carton', 'RSC box designer', 'carton box maker online'],
    h1: 'Design your shipping carton in 3D',
    intro:
      'The regular slotted carton (RSC, FEFCO 0201) is the everyday shipping box: four flaps on top and bottom that meet in the middle. It uses board efficiently, packs flat and is the easiest box to source in any size.',
    bestFor: ['E-commerce and courier parcels', 'Warehouse storage and moving', 'Distributor and wholesale shipments', 'Most products that are not fragile or very heavy'],
    sizes: [
      { label: 'Small parcel', dims: { length: 20, width: 15, height: 10 } },
      { label: 'Medium parcel', dims: { length: 30, width: 22, height: 15 } },
      { label: 'Large parcel', dims: { length: 45, width: 35, height: 30 } },
    ],
    tips: [
      'Enter inside dimensions: measure the product (or its inner pack) and add a little room for padding.',
      '3-ply suits light parcels; step up to 5-ply for heavier goods or when cartons are stacked.',
      'A one-colour logo on kraft prints crisply and keeps cost low.',
    ],
    faqs: [
      { question: 'Are the sizes inside or outside?', answer: 'Inside. The designer adds the board thickness to show the outside size and builds the dieline from it.' },
      { question: 'Which board should I choose?', answer: 'Use the guided “Find my box” in the designer: it suggests ply and flute from the weight, fragility and how the box will travel. The quote team confirms it.' },
    ],
  },
  {
    slug: 'mailer-box',
    templateId: 'apparel-mailer',
    style: 'mailer',
    name: 'Mailer box',
    metaTitle: 'Mailer Box Designer: Custom Printed E-commerce Mailers in 3D',
    metaDescription: 'Design a custom mailer box (tuck-front, FEFCO 0427) in 3D. Add your logo to the lid, choose an inside colour and see it fold. Free, no sign-up.',
    keywords: ['mailer box design', 'custom mailer box', 'e-commerce mailer box', 'tuck front box designer'],
    h1: 'Design your mailer box in 3D',
    intro:
      'A mailer box is a die-cut box with a hinged lid and a tuck front. It closes without tape, feels like a gift when opened and has a large lid for your brand.',
    bestFor: ['Clothing and accessories', 'Subscription and gift kits', 'Cosmetics and small electronics', 'Unboxing-focused D2C brands'],
    sizes: [
      { label: 'Small mailer', dims: { length: 20, width: 15, height: 6 } },
      { label: 'Apparel mailer', dims: { length: 30, width: 23, height: 6 } },
      { label: 'Kit mailer', dims: { length: 30, width: 25, height: 10 } },
    ],
    tips: ['Put the logo on the lid: it is the first thing people see.', 'A coloured inside adds surprise when the box is opened.', 'E-flute gives a smooth surface for sharp print.'],
    faqs: [
      { question: 'Does a mailer need tape?', answer: 'No. The front tucks in to close it, although many sellers add a seal or tamper sticker.' },
      { question: 'Can I print inside the box?', answer: 'You can choose an inside colour in the designer. Ask us about printed insides when you request a quote.' },
    ],
  },
  {
    slug: 'pizza-box',
    templateId: 'pizza-box',
    style: 'pizza',
    name: 'Pizza box',
    metaTitle: 'Pizza Box Designer: Custom Printed Pizza Boxes in 3D',
    metaDescription: 'Design a custom pizza box in 3D. Set the size in inches or cm, add your logo to the lid and download a proof. Free, no sign-up.',
    keywords: ['pizza box design', 'custom pizza box', 'printed pizza box', 'pizza box maker'],
    h1: 'Design your pizza box in 3D',
    intro: 'A pizza box is a shallow, square mailer with a big lid. It stacks flat in the kitchen, folds in seconds and carries your brand to every door.',
    bestFor: ['Pizzerias and cloud kitchens', 'Flatbreads, cakes and tarts', 'Flat apparel and prints'],
    sizes: [
      { label: '8 inch', dims: { length: 21, width: 21, height: 5 } },
      { label: '10 inch', dims: { length: 26, width: 26, height: 5 } },
      { label: '12 inch', dims: { length: 31, width: 31, height: 5 } },
    ],
    tips: ['Switch the designer to inches to work in pizza sizes.', 'One or two print colours on kraft look classic and stay affordable.', 'Keep artwork away from the folds so it does not crack.'],
    faqs: [
      { question: 'Which board is used for pizza boxes?', answer: 'Usually a single-wall (3-ply) E or B flute board. Food-contact needs are confirmed with your quote.' },
      { question: 'Can I design in inches?', answer: 'Yes. Switch the unit to inches; the box is stored and quoted accurately in any unit.' },
    ],
  },
  {
    slug: 'shoe-box',
    templateId: 'shoe-box',
    style: 'telescope',
    name: 'Shoe box',
    metaTitle: 'Shoe Box Designer: Custom Lid-and-Base Shoe Boxes in 3D',
    metaDescription: 'Design a custom shoe box with a separate lid in 3D. Set the size, print the lid with your brand and download a spec sheet. Free, no sign-up.',
    keywords: ['shoe box design', 'custom shoe box', 'telescope box', 'lid and base box designer'],
    h1: 'Design your shoe box in 3D',
    intro: 'Shoe boxes are usually telescope boxes: a base with a separate lid that slides over it. The lid top is one clean panel for your brand and the box reopens neatly in store.',
    bestFor: ['Footwear brands and retailers', 'Accessories and leather goods', 'Retail shelf packs'],
    sizes: [
      { label: 'Kids', dims: { length: 25, width: 16, height: 9 } },
      { label: 'Adult', dims: { length: 33, width: 20, height: 12 } },
      { label: 'Boots', dims: { length: 36, width: 26, height: 14 } },
    ],
    tips: ['Leave a little room for tissue paper around the pair.', 'Print the size and colour on the lid end for easy stock picking.', 'Use the fold slider to lift the lid off and show the inside.'],
    faqs: [
      { question: 'What is a telescope box?', answer: 'A two-piece box: a base and a lid that slides over it. The lid depth can be changed in the designer.' },
      { question: 'Can I print the inside?', answer: 'Choose an inside colour in the designer and mention printed insides when you request a quote.' },
    ],
  },
  {
    slug: 'gift-box',
    templateId: 'gift-box',
    style: 'telescope',
    name: 'Gift box',
    metaTitle: 'Gift Box Designer: Custom Printed Gift Boxes in 3D',
    metaDescription: 'Design a custom gift box (lid and base) in 3D. Choose colours, gloss or matte finish, add your logo and present it in full screen. Free, no sign-up.',
    keywords: ['gift box design', 'custom gift box', 'festive gift box', 'premium box designer'],
    h1: 'Design your gift box in 3D',
    intro: 'A lid-and-base gift box feels premium the moment it is lifted open. Pick a dark or bright board, add your logo to the lid and preview a gloss or matte finish.',
    bestFor: ['Festive and corporate gifting', 'Hampers and sweets', 'Premium retail packs'],
    sizes: [
      { label: 'Small', dims: { length: 15, width: 15, height: 8 } },
      { label: 'Square', dims: { length: 20, width: 20, height: 10 } },
      { label: 'Hamper', dims: { length: 35, width: 25, height: 12 } },
    ],
    tips: ['Use Present mode to show the box to a client full screen.', 'A contrasting inside colour makes the reveal special.', 'Download the spec sheet for sign-off before production.'],
    faqs: [
      { question: 'Can I show the box to my customer?', answer: 'Yes. Open the Showcase tab and choose “Present to a customer” for a clean full-screen turntable, or send a share link.' },
      { question: 'Is the finish exact?', answer: 'Gloss and matte are previewed on screen. Exact colours and finish are confirmed on a physical proof.' },
    ],
  },
  {
    slug: 'bakery-box',
    templateId: 'bakery-tray',
    style: 'tray',
    name: 'Bakery tray',
    metaTitle: 'Bakery Box and Tray Designer: Custom Food Trays in 3D',
    metaDescription: 'Design a custom die-cut bakery tray in 3D. Set the size, choose white or kraft board and add your logo. Free, no sign-up.',
    keywords: ['bakery box design', 'cake tray design', 'custom food tray', 'die cut tray designer'],
    h1: 'Design your bakery tray in 3D',
    intro: 'A die-cut tray has double walls all round and an open top. It shows off cakes, sweets and produce, stacks neatly and folds without glue.',
    bestFor: ['Bakeries and sweet shops', 'Fruit and produce', 'Shelf-ready and display packs'],
    sizes: [
      { label: 'Pastry', dims: { length: 20, width: 15, height: 6 } },
      { label: 'Cake', dims: { length: 25, width: 25, height: 7 } },
      { label: 'Produce', dims: { length: 40, width: 30, height: 10 } },
    ],
    tips: ['White board makes food look fresh; kraft looks natural.', 'Print the brand on the front wall where the tray faces the customer.'],
    faqs: [{ question: 'Is it food safe?', answer: 'Food-contact board and inks are chosen with your order. Mention the food type when you ask for a quote.' }],
  },
  {
    slug: 'heavy-duty-box',
    templateId: 'heavy-duty',
    style: 'fol',
    name: 'Heavy-duty box',
    metaTitle: 'Heavy-Duty Box Designer: Full Overlap Cartons in 3D',
    metaDescription: 'Design a heavy-duty full overlap (FOL) carton in 3D with 5 or 7-ply board. See the stacking strength guide and download the dieline. Free.',
    keywords: ['heavy duty box design', 'full overlap carton', '7 ply box', 'export carton designer'],
    h1: 'Design your heavy-duty carton in 3D',
    intro: 'A full overlap carton (FOL, FEFCO 0203) has outer flaps that reach right across, giving a double layer on top and bottom. It suits heavy, long or awkward items and rough handling.',
    bestFor: ['Machinery parts and hardware', 'Export and container shipments', 'High warehouse stacks'],
    sizes: [
      { label: 'Parts', dims: { length: 40, width: 30, height: 25 } },
      { label: 'Export', dims: { length: 50, width: 40, height: 40 } },
      { label: 'Long item', dims: { length: 90, width: 25, height: 25 } },
    ],
    tips: ['Use the pallet view in Showcase to see a full load.', 'Check the strength guide in Price & order before choosing ply.'],
    faqs: [{ question: 'When do I need 7-ply?', answer: 'For heavy contents or tall stacks. The designer’s strength guide gives an indicative stacking figure for your size and board.' }],
  },
  {
    slug: 'box-sleeve',
    templateId: 'product-sleeve',
    style: 'sleeve',
    name: 'Box sleeve',
    metaTitle: 'Box Sleeve Designer: Custom Printed Sleeves in 3D',
    metaDescription: 'Design a custom printed box sleeve in 3D. A sleeve slides over a tray or product to carry your branding. Free, no sign-up.',
    keywords: ['box sleeve design', 'custom packaging sleeve', 'printed sleeve', 'tray sleeve designer'],
    h1: 'Design your box sleeve in 3D',
    intro: 'A sleeve is four printed walls, open at both ends. It slides over a tray, a plain box or the product itself to add branding without a new box.',
    bestFor: ['Food trays and meal boxes', 'Rebranding plain stock boxes', 'Bundling products together'],
    sizes: [
      { label: 'Snack', dims: { length: 15, width: 10, height: 5 } },
      { label: 'Meal tray', dims: { length: 20, width: 15, height: 6 } },
      { label: 'Bundle', dims: { length: 30, width: 20, height: 10 } },
    ],
    tips: ['Size the sleeve to the outside of the tray it goes over.', 'Use all four walls: the base often faces up on shelves.'],
    faqs: [{ question: 'What size should a sleeve be?', answer: 'Its inside should match the outside of what it slides over, with a millimetre or two of play.' }],
  },
];

export function availableLandings(): DesignerLanding[] {
  return DESIGNER_LANDINGS.filter((l) => hasStyleModel(l.style) && !!findTemplate(l.templateId));
}

export function findLanding(slug: string | undefined): DesignerLanding | undefined {
  return slug ? availableLandings().find((l) => l.slug === slug) : undefined;
}

/** Designer link that opens the landing's template (optionally at a size, cm) */
export function landingDesignerHref(landing: DesignerLanding, dims?: BoxDimensions): string {
  const q = new URLSearchParams({ template: landing.templateId });
  if (dims) {
    q.set('l', String(dims.length));
    q.set('w', String(dims.width));
    q.set('h', String(dims.height));
  }
  return `/box-designer?${q.toString()}`;
}

export const landingOgImage = (slug: string) => `/og/box-designer-${slug}.png`;
