/**
 * Thumbnail marks for a template or wizard sticker composition, looked up in the lazy cutout library. Stickers whose
 * category has not loaded yet are skipped until it does (the component re-renders as categories arrive).
 */

import { useSyncExternalStore } from 'react';
import type { ThumbMark } from './BoxThumbnail';
import type { TemplateSticker } from '@/lib/boxDesigner/templates';
import { stickerRegistry } from '@/lib/boxDesigner/stickers/registry';

export function useStickerMarks(stickers: TemplateSticker[]): ThumbMark[] {
  useSyncExternalStore(stickerRegistry.subscribe, stickerRegistry.getVersion, stickerRegistry.getVersion);
  const marks: ThumbMark[] = [];
  for (const sticker of stickers) {
    const def = stickerRegistry.getSticker(sticker.id);
    if (def) marks.push({ src: def.src, face: sticker.face, x: sticker.x, y: sticker.y, scale: sticker.scale, flip: sticker.flip, rotation: sticker.rotation });
  }
  return marks;
}
