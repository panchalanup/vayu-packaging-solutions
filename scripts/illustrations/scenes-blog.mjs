/** Blog thumbnails (16:9, 1600×900). Educational diagrams in the same palette as the product set. */
import { C, fitIso, makeIso, poly, line3, box, flutes, openBox, pallet, shadow, svg, boardSection } from './lib.mjs';

const W = 1600;
const H = 900;
const FONT = `font-family="Satoshi, 'Segoe UI', Arial, sans-serif"`;
const blog = (title, body) => svg({ w: W, h: H, title, body });
const text = (x, y, s, size = 40, { weight = 700, fill = C.ink800, anchor = 'middle' } = {}) =>
  `<text x="${x}" y="${y}" ${FONT} font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${s}</text>`;
const arrow = (x1, y1, x2, y2, color = C.green600, w = 6) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 16;
  const p1 = [x2 - Math.cos(a - 0.45) * h, y2 - Math.sin(a - 0.45) * h];
  const p2 = [x2 - Math.cos(a + 0.45) * h, y2 - Math.sin(a + 0.45) * h];
  return `<g stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><polyline points="${p1.join(',')} ${x2},${y2} ${p2.join(',')}"/></g>`;
};
const card = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="${C.paper50}" stroke="${C.paper300}" stroke-width="2"/>`;

export const blogScenes = {
  // default + BLOG-01: box families
  'blog-default': () => {
    const P = fitIso([0, 0, 0, 520, 330, 260], { cx: 560, cy: 460, maxW: 860, maxH: 600 });
    const a = { x: 0, y: 0, z: 0, w: 230, d: 160, h: 110 };
    const b = { x: 20, y: 12, z: 110, w: 190, d: 130, h: 80 };
    const o = { x: 250, y: 150, z: 0, w: 220, d: 160, h: 110 };
    const sec = boardSection({ x: 1000, y: 330, w: 420, layers: 5, flute: 40, liner: 11, strokeW: 7 });
    return blog(
      'Corrugated boxes beside a cross-section of five-ply board',
      shadow(P, { x: 0, y: 0, w: 470, d: 310 }) + box(P, { ...a, tape: true }) + flutes(P, { ...a, n: 15 }) + box(P, { ...b, tape: true }) + openBox(P, o) + card(960, 270, 500, sec.height + 120) + `<g transform="translate(0 0)">${sec.svg.replace(/x="1000"/g, 'x="1000"')}</g>`,
    );
  },

  'blog-types': () => {
    const P = makeIso(254, 454, 1.05); // row runs along x - y, so it projects horizontally
    const k = (i) => ({ x: i * 200, y: -i * 200 });
    const items = [
      { ...k(0), z: 0, w: 150, d: 120, h: 170, tape: true },
      { ...k(1), z: 0, w: 190, d: 150, h: 48 },
      { ...k(2), z: 0, w: 150, d: 150, h: 150, top: C.green500, left: C.green600, right: C.green700, stroke: C.green700 },
      { ...k(3), z: 0, w: 220, d: 150, h: 90, tape: true },
    ];
    return blog('Four common corrugated box styles side by side', items.map((b) => shadow(P, { x: b.x, y: b.y, w: b.w, d: b.d, pad: 14, op: 0.16 }) + box(P, b) + flutes(P, { ...b, n: 10 })).join(''));
  },

  // BLOG-02: wall comparison
  'blog-walls': () => {
    const xs = [150, 590, 1030];
    const cfg = [{ layers: 3, flute: 78, label: 'Single wall' }, { layers: 5, flute: 56, label: 'Double wall' }, { layers: 7, flute: 42, label: 'Triple wall' }];
    const out = [];
    cfg.forEach((c, i) => {
      const probe = boardSection({ x: 0, y: 0, w: 360, layers: c.layers, flute: c.flute, liner: 14, strokeW: 9 });
      const sec = boardSection({ x: xs[i], y: 420 - probe.height / 2, w: 360, layers: c.layers, flute: c.flute, liner: 14, strokeW: 9 });
      out.push(card(xs[i] - 30, 170, 420, 560));
      out.push(sec.svg);
      out.push(text(xs[i] + 180, 650, c.label, 40));
      out.push(text(xs[i] + 180, 694, `${c.layers}-ply`, 30, { weight: 500, fill: C.ink500 }));
    });
    return blog('Single, double and triple wall corrugated board cross-sections', out.join(''));
  },

  // BLOG-03: flute profiles
  'blog-flutes': () => {
    const flutes_ = [
      ['A', 100, 190], ['B', 52, 124], ['C', 76, 164], ['E', 32, 68], ['F', 18, 48],
    ];
    const out = [card(80, 150, 1440, 600)];
    flutes_.forEach(([letter, hgt, pitch], i) => {
      const x = 150 + i * 280;
      const w = 220;
      const y = 440 - hgt / 2;
      let d = '';
      const n = 80;
      for (let k = 0; k <= n; k++) {
        const px = x + (w * k) / n;
        const py = y + hgt / 2 - Math.cos(((px - x) / pitch) * Math.PI * 2) * (hgt / 2);
        d += `${k ? ' L' : 'M'} ${px.toFixed(1)} ${py.toFixed(1)}`;
      }
      out.push(`<rect x="${x}" y="${y - 12}" width="${w}" height="12" fill="${C.k300}" stroke="${C.k700}" stroke-width="2"/>`);
      out.push(`<path d="${d}" fill="none" stroke="${C.k400}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`);
      out.push(`<rect x="${x}" y="${y + hgt}" width="${w}" height="12" fill="${C.k300}" stroke="${C.k700}" stroke-width="2"/>`);
      out.push(text(x + w / 2, 640, letter, 76, { fill: C.green700 }));
      out.push(text(x + w / 2, 690, 'flute', 28, { weight: 500, fill: C.ink500 }));
    });
    return blog('Corrugated flute profiles A, B, C, E and F drawn to relative scale', out.join(''));
  },

  // BLOG-04: GSM
  'blog-gsm': () => {
    const out = [card(100, 130, 1400, 640)];
    out.push(`<rect x="220" y="260" width="360" height="360" fill="${C.k300}" stroke="${C.k700}" stroke-width="4"/>`);
    out.push(`<g stroke="${C.k700}" stroke-width="2" opacity="0.18">${Array.from({ length: 12 }, (_, i) => `<line x1="${220 + i * 30}" y1="260" x2="${220 + i * 30}" y2="620"/>`).join('')}</g>`);
    out.push(arrow(220, 662, 580, 662, C.green700, 5) + arrow(580, 662, 220, 662, C.green700, 5));
    out.push(text(400, 722, '1 m', 38, { fill: C.green700 }));
    out.push(text(400, 450, '1 m²', 64, { fill: C.k900 }));
    out.push(text(700, 460, '→', 90, { weight: 500, fill: C.ink500 }));
    // scale
    out.push(`<rect x="820" y="560" width="300" height="40" rx="8" fill="${C.ink500}"/><rect x="860" y="400" width="220" height="160" rx="16" fill="${C.ink800}"/><rect x="884" y="424" width="172" height="76" rx="8" fill="#BFE3C8"/>`);
    out.push(text(970, 484, 'g', 54, { weight: 700, fill: C.ink800 }));
    out.push(`<rect x="860" y="360" width="220" height="14" rx="7" fill="${C.k400}"/>`);
    out.push(text(1290, 400, 'GSM', 96, { fill: C.green700 }));
    out.push(text(1290, 470, '= grams per m²', 38, { weight: 500, fill: C.ink500 }));
    return blog('A one square metre paper sample on a scale, showing GSM as grams per square metre', out.join(''));
  },

  // BLOG-05: burst vs ECT
  'blog-burst-ect': () => {
    const out = [card(80, 130, 680, 640), card(840, 130, 680, 640)];
    // burst tester: clamp rings + dome
    out.push(`<rect x="200" y="440" width="440" height="30" rx="6" fill="${C.ink500}"/><rect x="200" y="330" width="130" height="110" rx="6" fill="${C.ink500}"/><rect x="510" y="330" width="130" height="110" rx="6" fill="${C.ink500}"/>`);
    out.push(`<rect x="200" y="470" width="440" height="16" fill="${C.k300}" stroke="${C.k700}" stroke-width="2"/>`);
    out.push(`<path d="M 330 440 C 340 330, 500 330, 510 440" fill="${C.k300}" stroke="${C.k700}" stroke-width="4"/>`);
    out.push(`<rect x="200" y="486" width="440" height="110" rx="10" fill="${C.ink800}"/>`);
    out.push(arrow(420, 590, 420, 400, C.green600, 8));
    out.push(text(420, 700, 'Burst strength', 40));
    // ECT: board strip squeezed on its edge
    const sec = boardSection({ x: 0, y: 0, w: 300, layers: 3, flute: 36, liner: 12, strokeW: 8 });
    out.push(`<g transform="translate(1130 400) rotate(90) translate(-150 -${sec.height / 2})">${sec.svg}</g>`);
    out.push(`<rect x="960" y="210" width="340" height="22" rx="6" fill="${C.ink500}"/><rect x="960" y="560" width="340" height="22" rx="6" fill="${C.ink500}"/>`);
    out.push(arrow(1130, 150, 1130, 205, C.green600, 8) + arrow(1130, 640, 1130, 586, C.green600, 8));
    out.push(text(1180, 700, 'Edge crush (ECT)', 40));
    return blog('Burst strength pushes through a sheet, edge crush squeezes a board on its edge', out.join(''));
  },

  // BLOG-06: measuring
  'blog-measure': () => {
    const P = fitIso([-60, -60, 0, 340, 270, 230], { cx: 800, cy: 450, maxW: 900, maxH: 640 });
    const b = { x: 0, y: 0, z: 0, w: 280, d: 200, h: 170 };
    const dim = (a, c, label, lx, ly) => {
      const [x1, y1] = P(...a);
      const [x2, y2] = P(...c);
      return arrow(x1, y1, x2, y2, C.green700, 5) + arrow(x2, y2, x1, y1, C.green700, 5) + text(lx, ly, label, 54, { fill: C.green700 });
    };
    const [lx, ly] = P(b.x + b.w / 2, b.y + b.d + 52, 0);
    const [bx, by] = P(b.x + b.w + 56, b.y + b.d / 2, 0);
    const [hx, hy] = P(b.x - 40, b.y + b.d + 6, b.h / 2);
    return blog(
      'A carton with length, breadth and height arrows',
      shadow(P, { ...b, pad: 30 }) + box(P, { ...b, tape: true }) + flutes(P, { ...b, n: 14 }) +
        dim([b.x, b.y + b.d + 40, 0], [b.x + b.w, b.y + b.d + 40, 0], 'L', lx - 70, ly + 40) +
        dim([b.x + b.w + 40, b.y, 0], [b.x + b.w + 40, b.y + b.d, 0], 'B', bx + 70, by + 40) +
        dim([b.x - 30, b.y + b.d + 30, 0], [b.x - 30, b.y + b.d + 30, b.h], 'H', hx - 52, hy + 14),
    );
  },

  // BLOG-07: kraft grades
  'blog-kraft': () => {
    const out = [card(80, 150, 1440, 600)];
    const roll = (cx, base, speck, label, sub) => {
      const g = [];
      g.push(`<ellipse cx="${cx}" cy="660" rx="220" ry="26" fill="${C.ink800}" opacity="0.12" filter="url(#soft)"/>`);
      g.push(`<circle cx="${cx}" cy="420" r="210" fill="${base}" stroke="${C.k700}" stroke-width="4"/>`);
      for (let r = 170; r > 60; r -= 38) g.push(`<circle cx="${cx}" cy="420" r="${r}" fill="none" stroke="${C.k700}" stroke-opacity="0.18" stroke-width="2"/>`);
      g.push(`<circle cx="${cx}" cy="420" r="70" fill="${C.k500}" stroke="${C.k700}" stroke-width="4"/><circle cx="${cx}" cy="420" r="44" fill="${C.paper100}" stroke="${C.k700}" stroke-width="3"/>`);
      let seed = speck;
      const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
      for (let i = 0; i < (speck === 7 ? 0 : 70); i++) {
        const a = rnd() * Math.PI * 2;
        const rr = 80 + rnd() * 120;
        g.push(`<ellipse cx="${cx + Math.cos(a) * rr}" cy="${420 + Math.sin(a) * rr}" rx="${2 + rnd() * 5}" ry="${1 + rnd() * 2.5}" fill="${C.k900}" opacity="${0.25 + rnd() * 0.3}" transform="rotate(${rnd() * 180} ${cx + Math.cos(a) * rr} ${420 + Math.sin(a) * rr})"/>`);
      }
      g.push(text(cx, 700, label, 44), text(cx, 744, sub, 28, { weight: 500, fill: C.ink500 }));
      return g.join('');
    };
    out.push(roll(480, '#DDBF95', 7, 'Virgin kraft', 'long, strong fibres'));
    out.push(roll(1120, '#C9A072', 13, 'Recycled kraft', 'shorter, mixed fibres'));
    return blog('Two paper reels: smooth virgin kraft and flecked recycled kraft', out.join(''));
  },

  // BLOG-08: 3D box designer
  'blog-3d-tool': () => {
    const out = [];
    out.push(`<ellipse cx="800" cy="800" rx="520" ry="30" fill="${C.ink800}" opacity="0.14" filter="url(#soft)"/>`);
    out.push(`<rect x="330" y="150" width="940" height="560" rx="26" fill="${C.ink800}"/><rect x="356" y="176" width="888" height="508" rx="12" fill="${C.paper50}"/>`);
    out.push(`<path d="M 250 730 L 1350 730 L 1300 780 L 300 780 Z" fill="${C.ink500}"/><rect x="640" y="728" width="320" height="10" rx="5" fill="${C.ink300}"/>`);
    // tool UI chrome
    out.push(`<rect x="356" y="176" width="888" height="46" rx="12" fill="${C.paper200}"/><circle cx="388" cy="199" r="7" fill="${C.ink300}"/><circle cx="412" cy="199" r="7" fill="${C.ink300}"/><circle cx="436" cy="199" r="7" fill="${C.ink300}"/>`);
    out.push(`<rect x="356" y="222" width="150" height="462" fill="${C.paper100}"/>` + [0, 1, 2, 3].map((i) => `<rect x="376" y="${252 + i * 56}" width="110" height="14" rx="7" fill="${C.ink300}" opacity="${0.8 - i * 0.12}"/><rect x="376" y="${272 + i * 56}" width="76" height="10" rx="5" fill="${C.ink300}" opacity="0.4"/>`).join(''));
    const P = fitIso([0, 0, 0, 260, 190, 150], { cx: 880, cy: 460, maxW: 440, maxH: 300 });
    const b = { x: 0, y: 0, z: 0, w: 260, d: 190, h: 150 };
    out.push(shadow(P, { ...b, pad: 20 }) + box(P, { ...b, tape: true }) + flutes(P, { ...b, n: 12 }));
    out.push(`<g fill="none" stroke="${C.green600}" stroke-width="7" stroke-linecap="round"><path d="M 660 590 C 760 650, 960 650, 1080 590"/><polyline points="1058,574 1084,590 1056,608" stroke-linejoin="round"/></g>`);
    out.push(`<rect x="1090" y="244" width="130" height="44" rx="22" fill="${C.green600}"/>` + text(1155, 275, 'FREE', 24, { fill: C.paper50 }));
    return blog('Laptop showing a 3D corrugated box designer with a rotating box', out.join(''));
  },
};

