/**
 * Privacy notice (draft). VERIFY-LATER[LEGAL-01]: have this text reviewed against the DPDP Act 2023 and the
 * owner's actual data handling (retention, who can access the lead Sheet) before relying on it.
 */

import { useState } from 'react';
import Layout from '@/components/Layout';
import { Section } from '@/components/site/Section';
import { SectionHeader } from '@/components/site/Blocks';
import { Cta } from '@/components/site/Cta';
import MetaTags from '@/components/SEO/MetaTags';
import { FACTS } from '@/content/facts';
import { getConsent, setConsent } from '@/lib/consent';
import { mailHref } from '@/lib/contactLinks';

const BLOCKS: [string, string][] = [
  ['What you send us', 'When you ask for a quote, sample or call-back we receive the details you type: name, company, mobile number, optional email and GSTIN, and your packaging requirements. We use them only to reply to you and to prepare your quote.'],
  ['Analytics without consent', 'We count page views and button clicks without identifying you. Each visit gets a random ID that disappears when you close the tab.'],
  ['Analytics with your consent', 'If you press Accept we also store a device ID in your browser and look up your approximate city from your IP address, to understand which areas our visitors come from. We keep only a one-way hash of the IP address.'],
  ['Who can see it', 'Quote requests and analytics go to a spreadsheet that only named Vayu staff can open. We do not sell your data.'],
  ['Your choices', 'You can change your analytics choice below at any time, and ask us to correct or delete the details you sent us.'],
];

export default function Privacy() {
  const [choice, setChoice] = useState(getConsent());
  return (
    <Layout>
      <MetaTags title="Privacy notice" description="How Vayu Packaging Solutions handles the details you send us and website analytics." canonical="/privacy" />
      <Section name="privacy" className="paper-grain">
        <div className="mx-auto max-w-content px-4 py-16 md:px-6 lg:px-10 lg:py-24">
          <SectionHeader index="Legal" title="Privacy notice" lead="Plain-language summary. Last updated for the 2026 website relaunch." />
          <div className="mt-10 grid max-w-3xl gap-8">
            {BLOCKS.map(([h, t]) => (
              <div key={h}>
                <h2 className="text-h3 font-bold">{h}</h2>
                <p className="mt-2 text-body-l text-muted-foreground">{t}</p>
              </div>
            ))}
            <div className="rounded-xl border border-ink-900/15 p-5">
              <p className="font-semibold">Analytics choice: {choice === 'granted' ? 'Accepted' : choice === 'denied' ? 'Declined' : 'Not chosen yet'}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {(['denied', 'granted'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setConsent(c);
                      setChoice(c);
                    }}
                    className="min-h-11 rounded-lg border border-ink-900/25 px-5 text-sm font-semibold hover:bg-ink-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {c === 'granted' ? 'Accept analytics' : 'Decline analytics'}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {/* VERIFY-LATER[LEGAL-02]: name a grievance contact if the business has one */}
              Questions or deletion requests: <a className="text-accent underline underline-offset-4" href={mailHref}>email us</a>. {FACTS.legalName}, {FACTS.addressShort}.
            </p>
            <Cta id="privacy.back" intent="navigate" variant="link" href="/contact">
              Contact us
            </Cta>
          </div>
        </div>
      </Section>
    </Layout>
  );
}
