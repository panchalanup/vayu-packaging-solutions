/**
 * The one WebGL canvas of the showcase page (chapters 1-3). Loaded lazily, never on the low tier.
 *
 * It owns no animation of its own: the stage store eases every value (fold, camera, spin, highlight) and this canvas
 * only renders what the store says, on demand. So an idle page renders nothing, and scrolling renders exactly one
 * frame per eased step.
 *
 * The flat view is framed to match the on-page SVG dieline pixel for pixel (same contain-fit of the same sheet), so
 * the hand-off from the 3D blank to the drawn dieline reads as one object.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createCartonRig } from '@/lib/boxDesigner/rig/createRig';
import { getLayoutViewExtents, getRigKey } from '@/lib/boxDesigner/styles/registry';
import { dielineForDesign, layoutForDesign } from '@/lib/boxDesigner/styles/designLayout';
import { dielineBlankBottom } from '@/lib/boxDesigner/dieline';
import { getBoardSpec } from '@/lib/boxDesigner/boardSpecs';
import { DEFAULT_DESIGN } from '@/lib/boxDesigner/designCodec';
import { TIER_SETTINGS, type PerfTier } from '@/lib/boxDesigner/perfTier';
import { setSurfaceTextureAnisotropy } from '@/lib/boxDesigner/textures/surfaceTextures';
import StudioEnvironment from '@/components/BoxDesigner/StudioEnvironment';
import type { StageStore } from '@/lib/showcase/stage';
import { BELOW_MM } from './flat';

const DEG = Math.PI / 180;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Neutral "Your Brand" mark (no real brand, VERIFY-LATER[SHW-06]) drawn once to a canvas texture, no network */
function brandTexture(widthCm: number, heightCm: number): THREE.CanvasTexture | null {
  const scale = 22;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(64, Math.round(widthCm * scale));
  canvas.height = Math.max(64, Math.round(heightCm * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const unit = Math.min(canvas.width, canvas.height);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  // mark: a green disc with a folded-corner "V"
  ctx.fillStyle = '#23803A';
  ctx.beginPath();
  ctx.arc(cx, cy - unit * 0.1, unit * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FBF8F3';
  ctx.lineWidth = unit * 0.028;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - unit * 0.07, cy - unit * 0.16);
  ctx.lineTo(cx, cy - unit * 0.05);
  ctx.lineTo(cx + unit * 0.07, cy - unit * 0.16);
  ctx.stroke();
  ctx.fillStyle = '#0F1A14';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.round(unit * 0.1)}px system-ui, sans-serif`;
  ctx.fillText('YOUR BRAND', cx, cy + unit * 0.14);
  ctx.fillStyle = 'rgba(15,26,20,0.65)';
  ctx.font = `500 ${Math.round(unit * 0.045)}px system-ui, sans-serif`;
  ctx.fillText('DESIGNED IN 3D', cx, cy + unit * 0.25);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

interface SceneProps {
  store: StageStore;
  tier: PerfTier;
  onReady: () => void;
  /** Share of the stage the flat blank fills (must match the SVG dieline layer's inset) */
  flatFill: number;
  /** >1 pulls the camera back so the box sits smaller in the frame (cinema: leaves room for the words) */
  orbitScale: number;
}

function StageScene({ store, tier, onReady, flatFill, orbitScale }: SceneProps) {
  const { gl, scene, camera, invalidate, size } = useThree();
  const design = useSyncExternalStore(store.subscribe, () => store.get().design);

  const boxDesign = useMemo(() => ({ ...DEFAULT_DESIGN, template: design.template, dimensions: design.dims }), [design.template, design.dims]);
  const layout = useMemo(() => layoutForDesign(boxDesign), [boxDesign]);
  const board = useMemo(() => getBoardSpec(boxDesign.ply, boxDesign.flutes), [boxDesign]);
  const sheet = useMemo(() => {
    const d = dielineForDesign(boxDesign);
    return { w: d.width, h: dielineBlankBottom(d) + BELOW_MM };
  }, [boxDesign]);

  // One rig per rig kind: resizing updates it in place, only a style of another family builds a new one
  const rigKey = getRigKey(layout);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- rebuilt only when the rig kind changes
  const rig = useMemo(() => createCartonRig(layout), [rigKey]);
  const shadowRadius = useMemo(() => getLayoutViewExtents(layout, 0).shadowRadius, [layout]);
  const last = useRef({ fold: -1, cam: -1, spin: -1, lx: 9, ly: 9, highlight: null as string | null });

  useLayoutEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 0.85;
    scene.background = null;
  }, [gl, scene]);

  useLayoutEffect(() => {
    rig.update(layout, board);
    rig.setColor(design.colorHex);
    rig.setPose(store.get().scene.fold);
    last.current.fold = -1; // force the camera and pose to refresh
    invalidate();
  }, [rig, layout, board, design.colorHex, store, invalidate]);

  // Print the neutral brand mark on the lid (or front); debounced so typing a size does not churn textures
  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      const surfaces = rig.getPrintSurfaces();
      const target = surfaces.find((s) => s.face === 'lid') ?? surfaces.find((s) => s.face === 'front') ?? surfaces[0];
      if (!target) return;
      const key = `brand-${target.face}-${Math.round(target.widthCm)}x${Math.round(target.heightCm)}`;
      for (const s of surfaces) if (s.face !== target.face && rig.getPrintKey(s.face)) rig.setPrint(s.face, null, '');
      if (rig.getPrintKey(target.face) === key) return;
      const texture = brandTexture(target.widthCm, target.heightCm);
      if (cancelled) {
        texture?.dispose();
        return;
      }
      rig.setPrint(target.face, texture, key);
      invalidate();
    }, 160);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [rig, layout, invalidate]);

  // Paper grain and flute relief once idle, as in the designer
  useEffect(() => {
    const apply = () => {
      rig.enableSurfaceDetail();
      setSurfaceTextureAnisotropy(gl.capabilities.getMaxAnisotropy());
      invalidate();
      // compile the shaders now, off the critical moment (in parallel where the browser supports it), so the first
      // scroll through the unfold never stalls on a first-time compile
      const renderer = gl as THREE.WebGLRenderer & { compileAsync?: (o: THREE.Object3D, c: THREE.Camera) => Promise<unknown> };
      if (gl.getContext().getExtension('KHR_parallel_shader_compile')) renderer.compileAsync?.(scene, camera).then(() => invalidate(), () => undefined);
    };
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(apply, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(apply, 150);
    return () => window.clearTimeout(timer);
  }, [rig, gl, scene, camera, invalidate]);

  useEffect(() => store.subscribe(() => invalidate()), [store, invalidate]);
  useEffect(() => () => rig.dispose(), [rig]);

  // Re-frame when the canvas is resized or the framing changes
  useEffect(() => {
    last.current.fold = -1;
    invalidate();
  }, [size.width, size.height, flatFill, orbitScale, invalidate]);

  // Ready after two painted frames, so the poster is only hidden once the box is really on screen
  useEffect(() => {
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(onReady);
    });
    return () => cancelAnimationFrame(frame);
  }, [onReady]);

  useFrame(() => {
    const { scene: sc, spin, highlight, look } = store.get();
    const prev = last.current;
    if (highlight !== prev.highlight) {
      rig.setSelected(highlight);
      prev.highlight = highlight;
    }
    if (sc.fold === prev.fold && sc.cam === prev.cam && spin === prev.spin && look.x === prev.lx && look.y === prev.ly) return;
    if (sc.fold !== prev.fold) rig.setPose(sc.fold);
    prev.fold = sc.fold;
    prev.cam = sc.cam;
    prev.spin = spin;
    prev.lx = look.x;
    prev.ly = look.y;

    const cam = camera as THREE.PerspectiveCamera;
    const ext = getLayoutViewExtents(layout, sc.fold);
    const vHalf = (cam.fov * DEG) / 2;
    const hHalf = Math.atan(Math.tan(vHalf) * cam.aspect);
    const orbitDistance = (ext.radius / Math.sin(Math.min(vHalf, hHalf))) * 1.02 * orbitScale;

    // Flat view: the sheet (mm) fills the same share of the stage the SVG dieline does. 1 scene unit = 1 cm.
    const pxPerMm = Math.min((flatFill * size.width) / sheet.w, (flatFill * size.height) / sheet.h);
    const flatDistance = size.height / (2 * 10 * pxPerMm * Math.tan(vHalf));

    const k = sc.cam;
    // the box leans toward the pointer in the orbit view; the flat view stays square so it matches the drawing
    const elevation = (lerp(32, 89, k) - look.y * 5 * (1 - k)) * DEG;
    const azimuth = lerp(28 + spin + look.x * 14, 0, k) * DEG;
    const distance = lerp(orbitDistance, flatDistance, k);
    cam.position.set(
      ext.center[0] + distance * Math.cos(elevation) * Math.sin(azimuth),
      ext.center[1] + distance * Math.sin(elevation),
      ext.center[2] + distance * Math.cos(elevation) * Math.cos(azimuth)
    );
    cam.up.set(0, 1, 0);
    cam.lookAt(ext.center[0], ext.center[1], ext.center[2]);

    // Depth range fitted to the box every frame. The rig stacks board layers and decals a fraction of a millimetre
    // apart, so a loose range (near 1 / far 4000) makes them fight and shimmer. Here far/near stays around 2 to 4.
    const near = Math.max(0.5, distance - ext.radius * 1.6);
    const far = distance + ext.radius * 2.6;
    if (Math.abs(cam.near - near) > 0.05 || Math.abs(cam.far - far) > 0.05) {
      cam.near = near;
      cam.far = far;
      cam.updateProjectionMatrix();
    }
  });

  return (
    <>
      <StudioEnvironment radius={shadowRadius} center={[0, 0, 0]} tier={tier} restoreKey={0} />
      <primitive object={rig.object3d} />
    </>
  );
}

interface ShowcaseCanvasProps {
  store: StageStore;
  tier: PerfTier;
  onReady: () => void;
  /** The browser lost the WebGL context (or could not make one): the page falls back to the illustrated box */
  onFail: () => void;
  flatFill: number;
  orbitScale: number;
  /** Full-screen use: capped pixel ratio and no real-time shadows (a full-bleed canvas is the costly case) */
  lite: boolean;
}

export default function ShowcaseCanvas({ store, tier, onReady, onFail, flatFill, orbitScale, lite }: ShowcaseCanvasProps) {
  const settings = TIER_SETTINGS[tier];
  const shadows = tier === 'high' && settings.shadows && !lite;
  const failed = useRef(false);
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, lite ? Math.min(settings.maxDpr, 1.5) : settings.maxDpr]}
      shadows={shadows ? 'soft' : false}
      camera={{ fov: 30, near: 1, far: 4000, position: [120, 160, 160] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
      style={{ touchAction: 'pan-y' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault();
          if (!failed.current) {
            failed.current = true;
            onFail();
          }
        });
      }}
    >
      <StageScene store={store} tier={shadows ? tier : 'low'} onReady={onReady} flatFill={flatFill} orbitScale={orbitScale} />
    </Canvas>
  );
}
