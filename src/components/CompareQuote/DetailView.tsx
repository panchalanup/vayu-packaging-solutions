import type { ReactNode } from 'react';
import type { ScoredResult, UserInput } from '@/types/packaging';
import { Separator } from '@/components/ui/separator';
import { ExportButtons } from './ExportButtons';
import { ResultActions } from './ResultActions';
import { PRICE_NOTE, formatInr } from './pricing';

interface DetailViewProps {
  result: ScoredResult;
  input: UserInput;
  index: number;
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="label-mono mb-3 text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

function Rows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="space-y-2 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="text-right font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DetailView({ result, input, index }: DetailViewProps) {
  const totalCost = result.estimated_price_inr * input.quantity;

  return (
    <div className="space-y-6 py-6">
      <ResultActions result={result} input={input} slot={`sheet-${index + 1}`} layout="row" />

      <Separator />

      <Block title="Export">
        <ExportButtons result={result} input={input} />
      </Block>

      <Separator />

      <Block title="Closest reference product">
        <Rows
          rows={[
            ['Your product', input.product_name],
            ['Quantity', `${input.quantity.toLocaleString('en-IN')} units`],
            ['Weight', `${result.product_weight_kg} kg`],
            ['Size', `${result.product_length_mm} × ${result.product_width_mm} × ${result.product_height_mm} mm`],
            ['Fragility', result.fragility_level],
            ['Transport', result.transport_type],
          ]}
        />
        <p className="mt-2 text-xs text-muted-foreground">Weight and size are those of the matched database entry, shown for reference. Fragility is its rating.</p>
      </Block>

      <Separator />

      <Block title="Box specification">
        <Rows
          rows={[
            ['Box style', result.box_style],
            ['Board', result.board_type],
            ['Flute', result.flute_type],
            ['Liner GSM', result.liner_gsm],
            ['Fluting GSM', result.fluting_gsm],
            ['Total GSM (est.)', result.liner_gsm + result.fluting_gsm],
          ]}
        />
      </Block>

      <Separator />

      <Block title="Strength">
        <Rows
          rows={[
            ['Edge crush test (ECT)', `${result.ECT_lb_per_in} lb/in`],
            ['Burst strength', `${result.burst_strength_kg_cm2} kg/cm²`],
          ]}
        />
        <p className="mt-2 text-xs text-muted-foreground">Higher ECT means better stacking strength and compression resistance.</p>
      </Block>

      <Separator />

      <Block title="Protection & accessories">
        <Rows
          rows={[
            ['Internal protection', result.internal_protection],
            ['Tape', result.tape_type],
            ['Strapping', result.strapping_type],
            ['Extras', result.extra_packaging],
          ]}
        />
      </Block>

      <Separator />

      <Block title="Indicative pricing">
        <div className="space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-sm text-muted-foreground">Per unit</span>
            <span className="tabular font-display text-h3">{formatInr(result.estimated_price_inr)}</span>
          </div>
          <div className="flex items-baseline justify-between gap-4 rounded-lg bg-paper-100 p-3">
            <span className="text-sm font-semibold">Total for {input.quantity.toLocaleString('en-IN')} units</span>
            <span className="tabular font-display text-h3">{formatInr(totalCost)}</span>
          </div>
          <p className="text-xs text-muted-foreground">{PRICE_NOTE} Taxes and freight are not included.</p>
        </div>
      </Block>

      <Separator />

      <Block title="Why this match">
        <Rows
          rows={[
            ['Protection score', `${result.protection_score.toFixed(0)}/100`],
            ['Fit score', `${result.fit_score.toFixed(0)}/100`],
            ['Cost score', `${result.cost_score.toFixed(0)}/100`],
            ['Overall', `${result.score.toFixed(1)}/100`],
          ]}
        />
      </Block>
    </div>
  );
}
