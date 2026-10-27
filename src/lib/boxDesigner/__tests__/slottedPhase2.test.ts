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

import { STYLES, getStyle, getStyleGroup, getLayoutFaceSizes, getLayoutOpenings, getLayoutViewExtents, getRigKey } from '../styles/registry';
import { dielineForDesign, faceSizesForDesign, layoutForDesign } from '../styles/designLayout';
import { dimensionsAfterStyleSwitch, optionsAfterStyleSwitch } from '../styles/switchStyle';
import { computeRscLayout, type RscLayout } from '../rig/rscLayout';
import { poseFromProgress } from '../rig/foldPose';
import {
  handHoleFor,
  openingArea,
  openingOutlines,
  openingsKey,
  resolveOpeningSpec,
  ventRowFor,
  ventSlots,
  windowFor,
  wallOpeningsFor,
  type PanelOpening,
} from '../rig/openings';
import { appendOpeningCuts, type DielineLine } from '../dieline';
import { createCartonRig } from '../rig/createRig';
import type { CartonRig } from '../rig/panelRig';
import { assessStrength, openingWarnings } from '../strength';
import { estimatePrice, OPENING_DIE_COST } from '../pricing';
import { blankSizeForDesign } from '../styles/designLayout';
import { DEFAULT_DESIGN, DEFAULT_OPTIONS, parseDesign, serializeDesign, encodeShareHash, decodeShareHash } from '../designCodec';
import { DESIGNER_STYLES } from '../../designerLeadSchema';
import { getBoardSpec } from '../boardSpecs';
import { BOX_TEMPLATE_IDS, type BoxDesign, type BoxFace, type BoxTemplate } from '@/types/boxDesigner';

const NEW_STYLES = ['carry', 'produce', 'produce-tray', 'tuck-end', 'crash-lock', 'one-two-three'] as const satisfies readonly BoxTemplate[];
const T = 0.66;
const board = getBoardSpec('5-ply');
const design = (template: BoxTemplate, extra: Partial<BoxDesign> = {}): BoxDesign => ({
  ...DEFAULT_DESIGN,
  template,
  dimensions: { ...getStyle(template).defaultDims },
  ...extra,
});
const withOptions = (d: BoxDesign, options: Partial<BoxDesign['options']>): BoxDesign => ({ ...d, options: { ...d.options, ...options } });

function rigFor(d: BoxDesign) {
  const layout = layoutForDesign(d);
  const rig = createCartonRig(layout);
  rig.update(layout, board);
  rig.setPose(1);
  return { rig, layout: layout as RscLayout };
}

describe('registry entries of the slotted family', () => {
  it('adds the six styles with text, icon, group, caps and defaults', () => {
    for (const id of NEW_STYLES) {
      const s = getStyle(id);
      expect(s.id).toBe(id);
      expect(s.rigKind).toBe('slotted');
      expect(s.name.length).toBeGreaterThan(5);
      expect(s.bestFor.length).toBeGreaterThan(10);
      expect(s.iconPath).toMatch(/^M/);
      expect(['Shipping', 'Retail & gifts', 'Food & bakery', 'Fruit & produce', 'Display']).toContain(getStyleGroup(s));
      expect(s.foldStops[0].value).toBe(0);
      expect(s.foldStops[s.foldStops.length - 1].value).toBe(100);
      expect(s.defaultDims.length).toBeGreaterThanOrEqual(5);
    }
    expect(getStyleGroup(getStyle('produce'))).toBe('Fruit & produce');
    expect(getStyleGroup(getStyle('rsc'))).toBe('Shipping');
    expect(getStyle('carry').openings).toEqual({ hand: true });
    expect(getStyle('produce').openings).toEqual({ hand: true, vents: true });
    expect(getStyle('tuck-end').fefco).toBe('');
  });

  it('every id is in the codec list, the lead schema and the registry once', () => {
    const ids = STYLES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of NEW_STYLES) expect(BOX_TEMPLATE_IDS).toContain(id);
    expect([...DESIGNER_STYLES].sort()).toEqual([...BOX_TEMPLATE_IDS].sort());
  });

  it('face sizes follow the style order and match the faces list', () => {
    for (const id of NEW_STYLES) {
      const sizes = faceSizesForDesign(design(id));
      expect(Object.keys(sizes)).toEqual([...getStyle(id).faces]);
    }
    expect(Object.keys(faceSizesForDesign(design('tuck-end')))).toEqual(['lid', 'front', 'back', 'left', 'right', 'bottom']);
  });

  it('uses the slotted rig and keeps one rig key for every size', () => {
    for (const id of NEW_STYLES) {
      expect(getRigKey(layoutForDesign(design(id)))).toBe('slotted');
      expect(getRigKey(layoutForDesign({ ...design(id), dimensions: { length: 55, width: 33, height: 41 } }))).toBe('slotted');
    }
  });
});

