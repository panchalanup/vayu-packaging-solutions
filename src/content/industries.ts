/**
 * Industry page content (/industries/:slug) and the Services hub cards.
 * Problem / spec / why / image are reused from INDUSTRY_PANELS (home.ts) so Home and these pages never disagree.
 * SECURITY: static content only. The :slug from the URL is matched against this list and never rendered raw.
 */

import { INDUSTRY_PANELS, type IndustryItem } from './home';
import { FACTS } from './facts';

/** Product detail slugs owned by src/content/products.ts (created separately). Unknown ones link to /products. */
export const LINKABLE_PRODUCT_SLUGS = ['3-ply', '5-ply', '7-ply', 'die-cut', 'printed', 'food-grade'] as const;
export type LinkableProductSlug = (typeof LINKABLE_PRODUCT_SLUGS)[number];

export interface IndustrySpec {
  slug: LinkableProductSlug;
  name: string;
  /** Why this spec for this industry, one sentence */
  note: string;
}

export interface IndustryFaq {
  question: string;
  answer: string;
}

export interface Industry extends IndustryItem {
  /** Hero lead under the H1 */
  intro: string;
  specs: IndustrySpec[];
  faqs: IndustryFaq[];
  /** Short phrase for meta description */
  metaFocus: string;
}

const SPEC_NAME: Record<LinkableProductSlug, string> = {
  '3-ply': '3-ply corrugated boxes',
  '5-ply': '5-ply corrugated boxes',
  '7-ply': '7-ply heavy-duty boxes',
  'die-cut': 'Die-cut & mailer boxes',
  printed: 'Printed & branded boxes',
  'food-grade': 'Food-grade boxes',
};

const spec = (slug: LinkableProductSlug, note: string): IndustrySpec => ({ slug, name: SPEC_NAME[slug], note });

