/**
 * Chapter 1: "Design a box in 60 seconds". The visitor types a size and the stage (3D box, illustrated box and the
 * ghost dieline) follows; the button then opens the real designer at that exact size.
 * The H1 is plain static text (it is the LCP element); only one word cycles, in CSS, with all words stacked so the
 * line never reflows.
 */

import { useEffect, useId, useRef, useState } from 'react';
import { Cta } from '@/components/site/Cta';
import { HERO_COPY, HERO_FACTS, HERO_STYLES, SHOWCASE_PATH } from '@/content/designerShowcase';
import { DIMENSION_LIMITS } from '@/lib/boxDesigner/constants';
import { getStyle } from '@/lib/boxDesigner/styles';
import { UNIT_DECIMALS, fromUnit, toUnit } from '@/lib/boxDesigner/units';
import { useEventTracker } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';
import type { BoxTemplate, LengthUnit } from '@/types/boxDesigner';
import AudienceSwitch from '../AudienceSwitch';
import { useAudience } from '../audienceContext';
import { useStage } from '../stageContext';

const FIELDS = [
  { key: 'length', label: 'Length' },
  { key: 'width', label: 'Width' },
  { key: 'height', label: 'Height' },
] as const;

const UNITS: LengthUnit[] = ['mm', 'cm', 'in'];

/** One typed dimension: keeps what the visitor is typing, commits only valid numbers inside the limits */
function SizeField({ label, cm, unit, onCommit }: { label: string; cm: number; unit: LengthUnit; onCommit: (cm: number) => void }) {
  const id = useId();
  const [text, setText] = useState(() => String(toUnit(cm, unit)));
  const editing = useRef(false);
  const min = toUnit(DIMENSION_LIMITS.min, unit);
  const max = toUnit(DIMENSION_LIMITS.max, unit);
  const parsed = Number(text.replace(',', '.'));
  const valid = text.trim() !== '' && Number.isFinite(parsed) && parsed >= min && parsed <= max;

  // follow outside changes (unit switch, style switch) unless the visitor is typing
  useEffect(() => {
    if (!editing.current) setText(String(toUnit(cm, unit)));
  }, [cm, unit]);

  return (
    <div className="min-w-0 flex-1">
      <label htmlFor={id} className="label-mono mb-1.5 block text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        value={text}
        aria-invalid={!valid}
        aria-describedby={`${id}-hint`}
        onFocus={() => {
          editing.current = true;
        }}
        onChange={(e) => {
          const next = e.target.value;
          setText(next);
          const n = Number(next.replace(',', '.'));
          if (next.trim() !== '' && Number.isFinite(n) && n >= min && n <= max) onCommit(fromUnit(n, unit));
        }}
        onBlur={() => {
          editing.current = false;
          if (!valid) setText(String(toUnit(cm, unit)));
          else setText(String(Math.round(parsed * 10 ** UNIT_DECIMALS[unit]) / 10 ** UNIT_DECIMALS[unit]));
        }}
        className={cn(
          'tabular h-12 w-full rounded-md border bg-paper-50 px-3 text-base font-medium text-foreground shadow-inner transition-colors duration-quick',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          valid ? 'border-foreground/20' : 'border-error-700'
        )}
      />
      <span id={`${id}-hint`} className={cn('mt-1 block text-xs', valid ? 'sr-only' : 'text-error-700')}>
        {valid ? `${min} to ${max} ${unit}` : `Enter ${min} to ${max} ${unit}`}
      </span>
    </div>
  );
}

/** "fold -> open -> ship": the words are stacked in one grid cell, so the heading never changes width */
function RotatingWord() {
  const words = ['fold', 'open', 'ship'];
  return (
    <span className="relative inline-grid align-baseline text-green-600" aria-hidden="true">
      {words.map((w, i) => (
        <span key={w} className="sc-word col-start-1 row-start-1" style={{ animationDelay: `${i * 3}s` }}>
          {w}
        </span>
      ))}
    </span>
  );
}

