/**
 * Kit v2, part 2: load securing (straps, corner boards, stretch film), rolls and cylinders on any axis, mailers and
 * flat blanks, and the goods that go in the boxes (fruit, bottles, vials, laptops, gears, a truck).
 * Same conventions as kit.mjs: world units are centimetres, z is up, key light from the front-left.
 * SECURITY: build-time only; emits static SVG strings.
 */
import { COS, K, block, cylinderZ, face, isoCircle, lathe, plane, proj, pts, r, seg, shade, text } from './kit.mjs';

const add3 = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const r3 = (n) => Math.round(n * 1000) / 1000;

// --- Load securing ---------------------------------------------------------------------------------------------------

/**
 * A strap (PP / PET band) over the top of a block and down its visible end: along 'y' runs over the top along y and
 * down the +y face at x = `at`; along 'x' runs along x and down the +x face at y = `at`.
 */
export function strap(D, P, b, { along = 'y', at, width = 1.6, color = '#2F5D8A', seal = true, lift = 0.25 } = {}) {
  const { x, y, z, w, d, h } = b;
  const zt = z + h + lift;
  const out = [];
  if (along === 'y') {
    const c = at ?? x + w / 2;
    const x0 = c - width / 2;
    const x1 = c + width / 2;
    out.push(face(D, P, [[x0, y, zt], [x1, y, zt], [x1, y + d + lift, zt], [x0, y + d + lift, zt]], color, { k0: 0.18, k1: 0.02 }));
    out.push(face(D, P, [[x0, y + d + lift, zt], [x1, y + d + lift, zt], [x1, y + d + lift, z], [x0, y + d + lift, z]], color, { k0: 0.06, k1: -0.12 }));
    if (seal) out.push(block(D, P, { x: c - width * 0.8, y: y + d * 0.6, z: zt, w: width * 1.6, d: width * 2.6, h: 0.4 }, { color: K.steel, outline: false }));
  } else {
    const c = at ?? y + d / 2;
    const y0 = c - width / 2;
    const y1 = c + width / 2;
    out.push(face(D, P, [[x, y0, zt], [x + w + lift, y0, zt], [x + w + lift, y1, zt], [x, y1, zt]], color, { k0: 0.14, k1: 0.02 }));
    out.push(face(D, P, [[x + w + lift, y1, zt], [x + w + lift, y0, zt], [x + w + lift, y0, z], [x + w + lift, y1, z]], shade(color, -0.14), { k0: 0.04, k1: -0.12 }));
    if (seal) out.push(block(D, P, { x: x + w * 0.6, y: c - width * 0.8, z: zt, w: width * 2.6, d: width * 1.6, h: 0.4 }, { color: K.steel, outline: false }));
  }
  return out.join('');
}

/** L-shaped edge protectors on the three visible vertical edges of a block */
export function cornerBoards(D, P, b, { leg = 5, color = '#D9CDB8', from = 0, to } = {}) {
  const { x, y, z, w, d, h } = b;
  const o = 0.35;
  const z0 = z + from;
  const z1 = to ?? z + h + 0.2;
  const L = (a0, a1) => face(D, P, [[a0, y + d + o, z1], [a1, y + d + o, z1], [a1, y + d + o, z0], [a0, y + d + o, z0]], shade(color, 0.05), { k0: 0.06, k1: -0.06 });
  const R = (a0, a1) => face(D, P, [[x + w + o, a0, z1], [x + w + o, a1, z1], [x + w + o, a1, z0], [x + w + o, a0, z0]], shade(color, -0.12), { k0: 0.04, k1: -0.08 });
  const edge = seg(P, [x + w + o, y + d + o, z0], [x + w + o, y + d + o, z1], { stroke: '#fff', sw: 1.2, op: 0.5 });
  return [L(x - o, x + leg), R(y + leg, y - o), L(x + w - leg, x + w + o), R(y + d + o, y + d - leg), edge].join('');
}

