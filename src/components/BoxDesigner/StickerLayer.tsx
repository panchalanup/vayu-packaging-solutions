/**
 * Sticker layer for the 2D surface editor.
 *  - StickerCanvas draws stickers with the same code as the 3D print layer (tint, flip, opacity, pattern), so what
 *    you see here is what is printed. Drawing is coalesced to animation frames and cached bitmaps keep drags smooth.
 *  - StickerHandles adds invisible hit boxes for dragging and, on the selected sticker, corner handles to resize and
 *    a handle to rotate. Every change goes through onChange (the undoable store); drags coalesce by key.
 */

import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';
import type { StickerPlacement } from '@/types/boxDesigner';
import { drawStickers } from '@/lib/boxDesigner/textures/printLayer';
import { cachedAspect } from '@/lib/boxDesigner/stickers/image';
import { stickerRegistry } from '@/lib/boxDesigner/stickers/registry';
import { SCALE_LIMITS, stickerBoxPx } from '@/lib/boxDesigner/stickers/placement';

type Change = (id: string, patch: Partial<StickerPlacement>, key: string) => void;

interface StickerCanvasProps {
  stickers: StickerPlacement[];
  /** under = patterns (backgrounds), over = single stickers */
  pass: 'under' | 'over';
  width: number;
  height: number;
  /** Called after each draw so the parent can pick up decoded aspect ratios */
  onDrawn?: () => void;
}

export function StickerCanvas({ stickers, pass, width, height, onDrawn }: StickerCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const token = useRef(0);
  const list = stickers.filter((s) => (pass === 'under' ? !!s.pattern : !s.pattern));

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || width < 2 || height < 2) return;
    const mine = ++token.current;
    const frame = window.requestAnimationFrame(async () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(2, Math.round(width * dpr));
      const h = Math.max(2, Math.round(height * dpr));
      const off = document.createElement('canvas');
      off.width = w;
      off.height = h;
      const offCtx = off.getContext('2d');
      if (!offCtx) return;
      try {
        await drawStickers(offCtx, w, h, list);
      } catch (error) {
        console.warn('[BoxDesigner] Sticker preview failed', error);
      }
      if (token.current !== mine) return; // a newer draw superseded this one
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, w, h);
      ctx?.drawImage(off, 0, 0);
      onDrawn?.();
    });
    return () => window.cancelAnimationFrame(frame);
    // list identity changes with the design; onDrawn is intentionally not a dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stickers, pass, width, height]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" style={{ zIndex: pass === 'under' ? 0 : 20 }} />;
}

interface HandlesProps {
  stickers: StickerPlacement[];
  selectedId: string | null;
  /** Preview size in px */
  width: number;
  height: number;
  /** The preview element, for pointer maths */
  containerRef: RefObject<HTMLElement>;
  onSelect: (id: string) => void;
  onChange: Change;
}

const CORNERS = [
  { id: 'nw', x: -1, y: -1, cursor: 'nwse-resize' },
  { id: 'ne', x: 1, y: -1, cursor: 'nesw-resize' },
  { id: 'se', x: 1, y: 1, cursor: 'nwse-resize' },
  { id: 'sw', x: -1, y: 1, cursor: 'nesw-resize' },
] as const;

