/**
 * The scenes that sit over the sticky stage in the /experience film (hero, unfold, print). Few words, large type:
 * one composition for every scene, words on the left of a wide screen (top of a phone) and the visual opposite.
 * They live on a content layer that ignores the pointer except for buttons, so dragging and leaning the box works.
 * The print buttons are part of the same text block as the big word (not a separate layer), so they can never overlap it.
 */

import { useState } from 'react';
import { ArrowDown, Download, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Cta } from '@/components/site/Cta';
import { BOX_COLOR_OPTIONS } from '@/lib/boxDesigner/constants';
import { getStyle } from '@/lib/boxDesigner/styles';
import { HERO_STYLES, UNFOLD_BEATS } from '@/content/designerShowcase';
import { useEventTracker } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';
import type { BoxTemplate } from '@/types/boxDesigner';
import { downloadDielinePdf, downloadDielineSvg } from '../downloads';
import { useStage } from '../stageContext';
import { Magnetic } from '../fx/pointerFx';
import { SplitWords } from '../fx/SplitWords';

/** Colours offered as dots: enough to feel it, few enough to read as a choice */
const DOT_IDS = ['kraft', 'white', 'black', 'red', 'blue', 'green'];
const DOTS = BOX_COLOR_OPTIONS.filter((c) => DOT_IDS.includes(c.id));

/** One word per beat of the unfold */
export const CINEMA_WORDS = ['Sealed.', 'Open.', 'Flat.', 'Cut. Fold.', 'Measured.', 'Print-ready.'] as const;

/** Things the tool does, floating around the hero box on a wide screen */
const CHIPS = [
  { label: '3D preview', style: { left: '50%', top: '17%' } },
  { label: '1:1 dieline', style: { left: '84%', top: '19%' } },
  { label: 'Share link', style: { left: '87%', top: '71%' } },
  { label: 'Instant ₹ price', style: { left: '49%', top: '79%' } },
] as const;

/** Type size that respects both the width and the height of the screen, so a short wide window never overflows */
const bigType = 'text-[clamp(2.7rem,12.5vw,3.9rem)] lg:text-[clamp(2.8rem,min(5.2vw,11svh),5.6rem)]';

