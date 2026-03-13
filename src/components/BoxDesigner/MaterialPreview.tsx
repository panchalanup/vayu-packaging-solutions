/**
 * Material Preview Component
 * Displays material specifications and visual sample
 */

import { Card } from '@/components/ui/card';
import { PlyConfig } from '@/types/boxDesigner';
import { FLUTE_TYPES } from '@/lib/boxDesigner/constants';
import { Layers, Package, Ruler } from 'lucide-react';

interface MaterialPreviewProps {
  plyConfig: PlyConfig;
}

export default function MaterialPreview({ plyConfig }: MaterialPreviewProps) {
  const fluteSpec = plyConfig.fluteType ? FLUTE_TYPES[plyConfig.fluteType] : null;

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Package className="w-5 h-5 text-primary" />
        <h4 className="font-semibold text-sm">Material Specifications</h4>
      </div>

      {/* Material Swatch */}
      <div className="relative h-24 rounded-lg overflow-hidden border-2 border-gray-300 shadow-inner">
        <div 
          className="absolute inset-0 opacity-90"
          style={{
            backgroundColor: plyConfig.color,
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 10px,
                rgba(0,0,0,0.05) 10px,
                rgba(0,0,0,0.05) 11px
              )
            `,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center bg-white/80 backdrop-blur-sm px-3 py-1 rounded-md">
            <p className="text-xs font-mono font-semibold text-gray-800">
              {plyConfig.name}
            </p>
          </div>
        </div>
      </div>

      {/* Specifications Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Thickness */}
        <div className="flex items-start gap-2 bg-gray-50 p-2 rounded">
          <Ruler className="w-4 h-4 text-blue-600 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500">Thickness</p>
            <p className="text-sm font-semibold">{plyConfig.thickness}mm</p>
          </div>
        </div>

        {/* Flute Type */}
        {fluteSpec && (
          <div className="flex items-start gap-2 bg-gray-50 p-2 rounded">
            <Layers className="w-4 h-4 text-green-600 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Flute Type</p>
              <p className="text-sm font-semibold">{fluteSpec.type}-Flute</p>
            </div>
          </div>
        )}
      </div>

      {/* Strength Info */}
      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <p className="text-xs font-medium text-blue-900 mb-1">Strength Rating</p>
        <p className="text-xs text-blue-700">{plyConfig.strength}</p>
      </div>

      {/* Flute Description */}
      {fluteSpec && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
          <p className="text-xs font-medium text-amber-900 mb-1">Flute Characteristics</p>
          <p className="text-xs text-amber-700">{fluteSpec.description}</p>
          <p className="text-xs text-amber-600 mt-1">
            {fluteSpec.spacing} flutes per foot • {fluteSpec.height}mm height
          </p>
        </div>
      )}

      {/* Material Properties */}
      <div className="pt-2 border-t border-gray-200">
        <p className="text-xs font-medium text-gray-700 mb-2">Material Properties</p>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Roughness:</span>
            <span className="font-mono font-medium">
              {((plyConfig.roughness || 0.75) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Surface Finish:</span>
            <span className="font-medium">
              {plyConfig.roughness && plyConfig.roughness > 0.75 ? 'Matte' : 'Semi-Matte'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
