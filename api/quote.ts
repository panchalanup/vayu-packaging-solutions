/**
 * POST /api/quote  (Vercel serverless function)
 * Re-validates every field, rejects bots, rate-limits by IP, then forwards the lead to the sheet.
 * The sheet URL lives in a server-side env var so it never ships to the browser.
 * Two payloads share this path: the /quote form, and the 3D designer's "Send my design to Vayu" (kind: 'designer'),
 * which also goes to the admin CRM sheet ("DesignerEnquiries") where Apps Script sends the follow-up email.
 */

import { MIN_FILL_MS, formatQuoteForSheet, quoteSubmissionSchema } from '../src/lib/quoteSchema';
import { designerLeadSubmissionSchema, formatDesignerLeadForSheet, type DesignerEnquiry } from '../src/lib/designerLeadSchema';
import { ADMIN_SHEETS_CONFIG } from '../src/config/adminSheets';

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

  if (body && typeof body === 'object' && (body as { kind?: unknown }).kind === 'designer') {
    return handleDesignerLead(body, res);
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

// VERIFY-LATER[DSG-19]: set CRM_WEBHOOK_URL and CRM_TOKEN in Vercel (same values as the admin CRM Apps Script);
// until then the public admin endpoint/token from src/config/adminSheets.ts are used.
const crmUrl = () => process.env.CRM_WEBHOOK_URL || ADMIN_SHEETS_CONFIG.CRM_ENDPOINT;
const crmToken = () => process.env.CRM_TOKEN || ADMIN_SHEETS_CONFIG.CRM_TOKEN;

function enquiryId(): string {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = globalThis.crypto?.randomUUID?.().slice(0, 6) ?? Math.random().toString(36).slice(2, 8);
  return `DE-${day}-${rand}`.toUpperCase();
}

async function handleDesignerLead(body: unknown, res: Res) {
  const parsed = designerLeadSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'invalid_fields', fields: Object.keys(parsed.error.flatten().fieldErrors) });
  }
  const { website, elapsedMs, kind: _kind, ...lead } = parsed.data;
  if (website || elapsedMs < MIN_FILL_MS) {
    return res.status(200).json({ ok: true });
  }

  // 1) The existing lead sheet (same columns as the /quote form), so nothing changes for the owner's inbox
  const leadUrl = process.env.LEAD_WEBHOOK_URL || FALLBACK_WEBHOOK;
  let leadOk = false;
  try {
    const upstream = await fetch(leadUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formatDesignerLeadForSheet({ kind: 'designer', ...lead }), source: 'website-designer' }),
      redirect: 'follow',
    });
    leadOk = upstream.ok;
  } catch {
    leadOk = false;
  }

  // 2) The admin CRM sheet: full record + preview for the "Designer enquiries" view and the follow-up email
  const record: DesignerEnquiry = { ...lead, id: enquiryId(), createdAt: new Date().toISOString(), status: 'new' };
  let crmOk = false;
  try {
    const upstream = await fetch(crmUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'designerLead',
        entity: 'DesignerEnquiries',
        token: crmToken(),
        indexNo: record.id,
        data: JSON.stringify(record),
      }),
      redirect: 'follow',
    });
    crmOk = upstream.ok;
  } catch {
    crmOk = false;
  }

  // Either copy is enough for us to call the person back
  if (!leadOk && !crmOk) return res.status(502).json({ ok: false, error: 'upstream_failed' });
  return res.status(200).json({ ok: true, id: record.id });
}
