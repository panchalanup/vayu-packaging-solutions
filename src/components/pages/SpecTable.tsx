/** Product spec table: a real <table> with row headers (<th scope="row">) so screen readers read "label, value". */

import type { SpecRow } from '@/content/products';
import { cn } from '@/lib/utils';

interface SpecTableProps {
  rows: readonly SpecRow[];
  /** Visually hidden table title for assistive tech */
  caption: string;
  className?: string;
}

const isPending = (value: string) => /on request/i.test(value);

export function SpecTable({ rows, caption, className }: SpecTableProps) {
  return (
    <div className={cn('overflow-hidden rounded-[14px] border border-border bg-card', className)}>
      <table className="w-full border-collapse text-left text-sm md:text-base">
        <caption className="sr-only">{caption}</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Specification</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-border last:border-b-0">
              <th
                scope="row"
                className="label-mono w-[42%] px-4 py-3.5 text-left align-baseline text-muted-foreground sm:w-[38%] md:px-5"
              >
                {row.label}
              </th>
              <td
                className={cn(
                  'px-4 py-3.5 align-baseline font-semibold md:px-5',
                  isPending(row.value) && 'font-medium text-muted-foreground'
                )}
              >
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
