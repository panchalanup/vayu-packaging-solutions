/**
 * "Our model" diagram (§9.2): Made in-house + Sourced from vetted mills → one QC gate → You.
 * Arrows draw once on reveal (static under reduced motion). Product lists come from RANGE so Home and About agree.
 * SECURITY: static content only.
 */

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Check, ShieldCheck, Truck } from 'lucide-react';
import { MadeSourcedBadge } from '@/components/site/Blocks';
import { RANGE } from '@/content/home';
import { DUR, EASE } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';

const made = RANGE.filter((r) => r.madeOrSourced === 'made');
const sourced = RANGE.filter((r) => r.madeOrSourced === 'sourced');

const card = 'rounded-[14px] border border-ink-900/15 bg-paper-50 p-5 md:p-6';

/** One animated stroke; static when motion is reduced */
function Stroke({ d, play, reduced, delay = 0 }: { d: string; play: boolean; reduced: boolean | null; delay?: number }) {
  const props = {
    d,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    vectorEffect: 'non-scaling-stroke' as const,
  };
  if (reduced) return <path {...props} />;
  return (
    <motion.path
      {...props}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: play ? 1 : 0 }}
      transition={{ duration: DUR.slow, ease: EASE.paper, delay }}
    />
  );
}

function DownArrow({ play, reduced }: { play: boolean; reduced: boolean | null }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 40" preserveAspectRatio="none" className="mx-auto h-10 w-5 text-green-600 lg:hidden">
      <Stroke d="M10 0 V34 M3 27 L10 36 L17 27" play={play} reduced={reduced} delay={0.2} />
    </svg>
  );
}

function RightArrow({ play, reduced }: { play: boolean; reduced: boolean | null }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 56 20" preserveAspectRatio="none" className="hidden h-5 w-14 text-green-600 lg:block">
      <Stroke d="M0 10 H50 M43 3 L52 10 L43 17" play={play} reduced={reduced} delay={0.2} />
    </svg>
  );
}

export default function ModelDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const play = useInView(ref, { once: true, amount: 0.25 });
  const reduced = useReducedMotion();

  return (
    <div ref={ref} className="grid gap-y-4 lg:grid-cols-[minmax(0,5fr)_auto_minmax(0,3fr)_auto_minmax(0,3fr)] lg:gap-y-4">
      {/* Sources: each gets its own arrow into the one gate */}
      <div className={cn(card, 'lg:col-start-1 lg:row-start-1')}>
        <MadeSourcedBadge kind="made" />
        <h3 className="mt-3 font-display text-h3">Made in-house</h3>
        <ul className="mt-3 space-y-1.5 text-muted-foreground">
          {made.map((r) => (
            <li key={r.slug} className="flex gap-2">
              <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-green-600" />
              <span>
                <span className="font-semibold text-foreground">{r.name}</span> · {r.spec}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="hidden items-center px-2 lg:col-start-2 lg:row-start-1 lg:flex">
        <RightArrow play={play} reduced={reduced} />
      </div>

      <div className={cn(card, 'lg:col-start-1 lg:row-start-2')}>
        <MadeSourcedBadge kind="sourced" />
        <h3 className="mt-3 font-display text-h3">Sourced from vetted mills</h3>
        <ul className="mt-3 space-y-1.5 text-muted-foreground">
          {sourced.map((r) => (
            <li key={r.slug} className="flex gap-2">
              <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-kraft-700" />
              <span>
                <span className="font-semibold text-foreground">{r.name}</span> · {r.spec}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="hidden items-center px-2 lg:col-start-2 lg:row-start-2 lg:flex">
        <RightArrow play={play} reduced={reduced} />
      </div>

      <div className="lg:hidden">
        <DownArrow play={play} reduced={reduced} />
      </div>

      {/* QC gate */}
      <div className="flex min-w-0 flex-col justify-center rounded-[14px] border-2 border-green-600 bg-paper-50 p-5 md:p-6 lg:col-start-3 lg:row-span-2 lg:row-start-1">
        <ShieldCheck aria-hidden="true" className="h-7 w-7 text-green-600" />
        <p className="label-mono mt-3 text-green-700">One QC gate</p>
        <h3 className="mt-1 font-display text-h3">Everything passes the same check</h3>
        <p className="mt-2 text-muted-foreground">Size, print and strength are checked on every batch, whether we made it or sourced it.</p>
      </div>

      <div className="lg:hidden">
        <DownArrow play={play} reduced={reduced} />
      </div>
      <div className="hidden items-center px-2 lg:col-start-4 lg:row-span-2 lg:row-start-1 lg:flex">
        <RightArrow play={play} reduced={reduced} />
      </div>

      {/* You */}
      <div className="flex min-w-0 flex-col justify-center rounded-[14px] bg-ink-900 p-5 text-paper-50 md:p-6 lg:col-start-5 lg:row-span-2 lg:row-start-1">
        <Truck aria-hidden="true" className="h-7 w-7 text-green-400" />
        <p className="label-mono mt-3 text-paper-muted">You</p>
        <h3 className="mt-1 font-display text-h3">One vendor, one invoice</h3>
        <p className="mt-2 text-paper-muted">Boxes and supplies together, with a GST invoice.</p>
      </div>
    </div>
  );
}
