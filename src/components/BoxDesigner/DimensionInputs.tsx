/**
 * Dimension Input Controls
 * Length, Width, Height inputs with validation
 */

import { BoxDimensions } from '@/types/boxDesigner';
import { DIMENSION_LIMITS } from '@/lib/boxDesigner/constants';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Ruler } from 'lucide-react';

interface DimensionInputsProps {
  dimensions: BoxDimensions;
  onChange: (dimensions: BoxDimensions) => void;
}

export default function DimensionInputs({ dimensions, onChange }: DimensionInputsProps) {
  const handleChange = (field: keyof BoxDimensions, value: string) => {
    const numValue = parseFloat(value) || 0;
    const clampedValue = Math.max(
      DIMENSION_LIMITS.min,
      Math.min(DIMENSION_LIMITS.max, numValue)
    );
    
    onChange({
      ...dimensions,
      [field]: clampedValue,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Ruler className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Box Dimensions</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="length" className="text-sm font-medium">
            Length (cm)
          </Label>
          <Input
            id="length"
            type="number"
            min={DIMENSION_LIMITS.min}
            max={DIMENSION_LIMITS.max}
            value={dimensions.length}
            onChange={(e) => handleChange('length', e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="width" className="text-sm font-medium">
            Width (cm)
          </Label>
          <Input
            id="width"
            type="number"
            min={DIMENSION_LIMITS.min}
            max={DIMENSION_LIMITS.max}
            value={dimensions.width}
            onChange={(e) => handleChange('width', e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="height" className="text-sm font-medium">
            Height (cm)
          </Label>
          <Input
            id="height"
            type="number"
            min={DIMENSION_LIMITS.min}
            max={DIMENSION_LIMITS.max}
            value={dimensions.height}
            onChange={(e) => handleChange('height', e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Dimensions: {dimensions.length} × {dimensions.width} × {dimensions.height} cm
      </p>
    </div>
  );
}
