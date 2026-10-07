/**
 * Gujarat network content for /locations. Taken over from the old home "Distribution" section
 * (distributionCities, distributionUseCases, SEO paragraph) and the previous Locations page.
 * SECURITY: static content only; city ids are matched against this list, never built from user input.
 */

import { FACTS } from './facts';

export type RegionId = 'ahmedabad' | 'surat' | 'vadodara' | 'rajkot' | 'gm' | 'regional';

export interface Region {
  id: RegionId;
  title: string;
  focus: string;
  problem: string;
  solution: string;
}

/** The six city clusters from the previous Locations page, unchanged in meaning */
export const REGIONS: Region[] = [
  {
    id: 'ahmedabad',
    title: 'Ahmedabad',
    focus: 'E-commerce, engineering, FMCG',
    problem: 'High dispatch volume with strict delivery timelines',
    solution: 'Planned bulk dispatches from our Ahmedabad hub with reliable 3-ply to 7-ply supply continuity.',
  },
  {
    id: 'surat',
    title: 'Surat',
    focus: 'Textile, apparel, export',
    problem: 'Transit scuffing and moisture exposure in logistics',
    solution: 'Stronger corrugated board combinations and protective packaging materials to reduce shipment losses.',
  },
  {
    id: 'vadodara',
    title: 'Vadodara',
    focus: 'Industrial manufacturing, chemicals',
    problem: 'Need for heavy-duty cartons for warehouse and intercity movement',
    solution: '5-ply and 7-ply solutions designed for higher stacking and compression strength.',
  },
  {
    id: 'rajkot',
    title: 'Rajkot',
    focus: 'Auto components, machinery',
    problem: 'Frequent handling points causing edge crush failures',
    solution: 'Board specification optimization with recommended bursting strength and better load bearing.',
  },
  {
    id: 'gm',
    title: 'Gandhinagar & Mehsana',
    focus: 'Consumer goods and distribution',
    problem: 'Inconsistent packaging quality from multiple vendors',
    solution: 'Single-vendor quality consistency across boxes, tapes, stretch film, and strapping materials.',
  },
  {
    id: 'regional',
    title: 'Bhavnagar, Jamnagar, Morbi, Vapi, Himmatnagar, Modasa',
    focus: 'Regional industrial and trading clusters',
    problem: 'Need for predictable replenishment cycles in growing markets',
    solution: 'Scheduled supply planning with city-wise support from our Gujarat distribution network.',
  },
];

export interface City {
  id: string;
  name: string;
  region: RegionId;
  /** Approximate position, used only to place the schematic map dots */
  lon: number;
  lat: number;
  /** Approximate road distance from the Ahmedabad hub, km */
  km: number;
  /** Where the label sits relative to the dot */
  label: 'l' | 'r' | 't' | 'b';
  hub?: boolean;
}

// VERIFY-LATER[LOC-01]: distances are rounded road estimates from Ahmedabad, not measured routes
export const CITIES: City[] = [
  { id: 'ahmedabad', name: 'Ahmedabad', region: 'ahmedabad', lon: 72.58, lat: 23.03, km: 0, label: 'b', hub: true },
  // Gandhinagar sits ~25 km from Ahmedabad; its dot is nudged north-east so the two stay separately tappable
  { id: 'gandhinagar', name: 'Gandhinagar', region: 'gm', lon: 72.82, lat: 23.32, km: 30, label: 'l' },
  { id: 'mehsana', name: 'Mehsana', region: 'gm', lon: 72.37, lat: 23.6, km: 80, label: 'l' },
  { id: 'himmatnagar', name: 'Himmatnagar', region: 'regional', lon: 72.97, lat: 23.6, km: 85, label: 't' },
  { id: 'modasa', name: 'Modasa', region: 'regional', lon: 73.3, lat: 23.46, km: 120, label: 'r' },
  { id: 'surat', name: 'Surat', region: 'surat', lon: 72.83, lat: 21.17, km: 265, label: 'r' },
  { id: 'vadodara', name: 'Vadodara', region: 'vadodara', lon: 73.18, lat: 22.31, km: 110, label: 'r' },
  { id: 'rajkot', name: 'Rajkot', region: 'rajkot', lon: 70.8, lat: 22.3, km: 215, label: 'l' },
  { id: 'bhavnagar', name: 'Bhavnagar', region: 'regional', lon: 72.15, lat: 21.76, km: 175, label: 'l' },
  { id: 'jamnagar', name: 'Jamnagar', region: 'regional', lon: 70.07, lat: 22.47, km: 310, label: 'l' },
  { id: 'morbi', name: 'Morbi', region: 'regional', lon: 70.84, lat: 22.82, km: 195, label: 'l' },
  { id: 'vapi', name: 'Vapi', region: 'regional', lon: 72.9, lat: 20.37, km: 380, label: 'r' },
];

