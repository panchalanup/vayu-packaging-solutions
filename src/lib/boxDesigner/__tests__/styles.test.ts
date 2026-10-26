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

import { STYLES, getStyle, getLayoutFaceSizes, getLayoutViewExtents, buildLayoutDieline, getRigKey } from '../styles/registry';
import { blankSizeForDesign, dielineForDesign, faceSizesForDesign, layoutForDesign } from '../styles/designLayout';
import { computeRscLayout } from '../rig/rscLayout';
import { poseFromProgress } from '../rig/foldPose';
import { computeTelescopeLayout, resolveLidDepth, LID_CLEARANCE } from '../rig/telescopeLayout';
import { computeDieCutLayout, dieNodes, dieTopology, flatBounds } from '../rig/dieCutLayout';
import { dieCutPoseFromProgress } from '../rig/dieCutPose';
import { createCartonRig } from '../rig/createRig';
import type { CartonRig } from '../rig/panelRig';
import { DEFAULT_DESIGN, parseDesign, serializeDesign } from '../designCodec';
import { getBoardSpec } from '../boardSpecs';
import type { BoxDesign, BoxFace, BoxTemplate } from '@/types/boxDesigner';

const DIMS = { length: 30, width: 20, height: 15 };
const T = 0.66;
const board = getBoardSpec('5-ply');
const design = (template: BoxTemplate, extra: Partial<BoxDesign> = {}): BoxDesign => ({ ...DEFAULT_DESIGN, template, ...extra });
const finite = (n: number) => Number.isFinite(n);

describe('style registry', () => {
  it('has all eight styles with names, best-for text, icons and fold stops', () => {
    expect(STYLES.map((s) => s.id)).toEqual(['rsc', 'hsc', 'fol', 'sleeve', 'telescope', 'mailer', 'pizza', 'tray']);
    for (const s of STYLES) {
      expect(s.bestFor.length).toBeGreaterThan(5);
      expect(s.iconPath).toMatch(/^M/);
      expect(s.foldStops[0].value).toBe(0);
      expect(s.foldStops[s.foldStops.length - 1].value).toBe(100);
    }
    expect(getStyle('nonsense').id).toBe('rsc');
  });

  it('every style lays out, frames and lists exactly its printable faces', () => {
    for (const s of STYLES) {
      const layout = s.computeLayout(DIMS, T);
      const sizes = getLayoutFaceSizes(layout);
      expect(Object.keys(sizes).sort()).toEqual([...s.faces].sort());
      for (const size of Object.values(sizes)) {
        expect(size!.widthCm).toBeGreaterThan(0);
        expect(size!.heightCm).toBeGreaterThan(0);
      }
      for (const u of [0, 0.3, 0.6, 0.72, 1]) {
        const e = getLayoutViewExtents(layout, u);
        expect(finite(e.radius) && e.radius > 0).toBe(true);
        expect(e.shadowRadius).toBeGreaterThanOrEqual(e.radius * 0.99);
      }
    }
  });

  it('face sizes for a design follow the style order', () => {
    expect(Object.keys(faceSizesForDesign(design('telescope')))[0]).toBe('lid');
    expect(Object.keys(faceSizesForDesign(design('mailer')))).toEqual(['lid', 'front', 'back', 'left', 'right']);
  });

  it('picks one rig per kind (mailer and pizza share a topology)', () => {
    const keys = STYLES.map((s) => getRigKey(s.computeLayout(DIMS, T)));
    expect(keys).toEqual(['slotted', 'slotted', 'slotted', 'slotted', 'telescope', 'diecut-lid', 'diecut-lid', 'diecut-tray']);
    expect(dieTopology(computeDieCutLayout(DIMS, T, 'mailer'))).toBe(dieTopology(computeDieCutLayout({ length: 40, width: 40, height: 5 }, 0.3, 'pizza')));
  });
});

