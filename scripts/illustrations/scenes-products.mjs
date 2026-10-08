/** Product illustrations (4:3). Content stays inside the central ~640 px square so 4:5 and 16:10 crops still work. */
import { C, fitIso, poly, line3, box, flutes, openBox, pallet, shadow, svg, boardSection, pts } from './lib.mjs';

const stripe = (P, b, color = C.green600, t = 0.18) => {
  // a brand-colour band around the left+right faces (no text, no fake logo)
  const z0 = b.z + b.h * (0.5 - t / 2);
  const z1 = b.z + b.h * (0.5 + t / 2);
  return (
    poly(P, [[b.x, b.y + b.d, z0], [b.x + b.w, b.y + b.d, z0], [b.x + b.w, b.y + b.d, z1], [b.x, b.y + b.d, z1]], color, { stroke: 'none' }) +
    poly(P, [[b.x + b.w, b.y, z0], [b.x + b.w, b.y + b.d, z0], [b.x + b.w, b.y + b.d, z1], [b.x + b.w, b.y, z1]], C.green700, { stroke: 'none' })
  );
};

/** Small cutaway chip showing the board build-up (3 / 5 / 7 papers). */
const sectionChip = (layers, cx, cy) => {
  const flute = layers === 3 ? 20 : layers === 5 ? 16 : 13;
  const sec = boardSection({ x: 0, y: 0, w: 150, layers, flute, liner: 6 });
  const h = sec.height;
  const W = 190;
  const H = h + 44;
  return `<g transform="translate(${cx - W / 2} ${cy - H / 2})"><rect width="${W}" height="${H}" rx="14" fill="${C.paper50}" stroke="${C.paper300}" stroke-width="1.5"/><g transform="translate(20 22)">${sec.svg}</g></g>`;
};

