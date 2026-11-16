/**
 * The Tools menu: one source for the desktop panel and the mobile accordion.
 * Two tiers in one flat panel (categories on the left, the active category's items on the right) rather than a
 * dropdown inside a dropdown: nested hover flyouts close under the pointer and need a precise path to reach.
 * Pure data (no React) so it can be tested.
 */

import { EXPERIENCE_PATH, SHOWCASE_PATH } from '@/content/designerShowcase';
import { TOOLS_INDEX_PATH, TOOL_PAGES } from '@/content/toolPages';

export type ToolsCategoryId = 'designer' | 'calculators' | 'finder';

export interface ToolsMenuItem {
  label: string;
  /** Short label for tight spaces (the mobile grid) */
  short?: string;
  hint: string;
  path: string;
  /** Visually emphasised (the main thing to do in this category) */
  primary?: boolean;
}

export interface ToolsCategory {
  id: ToolsCategoryId;
  label: string;
  blurb: string;
  items: ToolsMenuItem[];
}

const SHORT_NAMES: Record<string, string> = {
  'volumetric-weight-calculator': 'Volumetric weight',
  'cbm-calculator': 'CBM and containers',
  'box-size-calculator': 'Box size',
  'box-strength-calculator': 'Box strength',
  'box-weight-calculator': 'Box weight and paper cost',
  'packaging-cost-calculator': 'Packaging cost',
};

export const TOOLS_CATEGORIES: ToolsCategory[] = [
  {
    id: 'designer',
    label: '3D Box Designer',
    blurb: 'Design, fold and download your box. Free.',
    items: [
      { label: 'Open the designer', hint: 'Design from scratch', path: '/box-designer', primary: true },
      { label: 'See it in action', hint: 'A one-minute scroll film', path: EXPERIENCE_PATH },
      { label: 'How it works', hint: '3D box to dieline PDF', path: SHOWCASE_PATH },
      { label: 'Find my box', hint: 'Product in, style and size out', path: '/box-designer?wizard=1' },
    ],
  },
  {
    id: 'calculators',
    label: 'Free calculators',
    blurb: 'Weight, CBM, size, strength and cost.',
    items: [
      ...TOOL_PAGES.map((t) => ({ label: t.name, short: SHORT_NAMES[t.slug], hint: t.summary, path: t.path })),
      { label: 'All calculators', hint: 'See the full list', path: TOOLS_INDEX_PATH, primary: true },
    ],
  },
  {
    id: 'finder',
    label: 'Packaging Finder',
    blurb: 'Tell us what you ship, get the right box spec.',
    items: [{ label: 'Packaging Finder', hint: 'Answer a few questions, get a spec', path: '/compare-quote', primary: true }],
  },
];

/** True when the current route belongs to the Tools menu (keeps the "Tools" link underlined on those pages) */
export function isToolsPath(pathname: string): boolean {
  if (pathname.startsWith('/tools') || pathname.startsWith('/box-designer') || pathname.startsWith(SHOWCASE_PATH)) return true;
  return pathname === '/compare-quote';
}
