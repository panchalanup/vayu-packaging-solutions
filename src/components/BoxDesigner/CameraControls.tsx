/**
 * Camera Controls
 * Orbit controls plus automatic framing:
 *  - fits the box on first view and keeps its apparent size when dimensions or viewport change
 *  - "Fit view" re-frames from the default angle
 *  - orbit limits scale with the box (5 cm to 100 cm boxes)
 *  - auto-rotate moves the camera (not the box) so lights and shadow stay consistent
 *
 * The scene renders on demand, so every programmatic camera move calls invalidate().
 */

import { ElementRef, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { DEFAULT_VIEW_DIRECTION, getCameraLimits, getFitDistance } from '@/lib/boxDesigner/sceneMetrics';

type ControlMode = 'rotate' | 'pan';

interface CameraControlsProps {
  /** Bounding-sphere radius of what should be framed (cm) */
  radius: number;
  /** Orbit centre */
  center: [number, number, number];
  controlMode: ControlMode;
  autoRotate: boolean;
  /** Increment to re-frame the box from the default angle */
  fitSignal: number;
}

/** Wait this long after the last dimension/viewport change before re-framing (avoids chasing slider drags) */
const REFIT_DEBOUNCE_MS = 250;

type OrbitControlsHandle = ElementRef<typeof OrbitControls>;

/**
 * Drop any leftover damping momentum so a programmatic move is not undone by inertia from the last drag.
 * three's OrbitControls zeroes its internal deltas on update() when damping is disabled.
 */
function stopMomentum(controls: OrbitControlsHandle) {
  const damping = controls.enableDamping;
  controls.enableDamping = false;
  controls.update();
  controls.enableDamping = damping;
}

interface FitState {
  radius: number;
  fitDistance: number;
  center: THREE.Vector3;
  aspect: number;
}

export default function CameraControls({ radius, center, controlMode, autoRotate, fitSignal }: CameraControlsProps) {
  const controlsRef = useRef<ElementRef<typeof OrbitControls>>(null);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);

  const [cx, cy, cz] = center;
  const aspect = size.width / Math.max(1, size.height);
  const limits = getCameraLimits(radius);

  const lastFit = useRef<FitState | null>(null);
  const animation = useRef<{ position: THREE.Vector3; target: THREE.Vector3 } | null>(null);
  const handledFitSignal = useRef(fitSignal);

  // Depth range follows the box so thin geometry does not z-fight at large boxes or clip at small ones
  useLayoutEffect(() => {
    camera.near = Math.max(0.05, limits.min * 0.1);
    camera.far = limits.max * 4;
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, limits.min, limits.max, invalidate]);

  /** Frame the box. `reset` = default angle + default zoom; otherwise keep angle and relative zoom. */
  const frame = useCallback(
    (mode: 'initial' | 'reset' | 'keep') => {
      const controls = controlsRef.current;
      if (!controls || size.width < 2 || size.height < 2) return;
      stopMomentum(controls);

      const center = new THREE.Vector3(cx, cy, cz);
      const fitDistance = getFitDistance(radius, camera.fov, aspect);
      const previous = lastFit.current;

      let direction = new THREE.Vector3(...DEFAULT_VIEW_DIRECTION);
      let distance = fitDistance;
      let target = center.clone();

      if (mode === 'keep' && previous) {
        const offset = camera.position.clone().sub(controls.target);
        const currentDistance = offset.length();
        if (currentDistance > 1e-6) direction = offset.normalize();
        // Keep the box the same apparent size: scale the zoom with the new fit distance
        const zoomRatio = currentDistance / previous.fitDistance;
        distance = THREE.MathUtils.clamp(zoomRatio * fitDistance, limits.min, limits.max);
        // Follow the box centre unless the user has panned away from it
        const panned = controls.target.distanceTo(previous.center) > previous.radius * 0.02;
        if (panned) target = controls.target.clone();
      }

      const nextPosition = target.clone().add(direction.multiplyScalar(distance));
      lastFit.current = { radius, fitDistance, center, aspect };

      const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (mode === 'initial' || reducedMotion) {
        camera.position.copy(nextPosition);
        controls.target.copy(target);
        controls.update();
        animation.current = null;
      } else {
        animation.current = { position: nextPosition, target };
      }
      invalidate();
    },
    [camera, aspect, radius, cx, cy, cz, limits.min, limits.max, size.width, size.height, invalidate]
  );

  // First placement (no animation) once the viewport size is known
  useLayoutEffect(() => {
    if (!lastFit.current) frame('initial');
  }, [frame]);

  // Re-frame (debounced) when the box size or viewport changes
  useEffect(() => {
    if (!lastFit.current) return;
    const previous = lastFit.current;
    const unchanged =
      Math.abs(previous.radius - radius) < 1e-6 &&
      Math.abs(previous.aspect - aspect) < 1e-3 &&
      Math.abs(previous.center.y - cy) < 1e-6;
    if (unchanged) return;

    const timer = window.setTimeout(() => frame('keep'), REFIT_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [radius, aspect, cy, frame]);

  // "Fit view" button
  useEffect(() => {
    if (handledFitSignal.current === fitSignal) return;
    handledFitSignal.current = fitSignal;
    frame('reset');
  }, [fitSignal, frame]);

  // Make sure auto-rotate starts rendering again when toggled on
  useEffect(() => {
    invalidate();
  }, [autoRotate, invalidate]);

  // Smooth camera transitions (only runs while a transition is active)
  useFrame((_, delta) => {
    const move = animation.current;
    const controls = controlsRef.current;
    if (!move || !controls) return;

    const k = 1 - Math.exp(-Math.min(delta, 0.1) * 7);
    camera.position.lerp(move.position, k);
    controls.target.lerp(move.target, k);
    controls.update();

    const settled =
      camera.position.distanceTo(move.position) < radius * 0.002 &&
      controls.target.distanceTo(move.target) < radius * 0.002;
    if (settled) {
      camera.position.copy(move.position);
      controls.target.copy(move.target);
      controls.update();
      animation.current = null;
    }
    invalidate();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={controlMode === 'pan'}
      enableZoom
      enableRotate={controlMode === 'rotate'}
      minDistance={limits.min}
      maxDistance={limits.max}
      maxPolarAngle={Math.PI}
      minPolarAngle={0}
      enableDamping
      dampingFactor={0.08}
      autoRotate={autoRotate}
      autoRotateSpeed={2.4}
      mouseButtons={{
        LEFT: controlMode === 'rotate' ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: controlMode === 'rotate' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
      }}
      touches={{
        ONE: controlMode === 'rotate' ? THREE.TOUCH.ROTATE : THREE.TOUCH.PAN,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
    />
  );
}