// VERIFY-LATER[FAQ-01]: all industry FAQ answers below are drafted from the shared fact set (facts.ts) and general
// corrugated knowledge. The owner should confirm each one, especially anything about print, food contact and batch panels.
const EXTRA: Record<IndustryItem['slug'], Omit<Industry, keyof IndustryItem>> = {
  'e-commerce': {
    intro: 'Courier networks drop, stack and squeeze parcels. The box has to survive that, and still look like your brand when it arrives.',
    metaFocus: 'mailer boxes and RSC cartons for online sellers',
    specs: [
      spec('3-ply', 'Light, crush-resistant B-flute for most parcels up to a few kilos.'),
      spec('die-cut', 'Crash-lock and tuck-in mailers that pack fast and need no tape on the inside.'),
      spec('printed', 'One-colour flexo print puts your logo on every parcel at a low extra cost.'),
    ],
    faqs: [
      {
        question: 'Which box is best for courier shipments?',
        answer: 'Most parcels ship well in a 3-ply B-flute RSC or mailer. For heavier or fragile items we step up to 5-ply. Tell us the product weight and we will recommend one.',
      },
      {
        question: 'What is the minimum order for e-commerce boxes?',
        answer: `${FACTS.moqBoxes} boxes for plain boxes and 1,000 for printed boxes. Stock sizes dispatch in about ${FACTS.dispatchHours} hours from Ahmedabad.`,
      },
      {
        question: 'Can I get my logo on the box?',
        answer: 'Yes. Flexo printing in 1–4 colours is available, with full-colour options on request. Send your artwork with the quote request.',
      },
    ],
  },
  fmcg: {
    intro: 'Outer cartons sit under a tall stack for weeks. Stacking strength, not just drop protection, decides whether they hold.',
    metaFocus: 'double-wall outer cartons for stacked FMCG goods',
    specs: [
      spec('5-ply', 'B+C double wall adds stacking strength for long warehouse dwell times.'),
      spec('3-ply', 'A lighter option for products with low stacking loads and fast turnover.'),
      spec('printed', 'Print product codes and handling marks directly on the carton.'),
    ],
    faqs: [
      {
        question: 'How do I choose between 3-ply and 5-ply cartons?',
        answer: 'It depends on carton weight, stack height and how long stock sits. If cartons are stacked high or stored for weeks, 5-ply is the safer choice. We can size it from your pallet pattern.',
      },
      {
        question: 'Can you supply the same box every month?',
        answer: 'Yes. Scheduled replenishment is available so spec and size stay consistent between batches. Tell us your monthly volume when you request a quote.',
      },
      {
        question: 'Do you supply tape and stretch film with the cartons?',
        answer: 'Yes. We also supply BOPP tape, stretch film and PP strap, so cartons and pallet wrap can come from one vendor.',
      },
    ],
  },
  electronics: {
    intro: 'Drops and vibration do the damage. A box that fits the product, with the right insert, matters more than extra board.',
    metaFocus: 'double-wall boxes and die-cut inserts for fragile devices',
    specs: [
      spec('5-ply', 'Double wall absorbs knocks and keeps the box square under load.'),
      spec('die-cut', 'Fitted die-cut inserts stop the product moving inside the box.'),
      spec('printed', 'Print handling icons and model details on the outer box.'),
    ],
    faqs: [
      {
        question: 'Do you make inserts that fit my product?',
        answer: 'Yes. Die-cut inserts are made to your product dimensions. A sample or a drawing helps us get the fit right.',
      },
      {
        question: 'Can I check the fit before ordering in bulk?',
        answer: `${FACTS.samplePolicy}. Choose "Sample" in the quote form or message us on WhatsApp.`,
      },
      {
        question: 'How do I size a box for a fragile device?',
        answer: 'Give us the product length, width and height and the weight. You can also try the free 3D box designer and send the design with your quote request.',
      },
    ],
  },
  'food-beverage': {
    intro: 'Food packaging has to handle moisture and cold chains, and the print must stay clean and safe where it touches or sits near food.',
    metaFocus: 'food-grade corrugated boxes with safe liners and inks',
    specs: [
      spec('food-grade', 'Food-safe liners and water-based inks for contact-sensitive packs.'),
      spec('printed', 'Print that holds up in cold and damp conditions.'),
      spec('3-ply', 'A plain, light carton for outer and secondary packing.'),
    ],
    faqs: [
      {
        // VERIFY-LATER[FOOD-01]: do not claim FSSAI or other approvals until the owner supplies certificates
        question: 'Are your food boxes safe for direct food contact?',
        answer: 'Food-grade boxes use food-safe liners and water-based inks. Direct-contact needs differ by product, so tell us what you pack and we will confirm the right spec and any documents available.',
      },
      {
        question: 'Will the boxes cope with cold storage?',
        answer: 'Corrugated board can lose strength in damp, cold conditions. Tell us the storage temperature and duration and we will suggest a spec, such as extra ply or a moisture-resistant liner.',
      },
      {
        question: 'What is the minimum order?',
        answer: `${FACTS.moqBoxes} boxes for plain boxes and 1,000 for printed boxes.`,
      },
    ],
  },
  pharma: {
    intro: 'Pharma cartons need consistent dimensions, clean panels for labels and codes, and the same quality in every batch.',
    metaFocus: 'consistent RSC cartons with clean label and batch panels',
    specs: [
      spec('3-ply', 'Consistent dimensions for light-to-medium cartons.'),
      spec('5-ply', 'Double wall for heavier cartons and long-distance dispatch.'),
      spec('printed', 'A clean printed panel for batch labels and codes.'),
    ],
    faqs: [
      {
        question: 'Can the box carry batch numbers or labels?',
        answer: 'Yes. We can leave a clean panel for labels, or print a batch panel in the layout you give us.',
      },
      {
        question: 'How do you keep quality consistent between batches?',
        answer: 'We check size, print and strength on every batch before dispatch and match each batch to the approved sample.',
      },
      {
        // VERIFY-LATER[PHARMA-01]: no pharma certification claimed; owner to confirm any GMP / audit documents held
        question: 'Do you supply quality documents?',
        answer: 'Ask us what you need for your own audits. We will tell you which documents are available for your order.',
      },
    ],
  },
  automotive: {
    intro: 'Heavy, sharp-edged parts tear through ordinary boxes. Triple wall and the right size carry the load without crushing.',
    metaFocus: 'triple-wall 7-ply boxes for heavy auto parts',
    specs: [
      spec('7-ply', 'Triple wall C+B+C carries heavy loads and resists puncture.'),
      spec('5-ply', 'Double wall for mid-weight parts and component kits.'),
      spec('die-cut', 'Die-cut dividers and pads keep parts from rubbing and shifting.'),
    ],
    faqs: [
      {
        question: 'How heavy a part can a 7-ply box carry?',
        answer: 'It depends on box size and board grade. Share the part weight and dimensions and we will recommend the right spec instead of guessing from a single number.',
      },
      {
        question: 'Can you make dividers for small parts?',
        answer: 'Yes. Die-cut dividers and pads are made to suit your parts and box size.',
      },
      {
        question: 'Do you offer scheduled supply for plants?',
        answer: 'Yes. Scheduled replenishment can be planned around your production calendar. Tell us your monthly volume with the quote request.',
      },
    ],
  },
};

export const INDUSTRY_PAGES: Industry[] = INDUSTRY_PANELS.map((item) => ({ ...item, ...EXTRA[item.slug] }));

export const findIndustry = (slug: string | undefined): Industry | undefined =>
  INDUSTRY_PAGES.find((industry) => industry.slug === slug);

/** Product detail URL for a linkable slug */
export const productHref = (slug: LinkableProductSlug): string => `/products/${slug}`;
