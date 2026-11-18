/**
 * Kit v2 scenes for the home "Dieline to Dispatch" process cards: 01 Spec & sample and 04 Pack & dispatch
 * (02 and 03 use licensed photos). Real sizes in centimetres.
 */
import { K, PALLET_H, block, blobShadow, carton, cylinderZ, doc, fit, lines, markRow, openCarton, pallet, r, render, shade, shadow, text } from './kit.mjs';
import { livery, slab, stretchWrap, wheel } from './kit-goods.mjs';

const r3 = (n) => Math.round(n * 1000) / 1000;

/** Flat RSC blank (four panels, a glue tab, flaps top and bottom) with pressed creases and L / W / H callouts */
function rscBlank({ L = 14, W = 10, H = 10, color = K.kraft } = {}) {
  const tab = 2.6;
  const f = W / 2;
  const xs = [tab, tab + L, tab + L + W, tab + 2 * L + W, tab + 2 * (L + W)];
  const total = xs[4];
  const gap = 0.35;
  let d = `M0 ${f + 0.6}L${tab} ${f}`;
  // top edge: four flaps separated by slots
  for (let i = 0; i < 4; i++) d += `L${r3(xs[i] + (i ? gap : 0))} ${f}L${r3(xs[i] + (i ? gap : 0))} 0L${r3(xs[i + 1] - gap)} 0L${r3(xs[i + 1] - gap)} ${f}`;
  d += `L${total} ${f}L${total} ${f + H}`;
  for (let i = 3; i >= 0; i--) d += `L${r3(xs[i + 1] - gap)} ${f + H}L${r3(xs[i + 1] - gap)} ${f * 2 + H}L${r3(xs[i] + (i ? gap : 0))} ${f * 2 + H}L${r3(xs[i] + (i ? gap : 0))} ${f + H}`;
  d += `L${tab} ${f + H}L0 ${f + H - 0.6}Z`;
  const creases = [`M${tab} ${f}H${total}M${tab} ${f + H}H${total}`, ...xs.slice(0, 4).map((x) => `M${x} ${f}V${f + H}`)].join('');
  const ink = '#1F5FA8';
  const arrow = (x0, y0, x1, y1, label, tx, ty) =>
    `<path d="M${r3(x0)} ${r3(y0)}L${r3(x1)} ${r3(y1)}" stroke="${ink}" stroke-width="0.14"/>` +
    `<path d="M${r3(x0)} ${r3(y0)}l${x1 > x0 ? 0.8 : 0.4} ${y1 > y0 ? 0.8 : -0.4}M${r3(x0)} ${r3(y0)}l${x1 > x0 ? 0.8 : -0.4} ${y1 > y0 ? -0.8 : -0.4}" stroke="${ink}" stroke-width="0.14" fill="none"/>` +
    `<path d="M${r3(x1)} ${r3(y1)}l${x1 > x0 ? -0.8 : -0.4} ${y1 > y0 ? -0.8 : 0.4}M${r3(x1)} ${r3(y1)}l${x1 > x0 ? -0.8 : 0.4} ${y1 > y0 ? 0.8 : 0.4}" stroke="${ink}" stroke-width="0.14" fill="none"/>` +
    `<rect x="${r3(tx - 2.6)}" y="${r3(ty - 1.15)}" width="5.2" height="1.7" rx="0.85" fill="${ink}"/>${text(tx, ty + 0.2, 1.05, label, { color: '#fff', anchor: 'middle', weight: 800 })}`;
  const art =
    `<path d="${d}" fill="${color}"/>` +
    `<path d="${creases}" stroke="${shade(color, 0.3)}" stroke-width="0.3" transform="translate(0.12 0.12)"/><path d="${creases}" stroke="${shade(color, -0.32)}" stroke-width="0.2"/>` +
    `<path d="${d}" fill="none" stroke="${shade(color, -0.45)}" stroke-width="0.14"/>` +
    arrow(xs[0] + 0.5, f + 2, xs[1] - 0.5, f + 2, `L ${L * 10}`, (xs[0] + xs[1]) / 2, f + 3.6) +
    arrow(xs[1] + 0.5, f + 2, xs[2] - 0.5, f + 2, `W ${W * 10}`, (xs[1] + xs[2]) / 2, f + 3.6) +
    arrow(xs[2] + 1.4, f + 0.5, xs[2] + 1.4, f + H - 0.5, `H ${H * 10}`, xs[2] + 4.6, f + H / 2);
  return { art, outline: `<path d="${d}"/>`, size: [total, f * 2 + H] };
}

