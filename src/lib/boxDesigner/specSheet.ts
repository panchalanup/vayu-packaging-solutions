/**
 * Spec sheet / proof PDF (#31-lite): one A4 page a manufacturer can hand or send to a customer for approval.
 * Three views of the 3D box, the full specification in the chosen unit, a dieline thumbnail, an approval block
 * with signature lines and the date. buildSpecSheetData is pure (tested); renderSpecSheetPdf draws it with jsPDF,
 * which is loaded only when needed.
 */

import type { BoxDesign } from '@/types/boxDesigner';
import { BOX_TEMPLATES, PLY_OPTIONS } from './constants';
import { getBoardSpec } from './boardSpecs';
import { layoutForDesign } from './styles';
import { formatDimensions, formatLength } from './units';
import { describeColour } from './shareUtils';
import { assessStrength } from './strength';
import type { Dieline } from './dieline';
import { COMPANY_INFO, CONTACT_INFO } from '@/constants';

export interface SpecRow {
  label: string;
  value: string;
}

export interface SpecSheetData {
  title: string;
  subtitle: string;
  reference: string;
  date: string;
  rows: SpecRow[];
  notes: string[];
}

/** Short, stable reference for phone calls ("VB-3F9A2C") derived from the spec (no personal data) */
export function designReference(design: BoxDesign): string {
  const key = JSON.stringify([design.template, design.dimensions, design.ply, design.flutes, design.colorHex, design.finish, design.quantity]);
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `VB-${(h >>> 0).toString(16).toUpperCase().padStart(8, '0').slice(0, 6)}`;
}

export function buildSpecSheetData(design: BoxDesign, now: Date = new Date()): SpecSheetData {
  const template = BOX_TEMPLATES.find((t) => t.id === design.template);
  const ply = PLY_OPTIONS.find((p) => p.id === design.ply);
  const board = getBoardSpec(design.ply, design.flutes);
  // Outside size from the same layout the 3D model and dieline use
  const outside = layoutForDesign(design).outside;
  const strength = assessStrength(design);
  const artwork =
    design.faceImages.length || design.textElements.length
      ? `${design.faceImages.length} image(s), ${design.textElements.length} text item(s) on ${
          new Set([...design.faceImages.map((i) => i.face), ...design.textElements.map((x) => x.face)]).size
        } surface(s)`
      : 'Plain (no print)';

  const rows: SpecRow[] = [
    { label: 'Style', value: template ? `${template.name}${template.fefco ? ` · FEFCO ${template.fefco}` : ''}` : design.template.toUpperCase() },
    { label: 'Inside size (L × W × H)', value: formatDimensions(design.dimensions, design.unit) },
    { label: 'Outside size (approx.)', value: formatDimensions(outside, design.unit) },
    { label: 'Board', value: `${ply?.name ?? design.ply} ${ply?.wall ?? ''}, ${board.flutes.join('')} flute, ~${board.caliperMm} mm`.replace(/\s+,/, ',') },
    { label: 'Outside colour', value: describeColour(design.colorHex) },
    { label: 'Inside', value: design.insideColorHex ? `Lined, ${describeColour(design.insideColorHex)}` : 'Same as outside' },
    { label: 'Finish', value: design.finish === 'gloss' ? 'Gloss' : 'Matte' },
    { label: 'Print', value: artwork },
    { label: 'Quantity', value: design.quantity.toLocaleString('en-IN') },
    { label: 'Strength (indicative)', value: strength.headline },
  ];
  if (design.template === 'telescope' && design.lidDepth) {
    rows.splice(3, 0, { label: 'Lid depth', value: formatLength(design.lidDepth, design.unit) });
  }

  return {
    title: design.name.trim() || `${template?.shortName ?? design.template.toUpperCase()} box`,
    subtitle: `${formatDimensions(design.dimensions, design.unit)} · ${design.ply}`,
    reference: designReference(design),
    date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    rows,
    notes: [
      'Sizes are inside dimensions. Strength is an indicative estimate; final board grade is confirmed with your order.',
      'On-screen and printed-PDF colours are approximate. Print colours are confirmed on the physical proof.',
    ],
  };
}

export interface SpecSheetImages {
  /** PNG/JPEG data URLs of up to three views */
  views: { label: string; dataUrl: string }[];
}

const PAGE = { w: 210, h: 297, m: 14 };

