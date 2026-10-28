/**
 * Quote form schema, shared by the browser form and the server function (api/quote.ts).
 * Keep this file free of "@/" imports so the serverless bundler can resolve it.
 */

import { z } from 'zod';

import { INTENTS, PRODUCTS, QTY_BANDS, PRINTING, NEED_BY, INDUSTRY_SLUGS, LABELS, PHONE_RE, MIN_FILL_MS } from './quoteOptions';

// Re-exported so existing imports from './quoteSchema' keep working; the plain lists live in ./quoteOptions
export { INTENTS, PRODUCTS, QTY_BANDS, PRINTING, NEED_BY, INDUSTRY_SLUGS, LABELS, PHONE_RE, MIN_FILL_MS };

const optionalDim = z
  .union([z.literal(''), z.coerce.number().int().min(10, 'Min 10 mm').max(5000, 'Max 5000 mm')])
  .optional();

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(''));

const GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export const stepWhatSchema = z.object({
  intent: z.enum(INTENTS),
  product: z.enum(PRODUCTS, { errorMap: () => ({ message: 'Pick a product' }) }),
  qty: z.enum(QTY_BANDS, { errorMap: () => ({ message: 'Pick a quantity' }) }),
  l: optionalDim,
  w: optionalDim,
  h: optionalDim,
  printing: z.enum(PRINTING).optional(),
});

export const stepWhereSchema = z.object({
  city: optionalText(80),
  needBy: z.enum(NEED_BY).optional(),
  notes: optionalText(600),
});

export const stepYouSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(80),
  company: optionalText(120),
  phone: z
    .string()
    .transform((v) => v.replace(/[\s\-()]/g, ''))
    .refine((v) => PHONE_RE.test(v), 'Enter a valid 10-digit mobile number'),
  whatsapp: z.boolean(),
  email: z.string().trim().email('Enter a valid email').max(120).optional().or(z.literal('')),
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => v === '' || GSTIN_RE.test(v), 'Enter a valid 15-character GSTIN')
    .optional(),
});

export const quoteSchema = stepWhatSchema.merge(stepWhereSchema).merge(stepYouSchema).extend({
  industry: z.enum(INDUSTRY_SLUGS).optional(),
  src: z
    .string()
    .regex(/^[a-z0-9.\-]{1,60}$/)
    .optional(),
});

export type QuoteInput = z.input<typeof quoteSchema>;
export type QuoteData = z.output<typeof quoteSchema>;

/** Wire payload adds anti-spam fields that never reach the lead sheet */
export const quoteSubmissionSchema = quoteSchema.extend({
  website: z.string().max(0).optional(),
  elapsedMs: z.number().int().min(0),
});

/** Plain-text summary for the existing contact-form sheet columns */
export function formatQuoteForSheet(q: QuoteData) {
  const size = q.l && q.w && q.h ? `${q.l} × ${q.w} × ${q.h} mm` : 'not given';
  const lines = [
    `Intent: ${LABELS.intent[q.intent]}`,
    `Product: ${LABELS.product[q.product]}`,
    `Quantity: ${LABELS.qty[q.qty]}`,
    `Size (L×W×H): ${size}`,
    `Printing: ${q.printing ? LABELS.printing[q.printing] : 'not given'}`,
    `Delivery: ${q.city || 'not given'}`,
    `Needed by: ${q.needBy ? LABELS.needBy[q.needBy] : 'not given'}`,
    `Reply on WhatsApp: ${q.whatsapp ? 'yes' : 'no'}`,
    q.gstin ? `GSTIN: ${q.gstin}` : '',
    q.industry ? `Industry: ${q.industry}` : '',
    q.src ? `Source CTA: ${q.src}` : '',
    q.notes ? `Notes: ${q.notes}` : '',
  ].filter(Boolean);
  return {
    name: q.name,
    company: q.company || '',
    email: q.email || '',
    phone: q.phone,
    requirements: lines.join('\n'),
  };
}
