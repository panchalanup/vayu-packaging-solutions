/**
 * The conversion block under every calculator result: see the box in 3D, get a quote for this size, WhatsApp,
 * plus copy / share of the result text. Links carry the size and src=tools.<slug> (see lib/tools/shared.ts).
 * PRIVACY: analytics get the tool slug only; the WhatsApp text holds page context and the calculated numbers.
 */

import { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import type { BoxDimensions, PlyType } from '@/types/boxDesigner';
import { Cta } from '@/components/site/Cta';
import { useEventTracker } from '@/hooks/useAnalytics';
import { designerHandoffHref, quoteHandoffHref, whatsappHandoffHref, whatsappShareHref } from '@/lib/tools/shared';

interface ToolHandoffProps {
  slug: string;
  toolName: string;
  /** Calculated INSIDE size in cm; the buttons still work (without a size) when null */
  dimsCm?: BoxDimensions | null;
  ply?: PlyType;
  /** Designer style id for the 3D link (default rsc) */
  style?: string;
  qty?: number;
  /** One or two plain sentences with the numbers, used for WhatsApp and copy */
  summary: string;
  designerLabel?: string;
  quoteLabel?: string;
  /** Short note above the buttons, e.g. "Open a box at 22.5 x 12.5 x 7.5 cm" */
  note?: string;
}

export default function ToolHandoff({ slug, toolName, dimsCm, ply, style, qty, summary, designerLabel, quoteLabel, note }: ToolHandoffProps) {
  const { trackEvent } = useEventTracker();
  const [copied, setCopied] = useState(false);
  const designerHref = designerHandoffHref({ slug, dimsCm, ply, style });
  const quoteLink = quoteHandoffHref({ slug, dimsCm, ply, qty });
  const copyText = `${toolName}: ${summary}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      toast.success('Result copied');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy. Select the text and copy it instead.');
    }
  };

  return (
    <div className="rounded-2xl border border-primary/30 bg-paper-100 p-5">
      <p className="font-display text-lg">{dimsCm ? 'Turn this into a real box' : 'Next step'}</p>
      {note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}
      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
        <Cta
          id={`tools.${slug}.designer`}
          intent="designer"
          href={designerHref}
          arrow
          meta={{ tool: slug }}
          onClick={() => trackEvent('tool_to_designer', { tool: slug })}
        >
          {designerLabel ?? 'See this box in 3D'}
        </Cta>
        <Cta
          id={`tools.${slug}.quote`}
          intent="quote"
          variant="secondary"
          href={quoteLink}
          meta={{ tool: slug }}
          onClick={() => trackEvent('tool_to_quote', { tool: slug })}
        >
          {quoteLabel ?? 'Get a quote for this size'}
        </Cta>
        <Cta
          id={`tools.${slug}.whatsapp`}
          intent="whatsapp"
          variant="whatsapp"
          href={whatsappHandoffHref({ toolName, slug, summary })}
          meta={{ tool: slug }}
        >
          WhatsApp Vayu
        </Cta>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <button type="button" onClick={copy} className="inline-flex min-h-9 items-center gap-1.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {copied ? <Check className="h-4 w-4 text-primary" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          Copy result
        </button>
        <a
          href={whatsappShareHref(`${copyText} (free calculator from Vayu Packaging)`)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-9 items-center gap-1.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          Share on WhatsApp
          <span className="sr-only"> (opens WhatsApp)</span>
        </a>
      </div>
    </div>
  );
}
