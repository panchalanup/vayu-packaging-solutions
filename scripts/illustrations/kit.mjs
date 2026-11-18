/**
 * Vayu illustration kit v2: lit, detailed isometric vector art for the home page, product and industry images.
 *
 * World units are centimetres (a 40 x 30 x 30 cm carton is drawn at that size), z is up. One key light from the
 * front-left: top faces are brightest, the +y ("left") faces are lit, the +x ("right") faces are in shade, and cast
 * shadows fall towards the back right. Faces get soft gradients, kraft gets a fibre texture (SVG turbulence), and any
 * flat 2D artwork (labels, print, barcodes, handling marks) can be mapped exactly onto a face with `plane()`.
 *
 * SECURITY: build-time only. Output is static, script-free SVG (no external hrefs, no <foreignObject>) that is safe
 * to serve as an <img>. Text uses generic system fonts because an SVG loaded as an image cannot fetch web fonts.
 */

export const COS = Math.cos(Math.PI / 6);
export const r = (n) => Math.round(n * 10) / 10;
export const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
export const MONO = "'SFMono-Regular', Consolas, 'Liberation Mono', monospace";

// --- Palette ---------------------------------------------------------------------------------------------------------

export const K = {
  kraft: '#C79E6E',
  kraftDeep: '#B88A57',
  kraftInner: '#D2B48C',
  whiteTop: '#EEEAE2',
  paper50: '#FBF8F3',
  paper100: '#F4EFE6',
  paper200: '#E9E1D3',
  paper300: '#DCD1BD',
  ink: '#17231C',
  ink700: '#2A3A31',
  ink500: '#4A5A50',
  ink300: '#9AA79F',
  green: '#23803A',
  green5: '#2E9B47',
  green7: '#1B6A2F',
  red: '#C8372D',
  blue: '#1F5FA8',
  wood: '#D2AE7C',
  steel: '#AEB6BB',
  tape: '#C9955A',
  white: '#FFFFFF',
};

// --- Colour ----------------------------------------------------------------------------------------------------------

const hex2rgb = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgb2hex = (c) => `#${c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;
/** k > 0 lightens towards white, k < 0 darkens towards black */
export const shade = (hex, k) => rgb2hex(hex2rgb(hex).map((v) => (k >= 0 ? v + (255 - v) * k : v * (1 + k))));
export const mix = (a, b, t) => {
  const A = hex2rgb(a);
  const B = hex2rgb(b);
  return rgb2hex(A.map((v, i) => v + (B[i] - v) * t));
};

export function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// --- Projection ------------------------------------------------------------------------------------------------------

/** Isometric projector. World x → screen right-down, y → left-down, z → up. P.s = pixels per world unit. */
export function iso(ox, oy, s = 1) {
  const P = (x, y, z = 0) => [ox + (x - y) * COS * s, oy + (x + y) * 0.5 * s - z * s];
  P.s = s;
  return P;
}

/** Projector that fits the world box [x0,y0,z0,x1,y1,z1] into a screen box centred on (cx, cy) */
export function fit(bb, { cx = 600, cy = 455, maxW = 660, maxH = 620 } = {}) {
  const [x0, y0, z0, x1, y1, z1] = bb;
  const P0 = iso(0, 0, 1);
  const c = [];
  for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) c.push(P0(x, y, z));
  const xs = c.map((p) => p[0]);
  const ys = c.map((p) => p[1]);
  const s = Math.min(maxW / (Math.max(...xs) - Math.min(...xs)), maxH / (Math.max(...ys) - Math.min(...ys)));
  return iso(cx - ((Math.min(...xs) + Math.max(...xs)) / 2) * s, cy - ((Math.min(...ys) + Math.max(...ys)) / 2) * s, s);
}

export const pts = (arr) => arr.map(([x, y]) => `${r(x)},${r(y)}`).join(' ');
export const proj = (P, v3) => v3.map((v) => P(...v));

const add3 = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];

/**
 * SVG transform that maps flat 2D artwork onto a plane in the world: local (lx, ly) → origin + lx·u + ly·v.
 * Draw the artwork in world units with +y pointing "down" the plane (pass v pointing down, e.g. [0,0,-1]).
 */
export function plane(P, origin, u, v) {
  const o = P(...origin);
  const pu = P(...add3(origin, u));
  const pv = P(...add3(origin, v));
  return `matrix(${[pu[0] - o[0], pu[1] - o[1], pv[0] - o[0], pv[1] - o[1], o[0], o[1]].map((n) => Math.round(n * 1000) / 1000).join(' ')})`;
}

/** Plane matrices for the three visible faces of a block {x,y,z,w,d,h}; local units = world units, origin top-left */
export const faces = (P, b) => ({
  left: plane(P, [b.x, b.y + b.d, b.z + b.h], [1, 0, 0], [0, 0, -1]),
  right: plane(P, [b.x + b.w, b.y + b.d, b.z + b.h], [0, -1, 0], [0, 0, -1]),
  top: plane(P, [b.x, b.y, b.z + b.h], [1, 0, 0], [0, 1, 0]),
});

// --- Document --------------------------------------------------------------------------------------------------------

/** One SVG document: collects <defs> (gradients, patterns, filters) with unique ids */
export function doc(name) {
  const defs = [];
  const cache = new Map();
  let n = 0;
  const D = {
    name,
    id: (p = 'g') => `${p}${++n}`,
    def: (s) => defs.push(s),
    once(key, make) {
      if (!cache.has(key)) cache.set(key, make());
      return cache.get(key);
    },
    /** Linear gradient in screen space from a to b. stops: [offset, colour, opacity?][] */
    lin(a, b, stops) {
      const id = D.id('l');
      defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${r(a[0])}" y1="${r(a[1])}" x2="${r(b[0])}" y2="${r(b[1])}">${stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op !== undefined ? ` stop-opacity="${op}"` : ''}/>`).join('')}</linearGradient>`);
      return `url(#${id})`;
    },
    /** Linear gradient in the shape's own box (0..1) */
    linBox(x1, y1, x2, y2, stops) {
      const id = D.id('b');
      defs.push(`<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op !== undefined ? ` stop-opacity="${op}"` : ''}/>`).join('')}</linearGradient>`);
      return `url(#${id})`;
    },
    rad(cx, cy, rr, stops, { fx, fy, units = 'userSpaceOnUse', transform } = {}) {
      const id = D.id('r');
      defs.push(`<radialGradient id="${id}" gradientUnits="${units}" cx="${r(cx)}" cy="${r(cy)}" r="${r(rr)}"${fx !== undefined ? ` fx="${r(fx)}" fy="${r(fy)}"` : ''}${transform ? ` gradientTransform="${transform}"` : ''}>${stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op !== undefined ? ` stop-opacity="${op}"` : ''}/>`).join('')}</radialGradient>`);
      return `url(#${id})`;
    },
    blur(sd) {
      return D.once(`blur${sd}`, () => {
        const id = D.id('f');
        defs.push(`<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}"/></filter>`);
        return `url(#${id})`;
      });
    },
    /** Paper / kraft fibre: fine dark and light flecks inside the shape, slightly stretched along the grain */
    grain(strength = 1, freq = '1.6 0.6') {
      return D.once(`grain${strength}${freq}`, () => {
        const id = D.id('k');
        const a = (0.42 * strength).toFixed(2);
        defs.push(
          `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
            `<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="11" result="t"/>` +
            `<feColorMatrix in="t" type="matrix" values="0 0 0 0 0.22  0 0 0 0 0.14  0 0 0 0 0.06  ${a} 0 0 0 -${(a * 0.56).toFixed(3)}" result="d"/>` +
            `<feColorMatrix in="t" type="matrix" values="0 0 0 0 1  0 0 0 0 0.97  0 0 0 0 0.9  0 -${a} 0 0 ${(a * 0.44).toFixed(3)}" result="l"/>` +
            `<feMerge result="m"><feMergeNode in="d"/><feMergeNode in="l"/></feMerge>` +
            `<feComposite in="m" in2="SourceAlpha" operator="in" result="g"/>` +
            `<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="g"/></feMerge></filter>`
        );
        return `url(#${id})`;
      });
    },
    toString: () => defs.join(''),
  };
  return D;
}

