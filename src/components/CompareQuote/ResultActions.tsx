/**
 * Result actions: Request this quote (-> /quote, pre-filled), WhatsApp to Vayu, Open in 3D (when the size is known).
 * SECURITY: hrefs come from quoteHref / whatsappHref / designerHref, which allow-list or encode every value.
 * Analytics carry the board and category only (no product name, no personal data).
 */

import type { ScoredResult, UserInput } from '@/types/packaging';
import { Cta } from '@/components/site/Cta';
import { useEventTracker } from '@/hooks/useAnalytics';
import { quoteHref } from '@/lib/quotePrefill';
import { whatsappHref } from '@/lib/contactLinks';
import { designerHref } from '@/lib/finderPrefill';
import { formatInr } from './pricing';

interface ResultActionsProps {
  result: ScoredResult;
  input: UserInput;
  /** Unique per placement, e.g. "card-1" or "sheet-1" */
  slot: string;
  /** "stack" fits a narrow card; "row" fits a wide sheet */
  layout?: 'stack' | 'row';
  className?: string;
}

export function ResultActions({ result, input, slot, layout = 'stack', className }: ResultActionsProps) {
  const { trackEvent } = useEventTracker();
  const ply = result.board_type;
  const category = result.product_category;

  const request = quoteHref({
    product: ply,
    qty: input.quantity,
    l: input.length_mm,
    w: input.width_mm,
    h: input.height_mm,
    src: 'finder.result',
  });

  const message = `Hi Vayu, I used the Packaging Finder: ${ply} ${result.box_style} for ${input.product_name}, ${input.quantity} units, indicative ${formatInr(
    result.estimated_price_inr
  )} per unit. Please confirm and share a quote.`;

  // VERIFY-LATER[FINDER-02]: the entered size is the PRODUCT size; the 3D designer takes the box INSIDE size. Using it as a starting point only.
  const open3d = designerHref(input, ply as '3-ply' | '5-ply' | '7-ply');

  return (
    <div className={className}>
      <Cta
        id={`finder.result.${slot}.quote`}
        intent="quote"
        href={request}
        meta={{ ply, category }}
        arrow
        className="w-full"
        onClick={() => trackEvent('finder_request_quote', { ply, category })}
      >
        Request this quote
      </Cta>
      <div className={layout === 'row' ? 'mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2' : 'mt-2 grid grid-cols-1 gap-2'}>
        <Cta id={`finder.result.${slot}.whatsapp`} intent="whatsapp" variant="whatsapp" href={whatsappHref(message)} meta={{ ply, category }} className="w-full">
          Send on WhatsApp
        </Cta>
        {open3d && (
          <Cta id={`finder.result.${slot}.3d`} intent="designer" variant="secondary" href={open3d} meta={{ ply }} className="w-full">
            Open in 3D
          </Cta>
        )}
      </div>
    </div>
  );
}
