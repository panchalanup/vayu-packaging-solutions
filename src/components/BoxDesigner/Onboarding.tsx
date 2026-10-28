/**
 * First-visit coach marks (#18): three short steps over the 3D view (spin it, tap a face, get a quote).
 * Each step also completes when the user simply does it. Dismissible, remembered per browser, never shown to
 * people who arrive with a shared or restored design. Motion respects prefers-reduced-motion (MotionConfig).
 */

import { RefObject, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Hand, MousePointerClick, Receipt, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ONBOARDING_STEPS,
  OnboardingStepId,
  advanceOnboarding,
  hasSeenOnboarding,
  markOnboardingSeen,
} from '@/lib/boxDesigner/onboarding';
import { useEventTracker } from '@/hooks/useAnalytics';
import { DUR, EASE } from '@/lib/motion/tokens';

const ICONS: Record<OnboardingStepId, typeof Hand> = { rotate: Hand, face: MousePointerClick, quote: Receipt };

interface OnboardingProps {
  /** Only start on a fresh visit with a working 3D view */
  enabled: boolean;
  /** The canvas area (drag detection for the "rotate" step) */
  canvasRef: RefObject<HTMLElement>;
  faceSelected: boolean;
}

export default function Onboarding({ enabled, canvasRef, faceSelected }: OnboardingProps) {
  const { trackEvent } = useEventTracker();
  const [step, setStep] = useState<number | null>(null);
  const stepRef = useRef(step);
  stepRef.current = step;

  // Start shortly after the 3D view appears
  useEffect(() => {
    if (!enabled || hasSeenOnboarding()) return;
    const timer = window.setTimeout(() => setStep(0), 1400);
    return () => window.clearTimeout(timer);
  }, [enabled]);

  const finish = (how: 'done' | 'skipped') => {
    trackEvent('designer_onboarding', { result: how, step: stepRef.current ?? ONBOARDING_STEPS.length });
    markOnboardingSeen(how);
    setStep(null);
  };

  const act = (action: 'next' | OnboardingStepId) => {
    const current = stepRef.current;
    if (current === null) return;
    const next = advanceOnboarding(current, action);
    if (next === null) finish('done');
    else setStep(next);
  };

  // "Spin it": a real drag on the canvas completes the step
  useEffect(() => {
    const el = canvasRef.current;
    if (!el || step !== 0) return;
    let start: { x: number; y: number } | null = null;
    const down = (e: PointerEvent) => (start = { x: e.clientX, y: e.clientY });
    const move = (e: PointerEvent) => {
      if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 40) {
        start = null;
        window.setTimeout(() => act('rotate'), 500);
      }
    };
    const up = () => (start = null);
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    // act reads refs only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, step]);

  // "Make it yours": selecting a face completes the step
  useEffect(() => {
    if (faceSelected && step === 1) act('face');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faceSelected, step]);

  const current = step !== null ? ONBOARDING_STEPS[step] : null;
  const Icon = current ? ICONS[current.id] : Hand;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex justify-center px-3 md:top-16">
    <AnimatePresence>
      {current && (
        <motion.div
          key="coach"
          role="dialog"
          aria-label="Quick tour"
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: DUR.base, ease: EASE.paper }}
          className="pointer-events-auto relative w-full max-w-[22rem] rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur md:top-16"
        >
          <button
            type="button"
            onClick={() => finish('skipped')}
            aria-label="Close the tour"
            className="absolute right-2 top-2 rounded-md p-1.5 text-muted-foreground hover:bg-foreground/5"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex gap-3">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current.id}
                initial={{ rotate: -12, scale: 0.8, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </motion.div>
            </AnimatePresence>
            <div className="min-w-0 pr-4">
              <p className="font-semibold leading-tight">{current.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{current.body}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-1.5" aria-hidden="true">
              {ONBOARDING_STEPS.map((s, i) => (
                <span key={s.id} className={`h-1.5 rounded-full transition-all duration-base ${i === step ? 'w-5 bg-primary' : 'w-1.5 bg-foreground/20'}`} />
              ))}
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => finish('skipped')}>
                Skip
              </Button>
              <Button size="sm" onClick={() => act('next')}>
                {step === ONBOARDING_STEPS.length - 1 ? 'Got it' : 'Next'}
              </Button>
            </div>
          </div>
          <span className="sr-only" aria-live="polite">
            Step {(step ?? 0) + 1} of {ONBOARDING_STEPS.length}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  );
}
