/**
 * Kit v2 scenes: 5-ply cartons and packaging supplies (BOPP tape, stretch film, bubble wrap, PP strapping, and the
 * combined supplies image used by the home Range). Real sizes in centimetres.
 */
import { PALLET_H, blobShadow, bmcStamp, carton, cylinderZ, doc, fit, flapEdge, isoCircle, loupe, markRow, openCarton, pallet, plane, proj, pts, r, render, shade, shadow, shippingLabel } from './kit.mjs';
import { cylinder, rollCap, slab, strap, stretchWrap } from './kit-goods.mjs';
import { fragileTape } from './art.mjs';
import { DEEP } from './scenes-v2.mjs';

const r3 = (n) => Math.round(n * 1000) / 1000;
const TAPE = '#C38B4E';
const CLEAR = '#E9E2CF';
const FILM = '#DCE9EE';
const STRAP = '#2F6DA8';

/** Tape roll standing on its edge (axis y), with the loose end lying on the floor towards +x */
function tapeRollStanding(D, P, [x, y], { R = 5.6, core = 3.8, w = 4.8, color = TAPE, print, tail = 16 } = {}) {
  let s = '';
  if (tail) {
    const q = proj(P, [[x, y, 0.05], [x + tail, y, 0.05], [x + tail, y + w, 0.05], [x, y + w, 0.05]]);
    s += `<polygon points="${pts(q)}" fill="${D.lin(q[0], q[1], [[0, shade(color, -0.05), 0.95], [1, shade(color, 0.2), 0.8]])}"/>`;
    if (print) s += `<g transform="${plane(P, [x, y, 0.06], [1, 0, 0], [0, 1, 0])}">${print(tail, w)}</g>`;
    s += `<line x1="${r(q[1][0])}" y1="${r(q[1][1])}" x2="${r(q[2][0])}" y2="${r(q[2][1])}" stroke="${shade(color, -0.4)}" stroke-width="0.8" stroke-dasharray="2 1.4" opacity="0.6"/>`;
  }
  s += blobShadow(D, P, [x, y + w / 2, 0], R * 0.7, { h: R, op: 0.22 });
  s += cylinder(D, P, [x, y, R], 'y', R, w, { color, cap: (rr) => rollCap(rr, core, { color, coreColor: '#B98C5A', hole: '#EDE6DA', rings: 10 }) });
  return s;
}

/** Tape roll lying flat (axis z): glossy wound side, layered top with the cardboard core */
function flatTapeRoll(D, P, [x, y], { R = 5.6, core = 3.8, w = 4.8, color = CLEAR } = {}) {
  const [rx, ry] = isoCircle(P, R);
  const [crx, cry] = isoCircle(P, core);
  const [cx, cy] = P(x, y, w);
  let s = blobShadow(D, P, [x, y, 0], R, { h: w, op: 0.2 });
  s += cylinderZ(D, P, [x, y, 0], R, w, { color, topOn: false });
  s += `<ellipse cx="${r(cx)}" cy="${r(cy)}" rx="${r(rx)}" ry="${r(ry)}" fill="${D.lin([cx - rx, cy - ry], [cx + rx, cy + ry], [[0, shade(color, 0.4)], [1, shade(color, -0.04)]])}"/>`;
  for (let i = 1; i < 8; i++) s += `<ellipse cx="${r(cx)}" cy="${r(cy)}" rx="${r(crx + ((rx - crx) * i) / 8)}" ry="${r(cry + ((ry - cry) * i) / 8)}" fill="none" stroke="${shade(color, i % 2 ? -0.18 : 0.2)}" stroke-width="0.8" opacity="0.6"/>`;
  s += `<ellipse cx="${r(cx)}" cy="${r(cy)}" rx="${r(crx)}" ry="${r(cry)}" fill="#B98C5A"/><ellipse cx="${r(cx)}" cy="${r(cy + 1.5)}" rx="${r(crx * 0.86)}" ry="${r(cry * 0.86)}" fill="#EAE2D5"/>`;
  return s;
}

