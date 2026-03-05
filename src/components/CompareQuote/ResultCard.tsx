import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoredResult } from "@/types/packaging";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { Package, Box, Layers, Shield } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DetailView } from "./DetailView";
import { UserInput } from "@/types/packaging";

interface ResultCardProps {
  result: ScoredResult;
  input: UserInput;
}

export function ResultCard({ result, input }: ResultCardProps) {
  const getLabelColor = () => {
    switch (result.label) {
      case 'Best Protection':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'Best Value':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'Economy':
        return 'bg-purple-500/10 text-purple-700 border-purple-200';
    }
  };

  const getIcon = (type: string) => {
    if (type !== 'None') {
      return <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <Shield className="w-4 h-4 text-primary" />
      </div>;
    }
    return <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
      <Shield className="w-4 h-4 text-gray-400" />
    </div>;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Badge variant="outline" className={`${getLabelColor()} text-sm font-semibold`}>
            {result.label}
          </Badge>
          <ConfidenceBadge confidence={result.confidence} />
        </div>
        <CardTitle className="text-2xl">₹{result.estimated_price_inr.toFixed(2)}</CardTitle>
        <p className="text-sm text-muted-foreground">per unit</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Specs */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{result.box_style}</span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{result.board_type}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs">ECT: {result.ECT_lb_per_in}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs">{result.flute_type} Flute</span>
          </div>
        </div>

        {/* Icon Row */}
        <div className="flex items-center gap-2 pt-2 border-t">
          {getIcon(result.internal_protection)}
          {getIcon(result.tape_type)}
          {getIcon(result.strapping_type)}
          {getIcon(result.extra_packaging)}
        </div>

        {/* Pros & Cons */}
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-green-600 font-medium">✓</span>
            <span className="ml-2 text-muted-foreground">{result.pros}</span>
          </div>
          <div>
            <span className="text-amber-600 font-medium">⚠</span>
            <span className="ml-2 text-muted-foreground">{result.cons}</span>
          </div>
        </div>

        {/* Reasons */}
        <div className="space-y-1">
          {result.reasons.slice(0, 2).map((reason, idx) => (
            <p key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
              <span className="text-primary">•</span>
              {reason}
            </p>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Packaging Specification</SheetTitle>
              <SheetDescription>
                Complete details and supplier-ready specifications
              </SheetDescription>
            </SheetHeader>
            <DetailView result={result} input={input} />
          </SheetContent>
        </Sheet>
      </CardFooter>
    </Card>
  );
}
