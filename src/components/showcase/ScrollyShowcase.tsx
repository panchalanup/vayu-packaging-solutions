/**
 * One sticky "stage" that stays on screen while text scrolls past it. Two layouts share all the logic:
 *
 *   split  : text column left, stage card right (desktop); stage card pinned to the top, text underneath (mobile)
 *   cinema : the stage is the whole screen, dark, and the text sits over it (the /experience film)
 *
 * Why sticky and not a GSAP pin: a pinned section re-lays the page out and fights the mobile browser bars (the
 * classic scroll jump). Sticky is composited by the browser, so it cannot jump, and it needs no animation library.
 *
 * Smoothness budget:
 *  - one passive scroll listener, throttled to one animation frame, only while the stage is near the viewport
 *  - scroll position -> sceneFor() -> store.target(); the store eases the values and stops its own loop at rest
 *  - the store's output is written as CSS variables on the stage root (no React render per frame); layers read
 *    them as opacity / transform / dash-offset, i.e. compositor-friendly properties only
 *  - the 3D canvas is lazy, mounted only near the viewport, disposed when far away, never on the low tier
 */

import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { CropMarks } from '@/components/site/Decor';
import CanvasErrorBoundary from '@/components/BoxDesigner/CanvasErrorBoundary';
import BoxThumbnail from '@/components/BoxDesigner/BoxThumbnail';
import { useSiteTier } from '@/lib/motion/siteTier';
import { dielineForDesign } from '@/lib/boxDesigner/styles/designLayout';
import { DEFAULT_DESIGN } from '@/lib/boxDesigner/designCodec';
import { beatOf, phaseAndProgress, sceneFor, type Phase, type Scene, type StageDesign, type StageStore, type StageVariant } from '@/lib/showcase/stage';
import { useEventTracker } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';
import type { BoxFace } from '@/types/boxDesigner';
import DielineSvg from './DielineSvg';
import { StageContext, type StageApi } from './stageContext';
import { CINEMA_FILL_WIDE, FLAT_FILL } from './flat';

const ShowcaseCanvas = lazy(() => import('./ShowcaseCanvas'));

/** Scene channel -> CSS variable on the stage root */
const VARS: Partial<Record<keyof Scene, string>> = {
  three: '--s-three',
  poster: '--s-poster',
  ink: '--s-ink',
  ghost: '--s-ghost',
  shift: '--s-shift',
  lift: '--s-lift',
  cut: '--d-cut',
  score: '--d-score',
  panel: '--d-panel',
  depth: '--d-depth',
  glue: '--d-glue',
  blank: '--d-blank',
  legend: '--d-legend',
};

interface ScrollyShowcaseProps {
  /** Owned by the page so chapters outside the stage can read the same design */
  store: StageStore;
  layout?: 'split' | 'cinema';
  hero: ReactNode;
  unfold: ReactNode;
  anatomy: ReactNode;
  /** Pill shown on the stage (split layout) */
  caption?: (phase: Phase, beat: number) => { index: string; title: string };
  /** Drawn over the stage, inside the shared context (cinema captions) */
  overlay?: ReactNode;
}

/** Tracks a media query (re-renders only when it flips) */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => (typeof window === 'undefined' ? false : window.matchMedia(query).matches));
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return matches;
}

