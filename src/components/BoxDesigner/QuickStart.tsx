/**
 * Quick start (top of the Edit tab): the two fastest ways to a good box, the "Find my box" guided wizard and the
 * templates gallery, plus the most relevant few templates (ones for the current box style first, then popular ones)
 * that load in one tap. The row uses plain thumbnails so opening the designer never downloads the cutout library.
 */

import { useMemo } from 'react';
import { LayoutGrid, Wand2 } from 'lucide-react';
import type { BoxTemplate } from '@/types/boxDesigner';
import TemplateThumb from './TemplateThumb';
import { suggestedTemplates, type DesignTemplate } from '@/lib/boxDesigner/templates';

interface QuickStartProps {
  onWizard: () => void;
  onTemplates: () => void;
  /** Current box style (suggestions favour it) */
  style?: BoxTemplate;
  /** Load one suggested template */
  onTemplate?: (template: DesignTemplate) => void;
}

export default function QuickStart({ onWizard, onTemplates, style, onTemplate }: QuickStartProps) {
  const item =
    'group flex items-center gap-2.5 rounded-xl border border-border bg-card p-3 text-left transition-all duration-quick hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:hover:translate-y-0';
  const suggestions = useMemo(() => (style && onTemplate ? suggestedTemplates(style, 4) : []), [style, onTemplate]);
  return (
    <div className="space-y-2">
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

      {suggestions.length > 0 && (
        <div>
          <p className="label-mono mb-1.5 text-muted-foreground">Quick picks</p>
          <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" aria-label="Suggested templates">
            {suggestions.map((t) => (
              <li key={t.id} className="w-[88px] shrink-0">
                <button
                  type="button"
                  onClick={() => onTemplate?.(t)}
                  title={t.blurb}
                  className="group flex w-full flex-col items-center gap-1 rounded-lg border border-border bg-card p-1.5 text-center transition-colors duration-quick hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex aspect-[4/3] w-full items-center justify-center rounded-md bg-paper-100 p-1">
                    <TemplateThumb template={t} className="h-full w-full transition-transform duration-base group-hover:scale-105 motion-reduce:group-hover:scale-100" />
                  </span>
                  <span className="line-clamp-2 text-[11px] font-medium leading-tight">{t.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
