import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';

// jsdom has no 2D canvas: the procedural textures are replaced by plain textures for the rig tests
vi.mock('../textures/surfaceTextures', () => {
  const tex = () => new THREE.Texture();
  return {
    GRAIN_TILE_CM: 20,
    EDGE_TILE_CM: 4,
    getContactShadowTexture: tex,
    getGrainTexture: tex,
    getInnerOcclusionTexture: tex,
    getSurfaceNormalTexture: tex,
    getEdgeTextures: () => ({ cross: tex(), along: tex() }),
    setSurfaceTextureAnisotropy: () => undefined,
  };
});

import { STYLES, getStyle, getLayoutFaceSizes, getLayoutViewExtents, getRigKey } from '../styles/registry';
import { blankSizeForDesign, dielineForDesign, faceSizesForDesign, layoutForDesign } from '../styles/designLayout';
import { dimensionsAfterStyleSwitch } from '../styles/switchStyle';
import { computeDieCutLayout, computeSleeveLayout, dieNodes, dieTopology, flatBounds, type DieCutLayout } from '../rig/dieCutLayout';
import { dieCutPoseFromProgress } from '../rig/dieCutPose';
import { computeSlideLayout, SLIDE_CLEARANCE, SLIDE_PULL, SLIDE_TRAY_OUT } from '../rig/slideLayout';
import { createCartonRig } from '../rig/createRig';
import type { CartonRig } from '../rig/panelRig';
import { DEFAULT_DESIGN, parseDesign, serializeDesign, encodeShareHash } from '../designCodec';
import { getBoardSpec } from '../boardSpecs';
import { hasStyleModel } from '../styleAvailability';
import { jobTypeOf } from '../delivery';
import { DIE_CUT_STYLES } from '../pricing';
import type { BoxDesign, BoxFace, BoxTemplate } from '@/types/boxDesigner';

const NEW_STYLES: BoxTemplate[] = ['window-mailer', 'cake-box', 'clamshell', 'shelf-tray', 'slide-box', 'book-box'];
const DIMS = { length: 30, width: 20, height: 12 };
const T = 0.4;
const board = getBoardSpec('3-ply', ['E']);
const design = (template: BoxTemplate, extra: Partial<BoxDesign> = {}): BoxDesign => ({
  ...DEFAULT_DESIGN,
  template,
  dimensions: { ...getStyle(template).defaultDims },
  ...extra,
});
const withOptions = (template: BoxTemplate, options: Partial<BoxDesign['options']>): BoxDesign =>
  design(template, { options: { ...DEFAULT_DESIGN.options, ...options } });

function rigFor(d: BoxDesign) {
  const layout = layoutForDesign(d);
  const rig = createCartonRig(layout);
  rig.update(layout, board);
  rig.setPose(1);
  return { rig, layout };
}

function decalAxes(rig: CartonRig, face: BoxFace) {
  rig.object3d.updateMatrixWorld(true);
  let decal: THREE.Object3D | null = null;
  rig.object3d.traverse((o) => {
    if (o.userData.face === face && (o as THREE.Mesh).renderOrder === 1) decal = o;
  });
  if (!decal) throw new Error(`no decal for ${face}`);
  const m = new THREE.Matrix3().setFromMatrix4((decal as THREE.Object3D).matrixWorld);
  const axis = (v: THREE.Vector3) => v.applyMatrix3(m).normalize();
  const round = (v: THREE.Vector3) => v.toArray().map((n) => Math.round(n) + 0);
  return { x: round(axis(new THREE.Vector3(1, 0, 0))), y: round(axis(new THREE.Vector3(0, 1, 0))), n: round(axis(new THREE.Vector3(0, 0, 1))) };
}

