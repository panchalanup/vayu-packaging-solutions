/**
 * Ply Type Selector
 * Choose between 3-ply, 5-ply, 7-ply
 */

import { PlyType } from '@/types/boxDesigner';
import { PLY_OPTIONS } from '@/lib/boxDesigner/constants';
import { Label } from '@/components/ui/label';
import { Layers } from 'lucide-react';

interface PlySelectorProps {
  selectedPly: PlyType;
  onChange: (ply: PlyType) => void;
}

export default function PlySelector({ selectedPly, onChange }: PlySelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Material Strength</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {PLY_OPTIONS.map((option) => {
          const isSelected = selectedPly === option.id;
          
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
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{option.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {option.strength}
                  </div>
                </div>
                <div
                  className="w-12 h-12 rounded-md border-2"
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
