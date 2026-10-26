/**
 * Share cards (1200×630 PNG) for the 3D box designer landing pages (#34): public/og/box-designer-<slug>.png
 * Original isometric box art from lib.mjs (no photos, no AI images) + the page title in the brand fonts.
 * Run: node scripts/illustrations/export-designer-og.mjs   (needs a local Edge or Chrome, like export-seo.mjs)
 * Keep CARDS in step with src/content/designerLandings.ts.
 * SECURITY: build-time only; reads our own fonts and logo, no network access.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { C, box, fitIso, line3, openBox, poly, shadow, svg } from './lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const exe = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((b) => fs.existsSync(b));
if (!exe) throw new Error('No Edge/Chrome found');

const shade = (hex, k) => {
  const n = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const t = k < 0 ? 0 : 255;
  const a = Math.abs(k);
  return `#${n.map((v) => Math.round(v + (t - v) * a).toString(16).padStart(2, '0')).join('')}`;
};

/** slug, title, style kind, inside size (cm) and board colour */
const CARDS = [
  { slug: 'shipping-carton', title: 'Design your shipping carton in 3D', kind: 'rsc', d: [30, 22, 15], color: '#C9A87C' },
  { slug: 'mailer-box', title: 'Design your mailer box in 3D', kind: 'lid', d: [30, 23, 6], color: '#F5F5F0' },
  { slug: 'pizza-box', title: 'Design your pizza box in 3D', kind: 'lid', d: [31, 31, 5], color: '#C9A87C' },
  { slug: 'shoe-box', title: 'Design your shoe box in 3D', kind: 'telescope', d: [33, 20, 12], color: '#F5F5F0' },
  { slug: 'gift-box', title: 'Design your gift box in 3D', kind: 'telescope', d: [20, 20, 10], color: '#2B2B2D' },
  { slug: 'bakery-box', title: 'Design your bakery tray in 3D', kind: 'open', d: [25, 25, 7], color: '#F5F5F0' },
  { slug: 'heavy-duty-box', title: 'Design your heavy-duty carton in 3D', kind: 'rsc', d: [45, 30, 30], color: '#C9A87C' },
  { slug: 'box-sleeve', title: 'Design your box sleeve in 3D', kind: 'sleeve', d: [20, 15, 6], color: '#F5F5F0' },
];

function art({ kind, d: [L, W, H], color }) {
  const P = fitIso([0, 0, 0, L, W, H], { cx: 300, cy: 320, maxW: 420, maxH: 360 });
  const top = shade(color, 0.18);
  const left = color;
  const right = shade(color, -0.16);
  const stroke = shade(color, -0.45);
  const parts = [shadow(P, { x: 0, y: 0, w: L, d: W, pad: Math.max(L, W) * 0.08 })];
  if (kind === 'open' || kind === 'sleeve') {
    parts.push(openBox(P, { x: 0, y: 0, w: L, d: W, h: H, back: 90, front: -90, outer: [left, right], inner: [shade(color, -0.25), shade(color, -0.3), shade(color, -0.35)], flap: [top, top], stroke }));
  } else {
    parts.push(box(P, { x: 0, y: 0, w: L, d: W, h: H, top, left, right, stroke, sw: 1.4, seam: kind === 'rsc', tape: kind === 'rsc' && color === '#C9A87C' }));
    if (kind === 'telescope') {
      const z = H * 0.62;
      parts.push(line3(P, [0, W, z], [L, W, z], { stroke, sw: 1.4 }), line3(P, [L, 0, z], [L, W, z], { stroke, sw: 1.4 }));
    }
    if (kind === 'lid') {
      const z = H * 0.8;
      parts.push(line3(P, [0, W, z], [L, W, z], { stroke, sw: 1.2, op: 0.8 }));
      parts.push(poly(P, [[L * 0.42, W, z], [L * 0.58, W, z], [L * 0.58, W, z - H * 0.25], [L * 0.42, W, z - H * 0.25]], shade(color, -0.08), { stroke, sw: 1 }));
    }
  }
  return svg({ w: 600, h: 630, title: 'Box illustration', body: parts.join(''), bg: false });
}

const font = (f) => pathToFileURL(path.join(root, 'public/fonts', f)).href;
const logo = pathToFileURL(path.join(root, 'src/assets/logo-horizontal.png')).href;
const tmp = fs.mkdtempSync(path.join(root, 'node_modules/.cache-og-'));
const outDir = path.join(root, 'public/og');
fs.mkdirSync(outDir, { recursive: true });

for (const card of CARDS) {
  const artFile = path.join(tmp, `${card.slug}.svg`);
  fs.writeFileSync(artFile, art(card));
  const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Clash;src:url(${font('clash-display-600.woff2')});font-weight:600}
@font-face{font-family:Sat;src:url(${font('satoshi-500.woff2')});font-weight:500}
html,body{margin:0}
.c{position:relative;width:1200px;height:630px;overflow:hidden;background:linear-gradient(180deg,${C.paper50},${C.paper200});font-family:Sat,sans-serif;color:${C.ink800}}
.logo{position:absolute;left:72px;top:60px;height:56px}
.tag{position:absolute;left:72px;top:170px;font:500 22px/1 Sat,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:${C.green600}}
h1{position:absolute;left:72px;top:212px;margin:0;width:560px;font:600 58px/1.06 Clash,sans-serif;letter-spacing:-0.01em}
p{position:absolute;left:72px;bottom:72px;margin:0;font-size:26px;color:${C.ink500}}
.art{position:absolute;right:20px;top:0;width:600px;height:630px}
.bar{position:absolute;left:0;bottom:0;width:100%;height:14px;background:${C.green600}}
</style><div class="c"><img class="logo" src="${logo}" alt=""><div class="tag">Free 3D box designer</div><h1>${card.title}</h1><p>Size · board · your logo · dieline. No sign-up.</p><img class="art" src="${pathToFileURL(artFile).href}" alt=""><div class="bar"></div></div>`;
  const page = path.join(tmp, 'page.html');
  fs.writeFileSync(page, html);
  const out = path.join(outDir, `box-designer-${card.slug}.png`);
  execFileSync(exe, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', '--window-size=1200,630', `--screenshot=${out}`, pathToFileURL(page).href], { stdio: 'ignore', timeout: 60000 });
  console.log('wrote', path.relative(root, out));
}

fs.rmSync(tmp, { recursive: true, force: true });