/** Stretch film over the visible faces of a load: milky translucent sheet with spiral wrap bands and glints */
export function stretchWrap(D, P, b, { from = 0, color = '#E3EEF1', op = 0.32 } = {}) {
  const { x, y, z, w, d, h } = b;
  const o = 0.6;
  const z0 = z + from;
  const zt = z + h + 0.4;
  const L = proj(P, [[x - o, y + d + o, zt], [x + w + o, y + d + o, zt], [x + w + o, y + d + o, z0], [x - o, y + d + o, z0]]);
  const R = proj(P, [[x + w + o, y + d + o, zt], [x + w + o, y - o, zt], [x + w + o, y - o, z0], [x + w + o, y + d + o, z0]]);
  const T = proj(P, [[x - o, y - o, zt], [x + w + o, y - o, zt], [x + w + o, y + d + o, zt], [x - o, y + d + o, zt]]);
  let s = `<polygon points="${pts(T)}" fill="#FFFFFF" opacity="${op * 0.5}"/>`;
  s += `<polygon points="${pts(L)}" fill="${D.lin(L[0], L[1], [[0, '#FFFFFF', op * 1.4], [0.45, color, op * 0.6], [1, '#FFFFFF', op * 1.1]])}"/>`;
  s += `<polygon points="${pts(R)}" fill="${D.lin(R[0], R[1], [[0, '#FFFFFF', op * 1.2], [1, color, op * 0.7]])}"/>`;
  const bands = Math.max(3, Math.round((zt - z0) / 16));
  for (let i = 1; i < bands; i++) {
    const zz = z0 + ((zt - z0) * i) / bands;
    s += seg(P, [x - o, y + d + o, zz + 2.5], [x + w + o, y + d + o, zz - 2.5], { stroke: '#fff', sw: 1.6, op: 0.6 });
    s += seg(P, [x + w + o, y + d + o, zz - 2.5], [x + w + o, y - o, zz - 6], { stroke: '#fff', sw: 1.3, op: 0.42 });
  }
  const g = (u, v, len) => {
    const a = P(x + w * u, y + d + o, z0 + (zt - z0) * v);
    return `M${r(a[0])} ${r(a[1])}l${r(P.s * len * COS)} ${r(P.s * len * 0.5)}`;
  };
  s += `<path d="${g(0.12, 0.86, 9)}${g(0.2, 0.3, 14)}${g(0.62, 0.62, 7)}" stroke="#fff" stroke-width="3.2" stroke-linecap="round" opacity="0.75"/>`;
  s += `<polyline points="${pts([L[3], L[2], R[3], R[2]])}" fill="none" stroke="#fff" stroke-width="1" opacity="0.6"/>`;
  return s;
}

// --- Cylinders on any axis -------------------------------------------------------------------------------------------

const AXES = { x: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], y: [[0, 1, 0], [1, 0, 0], [0, 0, 1]], z: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] };

/**
 * Cylinder from `c0` along `axis` ('x' | 'y' | 'z', always towards the viewer: +x, +y or +z) of length L, radius R.
 * The visible end cap is drawn with `cap(matrix, R)` if given (rings, holes, film layers), else a lit disc.
 */
export function cylinder(D, P, c0, axis, R, L, { color = K.kraft, cap, capColor, outline = true, sideFill } = {}) {
  const [a, u, v] = AXES[axis];
  const c1 = add3(c0, a, L);
  // tangent points: the circle angles whose projections are furthest from the projected axis line
  const s0 = P(...c0);
  const s1 = P(...c1);
  const ax = [s1[0] - s0[0], s1[1] - s0[1]];
  const al = Math.hypot(...ax) || 1;
  const n = axis === 'z' ? [1, 0] : [-ax[1] / al, ax[0] / al];
  let best = [0, 0];
  let bestVal = [-Infinity, Infinity];
  for (let i = 0; i < 360; i++) {
    const t = (i * Math.PI) / 180;
    const p = P(...add3(add3(c0, u, R * Math.cos(t)), v, R * Math.sin(t)));
    const val = (p[0] - s0[0]) * n[0] + (p[1] - s0[1]) * n[1];
    if (val > bestVal[0]) (bestVal[0] = val), (best[0] = t);
    if (val < bestVal[1]) (bestVal[1] = val), (best[1] = t);
  }
  const at = (c, t) => P(...add3(add3(c, u, R * Math.cos(t)), v, R * Math.sin(t)));
  const A0 = at(c0, best[0]);
  const A1 = at(c1, best[0]);
  const B0 = at(c0, best[1]);
  const B1 = at(c1, best[1]);
  const m0 = plane(P, c0, u, v);
  const m1 = plane(P, c1, u, v);
  const fill = sideFill ?? D.lin(A0, B0, [[0, shade(color, -0.3)], [0.45, shade(color, 0.02)], [0.75, shade(color, 0.2)], [1, shade(color, 0.04)]]);
  let s = `<circle r="${r3(R)}" transform="${m0}" fill="${shade(color, -0.2)}"/>`;
  s += `<polygon points="${pts([A0, A1, B1, B0])}" fill="${fill}"/>`;
  s += `<g transform="${m1}">${cap ? cap(R) : `<circle r="${r3(R)}" fill="${capColor ?? shade(color, 0.14)}"/>`}</g>`;
  if (outline) s += `<polyline points="${pts([A1, A0])}" fill="none" stroke="${shade(color, -0.5)}" stroke-width="0.8" stroke-opacity="0.4"/><polyline points="${pts([B1, B0])}" fill="none" stroke="${shade(color, -0.5)}" stroke-width="0.8" stroke-opacity="0.4"/><circle r="${r3(R)}" transform="${m1}" fill="none" stroke="${shade(color, -0.5)}" stroke-width="${r3(0.8 / P.s)}" stroke-opacity="0.45"/>`;
  return s;
}

