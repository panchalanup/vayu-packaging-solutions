/**
 * /quote?… pre-fill parameters (§7.2).
 * SECURITY: every value comes from the URL, so each is checked against an allow-list or a numeric range,
 * and the result is only ever rendered as text.
 */

import { INDUSTRY_SLUGS, INTENTS, PRODUCTS, QTY_BANDS, type QuoteInput } from './quoteSchema';

type Prefill = Partial<Pick<QuoteInput, 'intent' | 'product' | 'qty' | 'l' | 'w' | 'h' | 'industry' | 'src'>>;

const pick = <T extends string>(list: readonly T[], value: string | null): T | undefined =>
  value && (list as readonly string[]).includes(value) ? (value as T) : undefined;

const dim = (value: string | null): number | undefined => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 10 && n <= 5000 ? Math.round(n) : undefined;
};

function qtyBand(value: string | null): QuoteInput['qty'] | undefined {
  const direct = pick(QTY_BANDS, value);
  if (direct) return direct;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  if (n < 1000) return '500-1k';
  if (n < 5000) return '1k-5k';
  if (n < 25000) return '5k-25k';
  return '25k+';
}

export function parseQuotePrefill(search: string): Prefill {
  const p = new URLSearchParams(search);
  const plyRaw = p.get('ply');
  const ply = plyRaw && /^[357]$/.test(plyRaw) ? `${plyRaw}-ply` : plyRaw;
  const src = p.get('src');

  const prefill: Prefill = {
    intent: pick(INTENTS, p.get('intent')),
    product: pick(PRODUCTS, p.get('product')) ?? pick(PRODUCTS, ply),
    qty: qtyBand(p.get('qty')),
    l: dim(p.get('l')),
    w: dim(p.get('w')),
    h: dim(p.get('h')),
    industry: pick(INDUSTRY_SLUGS, p.get('industry')),
    src: src && /^[a-z0-9.-]{1,60}$/.test(src) ? src : undefined,
  };
  return Object.fromEntries(Object.entries(prefill).filter(([, v]) => v !== undefined)) as Prefill;
}

/**
 * Build a /quote URL from known-safe values.
 * SECURITY: the params are round-tripped through parseQuotePrefill, so unknown keys, off-list products and
 * out-of-range sizes are dropped and a raw quantity becomes a band. Callers can pass raw numbers
 * (e.g. qty: 2000, l/w/h in mm) and never need to pre-validate.
 */
export function quoteHref(params: Record<string, string | number | undefined> = {}): string {
  const raw = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') raw.set(k, String(v));
  });
  const clean = parseQuotePrefill(raw.toString());
  const qs = new URLSearchParams();
  // Stable key order keeps URLs (and analytics ids) predictable
  (['intent', 'product', 'qty', 'l', 'w', 'h', 'industry', 'src'] as const).forEach((key) => {
    const value = clean[key];
    if (value !== undefined) qs.set(key, String(value));
  });
  const s = qs.toString();
  return s ? `/quote?${s}` : '/quote';
}
