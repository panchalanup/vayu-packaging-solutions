/**
 * Building blocks shared by the free calculators (/tools/<slug>): unit-aware size fields, number fields, segmented
 * choices, result tiles and the analytics hook. Everything runs in the browser; nothing is stored or sent.
 * PRIVACY: the only analytics payload is the tool slug (no inputs, no results).
 */

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import type { BoxDimensions, LengthUnit } from '@/types/boxDesigner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useEventTracker } from '@/hooks/useAnalytics';
import UnitToggle from '@/components/BoxDesigner/UnitToggle';
import { UNIT_LABELS, parseLength, toUnit } from '@/lib/boxDesigner/units';
import { validDims } from '@/lib/tools/shared';

export { UnitToggle };

const unitText = (cm: number, unit: LengthUnit) => String(toUnit(cm, unit));

interface LengthFieldProps {
  label: string;
  /** Value in cm (NaN when empty or not a number) */
  cm: number;
  unit: LengthUnit;
  onChange: (cm: number) => void;
  hint?: string;
  className?: string;
}

/** A size typed in the chosen unit; the value is kept in cm */
export function LengthField({ label, cm, unit, onChange, hint, className }: LengthFieldProps) {
  const id = useId();
  const [text, setText] = useState(() => (Number.isFinite(cm) ? unitText(cm, unit) : ''));
  const cmRef = useRef(cm);
  cmRef.current = cm;
  const lastUnit = useRef(unit);

  // Unit switched: show the same size in the new unit
  useEffect(() => {
    if (lastUnit.current !== unit) {
      lastUnit.current = unit;
      setText(Number.isFinite(cmRef.current) ? unitText(cmRef.current, unit) : '');
    }
  }, [unit]);

  // Value changed from outside (a preset, "use suggested size"): follow it, but never fight typing
  useEffect(() => {
    if (lastUnit.current !== unit || !Number.isFinite(cm)) return;
    const parsed = parseLength(text, unit);
    if (!(Math.abs(parsed - cm) < 0.006)) setText(unitText(cm, unit));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cm]);

  return (
    <div className={cn('min-w-0', className)}>
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <div className="relative mt-1.5">
        <Input
          id={id}
          value={text}
          inputMode="decimal"
          autoComplete="off"
          onChange={(e) => {
            setText(e.target.value);
            onChange(parseLength(e.target.value, unit));
          }}
          className="h-11 pr-10 tabular"
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
          {UNIT_LABELS[unit]}
        </span>
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

interface DimsFieldsProps {
  value: BoxDimensions;
  unit: LengthUnit;
  onChange: (next: BoxDimensions) => void;
  labels?: [string, string, string];
}

/** Length, width and height side by side */
export function DimsFields({ value, unit, onChange, labels = ['Length', 'Width', 'Height'] }: DimsFieldsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <LengthField label={labels[0]} cm={value.length} unit={unit} onChange={(length) => onChange({ ...value, length })} />
      <LengthField label={labels[1]} cm={value.width} unit={unit} onChange={(width) => onChange({ ...value, width })} />
      <LengthField label={labels[2]} cm={value.height} unit={unit} onChange={(height) => onChange({ ...value, height })} />
    </div>
  );
}

interface NumberFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  hint?: string;
  placeholder?: string;
  className?: string;
}

export function NumberField({ label, value, onChange, suffix, hint, placeholder, className }: NumberFieldProps) {
  const id = useId();
  return (
    <div className={cn('min-w-0', className)}>
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <div className="relative mt-1.5">
        <Input
          id={id}
          value={value}
          placeholder={placeholder}
          inputMode="decimal"
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
          className={cn('h-11 tabular', suffix && 'pr-12')}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        {suffix && (
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

interface SegmentedProps<T extends string | number> {
  label: string;
  value: T;
  options: readonly { value: NoInfer<T>; label: string }[];
  onChange: (value: NoInfer<T>) => void;
  className?: string;
}

/** Radio-style pills for a small set of choices */
export function Segmented<T extends string | number>({ label, value, options, onChange, className }: SegmentedProps<T>) {
  return (
    <div className={className}>
      <p className="text-sm font-medium leading-none">{label}</p>
      <div role="radiogroup" aria-label={label} className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={String(o.value)}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={cn(
                'min-h-10 rounded-full border px-3.5 text-sm font-medium transition-colors duration-quick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active ? 'border-ink-900 bg-ink-900 text-paper-50' : 'border-border bg-card text-foreground hover:border-foreground/40'
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Unit toggle with its label, shown once per calculator */
export function UnitBar({ unit, onChange, note }: { unit: LengthUnit; onChange: (u: LengthUnit) => void; note?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-muted-foreground">{note ?? 'Sizes in'}</p>
      <UnitToggle value={unit} onChange={onChange} />
    </div>
  );
}

/** Inputs on one side, live results on the other (stacked on mobile) */
export function CalcShell({ inputs, results }: { inputs: ReactNode; results: ReactNode }) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <div className="space-y-5 rounded-2xl border border-border bg-card p-5 md:p-6">{inputs}</div>
      <div className="space-y-4" aria-live="polite">
        {results}
      </div>
    </div>
  );
}

export function Stat({ label, value, note, tone = 'plain', className }: { label: string; value: ReactNode; note?: ReactNode; tone?: 'plain' | 'key' | 'warn'; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        tone === 'key' && 'border-primary/40 bg-primary/5',
        tone === 'warn' && 'border-amber-500/40 bg-amber-50',
        tone === 'plain' && 'border-border bg-card',
        className
      )}
    >
      <p className="label-mono text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl tabular text-foreground">{value}</p>
      {note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}
    </div>
  );
}

/** Plain-language meaning of the result */
export function Meaning({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-paper-100 p-4 text-sm leading-relaxed text-foreground">{children}</p>;
}

export function Warning({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-amber-500/40 bg-amber-50 p-3 text-sm text-amber-900">{children}</p>;
}

export function EmptyResult({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{children}</p>;
}

/** Disclaimer line under the results */
export function Disclaimer({ children }: { children: ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}

export const dimsOrNull = (d: BoxDimensions): BoxDimensions | null => (validDims(d) ? d : null);

/**
 * tool_calculate: fired (after a short pause) when the person changes an input and a result exists.
 * `signature` changes with the inputs; pass '' when there is no result yet. Capped per page view.
 */
export function useCalculateTracker(slug: string, signature: string) {
  const { trackEvent } = useEventTracker();
  const first = useRef(true);
  const sent = useRef(0);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!signature || sent.current >= 5) return;
    const timer = window.setTimeout(() => {
      sent.current += 1;
      trackEvent('tool_calculate', { tool: slug });
    }, 1500);
    return () => window.clearTimeout(timer);
    // trackEvent is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);
}