/** End cap of a wound roll (tape, film, strap): wound layers, a cardboard core and the hole. Local plane units. */
export function rollCap(R, core, { color, coreColor = '#C49A6C', hole = '#3B2E22', rings = 9, op = 1 } = {}) {
  let s = `<circle r="${r3(R)}" fill="${shade(color, 0.08)}" opacity="${op}"/>`;
  for (let i = 1; i <= rings; i++) {
    const rr = core + ((R - core) * i) / (rings + 1);
    s += `<circle r="${r3(rr)}" fill="none" stroke="${shade(color, i % 2 ? -0.12 : 0.18)}" stroke-width="${r3((R - core) / (rings * 3))}" opacity="${0.6 * op}"/>`;
  }
  s += `<circle r="${r3(core)}" fill="${coreColor}"/><circle r="${r3(core * 0.86)}" fill="${hole}"/>`;
  s += `<circle r="${r3(core * 0.86)}" fill="none" stroke="#000" stroke-opacity="0.35" stroke-width="${r3(core * 0.1)}"/>`;
  return s;
}

// --- Flat goods ------------------------------------------------------------------------------------------------------

/**
 * Flat artwork lying on a horizontal surface at height z, with real thickness: the art is drawn in the top plane
 * (local units = world units) and stepped down to fake its side. `side` colours the extrusion.
 */
export function slab(P, [x, y, z], art, { thick = 0.3, side = '#8A6440', rot = 0, outline } = {}) {
  const ang = (rot * Math.PI) / 180;
  const u = [Math.cos(ang), Math.sin(ang), 0];
  const v = [-Math.sin(ang), Math.cos(ang), 0];
  const steps = Math.max(1, Math.round(thick * P.s));
  // the side is the art's silhouette; pass `outline` (one plain shape) when the art is detailed, to keep files small
  const silhouette = outline ?? art.replace(/fill="[^"]*"/g, '').replace(/stroke="[^"]*"/g, '');
  let s = '';
  for (let i = steps; i > 0; i--) s += `<g transform="${plane(P, [x, y, z + thick - (thick * i) / steps - thick], u, v)}" fill="${side}" stroke="none">${silhouette}</g>`;
  s += `<g transform="${plane(P, [x, y, z], u, v)}">${art}</g>`;
  return s;
}

/** Gear tooth outline centred at 0,0 (local units), for slabs */
export function gearPath(R, teeth = 18, depth = 0.12, hole = 0.32) {
  let d = '';
  const n = teeth * 4;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    const k = i % 4;
    const rr = k === 1 || k === 2 ? R : R * (1 - depth);
    d += `${i ? 'L' : 'M'}${r3(Math.cos(t) * rr)} ${r3(Math.sin(t) * rr)}`;
  }
  d += `Z M${r3(R * hole)} 0A${r3(R * hole)} ${r3(R * hole)} 0 1 0 ${r3(-R * hole)} 0A${r3(R * hole)} ${r3(R * hole)} 0 1 0 ${r3(R * hole)} 0Z`;
  return d;
}