describe('phase 2 die-cut registry entries', () => {
  it('registers the six styles with names, groups, icons, stops and faces', () => {
    for (const id of NEW_STYLES) {
      const s = getStyle(id);
      expect(s.id).toBe(id);
      expect(s.name.length).toBeGreaterThan(4);
      expect(s.bestFor.length).toBeGreaterThan(5);
      expect(s.iconPath).toMatch(/^M/);
      expect(s.group).toBeTruthy();
      expect(s.foldStops[0].value).toBe(0);
      expect(s.foldStops[s.foldStops.length - 1].value).toBe(100);
      expect(hasStyleModel(id)).toBe(true);
      expect(DIE_CUT_STYLES).toContain(id);
      expect(jobTypeOf({ template: id, faceImages: [], textElements: [] })).toBe('dieCut');
    }
    expect(new Set(STYLES.map((s) => s.id)).size).toBe(STYLES.length);
  });

  it('lays out, frames and lists exactly the printable faces', () => {
    for (const id of NEW_STYLES) {
      const s = getStyle(id);
      const layout = layoutForDesign(design(id));
      const sizes = getLayoutFaceSizes(layout);
      expect(Object.keys(sizes).sort()).toEqual([...s.faces].sort());
      expect(Object.keys(faceSizesForDesign(design(id)))).toEqual(s.faces.filter((f) => sizes[f]));
      for (const size of Object.values(sizes)) {
        expect(size!.widthCm).toBeGreaterThan(0);
        expect(size!.heightCm).toBeGreaterThan(0);
      }
      for (const u of [0, 0.3, 0.6, 0.72, 1]) {
        const e = getLayoutViewExtents(layout, u);
        expect(Number.isFinite(e.radius) && e.radius > 0).toBe(true);
        expect(e.shadowRadius).toBeGreaterThanOrEqual(e.radius * 0.99);
      }
    }
  });

  it('picks rigs: window mailer and cake box share the mailer rig; clamshell, book and slide have their own', () => {
    const key = (id: BoxTemplate) => getRigKey(layoutForDesign(design(id)));
    expect(key('window-mailer')).toBe(key('mailer'));
    expect(key('cake-box')).toBe(key('pizza'));
    expect(key('shelf-tray')).toBe(key('tray'));
    const keys = new Set([key('mailer'), key('clamshell'), key('book-box'), key('slide-box'), key('tray')]);
    expect(keys.size).toBe(5);
  });

  it('size rule: a new style takes its own default size when the old one was untouched', () => {
    expect(dimensionsAfterStyleSwitch('rsc', 'cake-box', { length: 30, width: 20, height: 15 })).toEqual({ length: 25, width: 25, height: 12 });
    const custom = { length: 31, width: 20, height: 15 };
    expect(dimensionsAfterStyleSwitch('rsc', 'slide-box', custom)).toBe(custom);
  });
});

