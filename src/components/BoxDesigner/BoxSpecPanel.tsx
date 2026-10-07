/**
 * Box spec panel (Edit tab)
 * Template, exact inside dimensions, board (ply + flute), colour and handling marks.
 * Every change goes through the undoable design store.
 */

import { useEffect, useState } from 'react';
import { Box, Check, Layers, Palette, PackageOpen, Mail, Ruler } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import QuickSizePresets from './QuickSizePresets';
import {
  BOX_COLOR_OPTIONS,
  BOX_TEMPLATES,
  DIMENSION_LIMITS,
  PLY_OPTIONS,
} from '@/lib/boxDesigner/constants';
import { getBoardSpec, getBoardThicknessCm } from '@/lib/boxDesigner/boardSpecs';
import type { BoxDesign, BoxDimensions, BoxTemplate } from '@/types/boxDesigner';

type Update = (patch: Partial<BoxDesign> | ((d: BoxDesign) => Partial<BoxDesign>), key?: string) => void;

interface BoxSpecPanelProps {
  design: BoxDesign;
  update: Update;
  onFoldReset: () => void;
}

const TEMPLATE_ICONS: Record<BoxTemplate, typeof Box> = { rsc: Box, hsc: PackageOpen, mailer: Mail };

const clampDim = (value: number) =>
  Math.round(Math.min(DIMENSION_LIMITS.max, Math.max(DIMENSION_LIMITS.min, value)) * 10) / 10;

/** Numeric field that only commits valid values (on blur / Enter), so typing "12" never jumps to "52" */
function DimensionField({ label, value, onCommit }: { label: string; value: number; onCommit: (v: number) => void }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  const commit = (raw: string) => {
    const parsed = parseFloat(raw.replace(',', '.'));
    if (!Number.isFinite(parsed)) {
      setText(String(value));
      return;
    }
    const next = clampDim(parsed);
    setText(String(next));
    if (next !== value) onCommit(next);
  };
  const id = `dim-${label.toLowerCase()}`;
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
          className="w-full h-10 rounded-md border border-border bg-white pl-3 pr-9 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          aria-describedby="dim-help"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/70">cm</span>
      </div>
    </div>
  );
}

export default function BoxSpecPanel({ design, update, onFoldReset }: BoxSpecPanelProps) {
  const { dimensions } = design;
  const board = getBoardSpec(design.ply, design.flutes);
  const thicknessMm = Math.round(getBoardThicknessCm(board, dimensions) * 100) / 10;
  const setDims = (patch: Partial<BoxDimensions>) => update((d) => ({ dimensions: { ...d.dimensions, ...patch } }));

  return (
    <div className="space-y-5">
      {/* Template */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Box className="w-4 h-4 text-primary" /> Box style
        </h3>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Box style">
          {BOX_TEMPLATES.map((t) => {
            const Icon = TEMPLATE_ICONS[t.id];
            const active = design.template === t.id;
            return (
              <button
                key={t.id}
                role="radio"
                aria-checked={active}
                disabled={!t.available}
                onClick={() => update({ template: t.id })}
                title={t.description}
                className={`p-2 rounded-lg border-2 text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
              >
                <Icon className="w-5 h-5 mx-auto mb-1 text-ink-900" />
                <div className="text-xs font-semibold">{t.shortName}</div>
                <div className="text-[10px] text-muted-foreground">{t.available ? `FEFCO ${t.fefco}` : 'Soon'}</div>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">{BOX_TEMPLATES.find((t) => t.id === design.template)?.description}</p>
      </Card>

      {/* Dimensions */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Ruler className="w-4 h-4 text-primary" /> Inside dimensions
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <DimensionField label="Length" value={dimensions.length} onCommit={(v) => setDims({ length: v })} />
          <DimensionField label="Width" value={dimensions.width} onCommit={(v) => setDims({ width: v })} />
          <DimensionField label="Height" value={dimensions.height} onCommit={(v) => setDims({ height: v })} />
        </div>
        <p id="dim-help" className="text-xs text-muted-foreground">
          {DIMENSION_LIMITS.min}-{DIMENSION_LIMITS.max} cm, decimals allowed. Outside is about{' '}
          {Math.round((dimensions.length + thicknessMm / 5) * 10) / 10} x{' '}
          {Math.round((dimensions.width + thicknessMm / 5) * 10) / 10} x{' '}
          {Math.round((dimensions.height + (thicknessMm / 10) * (design.template === 'hsc' ? 2 : 4)) * 10) / 10} cm.
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
        <p className="text-xs text-muted-foreground">Colour is applied to the whole board: outside, inside and edges.</p>
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
