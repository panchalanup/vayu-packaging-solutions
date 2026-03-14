/**
 * Fold Control Component
 * Interactive slider to control box folding animation
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Minus, Plus, Box, Package } from 'lucide-react';
import { getFoldStateDescription, FOLD_PRESETS } from '@/lib/boxDesigner/foldAnimation';

interface FoldControlProps {
  foldPercentage: number;
  onFoldChange: (percentage: number) => void;
  className?: string;
}

export default function FoldControl({
  foldPercentage,
  onFoldChange,
  className = '',
}: FoldControlProps) {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleIncrement = () => {
    const newValue = Math.min(100, foldPercentage + 5);
    onFoldChange(newValue);
  };
  
  const handleDecrement = () => {
    const newValue = Math.max(0, foldPercentage - 5);
    onFoldChange(newValue);
  };
  
  const handlePreset = (preset: number) => {
    onFoldChange(preset);
  };
  
  const stateDescription = getFoldStateDescription(foldPercentage);
  
  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-sm mb-1">Box Folding Animation</h4>
            <p className="text-xs text-muted-foreground">
              {stateDescription}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {Math.round(foldPercentage)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {isDragging ? 'Adjusting...' : 'Fold Level'}
            </div>
          </div>
        </div>
        
        {/* Slider with Icons */}
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <Package className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Closed</span>
            </div>
            
            <div className="flex-1">
              <Slider
                value={[foldPercentage]}
                onValueChange={(values) => {
                  onFoldChange(values[0]);
                }}
                onValueCommit={() => setIsDragging(false)}
                onPointerDown={() => setIsDragging(true)}
                min={0}
                max={100}
                step={1}
                className="cursor-pointer"
              />
            </div>
            
            <div className="flex flex-col items-center">
              <Box className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Open</span>
            </div>
          </div>
          
          {/* Fine Control Buttons */}
          <div className="flex items-center gap-2 justify-center">
            <Button
              onClick={handleDecrement}
              variant="outline"
              size="sm"
              disabled={foldPercentage <= 0}
              className="h-8 w-8 p-0"
            >
              <Minus className="w-4 h-4" />
            </Button>
            
            <span className="text-xs text-muted-foreground min-w-[80px] text-center">
              Fine Tune (±5%)
            </span>
            
            <Button
              onClick={handleIncrement}
              variant="outline"
              size="sm"
              disabled={foldPercentage >= 100}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Preset Buttons */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground text-center">
            Quick Presets
          </div>
          <div className="grid grid-cols-5 gap-2">
            <Button
              onClick={() => handlePreset(FOLD_PRESETS.CLOSED)}
              variant={foldPercentage === FOLD_PRESETS.CLOSED ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
            >
              Closed
            </Button>
            <Button
              onClick={() => handlePreset(FOLD_PRESETS.QUARTER_OPEN)}
              variant={foldPercentage === FOLD_PRESETS.QUARTER_OPEN ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
            >
              25%
            </Button>
            <Button
              onClick={() => handlePreset(FOLD_PRESETS.HALF_OPEN)}
              variant={foldPercentage === FOLD_PRESETS.HALF_OPEN ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
            >
              Half
            </Button>
            <Button
              onClick={() => handlePreset(FOLD_PRESETS.THREE_QUARTER_OPEN)}
              variant={foldPercentage === FOLD_PRESETS.THREE_QUARTER_OPEN ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
            >
              75%
            </Button>
            <Button
              onClick={() => handlePreset(FOLD_PRESETS.FULLY_OPEN)}
              variant={foldPercentage === FOLD_PRESETS.FULLY_OPEN ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
            >
              Open
            </Button>
          </div>
        </div>
        
        {/* Info Text */}
        <div className="text-xs text-center text-muted-foreground bg-blue-50 dark:bg-blue-950 p-2 rounded">
          💡 Drag the slider or use presets to animate box folding
        </div>
      </div>
    </Card>
  );
}