/** Brake disc outline: ring with drilled holes and a hat */
export function discArt(R, { color = '#9AA3A8', hat = '#6F777C' } = {}) {
  let holes = '';
  for (let i = 0; i < 24; i++) {
    const t = (i / 24) * Math.PI * 2 + (i % 2) * 0.06;
    const rr = R * (i % 2 ? 0.72 : 0.84);
    holes += `<circle cx="${r3(Math.cos(t) * rr)}" cy="${r3(Math.sin(t) * rr)}" r="${r3(R * 0.035)}" fill="#3B4245"/>`;
  }
  let bolts = '';
  for (let i = 0; i < 5; i++) {
    const t = (i / 5) * Math.PI * 2;
    bolts += `<circle cx="${r3(Math.cos(t) * R * 0.3)}" cy="${r3(Math.sin(t) * R * 0.3)}" r="${r3(R * 0.045)}" fill="#2E3437"/>`;
  }
  return `<circle r="${r3(R)}" fill="${color}"/><circle r="${r3(R * 0.97)}" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="${r3(R * 0.02)}"/>${holes}<circle r="${r3(R * 0.5)}" fill="${hat}"/><circle r="${r3(R * 0.42)}" fill="${shade(hat, 0.15)}"/>${bolts}<circle r="${r3(R * 0.16)}" fill="#22282B"/>`;
}

// --- Bottles, vials, fruit -------------------------------------------------------------------------------------------

/** Glass bottle standing at world `at`, with a cap and a wrap-around label band */
export function bottle(D, P, at, { R = 3.4, H = 24, color = '#8A5A1E', cap = '#C8372D', label = '#F3EEE3', ink = K.green } = {}) {
  const prof = [[R * 0.92, 0], [R, R * 0.25], [R, H * 0.58], [R * 0.96, H * 0.64], [R * 0.42, H * 0.8], [R * 0.36, H * 0.93], [R * 0.4, H * 0.95], [R * 0.4, H]];
  let s = lathe(D, P, at, prof, { color, glass: true });
  const [cx, cy] = P(...at);
  const k = COS * Math.SQRT2 * P.s;
  const ly0 = cy - H * 0.2 * P.s;
  const ly1 = cy - H * 0.5 * P.s;
  const ry = R * Math.SQRT1_2 * P.s;
  s += `<path d="M${r(cx - R * k)} ${r(ly1)}V${r(ly0)}A${r(R * k)} ${r(ry)} 0 0 0 ${r(cx + R * k)} ${r(ly0)}V${r(ly1)}A${r(R * k)} ${r(ry)} 0 0 1 ${r(cx - R * k)} ${r(ly1)}Z" fill="${D.lin([cx - R * k, 0], [cx + R * k, 0], [[0, shade(label, -0.2)], [0.35, label], [1, shade(label, -0.38)]])}"/>`;
  s += `<path d="M${r(cx - R * k * 0.6)} ${r((ly0 + ly1) / 2 + ry * 0.35)}h${r(R * k * 1.2)}" stroke="${ink}" stroke-width="${r(Math.max(2, (ly0 - ly1) * 0.24))}"/>`;
  s += `<path d="M${r(cx - R * k * 0.62)} ${r(cy - H * 0.86 * P.s)}V${r(cy - H * 0.22 * P.s)}" stroke="#fff" stroke-width="${r(Math.max(1.5, R * k * 0.16))}" stroke-linecap="round" opacity="0.38"/>`;
  s += cylinderZ(D, P, [at[0], at[1], at[2] + H - H * 0.03], R * 0.46, H * 0.07, { color: cap, outline: false });
  return s;
}

/** Small glass vial with an aluminium crimp cap */
export function vial(D, P, at, { R = 1.3, H = 5, glass = '#B9D3DA', cap = '#C7CDD1', flip = '#2B6CB0' } = {}) {
  const prof = [[R * 0.95, 0], [R, R * 0.2], [R, H * 0.7], [R * 0.6, H * 0.8], [R * 0.6, H * 0.84]];
  let s = lathe(D, P, at, prof, { color: glass, glass: true });
  s += cylinderZ(D, P, [at[0], at[1], at[2] + H * 0.82], R * 0.68, H * 0.12, { color: cap, outline: false });
  s += cylinderZ(D, P, [at[0], at[1], at[2] + H * 0.94], R * 0.5, H * 0.06, { color: flip, outline: false });
  return s;
}

