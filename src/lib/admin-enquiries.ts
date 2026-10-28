/**
 * Admin: 3D designer enquiries (#9), read from the CRM sheet tab "DesignerEnquiries" through the same Apps Script
 * endpoint as customers / quotations / invoices (GOOGLE_APPS_SCRIPT_ADMIN_CRM.js).
 * SECURITY: sheet rows are parsed with zod; anything malformed is skipped. Values are only rendered as text, and the
 * preview only as an <img> whose src must be a base64 PNG/JPEG data URL.
 */

import { ADMIN_SHEETS_CONFIG } from '@/config/adminSheets';
import { designerEnquirySchema, type DesignerEnquiry, type EnquiryStatus } from '@/lib/designerLeadSchema';

const ENTITY = 'DesignerEnquiries';

type SheetsResponse = { success: boolean; rows?: { indexNo: string; data: string }[]; message?: string };

async function call(payload: Record<string, unknown>): Promise<SheetsResponse | null> {
  if (!ADMIN_SHEETS_CONFIG.CRM_ENDPOINT) return null;
  try {
    const response = await fetch(ADMIN_SHEETS_CONFIG.CRM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...payload, entity: ENTITY, token: ADMIN_SHEETS_CONFIG.CRM_TOKEN }),
    });
    const text = await response.text();
    return text ? (JSON.parse(text) as SheetsResponse) : null;
  } catch {
    return null;
  }
}

export function parseEnquiryRows(rows: { indexNo: string; data: string }[]): DesignerEnquiry[] {
  return rows
    .map((row) => {
      try {
        const parsed = designerEnquirySchema.safeParse(JSON.parse(row.data));
        return parsed.success ? (parsed.data as DesignerEnquiry) : null;
      } catch {
        return null;
      }
    })
    .filter((e): e is DesignerEnquiry => e !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** null = the sheet could not be reached (shown as an error, not as "no enquiries") */
export async function getDesignerEnquiries(): Promise<DesignerEnquiry[] | null> {
  const result = await call({ action: 'getAll' });
  if (!result?.success) return null;
  return parseEnquiryRows(result.rows ?? []);
}

export async function saveDesignerEnquiry(enquiry: DesignerEnquiry, patch: { status?: EnquiryStatus; adminNote?: string }): Promise<boolean> {
  const next = { ...enquiry, ...patch };
  const result = await call({ action: 'upsert', indexNo: enquiry.id, data: JSON.stringify(next) });
  return !!result?.success;
}

export const isSafePreview = (src: string | undefined): src is string =>
  typeof src === 'string' && /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+=*$/.test(src);
