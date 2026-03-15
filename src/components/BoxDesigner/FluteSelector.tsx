/**
 * Flute Type Selector
 * Choose between A, B, C, E flute types
 */

import { FluteType } from '@/types/boxDesigner';
import { FLUTE_TYPES } from '@/lib/boxDesigner/constants';
import { Waves } from 'lucide-react';

interface FluteSelectorProps {
  selectedFlute: FluteType;
  onChange: (flute: FluteType) => void;
}

export default function FluteSelector({ selectedFlute, onChange }: FluteSelectorProps) {
  const fluteOrder: FluteType[] = ['E', 'F', 'B', 'C', 'A'];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Waves className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Flute Type</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {fluteOrder.map((fluteKey) => {
          const flute = FLUTE_TYPES[fluteKey];
          const isSelected = selectedFlute === fluteKey;
          
          return (
            <button
              key={fluteKey}
              onClick={() => onChange(fluteKey)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`text-2xl font-bold ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                    {fluteKey}
                  </div>
                  <div className="text-xs font-medium text-gray-600">
                    {flute.height}mm
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {flute.spacing} flutes/ft
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>{selectedFlute}-flute:</strong> {FLUTE_TYPES[selectedFlute].description}
        </p>
      </div>
    </div>
  );
}
