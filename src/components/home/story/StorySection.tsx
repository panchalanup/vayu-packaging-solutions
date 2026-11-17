/**
 * Home "story" section: "One box, one journey" (docs/Design-Improvement/STORY_HERO_PLAN.md). One 3D box lives through
 * the customer's whole story in nine scenes, with about twenty words in total.
 *
 *  - Desktop ("film"): a tall scroll track with a sticky stage. Scroll position becomes the story progress (smoothed),
 *    so there is no pin to create after load and no layout shift.
 *  - Phones/tablets ("stories"): not pinned. The story autoplays while in view; tap to step, or pause.
 *  - Low tier, reduced motion, no WebGL, Save-Data or VITE_STORY_3D=off: still cards, no 3D (StoryStills).
 *
 * React never re-renders on scroll: the progress lives in a tiny store that the canvas and the few live DOM bits
 * (the ×N counter, the debug line) subscribe to directly.
 */

import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronsDown, Pause, Play } from 'lucide-react';
import { Section } from '@/components/site/Section';
import { Cta } from '@/components/site/Cta';
import { useSiteTier } from '@/lib/motion/siteTier';
import { DUR, EASE } from '@/lib/motion/tokens';
import { useEventTracker } from '@/hooks/useAnalytics';
import { CHAPTER_LABELS, MAKE_FOOTNOTE, MAKE_LINE, SCENE_WORDS, SR_STEPS, STORY_CTA, STORY_HEADING, type ChapterId } from '@/content/story';
import { cn } from '@/lib/utils';
import type { PerfTier } from '@/lib/boxDesigner/perfTier';
import { createFoldStore, type FoldStore } from '../hero/foldStore';
import { CHAPTERS, SCENES, chapterAnchor, chapterIndexOf, clamp01, counterAt, sceneAt, sceneIndex } from './beats';
import { useStoryPlayer } from './useStoryPlayer';
import StoryStills from './StoryStills';

const StoryCanvas = lazy(() => import('./StoryCanvas'));

/** How far the visitor scrolls through the story on desktop, in screen heights */
const RUN_SVH = 650;
const MAKE = sceneIndex('make');
const OPEN = sceneIndex('open');

type Mode = 'film' | 'stories';

const readNavHeight = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;

