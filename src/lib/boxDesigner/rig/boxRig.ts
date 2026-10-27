/**
 * BoxRig
 * A slotted carton (RSC, HSC, FOL, sleeve, telescope parts) as one persistent three.js scene graph. React drives
 * it, but it is never rebuilt:
 *  - update(layout, board): rewrites vertex data in place (fixed topology, zero GPU buffer churn)
 *  - setPose(u):            only rotates hinges, then grounds and centres the carton
 *  - setColor / setSelected / setPrint / setFinish: mutate materials; nothing is recreated on hover or selection
 *  - dispose():             frees everything it created (R3F never disposes <primitive> objects)
 *
 * Hierarchy (Y up, front wall faces +Z):
 *   object3d
 *   ├─ root            (ground-snap + centring offset, recomputed per pose)
 *   │  └─ tilt         (stands the tube up; -90 deg = flat blank on the ground)
 *   │     └─ front hinge ─ front wall, top/bottom flap pivots, glue-tab pivot
 *   │                    └─ right hinge ─ right wall, flaps
 *   │                                   └─ back hinge ─ back wall, flaps
 *   │                                                  └─ left hinge ─ left wall, flaps
 *   └─ contact shadow blob
 *
 * Every hinge pivots on the OUTER face line of its score, and every scored edge is mitred on the inner side,
 * so corners close flush at 90 deg and print stays continuous across folds.
 *
 * The paper grain and fibre/flute normal maps take ~150 ms to generate, so they are applied later via
 * enableSurfaceDetail() (called from an idle callback) and the first frame is never blocked by them.
 */

import * as THREE from 'three';
import type { BoardSpec } from '../boardSpecs';
import { poseFromProgress, type RigPose } from './foldPose';
import type { FlapLayout, FlapStage, RscLayout, SlabEdges } from './rscLayout';
import { WALL_ORDER } from './rscLayout';
import { PanelRig, type Panel } from './panelRig';

const MITRE_ALL: SlabEdges = { left: 'mitre', right: 'mitre', bottom: 'mitre', top: 'mitre' };
const OPEN_ENDS: SlabEdges = { left: 'mitre', right: 'mitre', bottom: 'cut', top: 'cut' };
const TOP_FLAP_EDGES: SlabEdges = { left: 'cut', right: 'cut', bottom: 'mitre', top: 'cut' };
const BOTTOM_FLAP_EDGES: SlabEdges = { left: 'cut', right: 'cut', bottom: 'cut', top: 'mitre' };
const TAB_EDGES: SlabEdges = { left: 'cut', right: 'mitre', bottom: 'cut', top: 'cut' };

/** Which inner-face sides sit in a crease inside the assembled box (ambient occlusion) */
const AO_WALL = { left: true, right: true, bottom: true, top: false };
const AO_TOP_FLAP = { left: false, right: false, bottom: true, top: false };
const AO_BOTTOM_FLAP = { left: true, right: true, bottom: false, top: true };

interface WallNode {
  hinge: THREE.Group;
  wall: Panel;
  topPivot: THREE.Group;
  top: Panel;
  bottomPivot: THREE.Group;
  bottom: Panel;
  /** Tuck tabs hinged on the far edge of a lid flap (only present for tuck-end closures) */
  topTuckPivot: THREE.Group;
  topTuck: Panel;
  bottomTuckPivot: THREE.Group;
  bottomTuck: Panel;
}

const TUCK_EDGES: SlabEdges = { left: 'cut', right: 'cut', bottom: 'mitre', top: 'cut' };
const TUCK_EDGES_BOTTOM: SlabEdges = { left: 'cut', right: 'cut', bottom: 'cut', top: 'mitre' };

const angleFor = (pose: RigPose, end: 'top' | 'bottom', stage: FlapStage) => {
  if (end === 'top') return stage === 'minor' ? pose.topMinor : stage === 'major' ? pose.topMajor : pose.topOuter;
  return stage === 'minor' ? pose.bottomMinor : stage === 'major' ? pose.bottomMajor : pose.bottomOuter;
};

