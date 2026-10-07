/**
 * /services: "Industries & Services" hub (§9.4). The route stays /services; only the UI name changes.
 * The FAQ is rendered visibly, so the FAQPage schema is valid here (the old page emitted schema with no visible FAQ).
 * SECURITY: static content; no user input is rendered.
 */

import { motion } from 'framer-motion';
import { CalendarClock, Package, Printer, Ruler, type LucideIcon } from 'lucide-react';
import Layout from '@/components/Layout';
import PageTransition from '@/components/PageTransition';
import { MetaTags, StructuredData } from '@/seo';
import { PAGE_METADATA } from '@/seo/metadata/pages';
import { getBreadcrumbSchema, getFAQSchema, PAGE_BREADCRUMBS } from '@/seo/schema';
import { Section } from '@/components/site/Section';
import { Cta } from '@/components/site/Cta';
import { SectionHeader } from '@/components/site/Blocks';
import { ImageSlot } from '@/components/site/ImageSlot';
import { PageHero } from '@/components/pages/PageHero';
import { FaqAccordion, type FaqItem } from '@/components/pages/FaqAccordion';
import { CtaBand } from '@/components/pages/CtaBand';
import { INDUSTRY_PAGES } from '@/content/industries';
import { FACTS } from '@/content/facts';
import { quoteHref } from '@/lib/quotePrefill';
import { whatsappHref, pageWhatsAppMessage } from '@/lib/contactLinks';
import { reveal, STAGGER } from '@/lib/motion/tokens';

// VERIFY-LATER[SVC-01]: confirm which of these services Vayu actually offers today. Remove any row that is not offered.
const WHAT_WE_DO: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Ruler, title: 'Custom sizing', body: 'Boxes cut to your product dimensions in 3, 5 or 7 ply, so nothing rattles and no board is wasted.' },
  { icon: Printer, title: 'Printing', body: 'Flexo print in 1–4 colours, with full-colour options on request. Printed orders start at 1,000 boxes.' },
  { icon: Package, title: 'Sampling', body: `${FACTS.samplePolicy}, so you can test fit and strength before a bulk order.` },
  { icon: CalendarClock, title: 'Scheduled replenishment', body: 'Plan a regular supply of boxes and supplies so your line never waits on packaging.' },
];

const FAQS: FaqItem[] = [
  {
    question: 'What industries do you serve?',
    answer: `${INDUSTRY_PAGES.map((i) => i.name).join(', ')}. Each has its own page with the recommended spec and the reason behind it.`,
  },
  {
    question: 'What can be customised?',
    answer: 'Box size, ply (3, 5 or 7), die-cut shapes and inserts, and flexo print in 1–4 colours. Printed orders start at 1,000 boxes.',
  },
  {
    question: 'How fast can you dispatch?',
    answer: `Stock sizes are dispatched within ${FACTS.dispatchHours} hours from ${FACTS.city}. Custom boxes usually take 5–7 days.`,
  },
  { question: 'Do you send samples?', answer: `${FACTS.samplePolicy}. Choose "Sample" in the quote form or message us on WhatsApp.` },
  {
    question: 'Can you supply on a regular schedule?',
    answer: 'Yes. Tell us your monthly volume in the quote form and we will plan scheduled supply around it.',
  },
];

const container = 'mx-auto max-w-content px-4 md:px-6 lg:px-10';

