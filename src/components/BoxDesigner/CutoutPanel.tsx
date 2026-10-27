/**
 * Cutouts (stickers) browser for the Artwork tab: category chips, search, a "recommended for this box" row and a lazy
 * thumbnail grid. One tap adds a cutout to the selected surface (or the front / first surface). Also hosts the two
 * playful helpers: "Surprise me" and "Match brand colour".
 * The library is lazy: manifests load when this panel mounts, thumbnails load as they scroll into view.
 */

import { useMemo, useRef, useState } from 'react';
import { Search, Shuffle, Palette, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { BoxDesign, BoxFace, StickerPlacement } from '@/types/boxDesigner';
import { MAX_STICKERS } from '@/types/boxDesigner';
import { useStickerLibrary } from '@/lib/boxDesigner/stickers/useStickerLibrary';
import { canAddStickers, makeSticker, tintAll } from '@/lib/boxDesigner/stickers/placement';
import { generateSurprise } from '@/lib/boxDesigner/stickers/surprise';
import { BASIC_TINTS } from '@/lib/boxDesigner/stickers/palettes';
import type { StickerDef } from '@/lib/boxDesigner/stickers/types';
import { loadBrandKit } from '@/lib/boxDesigner/brandKit';
import { contrastRatio } from '@/lib/boxDesigner/printChecks';
import { DESIGNER_EVENTS, designProps, useDesignerTracker } from '@/lib/boxDesigner/funnel';

type Update = (patch: Partial<BoxDesign> | ((d: BoxDesign) => Partial<BoxDesign>), key?: string) => void;

interface CutoutPanelProps {
  design: BoxDesign;
  update: Update;
  /** Surface the cutout is added to (null = front or the first surface) */
  face: BoxFace | null;
  faceSizes: Partial<Record<BoxFace, { widthCm: number; heightCm: number }>>;
  /** Template gallery category, when the design came from a template (improves recommendations) */
  templateCategory?: string | null;
  onAdded: (sticker: StickerPlacement) => void;
}

const PAGE = 40;

function Thumb({ sticker, onAdd }: { sticker: StickerDef; onAdd: (s: StickerDef) => void }) {
  return (
    <button
      type="button"
      onClick={() => onAdd(sticker)}
      title={sticker.name}
      aria-label={`Add ${sticker.name}`}
      className="group flex aspect-square items-center justify-center rounded-md border border-border bg-white p-1.5 transition hover:border-primary hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary active:scale-95"
    >
      <img src={sticker.src} alt="" loading="lazy" decoding="async" draggable={false} className="max-h-full max-w-full object-contain" />
    </button>
  );
}

export default function CutoutPanel({ design, update, face, faceSizes, templateCategory = null, onAdded }: CutoutPanelProps) {
  const { registry, categories, all, ready } = useStickerLibrary(true);
  const track = useDesignerTracker();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [shown, setShown] = useState(PAGE);
  const [tintOpen, setTintOpen] = useState(false);
  const lastAdd = useRef({ id: '', at: 0 });

  const faces = Object.keys(faceSizes) as BoxFace[];
  const targetFace: BoxFace | null = face && faceSizes[face] ? face : faces.includes('front') ? 'front' : faces[0] ?? null;

  const results = useMemo(() => registry.searchStickers(query, { category }), [registry, query, category, all]); // eslint-disable-line react-hooks/exhaustive-deps
  const recommended = useMemo(() => registry.recommendedFor(design.template, templateCategory, 12), [registry, design.template, templateCategory, all]); // eslint-disable-line react-hooks/exhaustive-deps
  const brandColours = useMemo(() => loadBrandKit().colours, []);

  const add = (def: StickerDef) => {
    if (!targetFace) return;
    // a quick double tap should add one cutout, not two
    const now = Date.now();
    if (lastAdd.current.id === def.id && now - lastAdd.current.at < 350) return;
    lastAdd.current = { id: def.id, at: now };
    if (!canAddStickers(design.stickers)) {
      toast.error(`You can add up to ${MAX_STICKERS} cutouts. Delete one to add another.`);
      return;
    }
    const onFace = design.stickers.filter((s) => s.face === targetFace).length;
    const step = (onFace % 5) * 0.05;
    const placement = makeSticker(def.id, targetFace, {
      kind: def.kind,
      position: def.kind === 'pattern' ? { x: 0.5, y: 0.5 } : { x: 0.5 + step - 0.1, y: 0.5 + step - 0.1 },
      // mono icons start in the board's contrast ink so they are visible straight away
      tint: def.kind === 'mono' ? (contrastRatio('#111111', design.colorHex) >= 3 ? '#111111' : '#FFFFFF') : null,
    });
    update((d) => (canAddStickers(d.stickers) ? { stickers: [...d.stickers, placement] } : {}));
    onAdded(placement);
    track(DESIGNER_EVENTS.stickerAdded, { ...designProps(design), category: def.category, kind: def.kind });
    if (def.kind === 'pattern') track(DESIGNER_EVENTS.stickerPattern, { ...designProps(design), action: 'add' });
  };

  const surprise = () => {
    if (!all.length) {
      toast.message('The cutout library is still loading. Try again in a moment.');
      return;
    }
    const result = generateSurprise({ style: design.template, templateCategory, faces: faceSizes, library: all });
    if (!result.stickers.length) return;
    update({ stickers: result.stickers, colorHex: result.board });
    track(DESIGNER_EVENTS.surpriseMe, { ...designProps(design), palette: result.palette.id });
    toast.success(`Surprise: ${result.palette.name} palette`, { description: 'Not keen? Press Undo, or tap again for another.' });
  };

  const matchColour = (colour: string | null) => {
    update((d) => ({ stickers: tintAll(d.stickers, colour) }));
    setTintOpen(false);
    toast.success(colour ? 'All cutouts now use that colour' : 'Original colours restored');
  };

  const filteredCategories = categories.filter((c) => c.count === undefined || c.count > 0);

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Cutouts</h3>
        <span className="text-xs text-muted-foreground">
          {design.stickers.length}/{MAX_STICKERS} used
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" variant="outline" onClick={surprise} disabled={!ready}>
          <Shuffle className="mr-1 h-4 w-4" /> Surprise me
        </Button>
        <Button size="sm" variant="outline" onClick={() => setTintOpen((o) => !o)} disabled={design.stickers.length === 0} aria-expanded={tintOpen}>
          <Palette className="mr-1 h-4 w-4" /> Match brand colour
        </Button>
      </div>

      {tintOpen && (
        <div className="space-y-2 rounded-md border border-border p-2">
          <p className="text-xs text-muted-foreground">Recolour every cutout to one colour.</p>
          <div className="flex flex-wrap items-center gap-2">
            {[...brandColours, ...BASIC_TINTS].map((c, i) => (
              <button
                key={`${c}-${i}`}
                type="button"
                aria-label={`Use ${c}`}
                onClick={() => matchColour(c)}
                className="h-6 w-6 rounded-full border border-border"
                style={{ backgroundColor: c }}
              />
            ))}
            <input type="color" aria-label="Pick any colour" className="h-7 w-7 cursor-pointer rounded" onChange={(e) => matchColour(e.target.value)} />
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => matchColour(null)}>
              Original colours
            </Button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShown(PAGE);
          }}
          placeholder="Search cutouts (mango, gift, star)"
          aria-label="Search cutouts"
          className="h-9 pl-8 pr-8 text-sm"
          maxLength={40}
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-2 top-2.5 text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Cutout categories">
        {[{ id: null as string | null, name: 'All' }, ...filteredCategories].map((c) => (
          <button
            key={c.id ?? 'all'}
            role="tab"
            aria-selected={category === c.id}
            onClick={() => {
              setCategory(c.id);
              setShown(PAGE);
            }}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs transition-colors ${
              category === c.id ? 'border-primary bg-primary text-white' : 'border-border hover:border-primary/60'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {!query && !category && recommended.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Recommended for this box</p>
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {recommended.map((s) => (
              <div key={s.id} className="w-14 shrink-0">
                <Thumb sticker={s} onAdd={add} />
              </div>
            ))}
          </div>
        </div>
      )}

      {!ready && all.length === 0 ? (
        <div className="grid grid-cols-5 gap-1.5" aria-busy="true">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <p className="py-3 text-center text-xs text-muted-foreground">No cutouts match. Try another word, such as fruit, gift or star.</p>
      ) : (
        <>
          <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-5" role="list" aria-label="Cutouts">
            {results.slice(0, shown).map((s) => (
              <div role="listitem" key={s.id}>
                <Thumb sticker={s} onAdd={add} />
              </div>
            ))}
          </div>
          {results.length > shown && (
            <Button size="sm" variant="ghost" className="w-full text-xs" onClick={() => setShown((n) => n + PAGE)}>
              Show more ({results.length - shown} left)
            </Button>
          )}
        </>
      )}
      {!targetFace && <p className="text-xs text-muted-foreground">This style has no printable surface yet.</p>}
    </Card>
  );
}
