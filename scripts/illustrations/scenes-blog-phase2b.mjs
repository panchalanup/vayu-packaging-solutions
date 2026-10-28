/**
 * Blog thumbnails for the phase 2 designer articles (16:9, 1600×900): cutouts, templates, style picker, build ideas,
 * vents / hand holes / windows. Same restrained palette and helpers as scenes-blog.mjs: isometric kraft boxes, paper
 * cards, one green accent. Everything is drawn from primitives (no third-party artwork, no brands).
 * SECURITY: build-time only; output is static, script-free SVG.
 */
import { C, fitIso, box, flutes, shadow, svg } from './lib.mjs';

const W = 1600;
const H = 900;
const FONT = `font-family="Satoshi, 'Segoe UI', Arial, sans-serif"`;
const blog = (title, body) => svg({ w: W, h: H, title, body });
const text = (x, y, s, size = 40, { weight = 700, fill = C.ink800, anchor = 'middle' } = {}) =>
  `<text x="${x}" y="${y}" ${FONT} font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${s}</text>`;
const card = (x, y, w, h, fill = C.paper50, rx = 22) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${C.paper300}" stroke-width="2"/>`;
const arrow = (x1, y1, x2, y2, color = C.green600, w = 6) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 16;
  const p1 = [x2 - Math.cos(a - 0.45) * h, y2 - Math.sin(a - 0.45) * h];
  const p2 = [x2 - Math.cos(a + 0.45) * h, y2 - Math.sin(a + 0.45) * h];
  return `<g stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><polyline points="${p1.join(',')} ${x2},${y2} ${p2.join(',')}"/></g>`;
};

const RED = '#C8553D';
const SUN = '#E3A63C';
const WHITE_BOX = { top: C.white, left: '#EFE8DA', right: '#DDD3C0', stroke: C.ink300 };
const GREEN_BOX = { top: C.green500, left: C.green600, right: C.green700, stroke: C.green700 };

/** Group that maps flat 2D drawing coordinates (u right, v down, in the box's own units) onto a visible face. */
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

// ---- flat sticker shapes, centred on 0,0, about 100 units across -------------------------------------------------
const apple = (fill = RED) =>
  `<circle cx="0" cy="6" r="40" fill="${fill}"/><path d="M 0 -30 C 4 -48 18 -54 28 -52 C 24 -38 12 -30 0 -30 Z" fill="${C.green600}"/><rect x="-2" y="-34" width="4" height="12" rx="2" fill="${C.k900}"/>`;
const star = (fill = C.green600, r = 44) => {
  const v = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    return `${Math.round(Math.cos(a) * rr * 10) / 10},${Math.round(Math.sin(a) * rr * 10) / 10}`;
  });
  return `<polygon points="${v.join(' ')}" fill="${fill}" stroke-linejoin="round"/>`;
};
const leaf = (fill = C.green500) => `<path d="M -40 30 C -40 -30 10 -46 42 -42 C 44 -4 20 40 -40 30 Z" fill="${fill}"/><path d="M -36 28 L 22 -22" stroke="${C.paper50}" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.8"/>`;
const badge = (fill = SUN) => `<circle r="42" fill="${fill}"/><circle r="32" fill="none" stroke="${C.paper50}" stroke-width="4"/><polygon points="0,-18 5,-6 18,-6 8,3 12,16 0,8 -12,16 -8,3 -18,-6 -5,-6" fill="${C.paper50}"/>`;
const bottle = (fill = C.cyan700) => `<rect x="-14" y="-46" width="28" height="22" rx="6" fill="${fill}"/><rect x="-26" y="-28" width="52" height="76" rx="14" fill="${fill}"/><rect x="-18" y="2" width="36" height="22" rx="4" fill="${C.paper50}" opacity="0.9"/>`;
const gift = (fill = C.green600) => `<rect x="-38" y="-14" width="76" height="52" rx="6" fill="${fill}"/><rect x="-42" y="-30" width="84" height="22" rx="6" fill="${fill}"/><rect x="-6" y="-30" width="12" height="68" fill="${C.paper50}"/><path d="M 0 -30 C -22 -58 -40 -36 0 -30 C 40 -36 22 -58 0 -30 Z" fill="none" stroke="${C.paper50}" stroke-width="5" stroke-linejoin="round"/>`;
const tshirt = (fill = C.ink800) => `<path d="M -22 -40 L -46 -22 L -34 -4 L -26 -10 L -26 40 L 26 40 L 26 -10 L 34 -4 L 46 -22 L 22 -40 C 14 -28 -14 -28 -22 -40 Z" fill="${fill}"/>`;

