/**
 * Box spec panel (Edit tab)
 * Style (visual cards from the style registry), exact inside dimensions, board (ply + flute), colour, finish,
 * inside liner and handling marks.
 * Every change goes through the undoable design store.
 */

import { useMemo } from 'react';
import { Box, Check, Layers, Palette, Ruler, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import QuickSizePresets from './QuickSizePresets';
import UnitToggle from './UnitToggle';
import UnitDimensionField from './UnitDimensionField';
import { formatDimensions, formatLength } from '@/lib/boxDesigner/units';
import { BOX_COLOR_OPTIONS, DIMENSION_LIMITS, PLY_OPTIONS } from '@/lib/boxDesigner/constants';
import { getBoardSpec } from '@/lib/boxDesigner/boardSpecs';
import { STYLES, getStyle, type StyleDefinition } from '@/lib/boxDesigner/styles/registry';
import { layoutForDesign } from '@/lib/boxDesigner/styles/designLayout';
import { resolveLidDepth } from '@/lib/boxDesigner/rig/telescopeLayout';
import type { BoxDesign, BoxDimensions, PrintFinish } from '@/types/boxDesigner';

type Update = (patch: Partial<BoxDesign> | ((d: BoxDesign) => Partial<BoxDesign>), key?: string) => void;

interface BoxSpecPanelProps {
  design: BoxDesign;
  update: Update;
  onFoldReset: () => void;
}

/** Inside liner presets: same as outside (null), white-lined, kraft, black */
const INSIDE_OPTIONS: { id: string; name: string; color: string | null }[] = [
  { id: 'same', name: 'Same as outside', color: null },
  { id: 'white', name: 'White lined', color: '#F4F2EC' },
  { id: 'kraft', name: 'Kraft', color: '#B08B5C' },
  { id: 'black', name: 'Black', color: '#2B2B2D' },
];

const FINISHES: { id: PrintFinish; name: string; hint: string }[] = [
  { id: 'matte', name: 'Matte', hint: 'Natural, uncoated look' },
  { id: 'gloss', name: 'Gloss', hint: 'Varnished or laminated shine' },
];

function StyleIcon({ style }: { style: StyleDefinition }) {
  return (
    <svg viewBox="0 0 24 24" className="w-8 h-8 mx-auto text-ink-900" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d={style.iconPath} />
    </svg>
  );
}

export default function BoxSpecPanel({ design, update, onFoldReset }: BoxSpecPanelProps) {
  const { dimensions } = design;
  const board = getBoardSpec(design.ply, design.flutes);
  const style = getStyle(design.template);
  // outside size from the same layout as the 3D model and dieline
  const outside = useMemo(
    () => layoutForDesign(design).outside,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the layout depends on these fields only
    [design.template, design.dimensions, design.ply, design.flutes, design.lidDepth]
  );
  const lidDepth = resolveLidDepth(dimensions.height, design.lidDepth);
  const setDims = (patch: Partial<BoxDimensions>) => update((d) => ({ dimensions: { ...d.dimensions, ...patch } }));

  return (
    <div className="space-y-5">
      {/* Style */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Box className="w-4 h-4 text-primary" /> Box style
        </h3>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Box style">
          {STYLES.map((s) => {
            const active = design.template === s.id;
            return (
              <button
                key={s.id}
                role="radio"
                aria-checked={active}
                onClick={() => update({ template: s.id }, 'style')}
                title={s.description}
                className={`p-2.5 rounded-lg border-2 text-left transition-all ${
                  active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
              >
                <StyleIcon style={s} />
                <div className="mt-1 flex items-baseline justify-between gap-1">
                  <span className="text-xs font-semibold">{s.shortName}</span>
                  {s.fefco && <span className="text-[10px] text-muted-foreground">FEFCO {s.fefco}</span>}
                </div>
                <div className="text-[11px] leading-snug text-muted-foreground">{s.bestFor}</div>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">{style.description}</p>
        {style.id === 'telescope' && (
          <div className="space-y-1">
            <label htmlFor="lid-depth" className="flex justify-between text-xs text-muted-foreground">
              <span>Lid depth{design.lidDepth == null ? ' (automatic)' : ''}</span>
              <span className="font-medium text-ink-900">{formatLength(lidDepth, design.unit)}</span>
            </label>
            <input
              id="lid-depth"
              type="range"
              min={Math.min(DIMENSION_LIMITS.min, dimensions.height)}
              max={dimensions.height}
              step={0.5}
              value={lidDepth}
              onChange={(e) => update({ lidDepth: Math.max(DIMENSION_LIMITS.min, Number(e.target.value)) }, 'lid-depth')}
              className="w-full accent-primary"
            />
            <p className="text-[11px] text-muted-foreground">Full height = a full telescope lid; shallow = a shoe-box style lid.</p>
          </div>
        )}
      </Card>

      {/* Dimensions */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Ruler className="w-4 h-4 text-primary" /> Inside dimensions
          </h3>
          <UnitToggle value={design.unit} onChange={(unit) => update({ unit }, 'unit')} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['length', 'width', 'height'] as const).map((k) => (
            <UnitDimensionField
              key={k}
              label={k[0].toUpperCase() + k.slice(1)}
              value={dimensions[k]}
              unit={design.unit}
              min={DIMENSION_LIMITS.min}
              max={DIMENSION_LIMITS.max}
              describedBy="dim-help"
              onCommit={(v) => setDims({ [k]: v })}
            />
          ))}
        </div>
        <p id="dim-help" className="text-xs text-muted-foreground">
          {formatLength(DIMENSION_LIMITS.min, design.unit)} to {formatLength(DIMENSION_LIMITS.max, design.unit)}, decimals allowed. Outside is about{' '}
          {formatDimensions(
            {
              length: Math.round(outside.length * 10) / 10,
              width: Math.round(outside.width * 10) / 10,
              height: Math.round(outside.height * 10) / 10,
            },
            design.unit
          )}
          .
        </p>
        <QuickSizePresets currentDimensions={dimensions} onChange={(d) => update({ dimensions: d })} onFoldReset={onFoldReset} />
      </Card>

      {/* Board */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" /> Board strength
        </h3>
        <div className="space-y-2" role="radiogroup" aria-label="Board ply">
          {PLY_OPTIONS.map((option) => {
            const active = design.ply === option.id;
            const spec = getBoardSpec(option.id, active ? design.flutes : option.flutes[0]);
            return (
              <button
                key={option.id}
                role="radio"
                aria-checked={active}
                onClick={() => update({ ply: option.id, flutes: option.flutes[0] })}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">
                      {option.name} <span className="font-normal text-muted-foreground">· {option.wall}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{option.useCase}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-ink-900">~{spec.caliperMm} mm</div>
                    {active && <Check className="w-4 h-4 text-primary ml-auto" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {(() => {
          const option = PLY_OPTIONS.find((p) => p.id === design.ply)!;
          if (option.flutes.length < 2) return null;
          return (
            <div className="flex items-center gap-2 flex-wrap" role="radiogroup" aria-label="Flute">
              <span className="text-xs text-muted-foreground">Flute:</span>
              {option.flutes.map((stack) => {
                const key = stack.join('');
                const active = design.flutes.join('') === key;
                return (
                  <button
                    key={key}
                    role="radio"
                    aria-checked={active}
                    onClick={() => update({ flutes: stack })}
                    className={`px-3 py-1 rounded-full text-xs border ${
                      active ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary'
                    }`}
                  >
                    {key} · {getBoardSpec(design.ply, stack).caliperMm} mm
                  </button>
                );
              })}
            </div>
          );
        })()}
        <p className="text-xs text-muted-foreground">
          The 3D edges show the real flute layers. Thickness is indicative; we confirm the final specification with your quote.
        </p>
      </Card>

      {/* Colour */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" /> Board colour
        </h3>
        <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Board colour">
          {BOX_COLOR_OPTIONS.map((c) => {
            const active = design.colorHex.toLowerCase() === c.color.toLowerCase();
            return (
              <button
                key={c.id}
                role="radio"
                aria-checked={active}
                aria-label={c.name}
                title={c.name}
                onClick={() => update({ colorHex: c.color })}
                className={`h-10 rounded-lg border-2 transition-transform hover:scale-105 ${
                  active ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                }`}
                style={{ backgroundColor: c.color }}
              />
            );
          })}
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="color"
            value={design.colorHex}
            onChange={(e) => update({ colorHex: e.target.value }, 'custom-colour')}
            className="w-10 h-10 rounded cursor-pointer border border-border"
            aria-label="Custom colour"
          />
          <span className="text-ink-900">
            Custom colour <span className="text-muted-foreground/70 font-mono text-xs">{design.colorHex.toUpperCase()}</span>
          </span>
        </label>
        <p className="text-xs text-muted-foreground">Colour is applied to the outside of the board; pick the inside below.</p>
      </Card>

      {/* Finish and inside */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" /> Finish and inside
        </h3>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Print finish">
          {FINISHES.map((f) => {
            const active = design.finish === f.id;
            return (
              <button
                key={f.id}
                role="radio"
                aria-checked={active}
                onClick={() => update({ finish: f.id })}
                className={`p-2 rounded-lg border-2 text-left transition-all ${
                  active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-xs font-semibold">{f.name}</div>
                <div className="text-[11px] text-muted-foreground">{f.hint}</div>
              </button>
            );
          })}
        </div>
        <div className="space-y-1.5">
          <div className="text-xs text-muted-foreground">Inside colour</div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Inside colour">
            {INSIDE_OPTIONS.map((o) => {
              const active = (design.insideColorHex?.toLowerCase() ?? null) === (o.color?.toLowerCase() ?? null);
              return (
                <button
                  key={o.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => update({ insideColorHex: o.color })}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${
                    active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-border"
                    style={{ backgroundColor: o.color ?? design.colorHex }}
                    aria-hidden="true"
                  />
                  {o.name}
                </button>
              );
            })}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Preview only: we confirm coatings and liners with your quote.</p>
      </Card>

      {/* Marks */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="show-icons" className="text-sm">
            Handling marks on front
            <span className="block text-xs text-muted-foreground font-normal">Fragile, this side up, keep dry</span>
          </Label>
          <Switch id="show-icons" checked={design.showIcons} onCheckedChange={(v) => update({ showIcons: v })} />
        </div>
      </Card>
    </div>
  );
}
