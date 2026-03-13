/**
 * Box Folding Animation Choreography
 * Calculates animation states based on fold percentage (0-100%)
 * Inspired by reference implementation with scroll-based folding
 */

import { AnimationState } from './realisticBoxGeometry';

/**
 * Maps fold percentage to complete animation state
 * @param percentage 0 = fully closed, 100 = fully open
 * @returns Complete animation state with opening angle and flap angles
 * 
 * Animation Choreography:
 * Opening (0% → 100%):
 *   0-45%: Box panels unfold/open
 *   45-60%: Width bottom flaps fold in
 *   60-75%: Length bottom flaps fold in
 *   75-90%: Width top flaps fold in
 *   90-100%: Length top flaps fold in (sealed)
 * 
 * Closing (100% → 0%): Reverse order
 *   100-90%: Length top flaps unfold
 *   90-75%: Width top flaps unfold
 *   75-60%: Length bottom flaps unfold
 *   60-45%: Width bottom flaps unfold
 *   45-0%: Box panels fold/close
 */
export function calculateFoldState(percentage: number): AnimationState {
  // Clamp percentage between 0 and 100
  const p = Math.max(0, Math.min(100, percentage));
  
  // Normalize to 0-1 range
  const t = p / 100;
  
  // Opening angle: animates from nearly closed (0.02π) to fully open (0.5π)
  // This happens FIRST (0-45%) so box opens before flaps fold
  const openingAngle = easeInOutCubic(Math.min(t / 0.45, 1)) * (0.5 * Math.PI - 0.02 * Math.PI) + 0.02 * Math.PI;
  
  // Flap angles choreography - happens AFTER box opens (45-100%)
  // Sequential folding: bottom flaps first, then top flaps
  const flapAngles = {
    backHalf: {
      width: {
        // Bottom width flaps: 45-60%
        bottom: calculateFlapAngle(t, 0.45, 0.60, 0.6 * Math.PI, easeInOutCubic),
        // Top width flaps: 75-90%
        top: calculateFlapAngle(t, 0.75, 0.90, 0.6 * Math.PI, easeInOutCubic),
      },
      length: {
        // Bottom length flaps: 60-75%
        bottom: calculateFlapAngle(t, 0.60, 0.75, 0.5 * Math.PI, easeInOutCubic),
        // Top length flaps: 85-100%
        top: calculateFlapAngle(t, 0.85, 1.0, 0.5 * Math.PI, easeInOutCubic),
      },
    },
    frontHalf: {
      width: {
        // Bottom width flaps: 45-60%
        bottom: calculateFlapAngle(t, 0.45, 0.60, 0.6 * Math.PI, easeInOutCubic),
        // Top width flaps: 75-90%
        top: calculateFlapAngle(t, 0.75, 0.90, 0.6 * Math.PI, easeInOutCubic),
      },
      length: {
        // Bottom length flaps: 60-75%
        bottom: calculateFlapAngle(t, 0.60, 0.75, 0.49 * Math.PI, easeInOutCubic),
        // Top length flaps: 90-100% (last to close)
        top: calculateFlapAngle(t, 0.90, 1.0, 0.49 * Math.PI, easeInOutCubic),
      },
    },
  };
  
  return {
    openingAngle,
    flapAngles,
  };
}

/**
 * Calculates individual flap angle with easing
 * @param t Overall timeline progress (0-1)
 * @param start Start point in timeline (0-1)
 * @param end End point in timeline (0-1)
 * @param maxAngle Maximum angle to reach
 * @param easingFn Easing function to apply
 * @returns Calculated angle in radians
 */
function calculateFlapAngle(
  t: number,
  start: number,
  end: number,
  maxAngle: number,
  easingFn: (t: number) => number = easeInOutCubic
): number {
  if (t < start) return 0;
  if (t > end) return maxAngle;
  
  // Normalize to 0-1 within the range
  const localT = (t - start) / (end - start);
  
  // Apply easing for smooth motion
  const eased = easingFn(localT);
  
  return eased * maxAngle;
}

/**
 * Ease-in-out cubic easing function
 * Smooth acceleration and deceleration
 */
function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Ease-out cubic easing function
 * Quick start, slow end
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Get human-readable fold state description
 */
export function getFoldStateDescription(percentage: number): string {
  if (percentage < 5) return 'Fully Closed 📦';
  if (percentage < 45) return 'Opening Box Panels...';
  if (percentage < 60) return 'Folding Bottom Flaps...';
  if (percentage < 75) return 'Securing Bottom...';
  if (percentage < 90) return 'Folding Top Flaps...';
  if (percentage < 98) return 'Sealing Box...';
  return 'Fully Open 📦';
}

/**
 * Preset fold states for quick access
 */
export const FOLD_PRESETS = {
  CLOSED: 0,
  QUARTER_OPEN: 25,
  HALF_OPEN: 50,
  THREE_QUARTER_OPEN: 75,
  FULLY_OPEN: 100,
} as const;
