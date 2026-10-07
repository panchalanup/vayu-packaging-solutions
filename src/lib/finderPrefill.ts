/**
 * Packaging Finder hand-off (§9.8): reads ?l,w,h,ply,style,qty and the Box Designer's router state.
 * SECURITY: everything here is untrusted (URL, history.state). Values are checked against allow-lists or numeric
 * ranges and are only ever used as form defaults, never as HTML or URLs.
 */

import type { PlyType, BoxTemplate } from '@/types/boxDesigner';
import { DEFAULT_DESIGN, encodeShareHash } from '@/lib/boxDesigner/designCodec';
import { DIMENSION_LIMITS, PLY_OPTIONS } from '@/lib/boxDesigner/constants';

const PLIES: readonly PlyType[] = ['3-ply', '5-ply', '7-ply'];
const STYLES: readonly BoxTemplate[] = ['rsc', 'hsc', 'mailer'];

export interface FinderPrefill {
  length_mm?: number;
  width_mm?: number;
  height_mm?: number;
  ply?: PlyType;
  style?: BoxTemplate;
  quantity?: number;
}

export const FINDER_DEFAULT_QTY = 500;
const MAX_QTY = 1_000_000;

const inRange = (n: unknown, min: number, max: number): n is number =>
  typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max;

const dimMm = (value: unknown): number | undefined => {
  const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return inRange(n, 10, 5000) ? Math.round(n) : undefined;
};

const plyOf = (value: unknown): PlyType | undefined => {
  if (typeof value !== 'string') return undefined;
  const v = /^[357]$/.test(value) ? `${value}-ply` : value;
  return (PLIES as readonly string[]).includes(v) ? (v as PlyType) : undefined;
};

const styleOf = (value: unknown): BoxTemplate | undefined =>
  typeof value === 'string' && (STYLES as readonly string[]).includes(value.toLowerCase())
    ? (value.toLowerCase() as BoxTemplate)
    : undefined;

const qtyOf = (value: unknown): number | undefined => {
  const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return inRange(n, 1, MAX_QTY) ? Math.round(n) : undefined;
};

/** Box Designer sends dimensions in cm inside `state.boxDesign` */
function fromBoxDesignState(state: unknown): FinderPrefill {
  if (!state || typeof state !== 'object') return {};
  const design = (state as { boxDesign?: unknown }).boxDesign;
  if (!design || typeof design !== 'object') return {};
  const { dimensions, ply, template } = design as { dimensions?: Record<string, unknown>; ply?: unknown; template?: unknown };
  const cmToMm = (cm: unknown) => (typeof cm === 'number' ? dimMm(cm * 10) : undefined);
  return {
    length_mm: cmToMm(dimensions?.length),
    width_mm: cmToMm(dimensions?.width),
    height_mm: cmToMm(dimensions?.height),
    ply: plyOf(ply),
    style: styleOf(template),
  };
}

/** URL params win over router state; sizes in the URL are mm (same as /quote) */
export function parseFinderPrefill(search: string, state?: unknown): FinderPrefill {
  const p = new URLSearchParams(search);
  const fromUrl: FinderPrefill = {
    length_mm: dimMm(p.get('l')),
    width_mm: dimMm(p.get('w')),
    height_mm: dimMm(p.get('h')),
    ply: plyOf(p.get('ply')),
    style: styleOf(p.get('style')),
    quantity: qtyOf(p.get('qty')),
  };
  const merged = { ...fromBoxDesignState(state), ...Object.fromEntries(Object.entries(fromUrl).filter(([, v]) => v !== undefined)) };
  return Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== undefined)) as FinderPrefill;
}

/** Deep link into the 3D designer for the entered size (inside size, mm to cm, clamped to the tool's limits) */
export function designerHref(dims: { length_mm?: number; width_mm?: number; height_mm?: number }, ply?: PlyType): string | null {
  const { length_mm, width_mm, height_mm } = dims;
  if (!length_mm || !width_mm || !height_mm) return null;
  const cm = (mm: number) => Math.min(DIMENSION_LIMITS.max, Math.max(DIMENSION_LIMITS.min, Math.round(mm) / 10));
  const chosen = ply ?? DEFAULT_DESIGN.ply;
  const flutes = PLY_OPTIONS.find((o) => o.id === chosen)?.flutes[0] ?? DEFAULT_DESIGN.flutes;
  const hash = encodeShareHash({
    ...DEFAULT_DESIGN,
    ply: chosen,
    flutes,
    dimensions: { length: cm(length_mm), width: cm(width_mm), height: cm(height_mm) },
  });
  return `/box-designer${hash}`;
}