describe('openings data', () => {
  it('hand hole, vent row and window stay inside their panel with a margin', () => {
    for (const [w, h] of [[30, 25], [20, 15], [40, 12], [12, 8], [60, 40]] as const) {
      const hand = handHoleFor(w, h);
      if (hand) {
        expect(Math.abs(hand.cx) + hand.width / 2).toBeLessThanOrEqual(w / 2 - 1);
        expect(Math.abs(hand.cy) + hand.height / 2).toBeLessThanOrEqual(h / 2 - 1);
      }
      for (const lowered of [false, true]) {
        const vent = ventRowFor(w, h, lowered);
        if (!vent) continue;
        expect(Math.abs(vent.cy) + vent.height / 2).toBeLessThanOrEqual(h / 2 - 1);
        expect(Math.abs(vent.cx) + vent.width / 2).toBeLessThanOrEqual(w / 2 - 1);
      }
      for (const ratio of [0.2, 0.55, 0.85]) {
        const win = windowFor(w, h, ratio);
        if (!win) continue;
        expect(win.width).toBeLessThanOrEqual(w - 3 + 1e-9);
        expect(win.height).toBeLessThanOrEqual(h - 3 + 1e-9);
      }
    }
    expect(handHoleFor(5, 5)).toBeNull();
    expect(ventRowFor(6, 4)).toBeNull();
    expect(windowFor(4, 4, 0.5)).toBeNull();
  });

  it('vent slots do not overlap and fill the row', () => {
    const row = ventRowFor(30, 20)!;
    const slots = ventSlots(row);
    expect(slots.length).toBe(row.count);
    for (let i = 1; i < slots.length; i++) expect(slots[i].cx - slots[i].width / 2).toBeGreaterThan(slots[i - 1].cx + slots[i - 1].width / 2);
    expect(slots[0].cx - slots[0].width / 2).toBeCloseTo(row.cx - row.width / 2, 6);
    expect(slots[slots.length - 1].cx + slots[slots.length - 1].width / 2).toBeCloseTo(row.cx + row.width / 2, 6);
  });

  it('outlines are closed finite polygons; a vent has one per slot', () => {
    const kinds: PanelOpening[] = [
      { kind: 'hand', cx: 0, cy: 0, width: 12, height: 3 },
      { kind: 'vent', cx: 0, cy: 0, width: 12, height: 4, count: 5 },
      { kind: 'window', cx: 0, cy: 0, width: 10, height: 8 },
    ];
    expect(openingOutlines(kinds[0]).length).toBe(1);
    expect(openingOutlines(kinds[1]).length).toBe(5);
    expect(openingOutlines(kinds[2]).length).toBe(1);
    for (const o of kinds) for (const outline of openingOutlines(o)) for (const [x, y] of outline) {
      expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true);
      expect(Math.abs(x - o.cx)).toBeLessThanOrEqual(o.width / 2 + 1e-9);
      expect(Math.abs(y - o.cy)).toBeLessThanOrEqual(o.height / 2 + 1e-9);
    }
    expect(openingArea(kinds)).toBeGreaterThan(0);
  });

  it('keys change only when the opening changes', () => {
    const a: PanelOpening = { kind: 'hand', cx: 0, cy: 1, width: 12, height: 3 };
    expect(openingsKey([a])).toBe(openingsKey([{ ...a }]));
    expect(openingsKey([a])).not.toBe(openingsKey([{ ...a, width: 12.5 }]));
    expect(openingsKey([])).toBe('');
    expect(openingsKey(undefined)).toBe('');
  });

  it('resolveOpeningSpec: capabilities win, undefined takes the style default, forced is always on', () => {
    expect(resolveOpeningSpec({ hand: true }, { handHoles: true, vents: true, window: true })).toMatchObject({ handHoles: true, vents: false, window: false });
    expect(resolveOpeningSpec({ hand: true }, undefined, { handHoles: true }).handHoles).toBe(true);
    expect(resolveOpeningSpec({ hand: true }, { handHoles: false }, { handHoles: true }).handHoles).toBe(false);
    expect(resolveOpeningSpec({ window: true }, { window: false }, {}, { window: true }).window).toBe(true);
    expect(resolveOpeningSpec(undefined, { handHoles: true }).handHoles).toBe(false);
    expect(resolveOpeningSpec({ window: true }, { window: true, windowRatio: 9 }).windowRatio).toBeLessThanOrEqual(0.85);
    expect(resolveOpeningSpec({ window: true }, { window: true, windowRatio: Number.NaN }).windowRatio).toBeGreaterThan(0.19);
  });

  it('wall rules: hand holes only on short walls, window only on the front', () => {
    const spec = { handHoles: true, vents: true, window: true, windowRatio: 0.5 };
    const short = wallOpeningsFor({ face: 'left', short: true, front: false }, 30, 25, spec);
    expect(short.map((o) => o.kind)).toEqual(['hand', 'vent']);
    const longFront = wallOpeningsFor({ face: 'front', short: false, front: true }, 40, 25, spec);
    expect(longFront.map((o) => o.kind)).toEqual(['vent', 'window']);
    // too low to hold a hand hole and a lowered vent row: the vents are skipped on that wall
    expect(wallOpeningsFor({ face: 'left', short: true, front: false }, 30, 12, spec).map((o) => o.kind)).toEqual(['hand']);
  });
});