/** Draws the sheet on one A4 page and returns a PDF blob */
export async function renderSpecSheetPdf(data: SpecSheetData, images: SpecSheetImages, dieline: Dieline | null): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const { w, m } = PAGE;
  const inner = w - 2 * m;

  // Header band
  doc.setFillColor(23, 35, 28);
  doc.rect(0, 0, w, 24, 'F');
  doc.setTextColor(251, 248, 243);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(COMPANY_INFO.name, m, 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Box specification and customer proof', m, 17);
  doc.text(`Ref ${data.reference}`, w - m, 11, { align: 'right' });
  doc.text(data.date, w - m, 17, { align: 'right' });

  // Title
  doc.setTextColor(23, 35, 28);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(data.title.slice(0, 60), m, 35);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(74, 90, 80);
  doc.text(data.subtitle, m, 41);

  // Three views
  const viewY = 47;
  const gap = 4;
  const viewW = (inner - 2 * gap) / 3;
  const viewH = viewW * 0.75;
  images.views.slice(0, 3).forEach((view, i) => {
    const x = m + i * (viewW + gap);
    doc.setDrawColor(220, 209, 189);
    doc.setFillColor(251, 248, 243);
    doc.roundedRect(x, viewY, viewW, viewH, 2, 2, 'FD');
    try {
      const props = doc.getImageProperties(view.dataUrl);
      const k = Math.min((viewW - 2) / props.width, (viewH - 2) / props.height);
      const iw = props.width * k;
      const ih = props.height * k;
      doc.addImage(view.dataUrl, x + (viewW - iw) / 2, viewY + (viewH - ih) / 2, iw, ih);
    } catch {
      /* a failed view leaves its frame empty */
    }
    doc.setFontSize(8);
    doc.setTextColor(74, 90, 80);
    doc.text(view.label, x + viewW / 2, viewY + viewH + 4, { align: 'center' });
  });

  // Spec table (left) and dieline (right)
  let y = viewY + viewH + 12;
  const tableW = inner * 0.58;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(23, 35, 28);
  doc.text('Specification', m, y);
  y += 3;
  doc.setFontSize(9);
  for (const row of data.rows) {
    y += 6.2;
    doc.setDrawColor(233, 225, 211);
    doc.line(m, y + 1.8, m + tableW, y + 1.8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(74, 90, 80);
    doc.text(row.label, m, y);
    doc.setTextColor(23, 35, 28);
    doc.setFont('helvetica', 'bold');
    const value = doc.splitTextToSize(row.value, tableW * 0.55) as string[];
    doc.text(value[0] ?? '', m + tableW, y, { align: 'right' });
  }

  const dx = m + tableW + 6;
  const dw = inner - tableW - 6;
  const dy = viewY + viewH + 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Dieline', dx, dy);
  const boxY = dy + 3;
  const boxH = 62;
  doc.setDrawColor(220, 209, 189);
  doc.roundedRect(dx, boxY, dw, boxH, 2, 2, 'S');
  if (dieline && dieline.width > 0 && dieline.height > 0) {
    const k = Math.min((dw - 6) / dieline.width, (boxH - 6) / dieline.height);
    const ox = dx + (dw - dieline.width * k) / 2;
    const oy = boxY + (boxH - dieline.height * k) / 2;
    doc.setLineWidth(0.15);
    for (const l of dieline.lines) {
      if (l.kind === 'cut') {
        doc.setDrawColor(0, 0, 0);
        doc.setLineDashPattern([], 0);
      } else {
        doc.setDrawColor(208, 2, 27);
        doc.setLineDashPattern([1, 0.6], 0);
      }
      doc.line(ox + l.x1 * k, oy + l.y1 * k, ox + l.x2 * k, oy + l.y2 * k);
    }
    doc.setLineDashPattern([], 0);
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(74, 90, 80);
    doc.text('Dieline supplied with the order', dx + dw / 2, boxY + boxH / 2, { align: 'center' });
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(74, 90, 80);
  doc.text('Solid = cut, dashed = fold. Not to scale.', dx, boxY + boxH + 4);

  // Approval block
  y = Math.max(y, boxY + boxH + 4) + 14;
  doc.setDrawColor(23, 35, 28);
  doc.setLineWidth(0.3);
  doc.roundedRect(m, y, inner, 46, 2, 2, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(23, 35, 28);
  doc.text('Customer approval', m + 5, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(74, 90, 80);
  doc.text(doc.splitTextToSize('I approve the size, board, style and artwork shown on this sheet for production.', inner - 10) as string[], m + 5, y + 14);
  const lineY = y + 36;
  const third = (inner - 20) / 3;
  ['Name', 'Signature', 'Date'].forEach((label, i) => {
    const x = m + 5 + i * (third + 5);
    doc.setDrawColor(154, 167, 159);
    doc.line(x, lineY, x + third, lineY);
    doc.text(label, x, lineY + 5);
  });

  // Notes + footer
  y += 54;
  doc.setFontSize(7.5);
  for (const note of data.notes) {
    const lines = doc.splitTextToSize(note, inner) as string[];
    doc.text(lines, m, y);
    y += lines.length * 3.6 + 1;
  }
  doc.setFontSize(8);
  doc.setTextColor(23, 35, 28);
  doc.text(`${COMPANY_INFO.name} · ${CONTACT_INFO.phone} · ${CONTACT_INFO.email}`, w / 2, PAGE.h - 8, { align: 'center' });

  return doc.output('blob');
}
