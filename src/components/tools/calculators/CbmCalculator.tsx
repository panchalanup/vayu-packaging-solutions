/** /tools/cbm-calculator: carton size + quantity -> CBM, cartons per pallet, cartons per container (volume, layout, weight limits). */

import { useMemo, useState } from 'react';
import type { BoxDimensions, LengthUnit } from '@/types/boxDesigner';
import { assessLoading, CONTAINERS, DEFAULT_PALLET_LOAD_HEIGHT_CM, DEFAULT_USABLE_PCT, PALLET_PRESETS } from '@/lib/tools/cbm';
import { dimsText, fmt, parseNum } from '@/lib/tools/shared';
import ToolHandoff from '../ToolHandoff';
import { CalcShell, DimsFields, Disclaimer, EmptyResult, Meaning, NumberField, Segmented, Stat, UnitBar, useCalculateTracker } from '../ToolKit';

const SLUG = 'cbm-calculator';
const NAME = 'CBM and Container Loading Calculator';
const LIMIT_TEXT = { volume: 'usable volume', layout: 'the floor layout', weight: 'payload weight' } as const;

export default function CbmCalculator() {
  const [unit, setUnit] = useState<LengthUnit>('cm');
  const [carton, setCarton] = useState<BoxDimensions>({ length: 50, width: 40, height: 30 });
  const [qty, setQty] = useState('500');
  const [gross, setGross] = useState('');
  const [containerId, setContainerId] = useState<string>(CONTAINERS[0].id);
  const [usable, setUsable] = useState(String(DEFAULT_USABLE_PCT));
  const [payload, setPayload] = useState('');
  const [palletId, setPalletId] = useState<string>(PALLET_PRESETS[0].id);
  const [loadHeight, setLoadHeight] = useState(String(DEFAULT_PALLET_LOAD_HEIGHT_CM));

  const container = CONTAINERS.find((c) => c.id === containerId) ?? CONTAINERS[0];
  const pallet = PALLET_PRESETS.find((p) => p.id === palletId) ?? PALLET_PRESETS[0];
  const payloadKg = Number.isFinite(parseNum(payload)) ? parseNum(payload) : container.payloadKg;

  const result = useMemo(() => {
    const height = parseNum(loadHeight);
    return assessLoading({
      carton,
      qty: parseNum(qty),
      grossKg: parseNum(gross),
      container: { internalCm: container.internalCm, payloadKg },
      usablePct: parseNum(usable),
      pallet: { lengthMm: pallet.lengthMm, widthMm: pallet.widthMm, maxLoadHeightCm: Number.isFinite(height) ? height : DEFAULT_PALLET_LOAD_HEIGHT_CM },
    });
  }, [carton, qty, gross, container, payloadKg, usable, pallet, loadHeight]);
  useCalculateTracker(SLUG, result ? `${result.cbmPerCarton.toFixed(4)}|${result.container.perContainer}|${container.id}` : '');

  const c = result?.container;
  const p = result?.pallet;
  const summary = result && c
    ? `Carton ${dimsText(carton)} = ${fmt(result.cbmPerCarton, 3)} CBM; ${fmt(parseNum(qty), 0)} cartons = ${fmt(result.totalCbm, 2)} CBM. About ${fmt(c.perContainer, 0)} cartons per ${container.name} container.`
    : '';

  return (
    <div className="space-y-6">
      <CalcShell
        inputs={
          <>
            <UnitBar unit={unit} onChange={setUnit} note="Carton size (outside) in" />
            <DimsFields value={carton} unit={unit} onChange={setCarton} />
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Number of cartons" value={qty} onChange={setQty} />
              <NumberField label="Gross weight per carton (optional)" value={gross} onChange={setGross} suffix="kg" />
            </div>
            <Segmented label="Container" value={containerId} onChange={setContainerId} options={CONTAINERS.map((x) => ({ value: x.id, label: x.name }))} />
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Usable volume" value={usable} onChange={setUsable} suffix="%" hint="Gaps and door space" />
              <NumberField label="Payload limit" value={payload} onChange={setPayload} suffix="kg" placeholder={String(container.payloadKg)} hint="Confirm with your forwarder" />
            </div>
            <Segmented label="Pallet" value={palletId} onChange={setPalletId} options={PALLET_PRESETS.map((x) => ({ value: x.id, label: x.name }))} />
            <NumberField label="Max load height above the pallet" value={loadHeight} onChange={setLoadHeight} suffix="cm" />
          </>
        }
        results={
          result && c && p ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="CBM per carton" value={fmt(result.cbmPerCarton, 4)} note="L x W x H / 1,000,000" />
                <Stat label="Total CBM" value={fmt(result.totalCbm, 2)} tone="key" note={`${fmt(parseNum(qty), 0)} cartons`} />
              </div>
              <Stat
                label={`Cartons in one ${container.name} container`}
                value={fmt(c.perContainer, 0)}
                tone="key"
                note={`Limited by ${LIMIT_TEXT[c.limitedBy]}. Fills about ${fmt(c.fillPct, 0)}% of the container.`}
              />
              <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
                <p className="rounded-lg bg-paper-100 p-2">
                  By volume
                  <span className="block font-semibold tabular text-foreground">{fmt(c.byVolume, 0)}</span>
                </p>
                <p className="rounded-lg bg-paper-100 p-2">
                  By layout
                  <span className="block font-semibold tabular text-foreground">{fmt(c.byLayout.count, 0)}</span>
                </p>
                <p className="rounded-lg bg-paper-100 p-2">
                  By weight
                  <span className="block font-semibold tabular text-foreground">{c.byWeight !== undefined ? fmt(c.byWeight, 0) : 'add weight'}</span>
                </p>
              </div>
              <Meaning>
                {c.containersNeeded <= 1
                  ? `Your ${fmt(parseNum(qty), 0)} cartons fit in one ${container.name} container on these assumptions.`
                  : `You would need about ${fmt(c.containersNeeded, 0)} ${container.name} containers for ${fmt(parseNum(qty), 0)} cartons.`}{' '}
                Layout: {fmt(c.byLayout.perLayer, 0)} per layer, {fmt(c.byLayout.layers, 0)} layers, standing {fmt(c.byLayout.upright, 1)} cm up.
              </Meaning>
              <div className="rounded-xl border border-border bg-card p-4 text-sm">
                <p className="label-mono text-muted-foreground">On a {pallet.name} pallet</p>
                <p className="mt-1">
                  <span className="font-display text-2xl tabular">{fmt(p.cartonsPerPallet, 0)}</span> cartons per pallet ({fmt(p.layout.perLayer, 0)} per layer x {fmt(p.layout.layers, 0)} layers)
                </p>
                <p className="mt-1 text-muted-foreground">
                  {p.palletWeightKg !== undefined ? `About ${fmt(p.palletWeightKg, 0)} kg of cartons per pallet. ` : ''}
                  About {fmt(p.palletsPerContainer, 0)} pallets in one {container.name} container, so {fmt(p.cartonsPerContainer, 0)} cartons palletised. You need about {fmt(p.palletsNeeded, 0)} pallets.
                </p>
              </div>
              <ToolHandoff
                slug={SLUG}
                toolName={NAME}
                dimsCm={carton}
                qty={parseNum(qty)}
                ply="5-ply"
                summary={summary}
                note="Open this carton in the designer and resize it to fit more per layer or per pallet."
                designerLabel="Resize this carton in 3D"
              />
            </>
          ) : (
            <EmptyResult>Enter the carton size and quantity to see CBM and loading.</EmptyResult>
          )
        }
      />
      <Disclaimer>
        A planning estimate: identical cartons in layers on a flat floor, not 3D bin-packing. Container sizes and payloads are typical starting points that you can edit. Confirm with your freight forwarder before you book.
      </Disclaimer>
    </div>
  );
}
