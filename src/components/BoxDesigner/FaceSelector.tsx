/**
 * Face Selector Component
 * Select which box face to customize (front, back, left, right, top, bottom)
 */

import { BoxFace } from '@/types/boxDesigner';
import { Label } from '@/components/ui/label';
import { Box } from 'lucide-react';

interface FaceSelectorProps {
  selectedFace: BoxFace | null;
  onChange: (face: BoxFace) => void;
}

const FACES: Array<{ id: BoxFace; label: string; icon: string }> = [
  { id: 'front', label: 'Front', icon: '⬜' },
  { id: 'back', label: 'Back', icon: '⬛' },
  { id: 'left', label: 'Left', icon: '◀' },
  { id: 'right', label: 'Right', icon: '▶' },
  { id: 'top', label: 'Top', icon: '🔼' },
  { id: 'bottom', label: 'Bottom', icon: '🔽' },
];

export default function FaceSelector({ selectedFace, onChange }: FaceSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Box className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Select Face</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {FACES.map((face) => {
          const isSelected = selectedFace === face.id;
          
          return (
            <button
              key={face.id}
              onClick={() => onChange(face.id)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{face.icon}</span>
                <div>
                  <div className="font-semibold text-sm">{face.label}</div>
                  {isSelected && (
                    <div className="text-xs text-primary">Selected</div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Select a face to add images or text to it
      </p>
    </div>
  );
}
