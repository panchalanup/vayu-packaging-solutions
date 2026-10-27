/**
 * Packaging cost per order, now vs a proposed right-sized box. Formulas only: every figure is the person's own
 * (box price, tape, courier rate, damage cost). No benchmarks, no default rates. Courier billing is modelled as
 * chargeable weight (larger of actual and volumetric) rounded up to a weight slab, times a rate per kg;
 * real rate cards differ (VERIFY-LATER[MKT-04]).
 */

import type { BoxDimensions, PlyType } from '@/types/boxDesigner';
import { DEFAULT_DESIGN } from '@/lib/boxDesigner/designCodec';
import { DEFAULT_PLY_FLUTES } from '@/lib/boxDesigner/boardSpecs';
import { estimatePrice } from '@/lib/boxDesigner/pricing';
import { validDims } from './shared';
import { volumetricKg } from './volumetric';

export interface BoxOption {
  dims: BoxDimensions;
  /** Price per box, Rs */
  boxCost: number;
  /** Tape + filler + label + insert, Rs per order */
  extrasPerOrder: number;
  /** Share of orders damaged or returned, % */
  damagePct: number;
}

export interface CostInput {
  monthlyOrders: number;
  /** Packed weight of one parcel, kg */
  packedKg: number;
  divisor: number;
  /** Rs per kg from the person's own rate card */
  ratePerKg: number;
  /** Weight slab the courier rounds up to, kg (0 = no rounding) */
  slabKg: number;
  /** Cost of one damaged or returned order, Rs (replacement + reverse shipping) */
  damageCost: number;
  /** One-time cost of switching (new tooling, old stock write-off), Rs */
  switchingCost: number;
  current: BoxOption;
  proposed: BoxOption;
}

export interface OrderCost {
  chargeableKg: number;
  billedKg: number;
  volumetricKg: number;
  box: number;
  extras: number;
  shipping: number;
  damage: number;
  total: number;
}

const nonNeg = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

export function costPerOrder(option: BoxOption, c: Pick<CostInput, 'packedKg' | 'divisor' | 'ratePerKg' | 'slabKg' | 'damageCost'>): OrderCost | null {
  if (!validDims(option.dims) || !(c.divisor > 0)) return null;
  const vol = volumetricKg(option.dims, c.divisor);
  const chargeable = Math.max(nonNeg(c.packedKg), vol);
  const slab = nonNeg(c.slabKg);
  const billed = slab > 0 ? Math.ceil(chargeable / slab - 1e-9) * slab : chargeable;
  const box = nonNeg(option.boxCost);
  const extras = nonNeg(option.extrasPerOrder);
  const shipping = billed * nonNeg(c.ratePerKg);
  const damage = (Math.min(100, nonNeg(option.damagePct)) / 100) * nonNeg(c.damageCost);
  return { chargeableKg: chargeable, billedKg: billed, volumetricKg: vol, box, extras, shipping, damage, total: box + extras + shipping + damage };
}

export interface CostComparison {
  now: OrderCost;
  proposed: OrderCost;
  savingPerOrder: number;
  savingPerMonth: number;
  savingPerYear: number;
  /** Months to earn back the switching cost; undefined when there is no saving or no switching cost */
  paybackMonths?: number;
}

export function compareCosts(input: CostInput): CostComparison | null {
  const now = costPerOrder(input.current, input);
  const proposed = costPerOrder(input.proposed, input);
  if (!now || !proposed) return null;
  const orders = nonNeg(input.monthlyOrders);
  const savingPerOrder = now.total - proposed.total;
  const savingPerMonth = savingPerOrder * orders;
  const switching = nonNeg(input.switchingCost);
  return {
    now,
    proposed,
    savingPerOrder,
    savingPerMonth,
    savingPerYear: savingPerMonth * 12,
    paybackMonths: savingPerMonth > 0 && switching > 0 ? switching / savingPerMonth : undefined,
  };
}

/** Indicative Vayu price per box (Rs, ex-GST) for a plain regular slotted carton, from the designer's estimator */
export function indicativeBoxPrice(dims: BoxDimensions, ply: PlyType, quantity: number): number | null {
  if (!validDims(dims)) return null;
  const est = estimatePrice({ ...DEFAULT_DESIGN, template: 'rsc', dimensions: dims, ply, flutes: DEFAULT_PLY_FLUTES[ply], quantity });
  return est.perBox;
}
