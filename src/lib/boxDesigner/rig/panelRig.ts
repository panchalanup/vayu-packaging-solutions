/**
 * PanelRig: the shared base of every carton rig (slotted BoxRig, die-cut DieCutRig).
 * Owns what all cartons have in common, so each style only describes its hinges:
 *  - corrugated panels (fixed-topology slabs rewritten in place, see panelGeometry)
 *  - board materials: outer liner (matte or gloss), inner liner (own colour possible), cut edges
 *  - artwork decals, selection / hover overlays, print rotation per surface
 *  - ground snap + centring, contact shadow, cut-away, dispose
 *
 * CartonRig is the public interface BoxScene (and other agents' scenes) talk to. TelescopeRig composes two
 * BoxRigs behind the same interface.
 */

import * as THREE from 'three';
import type { BoxFace, PrintFinish } from '@/types/boxDesigner';
import type { BoardSpec } from '../boardSpecs';
import { createSlabGeometry, writeSlab } from './panelGeometry';
import type { PrintTurns, SlabEdges } from './rscLayout';
import {
  EDGE_TILE_CM,
  GRAIN_TILE_CM,
  getContactShadowTexture,
  getEdgeTextures,
  getGrainTexture,
  getInnerOcclusionTexture,
  getSurfaceNormalTexture,
} from '../textures/surfaceTextures';

export interface PrintSurfaceSize {
  face: BoxFace;
  widthCm: number;
  heightCm: number;
}

/** Common API of every carton rig. `layout` is the style's layout (see styles/registry). */
export interface CartonRig {
  readonly object3d: THREE.Object3D;
  update(layout: unknown, board: BoardSpec): void;
  /** Fold progress 0 (flat blank) .. 1 (assembled) */
  setPose(progress: number): void;
  setColor(hex: string): void;
  /** Inside liner colour; null = a shade of the outside colour */
  setInsideColor(hex: string | null): void;
  setFinish(finish: PrintFinish): void;
  /** Hide the front wall(s) to show the inside */
  setCutaway(on: boolean): void;
  setSelected(face: BoxFace | null): void;
  setHovered(face: BoxFace | null): void;
  getPrintSurfaces(): PrintSurfaceSize[];
  getPrintKey(face: BoxFace): string | undefined;
  /** Show (or clear) the artwork texture for a surface. The rig takes ownership of the texture. */
  setPrint(face: BoxFace, texture: THREE.Texture | null, key: string): void;
  enableSurfaceDetail(): void;
  /** Bounding box of the carton in object3d space (after ground snap: min.y = 0) */
  getBounds(target?: THREE.Box3): THREE.Box3;
  /**
   * A lightweight copy for stack / pallet scenes: shares geometry and materials with the live rig (so it follows
   * resizes), without overlays or the contact shadow. Never dispose its geometry or materials.
   */
  createSnapshot(): THREE.Object3D;
  dispose(): void;
}

export interface Rect {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export interface AoSides {
  left: boolean;
  right: boolean;
  bottom: boolean;
  top: boolean;
}

export const AO_NONE: AoSides = { left: false, right: false, bottom: false, top: false };

export interface Panel {
  mesh: THREE.Mesh;
  geometry: THREE.BufferGeometry;
  outer: THREE.MeshPhysicalMaterial;
  face: BoxFace | null;
  turns: PrintTurns;
  rect: Rect;
  uvOffset: [number, number];
  /** Part of the current carton (false = unused panel of this rig, e.g. HSC top flaps) */
  present: boolean;
  /** Hidden by the cut-away view */
  cut: boolean;
  /** Hidden when the cut-away view is on */
  cutawayGroup: boolean;
  decal?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshPhysicalMaterial>;
  /** Selection/hover: a light brand-blue wash plus a frame around the panel */
  highlightFill?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  highlightFrame?: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  printKey?: string;
}

/** Selection colour: Vayu cyan-400 (§5.1), visible on kraft board. Hover frame is a lighter tint of the same hue. */
const HIGHLIGHT = new THREE.Color('#1FB5E0');
const HIGHLIGHT_HOVER = '#7FD6EE';
/** Decal / highlight offsets in front of the outer liner (cm) */
const PRINT_OFFSET = 0.015;
const HIGHLIGHT_OFFSET = 0.03;

/** Finish look: matte = uncoated liner; gloss = varnished / laminated (clear coat) */
const FINISH = {
  matte: { roughness: 0.88, lightRoughness: 0.72, clearcoat: 0, clearcoatRoughness: 0, printRoughness: 0.8 },
  gloss: { roughness: 0.5, lightRoughness: 0.42, clearcoat: 0.85, clearcoatRoughness: 0.12, printRoughness: 0.35 },
} as const;

export const noRaycast = () => undefined;
const meshRaycast = THREE.Mesh.prototype.raycast;

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
export function innerColourFor(hex: string): THREE.Color {
  return new THREE.Color(hex).offsetHSL(0, -0.03, -0.03);
}

export abstract class PanelRig implements CartonRig {
  /** Add this to the scene */
  readonly object3d = new THREE.Group();
  /** Ground-snap + centring offset, recomputed per pose */
  protected readonly root = new THREE.Group();

