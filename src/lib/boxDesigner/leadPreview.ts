/**
 * Small JPEG preview of the 3D view for the enquiry (fits in one Sheets cell with the rest of the record).
 * Tries smaller sizes / lower quality until it is under MAX_PREVIEW_CHARS; returns '' when it cannot.
 */

import { MAX_PREVIEW_CHARS } from '@/lib/designerLeadSchema';

const ATTEMPTS: [number, number][] = [
  [480, 0.72],
  [400, 0.62],
  [320, 0.55],
  [240, 0.5],
];

export async function previewDataUrl(blob: Blob | null): Promise<string> {
  if (!blob || typeof document === 'undefined') return '';
  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(blob);
    for (const [maxSide, quality] of ATTEMPTS) {
      const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';
      // JPEG has no alpha: paint the studio background first
      ctx.fillStyle = '#f4f1ea';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const url = canvas.toDataURL('image/jpeg', quality);
      if (url.length <= MAX_PREVIEW_CHARS && url.startsWith('data:image/jpeg;base64,')) return url;
    }
    return '';
  } catch {
    return '';
  } finally {
    bitmap?.close();
  }
}
