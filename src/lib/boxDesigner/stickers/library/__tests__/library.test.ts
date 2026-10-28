/**
 * Cutout library integrity: unique stable ids, every file exists, no scripts or external references in any SVG,
 * searchable tags, no certification-style claims, seamless-pattern tiles, size budget, and nothing imported eagerly.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { CATEGORIES, loadAllCategories, loadCategory } from '../index';
import type { StickerDef } from '../../types';

const root = path.resolve(__dirname, '../../../../../..');
const assets = path.join(root, 'src/assets/stickers');
const srcDir = path.join(root, 'src');

const allFiles = (): { cat: string; file: string; full: string }[] =>
  fs.readdirSync(assets).flatMap((cat) =>
    fs
      .readdirSync(path.join(assets, cat))
      .map((file) => ({ cat, file, full: path.join(assets, cat, file) })),
  );

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : [p];
  });

describe('sticker library', () => {
  let defs: StickerDef[] = [];
  it('loads every category', async () => {
    defs = await loadAllCategories();
    expect(defs.length).toBeGreaterThanOrEqual(250);
    for (const c of CATEGORIES) expect((await loadCategory(c.id)).length).toBeGreaterThan(0);
  });

  it('has unique, kebab-case ids and valid fields', () => {
    const seen = new Set<string>();
    const cats = new Set(CATEGORIES.map((c) => c.id as string));
    for (const d of defs) {
      expect(d.id, d.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(seen.has(d.id), `duplicate id ${d.id}`).toBe(false);
      seen.add(d.id);
      expect(d.name.trim().length, d.id).toBeGreaterThan(0);
      expect(cats.has(d.category), `${d.id} category ${d.category}`).toBe(true);
      expect(['colour', 'mono', 'pattern']).toContain(d.kind);
      expect(typeof d.src, d.id).toBe('string');
      expect(d.src.length, d.id).toBeGreaterThan(0);
    }
  });

  it('has non-empty lowercase tags', () => {
    for (const d of defs) {
      expect(d.tags.length, d.id).toBeGreaterThan(0);
      for (const t of d.tags) {
        expect(t, `${d.id} tag`).toBe(t.toLowerCase());
        expect(t.trim().length, `${d.id} tag`).toBeGreaterThan(0);
      }
    }
  });

  it('covers the required categories and fruit and vegetable items', () => {
    const count = (c: string) => defs.filter((d) => d.category === c).length;
    expect(count('fruits-veg')).toBeGreaterThanOrEqual(40);
    expect(CATEGORIES.length).toBeGreaterThanOrEqual(12);
    const ids = new Set(defs.map((d) => d.id));
    for (const id of [
      'mango', 'apple', 'banana', 'orange', 'grapes', 'strawberry', 'watermelon', 'pineapple', 'lemon', 'cherry', 'pear', 'peach',
      'coconut', 'pomegranate', 'papaya', 'guava', 'chikoo', 'tomato', 'carrot', 'chilli', 'corn', 'potato', 'onion', 'brinjal', 'broccoli', 'leaf',
    ]) {
      expect(ids.has(id), `missing ${id}`).toBe(true);
    }
    expect(defs.filter((d) => d.kind === 'pattern').length).toBeGreaterThanOrEqual(12);
    expect(defs.find((d) => d.id === 'mango')?.tags).toContain('aam');
  });

  it('points every manifest entry at an existing svg, with no orphan files', () => {
    const expected = new Set<string>();
    for (const d of defs) {
      const m = d.src.match(/stickers\/([a-z0-9-]+)\/([a-z0-9-]+)\.svg/);
      expect(m, `${d.id} src ${d.src.slice(0, 60)}`).toBeTruthy();
      expect(m![1]).toBe(d.category);
      expect(m![2]).toBe(d.id);
      const file = path.join(assets, d.category, `${d.id}.svg`);
      expect(fs.existsSync(file), `${d.id} file missing`).toBe(true);
      expected.add(file);
    }
    for (const f of allFiles()) expect(expected.has(f.full), `orphan ${f.cat}/${f.file}`).toBe(true);
  });

  it('keeps every svg free of scripts and external references, and small', () => {
    let total = 0;
    for (const { cat, file, full } of allFiles()) {
      const s = fs.readFileSync(full, 'utf8');
      const name = `${cat}/${file}`;
      total += Buffer.byteLength(s);
      expect(Buffer.byteLength(s), `${name} size`).toBeLessThan(14 * 1024);
      expect(s, name).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" [^>]*viewBox="[^"]+"/);
      expect(/<\s*script/i.test(s), `${name} script`).toBe(false);
      expect(/\son[a-z]+\s*=/i.test(s), `${name} handler`).toBe(false);
      expect(/<\s*(image|foreignObject|iframe|object|embed|a|animate|set|style)\b/i.test(s), `${name} element`).toBe(false);
      expect(/(?:xlink:)?href\s*=\s*"(?!#)/i.test(s), `${name} external href`).toBe(false);
      expect(/https?:\/\//i.test(s.replace('http://www.w3.org/2000/svg', '')), `${name} url`).toBe(false);
      expect(/url\(\s*['"]?(?!#)/i.test(s), `${name} url()`).toBe(false);
      expect(/@import|javascript:|data:/i.test(s), `${name} import/js/data`).toBe(false);
    }
    expect(total, 'total svg bytes').toBeLessThan(1.5 * 1024 * 1024);
  });

  it('keeps every svg well-formed XML (images fail to load otherwise)', () => {
    const parser = new DOMParser();
    for (const { cat, file, full } of allFiles()) {
      const doc = parser.parseFromString(fs.readFileSync(full, 'utf8'), 'image/svg+xml');
      expect(doc.getElementsByTagName('parsererror').length, `${cat}/${file}`).toBe(0);
      expect(doc.documentElement.tagName, `${cat}/${file}`).toBe('svg');
    }
  });

  it('makes pattern tiles square', () => {
    for (const d of defs.filter((x) => x.kind === 'pattern')) {
      const s = fs.readFileSync(path.join(assets, d.category, `${d.id}.svg`), 'utf8');
      const m = s.match(/viewBox="0 0 (\d+) (\d+)"/);
      expect(m, d.id).toBeTruthy();
      expect(m![1], d.id).toBe(m![2]);
    }
  });

  it('makes no certification or quality-mark claims', () => {
    const banned = /\b(organic|vegan|certified|certification|food[- ]?grade|iso|fssai|halal|kosher|fda|gmp|eco[- ]?friendly|biodegradable|recyclable|compostable|bio)\b/i;
    for (const d of defs) {
      expect(banned.test(`${d.name} ${d.tags.join(' ')}`), `${d.id} wording`).toBe(false);
      if (d.category === 'badges-labels' || d.category === 'shipping-marks') {
        const s = fs.readFileSync(path.join(assets, d.category, `${d.id}.svg`), 'utf8');
        expect(banned.test(s.replace(/<[^>]+>/g, ' ')), `${d.id} text`).toBe(false);
      }
    }
  });

  it('is never imported eagerly by app code', () => {
    const offenders: string[] = [];
    for (const f of walk(srcDir)) {
      if (!/\.(ts|tsx)$/.test(f) || f.includes(`${path.sep}stickers${path.sep}library${path.sep}`) || /\.test\.tsx?$/.test(f)) continue;
      const s = fs.readFileSync(f, 'utf8');
      // static imports of a manifest or of the library index (dynamic import() and import.meta.glob are fine)
      if (/^\s*(import|export)\s[^;]*from\s+['"][^'"]*stickers\/library(\/[^'"]*)?['"]/m.test(s)) offenders.push(path.relative(root, f));
      if (/^\s*import\s+['"][^'"]*assets\/stickers/m.test(s) || /^\s*import\s[^;]*from\s+['"][^'"]*assets\/stickers/m.test(s)) offenders.push(path.relative(root, f));
    }
    expect(offenders).toEqual([]);
  });
});
