/**
 * Flat 2D artwork used on box faces and flat goods (local units = centimetres): the sample customer brand from the
 * home story ("madhu" honey), cut-outs (vents, hand holes), honeycomb print, a pharma batch panel and a die-cut
 * mailer blank. Sample brands are clearly fictional placeholders, never real companies.
 */
import { FONT, K, barcode, lines, matrixCode, shade, text } from './kit.mjs';

const r3 = (n) => Math.round(n * 1000) / 1000;

/** Honey-drop mark of the sample brand "madhu", centred at (cx, cy), height s */
export const dropMark = (cx, cy, s, color = K.green) =>
  `<path d="M${r3(cx)} ${r3(cy - s / 2)}C${r3(cx + s * 0.08)} ${r3(cy - s * 0.25)} ${r3(cx + s * 0.38)} ${r3(cy)} ${r3(cx + s * 0.38)} ${r3(cy + s * 0.16)}A${r3(s * 0.38)} ${r3(s * 0.36)} 0 0 1 ${r3(cx - s * 0.38)} ${r3(cy + s * 0.16)}C${r3(cx - s * 0.38)} ${r3(cy)} ${r3(cx - s * 0.08)} ${r3(cy - s * 0.25)} ${r3(cx)} ${r3(cy - s / 2)}Z" fill="${color}"/>` +
  `<path d="M${r3(cx - s * 0.2)} ${r3(cy + s * 0.12)}a${r3(s * 0.2)} ${r3(s * 0.2)} 0 0 0 ${r3(s * 0.2)} ${r3(s * 0.2)}" fill="none" stroke="#fff" stroke-opacity="0.7" stroke-width="${r3(s * 0.06)}" stroke-linecap="round"/>`;

/** "madhu" lockup: drop + wordmark, left edge at x, baseline at y, cap height ≈ s */
export const madhu = (x, y, s, color = K.green, { sub } = {}) =>
  dropMark(x + s * 0.45, y - s * 0.38, s * 1.05, color) +
  text(x + s * 1.05, y, s * 1.05, 'madhu', { color, weight: 800, spacing: -s * 0.03 }) +
  (sub ? text(x + s * 1.1, y + s * 0.62, s * 0.3, sub, { color, weight: 600, spacing: s * 0.03 }) : '');

