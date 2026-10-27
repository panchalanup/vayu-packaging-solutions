import { describe, expect, it, vi } from 'vitest';
import { MAX_STICKERS, type BoxDesign, type StickerPlacement } from '@/types/boxDesigner';
import {
  DEFAULT_DESIGN,
  DESIGN_SCHEMA_VERSION,
  MAX_SHARE_CHARS,
  compactStickers,
  decodeShareHash,
  encodeShareHash,
  encodeShareHashDetailed,
  expandStickers,
  parseDesign,
  serializeDesign,
} from '../designCodec';
import { makeSticker, moveLayer, duplicateSticker, applyToAllFaces, tintAll, clampSticker, stickerBoxPx, canAddStickers } from '../stickers/placement';
import { MAX_PATTERN_TILES, patternStep, patternTiles } from '../stickers/pattern';
import { matchStickers, pickRecommended, recommendedCategories } from '../stickers/search';
import { createStickerRegistry, normaliseManifest, stickerRegistry } from '../stickers/registry';
import { applyTint, sizeBucket, withExplicitSize } from '../stickers/image';
import { generateSurprise, seededRandom } from '../stickers/surprise';
import { STICKER_PALETTES, paletteFor } from '../stickers/palettes';
import { runPrintChecks, stickerPrintBox } from '../printChecks';
import { countPrintColours } from '../pricing';
import { printContentKey } from '../textures/printLayer';
import type { StickerDef } from '../stickers/types';

const sticker = (over: Partial<StickerPlacement> = {}): StickerPlacement => ({ ...makeSticker('fruit-mango', 'front'), ...over });
const design = (over: Partial<BoxDesign> = {}): BoxDesign => ({ ...DEFAULT_DESIGN, ...over });

const LIB: StickerDef[] = [
  { id: 'mango', name: 'Mango', category: 'fruits-veg', tags: ['fruit', 'aam', 'summer'], kind: 'colour', src: '/m.svg' },
  { id: 'apple', name: 'Apple', category: 'fruits-veg', tags: ['fruit', 'seb'], kind: 'colour', src: '/a.svg' },
  { id: 'cake', name: 'Cake slice', category: 'bakery-food', tags: ['dessert', 'sweet'], kind: 'colour', src: '/c.svg' },
  { id: 'phone', name: 'Phone', category: 'contact-icons', tags: ['call'], kind: 'mono', src: '/p.svg' },
  { id: 'dots', name: 'Dots', category: 'patterns', tags: ['polka'], kind: 'pattern', src: '/d.svg' },
  { id: 'fragile', name: 'Fragile', category: 'shipping-marks', tags: ['glass', 'handle with care'], kind: 'mono', src: '/f.svg' },
];

describe('schema v3 codec', () => {
  it('round-trips stickers and options through JSON', () => {
    const d = design({
      stickers: [sticker({ tint: '#AA3300', flip: true, opacity: 0.5, rotation: -30 }), sticker({ face: 'left', pattern: { spacing: 0.4, angle: 30, stagger: true } })],
      options: { handHoles: true, vents: false, window: true, windowRatio: 0.5, frontCut: 0 },
    });
    const parsed = parseDesign(serializeDesign(d, { includeImages: true }));
    expect(parsed).not.toBeNull();
    expect(parsed!.stickers).toEqual(d.stickers);
    expect(parsed!.options.handHoles).toBe(true);
    expect(parsed!.options.window).toBe(true);
    expect(parsed!.options.windowRatio).toBe(0.5);
  });

  it('is at version 3 and still loads v1 and v2 files (no stickers, default options)', () => {
    expect(DESIGN_SCHEMA_VERSION).toBe(3);
    const base = JSON.parse(serializeDesign(DEFAULT_DESIGN, { includeImages: false }));
    delete base.stickers;
    delete base.options;
    for (const v of [1, 2]) {
      const parsed = parseDesign(JSON.stringify({ ...base, v }));
      expect(parsed).not.toBeNull();
      expect(parsed!.stickers).toEqual([]);
      expect(parsed!.options).toEqual(DEFAULT_DESIGN.options);
    }
  });

  it('rejects malformed stickers and caps their number', () => {
    const base = JSON.parse(serializeDesign(DEFAULT_DESIGN, { includeImages: false }));
    const bad = (patch: Partial<StickerPlacement>) => parseDesign(JSON.stringify({ ...base, stickers: [{ ...sticker(), ...patch }] }));
    expect(bad({ scale: 99 })).toBeNull();
    expect(bad({ opacity: 0 })).toBeNull();
    expect(bad({ tint: 'red' })).toBeNull();
    expect(bad({ stickerId: '../../etc/passwd' })).toBeNull();
    expect(bad({ face: 'nope' as never })).toBeNull();
    expect(bad({ position: { x: 3, y: 0 } })).toBeNull();
    const many = Array.from({ length: MAX_STICKERS + 1 }, () => sticker());
    expect(parseDesign(JSON.stringify({ ...base, stickers: many }))).toBeNull();
    expect(parseDesign(JSON.stringify({ ...base, options: { windowRatio: 5 } }))).toBeNull();
  });
});

