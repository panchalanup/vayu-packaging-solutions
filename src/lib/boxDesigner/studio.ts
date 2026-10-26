/**
 * Showcase studio settings (pure helpers, no three.js):
 * backgrounds (#10), camera angle presets, scenes (stack / pallet / size reference, #12-lite), product-shot sizing,
 * video format choice (#11), the 3D quality preference (#45) and the embed snippet (#37).
 */

import type { PerfTier } from './perfTier';
import { browserStore, readString, writeString, KeyValueStore } from './localStore';

export type StudioBackground = 'studio' | 'wood' | 'concrete' | 'brand';
export type SceneMode = 'single' | 'stack' | 'pallet' | 'reference';
export type AnglePreset = 'hero' | 'front' | 'side' | 'top' | 'back';
export type QualityPref = 'auto' | 'high' | 'saver';

export interface StudioSettings {
  background: StudioBackground;
  /** Used when background = 'brand' */
  brandHex: string;
  scene: SceneMode;
}

export const DEFAULT_STUDIO: StudioSettings = { background: 'studio', brandHex: '#23803A', scene: 'single' };

export const BACKGROUNDS: { id: StudioBackground; label: string; sky: string; floor: string }[] = [
  { id: 'studio', label: 'Studio white', sky: '#ffffff', floor: '#f4f4f2' },
  { id: 'wood', label: 'Warm wood', sky: '#efe4d4', floor: '#b88a5a' },
  { id: 'concrete', label: 'Concrete', sky: '#d9d9d6', floor: '#a9a9a4' },
  { id: 'brand', label: 'Brand colour', sky: '#23803A', floor: '#23803A' },
];

export const SCENES: { id: SceneMode; label: string; hint: string }[] = [
  { id: 'single', label: 'Single box', hint: 'Just your box' },
  { id: 'stack', label: 'Stacked', hint: 'Six boxes, three high' },
  { id: 'pallet', label: 'On a pallet', hint: 'A full 1.2 × 1.0 m pallet load' },
  { id: 'reference', label: 'Size check', hint: 'Next to an A4 sheet and a 1 L bottle' },
];

/** Camera directions (unit vectors from the box centre) */
export const ANGLE_PRESETS: { id: AnglePreset; label: string; dir: [number, number, number] }[] = [
  { id: 'hero', label: '3/4 hero', dir: norm([0.43, 0.5, 0.71]) },
  { id: 'front', label: 'Front', dir: norm([0, 0.12, 1]) },
  { id: 'side', label: 'Side', dir: norm([1, 0.12, 0]) },
  { id: 'top', label: 'Top', dir: norm([0, 1, 0.02]) },
  { id: 'back', label: 'Back 3/4', dir: norm([-0.6, 0.45, -0.66]) },
];

