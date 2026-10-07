/**
 * Designer page header (§9.9): "← Vayu", the design name and an always-visible [Quote this design].
 * Replaces the site navbar on this route so the tool gets the full viewport.
 * SECURITY: quoteHref is built by the page from allow-listed values (see quoteHref in src/lib/quotePrefill.ts);
 * the design name is derived from numbers and enums only, never from user text.
 */

import { Link } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { LOGO_IMAGES } from '@/constants/images';
import { Cta } from '@/components/site/Cta';
import { SectionNameProvider } from '@/components/site/Section';

interface DesignerHeaderProps {
  /** e.g. "RSC · 30 × 20 × 15 cm · 5-ply" */
  designName: string;
  quoteHref: string;
  onQuote: () => void;
  onExport: () => void;
}

export default function DesignerHeader({ designName, quoteHref, onQuote, onExport }: DesignerHeaderProps) {
  return (
    <SectionNameProvider value="designer-header">
      <header data-theme="ink" className="sticky top-0 z-40 flex h-14 items-center gap-3 bg-ink-900 px-3 text-paper-50 md:px-5">
        <Link
          to="/"
          aria-label="Back to the Vayu home page"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg pr-2 text-sm font-semibold hover:text-green-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          <img src={LOGO_IMAGES.horizontalLight} alt="Vayu" className="h-7 w-auto" />
        </Link>

        <span aria-hidden="true" className="h-5 w-px bg-ink-500" />
        <p className="min-w-0 flex-1 truncate text-sm text-paper-muted">
          <span className="label-mono mr-2 hidden text-paper-muted sm:inline">Your design</span>
          <span className="tabular font-semibold text-paper-50">{designName}</span>
        </p>

        <button
          type="button"
          onClick={onExport}
          className="hidden min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-paper-100 hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:inline-flex"
        >
          <Download aria-hidden="true" className="h-4 w-4" />
          Export
        </button>

        <Cta id="designer.header.quote" intent="designer" href={quoteHref} onClick={onQuote} className="min-h-10 shrink-0 px-4">
          <span className="hidden sm:inline">Quote this design</span>
          <span className="sm:hidden">Quote</span>
        </Cta>
      </header>
    </SectionNameProvider>
  );
}
