/**
 * Exports crawler-friendly raster copies of the illustrations (Google and social cards do not reliably use SVG):
 *   public/images/products/<slug>.png     1200×900, referenced by Product JSON-LD
 *   public/blog-images/<name>-og.png      1200×630, referenced by blog Open Graph / Twitter tags
 *   scripts/illustrations/.out/og-image.png  1200×630 brand card (git-ignored; convert to public/og-image.jpg, see IMAGE_GUIDE.md)
 * Run: node scripts/illustrations/export-seo.mjs
 * Needs a local Edge or Chrome. SECURITY: reads only our own generated SVGs and public fonts; no network access.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ill = (n) => pathToFileURL(path.join(root, 'src/assets/illustrations', `${n}.svg`)).href;
const exe = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find((b) => fs.existsSync(b));
if (!exe) throw new Error('No Edge/Chrome found');

const only = process.argv[2]; // optional: products | blogs | card
const tmp = fs.mkdtempSync(path.join(root, 'node_modules/.cache-seo-'));
function shot(html, out, w, h) {
  const file = path.join(tmp, 'page.html');
  fs.writeFileSync(file, html);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  execFileSync(exe, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', `--window-size=${w},${h}`, `--screenshot=${out}`, pathToFileURL(file).href], { stdio: 'ignore', timeout: 60000 });
  console.log('wrote', path.relative(root, out));
}
const cover = (src, w, h) => `<!doctype html><meta charset="utf-8"><style>html,body{margin:0}img{display:block;width:${w}px;height:${h}px;object-fit:cover}</style><img src="${src}">`;

// 1) Product images for structured data
const PRODUCTS = ['3-ply', '5-ply', '7-ply', 'die-cut', 'printed', 'food-grade', 'bopp-tape', 'stretch-film', 'bubble-wrap', 'pp-strapping'];
if (!only || only === 'products') for (const slug of PRODUCTS) shot(cover(ill(`product-${slug}`), 1200, 900), path.join(root, `public/images/products/${slug}.png`), 1200, 900);

// 2) Blog Open Graph images (names match src/seo/metadata/blogs.ts)
const BLOGS = {
  'types-of-boxes-og': 'blog-types',
  'walls-og': 'blog-walls',
  'flute-types-og': 'blog-flutes',
  'gsm-guide-og': 'blog-gsm',
  'burst-ect-og': 'blog-burst-ect',
  'measurements-og': 'blog-measure',
  'kraft-paper-og': 'blog-kraft',
  '3d-box-designer-og': 'blog-3d-tool',
};
if (!only || only === 'blogs') for (const [name, svg] of Object.entries(BLOGS)) shot(cover(ill(svg), 1200, 630), path.join(root, `public/blog-images/${name}.png`), 1200, 630);

// 3) Brand card (site-wide fallback OG image)
const font = (f) => pathToFileURL(path.join(root, 'public/fonts', f)).href;
const logo = pathToFileURL(path.join(root, 'src/assets/logo-horizontal.png')).href;
const card = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Clash;src:url(${font('clash-display-600.woff2')});font-weight:600}
@font-face{font-family:Sat;src:url(${font('satoshi-500.woff2')});font-weight:500}
html,body{margin:0}
.c{position:relative;width:1200px;height:630px;overflow:hidden;background:linear-gradient(180deg,#FBF8F3,#E9E1D3);font-family:Sat,sans-serif;color:#17231C}
.art{position:absolute;right:-60px;top:70px;width:640px;height:480px;-webkit-mask-image:radial-gradient(ellipse at 50% 50%,#000 42%,transparent 70%);mask-image:radial-gradient(ellipse at 50% 50%,#000 42%,transparent 70%)}
.logo{position:absolute;left:72px;top:64px;height:64px}
h1{position:absolute;left:72px;top:200px;margin:0;width:560px;font:600 54px/1.08 Clash,sans-serif;letter-spacing:-0.01em}
p{position:absolute;left:72px;top:420px;margin:0;width:500px;font-size:28px;line-height:1.4;color:#4A5A50}
.bar{position:absolute;left:0;bottom:0;width:100%;height:14px;background:#23803A}
</style><div class="c"><img class="logo" src="${logo}" alt=""><h1>Corrugated boxes and packaging supplies</h1><p>3, 5 and 7-ply boxes, custom sizes and print. Ahmedabad.</p><img class="art" src="${ill('product-3-ply')}" alt=""><div class="bar"></div></div>`;
if (!only || only === 'card') shot(card, path.join(root, 'scripts/illustrations/.out/og-image.png'), 1200, 630);

fs.rmSync(tmp, { recursive: true, force: true });
