/** S4 Range Index: sticky image that swaps per hovered/focused row (clip-path reveal); accordion on mobile */

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Section } from '@/components/site/Section';
import { MadeSourcedBadge } from '@/components/site/Blocks';
import { Cta } from '@/components/site/Cta';
import { ImageSlot } from '@/components/site/ImageSlot';
import { CropMarks } from '@/components/site/Decor';
import { RANGE } from '@/content/home';
import { quoteHref } from '@/lib/quotePrefill';
import { DUR, EASE } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';

export default function RangeIndex() {
  const [active, setActive] = useState(0);
  const item = RANGE[active];

  return (
    <Section name="range" id="range" aria-labelledby="range-heading" className="section-y">
      <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
        <header className="grid gap-4 lg:grid-cols-12 lg:gap-10">
          <p className="label-mono text-muted-foreground lg:col-span-5">03 — Range</p>
          <h2 id="range-heading" className="font-display text-h2 lg:col-span-7">
            One partner. Every box, and everything around it.
          </h2>
        </header>

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <div className="hidden lg:col-span-5 lg:block">
            <div className="group sticky top-[calc(var(--nav-h)+24px)] text-ink-900/40">
              <CropMarks />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[14px] bg-paper-200">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={item.slug}
                    className="absolute inset-0"
                    initial={{ clipPath: 'inset(0 0 100% 0)' }}
                    animate={{ clipPath: 'inset(0 0 0% 0)' }}
                    exit={{ opacity: 0, transition: { duration: DUR.base, delay: DUR.slow } }}
                    transition={{ duration: DUR.slow, ease: EASE.paper }}
                  >
                    <ImageSlot slot={item.image} className="h-full" sizes="(min-width: 1024px) 40vw, 100vw" />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <ol className="border-t border-border lg:col-span-7">
            {RANGE.map((row, i) => {
              const open = active === i;
              return (
                <li
                  key={row.slug}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="group/row relative border-b border-border"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute bottom-[-1px] left-0 h-px w-full origin-left bg-foreground transition-transform duration-quick ease-paper',
                      open ? 'scale-x-100' : 'scale-x-0'
                    )}
                  />
                  <button
                    type="button"
                    className="flex w-full items-start gap-4 py-5 text-left lg:pointer-events-none lg:cursor-default"
                    aria-expanded={open}
                    aria-controls={`range-${row.slug}`}
                    onClick={() => setActive(i)}
                  >
                    <span className="label-mono pt-1.5 text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                    <span className="flex-1">
                      <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span className="text-h3 font-bold">{row.name}</span>
                        <MadeSourcedBadge kind={row.madeOrSourced} />
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {row.spec} · {row.moq} · {row.leadTime}
                      </span>
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={cn('mt-1.5 h-5 w-5 shrink-0 transition-transform duration-quick lg:hidden', open && 'rotate-180')}
                    />
                  </button>
                  <div id={`range-${row.slug}`} className={cn('pb-5 pl-10 lg:block', open ? 'block' : 'hidden')}>
                    <ImageSlot slot={row.image} aspect="4 / 3" className="mb-4 rounded-[14px] lg:hidden" sizes="100vw" />
                    <Cta
                      id={`home.range.${row.slug}`}
                      intent="quote"
                      variant="link"
                      href={quoteHref({ product: row.quoteProduct, src: `home.range.${row.slug}` })}
                      meta={{ product: row.slug }}
                      arrow
                    >
                      Get price
                    </Cta>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-8 flex justify-end">
          <Cta id="home.range.all" intent="navigate" variant="secondary" href="/products" arrow>
            View full range
          </Cta>
        </div>
      </div>
    </Section>
  );
}
