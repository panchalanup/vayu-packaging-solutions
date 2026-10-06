/**
 * BoxRig
 * The 3D carton as one persistent three.js scene graph. React drives it, but it is never rebuilt:
 *  - update(layout, board): rewrites vertex data in place (fixed topology, zero GPU buffer churn)
 *  - setPose(u):            only rotates hinges, then grounds and centres the carton
 *  - setColor / setHighlight / setPrint: mutate materials; nothing is recreated on hover or selection
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
import type { BoxFace } from '@/types/boxDesigner';
import type { BoardSpec } from '../boardSpecs';
import { createSlabGeometry, writeSlab } from './panelGeometry';
import { poseFromProgress } from './foldPose';
import type { RscLayout, SlabEdges } from './rscLayout';
import { WALL_ORDER } from './rscLayout';
import {
  EDGE_TILE_CM,
  GRAIN_TILE_CM,
  getContactShadowTexture,
  getEdgeTextures,
  getGrainTexture,
  getInnerOcclusionTexture,
  getSurfaceNormalTexture,
} from '../textures/surfaceTextures';

const MITRE_ALL: SlabEdges = { left: 'mitre', right: 'mitre', bottom: 'mitre', top: 'mitre' };
const TOP_FLAP_EDGES: SlabEdges = { left: 'cut', right: 'cut', bottom: 'mitre', top: 'cut' };
const BOTTOM_FLAP_EDGES: SlabEdges = { left: 'cut', right: 'cut', bottom: 'cut', top: 'mitre' };
const TAB_EDGES: SlabEdges = { left: 'cut', right: 'mitre', bottom: 'cut', top: 'cut' };

/** Which inner-face sides sit in a crease inside the assembled box (ambient occlusion) */
const AO_WALL = { left: true, right: true, bottom: true, top: false };
const AO_TOP_FLAP = { left: false, right: false, bottom: true, top: false };
const AO_BOTTOM_FLAP = { left: true, right: true, bottom: false, top: true };
const AO_NONE = { left: false, right: false, bottom: false, top: false };
type AoSides = typeof AO_NONE;

/** Brand blue used for selection */
const HIGHLIGHT = new THREE.Color('#1A6FE6');
/** Decal / highlight offsets in front of the outer liner (cm) */
const PRINT_OFFSET = 0.015;
const HIGHLIGHT_OFFSET = 0.03;

interface Rect {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

interface Panel {
  mesh: THREE.Mesh;
  geometry: THREE.BufferGeometry;
  outer: THREE.MeshStandardMaterial;
  face: BoxFace | null;
  rect: Rect;
  uvOffset: [number, number];
  decal?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>;
  /** Selection/hover: a light brand-blue wash plus a frame around the panel */
  highlightFill?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  highlightFrame?: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  printKey?: string;
}

interface WallNode {
  hinge: THREE.Group;
  wall: Panel;
  topPivot: THREE.Group;
  top: Panel;
  bottomPivot: THREE.Group;
  bottom: Panel;
}

const noRaycast = () => undefined;

/** A rectangular frame (8 vertices, fixed topology) rewritten in place when the panel resizes */
function createFrameGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(8 * 3), 3));
  geometry.setIndex([0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7]);
  return geometry;
}

function writeFrame(geometry: THREE.BufferGeometry, rect: Rect, width: number, z: number) {
  const p = geometry.getAttribute('position') as THREE.BufferAttribute;
  const w = Math.min(width, (rect.x1 - rect.x0) / 3, (rect.y1 - rect.y0) / 3);
  p.setXYZ(0, rect.x0, rect.y0, z);
  p.setXYZ(1, rect.x1, rect.y0, z);
  p.setXYZ(2, rect.x1, rect.y1, z);
  p.setXYZ(3, rect.x0, rect.y1, z);
  p.setXYZ(4, rect.x0 + w, rect.y0 + w, z);
  p.setXYZ(5, rect.x1 - w, rect.y0 + w, z);
  p.setXYZ(6, rect.x1 - w, rect.y1 - w, z);
  p.setXYZ(7, rect.x0 + w, rect.y1 - w, z);
  p.needsUpdate = true;
  geometry.computeBoundingSphere();
}