function norm(v: [number, number, number]): [number, number, number] {
  const len = Math.hypot(...v) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

/** Background + floor colours for a setting (brand uses a lighter sky and a slightly darker floor) */
export function backgroundColours(settings: Pick<StudioSettings, 'background' | 'brandHex'>): { sky: string; floor: string } {
  const preset = BACKGROUNDS.find((b) => b.id === settings.background) ?? BACKGROUNDS[0];
  if (preset.id !== 'brand') return { sky: preset.sky, floor: preset.floor };
  const hex = /^#[0-9a-f]{6}$/i.test(settings.brandHex) ? settings.brandHex : DEFAULT_STUDIO.brandHex;
  return { sky: mix(hex, '#ffffff', 0.55), floor: mix(hex, '#000000', 0.12) };
}

/** Mix two hex colours (t = share of b) */
export function mix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Pixel ratio for a product shot: `scale` × the on-screen size, capped so the long side fits the GPU's limit
 * (and 8192 px, which every browser can encode as PNG).
 */
export function shotPixelRatio(cssWidth: number, cssHeight: number, scale: number, maxSide: number): number {
  const longSide = Math.max(1, cssWidth, cssHeight);
  const limit = Math.min(8192, Math.max(512, maxSide || 4096));
  return Math.max(0.5, Math.min(scale, limit / longSide));
}

/** Best recording format: MP4 where the browser can record it (Safari, recent Chrome), WebM otherwise */
export function pickVideoMime(isSupported: (mime: string) => boolean): { mime: string; ext: 'mp4' | 'webm' } | null {
  const candidates: { mime: string; ext: 'mp4' | 'webm' }[] = [
    { mime: 'video/mp4;codecs=avc1', ext: 'mp4' },
    { mime: 'video/mp4', ext: 'mp4' },
    { mime: 'video/webm;codecs=vp9', ext: 'webm' },
    { mime: 'video/webm;codecs=vp8', ext: 'webm' },
    { mime: 'video/webm', ext: 'webm' },
  ];
  for (const c of candidates) {
    try {
      if (isSupported(c.mime)) return c;
    } catch {
      /* some browsers throw for unknown types */
    }
  }
  return null;
}

export const VIDEO_SECONDS = { spin: 8, fold: 8 } as const;

export interface Placement {
  x: number;
  y: number;
  z: number;
}

/** Six boxes: two wide, three high, the user's box bottom-left-front (cm, relative to the box) */
export function stackPlacements(outside: { length: number; width: number; height: number }, gap = 0.2): Placement[] {
  const out: Placement[] = [];
  for (let layer = 0; layer < 3; layer++) {
    for (let col = 0; col < 2; col++) {
      if (layer === 0 && col === 0) continue; // the real box
      out.push({ x: col * (outside.length + gap), y: layer * (outside.height + gap * 0.25), z: 0 });
    }
  }
  return out;
}

// VERIFY-LATER[DSG-63]: confirm the pallet size customers use most (1200 × 1000 mm assumed) and the load height cap
export const PALLET = { length: 120, width: 100, deckHeight: 14.4, maxLoadHeight: 150 } as const;
export const MAX_PALLET_BOXES = 400;

/**
 * Column-stacked pallet load. Positions are box centres on the floor plane (y = box bottom), relative to the
 * pallet centre. Tries both orientations and keeps the one with more boxes per layer.
 */
export function palletLayout(outside: { length: number; width: number; height: number }): {
  rotated: boolean;
  perRow: number;
  perCol: number;
  layers: number;
  positions: Placement[];
} {
  const fit = (a: number, b: number) => ({
    perRow: Math.max(1, Math.floor(PALLET.length / Math.max(1, a))),
    perCol: Math.max(1, Math.floor(PALLET.width / Math.max(1, b))),
  });
  const normal = fit(outside.length, outside.width);
  const turned = fit(outside.width, outside.length);
  const rotated = turned.perRow * turned.perCol > normal.perRow * normal.perCol;
  const { perRow, perCol } = rotated ? turned : normal;
  const footL = rotated ? outside.width : outside.length;
  const footW = rotated ? outside.length : outside.width;
  let layers = Math.max(1, Math.floor(PALLET.maxLoadHeight / Math.max(1, outside.height)));
  while (layers > 1 && perRow * perCol * layers > MAX_PALLET_BOXES) layers--;
  const positions: Placement[] = [];
  const x0 = -((perRow - 1) * footL) / 2;
  const z0 = -((perCol - 1) * footW) / 2;
  for (let layer = 0; layer < layers; layer++)
    for (let i = 0; i < perRow; i++)
      for (let j = 0; j < perCol; j++) {
        if (positions.length >= MAX_PALLET_BOXES) break;
        positions.push({ x: x0 + i * footL, y: PALLET.deckHeight + layer * outside.height, z: z0 + j * footW });
      }
  return { rotated, perRow, perCol, layers, positions };
}

/** Quality preference (#45): auto picks from the device; battery saver forces the low tier */
export const QUALITY_KEY = 'vayu-box-designer:quality';

export function loadQualityPref(store: KeyValueStore | null = browserStore()): QualityPref {
  const v = readString(QUALITY_KEY, store);
  return v === 'high' || v === 'saver' ? v : 'auto';
}

export function saveQualityPref(pref: QualityPref, store: KeyValueStore | null = browserStore()): void {
  writeString(QUALITY_KEY, pref, store);
}

export function qualityToTier(pref: QualityPref): PerfTier | null {
  return pref === 'high' ? 'high' : pref === 'saver' ? 'low' : null;
}

/** Copy-paste iframe for other websites (#37). Values are numbers/enums only. */
export function embedSnippet(origin: string, params: { style: string; l: number; w: number; h: number }): string {
  const q = new URLSearchParams({
    style: params.style.replace(/[^a-z]/g, ''),
    l: String(Math.round(params.l * 10) / 10),
    w: String(Math.round(params.w * 10) / 10),
    h: String(Math.round(params.h * 10) / 10),
  });
  return `<iframe src="${origin}/embed/box-designer?${q.toString()}" title="3D box designer by Vayu Packaging" width="100%" height="560" style="border:0;border-radius:12px;max-width:960px" loading="lazy" allow="fullscreen"></iframe>`;
}