export default function ScrollyShowcase({ store, layout = 'split', hero, unfold, anatomy, caption, overlay }: ScrollyShowcaseProps) {
  const site = useSiteTier();
  const { trackEvent } = useEventTracker();
  const cinema = layout === 'cinema';
  const variant: StageVariant = cinema ? 'cinema' : 'story';

  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const design = useSyncExternalStore(store.subscribe, () => store.get().design);
  const highlight = useSyncExternalStore(store.subscribe, () => store.get().highlight);

  const [phase, setPhase] = useState<Phase>(1);
  const [beat, setBeat] = useState(0);
  const [slider, setSliderState] = useState(1);
  const [near, setNear] = useState(true);
  const nearRef = useRef(true);
  /** Schedules a scroll update; called when the stage comes back near the viewport */
  const kickRef = useRef<() => void>();
  const [mount3d, setMount3d] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const has3d = site.hero3d && ready && !failed;
  // the cinema film keeps the left third of a wide screen for words, so it frames the flat blank smaller there
  const wide = useMediaQuery('(min-width: 1024px)');
  // the caption pill sits low on a small card, so the flat blank is framed a little smaller there
  const flatFill = cinema ? (wide ? CINEMA_FILL_WIDE : FLAT_FILL) : wide ? FLAT_FILL : 0.74;
  const orbitScale = cinema ? (wide ? 1.55 : 1.45) : 1;

  const boxDesign = useMemo(() => ({ ...DEFAULT_DESIGN, template: design.template, dimensions: design.dims, colorHex: design.colorHex }), [design]);
  const dieline = useMemo(() => dielineForDesign(boxDesign), [boxDesign]);

  /** Everything the scroll handler needs, kept in a ref so it never re-subscribes */
  const inputs = useRef({ phase: 1 as Phase, p: 0, slider: 1, has3d: false });

  const retarget = useCallback((rate?: number) => {
    const i = inputs.current;
    // Reduced motion: no scrubbed unfold. Story: the stage stays on the hero scene and chapter 2 shows still frames.
    // Cinema: jump straight to the finished dieline once the film starts.
    const effective: Phase = site.reducedMotion && i.phase === 2 ? (cinema ? 3 : 1) : i.phase;
    const scene = sceneFor({ phase: effective, p: i.p, slider: i.slider, has3d: i.has3d, variant });
    if (site.reducedMotion) store.jump(scene);
    else store.target(scene, rate);
  }, [site.reducedMotion, store, cinema, variant]);

  // Cinema intro: the first time the 3D layer appears, the flat sheet folds itself up into the box
  const introDone = useRef(false);
  useEffect(() => {
    inputs.current.has3d = has3d;
    if (cinema && has3d && !introDone.current && !site.reducedMotion && inputs.current.phase === 1) {
      introDone.current = true;
      const s = sceneFor({ phase: 1, p: 0, slider: 1, has3d: true, variant });
      store.jump({ ...s, fold: 0, cam: 0.55 });
      const timer = window.setTimeout(() => store.target(s, 2.1), 450);
      return () => window.clearTimeout(timer);
    }
    retarget();
  }, [has3d, retarget, cinema, site.reducedMotion, store, variant]);

  const replay = useCallback(() => {
    if (site.reducedMotion || inputs.current.phase !== 1) return;
    const s = sceneFor({ phase: 1, p: 0, slider: 1, has3d: inputs.current.has3d, variant });
    store.jump({ ...s, fold: 0, cam: 0.55 });
    window.setTimeout(() => store.target(s, 2.1), 250);
  }, [site.reducedMotion, store, variant]);

  const setSlider = useCallback(
    (value: number) => {
      setSliderState(value);
      inputs.current.slider = value;
      retarget();
    },
    [retarget]
  );

  const setDesign = useCallback((next: Partial<StageDesign>) => store.setDesign(next), [store]);
  const setHighlight = useCallback((face: BoxFace | null) => store.setHighlight(face), [store]);

  // Write the eased scene to CSS variables (only the ones that changed) -------------------------------------
  useLayoutEffect(() => {
    const root = stageRef.current;
    if (!root) return;
    const written: Record<string, string> = {};
    const write = (scene: Scene) => {
      for (const key of Object.keys(VARS) as (keyof Scene)[]) {
        const name = VARS[key]!;
        const value = (Math.round(scene[key] * 1000) / 1000).toString();
        if (written[name] !== value) {
          written[name] = value;
          root.style.setProperty(name, value);
        }
      }
    };
    write(store.get().scene);
    return store.subscribe((s) => write(s.scene));
  }, [store]);

  // Scroll -> phase and progress -------------------------------------------------------------------------------
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const unfoldEl = wrap.querySelector<HTMLElement>('[data-unfold-range]');
    const anatomyEl = wrap.querySelector<HTMLElement>('[data-chapter="anatomy"]');
    if (!unfoldEl || !anatomyEl) return;

    let frame = 0;
    let lastPhase: Phase = 1;
    let lastBeat = -1;
    const update = () => {
      frame = 0;
      if (!nearRef.current) return;
      const u = unfoldEl.getBoundingClientRect();
      const a = anatomyEl.getBoundingClientRect();
      const { phase: next, p } = phaseAndProgress({ unfoldTop: u.top, unfoldHeight: u.height, anatomyTop: a.top }, window.innerHeight);
      inputs.current.phase = next;
      inputs.current.p = p;
      retarget();
      if (next !== lastPhase) {
        lastPhase = next;
        setPhase(next);
      }
      const b = next === 2 ? beatOf(p) : next === 3 ? 5 : 0;
      if (b !== lastBeat) {
        lastBeat = b;
        setBeat(b);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    kickRef.current = onScroll;
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      kickRef.current = undefined;
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [retarget]);

  // 3D: mount after load + idle on medium/high tiers, only while the stage is near the viewport ---------------
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        nearRef.current = entry.isIntersecting;
        setNear(entry.isIntersecting);
        // a jump (Home key, tap on the status bar) lands here after its only scroll event was skipped while far away,
        // which left the last scene's words over the hero
        if (entry.isIntersecting) kickRef.current?.();
      },
      { rootMargin: '120% 0px 120% 0px' }
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!site.hero3d || !near) {
      setMount3d(false);
      setReady(false);
      return;
    }
    let idle = 0;
    let timer = 0;
    const start = () => {
      if (typeof window.requestIdleCallback === 'function') idle = window.requestIdleCallback(() => setMount3d(true), { timeout: 2000 });
      else timer = window.setTimeout(() => setMount3d(true), 300);
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      window.removeEventListener('load', start);
      if (idle) window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
    };
  }, [site.hero3d, near]);

  const onReady = useCallback(() => setReady(true), []);
  const onFail = useCallback(() => {
    setFailed(true);
    setReady(false);
    trackEvent('showcase_3d_fallback', { tier: site.tier });
  }, [site.tier, trackEvent]);

  // Turntable runs by itself only on the high tier, in chapter 1, while 3D is showing
  useEffect(() => {
    store.setAutoSpin(site.tier === 'high' && !site.reducedMotion && has3d && phase === 1 && near);
  }, [store, site.tier, site.reducedMotion, has3d, phase, near]);

  // Drag to turn the box (mouse anywhere, touch sideways; vertical swipes still scroll the page) ----------------
  const spot = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; active: boolean } | null>(null);
  const turnable = cinema ? phase === 1 : phase !== 2;
  const onPointerDown = (e: React.PointerEvent) => {
    if (!turnable) return;
    drag.current = { x: e.clientX, y: e.clientY, active: e.pointerType === 'mouse' };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    // cinema, desktop: the box leans toward the cursor and a soft light follows it
    if (cinema && e.pointerType === 'mouse') {
      const r = e.currentTarget.getBoundingClientRect();
      if (phase === 1) store.setLook(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2);
      const light = spot.current;
      if (light) {
        light.style.transform = `translate3d(${(e.clientX - r.left - 450).toFixed(0)}px, ${(e.clientY - r.top - 450).toFixed(0)}px, 0)`;
        light.style.opacity = '1';
      }
    }
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.active && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      d.active = true;
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    }
    if (d.active) {
      store.nudgeSpin(dx * 0.45);
      d.x = e.clientX;
      d.y = e.clientY;
    }
  };
  const endDrag = () => {
    drag.current = null;
  };
  const onPointerLeave = () => {
    drag.current = null;
    if (cinema) {
      store.setLook(0, 0);
      if (spot.current) spot.current.style.opacity = '0';
    }
  };

  const api: StageApi = useMemo(
    () => ({ store, site, design, boxDesign, dieline, setDesign, phase, beat, slider, setSlider, highlight, setHighlight, has3d, replay }),
    [store, site, design, boxDesign, dieline, setDesign, phase, beat, slider, setSlider, highlight, setHighlight, has3d, replay]
  );

  const cap = caption?.(phase, beat);
  const inset = `${((1 - flatFill) / 2) * 100}%`;

  const stage = (
    <div
      ref={stageRef}
      className={cn(
        'group relative touch-pan-y select-none overflow-hidden',
        cinema
          ? 'h-full w-full bg-ink-900'
          : 'h-[42svh] min-h-[250px] max-h-[400px] rounded-2xl border border-foreground/10 bg-paper-100 shadow-paper lg:h-[min(calc(100svh-var(--nav-h)-32px),720px)] lg:max-h-none lg:min-h-[420px]'
      )}
      data-stage
      data-phase={phase}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={onPointerLeave}
      role="group"
      aria-label="Interactive box stage"
    >
      {cinema ? (
        // a soft brand glow behind the box; static, so it costs nothing per frame
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(55%_50%_at_62%_48%,rgb(61_186_90/0.16),transparent_70%)] max-lg:bg-[radial-gradient(70%_45%_at_50%_58%,rgb(61_186_90/0.16),transparent_70%)]" />
      ) : (
        <>
          {/* ink flood sits under the 3D layer so the box stays the star until it fades */}
          <div aria-hidden="true" className="absolute inset-0 bg-ink-900" style={{ opacity: 'var(--s-ink, 0)' }} />
          <CropMarks className="text-ink-900/35" />
        </>
      )}

      {cinema && (
        <>
          {/* a soft light that follows the cursor (desktop) */}
          <div
            ref={spot}
            data-fx="spot"
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 h-[900px] w-[900px] opacity-0 transition-opacity duration-300 will-change-transform"
            style={{ background: 'radial-gradient(closest-side, rgb(61 186 90 / 0.13), transparent)' }}
          />
        </>
      )}

      {/* faint dieline behind the hero box */}
      <div
        aria-hidden="true"
        data-fx="ghost"
        className="sc-shift absolute inset-[7%]"
        style={{ opacity: 'var(--s-ghost, 0)', ['--d-cut' as string]: 1, ['--d-score' as string]: 1 }}
      >
        <div className="h-full w-full opacity-70">
          <DielineSvg dieline={dieline} fit="contain" tone={cinema ? 'ink' : 'paper'} label="" className="[&_.dl-name]:hidden [&_.dl-sub]:hidden [&_.dl-dim-text]:hidden [&_.dl-dim]:hidden" />
        </div>
      </div>

      {/* the illustrated box: the stand-in when there is no 3D, and the first paint everywhere */}
      <div aria-hidden="true" className="sc-shift absolute inset-0 flex items-center justify-center p-[12%]" style={{ opacity: 'var(--s-poster, 1)' }}>
        <BoxThumbnail style={design.template} dimensions={design.dims} colorHex={design.colorHex} className="h-full w-full drop-shadow-xl" title="" />
      </div>

      {/* live 3D */}
      {mount3d && !failed && (
        <div className="sc-shift absolute inset-0" style={{ opacity: 'var(--s-three, 0)' }}>
          <CanvasErrorBoundary fallback={() => null} onError={onFail}>
            <Suspense fallback={null}>
              <ShowcaseCanvas store={store} tier={site.tier} onReady={onReady} onFail={onFail} flatFill={flatFill} orbitScale={orbitScale} lite={cinema} />
            </Suspense>
          </CanvasErrorBoundary>
        </div>
      )}

      {/* the unfolded dieline, revealed step by step */}
      <div aria-hidden="true" data-fx="dl" className="sc-shift pointer-events-none absolute inset-0" style={{ opacity: 'calc(var(--d-cut, 0) * 10)' }}>
        <div className="absolute" style={{ inset }}>
          <DielineSvg dieline={dieline} fit="contain" tone="ink" label="" laser={cinema ? store : undefined} />
        </div>
      </div>

      {cap && (
        // a solid pill, legible over paper, ink and the 3D box alike
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[1] flex">
          <p className="flex max-w-full items-baseline gap-2.5 rounded-full bg-ink-900 px-3.5 py-2 text-[13px] leading-tight text-paper-50 shadow-paper">
            <span className="label-mono shrink-0 text-green-400">{cap.index}</span>
            <span className="min-w-0 truncate font-medium sm:whitespace-normal">{cap.title}</span>
          </p>
        </div>
      )}
      {overlay}
    </div>
  );

  return (
    <StageContext.Provider value={api}>
      <div ref={wrapRef} className="relative">
        {cinema ? (
          <>
            {/* the stage fills the screen and stays; the scenes scroll over it */}
            <div data-theme="ink" className="sticky top-0 z-0 h-[100svh] w-full">
              {stage}
            </div>
            <div className="pointer-events-none relative z-10 -mt-[100svh]">
              <div data-chapter="hero">{hero}</div>
              <div>{unfold}</div>
              <div data-chapter="anatomy">{anatomy}</div>
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-content px-4 md:px-6 lg:grid lg:grid-cols-12 lg:gap-x-10 lg:px-10">
            {/* stage: `contents` on small screens so the sticky box lives in the tall container, a grid cell on large ones */}
            <div className="contents lg:col-span-7 lg:col-start-6 lg:row-span-3 lg:row-start-1 lg:block">
              <div className="sticky top-0 z-10 pt-2 md:top-[var(--nav-h)] md:pt-4 lg:pb-4">{stage}</div>
            </div>
            <div className="lg:col-span-5 lg:col-start-1 lg:row-start-1" data-chapter="hero">
              {hero}
            </div>
            <div className="lg:col-span-5 lg:col-start-1 lg:row-start-2">{unfold}</div>
            <div className="lg:col-span-5 lg:col-start-1 lg:row-start-3" data-chapter="anatomy">
              {anatomy}
            </div>
          </div>
        )}
      </div>
    </StageContext.Provider>
  );
}
