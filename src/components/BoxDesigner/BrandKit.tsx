/**
 * Brand kit (#32) and brand colours (#14), in the Artwork tab.
 * Save a logo, brand colours and a font once (this browser only) and reuse them on any box in one tap.
 * Colours accept hex or RGB, recent box colours are remembered, and the note makes clear that print colour is
 * confirmed on the physical proof.
 */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ImagePlus, Plus, Sparkles, Trash2, Type, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BoxDesign, BoxFace } from '@/types/boxDesigner';
import { FACE_LABELS } from '@/lib/boxDesigner/constants';
import { ACCEPTED_TYPES, prepareUpload } from '@/lib/boxDesigner/imageUpload';
import {
  BrandKit as Kit,
  addBrandColour,
  hexToRgbString,
  isBrandKitEmpty,
  loadBrandKit,
  loadRecentColours,
  parseColourInput,
  pushRecentColour,
  removeBrandColour,
  saveBrandKit,
} from '@/lib/boxDesigner/brandKit';

type Update = (patch: Partial<BoxDesign> | ((d: BoxDesign) => Partial<BoxDesign>), key?: string) => void;

interface BrandKitProps {
  design: BoxDesign;
  update: Update;
  selectedFace: BoxFace | null;
  faces: BoxFace[];
  onSelectFace: (face: BoxFace) => void;
}

const FONTS = ['Inter', 'Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana', 'Trebuchet MS', 'Impact'];

