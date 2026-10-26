/**
 * Quick start (top of the Edit tab): the two fastest ways to a good box,
 * the "Find my box" guided wizard and the templates gallery.
 */

import { LayoutGrid, Wand2 } from 'lucide-react';

interface QuickStartProps {
  onWizard: () => void;
  onTemplates: () => void;
}

export default function QuickStart({ onWizard, onTemplates }: QuickStartProps) {
  const item =
    'group flex items-center gap-2.5 rounded-xl border border-border bg-card p-3 text-left transition-all duration-quick hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:hover:translate-y-0';
  return (
    <div className="grid grid-cols-2 gap-2">
      <button type="button" onClick={onWizard} className={item}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-base group-hover:rotate-12 motion-reduce:group-hover:rotate-0">
          <Wand2 className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold leading-tight">Find my box</span>
          <span className="block text-[11px] text-muted-foreground">4 quick questions</span>
        </span>
      </button>
      <button type="button" onClick={onTemplates} className={item}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-base group-hover:scale-110 motion-reduce:group-hover:scale-100">
          <LayoutGrid className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold leading-tight">Templates</span>
          <span className="block text-[11px] text-muted-foreground">Ready-made boxes</span>
        </span>
      </button>
    </div>
  );
}
