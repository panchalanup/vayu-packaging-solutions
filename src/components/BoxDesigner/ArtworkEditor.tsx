/**
 * Artwork editor (Customize tab)
 * A true-proportion 2D view of the selected surface. Drag logos and text to place them, then fine-tune size,
 * rotation, font, colour and alignment. The 3D box updates live (debounced in the print layer).
 * Every change goes through the undoable design store; drags coalesce into a single undo step.
 */

import { useEffect, useMemo, useRef, useState, PointerEvent as ReactPointerEvent } from 'react';
import { AlignCenter, AlignLeft, AlignRight, Copy, Crosshair, ImagePlus, Trash2, Type, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PT_TO_CM } from '@/lib/boxDesigner/textures/printLayer';
import { prepareUpload, ACCEPTED_TYPES } from '@/lib/boxDesigner/imageUpload';
import type { BoxDesign, BoxFace, FaceImage, TextElement } from '@/types/boxDesigner';
import { FACE_LABELS } from '@/lib/boxDesigner/constants';

type Update = (patch: Partial<BoxDesign> | ((d: BoxDesign) => Partial<BoxDesign>), key?: string) => void;

interface ArtworkEditorProps {
  design: BoxDesign;
  update: Update;
  selectedFace: BoxFace | null;
  onSelectFace: (face: BoxFace | null) => void;
  faceSizes: Partial<Record<BoxFace, { widthCm: number; heightCm: number }>>;
}


/** Fonts that are available everywhere (Inter is loaded by the site) */
const FONTS = ['Inter', 'Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana', 'Trebuchet MS', 'Impact'];
const INK_SWATCHES = ['#111111', '#FFFFFF', '#1A6FE6', '#B3261E', '#2E7D32', '#E3B53C'];