function Swatch({ colour, active, onClick, label, onRemove }: { colour: string; active?: boolean; onClick: () => void; label: string; onRemove?: () => void }) {
  return (
    <span className="group relative">
      <button
        type="button"
        onClick={onClick}
        title={label}
        aria-label={label}
        className={`block h-8 w-8 rounded-full border border-black/10 shadow-sm transition-transform duration-quick hover:scale-110 motion-reduce:hover:scale-100 ${active ? 'ring-2 ring-primary ring-offset-2' : ''}`}
        style={{ backgroundColor: colour }}
      />
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${colour} from brand colours`}
          className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-ink-900 text-paper-50 group-hover:flex group-focus-within:flex"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  );
}

export default function BrandKit({ design, update, selectedFace, faces, onSelectFace }: BrandKitProps) {
  const [kit, setKit] = useState<Kit>(() => loadBrandKit());
  const [open, setOpen] = useState(() => !isBrandKitEmpty(loadBrandKit()));
  const [recent, setRecent] = useState<string[]>(() => loadRecentColours());
  const [colourText, setColourText] = useState(design.colorHex.toUpperCase());
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const save = (next: Kit) => {
    setKit(next);
    if (!saveBrandKit(next)) toast.error('Could not save the brand kit in this browser (storage is full).');
  };

  // Remember box colours the user settles on (debounced so dragging a picker is one entry)
  useEffect(() => {
    const timer = window.setTimeout(() => setRecent(pushRecentColour(design.colorHex)), 1200);
    return () => window.clearTimeout(timer);
  }, [design.colorHex]);
  useEffect(() => setColourText(design.colorHex.toUpperCase()), [design.colorHex]);

  const targetFace: BoxFace | null = selectedFace && faces.includes(selectedFace) ? selectedFace : faces.includes('front') ? 'front' : faces[0] ?? null;
  const parsed = parseColourInput(colourText);
  const setBox = (hex: string) => update({ colorHex: hex }, 'brand-colour');

  const uploadLogo = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const url = await prepareUpload(file);
      save({ ...kit, logoUrl: url });
      toast.success('Logo saved to your brand kit');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not use this image');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const placeLogo = () => {
    if (!kit.logoUrl || !targetFace) return;
    const url = kit.logoUrl;
    update((d) => ({
      faceImages: [...d.faceImages.filter((i) => i.face !== targetFace), { face: targetFace, imageUrl: url, position: { x: 0.5, y: 0.45 }, scale: 0.6, rotation: 0 }],
    }));
    onSelectFace(targetFace);
    toast.success(`Logo added to ${FACE_LABELS[targetFace]}`);
  };

  const placeName = () => {
    if (!kit.name.trim() || !targetFace) return;
    const id = `text-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const color = kit.colours[0] ?? '#111111';
    update((d) => ({
      textElements: [
        ...d.textElements,
        { id, face: targetFace, text: kit.name.trim(), font: kit.font, size: 48, color, position: { x: 0.5, y: 0.75 }, rotation: 0, align: 'center' },
      ],
    }));
    onSelectFace(targetFace);
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center gap-2 px-4 py-3 text-left">
        <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
        <span className="flex-1">
          <span className="block text-sm font-semibold">Brand kit & colours</span>
          {!open && <span className="block text-xs text-muted-foreground">Save your logo and colours once, reuse them on every box</span>}
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-quick ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-4 border-t border-border px-4 pb-4 pt-3">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-paper-100">
                  {kit.logoUrl ? <img src={kit.logoUrl} alt="Your saved logo" className="max-h-full max-w-full object-contain" /> : <ImagePlus className="h-5 w-5 text-muted-foreground" aria-hidden="true" />}
                </div>
                <div className="flex flex-1 flex-wrap gap-1.5">
                  {kit.logoUrl ? (
                    <>
                      <Button size="sm" onClick={placeLogo} disabled={!targetFace}>
                        Add to {targetFace ? FACE_LABELS[targetFace].toLowerCase() : 'box'}
                      </Button>
                      <Button size="sm" variant="ghost" aria-label="Remove saved logo" onClick={() => save({ ...kit, logoUrl: null })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={busy}>
                      {busy ? 'Processing…' : 'Save my logo'}
                    </Button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept={ACCEPTED_TYPES.join(',')} className="hidden" onChange={(e) => uploadLogo(e.target.files?.[0])} />
              </div>

              {/* Name + font */}
              <div className="grid grid-cols-[1fr_auto] items-end gap-2">
                <div className="space-y-1">
                  <Label htmlFor="brand-name" className="text-xs text-muted-foreground">
                    Brand name
                  </Label>
                  <Input id="brand-name" value={kit.name} maxLength={60} placeholder="e.g. Kavya Foods" onChange={(e) => save({ ...kit, name: e.target.value })} className="h-9" />
                </div>
                <Button size="sm" variant="outline" className="h-9" onClick={placeName} disabled={!kit.name.trim() || !targetFace} aria-label="Add brand name as text">
                  <Type className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Brand font</Label>
                <Select value={kit.font} onValueChange={(font) => save({ ...kit, font })}>
                  <SelectTrigger className="h-8 flex-1 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONTS.map((f) => (
                      <SelectItem key={f} value={f} style={{ fontFamily: f }}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {design.textElements.length > 0 && (
                  <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => update((d) => ({ textElements: d.textElements.map((t) => ({ ...t, font: kit.font })) }))}>
                    Apply to all
                  </Button>
                )}
              </div>

              {/* Colours */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Brand colours · tap to use on the box</Label>
                <div className="flex flex-wrap gap-2">
                  {kit.colours.map((c) => (
                    <Swatch key={c} colour={c} label={`Use ${c} on the box`} active={c.toLowerCase() === design.colorHex.toLowerCase()} onClick={() => setBox(c)} onRemove={() => save(removeBrandColour(kit, c))} />
                  ))}
                  {kit.colours.length === 0 && <span className="text-xs text-muted-foreground">None yet. Add one below.</span>}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={parsed ?? design.colorHex}
                    onChange={(e) => setColourText(e.target.value.toUpperCase())}
                    className="h-9 w-9 shrink-0 cursor-pointer rounded border border-border"
                    aria-label="Pick a colour"
                  />
                  <Input
                    value={colourText}
                    onChange={(e) => setColourText(e.target.value)}
                    placeholder="#C9A87C or 201, 168, 124"
                    aria-label="Colour as hex or RGB"
                    aria-invalid={!parsed}
                    className="h-9 font-mono text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" disabled={!parsed} onClick={() => parsed && setBox(parsed)}>
                    Use on box
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" disabled={!parsed || kit.colours.includes(parsed)} onClick={() => parsed && save(addBrandColour(kit, parsed))}>
                    <Plus className="mr-1 h-3.5 w-3.5" /> Save to kit
                  </Button>
                </div>
                {parsed && <p className="text-[11px] text-muted-foreground tabular">{parsed} · RGB {hexToRgbString(parsed)}</p>}
              </div>

              {recent.length > 1 && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Recent box colours</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {recent.map((c) => (
                      <Swatch key={c} colour={c} label={`Use recent colour ${c}`} active={c.toLowerCase() === design.colorHex.toLowerCase()} onClick={() => setBox(c)} />
                    ))}
                  </div>
                </div>
              )}

              <p className="rounded-md bg-paper-100 px-2.5 py-2 text-[11px] text-muted-foreground">
                Screen colours are approximate, especially on kraft. The exact print colour is confirmed on the physical proof before production.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
