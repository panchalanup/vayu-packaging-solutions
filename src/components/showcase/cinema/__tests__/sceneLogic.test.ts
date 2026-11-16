import { describe, expect, it } from 'vitest';
import { DEFAULT_DESIGN } from '@/lib/boxDesigner/designCodec';
import { CONTAINERS } from '@/lib/tools/cbm';
import { fitScale, iso, isoBounds, paintersOrder, prismFaces } from '../../fx/iso';
import { PRODUCTS, boardTest, cubeGrid, filledCells, flutesFor, loadingFor, outsideCarton, sizeFor } from '../sceneLogic';

const design = { ...DEFAULT_DESIGN, template: 'mailer' as const, dimensions: { length: 25, width: 18, height: 8 } };

describe('isometric helpers', () => {
  it('projects the axes the documented way', () => {
    expect(iso(0, 0, 0)).toEqual({ x: 0, y: 0 });
    expect(iso(10, 0, 0).x).toBeGreaterThan(0); // x goes right
    expect(iso(0, 10, 0).x).toBeLessThan(0); // y goes left
    expect(iso(0, 0, 10).y).toBeLessThan(0); // z goes up the screen
  });

  it('gives each prism three four-corner faces that sit inside its bounds', () => {
    const b = isoBounds(25, 18, 8);
    const faces = prismFaces(25, 18, 8, 1, 0, 0);
    for (const poly of Object.values(faces)) {
      const pts = poly.split(' ').map((p) => p.split(',').map(Number));
      expect(pts).toHaveLength(4);
      for (const [x, y] of pts) {
        expect(x).toBeGreaterThanOrEqual(b.minX - 0.01);
        expect(x).toBeLessThanOrEqual(b.maxX + 0.01);
        expect(y).toBeGreaterThanOrEqual(b.minY - 0.01);
        expect(y).toBeLessThanOrEqual(b.maxY + 0.01);
      }
    }
  });

  it('fits a prism inside the frame with the margin', () => {
    const b = isoBounds(30, 20, 15);
    const s = fitScale(b, 400, 300, 0.1);
    expect((b.maxX - b.minX) * s).toBeLessThanOrEqual(400 * 0.8 + 0.01);
    expect((b.maxY - b.minY) * s).toBeLessThanOrEqual(300 * 0.8 + 0.01);
  });

  it('paints far cells before near ones', () => {
    const order = paintersOrder([
      { x: 2, y: 2, z: 0 },
      { x: 0, y: 0, z: 1 },
      { x: 0, y: 0, z: 0 },
    ]);
    expect(order[0]).toEqual({ x: 0, y: 0, z: 0 });
    expect(order[2]).toEqual({ x: 2, y: 2, z: 0 });
  });
});

describe('Size it', () => {
  it('always recommends a box bigger than the product on every side', () => {
    for (const p of PRODUCTS) {
      const r = sizeFor(p.id);
      const dims = [p.dims.length, p.dims.width].sort((a, b) => b - a);
      expect(r.inside.length).toBeGreaterThan(dims[0]);
      expect(r.inside.width).toBeGreaterThan(dims[1] - 0.001);
      expect(r.inside.height).toBeGreaterThan(p.dims.height);
      expect(r.inside.length).toBeGreaterThanOrEqual(r.inside.width);
    }
  });

  it('gives fragile goods more cushioning than the same product treated as sturdy', () => {
    const sturdy = sizeFor('mug', false);
    const fragile = sizeFor('mug', true);
    expect(fragile.paddingCm).toBeGreaterThan(sturdy.paddingCm);
    expect(fragile.inside.height).toBeGreaterThan(sturdy.inside.height);
  });

  it('falls back to the first product for an unknown id', () => {
    expect(sizeFor('nope').product.id).toBe(PRODUCTS[0].id);
  });
});

describe('Test it', () => {
  it('a thicker board fails at a higher load and stacks no lower', () => {
    const r3 = boardTest(design, '3-ply');
    const r5 = boardTest(design, '5-ply');
    const r7 = boardTest(design, '7-ply');
    expect(r5.failKg).toBeGreaterThan(r3.failKg);
    expect(r7.failKg).toBeGreaterThan(r5.failKg);
    expect(r7.safeKg).toBeGreaterThan(r3.safeKg);
    expect(r7.stackHigh).toBeGreaterThanOrEqual(r3.stackHigh);
  });

  it('counts liners and flutes for the cross-section drawing (one more liner than flutes)', () => {
    expect(boardTest(design, '3-ply')).toMatchObject({ liners: 2, flutes: 1 });
    expect(boardTest(design, '5-ply')).toMatchObject({ liners: 3, flutes: 2 });
    expect(boardTest(design, '7-ply')).toMatchObject({ liners: 4, flutes: 3 });
  });

  it('keeps the safe load well under the failure load', () => {
    const r = boardTest(design, '5-ply');
    expect(r.safeKg).toBeLessThan(r.failKg);
    expect(r.safeKg).toBeGreaterThan(0);
  });

  it('has a flute for every ply', () => {
    for (const ply of ['3-ply', '5-ply', '7-ply'] as const) expect(flutesFor(ply).length).toBeGreaterThan(0);
  });
});

describe('Stack it', () => {
  it('a carton is a little bigger outside than inside', () => {
    const out = outsideCarton({ dimensions: design.dimensions, ply: design.ply, flutes: design.flutes });
    expect(out.length).toBeGreaterThan(design.dimensions.length);
    expect(out.height).toBeGreaterThan(design.dimensions.height);
  });

  it('a 40 ft container takes more cartons than a 20 ft one', () => {
    const a = loadingFor(design, '20ft', 5000)!;
    const b = loadingFor(design, '40ft', 5000)!;
    expect(a.perContainer).toBeGreaterThan(0);
    expect(b.perContainer).toBeGreaterThan(a.perContainer);
    expect(a.fillPct).toBeGreaterThan(0);
    expect(a.fillPct).toBeLessThanOrEqual(100);
    expect(a.cartonsPerPallet).toBeGreaterThan(0);
  });

  it('draws a cube grid for every container, and never lights more cubes than exist', () => {
    for (const c of CONTAINERS) {
      const g = cubeGrid(c);
      expect(g.nx).toBeGreaterThan(g.ny);
      const view = loadingFor(design, c.id, 100000)!;
      expect(view.filledCubes).toBeLessThanOrEqual(g.nx * g.ny * g.nz);
      expect(filledCells(g, view.filledCubes)).toHaveLength(view.filledCubes);
    }
  });

  it('a bigger carton fits fewer to a container', () => {
    const small = loadingFor(design, '20ft', 1000)!;
    const big = loadingFor({ ...design, dimensions: { length: 50, width: 40, height: 30 } }, '20ft', 1000)!;
    expect(big.perContainer).toBeLessThan(small.perContainer);
  });

  it('returns nothing for a size that is not a number', () => {
    expect(loadingFor({ ...design, dimensions: { length: Number.NaN, width: 18, height: 8 } }, '20ft', 10)).toBeNull();
  });
});
