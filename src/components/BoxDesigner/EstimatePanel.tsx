/**
 * Price & order tab: live indicative estimate with quantity slabs (#1, #4), strength verdict (#22), delivery days
 * (#5), board saved (#27), trust strip (#17), "Send my design to Vayu" (#2) and Packaging Finder prefill (#3).
 * Every figure here is indicative and labelled so.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Leaf, MapPin, Send, ShieldCheck, Truck, Weight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cta } from '@/components/site/Cta';
import type { BoxDesign } from '@/types/boxDesigner';
import { PLY_OPTIONS } from '@/lib/boxDesigner/constants';
import { estimatePrice, estimateTiers, formatRupees, QUANTITY_TIERS, tierFor } from '@/lib/boxDesigner/pricing';
import { assessStrength, type StrengthRating } from '@/lib/boxDesigner/strength';
import { estimateDelivery, jobTypeOf } from '@/lib/boxDesigner/delivery';
import { boardSaving } from '@/lib/boxDesigner/sustainability';
import { formatDimensions } from '@/lib/boxDesigner/units';
import { finderHrefFromDesign } from '@/lib/finderPrefill';
import { DESIGNER_EVENTS, designProps, useDesignerTracker } from '@/lib/boxDesigner/funnel';
import { FACTS } from '@/content/facts';
import { cn } from '@/lib/utils';
import LeadForm from './LeadForm';
import TrustStrip from './TrustStrip';

type Update = (patch: Partial<BoxDesign> | ((d: BoxDesign) => Partial<BoxDesign>), key?: string) => void;

interface EstimatePanelProps {
  design: BoxDesign;
  update: Update;
  capture: () => Promise<Blob | null>;
  /** /quote?... link from the page (allow-listed values only) */
  quoteHref?: string;
}

const RATING_STYLE: Record<StrengthRating, { label: string; className: string }> = {
  overloaded: { label: 'Too light', className: 'bg-error-700/10 text-error-700 border-error-700/30' },
  light: { label: 'Light duty', className: 'bg-warning-700/10 text-warning-700 border-warning-700/30' },
  good: { label: 'Good', className: 'bg-primary/10 text-primary border-primary/30' },
  strong: { label: 'Strong', className: 'bg-green-700/10 text-green-700 border-green-700/30' },
};

const fmtQty = (n: number) => n.toLocaleString('en-IN');

