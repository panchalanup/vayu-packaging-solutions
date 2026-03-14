/**
 * Floating Canvas Toolbar Component
 * macOS-style pill toolbar for camera controls
 */

import { RotateCw, Hand, Maximize2, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ControlMode = 'rotate' | 'pan';

interface FloatingCanvasToolbarProps {
  controlMode: ControlMode;
  autoRotate: boolean;
  onControlModeChange: (mode: ControlMode) => void;
  onAutoRotateToggle: () => void;
  onFitView: () => void;
}

export default function FloatingCanvasToolbar({
  controlMode,
  autoRotate,
  onControlModeChange,
  onAutoRotateToggle,
  onFitView,
}: FloatingCanvasToolbarProps) {
  return (
    <div 
      className="px-3 py-2 flex items-center gap-1"
      style={{
        backdropFilter: 'blur(var(--mac-glass-blur))',
        background: 'rgba(255, 255, 255, 0.85)',
        borderRadius: '999px',
        boxShadow: 'var(--mac-shadow-mid)',
      }}
    >
      {/* Orbit */}
      <Button
        onClick={() => onControlModeChange('rotate')}
        variant={controlMode === 'rotate' ? 'default' : 'ghost'}
        size="sm"
        className={`h-7 w-7 p-0 mac-transition ${controlMode === 'rotate' ? '' : 'hover:bg-gray-100/80'}`}
        title="Rotate Camera - Click and drag to orbit around the box (Space)"
        aria-label="Orbit mode"
        aria-pressed={controlMode === 'rotate'}
      >
        <RotateCw className={`w-3.5 h-3.5 ${controlMode === 'rotate' ? 'text-white' : 'text-gray-700'}`} />
      </Button>

      {/* Pan */}
      <Button
        onClick={() => onControlModeChange('pan')}
        variant={controlMode === 'pan' ? 'default' : 'ghost'}
        size="sm"
        className={`h-7 w-7 p-0 mac-transition ${controlMode === 'pan' ? '' : 'hover:bg-gray-100/80'}`}
        title="Pan Camera - Move the view in any direction (W)"
        aria-label="Pan mode"
        aria-pressed={controlMode === 'pan'}
      >
        <Hand className={`w-3.5 h-3.5 ${controlMode === 'pan' ? 'text-white' : 'text-gray-700'}`} />
      </Button>

      {/* Separator */}
      <div className="h-4 w-px bg-gray-300 mx-0.5" />

      {/* Fit View */}
      <Button
        onClick={onFitView}
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 hover:bg-gray-100/80 mac-transition"
        title="Fit Box to View - Center and zoom to fit the entire box (F)"
        aria-label="Fit to view"
      >
        <Maximize2 className="w-3.5 h-3.5 text-gray-700" />
      </Button>

      {/* Separator */}
      <div className="h-4 w-px bg-gray-300 mx-0.5" />

      {/* Auto-Rotate */}
      <Button
        onClick={onAutoRotateToggle}
        variant={autoRotate ? 'default' : 'ghost'}
        size="sm"
        className={`h-7 w-7 p-0 mac-transition ${autoRotate ? '' : 'hover:bg-gray-100/80'}`}
        title={autoRotate ? 'Stop Auto-Rotate - Pause the automatic rotation' : 'Auto-Rotate - Automatically spin the box for a 360° view'}
        aria-label={autoRotate ? 'Stop auto-rotate' : 'Start auto-rotate'}
        aria-pressed={autoRotate}
      >
        {autoRotate ? (
          <Pause className="w-3.5 h-3.5 text-white" />
        ) : (
          <Play className="w-3.5 h-3.5 text-gray-700" />
        )}
      </Button>
    </div>
  );
}