/**
 * Fruit seen from above-front. Screen space. shape 'mango' is a kidney oval with a beak at the far end and a green
 * shoulder at the stem; 'round' is an orange or tomato.
 */
export function fruit(D, [cx, cy], rx, ry, { color = '#F2B33A', blush = '#E0662F', rot = -18, stem = true, leaf = false, shape = 'mango' } = {}) {
  const f = D.rad(cx - rx * 0.35, cy - ry * 0.45, Math.max(rx, ry) * 1.35, [[0, shade(color, 0.45)], [0.35, color], [0.8, shade(color, -0.18)], [1, shade(color, -0.42)]]);
  const b = D.rad(cx + rx * 0.4, cy + ry * 0.15, Math.max(rx, ry) * 0.95, [[0, blush, 0.8], [1, blush, 0]]);
  const m = (px, py) => `${r(cx + px * rx)} ${r(cy + py * ry)}`;
  const outline =
    shape === 'mango'
      ? `M${m(-1, 0.02)}C${m(-1.02, -0.72)} ${m(0.42, -0.98)} ${m(0.9, -0.42)}C${m(1.12, -0.12)} ${m(1.08, 0.32)} ${m(0.86, 0.5)}C${m(0.6, 0.86)} ${m(-0.2, 1.06)} ${m(-0.72, 0.74)}C${m(-0.92, 0.6)} ${m(-1, 0.32)} ${m(-1, 0.02)}Z`
      : `M${m(-1, 0)}A${r(rx)} ${r(ry)} 0 1 1 ${m(1, 0)}A${r(rx)} ${r(ry)} 0 1 1 ${m(-1, 0)}Z`;
  const shoulder = D.rad(cx - rx * 0.95, cy - ry * 0.1, rx * 0.75, [[0, '#8DAA3A', shape === 'mango' ? 0.55 : 0], [1, '#8DAA3A', 0]]);
  let s = `<g transform="rotate(${rot} ${r(cx)} ${r(cy)})"><path d="${outline}" fill="${f}"/><path d="${outline}" fill="${b}"/><path d="${outline}" fill="${shoulder}"/>`;
  s += `<ellipse cx="${r(cx - rx * 0.32)}" cy="${r(cy - ry * 0.5)}" rx="${r(rx * 0.26)}" ry="${r(ry * 0.12)}" fill="#fff" opacity="0.45"/>`;
  if (stem) s += `<path d="M${r(cx - rx * 0.9)} ${r(cy - ry * 0.12)}q${r(-rx * 0.12)} ${r(-ry * 0.22)} ${r(-rx * 0.24)} ${r(-ry * 0.2)}" stroke="#5B4220" stroke-width="${r(Math.max(1.4, rx * 0.07))}" fill="none" stroke-linecap="round"/>`;
  if (leaf) s += `<path d="M${r(cx - rx * 1.08)} ${r(cy - ry * 0.32)}c${r(-rx * 0.3)} ${r(-ry * 0.95)} ${r(-rx * 0.95)} ${r(-ry * 0.85)} ${r(-rx * 1.15)} ${r(-ry * 0.5)}c${r(rx * 0.3)} ${r(ry * 0.5)} ${r(rx * 0.85)} ${r(ry * 0.62)} ${r(rx * 1.15)} ${r(ry * 0.5)}z" fill="${D.lin([cx - rx * 2.2, cy - ry], [cx - rx, cy], [[0, '#6DAA44'], [1, '#2F6B2A']])}"/>`;
  s += `<path d="${outline}" fill="none" stroke="${shade(color, -0.55)}" stroke-width="0.7" stroke-opacity="0.4"/></g>`;
  return s;
}

/** Iso screen radius pair for a sphere-ish object of world radius R (for fruit) */
export const sphereR = (P, R) => [R * P.s * 1.05, R * P.s * 0.9];

// --- Laptop ----------------------------------------------------------------------------------------------------------

