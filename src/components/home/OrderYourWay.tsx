/** S7 "Order your way": three ways to start, how an order runs, and what drives price */

import { motion } from 'framer-motion';
import { Section } from '@/components/site/Section';
import { Cta } from '@/components/site/Cta';
import { FACTS } from '@/content/facts';
import { whatsappHref, pageWhatsAppMessage } from '@/lib/contactLinks';
import { DUR, EASE, STAGGER } from '@/lib/motion/tokens';
import { DielinePoster } from './hero/Posters';
import { BoardCrossSection } from './BoardCrossSection';

// VERIFY-LATER[FACT-15]: per-stage durations are placeholders until the owner confirms them
const ORDER_STEPS = [
  { title: 'Enquire', time: 'Same day' },
  { title: 'Approve spec / sample', time: '2–3 days' },
  { title: 'Produce or source', time: '5–7 days' },
  { title: 'Dispatch', time: `${FACTS.dispatchHours} hrs*` },
];

const PRICE_DRIVERS = [
  { label: 'Ply / wall', weight: 0.8 },
  { label: 'Board area', weight: 1 },
  { label: 'Print colours', weight: 0.4 },
  { label: 'Quantity', weight: 0.6, note: 'more = lower per box' },
];

export default function OrderYourWay() {
  const tile = 'flex flex-col rounded-[14px] border border-border p-6';
  return (
    <Section name="ordering" aria-labelledby="ordering-heading" className="section-y">
      <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
        <header className="grid gap-4 lg:grid-cols-12 lg:gap-10">
          <p className="label-mono text-muted-foreground lg:col-span-5">06 — Ordering</p>
          <h2 id="ordering-heading" className="font-display text-h2 lg:col-span-7">
            Start the way that suits you.
          </h2>
        </header>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <div className={tile}>
            <p className="label-mono text-muted-foreground">Talk to us</p>
            <p className="mt-3 text-h3 font-bold">WhatsApp or call</p>
            <p className="mt-2 text-muted-foreground">Reply within {FACTS.replySla}.</p>
            <div className="mt-auto pt-6">
              <Cta id="home.ordering.whatsapp" intent="whatsapp" href={whatsappHref(pageWhatsAppMessage('/'))} arrow>
                WhatsApp us
              </Cta>
            </div>
          </div>
          {/* VERIFY-LATER[IMG-06]: replace the illustrations with real screenshots of the Finder and Designer */}
          <div className={tile}>
            <p className="label-mono text-muted-foreground">Packaging Finder</p>
            <div className="mt-4 rounded-lg bg-ink-900 p-3" aria-hidden="true">
              <BoardCrossSection ply="5-ply" animate={false} className="w-full" />
            </div>
            <p className="mt-4 text-muted-foreground">Get a spec and a price range in 2 minutes.</p>
            <div className="mt-auto pt-6">
              <Cta id="home.ordering.finder" intent="finder" variant="secondary" href="/compare-quote" arrow>
                Find my box spec
              </Cta>
            </div>
          </div>
          <div data-theme="ink" className={`${tile} border-transparent`}>
            <p className="label-mono text-paper-muted">3D Box Designer</p>
            <div className="mt-4 rounded-lg bg-ink-800 p-4" aria-hidden="true">
              <DielinePoster className="h-28 w-full" />
            </div>
            <p className="mt-4 text-paper-muted">Design, preview and share. Free, no sign-up.</p>
            <div className="mt-auto pt-6">
              <Cta id="home.ordering.designer" intent="designer" href="/box-designer" arrow>
                Design in 3D
              </Cta>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <div>
            <h3 className="label-mono text-muted-foreground">How an order runs</h3>
            <ol className="mt-6 grid grid-cols-2 gap-y-6 sm:grid-cols-4">
              {ORDER_STEPS.map((s, i) => (
                <li key={s.title} className="relative pr-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-900 text-sm font-semibold tabular">
                    {i + 1}
                  </span>
                  {i < ORDER_STEPS.length - 1 && (
                    <motion.span
                      aria-hidden="true"
                      className="absolute left-10 right-2 top-4 hidden h-px origin-left bg-ink-900/30 sm:block"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: DUR.slow, ease: EASE.paper, delay: i * STAGGER * 3 }}
                    />
                  )}
                  <p className="mt-3 font-semibold">{s.title}</p>
                  <p className="text-sm text-muted-foreground">{s.time}</p>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="label-mono text-muted-foreground">What drives your price</h3>
              <p className="text-xs text-muted-foreground">MOQ {FACTS.moqBoxes} · GST invoice</p>
            </div>
            <ul className="mt-6 space-y-4">
              {PRICE_DRIVERS.map((d, i) => (
                <li key={d.label} className="grid grid-cols-[8rem_1fr] items-center gap-4 text-sm">
                  <span>{d.label}</span>
                  <span className="relative h-2 rounded-full bg-paper-200">
                    <motion.span
                      className="absolute inset-y-0 left-0 origin-left rounded-full bg-green-600"
                      style={{ width: `${d.weight * 100}%` }}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true, amount: 0.8 }}
                      transition={{ duration: DUR.slow, ease: EASE.paper, delay: i * STAGGER }}
                    />
                  </span>
                  {d.note && <span className="col-start-2 -mt-2 text-xs text-muted-foreground">{d.note}</span>}
                </li>
              ))}
            </ul>
            {/* VERIFY-LATER[FACT-20]: optional anchor price ("from ₹X/box at N units") only with owner approval */}
          </div>
        </div>
      </div>
    </Section>
  );
}
