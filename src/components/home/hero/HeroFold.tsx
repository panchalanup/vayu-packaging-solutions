/**
 * S1 "The Fold" (§6): the H1 renders on the first frame (LCP); the live 3D box loads after idle on
 * medium/high tiers, behind an SVG poster that cross-fades out once the first 3D frame is ready.
 * Desktop: GSAP pins the hero and maps scroll to fold progress. Elsewhere the fold plays once on its own.
 */

import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Section } from '@/components/site/Section';
import { Cta } from '@/components/site/Cta';
import { FactStrip } from '@/components/site/Blocks';
import { CropMarks } from '@/components/site/Decor';
import { useSiteTier } from '@/lib/motion/siteTier';
import { DUR, EASE, STAGGER } from '@/lib/motion/tokens';
import { useEventTracker } from '@/hooks/useAnalytics';
import { whatsappHref, pageWhatsAppMessage } from '@/lib/contactLinks';
import { FACTS } from '@/content/facts';
import { cn } from '@/lib/utils';
import { createFoldStore } from './foldStore';
import { DielinePoster, SealedPoster } from './Posters';

const HeroCanvas = lazy(() => import('./HeroCanvas'));

const CAPTIONS = ['Cut & creased to your exact size', 'Strength set by ply & flute', 'Sealed, taped & dispatched'];
const stageOf = (u: number) => (u < 0.36 ? 0 : u < 0.8 ? 1 : 2);

/** Scroll progress p (0..1 across the pin) → fold progress u (§8.5) */
const foldFromScroll = (p: number) =>
  p <= 0 ? 0.35 : p < 0.4 ? 0.35 + (0.37 * p) / 0.4 : p < 0.85 ? 0.72 + (0.28 * (p - 0.4)) / 0.45 : 1;

const rise = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DUR.slow, ease: EASE.paper, delay: 0.12 + i * STAGGER },
});

