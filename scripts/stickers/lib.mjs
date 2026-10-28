/**
 * Shared helpers for the sticker library build (scripts/stickers/*.mjs).
 * Everything here is original code; the only third-party artwork it touches is the curated Fluent Emoji subset
 * (see catalog-fluent.mjs), which is cleaned and checked by `optimise` and `assertSafe`.
 */

export const NS = 'http://www.w3.org/2000/svg';

export const CATEGORIES = [
  { id: 'fruits-veg', label: 'Fruits & vegetables' },
  { id: 'bakery-food', label: 'Bakery & food' },
  { id: 'drinks', label: 'Drinks' },
  { id: 'clothing', label: 'Clothing & fashion' },
  { id: 'footwear-accessories', label: 'Footwear & accessories' },
  { id: 'beauty-wellness', label: 'Beauty & wellness' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'gifts-festive', label: 'Gifts & festive' },
  { id: 'home-kitchen', label: 'Home & kitchen' },
  { id: 'flowers-plants', label: 'Flowers & plants' },
  { id: 'animals-kids', label: 'Animals & kids' },
  { id: 'shipping-marks', label: 'Shipping & handling marks' },
  { id: 'badges-labels', label: 'Badges & labels' },
  { id: 'shapes-frames', label: 'Shapes & frames' },
  { id: 'patterns', label: 'Seamless patterns' },
  { id: 'contact-icons', label: 'Contact icons' },
];

const r2 = (n) => {
  const v = Math.round(n * 100) / 100;
  return Object.is(v, -0) ? 0 : v;
};

export const num = r2;

/** Wrap a body in a root svg with a viewBox (no width/height so it scales in any container). */
export function svg(w, h, body) {
  return `<svg xmlns="${NS}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
}

/** Build an attribute string from an object, skipping null/undefined. */
export function attrs(o) {
  return Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => ` ${k}="${typeof v === 'number' ? r2(v) : v}"`)
    .join('');
}

export const el = (tag, a = {}, inner = '') => (inner ? `<${tag}${attrs(a)}>${inner}</${tag}>` : `<${tag}${attrs(a)}/>`);
export const circle = (cx, cy, r, fill, extra = {}) => el('circle', { cx, cy, r, fill, ...extra });
export const ellipse = (cx, cy, rx, ry, fill, extra = {}) => el('ellipse', { cx, cy, rx, ry, fill, ...extra });
export const path = (d, fill, extra = {}) => el('path', { d, fill, ...extra });
export const rect = (x, y, width, height, fill, extra = {}) => el('rect', { x, y, width, height, fill, ...extra });

/** Minify: strip comments, prologs, metadata, whitespace between tags, and round long decimals. */
export function optimise(source) {
  let s = source
    .replace(/<\?xml[\s\S]*?\?>/g, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(metadata|title|desc|script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/\s(?:data-[\w-]+|class|xml:space)="[^"]*"/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();
  s = s.replace(/-?\d*\.\d{3,}/g, (m) => String(r2(parseFloat(m))));
  return s;
}

/**
 * Reject anything that could load, run or leak: scripts, event handlers, external references, embedded images,
 * foreignObject, CSS imports. Local fragment references (#id) are the only references allowed.
 */
export function assertSafe(id, s) {
  const bad = [
    [/<\s*script/i, 'script element'],
    [/\son[a-z]+\s*=/i, 'event handler attribute'],
    [/<\s*(image|foreignObject|iframe|object|embed|use\b[^>]*href="(?!#))/i, 'image/foreign/external element'],
    [/(?:xlink:)?href\s*=\s*"(?!#)/i, 'external href'],
    [/url\(\s*['"]?(?!#)/i, 'external url()'],
    [/@import/i, 'css import'],
    [/javascript:/i, 'javascript url'],
    [/<\s*(a|animate|set)\b/i, 'link or animation element'],
  ];
  for (const [re, what] of bad) if (re.test(s)) throw new Error(`Sticker ${id}: unsafe SVG (${what})`);
  if (!/^<svg [^>]*viewBox="[^"]+"/.test(s)) throw new Error(`Sticker ${id}: missing viewBox`);
}

/** Single-colour ink used for mono stickers; the editor tints it, so the exact value is irrelevant. */
export const INK = '#1f2328';