export default function EstimatePanel({ design, update, capture, quoteHref }: EstimatePanelProps) {
  const track = useDesignerTracker();
  const [leadOpen, setLeadOpen] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [weight, setWeight] = useState('');
  const [place, setPlace] = useState('');
  const [qtyText, setQtyText] = useState(String(design.quantity));
  useEffect(() => setQtyText(String(design.quantity)), [design.quantity]);

  useEffect(() => {
    track(DESIGNER_EVENTS.estimateView, designProps(design));
    // Once per visit to the tab
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const estimate = useMemo(() => estimatePrice(design), [design]);
  const tiers = useMemo(() => estimateTiers(design), [design]);
  const weightKg = weight.trim() === '' ? undefined : Number(weight.replace(',', '.'));
  const strength = useMemo(() => assessStrength(design, weightKg), [design, weightKg]);
  const delivery = useMemo(() => estimateDelivery(place, jobTypeOf(design)), [place, design]);
  const saving = useMemo(() => boardSaving(design), [design]);
  const activeTier = tierFor(design.quantity);

  const setQuantity = (q: number) => update({ quantity: Math.min(1_000_000, Math.max(1, Math.round(q))) }, 'quantity');
  const commitQty = () => {
    const n = Number(qtyText.replace(/[,\s]/g, ''));
    if (Number.isFinite(n) && n >= 1) setQuantity(n);
    else setQtyText(String(design.quantity));
  };

  const openLead = () => {
    track(DESIGNER_EVENTS.leadOpen, designProps(design));
    setLeadOpen(true);
  };

  const switchPly = (ply: BoxDesign['ply']) => {
    const option = PLY_OPTIONS.find((p) => p.id === ply);
    if (option) update({ ply: option.id, flutes: option.flutes[0] });
  };

  return (
    <div className="space-y-4">
      {/* Live estimate */}
      <Card className="overflow-hidden">
        <div className="space-y-3 bg-ink-900 p-4 text-paper-50">
          <div className="flex items-center justify-between">
            <span className="label-mono text-[11px] text-paper-muted">Instant estimate</span>
            <span className="rounded-full border border-paper-50/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-paper-muted">
              Indicative
            </span>
          </div>
          <div aria-live="polite">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={`${estimate.low}-${estimate.high}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="font-display text-3xl leading-none"
              >
                {formatRupees(estimate.low)}–{formatRupees(estimate.high)}
                <span className="ml-1 text-sm font-normal text-paper-muted">per box</span>
              </motion.p>
            </AnimatePresence>
            <p className="mt-1 text-sm text-paper-muted">
              About {formatRupees(estimate.total, 0)} for {fmtQty(estimate.quantity)} boxes · ex-GST, ex-delivery
            </p>
          </div>
        </div>

        <div className="space-y-3 p-4">
          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Quantity</p>
            <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Quantity slab">
              {tiers.map(({ tier, estimate: e }) => {
                const active = tier === activeTier && QUANTITY_TIERS.includes(design.quantity as (typeof QUANTITY_TIERS)[number]);
                return (
                  <button
                    key={tier}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setQuantity(tier)}
                    className={cn(
                      'rounded-lg border-2 px-1 py-2 text-center transition-all duration-quick active:scale-95',
                      active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    )}
                  >
                    <span className="block text-sm font-semibold">{fmtQty(tier)}</span>
                    <span className="block text-[11px] text-muted-foreground">{formatRupees(e.perBox)}</span>
                  </button>
                );
              })}
            </div>
            <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              Or exactly
              <input
                inputMode="numeric"
                value={qtyText}
                onChange={(e) => setQtyText(e.target.value.replace(/[^0-9,]/g, '').slice(0, 9))}
                onBlur={commitQty}
                onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
                aria-label="Exact quantity"
                className="h-8 w-24 rounded-md border border-border bg-white px-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              boxes
            </label>
            {design.quantity < FACTS.moqBoxes && (
              <p className="mt-1 text-xs text-warning-700">Below our usual {FACTS.moqBoxes}-box minimum: short runs cost more per box.</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowBreakdown((v) => !v)}
            aria-expanded={showBreakdown}
            className="flex items-center gap-1 text-xs font-semibold text-primary"
          >
            How we worked this out <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', showBreakdown && 'rotate-180')} />
          </button>
          {showBreakdown && (
            <dl className="space-y-1 rounded-lg bg-paper-100 p-3 text-xs">
              {[
                ['Board area (flat blank)', `${estimate.areaM2.toFixed(3)} m²`],
                ['Board', formatRupees(estimate.breakdown.board)],
                [`Print (${estimate.colours} colour${estimate.colours === 1 ? '' : 's'})`, formatRupees(estimate.breakdown.print)],
                ['Gloss finish', formatRupees(estimate.breakdown.finish)],
                ['Making (slot, glue, bundle)', formatRupees(estimate.breakdown.conversion)],
                ['Plates / die, spread over the order', formatRupees(estimate.breakdown.setupPerBox)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
              <p className="pt-1 text-muted-foreground">
                Per box before the quantity factor. Final price after we confirm paper grades, print and quantity.
              </p>
            </dl>
          )}

          <Button size="lg" className="min-h-12 w-full" onClick={openLead}>
            <Send className="mr-2 h-4 w-4" /> Send my design to Vayu
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={finderHrefFromDesign(design)}>
                Compare options <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
            {quoteHref ? (
              <Cta id="designer.estimate.quote" intent="designer" variant="secondary" href={quoteHref} className="min-h-9 px-3 text-xs">
                Full quote form
              </Cta>
            ) : (
              <span />
            )}
          </div>
        </div>
      </Card>

      {/* Strength */}
      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" /> How strong is it?
          </h3>
          <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-semibold', RATING_STYLE[strength.rating].className)}>
            {RATING_STYLE[strength.rating].label}
          </span>
        </div>
        <p className="text-sm font-medium" aria-live="polite">
          {strength.headline}
        </p>
        <p className="text-xs text-muted-foreground">{strength.detail}</p>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Weight className="h-3.5 w-3.5" aria-hidden="true" /> Each box weighs
          <input
            inputMode="decimal"
            value={weight}
            placeholder={String(strength.maxContentKg)}
            onChange={(e) => setWeight(e.target.value.replace(/[^0-9.,]/g, '').slice(0, 6))}
            aria-label="Weight of one packed box in kg"
            className="h-8 w-16 rounded-md border border-border bg-white px-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          kg
        </label>
        {strength.suggestPly && strength.suggestPly !== design.ply && (
          <Button variant="outline" size="sm" className="w-full" onClick={() => switchPly(strength.suggestPly!)}>
            Switch to {strength.suggestPly}
          </Button>
        )}
        <p className="text-[11px] text-muted-foreground">
          Indicative (McKee estimate, safety factor included). Real strength depends on paper grade and humidity.
        </p>
      </Card>

      {/* Delivery */}
      <Card className="space-y-3 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Truck className="h-4 w-4 text-primary" aria-hidden="true" /> When could it arrive?
        </h3>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            value={place}
            onChange={(e) => setPlace(e.target.value.slice(0, 60))}
            placeholder="City or pincode, e.g. Surat or 395003"
            aria-label="Delivery city or pincode"
            className="h-10 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div aria-live="polite" className="text-sm">
          <p className="font-medium">{delivery.label}</p>
          <p className="text-xs text-muted-foreground">
            {delivery.match.kind === 'city' && `${delivery.match.city.name}: ${delivery.match.transitLabel.toLowerCase()} in transit after ${delivery.production[0]}–${delivery.production[1]} days to make.`}
            {delivery.match.kind === 'gujarat' && `Elsewhere in Gujarat: about ${delivery.match.transitLabel} in transit.`}
            {delivery.match.kind === 'india' && `Outside our Gujarat network: about ${delivery.match.transitLabel} by transport.`}
            {delivery.match.kind === 'unknown' && 'Add your city or pincode for door-to-door days.'} Indicative, from order confirmation.
          </p>
        </div>
      </Card>

      {/* Sustainability */}
      <Card className="space-y-2 border-green-700/20 bg-green-700/5 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Leaf className="h-4 w-4 text-green-700" aria-hidden="true" /> Lighter on material
        </h3>
        <p className="text-sm">
          {saving.standard === null
            ? 'Made to measure, so no oversized box and less void fill.'
            : saving.isStandard
              ? `This is a common size (${formatDimensions(saving.standard, design.unit)}).`
              : saving.savedPct > 0
                ? `About ${saving.savedPct}% less board per box than the next common size (${formatDimensions(saving.standard, design.unit)}).`
                : `Close to the common size ${formatDimensions(saving.standard, design.unit)}.`}
        </p>
        <p className="text-xs text-muted-foreground">
          Corrugated board is paper: flatten it and put it in paper/cardboard recycling. Remove plastic tape first.
        </p>
      </Card>

      <TrustStrip compact />

      <LeadForm open={leadOpen} onOpenChange={setLeadOpen} design={design} estimate={estimate} capture={capture} place={place} />
    </div>
  );
}
