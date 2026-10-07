/**
 * Site motion tier (§8.6): reuses the Box Designer perf tier plus Save-Data, slow networks,
 * WebGL support and reduced motion. QA override: ?quality=high|medium|low
 */

import { useState } from 'react';
import { detectPerfTier, parseTierOverride, type PerfTier } from '@/lib/boxDesigner/perfTier';
import { isWebGLAvailable } from '@/lib/boxDesigner/webglSupport';
import { prefersReducedMotion } from './tokens';

export interface SiteTier {
  tier: PerfTier;
  reducedMotion: boolean;
  /** Live 3D hero allowed (never on low tier, reduced motion or when the kill switch is set) */
  hero3d: boolean;
  /** Desktop-class device where pinned, scrubbed timelines are allowed */
  pinning: boolean;
  /** Large screen with a fine pointer */
  desktop: boolean;
}

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

export function detectSiteTier(): SiteTier {
  if (typeof window === 'undefined') {
    return { tier: 'low', reducedMotion: true, hero3d: false, pinning: false, desktop: false };
  }
  const nav = navigator as NavigatorHints;
  const reducedMotion = prefersReducedMotion();
  const override = parseTierOverride(window.location.search);
  const isMobile = window.matchMedia('(max-width: 767px)').matches || window.matchMedia('(pointer: coarse)').matches;
  const slowNetwork = !!nav.connection?.saveData || /(^|-)2g|3g/.test(nav.connection?.effectiveType ?? '');

  let tier: PerfTier =
    override ??
    detectPerfTier({ isMobile, deviceMemory: nav.deviceMemory, hardwareConcurrency: nav.hardwareConcurrency });
  if (!override && (slowNetwork || !isWebGLAvailable())) tier = 'low';

  const killSwitch = import.meta.env.VITE_HERO_3D === 'off';
  const desktop = window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches;

  return {
    tier,
    reducedMotion,
    hero3d: tier !== 'low' && !reducedMotion && !killSwitch,
    pinning: desktop && tier === 'high' && !reducedMotion,
    desktop,
  };
}

/** Detected once per mount; tiers do not change while a page is open */
export function useSiteTier(): SiteTier {
  const [tier] = useState(detectSiteTier);
  return tier;
}
