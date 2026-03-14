/**
 * Bottom Status Bar Component
 * Shows box info, undo/redo, and export status
 */

import { Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BoxDimensions, PlyType, BoxTemplate } from '@/types/boxDesigner';

interface BottomStatusBarProps {
  dimensions: BoxDimensions;
  ply: PlyType;
  template: BoxTemplate;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export default function BottomStatusBar({
  dimensions,
  ply,
  template,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: BottomStatusBarProps) {
  const volume = (dimensions.length * dimensions.width * dimensions.height / 1000).toFixed(2);

  return (
    <footer 
      className="h-11 px-4 flex items-center justify-between border-t border-gray-200/50"
      style={{
        backdropFilter: 'blur(var(--mac-glass-blur))',
        background: 'rgba(255, 255, 255, 0.6)',
      }}
    >
      {/* Left: Box Info */}
      <div className="flex items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-gray-700">Volume:</span>
          <span>{volume}L</span>
        </div>
        
        <div className="h-3 w-px bg-gray-300" />
        
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-gray-700">Material:</span>
          <span>{ply}</span>
        </div>
        
        <div className="h-3 w-px bg-gray-300" />
        
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-gray-700">Style:</span>
          <span className="capitalize">{template}</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button
          onClick={onUndo}
          disabled={!canUndo}
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 hover:bg-gray-100/80 mac-transition disabled:opacity-30"
          title="Undo (Cmd+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </Button>
        
        <Button
          onClick={onRedo}
          disabled={!canRedo}
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 hover:bg-gray-100/80 mac-transition disabled:opacity-30"
          title="Redo (Cmd+Shift+Z)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </footer>
  );
}