/** Laptop lying open at `ang` degrees (lid hinged at the back edge y = b.y) */
export function laptop(D, P, b, { ang = 105, body = '#B8BEC2', screen = '#1D2B33' } = {}) {
  const { x, y, z, w, d } = b;
  const base = { x, y, z, w, d, h: 1.6 };
  let s = block(D, P, base, { color: body });
  // keyboard and trackpad on the deck
  const deck = plane(P, [x, y, z + 1.6], [1, 0, 0], [0, 1, 0]);
  s += `<g transform="${deck}"><rect x="${r3(w * 0.08)}" y="${r3(d * 0.12)}" width="${r3(w * 0.84)}" height="${r3(d * 0.42)}" rx="0.4" fill="#2A3035"/>`;
  for (let row = 0; row < 5; row++) for (let col = 0; col < 14; col++) s += `<rect x="${r3(w * 0.09 + col * w * 0.06)}" y="${r3(d * 0.135 + row * d * 0.08)}" width="${r3(w * 0.05)}" height="${r3(d * 0.065)}" rx="0.2" fill="#3C454B"/>`;
  s += `<rect x="${r3(w * 0.36)}" y="${r3(d * 0.62)}" width="${r3(w * 0.28)}" height="${r3(d * 0.28)}" rx="0.5" fill="${shade(body, -0.06)}" stroke="${shade(body, -0.2)}" stroke-width="0.12"/></g>`;
  // lid
  const a = (ang * Math.PI) / 180;
  const dir = [0, -Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2)];
  const L0 = [x, y, z + 1.6];
  const L1 = [x + w, y, z + 1.6];
  const L2 = add3(L1, dir, d);
  const L3 = add3(L0, dir, d);
  s += `<polygon points="${pts(proj(P, [L0, L1, L2, L3]))}" fill="${shade(body, -0.1)}" stroke="${shade(body, -0.45)}" stroke-width="0.7" stroke-opacity="0.5"/>`;
  const sm = plane(P, L3, [1, 0, 0], [-dir[0], -dir[1], -dir[2]]);
  s += `<g transform="${sm}"><rect x="${r3(w * 0.04)}" y="${r3(d * 0.05)}" width="${r3(w * 0.92)}" height="${r3(d * 0.86)}" rx="0.3" fill="${screen}"/>`;
  s += `<rect x="${r3(w * 0.04)}" y="${r3(d * 0.05)}" width="${r3(w * 0.92)}" height="${r3(d * 0.86)}" rx="0.3" fill="${D.linBox(0, 0, 1, 1, [[0, '#3A6E86', 0.85], [0.5, '#1E3A4A', 0.5], [1, '#0E1A21', 0.2]])}"/>`;
  s += `<path d="M${r3(w * 0.55)} ${r3(d * 0.05)}L${r3(w * 0.75)} ${r3(d * 0.05)}L${r3(w * 0.45)} ${r3(d * 0.91)}L${r3(w * 0.25)} ${r3(d * 0.91)}Z" fill="#fff" opacity="0.07"/></g>`;
  return s;
}

// --- Mailer box and flat blanks ------------------------------------------------------------------------------------

/**
 * Die-cut mailer (FEFCO 0427) with its lid open: double walls (rolled rim), a lid hinged at the back with a tuck
 * flap, and dust flaps. `inside` colours the white or kraft inner liner. `print(w, d)` draws artwork on the lid's
 * outside (visible only when closed) and `insidePrint` on the inside of the lid.
 */
