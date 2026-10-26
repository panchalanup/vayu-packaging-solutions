/**
 * Studio stage (inside the R3F <Canvas>):
 *  - backgrounds: warm wood / concrete / brand-colour floor that fades into the sky (#10)
 *  - scenes: stacked clones, a full pallet load and a size reference (A4 sheet + 1 L bottle) (#12-lite)
 *  - StudioBridge: the imperative API the Showcase panel uses for angle presets, product shots (2x/4x PNG with an
 *    optional watermark), turntable / fold video (#11), thumbnails and GLB / USDZ model export (#40-lite)
 *
 * The carton itself belongs to BoxScene; this file only reads it from the scene graph (any top-level object that
 * contains meshes tagged with userData.face). Clones share geometry and materials, so they cost no extra GPU memory
 * and pick up colour and artwork changes for free. Everything here is tagged userData.studio and never pickable.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  ANGLE_PRESETS,
  AnglePreset,
  PALLET,
  StudioSettings,
  backgroundColours,
  palletLayout,
  pickVideoMime,
  shotPixelRatio,
  stackPlacements,
} from '@/lib/boxDesigner/studio';
import { getFitDistance } from '@/lib/boxDesigner/sceneMetrics';
import type { ViewExtents } from './Canvas3D';
import type { CartonRig } from '@/lib/boxDesigner/rig/panelRig';

/** The live carton rig when the scene exposes it (preferred over searching the scene graph) */
export type RigGetter = () => CartonRig | null;

export interface StudioApi {
  /** Move the camera to a preset angle (animated unless reduced motion) */
  view: (preset: AnglePreset, options?: { instant?: boolean }) => void;
  /** Clean PNG at `scale` × the on-screen size */
  shot: (options: { scale: number; watermark: string | null }) => Promise<Blob | null>;
  /** Small image of the current view (thumbnails, spec sheet views) */
  snapshot: (options: { width: number; mime?: 'image/jpeg' | 'image/png'; quality?: number }) => Promise<string | null>;
  /** Record a short turntable or fold video. `onFold` lets the page drive the fold. */
  record: (options: {
    kind: 'spin' | 'fold';
    seconds: number;
    onFold?: (percent: number) => void;
    onProgress?: (fraction: number) => void;
  }) => Promise<{ blob: Blob; ext: 'mp4' | 'webm' } | null>;
  canRecord: () => boolean;
  /** 3D model of the carton in metres (GLB for Android/desktop, USDZ for iOS AR Quick Look) */
  exportModel: (format: 'glb' | 'usdz') => Promise<Blob>;
}

const isStudio = (o: THREE.Object3D) => !!o.userData.studio;
const noRaycast = () => undefined;

/** Top-level scene objects that hold the carton (meshes tagged with a printable face) */
export function findCartons(scene: THREE.Scene): THREE.Object3D[] {
  return scene.children.filter((child) => {
    if (isStudio(child) || child.name === 'ground-grid') return false;
    let found = false;
    child.traverse((o) => {
      if (!found && (o as THREE.Mesh).isMesh && o.userData.face) found = true;
    });
    return found;
  });
}

/** World bounds of the carton surfaces (ignores overlays and the contact shadow) */
function cartonBounds(cartons: THREE.Object3D[]): THREE.Box3 {
  const box = new THREE.Box3();
  for (const carton of cartons) {
    carton.updateMatrixWorld(true);
    carton.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && o.userData.face && o.visible) box.expandByObject(o);
    });
  }
  if (box.isEmpty()) box.set(new THREE.Vector3(-10, 0, -10), new THREE.Vector3(10, 20, 10));
  return box;
}

/** Carton bounds: the rig's own bounds when available, else the tagged surfaces in the scene */
function liveBounds(scene: THREE.Scene, getRig?: RigGetter): THREE.Box3 {
  const rig = getRig?.();
  if (rig) {
    rig.object3d.updateMatrixWorld(true);
    const box = rig.getBounds().applyMatrix4(rig.object3d.matrixWorld);
    if (!box.isEmpty()) return box;
  }
  return cartonBounds(findCartons(scene));
}

