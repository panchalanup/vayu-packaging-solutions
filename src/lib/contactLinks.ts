/**
 * Contact links (WhatsApp, phone, email).
 * SECURITY: WhatsApp messages carry page context only, never personal data or tracking IDs,
 * and are always URL-encoded.
 */

import { CONTACT_INFO, WEBSITE_URL } from '@/constants';
import { PHONE_E164 } from '@/content/facts';

const WA_NUMBER = PHONE_E164.replace(/\D/g, '');

export const telHref = `tel:${PHONE_E164}`;
export const mailHref = `mailto:${CONTACT_INFO.email}`;

export function whatsappHref(message?: string): string {
  const base = `https://wa.me/${WA_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message.slice(0, 500))}` : base;
}

const PAGE_TOPICS: Record<string, string> = {
  '/products': 'your corrugated boxes',
  '/services': 'packaging for my industry',
  '/compare-quote': 'a box spec from the Packaging Finder',
  '/box-designer': 'a custom box design',
  '/locations': 'delivery to my city',
  '/about': 'working with Vayu',
};

/** Page-aware default message, e.g. "Hi Vayu, I'm interested in your corrugated boxes (from …/products)." */
export function pageWhatsAppMessage(pathname: string, topic?: string): string {
  const safePath = /^\/[a-z0-9\-/]*$/i.test(pathname) ? pathname : '/';
  const subject = topic ?? PAGE_TOPICS[safePath] ?? 'corrugated boxes';
  const host = WEBSITE_URL.replace(/^https?:\/\//, '');
  return `Hi Vayu, I'm interested in ${subject} (from ${host}${safePath}). Please share a quote.`;
}