describe('openings in layouts', () => {
  it('carry box: hand holes on the short walls only (defaults on, switch off)', () => {
    const on = getLayoutOpenings(layoutForDesign(withOptions(design('carry'), { handHoles: true })));
    expect(Object.keys(on).sort()).toEqual(['left', 'right']);
    expect(on.left![0].kind).toBe('hand');
    const off = getLayoutOpenings(layoutForDesign(design('carry')));
    expect(off).toEqual({});
    // options the style does not offer are ignored
    expect(getLayoutOpenings(layoutForDesign(withOptions(design('carry'), { vents: true, window: true })))).toEqual({});
    // style default applies when the caller passes no options at all
    const bare = layoutForDesign({ ...design('carry'), options: undefined });
    expect(Object.keys(getLayoutOpenings(bare)).sort()).toEqual(['left', 'right']);
  });

  it('produce carton: vents on all four walls, hand holes on the short walls, below the hand hole when it fits', () => {
    const d = withOptions(design('produce'), { handHoles: true, vents: true });
    const map = getLayoutOpenings(layoutForDesign(d));
    expect(Object.keys(map).sort()).toEqual(['back', 'front', 'left', 'right']);
    expect(map.front!.map((o) => o.kind)).toEqual(['vent']);
    expect(map.left!.map((o) => o.kind)).toEqual(['hand', 'vent']);
    expect(map.left![1].cy).toBeLessThan(map.left![0].cy);
  });

  it('window styles put the window on the front wall only, sized by the ratio', () => {
    const small = getLayoutOpenings(layoutForDesign(withOptions(design('tuck-end'), { window: true, windowRatio: 0.3 })));
    const big = getLayoutOpenings(layoutForDesign(withOptions(design('tuck-end'), { window: true, windowRatio: 0.8 })));
    expect(Object.keys(small)).toEqual(['front']);
    expect(big.front![0].width).toBeGreaterThan(small.front![0].width);
  });

  it('openings never change the geometry (face sizes, blank, outside)', () => {
    const plain = design('produce');
    const holes = withOptions(plain, { vents: true, handHoles: true });
    expect(faceSizesForDesign(holes)).toEqual(faceSizesForDesign(plain));
    expect(blankSizeForDesign(holes)).toEqual(blankSizeForDesign(plain));
    expect(layoutForDesign(holes).outside).toEqual(layoutForDesign(plain).outside);
  });
});