describe('slotted family', () => {
  it('FOL: three flap layers per end, majors reach across, the back wall closes outside', () => {
    const fol = computeRscLayout(DIMS, T, { overlapTop: true, overlapBottom: true });
    expect(fol.outside.height).toBeCloseTo(15 + 6 * T, 5);
    const [front, right, back] = fol.walls;
    expect(front.topFlap.depth).toBeCloseTo(fol.outside.width - T - 0.1, 5);
    expect(back.topFlap.stage).toBe('outer');
    expect(front.topFlap.stage).toBe('major');
    expect(back.y1 - back.y0).toBeCloseTo(fol.outside.height, 5);
    expect(front.y1 - front.y0).toBeCloseTo(fol.outside.height - 2 * T, 5);
    expect(right.y1 - right.y0).toBeCloseTo(fol.outside.height - 4 * T, 5);
    expect(right.topFlap.depth).toBeLessThanOrEqual(fol.outside.length / 2);
  });

  it('FOL pose closes minor, then inner major, then outer major', () => {
    const at = (u: number) => poseFromProgress(u, { overlapTop: true, overlapBottom: true });
    const p = at(0.86);
    expect(p.topMinor).toBeCloseTo(Math.PI / 2, 6);
    expect(p.topOuter).toBeLessThan(p.topMajor);
    const b = at(0.62);
    expect(b.bottomMinor).toBeCloseTo(Math.PI / 2, 6);
    expect(b.bottomOuter).toBeLessThan(b.bottomMajor);
    const sealed = at(1);
    expect(sealed.topOuter).toBeCloseTo(Math.PI / 2, 6);
    expect(sealed.bottomOuter).toBeCloseTo(Math.PI / 2, 6);
    for (let u = 0; u <= 1; u += 0.0005) {
      const a = at(u);
      const c = at(u + 0.0005);
      expect(Math.abs(c.topOuter - a.topOuter)).toBeLessThan(0.03);
      expect(Math.abs(c.bottomOuter - a.bottomOuter)).toBeLessThan(0.03);
    }
  });

  it('sleeve has no flaps, full-height walls and a short timeline', () => {
    const sleeve = getStyle('sleeve').computeLayout(DIMS, T);
    if (sleeve.kind !== 'rsc') throw new Error('kind');
    expect(sleeve.outside.height).toBeCloseTo(15, 5);
    expect(sleeve.topDepth + sleeve.bottomDepth).toBe(0);
    expect(sleeve.timelineEnd).toBe(0.5);
    sleeve.walls.forEach((w) => expect(w.y0).toBe(0));
  });

  it('RSC is unchanged by the generalisation', () => {
    const rsc = computeRscLayout(DIMS, T);
    expect(rsc.outside.height).toBeCloseTo(17.64, 5);
    expect(rsc.topDepth).toBeCloseTo(rsc.flapDepth, 9);
    expect(rsc.timelineEnd).toBe(1);
  });
});

describe('telescope', () => {
  it('lid is 2t (+ play) larger than the base inside, with the lid depth', () => {
    const tel = computeTelescopeLayout(DIMS, T, 6);
    expect(tel.lid.inside.length).toBeCloseTo(30 + 2 * T + 2 * LID_CLEARANCE, 5);
    expect(tel.lid.inside.width).toBeCloseTo(20 + 2 * T + 2 * LID_CLEARANCE, 5);
    expect(tel.lid.inside.height).toBe(6);
    expect(tel.lid.thickness).toBeCloseTo(tel.base.thickness, 9);
    expect(tel.outside.height).toBeCloseTo(tel.base.outside.height + 3 * T, 5);
    expect(tel.lid.overlapBottom).toBe(true);
  });

  it('resolves the automatic lid depth and clamps to the base height', () => {
    expect(resolveLidDepth(15, null)).toBe(5);
    expect(resolveLidDepth(15, 40)).toBe(15);
    expect(resolveLidDepth(6, null)).toBe(3);
  });
});

describe('die-cut family', () => {
  const mailer = computeDieCutLayout(DIMS, T, 'mailer');
  const tray = computeDieCutLayout(DIMS, T, 'tray');

  it('outside = inside + double side walls (6t), double front (4t) and base + lid (2t)', () => {
    expect(mailer.outside.length).toBeCloseTo(30 + 6 * T, 5);
    expect(mailer.outside.width).toBeCloseTo(20 + 4 * T, 5);
    expect(mailer.outside.height).toBeCloseTo(15 + 2 * T, 5);
    expect(tray.outside.height).toBeCloseTo(15 + T, 5);
    expect(tray.hasLid).toBe(false);
    expect(dieNodes(tray.root).some((n) => n.id === 'lid')).toBe(false);
  });

  it('flat blank extents come from the hinge tree', () => {
    const b = flatBounds(mailer.root);
    expect(mailer.blank.length).toBeCloseTo(b.x1 - b.x0, 6);
    expect(mailer.blank.height).toBeGreaterThan(2 * mailer.outside.width + 2 * mailer.outside.height);
  });

  it('pose: blank turns over, opens at the lid stop, closes at 1', () => {
    expect(dieCutPoseFromProgress(0).flip).toBeCloseTo(-Math.PI / 2, 6);
    expect(dieCutPoseFromProgress(1).flip).toBeCloseTo(Math.PI / 2, 6);
    const open = dieCutPoseFromProgress(0.68);
    expect(open.angles.lid).toBeLessThan(0);
    expect(open.angles.sideInner).toBeCloseTo(Math.PI / 2, 6);
    const closed = dieCutPoseFromProgress(1);
    Object.values(closed.angles).forEach((a) => expect(a).toBeCloseTo(Math.PI / 2, 6));
    for (let u = 0; u <= 1; u += 0.01) {
      Object.values(dieCutPoseFromProgress(u).angles).forEach((a) => expect(a).toBeLessThanOrEqual(Math.PI / 2 + 1e-9));
    }
  });
});