export function mailer(D, P, b, { color = K.kraft, inside = '#F1EEE7', lid = 105, t = 0.32, contents = '', insidePrint = '', closed = false, lidPrint = '' } = {}) {
  const { x, y, z, w, d, h } = b;
  const zt = z + h;
  const out = [];
  if (closed) {
    out.push(block(D, P, { ...b, h: h }, { color, grain: 1, decor: { top: lidPrint } }));
    // tuck seam along the front top edge and the lid's front fold
    out.push(seg(P, [x, y + d - 0.2, zt], [x + w, y + d - 0.2, zt], { stroke: shade(color, -0.45), sw: 0.9, op: 0.5 }));
    out.push(seg(P, [x + w * 0.3, y + d, zt - 0.5], [x + w * 0.7, y + d, zt - 0.5], { stroke: shade(color, -0.45), sw: 0.9, op: 0.35 }));
    return out.join('');
  }
  // lid (hinged on the back top edge), seen from its inside when open
  const a = (lid * Math.PI) / 180;
  const dir = [0, -Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2)];
  const H0 = [x, y, zt];
  const H1 = [x + w, y, zt];
  const H2 = add3(H1, dir, d);
  const H3 = add3(H0, dir, d);
  out.push(face(D, P, [H0, H1, H2, H3], inside, { k0: -0.04, k1: 0.08 }));
  if (insidePrint) out.push(`<g transform="${plane(P, H3, [1, 0, 0], [-dir[0], -dir[1], -dir[2]])}">${insidePrint}</g>`);
  // tuck flap at the far end of the lid, folded slightly towards the viewer
  const T2 = add3(H2, [0, 1, 0.25], h * 0.75);
  const T3 = add3(H3, [0, 1, 0.25], h * 0.75);
  out.push(face(D, P, [H3, H2, T2, T3], shade(inside, -0.06), { k0: -0.04, k1: 0.04 }));
  out.push(`<polygon points="${pts(proj(P, [H0, H1, H2, T2, T3, H3]))}" fill="none" stroke="${shade(color, -0.45)}" stroke-width="0.8" stroke-opacity="0.45" stroke-linejoin="round"/>`);
  // tray: inner walls and floor
  out.push(face(D, P, [[x, y, zt], [x + w, y, zt], [x + w, y, z], [x, y, z]], shade(inside, -0.1), { k0: 0, k1: -0.2 }));
  out.push(face(D, P, [[x, y, zt], [x, y + d, zt], [x, y + d, z], [x, y, z]], shade(inside, -0.18), { k0: 0, k1: -0.24 }));
  const floor = proj(P, [[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]]);
  out.push(`<polygon points="${pts(floor)}" fill="${D.lin(floor[0], floor[2], [[0, shade(inside, -0.22)], [1, shade(inside, -0.04)]])}"/>`);
  out.push(contents);
  // front walls (outside) and the double-wall rolled rim on top of them
  out.push(block(D, P, b, { color, hide: { top: true }, grain: 1, edges: false }));
  const rimW = t * 2.4;
  const rim = (A, B, n) => face(D, P, [A, B, add3(B, n, -rimW), add3(A, n, -rimW)], shade(color, 0.22), { k0: 0.1, k1: -0.04 });
  out.push(rim([x, y + d, zt], [x + w, y + d, zt], [0, 1, 0]));
  out.push(rim([x + w, y + d, zt], [x + w, y, zt], [1, 0, 0]));
  out.push(seg(P, [x, y + d, zt], [x + w, y + d, zt], { stroke: '#fff', sw: 1, op: 0.5 }));
  out.push(seg(P, [x + w, y + d, zt], [x + w, y, zt], { stroke: '#fff', sw: 0.9, op: 0.35 }));
  return out.join('');
}

// --- Vehicles --------------------------------------------------------------------------------------------------------

/** Wheel on an axle along x (for a vehicle running along y) or y */
export function wheel(D, P, c, axis, R = 4.6, W = 2.6) {
  return cylinder(D, P, c, axis, R, W, {
    color: '#2A2E30',
    cap: (rr) => `<circle r="${r3(rr)}" fill="#33383B"/><circle r="${r3(rr * 0.62)}" fill="#9AA3A8"/><circle r="${r3(rr * 0.5)}" fill="#BFC6CA"/><circle r="${r3(rr * 0.16)}" fill="#5D6569"/>`,
  });
}

/** Big 2D label text block for liveries etc. (local units) */
export const livery = (w, h, { bg = K.green, fg = '#FBF8F3', word = 'Vayu', sub = 'Packaging Solutions' } = {}) =>
  `<rect width="${r3(w)}" height="${r3(h)}" fill="${bg}"/>${text(w * 0.07, h * 0.56, h * 0.34, word, { color: fg, weight: 700, spacing: -h * 0.005 })}${text(w * 0.072, h * 0.76, h * 0.1, sub, { color: fg, weight: 500, spacing: h * 0.01, op: 0.9 })}`;

export { isoCircle };