/** Lightweight copies of the carton (shared geometry/materials, no overlays) */
function cartonCopies(scene: THREE.Scene, getRig?: RigGetter): THREE.Object3D[] {
  const rig = getRig?.();
  if (rig) {
    const copy = rig.createSnapshot();
    copy.position.copy(rig.object3d.position);
    copy.quaternion.copy(rig.object3d.quaternion);
    return [copy];
  }
  return findCartons(scene).map((carton) => {
    const copy = carton.clone(true);
    copy.traverse((o) => {
      o.raycast = noRaycast;
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh && (mesh.material as THREE.Material & { isMeshBasicMaterial?: boolean }).isMeshBasicMaterial) mesh.visible = false;
    });
    return copy;
  });
}

function extentsFromBox(box: THREE.Box3): ViewExtents {
  const center = box.getCenter(new THREE.Vector3());
  const radius = Math.max(1, box.getSize(new THREE.Vector3()).length() / 2);
  return { radius, center: [center.x, center.y, center.z], shadowRadius: radius };
}

// ---------------------------------------------------------------------------------------------------------------
// Procedural floor textures (no image files: drawn once on a canvas)

function woodTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d')!;
  const planks = 4;
  const tones = ['#b88a5a', '#ad7f50', '#c29463', '#a77a4b'];
  for (let i = 0; i < planks; i++) {
    const y = (i * c.height) / planks;
    ctx.fillStyle = tones[i % tones.length];
    ctx.fillRect(0, y, c.width, c.height / planks);
    // grain
    for (let g = 0; g < 26; g++) {
      ctx.strokeStyle = `rgba(80, 48, 20, ${0.05 + ((g * 37) % 10) / 100})`;
      ctx.lineWidth = 1 + ((g * 13) % 3);
      ctx.beginPath();
      const gy = y + ((g * 53) % 100) / 100 * (c.height / planks);
      ctx.moveTo(0, gy);
      for (let x = 0; x <= c.width; x += 32) ctx.lineTo(x, gy + Math.sin((x + g * 40) / 70) * 3);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(50, 30, 12, 0.45)';
    ctx.fillRect(0, y, c.width, 2);
    // staggered plank joints
    ctx.fillRect(((i * 197) % c.width) | 0, y, 2, c.height / planks);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function concreteTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#a9a9a4';
  ctx.fillRect(0, 0, c.width, c.height);
  // deterministic speckle (no Math.random so every render looks the same)
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 2600; i++) {
    const v = Math.floor(140 + rand() * 60);
    ctx.fillStyle = `rgba(${v}, ${v}, ${v - 4}, ${0.25 + rand() * 0.35})`;
    ctx.fillRect(rand() * c.width, rand() * c.height, 1 + rand() * 2, 1 + rand() * 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function radialFade(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 30, 128, 128, 128);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.55, '#ffffff');
  g.addColorStop(1, '#000000');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

function Floor({ settings, radius }: { settings: StudioSettings; radius: number }) {
  const invalidate = useThree((s) => s.invalidate);
  const { floor } = backgroundColours(settings);
  const size = Math.max(300, radius * 14);
  const textures = useMemo(() => {
    if (settings.background === 'wood') return woodTexture();
    if (settings.background === 'concrete') return concreteTexture();
    return null;
  }, [settings.background]);
  const fade = useMemo(() => radialFade(), []);

  useEffect(() => {
    if (textures) {
      // one texture tile ≈ 120 cm of floor (planks ~30 cm wide)
      textures.repeat.set(size / 120, size / 120);
      textures.needsUpdate = true;
    }
    invalidate();
  }, [textures, size, invalidate]);

  useEffect(() => () => textures?.dispose(), [textures]);
  useEffect(() => () => fade.dispose(), [fade]);

  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-0.02} userData={{ studio: true }} raycast={noRaycast} renderOrder={-1}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial
        color={textures ? '#ffffff' : floor}
        map={textures}
        alphaMap={fade}
        transparent
        depthWrite={false}
        roughness={0.9}
        metalness={0}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Scenes

function useCartonClones(enabled: boolean, cloneKey: string, place: (bounds: THREE.Box3) => THREE.Vector3[], getRig?: RigGetter) {
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);
  const group = useMemo(() => {
    const g = new THREE.Group();
    g.userData.studio = true;
    g.name = 'studio-clones';
    return g;
  }, []);
  const placeRef = useRef(place);
  placeRef.current = place;
  const getRigRef = useRef(getRig);
  getRigRef.current = getRig;

  useEffect(() => {
    if (!enabled) {
      group.clear();
      invalidate();
      return;
    }
    // Wait for the fold animation and artwork to settle before cloning the pose
    const timer = window.setTimeout(() => {
      group.clear();
      const bounds = liveBounds(scene, getRigRef.current);
      for (const offset of placeRef.current(bounds)) {
        for (const copy of cartonCopies(scene, getRigRef.current)) {
          copy.userData.studio = true;
          copy.traverse((o) => (o.raycast = noRaycast));
          copy.position.add(offset);
          group.add(copy);
        }
      }
      invalidate();
    }, 700);
    return () => window.clearTimeout(timer);
  }, [enabled, cloneKey, scene, group, invalidate]);

  return group;
}

function StackScene({ cloneKey, getRig }: { cloneKey: string; getRig?: RigGetter }) {
  const group = useCartonClones(
    true,
    cloneKey,
    (bounds) => {
      const size = bounds.getSize(new THREE.Vector3());
      return stackPlacements({ length: size.x, width: size.z, height: size.y }).map((p) => new THREE.Vector3(p.x, p.y, p.z));
    },
    getRig
  );
  return <primitive object={group} />;
}

function PalletScene({ cloneKey, colorHex, onBounds, getRig }: { cloneKey: string; colorHex: string; onBounds: (box: THREE.Box3) => void; getRig?: RigGetter }) {
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);
  const group = useMemo(() => {
    const g = new THREE.Group();
    g.userData.studio = true;
    return g;
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      group.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry.dispose();
          (mesh.material as THREE.Material).dispose();
        }
      });
      group.clear();
      const bounds = liveBounds(scene, getRig);
      const size = bounds.getSize(new THREE.Vector3());
      const layout = palletLayout({ length: size.x, width: size.z, height: size.y });
      // Pallet sits behind the user's box
      const origin = new THREE.Vector3(0, 0, bounds.min.z - PALLET.width / 2 - 15);

      // Deck: three runners and top boards
      const wood = new THREE.MeshStandardMaterial({ color: '#b88a5a', roughness: 0.95 });
      const board = (w: number, h: number, d: number, x: number, y: number, z: number) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wood.clone());
        m.position.set(origin.x + x, y + h / 2, origin.z + z);
        m.castShadow = m.receiveShadow = true;
        m.raycast = noRaycast;
        group.add(m);
      };
      for (const z of [-PALLET.width / 2 + 5, 0, PALLET.width / 2 - 5]) board(PALLET.length, 10, 10, 0, 0, z);
      for (let i = 0; i < 7; i++) board(14, 2.2, PALLET.width, -PALLET.length / 2 + 7 + i * ((PALLET.length - 14) / 6), 10, 0);

      // Load: one instanced cuboid per box (simplified: board colour, slightly inset so seams read)
      const inset = 0.4;
      const footL = (layout.rotated ? size.z : size.x) - inset;
      const footW = (layout.rotated ? size.x : size.z) - inset;
      const geo = new THREE.BoxGeometry(footL, size.y - inset, footW);
      const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.85 });
      const mesh = new THREE.InstancedMesh(geo, mat, layout.positions.length);
      const m4 = new THREE.Matrix4();
      layout.positions.forEach((p, i) => {
        m4.makeTranslation(origin.x + p.x, p.y + size.y / 2, origin.z + p.z);
        mesh.setMatrixAt(i, m4);
      });
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.raycast = noRaycast;
      group.add(mesh);

      const total = new THREE.Box3().setFromObject(group).union(bounds);
      onBounds(total);
      invalidate();
    }, 400);
    return () => window.clearTimeout(timer);
  }, [cloneKey, colorHex, scene, group, invalidate, onBounds, getRig]);

  useEffect(
    () => () =>
      group.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry.dispose();
          (mesh.material as THREE.Material).dispose();
        }
      }),
    [group]
  );

  return <primitive object={group} />;
}