type Selection = { kind: 'image' } | { kind: 'text'; id: string } | null;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const newId = () => `text-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export default function ArtworkEditor({ design, update, selectedFace, onSelectFace, faceSizes }: ArtworkEditorProps) {
  const faces = Object.keys(faceSizes) as BoxFace[];
  const face = selectedFace && faceSizes[selectedFace] ? selectedFace : null;
  const size = face ? faceSizes[face]! : null;
  const image = face ? design.faceImages.find((i) => i.face === face) : undefined;
  const texts = useMemo(() => (face ? design.textElements.filter((t) => t.face === face) : []), [face, design.textElements]);

  const [selection, setSelection] = useState<Selection>(null);
  const [busy, setBusy] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewWidth, setPreviewWidth] = useState(260);
  const drag = useRef<{ kind: 'image' | 'text'; id?: string; dx: number; dy: number } | null>(null);

  // reset selection when the face changes or the element disappears (undo)
  useEffect(() => setSelection(null), [face]);
  useEffect(() => {
    if (selection?.kind === 'image' && !image) setSelection(null);
    if (selection?.kind === 'text' && !texts.some((t) => t.id === selection.id)) setSelection(null);
  }, [image, texts, selection]);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setPreviewWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, [face]);

  const updateImage = (patch: Partial<FaceImage>, key?: string) =>
    update((d) => ({ faceImages: d.faceImages.map((i) => (i.face === face ? { ...i, ...patch } : i)) }), key);
  const updateText = (id: string, patch: Partial<TextElement>, key?: string) =>
    update((d) => ({ textElements: d.textElements.map((t) => (t.id === id ? { ...t, ...patch } : t)) }), key);

  const handleFile = async (file: File | undefined) => {
    if (!file || !face) return;
    setBusy(true);
    try {
      const imageUrl = await prepareUpload(file);
      update((d) => ({
        faceImages: [
          ...d.faceImages.filter((i) => i.face !== face),
          { face, imageUrl, position: { x: 0.5, y: 0.45 }, scale: 0.6, rotation: 0 },
        ],
      }));
      setSelection({ kind: 'image' });
      toast.success(`Artwork added to ${FACE_LABELS[face]}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not use this image');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const addText = () => {
    if (!face) return;
    const id = newId();
    update((d) => ({
      textElements: [
        ...d.textElements,
        { id, face, text: 'Your text', font: 'Inter', size: 48, color: '#111111', position: { x: 0.5, y: 0.5 }, rotation: 0, align: 'center' },
      ],
    }));
    setSelection({ kind: 'text', id });
  };

  // Drag to place
  const startDrag = (e: ReactPointerEvent, kind: 'image' | 'text', pos: { x: number; y: number }, id?: string) => {
    const rect = previewRef.current!.getBoundingClientRect();
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { kind, id, dx: (e.clientX - rect.left) / rect.width - pos.x, dy: (e.clientY - rect.top) / rect.height - pos.y };
    setSelection(kind === 'image' ? { kind: 'image' } : { kind: 'text', id: id! });
  };
  const moveDrag = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!d || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const position = { x: clamp01((e.clientX - rect.left) / rect.width - d.dx), y: clamp01((e.clientY - rect.top) / rect.height - d.dy) };
    if (d.kind === 'image') updateImage({ position }, 'drag-image');
    else updateText(d.id!, { position }, `drag-${d.id}`);
  };
  const endDrag = () => (drag.current = null);

  // Keyboard nudging for the selected element (accessibility + precision)
  const nudge = (e: React.KeyboardEvent) => {
    if (!selection) return;
    const step = e.shiftKey ? 0.05 : 0.01;
    const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (!delta) {
      if (e.key === 'Delete' || e.key === 'Backspace') removeSelected();
      return;
    }
    e.preventDefault();
    const current = selection.kind === 'image' ? image?.position : texts.find((t) => t.id === selection.id)?.position;
    if (!current) return;
    const position = { x: clamp01(current.x + delta[0]), y: clamp01(current.y + delta[1]) };
    if (selection.kind === 'image') updateImage({ position }, 'nudge');
    else updateText(selection.id, { position }, 'nudge');
  };

  const removeSelected = () => {
    if (!selection) return;
    if (selection.kind === 'image') update((d) => ({ faceImages: d.faceImages.filter((i) => i.face !== face) }));
    else update((d) => ({ textElements: d.textElements.filter((t) => t.id !== selection.id) }));
    setSelection(null);
  };

  const selectedText = selection?.kind === 'text' ? texts.find((t) => t.id === selection.id) : undefined;
  const pxPerCm = size ? previewWidth / size.widthCm : 1;

  return (
    <div className="space-y-4">
      {/* Face picker (also selectable by clicking the 3D box) */}
      <Card className="p-4 space-y-2">
        <h3 className="font-semibold text-sm">Choose a surface</h3>
        <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="Box surface">
          {faces.map((f) => (
            <button
              key={f}
              role="radio"
              aria-checked={face === f}
              onClick={() => onSelectFace(face === f ? null : f)}
              className={`px-2 py-1.5 rounded-md text-xs border text-left transition-colors ${
                face === f ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary/60'
              }`}
            >
              {FACE_LABELS[f]}
              {(design.faceImages.some((i) => i.face === f) || design.textElements.some((t) => t.face === f)) && (
                <span className={`ml-1 ${face === f ? 'text-white/80' : 'text-primary'}`}>●</span>
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Tip: you can also click a face on the 3D box.</p>
      </Card>

      {face && size && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{FACE_LABELS[face]}</h3>
            <span className="text-xs text-muted-foreground">
              {Math.round(size.widthCm * 10) / 10} x {Math.round(size.heightCm * 10) / 10} cm
            </span>
          </div>

          {/* Preview / placement canvas */}
          <div
            ref={previewRef}
            tabIndex={0}
            role="application"
            aria-label={`Artwork layout for ${FACE_LABELS[face]}. Drag items to move them, or use arrow keys on the selected item.`}
            onKeyDown={nudge}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerDown={() => setSelection(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files?.[0]);
            }}
            className="relative w-full overflow-hidden rounded-md border border-border shadow-inner select-none touch-none focus:outline-none focus:ring-2 focus:ring-primary"
            style={{ aspectRatio: `${size.widthCm} / ${size.heightCm}`, backgroundColor: design.colorHex }}
          >
            {image && (
              <img
                src={image.imageUrl}
                alt="Uploaded artwork"
                draggable={false}
                onPointerDown={(e) => startDrag(e, 'image', image.position)}
                className={`absolute cursor-move ${selection?.kind === 'image' ? 'outline outline-2 outline-primary' : ''}`}
                style={{
                  left: `${image.position.x * 100}%`,
                  top: `${image.position.y * 100}%`,
                  maxWidth: `${image.scale * 100}%`,
                  maxHeight: `${image.scale * 100}%`,
                  transform: `translate(-50%, -50%) rotate(${image.rotation}deg)`,
                }}
              />
            )}
            {texts.map((t) => (
              <div
                key={t.id}
                onPointerDown={(e) => startDrag(e, 'text', t.position, t.id)}
                className={`absolute cursor-move whitespace-pre-wrap leading-[1.2] ${
                  selection?.kind === 'text' && selection.id === t.id ? 'outline outline-2 outline-primary' : ''
                }`}
                style={{
                  left: `${t.position.x * 100}%`,
                  top: `${t.position.y * 100}%`,
                  maxWidth: '90%',
                  width: 'max-content',
                  fontFamily: `"${t.font}", Arial, sans-serif`,
                  fontSize: Math.max(4, t.size * PT_TO_CM * pxPerCm),
                  color: t.color,
                  textAlign: t.align,
                  transform: `translate(${t.align === 'left' ? '0' : t.align === 'right' ? '-100%' : '-50%'}, -50%) rotate(${t.rotation}deg)`,
                }}
              >
                {t.text || ' '}
              </div>
            ))}
            {!image && texts.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-black/40 pointer-events-none text-center px-4">
                Drop an image here, or use the buttons below
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={busy}>
              {image ? <Upload className="w-4 h-4 mr-1" /> : <ImagePlus className="w-4 h-4 mr-1" />}
              {busy ? 'Processing…' : image ? 'Replace image' : 'Add image'}
            </Button>
            <Button variant="outline" size="sm" onClick={addText}>
              <Type className="w-4 h-4 mr-1" /> Add text
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {/* Layers */}
          {(image || texts.length > 0) && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">On this surface</Label>
              {image && (
                <button
                  onClick={() => setSelection({ kind: 'image' })}
                  className={`w-full text-left text-xs px-2 py-1.5 rounded border ${selection?.kind === 'image' ? 'border-primary bg-primary/5' : 'border-border'}`}
                >
                  🖼 Image
                </button>
              )}
              {texts.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelection({ kind: 'text', id: t.id })}
                  className={`w-full text-left text-xs px-2 py-1.5 rounded border truncate ${
                    selection?.kind === 'text' && selection.id === t.id ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  T {t.text || '(empty)'}
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Selected image controls */}
      {face && image && selection?.kind === 'image' && (
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-sm">Image</h3>
          <div className="space-y-2">
            <Label className="text-xs">Size: {Math.round(image.scale * 100)}%</Label>
            <Slider min={10} max={200} step={1} value={[Math.round(image.scale * 100)]} onValueChange={([v]) => updateImage({ scale: v / 100 }, 'image-scale')} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Rotation: {image.rotation}°</Label>
            <Slider min={-180} max={180} step={1} value={[image.rotation]} onValueChange={([v]) => updateImage({ rotation: v }, 'image-rotate')} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => updateImage({ position: { x: 0.5, y: 0.5 }, rotation: 0 })}>
              <Crosshair className="w-4 h-4 mr-1" /> Centre
            </Button>
            <Button variant="outline" size="sm" className="text-destructive" onClick={removeSelected}>
              <Trash2 className="w-4 h-4 mr-1" /> Remove
            </Button>
          </div>
        </Card>
      )}

      {/* Selected text controls */}
      {face && selectedText && (
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-sm">Text</h3>
          <Textarea
            value={selectedText.text}
            maxLength={500}
            rows={2}
            onChange={(e) => updateText(selectedText.id, { text: e.target.value }, `text-${selectedText.id}`)}
            aria-label="Text content"
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Font</Label>
              <Select value={selectedText.font} onValueChange={(v) => updateText(selectedText.id, { font: v })}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(FONTS.includes(selectedText.font) ? FONTS : [selectedText.font, ...FONTS]).map((f) => (
                    <SelectItem key={f} value={f} style={{ fontFamily: f }}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Alignment</Label>
              <div className="flex gap-1">
                {(['left', 'center', 'right'] as const).map((a) => {
                  const Icon = a === 'left' ? AlignLeft : a === 'right' ? AlignRight : AlignCenter;
                  return (
                    <Button
                      key={a}
                      size="sm"
                      variant={selectedText.align === a ? 'default' : 'outline'}
                      className="h-9 flex-1 px-0"
                      aria-label={`Align ${a}`}
                      onClick={() => updateText(selectedText.id, { align: a })}
                    >
                      <Icon className="w-4 h-4" />
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">
              Size: {selectedText.size} pt (~{Math.round(selectedText.size * PT_TO_CM * 10) / 10} cm tall)
            </Label>
            <Slider min={8} max={300} step={1} value={[selectedText.size]} onValueChange={([v]) => updateText(selectedText.id, { size: v }, 'text-size')} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Rotation: {selectedText.rotation}°</Label>
            <Slider min={-180} max={180} step={1} value={[selectedText.rotation]} onValueChange={([v]) => updateText(selectedText.id, { rotation: v }, 'text-rotate')} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Label className="text-xs mr-1">Colour</Label>
            {INK_SWATCHES.map((c) => (
              <button
                key={c}
                aria-label={`Colour ${c}`}
                onClick={() => updateText(selectedText.id, { color: c })}
                className={`w-6 h-6 rounded-full border ${selectedText.color.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-primary' : 'border-border'}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={/^#[0-9a-f]{6}$/i.test(selectedText.color) ? selectedText.color : '#111111'}
              onChange={(e) => updateText(selectedText.id, { color: e.target.value }, 'text-colour')}
              className="w-7 h-7 rounded cursor-pointer"
              aria-label="Custom text colour"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const id = newId();
                update((d) => ({
                  textElements: [
                    ...d.textElements,
                    { ...selectedText, id, position: { x: clamp01(selectedText.position.x + 0.05), y: clamp01(selectedText.position.y + 0.08) } },
                  ],
                }));
                setSelection({ kind: 'text', id });
              }}
            >
              <Copy className="w-4 h-4 mr-1" /> Duplicate
            </Button>
            <Button variant="outline" size="sm" className="text-destructive" onClick={removeSelected}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
