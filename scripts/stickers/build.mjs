/**
 * Builds the cutout (sticker) library.
 *
 *   node scripts/stickers/build.mjs --fluent <dir containing icons.json from @iconify-json/fluent-emoji-flat>
 *
 * Output (all generated, safe to re-run):
 *   src/assets/stickers/<category>/<id>.svg
 *   src/lib/boxDesigner/stickers/library/<category>.ts   (one lazy manifest per category)
 *   src/lib/boxDesigner/stickers/library/index.ts        (CATEGORIES + loadCategory)
 *
 * Sources: (1) curated Fluent Emoji Flat subset (MIT, Microsoft) read as DATA from --fluent (the downloaded package
 * is never executed); (2) lucide-react icons (ISC); (3) original SVG from gen-*.mjs in this folder.
 * Every SVG is cleaned by `optimise` and rejected by `assertSafe` if it has scripts or external references.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as lucide from 'lucide-react';
import { fileURLToPath } from 'node:url';
import { CATEGORIES, svg, optimise, assertSafe } from './lib.mjs';
import { FLUENT } from './catalog-fluent.mjs';
import { LUCIDE } from './catalog-lucide.mjs';
import { FRUIT_ORIGINALS } from './gen-fruit.mjs';
import { DROP, OUTLINE_OK } from './drop.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const assetsDir = path.join(root, 'src/assets/stickers');
const libDir = path.join(root, 'src/lib/boxDesigner/stickers/library');
const stickersDir = path.join(root, 'src/lib/boxDesigner/stickers');

const argIdx = process.argv.indexOf('--fluent');
const fluentDir = argIdx > 0 ? process.argv[argIdx + 1] : null;
if (!fluentDir) throw new Error('Pass --fluent <dir with icons.json>');
const fluentJson = JSON.parse(fs.readFileSync(path.join(fluentDir, 'icons.json'), 'utf8'));

const optional = async (file, exportName) => {
  const p = path.join(path.dirname(fileURLToPath(import.meta.url)), file);
  if (!fs.existsSync(p)) return [];
  return (await import(pathToUrl(p)))[exportName];
};
const pathToUrl = (p) => new URL(`file:///${p.replace(/\\/g, '/')}`).href;

/** @type {Array<{id:string,name:string,category:string,tags:string[],kind:string,svg:string,source:string}>} */
const items = [];
const add = (it, source) => items.push({ ...it, source });

// 1. Fluent subset
for (const [category, rows] of Object.entries(FLUENT)) {
  for (const [fname, id, name, tags] of rows) {
    const icon = fluentJson.icons[fname];
    if (!icon) throw new Error(`Fluent icon not found: ${fname}`);
    const w = icon.width ?? fluentJson.width ?? 32;
    const h = icon.height ?? fluentJson.height ?? 32;
    add({ id, name, category, tags: tags.split(/\s+/), kind: 'colour', svg: svg(w, h, icon.body) }, 'fluent');
  }
}

