/**
 * Openings (hand holes, vents, windows): pure data and geometry, no three.js, so layouts, the dieline and the
 * tests can use it. The 3D rig draws them as decals (see panelRig.ts header for the full API).
 *
 * Coordinates: centimetres, measured from the CENTRE of the panel's own rectangle (the rect the rig writes with
 * writePanel), +x along the panel's local x axis, +y up (away from the hinge for a flap). They do not depend on the
 * artwork print rotation.
 */

import type { BoxFace } from '@/types/boxDesigner';

export type OpeningKind = 'hand' | 'vent' | 'window';

export interface PanelOpening {
  kind: OpeningKind;
  /** Centre of the opening relative to the panel centre (cm) */
  cx: number;
  cy: number;
  /** Overall size (cm). A vent is a row of `count` slots filling this box. */
  width: number;
  height: number;
  /** Vent only: number of slots (default 4) */
  count?: number;
}

/** Openings per printable face of a layout */
export type OpeningMap = Partial<Record<BoxFace, PanelOpening[]>>;

/** What a style can offer (registry `openings`) */
export interface OpeningCaps {
  hand?: boolean;
  vents?: boolean;
  window?: boolean;
}

/** What the design asks for (schema v3 `options`); anything the style cannot do is ignored */
export interface OpeningSpec {
  handHoles: boolean;
  vents: boolean;
  window: boolean;
  /** Share of the panel the window covers, 0.2 .. 0.85 */
  windowRatio: number;
}

export const DEFAULT_WINDOW_RATIO = 0.55;
export const NO_OPENINGS: OpeningSpec = { handHoles: false, vents: false, window: false, windowRatio: DEFAULT_WINDOW_RATIO };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const fin = (v: number, fallback: number) => (Number.isFinite(v) ? v : fallback);

export function clampWindowRatio(ratio: unknown): number {
  return clamp(fin(Number(ratio), DEFAULT_WINDOW_RATIO), 0.2, 0.85);
}

/**
 * Options + style capabilities + style defaults -> what is actually cut.
 * An option that is undefined takes the style default; a capability the style lacks always wins (false); a forced
 * opening (part of the style itself, e.g. a window cake box) is always on.
 */
export function resolveOpeningSpec(
  caps: OpeningCaps | undefined,
  options: { handHoles?: boolean; vents?: boolean; window?: boolean; windowRatio?: number } | undefined,
  defaults: Partial<OpeningSpec> = {},
  forced: OpeningCaps = {}
): OpeningSpec {
  const forcedKey = { handHoles: forced.hand, vents: forced.vents, window: forced.window };
  const pick = (key: 'handHoles' | 'vents' | 'window', cap: boolean | undefined) =>
    !!forcedKey[key] || (!!cap && (options?.[key] ?? defaults[key] ?? false));
  return {
    handHoles: pick('handHoles', caps?.hand),
    vents: pick('vents', caps?.vents),
    window: pick('window', caps?.window),
    windowRatio: clampWindowRatio(options?.windowRatio ?? defaults.windowRatio),
  };
}

export const hasAnyOpening = (spec: OpeningSpec) => spec.handHoles || spec.vents || spec.window;

// ---------------------------------------------------------------------------------------------------------------
// Placement rules (shared by every style that cuts openings)
// ---------------------------------------------------------------------------------------------------------------

/** Hand slot of a carry / produce box wall: near the top, centred */
export function handHoleFor(spanCm: number, heightCm: number): PanelOpening | null {
  if (!(spanCm >= 8 && heightCm >= 7)) return null;
  const width = clamp(spanCm * 0.42, 6, Math.min(13, spanCm * 0.6));
  const height = clamp(heightCm * 0.2, 2, Math.min(3.8, heightCm * 0.35));
  const margin = Math.max(2, heightCm * 0.14);
  return { kind: 'hand', cx: 0, cy: heightCm / 2 - margin - height / 2, width, height };
}

/** A row of vertical vent slots; `lowered` puts it in the lower half (below a hand hole) */
export function ventRowFor(spanCm: number, heightCm: number, lowered = false): PanelOpening | null {
  if (!(spanCm >= 10 && heightCm >= 6)) return null;
  const count = clamp(Math.round(spanCm / 4.4), 3, 7);
  const width = Math.min(spanCm * 0.62, spanCm - 4);
  const height = clamp(heightCm * (lowered ? 0.22 : 0.4), 2, 7);
  const cy = lowered ? -heightCm / 2 + Math.max(2, heightCm * 0.12) + height / 2 : 0;
  return { kind: 'vent', cx: 0, cy, width, height, count };
}

/** A window centred on a panel: `ratio` of each side, never closer than 1.5 cm to the edge */
export function windowFor(widthCm: number, heightCm: number, ratio: number, cy = 0): PanelOpening | null {
  if (!(widthCm >= 6 && heightCm >= 6)) return null;
  const r = clampWindowRatio(ratio);
  const width = clamp(widthCm * r, 3, widthCm - 3);
  const height = clamp(heightCm * r, 3, heightCm - 3);
  return { kind: 'window', cx: 0, cy, width, height };
}

