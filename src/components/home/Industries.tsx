/** S5 Industries switcher: WAI-ARIA tabs (arrow keys), vertical on desktop, chip scroller on mobile */

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Section } from '@/components/site/Section';
import { Cta } from '@/components/site/Cta';
import { ImageSlot } from '@/components/site/ImageSlot';
import { INDUSTRY_PANELS } from '@/content/home';
import { quoteHref } from '@/lib/quotePrefill';
import { DUR, EASE } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';

export default function Industries() {
  const [index, setIndex] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const item = INDUSTRY_PANELS[index];

  const onKey = (event: React.KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let next = index;
    if (event.key in keys) next = (index + keys[event.key] + INDUSTRY_PANELS.length) % INDUSTRY_PANELS.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = INDUSTRY_PANELS.length - 1;
    else return;
    event.preventDefault();
    setIndex(next);
    tabs.current[next]?.focus();
  };

  return (
    <Section name="industries" theme="kraft" aria-labelledby="industries-heading" className="section-y">
      <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
        <header className="grid gap-4 lg:grid-cols-12 lg:gap-10">
          <p className="label-mono text-muted-foreground lg:col-span-4">04 — Industries</p>
          <h2 id="industries-heading" className="font-display text-h2 lg:col-span-8">
            Built for what you ship.
          </h2>
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:gap-10">
          <div
            role="tablist"
            aria-label="Industries"
            aria-orientation="vertical"
            onKeyDown={onKey}
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:col-span-4 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0"
          >
            {INDUSTRY_PANELS.map((ind, i) => (
              <button
                key={ind.slug}
                ref={(el) => (tabs.current[i] = el)}
                id={`industry-tab-${ind.slug}`}
                role="tab"
                type="button"
                aria-selected={i === index}
                aria-controls="industry-panel"
                tabIndex={i === index ? 0 : -1}
                onClick={() => setIndex(i)}
                className={cn(
                  'relative shrink-0 rounded-full border px-4 py-2.5 text-left text-sm font-semibold transition-colors duration-quick lg:rounded-none lg:border-0 lg:py-4 lg:pl-6 lg:text-h3',
                  i === index ? 'border-ink-900 text-ink-900' : 'border-ink-900/15 text-ink-500 hover:text-ink-900'
                )}
              >
                {i === index && (
                  <motion.span
                    layoutId="industry-indicator"
                    aria-hidden="true"
                    className="absolute inset-y-2 left-0 hidden w-1 bg-green-600 lg:block"
                    transition={{ duration: DUR.base, ease: EASE.paper }}
                  />
                )}
                {ind.name}
              </button>
            ))}
          </div>

          <div id="industry-panel" role="tabpanel" aria-labelledby={`industry-tab-${item.slug}`} className="lg:col-span-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={item.slug}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DUR.base, ease: EASE.paper }}
                className="grid gap-6 rounded-[14px] bg-paper-50 p-5 md:grid-cols-2 md:p-8"
              >
                <dl className="min-w-0 space-y-5">
                  {[
                    ['The problem', item.problem],
                    ['Our spec', item.spec],
                    ['Why it works', item.why],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="label-mono text-muted-foreground">{k}</dt>
                      <dd className="mt-1 text-body-l">{v}</dd>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Cta
                      id={`home.industries.${item.slug}`}
                      intent="quote"
                      href={quoteHref({ industry: item.slug, src: `home.industries.${item.slug}` })}
                      meta={{ industry: item.slug }}
                      arrow
                    >
                      Get the {item.name} spec
                    </Cta>
                    <Cta id={`home.industries.${item.slug}.more`} intent="navigate" variant="link" href="/services">
                      Read more
                    </Cta>
                  </div>
                </dl>
                <ImageSlot slot={item.image} className="aspect-[16/10] min-w-0 rounded-[10px] md:aspect-auto md:h-full" sizes="(min-width: 768px) 40vw, 100vw" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Section>
  );
}
