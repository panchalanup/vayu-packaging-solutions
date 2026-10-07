import type { ReactNode } from 'react';
import { Diamond } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  /** Mono index, e.g. "02 — STRENGTH" */
  index: string;
  title: ReactNode;
  lead?: ReactNode;
  id?: string;
  align?: 'left' | 'split';
  size?: 'h2' | 'display';
  className?: string;
}

export function SectionHeader({ index, title, lead, id, align = 'left', size = 'h2', className }: SectionHeaderProps) {
  const heading = (
    <h2 id={id} className={cn('font-display text-balance', size === 'display' ? 'text-display-l' : 'text-h2')}>
      {title}
    </h2>
  );
  if (align === 'split') {
    return (
      <header className={cn('grid gap-4 lg:grid-cols-12 lg:gap-8', className)}>
        <p className="label-mono text-muted-foreground lg:col-span-4 lg:pt-3">{index}</p>
        <div className="lg:col-span-8">
          {heading}
          {lead && <p className="mt-4 max-w-[68ch] text-body-l text-muted-foreground">{lead}</p>}
        </div>
      </header>
    );
  }
  return (
    <header className={cn('max-w-3xl', className)}>
      <p className="label-mono mb-4 text-muted-foreground">{index}</p>
      {heading}
      {lead && <p className="mt-4 max-w-[68ch] text-body-l text-muted-foreground">{lead}</p>}
    </header>
  );
}

export interface Fact {
  label: string;
  value: string;
}

/** MOQ · dispatch · ply · GST chips as a description list */
export function FactStrip({ facts, className }: { facts: Fact[]; className?: string }) {
  return (
    <dl
      className={cn(
        '-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0',
        className
      )}
    >
      {facts.map((fact) => (
        <div
          key={fact.label}
          className="flex shrink-0 snap-start items-baseline gap-2 rounded-md border border-foreground/15 px-3 py-2"
        >
          <dt className="label-mono text-muted-foreground">{fact.label}</dt>
          <dd className="tabular text-sm font-semibold">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export type MadeOrSourced = 'made' | 'sourced';

/** Open labelling of how a product reaches the buyer (text, not colour only) */
export function MadeSourcedBadge({ kind, className }: { kind: MadeOrSourced; className?: string }) {
  const made = kind === 'made';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        made ? 'border-green-600/40 text-green-700' : 'border-kraft-700/40 text-kraft-700',
        className
      )}
    >
      <Diamond aria-hidden="true" className={cn('h-3 w-3', made && 'fill-current')} />
      {made ? 'Custom-made to order' : 'Sourced & QC-checked'}
    </span>
  );
}
