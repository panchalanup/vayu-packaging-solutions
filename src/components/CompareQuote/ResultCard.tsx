/** One recommended spec. Prices are labelled "Indicative" everywhere (§9.8). */

import { Check, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScoredResult, UserInput } from '@/types/packaging';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ConfidenceBadge } from './ConfidenceBadge';
import { DetailView } from './DetailView';
import { ResultActions } from './ResultActions';
import { formatInr } from './pricing';

interface ResultCardProps {
  result: ScoredResult;
  input: UserInput;
  index: number;
}

const LABEL_STYLE: Record<ScoredResult['label'], string> = {
  'Best Protection': 'bg-ink-900 text-paper-50',
  'Best Value': 'bg-green-600 text-white',
  Economy: 'bg-kraft-300 text-ink-900',
};

export function ResultCard({ result, input, index }: ResultCardProps) {
  const specs: [string, string][] = [
    ['Box style', result.box_style],
    ['Board', `${result.board_type} · ${result.flute_type} flute`],
    ['Strength', `ECT ${result.ECT_lb_per_in} lb/in`],
    ['Protection', result.internal_protection],
    ['Tape', result.tape_type],
  ];
  if (result.strapping_type !== 'None') specs.push(['Strapping', result.strapping_type]);
  if (result.extra_packaging !== 'None') specs.push(['Extras', result.extra_packaging]);

  return (
    <article className="flex h-full flex-col rounded-lg border border-border bg-card p-5 md:p-6" aria-label={`${result.label}: ${result.board_type} ${result.box_style}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={cn('rounded-md px-2.5 py-1 text-xs font-semibold', LABEL_STYLE[result.label])}>{result.label}</span>
        <ConfidenceBadge confidence={result.confidence} />
      </div>

      <div className="mt-5">
        <p className="label-mono text-muted-foreground">Indicative price · per unit</p>
        <p className="tabular mt-1 font-display text-h2">{formatInr(result.estimated_price_inr)}</p>
        <p className="tabular mt-1 text-sm text-muted-foreground">
          About {formatInr(result.estimated_price_inr * input.quantity)} for {input.quantity.toLocaleString('en-IN')} units
        </p>
      </div>

      <dl className="mt-5 divide-y divide-border border-y border-border text-sm">
        {specs.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 py-2">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-4 space-y-2 text-sm">
        <li className="flex items-start gap-2">
          <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <span>
            <span className="sr-only">Pro: </span>
            {result.pros}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <TriangleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-warning-700" />
          <span>
            <span className="sr-only">Con: </span>
            {result.cons}
          </span>
        </li>
      </ul>

      {result.reasons.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
          {result.reasons.slice(0, 2).map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-6">
        <ResultActions result={result} input={input} slot={`card-${index + 1}`} />
        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              View full specification
            </button>
          </SheetTrigger>
          <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
            <SheetHeader>
              <SheetTitle className="font-display">Packaging specification</SheetTitle>
              <SheetDescription>Complete details and supplier-ready exports.</SheetDescription>
            </SheetHeader>
            <DetailView result={result} input={input} index={index} />
          </SheetContent>
        </Sheet>
      </div>
    </article>
  );
}
