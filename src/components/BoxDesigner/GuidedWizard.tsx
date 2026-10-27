/**
 * Guided mode "Find my box" (#15): four quick questions and an optional product size, then a recommended style,
 * inside size, ply and flute with the reasons in plain words. One tap applies it (undoable).
 * The size uses the same fit rule as the fit checker (fit.ts).
 */

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import type { BoxDesign, BoxDimensions } from '@/types/boxDesigner';
import DesignerSheet from './DesignerSheet';
import BoxThumbnail from './BoxThumbnail';
import UnitDimensionField from './UnitDimensionField';
import {
  FRAGILITY_OPTIONS,
  PRODUCT_OPTIONS,
  SHIPPING_OPTIONS,
  TYPICAL_PRODUCT_SIZE,
  WizardAnswers,
  WizardRecommendation,
  recommendBox,
} from '@/lib/boxDesigner/wizard';
import { styleName } from '@/lib/boxDesigner/styleAvailability';
import { formatDimensions } from '@/lib/boxDesigner/units';
import { DUR, EASE } from '@/lib/motion/tokens';
import { DESIGNER_EVENTS, useDesignerTracker } from '@/lib/boxDesigner/funnel';

interface GuidedWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: BoxDesign;
  onApply: (rec: WizardRecommendation, answers: WizardAnswers) => void;
}

const STEPS = ['What', 'Weight', 'Journey', 'Size', 'Your box'] as const;
const WEIGHT_PRESETS = [0.5, 2, 5, 10, 20];

