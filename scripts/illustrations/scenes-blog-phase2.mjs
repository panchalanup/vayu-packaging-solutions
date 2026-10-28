/**
 * Blog thumbnails for the phase 2 "Use Cases" articles (16:9, 1600×900): produce cartons, fruit packs, clothing and
 * footwear, cake and sweet boxes, takeaway and pizza boxes. Same restrained palette and helpers as
 * scenes-blog-usecases.mjs: isometric kraft boxes, paper cards, one green accent. Original artwork only.
 * SECURITY: build-time only; output is static, script-free SVG.
 */
import { C, fitIso, poly, line3, box, flutes, shadow, svg, pts } from './lib.mjs';

const W = 1600;
const H = 900;
const blog = (title, body) => svg({ w: W, h: H, title, body });
const tick = (x, y, s = 1, color = C.green600) =>
  `<polyline points="${x - 12 * s},${y} ${x - 3 * s},${y + 10 * s} ${x + 14 * s},${y - 10 * s}" fill="none" stroke="${color}" stroke-width="${6 * s}" stroke-linecap="round" stroke-linejoin="round"/>`;

/** Circle on a horizontal plane (z), as a projected polygon (`ry` squashes it into an ellipse along y). */
const isoCircle = (P, cx, cy, z, r, fill, { stroke = C.k700, sw = 1.2, n = 40, ry = r } = {}) => {
  const v = Array.from({ length: n }, (_, i) => P(cx + Math.cos((i / n) * Math.PI * 2) * r, cy + Math.sin((i / n) * Math.PI * 2) * ry, z));
  return `<polygon points="${pts(v)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
};

/** Open tray (floor + four low walls) or a tray with a lid hinged on the back edge. Draw order: lid, inside, contents, front walls, `front`. */
function hingedBox(P, { x, y, z = 0, w, d, h, lidDeg = 105, outer = [C.k400, C.k500], inner = ['#B58A5B', '#A47B4F', '#946B42'], lidOut = C.k300, lidIn = '#B58A5B', stroke = C.k700, sw = 1.2, contents = '', tuck = 0.22, lid = true, front = '' }) {
  const zt = z + h;
  const a = (lidDeg * Math.PI) / 180;
  const ly = Math.cos(a) * d;
  const lz = Math.sin(a) * d;
  const out = [];
  if (lid) {
    out.push(poly(P, [[x, y, zt], [x + w, y, zt], [x + w, y + ly, zt + lz], [x, y + ly, zt + lz]], lidDeg > 90 ? lidIn : lidOut, { stroke, sw }));
    const t = h * tuck;
    out.push(poly(P, [[x, y + ly, zt + lz], [x + w, y + ly, zt + lz], [x + w, y + ly + t * 0.35, zt + lz + t], [x, y + ly + t * 0.35, zt + lz + t]], lidOut, { stroke, sw }));
  }
  out.push(poly(P, [[x, y, z], [x + w, y, z], [x + w, y, zt], [x, y, zt]], inner[0], { stroke, sw }));
  out.push(poly(P, [[x, y, z], [x, y + d, z], [x, y + d, zt], [x, y, zt]], inner[1], { stroke, sw }));
  out.push(poly(P, [[x, y, z + 1], [x + w, y, z + 1], [x + w, y + d, z + 1], [x, y + d, z + 1]], inner[2], { stroke: 'none' }));
  out.push(contents);
  out.push(poly(P, [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, zt], [x, y + d, zt]], outer[0], { stroke, sw }));
  out.push(poly(P, [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, zt], [x + w, y, zt]], outer[1], { stroke, sw }));
  out.push(front);
  return out.join('');
}

const DARK = '#3A2A1C';
/** A rectangular slot cut into the front face (y = const) between x0..x1 and z0..z1. */
const slotFront = (P, y, x0, x1, z0, z1) => poly(P, [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], DARK, { stroke: C.k900, sw: 1, op: 0.9 });
/** A rectangular slot cut into the right face (x = const) between y0..y1 and z0..z1. */
const slotRight = (P, x, y0, y1, z0, z1) => poly(P, [[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]], DARK, { stroke: C.k900, sw: 1, op: 0.9 });
/** Soft airflow stroke with an arrowhead, in the green accent. */
const air = (x1, y1, x2, y2, bend = -40) =>
  `<g fill="none" stroke="${C.green600}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"><path d="M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 + bend} ${x2} ${y2}"/><polyline points="${x2 - 22},${y2 - 16} ${x2},${y2} ${x2 - 22},${y2 + 14}"/></g>`;

export const blogPhase2Scenes = {
  // UC-10: ventilated produce carton with vent slots and a hand hole, beside an open apple tray, airflow arrows
  'blog-p2-produce': () => {
    const P = fitIso([0, -330, 0, 710, 260, 210], { cx: 800, cy: 450, maxW: 1450, maxH: 1150 });
    const out = [];
    const b = { x: 0, y: 0, z: 0, w: 360, d: 260, h: 200 };
    out.push(shadow(P, { ...b, pad: 28 }));
    out.push(box(P, { ...b, seam: true }));
    out.push(flutes(P, { ...b, n: 12 }));
    // four vent slots on the long wall, a hand-hole slot on the short wall
    for (let i = 0; i < 4; i++) out.push(slotFront(P, b.y + b.d, 50 + i * 75, 88 + i * 75, 70, 150));
    out.push(slotRight(P, b.x + b.w, 85, 175, 125, 165));
    // open tray with apples (fruit sits at rim height so it reads from above)
    const t = { x: 390, y: -330, z: 0, w: 320, d: 230, h: 44 };
    const apples = [[70, 60], [150, 55], [230, 65], [100, 130], [185, 130], [260, 140], [70, 190], [150, 195], [230, 200]]
      .map(([cx, cy], i) => isoCircle(P, t.x + cx, t.y + cy, 30, 30, i % 3 === 1 ? '#8FB04A' : '#C2452F', { stroke: i % 3 === 1 ? '#5E7A2A' : '#7E2B20', n: 28 }))
      .join('');
    out.push(shadow(P, { ...t, pad: 20 }));
    const trayVents = [0, 1, 2].map((i) => slotFront(P, t.y + t.d, t.x + 45 + i * 90, t.x + 80 + i * 90, 12, 32)).join('');
    out.push(hingedBox(P, { ...t, lid: false, contents: apples, front: trayVents }));
    // airflow through the slots
    const [ax, ay] = P(b.w * 0.5, b.d + 6, 110);
    out.push(air(ax - 210, ay + 150, ax - 10, ay + 55, -30));
    out.push(air(ax - 160, ay + 215, ax + 40, ay + 120, -30));
    return blog('A ventilated corrugated produce carton with vent slots and a hand hole beside an open tray of apples, with airflow arrows', out.join(''));
  },

  // UC-11: three trays: mangoes, apples and grapes
  'blog-p2-fruit-pack': () => {
    const P = fitIso([0, -620, 0, 860, 210, 110], { cx: 800, cy: 450, maxW: 1480, maxH: 1150 });
    const out = [];
    for (let i = 0; i < 3; i++) {
      const t = { x: i * 310, y: -i * 310, z: 0, w: 260, d: 200, h: 40 };
      let contents = '';
      if (i === 0) {
        contents = [[60, 55], [140, 50], [215, 60], [80, 125], [165, 130], [225, 150]]
          .map(([cx, cy]) => isoCircle(P, t.x + cx, t.y + cy, 28, 34, '#E8A13A', { stroke: '#A8701F', n: 28, ry: 24 }) + isoCircle(P, t.x + cx - 9, t.y + cy - 3, 29, 11, '#D9622B', { stroke: 'none', n: 16, ry: 8 }))
          .join('');
      } else if (i === 1) {
        contents = [[55, 55], [130, 50], [205, 60], [55, 125], [130, 125], [205, 135], [90, 165], [170, 170]]
          .map(([cx, cy], k) => isoCircle(P, t.x + cx, t.y + cy, 30, 28, k % 2 ? '#C2452F' : '#9C2F2A', { stroke: '#6E211D', n: 28 }))
          .join('');
      } else {
        const bunch = (cx, cy) =>
          [[0, 0], [-20, 17], [20, 17], [-10, 34], [10, 34], [0, 51]]
            .map(([dx, dy]) => isoCircle(P, t.x + cx + dx, t.y + cy + dy - 24, 30, 18, '#6B3F8E', { stroke: '#472963', n: 20 }))
            .join('') + isoCircle(P, t.x + cx, t.y + cy - 30, 31, 9, C.green600, { stroke: C.green700, n: 14 });
        contents = bunch(65, 80) + bunch(135, 90) + bunch(205, 80) + bunch(135, 150);
      }
      out.push(shadow(P, { ...t, pad: 20 }));
      out.push(hingedBox(P, { ...t, lid: false, contents }));
    }
    out.push(`<g transform="translate(800 800)">${[-120, 0, 120].map((dx) => `<circle cx="${dx}" cy="0" r="28" fill="${C.paper50}" stroke="${C.paper300}" stroke-width="2"/>` + tick(dx, 0, 0.8)).join('')}</g>`);
    return blog('Three kraft produce trays holding mangoes, apples and grapes', out.join(''));
  },

  // UC-12: gold saree box with its lid lifted, and a window mailer with a folded garment
  'blog-p2-fashion': () => {
    const P = fitIso([0, -500, 0, 800, 300, 330], { cx: 800, cy: 450, maxW: 1450, maxH: 1150 });
    const out = [];
    const s = { x: 0, y: 0, z: 0, w: 340, d: 270, h: 56 };
    const gold = ['#D9A441', '#C08E30'];
    out.push(shadow(P, { ...s, pad: 26 }));
    const saree =
      poly(P, [[20, 20, 6], [320, 20, 6], [320, 250, 6], [20, 250, 6]], '#B0356E', { stroke: '#7E2450', sw: 1.2 }) +
      poly(P, [[20, 20, 7], [320, 20, 7], [320, 52, 7], [20, 52, 7]], '#E3B34C', { stroke: '#A97F2A', sw: 1 }) +
      [90, 150, 210].map((yy) => line3(P, [20, yy, 8], [320, yy, 8], { stroke: '#E3B34C', sw: 2, op: 0.7 })).join('');
    out.push(hingedBox(P, { ...s, lid: false, outer: gold, inner: [C.paper50, C.paper200, C.paper100], contents: saree }));
    const lid = { x: -10, y: -10, z: 170, w: 360, d: 290, h: 44 };
    out.push(box(P, { ...lid, top: '#E3B34C', left: gold[0], right: gold[1], stroke: '#A97F2A' }));
    out.push(poly(P, [[110, 80, 214.5], [250, 80, 214.5], [250, 210, 214.5], [110, 210, 214.5]], '#F6E3A8', { stroke: 'none', op: 0.8 }));
    const [ux, uy] = P(340, 135, 150);
    out.push(`<g stroke="${C.green600}" stroke-width="6" stroke-linecap="round" fill="none"><line x1="${ux + 40}" y1="${uy + 90}" x2="${ux + 40}" y2="${uy + 10}"/><polyline points="${ux + 26},${uy + 26} ${ux + 40},${uy + 10} ${ux + 54},${uy + 26}"/></g>`);
    // window mailer with a clear window showing a folded shirt
    const m = { x: 460, y: -500, z: 0, w: 340, d: 260, h: 70 };
    out.push(shadow(P, { ...m, pad: 22 }));
    out.push(box(P, { ...m, top: C.paper50, left: C.paper200, right: C.paper300, stroke: C.k700 }));
    const zt = m.h + 0.5;
    const q = (x0, y0, x1, y1, dz = 0) => [[m.x + x0, m.y + y0, zt + dz], [m.x + x1, m.y + y0, zt + dz], [m.x + x1, m.y + y1, zt + dz], [m.x + x0, m.y + y1, zt + dz]];
    out.push(poly(P, q(40, 45, 300, 215), '#CFE3EC', { stroke: C.k700, sw: 1.4 }));
    out.push(poly(P, q(75, 70, 265, 190, 0.5), '#5E7F9A', { stroke: '#3F5B72', sw: 1.2 }));
    out.push(poly(P, q(75, 70, 265, 98, 1), '#6F92AE', { stroke: '#3F5B72', sw: 1 }));
    return blog('A gold saree box with its lid lifted above a magenta saree, beside a white window mailer showing a folded shirt', out.join(''));
  },

  // UC-13: window cake box and an open red mithai box with diamond sweets
  'blog-p2-cake': () => {
    const P = fitIso([0, -520, 0, 800, 300, 190], { cx: 800, cy: 450, maxW: 1450, maxH: 1150 });
    const out = [];
    const c = { x: 0, y: 0, z: 0, w: 320, d: 300, h: 100 };
    out.push(shadow(P, { ...c, pad: 26 }));
    out.push(box(P, { ...c, top: C.white, left: C.paper100, right: C.paper200, stroke: C.k700 }));
    const zc = c.h + 0.5;
    out.push(poly(P, [[36, 36, zc], [284, 36, zc], [284, 264, zc], [36, 264, zc]], '#EAF3F7', { stroke: C.k700, sw: 1.4 }));
    out.push(isoCircle(P, 160, 150, zc + 1, 92, '#F3D9CF', { stroke: '#B58A5B', sw: 1.2, n: 48 }));
    out.push(isoCircle(P, 160, 150, zc + 14, 82, '#F7E7E0', { stroke: '#B58A5B', sw: 1, n: 48 }));
    out.push(isoCircle(P, 160, 150, zc + 28, 62, '#E9A7B8', { stroke: '#B0586F', sw: 1.2, n: 48 }));
    out.push(isoCircle(P, 160, 150, zc + 42, 12, '#B8303F', { stroke: '#7A1E28', sw: 1, n: 16 }));
    out.push(poly(P, [[60, 60, zc + 70], [120, 60, zc + 70], [80, 240, zc + 70], [40, 240, zc + 70]], C.white, { stroke: 'none', op: 0.22 }));
    // mithai box: red base, gold inside, diamond sweets
    const m = { x: 480, y: -520, z: 0, w: 320, d: 250, h: 46 };
    const sweets = [[70, 60], [160, 60], [250, 60], [70, 130], [160, 130], [250, 130], [115, 190], [205, 190]]
      .map(([cx, cy], i) => {
        const sx = m.x + cx;
        const sy = m.y + cy;
        const col = i % 3 === 0 ? '#E8C27A' : i % 3 === 1 ? '#F1DDB0' : '#D9A45B';
        return poly(P, [[sx, sy - 34, 26], [sx + 38, sy, 26], [sx, sy + 34, 26], [sx - 38, sy, 26]], col, { stroke: '#A97F2A', sw: 1.2 });
      })
      .join('');
    out.push(shadow(P, { ...m, pad: 24 }));
    const band = poly(P, [[m.x + 145, m.y + m.d, 0], [m.x + 175, m.y + m.d, 0], [m.x + 175, m.y + m.d, m.h], [m.x + 145, m.y + m.d, m.h]], '#D9A441', { stroke: '#A97F2A', sw: 1 });
    out.push(hingedBox(P, { ...m, lid: false, outer: ['#A23A3A', '#7E2B2B'], inner: ['#D9A441', '#C08E30', '#E3B34C'], stroke: '#7E2B2B', contents: sweets, front: band }));
    return blog('A white window cake box showing a pink cake beside an open red sweet box holding diamond-shaped sweets', out.join(''));
  },

  // UC-14: takeaway clamshell with a burger, and two stacked pizza boxes
  'blog-p2-takeaway': () => {
    const P = fitIso([0, -560, 0, 800, 280, 280], { cx: 800, cy: 450, maxW: 1450, maxH: 1150 });
    const out = [];
    const b = { x: 0, y: 0, z: 0, w: 290, d: 270, h: 60 };
    const burger =
      isoCircle(P, 145, 135, 8, 100, '#D9A45B', { stroke: '#8A5A22', n: 40 }) +
      isoCircle(P, 145, 135, 22, 92, '#6B3F22', { stroke: '#47280F', n: 40 }) +
      isoCircle(P, 145, 135, 34, 104, '#7DB04A', { stroke: '#4D7A28', n: 14 }) +
      isoCircle(P, 145, 135, 52, 94, '#E8C27A', { stroke: '#8A5A22', n: 40 }) +
      [[105, 105], [165, 95], [190, 145], [125, 165]].map(([cx, cy]) => isoCircle(P, cx, cy, 53, 5, '#FBF8F3', { stroke: 'none', n: 8 })).join('');
    out.push(shadow(P, { ...b, pad: 24 }));
    out.push(hingedBox(P, { ...b, lidDeg: 108, tuck: 0.5, contents: burger, lidIn: '#B58A5B' }));
    // two stacked pizza boxes, closed, with a pizza hint on the lid
    const pz = (z) => ({ x: 430, y: -560, z, w: 370, d: 370, h: 44 });
    for (const z of [0, 44]) {
      const p = pz(z);
      if (z === 0) out.push(shadow(P, { ...p, pad: 24 }));
      out.push(box(P, p));
    }
    const top = pz(44);
    const zt = 88.5;
    out.push(isoCircle(P, top.x + 185, top.y + 185, zt, 118, '#D9A45B', { stroke: C.k700, sw: 1, n: 48 }));
    out.push(isoCircle(P, top.x + 185, top.y + 185, zt + 0.5, 100, '#E8C27A', { stroke: 'none', n: 48 }));
    out.push([[150, 150], [225, 160], [180, 225], [245, 225], [135, 225]].map(([cx, cy]) => isoCircle(P, top.x + cx, top.y + cy - 30, zt + 1, 14, '#B5532E', { stroke: 'none', n: 16 })).join(''));
    out.push(`<g transform="translate(1400 160)"><circle r="46" fill="${C.paper50}" stroke="${C.paper300}" stroke-width="2"/>${tick(0, 0, 1.1)}</g>`);
    return blog('An open kraft takeaway clamshell holding a burger beside two stacked pizza boxes', out.join(''));
  },
};
