/**
 * 3D Canvas Wrapper
 * Sets up the Three.js scene: renderer settings, studio lighting, ground grid and camera controls.
 *
 * Rendering is on demand (frameloop="demand"): the GPU is idle unless something changes.
 * Anything that changes the picture without going through React/R3F props must call invalidate().
 */

import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree, RootState } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import * as THREE from 'three';
import CameraControls from './CameraControls';
import StudioEnvironment from './StudioEnvironment';
import {
  PerfTier,
  TIER_SETTINGS,
  detectPerfTier,
  parseTierOverride,
} from '@/lib/boxDesigner/perfTier';
import { useIsMobile } from '@/hooks/use-mobile';
import { StudioBridge, StudioStage, type RigGetter, type StudioApi } from './StudioStage';
import { DEFAULT_STUDIO, qualityToTier, type QualityPref, type StudioSettings } from '@/lib/boxDesigner/studio';

/** Showcase features: backgrounds, scenes, quality and the shot/video/model API (all optional) */
export interface CanvasStudioProps {
  settings: StudioSettings;
  quality: QualityPref;
  /** Changes whenever the carton's shape or pose changes (scene clones are rebuilt) */
  cloneKey: string;
  colorHex: string;
  onReady?: (api: StudioApi) => void;
  /** Live carton rig (from BoxDesigner3D onRigReady): bounds and lightweight snapshots for scenes */
  getRig?: RigGetter;
  /** Privacy-safe diagnostics (event kind + render tier only) */
  onDiagnostic?: (kind: 'context_lost' | 'context_restored' | 'low_tier', tier: PerfTier) => void;
}

/** What to frame and light: from the RSC layout and the current fold target */
export interface ViewExtents {
  radius: number;
  center: [number, number, number];
  /** Radius that covers every fold pose (shadow frustum) */
  shadowRadius: number;
}

interface Canvas3DProps {
  children: ReactNode;
  extents: ViewExtents;
  controlMode?: 'rotate' | 'pan';
  autoRotate?: boolean;
  /** Increment to re-frame the box */
  fitSignal?: number;
  onBackgroundClick?: () => void;
  studio?: CanvasStudioProps;
}

/**
 * Renderer configuration, context-loss handling and scene lighting.
 * Lives inside <Canvas> so it can use R3F hooks.
 */
function SceneRoot({
  extents,
  tier,
  onDiagnostic,
}: {
  extents: ViewExtents;
  tier: PerfTier;
  onDiagnostic?: CanvasStudioProps['onDiagnostic'];
}) {
  const { scene, gl, invalidate } = useThree();
  const [restoreKey, setRestoreKey] = useState(0);
  const diagnosticRef = useRef(onDiagnostic);
  diagnosticRef.current = onDiagnostic;
  const tierRef = useRef(tier);
  tierRef.current = tier;

  // Clean white studio background and filmic tone mapping
  useEffect(() => {
    scene.background = new THREE.Color('#ffffff');
    // ACES at a reduced exposure matched the kraft/white/brown swatches best in side-by-side tests
    // (AgX desaturated the kraft, no tone mapping clipped the highlights)
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 0.8;
    invalidate();
  }, [scene, gl, invalidate]);

  // WebGL context loss: prevent the browser discarding the context for good, rebuild GPU-only resources on restore
  useEffect(() => {
    const canvas = gl.domElement;
    const handleLost = (event: Event) => {
      event.preventDefault();
      diagnosticRef.current?.('context_lost', tierRef.current);
    };
    const handleRestored = () => {
      diagnosticRef.current?.('context_restored', tierRef.current);
      setRestoreKey((key) => key + 1);
      invalidate();
    };
    canvas.addEventListener('webglcontextlost', handleLost, false);
    canvas.addEventListener('webglcontextrestored', handleRestored, false);
    return () => {
      canvas.removeEventListener('webglcontextlost', handleLost, false);
      canvas.removeEventListener('webglcontextrestored', handleRestored, false);
    };
  }, [gl, invalidate]);

  const gridSize = Math.max(100, extents.shadowRadius * 8);

  return (
    <>
      <StudioEnvironment
        radius={extents.shadowRadius}
        center={extents.center}
        tier={tier}
        restoreKey={restoreKey}
      />

      {/* Ground grid (kept subtle so it never competes with the box) */}
      <Grid
        name="ground-grid"
        args={[gridSize, gridSize]}
        cellSize={5}
        cellThickness={0.6}
        cellColor="#d6d6d6"
        sectionSize={25}
        sectionThickness={1.1}
        sectionColor="#b0b0b0"
        fadeDistance={gridSize * 0.7}
        fadeStrength={1.2}
        followCamera={false}
        infiniteGrid={false}
        position={[0, 0, 0]}
      />
    </>
  );
}

