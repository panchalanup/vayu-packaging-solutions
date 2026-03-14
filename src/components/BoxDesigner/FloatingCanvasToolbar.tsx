/**
 * Floating Canvas Toolbar Component
 * macOS-style pill toolbar for camera controls
 */

import { RotateCw, Hand, Maximize2, Home, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ControlMode = 'rotate' | 'pan';

interface FloatingCanvasToolbarProps {
  controlMode: ControlMode;
  autoRotate: boolean;
  onControlModeChange: (mode: ControlMode) => void;
  onAutoRotateToggle: () => void;
  onFitView: () => void;
  onResetView: () => void;
}

export default function FloatingCanvasToolbar({
  controlMode,
  autoRotate,
  onControlModeChange,
  onAutoRotateToggle,
  onFitView,
  onResetView,
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
        title="Orbit (Space)"
        aria-label="Orbit mode"
        aria-pressed={controlMode === 'rotate'}
      >
        <RotateCw className="w-3.5 h-3.5" />
      </Button>

      {/* Pan */}
      <Button
        onClick={() => onControlModeChange('pan')}
        variant={controlMode === 'pan' ? 'default' : 'ghost'}
        size="sm"
        className={`h-7 w-7 p-0 mac-transition ${controlMode === 'pan' ? '' : 'hover:bg-gray-100/80'}`}
        title="Pan (W)"
        aria-label="Pan mode"
        aria-pressed={controlMode === 'pan'}
      >
        <Hand className="w-3.5 h-3.5" />
      </Button>

      {/* Separator */}
      <div className="h-4 w-px bg-gray-300 mx-0.5" />

      {/* Fit View */}
      <Button
        onClick={onFitView}
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 hover:bg-gray-100/80 mac-transition"
        title="Fit to View (F)"
        aria-label="Fit to view"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </Button>

      {/* Reset View */}
      <Button
        onClick={onResetView}
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 hover:bg-gray-100/80 mac-transition"
        title="Reset Camera"
        aria-label="Reset camera view"
      >
        <Home className="w-3.5 h-3.5" />
      </Button>

      {/* Separator */}
      <div className="h-4 w-px bg-gray-300 mx-0.5" />

      {/* Auto-Rotate */}
      <Button
        onClick={onAutoRotateToggle}
        variant={autoRotate ? 'default' : 'ghost'}
        size="sm"
        className={`h-7 w-7 p-0 mac-transition ${autoRotate ? '' : 'hover:bg-gray-100/80'}`}
        title={autoRotate ? 'Stop Auto-Rotate' : 'Start Auto-Rotate'}
        aria-label={autoRotate ? 'Stop auto-rotate' : 'Start auto-rotate'}
        aria-pressed={autoRotate}
      >
        {autoRotate ? (
          <Pause className="w-3.5 h-3.5" />
        ) : (
          <Play className="w-3.5 h-3.5" />
        )}
      </Button>
    </div>
  );
}
