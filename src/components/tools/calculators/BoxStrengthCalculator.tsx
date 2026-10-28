/** /tools/box-strength-calculator: simplified McKee BCT, safe load, boxes high, and a 3 / 5 / 7-ply comparison. Indicative only. */

import { useMemo, useState } from 'react';
import type { BoxDimensions, LengthUnit, PlyType } from '@/types/boxDesigner';
import {
  comparePlies,
  DEFAULT_OPENINGS_PENALTY_PCT,
  ectKnmToLbIn,
  ectLbInToKnm,
  estimateStrength,
  HUMID_SAFETY_FACTOR,
  plyBoard,
  SAFETY_FACTORS,
  STACK_SAFETY_FACTOR,
} from '@/lib/tools/boxStrength';
import { dimsText, fmt, parseNum, round } from '@/lib/tools/shared';
import ToolHandoff from '../ToolHandoff';
import { CalcShell, DimsFields, Disclaimer, EmptyResult, Meaning, NumberField, Segmented, Stat, UnitBar, Warning, useCalculateTracker } from '../ToolKit';

const SLUG = 'box-strength-calculator';
const NAME = 'Box Compression Strength Calculator';
type BoardChoice = PlyType | 'custom';
type EctUnit = 'knm' | 'lbin';

const RATING_TEXT = {
  strong: 'a strong stack for this box',
  good: 'a reasonable stack',
  light: 'a low stack: consider a stronger board or a lighter load',
} as const;

