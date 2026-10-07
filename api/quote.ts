/**
 * POST /api/quote  (Vercel serverless function)
 * Re-validates every field, rejects bots, rate-limits by IP, then forwards the lead to the sheet.
 * The sheet URL lives in a server-side env var so it never ships to the browser.
 */

import { MIN_FILL_MS, formatQuoteForSheet, quoteSubmissionSchema } from '../src/lib/quoteSchema';

interface Req {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
}
interface Res {
  status(code: number): Res;
  json(body: unknown): void;
  setHeader(name: string, value: string): void;
}

// VERIFY-LATER[SEC-02]: set LEAD_WEBHOOK_URL in Vercel, redeploy the Apps Script to a new URL and delete this fallback
// (the fallback is the contact-form URL that was already public in the browser bundle).
const FALLBACK_WEBHOOK =
  'https://script.google.com/macros/s/AKfycbxSNUo_NgcZCkxfh-iHlZ_E7DFYmy_VmxYxEXU_nodWhCQg-vI32HwJYhwC5xXvpNPz6g/exec';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
// Best effort: per warm instance only. VERIFY-LATER[SEC-03]: move to a shared store (e.g. Upstash) if spam appears.
const hits = new Map<string, number[]>();

function clientIp(req: Req): string {
  const fwd = req.headers['x-forwarded-for'];
  const first = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0]?.trim();
  return first || req.socket?.remoteAddress || 'unknown';
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  if (rateLimited(clientIp(req))) {
    return res.status(429).json({ ok: false, error: 'rate_limited' });
  }

  let body: unknown = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ ok: false, error: 'invalid_json' });
    }
  }

  const parsed = quoteSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'invalid_fields', fields: Object.keys(parsed.error.flatten().fieldErrors) });
  }

  const { website, elapsedMs, ...quote } = parsed.data;
  // Bots: filled the honeypot or submitted faster than a person can. Pretend success so they don't retry.
  if (website || elapsedMs < MIN_FILL_MS) {
    return res.status(200).json({ ok: true });
  }

  const url = process.env.LEAD_WEBHOOK_URL || FALLBACK_WEBHOOK;
  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formatQuoteForSheet(quote), source: 'website-quote' }),
      redirect: 'follow',
    });
    if (!upstream.ok) {
      return res.status(502).json({ ok: false, error: 'upstream_failed' });
    }
  } catch {
    return res.status(502).json({ ok: false, error: 'upstream_unreachable' });
  }

  return res.status(200).json({ ok: true });
}