const overlayMaterial = (color: THREE.ColorRepresentation, opacity: number) =>
  new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    toneMapped: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
  });

/** The chosen colour covers the whole board, inside included (slightly deeper, as unprinted liner reads) */
function innerColourFor(hex: string): THREE.Color {
  return new THREE.Color(hex).offsetHSL(0, -0.03, -0.03);
}

export class BoxRig {
  /** Add this to the scene */
  readonly object3d = new THREE.Group();

  private readonly root = new THREE.Group();
  private readonly tilt = new THREE.Group();
  private readonly walls: WallNode[] = [];
  private readonly tabPivot = new THREE.Group();
  private readonly tab: Panel;
  private readonly panels: Panel[] = [];
  private readonly printable = new Map<BoxFace, Panel>();

  private readonly innerMaterial: THREE.MeshStandardMaterial;
  private readonly edgeCrossMaterial: THREE.MeshStandardMaterial;
  private readonly edgeAlongMaterial: THREE.MeshStandardMaterial;
  private readonly decalGeometry = new THREE.PlaneGeometry(1, 1);
  private readonly fillSelected = overlayMaterial(HIGHLIGHT, 0.1);
  private readonly fillHover = overlayMaterial(HIGHLIGHT, 0.05);
  private readonly frameSelected = overlayMaterial(HIGHLIGHT, 1);
  private readonly frameHover = overlayMaterial('#6ea8ff', 0.85);
  private readonly blob: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;

  private layout: RscLayout | null = null;
  private board: BoardSpec | null = null;
  private colour = '#C9A87C';
  private progress = 1;
  private selected: BoxFace | null = null;
  private hovered: BoxFace | null = null;
  private surfaceDetail = false;

  private readonly bounds = new THREE.Box3();
  private readonly scratchBox = new THREE.Box3();
  private readonly scratchMatrix = new THREE.Matrix4();
  private readonly scratchVector = new THREE.Vector3();

