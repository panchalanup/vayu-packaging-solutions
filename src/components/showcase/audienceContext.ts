/**
 * Audience (buyer / maker) for the showcase page. Read once from ?for= or the viewer's last choice; every chapter
 * picks its copy through `pick`. SECURITY: ?for= is an enum, anything else is ignored; storage is wrapped in
 * try/catch (private windows, blocked storage).
 */

import { createContext, useContext } from 'react';
import type { Audience, Variants } from '@/content/designerShowcase';

export interface AudienceApi {
  audience: Audience;
  setAudience: (next: Audience, source?: 'switch' | 'cta') => void;
  pick: <T>(variants: Variants<T>) => T;
}

export const AudienceContext = createContext<AudienceApi | null>(null);

export function useAudience(): AudienceApi {
  const ctx = useContext(AudienceContext);
  if (!ctx) throw new Error('useAudience must be used inside the showcase page');
  return ctx;
}

const STORAGE_KEY = 'vayu-showcase-audience';

export const isAudience = (value: unknown): value is Audience => value === 'buyer' || value === 'maker';

/** ?for=maker wins, then the stored choice, then buyer (the larger audience) */
export function initialAudience(search: string): Audience {
  const asked = new URLSearchParams(search).get('for');
  if (isAudience(asked)) return asked;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isAudience(stored)) return stored;
  } catch {
    /* storage unavailable: use the default */
  }
  return 'buyer';
}

export function rememberAudience(audience: Audience): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, audience);
  } catch {
    /* ignore */
  }
}
