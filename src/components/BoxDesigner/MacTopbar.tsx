/**
 * macOS-style Topbar Component
 * Translucent bar with traffic lights, title, and global actions
 */

import { Download, User } from 'lucide-react';
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
      {/* Left: macOS Traffic Lights (decorative) */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2" aria-hidden="true">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#ff4d44] transition-colors cursor-pointer" title="Close" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#ffb014] transition-colors cursor-pointer" title="Minimize" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f] hover:bg-[#1db932] transition-colors cursor-pointer" title="Maximize" />
        </div>
        
        {/* Title */}
        <h1 className="text-sm font-semibold text-gray-800 select-none">
          {title}
        </h1>
      </div>

      {/* Right: Global Actions */}
      <div className="flex items-center gap-2">
        <Button
          onClick={onExport}
          variant="ghost"
          size="sm"
          className="h-8 text-xs hover:bg-gray-100/80 mac-transition"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-100/80 mac-transition"
          title="Account"
        >
          <User className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
