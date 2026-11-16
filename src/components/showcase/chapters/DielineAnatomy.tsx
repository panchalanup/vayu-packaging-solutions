/**
 * Chapter 3: "Anatomy of your PDF". The dieline is drawn like the printed page (white sheet, black cut, red dashed
 * fold, blue dimensions: the same colours as the downloaded file). Point at or tap a panel and the same face lights up
 * on the 3D box in the sticky stage; pick a hotspot to dim everything but what it explains.
 * Every explanation is real text in the page, so it works without hover, without 3D and for search engines.
 */

import { useId, useState } from 'react';
import { HOTSPOTS, type Hotspot } from '@/content/designerShowcase';
import { useEventTracker } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';
import DielineSvg from '../DielineSvg';
import { useAudience } from '../audienceContext';
import { useStage } from '../stageContext';

type Emphasis = 'cut' | 'fold' | 'panel' | 'glue' | 'flap' | 'blank' | null;
const EMPHASIS: Record<Hotspot['id'], Emphasis> = { cut: 'cut', fold: 'fold', panel: 'panel', glue: 'glue', flap: 'flap', blank: 'blank', legend: null };

function Swatch({ kind }: { kind: 'cut' | 'fold' | 'dim' }) {
  const colour = kind === 'cut' ? '#0F1A14' : kind === 'fold' ? '#d0021b' : '#0b5cad';
  return (
    <svg aria-hidden="true" viewBox="0 0 28 6" className="h-1.5 w-7 shrink-0">
      <line x1="0" y1="3" x2="28" y2="3" stroke={colour} strokeWidth={kind === 'dim' ? 1.2 : 2} strokeDasharray={kind === 'fold' ? '5 3' : undefined} />
    </svg>
  );
}

export default function DielineAnatomy() {
  const { audience, pick } = useAudience();
  const { dieline, slider, setSlider, highlight, setHighlight, design, has3d } = useStage();
  const { trackEvent } = useEventTracker();
  const [active, setActive] = useState<Hotspot['id']>('cut');
  // nothing is dimmed until the visitor picks a hotspot: the figure starts fully visible
  const [picked, setPicked] = useState(false);
  const sliderId = useId();

  // a hotspot only appears when this style really has the feature (a mailer has no glue flap line to measure)
  const spots = HOTSPOTS[audience].filter((h) => !h.needs || dieline.dims?.some((d) => d.group === h.needs));
  const current = spots.find((h) => h.id === active) ?? spots[0];

  return (
    <section id="anatomy" aria-labelledby="anatomy-h" className="scroll-mt-24 pb-16 pt-10 lg:pb-28 lg:pt-16">
      <p className="label-mono mb-4 text-muted-foreground">03 — Read your dieline</p>
      <h2 id="anatomy-h" className="font-display text-h2 text-balance">
        {pick({ buyer: 'Every line on your PDF, explained.', maker: 'Production-literate, line by line.' })}
      </h2>
      {/* the printed page */}
      <figure className="mt-6">
        <div className="relative rounded-lg bg-white p-3 pb-7 pl-8 shadow-paper ring-1 ring-ink-900/10 sm:p-5 sm:pb-8 sm:pl-9">
          <DielineSvg
            dieline={dieline}
            tone="paper"
            highlight={highlight}
            onFace={(face) => {
              setHighlight(face);
              if (face) trackEvent('showcase_hotspot', { id: 'panel', style: design.template });
            }}
            emphasis={picked ? EMPHASIS[active] : null}
            label={`Dieline of the ${design.template} box, flat: cut lines solid, fold lines dashed, sizes in millimetres`}
          />
          <ul className="label-mono mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-ink-900/10 pt-3 text-ink-500 normal-case tracking-normal">
            <li className="flex items-center gap-2">
              <Swatch kind="cut" /> Cut
            </li>
            <li className="flex items-center gap-2">
              <Swatch kind="fold" /> Fold
            </li>
            <li className="flex items-center gap-2">
              <Swatch kind="dim" /> Size, mm
            </li>
          </ul>
        </div>
        <figcaption className="mt-2 text-xs text-muted-foreground">
          Drawn from the same data as the PDF you download. On a phone, tap a panel.
        </figcaption>
      </figure>

      {/* hotspots */}
      <div className="mt-8" role="group" aria-label="What each part of the dieline means">
        <ul className="flex flex-wrap gap-2">
          {spots.map((h, i) => {
            const on = current?.id === h.id;
            return (
              <li key={h.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setActive(h.id);
                    setPicked(true);
                    trackEvent('showcase_hotspot', { id: h.id });
                  }}
                  className={cn(
                    'flex min-h-11 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-[background-color,border-color,color] duration-quick ease-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                    on ? 'border-primary bg-primary text-primary-foreground' : 'border-foreground/20 hover:border-foreground/40'
                  )}
                >
                  <span className={cn('label-mono', on ? 'text-primary-foreground/80' : 'text-muted-foreground')}>{i + 1}</span>
                  {h.title}
                </button>
              </li>
            );
          })}
        </ul>
        {current && (
          <p key={current.id} aria-live="polite" className="mt-4 max-w-[56ch] animate-in fade-in duration-300 rounded-lg border-l-2 border-green-600 bg-paper-100 px-4 py-3 text-ink-900">
            <strong className="font-semibold">{current.title}.</strong> {current.text}
          </p>
        )}
      </div>

      {/* flat <-> folded */}
      <div className="mt-8 rounded-xl border border-foreground/10 bg-paper-50 p-4">
        <label htmlFor={sliderId} className="label-mono mb-3 flex items-center justify-between text-muted-foreground">
          <span>Flat</span>
          <span className="text-ink-900">Fold the box</span>
          <span>Folded</span>
        </label>
        <input
          id={sliderId}
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={slider}
          onChange={(e) => setSlider(Number(e.target.value))}
          className="h-8 w-full cursor-pointer accent-[#23803A]"
          aria-valuetext={slider > 0.97 ? 'Folded' : slider < 0.03 ? 'Flat' : `${Math.round(slider * 100)} percent folded`}
        />
        {!has3d && <p className="mt-2 text-xs text-muted-foreground">The folding preview shows when the 3D view is available on your device.</p>}
      </div>
    </section>
  );
}
