/**
 * The scenes after the sticky stage in the /experience film: a wall of box styles with big counting numbers, the
 * share-and-approve drawing, two spotlight tiles for the two audiences, and a scroll-reactive close. Each is one idea,
 * one big word, one visual. Effects are transform / opacity only and off on touch screens and with reduced motion.
 */

import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Cta } from '@/components/site/Cta';
import { STYLES } from '@/lib/boxDesigner/styles';
import { availableTemplates } from '@/lib/boxDesigner/templates';
import { pageWhatsAppMessage, whatsappHref } from '@/lib/contactLinks';
import { cn } from '@/lib/utils';
import { Reveal } from '../Reveal';
import { CountUp } from '@/components/fx/Numbers';
import { Magnetic, usePointerFx } from '@/components/fx/pointerFx';
import { SplitWords } from '@/components/fx/SplitWords';
import VelocityMarquee from '@/components/fx/VelocityMarquee';
import { useShowcaseDesign } from '../stageContext';
import ShareFlow from '../visuals/ShareFlow';
import StyleMarquee from '../visuals/StyleMarquee';

const bigWord = 'font-display text-[clamp(3.2rem,12vw,10rem)] leading-[0.88] tracking-tight text-paper-50';

export function AnyBoxScene() {
  return (
    <section aria-labelledby="any-h" className="overflow-hidden bg-ink-900 py-20 text-paper-50 lg:py-32">
      <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
        <SplitWords as="h2" id="any-h" text="Any box." className={bigWord} />
        <div className="mt-8 flex flex-wrap items-end gap-x-14 gap-y-6">
          <div>
            <p className="tabular font-display text-[clamp(3.6rem,11vw,8rem)] leading-none text-green-400">
              <CountUp value={STYLES.length} />
            </p>
            <p className="label-mono mt-2 text-paper-muted">Styles</p>
          </div>
          <div>
            <p className="tabular font-display text-[clamp(3.6rem,11vw,8rem)] leading-none text-paper-50">
              <CountUp value={availableTemplates().length} />
            </p>
            <p className="label-mono mt-2 text-paper-muted">Templates</p>
          </div>
        </div>
      </div>
      <Reveal className="mt-14" rise={24}>
        <StyleMarquee tone="ink" />
      </Reveal>
    </section>
  );
}

export function ShareScene() {
  return (
    <section aria-labelledby="share-h" className="bg-ink-950 py-20 text-paper-50 lg:py-32">
      <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
        <SplitWords as="h2" id="share-h" text="Share. Approve." className={bigWord} />
        <Reveal className="mx-auto mt-10 max-w-4xl lg:mt-16" rise={24}>
          <ShareFlow tone="ink" />
        </Reveal>
      </div>
    </section>
  );
}

const TILES = [
  { word: 'Make.', line: 'Show customers their box, live.', to: '/box-designer', id: 'experience.sides.make' },
  { word: 'Buy.', line: 'Find the right box in a minute.', to: '/box-designer?wizard=1', id: 'experience.sides.buy' },
] as const;

/** One tile: a green spotlight follows the pointer and the tile leans toward it (desktop) */
function Tile({ word, line, to }: (typeof TILES)[number]) {
  const ref = useRef<HTMLAnchorElement>(null);
  usePointerFx(ref, { tilt: 3 });
  return (
    <Link
      ref={ref}
      to={to}
      className={cn(
        'fx-spot fx-tilt group relative flex min-h-[18rem] flex-col justify-between overflow-hidden rounded-3xl border border-paper-50/15 bg-ink-800 p-7 hover:border-green-400/60 lg:min-h-[26rem] lg:p-10',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
      )}
    >
      <span className="relative font-display text-[clamp(3.4rem,10vw,8rem)] leading-[0.9] tracking-tight">{word}</span>
      <span className="relative flex items-end justify-between gap-4">
        <span className="max-w-[18ch] text-lg text-paper-100/85">{line}</span>
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-400 text-ink-900">
          <ArrowRight aria-hidden="true" className="h-6 w-6 transition-transform duration-base ease-paper group-hover:-rotate-45" />
        </span>
      </span>
    </Link>
  );
}

export function SidesScene() {
  return (
    <section aria-labelledby="sides-h" className="bg-ink-900 py-20 text-paper-50 lg:py-28">
      <h2 id="sides-h" className="sr-only">
        For box makers and box buyers
      </h2>
      <div className="mx-auto grid max-w-content gap-4 px-4 md:grid-cols-2 md:px-6 lg:gap-6 lg:px-10">
        {TILES.map((t, i) => (
          <Reveal key={t.word} delay={i * 80}>
            <Tile {...t} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function CloseScene() {
  const { design } = useShowcaseDesign();
  const href = `/box-designer?${new URLSearchParams({ style: design.template, l: String(design.dims.length), w: String(design.dims.width), h: String(design.dims.height) }).toString()}`;
  const line = 'Your next box starts flat.';
  const outlined = 'whitespace-nowrap pr-12 font-display text-[clamp(3.5rem,11vw,9rem)] leading-none text-transparent [-webkit-text-stroke:1.5px_rgb(251_248_243/0.55)]';
  return (
    <section aria-labelledby="close-h" className="overflow-hidden bg-ink-950 pb-24 pt-20 text-paper-50 lg:pb-36 lg:pt-32">
      <h2 id="close-h" className="sr-only">
        {line}
      </h2>
      {/* a long outlined line that drifts, speeds up and leans as you scroll */}
      <div aria-hidden="true" className="select-none">
        <VelocityMarquee speed={50} fade="ink-950">
          <span className={outlined}>{line} ✦</span>
          <span className={outlined}>{line} ✦</span>
        </VelocityMarquee>
      </div>
      <Reveal className="mx-auto mt-14 flex max-w-content flex-wrap items-center justify-center gap-3 px-4 lg:mt-20">
        <Magnetic>
          <Cta id="experience.close.open" intent="designer" href={href} size="lg" arrow>
            Design your box, free
          </Cta>
        </Magnetic>
        <Cta id="experience.close.whatsapp" intent="whatsapp" variant="whatsapp" size="lg" href={whatsappHref(pageWhatsAppMessage('/box-designer', 'a custom box design'))} className="border-paper-50/30 text-paper-50 hover:bg-paper-50/10">
          WhatsApp us
        </Cta>
      </Reveal>
    </section>
  );
}
