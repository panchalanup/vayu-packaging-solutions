/**
 * Original badges, seals, ribbons and labels. One colour on transparent (text and rules are knocked out with an
 * SVG mask, so tinting keeps them readable). Generic words only: no certification, health, origin or quality-mark
 * claims (never Organic, Vegan, Certified, Food-grade, ISO and similar).
 * Text uses a system sans stack with textLength so the width is fixed on every device.
 */
import { svg, el, path, circle, rect, INK } from './lib.mjs';

const FONT = 'Arial Black, Arial, Helvetica, sans-serif';

/** Fixed-width bold caps text, centred at (x, y). Fits within maxW by shrinking the size if needed. */
function text(str, x, y, size, maxW, fill) {
  const chars = str.length;
  const natural = chars * size * 0.66;
  const w = Math.min(natural, maxW);
  const s = natural > maxW ? (size * maxW) / natural : size;
  return el('text', {
    x, y, 'font-size': s, 'font-family': FONT, 'font-weight': 800, 'text-anchor': 'middle', fill,
    textLength: w, lengthAdjust: 'spacingAndGlyphs',
  }, str.replace(/&/g, '&amp;'));
}

/** A solid shape with knocked-out details drawn in `knock` (black in a mask = transparent). */
function solidWithKnockout(w, h, shape, knock) {
  const m = el('mask', { id: 'k', x: 0, y: 0, width: w, height: h, maskUnits: 'userSpaceOnUse' }, rect(0, 0, w, h, '#fff') + knock);
  return svg(w, h, m + `<g mask="url(#k)">${shape}</g>`);
}

const starburst = (cx, cy, rOut, rIn, n) => {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI / n) * i - Math.PI / 2;
    const r = i % 2 ? rIn : rOut;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return el('polygon', { points: pts.join(' '), fill: INK, 'stroke-linejoin': 'round' });
};

