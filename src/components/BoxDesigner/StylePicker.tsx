/**
 * Style picker for the 20 box styles: a compact "current style" card in the Edit panel that opens a sheet (a bottom
 * drawer on phones, a dialog on desktop) with group tabs, search, a Popular row, "What are you packing?" chips and
 * cards that show a small 3D-style thumbnail, best-for text and an "Options" hint.
 * Switching style goes through the same size and option rules as before (styles/switchStyle.ts).
 * Filtering rules live in lib/boxDesigner/styles/picker.ts.
 * Accessibility: real buttons, tabs with arrow keys, aria-pressed on choices, a polite live count, focus is trapped
 * in the sheet and returns to the trigger. The results area has a fixed height so filtering never moves the layout.
 */

import { KeyboardEvent, useMemo, useRef, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import DesignerSheet from './DesignerSheet';
import BoxThumbnail from './BoxThumbnail';
import { STYLES, getStyle, getStyleGroup, type StyleDefinition } from '@/lib/boxDesigner/styles/registry';
import { dimensionsAfterStyleSwitch, optionsAfterStyleSwitch } from '@/lib/boxDesigner/styles/switchStyle';
import {
  NO_FILTER,
  PACKING_CHIPS,
  PICKER_GROUPS,
  filterStyles,
  groupStyles,
  isFiltered,
  optionHints,
  popularStyles,
  type PickerFilter,
  type PickerGroup,
} from '@/lib/boxDesigner/styles/picker';
import type { BoxDesign } from '@/types/boxDesigner';

type Update = (patch: Partial<BoxDesign> | ((d: BoxDesign) => Partial<BoxDesign>), key?: string) => void;

interface StylePickerProps {
  design: BoxDesign;
  update: Update;
}

const THUMB_COLOUR = '#C9A87C';

function StyleCard({ style, active, compact, onChoose }: { style: StyleDefinition; active: boolean; compact?: boolean; onChoose: (s: StyleDefinition) => void }) {
  const hints = optionHints(style);
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onChoose(style)}
      className={`relative flex gap-3 rounded-lg border-2 p-2.5 text-left transition-colors duration-quick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        compact ? 'w-44 shrink-0 flex-col items-start' : 'w-full items-start'
      } ${active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
    >
      <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-md bg-paper-100 ${compact ? 'h-14 w-full' : 'h-16 w-16'}`}>
        <BoxThumbnail style={style.id} dimensions={style.defaultDims} colorHex={THUMB_COLOUR} className="h-12 w-12" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-1">
          <span className="text-sm font-semibold leading-tight">{style.name}</span>
          {active && <Check className="h-4 w-4 shrink-0 text-primary" aria-label="Selected" />}
        </span>
        <span className={`mt-0.5 block text-[11px] leading-snug text-muted-foreground ${compact ? 'line-clamp-2' : ''}`}>{style.bestFor}</span>
        {hints.length > 0 && (
          <span className="mt-1 flex flex-wrap gap-1">
            <span className="sr-only">Options: </span>
            {hints.map((h) => (
              <span key={h} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                {h}
              </span>
            ))}
          </span>
        )}
      </span>
    </button>
  );
}

