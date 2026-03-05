import { Badge } from "@/components/ui/badge";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConfidenceBadgeProps {
  confidence: 'High' | 'Medium' | 'Low';
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const getColor = () => {
    switch (confidence) {
      case 'High':
        return 'bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/20';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200 hover:bg-yellow-500/20';
      case 'Low':
        return 'bg-red-500/10 text-red-700 border-red-200 hover:bg-red-500/20';
    }
  };

  const getMessage = () => {
    switch (confidence) {
      case 'High':
        return 'High confidence - All key parameters provided';
      case 'Medium':
        return 'Medium confidence - Some parameters missing. Add dimensions or weight to improve.';
      case 'Low':
        return 'Low confidence - Multiple parameters missing. Provide more details for better recommendations.';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`${getColor()} flex items-center gap-1`}>
            Confidence: {confidence}
            <HelpCircle className="w-3 h-3" />
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{getMessage()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
