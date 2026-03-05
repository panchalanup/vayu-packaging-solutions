import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Package, Search } from "lucide-react";
import { UserInput } from "@/types/packaging";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useEventTracker } from "@/hooks/useAnalytics";

const formSchema = z.object({
  product_name: z.string().min(1, "Product name is required"),
  weight_kg: z.number().positive().optional().or(z.literal(undefined)),
  length_mm: z.number().positive().optional().or(z.literal(undefined)),
  width_mm: z.number().positive().optional().or(z.literal(undefined)),
  height_mm: z.number().positive().optional().or(z.literal(undefined)),
  fragility: z.enum(["Low", "Medium", "High", "Unknown"]),
  transport_type: z.string().min(1, "Transport type is required"),
  quantity: z.number().positive().min(1, "Quantity must be at least 1"),
  priority: z.enum(["minimize_damage", "balanced", "minimize_cost"]),
  max_price: z.number().positive().optional().or(z.literal(undefined)),
});

interface InputFormProps {
  categories: string[];
  transportTypes: string[];
  onSubmit: (data: UserInput) => void;
  isLoading?: boolean;
}

export function InputForm({ categories, transportTypes, onSubmit, isLoading }: InputFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { trackEvent } = useEventTracker();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fragility: "Unknown",
      priority: "balanced",
      quantity: 50,
      transport_type: "Courier",
    },
  });

  const fragility = watch("fragility");
  const priority = watch("priority");

  const fillExampleData = () => {
    // Track example usage
    trackEvent('tool_use_example', {
      action: 'fill_example_data',
    });
    
    setValue("product_name", "Glass bottle");
    setValue("weight_kg", 0.85);
    setValue("length_mm", 320);
    setValue("width_mm", 85);
    setValue("height_mm", 85);
    setValue("fragility", "High");
    setValue("transport_type", "Courier");
    setValue("quantity", 50);
    setValue("priority", "balanced");
  };

  const handleFormSubmit = (data: UserInput) => {
    // Track tool usage
    trackEvent('tool_get_recommendations', {
      productName: data.product_name,
      fragility: data.fragility,
      transportType: data.transport_type,
      quantity: data.quantity,
      priority: data.priority,
      hasWeight: !!data.weight_kg,
      hasDimensions: !!(data.length_mm && data.width_mm && data.height_mm),
      hasMaxPrice: !!data.max_price,
    });
    
    // Call parent's onSubmit
    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product Details
            </CardTitle>
            <CardDescription>
              Tell us about your product to get the best packaging recommendations
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fillExampleData}
          >
            Use Example
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="product_name" className="flex items-center gap-2">
              Product Name / Category
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enter your product name or select a category</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Input
              id="product_name"
              placeholder="e.g., glass bottle, ceramic mug, LED bulb"
              {...register("product_name")}
              list="categories"
            />
            <datalist id="categories">
              {categories.slice(0, 12).map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
            {errors.product_name && (
              <p className="text-sm text-red-500">{errors.product_name.message}</p>
            )}
          </div>

          {/* Weight & Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight_kg" className="flex items-center gap-2">
                Weight (kg) - Optional
              </Label>
              <Input
                id="weight_kg"
                type="number"
                step="0.01"
                placeholder="e.g., 0.85"
                {...register("weight_kg", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Dimensions (mm) - Optional</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  placeholder="Length"
                  {...register("length_mm", { valueAsNumber: true })}
                />
                <Input
                  type="number"
                  placeholder="Width"
                  {...register("width_mm", { valueAsNumber: true })}
                />
                <Input
                  type="number"
                  placeholder="Height"
                  {...register("height_mm", { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          {/* Fragility */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Fragility Level
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Low: Tools, canned goods | Medium: Books, clothing | High: Glass, ceramics, electronics</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <RadioGroup value={fragility} onValueChange={(value) => setValue("fragility", value as any)}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Low", "Medium", "High", "Unknown"].map((level) => (
                  <Label
                    key={level}
                    className={`flex items-center space-x-2 border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      fragility === level
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <RadioGroupItem value={level} />
                    <span>{level}</span>
                  </Label>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Transport Type */}
          <div className="space-y-2">
            <Label htmlFor="transport_type" className="flex items-center gap-2">
              Transport Type
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>How will the product be shipped?</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Select onValueChange={(value) => setValue("transport_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select transport type" />
              </SelectTrigger>
              <SelectContent>
                {transportTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                {...register("quantity", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(value) => setValue("priority", value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimize_damage">Minimize Damage</SelectItem>
                  <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                  <SelectItem value="minimize_cost">Minimize Cost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Options */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="w-full">
                {showAdvanced ? "Hide" : "Show"} Advanced Options
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="max_price">Maximum Price per Unit (₹) - Optional</Label>
                <Input
                  id="max_price"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 100"
                  {...register("max_price", { valueAsNumber: true })}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            <Search className="w-4 h-4 mr-2" />
            {isLoading ? "Finding Best Match..." : "Get Recommendations"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
