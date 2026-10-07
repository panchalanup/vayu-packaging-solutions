/**
 * Bottom Status Bar Component
 * Shows box info and undo/redo (ink chrome, §9.9)
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
      className="h-11 px-4 flex items-center justify-between border-t border-ink-800 bg-ink-900 text-paper-50"
    >
      {/* Left: Box Info */}
      <div className="flex items-center gap-4 text-xs text-paper-muted">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-paper-50">Volume:</span>
          <span>{volume}L</span>
        </div>
        
        <div className="h-3 w-px bg-ink-500" />
        
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-paper-50">Material:</span>
          <span>{ply}</span>
        </div>
        
        <div className="h-3 w-px bg-ink-500" />
        
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-paper-50">Style:</span>
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
          className="h-7 w-7 p-0 text-paper-50 hover:bg-ink-800 hover:text-paper-50 mac-transition disabled:opacity-30"
          title="Undo (Cmd+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </Button>
        
        <Button
          onClick={onRedo}
          disabled={!canRedo}
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-paper-50 hover:bg-ink-800 hover:text-paper-50 mac-transition disabled:opacity-30"
          title="Redo (Cmd+Shift+Z)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </footer>
  );
}
