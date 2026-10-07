/**
 * WebGL Fallback
 * Shown instead of the 3D canvas when WebGL is unavailable or the 3D view crashed.
 * Keeps the visitor moving toward a quote with the dimensions they have chosen.
 */

import { Box, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Cta } from '@/components/site/Cta';
import { BoxDimensions } from '@/types/boxDesigner';

interface WebGLFallbackProps {
  reason: 'unsupported' | 'error';
  dimensions: BoxDimensions;
  onRetry?: () => void;
  /** /quote?... link built from the current size */
  quoteHref: string;
  onQuote: () => void;
}

export default function WebGLFallback({ reason, dimensions, onRetry, quoteHref, onQuote }: WebGLFallbackProps) {
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
      className="w-full h-full flex items-center justify-center bg-paper-100 p-6"
    >
      <div className="max-w-md text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-lg bg-card border border-border flex items-center justify-center">
          <Box className="w-7 h-7 text-ink-500" aria-hidden="true" />
        </div>
        <h2 className="font-display text-lg text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{body}</p>
        <p className="text-xs text-muted-foreground">
          Current size: {dimensions.length} × {dimensions.width} × {dimensions.height} cm (L × W × H)
        </p>
        <div className="flex items-center justify-center gap-2 pt-1">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
              Try again
            </Button>
          )}
          <Cta id="designer.fallback.quote" intent="designer" href={quoteHref} onClick={onQuote}>
            Quote this size
          </Cta>
        </div>
      </div>
    </div>
  );
}