/** Scroll position of the sticky track → story progress, smoothed so the 3D glides instead of stepping */
function useFilmScroll(store: FoldStore, track: React.RefObject<HTMLElement>, stage: React.RefObject<HTMLElement>, enabled: boolean) {
  useEffect(() => {
    const trackEl = track.current;
    const stageEl = stage.current;
    if (!enabled || !trackEl || !stageEl) return;
    let target = 0;
    let frame = 0;
    const measure = () => {
      const rect = trackEl.getBoundingClientRect();
      const run = rect.height - stageEl.offsetHeight;
      target = run > 0 ? clamp01((readNavHeight() - rect.top) / run) : 0;
    };
    // Frame-rate independent easing toward the scroll position: a soft, cinematic glide that never steps
    let lastT = 0;
    const tick = (now: number) => {
      frame = 0;
      const dt = lastT ? Math.min(64, now - lastT) : 16;
      lastT = now;
      const cur = store.get();
      const d = target - cur;
      if (Math.abs(d) < 0.00025) {
        store.set(target);
        lastT = 0;
        return;
      }
      store.set(cur + d * (1 - Math.exp(-dt / 140)));
      frame = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      measure();
      if (!frame) frame = requestAnimationFrame(tick);
    };
    measure();
    store.set(target);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [store, track, stage, enabled]);
}

function Rail({ active, onGo, compact }: { active: number; onGo: (chapter: ChapterId) => void; compact?: boolean }) {
  return (
    <ol className={cn('flex', compact ? 'gap-1.5' : 'gap-3')}>
      {CHAPTERS.map((c, i) => (
        <li key={c} className={compact ? 'flex-1' : undefined}>
          <button
            type="button"
            onClick={() => onGo(c)}
            aria-label={`${CHAPTER_LABELS[c]}, step ${i + 1} of ${CHAPTERS.length}`}
            aria-current={i === active ? 'step' : undefined}
            className="group block w-full py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className={cn('block h-0.5 overflow-hidden bg-white/15', compact ? 'w-full' : 'w-[76px] xl:w-[104px]')}>
              <span className="block h-full origin-left bg-green-400 transition-transform duration-base ease-paper" style={{ transform: `scaleX(${i <= active ? 1 : 0})` }} />
            </span>
            {!compact && (
              <span className={cn('label-mono mt-2 block transition-opacity', i === active ? 'text-paper-50' : 'text-paper-50/40 group-hover:text-paper-50/70')}>
                {String(i + 1).padStart(2, '0')} {CHAPTER_LABELS[c]}
              </span>
            )}
          </button>
        </li>
      ))}
    </ol>
  );
}

function SkipButton({ onSkip, compact }: { onSkip: () => void; compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={onSkip}
      className={cn(
        'pointer-events-auto inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/20 bg-black/35 text-paper-50/85 backdrop-blur-md transition-colors duration-quick hover:border-white/45 hover:text-paper-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        compact ? 'px-3 text-xs' : 'px-4 text-sm'
      )}
    >
      Skip animation
      <ChevronsDown className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

function StoryStage({ mode, tier }: { mode: Mode; tier: PerfTier }) {
  const { trackEvent } = useEventTracker();
  const film = mode === 'film';
  const store = useMemo(() => createFoldStore(0), []);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const debugRef = useRef<HTMLParagraphElement>(null);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);
  const [sceneIdx, setSceneIdx] = useState(0);
  const seen = useRef(new Set<number>());
  const debug = useMemo(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('story-debug'), []);

  // Mount the canvas shortly before the section arrives, never earlier (the top hero owns the first seconds)
  useEffect(() => {
    const el = trackRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setNear(true), io.disconnect()), { rootMargin: '100% 0px 100% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Phone autoplay only runs while most of the card is visible
  useEffect(() => {
    const el = stageRef.current;
    if (film || !el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setInView(e.intersectionRatio >= 0.6), { threshold: [0, 0.6, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, [film]);

  // Store → the few live bits of DOM, without re-rendering React on every frame
  useEffect(
    () =>
      store.subscribe((p) => {
        const { index, scene } = sceneAt(p);
        setSceneIdx((prev) => (prev === index ? prev : index));
        if (index === MAKE && counterRef.current) counterRef.current.textContent = `×${counterAt(p)}`;
        if (debugRef.current) debugRef.current.textContent = `p ${p.toFixed(3)} · ${index + 1}/${SCENES.length} ${scene.id}`;
      }),
    [store]
  );

  useFilmScroll(store, trackRef, stageRef, film);
  const player = useStoryPlayer(store, !film && inView && ready);

  useEffect(() => {
    if (seen.current.has(sceneIdx)) return;
    seen.current.add(sceneIdx);
    trackEvent('story_scene_view', { scene: SCENES[sceneIdx].id, mode, tier });
    if (sceneIdx === SCENES.length - 1) trackEvent('story_complete', { mode, tier });
  }, [sceneIdx, trackEvent, mode, tier]);

  const handleReady = useCallback(() => setReady(true), []);

  const goChapter = useCallback(
    (chapter: ChapterId) => {
      if (!film) {
        player.goto(SCENES.findIndex((s) => s.chapter === chapter));
        return;
      }
      const trackEl = trackRef.current;
      const stageEl = stageRef.current;
      if (!trackEl || !stageEl) return;
      const rect = trackEl.getBoundingClientRect();
      const run = rect.height - stageEl.offsetHeight;
      window.scrollTo({ top: window.scrollY + rect.top - readNavHeight() + chapterAnchor(chapter) * run, behavior: 'smooth' });
    },
    [film, player]
  );

  // Skip: jump straight past the section (no smooth scroll, which would play the whole film at speed)
  const skip = useCallback(() => {
    trackEvent('story_skip', { scene: SCENES[sceneIdx].id, mode });
    player.setPaused(true);
    const end = document.getElementById('story-end');
    if (!end) return;
    window.scrollTo({ top: end.getBoundingClientRect().top + window.scrollY - readNavHeight(), behavior: 'instant' as ScrollBehavior });
    end.focus({ preventScroll: true });
  }, [trackEvent, sceneIdx, mode, player]);

  const activeChapter = chapterIndexOf(sceneIdx);
  const ctas = (
    <div className="pointer-events-auto flex flex-wrap gap-3">
      <Cta id="home.story.design" intent="designer" href="/box-designer" size="lg" arrow beam>
        {STORY_CTA.design}
      </Cta>
      <Cta id="home.story.quote" intent="quote" href="/quote?src=home.story.quote" size="lg" variant="secondary">
        {STORY_CTA.quote}
      </Cta>
    </div>
  );

  return (
    <Section name="story" theme="ink" aria-labelledby="story-heading" className="bg-ink-950 text-paper-50">
      <h2 id="story-heading" className="sr-only">
        {STORY_HEADING}
      </h2>
      <ol className="sr-only">
        {SR_STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <div ref={trackRef} data-story-track="" className="relative" style={film ? { height: `calc(100svh - var(--nav-h) + ${RUN_SVH}svh)` } : undefined}>
        <div
          ref={stageRef}
          data-story-stage=""
          className={cn('overflow-hidden', film ? 'sticky top-[var(--nav-h)] h-[calc(100svh-var(--nav-h))] min-h-[480px]' : 'relative h-[min(76svh,720px)] min-h-[520px]')}
        >
          {/* Dark theatre behind the 3D, with a faint warm pool so the frame is never flat before the canvas arrives */}
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60%_55%_at_55%_55%,rgb(58_47_34)_0%,rgb(26_28_22)_45%,rgb(10_18_13)_100%)]" />
          {near && (
            <div className={cn('absolute inset-0 transition-opacity duration-slow ease-paper', ready ? 'opacity-100' : 'opacity-0')} aria-hidden="true">
              <Suspense fallback={null}>
                <StoryCanvas store={store} tier={tier} onReady={handleReady} />
              </Suspense>
            </div>
          )}

          {/* Soft scrims keep the words and the rail readable over bright scenes (the doorstep, the open box) */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_65%_at_0%_0%,rgb(0_0_0/0.55),transparent_70%)]" />
          <div aria-hidden="true" className={cn('pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent', film ? 'h-28' : 'h-56')} />

          {/* Words, counter and buttons sit on a layer that ignores the pointer, except the buttons themselves */}
          <div className="pointer-events-none absolute inset-0">
            <div className="mx-auto max-w-content px-4 pt-8 md:px-6 lg:px-10 lg:pt-12">
              {/* Every phrase is always mounted and cross-fades in place: no blank frame between scenes, no remounts */}
              <div className={cn('relative h-[4.5em]', !film && 'mt-14')} aria-hidden="true">
                {SCENES.map((s, i) =>
                  SCENE_WORDS[s.id] ? (
                    <div
                      key={s.id}
                      className={cn(
                        'absolute inset-x-0 top-0 transition-[opacity,transform,filter] duration-slow ease-paper',
                        i === sceneIdx ? 'translate-y-0 opacity-100 blur-0' : cn('opacity-0 blur-[6px]', i < sceneIdx ? '-translate-y-2' : 'translate-y-3')
                      )}
                    >
                      <p className="font-display text-display-xl text-paper-50 [text-shadow:0_2px_24px_rgb(0_0_0/0.45)]">{SCENE_WORDS[s.id]}</p>
                      {i === MAKE && (
                        <p className="mt-2 text-body-l text-paper-50/70">
                          {MAKE_LINE}
                          <span className="mt-1 block text-xs text-paper-50/50">*{MAKE_FOOTNOTE}</span>
                        </p>
                      )}
                    </div>
                  ) : null
                )}
              </div>
              <AnimatePresence>
                {film && sceneIdx === OPEN && (
                  <motion.div className="mt-8" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: DUR.slow, ease: EASE.paper, delay: 0.15 }}>
                    {ctas}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              aria-hidden="true"
              className={cn(
                'absolute right-4 top-1/2 -translate-y-1/2 font-display text-[clamp(3rem,9vw,7rem)] leading-none text-green-400 transition-opacity duration-base md:right-10',
                sceneIdx === MAKE ? 'opacity-100' : 'opacity-0'
              )}
            >
              <span ref={counterRef}>×1</span>
            </div>

            {film ? (
              <>
                <div className="absolute inset-x-0 top-4 mx-auto flex max-w-content justify-end px-4 md:px-6 lg:top-6 lg:px-10">
                  <SkipButton onSkip={skip} />
                </div>
                <div className="absolute inset-x-0 bottom-3 mx-auto flex max-w-content items-end px-4 md:px-6 lg:px-10">
                  <div className="pointer-events-auto">
                    <Rail active={activeChapter} onGo={goChapter} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="pointer-events-auto absolute inset-x-0 top-3 px-4">
                  <Rail active={activeChapter} onGo={goChapter} compact />
                </div>
                <div className="absolute right-2 top-9 flex items-center gap-1">
                  <SkipButton onSkip={skip} compact />
                  <button
                    type="button"
                    onClick={() => player.setPaused(!player.paused)}
                    aria-label={player.paused ? 'Play the story' : 'Pause the story'}
                    className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full text-paper-50/70 hover:text-paper-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {player.paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>
                <div className="pointer-events-auto absolute inset-x-0 bottom-28 top-28 flex">
                  <button type="button" aria-label="Previous scene" className="h-full flex-1 focus-visible:outline-none" onClick={() => player.goto(sceneIdx - 1)} />
                  <button type="button" aria-label="Next scene" className="h-full flex-1 focus-visible:outline-none" onClick={() => player.goto(sceneIdx + 1)} />
                </div>
                <AnimatePresence>
                  {sceneIdx === OPEN && (
                    <motion.div className="absolute inset-x-4 bottom-8" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: DUR.slow, ease: EASE.paper }}>
                      <div className="[&_a]:w-full [&>div]:flex-col">{ctas}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {debug && <p ref={debugRef} className="label-mono absolute bottom-16 right-3 rounded bg-black/60 px-2 py-1 text-green-400" />}
          </div>
        </div>
      </div>
      <div id="story-end" tabIndex={-1} className="outline-none" />
    </Section>
  );
}

export default function StorySection() {
  const site = useSiteTier();
  const off = import.meta.env.VITE_STORY_3D === 'off';
  if (off || !site.hero3d) return <StoryStills />;
  return <StoryStage mode={site.desktop ? 'film' : 'stories'} tier={site.tier} />;
}
