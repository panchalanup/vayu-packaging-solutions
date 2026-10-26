/**
 * mm / cm / in segmented toggle (#24). Only changes how sizes are shown and typed; the design stays in cm.
 */

import type { LengthUnit } from '@/types/boxDesigner';
import { LENGTH_UNITS, UNIT_LABELS } from '@/lib/boxDesigner/units';
import { cn } from '@/lib/utils';

interface UnitToggleProps {
  value: LengthUnit;
  onChange: (unit: LengthUnit) => void;
  className?: string;
}

export default function UnitToggle({ value, onChange, className }: UnitToggleProps) {
  return (
    <div role="radiogroup" aria-label="Measurement unit" className={cn('inline-flex rounded-full border border-border bg-white p-0.5', className)}>
      {LENGTH_UNITS.map((unit) => {
        const active = unit === value;
        return (
          <button
            key={unit}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(unit)}
            className={cn(
              'min-w-9 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors duration-quick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active ? 'bg-ink-900 text-paper-50' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {UNIT_LABELS[unit]}
          </button>
        );
      })}
    </div>
  );
}