describe('clamshell and book box (single-wall die-cut)', () => {
  const clam = computeDieCutLayout(DIMS, T, 'clamshell');
  const book = computeDieCutLayout(DIMS, T, 'book');

  it('single walls: outside = inside + 2t each way, lid on top, no roll-over panels', () => {
    expect(clam.outside.length).toBeCloseTo(30 + 2 * T, 5);
    expect(clam.outside.width).toBeCloseTo(20 + 2 * T, 5);
    expect(clam.outside.height).toBeCloseTo(12 + 2 * T, 5);
    expect(clam.schedule).toBe('single');
    const ids = dieNodes(clam.root).map((n) => n.id);
    expect(ids.some((id) => id.endsWith('-roll') || id.endsWith('-inner'))).toBe(false);
    expect(ids).toEqual(expect.arrayContaining(['lid', 'tuck', 'dust-l', 'dust-r']));
  });

  it('book box: lip hangs outside the front wall with a tongue, no dust flaps; faces include the lip', () => {
    const ids = dieNodes(book.root).map((n) => n.id);
    expect(ids).toEqual(expect.arrayContaining(['lid', 'lip', 'tongue']));
    expect(ids).not.toContain('dust-l');
    expect(book.outside.width).toBeCloseTo(20 + 3 * T, 5);
    expect(Object.keys(getLayoutFaceSizes(book)).sort()).toEqual(['back', 'front', 'left', 'lid', 'lid-front', 'right']);
    const lip = dieNodes(book.root).find((n) => n.id === 'lip')!;
    const tongue = dieNodes(book.root).find((n) => n.id === 'tongue')!;
    // the tongue is long enough to pass through the wall and reach into the box
    expect(tongue.rect.y1 - tongue.rect.y0).toBeGreaterThan(2 * T);
    expect(lip.rect.y1 - lip.rect.y0).toBeGreaterThan(2 * T + 1);
  });

  it('schedule: walls finish early, the lid opens at its own stop, everything closes at 1', () => {
    const open = dieCutPoseFromProgress(0.58, 'single');
    expect(open.angles.lid).toBeLessThan(0);
    expect(open.angles.sides).toBeCloseTo(Math.PI / 2, 6);
    const closed = dieCutPoseFromProgress(1, 'single');
    Object.values(closed.angles).forEach((a) => expect(a).toBeCloseTo(Math.PI / 2, 6));
    for (let u = 0; u <= 1; u += 0.01) {
      const p = dieCutPoseFromProgress(u, 'single');
      Object.values(p.angles).forEach((a) => expect(a).toBeLessThanOrEqual(Math.PI / 2 + 1e-9));
    }
    // the tongue goes in after the lip is down
    const mid = dieCutPoseFromProgress(0.66, 'single');
    expect(mid.angles.tongue).toBeLessThan(mid.angles.tuck);
  });

  it('dieline: one score per hinge, finite lines', () => {
    for (const id of ['clamshell', 'book-box'] as BoxTemplate[]) {
      const layout = layoutForDesign(design(id)) as DieCutLayout;
      const d = dielineForDesign(design(id));
      expect(d.lines.filter((l) => l.kind === 'score')).toHaveLength(dieNodes(layout.root).length - 1);
      expect(d.pieces).toHaveLength(1);
      expect(d.pieces[0].width).toBeCloseTo(layout.blank.length * 10, 6);
    }
  });
});

describe('shelf display tray', () => {
  const full = computeDieCutLayout(DIMS, T, 'tray');
  const low = computeDieCutLayout(DIMS, T, 'shelf', { frontRatio: 0.4 });

  it('cuts the front down to the ratio while the other walls stay full height', () => {
    const rect = (l: DieCutLayout, id: string) => dieNodes(l.root).find((n) => n.id === id)!.rect;
    const sideH = rect(low, 'left').y1;
    expect(rect(low, 'front').y1).toBeCloseTo(sideH * 0.4, 5);
    expect(rect(low, 'back').y1).toBeCloseTo(sideH, 5);
    expect(low.outside.height).toBeCloseTo(full.outside.height, 5);
    expect(dieTopology(low)).toBe(dieTopology(full));
    expect(low.hasLid).toBe(false);
  });

  it('is limited to a sensible range and follows the design option (0 = style default)', () => {
    const rect = (l: DieCutLayout, id: string) => dieNodes(l.root).find((n) => n.id === id)!.rect;
    const tiny = computeDieCutLayout(DIMS, T, 'shelf', { frontRatio: 0 });
    expect(rect(tiny, 'front').y1).toBeGreaterThan(2 * T);
    const byOption = (frontCut: number) => layoutForDesign(withOptions('shelf-tray', { frontCut })) as DieCutLayout;
    const defaulted = rect(byOption(0), 'front').y1;
    expect(defaulted).toBeGreaterThan(rect(byOption(0.7), 'front').y1);
    expect(rect(byOption(0.3), 'front').y1).toBeGreaterThan(defaulted);
    // a lower front means a shorter front panel in the dieline too
    expect(dielineForDesign(withOptions('shelf-tray', { frontCut: 0.7 })).height).toBeLessThan(dielineForDesign(withOptions('shelf-tray', { frontCut: 0.2 })).height);
  });
});