export default function Canvas3D({
  children,
  extents,
  controlMode = 'rotate',
  autoRotate = false,
  fitSignal = 0,
  onBackgroundClick,
  studio,
}: Canvas3DProps) {
  const isMobile = useIsMobile();

  // Manual override (?quality=high|medium|low, validated against a fixed list), then the user's quality setting
  const urlOverride = useMemo(() => parseTierOverride(window.location.search), []);
  const override = urlOverride ?? qualityToTier(studio?.quality ?? 'auto');

  const hints = useMemo(
    () => ({
      isMobile,
      deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
    }),
    [isMobile]
  );

  const [detectedTier, setDetectedTier] = useState<PerfTier>(() => detectPerfTier(hints));
  const tier = override ?? detectedTier;
  const settings = TIER_SETTINGS[tier];
  const diagnostic = studio?.onDiagnostic;

  // Wider framing for stack / pallet / size-reference scenes
  const [sceneExtents, setSceneExtents] = useState<ViewExtents | null>(null);
  const sceneMode = studio?.settings.scene ?? 'single';
  useEffect(() => {
    if (sceneMode === 'single') setSceneExtents(null);
  }, [sceneMode]);
  const framed = sceneMode !== 'single' && sceneExtents ? sceneExtents : extents;
  const lighting = sceneExtents && sceneMode !== 'single'
    ? { ...extents, shadowRadius: Math.max(extents.shadowRadius, sceneExtents.radius) }
    : extents;

  // Refine the tier once the real GPU is known (software renderers drop to "low")
  const handleCreated = useCallback(
    ({ gl }: RootState) => {
      const ctx = gl.getContext();
      const info = ctx.getExtension('WEBGL_debug_renderer_info');
      const renderer = info ? String(ctx.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
      const next = detectPerfTier({ ...hints, renderer });
      setDetectedTier(next);
      // Only the tier is reported (never the GPU string)
      if (next === 'low') diagnostic?.('low_tier', next);
    },
    [hints, diagnostic]
  );

  return (
    <div className="w-full h-full bg-paper-100 rounded-lg overflow-hidden shadow-inner">
      <Canvas
        frameloop="demand"
        dpr={[1, settings.maxDpr]}
        shadows={settings.shadows ? 'soft' : false}
        camera={{ fov: 45, near: 0.5, far: 1000, position: [30, 35, 50] }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onCreated={handleCreated}
        onPointerMissed={onBackgroundClick}
      >
        <SceneRoot extents={lighting} tier={tier} onDiagnostic={diagnostic} />
        <CameraControls
          radius={framed.radius}
          center={framed.center}
          controlMode={controlMode}
          autoRotate={autoRotate}
          fitSignal={fitSignal}
        />

        {/* Children (3D models) */}
        {children}

        {studio && (
          <>
            <StudioStage
              settings={studio.settings ?? DEFAULT_STUDIO}
              radius={framed.radius}
              cloneKey={studio.cloneKey}
              colorHex={studio.colorHex}
              onExtents={setSceneExtents}
              getRig={studio.getRig}
            />
            <StudioBridge extents={framed} onReady={studio.onReady} />
          </>
        )}
      </Canvas>
    </div>
  );
}
