/** Remaining v1 site illustrations: process convert / quality and the About hero (4:3 canvas, 1200×900). Home, product and
 * industry art moved to the detailed kit v2 (scenes-v2*.mjs). */
import { C, box, svg, boardSection } from './lib.mjs';

export const siteScenes = {
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
