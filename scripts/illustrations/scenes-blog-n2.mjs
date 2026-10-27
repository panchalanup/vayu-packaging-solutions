/**
 * Blog thumbnails for the buying and technical guides (16:9, 1600×900): order steps, minimum order, marketplace seller
 * packing, weight capacity, reading a spec line, cost examples. Same restrained palette and helpers as
 * scenes-blog-phase2b.mjs: isometric kraft boxes, paper cards, one green accent. No numbers are drawn that could be
 * read as a price or a rating; the only text is labels such as ply names. Drawn from primitives (no third-party
 * artwork, no brands).
 * SECURITY: build-time only; output is static, script-free SVG.
 */
import { C, fitIso, box, flutes, shadow, svg, boardSection } from './lib.mjs';

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

const WHITE_BOX = { top: C.white, left: '#EFE8DA', right: '#DDD3C0', stroke: C.ink300 };
const GREEN_BOX = { top: C.green500, left: C.green600, right: C.green700, stroke: C.green700 };

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
function parcel(cx, cy, { dims = [220, 160, 130], colours = {}, maxW = 260, maxH = 190, tape = true, label = false, logo = false } = {}) {
  const [w, d, h] = dims;
  const P = fitIso([0, 0, 0, w, d, h], { cx, cy, maxW, maxH });
  const b = { x: 0, y: 0, z: 0, w, d, h };
  let out = shadow(P, { ...b, pad: 14 }) + box(P, { ...b, ...colours, tape }) + (colours.top ? '' : flutes(P, { ...b, n: 10 }));
  if (label) out += onFace(P, b, 'L', `<rect x="${w * 0.16}" y="${h * 0.2}" width="${w * 0.42}" height="${h * 0.46}" rx="${h * 0.04}" fill="${C.white}" stroke="${C.ink300}" stroke-width="2"/><rect x="${w * 0.2}" y="${h * 0.3}" width="${w * 0.3}" height="${h * 0.05}" fill="${C.ink800}"/><rect x="${w * 0.2}" y="${h * 0.42}" width="${w * 0.22}" height="${h * 0.04}" fill="${C.ink300}"/><rect x="${w * 0.2}" y="${h * 0.52}" width="${w * 0.26}" height="${h * 0.04}" fill="${C.ink300}"/>`);
  if (logo) out += onFace(P, b, 'L', `<circle cx="${w * 0.5}" cy="${h * 0.5}" r="${Math.min(w, h) * 0.2}" fill="${C.paper50}"/><polygon points="${w * 0.5},${h * 0.34} ${w * 0.56},${h * 0.5} ${w * 0.5},${h * 0.66} ${w * 0.44},${h * 0.5}" fill="${C.green600}"/>`);
  return out;
}

