/**
 * The story's canvas: a thin R3F wrapper around the imperative world (world.ts). Renders on demand, only when the
 * story progress changes. Loaded lazily and only near view, never on the low tier. Same pattern as HeroCanvas.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TIER_SETTINGS, type PerfTier } from '@/lib/boxDesigner/perfTier';
import type { FoldStore } from '../hero/foldStore';
import { cameraAt, fitFov } from './beats';
import { buildWorld, type StoryWorld } from './world';

function StoryRig({ store, onReady }: { store: FoldStore; onReady: () => void }) {
  const { gl, scene, camera, invalidate, size } = useThree();
  const [world, setWorld] = useState<StoryWorld | null>(null);
  const last = useRef(-1);

  // Built in an effect (not during render) so React StrictMode's mount/unmount/mount never reuses a disposed world
  useEffect(() => {
    const w = buildWorld();
    setWorld(w);
    return () => w.dispose();
  }, []);

  useLayoutEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 0.9;
    scene.background = null;
  }, [gl, scene]);

  useEffect(() => {
    if (!world) return;
    last.current = -1;
    invalidate();
    const off = store.subscribe(() => invalidate());
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(onReady);
    });
    return () => {
      off();
      cancelAnimationFrame(frame);
    };
  }, [world, store, invalidate, onReady]);

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
      camera={{ fov: 30, near: 0.5, far: 600, position: [4.8, 3.8, 3.4] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
      style={{ touchAction: 'pan-y' }}
    >
      <StoryRig store={store} onReady={onReady} />
    </Canvas>
  );
}