function a4Texture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 420;
  c.height = 594;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = '#d6d6d6';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, c.width - 4, c.height - 4);
  ctx.fillStyle = '#4A5A50';
  ctx.font = '600 44px Inter, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('A4', c.width / 2, c.height / 2 - 10);
  ctx.font = '26px Inter, Arial, sans-serif';
  ctx.fillText('210 × 297 mm', c.width / 2, c.height / 2 + 32);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** 1 litre bottle, about 8.5 cm across and 30 cm tall */
function bottleGeometry(): THREE.LatheGeometry {
  const r = 4.25;
  const profile = [
    [0, 0],
    [r - 0.4, 0],
    [r, 0.5],
    [r, 20],
    [r * 0.92, 22],
    [1.6, 26.5],
    [1.4, 28],
    [1.55, 28.4],
    [1.55, 30],
    [0, 30],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(profile, 40);
}

function ReferenceScene({ cloneKey, onBounds, getRig }: { cloneKey: string; onBounds: (box: THREE.Box3) => void; getRig?: RigGetter }) {
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);
  const a4 = useMemo(() => a4Texture(), []);
  const bottle = useMemo(() => bottleGeometry(), []);
  const paperRef = useRef<THREE.Mesh>(null);
  const bottleRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const bounds = liveBounds(scene, getRig);
      if (paperRef.current) paperRef.current.position.set(bounds.max.x + 6 + 10.5, 0.06, bounds.max.z - 14.85);
      if (bottleRef.current) bottleRef.current.position.set(bounds.min.x - 10, 0, bounds.max.z - 6);
      const total = bounds.clone();
      if (paperRef.current) total.expandByObject(paperRef.current);
      if (bottleRef.current) total.expandByObject(bottleRef.current);
      onBounds(total);
      invalidate();
    }, 400);
    return () => window.clearTimeout(timer);
  }, [cloneKey, scene, onBounds, invalidate, getRig]);

  useEffect(() => () => {
    a4.dispose();
    bottle.dispose();
  }, [a4, bottle]);

  return (
    <group userData={{ studio: true }}>
      <mesh ref={paperRef} rotation-x={-Math.PI / 2} raycast={noRaycast} receiveShadow>
        <planeGeometry args={[21, 29.7]} />
        <meshStandardMaterial map={a4} roughness={0.95} />
      </mesh>
      <mesh ref={bottleRef} geometry={bottle} castShadow raycast={noRaycast}>
        <meshPhysicalMaterial color="#2f6b46" roughness={0.15} metalness={0} transparent opacity={0.82} clearcoat={1} />
      </mesh>
    </group>
  );
}

