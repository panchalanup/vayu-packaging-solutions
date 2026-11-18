/**
 * Kit v2 scenes for the home Industries switcher. Each image shows the packaging answer to that industry's problem
 * (see INDUSTRY_PANELS in src/content/home.ts): courier-proof mailers, stretch-wrapped pallets of shipper cases,
 * die-cut inserts for electronics, partitioned bottle cartons, batch-coded pharma shippers, triple-wall bulk boxes.
 */
import { K, MARK, PALLET_H, barcode, blobShadow, block, bmcStamp, carton, doc, face, fit, lathe, markRow, openCarton, pallet, plane, proj, pts, r, render, seg, shade, shadow, shippingLabel, tapeSeam, text } from './kit.mjs';
import { bottle, cornerBoards, discArt, gearPath, mailer, slab, stretchWrap, vial } from './kit-goods.mjs';
import { batchPanel, dropMark, fragileTape, madhu, pharmaPrint, slot } from './art.mjs';
import { DEEP, WHITE_TOP } from './scenes-v2.mjs';

const r3 = (n) => Math.round(n * 1000) / 1000;
const PHARMA_INK = '#1E5AA8';

/** Honey jar (sample brand) standing at world `at` */
function honeyJar(D, P, at, { R = 3.6, H = 8.5 } = {}) {
  const prof = [[R * 0.94, 0], [R, R * 0.2], [R, H * 0.8], [R * 0.86, H * 0.86], [R * 0.86, H]];
  let s = lathe(D, P, at, prof, { color: '#D9901C', glass: true });
  const [cx, cy] = P(...at);
  const k = 0.8660254 * Math.SQRT2 * P.s;
  const ry = R * Math.SQRT1_2 * P.s;
  const y0 = cy - H * 0.18 * P.s;
  const y1 = cy - H * 0.62 * P.s;
  s += `<path d="M${r(cx - R * k)} ${r(y1)}V${r(y0)}A${r(R * k)} ${r(ry)} 0 0 0 ${r(cx + R * k)} ${r(y0)}V${r(y1)}A${r(R * k)} ${r(ry)} 0 0 1 ${r(cx - R * k)} ${r(y1)}Z" fill="${D.lin([cx - R * k, 0], [cx + R * k, 0], [[0, '#D8CFBD'], [0.35, '#F6F0E2'], [1, '#B9AF9B']])}"/>`;
  s += dropMark(cx, (y0 + y1) / 2 + ry * 0.2, (y0 - y1) * 0.5, K.green);
  s += `<ellipse cx="${r(cx)}" cy="${r(cy - H * P.s - 1.4 * P.s)}" rx="${r(R * 0.88 * k)}" ry="${r(R * 0.88 * Math.SQRT1_2 * P.s)}" fill="${K.green}"/>`;
  s += `<path d="M${r(cx - R * 0.88 * k)} ${r(cy - H * P.s - 1.4 * P.s)}V${r(cy - H * P.s)}A${r(R * 0.88 * k)} ${r(R * 0.88 * Math.SQRT1_2 * P.s)} 0 0 0 ${r(cx + R * 0.88 * k)} ${r(cy - H * P.s)}V${r(cy - H * P.s - 1.4 * P.s)}Z" fill="${D.lin([cx - R * k, 0], [cx + R * k, 0], [[0, K.green7], [0.4, K.green5], [1, K.green7]])}"/>`;
  s += `<ellipse cx="${r(cx)}" cy="${r(cy - H * P.s - 1.4 * P.s)}" rx="${r(R * 0.88 * k)}" ry="${r(R * 0.88 * Math.SQRT1_2 * P.s)}" fill="${D.lin([cx - R * k, cy - H * P.s - 4], [cx + R * k, cy - H * P.s + 4], [[0, K.green5], [1, K.green7]])}"/>`;
  return s;
}