export function StickerHandles({ stickers, selectedId, width, height, containerRef, onSelect, onChange }: HandlesProps) {
  const drag = useRef<
    | { mode: 'move'; id: string; dx: number; dy: number }
    | { mode: 'scale'; id: string; cx: number; cy: number; d0: number; s0: number }
    | { mode: 'rotate'; id: string; cx: number; cy: number }
    | null
  >(null);

  const rectOf = () => containerRef.current?.getBoundingClientRect();

  const startMove = (e: ReactPointerEvent, s: StickerPlacement) => {
    const rect = rectOf();
    if (!rect) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect(s.id);
    if (s.locked) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { mode: 'move', id: s.id, dx: (e.clientX - rect.left) / rect.width - s.position.x, dy: (e.clientY - rect.top) / rect.height - s.position.y };
  };

  const startScale = (e: ReactPointerEvent, s: StickerPlacement) => {
    const rect = rectOf();
    if (!rect) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    const cx = rect.left + s.position.x * rect.width;
    const cy = rect.top + s.position.y * rect.height;
    drag.current = { mode: 'scale', id: s.id, cx, cy, d0: Math.max(4, Math.hypot(e.clientX - cx, e.clientY - cy)), s0: s.scale };
  };

  const startRotate = (e: ReactPointerEvent, s: StickerPlacement) => {
    const rect = rectOf();
    if (!rect) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { mode: 'rotate', id: s.id, cx: rect.left + s.position.x * rect.width, cy: rect.top + s.position.y * rect.height };
  };

  const move = (e: ReactPointerEvent) => {
    const d = drag.current;
    const rect = rectOf();
    if (!d || !rect) return;
    if (d.mode === 'move') {
      const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width - d.dx));
      const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height - d.dy));
      onChange(d.id, { position: { x, y } }, `sticker-drag-${d.id}`);
    } else if (d.mode === 'scale') {
      const dist = Math.hypot(e.clientX - d.cx, e.clientY - d.cy);
      const scale = Math.min(SCALE_LIMITS.max, Math.max(SCALE_LIMITS.min, d.s0 * (dist / d.d0)));
      onChange(d.id, { scale: Math.round(scale * 1000) / 1000 }, `sticker-scale-${d.id}`);
    } else {
      let deg = (Math.atan2(e.clientY - d.cy, e.clientX - d.cx) * 180) / Math.PI + 90;
      if (deg > 180) deg -= 360;
      if (e.shiftKey) deg = Math.round(deg / 15) * 15; // snap
      onChange(d.id, { rotation: Math.round(deg) }, `sticker-rotate-${d.id}`);
    }
  };
  const end = () => (drag.current = null);

  return (
    <>
      {stickers
        .filter((s) => !s.pattern)
        .map((s) => {
          const box = stickerBoxPx(width, height, s.scale, cachedAspect(stickerSrc(s.stickerId)));
          const selected = s.id === selectedId;
          return (
            <div
              key={s.id}
              data-sticker-id={s.id}
              onPointerDown={(e) => startMove(e, s)}
              onPointerMove={move}
              onPointerUp={end}
              onPointerCancel={end}
              className={`absolute ${s.locked ? 'cursor-not-allowed' : 'cursor-move'} ${selected ? 'outline outline-2 outline-primary' : 'hover:outline hover:outline-1 hover:outline-primary/50'}`}
              style={{
                left: `${s.position.x * 100}%`,
                top: `${s.position.y * 100}%`,
                width: box.w,
                height: box.h,
                transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`,
                zIndex: selected ? 50 : 30,
              }}
              aria-label={`Sticker ${stickerRegistry.getSticker(s.stickerId)?.name ?? s.stickerId}${s.locked ? ' (locked)' : ''}`}
            >
              {selected && !s.locked && (
                <>
                  {CORNERS.map((c) => (
                    <span
                      key={c.id}
                      onPointerDown={(e) => startScale(e, s)}
                      onPointerMove={move}
                      onPointerUp={end}
                      onPointerCancel={end}
                      className="absolute h-3.5 w-3.5 rounded-sm border-2 border-primary bg-white touch-none"
                      style={{
                        left: c.x < 0 ? -7 : undefined,
                        right: c.x > 0 ? -7 : undefined,
                        top: c.y < 0 ? -7 : undefined,
                        bottom: c.y > 0 ? -7 : undefined,
                        cursor: c.cursor,
                      }}
                      aria-hidden="true"
                    />
                  ))}
                  <span
                    onPointerDown={(e) => startRotate(e, s)}
                    onPointerMove={move}
                    onPointerUp={end}
                    onPointerCancel={end}
                    className="absolute left-1/2 h-3.5 w-3.5 -translate-x-1/2 cursor-grab rounded-full border-2 border-primary bg-white touch-none"
                    style={{ top: -26 }}
                    title="Rotate (hold Shift to snap)"
                    aria-hidden="true"
                  />
                </>
              )}
            </div>
          );
        })}
    </>
  );
}

const stickerSrc = (id: string) => stickerRegistry.getSticker(id)?.src ?? '';