export default function HeroFold() {
  const site = useSiteTier();
  const { trackEvent } = useEventTracker();
  const store = useMemo(() => createFoldStore(0), []);
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const [mountCanvas, setMountCanvas] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [stage, setStage] = useState(site.hero3d ? 0 : 2);
  const [cue, setCue] = useState(false);
  const pinned = site.hero3d && site.desktop;

  // Mount the 3D canvas after load + idle, never on low tier / reduced motion / kill switch
  useEffect(() => {
    if (!site.hero3d) return;
    let idle = 0;
    let timer = 0;
    const start = () => {
      if (typeof window.requestIdleCallback === 'function') {
        idle = window.requestIdleCallback(() => setMountCanvas(true), { timeout: 2000 });
      } else {
        timer = window.setTimeout(() => setMountCanvas(true), 300);
      }
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      window.removeEventListener('load', start);
      if (idle) window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
    };
  }, [site.hero3d]);

  // Caption stepper + one-off completion event, without re-rendering on every scroll frame
  useEffect(() => {
    let fired = false;
    return store.subscribe((u) => {
      setStage(stageOf(u));
      if (!fired && u >= 1) {
        fired = true;
        trackEvent('hero_fold_complete', { tier: site.tier });
      }
    });
  }, [store, trackEvent, site.tier]);

  const handleReady = useCallback(() => setCanvasReady(true), []);

  // Choreography: intro fold (0 → 0.35), then scroll-linked (desktop pin) or autoplay (elsewhere)
  useLayoutEffect(() => {
    if (!canvasReady) return;
    let cancelled = false;
    let revert: (() => void) | undefined;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
      if (cancelled || !sectionRef.current || !pinRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const intro = { u: store.get() };
        let scrolled = false;
        // Already past the hero when the canvas became ready: don't insert a pin above the reader
        const pastHero = (sectionRef.current?.getBoundingClientRect().bottom ?? 1) < 0;

        if (pastHero) {
          store.set(1);
        } else if (pinned) {
          gsap.to(intro, {
            u: 0.35,
            duration: 1.4,
            ease: 'power3.inOut',
            onUpdate: () => {
              if (!scrolled) store.set(intro.u);
            },
          });
          ScrollTrigger.create({
            trigger: pinRef.current,
            start: 'top top',
            end: `+=${site.tier === 'high' ? 120 : 70}%`,
            pin: true,
            scrub: 0.6,
            snap: { snapTo: [0, 0.4, 0.85], duration: { min: 0.2, max: 0.5 }, ease: 'power1.inOut', delay: 0.1 },
            onUpdate: (self) => {
              if (self.progress > 0.001) scrolled = true;
              if (scrolled) store.set(foldFromScroll(self.progress));
            },
          });
        } else {
          const tl = gsap.timeline({ paused: true });
          tl.to(intro, { u: 0.35, duration: 1.4, ease: 'power3.inOut', onUpdate: () => store.set(intro.u) })
            .to(intro, { u: 0.72, duration: 1.2, ease: 'power2.inOut', delay: 0.3, onUpdate: () => store.set(intro.u) })
            .to(intro, { u: 1, duration: 1.2, ease: 'power2.inOut', delay: 0.4, onUpdate: () => store.set(intro.u) });
          ScrollTrigger.create({ trigger: sectionRef.current, start: 'top 80%', once: true, onEnter: () => tl.play() });
        }
      }, sectionRef);
      // Pins are created asynchronously, so re-measure every trigger in document order
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      revert = () => ctx.revert();
    })();

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [canvasReady, pinned, site.tier, store]);

  // "Scroll to fold" cue: nudges twice after 2 s idle, desktop pin only
  useEffect(() => {
    if (!pinned || !canvasReady) return;
    const timer = window.setTimeout(() => {
      if (window.scrollY < 10) setCue(true);
    }, 2000);
    const stop = () => setCue(false);
    window.addEventListener('scroll', stop, { passive: true, once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', stop);
    };
  }, [pinned, canvasReady]);

  const facts = [
    { label: 'MOQ', value: `${FACTS.moqBoxes} boxes` },
    { label: 'Stock sizes', value: `${FACTS.dispatchHours} hrs*` },
    { label: 'Ply', value: '3 · 5 · 7' },
    { label: 'Invoice', value: 'GST' },
  ];

  return (
    <Section name="hero" ref={sectionRef} aria-labelledby="hero-heading" className="paper-grain">
      <div ref={pinRef} className="relative lg:min-h-[calc(100svh-72px)]">
        <div className="mx-auto grid max-w-content grid-cols-1 gap-8 px-4 pb-10 pt-8 md:px-6 lg:grid-cols-12 lg:items-center lg:gap-10 lg:px-10 lg:pb-12 lg:pt-10">
          <div className="relative min-w-0 lg:col-span-6">
            <motion.p {...rise(0)} className="label-mono mb-5 text-muted-foreground">
              Corrugated boxes &amp; packaging supplies · {FACTS.city}
            </motion.p>
            {/* LCP element: no entrance animation */}
            <h1 id="hero-heading" className="font-display text-display-xl text-balance">
              Corrugated boxes, engineered to your spec — and everything you need to ship them.
            </h1>
            {/* VERIFY-LATER[FACT-04]: coverage claim "across Gujarat and India" */}
            <motion.p {...rise(1)} className="mt-6 max-w-[52ch] text-body-l text-muted-foreground">
              3, 5 &amp; 7-ply · printed · die-cut · food-grade, plus tapes, stretch film &amp; strapping. One partner, one
              invoice, delivered across Gujarat and India.
            </motion.p>
            <motion.div {...rise(2)} className="mt-8 flex flex-wrap gap-3">
              <Cta id="home.hero.quote" intent="quote" href="/quote?src=home.hero.quote" size="lg" arrow>
                Get a quote
              </Cta>
              <Cta id="home.hero.whatsapp" intent="whatsapp" variant="whatsapp" size="lg" href={whatsappHref(pageWhatsAppMessage('/'))}>
                WhatsApp us
              </Cta>
            </motion.div>
            <motion.div {...rise(3)} className="mt-8">
              <FactStrip facts={facts} />
              <p className="mt-2 text-xs text-muted-foreground">*{FACTS.dispatchFootnote}</p>
            </motion.div>
          </div>

          <div className="relative min-w-0 lg:col-span-6">
            <div className="group relative mx-2 h-[42svh] min-h-[260px] text-ink-900/40 sm:h-[50svh] lg:mx-0 lg:h-[min(68svh,640px)]">
              <CropMarks />
              <div
                className={cn(
                  'absolute inset-0 flex items-center justify-center p-4 transition-opacity duration-base ease-paper md:p-10',
                  canvasReady ? 'opacity-0' : 'opacity-100'
                )}
                aria-hidden={canvasReady}
              >
                {site.hero3d ? <DielinePoster className="h-full w-full" /> : <SealedPoster className="h-[80%] w-[80%]" />}
              </div>
              {mountCanvas && (
                <div className={cn('absolute inset-0 transition-opacity duration-base ease-paper', canvasReady ? 'opacity-100' : 'opacity-0')}>
                  <Suspense fallback={null}>
                    <HeroCanvas store={store} tier={site.tier} onReady={handleReady} />
                  </Suspense>
                </div>
              )}
            </div>

            {site.hero3d ? (
              <div className="mt-4 px-2 lg:px-0" aria-live="off">
                <div className="flex gap-1.5" aria-hidden="true">
                  {CAPTIONS.map((_, i) => (
                    <span key={i} className="h-0.5 flex-1 overflow-hidden bg-ink-900/10">
                      <span
                        className={cn('block h-full origin-left bg-green-600 transition-transform duration-base ease-paper', i <= stage ? 'scale-x-100' : 'scale-x-0')}
                      />
                    </span>
                  ))}
                </div>
                <p className="mt-3 flex items-baseline gap-3 text-sm">
                  <span className="label-mono text-muted-foreground">0{stage + 1}</span>
                  <span className="font-medium">{CAPTIONS[stage]}</span>
                </p>
              </div>
            ) : (
              <ol className="mt-4 grid gap-2 px-2 text-sm sm:grid-cols-3 lg:px-0">
                {CAPTIONS.map((c, i) => (
                  <li key={c} className="flex gap-2">
                    <span className="label-mono text-muted-foreground">0{i + 1}</span>
                    {c}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {pinned && (
          <div className="absolute inset-x-0 bottom-4 mx-auto hidden max-w-content items-center justify-between px-10 text-sm lg:flex">
            <span className="flex items-center gap-2 text-muted-foreground">
              <ChevronDown aria-hidden="true" className={cn('h-4 w-4', cue && 'animate-[bounce_0.6s_ease-in-out_2]')} />
              Scroll to fold
            </span>
            <a href="#trust" className="link-draw text-muted-foreground hover:text-foreground">
              Skip animation ↓
            </a>
          </div>
        )}
      </div>
    </Section>
  );
}
