/**
 * Sticker bitmaps: decode once, rasterise at a bucketed size, optional one-colour tint, bounded memory.
 *
 * The decoded <img> (vector for SVG) is kept per source; bitmaps are canvases keyed by source, tint and a power of
 * two size bucket, so dragging, tiling a pattern and 3D redraws reuse the same pixels.
 * Tint = draw the sticker, then `source-in` fill with the colour: the colour replaces every opaque pixel and keeps the
 * sticker's own alpha, so it works for any sticker (full-colour or mono).
 * SECURITY: only app-bundled URLs and data:/blob: images are loaded (same rule as the registry); SVG goes through
 * <img>, which never runs scripts inside the file.
 */

export interface StickerBitmap {
  canvas: HTMLCanvasElement;
  /** width / height of the artwork */
  aspect: number;
}

interface Decoded {
  img: HTMLImageElement;
  aspect: number;
}

const SAFE_SRC = /^(data:image\/|blob:|\/|\.\/|https?:\/\/)/i;
const MIN_BUCKET = 32;
const MAX_BUCKET = 1024;
const MAX_DECODED = 160;
/** Total pixels kept in rasterised bitmaps (about 64 MB of RGBA) */
const PIXEL_BUDGET = 16_000_000;

const decodedCache = new Map<string, Promise<Decoded | null>>();
const bitmapCache = new Map<string, StickerBitmap & { pixels: number }>();
let bitmapPixels = 0;
const aspectBySrc = new Map<string, number>();

const HEX = /^#[0-9a-f]{6}$/i;

/** Power-of-two bucket for a requested longest side in pixels */
export function sizeBucket(px: number): number {
  const target = Math.max(MIN_BUCKET, Math.min(MAX_BUCKET, Number.isFinite(px) ? px : MIN_BUCKET));
  return Math.min(MAX_BUCKET, 2 ** Math.ceil(Math.log2(target)));
}

/** Aspect ratio of an already decoded sticker (1 when not decoded yet) */
export function cachedAspect(src: string): number {
  return aspectBySrc.get(src) ?? 1;
}

/**
 * SVGs with a viewBox but no width/height have no reliable intrinsic size (browsers disagree: 0, or 300x150), which
 * would skew the aspect ratio. Returns the SVG text with explicit width/height taken from the viewBox (longest side
 * 512), or null when nothing needs changing.
 */
export function withExplicitSize(svg: string): string | null {
  const open = /<svg\b[^>]*>/i.exec(svg);
  if (!open) return null;
  const tag = open[0];
  const hasW = /\swidth\s*=\s*["'][\d.]+(px)?["']/i.test(tag);
  const hasH = /\sheight\s*=\s*["'][\d.]+(px)?["']/i.test(tag);
  if (hasW && hasH) return null;
  const vb = /viewBox\s*=\s*["']\s*[-\d.eE]+[\s,]+[-\d.eE]+[\s,]+([\d.eE]+)[\s,]+([\d.eE]+)\s*["']/i.exec(tag);
  if (!vb) return null;
  const w = parseFloat(vb[1]);
  const h = parseFloat(vb[2]);
  if (!(w > 0) || !(h > 0)) return null;
  const k = 512 / Math.max(w, h);
  const stripped = tag.replace(/\s(width|height)\s*=\s*("[^"]*"|'[^']*')/gi, '');
  const sized = stripped.replace(/<svg\b/i, `<svg width="${Math.max(1, Math.round(w * k))}" height="${Math.max(1, Math.round(h * k))}"`);
  return svg.replace(tag, () => sized);
}

const sizedUrls = new Map<string, Promise<string>>();

/** Loadable URL for an SVG sticker with a dependable intrinsic size (a blob: URL of the sized copy) */
function sizedSvgUrl(src: string): Promise<string> {
  if (!/^data:image\/svg|\.svg([?#]|$)/i.test(src)) return Promise.resolve(src);
  let cached = sizedUrls.get(src);
  if (!cached) {
    cached = (async () => {
      try {
        const text = await (await fetch(src)).text();
        const sized = withExplicitSize(text);
        return sized ? URL.createObjectURL(new Blob([sized], { type: 'image/svg+xml' })) : src;
      } catch {
        return src;
      }
    })();
    sizedUrls.set(src, cached);
  }
  return cached;
}

function decode(src: string): Promise<Decoded | null> {
  if (!SAFE_SRC.test(src)) return Promise.resolve(null);
  const cached = decodedCache.get(src);
  if (cached) {
    decodedCache.delete(src);
    decodedCache.set(src, cached);
    return cached;
  }
  const promise = (async (): Promise<Decoded | null> => {
    try {
      const img = new Image();
      img.decoding = 'async';
      img.src = await sizedSvgUrl(src);
      await img.decode();
      const w = img.naturalWidth || 256;
      const h = img.naturalHeight || 256;
      const aspect = Math.max(0.05, Math.min(20, w / h));
      aspectBySrc.set(src, aspect);
      return { img, aspect };
    } catch (error) {
      console.warn('[BoxDesigner] Could not decode sticker', error);
      decodedCache.delete(src);
      return null;
    }
  })();
  decodedCache.set(src, promise);
  while (decodedCache.size > MAX_DECODED) decodedCache.delete(decodedCache.keys().next().value as string);
  return promise;
}

/** The tint step on its own so it can be tested with a fake context */
export function applyTint(ctx: Pick<CanvasRenderingContext2D, 'save' | 'restore' | 'fillRect' | 'globalCompositeOperation' | 'fillStyle'>, width: number, height: number, colour: string) {
  ctx.save();
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = HEX.test(colour) ? colour : '#000000';
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function remember(key: string, bitmap: StickerBitmap) {
  const pixels = bitmap.canvas.width * bitmap.canvas.height;
  bitmapCache.set(key, { ...bitmap, pixels });
  bitmapPixels += pixels;
  while (bitmapPixels > PIXEL_BUDGET && bitmapCache.size > 1) {
    const oldest = bitmapCache.keys().next().value as string;
    bitmapPixels -= bitmapCache.get(oldest)!.pixels;
    bitmapCache.delete(oldest);
  }
}

/** Rasterised (and tinted) sticker whose longest side is the bucket for `targetPx`. Null when it cannot be decoded. */
export async function getStickerBitmap(src: string, tint: string | null, targetPx: number): Promise<StickerBitmap | null> {
  const bucket = sizeBucket(targetPx);
  const key = `${src}|${tint && HEX.test(tint) ? tint.toLowerCase() : ''}|${bucket}`;
  const hit = bitmapCache.get(key);
  if (hit) {
    bitmapCache.delete(key);
    bitmapCache.set(key, hit);
    return hit;
  }
  const decoded = await decode(src);
  if (!decoded) return null;
  const again = bitmapCache.get(key);
  if (again) return again;
  const width = decoded.aspect >= 1 ? bucket : Math.max(1, Math.round(bucket * decoded.aspect));
  const height = decoded.aspect >= 1 ? Math.max(1, Math.round(bucket / decoded.aspect)) : bucket;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(decoded.img, 0, 0, width, height);
  if (tint && HEX.test(tint)) applyTint(ctx, width, height, tint);
  const bitmap = { canvas, aspect: decoded.aspect };
  remember(key, bitmap);
  return bitmap;
}

/** Test and tooling hook */
export function clearStickerCaches() {
  decodedCache.clear();
  bitmapCache.clear();
  aspectBySrc.clear();
  bitmapPixels = 0;
}