/** Self-healing cutting mat with a printed grid */
function cuttingMat(w, h) {
  let g = '';
  for (let x = 1; x < w; x += 1) g += `M${x} 0V${h}`;
  for (let y = 1; y < h; y += 1) g += `M0 ${y}H${w}`;
  let g5 = '';
  for (let x = 5; x < w; x += 5) g5 += `M${x} 0V${h}`;
  for (let y = 5; y < h; y += 5) g5 += `M0 ${y}H${w}`;
  return `<rect width="${w}" height="${h}" rx="0.8" fill="#2F6E58"/><path d="${g}" stroke="#7FB8A2" stroke-width="0.05" opacity="0.6"/><path d="${g5}" stroke="#A9D8C5" stroke-width="0.1" opacity="0.8"/><rect x="0.6" y="0.6" width="${w - 1.2}" height="${h - 1.2}" rx="0.5" fill="none" stroke="#A9D8C5" stroke-width="0.12"/>`;
}

/** Steel rule with millimetre ticks */
function rule(len, wide = 3) {
  let t = '';
  for (let i = 0; i <= len * 10; i++) {
    const x = 0.4 + i / 10;
    if (x > len - 0.4) break;
    const hgt = i % 10 === 0 ? 1 : i % 5 === 0 ? 0.7 : 0.4;
    t += `M${r3(x)} 0V${hgt}`;
  }
  let n = '';
  for (let c = 1; c < len - 1; c++) n += text(0.4 + c, 1.9, 0.6, String(c), { color: '#333', anchor: 'middle', weight: 600 });
  return `<rect width="${len}" height="${wide}" rx="0.2" fill="#C9D0D4"/><rect width="${len}" height="${wide * 0.45}" fill="#E6EBEE" opacity="0.7"/><path d="${t}" stroke="#2B2B2B" stroke-width="0.05"/>${n}`;
}

/** Spec sheet on paper: title bar, ticked rows and a board-grade table */
function specSheet(w, h) {
  let s = `<rect width="${w}" height="${h}" fill="#FDFCF9"/><rect width="${w}" height="${h * 0.1}" fill="${K.green}"/>${text(1.2, h * 0.07, h * 0.045, 'SPEC SHEET · RSC 0201', { color: '#fff', weight: 800, spacing: 0.08 })}`;
  const rows = ['Inside size', 'Board', 'Flute', 'Print', 'Qty'];
  rows.forEach((label, i) => {
    const y = h * 0.18 + i * h * 0.1;
    s += `<rect x="1.2" y="${r3(y - 0.9)}" width="1.1" height="1.1" rx="0.15" fill="none" stroke="${K.green}" stroke-width="0.14"/><path d="M1.4 ${r3(y - 0.4)}l0.3 0.35l0.6 -0.75" stroke="${K.green}" stroke-width="0.2" fill="none"/>`;
    s += text(3, y, h * 0.032, label, { color: '#333', weight: 700 });
    s += lines(w * 0.48, y - 0.7, w * 0.4, 1, 1, { color: '#9A9A9A' });
  });
  s += `<rect x="1.2" y="${r3(h * 0.7)}" width="${w - 2.4}" height="${r3(h * 0.2)}" fill="none" stroke="#C9C2B4" stroke-width="0.1"/>`;
  s += lines(2, h * 0.74, w - 4, 3, h * 0.05, { color: '#C2BBAE' });
  return s;
}

/** Retractable tape measure: yellow case with the blade pulled out along +x */
function tapeMeasure(D, P, [x, y], blade = 18) {
  const art = `<rect width="${blade}" height="1.9" fill="#E9C43B"/>${Array.from({ length: Math.floor(blade) }, (_, i) => `<path d="M${i + 0.5} 0V${i % 5 === 4 ? 0.9 : 0.5}" stroke="#222" stroke-width="0.06"/>`).join('')}<rect x="${blade - 0.4}" width="0.4" height="2.1" fill="#8A8F93"/>`;
  let s = slab(P, [x, y, 0.4], art, { thick: 0.1, side: '#B8962A', outline: `<rect width="${blade}" height="1.9"/>` });
  s += blobShadow(D, P, [x - 3.6, y + 1, 0], 3.6, { h: 3, op: 0.22 });
  s += cylinderZ(D, P, [x - 3.6, y + 1, 0], 3.7, 3.4, { color: '#F2C230' });
  const [cx, cy] = P(x - 3.6, y + 1, 3.4);
  s += `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(P.s * 1.2)}" fill="#2B2B2B"/>`;
  return s;
}