  protected readonly panels: Panel[] = [];
  protected readonly printable = new Map<BoxFace, Panel>();

  protected readonly innerMaterial: THREE.MeshStandardMaterial;
  private readonly edgeCrossMaterial: THREE.MeshStandardMaterial;
  private readonly edgeAlongMaterial: THREE.MeshStandardMaterial;
  private readonly decalGeometry = new THREE.PlaneGeometry(1, 1);
  private readonly fillSelected = overlayMaterial(HIGHLIGHT, 0.1);
  private readonly fillHover = overlayMaterial(HIGHLIGHT, 0.05);
  private readonly frameSelected = overlayMaterial(HIGHLIGHT, 1);
  private readonly frameHover = overlayMaterial(HIGHLIGHT_HOVER, 0.85);
  private readonly blob: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;

  protected board: BoardSpec | null = null;
  protected colour = '#C9A87C';
  private insideColour: string | null = null;
  private finish: PrintFinish = 'matte';
  private selected: BoxFace | null = null;
  private hovered: BoxFace | null = null;
  private surfaceDetail = false;
  private cutaway = false;

  private readonly bounds = new THREE.Box3();
  private readonly scratchBox = new THREE.Box3();
  private readonly scratchMatrix = new THREE.Matrix4();
  private readonly scratchVector = new THREE.Vector3();

  constructor(name: string) {
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

    this.object3d.name = name;
    this.object3d.add(this.root);

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
    this.blob.userData.overlay = true;
    this.object3d.add(this.blob);
  }

  abstract update(layout: unknown, board: BoardSpec): void;
  abstract setPose(progress: number): void;

