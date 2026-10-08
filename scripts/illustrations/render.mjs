/**
 * Rasterises illustration SVGs to PNG with a locally installed Chromium-based browser (Edge/Chrome).
 * Usage: node scripts/illustrations/render.mjs <outDir> <width> [name-filter]
 * Used for previews and for the crawler-friendly raster copies referenced by SEO schema / OG tags.
 * SECURITY: only reads our own generated SVGs from src/assets/illustrations; no network access.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const src = path.join(root, 'src/assets/illustrations');
const [outDir, widthArg = '1200', filter] = process.argv.slice(2);
const browsers = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
];
const exe = browsers.find((b) => fs.existsSync(b));
if (!exe) throw new Error('No Edge/Chrome found');
fs.mkdirSync(outDir, { recursive: true });
for (const file of fs.readdirSync(src).filter((n) => n.endsWith('.svg') && (!filter || n.includes(filter)))) {
  const svg = fs.readFileSync(path.join(src, file), 'utf8');
  const [, w, h] = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  const width = Number(widthArg);
  const height = Math.round((width * Number(h)) / Number(w));
  const html = path.join(outDir, `.${file}.html`);
  fs.writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>html,body{margin:0}img{display:block;width:${width}px;height:${height}px}</style><img src="${pathToFileURL(path.join(src, file))}">`);
  const png = path.join(outDir, file.replace(/\.svg$/, '.png'));
  execFileSync(exe, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', `--window-size=${width},${height}`, `--screenshot=${png}`, pathToFileURL(html).href], { stdio: 'ignore' });
  fs.unlinkSync(html);
}
console.log('rendered', fs.readdirSync(outDir).filter((n) => n.endsWith('.png')).length, 'png');
