/**
 * Templates gallery (#16): visual cards grouped by use, one tap to start from a template.
 * Only templates whose style has a 3D model are listed.
 */

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { BoxDesign } from '@/types/boxDesigner';
import DesignerSheet from './DesignerSheet';
import BoxThumbnail from './BoxThumbnail';
import { availableTemplates, designFromTemplate, DesignTemplate, TEMPLATE_CATEGORIES, TemplateCategory } from '@/lib/boxDesigner/templates';
import { templateArtUrl } from '@/lib/boxDesigner/templateArt';
import { styleName } from '@/lib/boxDesigner/styleAvailability';
import { formatDimensions } from '@/lib/boxDesigner/units';
import { DUR, EASE, STAGGER } from '@/lib/motion/tokens';
import { DESIGNER_EVENTS, useDesignerTracker } from '@/lib/boxDesigner/funnel';

interface TemplateGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: BoxDesign;
  onApply: (design: BoxDesign, template: DesignTemplate) => void;
}

export default function TemplateGallery({ open, onOpenChange, current, onApply }: TemplateGalleryProps) {
  const track = useDesignerTracker();
  const templates = useMemo(() => availableTemplates(), []);
  const categories = TEMPLATE_CATEGORIES.filter((c) => templates.some((t) => t.category === c.id));
  const [category, setCategory] = useState<TemplateCategory | 'all'>('all');
  const shown = category === 'all' ? templates : templates.filter((t) => t.category === category);

  return (
    <DesignerSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Start from a template"
      description="Pick a ready-made box. Everything stays editable: size, board, colours and artwork."
      widthClass="max-w-3xl"
    >
      <div className="flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Template categories">
        {[{ id: 'all' as const, label: 'All' }, ...categories].map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={category === c.id}
            onClick={() => setCategory(c.id)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-quick ${
              category === c.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-foreground/40'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {shown.map((t, i) => (
          <motion.li
            key={t.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.base, ease: EASE.paper, delay: i * STAGGER }}
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
              <div className="flex aspect-[4/3] items-center justify-center bg-paper-100 p-3">
                <BoxThumbnail
                  style={t.style}
                  dimensions={t.dimensions}
                  colorHex={t.colorHex}
                  artUrl={t.art ? templateArtUrl(t.art.id) : null}
                  className="h-full w-full transition-transform duration-base group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
                  title={t.name}
                />
              </div>
              <div className="flex flex-1 flex-col gap-0.5 p-3">
                <span className="text-sm font-semibold leading-tight">{t.name}</span>
                <span className="text-xs text-muted-foreground">{t.blurb}</span>
                <span className="mt-auto pt-1.5 text-[11px] text-muted-foreground tabular">
                  {styleName(t.style)} · {formatDimensions(t.dimensions, current.unit)} · {t.ply}
                </span>
              </div>
            </button>
          </motion.li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">Sample logos are placeholders. Replace them with yours in the Artwork tab.</p>
    </DesignerSheet>
  );
}