describe('share links with stickers', () => {
  it('carries stickers in a compact form and restores them', () => {
    const d = design({ stickers: [sticker({ tint: '#112233', flip: true, locked: true, rotation: 12, scale: 0.4567, position: { x: 0.123456, y: 0.9 } }), sticker({ face: 'back', pattern: { spacing: 0.5, angle: -15, stagger: true } })] });
    const decoded = decodeShareHash(encodeShareHash(d));
    expect(decoded).not.toBeNull();
    expect(decoded!.stickers).toHaveLength(2);
    expect(decoded!.stickers[0]).toMatchObject({ stickerId: 'fruit-mango', face: 'front', tint: '#112233', flip: true, locked: true, rotation: 12, scale: 0.457 });
    expect(decoded!.stickers[0].position.x).toBeCloseTo(0.123, 3);
    expect(decoded!.stickers[1].pattern).toEqual({ spacing: 0.5, angle: -15, stagger: true });
    // compact tuples are much smaller than the object form
    expect(JSON.stringify(compactStickers(d.stickers)).length).toBeLessThan(JSON.stringify(d.stickers).length / 2);
  });

  it('never exceeds the share limit: drops the least important data and still decodes', () => {
    const stickers = Array.from({ length: MAX_STICKERS }, (_, i) =>
      sticker({ stickerId: `very-long-sticker-identifier-number-${i}`, face: i % 2 ? 'front' : 'back', tint: '#abcdef', position: { x: Math.random(), y: Math.random() } })
    );
    const texts = Array.from({ length: 40 }, (_, i) => ({
      id: `t${i}`, face: 'front' as const, text: 'Handmade with care in Ahmedabad '.repeat(4), font: 'Inter', size: 24, color: '#111111', position: { x: 0.5, y: 0.5 }, rotation: 0, align: 'center' as const,
    }));
    const d = design({ stickers, textElements: texts, name: 'My big design' });
    const result = encodeShareHashDetailed(d);
    expect(result.hash.length - '#design='.length).toBeLessThanOrEqual(MAX_SHARE_CHARS);
    expect(result.droppedStickers + result.droppedTexts).toBeGreaterThan(0);
    const back = decodeShareHash(result.hash);
    expect(back).not.toBeNull();
    expect(back!.dimensions).toEqual(d.dimensions);
    expect(back!.stickers.length).toBe(stickers.length - result.droppedStickers);
  });

  it('keeps patterns longer than single stickers when it has to drop', () => {
    const singles = Array.from({ length: 60 }, (_, i) => sticker({ stickerId: `s-${'x'.repeat(60)}-${i}` }));
    const pattern = sticker({ stickerId: 'pat', face: 'left', pattern: { spacing: 0.3, angle: 0, stagger: false } });
    const d = design({ stickers: [pattern, ...singles], textElements: Array.from({ length: 50 }, (_, i) => ({ id: `t${i}`, face: 'front' as const, text: 'x'.repeat(200), font: 'Inter', size: 20, color: '#111111', position: { x: 0.5, y: 0.5 }, rotation: 0, align: 'left' as const })) });
    const result = encodeShareHashDetailed(d);
    const back = decodeShareHash(result.hash)!;
    expect(back).not.toBeNull();
    if (back.stickers.length > 0) expect(back.stickers.some((s) => s.pattern)).toBe(true);
  });

  it('a small design is not trimmed', () => {
    const r = encodeShareHashDetailed(design({ stickers: [sticker()], name: 'Keep me' }));
    expect(r).toMatchObject({ droppedStickers: 0, droppedTexts: 0, nameDropped: false });
    expect(decodeShareHash(r.hash)!.name).toBe('Keep me');
  });

  it('drops invalid entries in a hand-edited link instead of failing', () => {
    expect(expandStickers([['ok-id', 'front', 0.5, 0.5, 0.3, 0, 0, 1, null, 0, null], ['bad id!', 'front', 0.5, 0.5, 0.3, 0, 0, 1, null, 0, null], 'junk', [1, 2]])).toHaveLength(1);
    expect(expandStickers('nope')).toEqual([]);
  });

  it('old links without stickers still open', () => {
    const base = JSON.parse(serializeDesign(DEFAULT_DESIGN, { includeImages: false }));
    delete base.stickers;
    delete base.options;
    base.v = 2;
    const hash = '#design=' + btoa(JSON.stringify(base)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(decodeShareHash(hash)!.stickers).toEqual([]);
  });
});

describe('pattern maths', () => {
  const pattern = { spacing: 0.5, angle: 0, stagger: false };
  it('step is size times (1 + spacing)', () => {
    expect(patternStep(100, 0.5)).toBe(150);
    expect(patternStep(100, -3)).toBe(100);
  });
  it('covers the surface evenly with no angle', () => {
    const { tiles, step } = patternTiles(600, 400, 100, pattern);
    expect(step).toBe(150);
    expect(tiles.some((t) => t.x < 100 && t.y < 100)).toBe(true);
    expect(tiles.some((t) => t.x > 500 && t.y > 300)).toBe(true);
    // neighbours on a row are exactly one step apart
    const row = tiles.filter((t) => Math.abs(t.y - tiles[0].y) < 1).sort((a, b) => a.x - b.x);
    expect(row[1].x - row[0].x).toBeCloseTo(150, 5);
  });
  it('staggers every other row by half a step', () => {
    const { tiles } = patternTiles(600, 400, 100, { ...pattern, stagger: true });
    const ys = [...new Set(tiles.map((t) => Math.round(t.y)))].sort((a, b) => a - b);
    const xsAt = (y: number) => tiles.filter((t) => Math.round(t.y) === y).map((t) => t.x).sort((a, b) => a - b);
    const a = xsAt(ys[1])[0];
    const b = xsAt(ys[2])[0];
    expect(Math.abs(((a - b) % 150) + 150) % 150).toBeCloseTo(75, 3);
  });
  it('rotating the grid still covers the corners', () => {
    const { tiles } = patternTiles(600, 400, 100, { ...pattern, angle: 45 });
    for (const [cx, cy] of [[50, 50], [550, 50], [50, 350], [550, 350]]) {
      expect(tiles.some((t) => Math.hypot(t.x - cx, t.y - cy) < 110)).toBe(true);
    }
  });
  it('moves with the phase and respects the tile cap', () => {
    const a = patternTiles(600, 400, 100, pattern, { x: 0.5, y: 0.5 }).tiles[0];
    const b = patternTiles(600, 400, 100, pattern, { x: 0.6, y: 0.5 }).tiles.find((t) => Math.abs(t.y - a.y) < 1)!;
    expect(Math.abs(b.x - a.x) % 150).not.toBe(0);
    const dense = patternTiles(2000, 2000, 4, { spacing: 0, angle: 20, stagger: true });
    expect(dense.tiles.length).toBeLessThanOrEqual(MAX_PATTERN_TILES);
    expect(dense.tiles.length).toBeGreaterThan(100);
  });
  it('handles empty input', () => {
    expect(patternTiles(0, 100, 10, pattern).tiles).toEqual([]);
    expect(patternTiles(100, 100, 0, pattern).tiles).toEqual([]);
  });
});

describe('search and recommendations', () => {
  it('finds by name, tag (including transliterations) and category', () => {
    expect(matchStickers(LIB, 'mango').map((s) => s.id)[0]).toBe('mango');
    expect(matchStickers(LIB, 'aam').map((s) => s.id)).toEqual(['mango']);
    expect(matchStickers(LIB, 'sweet').map((s) => s.id)).toEqual(['cake']);
    expect(matchStickers(LIB, 'fruit').map((s) => s.id).sort()).toEqual(['apple', 'mango']);
  });
  it('requires every word to match and ignores case and accents', () => {
    expect(matchStickers(LIB, 'FRUIT seb').map((s) => s.id)).toEqual(['apple']);
    expect(matchStickers(LIB, 'fruit zzz')).toEqual([]);
    expect(matchStickers(LIB, 'Mängo').map((s) => s.id)).toEqual(['mango']);
  });
  it('ranks exact name matches first and filters by category and kind', () => {
    expect(matchStickers(LIB, 'phone')[0].id).toBe('phone');
    expect(matchStickers(LIB, '', { category: 'bakery-food' }).map((s) => s.id)).toEqual(['cake']);
    expect(matchStickers(LIB, '', { kind: 'mono' }).map((s) => s.id).sort()).toEqual(['fragile', 'phone']);
    expect(matchStickers(LIB)).toHaveLength(LIB.length);
  });
  it('recommends by style and template category, round-robin, never patterns', () => {
    expect(recommendedCategories('rsc')[0]).toBe('shipping-marks');
    expect(recommendedCategories('rsc', 'Fruit & produce')[0]).toBe('fruits-veg');
    expect(recommendedCategories('pizza')[0]).toBe('bakery-food');
    const rec = pickRecommended(LIB, 'tray', 'food', 4).map((s) => s.id);
    expect(rec).toContain('cake');
    expect(rec).toContain('mango');
    expect(rec).not.toContain('dots');
    // nothing matches: fall back to the library
    expect(pickRecommended([LIB[3]], 'tray', null, 3)).toHaveLength(1);
  });
});

describe('registry', () => {
  it('lists categories without loading, loads lazily and looks stickers up', async () => {
    const load = vi.fn(async () => ({ default: [LIB[0], LIB[1]] }));
    const other = vi.fn(async () => [LIB[2]]);
    const reg = createStickerRegistry({ 'fruits-veg': load, 'bakery-food': other });
    expect(reg.listCategories().map((c) => c.id)).toEqual(['fruits-veg', 'bakery-food']);
    expect(load).not.toHaveBeenCalled();
    expect(reg.getSticker('mango')).toBeUndefined();
    await reg.loadCategory('fruits-veg');
    expect(load).toHaveBeenCalledTimes(1);
    expect(other).not.toHaveBeenCalled();
    expect(reg.getSticker('mango')?.name).toBe('Mango');
    expect((await reg.loadSticker('cake'))?.id).toBe('cake');
    expect(reg.listCategories().find((c) => c.id === 'bakery-food')?.count).toBe(1);
    expect(await reg.loadSticker('missing')).toBeUndefined();
    await reg.loadCategory('fruits-veg');
    expect(load).toHaveBeenCalledTimes(1);
    expect(reg.searchStickers('cake').map((s) => s.id)).toEqual(['cake']);
  });
  it('survives a failing category', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const reg = createStickerRegistry({ broken: () => Promise.reject(new Error('boom')), ok: async () => [LIB[0]] });
    await reg.loadAll();
    expect(reg.getSticker('mango')).toBeDefined();
  });
  it('sanitises manifests: bad ids, unsafe sources and duplicates are dropped', () => {
    const list = normaliseManifest(
      { default: [LIB[0], { ...LIB[1], src: 'javascript:alert(1)' }, { ...LIB[2], id: 'bad id' }, LIB[0], { id: 'x', src: '/x.svg', kind: 'weird' }, null] },
      'cat'
    );
    expect(list.map((s) => s.id)).toEqual(['mango', 'x']);
    expect(list[1]).toMatchObject({ category: 'cat', kind: 'colour', name: 'x', tags: [] });
    expect(normaliseManifest({ FRUITS: [LIB[0]] }, 'c')).toHaveLength(1);
    expect(normaliseManifest('nope', 'c')).toEqual([]);
  });
  it('the real registry loads at least the placeholder pack with usable sources', async () => {
    const all = await stickerRegistry.loadAll();
    expect(all.length).toBeGreaterThanOrEqual(12);
    expect(all.every((s) => s.src.length > 0 && s.id.length > 0)).toBe(true);
    expect(stickerRegistry.listCategories().length).toBeGreaterThan(0);
  });
});

