/**
 * The 3D world of the home story, built once as plain three.js objects (like BoxRig) so scrolling never re-renders
 * React: update(p) moves what beats.ts says should move. Real scale (1 unit = 10 cm), real objects:
 *  - every hero box is the Box Designer's own carton rig (board grain, flute edges, mitred corners, a real fold),
 *  - the jar and the chai glass are lathe-turned glass, the pallet holds the actual 500 boxes (instanced),
 *  - one soft key light follows the camera, so shadows work everywhere without a light per place.
 *
 * Nothing is shown or hidden in view of the camera between scenes (that read as flicker): places are far apart and the
 * camera travels between them. The one switch, from the studio to the desk, is a cut into the monitor, which is
 * showing that very studio shot at the moment of the cut (renderStudioShot), so it cannot be seen.
 */

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { BoxRig } from '@/lib/boxDesigner/rig/boxRig';
import { computeRscLayout } from '@/lib/boxDesigner/rig/rscLayout';
import { getBoardSpec, getBoardThicknessCm } from '@/lib/boxDesigner/boardSpecs';
import { DEFAULT_PADDING_CM, recommendInsideSize } from '@/lib/boxDesigner/fit';
import { setSurfaceTextureAnisotropy } from '@/lib/boxDesigner/textures/surfaceTextures';
import type { BoxFace } from '@/types/boxDesigner';
import {
  PALLET_BOXES,
  REVEAL_SWAP,
  SCENES,
  STUDIO_SHOT,
  WORLD,
  cameraAt,
  clamp01,
  doorDropAt,
  easeInOut,
  easeOutCubic,
  fitAt,
  jarRiseAt,
  makeAt,
  measureAt,
  miniAt,
  openAt,
  sceneAt,
  shipAt,
  truckX,
} from './beats';
import {
  INK,
  SWATCHES,
  asphaltTexture,
  boxPrintTexture,
  concreteTexture,
  createScreenUI,
  doorTexture,
  glowTexture,
  jarLabelTexture,
  matTexture,
  palletBoxTexture,
  plasterTexture,
  roadLinesTexture,
  stickyNoteTexture,
  tileTexture,
  truckLiveryTexture,
  woodTexture,
} from './textures';

const IDX = Object.fromEntries(SCENES.map((s) => [s.id, s.index])) as Record<(typeof SCENES)[number]['id'], number>;

/** The product in the story: a 500 g honey jar, 10 x 10 x 14 cm. The box is the fit checker's own recommendation */
const JAR_CM = { length: 10, width: 10, height: 14 };
export const STORY_BOX = recommendInsideSize({ product: JAR_CM, paddingCm: DEFAULT_PADDING_CM, fragile: false }).inside;
export const STORY_BOX_SPEC = `${STORY_BOX.length} × ${STORY_BOX.width} × ${STORY_BOX.height} cm`;
const CM = 0.1;
const PRINT_FACES = new Set<BoxFace>(['front', 'back', 'left', 'right']);

export interface WorldOptions {
  /** Real-time soft shadows (high tier) */
  shadows: boolean;
  /** Physically transmissive glass (high tier); otherwise a cheaper see-through glass */
  glass: boolean;
}

export interface StoryWorld {
  root: THREE.Group;
  fog: THREE.Fog;
  update(p: number): void;
  /** True while the monitor is showing the studio shot (start of the reveal) */
  needsStudioShot(p: number): boolean;
  renderStudioShot(gl: THREE.WebGLRenderer, scene: THREE.Scene): void;
  /** Paper grain and flute relief on the cartons (about 150 ms each: call when idle) */
  enableDetail(gl: THREE.WebGLRenderer): void;
  /** Redraw printed textures once the web fonts have loaded */
  refreshText(): void;
  dispose(): void;
}

// --- Materials and small builders ------------------------------------------------------------------------------------

const std = (color: THREE.ColorRepresentation, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, envMapIntensity: 0.55, ...extra });

const metal = (color: THREE.ColorRepresentation, roughness = 0.35) => std(color, { metalness: 1, roughness, envMapIntensity: 1 });

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material | THREE.Material[], x = 0, y = 0, z = 0, cast = true): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = cast;
  m.receiveShadow = true;
  return m;
}

const rounded = (w: number, h: number, d: number, r = 0.04, seg = 3) => new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2));

/** Turned shape from a profile listed bottom to top ([radius, height] pairs) */
const lathe = (points: [number, number][], segments = 48) => new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), segments);

