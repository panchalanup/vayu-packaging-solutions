/**
 * Controls for the selected cutout: size, rotation, flip, opacity, tint, pattern fill, layer order, lock,
 * duplicate, delete and "apply to all surfaces". Every change is one undoable update (sliders coalesce by key).
 */

import { useMemo } from 'react';
import { ArrowDownToLine, ArrowUpToLine, ChevronDown, ChevronUp, Copy, FlipHorizontal, Layers, Lock, LockOpen, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import type { StickerPlacement } from '@/types/boxDesigner';
import { DEFAULT_PATTERN, type LayerMove } from '@/lib/boxDesigner/stickers/placement';
import { BASIC_TINTS } from '@/lib/boxDesigner/stickers/palettes';
import { loadBrandKit } from '@/lib/boxDesigner/brandKit';

interface StickerControlsProps {
  sticker: StickerPlacement;
  name: string;
  onChange: (patch: Partial<StickerPlacement>, key?: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onLayer: (move: LayerMove) => void;
  onApplyAll: () => void;
  canApplyAll: boolean;
  onPatternToggled?: (on: boolean) => void;
}

export default function StickerControls({ sticker: s, name, onChange, onDuplicate, onDelete, onLayer, onApplyAll, canApplyAll, onPatternToggled }: StickerControlsProps) {
  const brandColours = useMemo(() => loadBrandKit().colours, []);
  const swatches = [...brandColours, ...BASIC_TINTS.filter((c) => !brandColours.includes(c.toUpperCase()))];
  const locked = s.locked;

  return (
    <Card className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="truncate text-sm font-semibold">Cutout: {name}</h3>
        <Button
          variant={locked ? 'default' : 'outline'}
          size="sm"
          className="h-8 px-2"
          aria-pressed={locked}
          aria-label={locked ? 'Unlock cutout' : 'Lock cutout in place'}
          onClick={() => onChange({ locked: !locked })}
        >
          {locked ? <Lock className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />}
        </Button>
      </div>

      <fieldset disabled={locked} className="space-y-4 disabled:opacity-60">
        <div className="space-y-2">
          <Label className="text-xs">Size: {Math.round(s.scale * 100)}%</Label>
          <Slider min={2} max={150} step={1} value={[Math.round(s.scale * 100)]} onValueChange={([v]) => onChange({ scale: v / 100 }, `st-scale-${s.id}`)} />
        </div>
        {!s.pattern && (
          <div className="space-y-2">
            <Label className="text-xs">Rotation: {s.rotation}°</Label>
            <Slider min={-180} max={180} step={1} value={[s.rotation]} onValueChange={([v]) => onChange({ rotation: v }, `st-rotate-${s.id}`)} />
          </div>
        )}
        <div className="space-y-2">
          <Label className="text-xs">Opacity: {Math.round(s.opacity * 100)}%</Label>
          <Slider min={5} max={100} step={1} value={[Math.round(s.opacity * 100)]} onValueChange={([v]) => onChange({ opacity: v / 100 }, `st-opacity-${s.id}`)} />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Colour</Label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onChange({ tint: null })}
              aria-pressed={s.tint === null}
              className={`h-6 rounded-full border px-2 text-[11px] ${s.tint === null ? 'border-primary ring-2 ring-primary' : 'border-border'}`}
            >
              Original
            </button>
            {swatches.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Tint ${c}`}
                onClick={() => onChange({ tint: c.toUpperCase() })}
                className={`h-6 w-6 rounded-full border ${s.tint?.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-primary' : 'border-border'}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              aria-label="Custom tint colour"
              value={s.tint ?? '#111111'}
              onChange={(e) => onChange({ tint: e.target.value }, `st-tint-${s.id}`)}
              className="h-7 w-7 cursor-pointer rounded"
            />
          </div>
        </div>

        <div className="space-y-3 rounded-md border border-border p-3">
          <div className="flex items-center justify-between">
            <Label htmlFor={`pat-${s.id}`} className="text-xs font-medium">
              Repeat as a pattern
            </Label>
            <Switch
              id={`pat-${s.id}`}
              checked={!!s.pattern}
              onCheckedChange={(on) => {
                onChange({ pattern: on ? { ...DEFAULT_PATTERN } : null, scale: on ? Math.min(s.scale, 0.25) : s.scale });
                onPatternToggled?.(on);
              }}
            />
          </div>
          {s.pattern && (
            <>
              <div className="space-y-2">
                <Label className="text-xs">Spacing: {Math.round(s.pattern.spacing * 100)}%</Label>
                <Slider min={0} max={300} step={5} value={[Math.round(s.pattern.spacing * 100)]} onValueChange={([v]) => onChange({ pattern: { ...s.pattern!, spacing: v / 100 } }, `st-gap-${s.id}`)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Angle: {s.pattern.angle}°</Label>
                <Slider min={-90} max={90} step={5} value={[s.pattern.angle]} onValueChange={([v]) => onChange({ pattern: { ...s.pattern!, angle: v } }, `st-angle-${s.id}`)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Shift across</Label>
                  <Slider min={0} max={100} step={1} value={[Math.round(s.position.x * 100)]} onValueChange={([v]) => onChange({ position: { ...s.position, x: v / 100 } }, `st-px-${s.id}`)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Shift down</Label>
                  <Slider min={0} max={100} step={1} value={[Math.round(s.position.y * 100)]} onValueChange={([v]) => onChange({ position: { ...s.position, y: v / 100 } }, `st-py-${s.id}`)} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor={`stag-${s.id}`} className="text-xs">
                  Offset every other row
                </Label>
                <Switch id={`stag-${s.id}`} checked={s.pattern.stagger} onCheckedChange={(on) => onChange({ pattern: { ...s.pattern!, stagger: on } })} />
              </div>
            </>
          )}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={() => onChange({ flip: !s.flip })} aria-pressed={s.flip} disabled={locked}>
          <FlipHorizontal className="mr-1 h-4 w-4" /> Flip
        </Button>
        <Button variant="outline" size="sm" onClick={onApplyAll} disabled={!canApplyAll}>
          <Layers className="mr-1 h-4 w-4" /> All surfaces
        </Button>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Layer order <span className="text-[10px]">([ and ] keys)</span></Label>
        <div className="grid grid-cols-4 gap-1">
          <Button variant="outline" size="sm" className="h-8 px-0" aria-label="Send to back" onClick={() => onLayer('back')}>
            <ArrowDownToLine className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-0" aria-label="Send backward" onClick={() => onLayer('backward')}>
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-0" aria-label="Bring forward" onClick={() => onLayer('forward')}>
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-0" aria-label="Bring to front" onClick={() => onLayer('front')}>
            <ArrowUpToLine className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={onDuplicate}>
          <Copy className="mr-1 h-4 w-4" /> Duplicate
        </Button>
        <Button variant="outline" size="sm" className="text-destructive" onClick={onDelete}>
          <Trash2 className="mr-1 h-4 w-4" /> Delete
        </Button>
      </div>
    </Card>
  );
}
