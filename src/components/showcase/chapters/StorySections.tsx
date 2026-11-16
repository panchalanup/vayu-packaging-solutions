/**
 * The sections after the three stage chapters on /3d-box-designer: a wall of styles, the share-and-approve drawing
 * and four download buttons. One big word and one visual each; the visuals do the explaining.
 */

import { useState } from 'react';
import { Download, FileCode2, FileText, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEventTracker } from '@/hooks/useAnalytics';
import { STYLES } from '@/lib/boxDesigner/styles';
import { availableTemplates } from '@/lib/boxDesigner/templates';
import { Reveal } from '../Reveal';
import { designerShareUrl, downloadDielinePdf, downloadDielineSvg, downloadSpecSheet } from '../downloads';
import { useShowcaseDesign } from '../stageContext';
import ShareFlow from '../visuals/ShareFlow';
import StyleMarquee from '../visuals/StyleMarquee';

const word = 'font-display text-[clamp(2.8rem,9vw,7rem)] leading-[0.92] tracking-tight';

export function StyleSection() {
  return (
    <section id="styles" aria-labelledby="styles-h" className="scroll-mt-24 overflow-hidden border-t border-border py-16 lg:py-28">
      <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
        <Reveal>
          <h2 id="styles-h" className={word}>
            Any box.
          </h2>
          <p className="label-mono mt-4 text-muted-foreground">
            {STYLES.length} styles · {availableTemplates().length} templates
          </p>
        </Reveal>
      </div>
      <Reveal className="mt-10" rise={24}>
        <StyleMarquee tone="paper" />
      </Reveal>
    </section>
  );
}

export function ShareSection() {
  return (
    <section id="share" aria-labelledby="share-h" data-theme="kraft" className="scroll-mt-24 border-t border-border bg-paper-200 py-16 lg:py-28">
      <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
        <Reveal>
          <h2 id="share-h" className={word}>
            Share. Approve.
          </h2>
        </Reveal>
        <Reveal className="mx-auto mt-10 max-w-3xl" rise={24}>
          <ShareFlow tone="paper" />
        </Reveal>
      </div>
    </section>
  );
}

type Kind = 'pdf' | 'svg' | 'spec' | 'link';

const CHIPS: { id: Kind; label: string; icon: typeof FileText }[] = [
  { id: 'pdf', label: 'Dieline PDF', icon: FileText },
  { id: 'svg', label: 'Dieline SVG', icon: FileCode2 },
  { id: 'spec', label: 'Proof sheet', icon: FileText },
  { id: 'link', label: 'Share link', icon: Link2 },
];

export function TakeawaySection() {
  const { boxDesign } = useShowcaseDesign();
  const { trackEvent } = useEventTracker();
  const [busy, setBusy] = useState<Kind | null>(null);

  const run = async (kind: Kind) => {
    setBusy(kind);
    try {
      if (kind === 'pdf') await downloadDielinePdf(boxDesign);
      else if (kind === 'svg') downloadDielineSvg(boxDesign);
      else if (kind === 'spec') await downloadSpecSheet(boxDesign);
      else {
        await navigator.clipboard.writeText(designerShareUrl(boxDesign));
        toast.success('Share link copied', { description: 'No images or personal data inside it.' });
      }
      if (kind !== 'link') toast.success('Downloaded');
      trackEvent('showcase_sample_download', { format: kind });
    } catch {
      toast.error('That did not work. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <section id="exports" aria-labelledby="exports-h" data-theme="ink" className="scroll-mt-24 bg-ink-900 py-16 text-paper-50 lg:py-28">
      <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
        <Reveal>
          <h2 id="exports-h" className={word}>
            Take it with you.
          </h2>
          <p className="label-mono mt-4 text-paper-muted">Made in your browser, from your size above</p>
        </Reveal>
        <ul className="mt-10 flex list-none flex-wrap gap-3 p-0">
          {CHIPS.map((c, i) => (
            <Reveal as="li" key={c.id} delay={i * 50}>
              <button
                type="button"
                onClick={() => run(c.id)}
                disabled={busy !== null}
                className="group inline-flex min-h-14 items-center gap-3 rounded-full border border-paper-50/25 px-6 text-base font-semibold transition-[background-color,border-color,transform] duration-quick ease-paper hover:border-green-400 hover:bg-paper-50/5 active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
              >
                {c.id === 'link' ? <c.icon aria-hidden="true" className="h-5 w-5 text-green-400" /> : <Download aria-hidden="true" className="h-5 w-5 text-green-400" />}
                {busy === c.id ? 'Preparing…' : c.label}
              </button>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