export class BoxRig extends PanelRig {
  private readonly tilt = new THREE.Group();
  private readonly walls: WallNode[] = [];
  private readonly tabPivot = new THREE.Group();
  private readonly tab: Panel;

  private layout: RscLayout | null = null;
  private progress = 1;

  constructor() {
    super('BoxRig');
    this.root.add(this.tilt);

    let parent: THREE.Object3D = this.tilt;
    WALL_ORDER.forEach((id) => {
      const hinge = new THREE.Group();
      hinge.name = `hinge-${id}`;
      parent.add(hinge);

      // the front wall and its top flap are what the cut-away view removes
      const wall = this.createPanel(true, id === 'front');
      hinge.add(wall.mesh);

      const topPivot = new THREE.Group();
      hinge.add(topPivot);
      const top = this.createPanel(true, id === 'front');
      topPivot.add(top.mesh);

      const bottomPivot = new THREE.Group();
      hinge.add(bottomPivot);
      const bottom = this.createPanel(true);
      bottomPivot.add(bottom.mesh);

      const topTuckPivot = new THREE.Group();
      topPivot.add(topTuckPivot);
      const topTuck = this.createPanel(false);
      topTuckPivot.add(topTuck.mesh);
      const bottomTuckPivot = new THREE.Group();
      bottomPivot.add(bottomTuckPivot);
      const bottomTuck = this.createPanel(false);
      bottomTuckPivot.add(bottomTuck.mesh);

      this.walls.push({ hinge, wall, topPivot, top, bottomPivot, bottom, topTuckPivot, topTuck, bottomTuckPivot, bottomTuck });
      parent = hinge;
    });

    this.walls[0].hinge.add(this.tabPivot);
    this.tab = this.createPanel(false, true);
    this.tabPivot.add(this.tab.mesh);
  }

  /** Resize / rebuild for new dimensions, style or board (in place, no allocations) */
  update(layout: RscLayout, board: BoardSpec): void {
    this.layout = layout;
    this.setBoard(board);

    const t = layout.thickness;
    const { length: Lo, width: Wo } = layout.outside;
    this.walls[0].hinge.position.set(-Lo / 2, 0, Wo / 2);

    layout.walls.forEach((wall, i) => {
      const node = this.walls[i];
      if (i > 0) node.hinge.position.set(layout.walls[i - 1].span, 0, 0);
      this.setPanelFace(node.wall, wall.face, wall.printTurns);
      const wallEdges: SlabEdges = layout.topFlaps || layout.bottomFlaps
        ? {
            ...MITRE_ALL,
            top: layout.topFlaps ? 'mitre' : 'cut',
            bottom: layout.bottomFlaps ? 'mitre' : 'cut',
          }
        : OPEN_ENDS;
      this.writePanel(node.wall, { x0: 0, x1: wall.span, y0: wall.y0, y1: wall.y1 }, wallEdges, t, AO_WALL);
      this.setPanelOpenings(node.wall, layout.openings[wall.face]);

      // a wall without a flap at an end (tuck-end opposite wall, short walls of a lock bottom) has depth 0
      const top = wall.topFlap;
      const hasTop = layout.topFlaps && top.depth > 0;
      node.topPivot.visible = hasTop;
      this.setPanelPresent(node.top, hasTop);
      node.topPivot.position.set(0, wall.y1, 0);
      this.setPanelFace(node.top, hasTop ? top.face : null, top.printTurns);
      this.setPanelOpenings(node.top, top.face ? layout.openings[top.face] : undefined);
      this.writePanel(
        node.top,
        { x0: top.x0, x1: top.x0 + top.width, y0: 0, y1: Math.max(top.depth, 0.01) },
        top.tuck ? { ...TOP_FLAP_EDGES, top: 'mitre' } : TOP_FLAP_EDGES,
        t,
        AO_TOP_FLAP
      );
      this.writeTuck(node.topTuckPivot, node.topTuck, hasTop ? top : null, 1, t);

      const bottom = wall.bottomFlap;
      const hasBottom = layout.bottomFlaps && bottom.depth > 0;
      node.bottomPivot.visible = hasBottom;
      this.setPanelPresent(node.bottom, hasBottom);
      node.bottomPivot.position.set(0, wall.y0, 0);
      this.setPanelFace(node.bottom, hasBottom ? bottom.face : null, bottom.printTurns);
      this.setPanelOpenings(node.bottom, bottom.face ? layout.openings[bottom.face] : undefined);
      this.writePanel(
        node.bottom,
        { x0: bottom.x0, x1: bottom.x0 + bottom.width, y0: -Math.max(bottom.depth, 0.01), y1: 0 },
        bottom.tuck ? { ...BOTTOM_FLAP_EDGES, bottom: 'mitre' } : BOTTOM_FLAP_EDGES,
        t,
        AO_BOTTOM_FLAP
      );
      this.writeTuck(node.bottomTuckPivot, node.bottomTuck, hasBottom ? bottom : null, -1, t);
    });

    const tab = layout.tab;
    this.writePanel(this.tab, { x0: -tab.width, x1: 0, y0: tab.y0, y1: tab.y0 + tab.height }, TAB_EDGES, t);

    this.applyHighlight();
    this.applyPose();
  }

