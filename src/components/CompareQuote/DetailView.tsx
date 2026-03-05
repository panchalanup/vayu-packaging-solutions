import { ScoredResult, UserInput } from "@/types/packaging";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ExportButtons } from "./ExportButtons";
import { Package, Box, Layers, Shield, DollarSign, TrendingUp } from "lucide-react";

interface DetailViewProps {
  result: ScoredResult;
  input: UserInput;
}

export function DetailView({ result, input }: DetailViewProps) {
  const totalCost = result.estimated_price_inr * input.quantity;

  return (
    <div className="space-y-6 py-6">
      {/* Export Buttons */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Export Options</h3>
        <ExportButtons result={result} input={input} />
      </div>

      <Separator />

      {/* Product Summary */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Package className="w-4 h-4" />
          Product Summary
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Product:</span>
            <p className="font-medium">{input.product_name}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Quantity:</span>
            <p className="font-medium">{input.quantity} units</p>
          </div>
          <div>
            <span className="text-muted-foreground">Weight:</span>
            <p className="font-medium">{result.product_weight_kg} kg</p>
          </div>
          <div>
            <span className="text-muted-foreground">Dimensions:</span>
            <p className="font-medium">{result.product_length_mm} × {result.product_width_mm} × {result.product_height_mm} mm</p>
          </div>
          <div>
            <span className="text-muted-foreground">Fragility:</span>
            <p className="font-medium">{result.fragility_level}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Transport:</span>
            <p className="font-medium">{result.transport_type}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Box Specifications */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Box className="w-4 h-4" />
          Box Specifications
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Box Style:</span>
            <span className="font-medium">{result.box_style}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Board Type:</span>
            <span className="font-medium">{result.board_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Flute Type:</span>
            <span className="font-medium">{result.flute_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Liner GSM:</span>
            <span className="font-medium">{result.liner_gsm}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fluting GSM:</span>
            <span className="font-medium">{result.fluting_gsm}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total GSM (est):</span>
            <span className="font-medium">{result.liner_gsm + result.fluting_gsm}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Strength Specifications */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Strength Specifications
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ECT (Edge Crush Test):</span>
            <Badge variant="outline">{result.ECT_lb_per_in} lb/in</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Burst Strength:</span>
            <Badge variant="outline">{result.burst_strength_kg_cm2} kg/cm²</Badge>
          </div>
          <p className="text-xs text-muted-foreground italic mt-2">
            Higher ECT values indicate better stacking strength and compression resistance.
          </p>
        </div>
      </div>

      <Separator />

      {/* Protection & Accessories */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Protection & Accessories
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Internal Protection:</span>
            <span className="font-medium">{result.internal_protection}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tape Type:</span>
            <span className="font-medium">{result.tape_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Strapping:</span>
            <span className="font-medium">{result.strapping_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Extras:</span>
            <span className="font-medium">{result.extra_packaging}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Pricing */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Pricing
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Price per Unit:</span>
            <span className="text-xl font-bold">₹{result.estimated_price_inr.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
            <span className="font-medium">Total Cost (estimated):</span>
            <span className="text-2xl font-bold text-primary">₹{totalCost.toFixed(2)}</span>
          </div>
          <p className="text-xs text-muted-foreground italic">
            * Prices are estimates. Contact supplier for final quote including taxes and shipping.
          </p>
        </div>
      </div>

      <Separator />

      {/* Score Breakdown */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Why This Recommendation
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Protection Score:</span>
            <Badge variant="outline">{result.protection_score.toFixed(0)}/100</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Fit Score:</span>
            <Badge variant="outline">{result.fit_score.toFixed(0)}/100</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Cost Score:</span>
            <Badge variant="outline">{result.cost_score.toFixed(0)}/100</Badge>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-medium">Overall Score:</span>
            <Badge className="text-base">{result.score.toFixed(1)}/100</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
