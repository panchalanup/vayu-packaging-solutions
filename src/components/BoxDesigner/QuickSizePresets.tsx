/**
 * Quick Size Presets
 * Predefined box dimensions for common use cases
 */

import { BoxDimensions } from '@/types/boxDesigner';
import { Ruler, Package, Box, Maximize } from 'lucide-react';

interface QuickSizePresetsProps {
  currentDimensions: BoxDimensions;
  onChange: (dimensions: BoxDimensions) => void;
  onFoldReset?: () => void;
}

const PRESETS = [
  {
    id: 'small',
    name: 'Small',
    icon: Package,
    dimensions: { length: 15, width: 10, height: 10 },
    description: 'Gift/Jewelry',
  },
  {
    id: 'medium',
    name: 'Medium',
    icon: Box,
    dimensions: { length: 30, width: 20, height: 15 },
    description: 'E-commerce',
  },
  {
    id: 'large',
    name: 'Large',
    icon: Maximize,
    dimensions: { length: 50, width: 40, height: 30 },
    description: 'Bulk/Storage',
  },
];

export default function QuickSizePresets({ currentDimensions, onChange, onFoldReset }: QuickSizePresetsProps) {
  const handlePresetClick = (dimensions: BoxDimensions) => {
    onChange(dimensions);
    // Reset fold to 100% (fully open) when changing presets
    onFoldReset?.();
  };

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">Quick presets</div>
      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isSelected = 
            preset.dimensions.length === currentDimensions.length &&
            preset.dimensions.width === currentDimensions.width &&
            preset.dimensions.height === currentDimensions.height;
          
          return (
            <button
              key={preset.id}
              onClick={() => handlePresetClick(preset.dimensions)}
              className={`p-3 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border hover:border-primary/50 hover:bg-foreground/5'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="text-xs font-semibold">{preset.name}</div>
                <div className="text-[10px] text-muted-foreground">{preset.description}</div>
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
}
