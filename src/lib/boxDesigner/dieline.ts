/**
 * Dieline (flat blank) generator for FEFCO 0201 (RSC) and 0200 (HSC)
 * Built from the same RscLayout as the 3D model so the two always agree.
 * Units are millimetres at 1:1. Solid black = cut, dashed red = score (fold).
 */

import type { RscLayout } from './rig/rscLayout';

export interface DielineLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  kind: 'cut' | 'score';
}

export interface DielineLabel {
  x: number;
  y: number;
  text: string;
  size: number;
}

export interface Dieline {
  width: number;
  height: number;
  lines: DielineLine[];
  labels: DielineLabel[];
}

export interface DielineMeta {
  title: string;
  board: string;
  topFlaps: boolean;
}

const r = (n: number) => Math.round(n * 10) / 10;

export function buildDieline(layout: RscLayout, meta: DielineMeta): Dieline {
  const mm = (cm: number) => cm * 10;
  const t = mm(layout.thickness);
  const depth = mm(layout.flapDepth);
  const tab = mm(layout.tab.width);
  const slot = Math.max(mm(layout.slot), 3);
  const wallH = mm(layout.inside.height) + 2 * t; // score to score
  const margin = 20;
  const topDepth = meta.topFlaps ? depth : 0;

  const lines: DielineLine[] = [];
  const labels: DielineLabel[] = [];
  const cut = (x1: number, y1: number, x2: number, y2: number) => lines.push({ x1, y1, x2, y2, kind: 'cut' });
  const score = (x1: number, y1: number, x2: number, y2: number) => lines.push({ x1, y1, x2, y2, kind: 'score' });

  const yTopScore = margin + topDepth;
  const yBottomScore = yTopScore + wallH;
  const yBottomEdge = yBottomScore + depth;
  const xTab = margin;
  let x = xTab + tab;

  // glue tab (tapered)
  cut(x, yTopScore, xTab, yTopScore + 15);
  cut(xTab, yTopScore + 15, xTab, yBottomScore - 15);
  cut(xTab, yBottomScore - 15, x, yBottomScore);
  score(x, yTopScore, x, yBottomScore);
  labels.push({ x: xTab + tab / 2, y: (yTopScore + yBottomScore) / 2, text: 'glue', size: 8 });

  layout.walls.forEach((wall, i) => {
    const w = mm(wall.span);
    const x0 = x;
    const x1 = x + w;
    // panel scores (top/bottom) and right score (last panel edge is a cut)
    if (meta.topFlaps) score(x0, yTopScore, x1, yTopScore);
    else cut(x0, yTopScore, x1, yTopScore);
    score(x0, yBottomScore, x1, yBottomScore);
    if (i < 3) score(x1, yTopScore, x1, yBottomScore);
    else cut(x1, yTopScore, x1, yBottomScore);

    // flaps, separated by slots
    const fx0 = x0 + (i === 0 ? 0 : slot / 2);
    const fx1 = x1 - (i === 3 ? 0 : slot / 2);
    const flap = (yScore: number, yEdge: number) => {
      cut(fx0, yScore, fx0, yEdge);
      cut(fx0, yEdge, fx1, yEdge);
      cut(fx1, yEdge, fx1, yScore);
    };
    if (meta.topFlaps) flap(yTopScore, yTopScore - depth);
    flap(yBottomScore, yBottomEdge);

    labels.push({ x: (x0 + x1) / 2, y: (yTopScore + yBottomScore) / 2, text: `${wall.id} ${r(w)} mm`, size: 10 });
    x = x1;
  });

  const width = x + margin;
  const height = yBottomEdge + margin + 40;
  labels.push({ x: margin, y: yBottomEdge + margin + 6, text: meta.title, size: 9 });
  labels.push({
    x: margin,
    y: yBottomEdge + margin + 20,
    text: `${meta.board} | wall height ${r(wallH)} mm | flap ${r(depth)} mm | blank ${r(width - 2 * margin)} x ${r(yBottomEdge - margin)} mm | cut = solid, score = dashed | scale 1:1`,
    size: 7,
  });
  return { width, height, lines, labels };
}

const escapeXml = (s: string) => s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!);

export function dielineToSvg(d: Dieline): string {
  const lines = d.lines
    .map(
      (l) =>
        `<line x1="${r(l.x1)}" y1="${r(l.y1)}" x2="${r(l.x2)}" y2="${r(l.y2)}" ${
          l.kind === 'cut' ? 'stroke="#000" stroke-width="0.5"' : 'stroke="#d0021b" stroke-width="0.5" stroke-dasharray="4 2"'
        }/>`
    )
    .join('\n');
  const labels = d.labels
    .map((t) => `<text x="${r(t.x)}" y="${r(t.y)}" font-size="${t.size}" font-family="Arial" fill="#333" ${t.size >= 10 ? 'text-anchor="middle"' : ''}>${escapeXml(t.text)}</text>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${r(d.width)}mm" height="${r(d.height)}mm" viewBox="0 0 ${r(d.width)} ${r(d.height)}">
${lines}
${labels}
</svg>`;
}

/** PDF at 1:1 on a page sized to the blank (jsPDF is loaded only when needed) */
export async function dielineToPdf(d: Dieline): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: [d.width, d.height], orientation: d.width > d.height ? 'landscape' : 'portrait' });
  for (const l of d.lines) {
    if (l.kind === 'cut') {
      doc.setDrawColor(0, 0, 0);
      doc.setLineDashPattern([], 0);
    } else {
      doc.setDrawColor(208, 2, 27);
      doc.setLineDashPattern([4, 2], 0);
    }
    doc.setLineWidth(0.3);
    doc.line(l.x1, l.y1, l.x2, l.y2);
  }
  doc.setLineDashPattern([], 0);
  doc.setTextColor(51, 51, 51);
  for (const t of d.labels) {
    doc.setFontSize(t.size * 2.2);
    doc.text(t.text, t.x, t.y, { align: t.size >= 10 ? 'center' : 'left' });
  }
  return doc.output('blob');
}