/** Folded T-shirt lying in a box (local plane artwork) */
const tee = (w, h, color = K.green) =>
  `<rect width="${w}" height="${h}" rx="0.6" fill="${color}"/><path d="M${w * 0.38} 0Q${w * 0.5} ${h * 0.16} ${w * 0.62} 0" fill="${shade(color, -0.25)}"/>` +
  `<path d="M${w * 0.2} ${h * 0.02}V${h}M${w * 0.8} ${h * 0.02}V${h}" stroke="${shade(color, -0.18)}" stroke-width="0.25"/><rect y="${h * 0.62}" width="${w}" height="${h * 0.04}" fill="${shade(color, 0.12)}"/>` +
  dropMark(w * 0.5, h * 0.36, h * 0.2, '#FBF8F3');

/** Crinkle-cut paper void fill: short zig-zag strands (local plane artwork) */
function crinkle(w, h, seed = 3, color = '#D8BE93') {
  let s = '';
  let k = seed;
  const R = () => ((k = (k * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 90; i++) {
    const x = R() * w;
    const y = R() * h;
    const a = R() * Math.PI;
    const len = 2 + R() * 3;
    let d = `M${r3(x)} ${r3(y)}`;
    for (let j = 1; j <= 5; j++) d += `L${r3(x + Math.cos(a) * (len * j) / 5 + (j % 2 ? 0.3 : -0.3))} ${r3(y + Math.sin(a) * (len * j) / 5 + (j % 2 ? -0.3 : 0.3))}`;
    s += `<path d="${d}" stroke="${shade(color, (i % 3) * 0.1 - 0.1)}" stroke-width="0.35" fill="none" stroke-linejoin="round"/>`;
  }
  return s;
}

/** Tear strip with a PULL tab along the front of a closed mailer (local face art, width w) */
const tearStrip = (w, y) =>
  `<rect x="0" y="${y}" width="${w}" height="1.1" fill="#000" opacity="0.08"/><path d="M0 ${y}H${w}M0 ${y + 1.1}H${w}" stroke="#7A5A38" stroke-width="0.12" stroke-dasharray="0.5 0.35" opacity="0.8"/>` +
  `<path d="M${w * 0.06} ${y - 0.5}h3.4l1 1.05-1 1.05h-3.4z" fill="${K.green}"/>${text(w * 0.06 + 0.4, y + 0.95, 1, 'PULL', { color: '#fff', weight: 800 })}`;

/** Interior of a partitioned bottle carton: cells drawn back to front, each with its partition walls and a bottle */
function bottleCells(D, P, b, nx, ny, { wallH, bottleColor = '#7A4A14' } = {}) {
  const cw = b.w / nx;
  const cd = b.d / ny;
  const cells = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) cells.push([i, j]);
  cells.sort((a, c) => a[0] + a[1] - (c[0] + c[1]) || a[1] - c[1]);
  const board = '#CFAF83';
  let s = '';
  for (const [i, j] of cells) {
    const x0 = b.x + i * cw;
    const y0 = b.y + j * cd;
    const zt = b.z + wallH;
    if (j > 0) s += face(D, P, [[x0, y0, zt], [x0 + cw, y0, zt], [x0 + cw, y0, b.z], [x0, y0, b.z]], board, { k0: 0.06, k1: -0.2 });
    if (i > 0) s += face(D, P, [[x0, y0 + cd, zt], [x0, y0, zt], [x0, y0, b.z], [x0, y0 + cd, b.z]], shade(board, -0.12), { k0: 0.02, k1: -0.25 });
    if (j > 0) s += seg(P, [x0, y0, zt], [x0 + cw, y0, zt], { stroke: shade(board, 0.35), sw: 1.2 });
    if (i > 0) s += seg(P, [x0, y0, zt], [x0, y0 + cd, zt], { stroke: shade(board, 0.2), sw: 1 });
    s += bottle(D, P, [x0 + cw / 2, y0 + cd / 2, b.z], { R: Math.min(cw, cd) * 0.36, H: 27, color: bottleColor, cap: '#C8372D', label: '#F3EEE3', ink: K.green });
  }
  return s;
}

export const v2IndustryScenes = {
  'industry-ecommerce': () => {
    const D = doc('industry-ecommerce');
    const P = fit([-4, -4, 0, 84, 76, 34], { cy: 445, maxW: 840, maxH: 660 });
    const A = { x: 0, y: 0, z: 0, w: 44, d: 34, h: 30 };
    const M = { x: 50, y: 34, z: 0, w: 32, d: 24, h: 9 };
    const S = { x: 4, y: 46, z: 0, w: 30, d: 22, h: 8 };
    const fill = `<g transform="${plane(P, [M.x + 0.8, M.y + 0.8, M.z + 5.4], [1, 0, 0], [0, 1, 0])}">${crinkle(30.4, 22.4)}<g transform="translate(6 4)">${tee(18, 14)}</g></g>`;
    const body = [
      shadow(D, P, A),
      shadow(D, P, M, { op: 0.16 }),
      shadow(D, P, S, { op: 0.16 }),
      carton(D, P, A, {
        tape: false,
        decor: {
          left: `<g transform="translate(3 3.4)">${markRow(['up', 'fragile', 'dry'], 3.4)}</g><g transform="translate(28.5 7.5)">${shippingLabel(11.5, 16, 17)}</g>`,
          right: `${madhu(4, 22, 3.6, '#2A2A2A')}`,
        },
      }),
      tapeSeam(D, P, A, { color: '#E7D3A7', print: (l, w) => fragileTape(l, w) }),
      mailer(D, P, S, { closed: true, lidPrint: madhu(7.4, 12, 3.2, '#2A2A2A') }),
      `<g transform="${plane(P, [S.x, S.y + S.d, S.z + S.h], [1, 0, 0], [0, 0, -1])}">${tearStrip(S.w, 2.2)}</g>`,
      mailer(D, P, M, { lid: 110, contents: fill, insidePrint: `${madhu(9, 9.4, 3.4, K.green)}${text(16, 13.6, 1.4, 'MADE WITH CARE · RETURN LABEL INSIDE', { color: shade(K.green, 0.05), weight: 700, anchor: 'middle', spacing: 0.1 })}` }),
    ];
    return render(D, {
      title: 'E-commerce packaging: courier carton with label and FRAGILE tape, and an open printed mailer box',
      desc: 'Shipping packaging for online orders: a 3-ply corrugated carton with a courier label and printed FRAGILE tape, a closed mailer with a tear strip for easy opening, and an open mailer with paper void fill and a folded T-shirt.',
      body: body.join('\n'),
    });
  },

  'industry-fmcg': () => {
    const D = doc('industry-fmcg');
    const P = fit([0, 0, 0, 100, 108, PALLET_H + 90], { cy: 440, maxW: 720, maxH: 700 });
    const cases = [];
    const W = 33;
    const Dd = 25;
    const H = 22;
    // only the outside of the stack is ever seen: the top layer's tops, the front row's +y faces and the right
    // column's +x faces; inner cases are skipped entirely
    for (let layer = 0; layer < 4; layer++) {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
          const hide = { top: layer < 3, left: j < 3, right: i < 2 };
          if (!(hide.top && hide.left && hide.right)) cases.push([{ x: i * W, y: j * Dd, z: PALLET_H + layer * H, w: W, d: Dd, h: H }, hide]);
        }
      }
    }
    cases.sort(([a], [b]) => a.z - b.z || a.x + a.y - (b.x + b.y));
    const caseLeft = `<rect y="17" width="33" height="5" fill="${K.green}"/>${madhu(3, 11.5, 4.4, K.green)}${text(30, 20.6, 2.2, '12 × 500 g', { color: '#FBF8F3', weight: 800, anchor: 'end' })}<g transform="translate(26 3)">${markRow(['up'], 3)}</g>`;
    const caseRight = `<rect y="17" width="25" height="5" fill="${K.green}"/>${dropMark(19, 8, 6, K.green)}<rect x="2.4" y="10" width="9" height="5.6" fill="#fff"/>${barcode(2.9, 10.4, 8, 4.8, 5)}`;
    const load = { x: 0, y: 0, z: PALLET_H, w: 99, d: 100, h: 88 };
    const sscc = `<g transform="translate(64 30)">${shippingLabel(16, 22, 31, { accent: '#2A3A31' })}</g>`;
    const T = { x: 26, y: 112, z: 0, w: 36, d: 24, h: 8 };
    const jars = [];
    for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) jars.push([T.x + 4.5 + i * 9, T.y + 6 + j * 12]);
    const jarArt = jars.map(([x, y]) => honeyJar(D, P, [x, y, T.z + 0.4])).join('');
    const body = [
      shadow(D, P, { x: 0, y: 0, w: 100, d: 100, h: PALLET_H + 88 }, { op: 0.2, soft: 12 }),
      pallet(D, P, { x: 0, y: 0, w: 100, d: 100 }),
      `<g filter="${D.grain(0.6)}">${cases.map(([c, hide]) => block(D, P, c, { color: WHITE_TOP, hide, decor: { left: hide.left ? '' : caseLeft, right: hide.right ? '' : caseRight } })).join('')}</g>`,
      `<g transform="${plane(P, [load.x, load.y + load.d + 0.4, load.z + load.h], [1, 0, 0], [0, 0, -1])}">${sscc}</g>`,
      cornerBoards(D, P, load, { color: '#D8CCB6' }),
      stretchWrap(D, P, load, { from: -4 }),
      shadow(D, P, T, { op: 0.14 }),
      openCarton(D, P, T, { flaps: false, color: WHITE_TOP, inner: '#E5DFD3', t: 0.3, contents: jarArt, decor: { left: `<rect y="4.5" width="36" height="3.5" fill="${K.green}"/>${text(18, 7.1, 2, 'SHELF READY', { color: '#fff', weight: 800, anchor: 'middle', spacing: 0.2 })}` } }),
    ];
    return render(D, {
      title: 'FMCG packaging: stretch-wrapped pallet of printed shipper cases and a shelf-ready tray',
      desc: 'A pallet of printed white-top shipper cases for a sample honey brand, stacked and stretch-wrapped with corner boards and a pallet label, with a shelf-ready tray of jars in front.',
      body: body.join('\n'),
    });
  },

  'industry-electronics': () => {
    const D = doc('industry-electronics');
    const P = fit([0, -6, 0, 84, 66, 30], { cx: 610, cy: 450, maxW: 840, maxH: 660 });
    const O = { x: 0, y: 30, z: 0, w: 46, d: 34, h: 16 };
    const C = { x: 40, y: -6, z: 0, w: 42, d: 30, h: 26 };
    const A = { x: 54, y: 40, z: 0, w: 16, d: 12, h: 5 };
    // die-cut corrugated insert: a deck with a pocket that holds the laptop, plus a slot for the charger
    const ins = { x: O.x + 0.5, y: O.y + 0.5, z: O.z + O.h - 4, w: O.w - 1, d: O.d - 1 };
    const deck = `<path fill-rule="evenodd" d="M0 0H${ins.w}V${ins.d}H0Z M3.5 3.5H${ins.w - 12}V${ins.d - 3.5}H3.5Z M${ins.w - 9} 4H${ins.w - 3}V${ins.d - 4}H${ins.w - 9}Z" fill="#CDAE82"/>`;
    const deckEdge = `<path d="M3.5 3.5H${ins.w - 12}V${ins.d - 3.5}H3.5Z M${ins.w - 9} 4H${ins.w - 3}V${ins.d - 4}H${ins.w - 9}Z" fill="none" stroke="#8F6B43" stroke-width="0.35"/>`;
    const pocketFloor = `<rect x="3.5" y="3.5" width="${ins.w - 15.5}" height="${ins.d - 7}" fill="#9C774C"/>`;
    const laptopLid = `<rect x="4.4" y="4.4" width="${ins.w - 17.3}" height="${ins.d - 8.8}" rx="0.8" fill="${D.linBox(0, 0, 1, 1, [[0, '#D4DADE'], [0.45, '#B4BCC2'], [0.55, '#C3CACF'], [1, '#9FA8AE']])}"/><rect x="4.4" y="4.4" width="${ins.w - 17.3}" height="${ins.d - 8.8}" rx="0.8" fill="none" stroke="#8E979D" stroke-width="0.2"/><circle cx="${4.4 + (ins.w - 17.3) / 2}" cy="${4.4 + (ins.d - 8.8) / 2}" r="1.4" fill="#A2AAB0"/>`;
    const charger = `<rect x="${ins.w - 8.4}" y="5" width="4.8" height="9" rx="0.6" fill="#2E3438"/><rect x="${ins.w - 7.6}" y="15.5" width="3.2" height="8" rx="0.4" fill="#3A4247"/>`;
    const contents =
      `<g transform="${plane(P, [ins.x, ins.y, ins.z - 3], [1, 0, 0], [0, 1, 0])}">${pocketFloor}</g>` +
      `<g transform="${plane(P, [ins.x, ins.y, ins.z - 1.6], [1, 0, 0], [0, 1, 0])}">${laptopLid}</g>` +
      `<g transform="${plane(P, [ins.x, ins.y, ins.z - 1.2], [1, 0, 0], [0, 1, 0])}">${charger}</g>` +
      `<g transform="${plane(P, [ins.x, ins.y, ins.z], [1, 0, 0], [0, 1, 0])}">${deck}${deckEdge}</g>`;
    const esd = `<g transform="translate(3 3)">${markRow([() => MARK.esd(), 'fragile', 'up'], 3.4)}</g>`;
    const body = [
      shadow(D, P, C, { op: 0.15 }),
      shadow(D, P, O),
      shadow(D, P, A, { op: 0.14 }),
      carton(D, P, C, { color: DEEP, tape: false, decor: { left: `<g transform="translate(3 3)">${markRow([() => MARK.esd(), 'fragile', 'dry'], 3.6)}</g><g transform="translate(27 8)">${shippingLabel(11, 15, 41)}</g>`, right: bmcStamp(8, 18, 5, ['5 PLY', 'B+C FLUTE']) } }),
      tapeSeam(D, P, C, { color: '#E7D3A7', print: (l, w) => fragileTape(l, w) }),
      openCarton(D, P, O, { color: DEEP, inner: '#C9A577', walls: 2, t: 0.7, flaps: 'back', contents, decor: { left: esd, right: bmcStamp(7, 9, 4.6, ['5 PLY', 'B+C']) } }),
      block(D, P, A, { color: '#F3F1EC', decor: { left: `<rect y="3.6" width="16" height="1.4" fill="${PHARMA_INK}"/>${text(1.2, 2.6, 1.3, 'CHARGER', { color: '#333', weight: 800 })}`, top: `<rect x="1" y="1" width="5" height="3" rx="0.3" fill="#1A1A1A" opacity="0.8"/>` } }),
    ];
    return render(D, {
      title: 'Electronics packaging: 5-ply carton with a die-cut corrugated insert holding a laptop',
      desc: 'A double-wall 5-ply carton opened to show a fitted die-cut corrugated insert that holds a laptop and its charger in place, with anti-static (ESD) and fragile marks, beside a sealed carton with FRAGILE tape.',
      body: body.join('\n'),
    });
  },

  'industry-food': () => {
    const D = doc('industry-food');
    const P = fit([0, -6, 0, 84, 64, 34], { cy: 450, maxW: 820, maxH: 660 });
    const O = { x: 34, y: 20, z: 0, w: 40, d: 30, h: 22 };
    const C = { x: 0, y: -6, z: 0, w: 40, d: 30, h: 26 };
    const inner = { x: O.x + 0.5, y: O.y + 0.5, z: O.z, w: O.w - 1, d: O.d - 1 };
    const body = [
      shadow(D, P, C, { op: 0.15 }),
      shadow(D, P, O),
      carton(D, P, C, {
        color: WHITE_TOP,
        tapeColor: K.green5,
        decor: {
          left: `<rect y="20" width="40" height="6" fill="#7A2E1F"/>${dropMark(5, 10.4, 4.6, '#7A2E1F')}${text(9, 12.2, 4.4, 'kesar', { color: '#7A2E1F', weight: 800 })}${text(9.3, 15.6, 1.6, 'MANGO PULP · 12 × 850 g', { color: '#7A2E1F', weight: 700, spacing: 0.1 })}<g transform="translate(30 3)">${markRow(['up', 'fragile'], 3.2, { color: '#7A2E1F' })}</g>`,
          right: `<rect y="20" width="30" height="6" fill="#7A2E1F"/><rect x="3" y="6" width="11" height="8" fill="#fff"/>${barcode(3.5, 6.4, 10, 7.2, 13)}<g transform="translate(17 6)">${markRow(['food', 'dry'], 3.6, { color: '#7A2E1F' })}</g>`,
        },
      }),
      openCarton(D, P, O, { flaps: false, contents: bottleCells(D, P, inner, 4, 3, { wallH: O.h - 1 }), decor: { left: `<g transform="translate(3 2.6)">${markRow(['up', 'fragile'], 3.2)}</g>`, right: slot(9, 3, 12, 3) } }),
      blobShadow(D, P, [24, 50, 0], 3, { h: 20, op: 0.2 }),
      bottle(D, P, [24, 50, 0], { R: 3.2, H: 27, color: '#7A4A14' }),
    ];
    return render(D, {
      title: 'Food and beverage packaging: corrugated bottle carton with partitions and a printed shipper',
      desc: 'An open corrugated carton fitted with die-cut partitions that keep twelve glass bottles apart, next to a printed white-top shipper case for food products with food-safe and handling marks.',
      body: body.join('\n'),
    });
  },

  'industry-pharma': () => {
    const D = doc('industry-pharma');
    const P = fit([-6, -8, 0, 84, 66, 30], { cy: 450, maxW: 840, maxH: 660 });
    const C = { x: -4, y: -8, z: 0, w: 40, d: 30, h: 28 };
    const O = { x: 40, y: 18, z: 0, w: 40, d: 30, h: 18 };
    // mono cartons standing in rows inside the open shipper, tops visible
    const mono = [];
    const mw = 6.2;
    const md = 4;
    for (let j = 0; j < 6; j++) for (let i = 0; i < 6; i++) mono.push({ x: O.x + 0.9 + i * mw, y: O.y + 0.9 + j * (md + 0.6), z: O.z, w: mw - 0.25, d: md, h: 16.5 });
    mono.sort((a, b) => a.x + a.y - (b.x + b.y));
    const monoArt = mono.map((m) => block(D, P, m, { color: '#F5F6F7', edges: false, decor: { top: `<rect width="${m.w}" height="1.2" fill="${PHARMA_INK}"/><rect y="1.2" width="${m.w}" height="0.4" fill="#2E9B8F"/>`, left: `<rect y="1.6" width="${m.w}" height="1" fill="${PHARMA_INK}"/>` } })).join('');
    const left = `${pharmaPrint(40, 28)}<g transform="translate(24 8.6)">${batchPanel(13.5, 7.5)}</g>`;
    const right = `<g transform="translate(3 3)">${markRow(['up', 'dry', 'fragile'], 3.4, { color: PHARMA_INK })}</g><rect x="3" y="9.5" width="15" height="4.4" rx="0.5" fill="#fff" stroke="${PHARMA_INK}" stroke-width="0.2"/>${text(10.5, 12.5, 1.7, 'STORE BELOW 25°C', { color: PHARMA_INK, anchor: 'middle', weight: 800 })}<rect y="20.2" width="30" height="2" fill="${PHARMA_INK}"/>`;
    const vials = [[22, 44], [26.5, 46], [21, 49.5], [25.5, 51.5]].map(([x, y]) => vial(D, P, [x, y, 0])).join('');
    const blister = `<rect width="12" height="7" rx="0.6" fill="#D7DDE1"/>${[0, 1, 2, 3].map((i) => [0, 1].map((j) => `<ellipse cx="${2 + i * 2.7}" cy="${2 + j * 3}" rx="0.95" ry="1.05" fill="#fff" stroke="#AEB8BF" stroke-width="0.12"/><ellipse cx="${1.8 + i * 2.7}" cy="${1.7 + j * 3}" rx="0.3" ry="0.35" fill="#fff"/>`).join('')).join('')}`;
    const body = [
      shadow(D, P, C, { op: 0.15 }),
      shadow(D, P, O),
      carton(D, P, C, { color: '#F1F0EC', tapeColor: '#D9E2EC', decor: { left, right } }),
      openCarton(D, P, O, { color: '#F1F0EC', inner: '#E4E1DA', t: 0.35, flaps: 'back', contents: monoArt, decor: { left: `${pharmaPrint(40, 18)}`, right: `<g transform="translate(3 2.6)">${markRow(['up'], 3, { color: PHARMA_INK })}</g>` } }),
      blobShadow(D, P, [24, 48, 0], 6, { op: 0.16 }),
      vials,
      slab(P, [8, 50, 0], blister, { thick: 0.5, side: '#9AA4AB', rot: 14 }),
    ];
    return render(D, {
      title: 'Pharmaceutical packaging: batch-coded shipper cartons with mono cartons and vials',
      desc: 'Clean white corrugated shipper cartons for medicines with a printed batch panel (batch number, manufacturing and expiry dates, GS1 DataMatrix) and a storage temperature mark; one is open with rows of mono cartons, with glass vials and a blister strip in front.',
      body: body.join('\n'),
    });
  },

  'industry-auto': () => {
    const D = doc('industry-auto');
    const P = fit([0, 0, 0, 120, 100, PALLET_H + 56], { cx: 600, cy: 445, maxW: 760, maxH: 690 });
    const B = { x: 4, y: 4, z: PALLET_H, w: 112, d: 92, h: 56 };
    const padZ = B.z + B.h - 14;
    // layer pad with die-cut pockets, gears and brake discs sitting in them
    const parts = [
      ['gear', 22, 24, 11],
      ['disc', 58, 24, 13],
      ['gear', 92, 24, 9],
      ['disc', 24, 66, 13],
      ['gear', 58, 66, 12],
      ['disc', 92, 66, 12],
    ];
    const metal = (d) => d === 'gear' ? ['#9AA3A8', '#5E676C'] : ['#A9B1B6', '#6A7378'];
    let contents = `<g transform="${plane(P, [B.x + 0.8, B.y + 0.8, padZ], [1, 0, 0], [0, 1, 0])}"><rect width="${B.w - 1.6}" height="${B.d - 1.6}" fill="#C9A577"/>${parts.map(([, x, y, R]) => `<circle cx="${x - 4.8}" cy="${y - 4.8}" r="${R + 1.2}" fill="#8F6B43"/>`).join('')}</g>`;
    contents += parts
      .map(([kind, x, y, R]) => {
        const [c, side] = metal(kind);
        const art = kind === 'gear' ? `<path d="${gearPath(R, 22, 0.12, 0.3)}" fill="${c}" fill-rule="evenodd"/><circle r="${R * 0.62}" fill="none" stroke="#fff" stroke-opacity="0.3" stroke-width="${R * 0.05}"/>` : discArt(R);
        return slab(P, [B.x + x - 0.8, B.y + y - 0.8, padZ + (kind === 'gear' ? 3 : 2.6)], art, { thick: kind === 'gear' ? 3 : 2.6, side, outline: kind === 'gear' ? `<path d="${gearPath(R, 22, 0.12, 0.3)}" fill-rule="evenodd"/>` : `<circle r="${R}"/>` });
      })
      .join('');
    const left = `<g transform="translate(6 6)">${markRow(['up', 'dry', () => MARK.stack(2)], 5)}</g><g transform="translate(78 12)"><rect width="22" height="14" rx="0.6" fill="#fff"/>${text(1.4, 3.4, 2.1, 'PART NO.', { color: '#555', weight: 700 })}${text(1.4, 7, 3, '4417-B', { color: '#111', weight: 800, font: "'SFMono-Regular', Consolas, monospace" })}${barcode(1.4, 8.4, 19, 4.6, 77, { digits: false })}</g>`;
    const right = `${bmcStamp(12, 22, 8, ['7 PLY', 'C+B+C'])}${slot(52, 10, 16, 5.6, { board: DEEP })}`;
    const body = [
      shadow(D, P, { x: 0, y: 0, w: 120, d: 100, h: PALLET_H + 56 }, { op: 0.22, soft: 12 }),
      pallet(D, P, { x: 0, y: 0, w: 120, d: 100 }),
      openCarton(D, P, B, { color: DEEP, inner: '#C29E70', walls: 3, t: 1.3, flaps: false, contents, decor: { left, right } }),
      cornerBoards(D, P, B, { color: '#D8CCB6' }),
    ];
    return render(D, {
      title: 'Automotive packaging: triple-wall bulk box on a pallet holding gears and brake discs',
      desc: 'A heavy-duty 7-ply triple-wall corrugated bulk box on a wooden pallet with corner boards and a strap, opened to show a die-cut layer pad holding gears and brake discs, with a part number label and a stacking limit mark.',
      body: body.join('\n'),
    });
  },
};
