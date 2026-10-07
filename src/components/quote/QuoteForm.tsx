/**
 * QuoteForm (§7.3): 3 steps, used on Home (S9), /quote and /contact.
 * SECURITY: drafts live in sessionStorage only and are cleared on submit; a honeypot and a minimum fill time
 * filter bots; the server re-validates everything. Analytics events never include personal data.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useForm, type FieldPath, type UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useEventTracker } from '@/hooks/useAnalytics';
import { DUR, EASE } from '@/lib/motion/tokens';
import { FACTS } from '@/content/facts';
import { whatsappHref } from '@/lib/contactLinks';
import { submitContactForm } from '@/lib/googleSheets';
import {
  INTENTS,
  LABELS,
  NEED_BY,
  PRINTING,
  PRODUCTS,
  QTY_BANDS,
  formatQuoteForSheet,
  quoteSchema,
  type QuoteData,
  type QuoteInput,
} from '@/lib/quoteSchema';
import { WhatsAppIcon } from '@/components/site/Decor';

const DRAFT_KEY = 'vayu.quote.draft';

const STEPS: { title: string; fields: FieldPath<QuoteInput>[] }[] = [
  { title: 'What do you need?', fields: ['intent', 'product', 'qty', 'l', 'w', 'h', 'printing'] },
  { title: 'Where and when?', fields: ['city', 'needBy', 'notes'] },
  { title: 'How do we reach you?', fields: ['name', 'company', 'phone', 'whatsapp', 'email', 'gstin'] },
];

const FIELD_LABELS: Partial<Record<FieldPath<QuoteInput>, string>> = {
  product: 'Product',
  qty: 'Quantity',
  l: 'Length',
  w: 'Width',
  h: 'Height',
  name: 'Name',
  phone: 'Mobile',
  email: 'Email',
  gstin: 'GSTIN',
};

function readDraft(): Partial<QuoteInput> {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return {};
    const parsed = quoteSchema.partial().safeParse(JSON.parse(raw));
    return parsed.success ? (parsed.data as Partial<QuoteInput>) : {};
  } catch {
    return {};
  }
}

interface ChipGroupProps {
  name: FieldPath<QuoteInput>;
  legend: string;
  options: readonly string[];
  labels: Record<string, string>;
  register: UseFormRegister<QuoteInput>;
  error?: string;
  idPrefix: string;
}

/** Native radios styled as chips: arrow keys and screen readers work without extra code */
function ChipGroup({ name, legend, options, labels, register, error, idPrefix }: ChipGroupProps) {
  const errorId = `${idPrefix}-${name}-error`;
  return (
    <fieldset aria-describedby={error ? errorId : undefined} aria-invalid={!!error}>
      <legend className="mb-2 text-sm font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option} className="relative">
            <input type="radio" value={option} {...register(name)} className="peer sr-only" />
            <span className="flex min-h-11 cursor-pointer items-center rounded-md border border-input px-3.5 text-sm transition-colors duration-quick peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background hover:border-foreground/40">
              {labels[option]}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  'h-12 w-full rounded-md border border-input bg-transparent px-3 text-base placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive';

export interface QuoteFormProps {
  /** Unique per instance so ids never clash */
  idPrefix: string;
  prefill?: Partial<QuoteInput>;
  defaultIntent?: QuoteInput['intent'];
  className?: string;
}

export default function QuoteForm({ idPrefix, prefill, defaultIntent = 'quote', className }: QuoteFormProps) {
  const { trackEvent } = useEventTracker();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [sizeUnknown, setSizeUnknown] = useState(false);
  const [submittedName, setSubmittedName] = useState('');
  const [summaryErrors, setSummaryErrors] = useState<string[]>([]);
  const startedAt = useRef(Date.now());
  const honeypot = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const defaults = useMemo<Partial<QuoteInput>>(
    () => ({ intent: defaultIntent, whatsapp: true, ...readDraft(), ...prefill }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    getValues,
    getFieldState,
    formState: { errors },
  } = useForm<QuoteInput, unknown, QuoteData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: defaults,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    trackEvent('quote_view', { intent: defaults.intent, product: defaults.product, src: defaults.src });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Session-only draft so a refresh or a back-navigation doesn't lose answers
  useEffect(() => {
    let timer = 0;
    const sub = watch((values) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        try {
          sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values));
        } catch {
          /* storage full or disabled: drafts are optional */
        }
      }, 300);
    });
    return () => {
      window.clearTimeout(timer);
      sub.unsubscribe();
    };
  }, [watch]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, status]);

  const errorText = (name: FieldPath<QuoteInput>) => {
    const err = (errors as Record<string, { message?: string } | undefined>)[name];
    return err?.message;
  };

  const goNext = async () => {
    const ok = await trigger(STEPS[step].fields, { shouldFocus: true });
    if (!ok) {
      const failed = STEPS[step].fields.filter((f) => getFieldState(f).invalid);
      failed.forEach((field) => trackEvent('quote_error', { field, step: step + 1 }));
      return;
    }
    trackEvent('quote_step_complete', { step: step + 1 });
    setDirection(1);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  };

  const onValid = async (data: QuoteData) => {
    setSummaryErrors([]);
    setStatus('sending');
    const payload = { ...data, website: honeypot.current?.value ?? '', elapsedMs: Date.now() - startedAt.current };
    try {
      let response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      // `vite dev` has no serverless functions; fall back to the legacy sheet call locally only
      if (import.meta.env.DEV && response.status === 404) {
        const legacy = await submitContactForm(formatQuoteForSheet(data));
        response = new Response(null, { status: legacy.success ? 200 : 502 });
      }
      if (!response.ok) throw new Error(String(response.status));
      trackEvent('quote_submit', { intent: data.intent, product: data.product, qtyBand: data.qty, src: data.src ?? 'direct' });
      sessionStorage.removeItem(DRAFT_KEY);
      setSubmittedName(data.name.split(' ')[0]);
      setStatus('done');
    } catch {
      trackEvent('quote_error', { field: 'submit', step: 3 });
      setStatus('error');
    }
  };

  const onInvalid = (formErrors: Record<string, unknown>) => {
    const fields = Object.keys(formErrors) as FieldPath<QuoteInput>[];
    setSummaryErrors(fields.map((f) => FIELD_LABELS[f] ?? f));
    fields.forEach((field) => trackEvent('quote_error', { field, step: 3 }));
    const firstStep = STEPS.findIndex((s) => s.fields.some((f) => fields.includes(f)));
    if (firstStep >= 0 && firstStep !== step) setStep(firstStep);
  };

  const product = watch('product');
  const qty = watch('qty');
  const waFollowUp = whatsappHref(
    `Hi Vayu, I just sent a quote request on your website${product ? ` for ${LABELS.product[product]}` : ''}${
      qty ? `, ${LABELS.qty[qty]} boxes` : ''
    }.`
  );

  if (status === 'done') {
    return (
      <div className={cn('rounded-lg border border-border p-6 md:p-8', className)} role="status">
        <CheckCircle2 aria-hidden="true" className="mb-4 h-10 w-10 text-primary" />
        <h3 ref={headingRef} tabIndex={-1} className="font-display text-h3 outline-none">
          Thanks{submittedName ? `, ${submittedName}` : ''}. We&apos;ll reply on WhatsApp within {FACTS.replySla}.
        </h3>
        <p className="mt-2 text-muted-foreground">Want to add photos or drawings? Send them on WhatsApp.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={waFollowUp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('whatsapp_click', { id: `${idPrefix}.success.whatsapp`, page: window.location.pathname })}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            <WhatsAppIcon className="h-4 w-4" /> Continue on WhatsApp<span className="sr-only"> (opens WhatsApp)</span>
          </a>
          <Link to="/" className="inline-flex min-h-11 items-center rounded-lg border border-foreground/20 px-5 text-sm font-semibold">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const id = (name: string) => `${idPrefix}-${name}`;
  const described = (name: FieldPath<QuoteInput>) => (errorText(name) ? `${id(name)}-error` : undefined);

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onValid, onInvalid)}
      className={cn('rounded-lg border border-border', className)}
      aria-labelledby={id('heading')}
    >
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 md:px-6">
        <ol className="flex gap-4 text-sm" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li key={s.title} aria-current={i === step ? 'step' : undefined} className={cn('flex items-center gap-1.5', i === step ? 'font-semibold' : 'text-muted-foreground')}>
              <span className={cn('flex h-6 w-6 items-center justify-center rounded-full border text-xs tabular', i <= step ? 'border-primary bg-primary text-primary-foreground' : 'border-border')}>
                {i + 1}
              </span>
              <span className="hidden sm:inline">{['What', 'Where & when', 'You'][i]}</span>
            </li>
          ))}
        </ol>
        <p className="label-mono text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>

      {summaryErrors.length > 0 && (
        <div role="alert" className="mx-5 mt-5 rounded-md border border-destructive/40 p-3 text-sm text-destructive md:mx-6">
          Please check: {summaryErrors.join(', ')}.
        </div>
      )}

      <div className="overflow-hidden px-5 py-6 md:px-6">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: 24 * direction }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 * direction, transition: { duration: DUR.base * 0.7, ease: EASE.exit } }}
            transition={{ duration: DUR.base, ease: EASE.paper }}
            className="space-y-6"
          >
            <h3 id={id('heading')} ref={headingRef} tabIndex={-1} className="font-display text-h3 outline-none">
              {STEPS[step].title}
            </h3>

            {step === 0 && (
              <>
                <ChipGroup idPrefix={idPrefix} name="intent" legend="I'd like a" options={INTENTS} labels={LABELS.intent} register={register} />
                <ChipGroup idPrefix={idPrefix} name="product" legend="Product" options={PRODUCTS} labels={LABELS.product} register={register} error={errorText('product')} />
                <ChipGroup idPrefix={idPrefix} name="qty" legend="Quantity (boxes)" options={QTY_BANDS} labels={LABELS.qty} register={register} error={errorText('qty')} />
                <fieldset>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <legend className="text-sm font-semibold">
                      Inside size, L × W × H in mm <span className="font-normal text-muted-foreground">(optional)</span>
                    </legend>
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={sizeUnknown}
                        onChange={(e) => {
                          setSizeUnknown(e.target.checked);
                          if (e.target.checked) (['l', 'w', 'h'] as const).forEach((k) => setValue(k, ''));
                        }}
                        className="h-4 w-4 accent-[hsl(var(--primary))]"
                      />
                      Not sure, help me
                    </label>
                  </div>
                  {!sizeUnknown && (
                    <div className="grid grid-cols-3 gap-2">
                      {(['l', 'w', 'h'] as const).map((k) => (
                        <div key={k}>
                          <label htmlFor={id(k)} className="sr-only">
                            {FIELD_LABELS[k]} in mm
                          </label>
                          <input
                            id={id(k)}
                            type="number"
                            inputMode="numeric"
                            min={10}
                            max={5000}
                            placeholder={k.toUpperCase()}
                            aria-invalid={!!errorText(k)}
                            aria-describedby={described(k)}
                            className={inputClass}
                            {...register(k)}
                          />
                          {errorText(k) && (
                            <p id={`${id(k)}-error`} className="mt-1 text-xs text-destructive">
                              {errorText(k)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </fieldset>
                <ChipGroup idPrefix={idPrefix} name="printing" legend="Printing" options={PRINTING} labels={LABELS.printing} register={register} />
              </>
            )}

            {step === 1 && (
              <>
                <Field id={id('city')} label="Delivery city or PIN code" hint="Optional. Helps us confirm transit time.">
                  <input id={id('city')} autoComplete="address-level2" className={inputClass} {...register('city')} />
                </Field>
                <ChipGroup idPrefix={idPrefix} name="needBy" legend="Needed by" options={NEED_BY} labels={LABELS.needBy} register={register} />
                <Field id={id('notes')} label="Anything else? (optional)" error={errorText('notes')}>
                  <textarea
                    id={id('notes')}
                    rows={3}
                    maxLength={600}
                    placeholder="Product weight, stacking, print details…"
                    className={cn(inputClass, 'h-auto py-3')}
                    {...register('notes')}
                  />
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id={id('name')} label="Name" error={errorText('name')}>
                    <input id={id('name')} autoComplete="name" aria-invalid={!!errorText('name')} aria-describedby={described('name')} className={inputClass} {...register('name')} />
                  </Field>
                  <Field id={id('company')} label="Company (optional)">
                    <input id={id('company')} autoComplete="organization" className={inputClass} {...register('company')} />
                  </Field>
                </div>
                <Field id={id('phone')} label="Mobile" error={errorText('phone')}>
                  <div className="flex">
                    <span className="flex h-12 items-center rounded-l-md border border-r-0 border-input px-3 text-sm text-muted-foreground">+91</span>
                    <input
                      id={id('phone')}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      aria-invalid={!!errorText('phone')}
                      aria-describedby={described('phone')}
                      className={cn(inputClass, 'rounded-l-none')}
                      {...register('phone')}
                    />
                  </div>
                </Field>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4 accent-[hsl(var(--primary))]" {...register('whatsapp')} />
                  Reply on WhatsApp
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id={id('email')} label="Email (optional)" error={errorText('email')}>
                    <input id={id('email')} type="email" autoComplete="email" aria-invalid={!!errorText('email')} aria-describedby={described('email')} className={inputClass} {...register('email')} />
                  </Field>
                  <Field id={id('gstin')} label="GSTIN (optional)" error={errorText('gstin')}>
                    <input id={id('gstin')} autoCapitalize="characters" maxLength={15} aria-invalid={!!errorText('gstin')} aria-describedby={described('gstin')} className={cn(inputClass, 'uppercase')} {...register('gstin')} />
                  </Field>
                </div>
                {/* VERIFY-LATER[LEGAL-01]: link a privacy notice page (DPDP Act 2023) once it exists */}
                <p className="text-xs text-muted-foreground">
                  We use these details only to reply to this request. No spam, no sharing.
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Honeypot: hidden from people and assistive tech, bots tend to fill it */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={id('website')}>Website</label>
          <input id={id('website')} ref={honeypot} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>
      </div>

      {status === 'error' && (
        <div role="alert" className="mx-5 mb-4 rounded-md border border-destructive/40 p-3 text-sm md:mx-6">
          We couldn&apos;t send that. Please try again, or{' '}
          <a href={whatsappHref(`Hi Vayu, I'd like a quote${getValues('product') ? ` for ${LABELS.product[getValues('product') as QuoteInput['product']]}` : ''}.`)} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
            message us on WhatsApp
          </a>
          .
        </div>
      )}

      <div className="sticky bottom-0 flex items-center justify-between gap-3 rounded-b-lg border-t border-border bg-background px-5 py-4 md:static md:px-6">
        {step > 0 ? (
          <button type="button" onClick={goBack} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold hover:bg-foreground/5">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back
          </button>
        ) : (
          <p className="text-xs text-muted-foreground">
            MOQ {FACTS.moqBoxes} · {FACTS.samplePolicy}
          </p>
        )}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Next <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={status === 'sending'}
            className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
          >
            {status === 'sending' && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
            Send request
          </button>
        )}
      </div>
    </form>
  );
}