export function CinemaHero() {
  const { design, setDesign, replay, has3d } = useStage();
  const { trackEvent } = useEventTracker();
  const href = `/box-designer?${new URLSearchParams({ style: design.template, l: String(design.dims.length), w: String(design.dims.width), h: String(design.dims.height) }).toString()}`;

  const chooseStyle = (id: BoxTemplate) => {
    setDesign({ template: id, dims: { ...getStyle(id).defaultDims } });
    trackEvent('experience_style', { style: id });
  };

  return (
    <section aria-labelledby="exp-h1" className="relative h-[100svh] min-h-[560px] text-paper-50">
      <div className="relative mx-auto h-full max-w-content px-4 md:px-6 lg:px-10">
        <div className="pointer-events-none absolute inset-x-4 top-[15svh] md:inset-x-6 lg:inset-x-10 lg:top-1/2 lg:max-w-[44%] lg:-translate-y-1/2">
          <p className="label-mono sc-rise text-green-400" style={{ ['--i' as string]: 0 }}>
            3D Box Designer
          </p>
          <h1 id="exp-h1" className={cn('mt-4 font-display leading-[0.95] tracking-tight', bigType)} aria-label="Design a box. Watch it fold.">
            <SplitWords text="Design a box." mount className="block" delay={150} />
            <SplitWords text="Watch it fold." mount className="block" delay={420} accent={['fold']} />
          </h1>
          <div className="sc-rise pointer-events-auto mt-7" style={{ ['--i' as string]: 4 }}>
            <Magnetic>
              <Cta id="experience.hero.open" intent="designer" href={href} size="lg" arrow>
                Open the designer
              </Cta>
            </Magnetic>
          </div>
        </div>

        {/* floating labels (wide screens): what the tool does, bobbing around the box */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
          {CHIPS.map((c, i) => (
            <span key={c.label} className="sc-rise absolute" style={{ ...c.style, ['--i' as string]: 9 + i }}>
              <span
                className="sc-chip flex items-center gap-2 rounded-full border border-paper-50/15 bg-ink-800/90 px-3.5 py-2 text-[13px] font-medium text-paper-100 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.6)]"
                style={{ ['--i' as string]: i }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                {c.label}
              </span>
            </span>
          ))}
        </div>

        {/* a colour and a style, a way to watch it fold again, and a hint */}
        <div
          className="sc-rise pointer-events-auto absolute inset-x-4 bottom-[8svh] flex flex-wrap items-center gap-x-5 gap-y-3 max-md:bottom-[calc(var(--mobile-bar-h)+env(safe-area-inset-bottom)+20px)] md:inset-x-6 lg:inset-x-10"
          style={{ ['--i' as string]: 6 }}
        >
          <div role="radiogroup" aria-label="Box colour" className="flex items-center">
            {DOTS.map((c) => {
              const on = design.colorHex === c.color;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={c.name}
                  onClick={() => {
                    setDesign({ colorHex: c.color });
                    trackEvent('experience_colour', { colour: c.id });
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <span
                    className={cn('block h-6 w-6 rounded-full border transition-[transform,box-shadow] duration-quick ease-paper', on ? 'scale-125 border-paper-50 shadow-[0_0_0_3px_rgb(251_248_243/0.25)]' : 'border-paper-50/30')}
                    style={{ backgroundColor: c.color }}
                  />
                </button>
              );
            })}
          </div>
          <div role="radiogroup" aria-label="Box style" className="flex flex-wrap gap-2">
            {HERO_STYLES.map((s) => {
              const on = design.template === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => chooseStyle(s.id)}
                  className={cn(
                    'min-h-11 rounded-full border px-4 text-sm font-medium transition-[background-color,border-color,color] duration-quick ease-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
                    on ? 'border-paper-50 bg-paper-50 text-ink-900' : 'border-paper-50/25 text-paper-100 hover:border-paper-50/60'
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          {has3d && (
            <button
              type="button"
              onClick={() => {
                replay();
                trackEvent('experience_replay', {});
              }}
              className="group flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-paper-100 hover:text-green-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4 transition-transform duration-slow ease-paper group-hover:-rotate-[360deg]" />
              <span className="max-sm:sr-only">Fold again</span>
            </button>
          )}
          <span className="label-mono hidden text-paper-muted md:block">Drag to turn</span>
        </div>

        <div aria-hidden="true" className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-paper-muted max-md:hidden">
          <span className="sc-cue block h-6 w-px bg-current" />
          <ArrowDown className="h-3.5 w-3.5" />
        </div>
      </div>
    </section>
  );
}

/** The scroll space of the unfold. The words live on the stage, so this is just distance (and a text alternative). */
export function CinemaUnfold() {
  return (
    <section aria-label="The box unfolds into a dieline" data-unfold-range className="h-[380svh] md:h-[420svh]">
      <ol className="sr-only">
        {UNFOLD_BEATS.buyer.map((b) => (
          <li key={b.title}>
            {b.title}. {b.text}
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * The giant word on the stage, one per beat, rising in and lifting out (opacity and transform only). On the last beat
 * the download buttons appear in the same block, under the word, so they flow with it and never sit on top of it.
 */
export function CinemaWords() {
  const { phase, beat, boxDesign, design } = useStage();
  const { trackEvent } = useEventTracker();
  const [busy, setBusy] = useState<'pdf' | 'svg' | null>(null);
  const active = phase === 1 ? -1 : beat;
  const last = active === CINEMA_WORDS.length - 1;

  const run = async (kind: 'pdf' | 'svg') => {
    setBusy(kind);
    try {
      if (kind === 'pdf') await downloadDielinePdf(boxDesign);
      else downloadDielineSvg(boxDesign);
      toast.success(kind === 'pdf' ? 'Dieline PDF (1:1 mm) downloaded' : 'Dieline SVG (1:1 mm) downloaded');
      trackEvent('experience_download', { format: kind, style: design.template });
    } catch (error) {
      console.error('[experience] dieline export failed', error);
      toast.error('Could not make the file. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-[1]">
      {/* same grid as the hero text, so the words never jump sideways between scenes */}
      <div className="relative mx-auto h-full max-w-content px-4 md:px-6 lg:px-10">
        <div className="absolute inset-x-4 top-[13svh] md:inset-x-6 lg:inset-x-10 lg:top-1/2 lg:max-w-[44%] lg:-translate-y-1/2">
          <p aria-hidden="true" className={cn('label-mono mb-3 text-green-400 transition-opacity duration-base ease-paper', active < 0 && 'opacity-0')}>
            02.{Math.max(active, 0) + 1}
          </p>
          <div aria-hidden="true" className="grid">
            {CINEMA_WORDS.map((w, i) => (
              <span
                key={w}
                className={cn(
                  'col-start-1 row-start-1 whitespace-nowrap font-display leading-[0.92] tracking-tight text-paper-50 transition-[opacity,transform] duration-500 ease-paper',
                  bigType,
                  i === active ? 'translate-y-0 opacity-100' : i < active ? '-translate-y-6 opacity-0' : 'translate-y-6 opacity-0'
                )}
              >
                {w}
              </span>
            ))}
          </div>
          <div aria-hidden="true" className={cn('mt-5 flex gap-1.5 transition-opacity duration-base', active < 0 && 'opacity-0')}>
            {CINEMA_WORDS.map((w, i) => (
              <span key={w} className="h-0.5 w-8 overflow-hidden rounded bg-paper-50/20">
                <span className={cn('block h-full origin-left bg-green-400 transition-transform duration-base ease-paper', i <= active ? 'scale-x-100' : 'scale-x-0')} />
              </span>
            ))}
          </div>

          {/* the file, offered on the last beat */}
          <div className={cn('mt-7 transition-[opacity,transform] duration-500 ease-paper', last ? 'pointer-events-auto visible translate-y-0 opacity-100' : 'invisible translate-y-3 opacity-0')}>
            <p className="label-mono mb-3 text-paper-muted">1:1 · mm · cut, fold, sizes</p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => run('pdf')}
                disabled={busy !== null}
                tabIndex={last ? 0 : -1}
                className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-green-400 px-6 text-base font-semibold text-ink-900 transition-[background-color,transform] duration-quick ease-paper hover:bg-green-400/90 active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
              >
                <Download aria-hidden="true" className="h-4 w-4" />
                {busy === 'pdf' ? 'Preparing…' : 'Download PDF'}
              </button>
              <button
                type="button"
                onClick={() => run('svg')}
                disabled={busy !== null}
                tabIndex={last ? 0 : -1}
                className="inline-flex min-h-12 items-center rounded-lg border border-paper-50/30 px-5 text-base font-semibold transition-colors duration-quick hover:bg-paper-50/10 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                SVG
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Scroll space for the last beat, so there is time to use the buttons before the stage lets go */
export function CinemaPrint() {
  return (
    <section aria-labelledby="exp-print-h" className="h-[120svh]">
      <h2 id="exp-print-h" className="sr-only">
        Print-ready dieline
      </h2>
    </section>
  );
}