describe('dielines', () => {
  it('every style exports a finite 1:1 dieline with cuts and scores', () => {
    for (const s of STYLES) {
      const d = dielineForDesign(design(s.id));
      expect(d.lines.length).toBeGreaterThan(10);
      expect(d.lines.some((l) => l.kind === 'score')).toBe(true);
      expect(d.lines.every((l) => [l.x1, l.y1, l.x2, l.y2].every(finite))).toBe(true);
      expect(d.width).toBeGreaterThan(0);
      expect(d.pieces.length).toBe(s.id === 'telescope' ? 2 : 1);
    }
  });

  it('die-cut: one score per hinge and no cut drawn over a score', () => {
    const layout = computeDieCutLayout(DIMS, T, 'mailer');
    const d = buildLayoutDieline(layout, { title: 'm', board: 'b' });
    const scores = d.lines.filter((l) => l.kind === 'score');
    expect(scores).toHaveLength(dieNodes(layout.root).length - 1);
    const onScore = (x: number, y: number) =>
      scores.some((s) => {
        const len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1);
        const d1 = Math.hypot(x - s.x1, y - s.y1);
        const d2 = Math.hypot(x - s.x2, y - s.y2);
        return Math.abs(d1 + d2 - len) < 1e-6 && d1 > 1e-3 && d2 > 1e-3;
      });
    for (const c of d.lines.filter((l) => l.kind === 'cut')) {
      expect(onScore((c.x1 + c.x2) / 2, (c.y1 + c.y2) / 2)).toBe(false);
    }
    // blank in mm matches the layout in cm
    expect(d.pieces[0].width).toBeCloseTo(layout.blank.length * 10, 6);
  });

  it('slotted dieline: sleeve has no flaps, FOL flaps are deeper than RSC', () => {
    const rsc = dielineForDesign(design('rsc'));
    const fol = dielineForDesign(design('fol'));
    const sleeve = dielineForDesign(design('sleeve'));
    expect(fol.height).toBeGreaterThan(rsc.height);
    expect(sleeve.height).toBeLessThan(rsc.height);
  });

  it('blank size is reported per piece in cm', () => {
    const b = blankSizeForDesign(design('telescope'));
    expect(b.pieces).toBe(2);
    expect(b.areaM2).toBeGreaterThan(0);
  });
});

describe('codec with the new faces', () => {
  it('round-trips lid artwork', () => {
    const d = design('telescope', {
      lidDepth: 6,
      finish: 'gloss',
      insideColorHex: '#f4f2ec',
      textElements: [
        { id: 't', face: 'lid', text: 'Hi', font: 'Inter', size: 24, color: '#111111', position: { x: 0.5, y: 0.5 }, rotation: 0, align: 'center' },
        { id: 'u', face: 'lid-front', text: 'Hey', font: 'Inter', size: 24, color: '#111111', position: { x: 0.5, y: 0.5 }, rotation: 0, align: 'center' },
      ],
    });
    expect(parseDesign(serializeDesign(d, { includeImages: true }))).toEqual(d);
  });
});

/** World direction of a decal's local axis */
function decalAxes(rig: CartonRig, face: BoxFace) {
  rig.object3d.updateMatrixWorld(true);
  let decal: THREE.Object3D | null = null;
  rig.object3d.traverse((o) => {
    if (o.userData.face === face && (o as THREE.Mesh).renderOrder === 1) decal = o;
  });
  if (!decal) throw new Error(`no decal for ${face}`);
  const m = new THREE.Matrix3().setFromMatrix4((decal as THREE.Object3D).matrixWorld);
  const axis = (v: THREE.Vector3) => v.applyMatrix3(m).normalize();
  return { x: axis(new THREE.Vector3(1, 0, 0)), y: axis(new THREE.Vector3(0, 1, 0)), n: axis(new THREE.Vector3(0, 0, 1)) };
}

