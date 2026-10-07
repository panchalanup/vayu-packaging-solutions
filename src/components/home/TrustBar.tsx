/** S2 Trust bar: industry marquee (no client logos cleared yet) + stat ledger from the single fact set */

import { useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Section } from '@/components/site/Section';
import { StatLedger } from '@/components/site/StatLedger';
import { Cta } from '@/components/site/Cta';
import { FACT_STATS } from '@/content/facts';
import { INDUSTRIES } from '@/constants';
import { whatsappHref } from '@/lib/contactLinks';
import { cn } from '@/lib/utils';

// VERIFY-LATER[TEST-02]: swap the industry marquee for a LogoMarquee once client logos have written permission
const ITEMS = [...INDUSTRIES, 'Ceramics', 'Engineering', '3PL & warehousing'];

export default function TrustBar() {
  const [paused, setPaused] = useState(false);
  return (
    <Section name="trust" id="trust" tabIndex={-1} aria-labelledby="trust-heading" className="border-y border-border outline-none">
      <div className="mx-auto max-w-content px-4 pt-12 md:px-6 lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <h2 id="trust-heading" className="label-mono text-muted-foreground">
            Trusted by teams across Gujarat
          </h2>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground hover:text-foreground"
            aria-pressed={paused}
          >
            {paused ? <Play aria-hidden="true" className="h-3.5 w-3.5" /> : <Pause aria-hidden="true" className="h-3.5 w-3.5" />}
            {paused ? 'Play' : 'Pause'}
          </button>
        </div>
      </div>
      <div className="group relative mt-4 overflow-hidden py-4 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <ul
          className={cn(
            'marquee-track flex w-max animate-marquee gap-12 whitespace-nowrap pr-12 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]',
            paused && '[animation-play-state:paused]'
          )}
        >
          {[...ITEMS, ...ITEMS].map((item, i) => (
            <li key={i} aria-hidden={i >= ITEMS.length} className="font-display text-h3 text-ink-500">
              {item}
              <span aria-hidden="true" className="ml-12 text-kraft-400">
                ⊕
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mx-auto max-w-content px-4 pb-12 md:px-6 lg:px-10">
        <StatLedger stats={FACT_STATS} className="mt-6" />
        <Cta
          id="home.trust.references"
          intent="whatsapp"
          variant="link"
          href={whatsappHref('Hi Vayu, could you share a few customer references?')}
          className="mt-6"
        >
          References available on request
        </Cta>
      </div>
    </Section>
  );
}
