/**
 * Copy and data for the 3D Box Designer pages: /3d-box-designer (how it works) and /3d-box-designer/experience (the film).
 * Plans: docs/3D-Model-page/BOX_DESIGNER_SHOWCASE_PAGE_PLAN.md and BOX_DESIGNER_EXPERIENCE_PAGE_PLAN.md
 *
 * Rules: a few words per idea (the visuals explain), no invented numbers or logos, plain trade language, anything
 * uncertain carries VERIFY-LATER[SHW-NN]. The how-it-works page has a `buyer` and a `maker` variant of its copy.
 * Pure data (no React) so the SEO prerender can read it too.
 */

import type { BoxTemplate } from '@/types/boxDesigner';
import { FACTS } from '@/content/facts';

export const SHOWCASE_PATH = '/3d-box-designer';
export const EXPERIENCE_PATH = `${SHOWCASE_PATH}/experience`;

export const EXPERIENCE_META = {
  title: 'See the 3D Box Designer in Action | Vayu Packaging',
  description: 'A one-minute scroll film: design a box in 3D, watch it fold flat into a dieline, and download the print-ready PDF. Free, no sign-up.',
  keywords: ['3d box designer demo', 'box dieline animation', 'custom box design online', 'packaging dieline pdf', 'fold a box in 3d'],
  ogImage: '/og-box-designer.jpg',
} as const;

export type Audience = 'buyer' | 'maker';
export type Variants<T> = Record<Audience, T>;

export const AUDIENCES: { id: Audience; label: string; short: string }[] = [
  { id: 'buyer', label: 'I buy boxes', short: 'Buy' },
  { id: 'maker', label: 'I make boxes', short: 'Make' },
];

export const SHOWCASE_META = {
  title: 'Free 3D Box Designer with Die-Cut PDF',
  description:
    'Design your box in 3D, see where it folds, download a 1:1 die-cut dieline PDF and share it for approval. Free, no sign-up. For brands and box manufacturers.',
  keywords: [
    '3d box designer',
    'box design software free',
    'dieline pdf download',
    'box dieline generator',
    'custom box design online',
    'packaging design tool for manufacturers',
    'box configurator for website',
    'corrugated box dieline',
  ],
  ogImage: '/og-box-designer.jpg',
} as const;

/** Styles offered in the hero chips: one per family so the dieline changes shape visibly */
export const HERO_STYLES: { id: BoxTemplate; label: string }[] = [
  { id: 'mailer', label: 'Mailer' },
  { id: 'rsc', label: 'Shipping' },
  { id: 'telescope', label: 'Gift' },
  { id: 'pizza', label: 'Pizza' },
];

export const HERO_COPY: Variants<{ eyebrow: string; headline: string; sub: string; primary: string; secondary: string }> = {
  buyer: {
    eyebrow: '01 — Design',
    headline: 'Design your box. See it fold in 3D. Download the dieline.',
    sub: 'Type a size. Free, no sign-up.',
    primary: 'Design your box, free',
    secondary: 'I make boxes',
  },
  maker: {
    eyebrow: '01 — Design',
    headline: 'Show customers their box before you cut a sample.',
    sub: 'Change the size live. Send one link.',
    primary: 'Try the designer, free',
    secondary: 'I buy boxes',
  },
};

export const HERO_FACTS = ['No sign-up', '1:1 mm PDF', 'Works on phone'] as const;

/** Six captions for the unfold (02.1 .. 02.6); the stage runs the matching animation */
export const UNFOLD_BEATS: Variants<{ title: string; text: string }[]> = {
  buyer: [
    { title: 'Your box, sealed', text: 'Exactly as it will arrive.' },
    { title: 'Open every flap', text: 'Nothing is hidden.' },
    { title: 'Flat: the blank', text: 'One sheet of board. The factory cuts this.' },
    { title: 'Solid cuts, dashes fold', text: 'Black is cut. Red dashes are creases.' },
    { title: 'Every panel, in mm', text: 'Panels, flaps, glue tab and the whole sheet.' },
    { title: 'Your 1:1 PDF', text: 'Real size, with a 100 mm bar to check your print.' },
  ],
  maker: [
    { title: 'Their box, sealed', text: 'Start the meeting with it on screen.' },
    { title: 'Open every flap', text: 'Show how it is built.' },
    { title: 'Flat: the blank', text: 'The sheet you cut from.' },
    { title: 'Cut and crease', text: 'The convention your die maker reads.' },
    { title: 'Every panel, in mm', text: 'Allowances are indicative; your plant sets the final ones.' },
    { title: 'A 1:1 PDF', text: 'Real size, not a screenshot.' },
  ],
};

