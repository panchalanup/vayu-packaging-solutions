/** S6 "Dieline to Dispatch": sticky image cross-fades per active step (IntersectionObserver, no GSAP pin) */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Section } from '@/components/site/Section';
import { Cta } from '@/components/site/Cta';
import { ImageSlot } from '@/components/site/ImageSlot';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { PROCESS_STEPS } from '@/content/home';
import { VIDEO_ASSETS } from '@/constants/images';
import { useEventTracker } from '@/hooks/useAnalytics';
import { DUR, EASE } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';

export default function DielineToDispatch() {
  const [active, setActive] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const { trackEvent } = useEventTracker();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step));
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    stepRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const step = PROCESS_STEPS[active];

  return (
    <Section name="process" aria-labelledby="process-heading" className="section-y">
      <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
        <header className="grid gap-4 lg:grid-cols-12 lg:gap-10">
          <p className="label-mono text-muted-foreground lg:col-span-5">05 — How we deliver</p>
          <h2 id="process-heading" className="font-display text-h2 lg:col-span-7">
            From dieline to dispatch.
          </h2>
        </header>

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-[calc(var(--nav-h)+24px)]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[14px] bg-paper-200">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={step.n}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: DUR.base, ease: EASE.paper }}
                  >
                    <ImageSlot slot={step.image} className="h-full" sizes="40vw" />
                  </motion.div>
                </AnimatePresence>
                {/* VERIFY-LATER[VID-01]: keep only if the footage is real; compress to ≤ 2 MB 720p and add a poster frame */}
                <button
                  type="button"
                  onClick={() => {
                    setVideoOpen(true);
                    trackEvent('video_open', { id: 'home.process.video' });
                  }}
                  className="absolute bottom-4 left-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-paper-50/95 px-4 text-sm font-semibold text-ink-900 shadow-paper"
                >
                  <Play aria-hidden="true" className="h-4 w-4 fill-current" /> Watch 60s
                </button>
              </div>
              <div className="mt-4 flex gap-1.5" aria-hidden="true">
                {PROCESS_STEPS.map((s, i) => (
                  <span key={s.n} className="h-0.5 flex-1 bg-ink-900/10">
                    <span className={cn('block h-full origin-left bg-green-600 transition-transform duration-base', i <= active ? 'scale-x-100' : 'scale-x-0')} />
                  </span>
                ))}
              </div>
            </div>
          </div>

          <ol className="lg:col-span-7">
            {PROCESS_STEPS.map((s, i) => (
              <li
                key={s.n}
                ref={(el) => (stepRefs.current[i] = el)}
                data-step={i}
                className={cn(
                  'border-b border-dashed border-border py-8 transition-opacity duration-base lg:py-16',
                  i === active ? 'lg:opacity-100' : 'lg:opacity-50'
                )}
              >
                <ImageSlot slot={s.image} aspect="3 / 2" className="mb-5 rounded-[14px] lg:hidden" sizes="100vw" />
                <p className="label-mono text-muted-foreground">{s.n}</p>
                <h3 className="mt-2 text-h3">{s.title}</h3>
                <p className="mt-2 max-w-[52ch] text-body-l text-muted-foreground">{s.body}</p>
                <p className="label-mono mt-4 text-kraft-700">{s.datum}</p>
              </li>
            ))}
          </ol>
        </div>

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
