/**
 * Sample downloads on the showcase page. They call the same generators as the designer's export panel
 * (dielineToPdf / dielineToSvg / renderSpecSheetPdf), so what a visitor downloads here is exactly what the tool makes.
 * jsPDF and the spec-sheet renderer are imported on demand, so none of it is in the page's initial download.
 */

import type { BoxDesign } from '@/types/boxDesigner';
import { dielineToSvg } from '@/lib/boxDesigner/dieline';
import { dielineForDesign } from '@/lib/boxDesigner/styles/designLayout';
import { encodeShareHash } from '@/lib/boxDesigner/designCodec';
import { downloadBlob, getDesignFilename } from '@/lib/boxDesigner/shareUtils';

export async function downloadDielinePdf(design: BoxDesign): Promise<void> {
  const { dielineToPdf } = await import('@/lib/boxDesigner/dieline');
  downloadBlob(await dielineToPdf(dielineForDesign(design)), getDesignFilename(design, 'dieline.pdf'));
}

export function downloadDielineSvg(design: BoxDesign): void {
  downloadBlob(new Blob([dielineToSvg(dielineForDesign(design))], { type: 'image/svg+xml' }), getDesignFilename(design, 'dieline.svg'));
}

/** Rasterises the illustrated box (SVG) so the sample spec sheet has a picture; the designer adds three 3D views */
async function illustrationDataUrl(design: BoxDesign): Promise<string | null> {
  try {
    const [{ createElement }, { renderToStaticMarkup }, { default: BoxThumbnail }] = await Promise.all([
      import('react'),
      import('react-dom/server'),
      import('@/components/BoxDesigner/BoxThumbnail'),
    ]);
    const markup = renderToStaticMarkup(
      createElement(BoxThumbnail, { style: design.template, dimensions: design.dimensions, colorHex: design.colorHex, title: '' })
    );
    const svg = markup.includes('xmlns=') ? markup : markup.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    const img = new Image();
    img.decoding = 'async';
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

export async function downloadSpecSheet(design: BoxDesign): Promise<void> {
  const [{ buildSpecSheetData, renderSpecSheetPdf }, picture] = await Promise.all([import('@/lib/boxDesigner/specSheet'), illustrationDataUrl(design)]);
  const blob = await renderSpecSheetPdf(
    buildSpecSheetData(design),
    { views: picture ? [{ label: 'Illustration (the designer adds three 3D views)', dataUrl: picture }] : [] },
    dielineForDesign(design)
  );
  downloadBlob(blob, getDesignFilename(design, 'spec-sheet.pdf'));
}

/** A link that reopens this design in the designer (spec only: no images, no personal data) */
export function designerShareUrl(design: BoxDesign): string {
  return `${window.location.origin}/box-designer${encodeShareHash(design)}`;
}