// ---------------------------------------------------------------------------
// Designer Guides: feature guides for the 3D Box Designer (/box-designer). Same palette and restraint as above:
// one idea per picture, kraft board, green for the thing the reader should look at.
// ---------------------------------------------------------------------------

const pill = (x, y, w, h, label, on = false, size = 28) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${on ? C.green600 : C.paper100}" stroke="${on ? C.green700 : C.paper300}" stroke-width="2"/>` +
  text(x + w / 2, y + h / 2 + size * 0.36, label, size, { fill: on ? C.paper50 : C.ink500 });

const stepNo = (cx, cy, n) => `<circle cx="${cx}" cy="${cy}" r="30" fill="${C.green600}"/>` + text(cx, cy + 11, String(n), 32, { fill: C.paper50 });

const tick = (cx, cy, ok = true) =>
  ok
    ? `<circle cx="${cx}" cy="${cy}" r="22" fill="${C.green600}"/><polyline points="${cx - 10},${cy} ${cx - 3},${cy + 8} ${cx + 11},${cy - 8}" fill="none" stroke="${C.paper50}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<circle cx="${cx}" cy="${cy}" r="22" fill="${C.k400}"/><line x1="${cx}" y1="${cy - 11}" x2="${cx}" y2="${cy + 3}" stroke="${C.paper50}" stroke-width="5" stroke-linecap="round"/><circle cx="${cx}" cy="${cy + 11}" r="3.2" fill="${C.paper50}"/>`;

