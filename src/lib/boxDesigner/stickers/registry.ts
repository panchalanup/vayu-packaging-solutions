/**
 * Sticker registry
 * One lazily loaded manifest module per category (./library/<category>.ts, each exporting an array of
 * { id, name, category, tags, kind, src }). Listing categories is synchronous (from the module names); a category's
 * stickers are loaded the first time they are needed, so the designer bundle does not grow with the library.
 * Until the real library exists a small placeholder pack is used.
 */

import type { StickerCategory, StickerDef, StickerFilters, StickerKind } from './types';
import { categoryName, categorySortIndex } from './categories';
import { matchStickers, pickRecommended } from './search';

type Loader = () => Promise<unknown>;

const KINDS: StickerKind[] = ['colour', 'mono', 'pattern'];
const SAFE_SRC = /^(data:image\/|blob:|\/|\.\/|https?:\/\/)/i;

/** Pull the array out of a manifest module (default export, or the first array export) and sanitise every item */
export function normaliseManifest(module: unknown, categoryId: string): StickerDef[] {
  let list: unknown;
  if (Array.isArray(module)) list = module;
  else if (module && typeof module === 'object') {
    const record = module as Record<string, unknown>;
    list = Array.isArray(record.default) ? record.default : Object.values(record).find(Array.isArray);
  }
  if (!Array.isArray(list)) return [];
  const out: StickerDef[] = [];
  const seen = new Set<string>();
  for (const raw of list) {
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as Record<string, unknown>;
    if (typeof r.id !== 'string' || !/^[a-z0-9][a-z0-9._-]{0,63}$/i.test(r.id) || seen.has(r.id)) continue;
    if (typeof r.src !== 'string' || !SAFE_SRC.test(r.src)) continue;
    seen.add(r.id);
    out.push({
      id: r.id,
      name: typeof r.name === 'string' && r.name ? r.name : r.id,
      category: typeof r.category === 'string' && r.category ? r.category : categoryId,
      tags: Array.isArray(r.tags) ? r.tags.filter((t): t is string => typeof t === 'string').slice(0, 24) : [],
      kind: KINDS.includes(r.kind as StickerKind) ? (r.kind as StickerKind) : 'colour',
      src: r.src,
    });
  }
  return out;
}

export function createStickerRegistry(loaders: Record<string, Loader>) {
  const byCategory = new Map<string, StickerDef[]>();
  const byId = new Map<string, StickerDef>();
  const pending = new Map<string, Promise<StickerDef[]>>();
  const listeners = new Set<() => void>();
  let version = 0;
  let allPromise: Promise<StickerDef[]> | null = null;

  const notify = () => {
    version++;
    listeners.forEach((l) => l());
  };

  function listCategories(): StickerCategory[] {
    return Object.keys(loaders)
      .map((id) => ({ id, name: categoryName(id), count: byCategory.get(id)?.length }))
      .sort((a, b) => categorySortIndex(a.id) - categorySortIndex(b.id) || a.name.localeCompare(b.name));
  }

  function loadCategory(id: string): Promise<StickerDef[]> {
    const done = byCategory.get(id);
    if (done) return Promise.resolve(done);
    const inFlight = pending.get(id);
    if (inFlight) return inFlight;
    const loader = loaders[id];
    if (!loader) return Promise.resolve([]);
    const promise = loader()
      .then((mod) => {
        const list = normaliseManifest(mod, id);
        byCategory.set(id, list);
        for (const s of list) if (!byId.has(s.id)) byId.set(s.id, s);
        notify();
        return list;
      })
      .catch((error) => {
        console.warn('[BoxDesigner] Could not load sticker category', id, error);
        byCategory.set(id, []);
        return [];
      })
      .finally(() => pending.delete(id));
    pending.set(id, promise);
    return promise;
  }

  function loadAll(): Promise<StickerDef[]> {
    if (!allPromise) allPromise = Promise.all(listCategories().map((c) => loadCategory(c.id))).then(() => allLoaded());
    return allPromise;
  }

  /** Everything loaded so far, in category order */
  function allLoaded(): StickerDef[] {
    return listCategories().flatMap((c) => byCategory.get(c.id) ?? []);
  }

  return {
    listCategories,
    loadCategory,
    loadAll,
    allLoaded,
    /** Sync lookup; undefined until the sticker's category has loaded (see loadSticker) */
    getSticker: (id: string): StickerDef | undefined => byId.get(id),
    /** Async lookup that loads categories as needed */
    async loadSticker(id: string): Promise<StickerDef | undefined> {
      if (byId.has(id)) return byId.get(id);
      await loadAll();
      return byId.get(id);
    },
    /** Search what is loaded. Call loadAll() first (useStickerLibrary does) for the whole library. */
    searchStickers: (query = '', filters: StickerFilters = {}): StickerDef[] => matchStickers(allLoaded(), query, filters),
    recommendedFor: (style: string, templateCategory?: string | null, limit = 12): StickerDef[] =>
      pickRecommended(allLoaded(), style, templateCategory, limit),
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getVersion: () => version,
  };
}

export type StickerRegistry = ReturnType<typeof createStickerRegistry>;

function defaultLoaders(): Record<string, Loader> {
  const modules = import.meta.glob(['./library/*.ts', '!./library/index.ts', '!./library/types.ts', '!./library/_*.ts']) as Record<string, Loader>;
  const loaders: Record<string, Loader> = {};
  for (const [path, load] of Object.entries(modules)) {
    const id = /\/([^/]+)\.ts$/.exec(path)?.[1];
    if (id) loaders[id] = load;
  }
  if (Object.keys(loaders).length === 0) loaders.starter = () => import('./placeholder').then((m) => m.PLACEHOLDER_STICKERS);
  return loaders;
}

export const stickerRegistry: StickerRegistry = createStickerRegistry(defaultLoaders());

export const listCategories = () => stickerRegistry.listCategories();
export const getSticker = (id: string) => stickerRegistry.getSticker(id);
export const loadSticker = (id: string) => stickerRegistry.loadSticker(id);
export const searchStickers = (query?: string, filters?: StickerFilters) => stickerRegistry.searchStickers(query, filters);
export const recommendedFor = (style: string, templateCategory?: string | null, limit?: number) =>
  stickerRegistry.recommendedFor(style, templateCategory, limit);
