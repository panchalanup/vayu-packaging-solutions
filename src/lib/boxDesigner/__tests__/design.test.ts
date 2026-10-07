import { describe, it, expect } from 'vitest';
import { DEFAULT_DESIGN, decodeShareHash, encodeShareHash, parseDesign, serializeDesign } from '../designCodec';
import { buildDieline, dielineToSvg } from '../dieline';
import { computeRscLayout, getFaceSizes, getViewExtents } from '../rig/rscLayout';
import { formatShareMessage } from '../shareUtils';
import type { BoxDesign } from '@/types/boxDesigner';

const design: BoxDesign = {
  ...DEFAULT_DESIGN,
  colorHex: '#2e4f7f',
  textElements: [
    { id: 't1', face: 'front', text: 'Hello नमस्ते <b>', font: 'Inter', size: 48, color: '#111111', position: { x: 0.5, y: 0.5 }, rotation: 0, align: 'center' },
  ],
  faceImages: [{ face: 'front', imageUrl: 'data:image/png;base64,iVBORw0KGgo=', position: { x: 0.5, y: 0.5 }, scale: 0.6, rotation: 0 }],
};

describe('design codec', () => {
  it('round-trips through JSON with images', () => {
    expect(parseDesign(serializeDesign(design, { includeImages: true }))).toEqual(design);
  });

  it('round-trips through a share link without images (unicode text included)', () => {
    const decoded = decodeShareHash(encodeShareHash(design));
    expect(decoded).toEqual({ ...design, faceImages: [] });
  });

  it('rejects malformed, tampered or hostile input', () => {
    expect(parseDesign('not json')).toBeNull();
    expect(parseDesign(JSON.stringify({ ...JSON.parse(serializeDesign(design, { includeImages: false })), v: 99 }))).toBeNull();
    const bad = JSON.parse(serializeDesign(design, { includeImages: true }));
    bad.faceImages[0].imageUrl = 'https://evil.example/x.png';
    expect(parseDesign(JSON.stringify(bad))).toBeNull();
    const tooBig = JSON.parse(serializeDesign(design, { includeImages: false }));
    tooBig.dimensions.length = 5000;
    expect(parseDesign(JSON.stringify(tooBig))).toBeNull();
    expect(decodeShareHash('#design=@@@')).toBeNull();
    expect(decodeShareHash('#nothing')).toBeNull();
  });

  it('snaps an unknown flute stack back to the ply default', () => {
    const json = JSON.parse(serializeDesign(design, { includeImages: false }));
    json.ply = '3-ply';
    json.flutes = ['C', 'B', 'C'];
    expect(parseDesign(JSON.stringify(json))?.flutes).toEqual(['B']);
  });
});

describe('dieline', () => {
  const layout = computeRscLayout({ length: 30, width: 20, height: 15 }, 0.66);

  it('lays out tab + 4 panels with scores and cuts', () => {
    const d = buildDieline(layout, { title: 'RSC', board: '5-ply', topFlaps: true });
    const scores = d.lines.filter((l) => l.kind === 'score');
    expect(scores.length).toBeGreaterThanOrEqual(4 + 4 + 4); // vertical + top + bottom scores
    const blankMm = 10 * (2 * (layout.outside.length + layout.outside.width) + layout.tab.width);
    expect(d.width).toBeCloseTo(blankMm + 40, 3);
  });

  it('has no top flaps for HSC and escapes text in SVG', () => {
    const hsc = computeRscLayout({ length: 30, width: 20, height: 15 }, 0.66, { topFlaps: false });
    const d = buildDieline(hsc, { title: 'A <b> & "c"', board: 'x', topFlaps: false });
    const svg = dielineToSvg(d);
    expect(svg).toContain('&lt;b&gt; &amp; &quot;c&quot;');
    expect(svg).not.toContain('<b>');
    expect(d.height).toBeLessThan(buildDieline(layout, { title: '', board: '', topFlaps: true }).height);
  });
});

describe('HSC layout', () => {
  it('is 2t shorter, has no printable top flaps and frames lower', () => {
    const rsc = computeRscLayout({ length: 30, width: 20, height: 15 }, 0.66);
    const hsc = computeRscLayout({ length: 30, width: 20, height: 15 }, 0.66, { topFlaps: false });
    expect(rsc.outside.height - hsc.outside.height).toBeCloseTo(1.32, 5);
    expect(Object.keys(getFaceSizes(hsc))).toEqual(['front', 'right', 'back', 'left']);
    expect(Object.keys(getFaceSizes(rsc))).toHaveLength(8);
    expect(getViewExtents(hsc, 1).radius).toBeLessThan(getViewExtents(rsc, 0.72).radius);
  });
});

describe('share message', () => {
  it('describes the spec and colour', () => {
    const message = formatShareMessage(design, 'https://example.com/#design=x');
    expect(message).toContain('30 x 20 x 15 cm');
    expect(message).toContain('5-Ply');
    expect(message).toContain('Navy Blue');
    expect(message).toContain('https://example.com/#design=x');
  });
});
