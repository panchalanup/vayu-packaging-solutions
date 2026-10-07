/**
 * Products: ONE typed source of truth (plan §9.3).
 * Feeds /products, /products/:slug, the Product / FAQ / ItemList schema (src/seo/schema/productPages.ts),
 * the sitemap and (later) the quote form options.
 * Rule: no number appears here that is not already in src/content/home.ts, src/content/facts.ts,
 * src/lib/boxDesigner/boardSpecs.ts or the old product copy. Unknown values read "On request".
 * SECURITY: static first-party copy only; it is always rendered as text (never as HTML).
 * Review queue: grep -rn "VERIFY-LATER" src/content/products.ts
 */

import { PRODUCT_IMAGES } from '@/constants/images';
import type { ImageSlotData } from '@/components/site/ImageSlot';
import type { MadeOrSourced } from '@/components/site/Blocks';
import { INDUSTRY_SLUGS, type QuoteInput } from '@/lib/quoteSchema';
import { getBoardSpec } from '@/lib/boxDesigner/boardSpecs';
import type { PlyType } from '@/types/boxDesigner';
import { INDUSTRY_PANELS } from './home';
import { FACTS } from './facts';

export type IndustrySlug = (typeof INDUSTRY_SLUGS)[number];

export const PRODUCT_SLUGS = [
  '3-ply',
  '5-ply',
  '7-ply',
  'die-cut',
  'printed',
  'food-grade',
  'bopp-tape',
  'stretch-film',
  'bubble-wrap',
  'pp-strapping',
] as const;
export type ProductSlug = (typeof PRODUCT_SLUGS)[number];

/** Filter "Type" chips on /products */
export type ProductType = 'shipping' | 'die-cut' | 'printed' | 'food-grade' | 'supplies';
export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  shipping: 'RSC shipping boxes',
  'die-cut': 'Die-cut & mailer',
  printed: 'Printed',
  'food-grade': 'Food-grade',
  supplies: 'Supplies',
};

export type PlyNumber = 3 | 5 | 7;

export interface SpecRow {
  label: string;
  value: string;
}

export interface ProductFaq {
  question: string;
  answer: string;
}

export interface Product {
  slug: ProductSlug;
  name: string;
  group: 'box' | 'supply';
  type: ProductType;
  madeOrSourced: MadeOrSourced;
  short: string;
  long: string;
  /** Plies on offer; drives the Ply filter */
  plies: PlyNumber[];
  /** Set for the three ply pages that show the to-scale cross-section */
  crossSection?: PlyType;
  /** One-line key spec for cards */
  keySpec: string;
  moq: string;
  moqUnits?: number;
  leadTime: string;
  sizeRange: string;
  printOptions: string;
  useCases: string[];
  industries: IndustrySlug[];
  quoteProduct: QuoteInput['product'];
  image: ImageSlotData;
  faq: ProductFaq[];
  specs: SpecRow[];
  related: ProductSlug[];
}

const prod = (i: number) => PRODUCT_IMAGES[i].src;

const MOQ_BOXES = `${FACTS.moqBoxes} boxes`;
const STOCK_AND_CUSTOM = `Stock sizes ${FACTS.dispatchHours} hrs · custom 5–7 days`;
const TEST_REPORT = 'Test report on request';
const ON_REQUEST = 'On request';
const PLAIN_PRINT = 'Plain, or printed on request (printed orders start at 1,000 boxes)';

const board = (ply: PlyType) => getBoardSpec(ply);
const fluteLabel = (ply: PlyType) => board(ply).flutes.map((f) => `${f}-flute`).join(' + ');
const caliper = (ply: PlyType) => `${board(ply).caliperMm.toFixed(1)} mm`;

/** Rows shared by every corrugated product; BCT/ECT/GSM/BF stay "on request" until the owner supplies test data */
function boardRows(ply: PlyType, wall: string, plyCount: number): SpecRow[] {
  return [
    { label: 'Construction', value: wall },
    { label: 'Ply', value: String(plyCount) },
    { label: 'Default flutes (outer to inner)', value: fluteLabel(ply) },
    { label: 'Board thickness (indicative)', value: caliper(ply) },
    // VERIFY-LATER[SPEC-01]: GSM, bursting factor, BCT and ECT values for each ply are not supplied yet.
    { label: 'Paper GSM / BF', value: TEST_REPORT },
    { label: 'BCT / ECT', value: TEST_REPORT },
  ];
}

