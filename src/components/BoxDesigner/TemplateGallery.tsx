/**
 * Templates gallery (#16, phase 2): category tabs, search, a box-style filter and visual cards that show the sticker
 * composition. One tap loads a template (the designer then folds the box up again). Only templates whose style has a
 * 3D model are listed.
 */

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import type { BoxDesign, BoxTemplate } from '@/types/boxDesigner';
import DesignerSheet from './DesignerSheet';
import TemplateThumb from './TemplateThumb';
import {
  availableTemplates,
  designFromTemplate,
  DesignTemplate,
  matchTemplates,
  TEMPLATE_CATEGORIES,
  TemplateCategory,
} from '@/lib/boxDesigner/templates';
import { styleName } from '@/lib/boxDesigner/styleAvailability';
import { getStyle } from '@/lib/boxDesigner/styles/registry';
import { useStickerLibrary } from '@/lib/boxDesigner/stickers/useStickerLibrary';
import { formatDimensions } from '@/lib/boxDesigner/units';
import { DUR, EASE, STAGGER } from '@/lib/motion/tokens';
import { DESIGNER_EVENTS, useDesignerTracker } from '@/lib/boxDesigner/funnel';

interface TemplateGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: BoxDesign;
  onApply: (design: BoxDesign, template: DesignTemplate) => void;
}

const chip = (active: boolean) =>
  `shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-quick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
    active ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-foreground/40'
  }`;

export default function TemplateGallery({ open, onOpenChange, current, onApply }: TemplateGalleryProps) {
  const track = useDesignerTracker();
  // the sticker manifests (small text modules) load only once the gallery has been opened
  useStickerLibrary(open);
  const templates = useMemo(() => availableTemplates(), []);
  const categories = TEMPLATE_CATEGORIES.filter((c) => templates.some((t) => t.category === c.id));
  const styles = useMemo(() => {
    const ids = Array.from(new Set(templates.map((t) => t.style)));
    return ids.map((id) => ({ id, label: styleName(id), long: getStyle(id).name })).sort((a, b) => a.label.localeCompare(b.label));
  }, [templates]);

  const [category, setCategory] = useState<TemplateCategory | 'all'>('all');
  const [query, setQuery] = useState('');
  const [style, setStyle] = useState<BoxTemplate | 'all'>('all');

  const shown = useMemo(() => {
    const byCategory = category === 'all' ? templates : templates.filter((t) => t.category === category);
    const byStyle = style === 'all' ? byCategory : byCategory.filter((t) => t.style === style);
    return matchTemplates(byStyle, query, (s) => getStyle(s).name);
  }, [templates, category, style, query]);

  const filtered = category !== 'all' || style !== 'all' || query.trim() !== '';
  const clear = () => {
    setCategory('all');
    setStyle('all');
    setQuery('');
  };
  const currentHasTemplates = templates.some((t) => t.style === current.template);

  return (
    <DesignerSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Start from a template"
      description="Pick a ready-made box. Everything stays editable: size, board, colours, artwork and cutouts."
      widthClass="max-w-4xl"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search: mango, cake, saree, gift..."
            aria-label="Search templates"
            className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-9 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value as BoxTemplate | 'all')}
          aria-label="Filter by box style"
          className="h-10 rounded-lg border border-input bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-52 sm:text-sm"
        >
          <option value="all">All box styles</option>
          {styles.map((s) => (
            <option key={s.id} value={s.id}>
              {s.long}
            </option>
          ))}
        </select>
      </div>

      <div className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Template categories">
        {[{ id: 'all' as const, label: 'All' }, ...categories].map((c) => (
          <button key={c.id} role="tab" aria-selected={category === c.id} onClick={() => setCategory(c.id)} className={chip(category === c.id)}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span aria-live="polite">
          {shown.length} {shown.length === 1 ? 'template' : 'templates'}
        </span>
        {currentHasTemplates && style !== current.template && (
          <button type="button" onClick={() => setStyle(current.template)} className="rounded-full border border-border px-2.5 py-1 hover:border-foreground/40">
            Only my box style ({styleName(current.template)})
          </button>
        )}
        {filtered && (
          <button type="button" onClick={clear} className="underline underline-offset-2 hover:text-foreground">
            Clear filters
          </button>
        )}
      </div>

      {shown.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No template matches. Try another word, or{' '}
          <button type="button" onClick={clear} className="underline underline-offset-2 hover:text-foreground">
            clear the filters
          </button>
          .
        </div>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {shown.map((t, i) => (
            <motion.li
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.base, ease: EASE.paper, delay: Math.min(i, 10) * STAGGER }}
            >
              <button
                type="button"
                onClick={() => {
                  // Analytics: template id and style only
                  track(DESIGNER_EVENTS.templateUsed, { template: t.id, style: t.style, ply: t.ply });
                  onApply(designFromTemplate(t, { unit: current.unit, quantity: current.quantity }), t);
                }}
                className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-all duration-quick hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:hover:translate-y-0"
              >
                <div className="flex aspect-[4/3] items-center justify-center bg-paper-100 p-2.5 sm:p-3">
                  <TemplateThumb
                    template={t}
                    marks
                    className="h-full w-full transition-transform duration-base group-hover:scale-[1.06] motion-reduce:group-hover:scale-100"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-0.5 p-2.5 sm:p-3">
                  <span className="text-sm font-semibold leading-tight">{t.name}</span>
                  <span className="line-clamp-2 text-xs text-muted-foreground">{t.blurb}</span>
                  <span className="mt-auto pt-1.5 text-[11px] text-muted-foreground tabular">
                    {styleName(t.style)} · {formatDimensions(t.dimensions, current.unit)} · {t.ply}
                  </span>
                </div>
              </button>
            </motion.li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted-foreground">Sample text and cutouts are placeholders. Replace them with yours in the Artwork tab.</p>
    </DesignerSheet>
  );
}