/** Hand roll of stretch film lying along x: translucent film over a cardboard core that sticks out at both ends */
function filmRoll(D, P, [x, y, z], L, { R = 5.4, core = 2.5 } = {}) {
  const c = [x, y, z + R];
  let s = blobShadow(D, P, [x + L / 2, y, z], R * 1.4, { h: R, op: 0.18 });
  s += cylinder(D, P, [x - 2, y, z + R], 'x', core, L + 4, { color: '#B98C5A', outline: false, cap: (rr) => `<circle r="${rr}" fill="#C9A174"/><circle r="${rr * 0.7}" fill="#3B2E22"/>` });
  s += cylinder(D, P, c, 'x', R, L, {
    color: FILM,
    cap: (rr) => rollCap(rr, core, { color: '#E4EEF1', coreColor: '#B98C5A', hole: '#3B2E22', rings: 8, op: 0.9 }),
    sideFill: D.lin(P(x, y, z + R * 2), P(x, y, z), [[0, '#FFFFFF', 0.8], [0.18, '#F2F8FA', 0.6], [0.5, '#D6E5EA', 0.5], [0.8, '#B9CDD4', 0.7], [1, '#93A9B1', 0.9]]),
  });
  // specular streak and the core seen through the film
  const a = P(x + 2, y + R * 0.5, z + R * 1.75);
  const b = P(x + L - 2, y + R * 0.5, z + R * 1.75);
  s += `<line x1="${r(a[0])}" y1="${r(a[1])}" x2="${r(b[0])}" y2="${r(b[1])}" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity="0.85"/>`;
  s += cylinder(D, P, [x + L, y, z + R], 'x', core, 2, { color: '#B98C5A', outline: false, cap: (rr) => `<circle r="${rr}" fill="#C9A174"/><circle r="${rr * 0.7}" fill="#3B2E22"/>` });
  return s;
}

/** Bubble wrap texture (local units): rows of bubbles with a highlight each */
function bubbles(w, h, cell = 1.25) {
  let s = '';
  for (let j = 0, y = cell / 2; y < h; j++, y += cell * 0.87) {
    for (let x = (j % 2 ? cell : cell / 2); x < w; x += cell) {
      s += `<circle cx="${r3(x)}" cy="${r3(y)}" r="${r3(cell * 0.4)}" fill="#FFFFFF" fill-opacity="0.32" stroke="#9FB8C2" stroke-opacity="0.55" stroke-width="${r3(cell * 0.05)}"/><circle cx="${r3(x - cell * 0.13)}" cy="${r3(y - cell * 0.13)}" r="${r3(cell * 0.1)}" fill="#fff" fill-opacity="0.9"/>`;
    }
  }
  return s;
}

