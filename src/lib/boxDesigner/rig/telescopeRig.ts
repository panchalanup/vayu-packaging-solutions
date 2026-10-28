/**
 * TelescopeRig: a base and a lid, each a BoxRig (HSC), behind the common CartonRig API.
 *
 *   u = 0      both flat blanks, side by side
 *   0 -> .6    both fold (each HSC runs its own timeline) and move to stand next to each other
 *   u = .6     LID OFF: open base, lid beside it
 *   .6 -> 1    the lid lifts, turns over (about Z) and settles on the base
 *
 * Orientation of the turned lid: rotating about Z maps (x, y) -> (-x, -y), so the lid's walls keep facing the
 * same way but upside down (their artwork is turned half a turn in the layout), its right wall becomes the box's
 * left (faces are named for where they end up), and its outer bottom flap becomes the printed top.
 */

import * as THREE from 'three';
import type { BoxFace, PrintFinish } from '@/types/boxDesigner';
import type { BoardSpec } from '../boardSpecs';
import { BoxRig } from './boxRig';
import { noRaycast, type CartonRig, type PrintSurfaceSize } from './panelRig';
import { TELESCOPE_LID_OFF, type TelescopeLayout } from './telescopeLayout';

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const smooth = (a: number, b: number, x: number) => {
  const k = clamp01((x - a) / (b - a));
  return k * k * (3 - 2 * k);
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

const isLidFace = (face: BoxFace) => face === 'lid' || face.startsWith('lid-');

export class TelescopeRig implements CartonRig {
  readonly object3d = new THREE.Group();
  private readonly root = new THREE.Group();
  readonly base = new BoxRig();
  readonly lid = new BoxRig();
  private layout: TelescopeLayout | null = null;
  private progress = 1;

  private readonly bounds = new THREE.Box3();
  private readonly baseBox = new THREE.Box3();
  private readonly lidBox = new THREE.Box3();
  private readonly scratch = new THREE.Box3();
  private readonly scratchVector = new THREE.Vector3();

  constructor() {
    this.object3d.name = 'TelescopeRig';
    this.object3d.add(this.root);
    this.root.add(this.base.object3d, this.lid.object3d);
  }

  update(layout: TelescopeLayout, board: BoardSpec): void {
    this.layout = layout;
    this.base.update(layout.base, board);
    this.lid.update(layout.lid, board);
    this.applyPose();
  }

  setPose(progress: number): void {
    this.progress = Number.isFinite(progress) ? clamp01(progress) : 1;
    this.applyPose();
  }

  private applyPose() {
    const layout = this.layout;
    if (!layout) return;
    const u = this.progress;
    const k = clamp01(u / TELESCOPE_LID_OFF);
    this.base.setPose(k);
    this.lid.setPose(k);

    const b = this.base.getBounds(this.baseBox).getSize(this.scratchVector).clone();
    const l = this.lid.getBounds(this.lidBox).getSize(this.scratchVector).clone();
    const gap = Math.max(3, 0.15 * Math.max(b.x, l.x));

    // flat: stacked front-to-back (base in front); assembled: in a row (lid on the right)
    const row = smooth(0.3, 0.55, u);
    const depth = b.z + l.z + gap;
    const width = b.x + l.x + gap;
    const baseX = lerp(0, -width / 2 + b.x / 2, row);
    const baseZ = lerp(depth / 2 - b.z / 2, 0, row);
    const lidX = lerp(0, width / 2 - l.x / 2, row);
    const lidZ = lerp(-(depth / 2 - l.z / 2), 0, row);

    // closing: lift, turn over, settle on the base
    const v = ease(clamp01((u - TELESCOPE_LID_OFF) / (1 - TELESCOPE_LID_OFF)));
    const top = layout.base.outside.height + 3 * layout.thickness;
    const bump = layout.base.outside.height / 2 + layout.lid.outside.length / 2 + layout.lid.outside.height + 2;
    this.base.object3d.position.set(lerp(baseX, 0, v), 0, baseZ);
    this.lid.object3d.position.set(lerp(lidX, 0, v), top * v + bump * Math.sin(Math.PI * v), lidZ);
    this.lid.object3d.rotation.z = Math.PI * smooth(0.1, 0.75, v);
    // only parts resting on the ground cast the soft contact shadow
    this.lid.setContactShadow(v === 0);

    this.groundAndCentre();
  }

  private groundAndCentre() {
    this.root.position.set(0, 0, 0);
    this.object3d.updateMatrixWorld(true);
    this.bounds.makeEmpty();
    for (const part of [this.base, this.lid]) {
      part.getBounds(this.scratch).applyMatrix4(part.object3d.matrix);
      this.bounds.union(this.scratch);
    }
    if (this.bounds.isEmpty()) return;
    const centre = this.bounds.getCenter(this.scratchVector);
    this.root.position.set(-centre.x, -Math.min(0, this.bounds.min.y), -centre.z);
    this.bounds.translate(this.root.position);
  }

  getBounds(target = new THREE.Box3()): THREE.Box3 {
    return target.copy(this.bounds);
  }

  private part(face: BoxFace) {
    return isLidFace(face) ? this.lid : this.base;
  }

  setColor(hex: string): void {
    this.base.setColor(hex);
    this.lid.setColor(hex);
  }

  setInsideColor(hex: string | null): void {
    this.base.setInsideColor(hex);
    this.lid.setInsideColor(hex);
  }

  setFinish(finish: PrintFinish): void {
    this.base.setFinish(finish);
    this.lid.setFinish(finish);
  }

  setCutaway(on: boolean): void {
    this.base.setCutaway(on);
    this.lid.setCutaway(on);
  }

  setSelected(face: BoxFace | null): void {
    this.base.setSelected(face);
    this.lid.setSelected(face);
  }

  setHovered(face: BoxFace | null): void {
    this.base.setHovered(face);
    this.lid.setHovered(face);
  }

  getPrintSurfaces(): PrintSurfaceSize[] {
    return [...this.base.getPrintSurfaces(), ...this.lid.getPrintSurfaces()];
  }

  getPrintKey(face: BoxFace): string | undefined {
    return this.part(face).getPrintKey(face);
  }

  setPrint(face: BoxFace, texture: THREE.Texture | null, key: string): void {
    this.part(face).setPrint(face, texture, key);
  }

  enableSurfaceDetail(): void {
    this.base.enableSurfaceDetail();
    this.lid.enableSurfaceDetail();
  }

  createSnapshot(): THREE.Object3D {
    const copy = this.object3d.clone(true);
    copy.traverse((node) => {
      if (node.userData.overlay) node.visible = false;
      node.raycast = noRaycast;
    });
    return copy;
  }

  dispose(): void {
    this.base.dispose();
    this.lid.dispose();
  }
}