describe('tuck-end, crash-lock and 1-2-3 geometry', () => {
  it('tuck-end: lid on the long wall, dust flaps on the short walls, none opposite the lid', () => {
    const l = computeRscLayout({ length: 12, width: 8, height: 14 }, T, { topClosure: 'tuck', bottomClosure: 'tuck' });
    const [front, right, back, left] = l.walls;
    expect(l.closures).toEqual({ top: 'tuck', bottom: 'tuck' });
    expect(back.topFlap.face).toBe('lid');
    expect(back.topFlap.stage).toBe('major');
    expect(back.topFlap.tuck!.depth).toBeGreaterThan(1);
    expect(front.topFlap.depth).toBe(0);
    expect(right.topFlap.depth).toBeGreaterThan(0.4);
    expect(left.topFlap.depth).toBeGreaterThan(0.4);
    expect(right.topFlap.face).toBeNull();
    // the lid reaches across the box; the tab folds down inside the front wall
    expect(back.topFlap.depth).toBeCloseTo(l.outside.width - T - 0.1, 5);
    expect(back.y1).toBeCloseTo(l.outside.height, 5);
    expect(front.y1).toBeCloseTo(l.outside.height - T, 5);
    // blank height covers the lid and its tab at each end
    expect(l.blank.height).toBeGreaterThan(l.outside.height + 2 * back.topFlap.depth);
  });

  it('tuck-end on a box longer across: the lid moves to the left wall', () => {
    const l = computeRscLayout({ length: 8, width: 12, height: 14 }, T, { topClosure: 'tuck' });
    expect(l.walls[3].topFlap.face).toBe('lid');
    expect(l.walls[3].topFlap.depth).toBeCloseTo(l.outside.length - T - 0.1, 5);
    expect(l.walls[1].topFlap.depth).toBe(0);
  });

  it('dust flaps stay clear of the lid wall and the tuck slot', () => {
    const l = computeRscLayout({ length: 12, width: 8, height: 14 }, T, { topClosure: 'tuck' });
    for (const wall of [l.walls[1], l.walls[3]]) {
      const f = wall.topFlap;
      expect(f.x0).toBeGreaterThan(T);
      expect(f.x0 + f.width).toBeLessThan(wall.span - T);
      // the two dust flaps of opposite walls must not collide in the middle of the box
      expect(f.depth).toBeLessThanOrEqual(l.outside.length / 2);
    }
  });

  it('crash-lock: two overlapping long flaps at the bottom, none on the short walls, tuck top', () => {
    const l = computeRscLayout({ length: 20, width: 15, height: 25 }, T, { topClosure: 'tuck', bottomClosure: 'lock', overlapBottom: true });
    const [front, right, back] = l.walls;
    expect(l.closures.bottom).toBe('lock');
    expect(back.bottomFlap.stage).toBe('outer');
    expect(front.bottomFlap.stage).toBe('major');
    expect(back.bottomFlap.depth + front.bottomFlap.depth).toBeGreaterThan(l.outside.width);
    expect(right.bottomFlap.depth).toBe(0);
    expect(back.bottomFlap.face).toBe('bottom');
    expect(back.y0).toBe(0);
    expect(right.y0).toBe(0);
    expect(front.y0).toBeCloseTo(T, 5);
  });

  it('1-2-3 bottom: three layers (like full overlap) with the bottom face on the outer flap', () => {
    const d = design('one-two-three');
    const l = layoutForDesign(d) as RscLayout;
    expect(l.overlapBottom).toBe(true);
    expect(l.closures).toEqual({ top: 'tuck', bottom: 'flaps' });
    expect(l.outside.height).toBeCloseTo(d.dimensions.height + 5 * l.thickness, 5);
    expect(getLayoutFaceSizes(l).bottom).toBeDefined();
    expect(getStyle('one-two-three').bestFor).toMatch(/crash-lock/i);
  });

  it('tuck pose: dust flaps close, then the lid, then the tab folds down; bottom tab likewise', () => {
    const p = (u: number) => poseFromProgress(u, { tuckTop: true, tuckBottom: true });
    const half = Math.PI / 2;
    expect(p(0.72).topTuck).toBe(0);
    expect(p(0.8).topMinor).toBeGreaterThan(p(0.8).topMajor);
    expect(p(0.9).topMinor).toBeCloseTo(half, 6);
    expect(p(1).topMajor).toBeCloseTo(half, 6);
    expect(p(1).topTuck).toBeCloseTo(half, 6);
    expect(p(0.7).bottomTuck).toBeGreaterThan(0);
    expect(p(0.72).bottomTuck).toBeCloseTo(half, 6);
    expect(p(0.72).bottomMajor).toBeCloseTo(half, 6);
    for (let u = 0; u <= 1; u += 0.0005) {
      const a = p(u);
      const b = p(u + 0.0005);
      for (const k of ['topTuck', 'bottomTuck', 'topMajor', 'bottomMajor', 'topMinor'] as const) {
        expect(Number.isFinite(a[k])).toBe(true);
        expect(Math.abs(b[k] - a[k])).toBeLessThan(0.03);
      }
    }
    // plain RSC poses have no tab angles
    expect(poseFromProgress(1).topTuck).toBe(0);
  });
});

