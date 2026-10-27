/**
 * DieCutRig: mailer / pizza / tray built from a DieCutLayout hinge tree, with the same public API as BoxRig.
 * The scene graph is built once for a topology (the node ids); every resize rewrites vertices and hinge
 * positions in place. Hierarchy per child: hinge (position + edge rotation) -> slide (double-score inset) -> fold.
 *
 *   object3d
 *   ├─ root   (ground snap + centring)
 *   │  └─ flip (turns the blank over: print side up when flat, outer face down when assembled)
 *   │     └─ base panel + hinge tree
 *   └─ contact shadow
 */

import * as THREE from 'three';
import type { BoardSpec } from '../boardSpecs';
import { dieNodes, dieTopology, type DieCutLayout, type DieFold, type DieNode, type HingeSide } from './dieCutLayout';
import { dieCutPoseFromProgress } from './dieCutPose';
import { PanelRig, type Panel } from './panelRig';

const SIDE_ROTATION: Record<HingeSide, number> = {
  top: 0,
  bottom: Math.PI,
  left: Math.PI / 2,
  right: -Math.PI / 2,
};

interface RigNode {
  id: string;
  panel: Panel;
  hinge: THREE.Group | null;
  slide: THREE.Group | null;
  fold: THREE.Group | null;
  foldKey: DieFold | null;
  inset: number;
}

export class DieCutRig extends PanelRig {
  readonly topology: string;
  private readonly flip = new THREE.Group();
  private readonly nodes = new Map<string, RigNode>();
  private layout: DieCutLayout | null = null;
  private progress = 1;

  /** Build the scene graph for this layout's topology (sizes are applied by update) */
  constructor(layout: DieCutLayout) {
    super('DieCutRig');
    this.topology = dieTopology(layout);
    this.root.add(this.flip);
    this.build(layout.root, this.flip);
  }

  private build(spec: DieNode, parent: THREE.Object3D) {
    let container = parent;
    let hinge: THREE.Group | null = null;
    let slide: THREE.Group | null = null;
    let fold: THREE.Group | null = null;
    if (spec.hinge) {
      hinge = new THREE.Group();
      slide = new THREE.Group();
      fold = new THREE.Group();
      hinge.name = `hinge-${spec.id}`;
      parent.add(hinge);
      hinge.add(slide);
      slide.add(fold);
      container = fold;
    }
    const panel = this.createPanel(!!spec.face, spec.cutaway);
    container.add(panel.mesh);
    this.nodes.set(spec.id, {
      id: spec.id,
      panel,
      hinge,
      slide,
      fold,
      foldKey: spec.hinge?.fold ?? null,
      inset: 0,
    });
    for (const child of spec.children) this.build(child, container);
  }

  /** Resize for new dimensions or board (in place). The layout must have this rig's topology. */
  update(layout: DieCutLayout, board: BoardSpec): void {
    if (dieTopology(layout) !== this.topology) {
      console.warn('DieCutRig: layout topology changed; create a new rig');
      return;
    }
    this.layout = layout;
    this.setBoard(board);
    const t = layout.thickness;
    for (const spec of dieNodes(layout.root)) {
      const node = this.nodes.get(spec.id)!;
      if (spec.hinge && node.hinge) {
        node.hinge.position.set(spec.hinge.x, spec.hinge.y, 0);
        node.hinge.rotation.z = SIDE_ROTATION[spec.hinge.side];
        node.inset = spec.hinge.inset;
      }
      this.setPanelFace(node.panel, spec.face, spec.printTurns);
      this.writePanel(node.panel, spec.rect, spec.edges, t, spec.ao);
      this.setPanelOpenings(node.panel, spec.face ? layout.openings?.[spec.face] : undefined);
    }
    this.applyHighlight();
    this.applyPose();
  }

  setPose(progress: number): void {
    this.progress = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 1;
    this.applyPose();
  }

  private applyPose() {
    const layout = this.layout;
    if (!layout) return;
    const pose = dieCutPoseFromProgress(this.progress * layout.timelineEnd, layout.schedule);
    this.flip.rotation.x = pose.flip;
    this.nodes.forEach((node) => {
      if (!node.fold || !node.slide || !node.foldKey) return;
      const angle = pose.angles[node.foldKey];
      node.fold.rotation.x = -angle;
      // double scores: the hinge line moves back into the parent as the panel folds
      node.slide.position.y = -node.inset * Math.min(1, Math.abs(angle) / (Math.PI / 2));
    });
    this.groundAndCentre();
  }
}
