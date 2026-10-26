/**
 * Display units for the designer (#24). The design always stores centimetres; these helpers convert for display
 * and parse what the user types back into cm. Every dimension input in the designer goes through here.
 */

import type { BoxDimensions, LengthUnit } from '@/types/boxDesigner';

export const LENGTH_UNITS: readonly LengthUnit[] = ['mm', 'cm', 'in'];

export const UNIT_LABELS: Record<LengthUnit, string> = { mm: 'mm', cm: 'cm', in: 'in' };

/** Centimetres in one unit */
const CM_PER_UNIT: Record<LengthUnit, number> = { mm: 0.1, cm: 1, in: 2.54 };

/** Decimals shown per unit (mm whole numbers, cm one decimal, inches two) */
export const UNIT_DECIMALS: Record<LengthUnit, number> = { mm: 0, cm: 1, in: 2 };

/** Natural slider / stepper increment per unit */
export const UNIT_STEP: Record<LengthUnit, number> = { mm: 5, cm: 0.5, in: 0.25 };

export const isLengthUnit = (value: unknown): value is LengthUnit =>
  typeof value === 'string' && (LENGTH_UNITS as readonly string[]).includes(value);

const round = (value: number, decimals: number) => {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
};

/** cm -> display unit, rounded for display */
export function toUnit(cm: number, unit: LengthUnit): number {
  if (!Number.isFinite(cm)) return 0;
  return round(cm / CM_PER_UNIT[unit], UNIT_DECIMALS[unit]);
}

/** display unit -> cm (kept to 0.01 cm so mm and inch round-trips are stable) */
export function fromUnit(value: number, unit: LengthUnit): number {
  if (!Number.isFinite(value)) return NaN;
  return round(value * CM_PER_UNIT[unit], 2);
}

/** Parse what a person typed ("12,5", " 300 ", "4.25") in the given unit; NaN when it is not a number */
export function parseLength(raw: string, unit: LengthUnit): number {
  const cleaned = raw.trim().replace(',', '.').replace(/\s*(mm|cm|in|")$/i, '');
  if (!/^\d*\.?\d+$/.test(cleaned)) return NaN;
  return fromUnit(parseFloat(cleaned), unit);
}

/** "300 mm", "30 cm", "11.81 in" */
export function formatLength(cm: number, unit: LengthUnit): string {
  return `${toUnit(cm, unit).toLocaleString('en-IN', { maximumFractionDigits: UNIT_DECIMALS[unit] })} ${UNIT_LABELS[unit]}`;
}

/** "300 × 200 × 150 mm" */
export function formatDimensions(dims: BoxDimensions, unit: LengthUnit): string {
  const f = (cm: number) => toUnit(cm, unit).toLocaleString('en-IN', { maximumFractionDigits: UNIT_DECIMALS[unit] });
  return `${f(dims.length)} × ${f(dims.width)} × ${f(dims.height)} ${UNIT_LABELS[unit]}`;
}

/** Min/max of a cm range expressed in the display unit */
export function limitsInUnit(limits: { min: number; max: number }, unit: LengthUnit): { min: number; max: number; step: number } {
  return { min: toUnit(limits.min, unit), max: toUnit(limits.max, unit), step: UNIT_STEP[unit] };
}
