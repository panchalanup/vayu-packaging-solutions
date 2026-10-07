/**
 * WebGL Fallback
 * Shown instead of the 3D canvas when WebGL is unavailable or the 3D view crashed.
 * Keeps the visitor moving toward a quote with the dimensions they have chosen.
 */

import { Box, RefreshCw, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BoxDimensions } from '@/types/boxDesigner';

interface WebGLFallbackProps {
  reason: 'unsupported' | 'error';
  dimensions: BoxDimensions;
  onRetry?: () => void;
  onGetQuote: () => void;
}

export default function WebGLFallback({ reason, dimensions, onRetry, onGetQuote }: WebGLFallbackProps) {
  const title =
    reason === 'unsupported'
      ? "3D preview isn't available on this device"
      : 'The 3D preview hit a problem';
  const body =
    reason === 'unsupported'
      ? 'Your browser or graphics settings have WebGL turned off. Enable hardware acceleration or try another browser (Chrome, Edge, Firefox or Safari) to design in 3D.'
      : 'Something went wrong while drawing the box. You can try again, or request a quote and we will take it from here.';

  return (
    <div
      role="alert"
      className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-6"
    >
      <div className="max-w-md text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
          <Box className="w-7 h-7 text-gray-500" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600">{body}</p>
        <p className="text-xs text-gray-500">
          Current size: {dimensions.length} × {dimensions.width} × {dimensions.height} cm (L × W × H)
        </p>
        <div className="flex items-center justify-center gap-2 pt-1">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
              Try again
            </Button>
          )}
          <Button size="sm" onClick={onGetQuote}>
            <MessageSquare className="w-4 h-4 mr-2" aria-hidden="true" />
            Get a quote
          </Button>
        </div>
      </div>
    </div>
  );
}
