/**
 * SlideRig: the tray and the sleeve of a slide box, each a DieCutRig, behind the common CartonRig API.
 *
 *   u = 0       both flat blanks, stacked front to back
 *   0 -> .45    both fold (each runs its own timeline) and move apart along the slide axis
 *   .5 -> .6    the tray slides most of the way into the sleeve
 *   u = .6      TRAY OUT: the sleeve is made, the tray is a quarter inside it
 *   .6 -> 1     the tray slides all the way in
 */

import * as THREE from 'three';
import type { BoxFace, PrintFinish } from '@/types/boxDesigner';
import type { BoardSpec } from '../boardSpecs';
import { dieTopology } from './dieCutLayout';
import { DieCutRig } from './dieCutRig';
import { noRaycast, type CartonRig, type PrintSurfaceSize } from './panelRig';
import { SLIDE_PULL, SLIDE_TRAY_OUT, type SlideLayout } from './slideLayout';

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const smooth = (a: number, b: number, x: number) => {
  const k = clamp01((x - a) / (b - a));
  return k * k * (3 - 2 * k);
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** Sleeve faces: lid (top), lid-front, lid-back and bottom; everything else belongs to the tray */
const isSleeveFace = (face: BoxFace) => face === 'bottom' || face === 'lid' || face.startsWith('lid-');

const topologyOf = (layout: SlideLayout) => `${dieTopology(layout.tray)}|${dieTopology(layout.sleeve)}`;

export class SlideRig implements CartonRig {
  readonly object3d = new THREE.Group();
  private readonly root = new THREE.Group();
  readonly tray: DieCutRig;
  readonly sleeve: DieCutRig;
  private readonly topology: string;
  private layout: SlideLayout | null = null;
  private progress = 1;

  private readonly bounds = new THREE.Box3();
  private readonly trayBox = new THREE.Box3();
  private readonly sleeveBox = new THREE.Box3();
  private readonly scratch = new THREE.Box3();
  private readonly scratchVector = new THREE.Vector3();

  constructor(layout: SlideLayout) {
    this.tray = new DieCutRig(layout.tray);
    this.sleeve = new DieCutRig(layout.sleeve);
    this.topology = topologyOf(layout);
    this.object3d.name = 'SlideRig';
    this.object3d.add(this.root);
    this.root.add(this.sleeve.object3d, this.tray.object3d);
  }

  update(layout: SlideLayout, board: BoardSpec): void {
    if (topologyOf(layout) !== this.topology) {
      console.warn('SlideRig: layout topology changed; create a new rig');
      return;
    }
    this.layout = layout;
    this.tray.update(layout.tray, board);
    this.sleeve.update(layout.sleeve, board);
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
    const k = clamp01(u / SLIDE_TRAY_OUT);
    this.tray.setPose(k);
    this.sleeve.setPose(k);

    const b = this.tray.getBounds(this.trayBox).getSize(this.scratchVector).clone();
    const s = this.sleeve.getBounds(this.sleeveBox).getSize(this.scratchVector).clone();
    const gap = Math.max(3, 0.15 * Math.max(b.x, s.x));

    // flat: stacked front-to-back; folded: in a row along the slide axis
    const row = smooth(0.2, 0.45, u);
    const depth = b.z + s.z + gap;
    const clearX = s.x / 2 + b.x / 2 + gap;
    const into = ease(clamp01((u - 0.5) / (SLIDE_TRAY_OUT - 0.5)));
    const close = ease(clamp01((u - SLIDE_TRAY_OUT) / (1 - SLIDE_TRAY_OUT)));
    const pull = SLIDE_PULL * layout.tray.outside.length;
    let trayX = clearX * row;
    trayX = lerp(trayX, pull, into);
    trayX = lerp(trayX, 0, close);

    this.sleeve.object3d.position.set(0, 0, lerp(-(depth / 2 - s.z / 2), 0, row));
    // the tray's floor rests on the sleeve's floor once it is in line with it
    this.tray.object3d.position.set(trayX, layout.sleeve.thickness * into, lerp(depth / 2 - b.z / 2, 0, row));
    // only the part on the ground casts the soft contact shadow
    this.tray.setContactShadow(into < 0.5);

    this.groundAndCentre();
  }

  private groundAndCentre() {
    this.root.position.set(0, 0, 0);
    this.object3d.updateMatrixWorld(true);
    this.bounds.makeEmpty();
    for (const part of [this.sleeve, this.tray]) {
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
    return isSleeveFace(face) ? this.sleeve : this.tray;
  }

  setColor(hex: string): void {
    this.tray.setColor(hex);
    this.sleeve.setColor(hex);
  }

  setInsideColor(hex: string | null): void {
    this.tray.setInsideColor(hex);
    this.sleeve.setInsideColor(hex);
  }

  setFinish(finish: PrintFinish): void {
    this.tray.setFinish(finish);
    this.sleeve.setFinish(finish);
  }

  setCutaway(on: boolean): void {
    this.tray.setCutaway(on);
    this.sleeve.setCutaway(on);
  }

  setSelected(face: BoxFace | null): void {
    this.tray.setSelected(face);
    this.sleeve.setSelected(face);
  }

  setHovered(face: BoxFace | null): void {
    this.tray.setHovered(face);
    this.sleeve.setHovered(face);
  }

  getPrintSurfaces(): PrintSurfaceSize[] {
    return [...this.sleeve.getPrintSurfaces(), ...this.tray.getPrintSurfaces()];
  }

  getPrintKey(face: BoxFace): string | undefined {
    return this.part(face).getPrintKey(face);
  }

  setPrint(face: BoxFace, texture: THREE.Texture | null, key: string): void {
    this.part(face).setPrint(face, texture, key);
  }

  enableSurfaceDetail(): void {
    this.tray.enableSurfaceDetail();
    this.sleeve.enableSurfaceDetail();
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
    this.tray.dispose();
    this.sleeve.dispose();
  }
}
