/**
 * Blog thumbnails for the second batch of guides (16:9, 1600×900): tool comparison, dieline library, how boxes are made,
 * tile cartons, embedding the designer, export checklist, print routes, festive calendar, stamps and stickers.
 * Same restrained palette and helpers as scenes-blog-n2.mjs: isometric kraft boxes, paper cards, one green accent.
 * No brand names, no logos of other companies, no prices; the only text is generic marks such as "</>".
 * Drawn from primitives (no third-party artwork).
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

/** A box on a spot of the canvas, with an optional mark on its left face. */
function parcel(cx, cy, { dims = [220, 160, 130], colours = {}, maxW = 260, maxH = 190, tape = true, mark = null, shade = true } = {}) {
  const [w, d, h] = dims;
  const P = fitIso([0, 0, 0, w, d, h], { cx, cy, maxW, maxH });
  const b = { x: 0, y: 0, z: 0, w, d, h };
  let out = (shade ? shadow(P, { ...b, pad: 14 }) : '') + box(P, { ...b, ...colours, tape }) + (colours.top ? '' : flutes(P, { ...b, n: 10 }));
  if (mark) out += onFace(P, b, 'L', mark(w, h));
  return out;
}

const dotMark = (color) => (w, h) => `<circle cx="${w * 0.5}" cy="${h * 0.5}" r="${Math.min(w, h) * 0.2}" fill="${color}"/>`;
const diamondMark = (w, h) => `<circle cx="${w * 0.5}" cy="${h * 0.5}" r="${Math.min(w, h) * 0.2}" fill="${C.paper50}"/><polygon points="${w * 0.5},${h * 0.34} ${w * 0.56},${h * 0.5} ${w * 0.5},${h * 0.66} ${w * 0.44},${h * 0.5}" fill="${C.green600}"/>`;

/** A flat cross-shaped dieline: cut outline solid, creases dashed. Origin is the top-left of the bounding box. */
function dieline(x, y, s = 1, { cut = C.ink800, crease = C.green600, fill = C.k200 } = {}) {
  const u = 70 * s; // one panel unit
  const pts = [
    [1, 0], [2, 0], [2, 1], [3, 1], [3, 2], [2, 2], [2, 3], [1, 3], [1, 2], [0, 2], [0, 1], [1, 1],
  ].map(([a, b]) => `${x + a * u},${y + b * u}`).join(' ');
  const dash = (x1, y1, x2, y2) => `<line x1="${x + x1 * u}" y1="${y + y1 * u}" x2="${x + x2 * u}" y2="${y + y2 * u}" stroke="${crease}" stroke-width="${3.5 * s}" stroke-dasharray="${10 * s} ${8 * s}" stroke-linecap="round"/>`;
  return `<polygon points="${pts}" fill="${fill}" stroke="${cut}" stroke-width="${4 * s}" stroke-linejoin="round"/>${dash(1, 1, 2, 1)}${dash(1, 2, 2, 2)}${dash(1, 1, 1, 2)}${dash(2, 1, 2, 2)}`;
}

