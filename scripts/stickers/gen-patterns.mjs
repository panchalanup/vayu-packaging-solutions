/**
 * Original seamless pattern tiles. Each tile is a 64x64 square, one colour on transparent so it can be tinted,
 * and tiles seamlessly: shapes either stay clear of the edges or are drawn again one tile away (the root svg clips
 * the overflow), so opposite edges always match. contact-sheet.mjs shows them repeated for a visual check.
 */
import { svg, el, path, circle, rect, INK } from './lib.mjs';

const S = { stroke: INK, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' };
const line = (d, extra = {}) => path(d, 'none', { ...S, ...extra });
const mk = (id, name, tags, body) => ({ id, name, category: 'patterns', tags: ['pattern', 'seamless', 'tile', ...tags.split(/\s+/)], kind: 'pattern', svg: svg(64, 64, body) });
const polygon = (points, extra = {}) => el('polygon', { points, fill: INK, ...extra });
const sparkle = (cx, cy, r) => polygon(`${cx},${cy - r} ${cx + r * 0.28},${cy - r * 0.28} ${cx + r},${cy} ${cx + r * 0.28},${cy + r * 0.28} ${cx},${cy + r} ${cx - r * 0.28},${cy + r * 0.28} ${cx - r},${cy} ${cx - r * 0.28},${cy - r * 0.28}`);
const leaf = (cx, cy, rot, s = 1) =>
  path('M0-10C7-6 8 4 0 11-8 4-7-6 0-10z', INK, { transform: `translate(${cx} ${cy}) rotate(${rot}) scale(${s})` });
const heart = (cx, cy, s) => path('M0 8C-9 2-10-4-6-7c3-2 5-1 6 2 1-3 3-4 6-2 4 3 3 9-6 15z', INK, { transform: `translate(${cx} ${cy}) scale(${s})` });
const tri = (cx, cy, r, up = true) => polygon(up ? `${cx},${cy - r} ${cx + r * 0.9},${cy + r * 0.7} ${cx - r * 0.9},${cy + r * 0.7}` : `${cx},${cy + r} ${cx + r * 0.9},${cy - r * 0.7} ${cx - r * 0.9},${cy - r * 0.7}`);

// small deterministic pseudo-random for speckle and confetti (keeps the build reproducible)
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const speckle = Array.from({ length: 64 }, (_, i) => circle(((i % 8) + 0.2 + rnd() * 0.6) * 8, ((Math.floor(i / 8)) + 0.2 + rnd() * 0.6) * 8, 0.6 + rnd() * 1.1, INK)).filter(() => rnd() > 0.2).join('');
const confetti = [
  [10, 12, 0], [30, 8, 40], [50, 14, 110], [18, 30, 70], [42, 32, 160], [58, 40, 20],
  [8, 50, 130], [28, 52, 90], [48, 56, 60], [34, 22, 10], [56, 24, 150], [14, 58, 30],
].map(([x, y, r], i) => (i % 3 === 0 ? circle(x, y, 2.4, INK) : i % 3 === 1 ? rect(-3, -1.2, 6, 2.4, INK, { transform: `translate(${x} ${y}) rotate(${r})`, rx: 1.2 }) : tri(x, y, 3.4, r % 2 === 0))).join('');

export const PATTERNS = [
  mk('pattern-dots', 'Dots', 'dots polka grid spots', [16, 48].flatMap((x) => [16, 48].map((y) => circle(x, y, 4.5, INK))).join('')),
  mk('pattern-polka', 'Polka dots', 'polka dots offset spots', circle(16, 16, 7, INK) + circle(48, 48, 7, INK) + circle(48, 16, 3, INK) + circle(16, 48, 3, INK)),
  mk('pattern-halftone', 'Fine dots', 'dots halftone fine dense', Array.from({ length: 64 }, (_, i) => circle(4 + (i % 8) * 8, 4 + Math.floor(i / 8) * 8, 1.6, INK)).join('')),
  mk('pattern-stripes-vertical', 'Vertical stripes', 'stripes lines vertical', rect(8, 0, 12, 64, INK) + rect(40, 0, 12, 64, INK)),
  mk('pattern-stripes-horizontal', 'Horizontal stripes', 'stripes lines horizontal', rect(0, 8, 64, 12, INK) + rect(0, 40, 64, 12, INK)),
  mk('pattern-stripes-diagonal', 'Diagonal stripes', 'stripes lines diagonal slant', line('M-20 20L20-20M-10 74L74-10M44 84L84 44', { 'stroke-width': 9, 'stroke-linecap': 'butt' })),
  mk('pattern-stripes-thin', 'Thin stripes', 'stripes lines thin pinstripe', Array.from({ length: 8 }, (_, i) => rect(i * 8 + 2, 0, 3, 64, INK)).join('')),
  mk('pattern-checkerboard', 'Checkerboard', 'check checker chess squares', rect(0, 0, 32, 32, INK) + rect(32, 32, 32, 32, INK)),
  mk('pattern-gingham', 'Gingham', 'check gingham plaid picnic', rect(0, 8, 64, 16, INK, { opacity: 0.45 }) + rect(0, 40, 64, 16, INK, { opacity: 0.45 }) + rect(8, 0, 16, 64, INK, { opacity: 0.45 }) + rect(40, 0, 16, 64, INK, { opacity: 0.45 })),
  mk('pattern-grid', 'Grid', 'grid lines graph squares', line('M32 0V64M0 32H64', { 'stroke-width': 2, 'stroke-linecap': 'butt' })),
  mk('pattern-diamonds', 'Diamond lattice', 'diamonds lattice diagonal grid argyle', line('M0 0L64 64M0 64L64 0', { 'stroke-width': 2.4, 'stroke-linecap': 'butt' })),
  mk('pattern-plus', 'Plus signs', 'plus cross geometric', line('M16 10v12M10 16h12M48 42v12M42 48h12', { 'stroke-width': 3 })),
  mk('pattern-waves', 'Waves', 'waves water sea wavy', line('M0 16q8-8 16 0t16 0 16 0 16 0M0 48q8-8 16 0t16 0 16 0 16 0', { 'stroke-width': 3 })),
  mk('pattern-scales', 'Scales', 'scallop scales fish japanese seigaiha', [[0, 0], [32, 0], [64, 0], [16, 16], [48, 16], [0, 32], [32, 32], [64, 32], [16, 48], [48, 48], [0, 64], [32, 64], [64, 64]].map(([x, y]) => circle(x, y, 16, 'none', { stroke: INK, 'stroke-width': 2.2 })).join('')),
  mk('pattern-zigzag', 'Zigzag', 'zigzag chevron geometric', [0, 32, 64].map((dy) => line(`M0 ${16 + dy}L16 ${dy} 32 ${16 + dy} 48 ${dy} 64 ${16 + dy}`, { 'stroke-width': 3, 'stroke-linejoin': 'miter' })).join('')),
  mk('pattern-triangles', 'Triangles', 'triangles geometric', tri(16, 16, 9, true) + tri(48, 48, 9, false) + tri(48, 16, 4, true) + tri(16, 48, 4, false)),
  mk('pattern-leaves', 'Leaves', 'leaves leaf nature botanical patta', leaf(16, 16, 35, 1.25) + leaf(48, 48, -145, 1.25) + leaf(48, 16, -35, 0.8) + leaf(16, 48, 145, 0.8)),
  mk('pattern-hearts', 'Hearts', 'hearts love valentine', heart(16, 16, 1.3) + heart(48, 48, 1.3) + heart(48, 14, 0.7) + heart(16, 46, 0.7)),
  mk('pattern-sparkles', 'Sparkles', 'sparkles stars twinkle shine', sparkle(16, 16, 9) + sparkle(48, 48, 9) + sparkle(48, 16, 4) + sparkle(16, 48, 4)),
  mk('pattern-rings', 'Rings', 'rings circles geometric', circle(16, 16, 9, 'none', { stroke: INK, 'stroke-width': 3 }) + circle(48, 48, 9, 'none', { stroke: INK, 'stroke-width': 3 }) + circle(48, 16, 3, INK) + circle(16, 48, 3, INK)),
  mk('pattern-confetti', 'Confetti', 'confetti party celebration scatter', confetti),
  mk('pattern-speckle', 'Speckle', 'speckle kraft terrazzo grain paper', speckle),
];