export const regionOf = (city: City): Region => REGIONS.find((r) => r.id === city.region) ?? REGIONS[0];

/** Indicative transit band from distance. Placeholder until the owner confirms real lead times. */
export function transitBand(km: number): string {
  // VERIFY-LATER[LOC-02]: transit times are placeholders derived from distance, not owner-confirmed dispatch data
  if (km === 0) return 'Local dispatch, same day';
  if (km <= 130) return 'About 1 day';
  if (km <= 300) return '1–2 days';
  return '2–3 days';
}

/** Common challenges / solutions (from the old home page) */
export const USE_CASES = [
  {
    problem: 'Transit damage in long-distance dispatch',
    solution: 'Recommended 5-ply and 7-ply corrugated configurations with stronger burst and stacking performance.',
  },
  {
    problem: 'Urgent replenishment for fast-moving SKUs',
    solution: 'Ahmedabad hub-based planning supports faster dispatch cycles across major Gujarat industrial corridors.',
  },
  {
    problem: 'Inconsistent packaging quality across suppliers',
    solution: 'Single-vendor quality process for box strength, dimensions, and packaging consumables at scale.',
  },
] as const;

/** Long-form SEO copy kept on the page as visible text (from the old home "Distribution" section) */
export const SEO_PARAGRAPHS = [
  'We provide packaging distribution services across major cities in Gujarat including Ahmedabad, Surat, Vadodara, Rajkot, and surrounding industrial zones. Ahmedabad serves as our central hub, enabling fast and dependable delivery operations throughout the state.',
  'Vayu Packaging supports businesses across key Gujarat markets with corrugated boxes, tapes, stretch films, bubble wraps, and related packaging consumables. We focus on reducing transit damage, maintaining supply consistency, and supporting bulk dispatch timelines.',
] as const;

export const LOCATION_FAQS = [
  {
    question: 'Which Gujarat cities does Vayu Packaging currently serve?',
    answer:
      'We currently serve Ahmedabad, Surat, Vadodara, Rajkot, Gandhinagar, Mehsana, Bhavnagar, Jamnagar, Morbi, Vapi, Himmatnagar, and Modasa with packaging distribution support.',
  },
  {
    question: 'Can I get bulk corrugated boxes delivered outside Ahmedabad in Gujarat?',
    answer:
      'Yes. Ahmedabad is our central operational hub, and we support bulk deliveries across major Gujarat cities based on order quantity, box specification, and dispatch schedule.',
  },
  {
    question: 'Do you help choose packaging strength based on shipment risk?',
    answer:
      'Yes. We help businesses choose 3-ply, 5-ply, or 7-ply box specifications based on product weight, handling conditions, stacking, and transit distance.',
  },
] as const;

export const HUB_FACTS = [
  { label: 'Hub', value: FACTS.city },
  { label: 'Cities', value: String(CITIES.length) },
  { label: 'Stock dispatch', value: `${FACTS.dispatchHours} hrs*` },
  { label: 'MOQ', value: `${FACTS.moqBoxes} boxes` },
];
