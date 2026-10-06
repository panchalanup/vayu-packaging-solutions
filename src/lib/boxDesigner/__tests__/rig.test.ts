import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { getBoardSpec, getBoardThicknessCm } from '../boardSpecs';
import { computeRscLayout, getViewExtents } from '../rig/rscLayout';
import { poseFromProgress, FOLD_STOPS } from '../rig/foldPose';
import { createSlabGeometry, writeSlab, SLAB_VERTEX_COUNT } from '../rig/panelGeometry';

describe('board specs', () => {
  it('derives caliper from the flute stack', () => {
    expect(getBoardSpec('3-ply').caliperMm).toBeCloseTo(2.8, 2); // B
    expect(getBoardSpec('5-ply').caliperMm).toBeCloseTo(6.6, 2); // BC double wall
    expect(getBoardSpec('7-ply').caliperMm).toBeCloseTo(10.4, 2); // CBC triple wall
    expect(getBoardSpec('3-ply', ['E']).caliperMm).toBeCloseTo(1.6, 2);
  });

  it('has one flute layer per wall and sensible pitches', () => {
    const board = getBoardSpec('7-ply');
    expect(board.layers).toHaveLength(3);
    for (const layer of board.layers) {
      expect(layer.pitchMm).toBeGreaterThan(2);
      expect(layer.pitchMm).toBeLessThan(12);
    }
  });

  it('clamps thickness on tiny boxes', () => {
    const board = getBoardSpec('7-ply');
    expect(getBoardThicknessCm(board, { length: 30, width: 20, height: 15 })).toBeCloseTo(1.04, 2);
    expect(getBoardThicknessCm(board, { length: 5, width: 5, height: 5 })).toBeCloseTo(0.5, 5);
  });
});

describe('RSC layout', () => {
  const t = 0.66;
  const layout = computeRscLayout({ length: 30, width: 20, height: 15 }, t);

  it('adds board thickness to get outside dimensions', () => {
    expect(layout.outside.length).toBeCloseTo(31.32, 5);
    expect(layout.outside.width).toBeCloseTo(21.32, 5);
    expect(layout.outside.height).toBeCloseTo(17.64, 5);
  });

  it('puts major flaps on the longer walls and makes them meet with a ~3 mm gap', () => {
    const [front, right] = layout.walls;
    expect(front.major).toBe(true);
    expect(right.major).toBe(false);
    expect(layout.gap).toBeCloseTo(0.3, 5);
    expect(2 * layout.flapDepth + layout.gap).toBeCloseTo(layout.outside.width, 5);
  });

  it('stacks the flaps: major walls are 2t taller than minor walls', () => {
    const [front, right] = layout.walls;
    expect(front.y1 - front.y0 - (right.y1 - right.y0)).toBeCloseTo(2 * t, 5);
    expect(right.y0).toBeCloseTo(t, 5);
  });

  it('keeps minor flaps between the inner faces of the major walls', () => {
    const right = layout.walls[1];
    expect(right.topFlap.width).toBeLessThan(layout.outside.width - 2 * t);
    expect(right.topFlap.x0).toBeGreaterThan(t);
  });

  it('gives small boxes real flaps (old geometry had none below 11.5 cm width)', () => {
    const small = computeRscLayout({ length: 15, width: 10, height: 10 }, 0.66);
    expect(small.flapDepth).toBeGreaterThan(4);
    const tiny = computeRscLayout({ length: 5, width: 5, height: 5 }, 0.66);
    expect(tiny.thickness).toBeCloseTo(0.5, 5);
    expect(tiny.flapDepth).toBeGreaterThan(2);
    expect(tiny.tab.width).toBeGreaterThan(0);
  });

  it('swaps major/minor walls when width exceeds length', () => {
    const wide = computeRscLayout({ length: 20, width: 40, height: 15 }, 0.4);
    expect(wide.walls[0].major).toBe(false);
    expect(wide.walls[1].major).toBe(true);
    expect(2 * wide.flapDepth + wide.gap).toBeCloseTo(wide.outside.length, 5);
  });

  it('survives garbage input without NaN', () => {
    const bad = computeRscLayout({ length: NaN, width: -3, height: Infinity }, NaN);
    const values = [bad.thickness, bad.flapDepth, bad.outside.length, bad.blank.length, bad.tab.height];
    values.forEach((v) => expect(Number.isFinite(v)).toBe(true));
  });

  it('frames the flat blank wider than the assembled box', () => {
    const flat = getViewExtents(layout, 0);
    const sealed = getViewExtents(layout, 1);
    expect(flat.radius).toBeGreaterThan(sealed.radius);
    expect(sealed.center[1]).toBeCloseTo(layout.outside.height / 2, 5);
    expect(sealed.shadowRadius).toBeGreaterThanOrEqual(flat.radius);
  });

  it('frames the open top taller than the sealed box', () => {
    const open = getViewExtents(layout, 0.72);
    const sealed = getViewExtents(layout, 1);
    expect(open.radius).toBeGreaterThan(sealed.radius);
    expect(open.center[1]).toBeCloseTo((layout.outside.height + layout.flapDepth) / 2, 5);
    expect(open.shadowRadius).toBeGreaterThanOrEqual(open.radius);
  });
});

