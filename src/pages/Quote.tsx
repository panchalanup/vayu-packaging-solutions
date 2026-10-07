import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { MetaTags } from '@/seo';
import QuoteForm from '@/components/quote/QuoteForm';
import { Section } from '@/components/site/Section';
import { Cta } from '@/components/site/Cta';
import { parseQuotePrefill } from '@/lib/quotePrefill';
import { LABELS } from '@/lib/quoteSchema';
import { FACTS } from '@/content/facts';
import { mailHref, pageWhatsAppMessage, telHref, whatsappHref } from '@/lib/contactLinks';
import { CONTACT_INFO } from '@/constants';
import { WEBSITE_URL } from '@/constants';

export default function Quote() {
  const { search } = useLocation();
  const prefill = useMemo(() => parseQuotePrefill(search), [search]);
  const productLabel = prefill.product ? LABELS.product[prefill.product] : null;
  const title =
    prefill.intent === 'sample' ? 'Order a sample' : prefill.intent === 'callback' ? 'Request a call back' : 'Get a quote';

  return (
    <Layout>
      <MetaTags
        title={`${title} | Vayu Packaging Solutions`}
        description={`Tell us what you ship. Corrugated boxes from ${FACTS.moqBoxes} units, stock sizes dispatched in ${FACTS.dispatchHours} hours from Ahmedabad.`}
        canonical={`${WEBSITE_URL}/quote`}
      />
      <Section name="quote" className="paper-grain">
        <div className="mx-auto grid max-w-content gap-10 px-4 py-12 md:px-6 md:py-20 lg:grid-cols-12 lg:px-10">
          <div className="lg:col-span-5">
            <p className="label-mono mb-4 text-muted-foreground">Quote · sample · call back</p>
            <h1 className="font-display text-display-l">{title}</h1>
            <p className="mt-4 max-w-[52ch] text-body-l text-muted-foreground">
              {productLabel ? `You're asking about ${productLabel} boxes. ` : ''}
              Three short steps. Only your name and mobile are required. We reply on WhatsApp within {FACTS.replySla}.
            </p>
            <ul className="mt-8 space-y-3 border-t border-border pt-6 text-sm">
              <li>No obligation · No spam · GST invoice</li>
              <li>
                MOQ {FACTS.moqBoxes} · {FACTS.samplePolicy}
              </li>
              <li>
                Stock sizes dispatched in {FACTS.dispatchHours} hrs* <span className="text-muted-foreground">({FACTS.dispatchFootnote})</span>
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-2">
              <Cta id="quote.whatsapp" intent="whatsapp" variant="whatsapp" href={whatsappHref(pageWhatsAppMessage('/quote', productLabel ? `${productLabel} boxes` : undefined))}>
                WhatsApp instead
              </Cta>
              <Cta id="quote.call" intent="call" variant="call" href={telHref}>
                {CONTACT_INFO.phone}
              </Cta>
              <Cta id="quote.email" intent="email" variant="link" href={mailHref}>
                {CONTACT_INFO.email}
              </Cta>
            </div>
          </div>
          <div className="lg:col-span-7">
            <QuoteForm idPrefix="quote-page" prefill={prefill} defaultIntent={prefill.intent} className="bg-background" />
          </div>
        </div>
      </Section>
    </Layout>
  );
}