export function StudioStage({
  settings,
  radius,
  cloneKey,
  colorHex,
  onExtents,
  getRig,
}: {
  getRig?: RigGetter;
  settings: StudioSettings;
  radius: number;
  /** Changes whenever the carton's shape or pose changes (clones are rebuilt) */
  cloneKey: string;
  colorHex: string;
  /** Wider framing for multi-object scenes; null = frame the box only */
  onExtents: (extents: ViewExtents | null) => void;
}) {
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);

  // Sky colour
  useEffect(() => {
    scene.background = new THREE.Color(backgroundColours(settings).sky);
    const grid = scene.getObjectByName('ground-grid');
    if (grid) grid.visible = settings.background === 'studio';
    invalidate();
  }, [scene, settings, invalidate]);

  // Stack framing from the clone layout
  useEffect(() => {
    if (settings.scene !== 'stack') return;
    const timer = window.setTimeout(() => {
      const bounds = liveBounds(scene, getRig);
      const size = bounds.getSize(new THREE.Vector3());
      const total = bounds.clone();
      for (const p of stackPlacements({ length: size.x, width: size.z, height: size.y })) {
        total.union(bounds.clone().translate(new THREE.Vector3(p.x, p.y, p.z)));
      }
      onExtents(extentsFromBox(total));
    }, 750);
    return () => window.clearTimeout(timer);
  }, [settings.scene, cloneKey, scene, onExtents, getRig]);

  useEffect(() => {
    if (settings.scene === 'single') onExtents(null);
  }, [settings.scene, onExtents]);

  const reportBounds = useMemo(() => (box: THREE.Box3) => onExtents(extentsFromBox(box)), [onExtents]);

  return (
    <>
      {settings.background !== 'studio' && <Floor settings={settings} radius={radius} />}
      {settings.scene === 'stack' && <StackScene cloneKey={cloneKey} getRig={getRig} />}
      {settings.scene === 'pallet' && <PalletScene cloneKey={cloneKey} colorHex={colorHex} onBounds={reportBounds} getRig={getRig} />}
      {settings.scene === 'reference' && <ReferenceScene cloneKey={cloneKey} onBounds={reportBounds} getRig={getRig} />}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Imperative API

type Controls = THREE.EventDispatcher & { target: THREE.Vector3; update: () => void; enabled: boolean; autoRotate?: boolean };

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/** Keep only what a real carton is made of: lit (standard/physical) meshes, no overlays or helpers */
function exportableClone(cartons: THREE.Object3D[], forUsdz: boolean): THREE.Group {
  const root = new THREE.Group();
  root.name = 'VayuBox';
  for (const carton of cartons) {
    carton.updateMatrixWorld(true);
    const copy = carton.clone(true);
    const drop: THREE.Object3D[] = [];
    copy.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const material = mesh.material as THREE.MeshStandardMaterial;
      if (Array.isArray(mesh.material) || !material?.isMeshStandardMaterial || !mesh.visible) {
        drop.push(mesh);
        return;
      }
      if (forUsdz) {
        // USDZ: one material per mesh, only drawable base-colour textures, single-sided
        const m = material.clone();
        const drawable = (t: THREE.Texture | null) =>
          !!t && (t.image instanceof HTMLCanvasElement || t.image instanceof HTMLImageElement || (typeof ImageBitmap !== 'undefined' && t.image instanceof ImageBitmap));
        if (!drawable(m.map)) m.map = null;
        m.normalMap = m.roughnessMap = m.metalnessMap = m.aoMap = m.bumpMap = m.alphaMap = m.emissiveMap = null;
        m.side = THREE.FrontSide;
        mesh.material = m;
      }
    });
    drop.forEach((o) => o.removeFromParent());
    root.add(copy);
  }
  // Scene units are centimetres; glTF and USD expect metres
  root.scale.setScalar(0.01);
  root.updateMatrixWorld(true);
  return root;
}

