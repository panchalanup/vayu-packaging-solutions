/**
 * Corrugated box weight and paper cost (for wholesalers and manufacturers). RSC (regular slotted carton) blank:
 *   blank length = 2 x (L + W) + joint,   blank width = H + W      (outer flaps are half the width each; sizes in mm)
 *   weight (g) = blank area (m2) x sum over layers of GSM x take-up      (take-up 1 for liners, above 1 for fluted mediums)
 * We ship NO default paper rates: cost shows only when the person types a rate for every layer.
 * VERIFY-LATER[MKT-19]: flute take-up factors and the example GSM values are typical ranges, not a mill's figures; all are editable.
 */

import type { FluteType, PlyType } from '@/types/boxDesigner';
import { DEFAULT_PLY_FLUTES } from '@/lib/boxDesigner/boardSpecs';

// VERIFY-LATER[MKT-19]: typical take-up (flute length per metre of liner), editable in the calculator
export const FLUTE_TAKE_UP: Record<FluteType, number> = { A: 1.5, C: 1.43, B: 1.35, E: 1.25, F: 1.2 };
/** Example paper weights (GSM) used as starting values only */
export const EXAMPLE_LINER_GSM = 150;
export const EXAMPLE_MEDIUM_GSM = 120;
/** Typical joint (glue or stitch flap), mm; editable */
export const DEFAULT_JOINT_MM = 35;

export interface PaperLayer {
  kind: 'liner' | 'medium';
  label: string;
  gsm: number;
  /** Flute for medium layers */
  flute?: FluteType;
  takeUp: number;
  /** Paper rate, Rs per kg (typed by the person; no default) */
  ratePerKg?: number;
}

/** Layers from outside to inside: liner, medium, liner, [medium, liner ...] */
export function defaultLayers(ply: PlyType): PaperLayer[] {
  const flutes = DEFAULT_PLY_FLUTES[ply];
  const layers: PaperLayer[] = [];
  const liner = (name: string): PaperLayer => ({ kind: 'liner', label: name, gsm: EXAMPLE_LINER_GSM, takeUp: 1 });
  layers.push(liner('Top liner'));
  flutes.forEach((flute, i) => {
    layers.push({ kind: 'medium', label: flutes.length > 1 ? `Flute ${i + 1}` : 'Fluting medium', gsm: EXAMPLE_MEDIUM_GSM, flute, takeUp: FLUTE_TAKE_UP[flute] });
    layers.push(liner(i === flutes.length - 1 ? 'Bottom liner' : flutes.length === 2 ? 'Middle liner' : `Middle liner ${i + 1}`));
  });
  return layers;
}

export interface BoxWeightInput {
  /** Box size, mm (the size the blank is cut for) */
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  jointMm: number;
  layers: PaperLayer[];
  qty: number;
  /** Conversion / printing add-on per box, Rs (optional) */
  addOnPerBox?: number;
}

export interface LayerResult {
  label: string;
  grams: number;
  cost?: number;
}

export interface BoxWeightResult {
  blankLengthMm: number;
  blankWidthMm: number;
  areaM2: number;
  weightG: number;
  layers: LayerResult[];
  /** Paper cost per box; undefined until every layer has a rate */
  paperCostPerBox?: number;
  totalPerBox?: number;
  orderTotal?: number;
  /** Rs per kg of finished box */
  perKgFinished?: number;
}

export function assessBoxWeight(input: BoxWeightInput): BoxWeightResult | null {
  const { lengthMm, widthMm, heightMm, jointMm } = input;
  if (![lengthMm, widthMm, heightMm].every((v) => Number.isFinite(v) && v > 0)) return null;
  if (!input.layers.length || input.layers.some((l) => !(l.gsm > 0) || !(l.takeUp > 0))) return null;
  const joint = Number.isFinite(jointMm) && jointMm >= 0 ? jointMm : DEFAULT_JOINT_MM;
  const qty = Number.isFinite(input.qty) && input.qty > 0 ? Math.round(input.qty) : 1;

  const blankLengthMm = 2 * (lengthMm + widthMm) + joint;
  const blankWidthMm = heightMm + widthMm;
  const areaM2 = (blankLengthMm * blankWidthMm) / 1_000_000;

  const layers = input.layers.map((l): LayerResult => {
    const grams = areaM2 * l.gsm * l.takeUp;
    const rated = l.ratePerKg !== undefined && Number.isFinite(l.ratePerKg) && l.ratePerKg > 0;
    return { label: l.label, grams, cost: rated ? (grams / 1000) * (l.ratePerKg as number) : undefined };
  });
  const weightG = layers.reduce((s, l) => s + l.grams, 0);
  const allRated = layers.every((l) => l.cost !== undefined);
  const paperCostPerBox = allRated ? layers.reduce((s, l) => s + (l.cost ?? 0), 0) : undefined;
  const addOn = input.addOnPerBox !== undefined && Number.isFinite(input.addOnPerBox) && input.addOnPerBox > 0 ? input.addOnPerBox : 0;
  const totalPerBox = paperCostPerBox !== undefined ? paperCostPerBox + addOn : undefined;

  return {
    blankLengthMm,
    blankWidthMm,
    areaM2,
    weightG,
    layers,
    paperCostPerBox,
    totalPerBox,
    orderTotal: totalPerBox !== undefined ? totalPerBox * qty : undefined,
    perKgFinished: totalPerBox !== undefined && weightG > 0 ? totalPerBox / (weightG / 1000) : undefined,
  };
}
