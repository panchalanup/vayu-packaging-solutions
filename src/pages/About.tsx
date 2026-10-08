/**
 * /about: "The people behind the box" (§9.2). One fact set (src/content/facts.ts) replaces the old contradictory story copy.
 * SECURITY: static content; the brochure is a public PDF served from /public; analytics carry no personal data.
 */

import { lazy, Suspense, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import Layout from '@/components/Layout';
import PageTransition from '@/components/PageTransition';
import { MetaTags, StructuredData } from '@/seo';
import { PAGE_METADATA } from '@/seo/metadata/pages';
import { getBreadcrumbSchema, PAGE_BREADCRUMBS } from '@/seo/schema';
import { Section } from '@/components/site/Section';
import { Cta } from '@/components/site/Cta';
import { FactStrip, SectionHeader } from '@/components/site/Blocks';
import { StatLedger } from '@/components/site/StatLedger';
import { ImageSlot, type ImageSlotData } from '@/components/site/ImageSlot';
import { PageHero } from '@/components/pages/PageHero';
import { CtaBand } from '@/components/pages/CtaBand';
import { FACTS, FACT_STATS } from '@/content/facts';
import { ABOUT_IMAGES } from '@/constants/images';
import { CONTACT_INFO } from '@/constants';
import { mailHref, telHref, whatsappHref, pageWhatsAppMessage } from '@/lib/contactLinks';
import { quoteHref } from '@/lib/quotePrefill';
import { useEventTracker } from '@/hooks/useAnalytics';
import { reveal, STAGGER } from '@/lib/motion/tokens';

const ModelDiagram = lazy(() => import('@/components/pages/ModelDiagram'));

// VERIFY-LATER[ASSET-01]: the brochure PDF is ~20 MB; compress it to 3 MB or less before promoting this link further
const BROCHURE_HREF = '/brochures/Vayu-Packaging-Solutions-Company-Brochure.pdf';

// Original illustration, not a photo of our facility. Swap for a real photo (kind: 'photo') after the shoot, see docs/Design-Improvement §10.5.
const HERO_IMAGE: ImageSlotData = { id: 'about.hero', src: ABOUT_IMAGES.main, alt: ABOUT_IMAGES.alt, kind: 'illustration', width: ABOUT_IMAGES.width, height: ABOUT_IMAGES.height };

// VERIFY-LATER[QC-01]: confirm which checks are really done in-house (burst / ECT testing, caliper, print match) before listing more detail
const QUALITY_STEPS = [
  { title: 'Spec and sample first', body: `We confirm size, ply and print before you commit. ${FACTS.samplePolicy}.` },
  { title: 'Board comes in checked', body: 'Board from our mills is checked for ply, flute and surface before it is converted.' },
  { title: 'Every batch is checked', body: 'Size, print and strength are checked on every batch, whether we made it or sourced it.' },
  { title: 'Counted and packed', body: `Boxes are counted, packed and dispatched from ${FACTS.city}. Stock sizes go out in ${FACTS.dispatchHours} hours.*` },
];

const container = 'mx-auto max-w-content px-4 md:px-6 lg:px-10';

const About = () => {
  const { trackEvent } = useEventTracker();
  const { hash } = useLocation();

  // /about#capacity from other pages: the router does not scroll to hashes by itself
  useEffect(() => {
    // SECURITY: hash comes from the URL, so only a plain id is looked up (no selectors)
    if (!/^#[a-z][a-z0-9-]{0,40}$/.test(hash)) return;
    const frame = requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, [hash]);

  // GSTIN and Udyam stay hidden until the owner supplies them (FACT-14)
  const companyFacts: { label: string; value: string }[] = [
    { label: 'Legal name', value: FACTS.legalName },
    { label: 'Registered address', value: FACTS.addressFull },
    ...(FACTS.gstin ? [{ label: 'GSTIN', value: FACTS.gstin }] : []),
    ...(FACTS.udyam ? [{ label: 'Udyam', value: FACTS.udyam }] : []),
    // VERIFY-LATER[FACT-01]: no single founding year agreed yet, so years in business is shown instead
    { label: 'In business', value: `${FACTS.yearsInBusiness.value}${FACTS.yearsInBusiness.suffix} years` },
    { label: 'Minimum order', value: `${FACTS.moqBoxes} boxes` },
    { label: 'Business hours', value: FACTS.businessHours },
    { label: 'Reply time', value: FACTS.replySla },
  ];

  return (
    <Layout>
      <MetaTags {...PAGE_METADATA.about} />
      <StructuredData type="BreadcrumbList" data={getBreadcrumbSchema(PAGE_BREADCRUMBS.about)} />

      <PageTransition>
        <PageHero
          index="About — The people behind the box"
          title={`Packaging partner to ${FACTS.clients.value}${FACTS.clients.suffix} businesses.`}
          lead={`Vayu Packaging Solutions supplies corrugated boxes and packaging materials from ${FACTS.city}. We make some boxes ourselves, source others from vetted mills, and tell you which is which.`}
          actions={
            <>
              <Cta id="about.hero.quote" intent="quote" size="lg" href={quoteHref({ src: 'about' })} arrow>
                Get a quote
              </Cta>
              <Cta id="about.hero.capacity" intent="navigate" size="lg" variant="secondary" href="/about#capacity">
                See our capacity
              </Cta>
            </>
          }
          aside={
            // VERIFY-LATER[ABOUT-01]: founder story, name and photo are not supplied, so none is shown. Add a founder block here once the owner provides them.
            <ImageSlot slot={HERO_IMAGE} aspect="4 / 3" className="rounded-[14px]" sizes="(min-width: 1024px) 40vw, 100vw" priority />
          }
        />

        {/* OUR MODEL */}
        <Section name="model" theme="kraft" aria-labelledby="model-heading" className="section-y">
          <div className={container}>
            <SectionHeader
              id="model-heading"
              index="01 — Our model"
              title="Made and sourced, through one gate."
              lead="Custom boxes are made to order. Standard board and supplies come from vetted mills. All of it passes the same check before it reaches you."
              align="split"
            />
            {/* VERIFY-LATER[FACT-05]: the made-in-house vs sourced split is a default per product, not owner-confirmed (see FACT-06 in home.ts) */}
            <div className="mt-10">
              <Suspense fallback={<div aria-hidden="true" className="h-72 animate-pulse rounded-[14px] bg-paper-200" />}>
                <ModelDiagram />
              </Suspense>
            </div>
          </div>
        </Section>

        {/* CAPACITY */}
        <Section name="capacity" id="capacity" aria-labelledby="capacity-heading" className="section-y">
          <div className={container}>
            <SectionHeader
              id="capacity-heading"
              index="02 — Capacity"
              title="What we have delivered so far."
              lead="The figures we use across the site, kept in one place."
              align="split"
            />
            {/* VERIFY-LATER[ABOUT-02]: board per month, machines, shifts and dispatch radius were not supplied, so they are not shown */}
            <StatLedger stats={FACT_STATS} className="mt-10" />
            <FactStrip
              className="mt-8"
              facts={[
                { label: 'Hub', value: FACTS.city },
                { label: 'Stock dispatch', value: `${FACTS.dispatchHours} hrs*` },
                { label: 'MOQ', value: `${FACTS.moqBoxes} boxes` },
                { label: 'Invoice', value: 'GST' },
              ]}
            />
            <p className="mt-4 text-xs text-muted-foreground">*{FACTS.dispatchFootnote}</p>
          </div>
        </Section>

        {/* QUALITY */}
        <Section name="quality" theme="ink" aria-labelledby="quality-heading" className="section-y">
          <div className={container}>
            <SectionHeader
              id="quality-heading"
              index="03 — Quality"
              title="How we check."
              lead="Four checkpoints between your spec and your dock."
              align="split"
            />
            {/* VERIFY-LATER[CERT-01]: no certificate (BIS, ISO, FSSAI) is claimed until the owner supplies the number and a PDF */}
            <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {QUALITY_STEPS.map((step, i) => (
                <motion.li
                  key={step.title}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: i * STAGGER }}
                  className="rounded-[14px] border border-border bg-card p-6"
                >
                  <p className="label-mono text-paper-muted">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="mt-3 font-display text-h3">{step.title}</h3>
                  <p className="mt-2 text-paper-muted">{step.body}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </Section>

        {/* COMPANY FACTS */}
        <Section name="facts" aria-labelledby="facts-heading" className="section-y">
          <div className={container}>
            <SectionHeader id="facts-heading" index="04 — Company facts" title="The details, in one place." align="split" />
            <dl className="mt-10 grid border-t border-border sm:grid-cols-2">
              {companyFacts.map((fact, i) => (
                <div key={fact.label} className={`border-b border-border py-5 sm:pr-6 ${i % 2 === 1 ? 'sm:border-l sm:pl-6' : ''}`}>
                  <dt className="label-mono text-muted-foreground">{fact.label}</dt>
                  <dd className="mt-1 text-body-l">{fact.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              <Cta id="about.facts.call" intent="call" variant="link" href={telHref}>
                {CONTACT_INFO.phone}
              </Cta>
              <Cta id="about.facts.email" intent="email" variant="link" href={mailHref} className="break-all">
                {CONTACT_INFO.email}
              </Cta>
              <Cta id="about.facts.locations" intent="navigate" variant="link" href="/locations" arrow>
                Gujarat network
              </Cta>
            </div>
            {/* Gallery "Inside Vayu" stays hidden until real photos exist (§9.2) */}
          </div>
        </Section>

        <CtaBand
          name="about-cta"
          title="See if we are the right fit."
          lead="Send your spec and quantity, or take the brochure to your team first."
          note={`Reply within ${FACTS.replySla}. ${FACTS.businessHours}.`}
        >
          <Cta id="about.cta.quote" intent="quote" size="lg" href={quoteHref({ src: 'about.cta' })} arrow>
            Get a quote
          </Cta>
          {/* target=_blank keeps the router out of the way so the browser opens the PDF itself */}
          <Cta
            id="about.cta.brochure"
            intent="download"
            size="lg"
            variant="secondary"
            href={BROCHURE_HREF}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('brochure_download', { id: 'about.cta.brochure' })}
          >
            <Download aria-hidden="true" className="mr-2 inline h-4 w-4 align-[-2px]" />
            Download brochure
          </Cta>
          <Cta id="about.cta.whatsapp" intent="whatsapp" size="lg" variant="secondary" href={whatsappHref(pageWhatsAppMessage('/about'))}>
            WhatsApp us
          </Cta>
        </CtaBand>
      </PageTransition>
    </Layout>
  );
};

export default About;
