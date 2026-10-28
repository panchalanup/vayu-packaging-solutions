/** /tools/box-weight-calculator: RSC blank size, weight per box from GSM and flute take-up, paper cost from the person's own rates. */

import { useMemo, useState } from 'react';
import type { BoxDimensions, FluteType, LengthUnit, PlyType } from '@/types/boxDesigner';
import { assessBoxWeight, DEFAULT_JOINT_MM, defaultLayers, FLUTE_TAKE_UP, type PaperLayer } from '@/lib/tools/boxWeight';
import { dimsText, fmt, parseNum, rupees } from '@/lib/tools/shared';
import ToolHandoff from '../ToolHandoff';
import { CalcShell, DimsFields, Disclaimer, EmptyResult, Meaning, NumberField, Segmented, Stat, UnitBar, Warning, useCalculateTracker } from '../ToolKit';

const SLUG = 'box-weight-calculator';
const NAME = 'Corrugated Box Weight and Paper Cost Calculator';
const FLUTES: FluteType[] = ['A', 'B', 'C', 'E', 'F'];

interface LayerRow {
  label: string;
  kind: 'liner' | 'medium';
  gsm: string;
  rate: string;
  flute?: FluteType;
  takeUp: string;
}

const rowsFor = (ply: PlyType): LayerRow[] =>
  defaultLayers(ply).map((l) => ({ label: l.label, kind: l.kind, gsm: String(l.gsm), rate: '', flute: l.flute, takeUp: String(l.takeUp) }));

