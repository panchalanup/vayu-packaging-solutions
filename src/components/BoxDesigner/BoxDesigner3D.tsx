/**
 * Box Designer 3D
 * The whole three.js / react-three-fiber stack behind one component so the page can load it lazily
 * (three.js is large and must not weigh down every other route).
 */

import { memo, useMemo } from 'react';
import Canvas3D, { type CanvasStudioProps } from './Canvas3D';
import BoxScene from './BoxScene';
import { getBoardSpec, getBoardThicknessCm } from '@/lib/boxDesigner/boardSpecs';
import { getLayoutViewExtents, getStyle } from '@/lib/boxDesigner/styles/registry';
import type { CartonRig } from '@/lib/boxDesigner/rig/panelRig';
import type { BoxDesign, BoxFace } from '@/types/boxDesigner';

export interface BoxDesigner3DProps {
  design: BoxDesign;
  /** 0 = flat blank, 1 = assembled */
  foldTarget: number;
  /** Hide the front wall to show the inside */
  cutaway?: boolean;
  /** The live carton rig, e.g. for snapshots of the carton in other scenes */
  onRigReady?: (rig: CartonRig | null) => void;
  selectedFace: BoxFace | null;
  controlMode: 'rotate' | 'pan';
  autoRotate: boolean;
  fitSignal: number;
  onFaceSelect: (face: BoxFace | null) => void;
  onBackgroundClick: () => void;
  onCaptureReady: (capture: () => Promise<Blob | null>) => void;
  /** Showcase studio (backgrounds, scenes, quality, shot/video/model API); owned by Workstream C */
  studio?: CanvasStudioProps;
}

function BoxDesigner3D({
  design,
  foldTarget,
  cutaway = false,
  onRigReady,
  selectedFace,
  controlMode,
  autoRotate,
  fitSignal,
  onFaceSelect,
  onBackgroundClick,
  onCaptureReady,
  studio,
}: BoxDesigner3DProps) {
  const { dimensions, ply, flutes, template } = design;
  const board = useMemo(() => getBoardSpec(ply, flutes), [ply, flutes]);
  const thickness = getBoardThicknessCm(board, dimensions);
  const { lidDepth } = design;
  // Every style comes from the registry: the same layout drives the model, the artwork sizes and the dieline
  const layout = useMemo(
    () => getStyle(template).computeLayout(dimensions, thickness, { lidDepth }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depend on the numbers, not the object identity
    [dimensions.length, dimensions.width, dimensions.height, thickness, template, lidDepth]
  );
  const extents = useMemo(() => getLayoutViewExtents(layout, foldTarget), [layout, foldTarget]);

  return (
    <Canvas3D
      extents={extents}
      controlMode={controlMode}
      // Pause the turntable while a face is selected so the user can work on it
      autoRotate={autoRotate && !selectedFace}
      fitSignal={fitSignal}
      onBackgroundClick={onBackgroundClick}
      studio={studio}
    >
      <BoxScene
        layout={layout}
        board={board}
        colorHex={design.colorHex}
        finish={design.finish}
        insideColorHex={design.insideColorHex}
        cutaway={cutaway}
        onRigReady={onRigReady}
        foldTarget={foldTarget}
        faceImages={design.faceImages}
        textElements={design.textElements}
        showIcons={design.showIcons}
        selectedFace={selectedFace}
        onFaceSelect={onFaceSelect}
        onCaptureReady={onCaptureReady}
      />
    </Canvas3D>
  );
}

// Memoised: unrelated page re-renders (timers, analytics, panel state) must not touch the 3D scene
export default memo(BoxDesigner3D);
