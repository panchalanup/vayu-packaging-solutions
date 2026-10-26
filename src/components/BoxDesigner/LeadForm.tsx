/**
 * "Send my design to Vayu" (#2, #6): a short enquiry that carries the spec, a share link and a small preview.
 * Posts through the existing quote path (/api/quote -> lead sheet + admin CRM). No sign-up.
 * SECURITY: validated with the same zod schema the server uses; a honeypot and fill time keep bots out.
 * PRIVACY: analytics get style / ply / quantity slab only, never the name, phone, email or note.
 */

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { WhatsAppIcon } from '@/components/site/Decor';
import type { BoxDesign } from '@/types/boxDesigner';
import { designerLeadFormSchema, type DesignerLeadFormInput } from '@/lib/designerLeadSchema';
import { MIN_FILL_MS } from '@/lib/quoteSchema';
import { submitContactForm } from '@/lib/googleSheets';
import { formatDesignerLeadForSheet } from '@/lib/designerLeadSchema';
import { encodeShareHash } from '@/lib/boxDesigner/designCodec';
import { getBoardSpec } from '@/lib/boxDesigner/boardSpecs';
import { countPrintColours, formatRupees, tierFor, type Estimate } from '@/lib/boxDesigner/pricing';
import { formatDimensions } from '@/lib/boxDesigner/units';
import { previewDataUrl } from '@/lib/boxDesigner/leadPreview';
import { DESIGNER_EVENTS, designProps, useDesignerTracker } from '@/lib/boxDesigner/funnel';
import { whatsappHref } from '@/lib/contactLinks';
import { formatShareMessage } from '@/lib/boxDesigner/shareUtils';
import { FACTS } from '@/content/facts';
import { cn } from '@/lib/utils';

interface LeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  design: BoxDesign;
  estimate: Estimate;
  capture: () => Promise<Blob | null>;
  /** Pre-fill from the delivery checker */
  place?: string;
}

const inputClass =
  'h-11 w-full rounded-md border border-input bg-white px-3 text-base focus:outline-none focus:ring-2 focus:ring-primary aria-[invalid=true]:border-destructive md:text-sm';

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