describe('rigs of the new styles', () => {
  it.each(NEW_STYLES)('%s assembles to its outside size, standing on the ground', (id) => {
    const { rig, layout } = rigFor(design(id));
    const box = rig.getBounds();
    const size = box.getSize(new THREE.Vector3());
    expect(box.min.y).toBeCloseTo(0, 4);
    expect(size.x).toBeCloseTo(layout.outside.length, 1);
    expect(size.z).toBeCloseTo(layout.outside.width, 1);
    expect(size.y).toBeCloseTo(layout.outside.height, 1);
    expect(rig.getPrintSurfaces().map((s) => s.face).sort()).toEqual(Object.keys(getLayoutFaceSizes(layout)).sort());
    rig.dispose();
  });

  it.each(NEW_STYLES)('%s stays grounded, finite and framed through the whole fold', (id) => {
    const { rig, layout } = rigFor(design(id));
    for (let u = 0; u <= 1.0001; u += 0.05) {
      rig.setPose(Math.min(1, u));
      const box = rig.getBounds();
      expect(box.min.y).toBeCloseTo(0, 3);
      const size = box.getSize(new THREE.Vector3());
      expect([size.x, size.y, size.z].every(Number.isFinite)).toBe(true);
      const e = getLayoutViewExtents(layout, Math.min(1, u));
      expect(e.radius).toBeGreaterThan(0);
      // nothing sticks out of the frame the camera uses
      expect(size.length() / 2).toBeLessThanOrEqual(e.shadowRadius * 1.3);
    }
    rig.setPose(0);
    const flat = rig.getBounds().getSize(new THREE.Vector3());
    expect(Math.max(flat.x, flat.z)).toBeGreaterThan(layout.blank.length * 0.95 - layout.blank.height);
    expect(flat.y).toBeLessThan(layout.thickness * 3.5);
    rig.dispose();
  });

  it('tuck-end tab hangs down inside the front wall when sealed (below the lid, inside the walls)', () => {
    const { rig, layout } = rigFor(design('tuck-end'));
    rig.object3d.updateMatrixWorld(true);
    const t = layout.thickness;
    const tabs: THREE.Box3[] = [];
    rig.object3d.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || !mesh.visible || mesh.userData.face || mesh.renderOrder !== 0) return;
      const box = new THREE.Box3().setFromObject(mesh);
      // a slab that is deep (y) but thin (z) and sits near the front wall: the tuck tab
      const s = box.getSize(new THREE.Vector3());
      if (s.y > 0.5 && s.y < 4 && s.z <= t * 1.2 + 0.01 && s.x > layout.outside.length * 0.5) tabs.push(box);
    });
    expect(tabs.length).toBeGreaterThanOrEqual(1);
    for (const box of tabs) {
      expect(box.max.y).toBeLessThanOrEqual(layout.outside.height + 1e-3);
      expect(Math.abs(box.min.x)).toBeLessThanOrEqual(layout.outside.length / 2);
    }
    rig.dispose();
  });

  /** Artwork on the lid reads upright and left-to-right from the front, for either orientation of the box */
  it.each([
    [{ length: 12, width: 8, height: 14 }],
    [{ length: 8, width: 12, height: 14 }],
    [{ length: 10, width: 10, height: 14 }],
  ])('tuck-end lid artwork reads upright (%j)', (dimensions) => {
    const { rig } = rigFor(design('tuck-end', { dimensions }));
    rig.object3d.updateMatrixWorld(true);
    let decal: THREE.Object3D | null = null;
    rig.object3d.traverse((o) => {
      if (o.userData.face === 'lid' && (o as THREE.Mesh).renderOrder === 1) decal = o;
    });
    expect(decal).not.toBeNull();
    const m = new THREE.Matrix3().setFromMatrix4((decal as unknown as THREE.Object3D).matrixWorld);
    const axis = (v: THREE.Vector3) => v.applyMatrix3(m).normalize().toArray().map((n) => Math.round(n) + 0);
    expect(axis(new THREE.Vector3(0, 0, 1))).toEqual([0, 1, 0]);
    expect(axis(new THREE.Vector3(1, 0, 0))).toEqual([1, 0, 0]);
    expect(axis(new THREE.Vector3(0, 1, 0))).toEqual([0, 0, -1]);
    rig.dispose();
  });
});

