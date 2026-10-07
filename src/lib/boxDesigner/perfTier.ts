/**
 * Performance tiers for the 3D view
 * Picks render quality from cheap device hints so low-end GPUs, phones and software renderers stay smooth.
 * A manual override is available via ?quality=high|medium|low (useful for testing and support).
 */

export type PerfTier = 'high' | 'medium' | 'low';

export interface TierSettings {
  /** Upper bound for devicePixelRatio */
  maxDpr: number;
  /** Cast real-time shadows from the key light */
  shadows: boolean;
  /** Shadow map resolution (per side) */
  shadowMapSize: number;
}

export const TIER_SETTINGS: Record<PerfTier, TierSettings> = {
  high: { maxDpr: 2, shadows: true, shadowMapSize: 2048 },
  medium: { maxDpr: 1.5, shadows: true, shadowMapSize: 1024 },
  low: { maxDpr: 1, shadows: false, shadowMapSize: 512 },
};

const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render|offscreen/i;

export interface TierHints {
  /** WEBGL_debug_renderer_info UNMASKED_RENDERER_WEBGL string, if available */
  renderer?: string;
  isMobile?: boolean;
  /** navigator.deviceMemory (GB), Chromium only */
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

/** Choose a tier from device hints. Unknown hints never downgrade a desktop to "low". */
export function detectPerfTier(hints: TierHints): PerfTier {
  if (hints.renderer && SOFTWARE_RENDERER.test(hints.renderer)) return 'low';
  if (hints.isMobile) return 'medium';
  if (hints.deviceMemory !== undefined && hints.deviceMemory <= 2) return 'low';
  if (
    (hints.deviceMemory !== undefined && hints.deviceMemory <= 4) ||
    (hints.hardwareConcurrency !== undefined && hints.hardwareConcurrency <= 4)
  ) {
    return 'medium';
  }
  return 'high';
}

/** Parse a ?quality= override. Only the three known values are accepted (input comes from the URL). */
export function parseTierOverride(search: string): PerfTier | null {
  const value = new URLSearchParams(search).get('quality');
  return value === 'high' || value === 'medium' || value === 'low' ? value : null;
}