/** Viewer-right / up for a face seen from outside (top faces seen from the front) */
const EXPECTED: Partial<Record<BoxFace, { n: number[]; x: number[]; y: number[] }>> = {
  front: { n: [0, 0, 1], x: [1, 0, 0], y: [0, 1, 0] },
  back: { n: [0, 0, -1], x: [-1, 0, 0], y: [0, 1, 0] },
  left: { n: [-1, 0, 0], x: [0, 0, 1], y: [0, 1, 0] },
  right: { n: [1, 0, 0], x: [0, 0, -1], y: [0, 1, 0] },
  lid: { n: [0, 1, 0], x: [1, 0, 0], y: [0, 0, -1] },
  'lid-front': { n: [0, 0, 1], x: [1, 0, 0], y: [0, 1, 0] },
  'lid-left': { n: [-1, 0, 0], x: [0, 0, 1], y: [0, 1, 0] },
  'lid-right': { n: [1, 0, 0], x: [0, 0, -1], y: [0, 1, 0] },
};

function rigFor(template: BoxTemplate, dims = DIMS) {
  const layout = layoutForDesign({ ...design(template), dimensions: dims });
  const rig = createCartonRig(layout);
  rig.update(layout, board);
  rig.setPose(1);
  return { rig, layout };
}

describe('rigs (scene graph)', () => {
  it.each(['rsc', 'hsc', 'fol', 'sleeve', 'telescope', 'mailer', 'pizza', 'tray'] as BoxTemplate[])(
    '%s assembles to its outside size, standing on the ground',
    (template) => {
      const { rig, layout } = rigFor(template);
      const box = rig.getBounds();
      const size = box.getSize(new THREE.Vector3());
      expect(box.min.y).toBeCloseTo(0, 4);
      expect(size.x).toBeCloseTo(layout.outside.length, 1);
      expect(size.z).toBeCloseTo(layout.outside.width, 1);
      expect(size.y).toBeCloseTo(layout.outside.height, 1);
      expect(rig.getPrintSurfaces().map((s) => s.face).sort()).toEqual(Object.keys(getLayoutFaceSizes(layout)).sort());
      rig.dispose();
    }
  );

  it.each(['rsc', 'mailer', 'telescope'] as BoxTemplate[])('%s artwork reads upright on every visible face', (template) => {
    const { rig } = rigFor(template);
    for (const { face } of rig.getPrintSurfaces()) {
      const want = EXPECTED[face];
      if (!want) continue;
      const got = decalAxes(rig, face);
      expect(got.n.toArray().map((v) => Math.round(v) + 0)).toEqual(want.n);
      expect(got.x.toArray().map((v) => Math.round(v) + 0)).toEqual(want.x);
      expect(got.y.toArray().map((v) => Math.round(v) + 0)).toEqual(want.y);
    }
    rig.dispose();
  });

  it('telescope lid top reads upright when the box is wider than long', () => {
    const { rig } = rigFor('telescope', { length: 20, width: 30, height: 12 });
    const got = decalAxes(rig, 'lid');
    expect(got.x.toArray().map((v) => Math.round(v) + 0)).toEqual([1, 0, 0]);
    expect(got.y.toArray().map((v) => Math.round(v) + 0)).toEqual([0, 0, -1]);
    rig.dispose();
  });

  it('flat blanks lie on the ground and are as large as the blank', () => {
    const { rig, layout } = rigFor('mailer');
    rig.setPose(0);
    const size = rig.getBounds().getSize(new THREE.Vector3());
    expect(rig.getBounds().min.y).toBeCloseTo(0, 4);
    if (layout.kind !== 'diecut') throw new Error('kind');
    expect(Math.max(size.x, size.z)).toBeCloseTo(Math.max(layout.blank.length, layout.blank.height), 1);
    expect(size.y).toBeLessThan(layout.thickness * 1.01);
  });

  it('resizes in place and hides the front in cut-away', () => {
    const { rig } = rigFor('mailer');
    const meshes: THREE.Mesh[] = [];
    rig.object3d.traverse((o) => (o as THREE.Mesh).isMesh && meshes.push(o as THREE.Mesh));
    const before = meshes.map((m) => m.geometry.getAttribute('position').array);
    const bigger = layoutForDesign({ ...design('mailer'), dimensions: { length: 50, width: 40, height: 10 } });
    rig.update(bigger, board);
    expect(meshes.map((m) => m.geometry.getAttribute('position').array)).toEqual(before.map((a) => a));
    meshes.forEach((m, i) => expect(m.geometry.getAttribute('position').array).toBe(before[i]));
    rig.setCutaway(true);
    let frontVisible = true;
    rig.object3d.traverse((o) => {
      if (o.userData.face === 'front' && (o as THREE.Mesh).renderOrder === 0) frontVisible = o.visible;
    });
    expect(frontVisible).toBe(false);
    const snapshot = rig.createSnapshot();
    expect(snapshot).not.toBe(rig.object3d);
    rig.dispose();
  });
});
