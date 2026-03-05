export interface PackagingOption {
  id: number;
  product_category: string;
  product_weight_kg: number;
  product_length_mm: number;
  product_width_mm: number;
  product_height_mm: number;
  fragility_level: 'Low' | 'Medium' | 'High';
  transport_type: string;
  box_style: string;
  board_type: string;
  flute_type: string;
  liner_gsm: number;
  fluting_gsm: number;
  burst_strength_kg_cm2: number;
  ECT_lb_per_in: number;
  internal_protection: string;
  tape_type: string;
  strapping_type: string;
  extra_packaging: string;
  estimated_price_inr: number;
  pros: string;
  cons: string;
}

export interface UserInput {
  product_name: string;
  weight_kg?: number;
  length_mm?: number;
  width_mm?: number;
  height_mm?: number;
  fragility: 'Low' | 'Medium' | 'High' | 'Unknown';
  transport_type: string;
  quantity: number;
  priority: 'minimize_damage' | 'balanced' | 'minimize_cost';
  max_price?: number;
}

export interface ScoredResult extends PackagingOption {
  score: number;
  confidence: 'High' | 'Medium' | 'Low';
  label: 'Best Protection' | 'Best Value' | 'Economy';
  reasons: string[];
  fit_score: number;
  protection_score: number;
  cost_score: number;
  transport_score: number;
}

export interface ExportData {
  product_name: string;
  quantity: number;
  weight_kg: number;
  dimensions_mm: string;
  box_spec: string;
  board_details: string;
  internal_protection: string;
  tape_strapping: string;
  estimated_price: string;
  pros: string;
  cons: string;
}