function glassMaterial(physical: boolean): THREE.Material {
  return physical
    ? new THREE.MeshPhysicalMaterial({ color: '#ffffff', transmission: 1, thickness: 0.08, roughness: 0.04, ior: 1.5, envMapIntensity: 1 })
    : new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.22, roughness: 0.05, clearcoat: 1, envMapIntensity: 1, depthWrite: false });
}

/** A 500 g honey jar, 10 cm across and 14 cm tall (1.0 x 1.4 units). Origin at the base */
function buildJar(opts: WorldOptions, label: THREE.Texture): THREE.Group {
  const g = new THREE.Group();
  const honey = mesh(
    lathe([[0, 0.03], [0.46, 0.03], [0.475, 0.06], [0.475, 1.02], [0.001, 1.02]]),
    new THREE.MeshPhysicalMaterial({ color: '#B65F0C', roughness: 0.18, clearcoat: 0.6, emissive: '#3A1700', emissiveIntensity: 0.6, envMapIntensity: 0.8 })
  );
  const glass = mesh(lathe([[0, 0], [0.45, 0], [0.5, 0.05], [0.5, 1.08], [0.47, 1.16], [0.43, 1.2], [0.43, 1.26]]), glassMaterial(opts.glass));
  const band = mesh(new THREE.CylinderGeometry(0.505, 0.505, 0.56, 48, 1, true), std('#ffffff', { map: label, roughness: 0.85 }), 0, 0.58, 0);
  const lid = mesh(lathe([[0.001, 1.2], [0.45, 1.2], [0.475, 1.22], [0.475, 1.32], [0.465, 1.37], [0.42, 1.39], [0.001, 1.39]]), metal('#C9A24A', 0.3));
  g.add(honey, glass, band, lid);
  return g;
}

/** A cutting-chai glass with tea. Origin at the base */
function buildChai(opts: WorldOptions): THREE.Group {
  const g = new THREE.Group();
  g.add(mesh(lathe([[0, 0.05], [0.235, 0.05], [0.255, 0.45], [0.285, 0.74], [0.001, 0.74]]), std('#8E5326', { roughness: 0.25 })));
  g.add(mesh(lathe([[0, 0], [0.23, 0], [0.25, 0.04], [0.27, 0.5], [0.31, 0.92], [0.3, 0.93], [0.26, 0.5], [0.001, 0.05]]), glassMaterial(opts.glass)));
  return g;
}

interface Carton {
  rig: BoxRig;
  group: THREE.Group;
  prints: THREE.Texture[];
}

/** A carton from the Box Designer's own rig, at real size, optionally printed with the customer's mark */
function buildCarton(color: string, printed: boolean): Carton {
  const rig = new BoxRig();
  const spec = getBoardSpec('3-ply');
  rig.update(computeRscLayout(STORY_BOX, getBoardThicknessCm(spec, STORY_BOX)), spec);
  rig.setColor(color);
  rig.setPose(1);
  const carton: Carton = { rig, group: new THREE.Group(), prints: [] };
  if (printed) printCarton(carton);
  rig.object3d.scale.setScalar(CM);
  carton.group.add(rig.object3d);
  return carton;
}

function printCarton(c: Carton) {
  c.prints.forEach((t) => t.dispose());
  c.prints = [];
  for (const s of c.rig.getPrintSurfaces()) {
    if (!PRINT_FACES.has(s.face)) continue;
    const tex = boxPrintTexture(s.widthCm, s.heightCm);
    c.prints.push(tex);
    c.rig.setPrint(s.face, tex, `madhu-${c.prints.length}`);
  }
}

function labelSprite(text: string): THREE.Sprite {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 96;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#3DBA5A';
    ctx.font = '500 52px "Geist Mono", ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 50);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
  sprite.scale.set(0.62, 0.23, 1);
  return sprite;
}

// --- The monitor screen: the studio shot (render target) cross-fading into the mini designer ------------------------

const SCREEN_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const SCREEN_FRAG = /* glsl */ `
  uniform sampler2D uStudio;
  uniform sampler2D uUi;
  uniform float uMix;
  uniform float uExposure;
  varying vec2 vUv;
  vec3 rrtOdtFit(vec3 v) {
    vec3 a = v * (v + 0.0245786) - 0.000090537;
    vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
    return a / b;
  }
  // The renderer's own ACES filmic curve, so the studio shot on the screen matches the frame it replaces
  vec3 aces(vec3 c) {
    const mat3 inM = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777));
    const mat3 outM = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602));
    c *= uExposure / 0.6;
    return clamp(outM * rrtOdtFit(inM * c), 0.0, 1.0);
  }
  void main() {
    vec3 studio = aces(texture2D(uStudio, vUv).rgb);
    vec3 ui = texture2D(uUi, vUv).rgb;
    gl_FragColor = vec4(mix(studio, ui, uMix), 1.0);
    #include <colorspace_fragment>
  }
`;

