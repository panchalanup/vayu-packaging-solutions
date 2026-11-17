/**
 * The story's canvas: a thin R3F wrapper around the imperative world (world.ts). Renders on demand, only when the
 * story progress changes. Loaded lazily and only near view, never on the low tier. Same pattern as HeroCanvas.
 * Lighting is image-based from a procedural room (no download), as in the Box Designer's studio.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { TIER_SETTINGS, type PerfTier } from '@/lib/boxDesigner/perfTier';
import type { FoldStore } from '../hero/foldStore';
import { cameraAt, fitFov } from './beats';
import { buildWorld, type StoryWorld } from './world';

const EXPOSURE = 0.95;
const BACKGROUND = '#0C110E';

function StoryRig({ store, tier, onReady }: { store: FoldStore; tier: PerfTier; onReady: () => void }) {
  const { gl, scene, camera, invalidate, size } = useThree();
  const [world, setWorld] = useState<StoryWorld | null>(null);
  const last = useRef(-1);

  // Built in an effect (not during render) so React StrictMode's mount/unmount/mount never reuses a disposed world
  useEffect(() => {
    const w = buildWorld({ shadows: tier === 'high', glass: tier === 'high' }, EXPOSURE);
    setWorld(w);
    return () => w.dispose();
  }, [tier]);

  useLayoutEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = EXPOSURE;
    scene.background = new THREE.Color(BACKGROUND);
  }, [gl, scene]);

  // Image-based lighting: a procedural room, prefiltered once (as the designer's StudioEnvironment does)
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new (RoomEnvironment as unknown as new (r: THREE.WebGLRenderer) => THREE.Scene & { dispose: () => void })(gl);
    const target = pmrem.fromScene(room, 0.04);
    scene.environment = target.texture;
    room.dispose();
    pmrem.dispose();
    invalidate();
    return () => {
      if (scene.environment === target.texture) scene.environment = null;
      target.dispose();
    };
  }, [gl, scene, invalidate]);

  useEffect(() => {
    if (!world) return;
    scene.fog = world.fog;
    last.current = -1;
    invalidate();
    const off = store.subscribe(() => invalidate());

    // Board grain and flute relief once the first frames are out; printed text again once the fonts are in
    const detail = () => {
      world.enableDetail(gl);
      last.current = -1;
      invalidate();
    };
    const idle = typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(detail, { timeout: 1500 }) : window.setTimeout(detail, 200);
    let alive = true;
    document.fonts?.ready.then(() => {
      if (!alive) return;
      world.refreshText();
      last.current = -1;
      invalidate();
    });

    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(onReady);
    });
    return () => {
      alive = false;
      off();
      cancelAnimationFrame(frame);
      if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      if (scene.fog === world.fog) scene.fog = null;
    };
  }, [world, store, gl, scene, invalidate, onReady]);

  // Re-frame when the canvas resizes (orientation change, window resize)
  useEffect(() => {
    last.current = -1;
    invalidate();
  }, [size.width, size.height, invalidate]);

  useFrame(() => {
    if (!world) return;
    const p = store.get();
    if (p === last.current) return;
    last.current = p;
    world.update(p);
    const pose = cameraAt(p);
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...pose.pos);
    cam.lookAt(...pose.target);
    const fov = fitFov(pose.fov, cam.aspect);
    if (cam.fov !== fov) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    if (world.needsStudioShot(p)) world.renderStudioShot(gl, scene);
  });

  return world ? <primitive object={world.root} /> : null;
}

interface StoryCanvasProps {
  store: FoldStore;
  tier: PerfTier;
  onReady: () => void;
}

export default function StoryCanvas({ store, tier, onReady }: StoryCanvasProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, TIER_SETTINGS[tier].maxDpr]}
      shadows={tier === 'high' ? 'soft' : false}
      camera={{ fov: 30, near: 0.1, far: 600, position: [-76, 2.4, 8.8] }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      aria-hidden="true"
      style={{ touchAction: 'pan-y' }}
    >
      <StoryRig store={store} tier={tier} onReady={onReady} />
    </Canvas>
  );
}
