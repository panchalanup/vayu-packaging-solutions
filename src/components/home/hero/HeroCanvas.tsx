/**
 * Slim hero canvas (§6 S1): the Box Designer's BoxRig with no designer UI, no controls and no editing.
 * Renders on demand only when the fold progress changes. Loaded lazily, never on the low tier.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { BoxRig } from '@/lib/boxDesigner/rig/boxRig';
import { computeRscLayout, getViewExtents } from '@/lib/boxDesigner/rig/rscLayout';
import { getBoardSpec, getBoardThicknessCm } from '@/lib/boxDesigner/boardSpecs';
import { TIER_SETTINGS, type PerfTier } from '@/lib/boxDesigner/perfTier';
import { setSurfaceTextureAnisotropy } from '@/lib/boxDesigner/textures/surfaceTextures';
import StudioEnvironment from '@/components/BoxDesigner/StudioEnvironment';
import { LOGO_IMAGES } from '@/constants/images';
import { HERO_BOX, type FoldStore } from './foldStore';

const KRAFT = '#C9A87C';
// VERIFY-LATER[IMG-05]: one-colour logo print (green-600 on kraft) pending owner approval of the artwork
const PRINT_GREEN = '#23803A';
const DEG = Math.PI / 180;

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Logo tinted to one colour, centred on a transparent canvas matching the panel aspect */
async function logoTexture(widthCm: number, heightCm: number): Promise<THREE.CanvasTexture | null> {
  const img = new Image();
  img.decoding = 'async';
  img.src = LOGO_IMAGES.horizontal;
  try {
    await img.decode();
  } catch {
    return null;
  }
  const scale = 24;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(widthCm * scale);
  canvas.height = Math.round(heightCm * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const w = canvas.width * 0.62;
  const h = (w * img.naturalHeight) / img.naturalWidth;
  ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = PRINT_GREEN;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function HeroScene({ store, tier, onReady }: { store: FoldStore; tier: PerfTier; onReady: () => void }) {
  const { gl, scene, camera, invalidate, size } = useThree();
  const [rig] = useState(() => new BoxRig());
  const last = useRef(-1);

  const { layout, board, shadowRadius } = useMemo(() => {
    const spec = getBoardSpec('5-ply');
    const l = computeRscLayout(HERO_BOX, getBoardThicknessCm(spec, HERO_BOX));
    return { layout: l, board: spec, shadowRadius: getViewExtents(l, 0).shadowRadius };
  }, []);

  useLayoutEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 0.85;
    scene.background = null;
    rig.update(layout, board);
    rig.setColor(KRAFT);
    rig.setPose(store.get());
    invalidate();
  }, [gl, scene, rig, layout, board, store, invalidate]);

  // Print the logo on the front and back walls
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const surface of rig.getPrintSurfaces()) {
        if (surface.face !== 'front' && surface.face !== 'back') continue;
        const texture = await logoTexture(surface.widthCm, surface.heightCm);
        if (cancelled) {
          texture?.dispose();
          return;
        }
        rig.setPrint(surface.face, texture, 'vayu-logo');
        invalidate();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rig, invalidate]);

  // Paper grain and flute relief after the first frame (idle), as in the designer
  useEffect(() => {
    const apply = () => {
      rig.enableSurfaceDetail();
      setSurfaceTextureAnisotropy(gl.capabilities.getMaxAnisotropy());
      invalidate();
    };
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(apply, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(apply, 120);
    return () => window.clearTimeout(timer);
  }, [rig, gl, invalidate]);

  useEffect(() => store.subscribe(() => invalidate()), [store, invalidate]);

  useEffect(() => {
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(onReady);
    });
    return () => cancelAnimationFrame(frame);
  }, [onReady]);

  useEffect(() => () => rig.dispose(), [rig]);

  // Re-frame when the canvas resizes
  useEffect(() => {
    last.current = -1;
    invalidate();
  }, [size.width, size.height, invalidate]);

  useFrame(() => {
    const u = store.get();
    if (u === last.current) return;
    last.current = u;
    rig.setPose(u);

    const cam = camera as THREE.PerspectiveCamera;
    const { radius, center } = getViewExtents(layout, u);
    const k = easeInOut(clamp01((u - 0.15) / 0.85));
    const elevation = (58 - 30 * k) * DEG;
    const azimuth = (28 + 8 * u) * DEG;
    const vHalf = (cam.fov * DEG) / 2;
    const hHalf = Math.atan(Math.tan(vHalf) * cam.aspect);
    const fit = radius / Math.sin(Math.min(vHalf, hHalf));
    const distance = fit * (1.02 - 0.08 * k);
    cam.position.set(
      center[0] + distance * Math.cos(elevation) * Math.sin(azimuth),
      center[1] + distance * Math.sin(elevation),
      center[2] + distance * Math.cos(elevation) * Math.cos(azimuth)
    );
    cam.lookAt(center[0], center[1], center[2]);
  });

  return (
    <>
      <StudioEnvironment radius={shadowRadius} center={[0, 0, 0]} tier={tier} restoreKey={0} />
      <primitive object={rig.object3d} />
    </>
  );
}

interface HeroCanvasProps {
  store: FoldStore;
  tier: PerfTier;
  onReady: () => void;
}

export default function HeroCanvas({ store, tier, onReady }: HeroCanvasProps) {
  // The hero never needs real-time shadows on medium: the rig's contact blob is enough
  const settings = TIER_SETTINGS[tier];
  const shadows = tier === 'high' && settings.shadows;
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, settings.maxDpr]}
      shadows={shadows ? 'soft' : false}
      camera={{ fov: 30, near: 1, far: 2000, position: [120, 160, 160] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
      style={{ touchAction: 'pan-y' }}
    >
      <HeroScene store={store} tier={shadows ? tier : 'low'} onReady={onReady} />
    </Canvas>
  );
}
