/**
 * Studio Environment
 * Image-based lighting (generated procedurally, no network fetch), physically-scaled key/fill/rim lights,
 * a fitted shadow frustum and a ground plane that receives the shadow (the rig adds its own contact blob).
 *
 * Note: three.js 0.160 renders with physical lights, so intensities are in physical units.
 * Values were tuned by eye against the kraft / white / brown swatches together with the
 * environment intensity (material envMapIntensity) and ACES tone mapping at exposure 0.8.
 */

import { useEffect, useLayoutEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { getShadowFrustum } from '@/lib/boxDesigner/sceneMetrics';
import { TIER_SETTINGS, PerfTier } from '@/lib/boxDesigner/perfTier';

interface StudioEnvironmentProps {
  /** Radius covering every pose of the carton (cm) */
  radius: number;
  center: [number, number, number];
  tier: PerfTier;
  /** Bumped after a WebGL context restore so the environment map is rebuilt */
  restoreKey: number;
}

/** Light directions (unit-ish vectors from the box centre) */
const KEY_DIR = new THREE.Vector3(0.55, 0.78, 0.62).normalize();
const FILL_DIR = new THREE.Vector3(-0.8, 0.5, 0.45).normalize();
const RIM_DIR = new THREE.Vector3(-0.35, 0.55, -0.85).normalize();

export default function StudioEnvironment({ radius, center, tier, restoreKey }: StudioEnvironmentProps) {
  const { gl, scene, invalidate } = useThree();
  const settings = TIER_SETTINGS[tier];
  const keyRef = useRef<THREE.DirectionalLight>(null);

  const [cx, cy, cz] = center;

  // Image-based lighting: procedural "room" environment prefiltered once. Rebuilt after a context restore.
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    // Passing the renderer switches RoomEnvironment to physical light units; typings lag behind the runtime API.
    const room = new (RoomEnvironment as unknown as new (r: THREE.WebGLRenderer) => THREE.Scene & {
      dispose: () => void;
    })(gl);
    const target = pmrem.fromScene(room, 0.04);
    scene.environment = target.texture;
    room.dispose();
    pmrem.dispose();
    invalidate();

    return () => {
      if (scene.environment === target.texture) scene.environment = null;
      target.dispose();
      invalidate();
    };
  }, [gl, scene, invalidate, restoreKey]);

  // Fit the key light + shadow frustum to the box on every size/tier change
  useLayoutEffect(() => {
    const light = keyRef.current;
    if (!light) return;

    const frustum = getShadowFrustum(radius);
    light.position.set(
      cx + KEY_DIR.x * frustum.lightDistance,
      cy + KEY_DIR.y * frustum.lightDistance,
      cz + KEY_DIR.z * frustum.lightDistance
    );
    light.target.position.set(cx, cy, cz);
    light.target.updateMatrixWorld();

    const cam = light.shadow.camera;
    cam.left = -frustum.half;
    cam.right = frustum.half;
    cam.top = frustum.half;
    cam.bottom = -frustum.half;
    cam.near = frustum.near;
    cam.far = frustum.far;
    cam.updateProjectionMatrix();

    const size = settings.shadowMapSize;
    if (light.shadow.mapSize.x !== size) {
      light.shadow.mapSize.set(size, size);
      light.shadow.map?.dispose();
      light.shadow.map = null;
    }
    light.shadow.bias = -0.0004;
    light.shadow.normalBias = 0.02 + radius * 0.001;
    light.shadow.radius = 3;
    invalidate();
  }, [radius, cx, cy, cz, settings.shadowMapSize, settings.shadows, invalidate]);

  const fillPos = FILL_DIR.clone().multiplyScalar(radius * 4).add(new THREE.Vector3(cx, cy, cz));
  const rimPos = RIM_DIR.clone().multiplyScalar(radius * 4).add(new THREE.Vector3(cx, cy, cz));
  const groundSize = Math.max(200, radius * 16);

  return (
    <>
      {/* Sky/ground bounce: keeps undersides readable instead of black */}
      <hemisphereLight args={['#ffffff', '#d8cbb8', 0.25]} />

      {/* Key light (the only shadow caster) */}
      <directionalLight
        ref={keyRef}
        intensity={1.5}
        color="#fff6ea"
        castShadow={settings.shadows}
      />

      {/* Fill + rim: no shadows, shape the form and separate it from the background */}
      <directionalLight position={fillPos} intensity={0.35} color="#eef3ff" />
      <directionalLight position={rimPos} intensity={0.5} color="#ffe9cf" />

      {/* Ground: receives the real key-light shadow (only when shadows are on) */}
      {settings.shadows && (
        <mesh rotation-x={-Math.PI / 2} position-y={0.02} receiveShadow>
          <planeGeometry args={[groundSize, groundSize]} />
          <shadowMaterial transparent opacity={0.3} />
        </mesh>
      )}

    </>
  );
}
