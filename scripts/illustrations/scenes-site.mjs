/** Industry, process and About illustrations (4:3 canvas, 1200×900). Text-free except dieline dimension letters. */
import { C, fitIso, poly, line3, box, flutes, openBox, pallet, shadow, svg, boardSection } from './lib.mjs';
import { productScenes } from './scenes-products.mjs';

const FONT = `font-family="Satoshi, 'Segoe UI', Arial, sans-serif"`;

/** Quad on the left (front-y) face of a cuboid; u along x, v along z. */
const faceL = (P, b, u0, v0, u1, v1, fill, o = {}) =>
  poly(P, [[b.x + u0, b.y + b.d, b.z + v0], [b.x + u1, b.y + b.d, b.z + v0], [b.x + u1, b.y + b.d, b.z + v1], [b.x + u0, b.y + b.d, b.z + v1]], fill, { stroke: 'none', ...o });

/** 2D glyph placed on the left face plane (matrix maps u→screen along x-axis, v→up). */
const onLeftFace = (P, b, u, v, inner) => {
  const [cx, cy] = P(b.x + u, b.y + b.d, b.z + v);
  return `<g transform="translate(${cx} ${cy}) matrix(0.866 0.5 0 -1 0 0)">${inner}</g>`;
};

const gear = (r, color) =>
  `<circle r="${r}" fill="none" stroke="${color}" stroke-width="${r * 0.42}" stroke-dasharray="${(2 * Math.PI * (r + r * 0.21)) / 16 / 2} ${(2 * Math.PI * (r + r * 0.21)) / 16 / 2}"/><circle r="${r * 0.82}" fill="${color}"/><circle r="${r * 0.36}" fill="${C.paper100}"/>`;

const barcode = (P, b, u0, v0, u1, v1) => {
  const out = [faceL(P, b, u0, v0, u1, v1, C.paper50, { stroke: C.k700, sw: 0.8 })];
  const n = 14;
  for (let i = 0; i < n; i++) {
    if (i % 3 === 2) continue;
    const a = u0 + 6 + ((u1 - u0 - 12) * i) / n;
    out.push(faceL(P, b, a, v0 + 8, a + (i % 2 ? 2.2 : 3.6), v0 + (v1 - v0) * 0.55, C.ink800));
  }
  out.push(faceL(P, b, u0 + 6, v1 - 12, u0 + (u1 - u0) * 0.55, v1 - 7, C.ink300));
  return out.join('');
};

