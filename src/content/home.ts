/**
 * Home content: range, industries, process steps, FAQ and testimonials.
 * One typed source so the home page, quote options and (later) product pages agree.
 */

import { HERO_IMAGES, PRODUCT_IMAGES } from '@/constants/images';
import type { ImageSlotData } from '@/components/site/ImageSlot';
import type { MadeOrSourced } from '@/components/site/Blocks';
import type { QuoteInput } from '@/lib/quoteSchema';
import { FACTS } from './facts';

const prod = (i: number) => PRODUCT_IMAGES[i].src;

export interface RangeItem {
  slug: string;
  name: string;
  spec: string;
  // VERIFY-LATER[FACT-06]: made in-house vs sourced is a default per product, not confirmed by the owner.
  madeOrSourced: MadeOrSourced;
  moq: string;
  // VERIFY-LATER[FACT-08]: lead times per product are placeholders taken from the existing FAQ copy.
  leadTime: string;
  quoteProduct: QuoteInput['product'];
  image: ImageSlotData;
  extra?: string;
}

export const RANGE: RangeItem[] = [
  {
    slug: 'corrugated-shipping-boxes',
    name: 'Corrugated shipping boxes',
    spec: '3 · 5 · 7-ply RSC',
    madeOrSourced: 'sourced',
    moq: `MOQ ${FACTS.moqBoxes}`,
    leadTime: `Stock sizes ${FACTS.dispatchHours} hrs · custom 5–7 days`,
    quoteProduct: '5-ply',
    // VERIFY-LATER[IMG-03]: AI-generated product images
    image: { id: 'home.range.corrugated', src: prod(0), alt: 'Stack of plain kraft corrugated shipping boxes', kind: 'illustrative' },
  },
  {
    slug: 'die-cut-mailer-boxes',
    name: 'Die-cut & mailer boxes',
    spec: 'Crash-lock, tuck-in, mailers',
    madeOrSourced: 'made',
    moq: `MOQ ${FACTS.moqBoxes}`,
    leadTime: '7–10 days',
    quoteProduct: 'die-cut',
    // VERIFY-LATER[IMG-05]: PROD-4 shows sample brand 'RoyalCrafts' (AI mock-up); replace with a real die-cut photo
    image: { id: 'home.range.diecut', src: prod(3), alt: 'Die-cut corrugated mailer boxes in different shapes', kind: 'illustrative' },
  },
  {
    slug: 'printed-branded-boxes',
    name: 'Printed & branded boxes',
    spec: 'Flexo 1–4 colours, full-colour on request',
    madeOrSourced: 'made',
    moq: 'MOQ 1,000',
    leadTime: '7–10 days',
    quoteProduct: 'printed',
    // VERIFY-LATER[IMG-05]: PROD-5 shows AI mock-up brands (DAZZLE, Kerala Spice Co., Snack Attack); replace with real printed-box photos
    image: { id: 'home.range.printed', src: prod(4), alt: 'Corrugated boxes printed with brand graphics', kind: 'illustrative' },
  },
  {
    slug: 'heavy-duty-boxes',
    name: 'Heavy-duty 7-ply boxes',
    spec: 'Triple wall for industrial loads',
    madeOrSourced: 'sourced',
    moq: `MOQ ${FACTS.moqBoxes}`,
    leadTime: '5–7 days',
    quoteProduct: '7-ply',
    image: { id: 'home.range.heavy', src: prod(2), alt: 'Heavy-duty triple-wall corrugated box with an industrial part', kind: 'illustrative' },
  },
  {
    slug: 'food-grade-boxes',
    name: 'Food-grade boxes',
    spec: 'Food-safe liners and inks',
    madeOrSourced: 'sourced',
    moq: `MOQ ${FACTS.moqBoxes}`,
    leadTime: '5–7 days',
    quoteProduct: 'printed',
    // VERIFY-LATER[IMG-05]: PROD-6 shows a fake 'Lic. No' stamp (implies a food-safety certificate), so a plain box image is used until a real photo exists
    image: { id: 'home.range.foodgrade', src: prod(0), alt: 'Plain corrugated boxes suitable for packed goods', kind: 'illustrative' },
  },
  {
    slug: 'packaging-supplies',
    name: 'Packaging supplies',
    spec: 'BOPP tape · stretch film · bubble wrap · PP strap',
    madeOrSourced: 'sourced',
    moq: 'Per roll / carton',
    leadTime: `${FACTS.dispatchHours} hrs from stock`,
    quoteProduct: 'supplies',
    // VERIFY-LATER[IMG-04]: no supplies image exists yet; reusing a product image
    image: { id: 'home.range.supplies', src: prod(1), alt: 'Corrugated boxes ready for taping and wrapping', kind: 'illustrative', focal: { x: 0.5, y: 0.7 } },
  },
];

export interface IndustryItem {
  slug: NonNullable<QuoteInput['industry']>;
  name: string;
  problem: string;
  spec: string;
  why: string;
  image: ImageSlotData;
}

