/**
 * Indicative delivery estimate (#5): production days for the design + transit by city or pincode.
 * Transit uses the same distance bands as /locations (src/content/locations.ts), so both pages always agree.
 * SECURITY: the query is free text from the user; it is only matched against static lists, never echoed as HTML.
 */

import { CITIES, transitBand, type City } from '@/content/locations';
import { getStyle } from './styles';

export type Range = [number, number];

// VERIFY-LATER[DSG-16]: production working days per job type (plain custom size / printed / die-cut)
export const PRODUCTION_DAYS = {
  plain: [4, 6] as Range,
  printed: [7, 10] as Range,
  dieCut: [8, 12] as Range,
};

// VERIFY-LATER[DSG-17]: transit outside our Gujarat network (part-load transport / courier)
export const OUTSIDE_GUJARAT_DAYS: Range = [4, 7];
export const ELSEWHERE_GUJARAT_DAYS: Range = [2, 3];

/** Pincode prefixes for our network cities (first 3 digits; Gandhinagar uses 4) */
const PIN_PREFIXES: [string, string][] = [
  ['3820', 'gandhinagar'],
  ['380', 'ahmedabad'],
  ['382', 'ahmedabad'],
  ['384', 'mehsana'],
  ['3833', 'modasa'],
  ['383', 'himmatnagar'],
  ['394', 'surat'],
  ['395', 'surat'],
  ['390', 'vadodara'],
  ['391', 'vadodara'],
  ['360', 'rajkot'],
  ['364', 'bhavnagar'],
  ['361', 'jamnagar'],
  ['363', 'morbi'],
  ['396', 'vapi'],
];

/** Transit days from road distance; mirrors transitBand() */
export function transitDays(km: number): Range {
  if (km === 0) return [0, 1];
  if (km <= 130) return [1, 1];
  if (km <= 300) return [1, 2];
  return [2, 3];
}

export type DeliveryMatch =
  | { kind: 'city'; city: City; transit: Range; transitLabel: string }
  | { kind: 'gujarat'; transit: Range; transitLabel: string }
  | { kind: 'india'; transit: Range; transitLabel: string }
  | { kind: 'unknown' };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export function matchDestination(query: string): DeliveryMatch {
  const q = query.trim().slice(0, 60);
  if (!q) return { kind: 'unknown' };

  if (/^\d{6}$/.test(q.replace(/\s/g, ''))) {
    const pin = q.replace(/\s/g, '');
    if (pin[0] === '0') return { kind: 'unknown' };
    // Longest matching prefix wins (Gandhinagar 3820xx before Ahmedabad 382xxx)
    const hit = PIN_PREFIXES.filter(([p]) => pin.startsWith(p)).sort((a, b) => b[0].length - a[0].length)[0];
    const city = hit && CITIES.find((c) => c.id === hit[1]);
    if (city) return { kind: 'city', city, transit: transitDays(city.km), transitLabel: transitBand(city.km) };
    if (/^3[6-9]/.test(pin)) return { kind: 'gujarat', transit: ELSEWHERE_GUJARAT_DAYS, transitLabel: '2–3 days' };
    return { kind: 'india', transit: OUTSIDE_GUJARAT_DAYS, transitLabel: '4–7 days' };
  }

  const key = norm(q);
  if (key.length < 3) return { kind: 'unknown' };
  const city = CITIES.find((c) => norm(c.name) === key) ?? CITIES.find((c) => norm(c.name).startsWith(key));
  if (city) return { kind: 'city', city, transit: transitDays(city.km), transitLabel: transitBand(city.km) };
  if (key === 'gujarat') return { kind: 'gujarat', transit: ELSEWHERE_GUJARAT_DAYS, transitLabel: '2–3 days' };
  // Any other place name: treat as outside our network
  if (/^[a-z]+$/.test(key)) return { kind: 'india', transit: OUTSIDE_GUJARAT_DAYS, transitLabel: '4–7 days' };
  return { kind: 'unknown' };
}

export type JobType = keyof typeof PRODUCTION_DAYS;

export function jobTypeOf(design: { template: string; faceImages: unknown[]; textElements: unknown[]; stickers?: unknown[] }): JobType {
  if (['diecut', 'slide'].includes(getStyle(design.template).rigKind)) return 'dieCut';
  return design.faceImages.length > 0 || design.textElements.length > 0 || (design.stickers?.length ?? 0) > 0 ? 'printed' : 'plain';
}

export interface DeliveryEstimate {
  match: DeliveryMatch;
  production: Range;
  /** Working days from order confirmation to delivery; null when the place was not recognised */
  total: Range | null;
  label: string;
}

export function estimateDelivery(query: string, job: JobType): DeliveryEstimate {
  const match = matchDestination(query);
  const production = PRODUCTION_DAYS[job];
  if (match.kind === 'unknown') {
    return { match, production, total: null, label: `About ${production[0]}–${production[1]} working days to make, plus transit` };
  }
  const total: Range = [production[0] + match.transit[0], production[1] + match.transit[1]];
  return { match, production, total, label: `About ${total[0]}–${total[1]} working days` };
}
