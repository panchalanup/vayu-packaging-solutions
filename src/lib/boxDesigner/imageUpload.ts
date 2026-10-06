/**
 * Artwork upload
 * Validates an uploaded file and normalises it to a bounded data URL.
 * SECURITY: type is checked by MIME and by magic bytes, size is capped, SVG is only ever rasterised through <img>
 * (scripts inside an SVG never run there), and the result is re-encoded through a canvas.
 */

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_EDGE_PX = 1600;
export const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

async function sniffType(file: File): Promise<string | null> {
  const head = new Uint8Array(await file.slice(0, 512).arrayBuffer());
  const hex = Array.from(head.slice(0, 12), (b) => b.toString(16).padStart(2, '0')).join('');
  if (hex.startsWith('89504e47')) return 'image/png';
  if (hex.startsWith('ffd8ff')) return 'image/jpeg';
  if (hex.startsWith('52494646') && hex.slice(16, 24) === '57454250') return 'image/webp';
  const text = new TextDecoder().decode(head).trimStart().toLowerCase();
  if (text.startsWith('<svg') || (text.startsWith('<?xml') && text.includes('<svg'))) return 'image/svg+xml';
  return null;
}

/** Returns a data URL ready for the design, or throws an Error with a user-facing message */
export async function prepareUpload(file: File): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('Image must be smaller than 10 MB');
  const type = await sniffType(file);
  if (!type || !ACCEPTED_TYPES.includes(type)) throw new Error('Please upload a PNG, JPG, WebP or SVG image');

  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode().catch(() => {
      throw new Error('This image could not be read. It may be corrupt.');
    });
    const w = img.naturalWidth || 1024; // SVG without intrinsic size
    const h = img.naturalHeight || 1024;
    const scale = Math.min(1, MAX_EDGE_PX / Math.max(w, h));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    // keep transparency for PNG/SVG/WebP logos, JPEG for photos
    return type === 'image/jpeg' ? canvas.toDataURL('image/jpeg', 0.9) : canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}