export const blogP2xScenes = {
  // Tool comparison: three equal cards (template grid, sheet layout, estimate and box), the last one accented
  'blog-p2x-compare': () => {
    const out = [];
    const xs = [110, 590, 1070];
    xs.forEach((x, i) => {
      const accent = i === 2;
      out.push(`<rect x="${x}" y="150" width="420" height="600" rx="26" fill="${accent ? C.paper100 : C.paper50}" stroke="${accent ? C.green600 : C.paper300}" stroke-width="${accent ? 5 : 2}"/>`);
    });
    // card 1: grid of small dielines (library)
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) out.push(dieline(150 + c * 125, 210 + r * 150, 0.3, { fill: C.k200 }));
    out.push(bar(160, 690, 200, 18, C.paper300));
    // card 2: rectangles packed on a sheet (layout)
    out.push(`<rect x="630" y="215" width="340" height="400" rx="10" fill="${C.paper100}" stroke="${C.ink300}" stroke-width="3" stroke-dasharray="14 10"/>`);
    [[645, 230, 150, 110], [805, 230, 150, 110], [645, 350, 110, 120], [765, 350, 190, 120], [645, 480, 160, 120], [815, 480, 140, 120]].forEach(([a, b, w, h]) => out.push(`<rect x="${a}" y="${b}" width="${w}" height="${h}" rx="8" fill="${C.k200}" stroke="${C.k500}" stroke-width="3"/>`));
    out.push(bar(640, 690, 200, 18, C.paper300));
    // card 3: green box and range bar (rupee-free)
    out.push(parcel(1280, 360, { dims: [260, 200, 150], colours: GREEN_BOX, maxW: 330, maxH: 250, tape: false, mark: diamondMark }));
    out.push(bar(1130, 560, 300, 18, C.paper300));
    out.push(bar(1180, 556, 200, 26, C.green600));
    out.push(`<circle cx="1280" cy="569" r="16" fill="${C.white}" stroke="${C.green700}" stroke-width="5"/>`);
    out.push(bar(1130, 690, 200, 18, C.green600));
    return blog('Three equal cards side by side: a grid of small box dielines, rectangles packed on a sheet, and a green 3D box above a range bar', out.join(''));
  },

  // Dieline library: a large flat dieline, an arrow, the folded box, and a row of small dieline thumbnails
  'blog-p2x-dielines': () => {
    const out = [];
    out.push(card(70, 110, 760, 680));
    out.push(dieline(292, 292, 1.5));
    out.push(arrow(850, 450, 960, 450, C.green600, 8));
    out.push(parcel(1230, 400, { dims: [300, 220, 190], colours: GREEN_BOX, maxW: 560, maxH: 440, tape: false, mark: diamondMark }));
    for (let i = 0; i < 5; i++) out.push(dieline(955 + i * 120, 690, 0.28, { fill: C.k200 }));
    return blog('A large flat box dieline with solid cut lines and dashed creases, an arrow to the folded green box, and five small dieline thumbnails', out.join(''));
  },

  // How boxes are made: a paper reel, a wave of flutes between two liners, a stack of sheets, a finished box
  'blog-p2x-made': () => {
    const out = [];
    out.push(card(70, 190, 1460, 520, C.paper50, 30));
    // reel
    out.push(`<circle cx="260" cy="450" r="150" fill="${C.k300}" stroke="${C.k700}" stroke-width="5"/><circle cx="260" cy="450" r="108" fill="none" stroke="${C.k500}" stroke-width="4"/><circle cx="260" cy="450" r="66" fill="none" stroke="${C.k500}" stroke-width="4"/><circle cx="260" cy="450" r="26" fill="${C.paper50}" stroke="${C.k700}" stroke-width="5"/>`);
    out.push(arrow(430, 450, 520, 450));
    // board section (the corrugator output)
    const s = boardSection({ x: 540, y: 400, w: 330, layers: 3, flute: 42, liner: 12, strokeW: 7 });
    out.push(s.svg);
    out.push(arrow(910, 450, 1000, 450));
    // sheets
    for (let i = 0; i < 4; i++) out.push(parcel(1130, 520 - i * 26, { dims: [300, 220, 18], colours: {}, maxW: 260, maxH: 120, tape: false, shade: i === 0 }));
    out.push(arrow(1280, 450, 1350, 450));
    out.push(parcel(1430, 450, { dims: [190, 150, 150], colours: GREEN_BOX, maxW: 170, maxH: 150, tape: false, mark: diamondMark }));
    return blog('A paper reel, then a corrugated board cross-section, then a stack of sheets, then a finished green box, joined by arrows', out.join(''));
  },

  // Tile cartons: a stack of thin square tiles in front of a heavy 7-layer board section and a strapped carton
  'blog-p2x-tile': () => {
    const out = [];
    out.push(card(820, 130, 700, 640));
    const s = boardSection({ x: 900, y: 330, w: 540, layers: 7, flute: 38, liner: 12, strokeW: 7 });
    out.push(s.svg);
    out.push(bar(900, 640, 540, 16, C.paper300));
    out.push(bar(900, 640, 360, 16, C.green600));
    // carton with strapping
    const dims = [300, 300, 90];
    const P = fitIso([0, 0, 0, ...dims], { cx: 400, cy: 600, maxW: 560, maxH: 260 });
    const b = { x: 0, y: 0, z: 0, w: 300, d: 300, h: 90 };
    out.push(shadow(P, { ...b, pad: 16 }) + box(P, { ...b, tape: false }) + flutes(P, { ...b, n: 12 }));
    // strap bands over top and front
    out.push(`<polyline points="${[P(150, 0, 90), P(150, 300, 90)].map((p) => p.join(',')).join(' ')}" fill="none" stroke="${C.green700}" stroke-width="9" stroke-linecap="round"/>`);
    out.push(`<polyline points="${[P(150, 300, 90), P(150, 300, 0)].map((p) => p.join(',')).join(' ')}" fill="none" stroke="${C.green700}" stroke-width="9" stroke-linecap="round"/>`);
    // a tile stack above
    for (let i = 0; i < 4; i++) {
      const T = fitIso([0, 0, 0, 280, 280, 14], { cx: 400, cy: 330 - i * 24, maxW: 440, maxH: 180 });
      out.push(box(T, { x: 0, y: 0, z: 0, w: 280, d: 280, h: 14, ...WHITE_BOX, sw: 1.6 }));
    }
    return blog('A stack of four thin square tiles above a strapped flat carton, beside a seven-layer corrugated board cross-section', out.join(''));
  },

  // Embed: a browser window with a 3D box in it, and a code mark
  'blog-p2x-embed': () => {
    const out = [];
    out.push(card(140, 120, 940, 660, C.paper50, 28));
    out.push(`<rect x="140" y="120" width="940" height="76" rx="28" fill="${C.paper200}"/><rect x="140" y="170" width="940" height="26" fill="${C.paper200}"/>`);
    [190, 232, 274].forEach((cx, i) => out.push(`<circle cx="${cx}" cy="158" r="12" fill="${i === 0 ? C.green600 : C.ink300}"/>`));
    out.push(bar(340, 142, 520, 32, C.paper50, 16));
    // page content: lines of text on the left, embedded frame on the right
    [[190, 250, 360], [190, 290, 300], [190, 330, 340], [190, 370, 240]].forEach(([x, y, w]) => out.push(bar(x, y, w, 16, C.paper300)));
    [[190, 450, 300], [190, 490, 340], [190, 530, 260], [190, 570, 320]].forEach(([x, y, w]) => out.push(bar(x, y, w, 16, C.paper300)));
    out.push(`<rect x="560" y="230" width="470" height="500" rx="18" fill="${C.paper100}" stroke="${C.green600}" stroke-width="5"/>`);
    out.push(parcel(795, 440, { dims: [260, 200, 140], colours: GREEN_BOX, maxW: 380, maxH: 280, tape: false, mark: diamondMark }));
    [0, 1, 2, 3].forEach((i) => out.push(`<circle cx="${680 + i * 40}" cy="670" r="12" fill="${i === 1 ? C.green600 : C.paper300}"/>`));
    // code mark
    out.push(`<circle cx="1330" cy="400" r="190" fill="${C.green600}"/>`);
    out.push(text(1330, 440, '&lt;/&gt;', 130, { fill: C.white }));
    return blog('A web page in a browser window with a 3D green box inside a framed area, and a green circle with a code mark beside it', out.join(''));
  },

  // Export checklist: a wrapped pallet of cartons beside a checklist
  'blog-p2x-export': () => {
    const out = [];
    const P = fitIso([0, 0, 0, 360, 300, 360], { cx: 420, cy: 470, maxW: 640, maxH: 600 });
    out.push(shadow(P, { x: 0, y: 0, w: 360, d: 300, pad: 30 }));
    out.push(pallet(P, { x: 0, y: 0, w: 360, d: 300 }));
    // two layers of 3 x 2 cartons
    for (let layer = 0; layer < 2; layer++) {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
          out.push(box(P, { x: i * 120, y: j * 150, z: 27 + layer * 130, w: 120, d: 150, h: 130, tape: true }));
        }
      }
    }
    out.push(card(860, 110, 660, 680));
    ['Importer asked', 'Forwarder asked', 'Marks agreed', 'Pallet plan', 'Wood treated'].forEach((label, i) => {
      const y = 215 + i * 118;
      out.push(`<circle cx="940" cy="${y}" r="36" fill="${C.green600}"/>${tick(940, y, 0.9, C.white)}`);
      out.push(text(1000, y + 13, label, 38, { anchor: 'start', weight: 600 }));
    });
    return blog('A pallet of wrapped cartons beside a five-line checklist, each line with a green tick', out.join(''));
  },

  // Print routes: three boxes, each with a different kind of print, over three simple bars
  'blog-p2x-print': () => {
    const out = [];
    const marks = [
      (w, h) => `<circle cx="${w * 0.5}" cy="${h * 0.5}" r="${Math.min(w, h) * 0.22}" fill="${C.green600}"/><rect x="${w * 0.22}" y="${h * 0.78}" width="${w * 0.56}" height="${h * 0.06}" fill="${C.green600}"/>`,
      (w, h) => `<defs><linearGradient id="gp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.cyan400}"/><stop offset="0.55" stop-color="${C.green500}"/><stop offset="1" stop-color="${C.k400}"/></linearGradient></defs><rect x="${w * 0.18}" y="${h * 0.16}" width="${w * 0.64}" height="${h * 0.62}" rx="${h * 0.06}" fill="url(#gp)"/>`,
      (w, h) => Array.from({ length: 12 }, (_, i) => `<circle cx="${w * (0.2 + (i % 4) * 0.2)}" cy="${h * (0.25 + Math.floor(i / 4) * 0.25)}" r="${h * 0.05}" fill="${[C.green600, C.cyan700, C.k700][i % 3]}"/>`).join(''),
    ];
    [0, 1, 2].forEach((i) => {
      const cx = 330 + i * 470;
      out.push(card(cx - 200, 150, 400, 520));
      out.push(parcel(cx, 380, { dims: [250, 190, 160], colours: i === 1 ? WHITE_BOX : {}, maxW: 330, maxH: 270, tape: i !== 1, mark: marks[i] }));
      out.push(bar(cx - 110, 590, 220, 18, C.paper300));
      out.push(bar(cx - 110, 590, [150, 220, 90][i], 18, C.green600));
    });
    return blog('Three boxes side by side, one with a solid one-colour mark, one with a full-colour gradient panel and one with a pattern of dots', out.join(''));
  },

  // Calendar: a month grid with a few highlighted days, and a gift box with a ribbon
  'blog-p2x-calendar': () => {
    const out = [];
    out.push(card(110, 110, 880, 680));
    out.push(`<rect x="110" y="110" width="880" height="110" rx="22" fill="${C.green600}"/><rect x="110" y="190" width="880" height="30" fill="${C.green600}"/>`);
    out.push(bar(160, 150, 300, 26, C.paper50));
    const hi = new Set([3, 9, 10, 17, 22]);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 6; c++) {
        const n = r * 6 + c;
        const x = 150 + c * 138;
        const y = 260 + r * 125;
        const on = hi.has(n);
        out.push(`<rect x="${x}" y="${y}" width="110" height="95" rx="16" fill="${on ? C.green600 : C.paper100}" stroke="${on ? C.green700 : C.paper300}" stroke-width="2"/>`);
        out.push(bar(x + 18, y + 20, 40, 12, on ? C.paper50 : C.paper300));
        if (on) out.push(tick(x + 55, y + 62, 0.7, C.white));
      }
    }
    // gift box with ribbon
    const dims = [260, 260, 130];
    const P = fitIso([0, 0, 0, ...dims], { cx: 1270, cy: 450, maxW: 480, maxH: 400 });
    const b = { x: 0, y: 0, z: 0, w: 260, d: 260, h: 130 };
    out.push(shadow(P, { ...b, pad: 22 }) + box(P, { ...b, ...GREEN_BOX, tape: false }));
    out.push(`<polygon points="${[P(110, 0, 130), P(150, 0, 130), P(150, 260, 130), P(110, 260, 130)].map((p) => p.join(',')).join(' ')}" fill="${C.paper50}" opacity="0.95"/>`);
    out.push(`<polygon points="${[P(0, 110, 130), P(260, 110, 130), P(260, 150, 130), P(0, 150, 130)].map((p) => p.join(',')).join(' ')}" fill="${C.paper50}" opacity="0.95"/>`);
    return blog('A month calendar grid with five highlighted days next to a green gift box with a pale ribbon across the lid', out.join(''));
  },

  // Stamps and stickers: a plain kraft box with a green circular mark, a stamp tool and a round sticker
  'blog-p2x-stamps': () => {
    const out = [];
    out.push(parcel(560, 480, { dims: [320, 240, 190], maxW: 640, maxH: 480, tape: true, mark: (w, h) => `<circle cx="${w * 0.5}" cy="${h * 0.5}" r="${Math.min(w, h) * 0.26}" fill="none" stroke="${C.green600}" stroke-width="${h * 0.035}"/><circle cx="${w * 0.5}" cy="${h * 0.5}" r="${Math.min(w, h) * 0.19}" fill="none" stroke="${C.green600}" stroke-width="${h * 0.014}" stroke-dasharray="${h * 0.03} ${h * 0.025}"/><polygon points="${w * 0.5},${h * 0.37} ${w * 0.56},${h * 0.5} ${w * 0.5},${h * 0.63} ${w * 0.44},${h * 0.5}" fill="${C.green600}"/>` }));
    out.push(card(1000, 120, 520, 660));
    // stamp tool: handle and base, with the mark underneath
    out.push(`<rect x="1215" y="190" width="90" height="170" rx="40" fill="${C.green600}"/><rect x="1180" y="350" width="160" height="34" rx="12" fill="${C.green700}"/><rect x="1170" y="384" width="180" height="64" rx="10" fill="${C.k300}" stroke="${C.k700}" stroke-width="4"/>`);
    out.push(`<circle cx="1260" cy="560" r="82" fill="none" stroke="${C.green600}" stroke-width="12" opacity="0.9"/><polygon points="1260,520 1288,560 1260,600 1232,560" fill="${C.green600}"/>`);
    // round sticker beside the stamped mark
    out.push(`<circle cx="1410" cy="690" r="62" fill="${C.paper50}" stroke="${C.ink300}" stroke-width="3"/><circle cx="1410" cy="690" r="44" fill="${C.green600}"/>${tick(1410, 690, 0.8, C.white)}`);
    return blog('A kraft box with a green round stamp mark, a stamp tool above a green stamped mark, and a round sticker', out.join(''));
  },
};