/** Bubble-wrap roll standing upright (axis z): milky side with bubble rows, spiral layers on top */
function bubbleRoll(D, P, [x, y], { R = 13, H = 50 } = {}) {
  const [rx, ry] = isoCircle(P, R);
  const [cx, cyB] = P(x, y, 0);
  const cyT = cyB - H * P.s;
  const clip = D.id('c');
  const side = `M${r(cx - rx)} ${r(cyT)}V${r(cyB)}A${r(rx)} ${r(ry)} 0 0 0 ${r(cx + rx)} ${r(cyB)}V${r(cyT)}Z`;
  D.def(`<clipPath id="${clip}"><path d="${side}"/></clipPath>`);
  const cell = 1.2 * P.s;
  const pat = D.id('p');
  D.def(`<pattern id="${pat}" patternUnits="userSpaceOnUse" width="${r(cell * 1.8)}" height="${r(cell * 1.56)}"><circle cx="${r(cell * 0.45)}" cy="${r(cell * 0.4)}" r="${r(cell * 0.36)}" fill="#fff" fill-opacity="0.35" stroke="#93AEB9" stroke-opacity="0.5" stroke-width="0.6"/><circle cx="${r(cell * 1.35)}" cy="${r(cell * 1.18)}" r="${r(cell * 0.36)}" fill="#fff" fill-opacity="0.35" stroke="#93AEB9" stroke-opacity="0.5" stroke-width="0.6"/><circle cx="${r(cell * 0.33)}" cy="${r(cell * 0.28)}" r="${r(cell * 0.09)}" fill="#fff"/><circle cx="${r(cell * 1.23)}" cy="${r(cell * 1.06)}" r="${r(cell * 0.09)}" fill="#fff"/></pattern>`);
  let s = blobShadow(D, P, [x, y, 0], R, { h: H * 0.6, op: 0.2 });
  s += `<path d="${side}" fill="${D.lin([cx - rx, 0], [cx + rx, 0], [[0, '#C9DBE2', 0.9], [0.3, '#F4F9FA', 0.85], [0.6, '#DCE9EE', 0.8], [1, '#A9C1CA', 0.92]])}"/>`;
  s += `<g clip-path="url(#${clip})"><rect x="${r(cx - rx)}" y="${r(cyT - ry)}" width="${r(rx * 2)}" height="${r(cyB - cyT + ry * 2)}" fill="url(#${pat})"/>`;
  // the overlapping edge of the outer layer, spiralling down the roll
  s += `<path d="M${r(cx + rx * 0.25)} ${r(cyT)}V${r(cyB + ry * 0.97)}" stroke="#fff" stroke-width="3" opacity="0.6"/><path d="M${r(cx - rx * 0.55)} ${r(cyT + 4)}V${r(cyB + ry * 0.6)}" stroke="#fff" stroke-width="7" opacity="0.35"/></g>`;
  s += `<ellipse cx="${r(cx)}" cy="${r(cyT)}" rx="${r(rx)}" ry="${r(ry)}" fill="#EEF4F6"/>`;
  for (let i = 1; i < 7; i++) s += `<ellipse cx="${r(cx)}" cy="${r(cyT)}" rx="${r(rx * (0.36 + i * 0.1))}" ry="${r(ry * (0.36 + i * 0.1))}" fill="none" stroke="#9FB8C2" stroke-width="0.9" opacity="0.55"/>`;
  s += `<ellipse cx="${r(cx)}" cy="${r(cyT)}" rx="${r(rx * 0.3)}" ry="${r(ry * 0.3)}" fill="#B98C5A"/><ellipse cx="${r(cx)}" cy="${r(cyT)}" rx="${r(rx * 0.25)}" ry="${r(ry * 0.25)}" fill="#3B2E22"/>`;
  s += `<path d="${side}" fill="none" stroke="#7F99A3" stroke-width="0.9" stroke-opacity="0.5"/>`;
  return s;
}

/** Strap coil lying flat (axis z): a wide ring of wound strap on a paper core */
function strapCoil(D, P, [x, y], { R = 20, core = 10, H = 1.6, color = STRAP } = {}) {
  let s = blobShadow(D, P, [x, y, 0], R * 0.95, { h: 2, op: 0.22 });
  s += cylinderZ(D, P, [x, y, 0], R, H, { color, topOn: false });
  const [cx, cy] = P(x, y, H);
  const [rx, ry] = isoCircle(P, R);
  const [crx, cry] = isoCircle(P, core);
  s += `<ellipse cx="${r(cx)}" cy="${r(cy)}" rx="${r(rx)}" ry="${r(ry)}" fill="${D.lin([cx - rx, cy - ry], [cx + rx, cy + ry], [[0, shade(color, 0.35)], [1, shade(color, -0.05)]])}"/>`;
  for (let i = 1; i < 16; i++) {
    const k = core / R + ((1 - core / R) * i) / 16;
    s += `<ellipse cx="${r(cx)}" cy="${r(cy)}" rx="${r(rx * k)}" ry="${r(ry * k)}" fill="none" stroke="${shade(color, i % 2 ? -0.25 : 0.25)}" stroke-width="0.8" opacity="0.6"/>`;
  }
  s += `<ellipse cx="${r(cx)}" cy="${r(cy)}" rx="${r(crx)}" ry="${r(cry)}" fill="#C6A57A"/><ellipse cx="${r(cx)}" cy="${r(cy + 2)}" rx="${r(crx * 0.9)}" ry="${r(cry * 0.9)}" fill="#E6DDD0"/>`;
  return s;
}

/** Small open box of metal strap seals */
function sealBox(D, P, b) {
  const { x, y, w, d, h } = b;
  let s = shadow(D, P, b, { op: 0.14 });
  const seals = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) seals.push([x + 1.4 + i * (w - 2.8) / 3.4, y + 1.6 + j * (d - 3) / 2.6]);
  const inner = seals.map(([sx, sy]) => `<g transform="${plane(P, [sx, sy, h - 1.4], [1, 0, 0], [0, 1, 0])}"><rect width="2.2" height="1.4" rx="0.2" fill="#C5CDD2"/><rect y="0.9" width="2.2" height="0.5" fill="#8C979E"/></g>`).join('');
  s += openCarton(D, P, b, { flaps: false, color: '#D8C9AE', inner: '#CBB894', t: 0.25, contents: inner });
  return s;
}

