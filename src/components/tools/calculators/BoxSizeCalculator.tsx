/** /tools/box-size-calculator: product size (x quantity) + padding -> inside and outside box size, fill, next common size. */

import { useMemo, useState } from 'react';
import type { BoxDimensions, LengthUnit, PlyType } from '@/types/boxDesigner';
import { PADDING_PRESETS_MM, recommendBoxSize, USE_CASES, type UseCase } from '@/lib/tools/boxSize';
import { dimsText, fmt, parseNum } from '@/lib/tools/shared';
import { formatDimensions } from '@/lib/boxDesigner/units';
import ToolHandoff from '../ToolHandoff';
import { CalcShell, DimsFields, Disclaimer, EmptyResult, LengthField, Meaning, NumberField, Segmented, Stat, UnitBar, Warning, useCalculateTracker } from '../ToolKit';
import { Link } from 'react-router-dom';

const SLUG = 'box-size-calculator';
const NAME = 'Box Size Calculator';

export default function BoxSizeCalculator() {
  const [unit, setUnit] = useState<LengthUnit>('cm');
  const [product, setProduct] = useState<BoxDimensions>({ length: 20, width: 10, height: 5 });
  const [qty, setQty] = useState('1');
  const [paddingCm, setPaddingCm] = useState(1);
  const [ply, setPly] = useState<PlyType>('3-ply');
  const [useCase, setUseCase] = useState<UseCase>('mailer');
  const [weight, setWeight] = useState('');

  const result = useMemo(
    () => recommendBoxSize({ product, qty: parseNum(qty), paddingCm, ply, useCase, weightKg: parseNum(weight) }),
    [product, qty, paddingCm, ply, useCase, weight]
  );
  useCalculateTracker(SLUG, result ? `${result.inside.length}|${result.inside.width}|${result.inside.height}` : '');

  const qtyNum = parseNum(qty);
  const summary = result ? `Product ${dimsText(product)} x ${fmt(qtyNum, 0)} per box. Inside box size ${dimsText(result.inside)} (outside about ${dimsText(result.outside)}).` : '';
  const presetCm = PADDING_PRESETS_MM.map((mm) => mm / 10);

  return (
    <div className="space-y-6">
      <CalcShell
        inputs={
          <>
            <UnitBar unit={unit} onChange={setUnit} note="Product size in" />
            <DimsFields value={product} unit={unit} onChange={setProduct} />
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Products per box" value={qty} onChange={setQty} hint="1 to 120" />
              <NumberField label="Contents weight (optional)" value={weight} onChange={setWeight} suffix="kg" hint="Used to suggest a ply" />
            </div>
            <div>
              <Segmented
                label="Padding per side"
                value={presetCm.includes(paddingCm) ? paddingCm : -1}
                onChange={(v) => v > 0 && setPaddingCm(v)}
                options={[...PADDING_PRESETS_MM.map((mm) => ({ value: mm / 10, label: `${mm} mm` })), ...(presetCm.includes(paddingCm) ? [] : [{ value: -1, label: 'Custom' }])]}
              />
              <LengthField className="mt-3" label="Or type your own padding" cm={paddingCm} unit={unit} onChange={(v) => setPaddingCm(Number.isFinite(v) ? v : 0)} hint="Per side, also left between items" />
            </div>
            <Segmented label="Use" value={useCase} onChange={setUseCase} options={USE_CASES.map((u) => ({ value: u.id, label: u.label }))} />
            <Segmented label="Board" value={ply} onChange={setPly} options={[{ value: '3-ply', label: '3-ply' }, { value: '5-ply', label: '5-ply' }, { value: '7-ply', label: '7-ply' }]} />
          </>
        }
        results={
          result ? (
            <>
              <Stat
                label="Inside size (tell your box maker this)"
                value={formatDimensions(result.inside, unit)}
                tone="key"
                note="Length x width x height of the space for the product."
              />
              <Stat label="Outside size, approximate" value={formatDimensions(result.outside, unit)} note={`Adds ${fmt(result.caliperMm, 1)} mm board thickness on each side. Confirm with the mill.`} />
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Fill efficiency" value={`${fmt(result.fillPct, 0)}%`} note={result.fillPct < 40 ? 'Lots of empty space' : result.fillPct > 85 ? 'Very snug, check cushioning' : 'A sensible fit'} />
                <Stat label="Volumetric weight (/5000)" value={`${fmt(result.volumetricKg5000, 2)} kg`} note="Outside size, a teaser" />
              </div>
              <Meaning>
                {fmt(qtyNum, 0)} product{qtyNum > 1 ? 's' : ''} packed {result.arrangement.nx} x {result.arrangement.ny} x {result.arrangement.nz} with {fmt(paddingCm * 10, 0)} mm padding.
                {result.nearestCommon ? ` The next round size up on our starter list is ${formatDimensions(result.nearestCommon, unit)}.` : ''}
                {result.suggestedPly ? ` For that weight, ${result.suggestedPly} is the lightest board we would suggest.` : ''}
              </Meaning>
              <Warning>
                Inside and outside are different. Say &quot;inside size&quot; when you order.{' '}
                <Link to="/blogs/box-measurements-guide" className="underline underline-offset-2">
                  How to measure a box
                </Link>
              </Warning>
              <ToolHandoff
                slug={SLUG}
                toolName={NAME}
                dimsCm={result.inside}
                ply={ply}
                style={result.style}
                qty={undefined}
                summary={summary}
                note={`Open ${formatDimensions(result.inside, unit)} as a ${USE_CASES.find((u) => u.id === useCase)?.label.toLowerCase()} in 3D.`}
              />
            </>
          ) : (
            <EmptyResult>Enter the product size (and 1 to 120 products per box) to get the box size.</EmptyResult>
          )
        }
      />
      <Disclaimer>Padding needs depend on the product; test a sample. Board thickness is approximate. The starter list of common sizes is not a published standard.</Disclaimer>
    </div>
  );
}