  /** Create a panel. Printable panels get a decal and highlight overlays (their face is assigned per layout). */
  protected createPanel(printable: boolean, cutawayGroup = false): Panel {
    const geometry = createSlabGeometry();
    const look = FINISH[this.finish];
    const outer = new THREE.MeshPhysicalMaterial({
      color: this.colour,
      roughness: look.roughness,
      clearcoat: look.clearcoat,
      clearcoatRoughness: look.clearcoatRoughness,
      metalness: 0,
      envMapIntensity: 0.5,
    });
    const mesh = new THREE.Mesh(geometry, [outer, this.innerMaterial, this.edgeCrossMaterial, this.edgeAlongMaterial]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.face = null;

    // golden-ratio offsets give every panel a different patch of grain
    const n = this.panels.length + 1;
    const panel: Panel = {
      mesh,
      geometry,
      outer,
      face: null,
      turns: 0,
      rect: { x0: 0, x1: 1, y0: 0, y1: 1 },
      uvOffset: [(n * 0.618034) % 1, (n * 0.381966) % 1],
      present: true,
      cut: false,
      cutawayGroup,
    };

    if (printable) {
      const decalMaterial = new THREE.MeshPhysicalMaterial({
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
        roughness: look.printRoughness,
        clearcoat: look.clearcoat,
        clearcoatRoughness: look.clearcoatRoughness,
        metalness: 0,
        envMapIntensity: 0.5,
      });
      const decal = new THREE.Mesh(this.decalGeometry, decalMaterial);
      decal.visible = false;
      decal.renderOrder = 1;
      decal.receiveShadow = true;
      decal.userData.face = null;
      mesh.add(decal);
      panel.decal = decal;

      const fill = new THREE.Mesh(this.decalGeometry, this.fillSelected);
      fill.visible = false;
      fill.renderOrder = 2;
      fill.raycast = noRaycast;
      fill.userData.overlay = true;
      mesh.add(fill);
      panel.highlightFill = fill;

      const frame = new THREE.Mesh(createFrameGeometry(), this.frameSelected);
      frame.visible = false;
      frame.renderOrder = 3;
      frame.raycast = noRaycast;
      frame.userData.overlay = true;
      mesh.add(frame);
      panel.highlightFrame = frame;
    }

    this.panels.push(panel);
    return panel;
  }

  /** Assign (or remove) the printable face of a panel; artwork of a face that moves away is cleared */
  protected setPanelFace(panel: Panel, face: BoxFace | null, turns: PrintTurns = 0): void {
    const next = panel.decal ? face : null;
    if (panel.face !== next) {
      if (panel.face && this.printable.get(panel.face) === panel) this.printable.delete(panel.face);
      this.clearPrint(panel);
      panel.face = next;
      if (next) this.printable.set(next, panel);
    }
    panel.turns = turns;
    panel.mesh.userData.face = next;
    if (panel.decal) panel.decal.userData.face = next;
  }

  /** Mark a panel as part of the current carton or not (unused panels are hidden and never picked) */
  protected setPanelPresent(panel: Panel, present: boolean): void {
    panel.present = present;
    this.applyPanelVisibility(panel);
  }

  private applyPanelVisibility(panel: Panel) {
    panel.cut = this.cutaway && panel.cutawayGroup;
    const visible = panel.present && !panel.cut;
    panel.mesh.visible = visible;
    panel.mesh.raycast = visible ? meshRaycast : noRaycast;
    if (panel.decal) panel.decal.raycast = visible ? meshRaycast : noRaycast;
  }

  protected writePanel(panel: Panel, rect: Rect, edges: SlabEdges, t: number, ao: AoSides = AO_NONE): void {
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
      // a quarter turn lays the artwork across the panel: the canvas is then height x width
      const odd = panel.turns % 2 === 1;
      panel.decal.scale.set(odd ? height : width, odd ? width : height, 1);
      panel.decal.rotation.z = (panel.turns * Math.PI) / 2;
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
  protected setBoard(board: BoardSpec): void {
    if (this.board && this.board.key === board.key) return;
    this.board = board;
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

  private innerColour(): THREE.Color {
    return this.insideColour ? new THREE.Color(this.insideColour) : innerColourFor(this.colour);
  }

  private applyEdgeTextures() {
    if (!this.board) return;
    const { cross, along } = getEdgeTextures(this.board, this.colour, `#${this.innerColour().getHexString()}`);
    const first = !this.edgeCrossMaterial.map;
    this.edgeCrossMaterial.map = cross;
    this.edgeAlongMaterial.map = along;
    if (first) {
      this.edgeCrossMaterial.needsUpdate = true;
      this.edgeAlongMaterial.needsUpdate = true;
    }
  }

  /** Stand the carton on the ground (y = 0) and keep it centred under the camera */
  protected groundAndCentre(): void {
    this.root.position.set(0, 0, 0);
    this.object3d.updateMatrixWorld(true);
    const toLocal = this.scratchMatrix.copy(this.object3d.matrixWorld).invert();

    this.bounds.makeEmpty();
    for (const panel of this.panels) {
      if (!panel.geometry.boundingBox || !panel.present) continue;
      this.scratchBox.copy(panel.geometry.boundingBox).applyMatrix4(panel.mesh.matrixWorld).applyMatrix4(toLocal);
      this.bounds.union(this.scratchBox);
    }
    if (this.bounds.isEmpty()) return;

    const centre = this.bounds.getCenter(this.scratchVector);
    this.root.position.set(-centre.x, -this.bounds.min.y, -centre.z);
    this.bounds.translate(this.root.position);

    const size = this.bounds.getSize(this.scratchVector);
    this.blob.scale.set(size.x * 1.3 + 2, size.z * 1.3 + 2, 1);
  }

  getBounds(target = new THREE.Box3()): THREE.Box3 {
    return target.copy(this.bounds);
  }

  /** Composite rigs draw one shadow for all parts */
  setContactShadow(visible: boolean): void {
    this.blob.visible = visible;
  }

  setColor(hex: string): void {
    this.colour = hex;
    this.applyOuterLook();
    if (!this.insideColour) this.innerMaterial.color.copy(this.innerColour());
    this.applyEdgeTextures();
  }

  setInsideColor(hex: string | null): void {
    this.insideColour = hex;
    this.innerMaterial.color.copy(this.innerColour());
    this.applyEdgeTextures();
  }

  setFinish(finish: PrintFinish): void {
    if (finish === this.finish) return;
    this.finish = finish;
    this.applyOuterLook(true);
  }

  private applyOuterLook(programChange = false) {
    const colour = new THREE.Color(this.colour);
    const hsl = { h: 0, s: 0, l: 0 };
    colour.getHSL(hsl);
    const look = FINISH[this.finish];
    // coated white board is a little smoother than raw kraft
    const roughness = hsl.l > 0.75 ? look.lightRoughness : look.roughness;
    for (const panel of this.panels) {
      panel.outer.color.copy(colour);
      panel.outer.roughness = roughness;
      panel.outer.clearcoat = look.clearcoat;
      panel.outer.clearcoatRoughness = look.clearcoatRoughness;
      if (programChange) panel.outer.needsUpdate = true;
      if (panel.decal) {
        const m = panel.decal.material;
        m.roughness = look.printRoughness;
        m.clearcoat = look.clearcoat;
        m.clearcoatRoughness = look.clearcoatRoughness;
        if (programChange) m.needsUpdate = true;
      }
    }
  }

  setCutaway(on: boolean): void {
    this.cutaway = on;
    for (const panel of this.panels) this.applyPanelVisibility(panel);
  }

  setSelected(face: BoxFace | null): void {
    this.selected = face;
    this.applyHighlight();
  }

  setHovered(face: BoxFace | null): void {
    this.hovered = face;
    this.applyHighlight();
  }

  protected applyHighlight(): void {
    for (const panel of this.panels) {
      const face = panel.face;
      const isSelected = !!face && face === this.selected;
      const isHovered = !!face && !isSelected && face === this.hovered;
      const visible = isSelected || isHovered;
      if (panel.highlightFill) {
        panel.highlightFill.visible = visible;
        panel.highlightFill.material = isSelected ? this.fillSelected : this.fillHover;
      }
      if (panel.highlightFrame) {
        panel.highlightFrame.visible = visible;
        panel.highlightFrame.material = isSelected ? this.frameSelected : this.frameHover;
      }
    }
  }

  /** Surfaces that can carry artwork, with their real size in cm (as the artwork is laid out) */
  getPrintSurfaces(): PrintSurfaceSize[] {
    const surfaces: PrintSurfaceSize[] = [];
    this.printable.forEach((panel, face) => {
      if (!panel.present) return;
      const width = panel.rect.x1 - panel.rect.x0;
      const height = panel.rect.y1 - panel.rect.y0;
      const odd = panel.turns % 2 === 1;
      surfaces.push({ face, widthCm: odd ? height : width, heightCm: odd ? width : height });
    });
    return surfaces;
  }

  getPrintKey(face: BoxFace): string | undefined {
    return this.printable.get(face)?.printKey;
  }

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

  private clearPrint(panel: Panel) {
    if (!panel.decal) return;
    const material = panel.decal.material;
    if (material.map) {
      material.map.dispose();
      material.map = null;
      material.needsUpdate = true;
    }
    panel.decal.visible = false;
    panel.printKey = undefined;
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