describe('window styles', () => {
  it('window mailer and cake box always have a window on the lid; its size follows the ratio', () => {
    for (const id of ['window-mailer', 'cake-box'] as BoxTemplate[]) {
      const layout = layoutForDesign(withOptions(id, { window: false })) as DieCutLayout;
      const win = layout.openings?.lid?.[0];
      expect(win?.kind).toBe('window');
      const lid = getLayoutFaceSizes(layout).lid!;
      expect(win!.width).toBeLessThan(lid.widthCm);
      const bigger = layoutForDesign(withOptions(id, { windowRatio: 0.8 })) as DieCutLayout;
      expect(bigger.openings!.lid![0].width).toBeGreaterThan(win!.width);
    }
  });

  it('clamshell and book box only cut a window when asked, and the dieline shows the cut lines', () => {
    for (const id of ['clamshell', 'book-box'] as BoxTemplate[]) {
      const plain = layoutForDesign(withOptions(id, { window: false })) as DieCutLayout;
      const windowed = layoutForDesign(withOptions(id, { window: true })) as DieCutLayout;
      expect(plain.openings).toBeUndefined();
      expect(windowed.openings?.lid).toHaveLength(1);
      const cutsPlain = dielineForDesign(withOptions(id, { window: false })).lines.filter((l) => l.kind === 'cut').length;
      const cutsWindow = dielineForDesign(withOptions(id, { window: true })).lines.filter((l) => l.kind === 'cut').length;
      expect(cutsWindow).toBeGreaterThan(cutsPlain + 8);
    }
  });

  it('window cut lines sit inside the lid panel on the sheet', () => {
    const d = dielineForDesign(design('window-mailer'));
    const plain = dielineForDesign(withOptions('mailer', {}));
    const extra = d.lines.length - plain.lines.length;
    expect(extra).toBeGreaterThan(8);
    expect(d.lines.every((l) => [l.x1, l.y1, l.x2, l.y2].every(Number.isFinite))).toBe(true);
    for (const l of d.lines) {
      expect(l.x1).toBeGreaterThanOrEqual(0);
      expect(l.x1).toBeLessThanOrEqual(d.width);
      expect(l.y1).toBeGreaterThanOrEqual(0);
      expect(l.y1).toBeLessThanOrEqual(d.height);
    }
  });
});

