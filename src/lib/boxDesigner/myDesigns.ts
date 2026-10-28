/**
 * My designs (#7) with version snapshots (#28-lite, #30), stored in this browser (no accounts).
 * Each saved design keeps its newest versions, a small thumbnail and a name. When storage is full the snapshot is
 * saved without uploaded images (spec, colours and text are always kept) and the caller tells the user.
 * SECURITY: entries are validated with zod on read and every design goes through parseDesign().
 */

import { z } from 'zod';
import type { BoxDesign } from '@/types/boxDesigner';
import { parseDesign, serializeDesign } from './designCodec';
import { browserStore, readJson, writeString, KeyValueStore } from './localStore';

export const MY_DESIGNS_KEY = 'vayu-box-designer:my-designs';
export const MAX_DESIGNS = 24;
export const MAX_VERSIONS = 10;
const MAX_THUMB_CHARS = 120_000;

const versionSchema = z.object({ at: z.number().finite(), design: z.string().max(30 * 1024 * 1024) });
const entrySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{4,40}$/),
  name: z.string().max(80),
  createdAt: z.number().finite(),
  updatedAt: z.number().finite(),
  thumb: z.string().max(MAX_THUMB_CHARS).regex(/^data:image\/(jpeg|png|webp);base64,/).nullable(),
  versions: z.array(versionSchema).min(1).max(MAX_VERSIONS),
});

export type SavedDesign = z.infer<typeof entrySchema>;

export function listDesigns(store: KeyValueStore | null = browserStore()): SavedDesign[] {
  const raw = readJson(MY_DESIGNS_KEY, store);
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => entrySchema.safeParse(item))
    .filter((r): r is z.SafeParseSuccess<SavedDesign> => r.success)
    .map((r) => r.data)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_DESIGNS);
}

function write(list: SavedDesign[], store: KeyValueStore | null): boolean {
  return writeString(MY_DESIGNS_KEY, JSON.stringify(list), store);
}

const newId = () => `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function defaultDesignName(design: BoxDesign): string {
  if (design.name.trim()) return design.name.trim().slice(0, 80);
  const { length, width, height } = design.dimensions;
  return `${design.template.toUpperCase()} ${length}×${width}×${height}`;
}

export interface SaveResult {
  ok: boolean;
  entry: SavedDesign | null;
  /** True when images had to be left out to fit in storage */
  imagesDropped: boolean;
}

/**
 * Save a design. With `id` it adds a new version to that entry (newest first); otherwise it creates a new entry.
 * The oldest entries/versions are dropped first when storage runs out.
 */
export function saveDesign(
  design: BoxDesign,
  options: { id?: string | null; name?: string; thumb?: string | null; now?: number } = {},
  store: KeyValueStore | null = browserStore()
): SaveResult {
  const now = options.now ?? Date.now();
  const list = listDesigns(store);
  const existing = options.id ? list.find((e) => e.id === options.id) : undefined;
  const thumb = options.thumb && options.thumb.length <= MAX_THUMB_CHARS && /^data:image\/(jpeg|png|webp);base64,/.test(options.thumb) ? options.thumb : existing?.thumb ?? null;
  const name = (options.name ?? existing?.name ?? defaultDesignName(design)).slice(0, 80);

  const build = (includeImages: boolean, versionsKept: number): SavedDesign[] => {
    const version = { at: now, design: serializeDesign(design, { includeImages }) };
    const entry: SavedDesign = existing
      ? { ...existing, name, thumb, updatedAt: now, versions: [version, ...existing.versions].slice(0, versionsKept) }
      : { id: newId(), name, createdAt: now, updatedAt: now, thumb, versions: [version] };
    return [entry, ...list.filter((e) => e.id !== entry.id)].slice(0, MAX_DESIGNS);
  };

  // Try: full; without images; then trim older versions and older designs until it fits
  for (const includeImages of [true, false]) {
    let next = build(includeImages, MAX_VERSIONS);
    for (let attempt = 0; attempt < 8; attempt++) {
      if (write(next, store)) return { ok: true, entry: next[0], imagesDropped: !includeImages && design.faceImages.length > 0 };
      if (next.length > 1) next = next.slice(0, -1);
      else next = [{ ...next[0], versions: next[0].versions.slice(0, 1) }];
    }
  }
  return { ok: false, entry: null, imagesDropped: false };
}

export function loadVersion(entry: SavedDesign, index = 0): BoxDesign | null {
  const version = entry.versions[index];
  return version ? parseDesign(version.design) : null;
}

export function renameDesign(id: string, name: string, store: KeyValueStore | null = browserStore()): SavedDesign[] {
  const list = listDesigns(store).map((e) => (e.id === id ? { ...e, name: name.trim().slice(0, 80) || e.name } : e));
  write(list, store);
  return list;
}

export function deleteDesign(id: string, store: KeyValueStore | null = browserStore()): SavedDesign[] {
  const list = listDesigns(store).filter((e) => e.id !== id);
  write(list, store);
  return list;
}

export function duplicateDesign(id: string, store: KeyValueStore | null = browserStore(), now = Date.now()): SavedDesign[] {
  const list = listDesigns(store);
  const source = list.find((e) => e.id === id);
  if (!source) return list;
  const copy: SavedDesign = { ...source, id: newId(), name: `${source.name} (copy)`.slice(0, 80), createdAt: now, updatedAt: now, versions: source.versions.slice(0, 1) };
  const next = [copy, ...list].slice(0, MAX_DESIGNS);
  return write(next, store) ? next : list;
}
