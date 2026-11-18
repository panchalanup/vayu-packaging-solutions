/**
 * Detailed illustrations (kit v2) for the home page Range section and the product pages.
 * Every scene keeps its subject inside the central ~720 × 720 px so the 4:5 (Range) and 16:10 (Industries, phone)
 * crops still show the whole story. Sizes are real centimetres.
 */
import { K, MARK, PALLET_H, barcode, blobShadow, bmcStamp, carton, doc, fit, flapEdge, loupe, markRow, openCarton, pallet, plane, render, shade, shadow, shippingLabel, text } from './kit.mjs';
import { cornerBoards, fruit, mailer, slab, strap } from './kit-goods.mjs';
import { dropMark, honeycomb, madhu, mailerBlank, slot, ventRow } from './art.mjs';

export const WHITE_TOP = '#EDE8DF';
export const DEEP = '#B98C5A';

/** Mangoes in a grid on a floor at height z (world), drawn back to front */
export function mangoes(D, P, { x, y, z, nx, ny, step = 10.5, R = 4.4, seed = 1 }) {
  const items = [];
  let k = seed;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) items.push([x + step / 2 + i * step, y + step / 2 + j * step, (k = (k * 7 + 3) % 11)]);
  items.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
  return items
    .map(([wx, wy, n]) => {
      const [cx, cy] = P(wx, wy, z + R * 0.85);
      const tone = n % 3 === 0 ? ['#F0B43C', '#D9542A'] : n % 3 === 1 ? ['#F5C24A', '#E47A2C'] : ['#E9A83A', '#C9482A'];
      return fruit(D, [cx, cy], R * P.s * 1.32, R * P.s * 0.9, { color: tone[0], blush: tone[1], rot: -24 + (n % 5) * 9, stem: n % 2 === 0 });
    })
    .join('');
}

/** Yellow heavy-load warning panel with a forklift (local units) */
export const heavySign = (w, h) =>
  `<rect width="${w}" height="${h}" rx="${h * 0.06}" fill="#F2C230"/><rect x="${h * 0.05}" y="${h * 0.05}" width="${w - h * 0.1}" height="${h - h * 0.1}" rx="${h * 0.04}" fill="none" stroke="#1A1A1A" stroke-width="${h * 0.03}"/>` +
  text(w / 2, h * 0.36, h * 0.24, 'HEAVY', { anchor: 'middle', weight: 800, spacing: h * 0.02 }) +
  `<g transform="translate(${w * 0.34} ${h * 0.43}) scale(${h * 0.026})" fill="#1A1A1A"><rect x="0" y="4" width="7" height="4" rx="0.6"/><rect x="5" y="0" width="1" height="8"/><rect x="6" y="6.6" width="6" height="0.8"/><circle cx="1.6" cy="8.6" r="1.2"/><circle cx="5.2" cy="8.6" r="1.2"/><rect x="8" y="2.5" width="4" height="3.2" fill="none" stroke="#1A1A1A" stroke-width="0.6"/></g>` +
  text(w / 2, h * 0.86, h * 0.13, 'USE FORKLIFT', { anchor: 'middle', weight: 800 });

