/**
 * Share Utilities
 * Professional quote-request messages for WhatsApp / email, addressed to Vayu.
 */

import type { BoxDesign } from '@/types/boxDesigner';
import { PLY_OPTIONS, BOX_TEMPLATES, BOX_COLOR_OPTIONS } from './constants';
import { getBoardSpec } from './boardSpecs';
import { COMPANY_INFO, CONTACT_INFO } from '@/constants';
import { encodeShareHash } from './designCodec';

/** Vayu's WhatsApp number in international format without "+" */
const VAYU_WHATSAPP = CONTACT_INFO.phone.replace(/\D/g, '');

export function describeColour(hex: string): string {
  return BOX_COLOR_OPTIONS.find((c) => c.color.toLowerCase() === hex.toLowerCase())?.name ?? `Custom ${hex.toUpperCase()}`;
}

export function formatShareMessage(design: BoxDesign, shareUrl?: string): string {
  const ply = PLY_OPTIONS.find((p) => p.id === design.ply);
  const template = BOX_TEMPLATES.find((t) => t.id === design.template);
  const board = getBoardSpec(design.ply, design.flutes);
  const { length, width, height } = design.dimensions;
  const lines = [
    'Custom Box Quote Request',
    '',
    `Size (inside): ${length} x ${width} x ${height} cm (L x W x H)`,
    `Style: ${template?.name ?? design.template} (FEFCO ${template?.fefco ?? '-'})`,
    `Board: ${ply?.name ?? design.ply} ${ply?.wall ?? ''}, ${board.flutes.join('')} flute (~${board.caliperMm} mm)`,
    `Colour: ${describeColour(design.colorHex)}`,
  ];
  if (design.faceImages.length) lines.push(`Artwork: ${design.faceImages.length} image(s)`);
  if (design.textElements.length) lines.push(`Text: ${design.textElements.length} element(s)`);
  if (shareUrl) lines.push('', `Open the design: ${shareUrl}`);
  lines.push('', `Designed with the ${COMPANY_INFO.name} 3D Box Designer.`);
  return lines.join('\n');
}

/** SECURITY: opened with noopener so the new tab cannot reach this page */
export function shareViaWhatsApp(design: BoxDesign, shareUrl?: string): void {
  const url = `https://wa.me/${VAYU_WHATSAPP}?text=${encodeURIComponent(formatShareMessage(design, shareUrl))}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function shareViaEmail(design: BoxDesign, shareUrl?: string): void {
  const subject = encodeURIComponent(`Custom box quote request - ${COMPANY_INFO.name}`);
  const body = encodeURIComponent(formatShareMessage(design, shareUrl));
  window.location.href = `mailto:${CONTACT_INFO.email}?subject=${subject}&body=${body}`;
}

export function getDesignFilename(design: BoxDesign, extension: string): string {
  const { length, width, height } = design.dimensions;
  const date = new Date().toISOString().split('T')[0];
  return `vayu-box-${length}x${width}x${height}-${design.ply}-${date}.${extension}`;
}

/** Download a blob through a temporary anchor (revoked after the click has been handled) */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Link that reopens this design (spec + text; images stay on the designer's device) */
export function getShareUrl(design: BoxDesign): string {
  return `${window.location.origin}${window.location.pathname}${encodeShareHash(design)}`;
}
