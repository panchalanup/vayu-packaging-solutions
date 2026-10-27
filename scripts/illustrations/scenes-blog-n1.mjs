/**
 * Blog thumbnails for the size-chart, calculator and buying articles (blog writer N1; 16:9, 1600x900):
 * volumetric weight, standard box sizes, mailer sizes, cake box sizes, CBM and container loading, choosing a manufacturer.
 * Same restrained palette and helpers as scenes-blog-phase2.mjs: isometric kraft boxes, paper cards, one green accent,
 * no text. Original artwork only.
 * SECURITY: build-time only; output is static, script-free SVG.
 */
import { C, fitIso, poly, line3, box, flutes, shadow, svg, openBox, pallet, pts } from './lib.mjs';

const W = 1600;
const H = 900;
const blog = (title, body) => svg({ w: W, h: H, title, body });
const tick = (x, y, s = 1, color = C.green600) =>
  `<polyline points="${x - 12 * s},${y} ${x - 3 * s},${y + 10 * s} ${x + 14 * s},${y - 10 * s}" fill="none" stroke="${color}" stroke-width="${6 * s}" stroke-linecap="round" stroke-linejoin="round"/>`;
const bar = (x, y, w, h = 14, fill = C.ink300, op = 0.7) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}" opacity="${op}"/>`;
const card = (x, y, w, h, fill = C.paper50) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="${fill}" stroke="${C.paper300}" stroke-width="2"/>`;

/** Circle on a horizontal plane (z), as a projected polygon (`ry` squashes it into an ellipse along y). */
const isoCircle = (P, cx, cy, z, r, fill, { stroke = C.k700, sw = 1.2, n = 44, ry = r } = {}) => {
  const v = Array.from({ length: n }, (_, i) => P(cx + Math.cos((i / n) * Math.PI * 2) * r, cy + Math.sin((i / n) * Math.PI * 2) * ry, z));
  return `<polygon points="${pts(v)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
};

/** Open tray (floor + four walls) with an optional lid hinged on the back edge. Draw order: lid, inside, contents, front walls. */
function tray(P, { x, y, z = 0, w, d, h, lidDeg = 105, lid = true, outer = [C.k400, C.k500], inner = ['#B58A5B', '#A47B4F', '#946B42'], lidOut = C.k300, lidIn = '#B58A5B', stroke = C.k700, sw = 1.2, contents = '' }) {
  const zt = z + h;
  const a = (lidDeg * Math.PI) / 180;
  const ly = Math.cos(a) * d;
  const lz = Math.sin(a) * d;
  const out = [];
  if (lid) out.push(poly(P, [[x, y, zt], [x + w, y, zt], [x + w, y + ly, zt + lz], [x, y + ly, zt + lz]], lidDeg > 90 ? lidIn : lidOut, { stroke, sw }));
  out.push(poly(P, [[x, y, z], [x + w, y, z], [x + w, y, zt], [x, y, zt]], inner[0], { stroke, sw }));
  out.push(poly(P, [[x, y, z], [x, y + d, z], [x, y + d, zt], [x, y, zt]], inner[1], { stroke, sw }));
  out.push(poly(P, [[x, y, z + 1], [x + w, y, z + 1], [x + w, y + d, z + 1], [x, y + d, z + 1]], inner[2], { stroke: 'none' }));
  out.push(contents);
  out.push(poly(P, [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, zt], [x, y + d, zt]], outer[0], { stroke, sw }));
  out.push(poly(P, [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, zt], [x + w, y, zt]], outer[1], { stroke, sw }));
  return out.join('');
}

const GREEN_BOX = { top: '#6FD189', left: C.green500, right: C.green600, stroke: C.green700 };

