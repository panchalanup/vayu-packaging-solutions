/**
 * Four scenes of the /experience film that do real work: Size it (the designer's fit checker), Test it (its strength
 * estimate), Stack it (the CBM / container tool) and Make it (send the finished spec to Vayu). They share one design
 * (useShowcaseDesign), so the size chosen in the first changes the test, the price, the container load and the recap.
 * Few words; the visuals and the numbers explain. Every figure is indicative and labelled so.
 */

import { Suspense, lazy, useMemo, useState } from 'react';
import { Check, Send } from 'lucide-react';
import BoxThumbnail from '@/components/BoxDesigner/BoxThumbnail';
import { Cta } from '@/components/site/Cta';
import { PLY_OPTIONS } from '@/lib/boxDesigner/constants';
import { estimatePrice } from '@/lib/boxDesigner/pricing';
import { getStyle } from '@/lib/boxDesigner/styles';
import { CONTAINERS } from '@/lib/tools/cbm';
import { FACTS } from '@/content/facts';
import { pageWhatsAppMessage, whatsappHref } from '@/lib/contactLinks';
import { useEventTracker } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';
import { AnimatedNumber } from '../fx/Numbers';
import { Magnetic } from '../fx/pointerFx';
import { SplitWords } from '../fx/SplitWords';
import { useInView } from '../fx/useInView';
import { Reveal } from '../Reveal';
import { useShowcaseDesign } from '../stageContext';
import BoardLayers from '../visuals/BoardLayers';
import ContainerViz from '../visuals/ContainerViz';
import CrushTest from '../visuals/CrushTest';
import IsoBox from '../visuals/IsoBox';
import { PRODUCTS, boardTest, loadingFor, sizeFor } from './sceneLogic';

const LeadForm = lazy(() => import('@/components/BoxDesigner/LeadForm'));

const headline = 'font-display text-[clamp(3.2rem,10vw,8rem)] leading-[0.9] tracking-tight text-paper-50';
const wrap = 'mx-auto max-w-content px-4 md:px-6 lg:px-10';
const chip = (on: boolean) =>
  cn(
    'min-h-11 rounded-full border px-4 text-sm font-semibold transition-[background-color,border-color,color,transform] duration-quick ease-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 active:scale-95',
    on ? 'border-green-400 bg-green-400 text-ink-900' : 'border-paper-50/25 text-paper-100 hover:border-paper-50/60'
  );
const mm = (cm: number) => Math.round(cm * 10);
const num = (n: number) => String(Math.round(n));

// ------------------------------------------------------------------------------------------------------------------