describe('tint pipeline', () => {
  it('fills with source-in so the colour keeps the sticker alpha', () => {
    const calls: string[] = [];
    const ctx = {
      globalCompositeOperation: 'source-over' as GlobalCompositeOperation,
      fillStyle: '' as string | CanvasGradient | CanvasPattern,
      save: () => calls.push('save'),
      restore: () => calls.push('restore'),
      fillRect: vi.fn(function (this: unknown) {
        calls.push(`fill:${ctx.globalCompositeOperation}:${String(ctx.fillStyle)}`);
      }),
    };
    applyTint(ctx, 64, 32, '#ff0000');
    expect(calls).toEqual(['save', 'fill:source-in:#ff0000', 'restore']);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 64, 32);
  });
  it('falls back to black for anything that is not a hex colour', () => {
    const ctx = { globalCompositeOperation: 'source-over' as GlobalCompositeOperation, fillStyle: '' as string | CanvasGradient | CanvasPattern, save() {}, restore() {}, fillRect() {} };
    applyTint(ctx, 8, 8, 'url(javascript:1)');
    expect(ctx.fillStyle).toBe('#000000');
  });
  it('gives viewBox-only SVGs an explicit size so the aspect ratio is dependable', () => {
    const sized = withExplicitSize('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"><path d="M0 0"/></svg>')!;
    expect(sized).toContain('width="512"');
    expect(sized).toContain('height="256"');
    expect(sized).toContain('viewBox="0 0 200 100"');
    expect(withExplicitSize('<svg width="24" height="24" viewBox="0 0 24 24"></svg>')).toBeNull();
    expect(withExplicitSize('<svg viewBox="0 0 24 24" width="10"></svg>')).toContain('height="512"');
    expect(withExplicitSize('<svg></svg>')).toBeNull();
    expect(withExplicitSize('not svg')).toBeNull();
  });
  it('rasterises at power-of-two buckets', () => {
    expect(sizeBucket(10)).toBe(32);
    expect(sizeBucket(33)).toBe(64);
    expect(sizeBucket(300)).toBe(512);
    expect(sizeBucket(5000)).toBe(1024);
    expect(sizeBucket(NaN)).toBe(32);
  });
});

