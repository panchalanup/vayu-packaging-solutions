import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConfidenceBadgeProps {
  confidence: 'High' | 'Medium' | 'Low';
}

// Text label plus colour, so meaning never relies on colour alone
const STYLE: Record<ConfidenceBadgeProps['confidence'], string> = {
  High: 'border-green-600/40 text-green-700',
  Medium: 'border-warning-700/40 text-warning-700',
  Low: 'border-error-700/40 text-error-700',
};

const MESSAGE: Record<ConfidenceBadgeProps['confidence'], string> = {
  High: 'High confidence: all key details were provided.',
  Medium: 'Medium confidence: some details are missing. Add size or weight to improve it.',
  Low: 'Low confidence: several details are missing. Add more to sharpen the match.',
};

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              STYLE[confidence]
            )}
          >
            Confidence: {confidence}
            <HelpCircle aria-hidden="true" className="h-3 w-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{MESSAGE[confidence]}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