export default function BoxWeightCalculator() {
  const [unit, setUnit] = useState<LengthUnit>('mm');
  const [dims, setDims] = useState<BoxDimensions>({ length: 40, width: 30, height: 25 });
  const [ply, setPly] = useState<PlyType>('3-ply');
  const [rows, setRows] = useState<LayerRow[]>(() => rowsFor('3-ply'));
  const [joint, setJoint] = useState(String(DEFAULT_JOINT_MM));
  const [qty, setQty] = useState('1000');
  const [addOn, setAddOn] = useState('');

  const pickPly = (p: PlyType) => {
    setPly(p);
    setRows(rowsFor(p));
  };
  const update = (i: number, patch: Partial<LayerRow>) => setRows((cur) => cur.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const layers: PaperLayer[] = rows.map((r) => ({
    kind: r.kind,
    label: r.label,
    gsm: parseNum(r.gsm),
    flute: r.flute,
    takeUp: r.kind === 'liner' ? 1 : parseNum(r.takeUp),
    ratePerKg: parseNum(r.rate),
  }));

  const result = useMemo(
    () =>
      assessBoxWeight({
        lengthMm: dims.length * 10,
        widthMm: dims.width * 10,
        heightMm: dims.height * 10,
        jointMm: parseNum(joint),
        layers,
        qty: parseNum(qty),
        addOnPerBox: parseNum(addOn),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dims, rows, joint, qty, addOn]
  );
  useCalculateTracker(SLUG, result ? `${Math.round(result.weightG)}|${result.totalPerBox ? Math.round(result.totalPerBox * 100) : ''}` : '');

  const qtyNum = parseNum(qty);
  const summary = result
    ? `Box ${dimsText(dims)} in ${ply}: blank ${fmt(result.blankLengthMm, 0)} x ${fmt(result.blankWidthMm, 0)} mm, about ${fmt(result.weightG, 0)} g per box${result.totalPerBox ? `, paper cost ${rupees(result.totalPerBox)} per box` : ''}. Quantity ${fmt(qtyNum, 0)}.`
    : '';

  const selectClass = 'h-11 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <div className="space-y-6">
      <CalcShell
        inputs={
          <>
            <UnitBar unit={unit} onChange={setUnit} note="Box size (regular slotted carton) in" />
            <DimsFields value={dims} unit={unit} onChange={setDims} />
            <Segmented label="Ply" value={ply} onChange={pickPly} options={[{ value: '3-ply', label: '3-ply' }, { value: '5-ply', label: '5-ply' }, { value: '7-ply', label: '7-ply' }]} />
            <div>
              <p className="text-sm font-medium">Paper layers, outside to inside</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Starting GSM values are examples and take-up values are typical ranges: replace them with your paper. Rates start empty.</p>
              <ul className="mt-3 space-y-3">
                {rows.map((r, i) => (
                  <li key={`${ply}-${i}`} className="rounded-xl border border-border p-3">
                    <p className="text-sm font-medium">{r.label}</p>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <NumberField label="GSM" value={r.gsm} onChange={(v) => update(i, { gsm: v })} suffix="g/m2" />
                      <NumberField label="Paper rate" value={r.rate} onChange={(v) => update(i, { rate: v })} suffix="Rs/kg" placeholder="your rate" />
                      {r.kind === 'medium' && r.flute && (
                        <>
                          <div>
                            <label className="text-sm" htmlFor={`flute-${ply}-${i}`}>
                              Flute
                            </label>
                            <select
                              id={`flute-${ply}-${i}`}
                              className={`${selectClass} mt-1.5`}
                              value={r.flute}
                              onChange={(e) => {
                                const flute = e.target.value as FluteType;
                                update(i, { flute, takeUp: String(FLUTE_TAKE_UP[flute]) });
                              }}
                            >
                              {FLUTES.map((f) => (
                                <option key={f} value={f}>
                                  {f} flute
                                </option>
                              ))}
                            </select>
                          </div>
                          <NumberField label="Take-up factor" value={r.takeUp} onChange={(v) => update(i, { takeUp: v })} />
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <NumberField label="Joint" value={joint} onChange={setJoint} suffix="mm" />
              <NumberField label="Quantity" value={qty} onChange={setQty} />
              <NumberField label="Add-on per box" value={addOn} onChange={setAddOn} suffix="Rs" hint="Print, conversion" />
            </div>
          </>
        }
        results={
          result ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Weight per box" value={`${fmt(result.weightG, 0)} g`} tone="key" note={`${fmt(result.areaM2, 3)} m2 of board`} />
                <Stat label="Blank size" value={`${fmt(result.blankLengthMm, 0)} x ${fmt(result.blankWidthMm, 0)} mm`} note="Length x width of the flat sheet" />
              </div>
              {qtyNum > 0 && (
                <Stat label={`Paper for ${fmt(qtyNum, 0)} boxes`} value={`${fmt((result.weightG * qtyNum) / 1000, 1)} kg`} note={`${fmt(result.areaM2 * qtyNum, 1)} m2 of board`} />
              )}
              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full min-w-[18rem] text-sm">
                  <caption className="px-4 pt-3 text-left label-mono text-muted-foreground">Per layer, per box</caption>
                  <tbody className="tabular">
                    {result.layers.map((l, i) => (
                      <tr key={`${l.label}-${i}`} className="border-t border-border first:border-t-0">
                        <td className="px-4 py-2">{l.label}</td>
                        <td className="px-4 py-2">{fmt(l.grams, 1)} g</td>
                        <td className="px-4 py-2">{l.cost !== undefined ? rupees(l.cost) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {result.totalPerBox !== undefined && result.paperCostPerBox !== undefined ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Stat label="Paper cost per box" value={rupees(result.paperCostPerBox)} note={parseNum(addOn) > 0 ? `${rupees(result.totalPerBox)} with your add-on` : 'Paper only'} />
                    <Stat label="Order total" value={rupees(result.orderTotal ?? 0, 0)} tone="key" note={`${fmt(result.perKgFinished ?? 0, 1)} Rs per kg of box`} />
                  </div>
                  <Meaning>This is paper cost from the rates you typed. Wastage, conversion, tooling, printing and margin are not included, so it is not a price quote.</Meaning>
                </>
              ) : (
                <Warning>Type a paper rate (Rs per kg) for every layer to see the cost. We do not assume any rates.</Warning>
              )}
              <ToolHandoff
                slug={SLUG}
                toolName={NAME}
                dimsCm={dims}
                ply={ply}
                qty={qtyNum}
                summary={summary}
                note="Send this spec to Vayu, or open the box in 3D."
                designerLabel="See this box in 3D"
                quoteLabel="Send this spec for a quote"
              />
            </>
          ) : (
            <EmptyResult>Enter the box size and check every layer has a GSM above zero.</EmptyResult>
          )
        }
      />
      <Disclaimer>
        Regular slotted carton blank only: other styles need other blanks. Take-up factors and example GSM values are typical ranges, not any mill&apos;s figures. This is paper weight and paper cost, not a price.
      </Disclaimer>
    </div>
  );
}
