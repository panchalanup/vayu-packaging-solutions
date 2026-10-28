/**
 * Renders a PNG thumbnail grid per sticker category with a locally installed Chromium-based browser (Edge/Chrome),
 * so the curated library can be reviewed by eye. Patterns are shown tiled (to check they repeat seamlessly).
 * Usage: node scripts/stickers/contact-sheet.mjs <outDir> [category-filter]
 * SECURITY: only reads our own SVGs from src/assets/stickers; ids are escaped; no network access.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const src = path.join(root, 'src/assets/stickers');
const [outDir, filter] = process.argv.slice(2);
if (!outDir) throw new Error('Usage: contact-sheet.mjs <outDir> [category-filter]');
const browsers = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
];
const exe = browsers.find((b) => fs.existsSync(b));
if (!exe) throw new Error('No Edge/Chrome found');
fs.mkdirSync(outDir, { recursive: true });

const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const COLS = 12;
const PAGE = 120; // items per PNG so each image stays readable

for (const cat of fs.readdirSync(src).filter((c) => !filter || c.includes(filter))) {
  const files = fs.readdirSync(path.join(src, cat)).filter((f) => f.endsWith('.svg')).sort();
  const isPattern = cat === 'patterns';
  for (let page = 0; page * PAGE < files.length; page++) {
    const slice = files.slice(page * PAGE, (page + 1) * PAGE);
    const cell = isPattern ? 220 : 96;
    const cells = slice
      .map((f) => {
        const url = pathToFileURL(path.join(src, cat, f)).href;
        const id = esc(f.replace(/\.svg$/, ''));
        const thumb = isPattern
          ? `<div class="pat" style="background-image:url('${url}')"></div>`
          : `<img src="${url}" alt="">`;
        return `<figure>${thumb}<figcaption>${id}</figcaption></figure>`;
      })
      .join('');
    const cols = isPattern ? 6 : COLS;
    const rows = Math.ceil(slice.length / cols);
    const figH = isPattern ? 250 : 124;
    const width = cols * (cell + 24) + 24;
    const height = rows * figH + 24;
    const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;background:#f4efe6;font:11px/1.2 Arial,sans-serif;color:#222}
.g{display:grid;grid-template-columns:repeat(${cols},${cell + 24}px);padding:12px}
figure{margin:0;width:${cell + 24}px;height:${figH}px;text-align:center}
img{width:${cell}px;height:${cell}px;object-fit:contain;background:#fff;border-radius:8px;padding:0}
.pat{width:${cell}px;height:${cell}px;margin:0 auto;background-color:#fff;background-size:44px 44px;border-radius:8px}
figcaption{margin-top:3px;word-break:break-all}
</style><div class="g">${cells}</div>`;
    const name = `${cat}${files.length > PAGE ? `-${page + 1}` : ''}`;
    const htmlFile = path.join(outDir, `.${name}.html`);
    fs.writeFileSync(htmlFile, html);
    const png = path.join(outDir, `${name}.png`);
    execFileSync(exe, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', `--window-size=${width},${height}`, `--screenshot=${png}`, pathToFileURL(htmlFile).href], { stdio: 'ignore' });
    fs.unlinkSync(htmlFile);
    console.log('wrote', png);
  }
}