export const v2SupplyScenes = {
  'product-5-ply': () => {
    const D = doc('product-5-ply');
    const P = fit([-4, 0, 0, 104, 82, 70], { cy: 425, maxW: 700, maxH: 600 });
    const A = { x: 0, y: 4, z: 0, w: 48, d: 38, h: 36 };
    const A2 = { x: 3, y: 6, z: 36, w: 42, d: 34, h: 30 };
    const O = { x: 56, y: 10, z: 0, w: 46, d: 36, h: 34 };
    const F = { x: -2, y: 50, z: 0, w: 40, d: 30, h: 26 };
    const body = [
      shadow(D, P, { ...A, h: 66 }, { op: 0.18 }),
      shadow(D, P, O, { op: 0.16 }),
      shadow(D, P, F),
      carton(D, P, A, { color: DEEP, decor: { right: bmcStamp(10, 24, 6, ['5 PLY', 'B+C FLUTE']) } }),
      shadow(D, P, A2, { op: 0.1, contact: 0.3 }),
      carton(D, P, A2, { color: DEEP, seamAlong: 'y', decor: { left: `<g transform="translate(3 3)">${markRow(['up', 'dry', 'stack'], 3.6)}</g>` } }),
      openCarton(D, P, O, { color: DEEP, inner: '#C9A577', walls: 2, t: 0.75 }),
      carton(D, P, F, { color: DEEP, decor: { left: `<g transform="translate(3 3)">${markRow(['up', 'fragile'], 3.4)}</g><g transform="translate(26 6)">${shippingLabel(10.5, 14.5, 9)}</g>` } }),
      loupe(D, { cx: 858, cy: 668, R: 86, walls: 2, from: flapEdge(P, O, 0.6), color: DEEP, label: '5-PLY · DOUBLE WALL' }),
    ];
    return render(D, {
      title: 'Double-wall 5-ply corrugated cartons stacked, with one open',
      desc: 'Heavy double-wall (5-ply, B+C flute) corrugated cartons stacked for warehouse storage, one open to show the thicker board, with handling marks and a box maker stamp. A magnifier shows the two fluted walls between three liners.',
      body: body.join('\n'),
    });
  },

  'product-bopp-tape': () => {
    const D = doc('product-bopp-tape');
    const P = fit([-10, -18, 0, 54, 30, 22], { cx: 556, cy: 445, maxW: 700, maxH: 580 });
    const C = { x: 20, y: -18, z: 0, w: 34, d: 26, h: 22 };
    const body = [
      shadow(D, P, C, { op: 0.15 }),
      carton(D, P, C, { tapeColor: TAPE, decor: { left: `<g transform="translate(3 3)">${markRow(['up', 'fragile'], 3.2)}</g>` } }),
      tapeRollStanding(D, P, [-6, 2], { color: '#E9DCC0', print: (l, w) => fragileTape(l, w), tail: 20, core: 3.8 }),
      flatTapeRoll(D, P, [26, 20], { color: CLEAR }),
      tapeRollStanding(D, P, [4, 18], { color: TAPE, tail: 24 }),
    ];
    return render(D, {
      title: 'Rolls of BOPP packing tape in brown, clear and printed FRAGILE',
      desc: 'BOPP self-adhesive packing tape rolls on 3-inch cardboard cores, brown, clear and printed FRAGILE, with loose ends pulled out, beside a corrugated carton sealed with brown tape.',
      body: body.join('\n'),
    });
  },

  'product-stretch-film': () => {
    const D = doc('product-stretch-film');
    const P = fit([0, 0, 0, 80, 78, PALLET_H + 48], { cx: 570, cy: 430, maxW: 640, maxH: 600 });
    const L = { x: 0, y: 0, z: PALLET_H, w: 80, d: 60, h: 48 };
    const boxes = [];
    for (const z of [0, 24]) for (const [x, y] of [[0, 0], [40, 0], [0, 30], [40, 30]]) boxes.push({ x, y, z: PALLET_H + z, w: 40, d: 30, h: 24 });
    const body = [
      shadow(D, P, { x: 0, y: 0, w: 80, d: 60, h: PALLET_H + 48 }, { op: 0.2 }),
      pallet(D, P, { x: 0, y: 0, w: 80, d: 60 }),
      ...boxes.map((b) => carton(D, P, b, { tape: false, decor: { left: `<g transform="translate(2.5 2.5)">${markRow(['up'], 3)}</g>` } })),
      stretchWrap(D, P, L, { from: -6 }),
      filmRoll(D, P, [14, 70, 0], 50),
    ];
    return render(D, {
      title: 'Pallet of cartons wrapped in stretch film, with a hand roll of stretch film',
      desc: 'A pallet load of corrugated cartons wrapped in clear LLDPE stretch film to hold it together in transit, with a hand roll of stretch film on a cardboard core in front.',
      body: body.join('\n'),
    });
  },

  'product-bubble-wrap': () => {
    const D = doc('product-bubble-wrap');
    const P = fit([-13, -14, 0, 56, 48, 50], { cy: 430, maxW: 640, maxH: 600 });
    const sheet = `<rect width="40" height="28" rx="0.5" fill="#E6F0F3" opacity="0.6"/>${bubbles(40, 28, 2)}`;
    const C = { x: 22, y: -14, z: 0, w: 34, d: 26, h: 22 };
    const body = [
      shadow(D, P, C, { op: 0.14 }),
      carton(D, P, C, { decor: { left: `<g transform="translate(3 3)">${markRow(['fragile', 'up'], 3)}</g>` } }),
      bubbleRoll(D, P, [0, 0], { R: 13, H: 50 }),
      slab(P, [8, 18, 0], sheet, { thick: 0.7, side: '#B8CCD3', rot: -8, outline: '<rect width="40" height="28" rx="0.5"/>' }),
    ];
    return render(D, {
      title: 'Bubble wrap roll and an unrolled sheet of bubble wrap',
      desc: 'A tall roll of air bubble wrap on a paper core with a sheet unrolled in front, showing the rows of air cushions, beside a carton marked fragile.',
      body: body.join('\n'),
    });
  },

  'product-pp-strapping': () => {
    const D = doc('product-pp-strapping');
    const P = fit([-20, -20, 0, 72, 33, 34], { cx: 558, cy: 450, maxW: 700, maxH: 600 });
    const C = { x: 26, y: -20, z: 0, w: 46, d: 34, h: 32 };
    const body = [
      shadow(D, P, C, { op: 0.16 }),
      carton(D, P, C, { tape: false, decor: { left: `<g transform="translate(3 3)">${markRow(['up', 'dry'], 3.4)}</g>` } }),
      strap(D, P, C, { along: 'y', at: 38, color: STRAP, width: 1.4 }),
      strap(D, P, C, { along: 'y', at: 60, color: STRAP, width: 1.4 }),
      strapCoil(D, P, [0, 10], { R: 20, core: 10 }),
      sealBox(D, P, { x: 24, y: 22, z: 0, w: 12, d: 9, h: 5 }),
    ];
    return render(D, {
      title: 'Coil of PP strapping, metal seals and a carton strapped with PP straps',
      desc: 'A coil of polypropylene (PP) strapping on a paper core, a small box of metal strap seals, and a corrugated carton secured with two PP straps and seals.',
      body: body.join('\n'),
    });
  },

  'product-supplies': () => {
    const D = doc('product-supplies');
    const P = fit([-24, -20, 0, 52, 44, 46], { cy: 440, maxW: 700, maxH: 620 });
    const body = [
      bubbleRoll(D, P, [-8, -8], { R: 12, H: 46 }),
      strapCoil(D, P, [-8, 28], { R: 15, core: 7.5 }),
      filmRoll(D, P, [6, 8, 0], 42),
      tapeRollStanding(D, P, [24, 30], { color: TAPE, tail: 20 }),
      tapeRollStanding(D, P, [38, 20], { color: '#E9DCC0', print: (l, w) => fragileTape(l, w), tail: 14 }),
    ];
    return render(D, {
      title: 'Packaging supplies: BOPP tape, stretch film, bubble wrap and PP strapping',
      desc: 'Packaging consumables stocked for dispatch: brown and printed BOPP tape rolls, a stretch film roll, a bubble wrap roll and a coil of PP strapping.',
      body: body.join('\n'),
    });
  },
};