describe('opening decals in the rig', () => {
  const openingMeshes = (rig: CartonRig) => {
    const found: { face: BoxFace | null; count: number }[] = [];
    rig.object3d.traverse((o) => {
      if (o.name === 'openings' && o.children.length) found.push({ face: (o.parent as THREE.Object3D).userData.face ?? null, count: o.children.length });
    });
    return found;
  };

  it('draws cavity + rim per hole and slot, plus a film for windows; nothing when off', () => {
    const off = rigFor(design('produce'));
    expect(openingMeshes(off.rig)).toEqual([]);
    off.rig.dispose();

    const on = rigFor(withOptions(design('produce'), { handHoles: true, vents: true }));
    const groups = openingMeshes(on.rig);
    expect(groups.length).toBe(4);
    // left wall: hand (2 meshes) + vent row (2 meshes per slot)
    const left = getLayoutOpenings(on.layout).left!;
    const expected = 2 + left[1].count! * 2;
    expect(groups.find((g) => g.face === 'left')!.count).toBe(expected);
    on.rig.dispose();

    const win = rigFor(withOptions(design('tuck-end'), { window: true }));
    expect(openingMeshes(win.rig)).toEqual([{ face: 'front', count: 3 }]);
    win.rig.dispose();
  });

  it('rebuilds only when the openings change and follows resizes in place', () => {
    const d = withOptions(design('carry'), { handHoles: true });
    const { rig } = rigFor(d);
    const ids = () => {
      const out: number[] = [];
      rig.object3d.traverse((o) => o.name === 'openings' && o.children.forEach((c) => out.push(c.id)));
      return out;
    };
    const before = ids();
    expect(before.length).toBeGreaterThan(0);
    rig.update(layoutForDesign(d), board);
    expect(ids()).toEqual(before);
    // a resize changes the wall and therefore the hand hole: meshes are rebuilt, panels are not
    rig.update(layoutForDesign({ ...d, dimensions: { length: 50, width: 36, height: 30 } }), board);
    expect(ids()).not.toEqual(before);
    expect(ids().length).toBe(before.length);
    // switching it off clears the decals
    rig.update(layoutForDesign(withOptions(d, { handHoles: false })), board);
    expect(ids()).toEqual([]);
    rig.dispose();
  });

  it('decals sit on the outside of their wall, centred on the panel', () => {
    const { rig } = rigFor(withOptions(design('carry'), { handHoles: true }));
    rig.object3d.updateMatrixWorld(true);
    let group: THREE.Object3D | null = null;
    rig.object3d.traverse((o) => {
      if (o.name === 'openings' && o.children.length && (o.parent as THREE.Object3D).userData.face === 'right') group = o;
    });
    const world = new THREE.Vector3();
    (group as unknown as THREE.Object3D).getWorldPosition(world);
    const box = rig.getBounds();
    // right wall: on the +X side of the carton, mid-depth
    expect(world.x).toBeGreaterThan(box.max.x - 0.2);
    expect(Math.abs(world.z - (box.min.z + box.max.z) / 2)).toBeLessThan(0.1);
    rig.dispose();
  });
});