export const blogN2Scenes = {
  // How to order: a printed box beside nine numbered steps that end in a tick
  'blog-n2-order': () => {
    const out = [];
    out.push(parcel(470, 470, { dims: [300, 220, 190], colours: GREEN_BOX, maxW: 700, maxH: 520, tape: false, logo: true }));
    out.push(card(900, 120, 640, 660));
    const pts = [];
    for (let i = 0; i < 9; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = 1020 + (row % 2 === 0 ? col : 2 - col) * 200;
      const y = 250 + row * 210;
      pts.push([x, y]);
    }
    out.push(`<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${C.paper300}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`);
    pts.forEach(([x, y], i) => {
      const last = i === 8;
      out.push(`<circle cx="${x}" cy="${y}" r="48" fill="${last ? C.green600 : C.paper100}" stroke="${last ? C.green700 : C.ink300}" stroke-width="4"/>`);
      out.push(last ? tick(x, y, 1.15, C.white) : text(x, y + 14, String(i + 1), 42, { fill: C.ink800 }));
    });
    return blog('A printed green box beside a path of nine numbered steps that ends in a tick', out.join(''));
  },

  // Minimum order: stacks of flat boxes, and a falling per-box curve with four quantity dots and a minimum marker
  'blog-n2-moq': () => {
    const out = [];
    // growing stacks of boxes on the left
    const stack = (cx, cy, n) => {
      let s = '';
      for (let i = 0; i < n; i++) s += parcel(cx, cy - i * 44, { dims: [260, 190, 34], maxW: 300, maxH: 120, tape: false });
      return s;
    };
    out.push(stack(250, 700, 2));
    out.push(stack(440, 640, 4));
    out.push(stack(630, 580, 6));
    // curve card
    out.push(card(820, 110, 700, 680));
    const ax = 900;
    const ay = 700;
    out.push(`<line x1="${ax}" y1="${ay}" x2="1470" y2="${ay}" stroke="${C.ink300}" stroke-width="4" stroke-linecap="round"/><line x1="${ax}" y1="${ay}" x2="${ax}" y2="190" stroke="${C.ink300}" stroke-width="4" stroke-linecap="round"/>`);
    const dots = [[960, 290], [1110, 440], [1260, 500], [1410, 540]];
    const path = `M ${dots[0][0]} ${dots[0][1]} C 1030 290, 1050 430, 1110 440 S 1200 495, 1260 500 S 1360 538, 1410 540`;
    out.push(`<path d="${path}" fill="none" stroke="${C.green600}" stroke-width="9" stroke-linecap="round"/>`);
    // minimum marker at the second dot
    out.push(`<line x1="1110" y1="${ay}" x2="1110" y2="230" stroke="${C.green600}" stroke-width="4" stroke-dasharray="12 12" opacity="0.7"/>`);
    out.push(`<rect x="1110" y="214" width="190" height="44" rx="10" fill="${C.green600}"/><text x="1205" y="245" ${FONT} font-size="26" font-weight="700" fill="${C.white}" text-anchor="middle">minimum</text>`);
    ['100', '500', '1,000', '5,000'].forEach((label, i) => {
      const [x, y] = dots[i];
      out.push(`<circle cx="${x}" cy="${y}" r="20" fill="${i === 1 ? C.green600 : C.paper50}" stroke="${C.green600}" stroke-width="6"/>`);
      out.push(text(x, ay + 54, label, 30, { weight: 600, fill: C.ink500 }));
    });
    out.push(text(ax - 20, 150, 'price per box', 28, { weight: 600, fill: C.ink500, anchor: 'start' }));
    return blog('Stacks of flat boxes growing in size beside a curve that falls as order quantity rises, with a minimum marker', out.join(''));
  },

  // Marketplace seller packing: three parcels of different sizes with tape and labels, and a checklist card
  'blog-n2-marketplace': () => {
    const out = [];
    out.push(parcel(250, 640, { dims: [300, 230, 60], maxW: 360, maxH: 150, label: true }));
    out.push(parcel(520, 560, { dims: [230, 190, 150], maxW: 320, maxH: 250, label: true }));
    out.push(parcel(360, 330, { dims: [170, 150, 230], maxW: 260, maxH: 300, label: true, colours: WHITE_BOX, tape: false }));
    out.push(card(860, 110, 660, 680));
    ['Right-size box', 'Matching board', 'Sealed seam', 'Label area', 'Return plan'].forEach((label, i) => {
      const y = 210 + i * 118;
      out.push(`<circle cx="940" cy="${y}" r="36" fill="${C.green600}"/>${tick(940, y, 0.9, C.white)}`);
      out.push(text(1000, y + 13, label, 38, { anchor: 'start', weight: 600 }));
      out.push(bar(1000, y + 34, 220 + ((i * 53) % 120), 12, C.paper300));
    });
    return blog('Three taped parcels with shipping labels beside a five-item packing checklist with ticks', out.join(''));
  },

  // Weight capacity: a stack of boxes with a downward arrow, and three bars that grow with 3, 5 and 7-ply
  'blog-n2-capacity': () => {
    const out = [];
    const base = [320, 700];
    for (let i = 0; i < 4; i++) out.push(parcel(base[0], base[1] - i * 128, { dims: [300, 220, 110], maxW: 440, maxH: 220, tape: false }));
    out.push(arrow(320, 120, 320, 205, C.green600, 10));
    out.push(card(760, 110, 760, 680));
    const rows = [
      { layers: 3, label: '3-ply', w: 160 },
      { layers: 5, label: '5-ply', w: 330 },
      { layers: 7, label: '7-ply', w: 520 },
    ];
    rows.forEach((r, i) => {
      const y = 250 + i * 190;
      out.push(text(830, y + 36, r.label, 40, { anchor: 'start' }));
      out.push(`<rect x="1010" y="${y}" width="440" height="56" rx="28" fill="${C.paper100}" stroke="${C.paper300}" stroke-width="2"/>`);
      out.push(bar(1010, y, r.w * (440 / 520), 56, C.green600));
      const sec = boardSection({ x: 830, y: y + 80, w: 120, layers: r.layers, flute: 10, liner: 4, strokeW: 3 });
      out.push(sec.svg);
    });
    return blog('A stack of four boxes with a downward arrow beside bars that grow from 3-ply to 5-ply to 7-ply board', out.join(''));
  },

  // Reading a spec: a spec tag with three callouts pointing at the layers of a 5-ply board section
  'blog-n2-spec': () => {
    const out = [];
    out.push(card(110, 170, 760, 560));
    out.push(text(160, 290, 'BOX SPEC', 30, { anchor: 'start', weight: 600, fill: C.ink500 }));
    const items = [
      ['5 PLY', 'layers'],
      ['18 BF', 'strength per weight'],
      ['120 GSM', 'paper weight'],
    ];
    items.forEach(([big, small], i) => {
      const y = 400 + i * 120;
      out.push(`<rect x="160" y="${y - 62}" width="660" height="96" rx="20" fill="${i === 0 ? C.green600 : C.paper100}" stroke="${i === 0 ? C.green700 : C.paper300}" stroke-width="2"/>`);
      out.push(text(200, y + 8, big, 52, { anchor: 'start', fill: i === 0 ? C.white : C.ink800 }));
      out.push(text(790, y + 6, small, 28, { anchor: 'end', weight: 600, fill: i === 0 ? '#DFF3E4' : C.ink500 }));
    });
    // board section on the right
    out.push(card(980, 170, 520, 560));
    const sec = boardSection({ x: 1030, y: 340, w: 420, layers: 5, flute: 100, liner: 24, strokeW: 12 });
    out.push(sec.svg);
    out.push(text(1240, 220, 'one 5-ply board', 30, { weight: 600, fill: C.ink500 }));
    out.push(`<g stroke="${C.green600}" stroke-width="5" stroke-linecap="round" fill="none"><line x1="830" y1="338" x2="1020" y2="352"/><line x1="830" y1="458" x2="1020" y2="476"/><line x1="830" y1="578" x2="1020" y2="600"/></g>`);
    [[1020, 352], [1020, 476], [1020, 600]].forEach(([x, y]) => out.push(`<circle cx="${x}" cy="${y}" r="9" fill="${C.green600}"/>`));
    return blog('A spec tag reading 5 ply, 18 BF and 120 GSM with lines pointing to the layers of a five-layer corrugated board', out.join(''));
  },

  // Cost examples: three boxes of growing size beside three price-range bars (no figures)
  'blog-n2-cost': () => {
    const out = [];
    out.push(parcel(240, 640, { dims: [200, 150, 110], maxW: 260, maxH: 170 }));
    out.push(parcel(480, 520, { dims: [260, 190, 180], maxW: 330, maxH: 250 }));
    out.push(parcel(310, 330, { dims: [340, 250, 250], maxW: 420, maxH: 330 }));
    out.push(card(860, 110, 660, 680));
    out.push(text(910, 190, 'estimate range', 30, { anchor: 'start', weight: 600, fill: C.ink500 }));
    const rows = [
      { x: 1010, w: 110 },
      { x: 1080, w: 220 },
      { x: 1190, w: 330 },
    ];
    rows.forEach((r, i) => {
      const y = 290 + i * 160;
      out.push(`<rect x="920" y="${y}" width="540" height="64" rx="32" fill="${C.paper100}" stroke="${C.paper300}" stroke-width="2"/>`);
      const x0 = 940 + (r.x - 1010) * 0.55;
      out.push(`<rect x="${x0}" y="${y + 10}" width="${r.w * 0.8}" height="44" rx="22" fill="${C.green600}" opacity="0.28"/>`);
      out.push(`<rect x="${x0 + r.w * 0.2}" y="${y + 18}" width="${r.w * 0.4}" height="28" rx="14" fill="${C.green600}"/>`);
    });
    out.push(`<g transform="translate(1390 190)"><circle r="44" fill="${C.green600}"/><text y="18" ${FONT} font-size="54" font-weight="700" fill="${C.white}" text-anchor="middle">&#8377;</text></g>`);
    return blog('Three boxes of growing size beside three bars showing price ranges that widen with box size', out.join(''));
  },
};