export default function HeroDesign() {
  const { audience, setAudience, pick } = useAudience();
  const { design, setDesign } = useStage();
  const { trackEvent } = useEventTracker();
  const copy = HERO_COPY[audience];
  const [unit, setUnit] = useState<LengthUnit>('mm');
  const touched = useRef(false);

  const chooseStyle = (id: BoxTemplate) => {
    // until the visitor types a size, a new style shows its own natural size
    setDesign(touched.current ? { template: id } : { template: id, dims: { ...getStyle(id).defaultDims } });
    trackEvent('showcase_hero_style', { style: id });
  };

  const href = `/box-designer?${new URLSearchParams({
    style: design.template,
    l: String(design.dims.length),
    w: String(design.dims.width),
    h: String(design.dims.height),
  }).toString()}`;

  const other = audience === 'buyer' ? 'maker' : 'buyer';

  return (
    <section
      aria-labelledby="showcase-h1"
      className="flex flex-col justify-center pb-12 pt-6 lg:min-h-[calc(100svh-var(--nav-h)-32px)] lg:py-10"
    >
      <p className="label-mono mb-4 text-muted-foreground">{copy.eyebrow}</p>

      {/* LCP element: static text, no entrance animation */}
      {audience === 'buyer' ? (
        <h1 id="showcase-h1" className="font-display text-display-xl text-balance">
          Design your box. See it <RotatingWord />
          <span className="sr-only">fold</span> in 3D. Download the dieline.
        </h1>
      ) : (
        <h1 id="showcase-h1" className="font-display text-display-xl text-balance">
          {copy.headline}
        </h1>
      )}

      <p className="mt-5 max-w-[52ch] text-body-l text-muted-foreground">{copy.sub}</p>

      <div className="mt-6 lg:hidden">
        <AudienceSwitch />
      </div>

      <fieldset className="mt-7 border-0 p-0">
        <legend className="label-mono mb-3 text-muted-foreground">Your box: inside size</legend>
        <div className="flex items-end gap-2.5">
          {FIELDS.map((f) => (
            <SizeField
              key={f.key}
              label={f.label}
              cm={design.dims[f.key]}
              unit={unit}
              onCommit={(cm) => {
                touched.current = true;
                setDesign({ dims: { [f.key]: cm } as Partial<typeof design.dims> as typeof design.dims });
                trackEvent('showcase_hero_size_change', { unit, style: design.template });
              }}
            />
          ))}
          <div className="w-[4.5rem] shrink-0">
            <label htmlFor="showcase-unit" className="label-mono mb-1.5 block text-muted-foreground">
              Unit
            </label>
            <select
              id="showcase-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value as LengthUnit)}
              className="h-12 w-full rounded-md border border-foreground/20 bg-paper-50 px-2 text-base font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div role="radiogroup" aria-label="Box style" className="mt-4 flex flex-wrap gap-2">
          {HERO_STYLES.map((s) => {
            const active = design.template === s.id;
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => chooseStyle(s.id)}
                className={cn(
                  'min-h-11 rounded-full border px-4 text-sm font-medium transition-[background-color,border-color,color] duration-quick ease-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                  active ? 'border-primary bg-primary text-primary-foreground' : 'border-foreground/20 bg-transparent hover:border-foreground/40'
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-7 flex flex-wrap gap-3">
        <Cta id="showcase.hero.open" intent="designer" href={href} size="lg" arrow meta={{ audience, style: design.template }}>
          {copy.primary}
        </Cta>
        <button
          type="button"
          onClick={() => {
            setAudience(other, 'cta');
            document.getElementById('share')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
          }}
          className="inline-flex min-h-12 items-center justify-center rounded-lg border border-foreground/20 px-6 text-base font-semibold transition-[background-color,border-color] duration-quick ease-paper hover:border-foreground/40 hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {copy.secondary}
        </button>
      </div>

      <ul className="label-mono mt-6 flex flex-wrap gap-x-4 gap-y-1.5 text-muted-foreground">
        {HERO_FACTS.map((f) => (
          <li key={f} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-green-600" />
            {f}
          </li>
        ))}
      </ul>
      <p className="sr-only">{pick({ buyer: 'Showing the page for people who buy boxes.', maker: 'Showing the page for box manufacturers.' })}</p>
      <a href={`${SHOWCASE_PATH}#unfold`} className="sr-only focus:not-sr-only focus:mt-4 focus:underline">
        Skip to how it works
      </a>
    </section>
  );
}