  /** Tuck tab on the far edge of a lid flap: hinged at the flap's score-far edge, hidden when the flap has none */
  private writeTuck(pivot: THREE.Group, panel: Panel, flap: FlapLayout | null, dir: 1 | -1, t: number) {
    const tuck = flap?.tuck ?? null;
    pivot.visible = !!tuck;
    this.setPanelPresent(panel, !!tuck);
    if (!flap || !tuck) return;
    pivot.position.set(0, dir * flap.depth, 0);
    const rect = dir === 1 ? { x0: tuck.x0, x1: tuck.x0 + tuck.width, y0: 0, y1: tuck.depth } : { x0: tuck.x0, x1: tuck.x0 + tuck.width, y0: -tuck.depth, y1: 0 };
    this.writePanel(panel, rect, dir === 1 ? TUCK_EDGES : TUCK_EDGES_BOTTOM, t);
  }

  /** Fold progress 0 (flat blank) .. 1 (assembled) */
  setPose(progress: number): void {
    this.progress = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 1;
    this.applyPose();
  }

  private applyPose() {
    const layout = this.layout;
    if (!layout) return;
    const pose = poseFromProgress(this.progress * layout.timelineEnd, {
      overlapTop: layout.overlapTop,
      overlapBottom: layout.overlapBottom,
      tuckTop: layout.closures.top === 'tuck',
      tuckBottom: layout.closures.bottom === 'tuck',
    });
    const t = layout.thickness;

    this.tilt.rotation.x = pose.tilt;
    this.walls[0].hinge.rotation.y = 0;
    for (let i = 1; i < 4; i++) this.walls[i].hinge.rotation.y = pose.walls[i - 1];

    this.walls.forEach((node, i) => {
      const wall = layout.walls[i];
      node.topPivot.rotation.x = -angleFor(pose, 'top', wall.topFlap.stage);
      node.bottomPivot.rotation.x = angleFor(pose, 'bottom', wall.bottomFlap.stage);
      node.topTuckPivot.rotation.x = -pose.topTuck;
      node.bottomTuckPivot.rotation.x = pose.bottomTuck;
    });

    // The tab hinges on the front wall's outer corner while flat and tucks one board-thickness inside the
    // left wall as it closes, so it ends up glued to the inside of that wall.
    const k = pose.tab / (Math.PI / 2);
    this.tabPivot.position.set(t * k, 0, -t * k);
    this.tabPivot.rotation.y = -pose.tab;

    this.groundAndCentre();
  }
}
