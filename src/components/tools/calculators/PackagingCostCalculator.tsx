/** /tools/packaging-cost-calculator: cost per order now vs a proposed smaller box, monthly saving and payback. All numbers are the person's own. */

import { useMemo, useState } from 'react';
import type { BoxDimensions, LengthUnit, PlyType } from '@/types/boxDesigner';
import { compareCosts, indicativeBoxPrice } from '@/lib/tools/packagingCost';
import { DEFAULT_DIVISOR, DIVISORS } from '@/lib/tools/volumetric';
import { dimsText, fmt, parseNum, rupees } from '@/lib/tools/shared';
import { formatDimensions } from '@/lib/boxDesigner/units';
import { Button } from '@/components/ui/button';
import ToolHandoff from '../ToolHandoff';
import { CalcShell, DimsFields, Disclaimer, EmptyResult, Meaning, NumberField, Segmented, Stat, UnitBar, Warning, useCalculateTracker } from '../ToolKit';

const SLUG = 'packaging-cost-calculator';
const NAME = 'Packaging Cost per Order Calculator';

const num = (s: string) => {
  const n = parseNum(s);
  return Number.isFinite(n) ? n : 0;
};

export default function PackagingCostCalculator() {
  const [unit, setUnit] = useState<LengthUnit>('cm');
  const [orders, setOrders] = useState('1000');
  const [packedKg, setPackedKg] = useState('1');
  // Example values only (labelled on screen); the person replaces them with their own
  const [current, setCurrent] = useState<BoxDimensions>({ length: 30, width: 20, height: 15 });
  const [boxCost, setBoxCost] = useState('20');
  const [damage, setDamage] = useState('2');
  const [tape, setTape] = useState('1.5');
  const [filler, setFiller] = useState('2.5');
  const [labelCost, setLabelCost] = useState('1');
  const [insert, setInsert] = useState('0');
  const [rate, setRate] = useState('50');
  const [slab, setSlab] = useState('0.5');
  const [divisor, setDivisor] = useState<number>(DEFAULT_DIVISOR);
  const [damageCost, setDamageCost] = useState('400');
  const [proposed, setProposed] = useState<BoxDimensions>({ length: 25, width: 18, height: 12 });
  const [proposedCost, setProposedCost] = useState('16');
  const [proposedFiller, setProposedFiller] = useState('2.5');
  const [proposedDamage, setProposedDamage] = useState('2');
  const [switching, setSwitching] = useState('');
  const [ply, setPly] = useState<PlyType>('5-ply');

  const extras = num(tape) + num(filler) + num(labelCost) + num(insert);
  const proposedExtras = extras - num(filler) + num(proposedFiller);

  const result = useMemo(
    () =>
      compareCosts({
        monthlyOrders: num(orders),
        packedKg: num(packedKg),
        divisor,
        ratePerKg: num(rate),
        slabKg: num(slab),
        damageCost: num(damageCost),
        switchingCost: num(switching),
        current: { dims: current, boxCost: num(boxCost), extrasPerOrder: extras, damagePct: num(damage) },
        proposed: { dims: proposed, boxCost: num(proposedCost), extrasPerOrder: proposedExtras, damagePct: num(proposedDamage) },
      }),
    [orders, packedKg, divisor, rate, slab, damageCost, switching, current, boxCost, extras, damage, proposed, proposedCost, proposedExtras, proposedDamage]
  );
  useCalculateTracker(SLUG, result ? `${Math.round(result.savingPerOrder * 100)}` : '');

  const useIndicative = () => {
    const price = indicativeBoxPrice(proposed, ply, Math.max(100, num(orders)));
    if (price !== null) setProposedCost(String(price));
  };
  const indicative = useMemo(() => indicativeBoxPrice(proposed, ply, Math.max(100, num(orders))), [proposed, ply, orders]);

  const summary = result
    ? `Cost per order now ${rupees(result.now.total)} vs ${rupees(result.proposed.total)} with a ${dimsText(proposed)} box: saving ${rupees(result.savingPerOrder)} per order, ${rupees(result.savingPerMonth, 0)} a month on ${fmt(num(orders), 0)} orders (my own numbers).`
    : '';

  const cost = (label: string, now: number, next: number) => (
    <tr className="border-t border-border">
      <td className="px-4 py-2">{label}</td>
      <td className="px-4 py-2">{rupees(now)}</td>
      <td className="px-4 py-2">{rupees(next)}</td>
    </tr>
  );

  return (
    <div className="space-y-6">
      <CalcShell
        inputs={
          <>
            <Warning>The numbers below are examples. Replace every one with your own; nothing here is a benchmark.</Warning>
            <UnitBar unit={unit} onChange={setUnit} note="Box sizes in" />
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Orders per month" value={orders} onChange={setOrders} />
              <NumberField label="Packed weight per parcel" value={packedKg} onChange={setPackedKg} suffix="kg" />
            </div>

            <fieldset className="space-y-3 rounded-xl border border-border p-4">
              <legend className="px-1 text-sm font-semibold">Current box</legend>
              <DimsFields value={current} unit={unit} onChange={setCurrent} />
              <div className="grid grid-cols-2 gap-3">
                <NumberField label="Box price" value={boxCost} onChange={setBoxCost} suffix="Rs" />
                <NumberField label="Damaged or returned" value={damage} onChange={setDamage} suffix="%" />
                <NumberField label="Tape" value={tape} onChange={setTape} suffix="Rs" />
                <NumberField label="Filler" value={filler} onChange={setFiller} suffix="Rs" />
                <NumberField label="Label" value={labelCost} onChange={setLabelCost} suffix="Rs" />
                <NumberField label="Insert or other" value={insert} onChange={setInsert} suffix="Rs" />
              </div>
            </fieldset>

            <fieldset className="space-y-3 rounded-xl border border-border p-4">
              <legend className="px-1 text-sm font-semibold">Your courier</legend>
              <div className="grid grid-cols-2 gap-3">
                <NumberField label="Rate per kg" value={rate} onChange={setRate} suffix="Rs" hint="From your rate card" />
                <NumberField label="Weight slab" value={slab} onChange={setSlab} suffix="kg" hint="0 for no rounding" />
              </div>
              <Segmented label="Divisor (cm3 per kg)" value={divisor} onChange={setDivisor} options={DIVISORS.map((d) => ({ value: d, label: String(d) }))} />
              <NumberField label="Cost of one damaged order" value={damageCost} onChange={setDamageCost} suffix="Rs" hint="Replacement plus reverse shipping" />
            </fieldset>

            <fieldset className="space-y-3 rounded-xl border border-border p-4">
              <legend className="px-1 text-sm font-semibold">Proposed smaller box</legend>
              <DimsFields value={proposed} unit={unit} onChange={setProposed} />
              <div className="grid grid-cols-2 gap-3">
                <NumberField label="Box price" value={proposedCost} onChange={setProposedCost} suffix="Rs" />
                <NumberField label="Damaged or returned" value={proposedDamage} onChange={setProposedDamage} suffix="%" />
                <NumberField label="Filler" value={proposedFiller} onChange={setProposedFiller} suffix="Rs" />
                <NumberField label="One-time switching cost" value={switching} onChange={setSwitching} suffix="Rs" hint="Optional, for payback" />
              </div>
              <div className="flex flex-wrap items-end gap-3 rounded-lg bg-paper-100 p-3">
                <Segmented label="Indicative Vayu price for a plain carton" value={ply} onChange={setPly} options={[{ value: '3-ply', label: '3-ply' }, { value: '5-ply', label: '5-ply' }, { value: '7-ply', label: '7-ply' }]} />
                <Button type="button" variant="outline" size="sm" onClick={useIndicative} disabled={indicative === null} className="min-h-10">
                  {indicative !== null ? `Use ${rupees(indicative)} per box` : 'Enter a size first'}
                </Button>
                <p className="w-full text-xs text-muted-foreground">Indicative, ex-GST, from the 3D designer estimate at your monthly quantity. Not a quote.</p>
              </div>
            </fieldset>
          </>
        }
        results={
          result ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Cost per order now" value={rupees(result.now.total)} note={`Billed ${fmt(result.now.billedKg, 2)} kg`} />
                <Stat label="Cost per order, proposed" value={rupees(result.proposed.total)} note={`Billed ${fmt(result.proposed.billedKg, 2)} kg`} />
              </div>
              <Stat
                label="Saving"
                value={`${rupees(result.savingPerOrder)} per order`}
                tone={result.savingPerOrder > 0 ? 'key' : 'warn'}
                note={`${rupees(result.savingPerMonth, 0)} a month, ${rupees(result.savingPerYear, 0)} a year${result.paybackMonths !== undefined ? `. Switching pays back in about ${fmt(result.paybackMonths, 1)} months.` : ''}`}
              />
              <Meaning>
                {result.savingPerOrder > 0
                  ? `The proposed box saves ${rupees(result.savingPerOrder)} on each order: ${fmt(result.now.chargeableKg - result.proposed.chargeableKg, 2)} kg less chargeable weight${result.proposed.box > result.now.box ? ', even though the box itself costs more' : ''}.`
                  : 'With these numbers the proposed box does not save money. Check the chargeable weight: if the real weight sets the bill, a smaller box cannot lower it.'}
              </Meaning>
              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full min-w-[20rem] text-sm">
                  <caption className="px-4 pt-3 text-left label-mono text-muted-foreground">Where the cost goes, per order</caption>
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="px-4 py-2 font-medium">Item</th>
                      <th className="px-4 py-2 font-medium">Now</th>
                      <th className="px-4 py-2 font-medium">Proposed</th>
                    </tr>
                  </thead>
                  <tbody className="tabular">
                    {cost('Box', result.now.box, result.proposed.box)}
                    {cost('Tape, filler, label', result.now.extras, result.proposed.extras)}
                    {cost('Shipping', result.now.shipping, result.proposed.shipping)}
                    {cost('Expected damage', result.now.damage, result.proposed.damage)}
                    <tr className="border-t border-border font-semibold">
                      <td className="px-4 py-2">Total</td>
                      <td className="px-4 py-2">{rupees(result.now.total)}</td>
                      <td className="px-4 py-2">{rupees(result.proposed.total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                <p className="label-mono">Assumptions</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  <li>Billed weight is the larger of {fmt(num(packedKg), 2)} kg and volumetric (/{divisor}), rounded up to your {fmt(num(slab), 2)} kg slab.</li>
                  <li>Both boxes carry the same packed weight; a smaller box may weigh slightly less.</li>
                  <li>
                    Proposed box {formatDimensions(proposed, unit)}. Every rate and price is the one you typed.
                  </li>
                </ul>
              </div>
              <ToolHandoff
                slug={SLUG}
                toolName={NAME}
                dimsCm={proposed}
                ply={ply}
                qty={num(orders) > 0 ? num(orders) : undefined}
                summary={summary}
                note="Design the proposed box, or ask for an exact price at this size."
                designerLabel="Design the proposed box"
                quoteLabel="Quote this size"
              />
            </>
          ) : (
            <EmptyResult>Enter both box sizes to compare the cost per order.</EmptyResult>
          )
        }
      />
      <Disclaimer>Formulas only: every figure is yours and nothing is stored or sent. Courier rate cards differ, so confirm slabs and divisors with your courier.</Disclaimer>
    </div>
  );
}