export const siteScenes = {
  'industry-ecommerce': () => {
    const P = fitIso([0, 0, 0, 400, 300, 140]);
    const a = { x: 0, y: 0, z: 0, w: 230, d: 170, h: 120 };
    const m = { x: 225, y: 150, z: 0, w: 170, d: 140, h: 56, top: C.green500, left: C.green600, right: C.green700, stroke: C.green700 };
    return svg({
      title: 'Taped shipping carton with a courier label and a green mailer box',
      body:
        shadow(P, { x: 0, y: 0, w: 400, d: 290 }) +
        box(P, { ...a, tape: true }) + flutes(P, { ...a, n: 15 }) + barcode(P, a, 40, 28, 130, 84) +
        box(P, m) +
        poly(P, [[m.x + 22, m.y + 22, m.h + 0.1], [m.x + m.w - 22, m.y + 22, m.h + 0.1], [m.x + m.w - 22, m.y + m.d - 22, m.h + 0.1], [m.x + 22, m.y + m.d - 22, m.h + 0.1]], 'none', { stroke: C.paper50, sw: 1.3, dash: '5 5', op: 0.8 }),
    });
  },

  'industry-fmcg': () => {
    const P = fitIso([0, 0, 0, 320, 260, 260]);
    const pal = { x: 0, y: 0, w: 320, d: 260 };
    const cartons = [];
    for (let layer = 0; layer < 3; layer++) {
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          cartons.push({ x: 6 + i * 155, y: 6 + j * 125, z: 27 + layer * 66, w: 152, d: 122, h: 66 });
        }
      }
    }
    cartons.sort((p, q) => p.z - q.z || p.x + p.y - (q.x + q.y));
    const wrap = [];
    for (let k = 1; k < 9; k++) {
      const t = k / 9;
      wrap.push(line3(P, [pal.w * t, pal.d - 2, 30], [pal.w * t, pal.d - 2, 224], { stroke: '#fff', sw: 1.4, op: 0.5 }));
    }
    return svg({
      title: 'Pallet of stacked cartons wrapped in stretch film',
      body:
        shadow(P, { ...pal, pad: 34 }) + pallet(P, pal) +
        cartons.map((c) => box(P, { ...c, tape: true, sw: 1 })).join('') +
        wrap.join(''),
    });
  },

  'industry-electronics': () => {
    const P = fitIso([0, 0, 0, 380, 300, 230], { maxW: 680 });
    const open = { x: 20, y: 40, z: 0, w: 320, d: 220, h: 100 };
    // laptop lying in the box on foam corners
    const lap = [
      poly(P, [[50, 60, 52], [300, 60, 52], [300, 200, 52], [50, 200, 52]], '#3C4A42', { stroke: C.ink800, sw: 1 }),
      poly(P, [[60, 70, 52.2], [290, 70, 52.2], [290, 190, 52.2], [60, 190, 52.2]], '#8FA39A', { stroke: 'none' }),
    ].join('');
    const foam = [
      [34, 52], [276, 52], [34, 176], [276, 176],
    ].map(([x, y]) => box(P, { x, y, z: 0, w: 36, d: 36, h: 52, top: C.paper50, left: C.paper200, right: C.paper300, stroke: C.paper300, sw: 0.8 })).join('');
    return svg({
      title: 'Electronics carton with foam corner protectors around a laptop',
      body: shadow(P, { x: 20, y: 40, w: 320, d: 220 }) + openBox(P, { ...open, back: 60, front: -35, contents: foam + lap }) + flutes(P, { ...open, n: 15, op: 0.12 }),
    });
  },

  'industry-food': () => productScenes['product-food-grade'](),

  'industry-pharma': () => {
    const P = fitIso([0, 0, 0, 380, 300, 150]);
    const a = { x: 0, y: 0, z: 0, w: 230, d: 170, h: 130, top: C.paper100, left: C.paper50, right: C.paper200 };
    const vial = (x, y, h, cap) => box(P, { x, y, z: 0, w: 44, d: 44, h, top: '#EAF4F6', left: '#DCEBEE', right: '#C5DDE2', stroke: C.cyan700, sw: 1 }) + box(P, { x: x + 5, y: y + 5, z: h, w: 34, d: 34, h: 20, top: cap, left: cap, right: cap, stroke: C.ink800, sw: 1 });
    return svg({
      title: 'Clean white carton with a medical cross, beside pharmaceutical vials',
      body:
        shadow(P, { x: 0, y: 0, w: 430, d: 300 }) +
        box(P, { ...a, tape: true }) +
        onLeftFace(P, a, a.w * 0.5, a.h * 0.5, `<rect x="-14" y="-40" width="28" height="80" rx="4" fill="${C.green600}"/><rect x="-40" y="-14" width="80" height="28" rx="4" fill="${C.green600}"/>`) +
        vial(250, 150, 90, C.green600) + vial(300, 190, 120, C.green600) + vial(255, 215, 70, C.cyan700),
    });
  },

  'industry-auto': () => {
    const P = fitIso([0, 0, 0, 320, 260, 240]);
    const pal = { x: 0, y: 0, w: 320, d: 260 };
    const a = { x: 8, y: 8, z: 27, w: 304, d: 244, h: 200 };
    const corner = (x, y) => box(P, { x, y, z: 27, w: 12, d: 12, h: 200, top: C.ink500, left: C.ink500, right: C.ink800, stroke: C.ink800, sw: 0.8 });
    return svg({
      title: 'Heavy-duty carton on a pallet with a gear part marking and corner protectors',
      body:
        shadow(P, { ...pal, pad: 34 }) + pallet(P, pal) +
        box(P, { ...a, tape: true }) + flutes(P, { ...a, n: 18, op: 0.14 }) +
        onLeftFace(P, a, a.w * 0.5, a.h * 0.5, gear(46, C.ink800)) +
        corner(a.x + a.w - 12, a.y + a.d - 12),
    });
  },

  // ---------------------------------------------------------------- process
  'process-spec': () => {
    const L = 270, B = 170, H = 215, fl = B / 2, gl = 50;
    const x0 = 150, y0 = 330;
    const panels = [L, B, L, B];
    const xs = [x0];
    panels.forEach((w, i) => xs.push(xs[i] + w));
    const cut = C.ink800;
    const out = [];
    out.push(`<rect x="60" y="120" width="1080" height="700" rx="18" fill="${C.paper50}" stroke="${C.paper300}" stroke-width="2"/>`);
    // grid
    for (let g = 0; g <= 1080; g += 40) out.push(`<line x1="${60 + g}" y1="120" x2="${60 + g}" y2="820" stroke="${C.paper200}" stroke-width="1"/>`);
    for (let g = 0; g <= 700; g += 40) out.push(`<line x1="60" y1="${120 + g}" x2="1140" y2="${120 + g}" stroke="${C.paper200}" stroke-width="1"/>`);
    // body panels
    panels.forEach((w, i) => out.push(`<rect x="${xs[i]}" y="${y0}" width="${w}" height="${H}" fill="${C.k300}" stroke="${cut}" stroke-width="2.5"/>`));
    out.push(`<polygon points="${x0},${y0 + 10} ${x0 - gl},${y0 + 28} ${x0 - gl},${y0 + H - 28} ${x0},${y0 + H - 10}" fill="${C.k400}" stroke="${cut}" stroke-width="2.5"/>`);
    // flaps
    panels.forEach((w, i) => {
      out.push(`<rect x="${xs[i]}" y="${y0 - fl}" width="${w}" height="${fl}" fill="${C.k400}" stroke="${cut}" stroke-width="2.5"/>`);
      out.push(`<rect x="${xs[i]}" y="${y0 + H}" width="${w}" height="${fl}" fill="${C.k400}" stroke="${cut}" stroke-width="2.5"/>`);
    });
    // fold lines
    [y0, y0 + H].forEach((y) => out.push(`<line x1="${x0}" y1="${y}" x2="${xs[4]}" y2="${y}" stroke="${C.green700}" stroke-width="2.5" stroke-dasharray="3 7" stroke-linecap="round"/>`));
    xs.slice(1, 4).forEach((x) => out.push(`<line x1="${x}" y1="${y0 - fl}" x2="${x}" y2="${y0 + H + fl}" stroke="${C.green700}" stroke-width="2.5" stroke-dasharray="3 7" stroke-linecap="round"/>`));
    // dimension lines
    const dim = (x1, y1, x2, y2, label, lx, ly) => `<g stroke="${C.green700}" stroke-width="2.5" fill="none" stroke-linecap="round"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><line x1="${x1}" y1="${y1 - 8}" x2="${x1}" y2="${y1 + 8}"/><line x1="${x2}" y1="${y2 - 8}" x2="${x2}" y2="${y2 + 8}"/></g><text x="${lx}" y="${ly}" ${FONT} font-size="34" font-weight="700" fill="${C.green700}" text-anchor="middle">${label}</text>`;
    out.push(dim(xs[0], y0 - fl - 38, xs[1], y0 - fl - 38, 'L', (xs[0] + xs[1]) / 2, y0 - fl - 50));
    out.push(dim(xs[1], y0 - fl - 38, xs[2], y0 - fl - 38, 'B', (xs[1] + xs[2]) / 2, y0 - fl - 50));
    const hx = xs[4] + 52;
    out.push(`<g stroke="${C.green700}" stroke-width="2.5" fill="none" stroke-linecap="round"><line x1="${hx}" y1="${y0}" x2="${hx}" y2="${y0 + H}"/><line x1="${hx - 8}" y1="${y0}" x2="${hx + 8}" y2="${y0}"/><line x1="${hx - 8}" y1="${y0 + H}" x2="${hx + 8}" y2="${y0 + H}"/></g><text x="${hx + 28}" y="${y0 + H / 2 + 12}" ${FONT} font-size="34" font-weight="700" fill="${C.green700}">H</text>`);
    return svg({ title: 'Dieline of a regular slotted carton with length, breadth and height marked', body: out.join(''), bg: true });
  },

  'process-convert': () => {
    const out = [];
    const gearRoll = (cx, cy, r, color) => `<g transform="translate(${cx} ${cy})"><circle r="${r}" fill="none" stroke="${color}" stroke-width="22" stroke-dasharray="${(2 * Math.PI * (r + 4)) / 28 / 2} ${(2 * Math.PI * (r + 4)) / 28 / 2}"/><circle r="${r - 8}" fill="${color}"/><circle r="${r * 0.4}" fill="${C.paper100}" stroke="${C.ink800}" stroke-width="3"/></g>`;
    // paper reel (medium) top-left, liner reel bottom-left
    out.push(`<circle cx="240" cy="230" r="110" fill="${C.k300}" stroke="${C.k700}" stroke-width="3"/><circle cx="240" cy="230" r="78" fill="none" stroke="${C.k700}" stroke-opacity="0.25" stroke-width="2"/><circle cx="240" cy="230" r="34" fill="${C.paper100}" stroke="${C.k700}" stroke-width="3"/>`);
    out.push(`<circle cx="240" cy="700" r="110" fill="${C.k400}" stroke="${C.k700}" stroke-width="3"/><circle cx="240" cy="700" r="78" fill="none" stroke="${C.k700}" stroke-opacity="0.25" stroke-width="2"/><circle cx="240" cy="700" r="34" fill="${C.paper100}" stroke="${C.k700}" stroke-width="3"/>`);
    // corrugating rolls
    out.push(gearRoll(520, 360, 82, C.ink500));
    out.push(gearRoll(520, 524, 82, C.ink800));
    // paper path: medium reel → between rolls
    out.push(`<path d="M 300 150 C 420 130, 450 300, 520 442" fill="none" stroke="${C.k400}" stroke-width="9" stroke-linecap="round"/>`);
    out.push(`<path d="M 300 700 C 520 700, 560 640, 640 640 L 1100 640" fill="none" stroke="${C.k400}" stroke-width="10" stroke-linecap="round"/>`);
    // output board: liner / flute / liner
    const sec = boardSection({ x: 640, y: 420, w: 480, layers: 3, flute: 44, liner: 12, strokeW: 8 });
    out.push(sec.svg);
    out.push(`<rect x="560" y="428" width="80" height="12" fill="${C.k300}" stroke="${C.k700}" stroke-width="2"/>`);
    out.push(`<line x1="460" y1="442" x2="640" y2="442" stroke="${C.k400}" stroke-width="8" stroke-linecap="round"/>`);
    return svg({ title: 'Corrugating rolls forming fluted board between two paper liners', body: out.join('') });
  },

  'process-quality': () => {
    const out = [];
    const ink = C.ink800;
    out.push(`<ellipse cx="600" cy="780" rx="400" ry="30" fill="${ink}" opacity="0.12" filter="url(#soft)"/>`);
    // frame
    out.push(`<rect x="250" y="700" width="560" height="60" rx="8" fill="${C.ink500}" stroke="${ink}" stroke-width="3"/>`);
    out.push(`<rect x="290" y="210" width="34" height="500" fill="#8FA39A" stroke="${ink}" stroke-width="3"/><rect x="736" y="210" width="34" height="500" fill="#8FA39A" stroke="${ink}" stroke-width="3"/>`);
    out.push(`<rect x="260" y="170" width="540" height="56" rx="8" fill="${C.ink500}" stroke="${ink}" stroke-width="3"/>`);
    // moving platen + screw
    out.push(`<rect x="515" y="226" width="30" height="130" fill="#C9D1CC" stroke="${ink}" stroke-width="3"/>`);
    out.push(`<rect x="340" y="356" width="380" height="36" rx="6" fill="${C.ink300}" stroke="${ink}" stroke-width="3"/>`);
    // box under test
    out.push(`<rect x="380" y="392" width="300" height="236" fill="${C.k300}" stroke="${C.k700}" stroke-width="3"/><line x1="380" y1="510" x2="680" y2="510" stroke="${C.k700}" stroke-opacity="0.4" stroke-width="2"/>`);
    out.push(`<path d="M 380 392 L 400 380 L 700 380 L 680 392" fill="${C.k200}" stroke="${C.k700}" stroke-width="2"/>`);
    out.push(`<rect x="340" y="628" width="380" height="40" rx="6" fill="${C.ink300}" stroke="${ink}" stroke-width="3"/>`);
    // pressure arrows
    out.push(`<g stroke="${C.green600}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M 360 300 L 360 346 M 346 332 L 360 346 L 374 332"/><path d="M 700 300 L 700 346 M 686 332 L 700 346 L 714 332"/></g>`);
    // dial gauge
    out.push(`<circle cx="950" cy="330" r="110" fill="${C.paper50}" stroke="${ink}" stroke-width="5"/><circle cx="950" cy="330" r="92" fill="none" stroke="${ink}" stroke-opacity="0.3" stroke-width="2"/>`);
    for (let i = 0; i <= 20; i++) {
      const a = (-210 + (i * 240) / 20) * (Math.PI / 180);
      const r1 = i % 5 === 0 ? 70 : 78;
      out.push(`<line x1="${950 + Math.cos(a) * r1}" y1="${330 + Math.sin(a) * r1}" x2="${950 + Math.cos(a) * 90}" y2="${330 + Math.sin(a) * 90}" stroke="${ink}" stroke-width="${i % 5 === 0 ? 3 : 1.5}"/>`);
    }
    out.push(`<line x1="950" y1="330" x2="1004" y2="276" stroke="${C.green600}" stroke-width="6" stroke-linecap="round"/><circle cx="950" cy="330" r="10" fill="${ink}"/>`);
    out.push(`<path d="M 800 200 C 860 200, 880 260, 880 300" fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="round" stroke-opacity="0.5"/>`);
    return svg({ title: 'Compression tester crushing a corrugated carton, with a dial gauge', body: out.join('') });
  },

  'process-dispatch': () => {
    const P = fitIso([-60, -10, 0, 560, 330, 190], { maxW: 900, maxH: 560 });
    const cargo = { x: 120, y: 20, z: 36, w: 360, d: 150, h: 150, top: C.paper50, left: C.paper100, right: C.paper200, stroke: C.k700 };
    const cab = { x: 484, y: 28, z: 36, w: 80, d: 134, h: 96, top: C.green500, left: C.green600, right: C.green700, stroke: C.green700 };
    const wheel = (x, y) => {
      const [cx, cy] = P(x, y, 22);
      return `<g transform="translate(${cx} ${cy}) matrix(0.866 0.5 0 -1 0 0)"><circle r="${22 * 1.0}" fill="${C.ink800}"/><circle r="9" fill="${C.ink300}"/></g>`;
    };
    const stripeFace = poly(P, [[cargo.x, cargo.y + cargo.d, 36 + 56], [cargo.x + cargo.w, cargo.y + cargo.d, 36 + 56], [cargo.x + cargo.w, cargo.y + cargo.d, 36 + 76], [cargo.x, cargo.y + cargo.d, 36 + 76]], C.green600, { stroke: 'none' });
    const pallets = [-50, 20].map((yy, i) => pallet(P, { x: -50 + i * 6, y: 190 + yy * 0, w: 150, d: 130 })).join('');
    const loads = box(P, { x: -46, y: 194, z: 27, w: 142, d: 122, h: 90, tape: true, sw: 1 }) + box(P, { x: -40, y: 200, z: 117, w: 130, d: 110, h: 60, tape: true, sw: 1 });
    void pallets;
    return svg({
      title: 'Delivery truck beside a pallet of boxes ready to load',
      body:
        shadow(P, { x: -60, y: -10, w: 620, d: 340, pad: 10, op: 0.12 }) +
        wheel(180, cargo.y + cargo.d) + wheel(420, cargo.y + cargo.d) + wheel(520, cab.y + cab.d) +
        box(P, cargo) + stripeFace +
        box(P, cab) +
        poly(P, [[cab.x + cab.w, cab.y + 18, 36 + 62], [cab.x + cab.w, cab.y + cab.d - 18, 36 + 62], [cab.x + cab.w, cab.y + cab.d - 18, 36 + 88], [cab.x + cab.w, cab.y + 18, 36 + 88]], '#BFE3EA', { stroke: C.ink800, sw: 1 }) +
        pallet(P, { x: -50, y: 190, w: 150, d: 130 }) + loads,
    });
  },

  'about-hero': () => {
    const out = [];
    const ink = C.ink500;
    // floor
    out.push(`<rect x="0" y="720" width="1200" height="180" fill="${C.paper200}"/>`);
    out.push(`<line x1="0" y1="720" x2="1200" y2="720" stroke="${C.paper300}" stroke-width="3"/>`);
    out.push(`<line x1="0" y1="850" x2="1200" y2="850" stroke="#E0B93A" stroke-width="8" opacity="0.8"/>`);
    // roof truss
    out.push(`<path d="M 0 250 L 600 120 L 1200 250" fill="none" stroke="${ink}" stroke-width="6" stroke-opacity="0.35"/>`);
    out.push(`<path d="M 0 330 L 600 190 L 1200 330" fill="none" stroke="${ink}" stroke-width="3" stroke-opacity="0.25"/>`);
    // racks
    const rack = (x, levels, bays) => {
      const w = bays * 200;
      const o = [];
      for (let b = 0; b <= bays; b++) o.push(`<rect x="${x + b * 200 - 7}" y="250" width="14" height="470" fill="${C.green700}"/>`);
      for (let l = 0; l <= levels; l++) {
        const y = 720 - l * 150;
        if (l > 0) o.push(`<rect x="${x}" y="${y - 10}" width="${w}" height="10" fill="${C.k400}" stroke="${C.k700}" stroke-width="1.5"/>`);
        if (l < levels) {
          for (let b = 0; b < bays; b++) {
            const bx = x + b * 200 + 14;
            const fill = (l + b) % 3;
            const cols = [C.k300, C.k400, C.k200];
            o.push(`<rect x="${bx}" y="${y - 10 - 62}" width="76" height="62" fill="${cols[fill]}" stroke="${C.k700}" stroke-width="1.5"/><rect x="${bx + 80}" y="${y - 10 - 62}" width="92" height="62" fill="${cols[(fill + 1) % 3]}" stroke="${C.k700}" stroke-width="1.5"/>`);
            if (l < levels - 1) o.push(`<rect x="${bx + 20}" y="${y - 10 - 62 - 56}" width="120" height="56" fill="${cols[(fill + 2) % 3]}" stroke="${C.k700}" stroke-width="1.5"/>`);
          }
        }
      }
      return o.join('');
    };
    out.push(rack(40, 3, 3));
    out.push(rack(660, 3, 2.7 | 0));
    out.push(rack(40, 0, 0));
    return svg({ title: 'Warehouse racking with stacked cartons', body: out.join('') });
  },
};