describe('placement helpers', () => {
  const a = sticker({ id: 'a' });
  const b = sticker({ id: 'b' });
  const c = sticker({ id: 'c', face: 'back' });
  const d = sticker({ id: 'd' });
  const ids = (l: StickerPlacement[]) => l.map((s) => s.id).join('');

  it('reorders only among stickers on the same surface', () => {
    const list = [a, b, c, d];
    expect(ids(moveLayer(list, 'a', 'front'))).toBe('bdca'); // a goes above d; the slots of a, b and d are reused, c stays
    expect(ids(moveLayer(list, 'a', 'forward'))).toBe('bacd');
    expect(ids(moveLayer(list, 'd', 'back'))).toBe('dacb');
    expect(ids(moveLayer(list, 'b', 'backward'))).toBe('bacd');
    expect(moveLayer(list, 'a', 'back')).toBe(list);
    expect(moveLayer(list, 'zzz', 'front')).toBe(list);
    expect(moveLayer(list, 'c', 'front')).toBe(list);
  });
  it('duplicates next to the original, offset, unlocked, respecting the cap', () => {
    const { list, created } = duplicateSticker([sticker({ id: 'a', locked: true, position: { x: 0.5, y: 0.5 } })], 'a');
    expect(list).toHaveLength(2);
    expect(created!.locked).toBe(false);
    expect(created!.position.x).toBeGreaterThan(0.5);
    expect(created!.id).not.toBe('a');
    const full = Array.from({ length: MAX_STICKERS }, (_, i) => sticker({ id: `s${i}` }));
    expect(duplicateSticker(full, 's0').created).toBeNull();
    expect(canAddStickers(full)).toBe(false);
  });
  it('applies to all surfaces once', () => {
    const list = applyToAllFaces([a], 'a', ['front', 'back', 'left']);
    expect(list.map((s) => s.face)).toEqual(['front', 'back', 'left']);
    expect(applyToAllFaces(list, 'a', ['front', 'back', 'left'])).toHaveLength(3);
  });
  it('tints all unlocked stickers and clamps values', () => {
    expect(tintAll([a, sticker({ id: 'l', locked: true })], '#123456').map((s) => s.tint)).toEqual(['#123456', null]);
    const clamped = clampSticker({ ...a, scale: 9, opacity: -1, rotation: 999, position: { x: -1, y: 4 } });
    expect(clamped).toMatchObject({ scale: 1.5, opacity: 0.05, rotation: 360, position: { x: 0, y: 1 } });
  });
  it('sizes by the shorter side and the artwork aspect', () => {
    expect(stickerBoxPx(400, 200, 0.5, 2)).toEqual({ w: 100, h: 50 });
    expect(stickerBoxPx(400, 200, 0.5, 0.5)).toEqual({ w: 50, h: 100 });
  });
  it('pattern tiles default to touching, unrotated tiles', () => {
    const p = makeSticker('dots', 'front', { kind: 'pattern' });
    expect(p.pattern).toEqual({ spacing: 0, angle: 0, stagger: false });
    expect(p.scale).toBeLessThan(0.32);
  });
});