export function StudioBridge({ extents, onReady }: { extents: ViewExtents; onReady?: (api: StudioApi) => void }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const controls = useThree((s) => s.controls) as unknown as Controls | null;
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  const move = useRef<{ position: THREE.Vector3; target: THREE.Vector3 } | null>(null);
  const live = useRef({ extents, controls, size });
  live.current = { extents, controls, size };

  useFrame((_, delta) => {
    const m = move.current;
    const c = live.current.controls;
    if (!m || !c) return;
    const k = 1 - Math.exp(-Math.min(delta, 0.1) * 6);
    camera.position.lerp(m.position, k);
    c.target.lerp(m.target, k);
    c.update();
    if (camera.position.distanceTo(m.position) < 0.05 && c.target.distanceTo(m.target) < 0.05) {
      camera.position.copy(m.position);
      c.target.copy(m.target);
      c.update();
      move.current = null;
    }
    invalidate();
  });

  useEffect(() => {
    if (!onReady) return;

    const view = (preset: AnglePreset, options: { instant?: boolean } = {}) => {
      const { extents: ext, size: sz } = live.current;
      const dir = ANGLE_PRESETS.find((p) => p.id === preset)?.dir ?? ANGLE_PRESETS[0].dir;
      const target = new THREE.Vector3(...ext.center);
      const distance = getFitDistance(ext.radius, camera.fov, sz.width / Math.max(1, sz.height));
      const position = target.clone().add(new THREE.Vector3(...dir).multiplyScalar(distance));
      if ((options.instant || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) && live.current.controls) {
        move.current = null;
        camera.position.copy(position);
        live.current.controls.target.copy(target);
        live.current.controls.update();
        invalidate();
      } else {
        move.current = { position, target };
        invalidate();
      }
    };

    /** Render once with helpers hidden and hand the frame to `read` in the same task (no preserveDrawingBuffer) */
    const renderClean = <T,>(ratio: number, read: (canvas: HTMLCanvasElement) => T): T => {
      const grid = scene.getObjectByName('ground-grid');
      const gridVisible = grid?.visible ?? false;
      if (grid) grid.visible = false;
      const previous = gl.getPixelRatio();
      gl.setPixelRatio(ratio);
      try {
        gl.render(scene, camera);
        return read(gl.domElement);
      } finally {
        gl.setPixelRatio(previous);
        if (grid) grid.visible = gridVisible;
        invalidate();
      }
    };

    const toBlob = (canvas: HTMLCanvasElement, mime = 'image/png', quality?: number) =>
      new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));

    const shot: StudioApi['shot'] = async ({ scale, watermark }) => {
      await nextFrame();
      const { size: sz } = live.current;
      const ctxGl = gl.getContext();
      const maxSide = Math.min(ctxGl.getParameter(ctxGl.MAX_RENDERBUFFER_SIZE) as number, ctxGl.getParameter(ctxGl.MAX_TEXTURE_SIZE) as number);
      const ratio = shotPixelRatio(sz.width, sz.height, scale, maxSide);
      const out = renderClean(ratio, (source) => {
        const c = document.createElement('canvas');
        c.width = source.width;
        c.height = source.height;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(source, 0, 0);
        if (watermark) {
          const pad = Math.round(c.width * 0.02);
          const fontPx = Math.max(12, Math.round(c.width * 0.016));
          ctx.font = `600 ${fontPx}px Inter, Arial, sans-serif`;
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          ctx.fillStyle = 'rgba(23, 35, 28, 0.55)';
          ctx.fillText(watermark.slice(0, 60), c.width - pad, c.height - pad);
        }
        return c;
      });
      return toBlob(out);
    };

    const snapshot: StudioApi['snapshot'] = async ({ width, mime = 'image/jpeg', quality = 0.82 }) => {
      await nextFrame();
      return renderClean(gl.getPixelRatio(), (source) => {
        const k = Math.min(1, width / source.width);
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(source.width * k));
        c.height = Math.max(1, Math.round(source.height * k));
        c.getContext('2d')!.drawImage(source, 0, 0, c.width, c.height);
        return c.toDataURL(mime, quality);
      });
    };

    const canRecord = () =>
      typeof MediaRecorder !== 'undefined' &&
      typeof gl.domElement.captureStream === 'function' &&
      !!pickVideoMime((m) => MediaRecorder.isTypeSupported(m));

    const record: StudioApi['record'] = async ({ kind, seconds, onFold, onProgress }) => {
      const format = typeof MediaRecorder !== 'undefined' ? pickVideoMime((m) => MediaRecorder.isTypeSupported(m)) : null;
      const c = live.current.controls;
      if (!format || typeof gl.domElement.captureStream !== 'function' || !c) return null;

      const stream = gl.domElement.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: format.mime, videoBitsPerSecond: 8_000_000 });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      const stopped = new Promise<void>((resolve) => (recorder.onstop = () => resolve()));

      const grid = scene.getObjectByName('ground-grid');
      const gridVisible = grid?.visible ?? false;
      if (grid) grid.visible = false;
      const wasEnabled = c.enabled;
      c.enabled = false;
      move.current = null;

      const target = c.target.clone();
      const offset = camera.position.clone().sub(target);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      const startTheta = spherical.theta;
      const turn = kind === 'spin' ? Math.PI * 2 : Math.PI * 0.6;
      const durationMs = seconds * 1000;
      let folded = false;
      let unfolded = false;

      recorder.start(250);
      const start = performance.now();
      try {
        await new Promise<void>((resolve) => {
          const tick = () => {
            const t = Math.min(1, (performance.now() - start) / durationMs);
            // ease in-out so loops look smooth
            const e = kind === 'spin' ? t : t * t * (3 - 2 * t);
            spherical.theta = startTheta + turn * e;
            camera.position.copy(target).add(new THREE.Vector3().setFromSpherical(spherical));
            camera.lookAt(target);
            if (kind === 'fold') {
              if (!unfolded && t > 0.06) {
                unfolded = true;
                onFold?.(0);
              }
              if (!folded && t > 0.5) {
                folded = true;
                onFold?.(100);
              }
            }
            onProgress?.(t);
            invalidate();
            if (t < 1) requestAnimationFrame(tick);
            else resolve();
          };
          requestAnimationFrame(tick);
        });
        await new Promise((r) => setTimeout(r, 200));
      } finally {
        if (recorder.state !== 'inactive') recorder.stop();
        await stopped;
        stream.getTracks().forEach((track) => track.stop());
        c.enabled = wasEnabled;
        c.update();
        if (grid) grid.visible = gridVisible;
        invalidate();
      }
      return chunks.length ? { blob: new Blob(chunks, { type: format.mime.split(';')[0] }), ext: format.ext } : null;
    };

    const exportModel: StudioApi['exportModel'] = async (format) => {
      const cartons = findCartons(scene);
      if (!cartons.length) throw new Error('Nothing to export');
      if (format === 'glb') {
        const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
        const exporter = new GLTFExporter();
        const parse = (root: THREE.Object3D) =>
          new Promise<ArrayBuffer>((resolve, reject) =>
            exporter.parse(root, (result) => resolve(result as ArrayBuffer), reject, { binary: true, onlyVisible: true })
          );
        let buffer: ArrayBuffer;
        try {
          buffer = await parse(exportableClone(cartons, false));
        } catch {
          // Some generated textures cannot be encoded: fall back to plain colours
          buffer = await parse(exportableClone(cartons, true));
        }
        return new Blob([buffer], { type: 'model/gltf-binary' });
      }
      const { USDZExporter } = await import('three/examples/jsm/exporters/USDZExporter.js');
      // three 0.160's parse() is async and returns the bytes; newer typings describe a callback form
      const exporter = new USDZExporter() as unknown as { parse: (root: THREE.Object3D) => Promise<Uint8Array<ArrayBuffer>> };
      const data = await exporter.parse(exportableClone(cartons, true));
      return new Blob([data], { type: 'model/vnd.usdz+zip' });
    };

    onReady({ view, shot, snapshot, record, canRecord, exportModel });
  }, [onReady, gl, scene, camera, invalidate]);

  return null;
}