const scallop = (cx, cy, r, n) => {
  const pts = Array.from({ length: n }, (_, i) => {
    const a = ((Math.PI * 2) / n) * i - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  const rr = (2 * r * Math.sin(Math.PI / n)) / 2 * 1.02;
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 1; i <= n; i++) {
    const p = pts[i % n];
    d += `A${rr.toFixed(2)} ${rr.toFixed(2)} 0 0 1 ${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
  }
  return path(d + 'Z', INK);
};

const K = '#000'; // knock-out colour inside masks
const ring = (cx, cy, r, w = 1.6, extra = {}) => circle(cx, cy, r, 'none', { stroke: K, 'stroke-width': w, ...extra });

const mk = (id, name, tags, kind, body, category = 'badges-labels') => ({ id, name, category, tags: tags.split(/\s+/), kind, svg: body });
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function lines(str) {
  return str.split('|');
}

/** Round disc seal with inner ring, 100x100. */
function roundSeal(label, tags) {
  const ls = lines(label);
  const knock =
    ring(50, 50, 40) +
    (ls.length === 1
      ? text(ls[0], 50, 56, 17, 62, K)
      : text(ls[0], 50, 46, 14, 58, K) + text(ls[1], 50, 66, 14, 58, K));
  return mk(`seal-${slug(label)}`, `${ls.join(' ')} seal`, tags, 'mono', solidWithKnockout(100, 100, circle(50, 50, 48, INK), knock));
}

/** Scalloped seal, 100x100. */
function scallopSeal(label, tags) {
  const ls = lines(label);
  const knock =
    ring(50, 50, 36, 1.4, { 'stroke-dasharray': '2.5 2.5' }) +
    (ls.length === 1 ? text(ls[0], 50, 56, 16, 56, K) : text(ls[0], 50, 46, 13, 54, K) + text(ls[1], 50, 66, 13, 54, K));
  return mk(`scallop-${slug(label)}`, `${ls.join(' ')} scallop badge`, tags, 'mono', solidWithKnockout(100, 100, scallop(50, 50, 46, 18), knock));
}

/** Rounded label, 160x60. */
function rectLabel(label, tags) {
  const knock = rect(6, 6, 148, 48, 'none', { rx: 8, stroke: K, 'stroke-width': 1.6 }) + text(label, 80, 38, 20, 124, K);
  return mk(`label-${slug(label)}`, `${label} label`, tags, 'mono', solidWithKnockout(160, 60, rect(0, 0, 160, 60, INK, { rx: 14 }), knock));
}

/** Notched ribbon banner, 200x64. */
function ribbon(label, tags) {
  const shape = path('M0 8H200L184 32 200 56H0L16 32Z', INK);
  const knock = path('M24 14H176M24 50H176', 'none', { stroke: K, 'stroke-width': 1.4 }) + text(label, 100, 39, 20, 138, K);
  return mk(`ribbon-${slug(label)}`, `${label} ribbon`, tags, 'mono', solidWithKnockout(200, 64, shape, knock));
}

/** Outlined stamp, 200x72 (text filled, frame drawn as lines). Used for generic handling words. */
function stamp(label, tags, id, category) {
  const frame = rect(4, 4, 192, 64, 'none', { rx: 6, stroke: INK, 'stroke-width': 4 }) + rect(11, 11, 178, 50, 'none', { rx: 3, stroke: INK, 'stroke-width': 1.6 });
  return mk(id ?? `stamp-${slug(label)}`, `${label} stamp`, tags, 'mono', svg(200, 72, frame + text(label, 100, 45, 24, 160, INK)), category);
}

export const BADGES = [
  roundSeal('HANDMADE', 'handmade handcrafted craft hand made'),
  roundSeal('FRESH', 'fresh daily taaza'),
  roundSeal('NEW', 'new arrival naya'),
  roundSeal('SALE', 'sale offer discount'),
  roundSeal('GIFT', 'gift present bhet'),
  roundSeal('PREMIUM', 'premium luxury quality'),
  roundSeal('HELLO', 'hello welcome greeting namaste'),
  roundSeal('THANK|YOU', 'thank you thanks dhanyavad aabhar'),
  scallopSeal('BEST|SELLER', 'best seller popular favourite top'),
  scallopSeal('LIMITED|EDITION', 'limited edition special rare'),
  scallopSeal('SPECIAL', 'special offer'),
  scallopSeal('HOT', 'hot trending popular'),
  scallopSeal('SMALL|BATCH', 'small batch craft'),
  scallopSeal('HAND|PICKED', 'hand picked selected'),
  rectLabel('THANK YOU', 'thank you thanks dhanyavad aabhar'),
  rectLabel('MADE WITH LOVE', 'made with love pyaar handmade'),
  rectLabel('HELLO', 'hello greeting namaste'),
  rectLabel('WELCOME', 'welcome swagat'),
  rectLabel('OPEN', 'open shop store'),
  rectLabel('HOME MADE', 'home made homemade ghar'),
  rectLabel('JUST FOR YOU', 'just for you gift personal'),
  rectLabel('NEW ARRIVAL', 'new arrival naya'),
  ribbon('SEASONAL', 'seasonal season special'),
  ribbon('FAVOURITE', 'favourite favorite popular'),
  ribbon('DAILY FRESH', 'daily fresh taaza'),
  ribbon('GIFT BOX', 'gift box present'),
  ribbon('WELCOME', 'welcome swagat'),
  ribbon('PREMIUM', 'premium luxury'),
  mk('blank-seal-round', 'Blank round seal', 'blank round seal circle badge empty', 'mono',
    solidWithKnockout(100, 100, circle(50, 50, 48, INK), ring(50, 50, 40) + ring(50, 50, 34, 1, { 'stroke-dasharray': '2 3' }))),
  mk('blank-seal-scallop', 'Blank scallop seal', 'blank scallop seal badge empty', 'mono',
    solidWithKnockout(100, 100, scallop(50, 50, 46, 18), ring(50, 50, 36, 1.4, { 'stroke-dasharray': '2.5 2.5' }))),
  mk('blank-starburst', 'Blank starburst', 'blank starburst badge sale empty', 'mono',
    solidWithKnockout(100, 100, starburst(50, 50, 48, 38, 14), ring(50, 50, 32, 1.4))),
  mk('blank-label-rect', 'Blank label', 'blank label rectangle empty', 'mono',
    solidWithKnockout(160, 60, rect(0, 0, 160, 60, INK, { rx: 14 }), rect(6, 6, 148, 48, 'none', { rx: 8, stroke: K, 'stroke-width': 1.6 }))),
  mk('blank-ribbon', 'Blank ribbon', 'blank ribbon banner empty', 'mono',
    solidWithKnockout(200, 64, path('M0 8H200L184 32 200 56H0L16 32Z', INK), path('M24 14H176M24 50H176', 'none', { stroke: K, 'stroke-width': 1.4 }))),
  mk('blank-tag', 'Blank tag', 'blank tag price label empty hang', 'mono',
    solidWithKnockout(160, 80, path('M0 12a12 12 0 0 1 12-12h104l44 40-44 40H12A12 12 0 0 1 0 68z', INK), circle(130, 40, 7, K) + path('M16 16H108L140 40 108 64H16', 'none', { stroke: K, 'stroke-width': 1.4, 'stroke-dasharray': '3 3' }))),
  mk('starburst-new', 'New starburst', 'new starburst arrival naya', 'mono',
    solidWithKnockout(100, 100, starburst(50, 50, 48, 38, 14), text('NEW', 50, 57, 22, 52, K))),
  mk('starburst-sale', 'Sale starburst', 'sale starburst offer discount', 'mono',
    solidWithKnockout(100, 100, starburst(50, 50, 48, 38, 14), text('SALE', 50, 57, 22, 52, K))),
  stamp('FRAGILE', 'fragile handle care text stamp nazuk', 'stamp-fragile', 'shipping-marks'),
  stamp('THIS SIDE UP', 'this side up text stamp oopar', 'stamp-this-side-up', 'shipping-marks'),
  stamp('HANDLE WITH CARE', 'handle with care text stamp sambhal', 'stamp-handle-with-care', 'shipping-marks'),
  stamp('KEEP DRY', 'keep dry text stamp rain', 'stamp-keep-dry', 'shipping-marks'),
  stamp('GIFT', 'gift text stamp present', 'stamp-gift', 'badges-labels'),
  stamp('HANDMADE', 'handmade text stamp craft', 'stamp-handmade', 'badges-labels'),
];
