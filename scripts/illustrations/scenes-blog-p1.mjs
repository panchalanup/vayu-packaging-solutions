/**
 * Blog thumbnails for the third batch of guides (blog writer P1; 16:9, 1600x900): shoe box sizes, mithai box sizes,
 * packing fragile items, boxes per pallet, cardboard vs corrugated vs duplex, packaging cost per order, a 12-point
 * packing checklist, Kesar mango boxes and leak-free jars. Same restrained palette and helpers as scenes-blog-n2.mjs:
 * isometric kraft boxes, paper cards, one green accent. The only text is short labels (L, H, 2.5 cm, ply names).
 * No price or rating is drawn, and no brand or third-party artwork is used; every shape is drawn from primitives.
 * SECURITY: build-time only; output is static, script-free SVG.
 */
import { C, fitIso, box, flutes, shadow, svg, boardSection, pallet } from './lib.mjs';

const W = 1600;
const H = 900;
const FONT = `font-family="Satoshi, 'Segoe UI', Arial, sans-serif"`;
const blog = (title, body) => svg({ w: W, h: H, title, body });
const text = (x, y, s, size = 40, { weight = 700, fill = C.ink800, anchor = 'middle' } = {}) =>
  `<text x="${x}" y="${y}" ${FONT} font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${s}</text>`;
const card = (x, y, w, h, fill = C.paper50, rx = 22) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${C.paper300}" stroke-width="2"/>`;
const bar = (x, y, w, h, fill, rx = h / 2) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
const tick = (cx, cy, s = 1, color = C.green600) =>
  `<polyline points="${cx - 12 * s},${cy + 1 * s} ${cx - 3 * s},${cy + 10 * s} ${cx + 13 * s},${cy - 10 * s}" fill="none" stroke="${color}" stroke-width="${6 * s}" stroke-linecap="round" stroke-linejoin="round"/>`;
const arrow = (x1, y1, x2, y2, color = C.green600, w = 6) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 16;
  const p1 = [x2 - Math.cos(a - 0.45) * h, y2 - Math.sin(a - 0.45) * h];
  const p2 = [x2 - Math.cos(a + 0.45) * h, y2 - Math.sin(a + 0.45) * h];
  return `<g stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><polyline points="${p1.join(',')} ${x2},${y2} ${p2.join(',')}"/></g>`;
};
const dim = (x1, y1, x2, y2, color = C.green600, w = 5) => arrow(x1, y1, x2, y2, color, w) + arrow(x2, y2, x1, y1, color, w);

const WHITE_BOX = { top: C.white, left: '#EFE8DA', right: '#DDD3C0', stroke: C.ink300 };
const GREEN_BOX = { top: C.green500, left: C.green600, right: C.green700, stroke: C.green700 };
const AMBER = '#E3A13C';
const AMBER_DARK = '#B97A1E';

/** Group that maps flat 2D drawing coordinates (u right, v down, in the box's own units) onto a visible side face. */
function onFace(P, b, side, inner) {
  const p0 = P(0, 0, 0);
  const px = P(1, 0, 0);
  const py = P(0, 1, 0);
  const pz = P(0, 0, 1);
  const o = side === 'L' ? P(b.x, b.y + b.d, (b.z ?? 0) + b.h) : P(b.x + b.w, b.y, (b.z ?? 0) + b.h);
  const u = side === 'L' ? [px[0] - p0[0], px[1] - p0[1]] : [py[0] - p0[0], py[1] - p0[1]];
  const v = [p0[0] - pz[0], p0[1] - pz[1]];
  return `<g transform="matrix(${u[0]} ${u[1]} ${v[0]} ${v[1]} ${o[0]} ${o[1]})">${inner}</g>`;
}