export default function LeadForm({ open, onOpenChange, design, estimate, capture, place }: LeadFormProps) {
  const track = useDesignerTracker();
  const startedAt = useRef(Date.now());
  const honeypot = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [firstName, setFirstName] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DesignerLeadFormInput>({
    resolver: zodResolver(designerLeadFormSchema),
    mode: 'onBlur',
    defaultValues: { name: '', phone: '', email: '', quantity: design.quantity, place: place ?? '', sample: false, note: '' },
  });

  // Each time it opens: fresh timer, current quantity and place
  useEffect(() => {
    if (!open) return;
    startedAt.current = Date.now();
    setValue('quantity', design.quantity);
    if (place) setValue('place', place);
    if (status !== 'sending') setStatus('idle');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/box-designer${encodeShareHash(design)}` : '';

  const onValid = async (values: DesignerLeadFormInput) => {
    setStatus('sending');
    const form = designerLeadFormSchema.parse(values);
    const board = getBoardSpec(design.ply, design.flutes);
    const mm = (cm: number) => Math.round(cm * 10);
    const preview = await previewDataUrl(await capture().catch(() => null));
    const lead = {
      kind: 'designer' as const,
      ...form,
      spec: {
        style: design.template,
        l: mm(design.dimensions.length),
        w: mm(design.dimensions.width),
        h: mm(design.dimensions.height),
        unit: design.unit,
        ply: design.ply,
        flutes: board.flutes.join(''),
        colour: design.colorHex,
        finish: design.finish,
        printColours: countPrintColours(design),
        images: design.faceImages.length,
        texts: design.textElements.length,
        name: design.name,
      },
      estimate: { perBox: estimate.perBox, low: estimate.low, high: estimate.high, total: estimate.total },
      shareUrl: shareUrl.length <= 9000 ? shareUrl : '',
      preview,
    };
    // Bots fill fast; people need a moment. Wait so a quick human never trips the server's check.
    const elapsed = Date.now() - startedAt.current;
    if (elapsed < MIN_FILL_MS) await new Promise((r) => setTimeout(r, MIN_FILL_MS - elapsed));

    try {
      let response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, website: honeypot.current?.value ?? '', elapsedMs: Date.now() - startedAt.current }),
      });
      // `vite dev` has no serverless functions; fall back to the legacy sheet call locally only
      if (import.meta.env.DEV && response.status === 404) {
        const legacy = await submitContactForm(formatDesignerLeadForSheet(lead));
        response = new Response(null, { status: legacy.success ? 200 : 502 });
      }
      if (!response.ok) throw new Error(String(response.status));
      track(DESIGNER_EVENTS.leadSubmit, { ...designProps(design), qtyTier: tierFor(form.quantity), sample: form.sample });
      setFirstName(form.name.split(' ')[0]);
      setStatus('done');
      reset({ name: '', phone: '', email: '', quantity: form.quantity, place: form.place, sample: false, note: '' });
    } catch {
      setStatus('error');
    }
  };

  const waHref = whatsappHref(formatShareMessage(design, shareUrl.length <= 9000 ? shareUrl : undefined));
  const sample = watch('sample');
  const errId = (name: keyof DesignerLeadFormInput) => (errors[name] ? `lead-${name}-error` : undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] max-w-lg overflow-y-auto">
        {status === 'done' ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 py-2" role="status">
            <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
              <CheckCircle2 className="h-12 w-12 text-primary" aria-hidden="true" />
            </motion.div>
            <DialogHeader className="text-left">
              <DialogTitle className="font-display text-2xl">Thanks{firstName ? `, ${firstName}` : ''}! Your design is with us.</DialogTitle>
              <DialogDescription>We usually reply within {FACTS.replySla} ({FACTS.businessHours}).</DialogDescription>
            </DialogHeader>
            <ol className="space-y-2 text-sm">
              {[
                'We check the size, board and print on your design.',
                `We send a firm quote${sample ? ' and arrange your sample' : ''}.`,
                'You approve a proof, then we make and dispatch your boxes.',
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
              >
                <WhatsAppIcon className="h-4 w-4" /> Add photos on WhatsApp
              </a>
              <Button variant="outline" className="min-h-11" onClick={() => onOpenChange(false)}>
                Back to my design
              </Button>
            </div>
          </motion.div>
        ) : (
          <>
            <DialogHeader className="text-left">
              <DialogTitle className="font-display text-2xl">Send my design to Vayu</DialogTitle>
              <DialogDescription>
                {formatDimensions(design.dimensions, design.unit)} · {design.ply} · est. {formatRupees(estimate.low)}–{formatRupees(estimate.high)} per box.
                We attach the spec, a link and a preview image.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onValid)} noValidate className="space-y-3">
              <Field id="lead-name" label="Your name" error={errors.name?.message}>
                <input id="lead-name" autoComplete="name" className={inputClass} aria-invalid={!!errors.name} aria-describedby={errId('name')} {...register('name')} />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field id="lead-phone" label="Mobile" error={errors.phone?.message}>
                  <input id="lead-phone" type="tel" inputMode="tel" autoComplete="tel" className={inputClass} aria-invalid={!!errors.phone} aria-describedby={errId('phone')} {...register('phone')} />
                </Field>
                <Field id="lead-email" label="Email (optional)" error={errors.email?.message}>
                  <input id="lead-email" type="email" autoComplete="email" className={inputClass} aria-invalid={!!errors.email} aria-describedby={errId('email')} {...register('email')} />
                </Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field id="lead-quantity" label="Quantity" error={errors.quantity?.message} hint={`Usual minimum ${FACTS.moqBoxes} boxes`}>
                  <input id="lead-quantity" inputMode="numeric" className={inputClass} aria-invalid={!!errors.quantity} aria-describedby={errId('quantity')} {...register('quantity')} />
                </Field>
                <Field id="lead-place" label="City or pincode" error={errors.place?.message}>
                  <input id="lead-place" autoComplete="postal-code" className={inputClass} {...register('place')} />
                </Field>
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
                <Checkbox checked={!!sample} onCheckedChange={(v) => setValue('sample', v === true)} aria-label="Send me a sample first" className="mt-0.5" />
                <span className="text-sm">
                  <span className="font-semibold">Send me a sample first</span>
                  <span className="block text-xs text-muted-foreground">{FACTS.samplePolicy}.</span>
                </span>
              </label>
              <Field id="lead-note" label="Anything else? (optional)" error={errors.note?.message}>
                <Textarea id="lead-note" rows={3} maxLength={600} placeholder="Product, deadline, print colours…" {...register('note')} />
              </Field>

              {/* Honeypot: hidden from people, filled by bots */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="lead-website">Website</label>
                <input id="lead-website" ref={honeypot} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
              </div>

              {status === 'error' && (
                <p role="alert" className="rounded-md border border-destructive/40 p-3 text-sm text-destructive">
                  That did not go through. Please try again, or{' '}
                  <a href={waHref} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                    send it on WhatsApp
                  </a>
                  .
                </p>
              )}

              <Button type="submit" size="lg" className={cn('w-full min-h-12')} disabled={status === 'sending'}>
                {status === 'sending' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Send my design
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                No sign-up. We only use your details to reply about this design.{' '}
                <a href={waHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-foreground underline">
                  Prefer WhatsApp?
                </a>
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
