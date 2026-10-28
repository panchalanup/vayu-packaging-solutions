/**
 * Blog thumbnails for the "Use Cases" articles (16:9, 1600×900).
 * Same restrained palette and helpers as scenes-blog.mjs: isometric kraft boxes, paper cards, one green accent.
 * SECURITY: build-time only; output is static, script-free SVG.
 */
import { C, fitIso, makeIso, poly, line3, box, flutes, shadow, svg, boardSection, pallet, pts } from './lib.mjs';

const W = 1600;
const H = 900;
const FONT = `font-family="Satoshi, 'Segoe UI', Arial, sans-serif"`;
const blog = (title, body) => svg({ w: W, h: H, title, body });
const text = (x, y, s, size = 40, { weight = 700, fill = C.ink800, anchor = 'middle' } = {}) =>
  `<text x="${x}" y="${y}" ${FONT} font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${s}</text>`;
const card = (x, y, w, h, fill = C.paper50) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="${fill}" stroke="${C.paper300}" stroke-width="2"/>`;
const bar = (x, y, w, h = 14, fill = C.ink300, op = 0.7) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}" opacity="${op}"/>`;
const tick = (x, y, s = 1, color = C.green600) =>
  `<polyline points="${x - 12 * s},${y} ${x - 3 * s},${y + 10 * s} ${x + 14 * s},${y - 10 * s}" fill="none" stroke="${color}" stroke-width="${6 * s}" stroke-linecap="round" stroke-linejoin="round"/>`;