  constructor() {
    this.innerMaterial = new THREE.MeshStandardMaterial({
      color: innerColourFor(this.colour),
      // occlusion only dims ambient/environment light, which is what floods an open box unrealistically
      aoMap: getInnerOcclusionTexture(),
      aoMapIntensity: 0.85,
      roughness: 0.93,
      metalness: 0,
      envMapIntensity: 0.4,
    });
    this.edgeCrossMaterial = new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0, envMapIntensity: 0.4 });
    this.edgeAlongMaterial = new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0, envMapIntensity: 0.4 });

    this.object3d.name = 'BoxRig';
    this.object3d.add(this.root);
    this.root.add(this.tilt);

    let parent: THREE.Object3D = this.tilt;
    WALL_ORDER.forEach((id) => {
      const hinge = new THREE.Group();
      hinge.name = `hinge-${id}`;
      parent.add(hinge);

      const wall = this.createPanel(id, true);
      hinge.add(wall.mesh);

      const topPivot = new THREE.Group();
      hinge.add(topPivot);
      const top = this.createPanel(`top-${id}` as BoxFace, true);
      topPivot.add(top.mesh);

      const bottomPivot = new THREE.Group();
      hinge.add(bottomPivot);
      const bottom = this.createPanel(null, false);
      bottomPivot.add(bottom.mesh);

      this.walls.push({ hinge, wall, topPivot, top, bottomPivot, bottom });
      parent = hinge;
    });

    this.walls[0].hinge.add(this.tabPivot);
    this.tab = this.createPanel(null, false);
    this.tabPivot.add(this.tab.mesh);

    this.blob = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map: getContactShadowTexture(),
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      })
    );
    this.blob.rotation.x = -Math.PI / 2;
    this.blob.position.y = 0.012;
    this.blob.renderOrder = -1;
    this.blob.raycast = noRaycast;
    this.object3d.add(this.blob);
  }

  private createPanel(face: BoxFace | null, printable: boolean): Panel {
    const geometry = createSlabGeometry();
    const outer = new THREE.MeshStandardMaterial({
      color: this.colour,
      roughness: 0.88,
      metalness: 0,
      envMapIntensity: 0.5,
    });
    const mesh = new THREE.Mesh(geometry, [outer, this.innerMaterial, this.edgeCrossMaterial, this.edgeAlongMaterial]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.face = face;

    // golden-ratio offsets give every panel a different patch of grain
    const n = this.panels.length + 1;
    const panel: Panel = {
      mesh,
      geometry,
      outer,
      face,
      rect: { x0: 0, x1: 1, y0: 0, y1: 1 },
      uvOffset: [(n * 0.618034) % 1, (n * 0.381966) % 1],
    };

    if (printable && face) {
      const decalMaterial = new THREE.MeshStandardMaterial({
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
        roughness: 0.8,
        metalness: 0,
        envMapIntensity: 0.5,
      });
      const decal = new THREE.Mesh(this.decalGeometry, decalMaterial);
      decal.visible = false;
      decal.renderOrder = 1;
      decal.receiveShadow = true;
      decal.userData.face = face;
      mesh.add(decal);
      panel.decal = decal;

      const fill = new THREE.Mesh(this.decalGeometry, this.fillSelected);
      fill.visible = false;
      fill.renderOrder = 2;
      fill.raycast = noRaycast;
      mesh.add(fill);
      panel.highlightFill = fill;

      const frame = new THREE.Mesh(createFrameGeometry(), this.frameSelected);
      frame.visible = false;
      frame.renderOrder = 3;
      frame.raycast = noRaycast;
      mesh.add(frame);
      panel.highlightFrame = frame;

      this.printable.set(face, panel);
    }

    this.panels.push(panel);
    return panel;
  }

  private writePanel(panel: Panel, rect: Rect, edges: SlabEdges, t: number, ao: AoSides = AO_NONE) {
    writeSlab(panel.geometry, {
      ...rect,
      t,
      edges,
      grainTileCm: GRAIN_TILE_CM,
      edgeTileCm: EDGE_TILE_CM,
      uvOffset: panel.uvOffset,
      ao,
    });
    panel.rect = rect;

    const width = rect.x1 - rect.x0;
    const height = rect.y1 - rect.y0;
    if (panel.decal) {
      panel.decal.scale.set(width, height, 1);
      panel.decal.position.set(rect.x0 + width / 2, rect.y0 + height / 2, PRINT_OFFSET);
    }
    if (panel.highlightFill) {
      panel.highlightFill.scale.set(width, height, 1);
      panel.highlightFill.position.set(rect.x0 + width / 2, rect.y0 + height / 2, HIGHLIGHT_OFFSET);
    }
    if (panel.highlightFrame) {
      // about 1.2% of the panel, between 1.2 mm and 6 mm, so it reads at any box size
      const frameWidth = Math.min(0.6, Math.max(0.12, 0.012 * Math.min(width, height)));
      writeFrame(panel.highlightFrame.geometry, rect, frameWidth, HIGHLIGHT_OFFSET * 1.5);
    }
  }

  /** Board construction drives the flute ridges on the liners and the edge cross-section */
  private applyBoard() {
    if (this.surfaceDetail) this.applySurfaceMaps();
    this.applyEdgeTextures();
  }

  /** Generate (once, cached) and apply the paper grain and fibre/flute normal maps */
  enableSurfaceDetail(): void {
    if (this.surfaceDetail) return;
    this.surfaceDetail = true;
    this.applySurfaceMaps();
  }

  private applySurfaceMaps() {
    const grain = getGrainTexture();
    const normal = getSurfaceNormalTexture(this.board?.layers[0]?.pitchMm ?? 7);
    const assign = (material: THREE.MeshStandardMaterial, normalScale: number) => {
      const programChange = !material.map || !material.normalMap;
      material.map = grain;
      material.normalMap = normal;
      material.normalScale.set(normalScale, normalScale);
      if (programChange) material.needsUpdate = true;
    };
    for (const panel of this.panels) assign(panel.outer, 0.32);
    assign(this.innerMaterial, 0.25);
  }

  private applyEdgeTextures() {
    if (!this.board) return;
    const { cross, along } = getEdgeTextures(this.board, this.colour, `#${innerColourFor(this.colour).getHexString()}`);
    const first = !this.edgeCrossMaterial.map;
    this.edgeCrossMaterial.map = cross;
    this.edgeAlongMaterial.map = along;
    if (first) {
      this.edgeCrossMaterial.needsUpdate = true;
      this.edgeAlongMaterial.needsUpdate = true;
    }
  }

  /** Resize / rebuild for new dimensions or board (in place, no allocations) */
  update(layout: RscLayout, board: BoardSpec): void {
    this.layout = layout;
    if (!this.board || this.board.key !== board.key) {
      this.board = board;
      this.applyBoard();
    }

    const t = layout.thickness;
    const { length: Lo, width: Wo } = layout.outside;
    this.walls[0].hinge.position.set(-Lo / 2, 0, Wo / 2);

    layout.walls.forEach((wall, i) => {
      const node = this.walls[i];
      if (i > 0) node.hinge.position.set(layout.walls[i - 1].span, 0, 0);
      this.writePanel(node.wall, { x0: 0, x1: wall.span, y0: wall.y0, y1: wall.y1 }, MITRE_ALL, t, AO_WALL);

      const top = wall.topFlap;
      node.topPivot.visible = layout.topFlaps;
      node.topPivot.position.set(0, wall.y1, 0);
      this.writePanel(
        node.top,
        { x0: top.x0, x1: top.x0 + top.width, y0: 0, y1: top.depth },
        TOP_FLAP_EDGES,
        t,
        AO_TOP_FLAP
      );

      const bottom = wall.bottomFlap;
      node.bottomPivot.position.set(0, wall.y0, 0);
      this.writePanel(
        node.bottom,
        { x0: bottom.x0, x1: bottom.x0 + bottom.width, y0: -bottom.depth, y1: 0 },
        BOTTOM_FLAP_EDGES,
        t,
        AO_BOTTOM_FLAP
      );
    });

    const tab = layout.tab;
    this.writePanel(this.tab, { x0: -tab.width, x1: 0, y0: tab.y0, y1: tab.y0 + tab.height }, TAB_EDGES, t);

    this.applyPose();
  }

  /** Fold progress 0 (flat blank) .. 1 (sealed) */
  setPose(progress: number): void {
    this.progress = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 1;
    this.applyPose();
  }

  private applyPose() {
    const layout = this.layout;
    if (!layout) return;
    const pose = poseFromProgress(this.progress);
    const t = layout.thickness;

    this.tilt.rotation.x = pose.tilt;
    this.walls[0].hinge.rotation.y = 0;
    for (let i = 1; i < 4; i++) this.walls[i].hinge.rotation.y = pose.walls[i - 1];

    this.walls.forEach((node, i) => {
      const major = layout.walls[i].major;
      node.topPivot.rotation.x = -(major ? pose.topMajor : pose.topMinor);
      node.bottomPivot.rotation.x = major ? pose.bottomMajor : pose.bottomMinor;
    });

    // The tab hinges on the front wall's outer corner while flat and tucks one board-thickness inside the
    // left wall as it closes, so it ends up glued to the inside of that wall.
    const k = pose.tab / (Math.PI / 2);
    this.tabPivot.position.set(t * k, 0, -t * k);
    this.tabPivot.rotation.y = -pose.tab;

    this.groundAndCentre();
  }

  /** Stand the carton on the ground (y = 0) and keep it centred under the camera */
  private groundAndCentre() {
    this.root.position.set(0, 0, 0);
    this.object3d.updateMatrixWorld(true);
    const toLocal = this.scratchMatrix.copy(this.object3d.matrixWorld).invert();

    this.bounds.makeEmpty();
    for (const panel of this.panels) {
      if (!panel.geometry.boundingBox || !panel.mesh.parent?.visible) continue;
      this.scratchBox.copy(panel.geometry.boundingBox).applyMatrix4(panel.mesh.matrixWorld).applyMatrix4(toLocal);
      this.bounds.union(this.scratchBox);
    }
    if (this.bounds.isEmpty()) return;

    const centre = this.bounds.getCenter(this.scratchVector);
    this.root.position.set(-centre.x, -this.bounds.min.y, -centre.z);

    const size = this.bounds.getSize(this.scratchVector);
    this.blob.scale.set(size.x * 1.3 + 2, size.z * 1.3 + 2, 1);
  }

  setColor(hex: string): void {
    this.colour = hex;
    const colour = new THREE.Color(hex);
    const hsl = { h: 0, s: 0, l: 0 };
    colour.getHSL(hsl);
    // coated white board is a little smoother than raw kraft
    const roughness = hsl.l > 0.75 ? 0.72 : 0.88;
    for (const panel of this.panels) {
      panel.outer.color.copy(colour);
      panel.outer.roughness = roughness;
    }
    this.innerMaterial.color.copy(innerColourFor(hex));
    this.applyEdgeTextures();
  }

  setSelected(face: BoxFace | null): void {
    this.selected = face;
    this.applyHighlight();
  }

  setHovered(face: BoxFace | null): void {
    this.hovered = face;
    this.applyHighlight();
  }

  private applyHighlight() {
    this.printable.forEach((panel, face) => {
      const isSelected = face === this.selected;
      const isHovered = !isSelected && face === this.hovered;
      const visible = isSelected || isHovered;
      if (panel.highlightFill) {
        panel.highlightFill.visible = visible;
        panel.highlightFill.material = isSelected ? this.fillSelected : this.fillHover;
      }
      if (panel.highlightFrame) {
        panel.highlightFrame.visible = visible;
        panel.highlightFrame.material = isSelected ? this.frameSelected : this.frameHover;
      }
    });
  }

  /** Surfaces that can carry artwork, with their real size in cm */
  getPrintSurfaces(): { face: BoxFace; widthCm: number; heightCm: number }[] {
    const surfaces: { face: BoxFace; widthCm: number; heightCm: number }[] = [];
    this.printable.forEach((panel, face) => {
      if (!this.layout?.topFlaps && face.startsWith('top-')) return;
      surfaces.push({ face, widthCm: panel.rect.x1 - panel.rect.x0, heightCm: panel.rect.y1 - panel.rect.y0 });
    });
    return surfaces;
  }

  getPrintKey(face: BoxFace): string | undefined {
    return this.printable.get(face)?.printKey;
  }

  /** Show (or clear) the artwork texture for a surface. The rig takes ownership of the texture. */
  setPrint(face: BoxFace, texture: THREE.Texture | null, key: string): void {
    const panel = this.printable.get(face);
    if (!panel?.decal) {
      texture?.dispose();
      return;
    }
    const material = panel.decal.material;
    const previous = material.map;
    if (previous === texture) return;
    const presenceChanged = !previous !== !texture;
    material.map = texture;
    if (presenceChanged) material.needsUpdate = true;
    panel.decal.visible = !!texture;
    panel.printKey = key;
    previous?.dispose();
  }

  dispose(): void {
    for (const panel of this.panels) {
      panel.geometry.dispose();
      panel.outer.dispose();
      if (panel.decal) {
        panel.decal.material.map?.dispose();
        panel.decal.material.dispose();
      }
      panel.highlightFrame?.geometry.dispose();
    }
    this.decalGeometry.dispose();
    this.innerMaterial.dispose();
    this.edgeCrossMaterial.dispose();
    this.edgeAlongMaterial.dispose();
    this.fillSelected.dispose();
    this.fillHover.dispose();
    this.frameSelected.dispose();
    this.frameHover.dispose();
    this.blob.geometry.dispose();
    this.blob.material.dispose();
    // Shared procedural textures (grain, normal, edges, contact) are cached for the page lifetime on purpose.
  }
}
