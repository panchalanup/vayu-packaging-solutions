/**
 * Shared helpers for the free calculator pages (/tools/<slug>): number formatting and the hand-off links that
 * carry a calculated size into the 3D designer, the quote form and WhatsApp.
 * Pure (no React). Everything runs in the browser; nothing here sends data anywhere.
 * SECURITY: only numbers and allow-listed words go into links; the designer and quote pages re-validate them.
 */

import type { BoxDimensions, PlyType } from '@/types/boxDesigner';
import { DEFAULT_PLY_FLUTES } from '@/lib/boxDesigner/boardSpecs';
import { DIMENSION_LIMITS } from '@/lib/boxDesigner/constants';
import { quoteHref } from '@/lib/quotePrefill';
import { whatsappHref } from '@/lib/contactLinks';
import { WEBSITE_URL } from '@/constants';

export const round = (n: number, decimals = 0): number => {
  if (!Number.isFinite(n)) return NaN;
  const f = 10 ** decimals;
  return Math.round(n * f + (n < 0 ? -1e-9 : 1e-9)) / f;
};

/** 1,234.5 style, Indian grouping, at most `decimals` decimals */
export const fmt = (n: number, decimals = 1): string =>
  Number.isFinite(n) ? n.toLocaleString('en-IN', { maximumFractionDigits: decimals }) : '-';

export const rupees = (n: number, decimals: 0 | 2 = 2): string =>
  Number.isFinite(n) ? `₹${n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}` : '-';

/** Positive finite number from text ("12,5" ok), NaN when empty or not a number */
export const parseNum = (raw: string): number => {
  const cleaned = raw.trim().replace(',', '.');
  if (!/^\d*\.?\d+$/.test(cleaned)) return NaN;
  return parseFloat(cleaned);
};

export const validDims = (d: BoxDimensions | null | undefined): d is BoxDimensions =>
  !!d && [d.length, d.width, d.height].every((v) => Number.isFinite(v) && v > 0);

export const volumeCm3 = (d: BoxDimensions): number => d.length * d.width * d.height;

/** Attribution value for ?src= (quote allows lowercase letters, digits, dot and hyphen, max 60) */
export const toolSrc = (slug: string): string => `tools.${slug.toLowerCase().replace(/[^a-z0-9-]/g, '')}`.slice(0, 60);

const clampCm = (v: number): number => Math.min(DIMENSION_LIMITS.max, Math.max(DIMENSION_LIMITS.min, round(v, 1)));

/**
 * /box-designer link with the calculated INSIDE size (cm) as a preset (see lib/boxDesigner/landingPreset.ts).
 * Sizes outside the designer's range are clamped. With no size it just opens the designer.
 */
export function designerHandoffHref(opts: { slug: string; dimsCm?: BoxDimensions | null; style?: string; ply?: PlyType }): string {
  const q = new URLSearchParams();
  if (validDims(opts.dimsCm)) {
    const ply = opts.ply ?? '5-ply';
    q.set('style', opts.style ?? 'rsc');
    q.set('l', String(clampCm(opts.dimsCm.length)));
    q.set('w', String(clampCm(opts.dimsCm.width)));
    q.set('h', String(clampCm(opts.dimsCm.height)));
    q.set('ply', ply);
    q.set('fl', DEFAULT_PLY_FLUTES[ply].join(''));
  }
  q.set('src', toolSrc(opts.slug));
  return `/box-designer?${q.toString()}`;
}

/** /quote link (sizes in mm, per quotePrefill); out-of-range values are dropped by quoteHref */
export function quoteHandoffHref(opts: { slug: string; dimsCm?: BoxDimensions | null; ply?: PlyType; qty?: number }): string {
  const mm = (cm: number) => Math.round(cm * 10);
  const dims = validDims(opts.dimsCm) ? opts.dimsCm : null;
  return quoteHref({
    l: dims ? mm(dims.length) : undefined,
    w: dims ? mm(dims.width) : undefined,
    h: dims ? mm(dims.height) : undefined,
    ply: opts.ply,
    qty: opts.qty && Number.isFinite(opts.qty) && opts.qty > 0 ? Math.round(opts.qty) : undefined,
    src: toolSrc(opts.slug),
  });
}

/** WhatsApp chat with Vayu; the message holds page context and the calculated numbers only */
export function whatsappHandoffHref(opts: { toolName: string; slug: string; summary: string }): string {
  const host = WEBSITE_URL.replace(/^https?:\/\//, '');
  return whatsappHref(`Hi Vayu, I used the ${opts.toolName} (${host}/tools/${opts.slug}). ${opts.summary} Please share a quote.`);
}

/** wa.me link that lets the person pick a contact to send the result to */
export function whatsappShareHref(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text.slice(0, 700))}`;
}

/** Length x width x height in cm for summaries ("30 x 20 x 15 cm") */
export const dimsText = (d: BoxDimensions, decimals = 1): string => `${fmt(d.length, decimals)} x ${fmt(d.width, decimals)} x ${fmt(d.height, decimals)} cm`;
