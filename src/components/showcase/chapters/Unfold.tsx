/**
 * Chapter 2: "The Unfold". The text column holds six captions; the sticky stage (ScrollyShowcase) opens the box,
 * lays it flat and draws the dieline as the reader scrolls. Each caption's block is as tall as its slice of the
 * animation, so a caption is highlighted exactly while the stage shows what it says.
 * Reduced motion: no scrubbing; the captions are plain and six still frames follow.
 */

import { useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { Cta } from '@/components/site/Cta';
import BoxThumbnail from '@/components/BoxDesigner/BoxThumbnail';
import { BEAT_STARTS } from '@/lib/showcase/stage';
import { UNFOLD_BEATS } from '@/content/designerShowcase';
import { useEventTracker } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';
import DielineSvg from '../DielineSvg';
import { useAudience } from '../audienceContext';
import { downloadDielinePdf } from '../downloads';
import { useStage } from '../stageContext';

/** Share of the animation each caption owns (from BEAT_STARTS, last one runs to 1) */
const SLICES = BEAT_STARTS.map((start, i) => (BEAT_STARTS[i + 1] ?? 1) - start);

/** Frames for reduced motion: what the stage would show at each caption */
const FRAMES: { title: string; vars: Record<string, number> | null }[] = [
  { title: 'Sealed', vars: null },
  { title: 'Cut lines', vars: { '--d-cut': 1, '--d-score': 0, '--d-panel': 0, '--d-depth': 0, '--d-glue': 0, '--d-blank': 0 } },
  { title: 'Fold lines', vars: { '--d-cut': 1, '--d-score': 1, '--d-panel': 0, '--d-depth': 0, '--d-glue': 0, '--d-blank': 0 } },
  { title: 'Panels in mm', vars: { '--d-cut': 1, '--d-score': 1, '--d-panel': 1, '--d-depth': 0, '--d-glue': 0, '--d-blank': 0 } },
  { title: 'Flaps and sheet', vars: { '--d-cut': 1, '--d-score': 1, '--d-panel': 1, '--d-depth': 1, '--d-glue': 1, '--d-blank': 1 } },
];

export default function Unfold() {
  const { audience, pick } = useAudience();
  const { phase, beat, boxDesign, design, dieline, site } = useStage();
  const { trackEvent } = useEventTracker();
  const [busy, setBusy] = useState(false);
  const beats = UNFOLD_BEATS[audience];
  const reduced = site.reducedMotion;

  const download = async () => {
    setBusy(true);
    try {
      await downloadDielinePdf(boxDesign);
      toast.success('Dieline PDF (1:1 mm) downloaded');
      trackEvent('showcase_pdf_download', { source: 'unfold', style: design.template });
    } catch {
      toast.error('Could not make the PDF. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const href = `/box-designer?${new URLSearchParams({
    style: design.template,
    l: String(design.dims.length),
    w: String(design.dims.width),
    h: String(design.dims.height),
  }).toString()}`;

  return (
    <section id="unfold" aria-labelledby="unfold-h" className="scroll-mt-24">
      <header className="pt-10 lg:pt-24">
        <p className="label-mono mb-4 text-muted-foreground">02 — The unfold</p>
        <h2 id="unfold-h" className="font-display text-h2 text-balance">
          {pick({ buyer: 'Every box starts flat.', maker: 'The same design, flat. No surprises.' })}
        </h2>
        {!reduced && (
          <a href="#anatomy" className="link-draw mt-2 inline-flex min-h-11 items-center text-sm text-muted-foreground hover:text-foreground">
            Skip the animation ↓
          </a>
        )}
      </header>

      <ol data-unfold-range className="mt-8 list-none [--unfold-len:250svh] lg:[--unfold-len:300svh]" aria-label="How the box unfolds">
        {beats.map((b, i) => {
          const active = phase === 2 ? beat === i : phase === 3 ? i === beats.length - 1 : i === 0;
          const last = i === beats.length - 1;
          return (
            <li
              key={b.title}
              aria-current={active ? 'step' : undefined}
              className={cn('flex flex-col items-start pb-6 transition-opacity duration-base ease-paper', reduced ? 'opacity-100' : active ? 'opacity-100' : 'opacity-40')}
              style={reduced ? undefined : { minHeight: `max(calc(${SLICES[i]} * var(--unfold-len)), ${last ? '34svh' : '12svh'})` }}
            >
              <p className="label-mono mb-2 text-muted-foreground">02.{i + 1}</p>
              <h3 className="font-display text-h3">{b.title}</h3>
              <p className="mt-2 max-w-[46ch] text-muted-foreground">{b.text}</p>
              {last && (
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={download}
                    disabled={busy}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground transition-[background-color,transform] duration-quick ease-paper hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Download aria-hidden="true" className="h-4 w-4" />
                    {busy ? 'Preparing…' : 'Download this PDF'}
                  </button>
                  <Cta id="showcase.unfold.open" intent="designer" variant="secondary" size="lg" href={href}>
                    Open in designer
                  </Cta>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {reduced && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2" aria-label="The unfold in six still frames">
          {FRAMES.map((f, i) => (
            <figure key={f.title} className="rounded-xl border border-foreground/10 bg-paper-50 p-3">
              <div className="flex h-40 items-center justify-center overflow-hidden rounded-lg bg-ink-900 p-3">
                {f.vars ? (
                  <div className="h-full w-full" style={f.vars as React.CSSProperties}>
                    <DielineSvg dieline={dieline} fit="contain" tone="ink" label={`${f.title}: dieline`} />
                  </div>
                ) : (
                  <BoxThumbnail style={design.template} dimensions={design.dims} colorHex={design.colorHex} className="h-full w-full" title="Sealed box" />
                )}
              </div>
              <figcaption className="label-mono mt-2 text-muted-foreground">
                02.{i + 1} · {f.title}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
