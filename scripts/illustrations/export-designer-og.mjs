/**
 * Share cards (1200×630 PNG) for the 3D box designer landing pages (#34): public/og/box-designer-<slug>.png
 * Original isometric box art from lib.mjs (no photos, no AI images) + the page title in the brand fonts.
 * Run: node scripts/illustrations/export-designer-og.mjs [slug ...]   (needs a local Edge or Chrome, like export-seo.mjs;
 * with slugs it renders only those cards, otherwise all of them)
 * Keep CARDS in step with src/content/designerLandings.ts.
 * SECURITY: build-time only; reads our own fonts and logo, no network access.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
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
  // Phase 2 styles. `cut` adds drawn cut-outs: window (lid film), hand (hand holes), vents (vent slots)
  { slug: 'carry-box', title: 'Design your carry box with hand holes in 3D', kind: 'rsc', d: [40, 30, 25], color: '#C9A87C', cut: ['hand'] },
  { slug: 'fruit-box', title: 'Design your fruit and produce box in 3D', kind: 'rsc', d: [40, 30, 20], color: '#C9A87C', cut: ['vents', 'hand'] },
  { slug: 'tuck-end-box', title: 'Design your tuck-end box in 3D', kind: 'rsc', d: [12, 8, 14], color: '#F5F5F0' },
  { slug: 'crash-lock-box', title: 'Design your crash-lock bottom box in 3D', kind: 'rsc', d: [20, 15, 25], color: '#F5F5F0' },
  { slug: 'cake-box', title: 'Design your cake box with a window in 3D', kind: 'lid', d: [25, 25, 12], color: '#F5F5F0', cut: ['window'] },
  { slug: 'window-mailer-box', title: 'Design your window mailer box in 3D', kind: 'lid', d: [28, 22, 7], color: '#F5F5F0', cut: ['window'] },
  { slug: 'takeaway-box', title: 'Design your takeaway clamshell box in 3D', kind: 'lid', d: [20, 18, 8], color: '#C9A87C' },
  { slug: 'display-tray', title: 'Design your shelf display tray in 3D', kind: 'open', d: [30, 20, 12], color: '#C9A87C' },
  { slug: 'slide-box', title: 'Design your slide box in 3D', kind: 'telescope', d: [22, 16, 6], color: '#F5F5F0' },
  { slug: 'book-box', title: 'Design your book-style flip-lid box in 3D', kind: 'lid', d: [28, 20, 6], color: '#2B2B2D' },
];
const only = process.argv.slice(2);
const todo = only.length ? CARDS.filter((c) => only.includes(c.slug)) : CARDS;

function art({ kind, d: [L, W, H], color, cut = [] }) {
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
  // Cut-outs are drawn on the walls: front wall is the plane y = W, side wall is the plane x = L
  if (cut.includes('window')) {
    parts.push(poly(P, [[L * 0.2, W * 0.2, H], [L * 0.8, W * 0.2, H], [L * 0.8, W * 0.8, H], [L * 0.2, W * 0.8, H]], '#DCE8EE', { stroke, sw: 1, op: 0.9 }));
  }
  if (cut.includes('hand')) {
    parts.push(poly(P, [[L, W * 0.3, H * 0.62], [L, W * 0.7, H * 0.62], [L, W * 0.7, H * 0.82], [L, W * 0.3, H * 0.82]], shade(color, -0.55), { stroke, sw: 1 }));
  }
  if (cut.includes('vents')) {
    for (const k of [0.2, 0.4, 0.6]) {
      parts.push(poly(P, [[L * k, W, H * 0.3], [L * (k + 0.12), W, H * 0.3], [L * (k + 0.12), W, H * 0.55], [L * k, W, H * 0.55]], shade(color, -0.55), { stroke, sw: 1 }));
    }
  }
  return svg({ w: 600, h: 630, title: 'Box illustration', body: parts.join(''), bg: false });
}

const font = (f) => pathToFileURL(path.join(root, 'public/fonts', f)).href;
const logo = pathToFileURL(path.join(root, 'src/assets/logo-horizontal.png')).href;
const tmp = fs.mkdtempSync(path.join(root, 'node_modules/.cache-og-'));
const outDir = path.join(root, 'public/og');
fs.mkdirSync(outDir, { recursive: true });

/** Headless Edge can stay open after it has written the screenshot, so wait for the file, then stop our own process */
async function shoot(out, page) {
  const child = spawn(exe, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', '--window-size=1200,630', `--screenshot=${out}`, pathToFileURL(page).href], { stdio: 'ignore' });
  let exited = false;
  child.on('exit', () => (exited = true));
  let last = -1;
  for (let i = 0; i < 100; i++) {
    await new Promise((r) => setTimeout(r, 300));
    const size = fs.existsSync(out) ? fs.statSync(out).size : 0;
    // done when the file stopped growing, or the browser exited
    if (size > 0 && (size === last || exited)) break;
    if (exited && size === 0) break;
    last = size;
  }
  child.kill();
  if (!fs.existsSync(out) || fs.statSync(out).size === 0) throw new Error(`No screenshot written for ${out}`);
}

for (const card of todo) {
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
  fs.rmSync(out, { force: true });
  await shoot(out, page);
  console.log('wrote', path.relative(root, out));
}

fs.rmSync(tmp, { recursive: true, force: true });
