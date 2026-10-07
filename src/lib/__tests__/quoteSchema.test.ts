/**
 * quoteSchema: the contract shared by the browser form and api/quote.ts.
 * SECURITY under test: enums are closed, free text is length-capped, the anti-spam honeypot must stay empty,
 * and nothing is accepted that could break out of the plain-text sheet summary.
 */

import { describe, expect, it } from 'vitest';
import { formatQuoteForSheet, quoteSchema, quoteSubmissionSchema, stepYouSchema, type QuoteData } from '../quoteSchema';

const valid = {
  intent: 'quote',
  product: '5-ply',
  qty: '1k-5k',
  name: 'Asha Patel',
  phone: '98765 43210',
  whatsapp: true,
} as const;

describe('quoteSchema', () => {
  it('accepts a minimal valid request and normalises the phone', () => {
    const result = quoteSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone).toBe('9876543210');
  });

  it.each([
    ['unknown product', { product: '11-ply' }],
    ['javascript: product', { product: 'javascript:alert(1)' }],
    ['unknown intent', { intent: 'delete' }],
    ['unknown quantity band', { qty: '1000000' }],
    ['unknown industry', { industry: 'weapons' }],
    ['unknown printing option', { printing: 'holographic' }],
  ])('rejects %s', (_label, patch) => {
    expect(quoteSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });

  describe('sizes', () => {
    it('accepts 10 to 5000 mm and blank', () => {
      expect(quoteSchema.safeParse({ ...valid, l: 10, w: 5000, h: '' }).success).toBe(true);
    });

    it('coerces numeric strings', () => {
      const r = quoteSchema.safeParse({ ...valid, l: '300' });
      expect(r.success && r.data.l).toBe(300);
    });

    it.each([9, 5001, -1, 1.5])('rejects %s mm', (v) => {
      expect(quoteSchema.safeParse({ ...valid, l: v }).success).toBe(false);
    });
  });

  describe('src (campaign tag)', () => {
    it.each(['home.hero.quote', 'finder.result', 'a-b.c'])('accepts %s', (src) => {
      expect(quoteSchema.safeParse({ ...valid, src }).success).toBe(true);
    });

    it.each(['javascript:alert(1)', 'Has Space', 'UPPER', '<img>', '', 'a'.repeat(61)])('rejects %j', (src) => {
      expect(quoteSchema.safeParse({ ...valid, src }).success).toBe(false);
    });
  });

  it('caps free text lengths', () => {
    expect(quoteSchema.safeParse({ ...valid, notes: 'x'.repeat(601) }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...valid, city: 'x'.repeat(81) }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...valid, company: 'x'.repeat(121) }).success).toBe(false);
  });
});

describe('stepYouSchema', () => {
  const you = { name: 'Asha', phone: '9876543210', whatsapp: false };

  it.each(['9876543210', '+919876543210', '919876543210', '09876543210', '98765-43210', '(98765) 43210', '+91 98765 43210'])(
    'accepts an Indian mobile written as %s',
    (phone) => {
      expect(stepYouSchema.safeParse({ ...you, phone }).success).toBe(true);
    }
  );

  it.each(['12345', '5876543210', '98765432', '98765432101', 'abcdefghij', '', '+1 415 555 0100'])('rejects phone %j', (phone) => {
    expect(stepYouSchema.safeParse({ ...you, phone }).success).toBe(false);
  });

  it('requires a name of at least 2 characters', () => {
    expect(stepYouSchema.safeParse({ ...you, name: 'A' }).success).toBe(false);
    expect(stepYouSchema.safeParse({ ...you, name: '   ' }).success).toBe(false);
  });

  it('validates email when given and allows blank', () => {
    expect(stepYouSchema.safeParse({ ...you, email: '' }).success).toBe(true);
    expect(stepYouSchema.safeParse({ ...you, email: 'asha@example.com' }).success).toBe(true);
    expect(stepYouSchema.safeParse({ ...you, email: 'not-an-email' }).success).toBe(false);
  });

  it('upper-cases and validates GSTIN, allows blank', () => {
    const ok = stepYouSchema.safeParse({ ...you, gstin: '24aaaaa0000a1z5' });
    expect(ok.success && ok.data.gstin).toBe('24AAAAA0000A1Z5');
    expect(stepYouSchema.safeParse({ ...you, gstin: '' }).success).toBe(true);
    expect(stepYouSchema.safeParse({ ...you, gstin: '24AAAAA0000A1' }).success).toBe(false);
  });
});

describe('quoteSubmissionSchema (wire format)', () => {
  const wire = { ...valid, elapsedMs: 8000 };

  it('accepts a human-speed submission with an empty honeypot', () => {
    expect(quoteSubmissionSchema.safeParse({ ...wire, website: '' }).success).toBe(true);
    expect(quoteSubmissionSchema.safeParse(wire).success).toBe(true);
  });

  it('rejects a filled honeypot field', () => {
    expect(quoteSubmissionSchema.safeParse({ ...wire, website: 'http://spam.example' }).success).toBe(false);
  });

  it('requires a non-negative integer fill time', () => {
    expect(quoteSubmissionSchema.safeParse({ ...valid }).success).toBe(false);
    expect(quoteSubmissionSchema.safeParse({ ...wire, elapsedMs: -1 }).success).toBe(false);
    expect(quoteSubmissionSchema.safeParse({ ...wire, elapsedMs: 1.5 }).success).toBe(false);
  });
});

describe('formatQuoteForSheet', () => {
  it('maps contact fields and writes readable requirements', () => {
    const data = quoteSchema.parse({ ...valid, l: 300, w: 200, h: 150, printing: 'full', notes: 'Fragile', src: 'finder.result' }) as QuoteData;
    const sheet = formatQuoteForSheet(data);
    expect(sheet.name).toBe('Asha Patel');
    expect(sheet.phone).toBe('9876543210');
    expect(sheet.company).toBe('');
    expect(sheet.requirements).toContain('Product: 5-ply');
    expect(sheet.requirements).toContain('Quantity: 1–5k');
    expect(sheet.requirements).toContain('Size (L×W×H): 300 × 200 × 150 mm');
    expect(sheet.requirements).toContain('Printing: Full colour');
    expect(sheet.requirements).toContain('Source CTA: finder.result');
    expect(sheet.requirements).toContain('Notes: Fragile');
  });

  it('says "not given" instead of printing undefined', () => {
    const sheet = formatQuoteForSheet(quoteSchema.parse(valid) as QuoteData);
    expect(sheet.requirements).toContain('Size (L×W×H): not given');
    expect(sheet.requirements).not.toContain('undefined');
  });
});