export function SizeScene() {
  const { setDesign } = useShowcaseDesign();
  const { trackEvent } = useEventTracker();
  const [productId, setProductId] = useState('mug');
  const [fragile, setFragile] = useState<boolean | undefined>(undefined);
  const [applied, setApplied] = useState(false);
  const r = useMemo(() => sizeFor(productId, fragile), [productId, fragile]);
  const isFragile = fragile ?? r.product.fragile;

  return (
    <section aria-labelledby="size-h" className="overflow-hidden bg-ink-950 py-20 text-paper-50 lg:py-32">
      <div className={cn(wrap, 'grid items-center gap-10 lg:grid-cols-2 lg:gap-16')}>
        <div>
          <SplitWords as="h2" id="size-h" text="Size it." className={headline} />
          <Reveal className="mt-8" rise={20}>
            <p className="label-mono mb-3 text-paper-muted">What are you shipping?</p>
            <div role="radiogroup" aria-label="Product" className="flex flex-wrap gap-2">
              {PRODUCTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={productId === p.id}
                  onClick={() => {
                    setProductId(p.id);
                    setFragile(undefined);
                    setApplied(false);
                    trackEvent('experience_size_product', { product: p.id });
                  }}
                  className={chip(productId === p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isFragile}
              onClick={() => {
                setFragile(!isFragile);
                setApplied(false);
              }}
              className="mt-4 flex min-h-11 items-center gap-3 rounded-full pr-2 text-sm font-medium text-paper-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <span className={cn('relative h-6 w-11 rounded-full transition-colors duration-quick', isFragile ? 'bg-green-400' : 'bg-paper-50/25')}>
                <span className={cn('absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-paper-50 transition-transform duration-quick ease-paper', isFragile && 'translate-x-5')} />
              </span>
              Fragile
            </button>
          </Reveal>

          <Reveal className="mt-8" rise={20}>
            <p className="label-mono text-paper-muted">Box inside size, mm</p>
            <p className="tabular mt-2 flex flex-wrap items-baseline gap-x-3 font-display text-[clamp(2.4rem,6vw,4.4rem)] leading-none text-green-400">
              <AnimatedNumber value={mm(r.inside.length)} format={num} />
              <span className="text-paper-muted">×</span>
              <AnimatedNumber value={mm(r.inside.width)} format={num} />
              <span className="text-paper-muted">×</span>
              <AnimatedNumber value={mm(r.inside.height)} format={num} />
            </p>
            <p className="mt-3 text-sm text-paper-100/80">
              {r.paddingCm} cm of cushioning each side{r.suggestedPly ? ` · ${r.suggestedPly} board` : ''}
            </p>
            <button
              type="button"
              onClick={() => {
                setDesign({ dims: r.inside });
                setApplied(true);
                trackEvent('experience_size_apply', { product: productId });
              }}
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-lg bg-paper-50 px-6 text-base font-semibold text-ink-900 transition-[background-color,transform] duration-quick ease-paper hover:bg-paper-100 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              {applied ? <Check aria-hidden="true" className="h-4 w-4 text-green-700" /> : null}
              {applied ? 'Used for the rest of the page' : 'Use this size'}
            </button>
          </Reveal>
        </div>

        <Reveal rise={28}>
          <div className="rounded-3xl border border-paper-50/10 bg-ink-900 p-4 sm:p-6">
            <IsoBox box={r.inside} product={r.product.dims} className="h-auto w-full" label={`A ${r.product.label.toLowerCase()} inside a ${mm(r.inside.length)} by ${mm(r.inside.width)} by ${mm(r.inside.height)} millimetre box`} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------------------------------------------------------

export function BoardScene() {
  const { boxDesign, spec, setSpec } = useShowcaseDesign();
  const { trackEvent } = useEventTracker();
  const [ref, seen] = useInView<HTMLDivElement>(0.45);
  const test = useMemo(() => boardTest(boxDesign, spec.ply), [boxDesign, spec.ply]);
  const play = `${spec.ply}-${mm(boxDesign.dimensions.length)}-${mm(boxDesign.dimensions.width)}-${mm(boxDesign.dimensions.height)}`;

  return (
    <section aria-labelledby="board-h" className="overflow-hidden bg-ink-900 py-20 text-paper-50 lg:py-32">
      <div className={cn(wrap, 'grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16')}>
        <div>
          <SplitWords as="h2" id="board-h" text="Test it." className={headline} />
          <Reveal className="mt-8" rise={20}>
            <p className="label-mono mb-3 text-paper-muted">Board</p>
            <div role="radiogroup" aria-label="Board" className="flex flex-wrap gap-2">
              {PLY_OPTIONS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={spec.ply === p.id}
                  onClick={() => {
                    setSpec({ ply: p.id });
                    trackEvent('experience_board_ply', { ply: p.id });
                  }}
                  className={chip(spec.ply === p.id)}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p className="tabular font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-none text-green-400">
                  <AnimatedNumber value={test.stackHigh} format={num} />
                </p>
                <p className="label-mono mt-2 text-paper-muted">Safe to stack high</p>
              </div>
              <div>
                <p className="tabular font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-none">
                  <AnimatedNumber value={test.safeKg} format={num} />
                  <span className="ml-1 text-lg text-paper-muted">kg</span>
                </p>
                <p className="label-mono mt-2 text-paper-muted">Safe load</p>
              </div>
            </div>
            <div className="mt-8 max-w-sm">
              <BoardLayers key={spec.ply} liners={test.liners} flutes={test.flutes} label={`Cross-section of ${spec.ply} board: ${test.liners} liners and ${test.flutes} flutes`} />
              <p className="label-mono mt-3 text-paper-muted">
                {test.liners} liners · {test.flutes} {test.flutes === 1 ? 'flute' : 'flutes'} · {test.caliperMm} mm
              </p>
            </div>
          </Reveal>
        </div>

        <div ref={ref} className="rounded-3xl border border-paper-50/10 bg-ink-950 p-5 pt-6 sm:p-8">
          {seen ? (
            <CrushTest play={play} failKg={test.failKg} safeKg={test.safeKg} label={`Compression test: this box is expected to fail at about ${test.failKg} kilograms`} />
          ) : (
            <div className="aspect-[480/380]" aria-hidden="true" />
          )}
          <p className="mt-4 text-xs text-paper-muted">Indicative estimate from board and size. Test a sample before a full order.</p>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------------------------------------------------------

export function StackScene() {
  const { boxDesign, spec } = useShowcaseDesign();
  const { trackEvent } = useEventTracker();
  const [containerId, setContainerId] = useState<(typeof CONTAINERS)[number]['id']>('20ft');
  const [ref, seen] = useInView<HTMLDivElement>(0.4);
  const view = useMemo(() => loadingFor(boxDesign, containerId, spec.quantity), [boxDesign, containerId, spec.quantity]);

  return (
    <section aria-labelledby="stack-h" className="overflow-hidden bg-ink-950 py-20 text-paper-50 lg:py-32">
      <div className={cn(wrap, 'grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16')}>
        <div>
          <SplitWords as="h2" id="stack-h" text="Stack it." className={headline} />
          <Reveal className="mt-8" rise={20}>
            <p className="label-mono mb-3 text-paper-muted">Container</p>
            <div role="radiogroup" aria-label="Container" className="flex flex-wrap gap-2">
              {CONTAINERS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={containerId === c.id}
                  onClick={() => {
                    setContainerId(c.id);
                    trackEvent('experience_stack_container', { container: c.id });
                  }}
                  className={chip(containerId === c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>
            {view && (
              <>
                <p className="tabular mt-8 font-display text-[clamp(3.4rem,9vw,7rem)] leading-none text-green-400">
                  <AnimatedNumber value={view.perContainer} format={(n) => Math.round(n).toLocaleString('en-IN')} />
                </p>
                <p className="label-mono mt-2 text-paper-muted">Boxes in one {view.container.name} container</p>
                <dl className="mt-6 grid max-w-sm grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <dt className="label-mono text-paper-muted">Per pallet</dt>
                    <dd className="tabular mt-1 text-lg font-semibold">{view.cartonsPerPallet.toLocaleString('en-IN')}</dd>
                  </div>
                  <div>
                    <dt className="label-mono text-paper-muted">Each box</dt>
                    <dd className="tabular mt-1 text-lg font-semibold">{view.cbmPerCarton.toFixed(3)} CBM</dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs text-paper-muted">Estimate: layers of identical boxes. Confirm with your freight forwarder.</p>
              </>
            )}
          </Reveal>
        </div>

        <div ref={ref} className="rounded-3xl border border-paper-50/10 bg-ink-900 p-4 sm:p-6">
          {seen && view ? (
            <ContainerViz view={view} label={`A ${view.container.name} container filled with your boxes, about ${view.perContainer} of them`} />
          ) : (
            <div className="aspect-[640/380]" aria-hidden="true" />
          )}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------------------------------------------------------

export function MakeScene() {
  const { boxDesign, design, spec } = useShowcaseDesign();
  const { trackEvent } = useEventTracker();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const estimate = useMemo(() => estimatePrice(boxDesign), [boxDesign]);
  const { length, width, height } = design.dims;

  return (
    <section aria-labelledby="make-h" className="relative overflow-hidden bg-ink-900 py-20 text-paper-50 lg:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-1/3 h-[32rem] w-[32rem] rounded-full bg-green-400/10 blur-3xl" />
      <div className={cn(wrap, 'relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16')}>
        <div>
          <SplitWords as="h2" id="make-h" text="Make it." className={headline} />
          <Reveal className="mt-8 flex flex-wrap items-center gap-3" rise={20}>
            <Magnetic>
              <button
                type="button"
                onClick={() => {
                  setMounted(true);
                  setOpen(true);
                  trackEvent('experience_make_open', { style: design.template, ply: spec.ply, quantity: spec.quantity });
                }}
                className="inline-flex min-h-14 items-center gap-2 rounded-lg bg-green-400 px-7 text-lg font-semibold text-ink-900 transition-[background-color,transform] duration-quick ease-paper hover:bg-green-400/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
              >
                <Send aria-hidden="true" className="h-5 w-5" />
                Send this to Vayu
              </button>
            </Magnetic>
            <Cta id="experience.make.whatsapp" intent="whatsapp" variant="whatsapp" size="lg" href={whatsappHref(pageWhatsAppMessage('/box-designer', 'a custom box design'))} className="border-paper-50/30 text-paper-50 hover:bg-paper-50/10">
              WhatsApp
            </Cta>
          </Reveal>
          <p className="mt-5 text-sm text-paper-muted">
            Reply within {FACTS.replySla} · minimum order {FACTS.moqBoxes} boxes
          </p>
        </div>

        <Reveal rise={28}>
          <div className="rounded-3xl border border-paper-50/10 bg-ink-800/80 p-6 sm:p-8">
            <div className="flex items-center gap-5">
              <BoxThumbnail style={design.template} dimensions={design.dims} colorHex={design.colorHex} className="h-28 w-28 shrink-0 sm:h-36 sm:w-36" title="" />
              <div className="min-w-0">
                <p className="label-mono text-paper-muted">Your box</p>
                <p className="mt-1 font-display text-2xl leading-tight">{getStyle(design.template).shortName}</p>
                <p className="tabular mt-1 text-paper-100/80">
                  {mm(length)} × {mm(width)} × {mm(height)} mm
                </p>
              </div>
            </div>
            <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-paper-50/10 pt-5">
              <div>
                <dt className="label-mono text-paper-muted">Board</dt>
                <dd className="mt-1 font-semibold">{spec.ply}</dd>
              </div>
              <div>
                <dt className="label-mono text-paper-muted">Quantity</dt>
                <dd className="tabular mt-1 font-semibold">{spec.quantity.toLocaleString('en-IN')}</dd>
              </div>
              <div>
                <dt className="label-mono text-paper-muted">Per box</dt>
                <dd className="tabular mt-1 font-semibold text-green-400">
                  <AnimatedNumber value={estimate.perBox} format={(n) => `₹${n.toFixed(2)}`} />
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-paper-muted">Indicative, ex-GST and delivery. Pick the size, board and quantity above and this updates.</p>
          </div>
        </Reveal>
      </div>

      {mounted && (
        <Suspense fallback={null}>
          <LeadForm open={open} onOpenChange={setOpen} design={boxDesign} estimate={estimate} capture={async () => null} />
        </Suspense>
      )}
    </section>
  );
}