/** Flat RSC blank: glue flap + L, W, L, W panels with half-width flaps. Solid = cut, dashed = crease. */
function dieline2d({ x, y, L, Wd, Hh, cut = C.ink800, score = C.green600, fill = C.k200, sw = 3 }) {
  const fl = Wd / 2;
  const g = Math.max(14, Hh * 0.16);
  const gap = Math.max(3, Wd * 0.03);
  const widths = [L, Wd, L, Wd];
  const xs = [x + g];
  widths.forEach((w) => xs.push(xs[xs.length - 1] + w));
  const yb = y + fl;
  const out = [];
  out.push(`<polygon points="${x},${yb + g * 0.6} ${x + g},${yb} ${x + g},${yb + Hh} ${x},${yb + Hh - g * 0.6}" fill="${fill}"/>`);
  widths.forEach((w, i) => {
    const px = xs[i];
    out.push(`<rect x="${px}" y="${yb}" width="${w}" height="${Hh}" fill="${fill}"/>`);
    out.push(`<rect x="${px + gap}" y="${y}" width="${w - 2 * gap}" height="${fl}" fill="${fill}"/>`);
    out.push(`<rect x="${px + gap}" y="${yb + Hh}" width="${w - 2 * gap}" height="${fl}" fill="${fill}"/>`);
  });
  const c = [`M ${x + g} ${yb} L ${x} ${yb + g * 0.6} L ${x} ${yb + Hh - g * 0.6} L ${x + g} ${yb + Hh}`];
  widths.forEach((w, i) => {
    const px = xs[i];
    c.push(`M ${px} ${yb} L ${px + gap} ${yb} L ${px + gap} ${y} L ${px + w - gap} ${y} L ${px + w - gap} ${yb} L ${px + w} ${yb}`);
    c.push(`M ${px} ${yb + Hh} L ${px + gap} ${yb + Hh} L ${px + gap} ${yb + Hh + fl} L ${px + w - gap} ${yb + Hh + fl} L ${px + w - gap} ${yb + Hh} L ${px + w} ${yb + Hh}`);
  });
  c.push(`M ${xs[4]} ${yb} L ${xs[4]} ${yb + Hh}`);
  out.push(`<path d="${c.join(' ')}" fill="none" stroke="${cut}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`);
  const s = [];
  widths.forEach((w, i) => s.push(`M ${xs[i] + gap} ${yb} L ${xs[i] + w - gap} ${yb}`, `M ${xs[i] + gap} ${yb + Hh} L ${xs[i] + w - gap} ${yb + Hh}`));
  for (let i = 0; i < 4; i++) s.push(`M ${xs[i]} ${yb} L ${xs[i]} ${yb + Hh}`);
  out.push(`<path d="${s.join(' ')}" fill="none" stroke="${score}" stroke-width="${sw}" stroke-dasharray="${sw * 4} ${sw * 3}" stroke-linecap="round"/>`);
  return { svg: out.join(''), w: xs[4] - x, h: Hh + 2 * fl };
}