// 2. lucide mono icons
for (const [lname, id, name, tags, category] of LUCIDE) {
  if (id.endsWith('-outline') && !OUTLINE_OK.has(category)) continue;
  const Icon = lucide[lname];
  if (!Icon) {
    console.warn('lucide icon missing, skipped:', lname);
    continue;
  }
  let markup = renderToStaticMarkup(createElement(Icon, { size: 96, strokeWidth: 2, color: '#1f2328', absoluteStrokeWidth: false }));
  // strip width/height from the root tag only (child rects need theirs)
  markup = markup.replace(/^<svg [^>]*>/, (tag) => tag.replace(/\s(?:width|height)="[^"]*"/g, '').replace(/^<svg (?!xmlns)/, '<svg xmlns="http://www.w3.org/2000/svg" '));
  add({ id, name, category, tags: tags.split(/\s+/), kind: 'mono', svg: markup.replace(/viewBox="0 0 24 24"/, 'viewBox="0 0 24 24"') }, 'lucide');
}

// 3. originals
for (const it of FRUIT_ORIGINALS) add(it, 'original');
for (const [file, exp] of [['gen-marks.mjs', 'MARKS'], ['gen-badges.mjs', 'BADGES'], ['gen-shapes.mjs', 'SHAPES'], ['gen-patterns.mjs', 'PATTERNS'], ['gen-extras.mjs', 'EXTRAS']]) {
  for (const it of await optional(file, exp)) add(it, 'original');
}

// Clean, validate, de-duplicate, drop rejected items
const seen = new Set();
const catIds = new Set(CATEGORIES.map((c) => c.id));
const final = [];
for (const it of items) {
  if (DROP.has(it.id)) continue;
  if (!catIds.has(it.category)) throw new Error(`Unknown category ${it.category} for ${it.id}`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(it.id)) throw new Error(`Bad id ${it.id}`);
  if (seen.has(it.id)) throw new Error(`Duplicate id ${it.id}`);
  seen.add(it.id);
  const cleaned = optimise(it.svg);
  assertSafe(it.id, cleaned);
  const tags = [...new Set([...it.tags, ...it.name.toLowerCase().split(/[^a-z0-9]+/), ...it.id.split('-')].filter((t) => t.length > 1))];
  final.push({ ...it, svg: cleaned, tags });
}

// Write assets
fs.rmSync(assetsDir, { recursive: true, force: true });
for (const it of final) {
  const dir = path.join(assetsDir, it.category);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${it.id}.svg`), it.svg + '\n');
}

// Write manifests
fs.mkdirSync(libDir, { recursive: true });
for (const f of fs.readdirSync(libDir)) if (f.endsWith('.ts') && f !== 'types.ts') fs.unlinkSync(path.join(libDir, f));
const constName = (id) => id.toUpperCase().replace(/-/g, '_');
const typesImport = '../types';
const q = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const counts = {};
for (const cat of CATEGORIES) {
  const list = final.filter((i) => i.category === cat.id);
  counts[cat.id] = list.length;
  const lines = list.map(
    (i) =>
      `  { id: ${q(i.id)}, name: ${q(i.name)}, category: ${q(i.category)}, tags: [${i.tags.map(q).join(', ')}], kind: ${q(i.kind)}, src: new URL('../../../../assets/stickers/${i.category}/${i.id}.svg', import.meta.url).href },`,
  );
  const body = `/** GENERATED by scripts/stickers/build.mjs. Do not edit by hand; edit the catalogs in scripts/stickers and re-run. */\nimport type { StickerDef } from '${typesImport}';\n\nexport const ${constName(cat.id)}: StickerDef[] = [\n${lines.join('\n')}\n];\n`;
  fs.writeFileSync(path.join(libDir, `${cat.id}.ts`), body);
}

// index.ts
const loaders = CATEGORIES.map((c) => `  ${q(c.id)}: () => import('./${c.id}').then((m) => m.${constName(c.id)}),`).join('\n');
const catList = CATEGORIES.map((c, i) => `  { id: ${q(c.id)}, label: ${q(c.label)}, order: ${i + 1} },`).join('\n');
const index = `/**
 * Cutout (sticker) library. README
 *
 * - One manifest module per category (./<category>.ts, GENERATED by scripts/stickers/build.mjs) exports
 *   \`<CATEGORY>: StickerDef[]\`. Manifests are loaded on demand with loadCategory(); nothing in this folder is
 *   imported eagerly, so the designer bundle does not grow. This file is cheap to import (labels and loaders only).
 * - \`StickerDef.src\` is a plain URL string built with \`new URL('<relative svg path>', import.meta.url).href\`.
 *   Vite turns that into a hashed asset URL (small SVGs under the inline limit become data URIs inside the lazy
 *   category chunk). Because the manifest is already lazy, \`src\` itself is a string, not a function: use it as an
 *   <img src> or Image().src directly. Each SVG has a viewBox and no width/height, so it scales to any size.
 * - kind 'colour': multi-colour artwork. 'mono': one colour on transparent (tint-friendly). 'pattern': a seamless
 *   square tile (single colour on transparent) meant to be repeated.
 * - Artwork credits (Fluent Emoji, Lucide) live in src/content/imageCredits.ts and are shown on /image-credits.
 * - To add or change items edit the catalogs in scripts/stickers and re-run:
 *     node scripts/stickers/build.mjs --fluent <dir with icons.json from @iconify-json/fluent-emoji-flat>
 */
import type { StickerDef } from '${typesImport}';
import type { CategoryId } from './types';

export type { CategoryId } from './types';

export interface StickerCategory {
  id: CategoryId;
  label: string;
  /** Display order, ascending */
  order: number;
}

export const CATEGORIES: readonly StickerCategory[] = [
${catList}
];

const LOADERS: Record<CategoryId, () => Promise<StickerDef[]>> = {
${loaders}
};

const cache = new Map<CategoryId, Promise<StickerDef[]>>();

/** Lazily load one category manifest (cached). */
export function loadCategory(id: CategoryId): Promise<StickerDef[]> {
  let p = cache.get(id);
  if (!p) {
    p = LOADERS[id]();
    cache.set(id, p);
  }
  return p;
}

/** Load every category (for search across the whole library). Still lazy: call it on first search focus. */
export async function loadAllCategories(): Promise<StickerDef[]> {
  const lists = await Promise.all(CATEGORIES.map((c) => loadCategory(c.id)));
  return lists.flat();
}
`;
fs.writeFileSync(path.join(libDir, 'index.ts'), index);

// types.ts: category ids for the library; StickerDef itself comes from the sticker engine (../types.ts)
const typesFile = path.join(libDir, 'types.ts');
const catUnion = CATEGORIES.map((c) => q(c.id)).join(' | ');
fs.writeFileSync(
  typesFile,
  `/** GENERATED by scripts/stickers/build.mjs. Library category ids; StickerDef lives in ../types.ts (sticker engine). */\nexport type CategoryId = ${catUnion};\n`,
);

let bytes = 0;
for (const it of final) bytes += Buffer.byteLength(it.svg);
const bySource = {};
for (const it of final) bySource[it.source] = (bySource[it.source] ?? 0) + 1;
console.log('items', final.length, 'bytes', bytes, 'by category', counts, 'by source', bySource);