describe('slide box (tray + sleeve)', () => {
  const layout = computeSlideLayout(DIMS, T);

  it('sleeve is a hair bigger than the tray and as long as it', () => {
    const { tray, sleeve } = layout;
    expect(sleeve.inside.length).toBeCloseTo(tray.outside.length, 5);
    expect(sleeve.inside.width).toBeCloseTo(tray.outside.width + SLIDE_CLEARANCE, 5);
    expect(sleeve.inside.height).toBeCloseTo(tray.outside.height + SLIDE_CLEARANCE, 5);
    expect(sleeve.outside.width).toBeCloseTo(sleeve.inside.width + 2 * tray.thickness, 5);
    expect(sleeve.outside.height).toBeCloseTo(sleeve.inside.height + 2 * tray.thickness, 5);
    expect(layout.outside).toEqual(sleeve.outside);
    expect(sleeve.thickness).toBeCloseTo(tray.thickness, 9);
  });

  it('faces: tray walls plus sleeve lid, lid-front, lid-back and bottom; two dieline pieces and two blanks', () => {
    expect(Object.keys(getLayoutFaceSizes(layout)).sort()).toEqual(['back', 'bottom', 'front', 'left', 'lid', 'lid-back', 'lid-front', 'right']);
    const d = dielineForDesign(design('slide-box'));
    const real = layoutForDesign(design('slide-box'));
    if (real.kind !== 'slide') throw new Error('kind');
    expect(d.pieces).toHaveLength(2);
    expect(d.pieces[0].width).toBeCloseTo(real.tray.blank.length * 10, 6);
    expect(d.pieces[1].width).toBeCloseTo(real.sleeve.blank.length * 10, 6);
    expect(d.height).toBeGreaterThan(d.pieces[0].height + d.pieces[1].height);
    expect(blankSizeForDesign(design('slide-box')).pieces).toBe(2);
    expect(blankSizeForDesign(design('slide-box')).areaM2).toBeGreaterThan(0);
    // sleeve strip: bottom + front + top + glue flap across, bottom + back wall the other way
    const sleeveScores = dieNodes(layout.sleeve.root).length - 1;
    expect(sleeveScores).toBe(4);
  });

  it('sleeve strip length is bottom + front + top + back + glue flap', () => {
    const s = computeSleeveLayout({ length: 20, width: 10, height: 5 }, T);
    const b = flatBounds(s.root);
    const Zs = 10 / 2 + T;
    const Hw = 5 + 2 * T;
    const flap = dieNodes(s.root).find((n) => n.id === 'glue')!.rect;
    // flat: back wall on one side of the bottom panel; front wall, top and glue flap on the other
    const back = Hw - T;
    expect(b.y1 - b.y0).toBeCloseTo(Zs + back + Zs + Hw + 2 * Zs + (flap.y1 - flap.y0), 5);
  });

  it('sleeve pose: walls up, then the top closes, then the glue flap folds in', () => {
    const at = (u: number) => dieCutPoseFromProgress(u, 'sleeve').angles;
    expect(at(0.33).front).toBeCloseTo(Math.PI / 2, 6);
    expect(at(0.5).lid).toBeGreaterThan(0);
    expect(at(0.5).lidFlaps).toBe(0);
    expect(at(1).lid).toBeCloseTo(Math.PI / 2, 6);
    expect(at(1).lidFlaps).toBeCloseTo(Math.PI / 2, 6);
  });

  it('assembled: one box of the outside size on the ground, the tray inside the sleeve', () => {
    const { rig, layout: l } = rigFor(design('slide-box'));
    if (l.kind !== 'slide') throw new Error('kind');
    const box = rig.getBounds();
    const size = box.getSize(new THREE.Vector3());
    expect(box.min.y).toBeCloseTo(0, 4);
    expect(size.x).toBeCloseTo(l.outside.length, 1);
    expect(size.z).toBeCloseTo(l.outside.width, 1);
    expect(size.y).toBeCloseTo(l.outside.height, 1);
    expect(rig.getPrintSurfaces().map((s) => s.face).sort()).toEqual(Object.keys(getLayoutFaceSizes(l)).sort());
    rig.dispose();
  });

  it('tray out: the tray sticks out by its pull share; flat: blanks on the ground', () => {
    const { rig, layout: l } = rigFor(design('slide-box'));
    if (l.kind !== 'slide') throw new Error('kind');
    rig.setPose(SLIDE_TRAY_OUT);
    const out = rig.getBounds().getSize(new THREE.Vector3());
    expect(out.x).toBeCloseTo(l.outside.length + SLIDE_PULL * l.tray.outside.length, 0);
    expect(rig.getBounds().min.y).toBeCloseTo(0, 4);
    rig.setPose(0);
    const flat = rig.getBounds();
    expect(flat.min.y).toBeCloseTo(0, 4);
    expect(flat.getSize(new THREE.Vector3()).y).toBeLessThan(l.thickness * 1.01);
    rig.dispose();
  });

  it('sleeve top reads upright from the front; tray front too', () => {
    const { rig } = rigFor(design('slide-box'));
    expect(decalAxes(rig, 'lid')).toMatchObject({ n: [0, 1, 0], x: [1, 0, 0], y: [0, 0, -1] });
    expect(decalAxes(rig, 'lid-front')).toMatchObject({ n: [0, 0, 1], x: [1, 0, 0], y: [0, 1, 0] });
    expect(decalAxes(rig, 'front')).toMatchObject({ n: [0, 0, 1], x: [1, 0, 0], y: [0, 1, 0] });
    rig.dispose();
  });
});