/** A box on a spot of the canvas, with an optional shipping label and a tape seam. */
function parcel(cx, cy, { dims = [220, 160, 130], colours = {}, maxW = 260, maxH = 190, tape = true, label = false } = {}) {
  const [w, d, h] = dims;
  const P = fitIso([0, 0, 0, w, d, h], { cx, cy, maxW, maxH });
  const b = { x: 0, y: 0, z: 0, w, d, h };
  let out = shadow(P, { ...b, pad: 14 }) + box(P, { ...b, ...colours, tape }) + (colours.top ? '' : flutes(P, { ...b, n: 10 }));
  if (label) out += onFace(P, b, 'L', `<rect x="${w * 0.16}" y="${h * 0.2}" width="${w * 0.42}" height="${h * 0.46}" rx="${h * 0.04}" fill="${C.white}" stroke="${C.ink300}" stroke-width="2"/><rect x="${w * 0.2}" y="${h * 0.3}" width="${w * 0.3}" height="${h * 0.05}" fill="${C.ink800}"/><rect x="${w * 0.2}" y="${h * 0.42}" width="${w * 0.22}" height="${h * 0.04}" fill="${C.ink300}"/><rect x="${w * 0.2}" y="${h * 0.52}" width="${w * 0.26}" height="${h * 0.04}" fill="${C.ink300}"/>`);
  return out;
}

/** A lid-and-base (telescope) box with the lid lifted off the base. */
function lidBox(cx, cy, { dims = [300, 200, 90], lift = 90, lidH = 46, colours = WHITE_BOX, maxW = 420, maxH = 330 } = {}) {
  const [w, d, h] = dims;
  const pad = 8;
  const P = fitIso([0, 0, 0, w, d, h + lift + lidH], { cx, cy, maxW, maxH });
  const base = { x: 0, y: 0, z: 0, w, d, h };
  const lid = { x: -pad, y: -pad, z: h + lift, w: w + pad * 2, d: d + pad * 2, h: lidH };
  return shadow(P, { ...base, pad: 16 }) + box(P, { ...base, ...colours }) + box(P, { ...lid, ...colours });
}