// VERIFY-LATER[IMG-03]: AI-generated product images; replace with real photography (plan §10).
// VERIFY-LATER[IMG-05]: PROD-4/5/6 contain AI-made third-party sample brands (RoyalCrafts, DAZZLE, a "Lic. No" stamp). Swap before launch.
export const PRODUCTS: Product[] = [
  {
    slug: '3-ply',
    name: '3-ply corrugated boxes',
    group: 'box',
    type: 'shipping',
    // VERIFY-LATER[FACT-06]: made vs sourced is a default per product, not confirmed by the owner.
    madeOrSourced: 'sourced',
    short: 'Single wall boxes for light and medium goods, at the lowest cost per box.',
    long: 'Three-ply boxes pair two liners with one fluted layer. They suit apparel, accessories, books and other light to medium products, and print cleanly in B-flute. Share your product weight and L × W × H and we will confirm whether single wall is enough or a 5-ply is safer.',
    plies: [3],
    crossSection: '3-ply',
    keySpec: `Single wall · ${fluteLabel('3-ply')} · ~${caliper('3-ply')}`,
    moq: MOQ_BOXES,
    moqUnits: FACTS.moqBoxes,
    leadTime: STOCK_AND_CUSTOM,
    sizeRange: 'Custom to your L × W × H',
    printOptions: PLAIN_PRINT,
    useCases: ['Apparel and accessories', 'Books and stationery', 'Light e-commerce parcels', 'Retail cartons'],
    industries: ['e-commerce', 'pharma'],
    quoteProduct: '3-ply',
    image: {
      id: 'products.3-ply',
      src: prod(0),
      alt: 'Stack of plain kraft corrugated boxes, one open to show the board',
      kind: 'illustrative',
    },
    specs: [
      ...boardRows('3-ply', 'Single wall', 3),
      { label: 'Box style', value: 'RSC (regular slotted container); other styles on request' },
      { label: 'Size range', value: 'Custom to your L × W × H' },
      { label: 'Print options', value: PLAIN_PRINT },
    ],
    faq: [
      {
        question: 'When is a 3-ply box enough?',
        answer:
          'For light to medium products that are not stacked high or shipped long distances. If your product is heavy, fragile or will sit in a warehouse stack, a 5-ply is usually the safer choice. Tell us the weight and we will recommend one.',
      },
      {
        question: 'What is the minimum order for 3-ply boxes?',
        answer: `${FACTS.moqBoxes} boxes. Stock sizes are dispatched within ${FACTS.dispatchHours} hours from Ahmedabad; custom sizes usually take 5–7 days.`,
      },
      {
        question: 'Can I get 3-ply boxes in my own size?',
        answer: 'Yes. Send your length, width and height (inside dimensions) and we will quote a custom size.',
      },
    ],
    related: ['5-ply', '7-ply', 'bopp-tape', 'stretch-film'],
  },
  {
    slug: '5-ply',
    name: '5-ply corrugated boxes',
    group: 'box',
    type: 'shipping',
    madeOrSourced: 'sourced',
    short: 'Double wall strength for heavier goods and long stacking times.',
    long: 'Five-ply boxes stack two fluted layers between three liners, which adds stacking and puncture strength over single wall. They are the usual choice for electronics, home appliances and FMCG cartons. Fitted die-cut inserts can be added to stop movement inside the box.',
    plies: [5],
    crossSection: '5-ply',
    keySpec: `Double wall · ${fluteLabel('5-ply')} · ~${caliper('5-ply')}`,
    moq: MOQ_BOXES,
    moqUnits: FACTS.moqBoxes,
    leadTime: STOCK_AND_CUSTOM,
    sizeRange: 'Custom to your L × W × H',
    printOptions: PLAIN_PRINT,
    useCases: ['Electronics and home appliances', 'FMCG outer cartons', 'Pallet stacking', 'Pharma shippers'],
    industries: ['fmcg', 'electronics', 'pharma', 'e-commerce'],
    quoteProduct: '5-ply',
    image: {
      id: 'products.5-ply',
      src: prod(1),
      alt: 'Double-wall corrugated boxes stacked for dispatch',
      kind: 'illustrative',
    },
    specs: [
      ...boardRows('5-ply', 'Double wall', 5),
      { label: 'Box style', value: 'RSC (regular slotted container); other styles on request' },
      { label: 'Size range', value: 'Custom to your L × W × H' },
      { label: 'Print options', value: PLAIN_PRINT },
    ],
    faq: [
      {
        question: 'What is the difference between 3-ply and 5-ply?',
        answer: `A 3-ply box has one fluted layer (single wall, about ${caliper('3-ply')} thick). A 5-ply has two (double wall, about ${caliper('5-ply')} thick, indicative). The extra layer adds stacking strength and puncture resistance.`,
      },
      {
        question: 'Can you add inserts for fragile products?',
        answer: 'Yes. Die-cut inserts hold the product in place, and double-wall board absorbs knocks. See our die-cut boxes or ask for a fitted insert in your quote.',
      },
      {
        question: 'Do you share test values for the board?',
        answer: 'Strength test reports (BCT, ECT, GSM and bursting factor) are available on request. Ask for them in your quote.',
      },
    ],
    related: ['3-ply', '7-ply', 'die-cut', 'stretch-film'],
  },
  {
    slug: '7-ply',
    name: '7-ply heavy-duty corrugated boxes',
    group: 'box',
    type: 'shipping',
    madeOrSourced: 'sourced',
    short: 'Triple wall boxes for industrial loads, sharp parts and export packing.',
    long: 'Seven-ply boxes use three fluted layers between four liners for the highest load capacity in our range. They are used for industrial parts, machinery and export packaging, where a single-wall or double-wall carton would crush or tear.',
    plies: [7],
    crossSection: '7-ply',
    keySpec: `Triple wall · ${fluteLabel('7-ply')} · ~${caliper('7-ply')}`,
    moq: MOQ_BOXES,
    moqUnits: FACTS.moqBoxes,
    leadTime: '5–7 days',
    sizeRange: 'Custom to your L × W × H',
    printOptions: PLAIN_PRINT,
    useCases: ['Industrial parts and machinery', 'Automotive components', 'Export packaging', 'Heavy loads on pallets'],
    industries: ['automotive'],
    quoteProduct: '7-ply',
    image: {
      id: 'products.7-ply',
      src: prod(2),
      alt: 'Heavy-duty triple-wall corrugated box holding an industrial part',
      kind: 'illustrative',
    },
    specs: [
      ...boardRows('7-ply', 'Triple wall', 7),
      { label: 'Box style', value: 'RSC (regular slotted container); other styles on request' },
      { label: 'Size range', value: 'Custom to your L × W × H' },
      { label: 'Print options', value: PLAIN_PRINT },
    ],
    faq: [
      {
        question: 'When do I need a 7-ply box?',
        answer: 'When the load is heavy, has sharp edges, or the box will be stacked or exported. If you are unsure, send the product weight and a photo on WhatsApp and we will suggest the ply.',
      },
      {
        question: 'How long do 7-ply boxes take?',
        answer: '5–7 days for custom sizes. Lead time depends on the size and quantity, and we confirm it with your quote.',
      },
      {
        question: 'Is there a minimum order?',
        answer: `${FACTS.moqBoxes} boxes for plain boxes.`,
      },
    ],
    related: ['5-ply', '3-ply', 'pp-strapping', 'stretch-film'],
  },
  {
    slug: 'die-cut',
    name: 'Die-cut & mailer boxes',
    group: 'box',
    type: 'die-cut',
    madeOrSourced: 'made',
    short: 'Custom-shaped boxes that fit the product, cut waste and look good unboxed.',
    long: 'Die-cut boxes are cut to your own shape: crash-lock bottoms, tuck-in tops, mailers and fitted inserts. A closer fit reduces material waste and keeps the product from moving in transit. Send a sample or the product dimensions and we will prepare the dieline.',
    // VERIFY-LATER[SPEC-04]: plies offered for die-cut taken from the e-commerce (3-ply B-flute mailer) and electronics (5-ply with die-cut inserts) copy in home.ts.
    plies: [3, 5],
    keySpec: 'Crash-lock, tuck-in, mailers',
    moq: MOQ_BOXES,
    moqUnits: FACTS.moqBoxes,
    leadTime: '7–10 days',
    sizeRange: 'Custom shape and size',
    printOptions: 'Plain, or printed on request',
    useCases: ['E-commerce mailers', 'Fitted inserts for electronics', 'Subscription and gift boxes', 'Retail-ready shapes'],
    industries: ['e-commerce', 'electronics'],
    quoteProduct: 'die-cut',
    // VERIFY-LATER[IMG-05]: PROD-4 contains AI-made third-party sample brand text.
    image: {
      id: 'products.die-cut',
      src: prod(3),
      alt: 'Die-cut corrugated mailer boxes in different shapes',
      kind: 'illustrative',
    },
    specs: [
      { label: 'Construction', value: 'Single or double wall, to your design' },
      // VERIFY-LATER[SPEC-04]: ply options for die-cut.
      { label: 'Ply', value: '3 or 5, on request' },
      { label: 'Typical flute', value: `${fluteLabel('3-ply')} for mailers (about ${caliper('3-ply')} board, indicative)` },
      { label: 'Paper GSM / BF', value: TEST_REPORT },
      { label: 'BCT / ECT', value: TEST_REPORT },
      { label: 'Styles', value: 'Crash-lock, tuck-in, mailers' },
      { label: 'Size range', value: 'Custom shape and size' },
      { label: 'Print options', value: 'Plain, or printed on request' },
    ],
    faq: [
      {
        question: 'Do I need to supply a dieline?',
        answer: 'No. Send your product dimensions or a sample and we prepare the dieline for approval before production.',
      },
      {
        question: 'How long do die-cut boxes take?',
        answer: '7–10 days. Lead time depends on the shape and quantity, and we confirm it with your quote.',
      },
      {
        question: 'Can I preview the box before ordering?',
        answer: 'Yes. Use the 3D box designer to set the size and artwork, then send the design with your quote request.',
      },
    ],
    related: ['printed', '3-ply', '5-ply', 'bopp-tape'],
  },
  {
    slug: 'printed',
    name: 'Printed & branded boxes',
    group: 'box',
    type: 'printed',
    madeOrSourced: 'made',
    short: 'Your logo and artwork printed straight onto corrugated board.',
    long: 'Flexo printing puts your logo, product information and brand colours on the box in 1–4 colours, with full-colour options on request. Printed boxes carry your brand through every handover and are made to order from 1,000 boxes.',
    // VERIFY-LATER[SPEC-04]: plies for printed boxes taken from the pharma copy in home.ts (3- or 5-ply with a printed panel).
    plies: [3, 5],
    keySpec: 'Flexo 1–4 colours, full-colour on request',
    moq: '1,000 boxes',
    moqUnits: 1000,
    leadTime: '7–10 days',
    sizeRange: 'Custom to your L × W × H',
    printOptions: 'Flexo 1–4 colours; full-colour on request',
    useCases: ['Brand-led e-commerce shipping', 'Retail and FMCG cartons', 'Batch and handling panels', 'Logo-only one-colour boxes'],
    industries: ['e-commerce', 'fmcg', 'food-beverage', 'pharma'],
    quoteProduct: 'printed',
    // VERIFY-LATER[IMG-05]: PROD-5 contains AI-made third-party sample brand text.
    image: {
      id: 'products.printed',
      src: prod(4),
      alt: 'Corrugated boxes printed with brand graphics',
      kind: 'illustrative',
    },
    specs: [
      { label: 'Board', value: '3-ply or 5-ply, on request' },
      { label: 'Paper GSM / BF', value: TEST_REPORT },
      { label: 'BCT / ECT', value: TEST_REPORT },
      { label: 'Print process', value: 'Flexo, 1–4 colours; full-colour on request' },
      // VERIFY-LATER[SPEC-05]: accepted artwork formats are a sensible default, not owner-confirmed.
      { label: 'Artwork', value: 'Vector logo (PDF or AI) preferred' },
      { label: 'Size range', value: 'Custom to your L × W × H' },
      { label: 'Minimum order', value: '1,000 boxes' },
    ],
    faq: [
      {
        question: 'What is the minimum order for printed boxes?',
        answer: 'Printed orders start at 1,000 boxes. Plain boxes start at 500.',
      },
      {
        question: 'How many colours can you print?',
        answer: 'Flexo printing in 1–4 colours, with full-colour options for branded boxes. Tell us your artwork and we will confirm what suits the board.',
      },
      {
        question: 'What artwork format do you need?',
        answer: 'A vector logo (PDF or AI) works best. If you only have an image, send it anyway and we will advise.',
      },
    ],
    related: ['die-cut', '3-ply', '5-ply', 'bopp-tape'],
  },
  {
    slug: 'food-grade',
    name: 'Food-grade boxes',
    group: 'box',
    type: 'food-grade',
    madeOrSourced: 'sourced',
    short: 'Corrugated boxes with food-safe liners and inks for food and beverage packing.',
    long: 'Food-grade boxes use food-safe liners and water-based inks so print and board are suitable for food contact packaging and cold-chain handling. Tell us the product, how it is wrapped and the storage conditions, and we will recommend the board and coating.',
    // VERIFY-LATER[SPEC-04]: plies for food-grade not stated in existing copy.
    plies: [],
    keySpec: 'Food-safe liners and inks',
    moq: MOQ_BOXES,
    moqUnits: FACTS.moqBoxes,
    leadTime: '5–7 days',
    sizeRange: 'Custom to your L × W × H',
    printOptions: 'Water-based inks; printed or plain',
    useCases: ['Bakery and sweet boxes', 'Food delivery cartons', 'Beverage shippers', 'Cold-chain packing'],
    industries: ['food-beverage'],
    quoteProduct: 'printed',
    // VERIFY-LATER[IMG-05]: PROD-6 (fake "Lic. No" stamp) is not used; a plain box image stands in until a real food-grade photo exists.
    image: {
      id: 'products.food-grade',
      src: prod(0),
      alt: 'Plain corrugated boxes suitable for packed goods',
      kind: 'illustrative',
    },
    specs: [
      { label: 'Liners and inks', value: 'Food-safe liners, water-based inks' },
      // VERIFY-LATER[CERT-01]: the old page said "FSSAI compliant" with no certificate; shown as "on request" until confirmed.
      { label: 'Compliance documents', value: ON_REQUEST },
      { label: 'Moisture resistance', value: 'Food-safe coating; details on request' },
      { label: 'Paper GSM / BF', value: TEST_REPORT },
      { label: 'BCT / ECT', value: TEST_REPORT },
      { label: 'Size range', value: 'Custom to your L × W × H' },
      { label: 'Print options', value: 'Water-based inks; printed or plain' },
    ],
    faq: [
      {
        question: 'Are your food-grade boxes certified?',
        answer: 'Compliance documents are available on request. Ask for them in your quote and tell us the food product so we send the right paperwork.',
      },
      {
        question: 'Can food-grade boxes be printed?',
        answer: 'Yes, with water-based inks. Printed orders start at 1,000 boxes.',
      },
      {
        question: 'Do you supply boxes for cold-chain use?',
        answer: 'Tell us the storage conditions and we will recommend a board and coating. Moisture-resistant options are available.',
      },
    ],
    related: ['printed', '3-ply', '5-ply', 'bopp-tape'],
  },
  {
    slug: 'bopp-tape',
    name: 'BOPP packaging tape',
    group: 'supply',
    type: 'supplies',
    madeOrSourced: 'sourced',
    short: 'Adhesive tape for sealing corrugated boxes, in brown and transparent.',
    long: 'BOPP (biaxially oriented polypropylene) tape seals corrugated boxes quickly and holds under normal handling. Available in brown and transparent, supplied by the roll or carton alongside your box order.',
    plies: [],
    keySpec: 'Brown or transparent · by the roll or carton',
    moq: 'Per roll / carton',
    leadTime: `${FACTS.dispatchHours} hrs from stock`,
    sizeRange: 'Widths and lengths on request',
    printOptions: 'On request',
    useCases: ['Sealing shipping cartons', 'Warehouse and dispatch lines', 'E-commerce packing benches'],
    industries: ['e-commerce', 'fmcg', 'electronics', 'food-beverage', 'pharma', 'automotive'],
    quoteProduct: 'supplies',
    // VERIFY-LATER[IMG-04]: no supplies photo exists; reusing PROD-1 with a crop.
    image: {
      id: 'products.bopp-tape',
      src: prod(0),
      alt: 'Corrugated boxes ready for taping',
      kind: 'illustrative',
      focal: { x: 0.2, y: 0.8 },
    },
    specs: [
      // VERIFY-LATER[SPEC-02]: width, micron, length and core are not supplied; shown as on request.
      { label: 'Width', value: ON_REQUEST },
      { label: 'Thickness (micron)', value: ON_REQUEST },
      { label: 'Length per roll', value: ON_REQUEST },
      { label: 'Core', value: ON_REQUEST },
      { label: 'Colours', value: 'Brown, transparent' },
      { label: 'Supplied as', value: 'Per roll / carton' },
    ],
    faq: [
      {
        question: 'Which tape sizes do you stock?',
        answer: 'Tell us your box size and sealing method (manual or machine) and we will confirm the width, thickness and roll length with your quote.',
      },
      {
        question: 'Can I order tape with my boxes?',
        answer: 'Yes. Add supplies when you request a quote and we dispatch them together.',
      },
    ],
    related: ['stretch-film', '3-ply', '5-ply', 'pp-strapping'],
  },
  {
    slug: 'stretch-film',
    name: 'Stretch film',
    group: 'supply',
    type: 'supplies',
    madeOrSourced: 'sourced',
    short: 'Pallet wrap and bundling film in manual and machine grades.',
    long: 'Stretch film holds pallet loads together and bundles loose cartons. Manual and machine grades are available, with the cling needed to keep a load tight during transport.',
    plies: [],
    keySpec: 'Manual and machine grades',
    moq: 'Per roll / carton',
    leadTime: `${FACTS.dispatchHours} hrs from stock`,
    sizeRange: 'Widths and lengths on request',
    printOptions: 'Not applicable',
    useCases: ['Pallet wrapping', 'Bundling cartons', 'Dispatch and export loads'],
    industries: ['fmcg', 'automotive', 'e-commerce', 'pharma', 'food-beverage', 'electronics'],
    quoteProduct: 'supplies',
    // VERIFY-LATER[IMG-04]: no supplies photo exists; reusing PROD-1 with a crop.
    image: {
      id: 'products.stretch-film',
      src: prod(0),
      alt: 'Stacked corrugated boxes ready to be pallet wrapped',
      kind: 'illustrative',
      focal: { x: 0.5, y: 0.35 },
    },
    specs: [
      // VERIFY-LATER[SPEC-02]: width, micron, length and core are not supplied; shown as on request.
      { label: 'Width', value: ON_REQUEST },
      { label: 'Thickness (micron)', value: ON_REQUEST },
      { label: 'Length per roll', value: ON_REQUEST },
      { label: 'Core', value: ON_REQUEST },
      { label: 'Grades', value: 'Manual, machine' },
      { label: 'Supplied as', value: 'Per roll / carton' },
    ],
    faq: [
      {
        question: 'What is the difference between manual and machine grade?',
        answer: 'Manual film is wound for hand wrapping; machine grade runs on a pallet wrapper. Tell us how you wrap and we will confirm the right grade.',
      },
      {
        question: 'How do I order stretch film?',
        answer: 'Request a quote and select Supplies. We confirm width, thickness and roll length with you.',
      },
    ],
    related: ['bopp-tape', 'pp-strapping', '5-ply', '7-ply'],
  },
  {
    slug: 'bubble-wrap',
    name: 'Bubble wrap',
    group: 'supply',
    type: 'supplies',
    madeOrSourced: 'sourced',
    short: 'Protective wrap in rolls or sheets, with anti-static variants for electronics.',
    long: 'Bubble wrap cushions fragile goods inside the box. Small and large bubble options are available in roll or sheet form, plus anti-static variants for electronics.',
    plies: [],
    keySpec: 'Roll or sheet · small and large bubble',
    moq: 'Per roll / carton',
    leadTime: `${FACTS.dispatchHours} hrs from stock`,
    sizeRange: 'Widths and lengths on request',
    printOptions: 'Not applicable',
    useCases: ['Fragile and glass items', 'Electronics (anti-static)', 'Void fill inside cartons'],
    industries: ['e-commerce', 'electronics'],
    quoteProduct: 'supplies',
    // VERIFY-LATER[IMG-04]: no supplies photo exists; reusing PROD-1 with a crop.
    image: {
      id: 'products.bubble-wrap',
      src: prod(0),
      alt: 'Corrugated boxes used with protective packing',
      kind: 'illustrative',
      focal: { x: 0.8, y: 0.7 },
    },
    specs: [
      // VERIFY-LATER[SPEC-02]: width, micron, length and core are not supplied; shown as on request.
      { label: 'Width', value: ON_REQUEST },
      { label: 'Thickness (micron)', value: ON_REQUEST },
      { label: 'Length per roll', value: ON_REQUEST },
      { label: 'Core', value: ON_REQUEST },
      { label: 'Bubble size', value: 'Small, large' },
      { label: 'Form', value: 'Roll, sheet' },
      { label: 'Anti-static', value: 'Variants available' },
    ],
    faq: [
      {
        question: 'Do you have anti-static bubble wrap?',
        answer: 'Yes, anti-static variants are available for electronics. Mention it in your quote request.',
      },
      {
        question: 'Can I order bubble wrap cut to size?',
        answer: 'Tell us the sheet or roll size you need in your quote request and we will confirm what we can supply.',
      },
    ],
    related: ['bopp-tape', '5-ply', 'die-cut', 'stretch-film'],
  },
  {
    slug: 'pp-strapping',
    name: 'PP strapping bands',
    group: 'supply',
    type: 'supplies',
    madeOrSourced: 'sourced',
    short: 'Polypropylene strapping for securing heavy cartons and pallets.',
    long: 'Polypropylene strapping bands secure large shipments, heavy cartons and pallets. Pair with 7-ply boxes and stretch film for export and industrial loads.',
    plies: [],
    keySpec: 'Polypropylene bands for heavy cartons and pallets',
    moq: 'Per roll / carton',
    leadTime: `${FACTS.dispatchHours} hrs from stock`,
    sizeRange: 'Widths and lengths on request',
    printOptions: 'Not applicable',
    useCases: ['Securing pallets', 'Heavy and export cartons', 'Bundling long items'],
    industries: ['automotive', 'fmcg', 'e-commerce', 'electronics', 'food-beverage', 'pharma'],
    quoteProduct: 'supplies',
    // VERIFY-LATER[IMG-04]: no supplies photo exists; reusing PROD-1 with a crop.
    image: {
      id: 'products.pp-strapping',
      src: prod(0),
      alt: 'Corrugated boxes stacked for strapping',
      kind: 'illustrative',
      focal: { x: 0.5, y: 0.95 },
    },
    specs: [
      // VERIFY-LATER[SPEC-02]: width, micron, length and core are not supplied; shown as on request.
      { label: 'Width', value: ON_REQUEST },
      { label: 'Thickness (micron)', value: ON_REQUEST },
      { label: 'Length per roll', value: ON_REQUEST },
      { label: 'Core', value: ON_REQUEST },
      { label: 'Material', value: 'Polypropylene (PP)' },
      { label: 'Supplied as', value: 'Per roll / carton' },
    ],
    faq: [
      {
        question: 'Which strapping size should I pick?',
        answer: 'It depends on the load and whether you strap by hand or machine. Send the load weight and we will confirm width, thickness and length with your quote.',
      },
      {
        question: 'Can I order strapping with boxes and film?',
        answer: 'Yes. Add supplies to your quote and we dispatch them together.',
      },
    ],
    related: ['stretch-film', '7-ply', 'bopp-tape', '5-ply'],
  },
];

const BY_SLUG = new Map<string, Product>(PRODUCTS.map((p) => [p.slug, p]));

/** Unknown or malformed slugs return undefined (callers redirect to /products) */
export const getProduct = (slug: string | undefined): Product | undefined => (slug ? BY_SLUG.get(slug) : undefined);

export const getRelatedProducts = (product: Product): Product[] =>
  product.related.map((s) => BY_SLUG.get(s)).filter((p): p is Product => !!p);

export const INDUSTRY_NAMES: Record<IndustrySlug, string> = Object.fromEntries(
  INDUSTRY_PANELS.map((i) => [i.slug, i.name])
) as Record<IndustrySlug, string>;

export const industryName = (slug: IndustrySlug): string => INDUSTRY_NAMES[slug] ?? slug;

export const productPath = (slug: ProductSlug) => `/products/${slug}`;

/** "MOQ 500 boxes" for boxes; supplies are sold per roll / carton so they have no MOQ prefix */
export const moqLabel = (product: Product): string => (product.group === 'box' ? `MOQ ${product.moq}` : product.moq);