export const v2Scenes = {
  'product-3-ply': () => {
    const D = doc('product-3-ply');
    const P = fit([-8, 0, 0, 100, 80, 58], { cy: 430, maxW: 720, maxH: 580 });
    const B = { x: 0, y: 0, z: 0, w: 46, d: 36, h: 30 };
    const C = { x: 5, y: 4, z: 30, w: 36, d: 28, h: 22 };
    const O = { x: 54, y: 8, z: 0, w: 42, d: 32, h: 30 };
    const A = { x: -6, y: 46, z: 0, w: 42, d: 32, h: 34 };
    const body = [
      shadow(D, P, B),
      shadow(D, P, O, { op: 0.16 }),
      shadow(D, P, A),
      carton(D, P, B, { seamAlong: 'x' }),
      shadow(D, P, C, { op: 0.12, contact: 0.25 }),
      carton(D, P, C, { seamAlong: 'y', decor: { left: `<g transform="translate(3 3)">${markRow(['up', 'fragile'], 3.4)}</g>` } }),
      openCarton(D, P, O, { walls: 1, t: 0.42, decor: { right: `<g transform="translate(4 4)">${markRow(['up', 'dry'], 3.6)}</g>` } }),
      carton(D, P, A, {
        seamAlong: 'x',
        decor: {
          left: `<g transform="translate(3 3.4)">${markRow(['up', 'fragile', 'dry'], 3.6)}</g><g transform="translate(25.5 9)">${shippingLabel(11, 15.5, 7)}</g>`,
          right: bmcStamp(9, 22, 5.6, ['3 PLY', 'B FLUTE']),
        },
      }),
    ];
    body.push(loupe(D, { cx: 850, cy: 690, R: 84, walls: 1, from: flapEdge(P, O, 0.55), label: '3-PLY · B FLUTE' }));
    return render(D, {
      title: '3-ply corrugated shipping boxes, taped and labelled, with one open box',
      desc: 'Kraft 3-ply corrugated cartons: two stacked and taped, one with a courier label and handling marks, one open with its flaps out. A magnifier shows the single-wall board: two liners with one fluted medium between them.',
      body: body.join('\n'),
    });
  },

  'product-die-cut': () => {
    const D = doc('product-die-cut');
    const P = fit([0, 2, 0, 72, 86, 26], { cx: 575, cy: 440, maxW: 700, maxH: 640 });
    const blank = mailerBlank({ L: 26, W: 20, H: 7 });
    const M = { x: 44, y: 4, z: 0, w: 26, d: 20, h: 7 };
    const S1 = { x: 6, y: 2, z: 0, w: 28, d: 22, h: 8 };
    const S2 = { x: 9, y: 5, z: 8, w: 22, d: 16, h: 6 };
    const tissue =
      `<g transform="${plane(P, [M.x + 1, M.y + 1, M.z + 4.2], [1, 0, 0], [0, 1, 0])}">` +
      `<path d="M0 1 L13 0 L24 1.6 L23.4 17.6 L11 18 L0.6 17Z" fill="#F7EFEA"/><path d="M13 0 L11 18M0 9 L24 8" stroke="#E2D3CB" stroke-width="0.25" fill="none"/>` +
      `<path d="M0.6 17 L11 18 L13 0 L0 1Z" fill="#fff" opacity="0.5"/><circle cx="12.2" cy="8.6" r="2.4" fill="${K.green}"/>${dropMark(12.2, 8.5, 2.6, '#FBF8F3')}</g>`;
    const inside = `${madhu(8.2, 8.6, 3.2, K.green)}${text(13, 12.6, 1.35, 'THANK YOU FOR YOUR ORDER', { color: shade(K.green, 0.1), weight: 700, anchor: 'middle', spacing: 0.12 })}`;
    const body = [
      shadow(D, P, S1, { op: 0.16 }),
      shadow(D, P, M, { op: 0.16 }),
      slab(P, [0, 32, 0], blank.art, { thick: 0.35, side: shade(K.kraft, -0.35) }),
      mailer(D, P, S1, { closed: true }),
      shadow(D, P, S2, { op: 0.1, contact: 0.3 }),
      mailer(D, P, S2, { closed: true, color: WHITE_TOP, lidPrint: madhu(5.2, 9.4, 2.8, K.green) }),
      mailer(D, P, M, { lid: 112, contents: tissue, insidePrint: inside }),
    ];
    return render(D, {
      title: 'Die-cut corrugated mailer box with its flat die-cut blank',
      desc: 'A die-cut mailer box (FEFCO 0427 style) open with a white inner liner, tissue and a printed thank-you inside the lid, beside two closed mailers and the flat die-cut blank it folds from, with its crease lines and dust flaps.',
      body: body.join('\n'),
    });
  },

  'product-printed': () => {
    const D = doc('product-printed');
    const P = fit([-6, -8, 0, 98, 74, 34], { cy: 445, maxW: 720, maxH: 600 });
    const A = { x: 0, y: 30, z: 0, w: 40, d: 30, h: 32 };
    const B = { x: -4, y: -6, z: 0, w: 36, d: 28, h: 26 };
    const M = { x: 50, y: 40, z: 0, w: 30, d: 22, h: 8 };
    const leftA = `<rect y="25" width="40" height="7" fill="${K.green}"/>${honeycomb(0, 25, 40, 7, 1.2, '#FBF8F3', 0.25)}${madhu(6, 15.5, 6.2, K.green, { sub: 'PURE HONEY · 12 × 500 g' })}<g transform="translate(31.5 3)">${markRow(['up', 'fragile'], 3.2, { color: K.green })}</g>`;
    const rightA = `${honeycomb(0, 0, 30, 11, 1.2, K.green, 0.35)}<rect y="25" width="30" height="7" fill="${K.green}"/><rect x="3.6" y="13.2" width="12.4" height="9" rx="0.3" fill="#fff"/>${barcode(4.3, 14, 11, 7.4, 21)}${text(19, 17, 1.7, '12 × 500 g', { color: K.green, weight: 800 })}${text(19, 19.6, 1.2, 'NET WT 6 kg', { color: '#333', weight: 600 })}`;
    const leftB = `${madhu(5, 15, 4.6, '#2A2A2A')}<g transform="translate(27 3)">${markRow(['up', 'dry'], 3, { color: '#2A2A2A' })}</g>`;
    const lid = `<rect width="30" height="22" fill="${K.green}"/>${honeycomb(0, 0, 30, 22, 1.4, '#FBF8F3', 0.16)}${madhu(7.4, 12.6, 4, '#FBF8F3')}`;
    const plate = `<rect width="26" height="18" rx="0.6" fill="#3E9C9A" opacity="0.92"/><g transform="translate(26 0) scale(-1 1)">${madhu(5, 11, 4.4, '#7FD0CC')}</g><rect x="1" y="1" width="24" height="16" rx="0.4" fill="none" stroke="#9BE0DC" stroke-width="0.12" opacity="0.6"/>`;
    const chips = ['#23803A', '#E0A030', '#2A2A2A', '#C8372D', '#F5F2EA']
      .map((c, i) => slab(P, [80, 26, 0.3 + i * 0.22], `<rect width="3.6" height="17" rx="0.5" fill="${c}"/><rect y="13" width="3.6" height="4" rx="0.5" fill="#fff" opacity="0.85"/>`, { thick: 0.22, side: shade(c, -0.35), rot: -70 + i * 17 }))
      .join('');
    const body = [
      shadow(D, P, B, { op: 0.15 }),
      shadow(D, P, A),
      shadow(D, P, M, { op: 0.16 }),
      carton(D, P, B, { seamAlong: 'x', decor: { left: leftB, right: `<g transform="translate(6 4)">${bmcStamp(4, 4, 3.6, ['3 PLY', 'B FLUTE'])}</g>` } }),
      slab(P, [44, 2, 0], plate, { thick: 0.4, side: '#2C6F6D', rot: -10 }),
      chips,
      carton(D, P, A, { color: WHITE_TOP, tapeColor: K.green5, decor: { left: leftA, right: rightA } }),
      mailer(D, P, M, { closed: true, color: K.green, lidPrint: lid }),
    ];
    return render(D, {
      title: 'Printed and branded corrugated boxes with a flexo printing plate and ink swatches',
      desc: 'Custom printed corrugated packaging for a sample honey brand: a white-top shipping carton printed in two colours with a barcode panel, a one-colour print on kraft, a printed green mailer box, the flexo printing plate and ink swatches.',
      body: body.join('\n'),
    });
  },

  'product-7-ply': () => {
    const D = doc('product-7-ply');
    const P = fit([0, 0, 0, 122, 102, PALLET_H + 70], { cx: 560, cy: 430, maxW: 560, maxH: 560 });
    const Bx = { x: 4, y: 4, z: PALLET_H, w: 112, d: 92, h: 70 };
    const left = `<g transform="translate(6 8)">${markRow(['up', 'fragile', 'dry', () => MARK.stack(2)], 5.4)}</g><g transform="translate(76 18)">${shippingLabel(15, 21, 11, { accent: '#2A3A31' })}</g><g transform="translate(46 30)">${heavySign(18, 15)}</g>`;
    const right = `${bmcStamp(14, 18, 8.5, ['7 PLY', 'C+B+C'])}${slot(56, 14, 16, 5.6, { board: DEEP })}`;
    const body = [
      shadow(D, P, { x: 0, y: 0, w: 120, d: 100, h: PALLET_H + 70 }, { op: 0.22, soft: 12 }),
      pallet(D, P, { x: 0, y: 0, w: 120, d: 100 }),
      carton(D, P, Bx, { color: DEEP, seamAlong: 'x', tape: false, decor: { left, right } }),
      cornerBoards(D, P, Bx),
      strap(D, P, Bx, { along: 'y', at: 30, width: 2, color: '#24496E' }),
      strap(D, P, Bx, { along: 'y', at: 88, width: 2, color: '#24496E' }),
      strap(D, P, Bx, { along: 'x', at: 50, width: 2, color: '#24496E', seal: false }),
    ];
    const hole = P(Bx.x + Bx.w, Bx.y + Bx.d - 64, Bx.z + Bx.h - 16.5);
    body.push(loupe(D, { cx: 822, cy: 642, R: 84, walls: 3, from: hole, color: DEEP, label: '7-PLY · TRIPLE WALL' }));
    return render(D, {
      title: 'Heavy-duty 7-ply triple-wall corrugated box strapped on a pallet',
      desc: 'A large triple-wall (7-ply, C+B+C flute) corrugated box on a wooden pallet, secured with PP straps and metal seals and protected by corner boards, with a heavy-load warning, a pallet label and handling marks. A magnifier shows the three fluted walls.',
      body: body.join('\n'),
    });
  },

  'product-food-grade': () => {
    const D = doc('product-food-grade');
    const P = fit([0, 0, 0, 92, 78, 26], { cy: 445, maxW: 700, maxH: 600 });
    const C = { x: 48, y: 0, z: 0, w: 40, d: 30, h: 24 };
    const O = { x: 2, y: 30, z: 0, w: 44, d: 32, h: 17 };
    const leftC = `${ventRow(40, 13, 4, 1.4, 6)}<g transform="translate(3 3)">${markRow(['up', 'food', 'dry'], 3.2)}</g>${text(21.5, 7.2, 3, 'FRESH', { color: K.green, weight: 800, spacing: 0.3 })}${dropMark(36.4, 5.8, 2.6, '#E0A030')}`;
    const rightC = `${slot(9, 4.5, 12, 3.4)}${ventRow(30, 13, 3, 1.4, 6)}`;
    const contents = mangoes(D, P, { x: O.x + 0.4, y: O.y + 0.4, z: O.z + O.h - 7.6, nx: 4, ny: 3, step: 10.6, R: 4.3 });
    const body = [
      shadow(D, P, C, { op: 0.16 }),
      shadow(D, P, O),
      carton(D, P, C, { seamAlong: 'x', decor: { left: leftC, right: rightC } }),
      openCarton(D, P, O, { contents, flaps: false, decor: { left: `${ventRow(44, 8.5, 5, 1.4, 5)}<g transform="translate(2.4 2.2)">${markRow(['food'], 2.8)}</g>${text(40.5, 4.6, 2.2, 'FRESH', { color: K.green, weight: 800, anchor: 'end', spacing: 0.2 })}`, right: `${slot(10, 3.2, 12, 3.2)}${ventRow(32, 9.5, 3, 1.4, 4.8)}` } }),
      blobShadow(D, P, [60, 46, 0], 4.5, { h: 6 }),
      blobShadow(D, P, [70, 52, 0], 4.5, { h: 6 }),
      fruit(D, P(60, 46, 3.9), 4.4 * P.s * 1.32, 4.4 * P.s * 0.92, { rot: -30, leaf: true }),
      fruit(D, P(70, 52, 3.9), 4.4 * P.s * 1.32, 4.4 * P.s * 0.92, { color: '#F5C24A', blush: '#E47A2C', rot: 12 }),
    ];
    return render(D, {
      title: 'Food-grade ventilated corrugated produce carton filled with mangoes',
      desc: 'An open food-grade corrugated carton with vent slots and hand holes, packed with mangoes, next to a closed ventilated carton printed with a food-safe mark and handling symbols.',
      body: body.join('\n'),
    });
  },
};