/**
 * Wraps the art in a 1200 × 900 SVG with an accessible, indexable <title> and <desc> and a soft studio backdrop:
 * warm paper, a light pool under the subject and a gentle vignette.
 */
export function render(D, { title, desc, body, floorY = 640, w = 1200, h = 900, backdrop = true }) {
  const bg = backdrop
    ? `<rect width="${w}" height="${h}" fill="${D.lin([0, 0], [0, h], [[0, '#FBF8F3'], [0.55, '#F3ECE1'], [1, '#E6DCCB']])}"/>` +
      `<ellipse cx="${w / 2}" cy="${floorY}" rx="${w * 0.48}" ry="${h * 0.26}" fill="${D.rad(w / 2, floorY, w * 0.48, [[0, '#FFFFFF', 0.75], [1, '#FFFFFF', 0]], { transform: `translate(0 ${floorY}) scale(1 0.54) translate(0 ${-floorY})` })}"/>` +
      `<rect width="${w}" height="${h}" fill="${D.rad(w / 2, h * 0.46, w * 0.72, [[0.55, '#D9CCB6', 0], [1, '#CDBFA6', 0.55]])}"/>`
    : '';
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title>
<desc id="d">${esc(desc)}</desc>
<defs>${D}</defs>
${bg}
${body}
</svg>
`;
}

// --- Faces and solids ------------------------------------------------------------------------------------------------

const SIL = (base) => shade(base, -0.5);

/** A lit quad: gradient runs from the first edge (a→b) to the opposite edge, lighter → darker */
export function face(D, P, quad, base, { k0 = 0.06, k1 = -0.07, stroke = 'none', sw = 0.8, op = 1, filter, extra = '' } = {}) {
  const q = proj(P, quad);
  const m0 = [(q[0][0] + q[1][0]) / 2, (q[0][1] + q[1][1]) / 2];
  const m1 = [(q[2][0] + q[3][0]) / 2, (q[2][1] + q[3][1]) / 2];
  const fill = k0 === k1 ? shade(base, k0) : D.lin(m0, m1, [[0, shade(base, k0)], [1, shade(base, k1)]]);
  return `<polygon points="${pts(q)}" fill="${fill}"${stroke !== 'none' ? ` stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"` : ''}${op !== 1 ? ` opacity="${op}"` : ''}${filter ? ` filter="${filter}"` : ''}${extra}/>`;
}

export const seg = (P, a, b, { stroke = '#000', sw = 1, op = 1, dash, cap = 'round' } = {}) => {
  const [x1, y1] = P(...a);
  const [x2, y2] = P(...b);
  return `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="${cap}"${op !== 1 ? ` stroke-opacity="${op}"` : ''}${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
};

/**
 * A lit cuboid {x,y,z,w,d,h}. `top/left/right` override the face colours; `decor` = { left, right, top } artwork
 * drawn in each face's local plane (world units, origin at the face's top-left). `grain` adds the fibre texture.
 */
export function block(D, P, b, { color = K.kraft, top, left, right, decor = {}, grain = 0, edges = true, outline = true, hide = {} } = {}) {
  const T = top ?? shade(color, 0.16);
  const L = left ?? shade(color, 0.02);
  const R = right ?? shade(color, -0.16);
  const { x, y, z, w, d, h } = b;
  const F = faces(P, b);
  const parts = [];
  if (!hide.left) parts.push(face(D, P, [[x, y + d, z + h], [x + w, y + d, z + h], [x + w, y + d, z], [x, y + d, z]], L, { k0: 0.05, k1: -0.08 }));
  if (decor.left) parts.push(`<g transform="${F.left}">${decor.left}</g>`);
  if (!hide.right) parts.push(face(D, P, [[x + w, y + d, z + h], [x + w, y, z + h], [x + w, y, z], [x + w, y + d, z]], R, { k0: 0.03, k1: -0.1 }));
  if (decor.right) parts.push(`<g transform="${F.right}">${decor.right}</g>`);
  if (!hide.top) parts.push(face(D, P, [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], T, { k0: 0.07, k1: -0.03 }));
  if (decor.top) parts.push(`<g transform="${F.top}">${decor.top}</g>`);
  let out = parts.join('');
  if (grain) out = `<g filter="${D.grain(grain)}">${out}</g>`;
  if (edges) {
    // crisp light on the two lit front edges, a hairline of shade on the vertical corner
    out += seg(P, [x, y + d, z + h], [x + w, y + d, z + h], { stroke: '#fff', sw: 1.1, op: 0.55 });
    out += seg(P, [x + w, y + d, z + h], [x + w, y, z + h], { stroke: '#fff', sw: 1, op: 0.35 });
    out += seg(P, [x + w, y + d, z], [x + w, y + d, z + h], { stroke: '#fff', sw: 0.9, op: 0.22 });
  }
  if (outline) {
    const sil = proj(P, [[x, y, z + h], [x + w, y, z + h], [x + w, y, z], [x + w, y + d, z], [x, y + d, z], [x, y + d, z + h]]);
    out += `<polygon points="${pts(sil)}" fill="none" stroke="${SIL(color)}" stroke-width="0.9" stroke-opacity="0.55" stroke-linejoin="round"/>`;
  }
  return out;
}

// --- Shadows ---------------------------------------------------------------------------------------------------------

function hull(points) {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
    lower.push(q);
  }
  const upper = [];
  for (const q of p.reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
    upper.push(q);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

/** Light direction for cast shadows: shadow offset on the ground per unit of height (towards the back right) */
export const LIGHT = [0.42, -0.62];

/** Soft cast shadow of a box footprint of height h, plus a tight contact shadow along its base */
export function shadow(D, P, { x, y, w, d, h, z = 0 }, { op = 0.2, soft = 9, contact = 0.32 } = {}) {
  const foot = [[x, y], [x + w, y], [x + w, y + d], [x, y + d]];
  const far = foot.map(([a, b]) => [a + LIGHT[0] * h, b + LIGHT[1] * h]);
  const cast = hull([...foot, ...far].map(([a, b]) => P(a, b, z)));
  const base = proj(P, foot.map(([a, b]) => [a, b, z]));
  return (
    `<polygon points="${pts(cast)}" fill="#3B2E1F" opacity="${op}" filter="${D.blur(soft)}"/>` +
    `<polygon points="${pts(base)}" fill="#2A2016" opacity="${contact}" filter="${D.blur(2.2)}"/>`
  );
}

/** Soft round shadow (cylinders, fruit, rolls) */
export function blobShadow(D, P, [x, y, z = 0], rr, { op = 0.28, h = 0 } = {}) {
  const [cx, cy] = P(x + LIGHT[0] * h * 0.5, y + LIGHT[1] * h * 0.5, z);
  const [ax, ay] = P(x, y, z);
  return (
    `<ellipse cx="${r(cx)}" cy="${r(cy)}" rx="${r(rr * 1.35 * P.s + h * 0.25 * P.s)}" ry="${r(rr * 0.75 * P.s + h * 0.12 * P.s)}" fill="#3B2E1F" opacity="${op * 0.7}" filter="${D.blur(8)}"/>` +
    `<ellipse cx="${r(ax)}" cy="${r(ay)}" rx="${r(rr * 1.18 * P.s)}" ry="${r(rr * 0.66 * P.s)}" fill="#2A2016" opacity="${op}" filter="${D.blur(2.5)}"/>`
  );
}

// --- Corrugated board details ----------------------------------------------------------------------------------------

/**
 * Flute cross-section pattern for a cut board edge, in world units: `walls` = 1 (3-ply), 2 (5-ply), 3 (7-ply),
 * `t` = board thickness. Use as fill on a rect drawn in an edge plane (local x along the edge, y across it).
 */
export function flutePattern(D, { walls = 1, t = 0.4, color = K.kraft } = {}) {
  return D.once(`flute${walls}-${t}-${color}`, () => {
    const id = D.id('p');
    const liner = t * (walls === 1 ? 0.16 : walls === 2 ? 0.1 : 0.075);
    const fl = (t - liner * (walls + 1)) / walls;
    const pitch = fl * 2.1;
    const dark = shade(color, -0.42);
    const mid = shade(color, -0.12);
    let s = `<rect width="${pitch}" height="${t}" fill="${dark}"/>`;
    let yy = 0;
    for (let i = 0; i < walls; i++) {
      s += `<rect y="${r3(yy)}" width="${pitch}" height="${r3(liner)}" fill="${shade(color, 0.12)}"/>`;
      yy += liner;
      const a = yy;
      const b = yy + fl;
      s += `<path d="M0 ${r3(a)} C ${r3(pitch * 0.25)} ${r3(a)} ${r3(pitch * 0.25)} ${r3(b)} ${r3(pitch * 0.5)} ${r3(b)} S ${r3(pitch * 0.75)} ${r3(a)} ${r3(pitch)} ${r3(a)}" fill="none" stroke="${mid}" stroke-width="${r3(fl * 0.22)}"/>`;
      yy = b;
    }
    s += `<rect y="${r3(yy)}" width="${pitch}" height="${r3(liner)}" fill="${shade(color, 0.12)}"/>`;
    D.def(`<pattern id="${id}" patternUnits="userSpaceOnUse" width="${r3(pitch)}" height="${r3(t)}">${s}</pattern>`);
    return `url(#${id})`;
  });
}
const r3 = (n) => Math.round(n * 1000) / 1000;

/** Very faint vertical stripes where the flutes press through the liner (local face artwork) */
export function fluteShow(w, h, { pitch = 0.75, op = 0.05, color = '#5A3C1E' } = {}) {
  let s = '';
  for (let x = pitch; x < w; x += pitch) s += `M${r3(x)} 0V${r3(h)}`;
  return `<path d="${s}" stroke="${color}" stroke-width="${r3(pitch * 0.32)}" stroke-opacity="${op}" fill="none"/>`;
}

// --- Cartons ---------------------------------------------------------------------------------------------------------

/**
 * Closed RSC carton: lit faces with fibre, flute show-through, the major-flap seam on top (along x or y), the glued
 * manufacturer's joint at the front-left corner, optional tape and face artwork.
 */
export function carton(D, P, b, o = {}) {
  const { color = K.kraft, tape = true, tapeColor = K.tape, seamAlong = 'x', decor = {}, joint = true, grain = 1, tapeWidth } = o;
  const { x, y, z, w, d, h } = b;
  const show = {
    left: fluteShow(w, h) + (joint ? `<rect x="0" y="0" width="${r3(Math.min(3.5, w * 0.08))}" height="${h}" fill="#000" opacity="0.045"/>` : '') + (decor.left ?? ''),
    right: fluteShow(d, h) + (decor.right ?? ''),
    top: decor.top ?? '',
  };
  let out = block(D, P, b, { color, decor: show, grain, top: o.top, left: o.left, right: o.right });
  // the gap where the two major flaps meet, with a whisper of light on its far lip
  const cz = z + h;
  if (seamAlong === 'x') {
    out += seg(P, [x + 0.4, y + d / 2, cz], [x + w - 0.4, y + d / 2, cz], { stroke: shade(color, -0.5), sw: 1.1, op: 0.6 });
    out += seg(P, [x + 0.4, y + d / 2 + 0.25, cz], [x + w - 0.4, y + d / 2 + 0.25, cz], { stroke: '#fff', sw: 0.8, op: 0.3 });
  } else {
    out += seg(P, [x + w / 2, y + 0.4, cz], [x + w / 2, y + d - 0.4, cz], { stroke: shade(color, -0.5), sw: 1.1, op: 0.6 });
  }
  if (tape) out += tapeSeam(D, P, b, { color: tapeColor, along: seamAlong, width: tapeWidth });
  return out;
}

/** Packing tape over the top seam, running down both end walls; glossy and slightly translucent */
export function tapeSeam(D, P, b, { color = K.tape, along = 'x', width, drop, print } = {}) {
  const { x, y, z, w, d, h } = b;
  const tw = width ?? Math.min(4.8, Math.min(w, d) * 0.16);
  const dr = drop ?? Math.min(7, h * 0.28);
  const cz = z + h;
  const parts = [];
  if (along === 'x') {
    const y0 = y + d / 2 - tw / 2;
    const y1 = y + d / 2 + tw / 2;
    const top = proj(P, [[x, y0, cz], [x + w, y0, cz], [x + w, y1, cz], [x, y1, cz]]);
    parts.push(`<polygon points="${pts(top)}" fill="${D.lin(top[0], top[2], [[0, shade(color, 0.28), 0.9], [0.5, color, 0.85], [1, shade(color, 0.12), 0.88]])}"/>`);
    // the end that runs down the right (+x) wall
    const end = proj(P, [[x + w, y0, cz], [x + w, y1, cz], [x + w, y1, cz - dr], [x + w, y0, cz - dr]]);
    parts.push(`<polygon points="${pts(end)}" fill="${shade(color, -0.12)}" opacity="0.88"/>`);
    // sheen stripe and edges
    parts.push(seg(P, [x + w * 0.08, y + d / 2 - tw * 0.15, cz], [x + w * 0.92, y + d / 2 - tw * 0.15, cz], { stroke: '#fff', sw: 2.2, op: 0.28 }));
    parts.push(seg(P, [x, y1, cz], [x + w, y1, cz], { stroke: shade(color, -0.35), sw: 0.7, op: 0.5 }));
    parts.push(seg(P, [x + w, y0, cz - dr], [x + w, y1, cz - dr], { stroke: shade(color, -0.35), sw: 0.8, op: 0.6 }));
    if (print) parts.push(`<g transform="${plane(P, [x, y0, cz], [1, 0, 0], [0, 1, 0])}">${print(w, tw)}</g>`);
  } else {
    const x0 = x + w / 2 - tw / 2;
    const x1 = x + w / 2 + tw / 2;
    const top = proj(P, [[x0, y, cz], [x1, y, cz], [x1, y + d, cz], [x0, y + d, cz]]);
    parts.push(`<polygon points="${pts(top)}" fill="${D.lin(top[0], top[1], [[0, shade(color, 0.28), 0.9], [0.5, color, 0.85], [1, shade(color, 0.12), 0.88]])}"/>`);
    const end = proj(P, [[x0, y + d, cz], [x1, y + d, cz], [x1, y + d, cz - dr], [x0, y + d, cz - dr]]);
    parts.push(`<polygon points="${pts(end)}" fill="${shade(color, -0.02)}" opacity="0.88"/>`);
    parts.push(seg(P, [x + w / 2 - tw * 0.15, y + d * 0.08, cz], [x + w / 2 - tw * 0.15, y + d * 0.92, cz], { stroke: '#fff', sw: 2.2, op: 0.28 }));
    parts.push(seg(P, [x0, y + d, cz - dr], [x1, y + d, cz - dr], { stroke: shade(color, -0.35), sw: 0.8, op: 0.6 }));
    if (print) parts.push(`<g transform="${plane(P, [x0, y + d, cz], [0, -1, 0], [1, 0, 0])}">${print(d, tw)}</g>`);
  }
  return parts.join('');
}

/**
 * Open-top RSC carton seen from the front-right: interior with occlusion, rim thickness, four flaps splayed outward
 * whose cut edges show the flute section. `contents` is drawn inside, before the front walls.
 * flaps: true (all four), 'back' (only the two far flaps, so the front walls stay visible) or false (a tray).
 */
export function openCarton(D, P, b, o = {}) {
  const { color = K.kraft, inner = K.kraftInner, walls = 1, t = 0.45, back = 24, side = 30, front = 122, right = 116, decor = {}, contents = '', grain = 1, flaps = true } = o;
  const { x, y, z, w, d, h } = b;
  const zt = z + h;
  const out = [];
  const fp = flutePattern(D, { walls, t, color });
  // every RSC flap is half the box's width deep
  const fl = Math.min(w, d) / 2;

  // A flap hinged on edge A→B, swinging out along n (unit, horizontal) by `ang` degrees from upright (90 = flat, >90 = hanging down)
  const flap = (A, B, n, len, ang, outerSide) => {
    const a = (ang * Math.PI) / 180;
    const dir = [n[0] * Math.sin(a), n[1] * Math.sin(a), Math.cos(a)];
    const C2 = add3(B, dir, len);
    const D2 = add3(A, dir, len);
    const q = [A, B, C2, D2];
    // lit by the key light (front-left, high): flaps that face up catch the most light
    const up = Math.sin(a) * (ang > 90 ? 1 : 0.5);
    const lit = (n[1] > 0 || n[0] < 0 ? 0.04 : -0.08) + up * 0.1;
    const col = outerSide ? shade(color, lit) : shade(inner, lit);
    const sh = face(D, P, q, col, { k0: -0.08, k1: 0.06 });
    // cut edge (board thickness) along the free edge, inward of the flap
    const inward = [-n[0] * Math.cos(a), -n[1] * Math.cos(a), Math.sin(a)];
    const e = [D2, C2, add3(C2, inward, t), add3(D2, inward, t)];
    const ux = [(B[0] - A[0]) / len2(A, B), (B[1] - A[1]) / len2(A, B), 0];
    const edge = `<g transform="${plane(P, D2, ux, inward)}"><rect width="${r3(len2(A, B))}" height="${t}" fill="${fp}"/></g>`;
    const eo = `<polygon points="${pts(proj(P, e))}" fill="none" stroke="${shade(color, -0.5)}" stroke-width="0.5" stroke-opacity="0.5"/>`;
    return sh + edge + eo + `<polygon points="${pts(proj(P, q))}" fill="none" stroke="${SIL(color)}" stroke-width="0.8" stroke-opacity="0.45" stroke-linejoin="round"/>`;
  };

  // back flaps (we see their inner side)
  if (flaps) out.push(flap([x, y, zt], [x + w, y, zt], [0, -1], fl, back, false));
  if (flaps) out.push(flap([x, y + d, zt], [x, y, zt], [-1, 0], fl, side, false));
  // interior walls and floor
  out.push(face(D, P, [[x, y, zt], [x + w, y, zt], [x + w, y, z], [x, y, z]], shade(inner, -0.06), { k0: 0.04, k1: -0.26 }));
  out.push(face(D, P, [[x, y, zt], [x, y + d, zt], [x, y + d, z], [x, y, z]], shade(inner, -0.16), { k0: 0, k1: -0.3 }));
  const floor = proj(P, [[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]]);
  out.push(`<polygon points="${pts(floor)}" fill="${D.lin(floor[0], floor[2], [[0, shade(inner, -0.34)], [1, shade(inner, -0.12)]])}"/>`);
  out.push(fluteLines(P, b, inner));
  out.push(contents);
  // front walls (outside)
  const shell = block(D, P, b, { color, hide: { top: true }, decor: { left: fluteShow(w, h) + (decor.left ?? ''), right: fluteShow(d, h) + (decor.right ?? '') }, grain, edges: false, outline: false });
  out.push(shell);
  // rim: the board thickness along the top of the two front walls
  const rim = (A, B, n) => {
    const q = [A, B, add3(B, n, -t), add3(A, n, -t)];
    return `<polygon points="${pts(proj(P, q))}" fill="${shade(color, 0.22)}" stroke="${shade(color, -0.3)}" stroke-width="0.4" stroke-opacity="0.4"/>`;
  };
  out.push(rim([x, y + d, zt], [x + w, y + d, zt], [0, 1, 0]));
  out.push(rim([x + w, y + d, zt], [x + w, y, zt], [1, 0, 0]));
  out.push(seg(P, [x + w, y + d, z], [x + w, y + d, zt], { stroke: '#fff', sw: 0.9, op: 0.22 }));
  const sil = proj(P, [[x + w, y, zt], [x + w, y, z], [x + w, y + d, z], [x, y + d, z], [x, y + d, zt]]);
  out.push(`<polyline points="${pts(sil)}" fill="none" stroke="${SIL(color)}" stroke-width="0.9" stroke-opacity="0.5" stroke-linejoin="round"/>`);
  // front flaps hang outward and down; their inner liner now faces up, towards us
  if (flaps === true) out.push(flap([x + w, y + d, zt], [x + w, y, zt], [1, 0], fl, right, false));
  if (flaps === true) out.push(flap([x, y + d, zt], [x + w, y + d, zt], [0, 1], fl, front, false));
  return out.join('');
}
const len2 = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);

function fluteLines(P, b, inner) {
  // faint vertical flutes on the lit inner back wall
  const { x, y, z, w, h } = b;
  let s = '';
  for (let u = 1.2; u < w; u += 1.2) {
    const [x1, y1] = P(x + u, y, z + h);
    const [x2, y2] = P(x + u, y, z);
    s += `M${r(x1)} ${r(y1)}L${r(x2)} ${r(y2)}`;
  }
  return `<path d="${s}" stroke="${shade(inner, -0.4)}" stroke-width="0.6" stroke-opacity="0.08"/>`;
}

// --- Cylinders and lathe shapes --------------------------------------------------------------------------------------

/** Iso ellipse of a horizontal circle (axis z): returns [rx, ry] in px */
export const isoCircle = (P, R) => [R * COS * Math.SQRT2 * P.s, R * Math.SQRT1_2 * P.s];

/**
 * Upright cylinder (axis z) at (x, y), radius R, from z0 to z1: side with a horizontal light gradient, top cap.
 * `top` false leaves the cap off (draw your own), `ring` adds a darker band (cores, labels).
 */
export function cylinderZ(D, P, [x, y, z0], R, H, { color = K.kraft, cap, side, capFill, topOn = true, outline = true } = {}) {
  const [rx, ry] = isoCircle(P, R);
  const [cx, cyB] = P(x, y, z0);
  const cyT = cyB - H * P.s;
  const sideFill = side ?? D.lin([cx - rx, 0], [cx + rx, 0], [[0, shade(color, -0.05)], [0.28, shade(color, 0.16)], [0.55, shade(color, 0.02)], [1, shade(color, -0.3)]]);
  let s = `<path d="M${r(cx - rx)} ${r(cyT)}V${r(cyB)}A${r(rx)} ${r(ry)} 0 0 0 ${r(cx + rx)} ${r(cyB)}V${r(cyT)}Z" fill="${sideFill}"/>`;
  if (topOn) s += `<ellipse cx="${r(cx)}" cy="${r(cyT)}" rx="${r(rx)}" ry="${r(ry)}" fill="${capFill ?? cap ?? D.lin([cx - rx, cyT - ry], [cx + rx, cyT + ry], [[0, shade(color, 0.28)], [1, shade(color, 0.04)]])}"/>`;
  if (outline) s += `<path d="M${r(cx - rx)} ${r(cyT)}V${r(cyB)}A${r(rx)} ${r(ry)} 0 0 0 ${r(cx + rx)} ${r(cyB)}V${r(cyT)}A${r(rx)} ${r(ry)} 0 0 0 ${r(cx - rx)} ${r(cyT)}" fill="none" stroke="${SIL(color)}" stroke-width="0.8" stroke-opacity="0.45"/>`;
  return s;
}

/** Screen-space helpers for an upright lathe shape: a 2D profile path (bottles, vials, jars) */
export function lathe(D, P, [x, y, z0], profile, { color, glass = false, op = 1 } = {}) {
  // profile: [[radius, height], ...] from bottom to top (world units)
  const [cx, cy] = P(x, y, z0);
  const k = COS * Math.SQRT2 * P.s;
  const right = profile.map(([rr, hh]) => [cx + rr * k, cy - hh * P.s]);
  const left = profile.map(([rr, hh]) => [cx - rr * k, cy - hh * P.s]).reverse();
  const rb = profile[0][0];
  const ryb = rb * Math.SQRT1_2 * P.s;
  const d = `M${pts([right[0]]).replace(',', ' ')}L${right.slice(1).map((p) => pts([p]).replace(',', ' ')).join('L')}L${left.slice(0, -1).map((p) => pts([p]).replace(',', ' ')).join('L')}L${r(cx - rb * k)} ${r(cy)}A${r(rb * k)} ${r(ryb)} 0 0 0 ${r(cx + rb * k)} ${r(cy)}Z`;
  const maxR = Math.max(...profile.map((p) => p[0])) * k;
  const fill = glass
    ? D.lin([cx - maxR, 0], [cx + maxR, 0], [[0, shade(color, -0.35), 0.95], [0.18, shade(color, 0.1), 0.85], [0.32, shade(color, 0.55), 0.9], [0.42, color, 0.8], [0.8, shade(color, -0.2), 0.88], [1, shade(color, -0.5), 0.95]])
    : D.lin([cx - maxR, 0], [cx + maxR, 0], [[0, shade(color, -0.08)], [0.3, shade(color, 0.18)], [0.6, shade(color, 0)], [1, shade(color, -0.32)]]);
  return `<path d="${d}" fill="${fill}"${op !== 1 ? ` opacity="${op}"` : ''} stroke="${shade(color, -0.55)}" stroke-width="0.7" stroke-opacity="0.5"/>`;
}

/** Fake-solid extrusion of flat artwork lying on a horizontal plane: n copies stepped down by 1 px each */
export function extrudeFlat(art, depthPx, sideColor) {
  let s = '';
  for (let i = Math.round(depthPx); i > 0; i--) s += `<g transform="translate(0 ${i})" fill="${sideColor}" stroke="none">${art}</g>`;
  return s;
}

// --- Pallet ----------------------------------------------------------------------------------------------------------

/** Wooden four-way pallet {x,y,w,d} (e.g. 120 × 100 cm), 14.4 cm high: blocks, stringer boards and deck with gaps */
export function pallet(D, P, { x, y, z = 0, w = 120, d = 100 }, { color = K.wood } = {}) {
  const out = [];
  const g = D.grain(0.9, '0.06 0.9');
  const blockH = 7.8;
  const bh = 2.2;
  const bw = 14;
  const parts = [];
  // bottom boards (along x) at three rows
  for (const yy of [y, y + d / 2 - 5, y + d - 10]) parts.push([{ x, y: yy, z, w, d: 10, h: bh }, -0.08]);
  // blocks: 3 × 3
  for (const yy of [y, y + d / 2 - 5, y + d - 10]) for (const xx of [x, x + w / 2 - bw / 2, x + w - bw]) parts.push([{ x: xx, y: yy, z: z + bh, w: bw, d: 10, h: blockH }, -0.12]);
  // stringer boards across the blocks
  for (const xx of [x, x + w / 2 - bw / 2, x + w - bw]) parts.push([{ x: xx, y, z: z + bh + blockH, w: bw, d, h: bh }, 0]);
  // deck boards (along y) with gaps
  const n = 7;
  const gap = (w - n * 10.5) / (n - 1);
  for (let i = 0; i < n; i++) parts.push([{ x: x + i * (10.5 + gap), y, z: z + bh * 2 + blockH, w: 10.5, d, h: bh }, i % 2 ? 0.04 : -0.02]);
  // painter's order: back to front (smaller x+y first), then bottom to top
  parts.sort((a, b) => a[0].z - b[0].z || a[0].x + a[0].y - (b[0].x + b[0].y));
  for (const [b, k] of parts) out.push(block(D, P, b, { color: shade(color, k), edges: true, outline: true }));
  let s = `<g filter="${g}">${out.join('')}</g>`;
  // nail heads on the deck
  const nails = [];
  const zt = z + bh * 2 + blockH;
  for (let i = 0; i < n; i++) for (const yy of [y + 5, y + d / 2, y + d - 5]) for (const dx of [3, 7.5]) {
    const [nx, ny] = P(x + i * (10.5 + gap) + dx, yy, zt);
    nails.push(`<circle cx="${r(nx)}" cy="${r(ny)}" r="${r(Math.max(0.8, 0.28 * P.s))}"/>`);
  }
  s += `<g fill="#5B4A36" opacity="0.55">${nails.join('')}</g>`;
  return s;
}
export const PALLET_H = 2.2 * 3 + 7.8;

// --- 2D artwork for labels, print and marks (local units) ------------------------------------------------------------

/** EAN-style barcode filling w × h with digits under it */
export function barcode(x, y, w, h, seed = 1, { digits = true, color = '#1A1A1A' } = {}) {
  const R = rng(seed);
  const bars = [];
  let pos = 0;
  const units = [];
  while (pos < 95) {
    const bw = 1 + Math.floor(R() * 3);
    units.push([pos, bw, units.length % 2 === 0]);
    pos += bw;
  }
  const u = w / pos;
  const textH = digits ? h * 0.2 : 0;
  for (const [p, bw, dark] of units) if (dark) bars.push(`<rect x="${r3(x + p * u)}" y="${r3(y)}" width="${r3(bw * u * 0.92)}" height="${r3(h - textH)}"/>`);
  let s = `<g fill="${color}">${bars.join('')}</g>`;
  if (digits) {
    let num = '';
    for (let i = 0; i < 13; i++) num += Math.floor(R() * 10);
    s += `<text x="${r3(x + w / 2)}" y="${r3(y + h)}" font-family="${MONO}" font-size="${r3(textH * 0.95)}" text-anchor="middle" fill="${color}" letter-spacing="${r3(textH * 0.18)}">${num.slice(0, 1)} ${num.slice(1, 7)} ${num.slice(7)}</text>`;
  }
  return s;
}

/** 2D matrix code (QR / GS1 DataMatrix look) */
export function matrixCode(x, y, size, seed = 3, { cells = 21, color = '#1A1A1A', finder = true } = {}) {
  const R = rng(seed);
  const c = size / cells;
  let s = '';
  for (let j = 0; j < cells; j++) {
    for (let i = 0; i < cells; i++) {
      const inF = finder && ((i < 8 && j < 8) || (i >= cells - 8 && j < 8) || (i < 8 && j >= cells - 8));
      if (!inF && R() < 0.48) s += `<rect x="${r3(x + i * c)}" y="${r3(y + j * c)}" width="${r3(c)}" height="${r3(c)}"/>`;
    }
  }
  if (finder) {
    for (const [fx, fy] of [[0, 0], [cells - 7, 0], [0, cells - 7]]) {
      s += `<rect x="${r3(x + (fx + 0.5) * c)}" y="${r3(y + (fy + 0.5) * c)}" width="${r3(6 * c)}" height="${r3(6 * c)}" fill="none" stroke="${color}" stroke-width="${r3(c)}"/>`;
      s += `<rect x="${r3(x + (fx + 2) * c)}" y="${r3(y + (fy + 2) * c)}" width="${r3(3 * c)}" height="${r3(3 * c)}"/>`;
    }
  }
  return `<g fill="${color}">${s}</g>`;
}

/** Grey text lines (address blocks, small print) */
export function lines(x, y, w, n, lh, { color = '#7A7A7A', sw, widths } = {}) {
  let s = '';
  const R = rng(n * 7 + Math.round(w));
  for (let i = 0; i < n; i++) {
    const lw = widths ? widths[i % widths.length] * w : w * (0.55 + R() * 0.45);
    s += `<rect x="${r3(x)}" y="${r3(y + i * lh)}" width="${r3(lw)}" height="${r3(sw ?? lh * 0.42)}" rx="${r3((sw ?? lh * 0.42) / 2)}"/>`;
  }
  return `<g fill="${color}">${s}</g>`;
}

export const text = (x, y, size, str, { color = '#1A1A1A', weight = 700, anchor = 'start', font = FONT, spacing = 0, op = 1 } = {}) =>
  `<text x="${r3(x)}" y="${r3(y)}" font-family="${font}" font-size="${r3(size)}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}"${spacing ? ` letter-spacing="${r3(spacing)}"` : ''}${op !== 1 ? ` opacity="${op}"` : ''}>${str}</text>`;

/** Courier / shipping label (w × h, local units) with routing code, address lines, barcode and QR */
export function shippingLabel(w, h, seed = 5, { accent = K.ink } = {}) {
  const p = w * 0.06;
  let s = `<rect width="${w}" height="${h}" rx="${r3(w * 0.02)}" fill="#FBFAF6"/>`;
  s += `<rect width="${w}" height="${r3(h * 0.16)}" fill="${accent}"/>`;
  s += text(p, h * 0.112, h * 0.07, 'EXPRESS', { color: '#fff', spacing: h * 0.004 });
  s += text(w - p, h * 0.112, h * 0.06, 'AMD', { color: '#fff', anchor: 'end', font: MONO, weight: 600 });
  s += text(p, h * 0.25, h * 0.045, 'SHIP TO', { color: '#555', weight: 700, spacing: h * 0.004 });
  s += lines(p, h * 0.285, w * 0.56, 3, h * 0.055, { color: '#3D3D3D' });
  s += matrixCode(w - p - w * 0.26, h * 0.21, w * 0.26, seed + 2);
  s += `<rect x="${r3(p)}" y="${r3(h * 0.5)}" width="${r3(w - p * 2)}" height="${r3(h * 0.004 + 0.05)}" fill="#BBB"/>`;
  s += barcode(p, h * 0.54, w - p * 2, h * 0.3, seed);
  s += text(p, h * 0.94, h * 0.045, 'WT 2.4 KG', { color: '#333', font: MONO, weight: 600 });
  s += text(w - p, h * 0.94, h * 0.045, '1 / 1', { color: '#333', font: MONO, weight: 600, anchor: 'end' });
  return s;
}

// ISO 780 handling marks, drawn in a 10 × 10 box (scale them with a transform)
export const MARK = {
  /** This way up (ISO 7000-0623): two arrows above a bar */
  up: (c = '#1A1A1A') =>
    `<g fill="${c}"><rect x="1" y="8.6" width="8" height="0.9"/><path d="M2.2 2.4 3.6 0.4 5 2.4H4.1V8H3.1V2.4Z"/><path d="M5 2.4 6.4 0.4 7.8 2.4H6.9V8H5.9V2.4Z"/></g>`,
  /** Fragile (ISO 7000-0621): a wine glass with a crack */
  fragile: (c = '#1A1A1A') =>
    `<g fill="${c}"><path d="M2.6 0.6H7.4C7.6 3.6 6.6 5.3 5.45 5.7V8.6H7V9.5H3V8.6H4.55V5.7C3.4 5.3 2.4 3.6 2.6 0.6Z"/><path d="M4.4 0.6 5.4 2 4.6 2.7 5.6 4.1" fill="none" stroke="#fff" stroke-width="0.45" stroke-linejoin="bevel"/></g>`,
  /** Keep dry (ISO 7000-0626): umbrella with rain */
  dry: (c = '#1A1A1A') =>
    `<g fill="${c}"><path d="M0.8 5.2C1.2 2.6 3 1.3 5 1.3S8.8 2.6 9.2 5.2C8.5 4.7 7.7 4.7 7 5.2 6.3 4.7 5.6 4.7 5 5.2 4.4 4.7 3.7 4.7 3 5.2 2.3 4.7 1.5 4.7 0.8 5.2Z"/><path d="M5 5V8.6C5 9.5 3.6 9.5 3.6 8.6" fill="none" stroke="${c}" stroke-width="0.6" stroke-linecap="round"/><path d="M1.6 0.2 1.3 1.1M3.1 0 2.8 0.9M7.2 0 6.9 0.9M8.7 0.2 8.4 1.1" stroke="${c}" stroke-width="0.4" stroke-linecap="round"/></g>`,
  /** Stacking limit by number */
  stack: (n = 3, c = '#1A1A1A') =>
    `<g fill="none" stroke="${c}" stroke-width="0.55"><rect x="1.5" y="5" width="7" height="4.4"/><path d="M3 5V1.2H7V5"/><path d="M0.6 0.6H9.4"/></g><text x="5" y="8.6" font-family="${FONT}" font-size="3.4" font-weight="700" fill="${c}" text-anchor="middle">${n}</text>`,
  /** Food-safe (glass and fork) */
  food: (c = '#1A1A1A') =>
    `<g fill="none" stroke="${c}" stroke-width="0.6" stroke-linecap="round"><path d="M2 1H5L4.6 4.6C4.4 5.6 2.6 5.6 2.4 4.6Z"/><path d="M3.5 5.4V8.6M2.3 8.8H4.7"/><path d="M6.6 1V3.6M7.4 1V3.6M8.2 1V3.6M6.6 3.6C6.6 4.6 8.2 4.6 8.2 3.6M7.4 4.4V8.8"/></g>`,
  /** Electrostatic-sensitive device (yellow triangle, crossed hand) */
  esd: () =>
    `<path d="M5 0.4 9.6 9H0.4Z" fill="#F2C230" stroke="#1A1A1A" stroke-width="0.5" stroke-linejoin="round"/><path d="M3.6 7.6V4.6C3.6 4.2 4.3 4.2 4.3 4.6V3.6C4.3 3.2 5 3.2 5 3.6V4.4C5 4 5.7 4 5.7 4.4V5C5.7 4.6 6.4 4.6 6.4 5V6.8C6.4 7.6 5.8 8 5.2 8H4.4C4 8 3.6 7.9 3.6 7.6Z" fill="#1A1A1A"/><path d="M2.6 8.2 7.6 3.4" stroke="#1A1A1A" stroke-width="0.55"/>`,
  /** Recyclable corrugated loop */
  recycle: (c = '#1A1A1A') =>
    `<g fill="none" stroke="${c}" stroke-width="0.7" stroke-linejoin="round"><path d="M3.4 2.2 5 0.6 6.6 2.2M5 0.8V3.4"/><path d="M8.9 6 9.4 8.2 7.2 8.7M9.2 8.1 7 6.8"/><path d="M1.1 8.6 0.6 6.4 2.8 5.9M0.9 6.6 3 7.9"/><path d="M3.2 3.2 1.8 5.4M8.1 5.4 6.8 3.2M7 8.6H3.2"/></g>`,
};

/** A row of marks, each `size` local units, in a thin rounded frame */
export function markRow(keys, size, { color = '#1A1A1A', gap = 0.35, frame = true } = {}) {
  let s = '';
  keys.forEach((k, i) => {
    const x0 = i * size * (1 + gap);
    const mark = typeof k === 'function' ? k() : MARK[k](color);
    s += `<g transform="translate(${r3(x0)} 0) scale(${r3(size / 10)})">${frame ? `<rect x="-0.4" y="-0.4" width="10.8" height="10.8" rx="1" fill="none" stroke="${color}" stroke-width="0.4"/>` : ''}${mark}</g>`;
  });
  return s;
}

/** Round box-maker's stamp (usually printed on a bottom or side panel) */
export function bmcStamp(cx, cy, R, lines3 = ['3 PLY', 'B FLUTE'], { color = '#2B2B2B', ring = 'CORRUGATED FIBREBOARD · RECYCLABLE · ' } = {}) {
  const id = `arc${Math.round(cx * 7 + cy * 13 + R * 31)}`;
  const rr = R * 0.8;
  let s = `<g fill="none" stroke="${color}" stroke-width="${r3(R * 0.035)}" opacity="0.82"><circle cx="${r3(cx)}" cy="${r3(cy)}" r="${r3(R)}"/><circle cx="${r3(cx)}" cy="${r3(cy)}" r="${r3(R * 0.62)}"/></g>`;
  s += `<path id="${id}" d="M${r3(cx - rr)} ${r3(cy)}A${r3(rr)} ${r3(rr)} 0 1 1 ${r3(cx + rr)} ${r3(cy)}A${r3(rr)} ${r3(rr)} 0 1 1 ${r3(cx - rr)} ${r3(cy)}" fill="none"/>`;
  s += `<text font-family="${FONT}" font-size="${r3(R * 0.17)}" font-weight="700" fill="${color}" opacity="0.82" letter-spacing="${r3(R * 0.02)}"><textPath href="#${id}">${ring}</textPath></text>`;
  lines3.forEach((l, i) => {
    s += text(cx, cy - R * 0.08 + (i - (lines3.length - 1) / 2) * R * 0.26 + R * 0.1, R * 0.2, l, { color, anchor: 'middle', op: 0.85 });
  });
  return s;
}

// --- Magnifier callout -----------------------------------------------------------------------------------------------

/**
 * A round magnifier that shows the board's cross-section at large scale (liners and fluted mediums), with a leader
 * line to the point it magnifies. Screen-space; `walls` = 1, 2 or 3 (3-, 5-, 7-ply).
 */
export function loupe(D, { cx, cy, R = 92, walls = 1, from, color = K.kraft, label }) {
  const clip = D.id('c');
  const t = walls === 1 ? R * 0.62 : walls === 2 ? R * 0.92 : R * 1.22;
  const liner = walls === 1 ? t * 0.13 : walls === 2 ? t * 0.085 : t * 0.065;
  const fl = (t - liner * (walls + 1)) / walls;
  const pitch = fl * 1.9;
  const x0 = cx - R * 1.6;
  const x1 = cx + R * 1.6;
  const y0 = cy - t / 2 + R * 0.08;
  const bg = `<rect x="${r(x0)}" y="${r(cy - R)}" width="${r(x1 - x0)}" height="${r(R * 2)}" fill="${D.lin([0, cy - R], [0, cy + R], [[0, '#F7F2EA'], [1, '#E2D6C2']])}"/>`;
  let sec = '';
  // top surface of the board, seen at a slight angle, so the section reads as a solid sheet
  sec += `<polygon points="${pts([[x0, y0 - R * 0.2], [x1, y0 - R * 0.2], [x1, y0], [x0, y0]])}" fill="${D.lin([0, y0 - R * 0.2], [0, y0], [[0, shade(color, 0.22)], [1, shade(color, 0.06)]])}"/>`;
  sec += `<rect x="${r(x0)}" y="${r(y0)}" width="${r(x1 - x0)}" height="${r(t)}" fill="${shade(color, -0.55)}"/>`;
  let yy = y0;
  const linerRect = (yv) => `<rect x="${r(x0)}" y="${r(yv)}" width="${r(x1 - x0)}" height="${r(liner)}" fill="${D.lin([0, yv], [0, yv + liner], [[0, shade(color, 0.18)], [1, shade(color, -0.06)]])}"/>`;
  for (let i = 0; i < walls; i++) {
    sec += linerRect(yy);
    yy += liner;
    const a = yy - liner * 0.15;
    const b = yy + fl + liner * 0.15;
    let d = `M${r(x0)} ${r(a)}`;
    for (let x = x0; x < x1; x += pitch) d += ` C ${r(x + pitch * 0.25)} ${r(a)} ${r(x + pitch * 0.25)} ${r(b)} ${r(x + pitch * 0.5)} ${r(b)} S ${r(x + pitch * 0.75)} ${r(a)} ${r(x + pitch)} ${r(a)}`;
    sec += `<path d="${d}" fill="none" stroke="${shade(color, -0.04)}" stroke-width="${r(Math.max(2.5, fl * 0.16))}"/>`;
    sec += `<path d="${d}" fill="none" stroke="${shade(color, 0.3)}" stroke-width="${r(Math.max(0.8, fl * 0.04))}" transform="translate(0 ${r(-fl * 0.05)})" opacity="0.7"/>`;
    yy += fl;
  }
  sec += linerRect(yy);
  D.def(`<clipPath id="${clip}"><circle cx="${r(cx)}" cy="${r(cy)}" r="${r(R)}"/></clipPath>`);
  let s = '';
  if (from) {
    const ang = Math.atan2(from[1] - cy, from[0] - cx);
    const ex = cx + Math.cos(ang) * (R + 6);
    const ey = cy + Math.sin(ang) * (R + 6);
    s += `<line x1="${r(from[0])}" y1="${r(from[1])}" x2="${r(ex)}" y2="${r(ey)}" stroke="${K.ink}" stroke-width="1.4" stroke-opacity="0.55"/>`;
    s += `<circle cx="${r(from[0])}" cy="${r(from[1])}" r="9" fill="none" stroke="${K.ink}" stroke-width="1.4" stroke-opacity="0.55"/><circle cx="${r(from[0])}" cy="${r(from[1])}" r="2.4" fill="${K.ink}" fill-opacity="0.7"/>`;
  }
  s += `<circle cx="${r(cx + 6)}" cy="${r(cy + 12)}" r="${r(R + 8)}" fill="#2A2016" opacity="0.22" filter="${D.blur(10)}"/>`;
  s += `<g clip-path="url(#${clip})">${bg}<g filter="${D.grain(1.2, '0.45 0.16')}">${sec}</g></g>`;
  // glass: rim, inner shade and a soft highlight
  s += `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(R)}" fill="${D.rad(cx, cy, R, [[0.7, '#000', 0], [1, '#000', 0.16]])}"/>`;
  s += `<path d="M${r(cx - R * 0.72)} ${r(cy - R * 0.38)}A${r(R * 0.82)} ${r(R * 0.82)} 0 0 1 ${r(cx + R * 0.1)} ${r(cy - R * 0.8)}" fill="none" stroke="#fff" stroke-width="${r(R * 0.07)}" stroke-linecap="round" opacity="0.45"/>`;
  s += `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(R + 3.5)}" fill="none" stroke="${D.lin([cx - R, cy - R], [cx + R, cy + R], [[0, '#FFFFFF'], [0.5, '#D9D4CB'], [1, '#9C958A']])}" stroke-width="7"/>`;
  s += `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(R + 7)}" fill="none" stroke="${K.ink}" stroke-width="1" stroke-opacity="0.35"/>`;
  if (label) {
    const lw = label.length * 9.4 + 26;
    s += `<g transform="translate(${r(cx - lw / 2)} ${r(cy + R + 18)})"><rect width="${r(lw)}" height="30" rx="15" fill="${K.ink}"/>${text(lw / 2, 20, 14.5, label, { color: '#fff', anchor: 'middle', weight: 700, spacing: 1.2 })}</g>`;
  }
  return s;
}

/** Screen point on the cut edge of an open carton's front (+y) flap, `u` = 0..1 along it (for loupe leaders) */
export function flapEdge(P, b, u = 0.5, ang = 122) {
  const a = (ang * Math.PI) / 180;
  const fl = Math.min(b.w, b.d) / 2;
  return P(b.x + b.w * u, b.y + b.d + Math.sin(a) * fl, b.z + b.h + Math.cos(a) * fl);
}