// VERIFY-LATER[FACT-16]: recommended specs per industry are sensible defaults, not owner-confirmed.
export const INDUSTRY_PANELS: IndustryItem[] = [
  {
    slug: 'e-commerce',
    name: 'E-commerce',
    problem: 'Crushed corners and returns in courier networks.',
    spec: '3-ply B-flute mailer or RSC, 1-colour print',
    why: 'B-flute resists crush and prints crisply, at a low weight per box.',
    image: { id: 'industries.ecommerce', src: prod(3), alt: 'Mailer boxes packed for courier dispatch', kind: 'illustrative' },
  },
  {
    slug: 'fmcg',
    name: 'FMCG',
    problem: 'Outer cartons buckling when stacked high in warehouses.',
    spec: '5-ply B+C double wall RSC',
    why: 'Double wall adds stacking strength for long dwell times.',
    image: { id: 'industries.fmcg', src: prod(1), alt: 'Stacked double-wall cartons on a pallet', kind: 'illustrative' },
  },
  {
    slug: 'electronics',
    name: 'Electronics',
    problem: 'Drops and vibration damaging fragile goods in transit.',
    spec: '5-ply box with die-cut inserts',
    why: 'Fitted inserts stop movement; double wall absorbs knocks.',
    image: { id: 'industries.electronics', src: prod(1), alt: 'Double-wall box for electronics', kind: 'illustrative', focal: { x: 0.3, y: 0.5 } },
  },
  {
    slug: 'food-beverage',
    name: 'Food & Beverage',
    problem: 'Moisture and contact safety for food products.',
    spec: 'Food-grade liners, water-based inks',
    why: 'Safe contact surfaces with print that holds up in cold chains.',
    // VERIFY-LATER[IMG-05]: see home.range.foodgrade
    image: { id: 'industries.food', src: prod(0), alt: 'Plain corrugated boxes for packed goods', kind: 'illustrative', focal: { x: 0.3, y: 0.6 } },
  },
  {
    slug: 'pharma',
    name: 'Pharmaceuticals',
    problem: 'Batch-wise traceability and consistent box quality.',
    spec: '3- or 5-ply RSC with printed batch panel',
    why: 'Consistent dimensions and a clean panel for labels and codes.',
    image: { id: 'industries.pharma', src: prod(0), alt: 'Plain corrugated shipper boxes', kind: 'illustrative' },
  },
  {
    slug: 'automotive',
    name: 'Automotive',
    problem: 'Heavy, sharp-edged parts tearing through boxes.',
    spec: '7-ply C+B+C triple wall',
    why: 'Triple wall carries heavy loads and resists puncture.',
    image: { id: 'industries.auto', src: prod(2), alt: 'Heavy-duty box holding an auto part', kind: 'illustrative' },
  },
];

// VERIFY-LATER[IMG-01]: AI images; h3 is cropped so the garbled certificate text never shows. h4 (fictitious brand) is never used.
export const PROCESS_STEPS = [
  {
    n: '01',
    title: 'Spec & sample',
    body: 'We size, spec and sample before you commit.',
    datum: FACTS.samplePolicy,
    image: { id: 'home.process.spec', src: HERO_IMAGES[4].src, alt: 'Discussing box samples and sizes', kind: 'illustrative' } as ImageSlotData,
  },
  {
    n: '02',
    title: 'Board & print',
    // VERIFY-LATER[FACT-05]: hybrid wording pending owner confirmation of what is made vs sourced
    body: 'Board sourced from vetted mills, converted and printed to your spec.',
    datum: '3, 5 and 7 ply · custom sizes',
    image: { id: 'home.process.convert', src: HERO_IMAGES[1].src, alt: 'Corrugated sheets on a converting line', kind: 'illustrative' } as ImageSlotData,
  },
  {
    n: '03',
    title: 'Convert & QC',
    body: 'Die-cut, glued or stitched, with checks on every batch.',
    datum: 'Size, print and strength checks',
    image: {
      id: 'home.process.qc',
      src: HERO_IMAGES[2].src,
      alt: 'Checking a finished corrugated box',
      kind: 'illustrative',
      focal: { x: 0.5, y: 0.85 },
    } as ImageSlotData,
  },
  {
    n: '04',
    title: 'Pack & dispatch',
    body: `Stock sizes out in ${FACTS.dispatchHours} hrs from Ahmedabad.`,
    datum: `${FACTS.dispatchHours}-hour dispatch*`,
    image: { id: 'home.process.dispatch', src: HERO_IMAGES[0].src, alt: 'Warehouse aisle with pallets of boxes', kind: 'illustrative' } as ImageSlotData,
  },
];

export const HOME_FAQ = [
  { question: 'What is your minimum order?', answer: `${FACTS.moqBoxes} boxes for plain boxes, 1,000 for printed boxes.` },
  { question: 'How fast can you dispatch?', answer: `Stock sizes are dispatched within ${FACTS.dispatchHours} hours from Ahmedabad. Custom boxes usually take 5–7 days.` },
  { question: 'Do you send samples?', answer: `${FACTS.samplePolicy}. Choose "Sample" in the quote form or message us on WhatsApp.` },
  { question: 'Do you provide GST invoices?', answer: 'Yes. Every order comes with a GST invoice.' },
  // VERIFY-LATER[FACT-22]: payment terms not supplied by the owner
  { question: 'What are your payment terms?', answer: 'Terms depend on order size and history. We confirm them with your quote.' },
  { question: 'Can you print our logo?', answer: 'Yes. Flexo printing in 1–4 colours, with full-colour options for branded boxes. Printed orders start at 1,000 boxes.' },
];

// VERIFY-LATER[TEST-01]: reused from the old home page; confirm each has written consent, a full name and a company.
export const TESTIMONIALS = [
  {
    name: 'Rajesh Sharma',
    role: 'Operations Head, ShopEase',
    text: 'Vayu Packaging has been our go-to supplier for over 3 years. Their boxes are sturdy, pricing is competitive, and delivery is always on time.',
  },
  {
    name: 'Priya Mehta',
    role: 'Founder, FreshBite Foods',
    text: 'We needed food-grade corrugated boxes with custom printing. Vayu delivered exactly what we needed, and our brand looks amazing on every box.',
  },
  {
    name: 'Anil Kapoor',
    role: 'Supply Chain Manager, TechVista',
    text: 'Their quality assurance process gives us confidence. Zero damage complaints since we switched to Vayu Packaging Solutions.',
  },
];