function PickerBody({ current, onChoose }: { current: BoxDesign['template']; onChoose: (s: StyleDefinition) => void }) {
  const [filter, setFilter] = useState<PickerFilter>(NO_FILTER);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const results = useMemo(() => filterStyles(filter), [filter]);
  const filtered = isFiltered(filter);
  const popular = useMemo(() => popularStyles(), []);
  const sections = useMemo(() => groupStyles(results), [results]);
  const chip = PACKING_CHIPS.find((c) => c.id === filter.packing);

  const setGroup = (group: PickerGroup) => setFilter((f) => ({ ...f, group }));
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = PICKER_GROUPS.length - 1;
    const next = e.key === 'ArrowRight' ? (index + 1) % (last + 1) : e.key === 'ArrowLeft' ? (index - 1 + last + 1) % (last + 1) : e.key === 'Home' ? 0 : e.key === 'End' ? last : -1;
    if (next < 0) return;
    e.preventDefault();
    setGroup(PICKER_GROUPS[next]);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          value={filter.query}
          onChange={(e) => setFilter((f) => ({ ...f, query: e.target.value.slice(0, 60) }))}
          placeholder="Search: cake, mango, shoe, mailer..."
          aria-label="Search box styles"
          className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-9 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
        />
        {filter.query && (
          <button type="button" onClick={() => setFilter((f) => ({ ...f, query: '' }))} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div>
        <p id="packing-label" className="mb-1.5 text-xs font-medium">
          What are you packing?
        </p>
        <div className="flex gap-1.5 overflow-x-auto pb-1" role="group" aria-labelledby="packing-label">
          {PACKING_CHIPS.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={filter.packing === c.id}
              onClick={() => setFilter((f) => ({ ...f, packing: f.packing === c.id ? null : c.id }))}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-quick ${
                filter.packing === c.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-foreground/40'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto border-b pb-2" role="tablist" aria-label="Style groups">
        {PICKER_GROUPS.map((g, i) => (
          <button
            key={g}
            ref={(el) => (tabRefs.current[i] = el)}
            type="button"
            role="tab"
            aria-selected={filter.group === g}
            tabIndex={filter.group === g ? 0 : -1}
            onClick={() => setGroup(g)}
            onKeyDown={(e) => onTabKey(e, i)}
            className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-quick ${
              filter.group === g ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
        {results.length} {results.length === 1 ? 'style' : 'styles'}
        {chip ? ` for ${chip.label.toLowerCase()}, best first` : ''}
        {filtered && (
          <>
            {' · '}
            <button type="button" onClick={() => setFilter(NO_FILTER)} className="underline underline-offset-2 hover:text-foreground">
              Clear filters
            </button>
          </>
        )}
      </p>

      {/* Fixed height: filtering changes what is inside, never the size of the sheet */}
      <div role="tabpanel" aria-label={`${filter.group} styles`} className="h-[min(24rem,48dvh)] overflow-y-auto pr-1">
        {results.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <p>No style matches that yet. Try a simpler word such as "box", "food" or "gift".</p>
            <button type="button" onClick={() => setFilter(NO_FILTER)} className="rounded-md border px-3 py-1.5 text-xs font-medium hover:border-foreground/40">
              Show all styles
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {!filtered && (
              <section aria-labelledby="popular-label">
                <h3 id="popular-label" className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Popular
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {popular.map((s) => (
                    <StyleCard key={`pop-${s.id}`} style={s} active={current === s.id} compact onChoose={onChoose} />
                  ))}
                </div>
              </section>
            )}
            {(filter.group === 'All' && !chip && !filter.query.trim() ? sections : [{ group: null, styles: results }]).map((section) => (
              <section key={section.group ?? 'results'} aria-label={section.group ?? 'Matching styles'}>
                {section.group && <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{section.group}</h3>}
                <div className="grid gap-2 sm:grid-cols-2">
                  {section.styles.map((s) => (
                    <StyleCard key={s.id} style={s} active={current === s.id} onChoose={onChoose} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StylePicker({ design, update }: StylePickerProps) {
  const [open, setOpen] = useState(false);
  const style = getStyle(design.template);
  const hints = optionHints(style);

  /** Same rule as before the picker: untouched sizes and openings follow the new style (switchStyle.ts) */
  const choose = (s: StyleDefinition) => {
    update(
      (d) => ({
        template: s.id,
        dimensions: dimensionsAfterStyleSwitch(d.template, s.id, d.dimensions),
        options: optionsAfterStyleSwitch(d.template, s.id, d.options),
      }),
      'style'
    );
    setOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg border-2 border-primary/40 bg-primary/5 p-2.5">
        <span aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-paper-100">
          <BoxThumbnail style={style.id} dimensions={style.defaultDims} colorHex={design.colorHex} className="h-12 w-12" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{getStyleGroup(style)}</p>
          <p className="text-sm font-semibold leading-tight">{style.name}</p>
          <p className="text-[11px] leading-snug text-muted-foreground">{style.bestFor}</p>
          {hints.length > 0 && <p className="mt-0.5 text-[10px] text-muted-foreground">Options: {hints.join(', ')}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="w-full rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors duration-quick hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Change style ({STYLES.length} to choose from)
      </button>
      <DesignerSheet
        open={open}
        onOpenChange={setOpen}
        title="Choose a box style"
        description="Search, filter by what you are packing, or browse by group. Your size and artwork are kept."
        widthClass="max-w-3xl"
      >
        {open && <PickerBody current={design.template} onChoose={choose} />}
      </DesignerSheet>
    </>
  );
}
