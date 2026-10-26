/**
 * Print-ready checks (#25): catches the problems printers reject artwork for, in plain words.
 *  - low-resolution images for the size they will be printed
 *  - artwork running over the edge (it will be cut) or sitting too close to a fold
 *  - text too small to print cleanly on corrugated board
 *  - text that will be hard to read on the board colour
 * Pure: image pixel sizes are measured by the caller and passed in.
 */

import type { BoxDesign, BoxFace } from '@/types/boxDesigner';
import { PT_TO_CM } from './textures/printLayer';

export type PrintIssueSeverity = 'error' | 'warning';

export interface PrintIssue {
  id: string;
  severity: PrintIssueSeverity;
  face: BoxFace;
  target: { kind: 'image' } | { kind: 'text'; id: string };
  title: string;
  detail: string;
}

export type FaceSizes = Partial<Record<BoxFace, { widthCm: number; heightCm: number }>>;
export type ImagePixelSizes = Partial<Record<BoxFace, { width: number; height: number }>>;

// VERIFY-LATER[DSG-62]: confirm print limits with the print room (flexo on kraft vs litho-laminated)
/** Below this effective resolution an image looks soft */
export const MIN_DPI_WARN = 150;
/** Below this it will look visibly pixelated */
export const MIN_DPI_ERROR = 90;
/** Keep artwork this far from folds and edges (cm) */
export const SAFE_MARGIN_CM = 0.5;
/** Overshoot tolerated before calling it "over the edge" (cm) */
const OVER_EDGE_TOLERANCE_CM = 0.15;
export const MIN_TEXT_PT_WARN = 8;
export const MIN_TEXT_PT_ERROR = 6;
export const MIN_TEXT_CONTRAST = 2;

interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

function rotatedExtent(w: number, h: number, degrees: number): { w: number; h: number } {
  const a = ((degrees || 0) * Math.PI) / 180;
  const c = Math.abs(Math.cos(a));
  const s = Math.abs(Math.sin(a));
  return { w: w * c + h * s, h: w * s + h * c };
}

/** Where an item sits relative to the surface edges (cm) */
function edgeCheck(rect: Rect, size: { widthCm: number; heightCm: number }): 'over' | 'near' | 'ok' {
  const overshoot = Math.max(-rect.x0, -rect.y0, rect.x1 - size.widthCm, rect.y1 - size.heightCm);
  if (overshoot > OVER_EDGE_TOLERANCE_CM) return 'over';
  const clearance = Math.min(rect.x0, rect.y0, size.widthCm - rect.x1, size.heightCm - rect.y1);
  return clearance < SAFE_MARGIN_CM ? 'near' : 'ok';
}

/** Printed size of an uploaded image (same fit rule as the print layer) */
export function imagePrintSize(
  surface: { widthCm: number; heightCm: number },
  pixels: { width: number; height: number },
  scale: number
): { widthCm: number; heightCm: number; dpi: number } {
  const s = Math.max(0.05, Math.min(2, scale || 0.8));
  const k = Math.min((surface.widthCm * s) / pixels.width, (surface.heightCm * s) / pixels.height);
  const widthCm = pixels.width * k;
  const heightCm = pixels.height * k;
  return { widthCm, heightCm, dpi: widthCm > 0 ? pixels.width / (widthCm / 2.54) : Infinity };
}

/** Approximate printed box of a text element (the print layer wraps at 90% of the surface width) */
export function textPrintBox(
  surface: { widthCm: number; heightCm: number },
  t: { text: string; size: number; align: 'left' | 'center' | 'right'; position: { x: number; y: number }; rotation: number }
): Rect {
  const em = t.size * PT_TO_CM;
  const maxWidth = surface.widthCm * 0.9;
  let lines = 0;
  let widest = 0;
  for (const paragraph of t.text.split(/\r?\n/)) {
    const width = paragraph.length * em * 0.55;
    const wraps = Math.max(1, Math.ceil(width / maxWidth));
    lines += wraps;
    widest = Math.max(widest, Math.min(width, maxWidth));
  }
  const { w, h } = rotatedExtent(widest, lines * em * 1.2, t.rotation);
  const cx = t.position.x * surface.widthCm;
  const cy = t.position.y * surface.heightCm;
  const x0 = t.align === 'left' ? cx : t.align === 'right' ? cx - w : cx - w / 2;
  return { x0, y0: cy - h / 2, x1: x0 + w, y1: cy + h / 2 };
}

