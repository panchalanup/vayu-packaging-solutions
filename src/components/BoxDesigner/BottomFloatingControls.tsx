/**
 * Bottom Floating Controls - Dock Style
 * Glassmorphism dock with expandable sliders
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Ruler, RectangleHorizontal, Box, FoldVertical } from 'lucide-react';
import { BoxDimensions } from '@/types/boxDesigner';
import { DIMENSION_LIMITS } from '@/lib/boxDesigner/constants';

type ControlType = 'length' | 'width' | 'height' | 'flaps';

interface BottomFloatingControlsProps {
  dimensions: BoxDimensions;
  foldPercentage: number;
  onDimensionsChange: (dimensions: BoxDimensions) => void;
  onFoldChange: (percentage: number) => void;
}

interface ControlConfig {
  id: ControlType;
  icon: React.ElementType;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  color: string;
}

/** Named points of the fold timeline (see rig/foldPose.ts) */
const FOLD_STOP_BUTTONS = [
  { label: 'Flat', value: 0 },
  { label: 'Open top', value: 72 },
  { label: 'Sealed', value: 100 },
];

export default function BottomFloatingControls({
  dimensions,
  foldPercentage,
  onDimensionsChange,
  onFoldChange,
}: BottomFloatingControlsProps) {
  const [activeControl, setActiveControl] = useState<ControlType | null>(null);

  const controls: ControlConfig[] = [
    {
      id: 'length',
      icon: Ruler,
      label: 'Length',
      value: dimensions.length,
      unit: 'cm',
      min: DIMENSION_LIMITS.min,
      max: DIMENSION_LIMITS.max,
      step: 1,
      color: '#23803A', // green-600
    },
    {
      id: 'width',
      icon: RectangleHorizontal,
      label: 'Width',
      value: dimensions.width,
      unit: 'cm',
      min: DIMENSION_LIMITS.min,
      max: DIMENSION_LIMITS.max,
      step: 1,
      color: '#066A8D', // cyan-700
    },
    {
      id: 'height',
      icon: Box,
      label: 'Height',
      value: dimensions.height,
      unit: 'cm',
      min: DIMENSION_LIMITS.min,
      max: DIMENSION_LIMITS.max,
      step: 1,
      color: '#8A6440', // kraft-700
    },
    {
      id: 'flaps',
      icon: FoldVertical,
      label: 'Assembly',
      value: foldPercentage,
      unit: '%',
      min: 0,
      max: 100,
      step: 1,
      color: '#4A5A50', // ink-500
    },
  ];

  const handleIconClick = (controlId: ControlType) => {
    setActiveControl(activeControl === controlId ? null : controlId);
  };

  const handleSliderChange = (controlId: ControlType, value: number) => {
    if (controlId === 'flaps') {
      onFoldChange(value);
    } else {
      onDimensionsChange({
        ...dimensions,
        [controlId]: value,
      });
    }
  };

  const activeControlConfig = controls.find(c => c.id === activeControl);

  return (
    <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-30">
      <div className="flex flex-col items-center gap-3">
        {/* Expandable Slider Panel */}
        <AnimatePresence mode="wait">
          {activeControl && activeControlConfig && (
            <motion.div
              key={activeControl}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ 
                type: 'spring',
                stiffness: 400,
                damping: 25,
              }}
              className="glass-panel px-5 py-3 min-w-[300px] max-w-[calc(100vw-2rem)]"
              style={{
                backdropFilter: 'blur(16px)',
                background: 'rgba(255, 255, 255, 0.85)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
              }}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ 
                        backgroundColor: `${activeControlConfig.color}15`,
                      }}
                    >
                      <activeControlConfig.icon 
                        className="w-4 h-4" 
                        style={{ color: activeControlConfig.color }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {activeControlConfig.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold" style={{ color: activeControlConfig.color }}>
                      {Math.round(activeControlConfig.value)}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      {activeControlConfig.unit}
                    </span>
                  </div>
                </div>

                {/* Slider */}
                <div className="pt-2">
                  <Slider
                    value={[activeControlConfig.value]}
                    onValueChange={(values) => handleSliderChange(activeControl, values[0])}
                    min={activeControlConfig.min}
                    max={activeControlConfig.max}
                    step={activeControlConfig.step}
                    className="cursor-pointer"
                    style={{
                      '--slider-color': activeControlConfig.color,
                    } as React.CSSProperties}
                  />
                </div>

                {/* Min/Max labels, or named assembly stops */}
                {activeControl === 'flaps' ? (
                  <div className="flex justify-between gap-2" role="group" aria-label="Assembly stops">
                    {FOLD_STOP_BUTTONS.map((stop) => (
                      <button
                        key={stop.value}
                        onClick={() => onFoldChange(stop.value)}
                        className={`flex-1 text-xs py-1.5 rounded-md border transition-colors ${
                          Math.round(foldPercentage) === stop.value
                            ? 'bg-ink-500 text-white border-ink-500'
                            : 'border-border text-ink-900 hover:border-ink-500'
                        }`}
                      >
                        {stop.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{activeControlConfig.min}{activeControlConfig.unit}</span>
                    <span>{activeControlConfig.max}{activeControlConfig.unit}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dock Icons */}
        <div 
          className="flex items-center gap-2 px-4 py-3"
          style={{
            backdropFilter: 'blur(16px)',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
          }}
        >
          {controls.map((control) => {
            const Icon = control.icon;
            const isActive = activeControl === control.id;
            
            return (
              <motion.button
                key={control.id}
                onClick={() => handleIconClick(control.id)}
                aria-label={control.label}
                aria-expanded={isActive}
                className="relative group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{
                    backgroundColor: isActive 
                      ? `${control.color}20`
                      : 'rgba(255, 255, 255, 0.5)',
                    border: isActive 
                      ? `2px solid ${control.color}` 
                      : '2px solid transparent',
                    boxShadow: isActive 
                      ? `0 0 20px ${control.color}40` 
                      : 'none',
                  }}
                >
                  <Icon
                    className="w-5 h-5 transition-colors"
                    style={{
                      color: isActive ? control.color : '#4A5A50',
                    }}
                  />
                </div>

                {/* Tooltip */}
                <div
                  className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
                  style={{
                    backdropFilter: 'blur(12px)',
                    background: 'rgba(15, 26, 20, 0.92)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '500',
                  }}
                >
                  {control.label}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
