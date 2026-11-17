/**
 * "Know the price." The visitor's own box from the hero, priced by the designer's real estimate engine at the four
 * quantity tiers. Pick a quantity and the per-box price rolls to its new value while four bars show the price falling
 * as quantity grows. Always labelled indicative (ex-GST, ex-delivery): it is a talking point that leads to an exact quote.
 */

import { useId, useMemo } from 'react';
import { Cta } from '@/components/site/Cta';
import { QUANTITY_TIERS, estimatePrice } from '@/lib/boxDesigner/pricing';
import { getStyle } from '@/lib/boxDesigner/styles';
import { useEventTracker } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';
import { AnimatedNumber } from '@/components/fx/Numbers';
import { Magnetic } from '@/components/fx/pointerFx';
import { SplitWords } from '@/components/fx/SplitWords';
import { Reveal } from '../Reveal';
import { useShowcaseDesign } from '../stageContext';

const rupees = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const rupeesWhole = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export default function PriceScene() {
  const { boxDesign, design, spec, setSpec } = useShowcaseDesign();
  const { trackEvent } = useEventTracker();
  // the quantity is shared with the other scenes (the container load and the recap use it too)
  const index = Math.max(0, QUANTITY_TIERS.findIndex((q) => q === spec.quantity));
  const labelId = useId();

  const estimates = useMemo(() => QUANTITY_TIERS.map((q) => estimatePrice({ ...boxDesign, quantity: q })), [boxDesign]);
  const current = estimates[index];
  const tallest = Math.max(...estimates.map((e) => e.perBox));
  const { length, width, height } = design.dims;
  const href = `/box-designer?${new URLSearchParams({ style: design.template, l: String(length), w: String(width), h: String(height) }).toString()}`;

  return (
    <section aria-labelledby="price-h" className="relative overflow-hidden bg-ink-900 py-20 text-paper-50 lg:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-1/2 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full bg-green-400/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-content items-center gap-12 px-4 md:px-6 lg:grid-cols-2 lg:gap-20 lg:px-10">
        <div>
          <SplitWords as="h2" id="price-h" text="Price it." className="font-display text-[clamp(2.8rem,7vw,6.2rem)] leading-[0.92] tracking-tight text-paper-50" />
          <Reveal className="mt-7">
            <p className="label-mono text-paper-muted">
              {getStyle(design.template).shortName} · {Math.round(length * 10)} × {Math.round(width * 10)} × {Math.round(height * 10)} mm
            </p>
          </Reveal>

          <Reveal className="mt-8" rise={20}>
            <p id={labelId} className="label-mono mb-3 text-paper-muted">
              Quantity
            </p>
            <div role="radiogroup" aria-labelledby={labelId} className="flex flex-wrap gap-2">
              {QUANTITY_TIERS.map((q, i) => (
                <button
                  key={q}
                  type="button"
                  role="radio"
                  aria-checked={index === i}
                  onClick={() => {
                    setSpec({ quantity: QUANTITY_TIERS[i] });
                    trackEvent('experience_price_tier', { quantity: q });
                  }}
                  className={cn(
                    'tabular min-h-12 min-w-[5.5rem] rounded-full border px-5 text-base font-semibold transition-[background-color,border-color,color,transform] duration-quick ease-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 active:scale-95',
                    index === i ? 'border-green-400 bg-green-400 text-ink-900' : 'border-paper-50/25 text-paper-100 hover:border-paper-50/60'
                  )}
                >
                  {q.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal className="mt-8" rise={20}>
            <Magnetic>
              <Cta id="experience.price.quote" intent="designer" href={href} size="lg" arrow>
                Get the exact price
              </Cta>
            </Magnetic>
            <p className="mt-3 text-xs text-paper-muted">Indicative, ex-GST and delivery. The exact quote follows.</p>
          </Reveal>
        </div>

        <Reveal rise={28}>
          <div className="rounded-3xl border border-paper-50/10 bg-ink-800/80 p-6 sm:p-8">
            <p className="label-mono text-paper-muted">Per box</p>
            <p className="tabular mt-2 flex items-baseline gap-2 font-display text-[clamp(3.4rem,9vw,7rem)] leading-none text-green-400">
              <AnimatedNumber value={current.perBox} format={rupees} />
            </p>
            <p className="tabular mt-3 text-paper-100/80">
              Order total about <AnimatedNumber value={current.total} format={rupeesWhole} className="font-semibold text-paper-50" />
            </p>

            {/* the price falls as the quantity grows */}
            <div className="mt-8 flex h-36 items-end gap-3" aria-hidden="true">
              {estimates.map((e, i) => (
                <div key={e.quantity} className="flex h-full flex-1 flex-col justify-end">
                  <div className="relative flex-1">
                    <div
                      className={cn('absolute inset-x-0 bottom-0 origin-bottom rounded-t-lg transition-[transform,background-color] duration-700 ease-paper', i === index ? 'bg-green-400' : 'bg-paper-50/20')}
                      style={{ height: '100%', transform: `scaleY(${Math.max(0.12, e.perBox / tallest)})` }}
                    />
                  </div>
                  <span className={cn('label-mono mt-2 text-center transition-colors duration-base', i === index ? 'text-green-400' : 'text-paper-muted')}>{e.quantity.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
