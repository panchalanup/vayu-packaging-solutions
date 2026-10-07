/**
 * contactLinks: E.164 / wa.me formatting and message safety.
 * SECURITY under test: only allow-listed schemes are produced, messages are URL-encoded and length-capped,
 * and untrusted paths never reach a message unvalidated.
 */

import { describe, expect, it } from 'vitest';
import { mailHref, pageWhatsAppMessage, telHref, whatsappHref } from '../contactLinks';
import { PHONE_E164 } from '@/content/facts';
import { CONTACT_INFO } from '@/constants';

describe('phone formatting', () => {
  it('derives a valid E.164 number', () => {
    expect(PHONE_E164).toMatch(/^\+[1-9]\d{9,14}$/);
    expect(PHONE_E164.startsWith('+91')).toBe(true);
  });

  it('builds a tel: link with the E.164 number and no spaces', () => {
    expect(telHref).toBe(`tel:${PHONE_E164}`);
    expect(telHref).not.toMatch(/\s/);
  });

  it('builds a mailto: link from the configured address only', () => {
    expect(mailHref).toBe(`mailto:${CONTACT_INFO.email}`);
  });
});

describe('whatsappHref', () => {
  it('uses wa.me with digits only (no plus, spaces or dashes)', () => {
    const href = whatsappHref();
    expect(href).toBe(`https://wa.me/${PHONE_E164.replace('+', '')}`);
    expect(href).toMatch(/^https:\/\/wa\.me\/\d+$/);
  });

  it('URL-encodes the message', () => {
    const href = whatsappHref('Hi & bye #1 <b>100%</b>?');
    const text = new URL(href).searchParams.get('text');
    expect(text).toBe('Hi & bye #1 <b>100%</b>?');
    expect(href).not.toContain('<');
    expect(href).not.toContain(' ');
    expect(href.split('?')).toHaveLength(2);
  });

  it('caps the message at 500 characters', () => {
    const text = new URL(whatsappHref('a'.repeat(900))).searchParams.get('text');
    expect(text).toHaveLength(500);
  });

  it('omits ?text= for an empty message', () => {
    expect(whatsappHref('')).not.toContain('?text=');
  });

  it('keeps javascript: payloads inert inside the encoded text', () => {
    const href = whatsappHref('javascript:alert(1)');
    expect(href.startsWith('https://wa.me/')).toBe(true);
    expect(href).not.toContain('javascript:');
  });
});

describe('pageWhatsAppMessage', () => {
  it('uses the page topic and host without the protocol', () => {
    const message = pageWhatsAppMessage('/compare-quote');
    expect(message).toContain('Packaging Finder');
    expect(message).toContain('/compare-quote');
    expect(message).not.toContain('https://');
  });

  it('falls back to a generic topic for unknown pages', () => {
    expect(pageWhatsAppMessage('/something-else')).toContain('corrugated boxes');
  });

  it('replaces an unsafe path with "/" instead of echoing it', () => {
    const message = pageWhatsAppMessage('/<script>alert(1)</script>');
    expect(message).not.toContain('<script>');
    expect(message).toMatch(/\/\)\./);
  });

  it('lets the caller override the topic', () => {
    expect(pageWhatsAppMessage('/', '5-ply boxes')).toContain('5-ply boxes');
  });
});