/** Quads drawn on the two visible faces of a box: L = the y+d face (u along x), R = the x+w face (u along y) */
const faceQuad = (P, b, side, u, v, w, h, attrs) => {
  const at = side === 'L' ? (uu, vv) => P(b.x + uu, b.y + b.d, (b.z ?? 0) + vv) : (uu, vv) => P(b.x + b.w, b.y + uu, (b.z ?? 0) + vv);
  return `<polygon points="${[at(u, v), at(u + w, v), at(u + w, v + h), at(u, v + h)].map((p) => p.join(',')).join(' ')}" ${attrs}/>`;
};

/** Open-top shell without flaps (half-slotted look, trays, mailer bases) */
function openShell(P, { x, y, z = 0, w, d, h, outer = [C.k400, C.k500], inner = ['#B58A5B', '#A47B4F', '#946B42'], stroke = C.k700, sw = 1.2, contents = '' }) {
  const zt = z + h;
  return [
    poly(P, [[x, y, z], [x + w, y, z], [x + w, y, zt], [x, y, zt]], inner[0], { stroke, sw }),
    poly(P, [[x, y, z], [x, y + d, z], [x, y + d, zt], [x, y, zt]], inner[1], { stroke, sw }),
    poly(P, [[x, y, z + 1], [x + w, y, z + 1], [x + w, y + d, z + 1], [x, y + d, z + 1]], inner[2], { stroke: 'none' }),
    contents,
    poly(P, [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, zt], [x, y + d, zt]], outer[0], { stroke, sw }),
    poly(P, [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, zt], [x + w, y, zt]], outer[1], { stroke, sw }),
  ].join('');
}