const at = (x, y, s, inner, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${inner}</g>`;

/** Mini box on a spot of the canvas. kind adds the decoration that identifies the style. */
function mini(cx, cy, { dims = [220, 160, 130], colours = {}, deco = '', maxW = 220, maxH = 150, tape = false } = {}) {
  const [w, d, h] = dims;
  const P = fitIso([0, 0, 0, w, d, h], { cx, cy, maxW, maxH });
  const b = { x: 0, y: 0, z: 0, w, d, h };
  return shadow(P, { ...b, pad: 14 }) + box(P, { ...b, ...colours, tape }) + (colours.top ? '' : flutes(P, { ...b, n: 10 })) + (deco ? deco(P, b) : '');
}
const ventSlots = (P, b) => onFace(P, b, 'L', [0, 1, 2].map((i) => `<rect x="${b.w * 0.2}" y="${b.h * (0.22 + i * 0.22)}" width="${b.w * 0.6}" height="${b.h * 0.1}" rx="${b.h * 0.05}" fill="#2B2118"/>`).join(''));
const windowFace = (P, b) => onFace(P, b, 'L', `<rect x="${b.w * 0.18}" y="${b.h * 0.2}" width="${b.w * 0.64}" height="${b.h * 0.6}" rx="${b.h * 0.08}" fill="#D3EEF7" stroke="${C.cyan700}" stroke-width="2.5" opacity="0.95"/>`);
const stripe = (P, b) => onFace(P, b, 'L', `<rect x="0" y="${b.h * 0.42}" width="${b.w}" height="${b.h * 0.16}" fill="${C.paper50}" opacity="0.9"/>`);
const sticker = (inner, s = 1) => (P, b) => onFace(P, b, 'L', at(b.w / 2, b.h / 2, (Math.min(b.h * 0.75, b.w * 0.5) / 90) * s, inner));

export const blogPhase2bScenes = {
  // Cutouts guide: stickers on a box, a pattern on the side, a sticker library card with brand colour swatches
  'blog-dg-cutouts': () => {
    const out = [];
    const b = { x: 0, y: 0, w: 300, d: 210, h: 200 };
    const P = fitIso([-20, -20, 0, 320, 230, 200], { cx: 520, cy: 470, maxW: 780, maxH: 640 });
    out.push(shadow(P, { ...b, pad: 30 }) + box(P, b) + flutes(P, { ...b, n: 15 }));
    out.push(onFace(P, b, 'L', at(86, 104, 1.05, apple()) + at(212, 78, 0.7, star(), 8) + at(200, 150, 0.6, leaf(), -20) + at(244, 150, 0.4, apple(SUN))));
    // repeating pattern on the short side
    const tiles = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) tiles.push(at(30 + c * 50 + (r % 2) * 25, 28 + r * 46, 0.28, leaf(C.green600), 20));
    out.push(onFace(P, b, 'R', tiles.join('')));
    // library card
    out.push(card(1010, 170, 500, 560));
    out.push(text(1050, 238, 'Cutouts', 38, { anchor: 'start' }));
    const items = [apple(), gift(), star(), tshirt(), leaf(), badge(), bottle(), apple(SUN), star(C.cyan700)];
    items.forEach((it, i) => {
      const x = 1092 + (i % 3) * 150;
      const y = 340 + Math.floor(i / 3) * 128;
      out.push(`<rect x="${x - 56}" y="${y - 52}" width="112" height="104" rx="16" fill="${C.paper100}" stroke="${C.paper300}" stroke-width="2"/>` + at(x, y, 0.8, it));
    });
    // brand colour swatches
    [C.green600, C.ink800, C.cyan700, C.k500, RED].forEach((c, i) => {
      out.push(`<circle cx="${1080 + i * 76}" cy="690" r="22" fill="${c}"${i === 0 ? ` stroke="${C.ink800}" stroke-width="4"` : ''}/>`);
    });
    return blog('A box with fruit stickers and a leaf pattern beside a library of cutout stickers and brand colour swatches', out.join(''));
  },

  // Templates tour: a gallery of ready box designs
  'blog-dg-templates': () => {
    const out = [card(70, 90, 1460, 720)];
    out.push(`<rect x="120" y="126" width="520" height="56" rx="28" fill="${C.paper100}" stroke="${C.paper300}" stroke-width="2"/><circle cx="156" cy="152" r="11" fill="none" stroke="${C.ink500}" stroke-width="4"/><line x1="165" y1="161" x2="175" y2="171" stroke="${C.ink500}" stroke-width="4" stroke-linecap="round"/><rect x="196" y="146" width="190" height="14" rx="7" fill="${C.ink300}" opacity="0.6"/>`);
    ['', '', '', ''].forEach((_, i) => out.push(`<rect x="${700 + i * 190}" y="132" width="${i === 0 ? 150 : 170}" height="44" rx="22" fill="${i === 0 ? C.green600 : C.paper100}" stroke="${i === 0 ? C.green700 : C.paper300}" stroke-width="2"/>`));
    const cells = [
      { dims: [220, 160, 140], deco: ventSlots },
      { dims: [220, 220, 70], colours: WHITE_BOX, deco: windowFace },
      { dims: [260, 190, 50], colours: GREEN_BOX, deco: sticker(star(C.paper50)) },
      { dims: [110, 110, 190], colours: WHITE_BOX, deco: sticker(leaf(C.green600)) },
      { dims: [230, 170, 120], deco: sticker(apple()), tape: true },
      { dims: [240, 180, 70], colours: { top: '#D9C7A4', left: '#B79A6B', right: '#9C8052', stroke: C.k900 }, deco: stripe },
    ];
    cells.forEach((c, i) => {
      const x = 120 + (i % 3) * 470;
      const y = 220 + Math.floor(i / 3) * 290;
      out.push(`<rect x="${x}" y="${y}" width="430" height="260" rx="18" fill="${C.paper100}" stroke="${C.paper300}" stroke-width="2"/>`);
      out.push(mini(x + 215, y + 120, { ...c, maxW: 300, maxH: 170 }));
      out.push(`<rect x="${x + 30}" y="${y + 226}" width="${150 + (i % 3) * 30}" height="12" rx="6" fill="${C.ink300}" opacity="0.7"/>`);
    });
    return blog('A gallery of ready-made box templates: a ventilated carton, a window cake box, a flat mailer, a tall carton and a gift box', out.join(''));
  },

  // Style picker: what are you packing -> which style
  'blog-dg-picker': () => {
    const out = [card(70, 80, 1460, 740)];
    const rows = [
      { chip: 'Fruit', mini: { dims: [220, 160, 120], deco: ventSlots } },
      { chip: 'Cake', mini: { dims: [220, 220, 80], colours: WHITE_BOX, deco: windowFace } },
      { chip: 'Clothes', mini: { dims: [260, 190, 50], colours: GREEN_BOX, deco: stripe } },
      { chip: 'Cosmetics', mini: { dims: [100, 100, 200], colours: WHITE_BOX, deco: sticker(leaf(C.green600)) } },
      { chip: 'Bottles', mini: { dims: [100, 100, 210], deco: sticker(bottle()) } },
    ];
    rows.forEach((r, i) => {
      const y = 120 + i * 140;
      out.push(`<rect x="130" y="${y + 18}" width="330" height="86" rx="43" fill="${C.paper100}" stroke="${C.paper300}" stroke-width="2"/>`);
      out.push(text(295, y + 74, r.chip, 38));
      out.push(arrow(490, y + 61, 760, y + 61));
      out.push(`<rect x="800" y="${y + 4}" width="330" height="114" rx="18" fill="${C.paper100}" stroke="${C.paper300}" stroke-width="2"/>`);
      out.push(mini(965, y + 66, { ...r.mini, maxW: 250, maxH: 100 }));
      out.push(`<circle cx="1260" cy="${y + 61}" r="30" fill="${C.green600}"/>` + `<polyline points="1246,${y + 62} 1257,${y + 73} 1276,${y + 50}" fill="none" stroke="${C.paper50}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`);
      out.push(`<rect x="1310" y="${y + 52}" width="${130 - (i % 3) * 18}" height="14" rx="7" fill="${C.ink300}" opacity="0.6"/>`);
    });
    return blog('Product chips such as fruit, cake, clothes, cosmetics and bottles, each pointing to a suitable box style', out.join(''));
  },

  // Build ideas: a grid of finished designs
  'blog-uc-ideas': () => {
    const out = [];
    const cells = [
      { dims: [220, 160, 140], deco: ventSlots },
      { dims: [220, 220, 80], colours: WHITE_BOX, deco: windowFace },
      { dims: [250, 190, 55], colours: GREEN_BOX, deco: sticker(tshirt(C.paper50)) },
      { dims: [110, 110, 190], colours: WHITE_BOX, deco: sticker(leaf(C.green600)) },
      { dims: [220, 160, 110], deco: sticker(gift()) },
      { dims: [100, 100, 210], deco: sticker(bottle()) },
      { dims: [240, 180, 60], colours: WHITE_BOX, deco: sticker(star(C.green600)) },
      { dims: [180, 140, 120], deco: sticker(apple()), tape: true },
      { dims: [230, 170, 70], colours: GREEN_BOX, deco: stripe },
      { dims: [200, 150, 150], deco: sticker(badge()), tape: true },
      { dims: [240, 200, 60], colours: WHITE_BOX, deco: windowFace },
      { dims: [120, 120, 170], colours: GREEN_BOX, deco: sticker(star(C.paper50)) },
    ];
    cells.forEach((c, i) => {
      const x = 90 + (i % 4) * 360;
      const y = 120 + Math.floor(i / 4) * 255;
      out.push(`<rect x="${x}" y="${y}" width="330" height="225" rx="20" fill="${C.paper50}" stroke="${C.paper300}" stroke-width="2"/>`);
      out.push(mini(x + 165, y + 100, { ...c, maxW: 230, maxH: 140 }));
      out.push(`<rect x="${x + 28}" y="${y + 186}" width="${110 + (i % 3) * 28}" height="12" rx="6" fill="${C.ink300}" opacity="0.7"/>`);
    });
    out.push(`<circle cx="1440" cy="130" r="74" fill="${C.green600}"/>` + text(1440, 150, '20', 62, { fill: C.paper50 }));
    return blog('Twelve different finished box designs in a grid, with a badge showing twenty ideas', out.join(''));
  },

  // Vents, hand holes and windows
  'blog-dg-openings': () => {
    const out = [];
    const b = { x: 0, y: 0, w: 300, d: 200, h: 190 };
    const P = fitIso([-20, -20, 0, 320, 220, 190], { cx: 520, cy: 470, maxW: 780, maxH: 640 });
    out.push(shadow(P, { ...b, pad: 30 }) + box(P, b) + flutes(P, { ...b, n: 15 }));
    // vent slots on the long side
    out.push(onFace(P, b, 'L', [0, 1, 2].map((i) => `<rect x="${44 + i * 78}" y="${52}" width="42" height="${86}" rx="21" fill="#2B2118"/><rect x="${48 + i * 78}" y="${58}" width="34" height="${74}" rx="17" fill="none" stroke="${C.k900}" stroke-width="2" opacity="0.5"/>`).join('')));
    // hand hole on the short side
    out.push(onFace(P, b, 'R', `<rect x="${b.d / 2 - 50}" y="30" width="100" height="30" rx="15" fill="#2B2118"/>`));
    // strength gauge card
    out.push(card(1010, 170, 500, 560));
    out.push(text(1050, 238, 'Strength', 38, { anchor: 'start' }));
    const base = 660;
    out.push(`<line x1="1060" y1="${base}" x2="1470" y2="${base}" stroke="${C.ink500}" stroke-width="4" stroke-linecap="round"/>`);
    out.push(`<rect x="1090" y="320" width="120" height="${base - 320}" rx="10" fill="${C.green600}"/>`);
    out.push(`<rect x="1300" y="450" width="120" height="${base - 450}" rx="10" fill="${C.k400}"/>`);
    out.push(`<rect x="1300" y="320" width="120" height="130" rx="10" fill="none" stroke="${C.ink500}" stroke-width="3" stroke-dasharray="12 9"/>`);
    out.push(text(1150, base + 44, 'Plain', 28, { weight: 500 }) + text(1360, base + 44, 'Cut-outs', 28, { weight: 500 }));
    out.push(`<polygon points="1255,262 1292,326 1218,326" fill="${SUN}" stroke="${C.k900}" stroke-width="3" stroke-linejoin="round"/><rect x="1252" y="285" width="6" height="22" rx="3" fill="${C.ink800}"/><circle cx="1255" cy="315" r="3.5" fill="${C.ink800}"/>`);
    return blog('A carton with vent slots and a hand hole beside a strength comparison between a plain wall and one with cut-outs', out.join(''));
  },
};