const groundShadow = (cx, cy, rx, ry = 26, op = 0.13) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${C.ink800}" opacity="${op}" filter="url(#soft)"/>`;

/** Circle on a horizontal plane (z), as a projected polygon. */
const isoCircle = (P, cx, cy, z, r, fill, { stroke = C.k700, sw = 1.2, n = 48 } = {}) => {
  const v = Array.from({ length: n }, (_, i) => P(cx + Math.cos((i / n) * Math.PI * 2) * r, cy + Math.sin((i / n) * Math.PI * 2) * r, z));
  return `<polygon points="${pts(v)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
};

/**
 * Open tray (walls + floor, no top) with an optional lid hinged on the back edge.
 * lid: false draws an open tray. lidDeg: 0 = closed flat, 90 = upright, >90 leans back. Draw order: lid (behind), inside, contents, front walls.
 */
function hingedBox(P, { x, y, z = 0, w, d, h, lidDeg = 105, outer = [C.k400, C.k500], inner = ['#B58A5B', '#A47B4F', '#946B42'], lidOut = C.k300, lidIn = '#B58A5B', stroke = C.k700, sw = 1.2, contents = '', tuck = 0.22, lid = true }) {
  const zt = z + h;
  const a = (lidDeg * Math.PI) / 180;
  const L = (dx) => [0, Math.cos(a) * dx, Math.sin(a) * dx];
  const [, ly, lz] = L(d);
  const out = [];
  if (lid) {
  // lid panel (inner face shows towards the viewer once it is past upright)
  out.push(poly(P, [[x, y, zt], [x + w, y, zt], [x + w, y + ly, zt + lz], [x, y + ly, zt + lz]], lidDeg > 90 ? lidIn : lidOut, { stroke, sw }));
  // tuck flap at the free end of the lid
  const [, ty, tz] = L(d);
  const t = h * tuck;
  out.push(poly(P, [[x, y + ty, zt + tz], [x + w, y + ty, zt + tz], [x + w, y + ty + t * 0.35, zt + tz + t], [x, y + ty + t * 0.35, zt + tz + t]], lidOut, { stroke, sw }));
  }
  // inside
  out.push(poly(P, [[x, y, z], [x + w, y, z], [x + w, y, zt], [x, y, zt]], inner[0], { stroke, sw }));
  out.push(poly(P, [[x, y, z], [x, y + d, z], [x, y + d, zt], [x, y, zt]], inner[1], { stroke, sw }));
  out.push(poly(P, [[x, y, z + 1], [x + w, y, z + 1], [x + w, y + d, z + 1], [x, y + d, z + 1]], inner[2], { stroke: 'none' }));
  out.push(contents);
  // front walls
  out.push(poly(P, [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, zt], [x, y + d, zt]], outer[0], { stroke, sw }));
  out.push(poly(P, [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, zt], [x + w, y, zt]], outer[1], { stroke, sw }));
  return out.join('');
}

/** Small "share link" chain glyph. */
const chain = (cx, cy, color = C.green600) =>
  `<g fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round"><rect x="${cx - 52}" y="${cy - 18}" width="60" height="36" rx="18" transform="rotate(-30 ${cx} ${cy})"/><rect x="${cx - 8}" y="${cy - 18}" width="60" height="36" rx="18" transform="rotate(-30 ${cx} ${cy})"/></g>`;

export const blogUseCaseScenes = {
  // UC-01: box manufacturers presenting a 3D box and a proof sheet to a customer
  'blog-uc-manufacturers': () => {
    const out = [];
    out.push(groundShadow(700, 790, 470));
    // tablet on a stand
    out.push(`<rect x="250" y="150" width="900" height="600" rx="40" fill="${C.ink800}"/><rect x="282" y="182" width="836" height="536" rx="18" fill="${C.paper100}"/>`);
    const P = fitIso([0, 0, 0, 260, 190, 150], { cx: 700, cy: 440, maxW: 430, maxH: 300 });
    const b = { x: 0, y: 0, z: 0, w: 260, d: 190, h: 150 };
    out.push(shadow(P, { ...b, pad: 20 }) + box(P, { ...b, tape: true }) + flutes(P, { ...b, n: 12 }));
    // turntable arc + play badge
    out.push(`<g fill="none" stroke="${C.green600}" stroke-width="7" stroke-linecap="round"><path d="M 470 620 C 570 680, 830 680, 930 620"/><polyline points="906,606 934,620 904,638" stroke-linejoin="round"/></g>`);
    out.push(`<rect x="320" y="214" width="180" height="40" rx="20" fill="${C.green600}"/>` + text(410, 242, 'PRESENT', 22, { fill: C.paper50 }));
    // proof sheet
    out.push(`<g transform="rotate(4 1300 470)">${card(1150, 210, 320, 440, C.white)}`);
    out.push(text(1310, 268, 'Proof', 34, { fill: C.ink800 }));
    out.push(`<rect x="1190" y="296" width="240" height="130" rx="10" fill="${C.paper100}"/>`);
    out.push(`<g fill="none" stroke="${C.k700}" stroke-width="3"><rect x="1270" y="316" width="80" height="90"/><rect x="1210" y="336" width="60" height="50"/><rect x="1350" y="336" width="60" height="50"/></g>`);
    out.push([0, 1, 2].map((i) => bar(1190, 452 + i * 30, 240 - i * 50, 12)).join(''));
    out.push(`<line x1="1190" y1="600" x2="1430" y2="600" stroke="${C.ink500}" stroke-width="3"/>` + tick(1220, 580, 1.1) + `</g>`);
    return blog('A tablet presenting a 3D corrugated box beside a printed proof sheet ready for customer approval', out.join(''));
  },

  // UC-02: wholesalers and traders: several specs, quantity tiers and a share link
  'blog-uc-wholesalers': () => {
    const out = [];
    const P = makeIso(190, 560, 0.85);
    const k = (i) => ({ x: i * 170, y: -i * 170 });
    const items = [
      { ...k(0), z: 0, w: 150, d: 120, h: 120, tape: true },
      { ...k(1), z: 0, w: 170, d: 140, h: 170, tape: true },
      { ...k(2), z: 0, w: 140, d: 110, h: 80, tape: true },
    ];
    out.push(items.map((b) => shadow(P, { x: b.x, y: b.y, w: b.w, d: b.d, pad: 14, op: 0.16 }) + box(P, b) + flutes(P, { ...b, n: 10 })).join(''));
    // tier card
    out.push(card(940, 160, 540, 520));
    out.push(text(1000, 228, 'Qty', 30, { anchor: 'start', fill: C.ink500, weight: 600 }) + text(1420, 228, 'Per box', 30, { anchor: 'end', fill: C.ink500, weight: 600 }));
    ['100', '500', '1,000', '5,000'].forEach((q, i) => {
      const y = 290 + i * 86;
      out.push(`<line x1="990" y1="${y - 40}" x2="1430" y2="${y - 40}" stroke="${C.paper300}" stroke-width="2"/>`);
      out.push(text(1000, y + 8, q, 36, { anchor: 'start' }));
      out.push(bar(1420 - (200 - i * 40), y - 8, 200 - i * 40, 20, i === 3 ? C.green600 : C.k400, 0.9));
    });
    out.push(`<rect x="990" y="610" width="200" height="48" rx="24" fill="${C.paper200}"/>` + text(1090, 643, 'mm · cm · in', 24, { fill: C.ink500, weight: 600 }));
    out.push(chain(1350, 634));
    return blog('Three carton sizes beside a quantity price-tier card and a share-link icon', out.join(''));
  },

  // UC-03: e-commerce mailer with a printed inside
  'blog-uc-mailer': () => {
    const P = fitIso([0, -40, 0, 360, 260, 380], { cx: 800, cy: 450, maxW: 1000, maxH: 740 });
    const b = { x: 0, y: 0, z: 0, w: 360, d: 260, h: 90 };
    const contents =
      poly(P, [[30, 30, 2], [330, 30, 2], [330, 230, 2], [30, 230, 2]], C.paper50, { stroke: C.paper300, sw: 1 }) +
      poly(P, [[110, 80, 3], [250, 80, 3], [250, 180, 3], [110, 180, 3]], C.paper200, { stroke: C.paper300, sw: 1 }) +
      isoCircle(P, 180, 130, 4, 26, C.green600, { stroke: C.green700 });
    const out = [];
    out.push(shadow(P, { ...b, pad: 30 }));
    out.push(hingedBox(P, { ...b, lidDeg: 112, inner: [C.green600, C.green700, C.green500], lidIn: C.green500, contents }));
    // printed sticker on the front wall
    const [sx, sy] = P(b.x + b.w * 0.5, b.y + b.d, b.h * 0.5);
    out.push(`<rect x="${sx - 46}" y="${sy - 14}" width="92" height="28" rx="14" fill="${C.paper50}" opacity="0.9"/>`);
    return blog('An open kraft mailer box with a green printed inside and tissue-wrapped product', out.join(''));
  },

  // UC-04: pizza box and bakery tray
  'blog-uc-food': () => {
    const P = fitIso([0, -60, 0, 640, 300, 380], { cx: 800, cy: 450, maxW: 1300, maxH: 740 });
    const pz = { x: 0, y: 0, z: 0, w: 300, d: 300, h: 40 };
    const pizza =
      isoCircle(P, 150, 150, 3, 125, '#D9A45B', { stroke: C.k700 }) +
      isoCircle(P, 150, 150, 4, 108, '#E8C27A', { stroke: 'none' }) +
      [0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI;
        return line3(P, [150 - Math.cos(a) * 108, 150 - Math.sin(a) * 108, 5], [150 + Math.cos(a) * 108, 150 + Math.sin(a) * 108, 5], { stroke: C.k700, sw: 2, op: 0.5 });
      }).join('') +
      [[110, 120], [190, 110], [150, 190], [200, 175], [100, 175]].map(([cx, cy]) => isoCircle(P, cx, cy, 6, 12, '#B5532E', { stroke: 'none', n: 20 })).join('');
    const out = [];
    out.push(shadow(P, { ...pz, pad: 24 }));
    out.push(hingedBox(P, { ...pz, lidDeg: 100, inner: [C.paper200, C.paper300, C.paper100], lidIn: C.paper100, contents: pizza, tuck: 0.6 }));
    // bakery tray with window lid beside
    const tr = { x: 360, y: 40, z: 0, w: 240, d: 200, h: 70 };
    const buns = [[420, 100], [520, 100], [420, 180], [520, 180]].map(([cx, cy]) => isoCircle(P, cx, cy, 3, 32, '#D7A866', { stroke: C.k700, n: 28 })).join('');
    out.push(shadow(P, { ...tr, pad: 18 }));
    out.push(hingedBox(P, { ...tr, lid: false, contents: buns, inner: [C.white, C.paper200, C.paper100], outer: [C.paper100, C.paper200] }));
    return blog('An open pizza box with a pizza inside beside a white bakery tray with buns', out.join(''));
  },

  // UC-05: apparel mailer with a folded shirt and a shoe box with its lid set aside
  'blog-uc-apparel': () => {
    const P = fitIso([0, -260, 0, 760, 300, 260], { cx: 800, cy: 450, maxW: 1350, maxH: 760 });
    const m = { x: 0, y: 0, z: 0, w: 300, d: 240, h: 60 };
    const shirt =
      poly(P, [[50, 40, 3], [250, 40, 3], [250, 210, 3], [50, 210, 3]], '#5E7F9A', { stroke: '#3F5B72', sw: 1.4 }) +
      poly(P, [[50, 40, 4], [250, 40, 4], [250, 70, 4], [50, 70, 4]], '#6F92AE', { stroke: '#3F5B72', sw: 1.2 }) +
      `<polyline points="${pts([P(120, 70, 5), P(150, 110, 5), P(180, 70, 5)])}" fill="none" stroke="#3F5B72" stroke-width="3"/>` +
      line3(P, [150, 110, 5], [150, 200, 5], { stroke: '#3F5B72', sw: 1.5, op: 0.6 });
    const s = { x: 400, y: 20, z: 0, w: 300, d: 180, h: 110 };
    const out = [];
    // lid set down behind the base, top up
    const lid = { x: s.x + 30, y: s.y - 230, z: 0, w: s.w + 12, d: s.d + 12, h: 30 };
    out.push(shadow(P, { ...lid, pad: 14 }));
    out.push(box(P, { ...lid, top: C.ink500, left: C.ink800, right: '#2B3A31', stroke: C.ink800 }));
    out.push(poly(P, [[lid.x + 120, lid.y + 60, lid.h + 0.5], [lid.x + 200, lid.y + 60, lid.h + 0.5], [lid.x + 200, lid.y + 130, lid.h + 0.5], [lid.x + 120, lid.y + 130, lid.h + 0.5]], C.paper50, { stroke: 'none', op: 0.8 }));
    out.push(shadow(P, { ...m, pad: 22 }));
    out.push(hingedBox(P, { ...m, lidDeg: 108, inner: [C.paper200, C.paper300, C.paper100], lidIn: C.paper100, contents: shirt }));
    // shoe box base
    out.push(shadow(P, { ...s, pad: 18 }));
    const shoe = `<path d="${(() => {
      const p = [[440, 70, 100], [600, 70, 100], [660, 90, 92], [660, 120, 76], [440, 120, 76]].map((q) => P(...q));
      return 'M ' + p.map((q) => q.join(' ')).join(' L ') + ' Z';
    })()}" fill="${C.ink500}" stroke="${C.ink800}" stroke-width="2"/>`;
    out.push(hingedBox(P, { ...s, lid: false, contents: poly(P, [[410, 30, 70], [690, 30, 70], [690, 190, 70], [410, 190, 70]], C.paper50, { stroke: 'none' }) + shoe }));
    return blog('A garment mailer with a folded shirt beside an open shoe box and its dark lid', out.join(''));
  },

  // UC-06: telescope lid-and-base gift box with ribbon
  'blog-uc-gift': () => {
    const P = fitIso([-20, -20, 0, 300, 300, 360], { cx: 780, cy: 450, maxW: 820, maxH: 720 });
    const base = { x: 0, y: 0, z: 0, w: 280, d: 280, h: 160 };
    const lid = { x: -8, y: -8, z: 230, w: 296, d: 296, h: 60 };
    const red = '#A23A3A';
    const redD = '#7E2B2B';
    const gold = '#D9A441';
    const out = [];
    out.push(shadow(P, { ...base, pad: 30 }));
    out.push(box(P, { ...base, top: '#3B2A22', left: red, right: redD, stroke: redD }));
    // ribbon on base
    out.push(poly(P, [[125, 280, 0], [155, 280, 0], [155, 280, 160], [125, 280, 160]], gold, { stroke: '#A97F2A', sw: 1 }));
    out.push(poly(P, [[280, 125, 0], [280, 155, 0], [280, 155, 160], [280, 125, 160]], '#C08E30', { stroke: '#A97F2A', sw: 1 }));
    // lifted lid
    out.push(box(P, { ...lid, top: red, left: '#8E3232', right: redD, stroke: redD }));
    out.push(poly(P, [[125, -8, 290], [155, -8, 290], [155, 288, 290], [125, 288, 290]], gold, { stroke: '#A97F2A', sw: 1 }));
    out.push(poly(P, [[-8, 125, 290], [288, 125, 290], [288, 155, 290], [-8, 155, 290]], gold, { stroke: '#A97F2A', sw: 1 }));
    // bow
    const [bx, by] = P(140, 140, 290);
    out.push(`<g fill="${gold}" stroke="#A97F2A" stroke-width="3"><ellipse cx="${bx - 46}" cy="${by - 22}" rx="50" ry="26" transform="rotate(-18 ${bx - 46} ${by - 22})"/><ellipse cx="${bx + 46}" cy="${by - 22}" rx="50" ry="26" transform="rotate(18 ${bx + 46} ${by - 22})"/><circle cx="${bx}" cy="${by - 14}" r="18"/></g>`);
    // lift arrows
    out.push(`<g stroke="${C.green600}" stroke-width="6" stroke-linecap="round" fill="none"><line x1="${P(300, 150, 170)[0] + 40}" y1="${P(300, 150, 170)[1]}" x2="${P(300, 150, 170)[0] + 40}" y2="${P(300, 150, 225)[1]}"/><polyline points="${P(300, 150, 225)[0] + 26},${P(300, 150, 225)[1] + 16} ${P(300, 150, 225)[0] + 40},${P(300, 150, 225)[1]} ${P(300, 150, 225)[0] + 54},${P(300, 150, 225)[1] + 16}"/></g>`);
    // small festive lights
    out.push([[260, 220], [1330, 200], [1390, 320], [210, 360], [1300, 700]].map(([x, y], i) => `<g transform="translate(${x} ${y})" fill="${i % 2 ? gold : C.green500}" opacity="0.85"><path d="M0 -18 L5 -5 L18 0 L5 5 L0 18 L-5 5 L-18 0 L-5 -5 Z"/></g>`).join(''));
    return blog('A red telescope gift box with a gold ribbon, its lid lifted off the base', out.join(''));
  },

  // UC-07: export cartons on a strapped pallet beside a 7-ply board section
  'blog-uc-export': () => {
    const P = fitIso([0, 0, 0, 420, 320, 330], { cx: 600, cy: 470, maxW: 760, maxH: 620 });
    const out = [];
    out.push(shadow(P, { x: 0, y: 0, w: 420, d: 320, pad: 30 }));
    out.push(pallet(P, { x: 0, y: 0, z: 0, w: 420, d: 320 }));
    const bw = 205;
    const bd = 155;
    const bh = 140;
    for (let zz = 0; zz < 2; zz++) for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const b = { x: i * (bw + 5) + 2, y: j * (bd + 5) + 2, z: 27 + zz * bh, w: bw, d: bd, h: bh, tape: true };
      out.push(box(P, b));
      if (i === 1 || j === 1) out.push(flutes(P, { ...b, n: 9 }));
    }
    // strapping bands over the top and down the faces
    for (const sx of [100, 310]) {
      out.push(poly(P, [[sx, 0, 307], [sx + 12, 0, 307], [sx + 12, 320, 307], [sx, 320, 307]], C.ink500, { stroke: 'none', op: 0.85 }));
      out.push(poly(P, [[sx, 320, 27], [sx + 12, 320, 27], [sx + 12, 320, 307], [sx, 320, 307]], C.ink500, { stroke: 'none', op: 0.85 }));
    }
    // 7-ply section card
    const sec = boardSection({ x: 1060, y: 320, w: 380, layers: 7, flute: 40, liner: 11, strokeW: 7 });
    out.push(card(1020, 220, 460, sec.height + 260));
    out.push(sec.svg);
    out.push(text(1250, 320 + sec.height + 80, '7-ply', 48, { fill: C.green700 }));
    out.push(text(1250, 320 + sec.height + 128, 'triple wall', 30, { weight: 500, fill: C.ink500 }));
    return blog('Strapped export cartons on a wooden pallet beside a seven-ply corrugated board cross-section', out.join(''));
  },

  // UC-08: packaging mistakes checklist beside an oversized box with a small product rattling inside
  'blog-uc-mistakes': () => {
    const P = fitIso([0, 0, 0, 340, 280, 240], { cx: 520, cy: 480, maxW: 640, maxH: 560 });
    const b = { x: 0, y: 0, z: 0, w: 340, d: 280, h: 160 };
    const item = box(P, { x: 40, y: 40, z: 1, w: 80, d: 60, h: 50, top: C.ink300, left: C.ink500, right: '#3A4840', stroke: C.ink800 });
    const out = [];
    out.push(shadow(P, { ...b, pad: 26 }));
    out.push(hingedBox(P, { ...b, lid: false, contents: item }));
    // empty-space hint
    const [ax, ay] = P(220, 200, 20);
    out.push(`<g stroke="${C.k900}" stroke-width="4" stroke-dasharray="10 10" fill="none" opacity="0.6"><path d="M ${ax - 60} ${ay} q 40 -40 80 0 t 80 0"/></g>`);
    // checklist
    out.push(card(980, 120, 480, 660));
    for (let i = 0; i < 10; i++) {
      const y = 180 + i * 58;
      const done = i < 7;
      out.push(`<rect x="1020" y="${y - 18}" width="36" height="36" rx="8" fill="${done ? C.green600 : C.paper50}" stroke="${done ? C.green700 : C.ink300}" stroke-width="3"/>`);
      if (done) out.push(tick(1038, y, 0.75, C.paper50));
      out.push(bar(1080, y - 7, 300 - (i % 3) * 60, 14, done ? C.ink300 : C.k400, done ? 0.55 : 0.9));
    }
    return blog('An oversized carton with a small product inside beside a ten-point packaging checklist', out.join(''));
  },
};
