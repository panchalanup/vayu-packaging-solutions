/**
 * Box Scene
 * Thin react-three-fiber wrapper around the imperative BoxRig.
 *  - The rig is created once; prop changes mutate it (no rebuilds, no GPU buffer churn).
 *  - Fold progress is damped inside the render loop (no React state per frame) and the canvas only
 *    renders while something is moving (frameloop="demand").
 *  - Hover/selection only toggle emissive + outline on the existing materials.
 *  - Artwork is rendered per surface into decal textures, debounced and cancellable.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { BoxRig } from '@/lib/boxDesigner/rig/boxRig';
import type { RscLayout } from '@/lib/boxDesigner/rig/rscLayout';
import type { BoardSpec } from '@/lib/boxDesigner/boardSpecs';
import { setSurfaceTextureAnisotropy } from '@/lib/boxDesigner/textures/surfaceTextures';
import { printContentKey, renderPrintCanvas } from '@/lib/boxDesigner/textures/printLayer';
import type { BoxFace, FaceImage, TextElement } from '@/types/boxDesigner';

interface BoxSceneProps {
  layout: RscLayout;
  board: BoardSpec;
  colorHex: string;
  /** Target fold progress: 0 = flat blank, 1 = sealed */
  foldTarget: number;
  faceImages: FaceImage[];
  textElements: TextElement[];
  showIcons: boolean;
  selectedFace: BoxFace | null;
  onFaceSelect: (face: BoxFace | null) => void;
  /** Receives a function that renders a clean, high-resolution PNG of the current view */
  onCaptureReady?: (capture: () => Promise<Blob | null>) => void;
}

/** Wait for edits to settle before redrawing artwork (dimension drags, typing) */
const PRINT_DEBOUNCE_MS = 120;
/** Fold damping (higher = snappier) */
const FOLD_DAMPING = 4.5;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function BoxScene({
  layout,
  board,
  colorHex,
  foldTarget,
  faceImages,
  textElements,
  showIcons,
  selectedFace,
  onFaceSelect,
  onCaptureReady,
}: BoxSceneProps) {
  const invalidate = useThree((state) => state.invalidate);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const [rig] = useState(() => new BoxRig());

  const targetRef = useRef(foldTarget);
  const progressRef = useRef(foldTarget);
  const hoveredRef = useRef<BoxFace | null>(null);
  const selectedRef = useRef(selectedFace);
  selectedRef.current = selectedFace;

  // Geometry: dimensions or board changed -> rewrite vertices in place
  useLayoutEffect(() => {
    rig.update(layout, board);
    rig.setPose(progressRef.current);
    invalidate();
  }, [rig, layout, board, invalidate]);

  useEffect(() => {
    rig.setColor(colorHex);
    invalidate();
  }, [rig, colorHex, invalidate]);

  useEffect(() => {
    setSurfaceTextureAnisotropy(gl.capabilities.getMaxAnisotropy());
    invalidate();
  }, [gl, invalidate]);

  // Paper grain + flute relief are generated after the first frame (idle time) so they never delay it
  useEffect(() => {
    const apply = () => {
      rig.enableSurfaceDetail();
      setSurfaceTextureAnisotropy(gl.capabilities.getMaxAnisotropy());
      invalidate();
    };
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(apply, { timeout: 800 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(apply, 60);
    return () => window.clearTimeout(timer);
  }, [rig, gl, invalidate]);

  useEffect(() => {
    rig.setSelected(selectedFace);
    invalidate();
  }, [rig, selectedFace, invalidate]);

  // Free GPU resources and never leave the pointer cursor behind
  useEffect(
    () => () => {
      gl.domElement.style.cursor = '';
      rig.dispose();
    },
    [rig, gl]
  );

  // Fold: remember the target and wake the render loop; reduced-motion users jump straight there
  useEffect(() => {
    targetRef.current = foldTarget;
    if (prefersReducedMotion()) {
      progressRef.current = foldTarget;
      rig.setPose(foldTarget);
    }
    invalidate();
  }, [rig, foldTarget, invalidate]);

  useFrame((_, delta) => {
    const target = targetRef.current;
    const current = progressRef.current;
    if (current === target) return;
    const next =
      Math.abs(target - current) < 0.0005
        ? target
        : THREE.MathUtils.damp(current, target, FOLD_DAMPING, Math.min(delta, 0.1));
    progressRef.current = next;
    rig.setPose(next);
    invalidate();
  });

  // Artwork: debounced, cancellable, only redraws surfaces whose content or size changed
  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
      for (const surface of rig.getPrintSurfaces()) {
        const image = faceImages.find((img) => img.face === surface.face);
        const texts = textElements.filter((text) => text.face === surface.face);
        const options = { shippingIcons: showIcons && surface.face === 'front' };
        const key = printContentKey(surface, image, texts, options);
        if (rig.getPrintKey(surface.face) === key) continue;

        const canvas = await renderPrintCanvas(surface, image, texts, options);
        if (cancelled) return;
        let texture: THREE.CanvasTexture | null = null;
        if (canvas) {
          texture = new THREE.CanvasTexture(canvas);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = Math.min(8, maxAnisotropy);
        }
        rig.setPrint(surface.face, texture, key);
        invalidate();
      }
    }, PRINT_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [rig, layout, faceImages, textElements, showIcons, gl, invalidate]);

  // Clean export: no grid, no selection, 2x resolution, rendered and read back in the same task
  // (so the canvas needs no preserveDrawingBuffer)
  useEffect(() => {
    if (!onCaptureReady) return;
    onCaptureReady(async () => {
      const grid = scene.getObjectByName('ground-grid');
      const gridVisible = grid?.visible ?? false;
      if (grid) grid.visible = false;
      rig.setSelected(null);
      rig.setHovered(null);
      const ratio = gl.getPixelRatio();
      gl.setPixelRatio(Math.min(3, Math.max(2, ratio * 2)));
      let blob: Blob | null = null;
      try {
        gl.render(scene, camera);
        blob = await new Promise<Blob | null>((resolve) => gl.domElement.toBlob(resolve, 'image/png'));
      } finally {
        gl.setPixelRatio(ratio);
        if (grid) grid.visible = gridVisible;
        rig.setSelected(selectedRef.current);
        rig.setHovered(hoveredRef.current);
        invalidate();
      }
      return blob;
    });
  }, [onCaptureReady, rig, gl, scene, camera, invalidate]);

  // Picking: one handler on the root; the hit mesh carries its face id
  const setHover = useCallback(
    (face: BoxFace | null) => {
      if (hoveredRef.current === face) return;
      hoveredRef.current = face;
      rig.setHovered(face);
      gl.domElement.style.cursor = face ? 'pointer' : '';
      invalidate();
    },
    [rig, gl, invalidate]
  );

  const handlePointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation();
      setHover((event.object.userData.face as BoxFace | null) ?? null);
    },
    [setHover]
  );

  const handlePointerOut = useCallback(() => setHover(null), [setHover]);

  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation();
      const face = (event.object.userData.face as BoxFace | null) ?? null;
      if (!face) return;
      onFaceSelect(selectedRef.current === face ? null : face);
    },
    [onFaceSelect]
  );

  return (
    <primitive
      object={rig.object3d}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    />
  );
}