export const productScenes = {
  'product-3-ply': () => {
    const P = fitIso([0,0,0,400,335,260]);
    const a = { x: 10, y: 0, z: 0, w: 230, d: 160, h: 100 };
    const b = { x: 30, y: 12, z: 100, w: 190, d: 130, h: 80 };
    const open = { x: 200, y: 175, z: 0, w: 200, d: 160, h: 120 };
    return svg({
      title: 'Stack of kraft 3-ply corrugated boxes with one open',
      body:
        shadow(P, { x: 0, y: 0, w: 360, d: 290 }) +
        box(P, { ...a, tape: true }) + flutes(P, { ...a, n: 16 }) +
        box(P, { ...b, tape: true }) + flutes(P, { ...b, n: 13 }) +
        openBox(P, open) + flutes(P, { ...open, n: 14, op: 0.14 }) +
        sectionChip(3, 810, 770),
    });
  },

  'product-5-ply': () => {
    const P = fitIso([0,0,0,385,340,250]);
    const a = { x: 0, y: 0, z: 0, w: 220, d: 170, h: 110 };
    const b = { x: 235, y: 20, z: 0, w: 150, d: 150, h: 130 };
    const c = { x: 20, y: 20, z: 110, w: 180, d: 130, h: 70 };
    const open = { x: 120, y: 190, z: 0, w: 210, d: 150, h: 100 };
    const laptop = [
      poly(P, [[150, 220, 70], [300, 220, 70], [300, 330, 70], [150, 330, 70]], '#9AA79F', { stroke: C.ink500, sw: 1 }),
      poly(P, [[160, 230, 71], [290, 230, 71], [290, 320, 71], [160, 320, 71]], '#C5CEC8', { stroke: 'none' }),
    ].join('');
    // foam corner blocks
    const foam = [
      box(P, { x: 130, y: 205, z: 5, w: 26, d: 26, h: 56, top: C.paper50, left: C.paper200, right: C.paper300, stroke: C.paper300, sw: 0.8 }),
    ].join('');
    void laptop; void foam;
    return svg({
      title: 'Double-wall 5-ply corrugated cartons stacked for dispatch',
      body:
        shadow(P, { x: 0, y: 0, w: 390, d: 340 }) +
        box(P, { ...a, tape: true }) + flutes(P, { ...a, n: 15 }) +
        box(P, { ...c, tape: true }) + flutes(P, { ...c, n: 12 }) +
        box(P, { ...b, tape: true }) + flutes(P, { ...b, n: 10 }) +
        openBox(P, open) + flutes(P, { ...open, n: 14, op: 0.14 }) +
        sectionChip(5, 810, 770),
    });
  },

  'product-7-ply': () => {
    const P = fitIso([0,0,0,320,260,230]);
    const pal = { x: 0, y: 0, w: 320, d: 260 };
    const a = { x: 10, y: 10, z: 27, w: 300, d: 240, h: 200 };
    const strapZ = (z) => [
      poly(P, [[a.x, a.y + a.d, z], [a.x + a.w, a.y + a.d, z], [a.x + a.w, a.y + a.d, z + 8], [a.x, a.y + a.d, z + 8]], C.ink800, { stroke: 'none', op: 0.75 }),
      poly(P, [[a.x + a.w, a.y, z], [a.x + a.w, a.y + a.d, z], [a.x + a.w, a.y + a.d, z + 8], [a.x + a.w, a.y, z + 8]], C.ink800, { stroke: 'none', op: 0.65 }),
    ].join('');
    // vertical strap over the top and down the faces
    const vx = a.x + a.w * 0.5;
    const strapV = [
      poly(P, [[vx - 5, a.y, 227], [vx + 5, a.y, 227], [vx + 5, a.y + a.d, 227], [vx - 5, a.y + a.d, 227]], C.ink800, { stroke: 'none', op: 0.75 }),
      poly(P, [[vx - 5, a.y + a.d, 27], [vx + 5, a.y + a.d, 27], [vx + 5, a.y + a.d, 227], [vx - 5, a.y + a.d, 227]], C.ink800, { stroke: 'none', op: 0.75 }),
    ].join('');
    const corner = (z) => '';
    void corner;
    return svg({
      title: 'Heavy-duty 7-ply triple-wall box strapped on a pallet',
      body:
        shadow(P, { ...pal, pad: 34 }) +
        pallet(P, pal) +
        box(P, { ...a, tape: true, left: C.k400, right: C.k500 }) +
        flutes(P, { ...a, n: 18 }) +
        strapZ(60) + strapZ(170) + strapV +
        sectionChip(7, 810, 770),
    });
  },

  'product-die-cut': () => {
    const P = fitIso([-30, -10, 0, 470, 300, 80], { maxW: 760, maxH: 560 });
    const k = 0.72; // dieline scale
    const X = (v) => v * k;
    const flat = [
      poly(P, [[X(20), X(10), 0], [X(300), X(10), 0], [X(300), X(70), 0], [X(20), X(70), 0]], C.k300, { stroke: C.k700 }),
      poly(P, [[X(20), X(70), 0], [X(300), X(70), 0], [X(300), X(230), 0], [X(20), X(230), 0]], C.k300, { stroke: C.k700 }),
      poly(P, [[X(20), X(230), 0], [X(300), X(230), 0], [X(300), X(290), 0], [X(20), X(290), 0]], C.k300, { stroke: C.k700 }),
      poly(P, [[X(-40), X(70), 0], [X(20), X(70), 0], [X(20), X(230), 0], [X(-40), X(230), 0]], C.k400, { stroke: C.k700 }),
      poly(P, [[X(300), X(70), 0], [X(360), X(70), 0], [X(360), X(230), 0], [X(300), X(230), 0]], C.k400, { stroke: C.k700 }),
      line3(P, [X(20), X(150), 0], [X(300), X(150), 0], { stroke: C.k700, dash: '6 6', sw: 1.3, op: 0.75 }),
      line3(P, [X(20), X(70), 0], [X(300), X(70), 0], { stroke: C.green700, dash: '2 5', sw: 1.6, op: 0.9 }),
      line3(P, [X(20), X(230), 0], [X(300), X(230), 0], { stroke: C.green700, dash: '2 5', sw: 1.6, op: 0.9 }),
      poly(P, [[X(130), X(20), 0], [X(190), X(20), 0], [X(180), X(56), 0], [X(140), X(56), 0]], C.paper100, { stroke: C.k700, sw: 1 }),
    ].join('');
    const m = { x: 300, y: 70, z: 0, w: 170, d: 130, h: 62 };
    return svg({
      title: 'Die-cut corrugated mailer: flat dieline beside the assembled box',
      body:
        shadow(P, { x: -30, y: 0, w: 300, d: 215, pad: 16 }) +
        flat +
        shadow(P, { x: m.x, y: m.y, w: m.w, d: m.d, pad: 14, op: 0.18 }) +
        box(P, m) + flutes(P, { ...m, n: 11 }) +
        poly(P, [[m.x + 18, m.y + 18, m.h + 0.1], [m.x + m.w - 18, m.y + 18, m.h + 0.1], [m.x + m.w - 18, m.y + m.d - 18, m.h + 0.1], [m.x + 18, m.y + m.d - 18, m.h + 0.1]], 'none', { stroke: C.k700, sw: 1.1, dash: '5 5', op: 0.7 }),
    });
  },

  'product-printed': () => {
    const P = fitIso([0,0,0,415,300,120]);
    const a = { x: 0, y: 0, z: 0, w: 230, d: 160, h: 118, top: C.paper100, left: C.paper50, right: C.paper200, stroke: C.k700 };
    const b = { x: 215, y: 150, z: 0, w: 200, d: 150, h: 100, top: C.green500, left: C.green600, right: C.green700, stroke: C.green700 };
    // abstract mark: a ring and a bar, so it shows "your print goes here" without inventing a brand
    const mark = (bx) => {
      const [cx, cy] = P(bx.x + bx.w * 0.5, bx.y + bx.d, bx.z + bx.h * 0.52);
      return `<g transform="translate(${cx} ${cy}) matrix(0.866 0.5 0 1 0 0)"><circle r="${bx.h * 0.3}" fill="none" stroke="${C.green600}" stroke-width="9"/><rect x="${-bx.h * 0.4}" y="${bx.h * 0.42}" width="${bx.h * 0.9}" height="9" rx="4" fill="${C.green600}"/></g>`;
    };
    const markWhite = (bx) => {
      const [cx, cy] = P(bx.x + bx.w * 0.5, bx.y + bx.d, bx.z + bx.h * 0.5);
      return `<g transform="translate(${cx} ${cy}) matrix(0.866 0.5 0 1 0 0)"><circle r="${bx.h * 0.27}" fill="none" stroke="${C.paper50}" stroke-width="8"/><rect x="${-bx.h * 0.42}" y="${bx.h * 0.38}" width="${bx.h * 0.84}" height="8" rx="4" fill="${C.paper50}"/></g>`;
    };
    return svg({
      title: 'Printed corrugated boxes with plain brand-colour graphics',
      body:
        shadow(P, { x: 0, y: 0, w: 380, d: 300 }) +
        box(P, a) + stripe(P, a) + mark(a) +
        box(P, b) + markWhite(b),
    });
  },

  'product-food-grade': () => {
    const P = fitIso([0,30,0,520,300,170]);
    const tray = { x: 20, y: 40, z: 0, w: 260, d: 200, h: 80 };
    const holes = (bx) => {
      const out = [];
      for (let i = 0; i < 4; i++) {
        const [cx, cy] = P(bx.x + bx.w * (0.18 + i * 0.22), bx.y + bx.d, bx.z + bx.h * 0.55);
        out.push(`<ellipse cx="${cx}" cy="${cy}" rx="9" ry="12" transform="rotate(-30 ${cx} ${cy})" fill="${C.k900}" opacity="0.55"/>`);
      }
      return out.join('');
    };
    // produce: simple circles lying on the tray floor (no brand, no certification mark)
    const produce = [
      [70, 60, C.green500], [130, 50, C.green400], [190, 70, '#C6842B'], [90, 120, '#C6842B'], [160, 120, C.green500], [220, 110, C.green400],
    ]
      .map(([x, y, col]) => {
        const [cx, cy] = P(x, y, 62);
        return `<circle cx="${cx}" cy="${cy}" r="24" fill="${col}" stroke="${C.ink800}" stroke-opacity="0.25" stroke-width="1.2"/><ellipse cx="${cx - 7}" cy="${cy - 8}" rx="7" ry="4" fill="#fff" opacity="0.28"/>`;
      })
      .join('');
    const lid = { x: 300, y: 130, z: 0, w: 210, d: 170, h: 80 };
    return svg({
      title: 'Ventilated kraft corrugated box with fresh produce',
      body:
        shadow(P, { x: 0, y: 30, w: 520, d: 290 }) +
        openBox(P, { ...tray, back: 55, front: -30, contents: produce }) +
        holes(tray) +
        box(P, { ...lid, top: C.k300 }) + holes(lid) + flutes(P, { ...lid, n: 12 }),
    });
  },

  // ---- supplies (flat, friendly, brand colours only) ----
  'product-bopp-tape': () =>
    svg({
      title: 'Roll of BOPP packing tape',
      body: [
        `<ellipse cx="560" cy="650" rx="250" ry="34" fill="${C.ink800}" opacity="0.14" filter="url(#soft)"/>`,
        `<circle cx="520" cy="430" r="190" fill="#E8D5B3" stroke="${C.k700}" stroke-width="3"/>`,
        `<circle cx="520" cy="430" r="190" fill="none" stroke="#fff" stroke-opacity="0.45" stroke-width="10" stroke-dasharray="120 700" stroke-dashoffset="-40"/>`,
        `<circle cx="520" cy="430" r="150" fill="none" stroke="${C.k700}" stroke-opacity="0.2" stroke-width="2"/>`,
        `<circle cx="520" cy="430" r="110" fill="none" stroke="${C.k700}" stroke-opacity="0.2" stroke-width="2"/>`,
        `<circle cx="520" cy="430" r="78" fill="${C.k400}" stroke="${C.k700}" stroke-width="3"/>`,
        `<circle cx="520" cy="430" r="52" fill="${C.paper100}" stroke="${C.k700}" stroke-width="3"/>`,
        `<path d="M 700 520 C 800 560, 860 600, 900 640 L 880 668 C 830 640, 770 610, 690 575 Z" fill="#E8D5B3" stroke="${C.k700}" stroke-width="2.5" stroke-linejoin="round"/>`,
        `<path d="M 700 520 C 800 560, 860 600, 900 640" fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="5"/>`,
      ].join(''),
    }),

  'product-stretch-film': () => {
    const cx = 600;
    const body = [
      `<ellipse cx="${cx}" cy="690" rx="230" ry="38" fill="${C.ink800}" opacity="0.14" filter="url(#soft)"/>`,
      `<path d="M ${cx - 190} 300 L ${cx - 190} 640 A 190 52 0 0 0 ${cx + 190} 640 L ${cx + 190} 300 Z" fill="#DCE6E0" stroke="${C.ink500}" stroke-opacity="0.55" stroke-width="3"/>`,
      `<path d="M ${cx - 150} 320 L ${cx - 150} 650" stroke="#fff" stroke-opacity="0.7" stroke-width="18" stroke-linecap="round"/>`,
      `<path d="M ${cx + 110} 320 L ${cx + 110} 660" stroke="${C.ink500}" stroke-opacity="0.12" stroke-width="30" stroke-linecap="round"/>`,
      `<ellipse cx="${cx}" cy="300" rx="190" ry="52" fill="#EEF3F0" stroke="${C.ink500}" stroke-opacity="0.55" stroke-width="3"/>`,
      `<ellipse cx="${cx}" cy="300" rx="120" ry="33" fill="none" stroke="${C.ink500}" stroke-opacity="0.2" stroke-width="2"/>`,
      `<ellipse cx="${cx}" cy="300" rx="62" ry="17" fill="${C.k400}" stroke="${C.k700}" stroke-width="3"/>`,
      `<ellipse cx="${cx}" cy="300" rx="36" ry="10" fill="${C.paper100}" stroke="${C.k700}" stroke-width="2"/>`,
    ].join('');
    return svg({ title: 'Roll of stretch film for pallet wrapping', body });
  },

  'product-bubble-wrap': () => {
    const bubbles = [];
    const x0 = 360;
    const y0 = 320;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 7; c++) {
        const cx = x0 + c * 70 + (r % 2) * 35;
        const cy = y0 + r * 62;
        bubbles.push(`<circle cx="${cx}" cy="${cy}" r="30" fill="#EAF4F6" stroke="${C.cyan700}" stroke-opacity="0.45" stroke-width="2"/><ellipse cx="${cx - 9}" cy="${cy - 11}" rx="9" ry="5" transform="rotate(-30 ${cx - 9} ${cy - 11})" fill="#fff" opacity="0.85"/>`);
      }
    }
    return svg({
      title: 'Bubble wrap sheet',
      body: [
        `<ellipse cx="600" cy="660" rx="300" ry="36" fill="${C.ink800}" opacity="0.12" filter="url(#soft)"/>`,
        `<rect x="310" y="260" width="560" height="360" rx="26" fill="#F1F8F9" stroke="${C.cyan700}" stroke-opacity="0.5" stroke-width="3"/>`,
        bubbles.join(''),
      ].join(''),
    });
  },

  'product-pp-strapping': () => {
    const rings = [];
    for (let i = 0; i < 9; i++) rings.push(`<circle cx="520" cy="430" r="${190 - i * 12}" fill="none" stroke="${C.ink800}" stroke-opacity="${0.9 - i * 0.04}" stroke-width="11"/>`);
    return svg({
      title: 'Coil of polypropylene strapping',
      body: [
        `<ellipse cx="560" cy="650" rx="260" ry="34" fill="${C.ink800}" opacity="0.14" filter="url(#soft)"/>`,
        rings.join(''),
        `<circle cx="520" cy="430" r="78" fill="${C.k400}" stroke="${C.k700}" stroke-width="3"/>`,
        `<circle cx="520" cy="430" r="54" fill="${C.paper100}" stroke="${C.k700}" stroke-width="3"/>`,
        `<path d="M 705 470 C 790 510, 850 560, 900 630 L 872 646 C 830 590, 780 548, 700 512 Z" fill="${C.ink800}" opacity="0.9"/>`,
        `<rect x="748" y="528" width="62" height="30" rx="5" transform="rotate(32 779 543)" fill="#C9D1CC" stroke="${C.ink500}" stroke-width="2.5"/>`,
      ].join(''),
    });
  },
};
