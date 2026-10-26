/**
 * "Send my design to Vayu" enquiry (#2, #6), shared by the designer's lead form and api/quote.ts.
 * Keep this file free of "@/" imports so the serverless bundler can resolve it.
 * SECURITY: every field is length- and range-checked; the preview must be a small base64 PNG/JPEG data URL and the
 * share link must point at our own /box-designer page. Nothing here is ever rendered as HTML.
 */

import { z } from 'zod';
import { PHONE_RE } from './quoteSchema';

export const DESIGNER_STYLES = ['rsc', 'hsc', 'fol', 'sleeve', 'telescope', 'mailer', 'pizza', 'tray'] as const;
/** A Sheets cell holds 50,000 characters; the preview must leave room for the rest of the record */
export const MAX_PREVIEW_CHARS = 30_000;
export const MAX_SHARE_URL_CHARS = 9_000;
export const ENQUIRY_STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

const text = (max: number) => z.string().trim().max(max).optional().or(z.literal(''));

export const designerSpecSchema = z.object({
  style: z.enum(DESIGNER_STYLES),
  /** Inside size, mm */
  l: z.number().int().min(10).max(5000),
  w: z.number().int().min(10).max(5000),
  h: z.number().int().min(10).max(5000),
  unit: z.enum(['mm', 'cm', 'in']),
  ply: z.enum(['3-ply', '5-ply', '7-ply']),
  flutes: z.string().regex(/^[ABCEF]{1,3}$/),
  colour: z.string().regex(/^#[0-9a-f]{6}$/i),
  finish: z.enum(['matte', 'gloss']),
  printColours: z.number().int().min(0).max(4),
  images: z.number().int().min(0).max(20),
  texts: z.number().int().min(0).max(100),
  name: z.string().trim().max(80).optional().or(z.literal('')),
});

export const designerEstimateSchema = z.object({
  perBox: z.number().finite().min(0).max(100_000),
  low: z.number().finite().min(0).max(100_000),
  high: z.number().finite().min(0).max(100_000),
  total: z.number().finite().min(0).max(1_000_000_000),
});

/** What the person fills in */
export const designerLeadFormSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(80),
  phone: z
    .string()
    .transform((v) => v.replace(/[\s\-()]/g, ''))
    .refine((v) => PHONE_RE.test(v), 'Enter a valid 10-digit mobile number'),
  email: z.string().trim().email('Enter a valid email').max(120).optional().or(z.literal('')),
  quantity: z.coerce
    .number({ invalid_type_error: 'Enter a quantity' })
    .int('Whole boxes only')
    .min(1, 'At least 1 box')
    .max(1_000_000, 'For more than 10 lakh boxes, call us'),
  place: text(60),
  sample: z.boolean(),
  note: text(600),
});

export const designerLeadSchema = designerLeadFormSchema.extend({
  kind: z.literal('designer'),
  spec: designerSpecSchema,
  estimate: designerEstimateSchema.optional(),
  shareUrl: z
    .string()
    .max(MAX_SHARE_URL_CHARS)
    .regex(/^https?:\/\/[a-z0-9.:-]+\/box-designer#design=[A-Za-z0-9_-]+$/i)
    .optional()
    .or(z.literal('')),
  preview: z
    .string()
    .max(MAX_PREVIEW_CHARS)
    .regex(/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+=*$/)
    .optional()
    .or(z.literal('')),
});

export const designerLeadSubmissionSchema = designerLeadSchema.extend({
  website: z.string().max(0).optional(),
  elapsedMs: z.number().int().min(0),
});

export type DesignerLeadFormInput = z.input<typeof designerLeadFormSchema>;
export type DesignerLead = z.output<typeof designerLeadSchema>;
export type DesignerSpec = z.output<typeof designerSpecSchema>;

/** Stored CRM record (sheet "DesignerEnquiries") */
export interface DesignerEnquiry extends Omit<DesignerLead, 'kind'> {
  id: string;
  createdAt: string;
  status: EnquiryStatus;
  followUpSentAt?: string;
  adminNote?: string;
}

/** Lenient reader for rows coming back from the sheet (older or hand-edited rows still show) */
export const designerEnquirySchema = designerLeadSchema
  .omit({ kind: true })
  .extend({
    id: z.string().min(1).max(64),
    createdAt: z.string().max(40),
    status: z.enum(ENQUIRY_STATUSES).catch('new'),
    followUpSentAt: z.string().max(40).optional(),
    adminNote: z.string().max(1000).optional(),
    phone: z.string().max(20),
  });

const STYLE_NAMES: Record<(typeof DESIGNER_STYLES)[number], string> = {
  rsc: 'RSC (FEFCO 0201)',
  hsc: 'HSC (FEFCO 0200)',
  fol: 'Full overlap (FEFCO 0203)',
  sleeve: 'Sleeve',
  telescope: 'Telescope lid + base',
  mailer: 'Mailer (FEFCO 0427)',
  pizza: 'Pizza box',
  tray: 'Tray',
};

export const styleName = (style: DesignerSpec['style']) => STYLE_NAMES[style] ?? style;

const inr = (n: number) => `Rs ${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

/** Plain-text summary for the existing lead sheet columns (same shape as formatQuoteForSheet) */
export function formatDesignerLeadForSheet(lead: DesignerLead) {
  const s = lead.spec;
  const lines = [
    'Source: 3D Box Designer',
    `Style: ${styleName(s.style)}`,
    `Inside size (L×W×H): ${s.l} × ${s.w} × ${s.h} mm`,
    `Board: ${s.ply}, ${s.flutes} flute`,
    `Colour: ${s.colour.toUpperCase()} · ${s.finish}`,
    `Artwork: ${s.images} image(s), ${s.texts} text(s), ~${s.printColours} print colour(s)`,
    `Quantity: ${lead.quantity}`,
    `Delivery to: ${lead.place || 'not given'}`,
    `Sample requested: ${lead.sample ? 'yes' : 'no'}`,
    lead.estimate ? `Indicative estimate: ${inr(lead.estimate.low)}–${inr(lead.estimate.high)} per box` : '',
    s.name ? `Design name: ${s.name}` : '',
    lead.note ? `Notes: ${lead.note}` : '',
    lead.shareUrl ? `Design link: ${lead.shareUrl}` : '',
  ].filter(Boolean);
  return {
    name: lead.name,
    company: '',
    email: lead.email || '',
    phone: lead.phone,
    requirements: lines.join('\n'),
  };
}