/**
 * Openings of one wall of a slotted carton.
 *  - short walls get the hand holes; long and short walls both get vents (below the hand hole on short walls)
 *  - the window goes on the front wall only
 */
export function wallOpeningsFor(
  role: { face: BoxFace; short: boolean; front: boolean },
  spanCm: number,
  heightCm: number,
  spec: OpeningSpec
): PanelOpening[] {
  const out: PanelOpening[] = [];
  const hand = spec.handHoles && role.short ? handHoleFor(spanCm, heightCm) : null;
  if (hand) out.push(hand);
  if (spec.vents) {
    const vent = ventRowFor(spanCm, heightCm, !!hand);
    // a lowered row only fits when the wall is tall enough to hold both
    if (vent && (!hand || heightCm >= 14)) out.push(vent);
  }
  if (spec.window && role.front) {
    const win = windowFor(spanCm, heightCm, spec.windowRatio);
    if (win) out.push(win);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------
// Outline geometry (3D decal and dieline cut lines)
// ---------------------------------------------------------------------------------------------------------------

export type Pt = [number, number];

/** Closed rounded rectangle, counter-clockwise, `seg` segments per corner */
export function roundedRect(cx: number, cy: number, w: number, h: number, radius: number, seg = 5): Pt[] {
  const r = clamp(radius, 0, Math.min(w, h) / 2);
  const pts: Pt[] = [];
  const corner = (ox: number, oy: number, a0: number) => {
    if (r <= 1e-6) {
      pts.push([ox, oy]);
      return;
    }
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (i / seg) * (Math.PI / 2);
      pts.push([ox + Math.cos(a) * r, oy + Math.sin(a) * r]);
    }
  };
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const y0 = cy - h / 2;
  const y1 = cy + h / 2;
  corner(x1 - r, y0 + r, -Math.PI / 2);
  corner(x1 - r, y1 - r, 0);
  corner(x0 + r, y1 - r, Math.PI / 2);
  corner(x0 + r, y0 + r, Math.PI);
  return pts;
}

/** Individual slots of a vent row (cm, panel-centre relative) */
export function ventSlots(o: PanelOpening): { cx: number; cy: number; width: number; height: number }[] {
  const count = clamp(Math.round(fin(o.count ?? 4, 4)), 1, 12);
  const gapRatio = 1.2;
  const slotW = o.width / (count + (count - 1) * gapRatio);
  const pitch = slotW * (1 + gapRatio);
  const first = o.cx - ((count - 1) * pitch) / 2;
  return Array.from({ length: count }, (_, i) => ({ cx: first + i * pitch, cy: o.cy, width: slotW, height: o.height }));
}

/** Closed outlines of an opening: one for a hand hole or window, one per slot for a vent */
export function openingOutlines(o: PanelOpening): Pt[][] {
  switch (o.kind) {
    case 'hand':
      // a pill: fully rounded ends
      return [roundedRect(o.cx, o.cy, o.width, o.height, o.height / 2, 6)];
    case 'vent':
      return ventSlots(o).map((s) => roundedRect(s.cx, s.cy, s.width, s.height, s.width / 2, 4));
    case 'window':
      return [roundedRect(o.cx, o.cy, o.width, o.height, Math.min(0.6, Math.min(o.width, o.height) * 0.12), 3)];
  }
}

/** Stable text key: equal keys mean the same decal geometry (the rig rebuilds only when it changes) */
export function openingsKey(list: readonly PanelOpening[] | undefined): string {
  if (!list || list.length === 0) return '';
  const q = (n: number) => Math.round(n * 100) / 100;
  return list.map((o) => `${o.kind}:${q(o.cx)}:${q(o.cy)}:${q(o.width)}:${q(o.height)}:${o.count ?? 0}`).join('|');
}

/** Open area of a list (cm2); slots and pills approximated by their outlines' bounding boxes minus rounding */
export function openingArea(list: readonly PanelOpening[] | undefined): number {
  if (!list) return 0;
  let area = 0;
  for (const o of list) {
    if (o.kind === 'vent') for (const s of ventSlots(o)) area += s.width * s.height * 0.92;
    else area += o.width * o.height * (o.kind === 'hand' ? 0.9 : 0.97);
  }
  return area;
}

/** Merge several maps (later entries append to earlier ones) */
export function mergeOpenings(...maps: (OpeningMap | undefined)[]): OpeningMap {
  const out: OpeningMap = {};
  for (const map of maps) {
    if (!map) continue;
    for (const [face, list] of Object.entries(map) as [BoxFace, PanelOpening[]][]) {
      if (list?.length) out[face] = [...(out[face] ?? []), ...list];
    }
  }
  return out;
}