describe('fold pose', () => {
  it('starts as a flat blank and ends sealed', () => {
    const flat = poseFromProgress(FOLD_STOPS.flat);
    expect(flat.tilt).toBeCloseTo(-Math.PI / 2, 6);
    flat.walls.forEach((a) => expect(a).toBeCloseTo(0, 9));
    expect(flat.topMajor).toBeCloseTo(0, 9);

    const sealed = poseFromProgress(FOLD_STOPS.sealed);
    expect(sealed.tilt).toBeCloseTo(0, 6);
    sealed.walls.forEach((a) => expect(a).toBeCloseTo(Math.PI / 2, 6));
    expect(sealed.topMajor).toBeCloseTo(Math.PI / 2, 6);
    expect(sealed.bottomMinor).toBeCloseTo(Math.PI / 2, 6);
  });

  it('has an open top with the bottom closed and top flaps relaxed outward', () => {
    const open = poseFromProgress(FOLD_STOPS.openTop);
    expect(open.bottomMajor).toBeCloseTo(Math.PI / 2, 6);
    expect(open.topMinor).toBeLessThan(0);
    expect(open.topMajor).toBeLessThan(0);
  });

  it('never folds past 90 degrees', () => {
    for (let u = 0; u <= 1.0001; u += 0.01) {
      const p = poseFromProgress(u);
      [...p.walls, p.tab, p.topMajor, p.topMinor, p.bottomMajor, p.bottomMinor].forEach((a) =>
        expect(a).toBeLessThanOrEqual(Math.PI / 2 + 1e-9)
      );
    }
  });

  it('is continuous (no jumps between choreography segments)', () => {
    // steepest legit change: easeInOutCubic peak slope 3 x 90 deg over 0.11 of the timeline ~ 0.021 rad per 0.0005 step;
    // a real discontinuity would be several degrees (> 0.05 rad)
    let prev = poseFromProgress(0);
    for (let i = 1; i <= 2000; i++) {
      const next = poseFromProgress(i / 2000);
      const keys = ['tilt', 'tab', 'topMajor', 'topMinor', 'bottomMajor', 'bottomMinor'] as const;
      keys.forEach((k) => expect(Math.abs(next[k] - prev[k])).toBeLessThan(0.03));
      next.walls.forEach((a, w) => expect(Math.abs(a - prev.walls[w])).toBeLessThan(0.03));
      prev = next;
    }
  });

  it('tucks the glue tab before the last wall closes', () => {
    const p = poseFromProgress(0.24);
    expect(p.tab).toBeCloseTo(Math.PI / 2, 6);
    expect(p.walls[2]).toBeLessThan(Math.PI / 2);
  });

  it('treats NaN as sealed and clamps out-of-range input', () => {
    expect(poseFromProgress(NaN).tilt).toBeCloseTo(0, 6);
    expect(poseFromProgress(-5).tilt).toBeCloseTo(-Math.PI / 2, 6);
  });
});

describe('panel geometry', () => {
  const edges = { left: 'mitre', right: 'mitre', bottom: 'cut', top: 'cut' } as const;

  it('keeps a fixed topology and rewrites in place', () => {
    const geometry = createSlabGeometry();
    const positionArray = geometry.getAttribute('position').array;
    writeSlab(geometry, { x0: 0, x1: 30, y0: 0, y1: 15, t: 0.66, edges, grainTileCm: 24, edgeTileCm: 4 });
    writeSlab(geometry, { x0: 0, x1: 50, y0: 0, y1: 30, t: 0.66, edges, grainTileCm: 24, edgeTileCm: 4 });
    expect(geometry.getAttribute('position').count).toBe(SLAB_VERTEX_COUNT);
    expect(geometry.getAttribute('position').array).toBe(positionArray); // same buffer, no reallocation
    expect(geometry.index!.count).toBe(36);
    expect(geometry.groups).toHaveLength(4);
  });

  it('has outward unit normals and a mitred inner face', () => {
    const geometry = createSlabGeometry();
    writeSlab(geometry, { x0: 0, x1: 30, y0: 0, y1: 15, t: 0.66, edges, grainTileCm: 24, edgeTileCm: 4 });
    const n = geometry.getAttribute('normal');
    for (let i = 0; i < n.count; i++) {
      expect(Math.hypot(n.getX(i), n.getY(i), n.getZ(i))).toBeCloseTo(1, 5);
    }
    expect(n.getZ(0)).toBeCloseTo(1, 6); // outer face
    expect(n.getZ(4)).toBeCloseTo(-1, 6); // inner face

    const box = new THREE.Box3().setFromBufferAttribute(geometry.getAttribute('position') as THREE.BufferAttribute);
    expect(box.min.z).toBeCloseTo(-0.66, 6);
    expect(box.max.z).toBeCloseTo(0, 6);

    // inner face is inset by t on the mitred left/right sides only
    const p = geometry.getAttribute('position');
    const innerXs = [4, 5, 6, 7].map((i) => p.getX(i));
    expect(Math.min(...innerXs)).toBeCloseTo(0.66, 6);
    expect(Math.max(...innerXs)).toBeCloseTo(30 - 0.66, 6);
  });

  it('never produces NaN on degenerate panels', () => {
    const geometry = createSlabGeometry();
    writeSlab(geometry, {
      x0: 0, x1: 0.5, y0: 0, y1: 0.5, t: 0.66,
      edges: { left: 'mitre', right: 'mitre', bottom: 'mitre', top: 'mitre' },
      grainTileCm: 24, edgeTileCm: 4,
    });
    const p = geometry.getAttribute('position').array as Float32Array;
    expect(Array.from(p).every(Number.isFinite)).toBe(true);
    expect(Number.isFinite(geometry.boundingSphere!.radius)).toBe(true);
  });
});