export default function BoxStrengthCalculator() {
  const [unit, setUnit] = useState<LengthUnit>('cm');
  const [dims, setDims] = useState<BoxDimensions>({ length: 40, width: 30, height: 30 });
  const [board, setBoard] = useState<BoardChoice>('5-ply');
  const [ectUnit, setEctUnit] = useState<EctUnit>('knm');
  const [ect, setEct] = useState(String(plyBoard('5-ply').ectKnm));
  const [caliper, setCaliper] = useState(String(plyBoard('5-ply').caliperMm));
  const [safety, setSafety] = useState<number>(STACK_SAFETY_FACTOR);
  const [humid, setHumid] = useState(false);
  const [openings, setOpenings] = useState(false);
  const [penalty, setPenalty] = useState(String(DEFAULT_OPENINGS_PENALTY_PCT));
  const [weight, setWeight] = useState('10');

  const pickBoard = (b: BoardChoice) => {
    setBoard(b);
    if (b !== 'custom') {
      const preset = plyBoard(b);
      setEct(String(ectUnit === 'knm' ? preset.ectKnm : round(ectKnmToLbIn(preset.ectKnm), 1)));
      setCaliper(String(preset.caliperMm));
    }
  };
  const changeEctUnit = (next: EctUnit) => {
    const n = parseNum(ect);
    if (Number.isFinite(n)) setEct(String(round(next === 'lbin' ? ectKnmToLbIn(n) : ectLbInToKnm(n), next === 'lbin' ? 1 : 2)));
    setEctUnit(next);
  };
  const toggleHumid = (v: boolean) => {
    setHumid(v);
    setSafety(v ? HUMID_SAFETY_FACTOR : STACK_SAFETY_FACTOR);
  };

  const ectNum = parseNum(ect);
  const ectKnm = ectUnit === 'knm' ? ectNum : ectLbInToKnm(ectNum);
  const penaltyPct = openings ? (Number.isFinite(parseNum(penalty)) ? parseNum(penalty) : 0) : 0;
  const input = { inside: dims, safetyFactor: safety, boxWeightKg: parseNum(weight), penaltyPct };

  const result = useMemo(
    () => estimateStrength({ ...input, ectKnm, caliperMm: parseNum(caliper) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dims, safety, weight, penaltyPct, ectKnm, caliper]
  );
  const rows = useMemo(
    () => comparePlies(input),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dims, safety, weight, penaltyPct]
  );
  useCalculateTracker(SLUG, result ? `${Math.round(result.bctKgf)}|${result.stackHigh ?? ''}` : '');

  const plyForLink: PlyType = board === 'custom' ? '5-ply' : board;
  const summary = result
    ? `Box ${dimsText(dims)}, estimated compression strength about ${fmt(result.bctKgf, 0)} kgf, safe load about ${fmt(result.allowableKg, 0)} kg${result.stackHigh ? `, about ${result.stackHigh} boxes high at ${fmt(parseNum(weight), 1)} kg each` : ''} (indicative).`
    : '';

  return (
    <div className="space-y-6">
      <CalcShell
        inputs={
          <>
            <UnitBar unit={unit} onChange={setUnit} note="Box inside size in" />
            <DimsFields value={dims} unit={unit} onChange={setDims} />
            <Segmented
              label="Board"
              value={board}
              onChange={pickBoard}
              options={[
                { value: '3-ply', label: '3-ply' },
                { value: '5-ply', label: '5-ply' },
                { value: '7-ply', label: '7-ply' },
                { value: 'custom', label: 'My own board' },
              ]}
            />
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="Edge crush strength (ECT)"
                value={ect}
                onChange={(v) => {
                  setEct(v);
                  setBoard('custom');
                }}
                suffix={ectUnit === 'knm' ? 'kN/m' : 'lb/in'}
              />
              <NumberField
                label="Board thickness"
                value={caliper}
                onChange={(v) => {
                  setCaliper(v);
                  setBoard('custom');
                }}
                suffix="mm"
              />
            </div>
            <Segmented label="ECT unit" value={ectUnit} onChange={changeEctUnit} options={[{ value: 'knm', label: 'kN/m' }, { value: 'lbin', label: 'lb/in' }]} />
            <p className="-mt-2 text-xs text-muted-foreground">3, 5 and 7-ply fill in typical values for our boards (indicative); type your own if you have the mill&apos;s figures.</p>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Weight of one filled box" value={weight} onChange={setWeight} suffix="kg" />
              <Segmented label="Safety factor" value={safety} onChange={setSafety} options={SAFETY_FACTORS.map((s) => ({ value: s, label: String(s) }))} />
            </div>
            <div className="space-y-3 rounded-xl bg-paper-100 p-3 text-sm">
              <label className="flex items-start gap-2.5">
                <input type="checkbox" checked={humid} onChange={(e) => toggleHumid(e.target.checked)} className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]" />
                <span>Humid or long storage (uses a safety factor of {HUMID_SAFETY_FACTOR})</span>
              </label>
              <label className="flex items-start gap-2.5">
                <input type="checkbox" checked={openings} onChange={(e) => setOpenings(e.target.checked)} className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]" />
                <span>Vents or hand holes in the walls</span>
              </label>
              {openings && <NumberField label="Strength lost to openings (editable guess)" value={penalty} onChange={setPenalty} suffix="%" hint="Often quoted between 10 and 40%, depending on size and position" />}
            </div>
          </>
        }
        results={
          result ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Estimated BCT" value={`${fmt(result.bctKgf, 0)} kgf`} tone="key" note={`${fmt(result.bctN, 0)} N, ${fmt(result.bctLbf, 0)} lbf`} />
                <Stat label="Safe load on the bottom box" value={`${fmt(result.allowableKg, 0)} kg`} note={`After the safety factor of ${safety}${penaltyPct ? ` and ${fmt(penaltyPct, 0)}% for openings` : ''}`} />
              </div>
              {result.stackHigh !== undefined ? (
                <Stat
                  label={`Boxes you can stack at ${fmt(parseNum(weight), 1)} kg each`}
                  value={`${result.stackHigh} high`}
                  tone={result.rating === 'light' ? 'warn' : 'key'}
                  note={`${result.rating ? RATING_TEXT[result.rating] : ''}. ${result.stackLimitedBy === 'height' ? 'Limited by reachable height, not by the board.' : 'Limited by the load the bottom box can take.'}`}
                />
              ) : (
                <Warning>Add the weight of one filled box to see how many you can stack.</Warning>
              )}
              <Meaning>
                The bottom box can safely carry about {fmt(result.allowableKg, 0)} kg of boxes above it
                {result.stackHigh !== undefined ? `, so up to ${result.stackHigh - 1} boxes on top of it` : ''}. This is the simplified McKee estimate: a guide, not a rating.
              </Meaning>
              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full min-w-[20rem] text-sm">
                  <caption className="px-4 pt-3 text-left label-mono text-muted-foreground">The same box in 3, 5 and 7-ply</caption>
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="px-4 py-2 font-medium">Board</th>
                      <th className="px-4 py-2 font-medium">BCT</th>
                      <th className="px-4 py-2 font-medium">Safe load</th>
                      <th className="px-4 py-2 font-medium">Stack</th>
                    </tr>
                  </thead>
                  <tbody className="tabular">
                    {rows.map((r) => (
                      <tr key={r.ply} className="border-t border-border">
                        <td className="px-4 py-2">{r.ply}</td>
                        <td className="px-4 py-2">{fmt(r.bctKgf, 0)} kgf</td>
                        <td className="px-4 py-2">{fmt(r.allowableKg, 0)} kg</td>
                        <td className="px-4 py-2">{r.stackHigh !== undefined ? `${r.stackHigh} high` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ToolHandoff
                slug={SLUG}
                toolName={NAME}
                dimsCm={{ length: dims.length, width: dims.width, height: dims.height }}
                ply={plyForLink}
                summary={summary}
                note="Open this box in 3D and compare the ply options."
                designerLabel="See ply options in 3D"
              />
            </>
          ) : (
            <EmptyResult>Enter the box length and width, and a board (or your own ECT and thickness).</EmptyResult>
          )
        }
      />
      <Disclaimer>
        Indicative only. The simplified McKee formula is a quick estimate, not a rating. Humidity, time under load, pallet pattern, print and handling all change real strength. Confirm with a lab compression test before a large order.
      </Disclaimer>
    </div>
  );
}