/** Pencil lying on the mat */
function pencil(len = 16) {
  return `<rect width="${len}" height="0.8" fill="#F2C230"/><rect width="${len}" height="0.28" fill="#F8DB6A"/><rect x="${len - 1.4}" width="1.4" height="0.8" fill="#C7C9CB"/><rect x="${len}" width="0.9" height="0.8" rx="0.3" fill="#E58A8A"/><path d="M0 0L-2.2 0.4L0 0.8Z" fill="#E7C9A0"/><path d="M-1.6 0.3L-2.2 0.4L-1.6 0.5Z" fill="#333"/>`;
}

export const v2ProcessScenes = {
  'process-spec': () => {
    const D = doc('process-spec');
    const P = fit([0, 0, 0, 66, 52, 12], { cx: 588, cy: 455, maxW: 700, maxH: 620 });
    const blank = rscBlank({ L: 14, W: 10, H: 10 });
    const S = { x: 50, y: 2, z: 0.6, w: 14, d: 10, h: 10 };
    const body = [
      shadow(D, P, { x: 0, y: 0, w: 66, d: 52, h: 0.6 }, { op: 0.2, soft: 6 }),
      slab(P, [0, 0, 0.6], cuttingMat(66, 52), { thick: 0.6, side: '#1F4A3B', outline: '<rect width="66" height="52" rx="0.8"/>' }),
      slab(P, [3, 30, 0.95], blank.art, { thick: 0.35, side: shade(K.kraft, -0.35), outline: blank.outline }),
      slab(P, [3, 1.5, 0.75], specSheet(21, 27), { thick: 0.12, side: '#D8D2C6', rot: -3, outline: '<rect width="21" height="27"/>' }),
      slab(P, [30, 6, 0.75], rule(30), { thick: 0.15, side: '#8A949A', rot: 10, outline: '<rect width="30" height="3"/>' }),
      slab(P, [33, 18, 0.75], pencil(15), { thick: 0.8, side: '#B88F1E', rot: -24, outline: '<rect width="15" height="0.8"/>' }),
      `<g transform="translate(0 ${-0.6 * P.s})">${tapeMeasure(D, P, [44, 44], 16)}</g>`,
      shadow(D, P, S, { op: 0.16 }),
      openCarton(D, P, S, { t: 0.3, back: 20, side: 26, front: 118, right: 112, decor: { left: `<rect x="2" y="3.5" width="10" height="3.4" rx="0.4" fill="#fff"/>${text(7, 5.9, 1.6, 'SAMPLE', { color: K.green, weight: 800, anchor: 'middle', spacing: 0.15 })}` } }),
    ];
    return render(D, {
      title: 'Box specification and sampling: a flat RSC blank with L, W and H marked, a spec sheet and a sample box',
      desc: 'A cutting mat with a flat corrugated RSC box blank showing its creases and length, width and height in millimetres, a spec sheet with ticked rows, a steel rule, a pencil, a tape measure and the folded sample box.',
      body: body.join('\n'),
    });
  },

  'process-dispatch': () => {
    const D = doc('process-dispatch');
    const P = fit([0, -150, 0, 240, 560, 300], { cx: 600, cy: 440, maxW: 700, maxH: 660 });
    const cargo = { x: 0, y: 0, z: 80, w: 220, d: 420, h: 220 };
    const cab = { x: 8, y: -150, z: 70, w: 204, d: 145, h: 165 };
    const chassis = { x: 20, y: -150, z: 45, w: 180, d: 570, h: 35 };
    // rear opening with the load visible inside
    const rearArt = (() => {
      const W = cargo.w;
      const H = cargo.h;
      let s = `<rect x="8" y="22" width="${W - 16}" height="${H - 30}" fill="#2A2420"/>`;
      // pallets of cartons inside (front faces)
      for (const [x0, w0] of [[14, 92], [114, 92]]) {
        s += `<rect x="${x0}" y="${H - 22}" width="${w0}" height="14" fill="#8A6A44"/>`;
        for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) s += `<rect x="${x0 + 1 + col * 30}" y="${H - 22 - (row + 1) * 40}" width="29" height="39" fill="${shade(K.kraft, -0.12 - row * 0.04)}" stroke="#6B4E2E" stroke-width="0.8"/>`;
      }
      s += `<rect x="8" y="22" width="${W - 16}" height="${H - 30}" fill="none" stroke="#1A1A1A" stroke-width="2"/>`;
      // roller shutter rolled up at the top
      s += `<rect x="4" y="4" width="${W - 8}" height="18" fill="#D7D9DA"/>${[8, 12, 16].map((y) => `<rect x="4" y="${y}" width="${W - 8}" height="0.8" fill="#A9ADB0"/>`).join('')}`;
      s += `<rect x="4" y="${H - 8}" width="${W - 8}" height="6" fill="#3A3F42"/>`;
      s += `<rect x="0" y="${H - 30}" width="8" height="18" fill="#C8372D"/><rect x="${W - 8}" y="${H - 30}" width="8" height="18" fill="#C8372D"/>`;
      return s;
    })();
    const side = `${livery(420, 220, { word: 'Vayu', sub: 'PACKAGING SOLUTIONS · AHMEDABAD' })}<rect y="200" width="420" height="20" fill="${K.green7}"/>`;
    const cabSide = `<rect x="10" y="18" width="70" height="56" rx="6" fill="#1F2A30"/><rect x="10" y="18" width="70" height="56" rx="6" fill="#fff" opacity="0.12"/><path d="M14 22L44 22L24 70L14 70Z" fill="#fff" opacity="0.1"/><rect x="88" y="18" width="2" height="140" fill="${K.green7}"/><rect x="92" y="88" width="16" height="4" rx="2" fill="#D7D9DA"/><rect x="0" y="150" width="145" height="15" fill="#2A2E30"/>`;
    const L = { x: 60, y: 450, z: PALLET_H, w: 100, d: 80, h: 96 };
    const loadBoxes = [];
    for (let z = 0; z < 3; z++) for (const [x, y] of [[60, 450], [110, 450], [60, 490], [110, 490]]) loadBoxes.push({ x, y, z: PALLET_H + z * 32, w: 50, d: 40, h: 32 });
    loadBoxes.sort((a, b) => a.z - b.z || a.x + a.y - (b.x + b.y));
    // pallet jack: forks under the pallet, a red chassis and a handle towards the viewer
    const jack = () => {
      let s = block(D, P, { x: 98, y: 532, z: 2, w: 24, d: 18, h: 14 }, { color: '#C8372D' });
      const a = P(110, 548, 16);
      const b = P(110, 600, 98);
      s += `<line x1="${r(a[0])}" y1="${r(a[1])}" x2="${r(b[0])}" y2="${r(b[1])}" stroke="#2B2B2B" stroke-width="${r(P.s * 4)}" stroke-linecap="round"/>`;
      const c1 = P(100, 600, 98);
      const c2 = P(120, 600, 98);
      s += `<line x1="${r(c1[0])}" y1="${r(c1[1])}" x2="${r(c2[0])}" y2="${r(c2[1])}" stroke="#2B2B2B" stroke-width="${r(P.s * 5)}" stroke-linecap="round"/>`;
      s += wheel(D, P, [96, 541, 7], 'x', 7, 4) + wheel(D, P, [121, 541, 7], 'x', 7, 4);
      return s;
    };
    const body = [
      shadow(D, P, { x: 0, y: -150, w: 220, d: 570, h: 300 }, { op: 0.16, soft: 16 }),
      block(D, P, chassis, { color: '#3A3F42' }),
      // wheels sit under the body: their outer face is just inside the body side, which hides their tops
      wheel(D, P, [190, -95, 46], 'x', 46, 26),
      wheel(D, P, [190, 262, 46], 'x', 46, 26),
      wheel(D, P, [190, 358, 46], 'x', 46, 26),
      block(D, P, cab, { color: K.green, decor: { right: cabSide } }),
      block(D, P, cargo, { color: '#F3F1EC', decor: { right: side, left: rearArt } }),
      shadow(D, P, { x: 60, y: 450, w: 100, d: 80, h: PALLET_H + 96 }, { op: 0.2 }),
      pallet(D, P, { x: 60, y: 450, w: 100, d: 80 }),
      ...loadBoxes.map((b) => carton(D, P, b, { tape: true, decor: { left: `<g transform="translate(2.5 2.5)">${markRow(['up'], 4)}</g>` } })),
      stretchWrap(D, P, L, { from: -4 }),
      jack(),
    ];
    return render(D, {
      title: 'Dispatch: a pallet of cartons ready to load into a delivery truck',
      desc: 'A stretch-wrapped pallet of corrugated cartons on a pallet jack behind a Vayu Packaging delivery truck whose cargo bay is already loaded with pallets of boxes, ready for dispatch from Ahmedabad.',
      body: body.join('\n'),
    });
  },
};
