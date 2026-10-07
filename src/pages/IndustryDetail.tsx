/**
 * /industries/:slug: problem → recommended specs → FAQ → quote CTA (§9.4).
 * SECURITY: the slug comes from the URL, so it is only matched against the static list and never rendered or injected.
 * An unknown slug renders the 404 page (which also reports 404_hit).
 */

import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import PageTransition from '@/components/PageTransition';
import NotFound from './NotFound';
import { MetaTags, StructuredData } from '@/seo';
import { SEO_CONFIG } from '@/seo/config';
import { getBreadcrumbSchema, getFAQSchema } from '@/seo/schema';
import { Section } from '@/components/site/Section';
import { Cta } from '@/components/site/Cta';
import { SectionHeader } from '@/components/site/Blocks';
import { ImageSlot } from '@/components/site/ImageSlot';
import { PageHero } from '@/components/pages/PageHero';
import { FaqAccordion } from '@/components/pages/FaqAccordion';
import { CtaBand } from '@/components/pages/CtaBand';
import { INDUSTRY_PAGES, findIndustry, productHref } from '@/content/industries';
import { FACTS } from '@/content/facts';
import { quoteHref } from '@/lib/quotePrefill';
import { whatsappHref } from '@/lib/contactLinks';
import { reveal, STAGGER } from '@/lib/motion/tokens';

const container = 'mx-auto max-w-content px-4 md:px-6 lg:px-10';

export default function IndustryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const industry = findIndustry(slug);

  if (!industry) return <NotFound />;

  const path = `/industries/${industry.slug}`;
  const others = INDUSTRY_PAGES.filter((i) => i.slug !== industry.slug);

  return (
    <Layout>
      <MetaTags
        title={`${industry.name} Packaging | Corrugated Boxes by Vayu Packaging Solutions`}
        description={`${industry.problem} Vayu Packaging recommends ${industry.spec}: ${industry.metaFocus}. Minimum order ${FACTS.moqBoxes} boxes, GST invoice.`}
        keywords={[`${industry.name} packaging`, `${industry.name} corrugated boxes`, 'corrugated boxes Gujarat', 'Vayu Packaging Solutions']}
        canonical={`${SEO_CONFIG.siteUrl}${path}`}
      />
      <StructuredData
        type="BreadcrumbList"
        data={getBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Industries & Services', url: '/services' },
          { name: industry.name, url: path },
        ])}
      />
      {/* The FAQ below is rendered visibly, so the FAQPage schema is valid */}
      <StructuredData type="FAQPage" data={getFAQSchema(industry.faqs)} />

      <PageTransition>
        <PageHero
          index={`Industries — ${industry.name}`}
          title={`${industry.name} packaging.`}
          lead={industry.intro}
          actions={
            <>
              <Cta
                id={`industry.${industry.slug}.hero.quote`}
                intent="quote"
                size="lg"
                href={quoteHref({ industry: industry.slug, src: `industry.${industry.slug}` })}
                meta={{ industry: industry.slug }}
                arrow
              >
                Get the {industry.name} spec
              </Cta>
              <Cta id={`industry.${industry.slug}.hero.all`} intent="navigate" size="lg" variant="secondary" href="/services">
                All industries
              </Cta>
            </>
          }
          aside={<ImageSlot slot={industry.image} aspect="4 / 3" className="rounded-[14px]" sizes="(min-width: 1024px) 40vw, 100vw" priority />}
        />

        {/* PROBLEM */}
        <Section name="problem" theme="kraft" aria-labelledby="problem-heading" className="section-y">
          <div className={container}>
            <SectionHeader id="problem-heading" index="01 — The problem" title={industry.problem} align="split" />
            <dl className="mt-10 grid gap-4 md:grid-cols-2">
              <div className="rounded-[14px] bg-paper-50 p-6 md:p-8">
                <dt className="label-mono text-muted-foreground">Our spec</dt>
                <dd className="mt-3 font-display text-h3">{industry.spec}</dd>
              </div>
              <div className="rounded-[14px] bg-paper-50 p-6 md:p-8">
                <dt className="label-mono text-muted-foreground">Why it works</dt>
                <dd className="mt-3 text-body-l">{industry.why}</dd>
              </div>
            </dl>
          </div>
        </Section>

        {/* RECOMMENDED SPECS */}
        <Section name="specs" aria-labelledby="specs-heading" className="section-y">
          <div className={container}>
            <SectionHeader
              id="specs-heading"
              index="02 — Recommended specs"
              title={`What we suggest for ${industry.name}.`}
              lead="Start with the first. The others cover different weights, shapes and branding needs."
              align="split"
            />
            <ul className="mt-10 grid gap-4 md:grid-cols-3">
              {industry.specs.map((spec, i) => (
                <motion.li
                  key={spec.slug}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: i * STAGGER }}
                  className="flex flex-col rounded-[14px] border border-border p-6"
                >
                  <p className="label-mono text-muted-foreground">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="mt-3 font-display text-h3">{spec.name}</h3>
                  <p className="mt-2 flex-1 text-muted-foreground">{spec.note}</p>
                  <Cta
                    id={`industry.${industry.slug}.spec.${spec.slug}`}
                    intent="navigate"
                    variant="link"
                    href={productHref(spec.slug)}
                    meta={{ industry: industry.slug, product: spec.slug }}
                    arrow
                    className="mt-5 self-start"
                  >
                    View specification
                  </Cta>
                </motion.li>
              ))}
            </ul>
            {/* VERIFY-LATER[PROOF-01]: add a case study here when a customer has agreed in writing to be named */}
          </div>
        </Section>

        {/* FAQ */}
        <Section name="faq" theme="kraft" aria-labelledby="faq-heading" className="section-y">
          <div className={container}>
            <SectionHeader id="faq-heading" index="03 — FAQ" title={`${industry.name} questions.`} align="split" />
            <div className="mt-8 lg:ml-[33.333%]">
              <FaqAccordion items={industry.faqs} idPrefix={`ind-${industry.slug}`} />
            </div>
          </div>
        </Section>

        {/* OTHER INDUSTRIES */}
        <Section name="more" aria-labelledby="more-heading" className="py-12 md:py-16">
          <div className={container}>
            <h2 id="more-heading" className="label-mono text-muted-foreground">
              Other industries
            </h2>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
              {others.map((i) => (
                <li key={i.slug}>
                  <Cta id={`industry.${industry.slug}.more.${i.slug}`} intent="navigate" variant="link" href={`/industries/${i.slug}`} className="inline-flex min-h-11 items-center">
                    {i.name}
                  </Cta>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <CtaBand
          name="industry-cta"
          title={`Get the ${industry.name} spec.`}
          lead="Tell us the product, size and quantity. We will confirm the spec and price."
          note={`Reply within ${FACTS.replySla}. ${FACTS.businessHours}.`}
        >
          <Cta
            id={`industry.${industry.slug}.cta.quote`}
            intent="quote"
            size="lg"
            href={quoteHref({ industry: industry.slug, src: `industry.${industry.slug}.cta` })}
            meta={{ industry: industry.slug }}
            arrow
          >
            Get the {industry.name} spec
          </Cta>
          <Cta
            id={`industry.${industry.slug}.cta.whatsapp`}
            intent="whatsapp"
            size="lg"
            variant="secondary"
            href={whatsappHref(`Hi Vayu, I need packaging for ${industry.name}. Please share a quote.`)}
          >
            WhatsApp us
          </Cta>
        </CtaBand>
      </PageTransition>
    </Layout>
  );
}
