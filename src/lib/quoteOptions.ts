/**
 * Quote form option lists and labels: plain constants with no dependencies.
 * Split out of quoteSchema.ts so pages that only need the lists (quote links, product data, industry filters) do not
 * pull the zod validation library into the first-load bundle. quoteSchema.ts re-exports everything here.
 * Keep this file free of "@/" imports so the serverless bundler (api/quote.ts) can resolve it.
 */

export const INTENTS = ['quote', 'sample', 'callback'] as const;
export const PRODUCTS = ['3-ply', '5-ply', '7-ply', 'die-cut', 'printed', 'supplies', 'not-sure'] as const;
export const QTY_BANDS = ['500-1k', '1k-5k', '5k-25k', '25k+', 'recurring'] as const;
export const PRINTING = ['none', '1-2', 'full'] as const;
export const NEED_BY = ['this-week', '2-4-weeks', 'exploring'] as const;
export const INDUSTRY_SLUGS = ['e-commerce', 'fmcg', 'electronics', 'food-beverage', 'pharma', 'automotive'] as const;

export const LABELS = {
  intent: { quote: 'Quote', sample: 'Sample', callback: 'Call back' },
  product: {
    '3-ply': '3-ply',
    '5-ply': '5-ply',
    '7-ply': '7-ply',
    'die-cut': 'Die-cut',
    printed: 'Printed',
    supplies: 'Supplies',
    'not-sure': 'Not sure',
  },
  qty: { '500-1k': '500–1k', '1k-5k': '1–5k', '5k-25k': '5–25k', '25k+': '25k+', recurring: 'Recurring monthly' },
  printing: { none: 'None', '1-2': '1–2 colours', full: 'Full colour' },
  needBy: { 'this-week': 'This week', '2-4-weeks': '2–4 weeks', exploring: 'Just exploring' },
} as const;

// Indian mobile: optional +91 / 0 prefix, then 10 digits starting 6-9
export const PHONE_RE = /^(?:\+?91|0)?[6-9]\d{9}$/;

export const MIN_FILL_MS = 3000;
