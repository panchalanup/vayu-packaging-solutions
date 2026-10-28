/** /tools/volumetric-weight-calculator: box size + actual weight + divisor -> chargeable weight, cost, and what a smaller box saves. */

import { useMemo, useState } from 'react';
import type { BoxDimensions, LengthUnit } from '@/types/boxDesigner';
import { assessVolumetric, DEFAULT_DIVISOR, DIVISORS } from '@/lib/tools/volumetric';
import { dimsText, fmt, parseNum, rupees, validDims } from '@/lib/tools/shared';
import { formatDimensions } from '@/lib/boxDesigner/units';
import ToolHandoff from '../ToolHandoff';
import { CalcShell, DimsFields, Disclaimer, EmptyResult, Meaning, NumberField, Segmented, Stat, UnitBar, Warning, useCalculateTracker } from '../ToolKit';

const SLUG = 'volumetric-weight-calculator';
const NAME = 'Volumetric Weight Calculator';

export default function VolumetricCalculator() {
  const [unit, setUnit] = useState<LengthUnit>('cm');
  const [dims, setDims] = useState<BoxDimensions>({ length: 30, width: 20, height: 15 });
  const [weight, setWeight] = useState('1');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'g'>('kg');
  const [divisor, setDivisor] = useState<number>(DEFAULT_DIVISOR);
  const [parcels, setParcels] = useState('1');
  const [rate, setRate] = useState('');

  const actualKg = useMemo(() => {
    const w = parseNum(weight);
    return Number.isFinite(w) ? (weightUnit === 'g' ? w / 1000 : w) : undefined;
  }, [weight, weightUnit]);

  const result = useMemo(
    () => assessVolumetric({ dims, actualKg, divisor, parcels: parseNum(parcels), ratePerKg: parseNum(rate) }),
    [dims, actualKg, divisor, parcels, rate]
  );
  useCalculateTracker(SLUG, result ? `${result.volumetricKg.toFixed(3)}|${result.chargeableKg.toFixed(3)}` : '');

  const target = result?.breakEvenDims && validDims(result.breakEvenDims) ? result.breakEvenDims : validDims(dims) ? dims : null;
  const summary = result
    ? `Box ${dimsText(dims)}, volumetric weight ${fmt(result.volumetricKg, 2)} kg at /${divisor}${result.actualKg ? `, actual ${fmt(result.actualKg, 2)} kg, chargeable ${fmt(result.chargeableKg, 2)} kg` : ''}.${result.breakEvenDims ? ` I would like a box near ${dimsText(result.breakEvenDims)}.` : ''}`
    : '';

  return (
    <div className="space-y-6">
      <CalcShell
        inputs={
          <>
            <UnitBar unit={unit} onChange={setUnit} note="Packed box size in" />
            <DimsFields value={dims} unit={unit} onChange={setDims} />
            <div className="grid grid-cols-[1fr_auto] items-end gap-3">
              <NumberField label="Actual weight of one packed parcel" value={weight} onChange={setWeight} suffix={weightUnit} />
              <Segmented label="Unit" value={weightUnit} onChange={setWeightUnit} options={[{ value: 'kg', label: 'kg' }, { value: 'g', label: 'g' }]} />
            </div>
            <Segmented
              label="Divisor (cm3 per kg)"
              value={divisor}
              onChange={setDivisor}
              options={DIVISORS.map((d) => ({ value: d, label: String(d) }))}
            />
            <p className="-mt-2 text-xs text-muted-foreground">Divisor varies by courier and service; check your rate card. 5000 is a common starting point.</p>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Parcels (optional)" value={parcels} onChange={setParcels} />
              <NumberField label="Your rate per kg (optional)" value={rate} onChange={setRate} suffix="Rs" placeholder="from your rate card" />
            </div>
          </>
        }
        results={
          result ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Volumetric weight" value={`${fmt(result.volumetricKg, 2)} kg`} note={`${fmt(result.volumeCm3, 0)} cm3 / ${divisor}`} />
                <Stat
                  label={result.actualKg ? 'Chargeable weight' : 'Weight to compare'}
                  value={`${fmt(result.chargeableKg, 2)} kg`}
                  tone="key"
                  note={result.actualKg ? (result.winner === 'volumetric' ? 'Volumetric is larger' : result.winner === 'actual' ? 'Actual is larger' : 'Both equal') : 'Enter the actual weight'}
                />
              </div>
              {result.winner === 'volumetric' && result.actualKg && (
                <Meaning>
                  Your {fmt(result.actualKg, 2)} kg parcel could be billed as {fmt(result.chargeableKg, 2)} kg, that is {fmt(result.extraKg, 2)} kg for empty space. A box nearer the product size removes it.
                </Meaning>
              )}
              {result.winner === 'actual' && result.actualKg && (
                <Meaning>
                  The real weight is the larger figure, so a smaller box would not lower the weight charge here. Check the product still has the padding it needs.
                </Meaning>
              )}
              {result.costPerParcel !== undefined && (
                <Stat label="Cost at your rate" value={`${rupees(result.costPerParcel)} per parcel`} note={result.costTotal !== undefined && parseNum(parcels) > 1 ? `${rupees(result.costTotal, 0)} for ${fmt(parseNum(parcels), 0)} parcels, before any slab rounding` : 'Before any slab rounding'} />
              )}
              {result.breakEvenDims && result.breakEvenVolumeCm3 && (
                <Stat
                  label="Largest box with no extra charge"
                  value={formatDimensions(result.breakEvenDims, unit)}
                  note={`Same shape, about ${fmt(result.breakEvenVolumeCm3, 0)} cm3: volumetric weight equals the real weight. Check your product still fits.`}
                />
              )}
              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full min-w-[20rem] text-sm">
                  <caption className="px-4 pt-3 text-left label-mono text-muted-foreground">What a smaller box saves</caption>
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="px-4 py-2 font-medium">Volume</th>
                      <th className="px-4 py-2 font-medium">Volumetric</th>
                      <th className="px-4 py-2 font-medium">Chargeable</th>
                      <th className="px-4 py-2 font-medium">Saved</th>
                    </tr>
                  </thead>
                  <tbody className="tabular">
                    {result.scenarios.map((s) => (
                      <tr key={s.pct} className="border-t border-border">
                        <td className="px-4 py-2">{s.pct}% smaller</td>
                        <td className="px-4 py-2">{fmt(s.volumetricKg, 2)} kg</td>
                        <td className="px-4 py-2">{fmt(s.chargeableKg, 2)} kg</td>
                        <td className="px-4 py-2">
                          {fmt(s.savedKg, 2)} kg{s.savedCost ? ` (${rupees(s.savedCost)})` : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!result.actualKg && <Warning>Add the actual weight to see which weight is billed.</Warning>}
              <ToolHandoff
                slug={SLUG}
                toolName={NAME}
                dimsCm={target}
                summary={summary}
                note={result.breakEvenDims ? `Open a box at ${dimsText(result.breakEvenDims)}, the largest size with no extra volumetric charge.` : 'Open this box size in the 3D designer.'}
                designerLabel={result.breakEvenDims ? 'Design a box at the target size' : 'See this box in 3D'}
              />
            </>
          ) : (
            <EmptyResult>Enter length, width and height to see the volumetric weight.</EmptyResult>
          )
        }
      />
      <Disclaimer>Couriers differ in divisor and rules. This uses the plain formula with the divisor you pick and does not model any courier&apos;s flyer rates, minimum charges or slabs.</Disclaimer>
    </div>
  );
}
