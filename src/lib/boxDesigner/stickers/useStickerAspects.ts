/**
 * Width / height of each sticker in a design, for checks that need real shapes (print check).
 * Decodes the artwork once (cached) and re-renders when it is known; unknown ids stay square.
 */

import { useEffect, useState } from 'react';
import type { StickerPlacement } from '@/types/boxDesigner';
import { stickerRegistry } from './registry';
import { cachedAspect, getStickerBitmap } from './image';

export function useStickerAspects(stickers: StickerPlacement[]): Record<string, number> {
  const [aspects, setAspects] = useState<Record<string, number>>({});
  const key = Array.from(new Set(stickers.map((s) => s.stickerId))).sort().join(',');

  useEffect(() => {
    if (!key) {
      setAspects({});
      return;
    }
    let cancelled = false;
    (async () => {
      const next: Record<string, number> = {};
      for (const id of key.split(',')) {
        const def = await stickerRegistry.loadSticker(id);
        if (!def) continue;
        await getStickerBitmap(def.src, null, 64); // decodes and caches the aspect ratio
        next[id] = cachedAspect(def.src);
      }
      if (!cancelled) setAspects(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [key]);

  return aspects;
}