const Services = () => (
  <Layout>
    <MetaTags {...PAGE_METADATA.services} />
    <StructuredData type="BreadcrumbList" data={getBreadcrumbSchema(PAGE_BREADCRUMBS.services)} />
    <StructuredData type="FAQPage" data={getFAQSchema(FAQS)} />

    <PageTransition>
      <PageHero
        index="Industries & Services"
        title="Packaging built around what you ship."
        lead="Pick your industry to see the problem we solve, the spec we recommend, and why it works."
        actions={
          <>
            <Cta id="services.hero.quote" intent="quote" size="lg" href={quoteHref({ src: 'services' })} arrow>
              Get a quote
            </Cta>
            <Cta
              id="services.hero.whatsapp"
              intent="whatsapp"
              size="lg"
              variant="secondary"
              href={whatsappHref(pageWhatsAppMessage('/services'))}
            >
              WhatsApp us
            </Cta>
          </>
        }
      />

      {/* INDUSTRY CARDS */}
      <Section name="industries" theme="kraft" aria-labelledby="industries-heading" className="section-y">
        <div className={container}>
          <SectionHeader id="industries-heading" index="01 — Industries" title="Six industries, six specs." align="split" />
          <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {INDUSTRY_PAGES.map((ind, i) => (
              <motion.li
                key={ind.slug}
                {...reveal}
                transition={{ ...reveal.transition, delay: (i % 3) * STAGGER }}
                className="flex flex-col overflow-hidden rounded-[14px] bg-paper-50"
              >
                <ImageSlot slot={ind.image} aspect="16 / 10" sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw" />
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-h3">{ind.name}</h3>
                  <dl className="mb-6 mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="label-mono text-muted-foreground">The problem</dt>
                      <dd className="mt-1">{ind.problem}</dd>
                    </div>
                    <div>
                      <dt className="label-mono text-muted-foreground">Our spec</dt>
                      <dd className="mt-1 font-semibold">{ind.spec}</dd>
                    </div>
                  </dl>
                  <Cta
                    id={`services.industries.${ind.slug}`}
                    intent="navigate"
                    variant="secondary"
                    href={`/industries/${ind.slug}`}
                    meta={{ industry: ind.slug }}
                    arrow
                    className="mt-auto self-start"
                  >
                    See the {ind.name} spec
                  </Cta>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </Section>

      {/* WHAT WE DO */}
      <Section name="services" aria-labelledby="services-heading" className="section-y">
        <div className={container}>
          <SectionHeader id="services-heading" index="02 — What we do" title="Beyond the box." align="split" />
          <ul className="mt-10 grid border-t border-border sm:grid-cols-2 lg:grid-cols-4">
            {WHAT_WE_DO.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className={`border-b border-border py-8 sm:pr-6 ${i > 0 ? 'lg:border-l lg:pl-6' : ''} ${i % 2 === 1 ? 'sm:border-l sm:pl-6' : ''}`}>
                <Icon aria-hidden="true" className="h-7 w-7 text-green-600" strokeWidth={1.5} />
                <h3 className="mt-4 font-display text-h3">{title}</h3>
                <p className="mt-2 text-muted-foreground">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* TOOLS BAND */}
      <Section name="tools" theme="ink" aria-labelledby="tools-heading" className="section-y">
        <div className={container}>
          <SectionHeader
            id="tools-heading"
            index="03 — Free tools"
            title="Size it yourself first."
            lead="Two free tools to work out the spec before you talk to anyone."
            align="split"
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="flex flex-col rounded-[14px] border border-border bg-card p-6 md:p-8">
              <p className="label-mono text-paper-muted">Packaging Finder</p>
              <h3 className="mt-3 font-display text-h3">Get a spec and a price range</h3>
              <p className="mt-2 text-paper-muted">Answer three short steps and get the recommended ply, with an indicative price range.</p>
              <Cta id="services.tools.finder" intent="finder" href="/compare-quote" arrow className="mt-6 self-start">
                Find my box spec
              </Cta>
            </div>
            <div className="flex flex-col rounded-[14px] border border-border bg-card p-6 md:p-8">
              <p className="label-mono text-paper-muted">3D box designer</p>
              <h3 className="mt-3 font-display text-h3">See your box in 3D</h3>
              <p className="mt-2 text-paper-muted">Set the size, ply and print, then send the design with your quote request. Free, no sign-up.</p>
              <Cta id="services.tools.designer" intent="designer" variant="secondary" href="/box-designer" arrow className="mt-6 self-start">
                Design in 3D
              </Cta>
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ (visible, so the FAQPage schema above is valid) */}
      <Section name="faq" aria-labelledby="faq-heading" className="section-y">
        <div className={container}>
          <SectionHeader id="faq-heading" index="04 — FAQ" title="Common questions." align="split" />
          <div className="mt-8 lg:ml-[33.333%]">
            <FaqAccordion items={FAQS} idPrefix="svc-faq" />
          </div>
        </div>
      </Section>

      <CtaBand
        name="services-cta"
        title="Need a custom packaging solution?"
        lead="Tell us what you ship and how many. We will spec it and price it."
        note={`Reply within ${FACTS.replySla}. ${FACTS.businessHours}.`}
      >
        <Cta id="services.cta.quote" intent="quote" size="lg" href={quoteHref({ src: 'services.cta' })} arrow>
          Get a quote
        </Cta>
        <Cta id="services.cta.products" intent="navigate" variant="link" href="/products">
          View products
        </Cta>
      </CtaBand>
    </PageTransition>
  </Layout>
);

export default Services;
