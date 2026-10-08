/**
 * Tiny isometric SVG toolkit for the Vayu illustration set.
 * SECURITY: build-time only. It reads nothing from the network or user input and writes static SVG
 * (no <script>, no external hrefs, no <foreignObject>), so the output is safe to serve as an <img>.
 */

export const C = {
  paper50: '#FBF8F3',
  paper100: '#F4EFE6',
  paper200: '#E9E1D3',
  paper300: '#DCD1BD',
  k200: '#E8D5B3',
  k300: '#D9BB91',
  k400: '#C49A6C',
  k500: '#A97F52',
  k700: '#8A6440',
  k900: '#5E4228',
  ink800: '#17231C',
  ink500: '#4A5A50',
  ink300: '#9AA79F',
  green400: '#3DBA5A',
  green500: '#2E9B47',
  green600: '#23803A',
  green700: '#1B6A2F',
  cyan400: '#1FB5E0',
  cyan700: '#066A8D',
  white: '#FFFFFF',
  wood: ['#C9A06B', '#B58A55', '#9C7343'],
};

const COS = Math.cos(Math.PI / 6);
const f = (n) => Math.round(n * 100) / 100;

/** Isometric projector. World: x → right-down, y → left-down, z → up. */
export const makeIso = (ox, oy, s = 1) => (x, y, z = 0) => [f(ox + (x - y) * COS * s), f(oy + (x + y) * 0.5 * s - z * s)];

/** Iso projector that scales and centres a world-space bounding box [x0,y0,z0,x1,y1,z1] inside the canvas. */
export function fitIso(bb, { cx = 600, cy = 420, maxW = 700, maxH = 520 } = {}) {
  const [x0, y0, z0, x1, y1, z1] = bb;
  const P0 = makeIso(0, 0, 1);
  const c = [];
  for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) c.push(P0(x, y, z));
  const xs = c.map((p) => p[0]);
  const ys = c.map((p) => p[1]);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const s = Math.min(maxW / (maxX - minX), maxH / (maxY - minY));
  return makeIso(cx - ((minX + maxX) / 2) * s, cy - ((minY + maxY) / 2) * s, s);
}

export const pts = (arr) => arr.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');

export const poly = (P, v3, fill, { stroke = C.k700, sw = 1.2, op = 1, dash } = {}) =>
  `<polygon points="${pts(v3.map(([x, y, z]) => P(x, y, z)))}" fill="${fill}" stroke="${stroke === 'none' ? 'none' : stroke}" stroke-width="${sw}" stroke-linejoin="round"${op !== 1 ? ` opacity="${op}"` : ''}${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;

export const line3 = (P, a, b, { stroke = C.k700, sw = 1.2, dash, op = 1 } = {}) => {
  const [x1, y1] = P(...a);
  const [x2, y2] = P(...b);
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}${op !== 1 ? ` opacity="${op}"` : ''}/>`;
};

/** A solid cuboid. `tape` draws a packing-tape seam on top that wraps down both ends. */
export function box(P, { x, y, z = 0, w, d, h, top = C.k300, left = C.k400, right = C.k500, stroke = C.k700, sw = 1.2, tape = false, seam = false, pattern }) {
  const out = [];
  out.push(poly(P, [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], left, { stroke, sw }));
  out.push(poly(P, [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], right, { stroke, sw }));
  out.push(poly(P, [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], top, { stroke, sw }));
  if (seam || tape) {
    const m = y + d / 2;
    out.push(line3(P, [x, m, z + h], [x + w, m, z + h], { stroke, sw: sw * 0.9, op: 0.7 }));
  }
  if (tape) {
    const t = Math.min(d, w) * 0.09;
    const m = y + d / 2;
    const tz = h * 0.22;
    out.push(poly(P, [[x, m - t, z + h], [x + w, m - t, z + h], [x + w, m + t, z + h], [x, m + t, z + h]], C.k200, { stroke: C.k400, sw: 0.7, op: 0.92 }));
    out.push(poly(P, [[x + w, m - t, z + h], [x + w, m + t, z + h], [x + w, m + t, z + h - tz], [x + w, m - t, z + h - tz]], C.k200, { stroke: C.k400, sw: 0.7, op: 0.92 }));
  }
  if (pattern) out.push(pattern);
  return out.join('');
}

/** Faint corrugation hatching on the left/right faces (reads as board without clutter). */
export function flutes(P, { x, y, z = 0, w, d, h, n = 14, op = 0.18, stroke = C.k700 }) {
  const out = [];
  for (let i = 1; i < n; i++) {
    const t = i / n;
    out.push(line3(P, [x + w * t, y + d, z + 4], [x + w * t, y + d, z + h - 4], { stroke, sw: 0.7, op }));
  }
  for (let i = 1; i < Math.round(n * (d / w)); i++) {
    const t = i / Math.round(n * (d / w));
    out.push(line3(P, [x + w, y + d * t, z + 4], [x + w, y + d * t, z + h - 4], { stroke, sw: 0.7, op }));
  }
  return out.join('');
}

/** Rotate a flap about its hinge: returns the four 3D corners. */
function flapQuad(A, B, n, L, aDeg) {
  const a = (aDeg * Math.PI) / 180;
  const dx = n[0] * Math.cos(a) * L;
  const dy = n[1] * Math.cos(a) * L;
  const dz = Math.sin(a) * L;
  return [A, B, [B[0] + dx, B[1] + dy, B[2] + dz], [A[0] + dx, A[1] + dy, A[2] + dz]];
}