/** Dieline features a visitor can inspect (anatomy). `needs` hides a hotspot when this style has no such feature */
export interface Hotspot {
  id: 'cut' | 'fold' | 'panel' | 'glue' | 'flap' | 'blank' | 'legend';
  title: string;
  text: string;
  needs?: 'glue' | 'depth';
}

export const HOTSPOTS: Variants<Hotspot[]> = {
  buyer: [
    { id: 'cut', title: 'Cut', text: 'Solid black. The die cuts through here.' },
    { id: 'fold', title: 'Fold', text: 'Dashed red. Creased, not cut.' },
    { id: 'panel', title: 'Panels', text: 'Each side, with its size. Point at one to find it on the box.' },
    { id: 'glue', title: 'Glue flap', text: 'Joins the last wall to the first. Hidden inside.', needs: 'glue' },
    { id: 'flap', title: 'Flaps', text: 'Why the sheet is taller than the box.', needs: 'depth' },
    { id: 'blank', title: 'Sheet', text: 'The size of the board the factory cuts from.' },
    { id: 'legend', title: '100 mm bar', text: 'Print at 100% (Actual size). The bar should measure 100 mm.' },
  ],
  maker: [
    { id: 'cut', title: 'Cut', text: 'Through-cut for the die.' },
    { id: 'fold', title: 'Score', text: 'Crease, not cut. Your plant confirms the allowances.' },
    { id: 'panel', title: 'Panels', text: 'Every panel sized. Point at one to show where it lands.' },
    { id: 'glue', title: 'Glue flap', text: 'The manufacturer’s joint, with its width.', needs: 'glue' },
    { id: 'flap', title: 'Flaps', text: 'Top and bottom depths, so the blank height is explained.', needs: 'depth' },
    { id: 'blank', title: 'Blank size', text: 'The number you price the board from.' },
    { id: 'legend', title: '100 mm bar', text: 'Check it with a ruler before you rely on the file.' },
  ],
};

export interface FaqItem {
  question: string;
  answer: string;
}

export const SHOWCASE_FAQS: FaqItem[] = [
  { question: 'Is the 3D Box Designer free?', answer: 'Yes. You can design, preview, download the dieline and the spec sheet and share a link without paying and without signing up.' },
  { question: 'Do I need to sign up?', answer: 'No. Your design is saved in your own browser. You only give your details if you choose to send a design to Vayu for a quote.' },
  {
    question: 'Is the dieline production-ready?',
    answer:
      'It is a 1:1 millimetre file with cut and fold lines, panel sizes, the glue flap and the blank size, and a 100 mm bar to check print scale. Score and flap allowances are indicative: the box plant confirms the final allowances for its board, flute and machine.',
  },
  { question: 'Which software opens the files?', answer: 'The dieline PDF opens in any PDF viewer. The SVG opens in Illustrator, Inkscape, CorelDRAW and most vector tools.' },
  {
    // VERIFY-LATER[SHW-01]: free embed with Vayu credit; white-label offer is an owner decision
    question: 'Can I put the designer on my own website?',
    answer: 'Yes. There is an embed snippet you paste into your site, and you can preset the style and size. It carries a Vayu credit. Ask us if you need a white-label version.',
  },
  { question: 'Is my design private?', answer: 'Share links carry only the box spec (style, size, board, colours), never your images or personal data. Your uploaded logo stays in your browser unless you send the design to us.' },
  { question: 'Do the prices include GST and delivery?', answer: 'The ₹ figures are indicative estimates by quantity. They are not a quotation, and GST and delivery are confirmed in the exact quote.' },
  { question: 'Can Vayu make the box I design?', answer: `Yes. Send the design from the designer and we reply with an exact quote. The minimum order is ${FACTS.moqBoxes} boxes.` },
];

/** What the designer already does, for the schema description and the prerendered page */
export const SHOWCASE_FEATURE_LIST = [
  'Live 3D preview that folds and unfolds',
  'Dieline PDF and SVG at 1:1 millimetres with cut, fold, glue flap and panel sizes',
  'Spec sheet / proof PDF with a customer approval block',
  'Share link, presentation mode and an embeddable widget',
  'Templates, logo and colour, windows, handles and vents',
  'Fit checker, strength guidance and an indicative ₹ estimate',
] as const;