const channel = (v: number) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

export function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const v = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

/** WCAG contrast ratio (1..21) between two hex colours; 21 when either is unreadable */
export function contrastRatio(a: string, b: string): number {
  const ra = hexToRgb(a.slice(0, 7));
  const rb = hexToRgb(b.slice(0, 7));
  if (!ra || !rb) return 21;
  const lum = ([r, g, bl]: [number, number, number]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(bl);
  const [hi, lo] = [lum(ra), lum(rb)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function runPrintChecks(
  design: Pick<BoxDesign, 'faceImages' | 'textElements' | 'colorHex'>,
  faceSizes: FaceSizes,
  imagePixels: ImagePixelSizes = {}
): PrintIssue[] {
  const issues: PrintIssue[] = [];

  for (const image of design.faceImages) {
    const size = faceSizes[image.face];
    const pixels = imagePixels[image.face];
    if (!size || !pixels || !(pixels.width > 0) || !(pixels.height > 0)) continue;
    const printed = imagePrintSize(size, pixels, image.scale);
    const dpi = Math.round(printed.dpi);
    if (dpi < MIN_DPI_WARN) {
      issues.push({
        id: `img-dpi-${image.face}`,
        severity: dpi < MIN_DPI_ERROR ? 'error' : 'warning',
        face: image.face,
        target: { kind: 'image' },
        title: dpi < MIN_DPI_ERROR ? 'Image will print blurry' : 'Image may print soft',
        detail: `About ${dpi} dpi at this size. Use a larger file or a vector logo (SVG), or make it smaller.`,
      });
    }
    const ext = rotatedExtent(printed.widthCm, printed.heightCm, image.rotation);
    const cx = image.position.x * size.widthCm;
    const cy = image.position.y * size.heightCm;
    const where = edgeCheck({ x0: cx - ext.w / 2, y0: cy - ext.h / 2, x1: cx + ext.w / 2, y1: cy + ext.h / 2 }, size);
    if (where !== 'ok') {
      issues.push({
        id: `img-edge-${image.face}`,
        severity: where === 'over' ? 'error' : 'warning',
        face: image.face,
        target: { kind: 'image' },
        title: where === 'over' ? 'Image runs over the edge' : 'Image is close to a fold',
        detail:
          where === 'over'
            ? 'Part of it will be cut off or wrap round the fold. Move it in or make it smaller.'
            : `Keep artwork at least ${SAFE_MARGIN_CM * 10} mm from folds and edges so it is not cracked by the crease.`,
      });
    }
  }

  for (const t of design.textElements) {
    if (!t.text.trim()) continue;
    const size = faceSizes[t.face];
    if (!size) continue;
    if (t.size < MIN_TEXT_PT_WARN) {
      issues.push({
        id: `txt-size-${t.id}`,
        severity: t.size < MIN_TEXT_PT_ERROR ? 'error' : 'warning',
        face: t.face,
        target: { kind: 'text', id: t.id },
        title: 'Text is too small',
        detail: `${t.size} pt may fill in on corrugated board. Use ${MIN_TEXT_PT_WARN} pt or more.`,
      });
    }
    const where = edgeCheck(textPrintBox(size, t), size);
    if (where !== 'ok') {
      issues.push({
        id: `txt-edge-${t.id}`,
        severity: where === 'over' ? 'error' : 'warning',
        face: t.face,
        target: { kind: 'text', id: t.id },
        title: where === 'over' ? 'Text runs over the edge' : 'Text is close to a fold',
        detail: where === 'over' ? 'Some letters will be cut off. Move it in or make it smaller.' : 'Move it a little away from the fold or edge.',
      });
    }
    if (contrastRatio(t.color, design.colorHex) < MIN_TEXT_CONTRAST) {
      issues.push({
        id: `txt-contrast-${t.id}`,
        severity: 'warning',
        face: t.face,
        target: { kind: 'text', id: t.id },
        title: 'Text is hard to read on this board',
        detail: 'The text colour is too close to the box colour. Pick a darker or lighter ink.',
      });
    }
  }

  return issues.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'error' ? -1 : 1));
}