describe('openings in the dieline', () => {
  const cuts = (d: ReturnType<typeof dielineForDesign>) => d.lines.filter((l) => l.kind === 'cut').length;
  const segments = (list: PanelOpening[]) => list.reduce((n, o) => n + openingOutlines(o).reduce((m, outline) => m + outline.length, 0), 0);

  it('adds one real cut line per outline segment, in the right place, without moving the blank', () => {
    const plain = design('produce');
    const holes = withOptions(plain, { vents: true, handHoles: true });
    const a = dielineForDesign(plain);
    const b = dielineForDesign(holes);
    const map = getLayoutOpenings(layoutForDesign(holes));
    const expected = Object.values(map).reduce((n, list) => n + segments(list!), 0);
    expect(cuts(b) - cuts(a)).toBe(expected);
    expect(b.lines.filter((l) => l.kind === 'score').length).toBe(a.lines.filter((l) => l.kind === 'score').length);
    expect(b.pieces).toEqual(a.pieces);
    expect(b.width).toBe(a.width);
    expect(b.labels.map((l) => l.text).join(' ')).toMatch(/cut-out/);
    // every new line lies inside the blank
    for (const l of b.lines) for (const [x, y] of [[l.x1, l.y1], [l.x2, l.y2]]) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(b.width);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(b.height);
    }
  });

  it('a hand hole is drawn on its own wall panel (left wall of the carry box)', () => {
    const d = withOptions(design('carry'), { handHoles: true });
    const base = dielineForDesign(design('carry'));
    const withHoles = dielineForDesign(d);
    const extra = withHoles.lines.filter((l) => !base.lines.some((o) => o.x1 === l.x1 && o.y1 === l.y1 && o.x2 === l.x2 && o.y2 === l.y2));
    const layout = layoutForDesign(d) as RscLayout;
    const xs = extra.flatMap((l) => [l.x1, l.x2]);
    // wall panels start after the glue tab: front, right, back, left
    const tab = layout.tab.width * 10 + 20;
    const rightStart = tab + layout.walls[0].span * 10;
    const leftStart = tab + (layout.walls[0].span + layout.walls[1].span + layout.walls[2].span) * 10;
    const inRight = xs.filter((x) => x > rightStart && x < rightStart + layout.walls[1].span * 10).length;
    const inLeft = xs.filter((x) => x > leftStart && x < leftStart + layout.walls[3].span * 10).length;
    expect(inRight + inLeft).toBe(xs.length);
    expect(inRight).toBeGreaterThan(0);
    expect(inLeft).toBeGreaterThan(0);
  });

  it('appendOpeningCuts honours a mapping (rotation / flip) and ignores nothing', () => {
    const o: PanelOpening = { kind: 'hand', cx: 2, cy: 1, width: 10, height: 4 };
    const plain: DielineLine[] = [];
    const flipped: DielineLine[] = [];
    expect(appendOpeningCuts(plain, [o], 100, 100)).toBe(1);
    appendOpeningCuts(flipped, [o], 100, 100, (px, py) => [py, px]);
    expect(plain.length).toBe(flipped.length);
    expect(plain.every((l) => l.kind === 'cut')).toBe(true);
    const px = plain.flatMap((l) => [l.x1, l.x2]);
    const fy = flipped.flatMap((l) => [l.y1, l.y2]);
    expect(Math.min(...px)).toBeCloseTo(100 + (2 - 5) * 10, 5);
    expect(Math.min(...fy)).toBeCloseTo(100 + (2 - 5) * 10, 5);
    expect(appendOpeningCuts([], undefined, 0, 0)).toBe(0);
  });

  it('tuck-end and crash-lock dielines: closed outlines, cut dust flaps, tab scores, crash creases', () => {
    const tuck = dielineForDesign(design('tuck-end'));
    const rsc = dielineForDesign(design('rsc'));
    expect(tuck.lines.length).toBeGreaterThan(rsc.lines.length * 0.8);
    expect(tuck.lines.filter((l) => l.kind === 'score').length).toBeGreaterThan(8);
    const crash = dielineForDesign(design('crash-lock'));
    const oneTwoThree = dielineForDesign(design('one-two-three'));
    // crash-lock adds diagonal crease scores on top of the straight hinge scores
    const diagonal = (l: DielineLine) => Math.abs(l.x1 - l.x2) > 1 && Math.abs(l.y1 - l.y2) > 1 && l.kind === 'score';
    expect(crash.lines.some(diagonal)).toBe(true);
    expect(oneTwoThree.lines.some(diagonal)).toBe(false);
    for (const dl of [tuck, crash, oneTwoThree]) {
      for (const l of dl.lines) expect([l.x1, l.y1, l.x2, l.y2].every(Number.isFinite)).toBe(true);
      expect(dl.pieces[0].width).toBeGreaterThan(0);
    }
  });

  it('blank sizes of the new styles are finite and plausible', () => {
    for (const id of NEW_STYLES) {
      const b = blankSizeForDesign(design(id));
      expect(b.pieces).toBe(1);
      expect(b.areaM2).toBeGreaterThan(0.01);
      const dims = design(id).dimensions;
      expect(b.lengthCm).toBeGreaterThan(2 * (dims.length + dims.width));
    }
    // a tuck-end blank is taller than the box by about two lids with tabs
    const l = layoutForDesign(design('tuck-end')) as RscLayout;
    expect(blankSizeForDesign(design('tuck-end')).heightCm).toBeGreaterThan(l.outside.height + l.walls[2].topFlap.depth);
  });
});

