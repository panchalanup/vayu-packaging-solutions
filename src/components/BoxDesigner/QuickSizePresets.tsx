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
  const isCustom = !PRESETS.some(
    preset => 
      preset.dimensions.length === currentDimensions.length &&
      preset.dimensions.width === currentDimensions.width &&
      preset.dimensions.height === currentDimensions.height
  );

  const handlePresetClick = (dimensions: BoxDimensions) => {
    onChange(dimensions);
    // Reset fold to 100% (fully open) when changing presets
    onFoldReset?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Ruler className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Quick Size Presets</h3>
      </div>
      
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
                  : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-gray-600'}`} />
                <div className="text-xs font-semibold">{preset.name}</div>
                <div className="text-[10px] text-gray-500">{preset.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className={`p-3 rounded-lg border-2 transition-all ${
        isCustom ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="text-xs font-medium text-gray-700 mb-1">
            {isCustom ? '✨ Custom Size' : 'Current Size'}
          </div>
          <div className="text-sm font-bold text-gray-900">
            {currentDimensions.length} × {currentDimensions.width} × {currentDimensions.height} cm
          </div>
          <div className="text-[10px] text-gray-500 mt-1">
            L × W × H
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 italic">
        💡 Use floating controls below the box to adjust custom dimensions
      </p>
    </div>
  );
}
