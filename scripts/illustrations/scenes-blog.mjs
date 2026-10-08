/** Blog thumbnails (16:9, 1600×900). Educational diagrams in the same palette as the product set. */
import { C, fitIso, makeIso, poly, line3, box, flutes, openBox, shadow, svg, boardSection } from './lib.mjs';

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
