/**
 * Original basic shapes, outline frames and dividers. One colour on transparent, so the tint control recolours them.
 * Solid shapes sit behind text or photos; frames and dividers are line art with a fixed stroke.
 */
import { svg, el, path, circle, rect, INK } from './lib.mjs';

const S = { stroke: INK, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' };
const line = (d, extra = {}) => path(d, 'none', { ...S, ...extra });
const mk = (id, name, tags, w, h, body) => ({ id, name, category: 'shapes-frames', tags: tags.split(/\s+/), kind: 'mono', svg: svg(w, h, body) });
const solid = (id, name, tags, body) => mk(id, name, 'solid shape ' + tags, 100, 100, body);
const poly = (cx, cy, r, n, rot = -90, inner = 0) => {
  const pts = [];
  const steps = inner ? n * 2 : n;
  for (let i = 0; i < steps; i++) {
    const a = ((Math.PI * 2) / steps) * i + (rot * Math.PI) / 180;
    const rr = inner && i % 2 ? inner : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
};
const polygon = (points, extra = {}) => el('polygon', { points, fill: INK, 'stroke-linejoin': 'round', ...extra });

export const SHAPES = [
  solid('shape-circle', 'Circle', 'round dot disc gol', circle(50, 50, 46, INK)),
  solid('shape-square', 'Square', 'box chorus', rect(6, 6, 88, 88, INK)),
  solid('shape-rounded-square', 'Rounded square', 'box tile', rect(6, 6, 88, 88, INK, { rx: 18 })),
  solid('shape-rectangle-wide', 'Wide rectangle', 'panel bar label', rect(2, 24, 96, 52, INK, { rx: 8 })),
  solid('shape-triangle', 'Triangle', 'trikon', polygon(poly(50, 56, 50, 3), { 'stroke-width': 0 })),
  solid('shape-diamond', 'Diamond', 'rhombus', polygon('50,4 96,50 50,96 4,50')),
  solid('shape-hexagon', 'Hexagon', 'honeycomb', polygon(poly(50, 50, 48, 6, 0))),
  solid('shape-octagon', 'Octagon', 'stop', polygon(poly(50, 50, 48, 8, -22.5))),
  solid('shape-star', 'Star', 'five point tara', polygon(poly(50, 53, 48, 5, -90, 20))),
  solid('shape-star-burst', 'Star burst', 'eight point sparkle', polygon(poly(50, 50, 48, 8, -90, 30))),
  solid('shape-sunburst', 'Sunburst', 'rays sun badge', polygon(poly(50, 50, 48, 16, -90, 40))),
  solid('shape-heart', 'Heart', 'love pyaar', path('M50 90C10 62 4 36 22 21c12-9 24-5 28 6 4-11 16-15 28-6 18 15 12 41-28 69z', INK)),
  solid('shape-drop', 'Drop', 'water liquid teardrop', path('M50 5C32 28 18 44 18 62a32 32 0 0 0 64 0C82 44 68 28 50 5z', INK)),
  solid('shape-cloud', 'Cloud', 'sky weather', path('M26 78a20 20 0 0 1-2-40 26 26 0 0 1 50-6 22 22 0 0 1 4 46z', INK)),
  solid('shape-blob', 'Blob', 'freeform splash', path('M50 6C72 4 95 24 94 50c-1 28-25 46-48 44C20 92 4 72 6 46 8 24 28 8 50 6z', INK)),
  solid('shape-blob-two', 'Blob two', 'freeform splash', path('M30 10c20-12 52-4 62 20 10 22-2 42-18 56-18 14-48 12-62-6C-6 62 0 24 30 10z', INK)),
  solid('shape-arch', 'Arch', 'window door', path('M12 96V46a38 38 0 0 1 76 0v50z', INK)),
  solid('shape-semicircle', 'Semicircle', 'half circle', path('M4 70a46 46 0 0 1 92 0z', INK)),
  solid('shape-ring', 'Ring', 'donut circle hoop', circle(50, 50, 38, 'none', { stroke: INK, 'stroke-width': 14 })),
  solid('shape-crescent', 'Crescent', 'moon chand', path('M62 6A46 46 0 1 0 94 70 38 38 0 0 1 62 6z', INK)),
  solid('shape-speech-bubble', 'Speech bubble', 'chat talk quote', path('M18 10h64a12 12 0 0 1 12 12v38a12 12 0 0 1-12 12H50L28 92V72H18A12 12 0 0 1 6 60V22A12 12 0 0 1 18 10z', INK)),
  solid('shape-flower', 'Flower shape', 'petals bloom', Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return circle(50 + 26 * Math.cos(a), 50 + 26 * Math.sin(a), 20, INK);
  }).join('') + circle(50, 50, 22, INK)),
  solid('shape-plus', 'Plus', 'cross add', path('M38 6h24v32h32v24H62v32H38V62H6V38h32z', INK)),
  solid('shape-leaf-shape', 'Leaf shape', 'leaf patta', path('M8 92C4 44 40 6 94 6c2 52-34 90-86 86z', INK)),
  mk('frame-circle', 'Circle frame', 'frame round border ring', 100, 100, circle(50, 50, 44, 'none', S)),
  mk('frame-circle-double', 'Double circle frame', 'frame round border ring double', 100, 100, circle(50, 50, 46, 'none', S) + circle(50, 50, 38, 'none', { ...S, 'stroke-width': 1.5 })),
  mk('frame-square', 'Square frame', 'frame border box', 100, 100, rect(6, 6, 88, 88, 'none', S)),
  mk('frame-square-double', 'Double square frame', 'frame border box double', 100, 100, rect(5, 5, 90, 90, 'none', S) + rect(14, 14, 72, 72, 'none', { ...S, 'stroke-width': 1.5 })),
  mk('frame-rounded', 'Rounded frame', 'frame border rounded', 140, 100, rect(5, 5, 130, 90, 'none', { ...S, rx: 16 })),
  mk('frame-rounded-double', 'Double rounded frame', 'frame border rounded double', 140, 100, rect(5, 5, 130, 90, 'none', { ...S, rx: 16 }) + rect(13, 13, 114, 74, 'none', { ...S, rx: 10, 'stroke-width': 1.5 })),
  mk('frame-corners', 'Corner brackets', 'frame corners border brackets', 100, 100, line('M6 28V6h22M72 6h22v22M94 72v22H72M28 94H6V72')),
  mk('frame-arch', 'Arch frame', 'frame arch window door', 100, 120, path('M8 114V50a42 42 0 0 1 84 0v64z', 'none', S)),
  mk('frame-hexagon', 'Hexagon frame', 'frame hexagon border', 100, 100, el('polygon', { points: poly(50, 50, 44, 6, 0), ...S })),
  mk('frame-ticket', 'Ticket frame', 'frame ticket coupon voucher', 140, 80, path('M8 8h124v22a10 10 0 0 0 0 20v22H8V50a10 10 0 0 0 0-20z', 'none', S)),
  mk('frame-polaroid', 'Photo frame', 'frame polaroid photo instant', 100, 120, rect(5, 5, 90, 110, 'none', { ...S, rx: 3 }) + rect(14, 14, 72, 72, 'none', { ...S, 'stroke-width': 1.6 })),
  mk('frame-dashed-rect', 'Dashed frame', 'frame dashed stitch border coupon', 140, 100, rect(6, 6, 128, 88, 'none', { ...S, rx: 8, 'stroke-dasharray': '7 7' })),
  mk('frame-dashed-circle', 'Dashed circle', 'frame dashed circle stitch', 100, 100, circle(50, 50, 44, 'none', { ...S, 'stroke-dasharray': '7 7' })),
  mk('frame-dotted-rect', 'Dotted frame', 'frame dotted border', 140, 100, rect(6, 6, 128, 88, 'none', { ...S, rx: 8, 'stroke-dasharray': '0.1 8', 'stroke-width': 4.5 })),
  mk('frame-speech', 'Speech frame', 'frame speech bubble outline', 100, 100, path('M18 10h64a12 12 0 0 1 12 12v38a12 12 0 0 1-12 12H50L28 92V72H18A12 12 0 0 1 6 60V22A12 12 0 0 1 18 10z', 'none', S)),
  mk('frame-ornate-corners', 'Ornate corners', 'frame corners border decorative', 120, 100,
    line('M6 34C6 18 18 6 34 6M114 34c0-16-12-28-28-28M6 66c0 16 12 28 28 28M114 66c0 16-12 28-28 28') + circle(10, 10, 2.5, INK) + circle(110, 10, 2.5, INK) + circle(10, 90, 2.5, INK) + circle(110, 90, 2.5, INK)),
  mk('frame-label-notched', 'Notched label frame', 'frame label notched border', 140, 70, path('M12 6h116l6 6v46l-6 6H12l-6-6V12z', 'none', S)),
  mk('divider-wave', 'Wavy line', 'divider wave line border', 160, 20, line('M6 10q10-10 20 0t20 0 20 0 20 0 20 0 20 0 20 0 20 0')),
  mk('divider-zigzag', 'Zigzag line', 'divider zigzag line border', 160, 20, line('M6 14l10-8 10 8 10-8 10 8 10-8 10 8 10-8 10 8 10-8 10 8 10-8 10 8 10-8')),
  mk('divider-dots', 'Dotted line', 'divider dots line border', 160, 20, Array.from({ length: 11 }, (_, i) => circle(10 + i * 14, 10, 3, INK)).join('')),
  mk('divider-dashes', 'Dashed line', 'divider dashes line cut', 160, 20, line('M6 10h148', { 'stroke-dasharray': '10 8' })),
  mk('divider-double', 'Double line', 'divider double line border', 160, 20, line('M6 6h148M6 14h148', { 'stroke-width': 2.4 })),
  mk('divider-diamond', 'Line with diamond', 'divider ornament line diamond', 160, 20, line('M6 10h60M94 10h60') + polygon('80,2 88,10 80,18 72,10')),
  mk('divider-stars', 'Line with stars', 'divider ornament line stars', 160, 24, line('M6 12h50M104 12h50') + polygon(poly(80, 12, 8, 5, -90, 3.4)) + polygon(poly(62, 12, 4, 5, -90, 1.8)) + polygon(poly(98, 12, 4, 5, -90, 1.8))),
  mk('divider-scallop', 'Scallop border', 'divider scallop border edge', 160, 20, line('M4 4a8 8 0 0 0 16 0 8 8 0 0 0 16 0 8 8 0 0 0 16 0 8 8 0 0 0 16 0 8 8 0 0 0 16 0 8 8 0 0 0 16 0 8 8 0 0 0 16 0 8 8 0 0 0 16 0 8 8 0 0 0 16 0 8 8 0 0 0 16 0', { 'stroke-width': 2.4 })),
  mk('divider-tape', 'Tape strip', 'washi tape strip decorative', 140, 48, path('M6 4H134l-6 4 6 4-6 4 6 4-6 4 6 4-6 4 6 4-6 4 6 4H6l6-4-6-4 6-4-6-4 6-4-6-4 6-4-6-4 6-4z', INK, { opacity: 0.85 })),
];
