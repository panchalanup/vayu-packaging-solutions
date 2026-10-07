/**
 * Analytics consent (plan §16.1 S4, India DPDP Act 2023).
 * Without an explicit "granted", the analytics engine collects NO device fingerprint and NO IP geolocation:
 * it only counts anonymous, session-scoped events.
 * SECURITY: the stored value is parsed against an allow-list; storage access is wrapped because it can throw
 * (private mode, blocked site data). Nothing here is personal data.
 */

export type ConsentChoice = 'granted' | 'denied';

const KEY = 'vayu_analytics_consent_v1';
export const CONSENT_EVENT = 'vayu:consent-changed';

export function getConsent(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

export function setConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(KEY, choice);
    if (choice === 'denied') {
      // Withdrawing consent also removes identifiers stored earlier
      ['analytics_visitor_id', 'analytics_ip_hash', 'analytics_geo_data'].forEach((k) => window.localStorage.removeItem(k));
    }
  } catch {
    /* storage unavailable: the choice only applies to this page view */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice }));
}
