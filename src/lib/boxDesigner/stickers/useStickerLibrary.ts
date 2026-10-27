/**
 * React access to the lazy sticker library. The categories list is available immediately; the manifests (small
 * text modules, not images) load the first time `enabled` is true, and the component re-renders as they arrive.
 */

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { stickerRegistry } from './registry';

export function useStickerLibrary(enabled = true) {
  const version = useSyncExternalStore(stickerRegistry.subscribe, stickerRegistry.getVersion, stickerRegistry.getVersion);

  useEffect(() => {
    if (enabled) void stickerRegistry.loadAll();
  }, [enabled]);

  return useMemo(() => {
    void version; // recompute when a category finishes loading
    const categories = stickerRegistry.listCategories();
    return {
      registry: stickerRegistry,
      categories,
      all: stickerRegistry.allLoaded(),
      ready: categories.every((c) => c.count !== undefined),
    };
  }, [version]);
}
