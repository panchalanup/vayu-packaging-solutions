/**
 * Single agreed fact set (§0.3 of docs/Design-Improvement/DESIGN_IMPROVEMENT_PLAN.md).
 * Every marketing number on the site must come from here. Review with: grep -rn "VERIFY-LATER" src
 */

import { CONTACT_INFO } from '@/constants';

export const FACTS = {
  // VERIFY-LATER[FACT-01]: "5+ years" (STATS) conflicts with "over a decade" (old ABOUT_CONTENT). Using 5+.
  yearsInBusiness: { value: 5, suffix: '+', label: 'years supplying' },
  // VERIFY-LATER[FACT-02]: "250+" (STATS) conflicts with "5,000+" (old ABOUT_CONTENT). Using 250+.
  clients: { value: 250, suffix: '+', label: 'businesses served' },
  // VERIFY-LATER[FACT-03]: boxes delivered, taken from STATS.
  boxesDelivered: { value: 5, suffix: 'M+', label: 'boxes delivered' },
  // VERIFY-LATER[FACT-04]: "50+ cities" vs Gujarat-focused pages. Using 50+, Gujarat as home region.
  citiesServed: { value: 50, suffix: '+', label: 'cities delivered' },

  // VERIFY-LATER[FACT-07]: MOQ from BUSINESS_DETAILS.
  moqBoxes: 500,
  // VERIFY-LATER[FACT-08]: exact scope of the 48-hour promise (stock sizes, Ahmedabad dispatch).
  dispatchHours: 48,
  dispatchFootnote: 'Stock sizes, Ahmedabad dispatch.',
  // VERIFY-LATER[FACT-13]: placeholder reply SLA and hours.
  replySla: '2 working hours',
  businessHours: 'Mon–Sat, 10:00–19:00',
  // VERIFY-LATER[FACT-19]: placeholder sample policy.
  samplePolicy: 'Samples available on request',

  legalName: 'Vayu Packaging Solutions',
  // VERIFY-LATER[FACT-14]: GSTIN / Udyam not supplied yet; footer hides them while null.
  gstin: null as string | null,
  udyam: null as string | null,

  city: 'Ahmedabad',
  addressShort: 'SG Highway, Ahmedabad',
  addressFull: CONTACT_INFO.addressFull,
} as const;

/** Stat ledger rows, in display order */
export const FACT_STATS = [
  FACTS.yearsInBusiness,
  FACTS.clients,
  FACTS.boxesDelivered,
  FACTS.citiesServed,
] as const;

/** Phone in E.164 for tel: and wa.me links */
export const PHONE_E164 = `+${CONTACT_INFO.phone.replace(/\D/g, '')}`;
