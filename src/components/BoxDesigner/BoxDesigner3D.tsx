/**
 * Box Designer 3D
 * The whole three.js / react-three-fiber stack behind one component so the page can load it lazily
 * (three.js is large and must not weigh down every other route).
 */

import { memo, useMemo } from 'react';
import Canvas3D from './Canvas3D';
import BoxScene from './BoxScene';
import { getBoardSpec, getBoardThicknessCm } from '@/lib/boxDesigner/boardSpecs';
import { computeRscLayout, getViewExtents } from '@/lib/boxDesigner/rig/rscLayout';
import type { BoxDesign, BoxFace } from '@/types/boxDesigner';

export interface BoxDesigner3DProps {
  design: BoxDesign;
  /** 0 = flat blank, 1 = sealed */
  foldTarget: number;
  selectedFace: BoxFace | null;
  controlMode: 'rotate' | 'pan';
  autoRotate: boolean;
  fitSignal: number;
  onFaceSelect: (face: BoxFace | null) => void;
  onBackgroundClick: () => void;
  onCaptureReady: (capture: () => Promise<Blob | null>) => void;
}

function BoxDesigner3D({
  design,
  foldTarget,
  selectedFace,
  controlMode,
  autoRotate,
  fitSignal,
  onFaceSelect,
  onBackgroundClick,
  onCaptureReady,
}: BoxDesigner3DProps) {
  const { dimensions, ply, flutes, template } = design;
  const board = useMemo(() => getBoardSpec(ply, flutes), [ply, flutes]);
  const thickness = getBoardThicknessCm(board, dimensions);
  const topFlaps = template !== 'hsc';
  const layout = useMemo(
    () => computeRscLayout(dimensions, thickness, { topFlaps }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depend on the numbers, not the object identity
    [dimensions.length, dimensions.width, dimensions.height, thickness, topFlaps]
  );
  const extents = useMemo(() => getViewExtents(layout, foldTarget), [layout, foldTarget]);

  return (
    <Canvas3D
      extents={extents}
      controlMode={controlMode}
      // Pause the turntable while a face is selected so the user can work on it
      autoRotate={autoRotate && !selectedFace}
      fitSignal={fitSignal}
      onBackgroundClick={onBackgroundClick}
    >
      <BoxScene
        layout={layout}
        board={board}
        colorHex={design.colorHex}
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