/** Rounded dashed outline used for bags, cushioning and cells. */
const dashed = (x, y, w, h, rx = 18, color = C.green600) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="none" stroke="${color}" stroke-width="5" stroke-dasharray="14 12" stroke-linecap="round"/>`;

export const blogP1Scenes = {
  // Shoe box chart: three lid-and-base boxes of growing size beside a sneaker outline with length and height arrows
  'blog-p1-shoe-sizes': () => {
    const out = [];
    out.push(parcel(190, 700, { dims: [220, 140, 80], colours: WHITE_BOX, maxW: 270, maxH: 150, tape: false }));
    out.push(parcel(500, 640, { dims: [280, 170, 100], colours: WHITE_BOX, maxW: 330, maxH: 190, tape: false }));
    out.push(lidBox(380, 330, { dims: [320, 200, 110], maxW: 520, maxH: 340 }));
    out.push(card(900, 110, 620, 680));
    // sneaker outline, drawn in its own units and scaled
    const sx = 980;
    const sy = 330;
    out.push(`<g transform="translate(${sx} ${sy}) scale(1.35)">
      <path d="M 0 150 L 0 40 Q 0 8 40 10 L 110 18 Q 150 60 215 88 Q 300 100 320 128 L 320 150 Z" fill="${C.paper100}" stroke="${C.ink800}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M 0 150 L 320 150 L 320 172 Q 320 184 306 184 L 14 184 Q 0 184 0 172 Z" fill="${C.green600}" stroke="${C.green700}" stroke-width="4" stroke-linejoin="round"/>
      <g stroke="${C.ink300}" stroke-width="6" stroke-linecap="round"><line x1="118" y1="42" x2="146" y2="60"/><line x1="140" y1="22" x2="170" y2="44"/><line x1="166" y1="66" x2="192" y2="80"/></g>
    </g>`);
    // bounding rectangle and dimension arrows
    out.push(`<rect x="${sx}" y="${sy - 18}" width="${320 * 1.35}" height="${202 * 1.35}" rx="12" fill="none" stroke="${C.ink300}" stroke-width="3" stroke-dasharray="10 10"/>`);
    out.push(dim(sx, sy + 202 * 1.35 + 40, sx + 320 * 1.35, sy + 202 * 1.35 + 40));
    out.push(text(sx + 160 * 1.35, sy + 202 * 1.35 + 100, 'L', 44, { fill: C.green700 }));
    out.push(dim(sx + 320 * 1.35 + 46, sy - 18, sx + 320 * 1.35 + 46, sy + 184 * 1.35));
    out.push(text(sx + 320 * 1.35 + 80, sy + 100, 'H', 44, { fill: C.green700 }));
    return blog('Three white lid-and-base shoe boxes of growing size beside a sneaker outline measured by length and height arrows', out.join(''));
  },

  // Mithai sizes: a lid-and-base box with the lid lifted beside a five by five grid of sweet pieces and an edge allowance
  'blog-p1-mithai-sizes': () => {
    const out = [];
    out.push(lidBox(420, 480, { dims: [300, 300, 70], lift: 130, lidH: 40, colours: GREEN_BOX, maxW: 640, maxH: 560 }));
    out.push(card(900, 110, 620, 680));
    const x0 = 970;
    const y0 = 190;
    const size = 480;
    out.push(`<rect x="${x0}" y="${y0}" width="${size}" height="${size}" rx="18" fill="${C.paper100}" stroke="${C.k700}" stroke-width="5"/>`);
    out.push(dashed(x0 + 22, y0 + 22, size - 44, size - 44, 10, C.ink300));
    const cell = (size - 44) / 5;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const cx = x0 + 22 + cell * (i + 0.5);
        const cy = y0 + 22 + cell * (j + 0.5);
        const r = cell * 0.36;
        out.push(`<polygon points="${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}" fill="${C.k300}" stroke="${C.k700}" stroke-width="3" stroke-linejoin="round"/>`);
      }
    }
    out.push(dim(x0, y0 + size + 44, x0 + size, y0 + size + 44));
    out.push(text(x0 + size / 2, y0 + size + 100, 'pieces + edge', 32, { weight: 600, fill: C.ink500 }));
    return blog('A green lid-and-base sweet box with the lid lifted beside a top view of a five by five grid of sweet pieces with an edge margin', out.join(''));
  },

  // Fragile: a taped parcel with a glass icon beside a top view of an item ringed by cushioning with 2.5 cm arrows
  'blog-p1-fragile': () => {
    const out = [];
    out.push(parcel(400, 620, { dims: [300, 240, 190], maxW: 520, maxH: 400, label: true }));
    // wine glass above the parcel
    out.push(`<g transform="translate(400 170)" fill="none" stroke="${C.green700}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><path d="M -48 -70 L 48 -70 Q 48 10 0 24 Q -48 10 -48 -70 Z" fill="${C.paper50}"/><line x1="0" y1="24" x2="0" y2="84"/><line x1="-36" y1="86" x2="36" y2="86"/><line x1="-48" y1="-34" x2="48" y2="-34" stroke-width="6" opacity="0.6"/></g>`);
    out.push(card(860, 110, 660, 680));
    const x0 = 940;
    const y0 = 190;
    const s = 500;
    out.push(`<rect x="${x0}" y="${y0}" width="${s}" height="${s}" rx="14" fill="${C.k300}" stroke="${C.k700}" stroke-width="6"/>`);
    out.push(`<rect x="${x0 + 14}" y="${y0 + 14}" width="${s - 28}" height="${s - 28}" rx="8" fill="${C.paper100}"/>`);
    // cushioning ring: dots
    const ring = 100;
    out.push(`<rect x="${x0 + 14}" y="${y0 + 14}" width="${s - 28}" height="${s - 28}" rx="8" fill="${C.green600}" opacity="0.12"/>`);
    for (let i = 0; i < 14; i++) {
      for (let j = 0; j < 14; j++) {
        const px = x0 + 34 + i * ((s - 68) / 13);
        const py = y0 + 34 + j * ((s - 68) / 13);
        const inside = px > x0 + 14 + ring && px < x0 + s - 14 - ring && py > y0 + 14 + ring && py < y0 + s - 14 - ring;
        if (!inside) out.push(`<circle cx="${px}" cy="${py}" r="7" fill="none" stroke="${C.green600}" stroke-width="3" opacity="0.55"/>`);
      }
    }
    // the item: a mug seen from above
    const cx = x0 + s / 2;
    const cy = y0 + s / 2;
    out.push(`<circle cx="${cx}" cy="${cy}" r="${(s - 28 - ring * 2) / 2}" fill="${C.white}" stroke="${C.ink800}" stroke-width="6"/>`);
    out.push(`<circle cx="${cx}" cy="${cy}" r="${(s - 28 - ring * 2) / 2 - 26}" fill="${C.paper100}" stroke="${C.ink300}" stroke-width="3"/>`);
    out.push(`<path d="M ${cx + (s - 28 - ring * 2) / 2} ${cy - 30} q 44 0 44 30 q 0 30 -44 30" fill="none" stroke="${C.ink800}" stroke-width="6" stroke-linecap="round"/>`);
    out.push(`<rect x="${x0 + 24}" y="${cy - 64}" width="100" height="40" rx="10" fill="${C.paper50}" stroke="${C.paper300}" stroke-width="2"/>`);
    out.push(text(x0 + 74, cy - 34, '2.5 cm', 28, { fill: C.green700 }));
    out.push(dim(x0 + 14, cy, x0 + 14 + ring, cy));
    out.push(dim(cx - 190, y0 + 14, cx - 190, y0 + 14 + ring));
    return blog('A taped parcel with a wine glass above it beside a top view of a mug ringed by cushioning with two and a half centimetre arrows', out.join(''));
  },

  // Pallet: cartons stacked in columns on a pallet, beside a top view of six cartons filling the pallet floor
  'blog-p1-pallet': () => {
    const out = [];
    const pw = 240;
    const pd = 200;
    const bw = 80;
    const bd = 100;
    const bh = 56;
    const layers = 3;
    const deck = 27;
    const P = fitIso([0, 0, 0, pw, pd, deck + layers * bh], { cx: 420, cy: 480, maxW: 700, maxH: 600 });
    out.push(shadow(P, { x: 0, y: 0, w: pw, d: pd, pad: 30 }));
    out.push(pallet(P, { x: 0, y: 0, w: pw, d: pd }));
    for (let l = 0; l < layers; l++) {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
          out.push(box(P, { x: i * bw, y: j * bd, z: deck + l * bh, w: bw, d: bd, h: bh, tape: false, sw: 1.4 }) + flutes(P, { x: i * bw, y: j * bd, z: deck + l * bh, w: bw, d: bd, h: bh, n: 6 }));
        }
      }
    }
    out.push(card(900, 110, 620, 680));
    const x0 = 950;
    const y0 = 200;
    const k = 4.6; // px per 100 cm of pallet = 4.6 px/cm
    const PL = 120 * k;
    const PW = 100 * k;
    out.push(`<rect x="${x0}" y="${y0}" width="${PL}" height="${PW}" rx="8" fill="${C.wood[0]}" stroke="${C.k900}" stroke-width="4"/>`);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        const x = x0 + i * 40 * k;
        const y = y0 + j * 50 * k;
        out.push(`<rect x="${x + 3}" y="${y + 3}" width="${40 * k - 6}" height="${50 * k - 6}" rx="6" fill="${C.k300}" stroke="${C.k700}" stroke-width="3"/><line x1="${x + 20 * k}" y1="${y + 3}" x2="${x + 20 * k}" y2="${y + 50 * k - 3}" stroke="${C.k700}" stroke-width="2" opacity="0.5"/>`);
      }
    }
    out.push(dim(x0, y0 + PW + 40, x0 + PL, y0 + PW + 40));
    out.push(dim(x0 + PL + 40, y0, x0 + PL + 40, y0 + PW));
    out.push(text(x0 + PL / 2, y0 + PW + 100, 'per layer  x  layers', 34, { weight: 600, fill: C.ink500 }));
    return blog('Cartons stacked in columns on a pallet beside a top view of six cartons filling the pallet floor', out.join(''));
  },

  // Board types: a three-ply corrugated section, a five-ply section and a solid duplex section side by side
  'blog-p1-board-types': () => {
    const out = [];
    const cols = [
      { x: 90, label: 'corrugated', kind: 'c3' },
      { x: 590, label: 'double wall', kind: 'c5' },
      { x: 1090, label: 'duplex', kind: 'duplex' },
    ];
    for (const c of cols) {
      out.push(card(c.x, 140, 420, 620));
      if (c.kind === 'duplex') {
        const y = 330;
        out.push(`<rect x="${c.x + 40}" y="${y}" width="340" height="26" fill="${C.white}" stroke="${C.ink300}" stroke-width="3"/>`);
        out.push(`<rect x="${c.x + 40}" y="${y + 26}" width="340" height="86" fill="#C9CCC6" stroke="${C.ink300}" stroke-width="3"/>`);
        out.push(`<rect x="${c.x + 40}" y="${y + 112}" width="340" height="22" fill="#B7BBB4" stroke="${C.ink300}" stroke-width="3"/>`);
        for (let i = 0; i < 4; i++) out.push(`<line x1="${c.x + 40}" y1="${y + 40 + i * 20}" x2="${c.x + 380}" y2="${y + 40 + i * 20}" stroke="${C.ink300}" stroke-width="2" opacity="0.5"/>`);
      } else {
        const sec = boardSection({ x: c.x + 40, y: c.kind === 'c3' ? 340 : 300, w: 340, layers: c.kind === 'c3' ? 3 : 5, flute: 54, liner: 20, strokeW: 9 });
        out.push(sec.svg);
      }
      out.push(text(c.x + 210, 690, c.label, 44, { fill: C.ink800 }));
      out.push(bar(c.x + 110, 715, 200, 12, C.paper300));
    }
    return blog('Three board cross-sections side by side: single wall corrugated, double wall corrugated and solid duplex board', out.join(''));
  },

  // Cost worksheet: a parcel and a tape roll beside a worksheet of line bars that add up to a green total
  'blog-p1-cost-worksheet': () => {
    const out = [];
    out.push(parcel(330, 560, { dims: [300, 220, 170], maxW: 460, maxH: 340, label: true }));
    // tape roll
    out.push(`<g transform="translate(230 760)"><ellipse rx="70" ry="26" cy="14" fill="${C.k400}" opacity="0.5"/><ellipse rx="70" ry="26" fill="${C.k200}" stroke="${C.k700}" stroke-width="3"/><ellipse rx="34" ry="12" fill="${C.paper50}" stroke="${C.k700}" stroke-width="3"/></g>`);
    out.push(card(780, 100, 740, 700));
    const labels = [210, 300, 250, 330, 280, 240];
    for (let i = 0; i < 5; i++) {
      const y = 190 + i * 98;
      out.push(`<circle cx="850" cy="${y}" r="26" fill="${C.paper100}" stroke="${C.ink300}" stroke-width="3"/>`);
      out.push(bar(900, y - 12, labels[i], 24, C.ink300, 12));
      out.push(bar(1330, y - 16, 120, 32, C.paper100, 10));
      out.push(`<rect x="1330" y="${y - 16}" width="120" height="32" rx="10" fill="none" stroke="${C.paper300}" stroke-width="2"/>`);
    }
    out.push(`<line x1="830" y1="650" x2="1470" y2="650" stroke="${C.ink800}" stroke-width="4" stroke-linecap="round"/>`);
    out.push(`<rect x="830" y="676" width="640" height="82" rx="20" fill="${C.green600}"/>`);
    out.push(tick(880, 718, 1.1, C.white));
    out.push(bar(930, 706, 260, 24, '#DFF3E4', 12));
    out.push(bar(1290, 700, 140, 36, C.white, 12));
    return blog('A taped parcel and a roll of tape beside a worksheet of cost lines that add up to a green total row', out.join(''));
  },

  // Checklist: a taped, labelled parcel and a photo frame beside twelve ticked items in a grid
  'blog-p1-checklist': () => {
    const out = [];
    out.push(parcel(330, 600, { dims: [300, 230, 180], maxW: 460, maxH: 360, label: true }));
    // photo frame
    out.push(`<g transform="translate(250 190)"><rect x="-90" y="-62" width="180" height="124" rx="16" fill="${C.paper50}" stroke="${C.ink800}" stroke-width="6"/><circle cx="-36" cy="-18" r="14" fill="${C.green600}"/><polygon points="-76,46 -20,-4 20,30 44,10 78,46" fill="${C.green600}" opacity="0.85"/></g>`);
    out.push(card(780, 90, 740, 720));
    for (let i = 0; i < 12; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 850 + col * 340;
      const y = 180 + row * 106;
      out.push(`<rect x="${x - 28}" y="${y - 28}" width="56" height="56" rx="14" fill="${C.green600}"/>${tick(x, y, 0.75, C.white)}`);
      out.push(bar(x + 50, y - 10, 150 + ((i * 37) % 70), 20, C.ink300, 10));
    }
    return blog('A taped and labelled parcel with a photo frame beside a card of twelve ticked checklist items', out.join(''));
  },

  // Kesar mangoes: a ventilated carton with vent slots and a hand hole beside a top view of mangoes in a grid
  'blog-p1-kesar': () => {
    const out = [];
    const w = 330;
    const d = 230;
    const h = 170;
    const P = fitIso([0, 0, 0, w, d, h], { cx: 420, cy: 500, maxW: 600, maxH: 480 });
    const b = { x: 0, y: 0, z: 0, w, d, h };
    out.push(shadow(P, { ...b, pad: 20 }) + box(P, { ...b, tape: true }) + flutes(P, { ...b, n: 12 }));
    let vents = '';
    for (let i = 0; i < 6; i++) vents += `<rect x="${w * (0.12 + i * 0.075)}" y="${h * 0.2}" width="${w * 0.03}" height="${h * 0.32}" rx="${w * 0.015}" fill="${C.k900}" opacity="0.75"/>`;
    for (let i = 0; i < 6; i++) vents += `<rect x="${w * (0.58 + i * 0.05)}" y="${h * 0.2}" width="${w * 0.025}" height="${h * 0.32}" rx="${w * 0.012}" fill="${C.k900}" opacity="0.75"/>`;
    out.push(onFace(P, b, 'L', vents));
    out.push(onFace(P, b, 'R', `<rect x="${d * 0.34}" y="${h * 0.3}" width="${d * 0.32}" height="${h * 0.16}" rx="${h * 0.08}" fill="${C.k900}" opacity="0.8"/>`));
    out.push(card(900, 110, 620, 680));
    const mango = (cx, cy, rot = -25) => `<g transform="translate(${cx} ${cy}) rotate(${rot})"><ellipse rx="64" ry="42" fill="${AMBER}" stroke="${AMBER_DARK}" stroke-width="5"/><ellipse rx="26" ry="14" cx="-14" cy="-10" fill="#F5CE82" opacity="0.7"/><path d="M 56 -10 q 28 -26 44 -8 q -12 22 -44 8 z" fill="${C.green600}" stroke="${C.green700}" stroke-width="3" stroke-linejoin="round"/></g>`;
    const x0 = 950;
    const y0 = 190;
    out.push(`<rect x="${x0}" y="${y0}" width="520" height="470" rx="16" fill="${C.paper100}" stroke="${C.k700}" stroke-width="5"/>`);
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 3; j++) out.push(mango(x0 + 130 + i * 250, y0 + 105 + j * 130, i ? -18 : -28));
    }
    out.push(bar(x0, y0 + 520, 150, 22, C.green600, 11));
    out.push(bar(x0 + 170, y0 + 520, 150, 22, C.green600, 11));
    out.push(bar(x0 + 340, y0 + 520, 180, 22, C.paper300, 11));
    return blog('A ventilated produce carton with vent slots and a hand hole beside a top view of mangoes laid in a grid', out.join(''));
  },

  // Jars: a jar sealed inside a bag outline beside a top view of six jars with cushioning in a carton
  'blog-p1-jars': () => {
    const out = [];
    out.push(card(100, 150, 620, 600));
    // jar in a dashed bag
    out.push(dashed(240, 220, 340, 460, 40));
    out.push(`<g transform="translate(410 460)"><rect x="-90" y="-120" width="180" height="240" rx="30" fill="${C.paper50}" stroke="${C.ink800}" stroke-width="7"/><rect x="-100" y="-160" width="200" height="52" rx="14" fill="${C.green600}" stroke="${C.green700}" stroke-width="5"/><rect x="-60" y="-50" width="120" height="110" rx="14" fill="${AMBER}" opacity="0.8"/><ellipse cx="-30" cy="-84" rx="16" ry="8" fill="${C.white}" opacity="0.7"/></g>`);
    for (let i = 0; i < 6; i++) out.push(`<circle cx="${264 + i * 56}" cy="${704 - ((i % 2) * 8)}" r="18" fill="none" stroke="${C.green600}" stroke-width="4" opacity="0.7"/>`);
    out.push(`<circle cx="620" cy="250" r="34" fill="${C.green600}"/>${tick(620, 250, 0.8, C.white)}`);
    // top view of the carton grid
    out.push(card(820, 110, 700, 680));
    const x0 = 880;
    const y0 = 200;
    const cw = 580;
    const ch = 400;
    out.push(`<rect x="${x0}" y="${y0}" width="${cw}" height="${ch}" rx="14" fill="${C.k300}" stroke="${C.k700}" stroke-width="6"/>`);
    out.push(`<rect x="${x0 + 14}" y="${y0 + 14}" width="${cw - 28}" height="${ch - 28}" rx="8" fill="${C.paper100}"/>`);
    const r = 62;
    const gap = (cw - 28 - 3 * r * 2) / 4;
    const gapY = (ch - 28 - 2 * r * 2) / 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        const cx = x0 + 14 + gap * (i + 1) + r * (2 * i + 1);
        const cy = y0 + 14 + gapY * (j + 1) + r * (2 * j + 1);
        out.push(`<circle cx="${cx}" cy="${cy}" r="${r + 10}" fill="none" stroke="${C.green600}" stroke-width="4" stroke-dasharray="10 9" opacity="0.8"/>`);
        out.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.white}" stroke="${C.ink800}" stroke-width="6"/><circle cx="${cx}" cy="${cy}" r="${r - 26}" fill="${C.green600}" opacity="0.9"/>`);
      }
    }
    out.push(dim(x0, y0 + ch + 50, x0 + cw, y0 + ch + 50));
    out.push(text(x0 + cw / 2, y0 + ch + 112, 'jar + cushion + jar', 32, { weight: 600, fill: C.ink500 }));
    return blog('A sealed jar inside a dashed bag outline beside a top view of six jars each ringed by cushioning in a carton', out.join(''));
  },
};