/** Honeycomb print fill for an area */
export function honeycomb(x, y, w, h, cell, color, op = 0.35) {
  let d = '';
  const hh = cell * Math.sqrt(3);
  for (let row = 0; row * hh * 0.5 < h + hh; row++) {
    for (let col = 0; col * cell * 3 < w + cell * 3; col++) {
      const cx = x + col * cell * 3 + (row % 2 ? cell * 1.5 : 0);
      const cy = y + row * hh * 0.5;
      let p = '';
      for (let k = 0; k < 6; k++) {
        const a = (Math.PI / 3) * k;
        p += `${k ? 'L' : 'M'}${r3(cx + Math.cos(a) * cell * 0.92)} ${r3(cy + Math.sin(a) * cell * 0.92)}`;
      }
      d += `${p}Z`;
    }
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${r3(cell * 0.12)}" stroke-opacity="${op}"/>`;
}

/** A cut-out (vent slot or hand hole) in a face: dark cavity, the board edge catching light at the bottom */
export function slot(x, y, w, h, { board = K.kraft } = {}) {
  const rr = Math.min(w, h) / 2;
  return (
    `<rect x="${r3(x)}" y="${r3(y)}" width="${r3(w)}" height="${r3(h)}" rx="${r3(rr)}" fill="#24190F"/>` +
    `<rect x="${r3(x + w * 0.04)}" y="${r3(y + h * 0.52)}" width="${r3(w * 0.92)}" height="${r3(h * 0.44)}" rx="${r3(rr * 0.8)}" fill="${shade(board, -0.25)}" opacity="0.85"/>` +
    `<rect x="${r3(x)}" y="${r3(y)}" width="${r3(w)}" height="${r3(h)}" rx="${r3(rr)}" fill="none" stroke="${shade(board, 0.3)}" stroke-width="${r3(Math.min(w, h) * 0.08)}" stroke-opacity="0.6"/>`
  );
}

/** A row of `n` vertical vent slots centred in a face of width w */
export function ventRow(w, y, n, sw, sh, opts) {
  const gap = sw * 1.6;
  const total = n * sw + (n - 1) * gap;
  let s = '';
  for (let i = 0; i < n; i++) s += slot((w - total) / 2 + i * (sw + gap), y, sw, sh, opts);
  return s;
}

/** Pharma batch panel: printed white box with batch number, dates, MRP-style lines and a GS1 DataMatrix */
export function batchPanel(w, h, { ink = '#1E3A5F', seed = 4 } = {}) {
  const p = w * 0.06;
  let s = `<rect width="${r3(w)}" height="${r3(h)}" fill="#FFFFFF" stroke="${ink}" stroke-width="${r3(w * 0.012)}"/>`;
  const rows = [['B.No.', 'VP24-118'], ['MFG', '09/2026'], ['EXP', '08/2028']];
  rows.forEach(([k, v], i) => {
    const y = p + h * 0.17 + i * h * 0.21;
    s += text(p, y, h * 0.13, k, { color: ink, weight: 700 });
    s += text(p + w * 0.24, y, h * 0.13, v, { color: '#222', weight: 600, font: "'SFMono-Regular', Consolas, monospace" });
  });
  s += matrixCode(w - p - h * 0.62, p * 0.9, h * 0.62, seed, { cells: 18, finder: false, color: '#111' });
  s += `<rect x="${r3(w - p - h * 0.62)}" y="${r3(p * 0.9)}" width="${r3(h * 0.04)}" height="${r3(h * 0.62)}" fill="#111"/><rect x="${r3(w - p - h * 0.62)}" y="${r3(p * 0.9 + h * 0.58)}" width="${r3(h * 0.62)}" height="${r3(h * 0.04)}" fill="#111"/>`;
  return s;
}

/** Pharma shipper print: two-tone band, a rounded cross mark and lines (no real brand) */
export function pharmaPrint(w, h, { ink = '#1E5AA8', accent = '#2E9B8F' } = {}) {
  let s = `<rect y="${r3(h * 0.72)}" width="${r3(w)}" height="${r3(h * 0.07)}" fill="${ink}"/><rect y="${r3(h * 0.79)}" width="${r3(w)}" height="${r3(h * 0.025)}" fill="${accent}"/>`;
  const c = h * 0.13;
  s += `<path d="M${r3(w * 0.08 + c)} ${r3(h * 0.16)}h${r3(c)}v${r3(c)}h${r3(c)}v${r3(c)}h${r3(-c)}v${r3(c)}h${r3(-c)}v${r3(-c)}h${r3(-c)}v${r3(-c)}h${r3(c)}z" fill="${accent}"/>`;
  s += text(w * 0.08 + c * 3.6, h * 0.29, h * 0.11, 'CARE', { color: ink, weight: 800, spacing: h * 0.01 });
  s += lines(w * 0.08 + c * 3.6, h * 0.36, w * 0.38, 2, h * 0.06, { color: shade(ink, 0.35) });
  return s;
}

/**
 * Flat die-cut mailer blank (FEFCO 0427 style) in local units, long axis along x: tuck | lid | back wall | base |
 * front wall | front inner wall, with dust flaps, ears and double side walls. Cut edge = fill boundary; creases are
 * pressed lines (dark line with a light lip).
 */
export function mailerBlank({ L = 26, W = 20, H = 7, color = K.kraft } = {}) {
  const T = 5;
  const u = [0, T, T + W, T + W + H, T + W + H + W, T + W + H + W + H, T + W + H + W + 2 * H];
  const V = L + 4 * H;
  const v0 = 2 * H;
  const v1 = 2 * H + L;
  const top = [
    [0, v0 + 2], [1.2, v0 + 0.3], [u[1], v0 + 0.3], [u[1], v0], [u[1] + 1.5, v0 - H * 0.8], [u[2] - 1.5, v0 - H * 0.8], [u[2], v0],
    [u[2] + 0.6, v0 - H * 0.9], [u[3], v0 - H * 0.9], [u[3], H], [u[3] + 0.8, H], [u[3] + 0.8, 1], [u[3] + 2, 0], [u[4] - 2, 0], [u[4] - 0.8, 1], [u[4] - 0.8, H], [u[4], H],
    [u[4], v0 - H * 0.9], [u[5] - 0.6, v0 - H * 0.9], [u[5], v0], [u[5], v0 + 0.6], [u[6] - 1, v0 + 1.4], [u[6], v0 + 3],
  ];
  const bottom = top.map(([a, b]) => [a, V - b]).reverse();
  const outline = [...top, ...bottom];
  const d = `M${outline.map(([a, b]) => `${r3(a)} ${r3(b)}`).join('L')}Z`;
  const crease = [
    [[u[1], v0], [u[1], v1]], [[u[2], v0], [u[2], v1]], [[u[3], v0], [u[3], v1]], [[u[4], v0], [u[4], v1]], [[u[5], v0], [u[5], v1]],
    [[u[1], v0], [u[2], v0]], [[u[1], v1], [u[2], v1]], [[u[2], v0], [u[3], v0]], [[u[2], v1], [u[3], v1]],
    [[u[3], v0], [u[4], v0]], [[u[3], v1], [u[4], v1]], [[u[3] + 0.8, H], [u[4] - 0.8, H]], [[u[3] + 0.8, V - H], [u[4] - 0.8, V - H]],
    [[u[4], v0], [u[5], v0]], [[u[4], v1], [u[5], v1]],
  ];
  const cl = crease.map(([a, b]) => `M${r3(a[0])} ${r3(a[1])}L${r3(b[0])} ${r3(b[1])}`).join('');
  return {
    size: [u[6], V],
    art:
      `<path d="${d}" fill="${color}"/>` +
      `<path d="${cl}" stroke="${shade(color, 0.3)}" stroke-width="0.32" transform="translate(0.14 0.14)"/>` +
      `<path d="${cl}" stroke="${shade(color, -0.32)}" stroke-width="0.22"/>` +
      `<path d="${d}" fill="none" stroke="${shade(color, -0.45)}" stroke-width="0.16"/>`,
    outline: d,
  };
}

/** Courier-style printed tape artwork (local units: length × width) */
export const fragileTape = (len, tw, { bg = '#E7D3A7', ink = '#C8372D' } = {}) => {
  let s = `<rect width="${r3(len)}" height="${r3(tw)}" fill="${bg}" opacity="0.92"/>`;
  for (let x = 1; x < len - 8; x += 14) s += text(x, tw * 0.68, tw * 0.46, 'FRAGILE', { color: ink, weight: 800, spacing: tw * 0.04 });
  return s;
};

export { FONT, barcode };
