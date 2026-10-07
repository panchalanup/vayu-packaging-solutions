/**
 * Packaging Finder input: 3-step wizard (Product, Size & weight, Handling & quantity) with a progress bar (§9.8).
 * SECURITY: all values are validated with zod before they reach the matching engine; they are only ever rendered
 * as text. Analytics events carry flags and bands, never the free-text product name.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useForm, Controller, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { UserInput } from '@/types/packaging';
import { useEventTracker } from '@/hooks/useAnalytics';
import { FINDER_DEFAULT_QTY } from '@/lib/finderPrefill';

/** Empty number inputs become undefined (not NaN, which zod rejects) */
const toNumber = (v: unknown): number | undefined => {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const optionalPositive = (max: number, message: string) => z.number({ invalid_type_error: message }).positive(message).max(max, message).optional();

const formSchema = z.object({
  product_name: z.string().trim().min(1, 'Tell us what you are packing').max(80, 'Keep it under 80 characters'),
  weight_kg: optionalPositive(1000, 'Enter a weight between 0 and 1000 kg'),
  length_mm: optionalPositive(5000, 'Enter a size up to 5000 mm'),
  width_mm: optionalPositive(5000, 'Enter a size up to 5000 mm'),
  height_mm: optionalPositive(5000, 'Enter a size up to 5000 mm'),
  fragility: z.enum(['Low', 'Medium', 'High', 'Unknown']),
  transport_type: z.string().min(1, 'Pick how it will be shipped'),
  quantity: z
    .number({ required_error: 'Enter a quantity', invalid_type_error: 'Enter a quantity' })
    .int('Whole numbers only')
    .min(1, 'Quantity must be at least 1')
    .max(1_000_000, 'For more than 10 lakh, talk to us'),
  priority: z.enum(['minimize_damage', 'balanced', 'minimize_cost']),
  max_price: optionalPositive(100000, 'Enter a price per unit in rupees'),
});

const STEPS: { title: string; hint: string; fields: FieldPath<UserInput>[] }[] = [
  { title: 'Product', hint: 'What are you packing?', fields: ['product_name', 'fragility'] },
  { title: 'Size & weight', hint: 'Optional, but it sharpens the match.', fields: ['weight_kg', 'length_mm', 'width_mm', 'height_mm'] },
  { title: 'Handling & quantity', hint: 'How it ships and how many.', fields: ['transport_type', 'quantity', 'priority', 'max_price'] },
];

const FRAGILITY = [
  { value: 'Low', note: 'Tools, canned goods' },
  { value: 'Medium', note: 'Books, clothing' },
  { value: 'High', note: 'Glass, ceramics, electronics' },
  { value: 'Unknown', note: 'Not sure' },
] as const;

const PRIORITIES = [
  { value: 'minimize_damage', label: 'Protect most' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'minimize_cost', label: 'Lowest cost' },
] as const;

const chipClass =
  'flex min-h-11 cursor-pointer flex-col justify-center rounded-lg border border-input px-3.5 py-2 text-sm transition-colors duration-quick peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background hover:border-foreground/40';

const inputClass = 'h-12 text-base';

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

interface InputFormProps {
  categories: string[];
  transportTypes: string[];
  onSubmit: (data: UserInput) => void;
  /** Pre-filled values from the Box Designer or the URL */
  defaults?: Partial<UserInput>;
  /** Called once, on the first interaction (finder_start) */
  onStart?: () => void;
  isLoading?: boolean;
}

export function InputForm({ categories, transportTypes, onSubmit, defaults, onStart, isLoading }: InputFormProps) {
  const [step, setStep] = useState(0);
  const { trackEvent } = useEventTracker();
  const started = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    control,
    formState: { errors },
  } = useForm<UserInput>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      fragility: 'Unknown',
      priority: 'balanced',
      quantity: FINDER_DEFAULT_QTY,
      transport_type: transportTypes.includes('Courier') ? 'Courier' : transportTypes[0] ?? '',
      ...defaults,
    },
  });

  // Move focus to the step heading after Next/Back so keyboard and screen-reader users land in the new step
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const markStarted = () => {
    if (started.current) return;
    started.current = true;
    onStart?.();
  };

  const err = (name: FieldPath<UserInput>) => (errors as Record<string, { message?: string } | undefined>)[name]?.message;
  const num = (name: FieldPath<UserInput>) => register(name, { setValueAs: toNumber });

  const fillExample = () => {
    markStarted();
    trackEvent('tool_use_example', { action: 'fill_example_data' });
    const opts = { shouldDirty: true } as const;
    setValue('product_name', 'Glass bottle', opts);
    setValue('weight_kg', 0.85, opts);
    setValue('length_mm', 320, opts);
    setValue('width_mm', 85, opts);
    setValue('height_mm', 85, opts);
    setValue('fragility', 'High', opts);
    setValue('transport_type', transportTypes.includes('Courier') ? 'Courier' : transportTypes[0] ?? '', opts);
    setValue('quantity', FINDER_DEFAULT_QTY, opts);
    setValue('priority', 'balanced', opts);
  };

  const next = async () => {
    if (await trigger(STEPS[step].fields, { shouldFocus: true })) setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const onValid = (data: UserInput) => {
    // No free text and no personal data in analytics: flags and bands only
    trackEvent('tool_get_recommendations', {
      fragility: data.fragility,
      transportType: data.transport_type,
      quantity: data.quantity,
      priority: data.priority,
      hasWeight: !!data.weight_kg,
      hasDimensions: !!(data.length_mm && data.width_mm && data.height_mm),
      hasMaxPrice: !!data.max_price,
    });
    onSubmit(data);
  };

  const onInvalid = (formErrors: Record<string, unknown>) => {
    const first = STEPS.findIndex((s) => s.fields.some((f) => f in formErrors));
    if (first >= 0) setStep(first);
  };

  const last = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <form
      noValidate
      onChange={markStarted}
      onSubmit={(e) => {
        // Enter in a field moves to the next step; only the last step submits
        if (!last) {
          e.preventDefault();
          void next();
          return;
        }
        void handleSubmit(onValid, onInvalid)(e);
      }}
      className="rounded-lg border border-border bg-background"
    >
      {/* Progress */}
      <div className="border-b border-border px-5 pb-4 pt-5 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <p className="label-mono text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </p>
          <button
            type="button"
            onClick={fillExample}
            className="link-draw text-sm font-semibold text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Try an example
          </button>
        </div>
        <div
          role="progressbar"
          aria-label="Packaging Finder progress"
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={step + 1}
          aria-valuetext={`Step ${step + 1} of ${STEPS.length}: ${current.title}`}
          className="mt-3 flex gap-1.5"
        >
          {STEPS.map((s, i) => (
            <span key={s.title} className={cn('h-1.5 flex-1 rounded-full transition-colors duration-base', i <= step ? 'bg-primary' : 'bg-foreground/15')} />
          ))}
        </div>
      </div>

      <div className="px-5 py-6 md:px-8 md:py-8">
        <h2 ref={headingRef} tabIndex={-1} className="font-display text-h3 outline-none">
          {current.title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{current.hint}</p>

        <div className="mt-6 space-y-6">
          {step === 0 && (
            <>
              <Field id="finder-product" label="Product name or category" error={err('product_name')} hint="For example: glass bottle, ceramic mug, LED bulb.">
                <Input
                  id="finder-product"
                  list="finder-categories"
                  autoComplete="off"
                  placeholder="e.g. glass bottle"
                  aria-invalid={!!err('product_name')}
                  aria-describedby={err('product_name') ? 'finder-product-error' : undefined}
                  className={inputClass}
                  {...register('product_name')}
                />
                <datalist id="finder-categories">
                  {categories.slice(0, 12).map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </Field>

              <fieldset>
                <legend className="mb-2 text-sm font-semibold">How fragile is it?</legend>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {FRAGILITY.map((f) => (
                    <label key={f.value} className="relative">
                      <input type="radio" value={f.value} className="peer sr-only" {...register('fragility')} />
                      <span className={chipClass}>
                        <span className="font-semibold">{f.value}</span>
                        <span className="text-xs opacity-80">{f.note}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          {step === 1 && (
            <>
              <Field id="finder-weight" label="Weight (kg)" error={err('weight_kg')} hint="One packed unit. Optional.">
                <Input id="finder-weight" type="number" inputMode="decimal" step="0.01" min="0" placeholder="e.g. 0.85" aria-invalid={!!err('weight_kg')} className={inputClass} {...num('weight_kg')} />
              </Field>
              <fieldset>
                <legend className="mb-1.5 text-sm font-semibold">
                  Product size, L × W × H in mm <span className="font-normal text-muted-foreground">(optional)</span>
                </legend>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      ['length_mm', 'Length', 'finder-l'],
                      ['width_mm', 'Width', 'finder-w'],
                      ['height_mm', 'Height', 'finder-h'],
                    ] as const
                  ).map(([name, label, id]) => (
                    <div key={name}>
                      <label htmlFor={id} className="sr-only">
                        {label} in mm
                      </label>
                      <Input id={id} type="number" inputMode="numeric" min="0" placeholder={label[0]} aria-invalid={!!err(name)} className={inputClass} {...num(name)} />
                    </div>
                  ))}
                </div>
                {(err('length_mm') || err('width_mm') || err('height_mm')) && (
                  <p role="alert" className="mt-1.5 text-sm text-destructive">
                    {err('length_mm') || err('width_mm') || err('height_mm')}
                  </p>
                )}
                <p className="mt-1.5 text-xs text-muted-foreground">With size and weight the match gets a higher confidence rating.</p>
              </fieldset>
            </>
          )}

          {step === 2 && (
            <>
              <Field id="finder-transport" label="How will it ship?" error={err('transport_type')}>
                {/* Controlled by react-hook-form so the chosen value is kept and shown */}
                <Controller
                  control={control}
                  name="transport_type"
                  render={({ field }) => (
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <SelectTrigger id="finder-transport" className="h-12 text-base" aria-invalid={!!err('transport_type')} onBlur={field.onBlur}>
                        <SelectValue placeholder="Select transport type" />
                      </SelectTrigger>
                      <SelectContent>
                        {transportTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field id="finder-qty" label="Quantity (boxes)" error={err('quantity')} hint="You can change this any time. Pricing improves with volume.">
                <Input
                  id="finder-qty"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  aria-invalid={!!err('quantity')}
                  aria-describedby={err('quantity') ? 'finder-qty-error' : undefined}
                  className={inputClass}
                  {...num('quantity')}
                />
              </Field>

              <fieldset>
                <legend className="mb-2 text-sm font-semibold">What matters most?</legend>
                <div className="grid grid-cols-3 gap-2">
                  {PRIORITIES.map((p) => (
                    <label key={p.value} className="relative">
                      <input type="radio" value={p.value} className="peer sr-only" {...register('priority')} />
                      <span className={cn(chipClass, 'items-center text-center')}>{p.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <Field id="finder-max" label="Maximum price per unit (₹)" error={err('max_price')} hint="Optional. We hide options above this.">
                <Input id="finder-max" type="number" inputMode="decimal" step="0.01" min="0" placeholder="e.g. 100" aria-invalid={!!err('max_price')} className={inputClass} {...num('max_price')} />
              </Field>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4 md:px-8">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back
          </button>
        ) : (
          <span />
        )}
        {last ? (
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors duration-quick hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
          >
            Find my packaging <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void next()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors duration-quick hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Next <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
