/**
 * Words for the home "story" section ("One box, one journey", docs/Design-Improvement/STORY_HERO_PLAN.md).
 * Everything a visitor can read in the section lives here, so the copy is edited in one place.
 * Hard rule from the plan: at most one short phrase per scene, no paragraphs.
 */

import { FACTS } from './facts';

export type SceneId = 'product' | 'fit' | 'reveal' | 'design' | 'order' | 'make' | 'ship' | 'door' | 'open';
export type ChapterId = 'product' | 'design' | 'order' | 'make' | 'ship' | 'open';

/** The phrase shown for each scene (the reveal is deliberately wordless) */
export const SCENE_WORDS: Record<SceneId, string> = {
  product: 'Your product.',
  fit: 'Sized to fit.',
  reveal: '',
  design: 'Your design.',
  order: 'Ordered.',
  make: 'Made for you.',
  ship: 'On its way.',
  door: 'At your door.',
  open: 'Your turn.',
};

export const CHAPTER_LABELS: Record<ChapterId, string> = {
  product: 'Product',
  design: 'Design',
  order: 'Order',
  make: 'Make',
  ship: 'Ship',
  open: 'Open',
};

export const STORY_HEADING = 'From your product to your doorstep';

/** One line per step for screen readers and crawlers; the visual story is aria-hidden */
export const SR_STEPS: readonly string[] = [
  'Start with your product.',
  'We size the box to fit it.',
  'You design the box in our free 3D designer.',
  'You send the design for a quote with one click.',
  `We make it in ${FACTS.city}, from ${FACTS.moqBoxes} boxes.`,
  'It ships to you.',
  'It arrives at your door.',
  'You open it. Your turn to design a box.',
];

export const STORY_CTA = { design: 'Design your box', quote: 'Get a quote' } as const;

/** Small line under "Made for you." */
export const MAKE_LINE = `${FACTS.city} · ${FACTS.dispatchHours} hrs from stock*`;
export const MAKE_FOOTNOTE = FACTS.dispatchFootnote;

/**
 * The sticky note on the desk names the order the designer is working on, and follows the season.
 * VERIFY-LATER[STORY-03]: occasions are matched to the calendar month only (festival dates move each year);
 * the owner may prefer a fixed note or a different list.
 */
const OCCASIONS = [
  'Uttarayan order',
  'Wedding season',
  'Holi order',
  'Summer launch',
  'Mango season',
  'Monsoon stock',
  'Monsoon stock',
  'Rakhi order',
  'Navratri order',
  'Diwali order',
  'Wedding season',
  'New Year order',
] as const;

export function deskNote(date: Date = new Date()): [string, string] {
  return [OCCASIONS[date.getMonth()], `${FACTS.moqBoxes} pcs!`];
}
