/**
 * macOS-style Topbar Component
 * Translucent bar with traffic lights, title, and global actions
 */

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MacTopbarProps {
  onExport: () => void;
  title?: string;
}

export default function MacTopbar({ onExport, title = "3D Box Designer" }: MacTopbarProps) {
  return (
    <header 
      className="h-14 px-4 flex items-center justify-between border-b border-gray-200/50"
      style={{
        backdropFilter: 'blur(var(--mac-glass-blur))',
        background: 'rgba(255, 255, 255, 0.6)',
      }}
    >
      {/* Left: Title */}
      <div className="flex items-center">
        <h1 className="text-sm font-semibold text-gray-800 select-none">
          {title}
        </h1>
      </div>

      {/* Right: Global Actions */}
      <div className="flex items-center">
        <Button
          onClick={onExport}
          variant="ghost"
          size="sm"
          className="h-8 text-xs hover:bg-gray-100/80 mac-transition"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export
        </Button>
      </div>
    </header>
  );
}