const logoOnL = (P, b, u, v, s) =>
  faceQuad(P, b, 'L', u, v, s, s, `fill="${C.green600}" stroke="${C.green700}" stroke-width="1.5"`) +
  faceQuad(P, b, 'L', u + s * 0.28, v + s * 0.28, s * 0.44, s * 0.44, `fill="${C.paper50}"`);

/** The eight styles the designer draws, each as a small sketch with its own bounding box */
const STYLE_SKETCHES = [
  { label: 'RSC', bb: [0, 0, 0, 160, 120, 110], draw: (P) => box(P, { x: 0, y: 0, w: 160, d: 120, h: 110, tape: true }) },
  { label: 'HSC', bb: [0, 0, 0, 160, 120, 110], draw: (P) => openShell(P, { x: 0, y: 0, w: 160, d: 120, h: 110 }) },
  {
    label: 'Full overlap',
    bb: [0, 0, 0, 160, 120, 110],
    draw: (P) =>
      box(P, { x: 0, y: 0, w: 160, d: 120, h: 110 }) +
      poly(P, [[0, 14, 110], [160, 14, 110], [160, 120, 110], [0, 120, 110]], C.k200, { stroke: C.k700, sw: 1.2 }),
  },
  {
    label: 'Sleeve',
    bb: [0, 0, 0, 200, 110, 90],
    draw: (P) => {
      const b = { x: 0, y: 0, w: 200, d: 110, h: 90 };
      return box(P, b) + faceQuad(P, b, 'R', 7, 7, 96, 76, `fill="${C.k900}" opacity="0.82"`);
    },
  },
  {
    label: 'Telescope',
    bb: [-6, -6, 0, 156, 126, 160],
    draw: (P) => box(P, { x: 0, y: 0, w: 150, d: 120, h: 100 }) + box(P, { x: -6, y: -6, z: 116, w: 162, d: 132, h: 40, top: C.k200 }),
  },
  {
    label: 'Mailer',
    bb: [0, -50, 0, 170, 130, 165],
    draw: (P) => {
      const a = (72 * Math.PI) / 180;
      const [dy, dz] = [-130 * Math.cos(a), 130 * Math.sin(a)];
      return poly(P, [[0, 0, 45], [170, 0, 45], [170, dy, 45 + dz], [0, dy, 45 + dz]], '#B58A5B', { stroke: C.k700, sw: 1.2 }) + openShell(P, { x: 0, y: 0, w: 170, d: 130, h: 45 });
    },
  },
  {
    label: 'Pizza',
    bb: [0, 0, 0, 170, 170, 30],
    draw: (P) => box(P, { x: 0, y: 0, w: 170, d: 170, h: 30 }) + line3(P, [0, 150, 30], [170, 150, 30], { sw: 1.4, op: 0.7 }),
  },
  { label: 'Tray', bb: [0, 0, 0, 180, 130, 36], draw: (P) => openShell(P, { x: 0, y: 0, w: 180, d: 130, h: 36 }) },
];