// --- The world -----------------------------------------------------------------------------------------------------

export function buildWorld(opts: WorldOptions, exposure: number): StoryWorld {
  const root = new THREE.Group();
  const fog = new THREE.Fog('#0C110E', 20, 80);
  const owned: { dispose(): void }[] = [];
  const own = <T extends { dispose(): void }>(x: T) => (owned.push(x), x);
  const m4 = new THREE.Matrix4();

  // ---- Lights: soft sky fill and one warm key light that follows the camera (see aim) ----
  root.add(new THREE.HemisphereLight('#AFC3D6', '#3A2C1E', 0.55));
  const key = new THREE.DirectionalLight('#FFEFD8', 2.3);
  key.castShadow = opts.shadows;
  if (opts.shadows) {
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.0004;
  }
  root.add(key, key.target);
  const KEY_DIR = new THREE.Vector3(0.45, 0.8, 0.55).normalize();

  const [SXs, SYs, SZs] = WORLD.screenCenter;
  const [SW, SH] = WORLD.screenSize;
  const S = new THREE.Vector3(...WORLD.studio);
  const top = WORLD.deskTop;

  const floorTex = own(concreteTexture());
  floorTex.repeat.set(120, 55);
  root.add(mesh(new THREE.PlaneGeometry(900, 400).rotateX(-Math.PI / 2), std('#5A5A54', { map: floorTex, roughness: 0.92 }), 110, 0, 20, false));

  // ---- Studio (scenes 1-2): a product shot on a seamless floor under a warm spot ----
  root.add(mesh(new THREE.CircleGeometry(60, 96).rotateX(-Math.PI / 2), std('#4B4741', { roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }), S.x, 0.01, S.z, false));
  const spot = new THREE.SpotLight('#FFDDB0', 520, 0, 0.5, 0.75, 2);
  spot.position.set(S.x + 1.2, 11, S.z + 3);
  spot.target.position.set(S.x + 1.4, 0, S.z);
  root.add(spot, spot.target);

  const tex = {
    label: jarLabelTexture(),
    note: stickyNoteTexture(),
    livery: truckLiveryTexture(),
    mat: matTexture(),
    palletBox: palletBoxTexture(),
  };

  const studioJar = buildJar(opts, tex.label);
  studioJar.position.copy(S);
  root.add(studioJar);

  const lineMat = new THREE.MeshBasicMaterial({ color: '#3DBA5A', transparent: true, toneMapped: false });
  const vLine = mesh(new THREE.BoxGeometry(0.014, 1.4, 0.014), lineMat, S.x - 0.78, 0.7, S.z, false);
  const hLine = mesh(new THREE.BoxGeometry(1.0, 0.014, 0.014), lineMat, S.x, 1.62, S.z, false);
  const ticks = (
    [
      [S.x - 0.78, 0.0, 0.12, 0.014],
      [S.x - 0.78, 1.4, 0.12, 0.014],
      [S.x - 0.5, 1.62, 0.014, 0.12],
      [S.x + 0.5, 1.62, 0.014, 0.12],
    ] as const
  ).map(([x, y, w, h]) => mesh(new THREE.BoxGeometry(w, h, 0.014), lineMat, x, y, S.z, false));
  const hLabel = labelSprite('14 cm');
  hLabel.position.set(S.x - 1.22, 0.7, S.z);
  const wLabel = labelSprite('10 cm');
  wLabel.position.set(S.x, 1.86, S.z);
  root.add(vLine, hLine, ...ticks, hLabel, wLabel);

  const studioBox = buildCarton(SWATCHES[0], false);
  studioBox.group.visible = false;
  root.add(studioBox.group);

  // ---- Desk (scenes 3a-3c): 160 x 80 cm, top at 75 cm, against a wall ----
  const wood = own(woodTexture());
  wood.repeat.set(2, 1);
  root.add(mesh(rounded(16, 0.4, 8, 0.06), std('#FFFFFF', { map: wood, roughness: 0.55 }), 0, top - 0.2, -0.5));
  for (const [x, z] of [[-7.4, -4.1], [7.4, -4.1], [-7.4, 3.1], [7.4, 3.1]]) root.add(mesh(new THREE.BoxGeometry(0.35, top - 0.4, 0.35), metal('#2B2D2C', 0.5), x, (top - 0.4) / 2, z));
  const wallTex = own(plasterTexture());
  root.add(mesh(new THREE.PlaneGeometry(52, 30), std('#3A4039', { map: wallTex, roughness: 0.95 }), -6, 15, -6.5, false));

  root.add(mesh(rounded(SW + 0.24, SH + 0.3, 0.24, 0.08), std('#121314', { roughness: 0.42, envMapIntensity: 0.9 }), SXs, SYs - 0.05, SZs - 0.13));
  root.add(mesh(rounded(0.55, 1.75, 0.22, 0.06), metal('#B9BBBD'), SXs, top + 0.85, SZs - 0.42));
  root.add(mesh(rounded(2.3, 0.09, 1.6, 0.04), metal('#B9BBBD'), SXs, top + 0.045, SZs - 0.35));

  const screenUI = createScreenUI(STORY_BOX_SPEC);
  // the studio shot shown on the monitor during the reveal; lighter on phones and mid-range devices
  const studioRT = own(opts.shadows ? new THREE.WebGLRenderTarget(1280, 720, { type: THREE.HalfFloatType, samples: 4 }) : new THREE.WebGLRenderTarget(960, 540, { type: THREE.HalfFloatType }));
  const screenMat = new THREE.ShaderMaterial({
    uniforms: { uStudio: { value: studioRT.texture }, uUi: { value: screenUI.texture }, uMix: { value: 1 }, uExposure: { value: exposure } },
    vertexShader: SCREEN_VERT,
    fragmentShader: SCREEN_FRAG,
    toneMapped: false,
  });
  const screen = mesh(new THREE.PlaneGeometry(SW, SH), screenMat, SXs, SYs, SZs, false);
  root.add(screen);
  const glow = new THREE.PointLight('#D6E6FF', 7, 0, 2);
  glow.position.set(SXs, SYs, SZs + 1.4);
  root.add(glow);

  // the sticky note, stuck on the screen's lower-left corner
  const note = mesh(new THREE.PlaneGeometry(0.76, 0.76), std('#FFFFFF', { map: tex.note, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), SXs - SW / 2 + 0.32, SYs - SH / 2 + 0.38, SZs + 0.02, false);
  note.rotation.z = 0.09;
  root.add(note);

  // keyboard (aluminium deck, 75 keys), mouse, chai, and the customer's jar beside the screen
  root.add(mesh(rounded(4.3, 0.1, 1.35, 0.04), metal('#C4C6C8', 0.4), -0.2, top + 0.05, 0.25));
  const keys = new THREE.InstancedMesh(rounded(0.24, 0.06, 0.24, 0.025, 2), std('#2A2C2E', { roughness: 0.6 }), 75);
  for (let r = 0; r < 5; r++) for (let c = 0; c < 15; c++) keys.setMatrixAt(r * 15 + c, m4.makeTranslation(-2.16 + c * 0.28, top + 0.13, -0.31 + r * 0.28));
  keys.castShadow = keys.receiveShadow = true;
  root.add(keys);
  const mouse = mesh(new THREE.SphereGeometry(1, 32, 20), std('#DADAD5', { roughness: 0.35 }), 2.9, top + 0.02, 0.4);
  mouse.scale.set(0.32, 0.17, 0.55);
  root.add(mouse);
  const chai = buildChai(opts);
  chai.position.set(-3.5, top, 0.7);
  root.add(chai);
  const deskJar = buildJar(opts, tex.label);
  deskJar.position.set(-4.6, top, -1.0);
  deskJar.rotation.y = -1.2;
  root.add(deskJar);

  // ---- The designed box: pushes out through the screen and lands on the desk ----
  const landed = buildCarton(SWATCHES[5], true);
  const exitFrom = new THREE.Vector3(SXs + 0.95, SYs - 1.2, SZs - 0.6);
  const exitTo = new THREE.Vector3(...WORLD.landing);
  root.add(landed.group);
  const burst = new THREE.PointLight('#FFD58A', 0, 0, 2);
  burst.position.set(SXs + 0.9, SYs - 0.6, SZs + 0.8);
  root.add(burst);

  // ---- Factory: the pallet that fills with the 500 boxes ----
  const F = new THREE.Vector3(...WORLD.factory);
  const palletWood = std('#B08A5A', { map: wood, roughness: 0.8 });
  for (let i = 0; i < 7; i++) root.add(mesh(new THREE.BoxGeometry(12, 0.22, 1.1), palletWood, F.x, 1.33, F.z - 4.4 + i * 1.47));
  for (const x of [-5.4, 0, 5.4]) for (const z of [-4.3, 0, 4.3]) root.add(mesh(new THREE.BoxGeometry(1.3, 0.9, 1.3), palletWood, F.x + x, 0.77, F.z + z));
  for (const z of [-4.3, 0, 4.3]) root.add(mesh(new THREE.BoxGeometry(12, 0.3, 1.3), palletWood, F.x, 0.16, F.z + z));
  const BOX_W = STORY_BOX.length * CM + 0.06;
  const BOX_H = STORY_BOX.height * CM + 0.06;
  const PER_ROW = 9;
  const PER_LAYER = PER_ROW * 7;
  const stack = new THREE.InstancedMesh(rounded(BOX_W, BOX_H, BOX_W, 0.03, 2), std('#FFFFFF', { map: tex.palletBox, roughness: 0.85 }), PALLET_BOXES);
  stack.castShadow = stack.receiveShadow = true;
  stack.count = 0;
  stack.frustumCulled = false;
  const slots = Array.from({ length: PALLET_BOXES }, (_, i) => {
    const layer = Math.floor(i / PER_LAYER);
    const k = i % PER_LAYER;
    return new THREE.Vector3(
      F.x + ((k % PER_ROW) - (PER_ROW - 1) / 2) * (BOX_W + 0.02),
      1.44 + BOX_H / 2 + layer * (BOX_H + 0.01),
      F.z + (Math.floor(k / PER_ROW) - 3) * (BOX_W + 0.02)
    );
  });
  root.add(stack);
  const blanks = own(concreteTexture('#B98E5E', 13));
  blanks.repeat.set(4, 1);
  root.add(mesh(rounded(9, 2.2, 7, 0.05), std('#FFFFFF', { map: blanks, roughness: 0.9 }), F.x - 15, 1.1, F.z - 2));

  // ---- Road and the delivery truck (drives along +x) ----
  const asphalt = own(asphaltTexture());
  root.add(mesh(new THREE.PlaneGeometry(330, 26).rotateX(-Math.PI / 2), std('#FFFFFF', { map: asphalt, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }), 185, 0.02, WORLD.roadZ, false));
  const lines = own(roadLinesTexture());
  root.add(
    mesh(
      new THREE.PlaneGeometry(330, 22).rotateX(-Math.PI / 2),
      new THREE.MeshStandardMaterial({ map: lines, transparent: true, roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, depthWrite: false }),
      185,
      0.04,
      WORLD.roadZ,
      false
    )
  );
  const truck = new THREE.Group();
  const paint = std(INK.green, { roughness: 0.5, envMapIntensity: 0.8 });
  const liveryMat = std('#FFFFFF', { map: tex.livery, roughness: 0.5, envMapIntensity: 0.8 });
  truck.add(mesh(new THREE.BoxGeometry(34, 22, 19), [paint, paint, paint, paint, liveryMat, liveryMat], -6, 15.5, 0));
  truck.add(mesh(rounded(13, 16, 19, 1.2), std('#ECECE6', { roughness: 0.35, envMapIntensity: 0.9 }), 18.5, 12.5, 0));
  const tinted = std('#0E1418', { roughness: 0.08, metalness: 0.3, envMapIntensity: 1.2 });
  truck.add(mesh(new THREE.BoxGeometry(0.3, 6.2, 16.6), tinted, 25.05, 15.5, 0));
  for (const z of [-9.55, 9.55]) truck.add(mesh(new THREE.BoxGeometry(7, 5.5, 0.2), tinted, 19.5, 15.8, z));
  truck.add(mesh(new THREE.BoxGeometry(46, 2.2, 15), std('#1B1C1D', { roughness: 0.7 }), 2, 4.2, 0));
  for (const z of [-6.5, 6.5]) truck.add(mesh(new THREE.BoxGeometry(0.4, 1.2, 2.6), new THREE.MeshStandardMaterial({ color: '#FFF6D8', emissive: '#FFF0C0', emissiveIntensity: 2 }), 25.1, 7.6, z, false));
  const wheels: THREE.Group[] = [];
  const tyre = std('#141414', { roughness: 0.9 });
  const rim = metal('#9A9C9E', 0.4);
  for (const x of [-15, -8.5, 17]) {
    for (const z of [-8.6, 8.6]) {
      const w = new THREE.Group();
      w.position.set(x, 3.6, z);
      w.add(mesh(new THREE.CylinderGeometry(3.6, 3.6, 2.6, 28).rotateX(Math.PI / 2), tyre));
      w.add(mesh(new THREE.CylinderGeometry(2.1, 2.1, 2.7, 20).rotateX(Math.PI / 2), rim));
      truck.add(w);
      wheels.push(w);
    }
  }
  truck.position.set(WORLD.truckFrom, 0, WORLD.roadZ);
  root.add(truck);

  // ---- The house: doorstep, mat, the parcel and the unboxing ----
  const D = new THREE.Vector3(...WORLD.door);
  const tiles = own(tileTexture());
  root.add(mesh(new THREE.PlaneGeometry(30, 16).rotateX(-Math.PI / 2), std('#FFFFFF', { map: tiles, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }), D.x, 0.02, D.z - 1, false));
  const plaster = own(plasterTexture());
  plaster.repeat.set(10, 5);
  root.add(mesh(new THREE.BoxGeometry(70, 32, 1), std('#D2C4AB', { map: plaster, roughness: 0.95 }), D.x, 16, D.z - 4.6));
  root.add(mesh(new THREE.BoxGeometry(11, 23, 0.6), std('#3B2A1E', { roughness: 0.7 }), D.x, 11.5, D.z - 4.0));
  const doorTex = own(doorTexture());
  const doorEdge = std('#5B3B26');
  root.add(mesh(new THREE.BoxGeometry(9, 21, 0.35), [doorEdge, doorEdge, doorEdge, doorEdge, std('#FFFFFF', { map: doorTex, roughness: 0.6 }), doorEdge], D.x, 10.6, D.z - 3.6));
  root.add(mesh(new THREE.SphereGeometry(0.28, 16, 12), metal('#C9A24A', 0.3), D.x + 3.4, 10, D.z - 3.3));
  root.add(mesh(rounded(13, 0.5, 3, 0.08), std('#8E877C', { roughness: 0.85 }), D.x, 0.25, D.z - 2.6));
  const coir = std('#7A5C34', { roughness: 1 });
  root.add(mesh(rounded(5.4, 0.08, 3.4, 0.03, 2), [coir, coir, std('#FFFFFF', { map: tex.mat, roughness: 1 }), coir, coir, coir], D.x, 0.06, D.z + 0.1));
  root.add(mesh(rounded(0.8, 1.4, 0.6, 0.1), new THREE.MeshStandardMaterial({ color: '#FFE2A8', emissive: '#FFC870', emissiveIntensity: 2.2 }), D.x + 7.5, 13, D.z - 3.8, false));
  const lamp = new THREE.PointLight('#FFC873', 130, 0, 2);
  lamp.position.set(D.x + 7.5, 12.4, D.z - 2.6);
  root.add(lamp);
  root.add(mesh(lathe([[0, 0], [0.75, 0], [0.95, 1.6], [1.0, 1.7], [0.001, 1.7]]), std('#A4532E', { roughness: 0.85 }), D.x - 7.2, 0, D.z - 1.6));
  const leaves = std('#2F5A2A', { roughness: 0.7 });
  for (const [x, y, z, r] of [[0, 2.6, 0, 0.9], [0.5, 2.3, 0.2, 0.7], [-0.45, 2.4, -0.2, 0.75], [0.1, 3.2, -0.1, 0.6]]) root.add(mesh(new THREE.IcosahedronGeometry(r, 1), leaves, D.x - 7.2 + x, y, D.z - 1.6 + z));

  const parcel = buildCarton(SWATCHES[5], true);
  parcel.group.position.copy(D);
  root.add(parcel.group);
  const innerJar = buildJar(opts, tex.label);
  innerJar.position.copy(D);
  root.add(innerJar);
  const openLight = new THREE.PointLight('#FFC873', 0, 0, 2);
  openLight.position.set(D.x, 1.0, D.z);
  root.add(openLight);
  const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: own(glowTexture()), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0 }));
  glowSprite.position.set(D.x, 2.1, D.z);
  glowSprite.scale.set(3.4, 3.4, 1);
  root.add(glowSprite);

  // ---- Key light and fog follow whatever the camera is looking at, so shadows and depth work in every place ----
  // To stop shadow edges shimmering while the camera moves, the shadow area grows in 6% steps and its centre snaps
  // to whole shadow-map texels in the light's own space.
  const lightBasis = new THREE.Matrix4().lookAt(new THREE.Vector3(), KEY_DIR.clone().negate(), new THREE.Vector3(0, 1, 0));
  const lightInverse = lightBasis.clone().invert();
  const snapped = new THREE.Vector3();
  const aim = (target: THREE.Vector3, distance: number) => {
    const raw = Math.min(70, Math.max(3, distance * 0.55));
    const r = Math.pow(1.06, Math.round(Math.log(raw) / Math.log(1.06)));
    snapped.copy(target);
    if (opts.shadows) {
      const texel = (2 * r) / key.shadow.mapSize.x;
      snapped.applyMatrix4(lightInverse);
      snapped.x = Math.round(snapped.x / texel) * texel;
      snapped.y = Math.round(snapped.y / texel) * texel;
      snapped.applyMatrix4(lightBasis);
    }
    key.target.position.copy(snapped);
    key.position.copy(snapped).addScaledVector(KEY_DIR, r * 2.5);
    if (opts.shadows) {
      const cam = key.shadow.camera;
      cam.left = -r;
      cam.right = r;
      cam.top = r;
      cam.bottom = -r;
      cam.near = 0.1;
      cam.far = r * 6;
      cam.updateProjectionMatrix();
      key.shadow.normalBias = r * 0.003;
    }
    fog.near = distance * 1.6;
    fog.far = distance * 5;
  };
  const mainTarget = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  let mainDistance = 10;
  let lastMake = -1;

  const studioCam = new THREE.PerspectiveCamera(STUDIO_SHOT.fov, 16 / 9, 0.1, 600);
  studioCam.position.set(...STUDIO_SHOT.pos);
  studioCam.lookAt(...STUDIO_SHOT.target);
  const studioTarget = new THREE.Vector3(...STUDIO_SHOT.target);
  const studioDistance = studioCam.position.distanceTo(studioTarget);

  const cartons = [studioBox, landed, parcel];

  return {
    root,
    fog,
    update(p) {
      const s = sceneAt(p);
      const i = s.index;
      const pose = cameraAt(p);
      mainTarget.set(...pose.target);
      mainDistance = tmp.set(...pose.pos).distanceTo(mainTarget);
      aim(mainTarget, mainDistance);

      // Studio: the jar turns a little while the lines measure it; then the blank slides in, folds, takes the jar, closes
      const measure = measureAt(p);
      const fit = fitAt(p);
      const lines = measure * (1 - fit.slide);
      lineMat.opacity = lines;
      [vLine, hLine, ...ticks].forEach((m) => (m.visible = lines > 0.01));
      vLine.scale.y = Math.max(0.001, measure);
      vLine.position.y = 0.7 * measure;
      hLine.scale.x = Math.max(0.001, measure);
      (hLabel.material as THREE.SpriteMaterial).opacity = (wLabel.material as THREE.SpriteMaterial).opacity = clamp01((measure - 0.5) * 2) * (1 - fit.slide);
      hLabel.visible = wLabel.visible = lines > 0.01;

      studioBox.group.visible = i >= IDX.fit;
      studioBox.group.position.set(WORLD.studioBox[0] + (1 - fit.slide) * 9, 0, WORLD.studioBox[2]);
      studioBox.rig.setPose(fit.rig);
      const m = fit.jar;
      // label brand faces the camera (it is printed at a quarter turn round the jar), with a slow turn while measured
      studioJar.rotation.y = -1.45 + measure * 0.5;
      studioJar.position.set(
        S.x + (WORLD.studioBox[0] - S.x) * easeInOut(m),
        Math.sin(Math.PI * m) * 2.5 + 0.03 * m,
        S.z + (WORLD.studioBox[2] - S.z) * easeInOut(m)
      );

      // Monitor: the studio shot until the reveal settles, then a soft cross-fade into the designer
      screenMat.uniforms.uMix.value = i === IDX.reveal ? easeInOut(clamp01((s.local - REVEAL_SWAP) / 0.15)) : 1;
      const mini = miniAt(p);
      screenUI.draw(mini);
      mouse.position.set(2.9 + (mini.cursor[0] - 0.5) * 0.9, top + 0.02, 0.4 + (mini.cursor[1] - 0.5) * 0.6);

      // Order: the designed box pushes through the screen and lands on the desk
      const e = mini.exit;
      landed.group.visible = e > 0;
      landed.group.position.lerpVectors(exitFrom, exitTo, easeOutCubic(e));
      landed.group.position.y += Math.sin(Math.PI * Math.min(1, e * 1.15)) * 1.6;
      landed.group.scale.setScalar(0.75 + 0.25 * e);
      landed.group.rotation.set(Math.sin(Math.PI * e) * 0.18, -0.35 + e * 0.6, Math.sin(Math.PI * e) * -0.12);
      burst.intensity = i === IDX.order ? 40 * Math.sin(Math.PI * clamp01(e * 1.4)) : 0;

      // Make: the 500 boxes stack up layer by layer, the newest few dropping into place
      const make = makeAt(p);
      if (make !== lastMake) {
        lastMake = make;
        const LEAD = 14;
        const c = make * (PALLET_BOXES + LEAD);
        const count = Math.min(PALLET_BOXES, Math.max(0, Math.ceil(c)));
        for (let k = 0; k < count; k++) {
          const at = slots[k];
          stack.setMatrixAt(k, m4.makeTranslation(at.x, at.y + (1 - easeOutCubic(clamp01((c - k) / LEAD))) * 2.4, at.z));
        }
        stack.count = count;
        stack.instanceMatrix.needsUpdate = true;
      }

      // Ship: the truck drives down the road, wheels turning
      const x = truckX(shipAt(p));
      truck.position.x = x;
      wheels.forEach((w) => (w.rotation.z = -(x - WORLD.truckFrom) / 3.6));

      // Door: the parcel drops onto the mat; then the flaps open, light spills out and the jar rises
      const drop = doorDropAt(p);
      parcel.group.position.y = drop.height;
      parcel.group.rotation.y = -0.25 + drop.height * 0.06;
      const open = openAt(p);
      parcel.rig.setPose(1 - 0.28 * open);
      const rise = jarRiseAt(p);
      innerJar.visible = i >= IDX.open;
      innerJar.position.set(D.x, 0.03 + drop.height + rise * 1.55, D.z);
      innerJar.rotation.y = -1.75 + rise * 0.6;
      openLight.intensity = 14 * open;
      (glowSprite.material as THREE.SpriteMaterial).opacity = 0.75 * easeInOut(open);
    },
    needsStudioShot(p) {
      const s = sceneAt(p);
      return s.index === IDX.reveal && s.local < REVEAL_SWAP + 0.16;
    },
    renderStudioShot(gl, scene) {
      // The studio is in its final "fit" state whenever the reveal is on screen (state comes from p), so only the
      // camera, the key light and the fog need pointing at it for this one render
      screen.visible = false;
      aim(studioTarget, studioDistance);
      gl.setRenderTarget(studioRT);
      gl.clear();
      gl.render(scene, studioCam);
      gl.setRenderTarget(null);
      screen.visible = true;
      aim(mainTarget, mainDistance);
    },
    enableDetail(gl) {
      cartons.forEach((c) => c.rig.enableSurfaceDetail());
      setSurfaceTextureAnisotropy(gl.capabilities.getMaxAnisotropy());
    },
    refreshText() {
      const swap = (key: keyof typeof tex, make: () => THREE.CanvasTexture) => {
        const prev = tex[key];
        const next = make();
        root.traverse((o) => {
          const mat = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
          (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => {
            const sm = x as THREE.MeshStandardMaterial;
            if (sm.map === prev) {
              sm.map = next;
              sm.needsUpdate = true;
            }
          });
        });
        prev.dispose();
        tex[key] = next;
      };
      swap('label', jarLabelTexture);
      swap('note', stickyNoteTexture);
      swap('livery', truckLiveryTexture);
      swap('mat', matTexture);
      swap('palletBox', palletBoxTexture);
      printCarton(landed);
      printCarton(parcel);
      screenUI.refresh();
    },
    dispose() {
      // The rigs dispose their own parts (some textures are shared with the designer), so detach them first
      cartons.forEach((c) => {
        c.rig.dispose();
        c.prints.forEach((t) => t.dispose());
        c.group.remove(c.rig.object3d);
      });
      root.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => {
          (x as THREE.MeshStandardMaterial).map?.dispose?.();
          x.dispose();
        });
      });
      Object.values(tex).forEach((t) => t.dispose());
      screenUI.texture.dispose();
      owned.forEach((d) => d.dispose());
    },
  };
}
