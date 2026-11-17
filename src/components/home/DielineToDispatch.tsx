/**
 * S6 "Dieline to Dispatch": the steps are cards that pin and stack as you scroll. Each new card slides over the last,
 * and the card it covers sinks behind: it shrinks, dims and goes soft (blur), more with every card piled on top.
 * Driven by how far each card has slid over the one before it, written to motion values in one animation frame per
 * scroll burst. The blur is small (6 px, 4 px on phones) and only on covered cards. Reduced motion and the low tier get
 * a plain list of the same cards.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, motionValue, useTransform, type MotionValue } from 'framer-motion';
import { Play } from 'lucide-react';
import { Section } from '@/components/site/Section';
import { SplitWords } from '@/components/fx/SplitWords';
import { Cta } from '@/components/site/Cta';
import { ImageSlot } from '@/components/site/ImageSlot';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { PROCESS_STEPS } from '@/content/home';
import { VIDEO_ASSETS } from '@/constants/images';
import { useEventTracker } from '@/hooks/useAnalytics';
import { useSiteTier } from '@/lib/motion/siteTier';

type Step = (typeof PROCESS_STEPS)[number];

/** Pinned position of card i, below the header; each card sits a little lower so the pile shows its edges */
const stuckTop = (i: number) => `calc(var(--nav-h) + 20px + ${i * 14}px)`;

interface StepCardProps {
  step: Step;
  index: number;
  total: number;
  /** How buried this card is: the sum of how far each later card has slid over it (0 = on top, 1 = one card over it) */
  depth: MotionValue<number>;
  stack: boolean;
  onVideo: () => void;
}

function StepCard({ step, index, total, depth, stack, onVideo }: StepCardProps) {
  const last = index === total - 1;
  const maxBlur = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches ? 4 : 6;
  const scale = useTransform(depth, (d) => 1 - d * 0.035);
  const filter = useTransform(depth, (d) => (d > 0.02 ? `blur(${Math.min(maxBlur, d * 3.2).toFixed(2)}px)` : 'none'));
  const dim = useTransform(depth, (d) => Math.min(0.3, d * 0.09));

  return (
    <li data-step={index} className={stack ? 'sticky' : undefined} style={stack ? { top: stuckTop(index), marginBottom: last ? 0 : '16vh' } : undefined}>
      <motion.div
        style={stack ? { scale, filter, transformOrigin: 'top center' } : undefined}
        className="relative overflow-hidden rounded-[14px] border border-border bg-paper-50 shadow-[0_-14px_30px_-18px_rgb(15_26_20/0.32),0_1px_0_rgb(15_26_20/0.06)]"
      >
        <div className="grid lg:grid-cols-12">
          <div className="relative aspect-[3/2] lg:col-span-5 lg:aspect-auto">
            <div className="absolute inset-0">
              <ImageSlot slot={step.image} className="h-full" sizes="(min-width: 1024px) 40vw, 100vw" />
            </div>
            {/* VERIFY-LATER[VID-01]: keep only if the footage is real; compress to ≤ 2 MB 720p and add a poster frame */}
            <button
              type="button"
              onClick={onVideo}
              className="absolute bottom-4 right-4 hidden min-h-11 items-center gap-2 rounded-full bg-paper-50/95 px-4 text-sm font-semibold text-ink-900 shadow-paper lg:inline-flex"
            >
              <Play aria-hidden="true" className="h-4 w-4 fill-current" /> Watch 60s
            </button>
          </div>
          <div className="flex min-h-[15rem] flex-col justify-center p-6 lg:col-span-7 lg:min-h-[24rem] lg:p-12">
            <p className="label-mono text-muted-foreground">
              {step.n} <span aria-hidden="true">/ {String(total).padStart(2, '0')}</span>
            </p>
            <h3 className="mt-3 text-h3">{step.title}</h3>
            <p className="mt-3 max-w-[52ch] text-body-l text-muted-foreground">{step.body}</p>
            <p className="label-mono mt-5 text-kraft-700">{step.datum}</p>
          </div>
        </div>
        {stack && !last && <motion.span aria-hidden="true" style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-ink-900" />}
      </motion.div>
    </li>
  );
}

export default function DielineToDispatch() {
  const [videoOpen, setVideoOpen] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);
  const { trackEvent } = useEventTracker();
  const { tier, reducedMotion } = useSiteTier();
  const stack = !reducedMotion && tier !== 'low';
  const depths = useMemo(() => PROCESS_STEPS.map(() => motionValue(0)), []);

  useEffect(() => {
    const list = listRef.current;
    if (!stack || !list) return;
    const cards = Array.from(list.children) as HTMLElement[];
    let pinned: number[] = [];
    const measure = () => {
      pinned = cards.map((li) => parseFloat(getComputedStyle(li).top) || 0);
    };
    let frame = 0;
    const update = () => {
      frame = 0;
      // cover[j]: how far card j has slid over card j-1, from 0 (just touching its bottom edge) to 1 (pinned in place)
      const cover = cards.map((li, j) => {
        if (j === 0) return 0;
        const prevBottom = cards[j - 1].getBoundingClientRect().bottom;
        const top = li.getBoundingClientRect().top;
        return Math.min(1, Math.max(0, (prevBottom - top) / Math.max(1, prevBottom - pinned[j])));
      });
      // a card is buried by every card after it
      let sum = 0;
      for (let i = cards.length - 1; i >= 0; i--) {
        depths[i].set(sum);
        sum += cover[i];
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    measure();
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [stack, depths]);

  return (
    <Section name="process" aria-labelledby="process-heading" className="section-y">
      <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
        <header className="grid gap-4 lg:grid-cols-12 lg:gap-10">
          <p className="label-mono text-muted-foreground lg:col-span-5">05 — How we deliver</p>
          <SplitWords as="h2" variant="blur" id="process-heading" text="From dieline to dispatch." stagger={45} className="font-display text-h2 lg:col-span-7" />
        </header>

        <ol ref={listRef} className={stack ? 'relative mt-12' : 'relative mt-12 space-y-6'}>
          {PROCESS_STEPS.map((s, i) => (
            <StepCard
              key={s.n}
              step={s}
              index={i}
              total={PROCESS_STEPS.length}
              depth={depths[i]}
              stack={stack}
              onVideo={() => {
                setVideoOpen(true);
                trackEvent('video_open', { id: 'home.process.video' });
              }}
            />
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">*Stock sizes, Ahmedabad dispatch.</p>
          <Cta id="home.process.capacity" intent="navigate" variant="secondary" href="/about#capacity" arrow>
            See our capacity
          </Cta>
        </div>
      </div>

      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-4xl border-0 bg-ink-950 p-0">
          <DialogTitle className="sr-only">How Vayu Packaging works (video)</DialogTitle>
          {videoOpen && (
            <video src={VIDEO_ASSETS.factoryTour} controls autoPlay={false} playsInline preload="metadata" className="aspect-video w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </Section>
  );
}