describe('surprise me', () => {
  const faces = { front: { widthCm: 30, heightCm: 20 }, back: { widthCm: 30, heightCm: 20 }, left: { widthCm: 20, heightCm: 20 }, 'top-front': { widthCm: 30, heightCm: 10 } };
  it('is deterministic for a seed and different across seeds', () => {
    const run = (seed: number) => generateSurprise({ style: 'rsc', templateCategory: 'food', faces, library: LIB, seed });
    const strip = (r: ReturnType<typeof run>) => r.stickers.map(({ id: _id, ...rest }) => rest);
    expect(strip(run(7))).toEqual(strip(run(7)));
    expect(JSON.stringify(strip(run(7)))).not.toEqual(JSON.stringify(strip(run(8))));
    expect(seededRandom(1)()).toBe(seededRandom(1)());
  });
  it('produces valid, capped placements on printable surfaces that survive the codec', () => {
    for (let seed = 1; seed <= 12; seed++) {
      const r = generateSurprise({ style: 'mailer', faces, library: LIB, seed });
      expect(r.stickers.length).toBeGreaterThan(1);
      expect(r.stickers.length).toBeLessThanOrEqual(MAX_STICKERS);
      expect(r.stickers.every((s) => s.face in faces)).toBe(true);
      expect(r.board).toMatch(/^#[0-9a-f]{6}$/i);
      const parsed = parseDesign(serializeDesign(design({ stickers: r.stickers }), { includeImages: false }));
      expect(parsed).not.toBeNull();
      expect(decodeShareHash(encodeShareHash(design({ stickers: r.stickers })))!.stickers).toHaveLength(r.stickers.length);
    }
  });
  it('copes with an empty library or no surfaces', () => {
    expect(generateSurprise({ style: 'rsc', faces, library: [], seed: 1 }).stickers).toEqual([]);
    expect(generateSurprise({ style: 'rsc', faces: {}, library: LIB, seed: 1 }).stickers).toEqual([]);
  });
  it('palettes are valid hex colours and chosen by category', () => {
    for (const p of STICKER_PALETTES) expect([p.board, ...p.colours].every((c) => /^#[0-9a-f]{6}$/i.test(c))).toBe(true);
    expect(paletteFor('Fruit & produce').id).toBe('fresh-produce');
    expect(paletteFor(null, 3).id).toBeTruthy();
  });
});

describe('print check, estimate and redraw key for stickers', () => {
  const sizes = { front: { widthCm: 30, heightCm: 20 } };
  const base = { faceImages: [], textElements: [], colorHex: '#C9A86C' };
  it('flags a cutout over the edge or near a fold, but not a pattern', () => {
    const over = runPrintChecks({ ...base, stickers: [sticker({ id: 'o', position: { x: 0.98, y: 0.5 }, scale: 0.4 })] }, sizes);
    expect(over.find((i) => i.id === 'stk-edge-o')).toMatchObject({ severity: 'error', target: { kind: 'sticker', id: 'o' } });
    const near = runPrintChecks({ ...base, stickers: [sticker({ id: 'n', position: { x: 0.5, y: 0.115 }, scale: 0.2 })] }, sizes);
    expect(near.find((i) => i.id === 'stk-edge-n')?.severity).toBe('warning');
    const ok = runPrintChecks({ ...base, stickers: [sticker({ id: 'k', scale: 0.3 })] }, sizes);
    expect(ok).toEqual([]);
    const pat = runPrintChecks({ ...base, stickers: [sticker({ id: 'p', scale: 0.4, position: { x: 0, y: 0 }, pattern: { spacing: 0, angle: 0, stagger: false } })] }, sizes);
    expect(pat.find((i) => i.id === 'stk-edge-p')).toBeUndefined();
  });
  it('uses the real aspect ratio and rotation', () => {
    const wide = sticker({ position: { x: 0.5, y: 0.5 }, scale: 0.6 });
    const square = stickerPrintBox(sizes.front, wide, 1);
    const flat = stickerPrintBox(sizes.front, wide, 4);
    expect(flat.y1 - flat.y0).toBeLessThan(square.y1 - square.y0);
    const turned = stickerPrintBox(sizes.front, { ...wide, rotation: 90 }, 4);
    expect(turned.y1 - turned.y0).toBeGreaterThan(flat.y1 - flat.y0);
  });
  it('warns when a tint is invisible on the board', () => {
    const issues = runPrintChecks({ ...base, stickers: [sticker({ id: 't', tint: '#c9a86d' })] }, sizes);
    expect(issues.some((i) => i.id === 'stk-contrast-t')).toBe(true);
  });
  it('counts print inks for the estimate', () => {
    expect(countPrintColours({ ...base, stickers: [sticker({ tint: null })] })).toBe(4);
    expect(countPrintColours({ ...base, stickers: [sticker({ tint: '#111111' }), sticker({ tint: '#111111' })] })).toBeGreaterThanOrEqual(1);
    expect(countPrintColours({ ...base, stickers: [sticker({ tint: '#111111' }), sticker({ tint: '#222222' })] })).toBeGreaterThan(
      countPrintColours({ ...base, stickers: [sticker({ tint: '#111111' })] })
    );
  });
  it('changes the redraw key when a sticker changes', () => {
    const surface = { face: 'front' as const, widthCm: 30, heightCm: 20 };
    const s = sticker({ id: 'k' });
    const key = (st: StickerPlacement[]) => printContentKey(surface, undefined, [], { stickers: st });
    expect(key([s])).toBe(key([{ ...s }]));
    expect(key([s])).not.toBe(key([{ ...s, tint: '#ff0000' }]));
    expect(key([s])).not.toBe(key([{ ...s, position: { x: 0.4, y: 0.5 } }]));
    expect(key([s])).not.toBe(key([]));
  });
});