/** Open-top box with four flaps. Draw order is handled inside (back flaps → interior → shell → front flaps). */
export function openBox(P, { x, y, z = 0, w, d, h, back = 62, front = -38, outer = [C.k400, C.k500], inner = ['#B58A5B', '#A47B4F', '#946B42'], flap = [C.k300, C.k400], stroke = C.k700, sw = 1.2, contents = '' }) {
  const zt = z + h;
  const out = [];
  // back flaps (hinged on y=y and x=x edges), lean away from the viewer
  out.push(poly(P, flapQuad([x, y, zt], [x + w, y, zt], [0, -1], d / 2, back), flap[1], { stroke, sw }));
  out.push(poly(P, flapQuad([x, y, zt], [x, y + d, zt], [-1, 0], w / 2, back), flap[0], { stroke, sw }));
  // interior
  out.push(poly(P, [[x, y, z], [x + w, y, z], [x + w, y, zt], [x, y, zt]], inner[0], { stroke, sw }));
  out.push(poly(P, [[x, y, z], [x, y + d, z], [x, y + d, zt], [x, y, zt]], inner[1], { stroke, sw }));
  out.push(poly(P, [[x, y, z + 1], [x + w, y, z + 1], [x + w, y + d, z + 1], [x, y + d, z + 1]], inner[2], { stroke: 'none' }));
  out.push(contents);
  // shell
  out.push(poly(P, [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, zt], [x, y + d, zt]], outer[0], { stroke, sw }));
  out.push(poly(P, [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, zt], [x + w, y, zt]], outer[1], { stroke, sw }));
  // front flaps hang outward
  out.push(poly(P, flapQuad([x, y + d, zt], [x + w, y + d, zt], [0, 1], d / 2, front), flap[0], { stroke, sw }));
  out.push(poly(P, flapQuad([x + w, y, zt], [x + w, y + d, zt], [1, 0], w / 2, front), flap[1], { stroke, sw }));
  return out.join('');
}

export function pallet(P, { x, y, z = 0, w, d }) {
  const [t, l, r] = C.wood;
  const out = [];
  const sh = 18; // stringer height
  const sw_ = Math.min(14, d / 9);
  for (const yy of [y, y + d / 2 - sw_ / 2, y + d - sw_]) {
    out.push(box(P, { x, y: yy, z, w, d: sw_, h: sh, top: t, left: l, right: r, stroke: C.k900, sw: 0.9 }));
  }
  // deck boards
  const boards = 5;
  const gap = 5;
  const bw = (w - gap * (boards - 1)) / boards;
  for (let i = 0; i < boards; i++) {
    out.push(box(P, { x: x + i * (bw + gap), y, z: z + sh, w: bw, d, h: 9, top: t, left: l, right: r, stroke: C.k900, sw: 0.9 }));
  }
  return out.join('');
}

export const shadow = (P, { x, y, w, d, pad = 26, op = 0.13 }) =>
  `<polygon points="${pts([P(x - pad, y - pad, 0), P(x + w + pad, y - pad, 0), P(x + w + pad, y + d + pad, 0), P(x - pad, y + d + pad, 0)])}" fill="${C.ink800}" opacity="${op}" filter="url(#soft)"/>`;

export const defs = (extra = '') => `<defs><filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.paper50}"/><stop offset="1" stop-color="${C.paper200}"/></linearGradient>${extra}</defs>`;

/** Wrap content in an SVG with a quiet paper background. */
export function svg({ w = 1200, h = 900, title, body, bg = true, extraDefs = '' }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${title}">
<title>${title}</title>
${defs(extraDefs)}
${bg ? `<rect width="${w}" height="${h}" fill="url(#bg)"/>` : ''}
${body}
</svg>
`;
}

/** Corrugated board cross-section (flat, 2D). `layers` = number of papers (3, 5, 7). */
export function boardSection({ x, y, w, layers = 3, flute = 22, liner = 7, gap = 0, strokeW = 3, color = C.k700, fill = C.k300, mid = C.k400 }) {
  const out = [];
  const nFlutes = layers === 3 ? 1 : layers === 5 ? 2 : 3;
  let cy = y;
  // Sampled sine: the medium touches the upper liner at the crests and the lower liner at the troughs.
  const wave = (yTop, amp) => {
    const per = flute * 1.5;
    const steps = Math.max(8, Math.floor(w / 3));
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const px = x + (w * i) / steps;
      const py = yTop + amp + Math.sin(((px - x) / per) * Math.PI * 2 + Math.PI / 2) * -amp;
      d += `${i ? ' L' : 'M'} ${f(px)} ${f(py)}`;
    }
    return d;
  };
  out.push(`<rect x="${x}" y="${cy}" width="${w}" height="${liner}" fill="${fill}" stroke="${color}" stroke-width="1.5"/>`);
  cy += liner;
  for (let i = 0; i < nFlutes; i++) {
    const amp = flute / 2 - 1;
    out.push(`<path d="${wave(cy + 1, amp)}" fill="none" stroke="${mid}" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round"/>`);
    cy += flute + gap;
    out.push(`<rect x="${x}" y="${cy}" width="${w}" height="${liner}" fill="${fill}" stroke="${color}" stroke-width="1.5"/>`);
    cy += liner;
  }
  return { svg: out.join(''), height: cy - y };
}
