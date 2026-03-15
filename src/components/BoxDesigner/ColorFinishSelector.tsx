/**
 * Box Color & Finish Selector
 * Choose between different paper finishes
 */

import { BoxColor } from '@/types/boxDesigner';
import { BOX_COLOR_OPTIONS } from '@/lib/boxDesigner/constants';
import { Palette } from 'lucide-react';

interface ColorFinishSelectorProps {
  selectedColor: BoxColor;
  onChange: (color: BoxColor) => void;
}

export default function ColorFinishSelector({ selectedColor, onChange }: ColorFinishSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Palette className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Box Color & Finish</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {BOX_COLOR_OPTIONS.map((option) => {
          const isSelected = selectedColor === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => onChange(option.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-1">{option.name}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
                <div
                  className="w-14 h-14 rounded-md border-2 shadow-sm"
                  style={{
                    backgroundColor: option.color,
                    borderColor: isSelected ? '#16a34a' : '#d1d5db',
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
