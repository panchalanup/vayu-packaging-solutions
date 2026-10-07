/**
 * Print layer
 * Renders the artwork for one printable surface (wall or top flap) onto a transparent canvas that is shown as a
 * decal over the outer liner. The canvas has the surface's true aspect ratio, so nothing is stretched, and the
 * inside of the box is never printed.
 *
 * Text sizes are real typographic points (1 pt = 0.3528 mm), so "24 pt" is the size it would be printed.
 */

import { createShippingIcon, ShippingIconType } from '../shippingIcons';
import type { BoxFace, FaceImage, TextElement } from '@/types/boxDesigner';

export const PT_TO_CM = 2.54 / 72;

export interface PrintSurface {
  face: BoxFace;
  widthCm: number;
  heightCm: number;
}

export interface PrintOptions {
  shippingIcons?: boolean;
}

/** Pixels per cm for a surface: sharp enough up close, capped at 2048 px on the long side */
export function getPrintResolution(widthCm: number, heightCm: number): number {
  return Math.min(40, Math.max(12, 2048 / Math.max(widthCm, heightCm, 1)));
}

interface DrawableImage {
  source: CanvasImageSource;
  width: number;
  height: number;
}

const MAX_IMAGE_PX = 1600;
const MAX_CACHED_IMAGES = 12;
const imageCache = new Map<string, Promise<DrawableImage | null>>();

/**
 * Decode an uploaded image once and keep a downscaled copy (bounded memory).
 * SECURITY: only locally produced data:/blob: image URLs are accepted; remote URLs are never fetched.
 * SVGs are rasterised through <img>, which never executes scripts inside the file.
 */
function loadImage(url: string): Promise<DrawableImage | null> {
  if (!/^(data:image\/[a-z0-9.+-]+[;,]|blob:)/i.test(url)) return Promise.resolve(null);

  const cached = imageCache.get(url);
  if (cached) {
    // refresh LRU position
    imageCache.delete(url);
    imageCache.set(url, cached);
    return cached;
  }

  const promise = (async (): Promise<DrawableImage | null> => {
    try {
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
      await img.decode();
      // SVGs without intrinsic size report 0: fall back to a square raster
      const w = img.naturalWidth || 1024;
      const h = img.naturalHeight || 1024;
      const scale = Math.min(1, MAX_IMAGE_PX / Math.max(w, h));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(w * scale));
      canvas.height = Math.max(1, Math.round(h * scale));
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      return { source: canvas, width: canvas.width, height: canvas.height };
    } catch (error) {
      console.warn('[BoxDesigner] Could not decode uploaded image', error);
      return null;
    }
  })();

  imageCache.set(url, promise);
  while (imageCache.size > MAX_CACHED_IMAGES) {
    const oldest = imageCache.keys().next().value as string;
    imageCache.delete(oldest);
  }
  return promise;
}

const HEX_COLOUR = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const safeColour = (value: string) => (HEX_COLOUR.test(value) ? value : '#000000');
/** Font names come from a fixed list, but strip anything that could break the CSS font shorthand */
const safeFontFamily = (value: string) => value.replace(/[^a-z0-9 -]/gi, '').trim() || 'Arial';

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }
    let line = words[0];
    for (let i = 1; i < words.length; i++) {
      const candidate = `${line} ${words[i]}`;
      if (ctx.measureText(candidate).width <= maxWidth) line = candidate;
      else {
        lines.push(line);
        line = words[i];
      }
    }
    lines.push(line);
  }
  return lines;
}