function Choice({ selected, label, hint, onClick }: { selected: boolean; label: string; hint: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex flex-col items-start rounded-xl border-2 px-3 py-2.5 text-left transition-colors duration-quick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      }`}
    >
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-xs text-muted-foreground">{hint}</span>
    </button>
  );
}

export default function GuidedWizard({ open, onOpenChange, current, onApply }: GuidedWizardProps) {
  const track = useDesignerTracker();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<WizardAnswers>({
    product: 'apparel',
    weightKg: 1,
    fragility: 'sturdy',
    shipping: 'courier',
    productSize: null,
  });
  const [knowSize, setKnowSize] = useState(false);
  const [size, setSize] = useState<BoxDimensions>(TYPICAL_PRODUCT_SIZE.apparel);
  const set = (patch: Partial<WizardAnswers>) => setAnswers((a) => ({ ...a, ...patch }));

  const final: WizardAnswers = useMemo(
    () => ({ ...answers, productSize: knowSize && [size.length, size.width, size.height].every((v) => v > 0) ? size : null }),
    [answers, knowSize, size]
  );
  const rec = useMemo(() => recommendBox(final), [final]);

  const close = (next: boolean) => {
    onOpenChange(next);
    if (!next) window.setTimeout(() => setStep(0), 300);
  };

  const body = (() => {
    switch (step) {
      case 0:
        return (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="What are you packing?">
            {PRODUCT_OPTIONS.map((p) => (
              <Choice
                key={p.id}
                selected={answers.product === p.id}
                label={p.label}
                hint={p.hint}
                onClick={() => {
                  set({ product: p.id });
                  setSize(TYPICAL_PRODUCT_SIZE[p.id]);
                  setStep(1);
                }}
              />
            ))}
          </div>
        );
      case 1:
        return (
          <div className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold">Weight of one packed item</span>
                <span className="text-lg font-semibold tabular">{answers.weightKg} kg</span>
              </div>
              <Slider
                min={0.1}
                max={40}
                step={0.1}
                value={[answers.weightKg]}
                onValueChange={([v]) => set({ weightKg: Math.round(v * 10) / 10 })}
                aria-label="Weight in kilograms"
              />
              <div className="flex flex-wrap gap-1.5">
                {WEIGHT_PRESETS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => set({ weightKg: w })}
                    className={`rounded-full border px-3 py-1 text-xs ${answers.weightKg === w ? 'border-primary bg-primary/10' : 'border-border hover:border-foreground/40'}`}
                  >
                    {w} kg
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-semibold">How delicate is it?</span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Fragility">
                {FRAGILITY_OPTIONS.map((f) => (
                  <Choice key={f.id} selected={answers.fragility === f.id} label={f.label} hint={f.hint} onClick={() => set({ fragility: f.id })} />
                ))}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label="How will it travel?">
            {SHIPPING_OPTIONS.map((s) => (
              <Choice
                key={s.id}
                selected={answers.shipping === s.id}
                label={s.label}
                hint={s.hint}
                onClick={() => {
                  set({ shipping: s.id });
                  setStep(3);
                }}
              />
            ))}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Do you know the product size?">
              <Choice selected={!knowSize} label="Use a typical size" hint="We will start from a common size for this product" onClick={() => setKnowSize(false)} />
              <Choice selected={knowSize} label="I know my product size" hint="We add padding and fit the box around it" onClick={() => setKnowSize(true)} />
            </div>
            {knowSize && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-3 gap-2">
                <UnitDimensionField label="Length" value={size.length} unit={current.unit} min={0.5} max={300} onCommit={(v) => setSize((s) => ({ ...s, length: v }))} />
                <UnitDimensionField label="Width" value={size.width} unit={current.unit} min={0.5} max={300} onCommit={(v) => setSize((s) => ({ ...s, width: v }))} />
                <UnitDimensionField label="Height" value={size.height} unit={current.unit} min={0.5} max={300} onCommit={(v) => setSize((s) => ({ ...s, height: v }))} />
              </motion.div>
            )}
            <p className="text-xs text-muted-foreground">Measure the product (or the product in its own pack) at its widest points.</p>
          </div>
        );
      default:
        return (
          <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
            <div className="mx-auto flex aspect-square w-32 items-center justify-center rounded-xl bg-paper-100 p-3 sm:w-auto sm:p-4">
              <BoxThumbnail style={rec.template} dimensions={rec.dimensions} colorHex={current.colorHex} className="h-full w-full" />
            </div>
            <div className="space-y-3">
              <div>
                <p className="label-mono text-muted-foreground">We recommend</p>
                <p className="font-display text-xl leading-tight">
                  {styleName(rec.template)} · {rec.ply} {rec.flutes.join('')}
                </p>
                <p className="text-sm tabular text-muted-foreground">Inside {formatDimensions(rec.dimensions, current.unit)}</p>
              </div>
              <ul className="space-y-1.5">
                {rec.reasons.map((r) => (
                  <li key={r} className="flex gap-2 text-sm">
                    <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">Indicative guidance. Our team confirms the board when you ask for a quote.</p>
            </div>
          </div>
        );
    }
  })();

  const last = step === STEPS.length - 1;

  return (
    <DesignerSheet open={open} onOpenChange={close} title="Find my box" description="Answer four quick questions and we will suggest the right box.">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              Step {step + 1} of {STEPS.length}: {STEPS[step]}
            </span>
          </div>
          <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5" />
        </div>

        <div className="min-h-[220px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: DUR.quick, ease: EASE.paper }}
            >
              {body}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
          <Button variant="ghost" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          {last ? (
            <Button
              onClick={() => {
                // Analytics: answers are enums only (no sizes, no text)
                track(DESIGNER_EVENTS.wizardDone, {
                  style: rec.template,
                  ply: rec.ply,
                  product: final.product,
                  fragility: final.fragility,
                  shipping: final.shipping,
                  sized: !!final.productSize,
                });
                onApply(rec, final);
                close(false);
              }}
            >
              <Sparkles className="mr-1.5 h-4 w-4" /> Use this box
            </Button>
          ) : (
            <Button onClick={() => setStep((s) => s + 1)}>
              {step === STEPS.length - 2 ? 'See my box' : 'Next'} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </DesignerSheet>
  );
}