describe('rigs of the die-cut styles', () => {
  it.each(['window-mailer', 'cake-box', 'clamshell', 'shelf-tray', 'book-box'] as BoxTemplate[])(
    '%s assembles to its outside size, standing on the ground, and lies flat at 0',
    (id) => {
      const { rig, layout } = rigFor(design(id));
      const box = rig.getBounds();
      const size = box.getSize(new THREE.Vector3());
      expect(box.min.y).toBeCloseTo(0, 4);
      expect(size.x).toBeCloseTo(layout.outside.length, 1);
      expect(size.z).toBeCloseTo(layout.outside.width, 1);
      expect(size.y).toBeCloseTo(layout.outside.height, 1);
      expect(rig.getPrintSurfaces().map((s) => s.face).sort()).toEqual(Object.keys(getLayoutFaceSizes(layout)).sort());
      rig.setPose(0);
      expect(rig.getBounds().min.y).toBeCloseTo(0, 4);
      expect(rig.getBounds().getSize(new THREE.Vector3()).y).toBeLessThan(layout.thickness * 1.5);
      rig.dispose();
    }
  );

  it.each(['clamshell', 'book-box'] as BoxTemplate[])('%s: every fold stop stays on the ground and finite', (id) => {
    const { rig } = rigFor(design(id));
    for (const stop of getStyle(id).foldStops) {
      rig.setPose(stop.value / 100);
      const box = rig.getBounds();
      expect(box.min.y).toBeCloseTo(0, 4);
      expect(box.getSize(new THREE.Vector3()).toArray().every(Number.isFinite)).toBe(true);
    }
    rig.dispose();
  });

  it.each(['window-mailer', 'clamshell', 'book-box', 'shelf-tray', 'cake-box'] as BoxTemplate[])('%s artwork reads upright on the visible faces', (id) => {
    const { rig } = rigFor(design(id));
    expect(decalAxes(rig, 'front')).toMatchObject({ n: [0, 0, 1], x: [1, 0, 0], y: [0, 1, 0] });
    expect(decalAxes(rig, 'left')).toMatchObject({ n: [-1, 0, 0], x: [0, 0, 1], y: [0, 1, 0] });
    if (id !== 'shelf-tray') expect(decalAxes(rig, 'lid')).toMatchObject({ n: [0, 1, 0], x: [1, 0, 0], y: [0, 0, -1] });
    if (id === 'book-box') expect(decalAxes(rig, 'lid-front')).toMatchObject({ n: [0, 0, 1], x: [1, 0, 0], y: [0, 1, 0] });
    rig.dispose();
  });

  it('window decal is drawn on the lid (cut-out group present) and follows the option', () => {
    const { rig } = rigFor(withOptions('clamshell', { window: true }));
    let groups = 0;
    rig.object3d.traverse((o) => {
      if (o.name === 'openings') groups += 1;
    });
    expect(groups).toBe(1);
    rig.dispose();
  });

  it('shelf tray resizes in place when the front cut changes', () => {
    const { rig } = rigFor(withOptions('shelf-tray', { frontCut: 0.3 }));
    const next = layoutForDesign(withOptions('shelf-tray', { frontCut: 0.8 }));
    expect(getRigKey(next)).toBe(getRigKey(layoutForDesign(withOptions('shelf-tray', { frontCut: 0.3 }))));
    rig.update(next, board);
    expect(rig.getBounds().min.y).toBeCloseTo(0, 4);
    rig.dispose();
  });
});

describe('codec with the phase 2 die-cut styles', () => {
  it('round-trips every style, its options and the share link', () => {
    for (const id of NEW_STYLES) {
      const d = design(id, {
        options: { ...DEFAULT_DESIGN.options, window: true, windowRatio: 0.7, frontCut: 0.5 },
        textElements: [
          { id: 't', face: getStyle(id).faces[0], text: 'Hi', font: 'Inter', size: 24, color: '#111111', position: { x: 0.5, y: 0.5 }, rotation: 0, align: 'center' },
        ],
      });
      expect(parseDesign(serializeDesign(d, { includeImages: true }))).toEqual(d);
      const hash = encodeShareHash(d);
      expect(hash.startsWith('#design=')).toBe(true);
    }
  });

  it('rejects an unknown style id', () => {
    const json = serializeDesign(design('clamshell'), { includeImages: true }).replace('"clamshell"', '"gable-box"');
    expect(parseDesign(json)).toBeNull();
  });
});