function drawShippingIcons(ctx: CanvasRenderingContext2D, width: number, height: number, pxPerCm: number) {
  const icons: ShippingIconType[] = ['fragile', 'this-side-up', 'keep-dry'];
  const margin = 0.9 * pxPerCm;
  const gap = 0.25 * pxPerCm;
  const size = Math.min(3.6 * pxPerCm, height * 0.26, (width * 0.5 - 2 * gap) / 3);
  if (size < 8) return;
  const lineWidth = Math.max(1.5, size * 0.03);
  const totalWidth = icons.length * size + (icons.length - 1) * gap;
  let x = width - margin - totalWidth;
  const y = height - margin - size;
  for (const type of icons) {
    const icon = createShippingIcon(type, { size: Math.round(size), color: '#1f1a14', lineWidth });
    ctx.drawImage(icon, x, y, size, size);
    x += size + gap;
  }
}

/**
 * Draw one surface. Returns null when there is nothing to print.
 */
export async function renderPrintCanvas(
  surface: PrintSurface,
  image: FaceImage | undefined,
  texts: TextElement[],
  options: PrintOptions = {}
): Promise<HTMLCanvasElement | null> {
  const hasText = texts.some((t) => t.text.trim().length > 0);
  if (!image && !hasText && !options.shippingIcons) return null;

  const pxPerCm = getPrintResolution(surface.widthCm, surface.heightCm);
  const width = Math.max(2, Math.round(surface.widthCm * pxPerCm));
  const height = Math.max(2, Math.round(surface.heightCm * pxPerCm));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, width, height);

  if (options.shippingIcons) drawShippingIcons(ctx, width, height, pxPerCm);

  if (image) {
    const bitmap = await loadImage(image.imageUrl);
    if (bitmap) {
      const scale = Number.isFinite(image.scale) ? Math.max(0.05, Math.min(2, image.scale)) : 0.8;
      // fit inside the surface (keeps aspect; a tall logo no longer overflows a short flap)
      const k = Math.min((width * scale) / bitmap.width, (height * scale) / bitmap.height);
      const w = bitmap.width * k;
      const h = bitmap.height * k;
      ctx.save();
      ctx.translate(image.position.x * width, image.position.y * height);
      ctx.rotate(((image.rotation || 0) * Math.PI) / 180);
      ctx.drawImage(bitmap.source, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
  }

  for (const element of texts) {
    if (!element.text.trim()) continue;
    const fontPx = Math.max(4, element.size * PT_TO_CM * pxPerCm);
    const font = `${Math.round(fontPx)}px "${safeFontFamily(element.font)}", Arial, sans-serif`;
    try {
      await document.fonts?.load(font, element.text);
    } catch {
      /* fall back to whatever is available */
    }
    ctx.save();
    ctx.translate(element.position.x * width, element.position.y * height);
    ctx.rotate(((element.rotation || 0) * Math.PI) / 180);
    ctx.font = font;
    ctx.fillStyle = safeColour(element.color);
    ctx.textAlign = element.align;
    ctx.textBaseline = 'middle';
    const lines = wrapLines(ctx, element.text, width * 0.9);
    const lineHeight = fontPx * 1.2;
    const top = -((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, i) => ctx.fillText(line, 0, top + i * lineHeight));
    ctx.restore();
  }

  return canvas;
}

/** FNV-1a hash (for change detection of large data URLs); memoised for the most recent strings */
const hashMemo = new Map<string, string>();
export function hashString(value: string): string {
  const memo = hashMemo.get(value);
  if (memo) return memo;
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const result = (h >>> 0).toString(36) + value.length.toString(36);
  hashMemo.set(value, result);
  if (hashMemo.size > 32) hashMemo.delete(hashMemo.keys().next().value as string);
  return result;
}

/** Stable key describing everything that affects a surface's print, used to skip redundant redraws */
export function printContentKey(
  surface: PrintSurface,
  image: FaceImage | undefined,
  texts: TextElement[],
  options: PrintOptions
): string {
  return JSON.stringify([
    surface.widthCm.toFixed(2),
    surface.heightCm.toFixed(2),
    image ? [hashString(image.imageUrl), image.position, image.scale, image.rotation] : null,
    texts.map((t) => [t.id, t.text, t.font, t.size, t.color, t.position, t.rotation, t.align]),
    !!options.shippingIcons,
  ]);
}