Object.assign(blogScenes, {
  // DG-01: how to use the designer, three steps
  'blog-dg-how-to': () => {
    const out = [];
    const xs = [80, 580, 1080];
    xs.forEach((x) => out.push(card(x, 160, 440, 580)));
    out.push(arrow(526, 450, 572, 450, C.green600, 6) + arrow(1026, 450, 1072, 450, C.green600, 6));
    // 1. pick a style (flat blank)
    const d = dieline2d({ x: 0, y: 0, L: 90, Wd: 60, Hh: 90, sw: 2.5 });
    out.push(`<g transform="translate(${80 + (440 - d.w) / 2} ${430 - d.h / 2})">${d.svg}</g>`);
    // 2. set the size
    const P2 = fitIso([-30, 0, 0, 200, 180, 140], { cx: 800, cy: 440, maxW: 320, maxH: 290 });
    const b2 = { x: 0, y: 0, w: 200, d: 150, h: 140 };
    const dim = (a, c) => {
      const [x1, y1] = P2(...a);
      const [x2, y2] = P2(...c);
      return arrow(x1, y1, x2, y2, C.green700, 4) + arrow(x2, y2, x1, y1, C.green700, 4);
    };
    out.push(shadow(P2, { ...b2, pad: 16 }) + box(P2, { ...b2, tape: true }) + flutes(P2, { ...b2, n: 10 }));
    out.push(dim([0, 178, 0], [200, 178, 0]) + dim([-22, 150, 0], [-22, 150, 140]));
    // 3. add your logo
    const P3 = fitIso([0, 0, 0, 200, 150, 140], { cx: 1300, cy: 440, maxW: 300, maxH: 280 });
    const b3 = { x: 0, y: 0, w: 200, d: 150, h: 140 };
    out.push(shadow(P3, { ...b3, pad: 16 }) + box(P3, b3) + logoOnL(P3, b3, 40, 50, 56));
    out.push(faceQuad(P3, b3, 'L', 108, 74, 64, 10, `fill="${C.ink800}"`) + faceQuad(P3, b3, 'L', 108, 56, 44, 8, `fill="${C.ink500}"`));
    out.push(tick(1450, 250));
    ['Pick a style', 'Set the size', 'Add your logo'].forEach((label, i) => out.push(stepNo(xs[i] + 56, 216, i + 1), text(xs[i] + 220, 680, label, 40)));
    return blog('Three steps in the 3D box designer: pick a style, set the size, add your logo', out.join(''));
  },

  // DG-02: eight box styles
  'blog-dg-styles': () => {
    const out = [];
    STYLE_SKETCHES.forEach((s, i) => {
      const cx0 = 91 + (i % 4) * 366;
      const cy0 = i < 4 ? 110 : 470;
      out.push(card(cx0, cy0, 320, 320));
      const P = fitIso(s.bb, { cx: cx0 + 160, cy: cy0 + 140, maxW: 220, maxH: 170 });
      out.push(s.draw(P));
      out.push(text(cx0 + 160, cy0 + 286, s.label, 32));
    });
    return blog('Eight corrugated box styles: RSC, HSC, full overlap, sleeve, telescope, mailer, pizza and tray', out.join(''));
  },

  // DG-03: box size and fit
  'blog-dg-fit': () => {
    const out = [];
    const P = fitIso([-40, -40, 0, 320, 260, 200], { cx: 540, cy: 480, maxW: 700, maxH: 580 });
    const b = { x: 0, y: 0, w: 300, d: 220, h: 180 };
    const product = box(P, { x: 45, y: 45, z: 1, w: 210, d: 130, h: 168, top: C.green500, left: C.green600, right: C.green700, stroke: C.green700 });
    out.push(shadow(P, { ...b, pad: 30 }) + openBox(P, { ...b, back: 70, front: -30, contents: product }));
    // clearance arrows between product and wall, at rim height
    const [ax, ay] = P(255, 110, 169);
    const [bx2, by2] = P(300, 110, 180);
    out.push(arrow(ax, ay, bx2, by2, C.ink800, 4) + arrow(bx2, by2, ax, ay, C.ink800, 4));
    out.push(card(1040, 190, 460, 520));
    const rows = [
      [C.green600, 'Your product'],
      [C.k300, '+ padding'],
      [C.k500, '= inside size'],
    ];
    rows.forEach(([fill, label], i) => {
      const y = 270 + i * 92;
      out.push(`<rect x="1090" y="${y - 26}" width="52" height="52" rx="10" fill="${fill}" stroke="${C.k700}" stroke-width="1.5"/>`);
      out.push(text(1166, y + 12, label, 36, { anchor: 'start', weight: i === 2 ? 700 : 500 }));
    });
    out.push(`<line x1="1090" y1="520" x2="1450" y2="520" stroke="${C.paper300}" stroke-width="2"/>`);
    out.push(pill(1090, 560, 110, 60, 'mm') + pill(1215, 560, 110, 60, 'cm', true) + pill(1340, 560, 110, 60, 'in'));
    return blog('A product inside a box with clearance marked, beside a fit checklist and mm, cm and inch units', out.join(''));
  },

  // DG-04: price estimate and quantity tiers
  'blog-dg-price': () => {
    const out = [];
    const P = fitIso([0, 0, 0, 260, 190, 160], { cx: 360, cy: 500, maxW: 480, maxH: 400 });
    const b = { x: 0, y: 0, w: 260, d: 190, h: 160 };
    out.push(shadow(P, { ...b, pad: 26 }) + box(P, { ...b, tape: true }) + flutes(P, { ...b, n: 14 }));
    const [tx, ty] = P(260, 0, 160);
    out.push(`<path d="M ${tx} ${ty} C ${tx + 30} ${ty - 60}, ${tx + 70} ${ty - 70}, ${tx + 110} ${ty - 60}" fill="none" stroke="${C.ink500}" stroke-width="3"/>`);
    out.push(`<circle cx="${tx + 150}" cy="${ty - 70}" r="52" fill="${C.green600}" stroke="${C.green700}" stroke-width="3"/>` + text(tx + 150, ty - 50, '₹', 60, { fill: C.paper50 }));
    out.push(card(880, 160, 620, 580));
    out.push(text(930, 236, 'Cost per box', 32, { anchor: 'start', fill: C.ink500, weight: 500 }));
    const hs = [330, 250, 200, 160];
    const labels = ['100', '500', '1,000', '5,000'];
    const tops = [];
    hs.forEach((h, i) => {
      const x = 950 + i * 132;
      tops.push([x + 45, 640 - h]);
      out.push(`<rect x="${x}" y="${640 - h}" width="90" height="${h}" rx="8" fill="${i === 3 ? C.green600 : C.k400}" stroke="${i === 3 ? C.green700 : C.k700}" stroke-width="2"/>`);
      out.push(text(x + 45, 690, labels[i], 30, { weight: 600, fill: C.ink800 }));
    });
    out.push(`<polyline points="${tops.map(([x, y]) => `${x},${y - 26}`).join(' ')}" fill="none" stroke="${C.ink500}" stroke-width="3" stroke-dasharray="10 8"/>`);
    out.push(`<line x1="930" y1="640" x2="1450" y2="640" stroke="${C.ink500}" stroke-width="3"/>`);
    return blog('A box with a rupee tag beside a bar chart where the cost per box falls as the order quantity rises', out.join(''));
  },

  // DG-05: logo and artwork
  'blog-dg-artwork': () => {
    const out = [];
    const P = fitIso([-20, -20, 0, 320, 220, 200], { cx: 560, cy: 470, maxW: 760, maxH: 620 });
    const b = { x: 0, y: 0, w: 300, d: 200, h: 200 };
    out.push(shadow(P, { ...b, pad: 30 }) + box(P, b));
    out.push(faceQuad(P, b, 'L', 20, 20, 260, 160, `fill="none" stroke="${C.green700}" stroke-width="3" stroke-dasharray="12 9"`));
    out.push(logoOnL(P, b, 52, 76, 76));
    out.push(faceQuad(P, b, 'L', 150, 120, 104, 15, `fill="${C.ink800}"`) + faceQuad(P, b, 'L', 150, 94, 76, 11, `fill="${C.ink500}"`) + faceQuad(P, b, 'L', 150, 72, 90, 11, `fill="${C.ink500}"`));
    for (let i = 0; i < 16; i++) out.push(faceQuad(P, b, 'R', 50 + i * 6.5, 30, i % 3 ? 2.6 : 4.4, 56, `fill="${C.ink800}"`));
    out.push(card(1060, 220, 440, 460));
    out.push(text(1100, 290, 'Print check', 36, { anchor: 'start' }));
    [
      [true, 'Image is sharp'],
      [true, 'Inside safe area'],
      [false, 'Text too small'],
    ].forEach(([ok, label], i) => {
      const y = 380 + i * 96;
      out.push(tick(1122, y, ok) + text(1166, y + 11, label, 32, { anchor: 'start', weight: 500 }));
    });
    return blog('A box with a logo and text inside a dashed safe area, beside a print checklist', out.join(''));
  },

  // DG-06: dieline
  'blog-dg-dieline': () => {
    const out = [card(70, 120, 1460, 660)];
    const d = dieline2d({ x: 140, y: 0, L: 230, Wd: 150, Hh: 230, sw: 4 });
    out.push(`<g transform="translate(0 ${450 - d.h / 2})">${d.svg}</g>`);
    const P = fitIso([0, 0, 0, 230, 150, 230], { cx: 1270, cy: 340, maxW: 240, maxH: 260 });
    const b = { x: 0, y: 0, w: 230, d: 150, h: 230 };
    out.push(shadow(P, { ...b, pad: 14 }) + box(P, { ...b, seam: true }));
    out.push(`<line x1="1120" y1="580" x2="1220" y2="580" stroke="${C.ink800}" stroke-width="5" stroke-linecap="round"/>` + text(1240, 592, 'cut', 32, { anchor: 'start', weight: 500 }));
    out.push(`<line x1="1120" y1="650" x2="1220" y2="650" stroke="${C.green600}" stroke-width="5" stroke-dasharray="16 12" stroke-linecap="round"/>` + text(1240, 662, 'crease', 32, { anchor: 'start', weight: 500 }));
    return blog('A flat box dieline with solid cut lines and dashed crease lines, beside the folded box', out.join(''));
  },

  // DG-07: product shots and 360 video
  'blog-dg-shots': () => {
    const out = [];
    out.push(`<rect x="250" y="100" width="1100" height="700" rx="26" fill="${C.paper100}" stroke="${C.paper300}" stroke-width="2"/>`);
    out.push(`<ellipse cx="800" cy="650" rx="330" ry="92" fill="${C.ink300}" opacity="0.35"/><ellipse cx="800" cy="636" rx="320" ry="86" fill="${C.paper200}" stroke="${C.paper300}" stroke-width="3"/>`);
    const P = fitIso([0, 0, 0, 240, 180, 170], { cx: 800, cy: 470, maxW: 420, maxH: 330 });
    const b = { x: 0, y: 0, w: 240, d: 180, h: 170 };
    out.push(shadow(P, { ...b, pad: 18 }) + box(P, b) + logoOnL(P, b, 50, 60, 56) + faceQuad(P, b, 'L', 124, 84, 80, 12, `fill="${C.ink800}"`));
    out.push(`<path d="M 440 664 A 360 112 0 0 0 1150 676" fill="none" stroke="${C.green600}" stroke-width="7" stroke-linecap="round"/>`);
    out.push(arrow(1118, 712, 1152, 672, C.green600, 7));
    const corner = (x, y, sx, sy) => `<polyline points="${x},${y + sy * 64} ${x},${y} ${x + sx * 64},${y}" fill="none" stroke="${C.ink800}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
    out.push(corner(320, 170, 1, 1) + corner(1280, 170, -1, 1) + corner(320, 730, 1, -1) + corner(1280, 730, -1, -1));
    out.push(`<circle cx="1222" cy="222" r="14" fill="${C.green600}"/>` + text(1196, 234, '360°', 34, { anchor: 'end' }));
    return blog('A branded box on a turntable inside a camera frame, with a 360 degree rotation arrow', out.join(''));
  },

  // DG-08: stacking strength
  'blog-dg-stack': () => {
    const out = [];
    const P = fitIso([0, 0, 0, 440, 340, 520], { cx: 600, cy: 500, maxW: 700, maxH: 640 });
    out.push(shadow(P, { x: 0, y: 0, w: 440, d: 340, pad: 26 }));
    out.push(pallet(P, { x: 0, y: 0, w: 440, d: 340 }));
    const cells = [];
    for (const x of [0, 225]) for (const y of [0, 175]) for (const k of [0, 1, 2]) cells.push({ x, y, z: 27 + k * 124, w: 215, d: 165, h: 120, tape: true });
    cells.sort((a, c) => a.x + a.y - (c.x + c.y) || a.z - c.z);
    cells.forEach((c) => out.push(box(P, c)));
    const [sx, sy] = P(220, 170, 400);
    out.push(arrow(sx - 70, sy - 190, sx - 70, sy - 40, C.green600, 9) + arrow(sx + 70, sy - 190, sx + 70, sy - 40, C.green600, 9));
    out.push(card(1080, 220, 420, 460));
    const cx = 1290;
    const cy = 480;
    const r = 130;
    const pt = (deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy - r * Math.sin((deg * Math.PI) / 180)];
    const [a0, a1, a2] = [pt(180), pt(60), pt(0)];
    out.push(`<path d="M ${a0[0]} ${a0[1]} A ${r} ${r} 0 0 1 ${a2[0]} ${a2[1]}" fill="none" stroke="${C.paper300}" stroke-width="28" stroke-linecap="round"/>`);
    out.push(`<path d="M ${a0[0]} ${a0[1]} A ${r} ${r} 0 0 1 ${a1[0]} ${a1[1]}" fill="none" stroke="${C.green600}" stroke-width="28" stroke-linecap="round"/>`);
    const [nx, ny] = [cx + (r - 40) * Math.cos((105 * Math.PI) / 180), cy - (r - 40) * Math.sin((105 * Math.PI) / 180)];
    out.push(`<line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}" stroke="${C.ink800}" stroke-width="8" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="14" fill="${C.ink800}"/>`);
    out.push(text(cx, 590, 'Stack strength', 34));
    return blog('A pallet of stacked cartons with load arrows on top, beside a strength gauge', out.join(''));
  },
});