export const blogN1Scenes = {
  // N1-01: a small product floating in a big dashed block of air, a snug box beside it, and two weight bars
  'blog-n1-volumetric': () => {
    const P = fitIso([0, 0, 0, 640, 300, 280], { cx: 640, cy: 470, maxW: 1060, maxH: 760 });
    const out = [];
    const air = { x: 0, y: 0, w: 340, d: 270, h: 250 };
    const [x0, y0, x1, y1, z1] = [air.x, air.y, air.x + air.w, air.y + air.d, air.h];
    out.push(shadow(P, { x: x0, y: y0, w: air.w, d: air.d, pad: 24 }));
    // the volume a courier measures: three visible faces tinted, every edge dashed
    out.push(poly(P, [[x0, y1, 0], [x1, y1, 0], [x1, y1, z1], [x0, y1, z1]], C.green400, { stroke: 'none', op: 0.1 }));
    out.push(poly(P, [[x1, y0, 0], [x1, y1, 0], [x1, y1, z1], [x1, y0, z1]], C.green400, { stroke: 'none', op: 0.16 }));
    out.push(poly(P, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], C.green400, { stroke: 'none', op: 0.06 }));
    const edges = [
      [[x0, y0, 0], [x1, y0, 0]], [[x1, y0, 0], [x1, y1, 0]], [[x1, y1, 0], [x0, y1, 0]], [[x0, y1, 0], [x0, y0, 0]],
      [[x0, y0, z1], [x1, y0, z1]], [[x1, y0, z1], [x1, y1, z1]], [[x1, y1, z1], [x0, y1, z1]], [[x0, y1, z1], [x0, y0, z1]],
      [[x0, y0, 0], [x0, y0, z1]], [[x1, y0, 0], [x1, y0, z1]], [[x1, y1, 0], [x1, y1, z1]], [[x0, y1, 0], [x0, y1, z1]],
    ];
    for (const [p, q] of edges) out.push(line3(P, p, q, { stroke: C.green700, sw: 3, dash: '12 10', op: 0.85 }));
    out.push(box(P, { x: 115, y: 90, z: 0, w: 110, d: 90, h: 70, ...GREEN_BOX, seam: true }));
    // the same product in a snug box
    const snug = { x: 470, y: 100, z: 0, w: 130, d: 110, h: 90 };
    out.push(shadow(P, { ...snug, pad: 16 }));
    out.push(box(P, { ...snug, seam: true, tape: true }));
    out.push(flutes(P, { ...snug, n: 8 }));
    // two bars: weight billed for the airy box against the snug one
    out.push(`<g>
      <rect x="1180" y="190" width="130" height="520" rx="14" fill="${C.paper50}" stroke="${C.paper300}" stroke-width="2"/>
      <rect x="1192" y="240" width="106" height="458" rx="8" fill="${C.k300}" stroke="${C.k700}" stroke-width="2"/>
      <rect x="1360" y="190" width="130" height="520" rx="14" fill="${C.paper50}" stroke="${C.paper300}" stroke-width="2"/>
      <rect x="1372" y="470" width="106" height="228" rx="8" fill="${C.green500}" stroke="${C.green700}" stroke-width="2"/>
    </g>`);
    out.push(`<g fill="none" stroke="${C.green600}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M 1250 200 Q 1320 150 1425 440"/><polyline points="1396,420 1425,448 1440,410"/></g>`);
    out.push(`<g transform="translate(1250 790)"><circle r="30" fill="${C.paper50}" stroke="${C.paper300}" stroke-width="2"/>${tick(0, 0, 0.85)}</g>`);
    return blog('A small green product inside a large dashed block of empty space, a snug kraft box beside it, and two bars showing the larger billed weight for the airy box', out.join(''));
  },

  // N1-02: five boxes in graded sizes along a row
  'blog-n1-sizes': () => {
    const sizes = [
      { w: 110, d: 80, h: 56 },
      { w: 150, d: 110, h: 80 },
      { w: 196, d: 146, h: 104 },
      { w: 250, d: 190, h: 136 },
      { w: 316, d: 240, h: 170 },
    ];
    const gap = 44;
    let x = 0;
    const placed = sizes.map((s) => {
      const b = { ...s, x, y: 0, z: 0 };
      x += s.w + gap;
      return b;
    });
    const last = placed[placed.length - 1];
    const P = fitIso([0, 0, 0, last.x + last.w, last.d, last.h], { cx: 800, cy: 450, maxW: 1500, maxH: 760 });
    const out = [];
    for (const b of placed) {
      out.push(shadow(P, { ...b, pad: 14 }));
      out.push(box(P, { ...b, seam: true, tape: true }));
      out.push(flutes(P, { ...b, n: 9 }));
    }
    out.push(`<g transform="translate(1440 140)"><circle r="46" fill="${C.paper50}" stroke="${C.paper300}" stroke-width="2"/>${tick(0, 0, 1.1)}</g>`);
    return blog('Five kraft shipping cartons in graded sizes, from small to large, in a row', out.join(''));
  },

  // N1-03: an open mailer with a folded T-shirt and a small jewellery box with its lid lifted
  'blog-n1-mailer-sizes': () => {
    const P = fitIso([0, -420, 0, 760, 320, 360], { cx: 800, cy: 450, maxW: 1480, maxH: 760 });
    const out = [];
    const m = { x: 0, y: 0, z: 0, w: 380, d: 290, h: 74 };
    const zt = 4;
    const q = (x0, y0, x1, y1, dz = 0) => [[x0, y0, zt + dz], [x1, y0, zt + dz], [x1, y1, zt + dz], [x0, y1, zt + dz]];
    const shirt =
      poly(P, q(60, 50, 320, 240), '#5E7F9A', { stroke: '#3F5B72', sw: 1.2 }) +
      poly(P, q(60, 50, 320, 90, 1), '#6F92AE', { stroke: '#3F5B72', sw: 1 }) +
      poly(P, q(160, 50, 220, 74, 2), '#3F5B72', { stroke: 'none', op: 0.5 });
    out.push(shadow(P, { ...m, pad: 26 }));
    out.push(tray(P, { ...m, lidDeg: 108, outer: [C.paper200, C.paper300], inner: [C.paper100, C.paper200, C.paper50], lidOut: C.paper50, lidIn: C.paper100, contents: shirt }));
    // jewellery box: shallow base with a ring, lid floating above
    const j = { x: 480, y: -420, z: 0, w: 220, d: 180, h: 52 };
    const ring = isoCircle(P, j.x + 110, j.y + 90, 8, 38, '#E3B34C', { stroke: '#A97F2A', sw: 2, ry: 38 }) + isoCircle(P, j.x + 110, j.y + 90, 9, 24, '#E6A9B8', { stroke: '#B0586F', sw: 1.2 });
    out.push(shadow(P, { ...j, pad: 20 }));
    out.push(tray(P, { ...j, lid: false, outer: ['#2E3B33', '#232E27'], inner: ['#E6A9B8', '#D993A5', '#EBB9C5'], stroke: '#17231C', contents: ring }));
    out.push(box(P, { x: j.x - 6, y: j.y - 6, z: 170, w: j.w + 12, d: j.d + 12, h: 40, top: '#3B4A41', left: '#2E3B33', right: '#232E27', stroke: '#17231C' }));
    const [ux, uy] = P(j.x + j.w, j.y + j.d / 2, 120);
    out.push(`<g stroke="${C.green600}" stroke-width="6" stroke-linecap="round" fill="none"><line x1="${ux + 50}" y1="${uy + 70}" x2="${ux + 50}" y2="${uy - 10}"/><polyline points="${ux + 36},${uy + 6} ${ux + 50},${uy - 10} ${ux + 64},${uy + 6}"/></g>`);
    return blog('An open white mailer holding a folded blue T-shirt beside a small dark jewellery box with a ring and its lid lifted above it', out.join(''));
  },

  // N1-04: three square window cake boxes in graded sizes, each with a cake
  'blog-n1-cake-sizes': () => {
    const boxes = [
      { w: 190, d: 190, h: 70 },
      { w: 250, d: 250, h: 86 },
      { w: 310, d: 310, h: 104 },
    ];
    let x = 0;
    const placed = boxes.map((b) => {
      const p = { ...b, x, y: 0, z: 0 };
      x += b.w + 90;
      return p;
    });
    const last = placed[2];
    const P = fitIso([0, 0, 0, last.x + last.w, last.d, last.h + 40], { cx: 800, cy: 450, maxW: 1480, maxH: 760 });
    const out = [];
    placed.forEach((b, i) => {
      out.push(shadow(P, { ...b, pad: 20 }));
      out.push(box(P, { ...b, top: C.white, left: C.paper100, right: C.paper200, stroke: C.k700 }));
      const zc = b.h + 0.5;
      const m = b.w * 0.17;
      out.push(poly(P, [[b.x + m, b.y + m, zc], [b.x + b.w - m, b.y + m, zc], [b.x + b.w - m, b.y + b.d - m, zc], [b.x + m, b.y + b.d - m, zc]], '#EAF3F7', { stroke: C.k700, sw: 1.4 }));
      const cx = b.x + b.w / 2;
      const cy = b.y + b.d / 2;
      const r = b.w * 0.3;
      out.push(isoCircle(P, cx, cy, zc + 1, r, '#F3D9CF', { stroke: '#B58A5B', n: 44 }));
      out.push(isoCircle(P, cx, cy, zc + 10 + i * 2, r * 0.9, '#F7E7E0', { stroke: '#B58A5B', sw: 1, n: 44 }));
      out.push(isoCircle(P, cx, cy, zc + 20 + i * 4, r * 0.7, '#E9A7B8', { stroke: '#B0586F', n: 44 }));
      out.push(isoCircle(P, cx, cy, zc + 30 + i * 4, r * 0.12, '#B8303F', { stroke: '#7A1E28', sw: 1, n: 14 }));
    });
    out.push(`<g transform="translate(1440 140)"><circle r="46" fill="${C.paper50}" stroke="${C.paper300}" stroke-width="2"/>${tick(0, 0, 1.1)}</g>`);
    return blog('Three square white window cake boxes in small, medium and large sizes, each showing a pink cake through the window', out.join(''));
  },

  // N1-05: an open container full of cartons beside a loaded pallet
  'blog-n1-cbm': () => {
    const P = fitIso([0, -380, 0, 780, 240, 230], { cx: 800, cy: 450, maxW: 1400, maxH: 760 });
    const out = [];
    // pallet with three layers of cartons (drawn first: it is further back)
    const pal = { x: 120, y: -380, w: 240, d: 200 };
    out.push(shadow(P, { x: pal.x, y: pal.y, w: pal.w, d: pal.d, pad: 24 }));
    out.push(pallet(P, { ...pal }));
    const base = 27;
    for (let layer = 0; layer < 3; layer++) {
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          out.push(box(P, { x: pal.x + 4 + c * 77, y: pal.y + 6 + r * 96, z: base + layer * 56, w: 74, d: 92, h: 54, seam: true, sw: 1 }));
        }
      }
    }
    // container: open-top shell with a grid of cartons inside, front walls drawn translucent so the load shows
    const k = { x: 0, y: 0, z: 0, w: 780, d: 240, h: 200 };
    out.push(shadow(P, { ...k, pad: 28 }));
    const inner = [C.paper200, C.paper300, C.paper100];
    out.push(poly(P, [[k.x, k.y, k.z], [k.x + k.w, k.y, k.z], [k.x + k.w, k.y, k.z + k.h], [k.x, k.y, k.z + k.h]], inner[0], { stroke: C.ink500, sw: 1.4 }));
    out.push(poly(P, [[k.x, k.y, k.z], [k.x, k.y + k.d, k.z], [k.x, k.y + k.d, k.z + k.h], [k.x, k.y, k.z + k.h]], inner[1], { stroke: C.ink500, sw: 1.4 }));
    out.push(poly(P, [[k.x, k.y, k.z + 1], [k.x + k.w, k.y, k.z + 1], [k.x + k.w, k.y + k.d, k.z + 1], [k.x, k.y + k.d, k.z + 1]], inner[2], { stroke: 'none' }));
    const cols = 9;
    const rows = 3;
    const cw = (k.w - 40) / cols;
    const rd = (k.d - 30) / rows;
    for (let layer = 0; layer < 3; layer++) {
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if (layer === 2 && c > 5) continue; // the top layer is only part full
          out.push(box(P, { x: k.x + 20 + c * cw, y: k.y + 15 + r * rd, z: 2 + layer * 58, w: cw - 3, d: rd - 4, h: 56, seam: true, sw: 1 }));
        }
      }
    }
    // front walls, translucent, with corrugation ribs
    out.push(poly(P, [[k.x, k.y + k.d, k.z], [k.x + k.w, k.y + k.d, k.z], [k.x + k.w, k.y + k.d, k.z + k.h], [k.x, k.y + k.d, k.z + k.h]], C.paper50, { stroke: C.ink500, sw: 1.6, op: 0.55 }));
    out.push(poly(P, [[k.x + k.w, k.y, k.z], [k.x + k.w, k.y + k.d, k.z], [k.x + k.w, k.y + k.d, k.z + k.h], [k.x + k.w, k.y, k.z + k.h]], C.paper100, { stroke: C.ink500, sw: 1.6, op: 0.6 }));
    for (let i = 1; i < 26; i++) out.push(line3(P, [k.x + (k.w * i) / 26, k.y + k.d, 6], [k.x + (k.w * i) / 26, k.y + k.d, k.h - 6], { stroke: C.ink300, sw: 1, op: 0.45 }));
    out.push(`<g transform="translate(1440 150)"><circle r="46" fill="${C.paper50}" stroke="${C.paper300}" stroke-width="2"/>${tick(0, 0, 1.1)}</g>`);
    return blog('A shipping container drawn see-through, filled with rows of kraft cartons, beside a pallet stacked with cartons', out.join(''));
  },

  // N1-06: a checklist card with ticks, beside a sample box and a magnifier
  'blog-n1-choose': () => {
    const out = [];
    out.push(card(130, 130, 640, 640));
    out.push(bar(190, 190, 320, 20, C.ink500, 0.8));
    const rows = [0, 1, 2, 3, 4, 5];
    rows.forEach((i) => {
      const y = 270 + i * 82;
      const done = i < 5;
      out.push(`<circle cx="214" cy="${y + 8}" r="26" fill="${done ? C.green500 : C.paper50}" stroke="${done ? C.green700 : C.ink300}" stroke-width="3"/>`);
      if (done) out.push(tick(214, y + 8, 0.9, C.white));
      out.push(bar(268, y - 6, 330 - (i % 3) * 50, 16, C.ink500, 0.65));
      out.push(bar(268, y + 20, 230 - (i % 2) * 60, 12, C.ink300, 0.6));
    });
    // iso scene: a stack of two sample boxes
    const P = fitIso([0, 0, 0, 420, 320, 240], { cx: 1170, cy: 520, maxW: 640, maxH: 640 });
    const a = { x: 0, y: 0, z: 0, w: 280, d: 210, h: 130 };
    out.push(shadow(P, { ...a, pad: 22 }));
    out.push(box(P, { ...a, seam: true, tape: true }));
    out.push(flutes(P, { ...a, n: 10 }));
    const b = { x: 250, y: 150, z: 0, w: 160, d: 130, h: 90 };
    out.push(shadow(P, { ...b, pad: 16 }));
    out.push(box(P, { ...b, ...GREEN_BOX, seam: true }));
    // magnifier over the first box
    out.push(`<g transform="translate(1290 270)"><circle r="82" fill="${C.white}" fill-opacity="0.45" stroke="${C.ink800}" stroke-width="10"/><line x1="58" y1="58" x2="130" y2="130" stroke="${C.ink800}" stroke-width="16" stroke-linecap="round"/></g>`);
    return blog('A checklist card with five ticks and one empty box, beside two stacked sample cartons and a magnifying glass', out.join(''));
  },
};