describe('estimate, strength and style switching with openings', () => {
  it('strength warns about holes and vents (and only then), with the literature range as words', () => {
    expect(openingWarnings(design('produce'))).toEqual([]);
    const notes = openingWarnings(withOptions(design('produce'), { vents: true, handHoles: true }));
    expect(notes.length).toBeGreaterThanOrEqual(1);
    expect(notes[0]).toMatch(/10-40%/);
    expect(openingWarnings(withOptions(design('tuck-end'), { window: true }))).toEqual([]);
    const strength = assessStrength(withOptions(design('produce'), { vents: true }));
    expect(strength.warnings.length).toBeGreaterThanOrEqual(1);
    expect(assessStrength(design('rsc')).warnings).toEqual([]);
  });

  it('the estimate adds a die for holes and vents on slotted styles, and film for a window', () => {
    const base = estimatePrice({ ...design('produce'), quantity: 500 });
    const holes = estimatePrice({ ...withOptions(design('produce'), { vents: true }), quantity: 500 });
    expect(holes.setup - base.setup).toBe(OPENING_DIE_COST);
    expect(holes.perBox).toBeGreaterThan(base.perBox);
    const plainTuck = estimatePrice({ ...design('tuck-end'), quantity: 500 });
    const windowTuck = estimatePrice({ ...withOptions(design('tuck-end'), { window: true }), quantity: 500 });
    expect(windowTuck.breakdown.conversion).toBeGreaterThan(plainTuck.breakdown.conversion);
    // no cut-outs means no change for the older styles
    expect(estimatePrice({ ...design('rsc'), quantity: 500 }).setup).toBe(estimatePrice({ ...design('rsc'), quantity: 500, options: DEFAULT_OPTIONS }).setup);
  });

  it('switching style follows style defaults, keeps what the user chose and clears what the style lacks', () => {
    const rscDims = getStyle('rsc').defaultDims;
    expect(dimensionsAfterStyleSwitch('rsc', 'produce', rscDims)).toEqual(getStyle('produce').defaultDims);
    const toCarry = optionsAfterStyleSwitch('rsc', 'carry', DEFAULT_OPTIONS);
    expect(toCarry.handHoles).toBe(true);
    const toProduce = optionsAfterStyleSwitch('carry', 'produce', toCarry);
    expect(toProduce).toMatchObject({ handHoles: true, vents: true });
    // the user switched hand holes off on the carry box: that choice survives
    const chosen = optionsAfterStyleSwitch('rsc', 'carry', { ...DEFAULT_OPTIONS, handHoles: false });
    expect(chosen.handHoles).toBe(true);
    const off = optionsAfterStyleSwitch('carry', 'produce', { ...toCarry, handHoles: false });
    expect(off.handHoles).toBe(false);
    // a style without any of them clears everything
    expect(optionsAfterStyleSwitch('produce', 'rsc', toProduce)).toMatchObject({ handHoles: false, vents: false, window: false });
    expect(optionsAfterStyleSwitch('rsc', 'tuck-end', { ...DEFAULT_OPTIONS, vents: true }).vents).toBe(false);
  });
});

describe('codec with the new styles and options', () => {
  it('round-trips every new style with its options (file and share link)', () => {
    for (const id of NEW_STYLES) {
      const d = withOptions(design(id), { handHoles: true, vents: true, window: true, windowRatio: 0.4 });
      expect(parseDesign(serializeDesign(d, { includeImages: true }))).toEqual(d);
      expect(decodeShareHash(encodeShareHash(d))).toEqual({ ...d, faceImages: [] });
    }
  });

  it('rejects unknown style ids and out-of-range options', () => {
    const d = design('carry');
    const bad = JSON.parse(serializeDesign(d, { includeImages: true }));
    expect(parseDesign(JSON.stringify({ ...bad, template: 'hexagon' }))).toBeNull();
    expect(parseDesign(JSON.stringify({ ...bad, options: { ...bad.options, windowRatio: 5 } }))).toBeNull();
  });

  it('older v2 files without options still load with defaults', () => {
    const d = design('rsc');
    const v2 = JSON.parse(serializeDesign(d, { includeImages: true }));
    delete v2.options;
    delete v2.stickers;
    v2.v = 2;
    expect(parseDesign(JSON.stringify(v2))).toEqual(d);
  });
});
