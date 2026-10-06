/**
 * Corrugated panel geometry
 * Each panel is a rigid slab with a fixed topology (6 quads, 24 vertices), so resizing the box only rewrites
 * vertex data in place (bufferSubData) and never allocates new GPU buffers.
 *
 * Local frame: outer (printed) face at z = 0, inner face at z = -t, panel spans x0..x1, y0..y1.
 * A 'mitre' side bevels the inner face back by t at 45 deg: at a 90 deg fold two mitres close the corner flush,
 * and when flat they read as the V of a score line. A 'cut' side is a square cut showing the board edge.
 *
 * Material groups: 0 outer liner, 1 inner liner, 2 edges cut across the flutes (corrugation profile visible),
 * 3 edges cut along the flutes. Flutes run along local Y.
 *
 * A second UV set (uv1) drives a baked ambient-occlusion map on the inner face: sides flagged in `ao` map to the
 * texture border (darkened creases), unflagged sides map to its centre (no darkening). Other faces sit at the
 * centre, so only the inside of the box is affected.
 */

import * as THREE from 'three';
import type { SlabEdges } from './rscLayout';

export const SLAB_VERTEX_COUNT = 24;
export const SLAB_GROUP = { outer: 0, inner: 1, edgeCross: 2, edgeAlong: 3 } as const;

export interface SlabParams {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  /** Board thickness (cm) */
  t: number;
  edges: SlabEdges;
  /** Size of one grain texture tile (cm) */
  grainTileCm: number;
  /** Size of one edge texture tile along the edge (cm) */
  edgeTileCm: number;
  /** Per-panel grain offset so neighbouring panels don't show the same pattern */
  uvOffset?: [number, number];
  /** Inner-face sides that meet another panel inside the box (darkened by the AO map) */
  ao?: { left: boolean; right: boolean; bottom: boolean; top: boolean };
}

/** Allocate a slab geometry (call once per panel, then update with writeSlab) */
export function createSlabGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SLAB_VERTEX_COUNT * 3), 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(SLAB_VERTEX_COUNT * 3), 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(SLAB_VERTEX_COUNT * 2), 2));
  geometry.setAttribute('uv1', new THREE.BufferAttribute(new Float32Array(SLAB_VERTEX_COUNT * 2).fill(0.5), 2));

  const index: number[] = [];
  for (let quad = 0; quad < 6; quad++) {
    const a = quad * 4;
    index.push(a, a + 1, a + 2, a, a + 2, a + 3);
  }
  geometry.setIndex(index);

  // Quad order: outer, inner, bottom, top, left, right
  geometry.addGroup(0, 6, SLAB_GROUP.outer);
  geometry.addGroup(6, 6, SLAB_GROUP.inner);
  geometry.addGroup(12, 12, SLAB_GROUP.edgeCross);
  geometry.addGroup(24, 12, SLAB_GROUP.edgeAlong);
  return geometry;
}

type V3 = [number, number, number];

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const normalize = (v: V3): V3 => {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
};

/** Rewrite a slab's vertices, normals and UVs in place */
export function writeSlab(geometry: THREE.BufferGeometry, p: SlabParams): void {
  const position = geometry.getAttribute('position') as THREE.BufferAttribute;
  const normal = geometry.getAttribute('normal') as THREE.BufferAttribute;
  const uv = geometry.getAttribute('uv') as THREE.BufferAttribute;
  const uv1 = geometry.getAttribute('uv1') as THREE.BufferAttribute | undefined;

  const t = Math.max(1e-4, p.t);
  const x0 = Math.min(p.x0, p.x1);
  const x1 = Math.max(p.x0, p.x1);
  const y0 = Math.min(p.y0, p.y1);
  const y1 = Math.max(p.y0, p.y1);

  // Inner face rectangle (inset by t on mitred sides); never let it invert on tiny panels
  let ix0 = x0 + (p.edges.left === 'mitre' ? t : 0);
  let ix1 = x1 - (p.edges.right === 'mitre' ? t : 0);
  let iy0 = y0 + (p.edges.bottom === 'mitre' ? t : 0);
  let iy1 = y1 - (p.edges.top === 'mitre' ? t : 0);
  if (ix1 - ix0 < 1e-3) ix0 = ix1 = (ix0 + ix1) / 2;
  if (iy1 - iy0 < 1e-3) iy0 = iy1 = (iy0 + iy1) / 2;
  const z = -t;

  const [ou, ov] = p.uvOffset ?? [0, 0];
  const g = p.grainTileCm;
  const e = p.edgeTileCm;

  let vertex = 0;
  const quad = (corners: [V3, V3, V3, V3], uvOf: (v: V3) => [number, number]) => {
    const n = normalize(cross(sub(corners[1], corners[0]), sub(corners[2], corners[0])));
    for (const c of corners) {
      position.setXYZ(vertex, c[0], c[1], c[2]);
      normal.setXYZ(vertex, n[0], n[1], n[2]);
      const [u, v] = uvOf(c);
      uv.setXY(vertex, u, v);
      vertex++;
    }
  };

  const faceUv = (v: V3): [number, number] => [v[0] / g + ou, v[1] / g + ov];
  // Across the thickness: v = 1 at the outer liner, 0 at the inner liner
  const crossUv = (v: V3): [number, number] => [v[0] / e, (v[2] + t) / t];
  const alongUv = (v: V3): [number, number] => [v[1] / e, (v[2] + t) / t];

  // Outer (+Z) and inner (-Z) faces
  quad([[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]], faceUv);
  quad([[ix1, iy0, z], [ix0, iy0, z], [ix0, iy1, z], [ix1, iy1, z]], faceUv);
  // Bottom and top edges (cut across the flutes)
  quad([[x0, y0, 0], [ix0, iy0, z], [ix1, iy0, z], [x1, y0, 0]], crossUv);
  quad([[x1, y1, 0], [ix1, iy1, z], [ix0, iy1, z], [x0, y1, 0]], crossUv);
  // Left and right edges (cut along the flutes)
  quad([[x0, y1, 0], [ix0, iy1, z], [ix0, iy0, z], [x0, y0, 0]], alongUv);
  quad([[x1, y0, 0], [ix1, iy0, z], [ix1, iy1, z], [x1, y1, 0]], alongUv);

  position.needsUpdate = true;
  normal.needsUpdate = true;
  uv.needsUpdate = true;

  // Inner face is quad #1 (vertices 4..7): (ix1,iy0) (ix0,iy0) (ix0,iy1) (ix1,iy1)
  if (uv1) {
    const ao = p.ao ?? { left: false, right: false, bottom: false, top: false };
    const left = ao.left ? 0 : 0.5;
    const right = ao.right ? 1 : 0.5;
    const bottom = ao.bottom ? 0 : 0.5;
    const top = ao.top ? 1 : 0.5;
    uv1.setXY(4, right, bottom);
    uv1.setXY(5, left, bottom);
    uv1.setXY(6, left, top);
    uv1.setXY(7, right, top);
    uv1.needsUpdate = true;
  }

  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
}
