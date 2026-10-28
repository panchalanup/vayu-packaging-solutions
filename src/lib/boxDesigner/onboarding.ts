/**
 * First-visit coach marks: three short steps, shown once per browser and dismissible at any point.
 */

import { browserStore, readString, writeString, KeyValueStore } from './localStore';

export const ONBOARDING_KEY = 'vayu-box-designer:onboarded';

export type OnboardingStepId = 'rotate' | 'face' | 'quote';

export interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  body: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 'rotate', title: 'Spin it around', body: 'Drag the box to turn it. Pinch or scroll to zoom.' },
  { id: 'face', title: 'Make it yours', body: 'Tap any side of the box to add your logo or text.' },
  { id: 'quote', title: 'Get it made', body: 'Happy with it? Tap “Quote” at the top and we will price it for you.' },
];

export function hasSeenOnboarding(store: KeyValueStore | null = browserStore()): boolean {
  // No storage: never nag on every visit, treat as seen
  if (!store) return true;
  return readString(ONBOARDING_KEY, store) != null;
}

export function markOnboardingSeen(how: 'done' | 'skipped', store: KeyValueStore | null = browserStore()): void {
  writeString(ONBOARDING_KEY, how, store);
}

/**
 * Advance when the user does what a step asks (rotating the view, selecting a face). Returns the next step index,
 * or null when the tour is finished.
 */
export function advanceOnboarding(current: number, action: 'next' | OnboardingStepId): number | null {
  const step = ONBOARDING_STEPS[current];
  if (!step) return null;
  if (action !== 'next' && action !== step.id) return current;
  return current + 1 < ONBOARDING_STEPS.length ? current + 1 : null;
}
