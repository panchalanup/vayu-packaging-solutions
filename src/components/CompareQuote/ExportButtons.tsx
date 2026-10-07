/**
 * Supplier-ready exports and a generic WhatsApp/email share.
 * SECURITY: events carry the box style and score only (no product name, no personal data); the share URL is
 * built with encodeURIComponent and opened with noopener.
 */

import { Copy, Download, FileText } from 'lucide-react';
import type { ScoredResult, UserInput } from '@/types/packaging';
import { exportToCSV, exportToPDF, generateEmailTemplate, generateWhatsAppMessage } from '@/lib/exportUtils';
import { toast } from 'sonner';
import { useEventTracker } from '@/hooks/useAnalytics';
import { WhatsAppIcon } from '@/components/site/Decor';

interface ExportButtonsProps {
  result: ScoredResult;
  input: UserInput;
}

const btn =
  'inline-flex min-h-11 items-center gap-2 rounded-lg border border-foreground/20 px-4 text-sm font-semibold transition-colors duration-quick hover:border-foreground/40 hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function ExportButtons({ result, input }: ExportButtonsProps) {
  const { trackEvent } = useEventTracker();

  const handleCSVExport = () => {
    exportToCSV(result, input);
    trackEvent('export_csv', { boxStyle: result.box_style, confidenceScore: result.score, confidence: result.confidence });
    toast.success('CSV downloaded', { description: 'Supplier specification has been downloaded.' });
  };

  const handlePDFExport = () => {
    exportToPDF(result, input);
    trackEvent('export_pdf', { boxStyle: result.box_style, confidenceScore: result.score, confidence: result.confidence });
    toast.success('PDF downloaded', { description: 'Quote document has been generated.' });
  };

  const handleEmailCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateEmailTemplate(result, input));
      trackEvent('copy_email_template', { boxStyle: result.box_style });
      toast.success('Email template copied', { description: 'Paste it into your email to send to your supplier.' });
    } catch {
      toast.error('Could not copy', { description: 'Your browser blocked clipboard access.' });
    }
  };

  // Generic share (no number): pick any contact, for example your own supplier
  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(generateWhatsAppMessage(result, input))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    trackEvent('share_whatsapp', { boxStyle: result.box_style });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={handleCSVExport} className={btn}>
        <Download aria-hidden="true" className="h-4 w-4" /> Download CSV
      </button>
      <button type="button" onClick={handlePDFExport} className={btn}>
        <FileText aria-hidden="true" className="h-4 w-4" /> Download PDF
      </button>
      <button type="button" onClick={handleWhatsAppShare} className={btn}>
        <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> Share via WhatsApp
        <span className="sr-only"> (opens WhatsApp)</span>
      </button>
      <button type="button" onClick={handleEmailCopy} className={btn}>
        <Copy aria-hidden="true" className="h-4 w-4" /> Copy email text
      </button>
    </div>
  );
}
