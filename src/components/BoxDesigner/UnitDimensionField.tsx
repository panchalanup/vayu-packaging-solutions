/**
 * Dimension input that shows and accepts the chosen unit but reports centimetres.
 * Commits on blur / Enter only, so typing "12" never jumps to an intermediate value.
 */

import { useEffect, useId, useState } from 'react';
import { Label } from '@/components/ui/label';
import type { LengthUnit } from '@/types/boxDesigner';
import { parseLength, toUnit, UNIT_LABELS } from '@/lib/boxDesigner/units';

interface UnitDimensionFieldProps {
  label: string;
  /** cm */
  value: number;
  unit: LengthUnit;
  /** cm, already clamped to [min, max] */
  onCommit: (cm: number) => void;
  /** cm limits; omit for free values (e.g. product sizes) */
  min?: number;
  max?: number;
  describedBy?: string;
  /** Allow an empty field (reports NaN) */
  optional?: boolean;
}

export default function UnitDimensionField({ label, value, unit, onCommit, min, max, describedBy, optional }: UnitDimensionFieldProps) {
  const id = useId();
  const shown = Number.isFinite(value) ? String(toUnit(value, unit)) : '';
  const [text, setText] = useState(shown);
  useEffect(() => setText(shown), [shown]);

  const commit = (raw: string) => {
    if (optional && raw.trim() === '') {
      if (Number.isFinite(value)) onCommit(NaN);
      return;
    }
    const cm = parseLength(raw, unit);
    if (!Number.isFinite(cm)) {
      setText(shown);
      return;
    }
    let next = cm;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    next = Math.round(next * 100) / 100;
    setText(String(toUnit(next, unit)));
    if (next !== value) onCommit(next);
  };

  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <input
          id={id}
          inputMode="decimal"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={(e) => commit(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
          className="h-10 w-full rounded-md border border-border bg-white pl-3 pr-9 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          aria-describedby={describedBy}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/70">{UNIT_LABELS[unit]}</span>
      </div>
    </div>
  );
}
