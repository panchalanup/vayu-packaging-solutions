/**
 * /locations: "Delivering across Gujarat" (§9.6). Takes over the Gujarat distribution content from the old home page.
 * SECURITY: static content; analytics events carry only the public city id, never personal data.
 */

import { lazy, Suspense, useState } from 'react';
import { MapPin } from 'lucide-react';
import Layout from '@/components/Layout';
import PageTransition from '@/components/PageTransition';
import { MetaTags, StructuredData } from '@/seo';
import { PAGE_METADATA } from '@/seo/metadata/pages';
import { getBreadcrumbSchema, getFAQSchema, PAGE_BREADCRUMBS } from '@/seo/schema';
import { Section } from '@/components/site/Section';
import { Cta } from '@/components/site/Cta';
import { FactStrip, SectionHeader } from '@/components/site/Blocks';
import { PageHero } from '@/components/pages/PageHero';
import { FaqAccordion } from '@/components/pages/FaqAccordion';
import { CtaBand } from '@/components/pages/CtaBand';
import { CITIES, HUB_FACTS, LOCATION_FAQS, REGIONS, SEO_PARAGRAPHS, USE_CASES, regionOf, transitBand } from '@/content/locations';
import { FACTS } from '@/content/facts';
import { whatsappHref } from '@/lib/contactLinks';
import { quoteHref } from '@/lib/quotePrefill';
import { useEventTracker } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';

const GujaratMap = lazy(() => import('@/components/pages/GujaratMap'));

const MapFallback = () => <div aria-hidden="true" className="w-full animate-pulse rounded-[14px] bg-paper-200" style={{ aspectRatio: '640 / 520' }} />;

const container = 'mx-auto max-w-content px-4 md:px-6 lg:px-10';

const Locations = () => {
  const [selectedId, setSelectedId] = useState('ahmedabad');
  const { trackEvent } = useEventTracker();
  const city = CITIES.find((c) => c.id === selectedId) ?? CITIES[0];
  const region = regionOf(city);

  const select = (id: string) => {
    setSelectedId(id);
    trackEvent('city_select', { city: id });
  };

  return (
    <Layout>
      <MetaTags {...PAGE_METADATA.locations} />
      <StructuredData type="BreadcrumbList" data={getBreadcrumbSchema(PAGE_BREADCRUMBS.locations)} />
      {/* The FAQ below is rendered visibly, so the FAQPage schema is valid for this page */}
      <StructuredData type="FAQPage" data={getFAQSchema([...LOCATION_FAQS])} />

      <PageTransition>
        <PageHero
          index="Locations — Gujarat network"
          title="Delivering across Gujarat."
          lead={SEO_PARAGRAPHS[1]}
          actions={
            <>
              <Cta id="locations.hero.quote" intent="quote" size="lg" href={quoteHref({ src: 'locations' })} arrow>
                Get a quote for my city
              </Cta>
              <Cta
                id="locations.hero.whatsapp"
                intent="whatsapp"
                size="lg"
                variant="secondary"
                href={whatsappHref('Hi Vayu, can you deliver to my city in Gujarat? Please share a quote.')}
              >
                WhatsApp us
              </Cta>
            </>
          }
          footer={<FactStrip facts={HUB_FACTS} />}
        />

        {/* MAP + CITY CARD + CITY LIST */}
        <Section name="map" theme="kraft" aria-labelledby="map-heading" className="section-y">
          <div className={container}>
            <SectionHeader
              id="map-heading"
              index="01 — Coverage"
              title="One hub, every major Gujarat market."
              lead="Ahmedabad is our central hub. Select a city to see how we support it."
            />

            <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-x-10">
              <div className="min-w-0 lg:col-span-7">
                <Suspense fallback={<MapFallback />}>
                  <GujaratMap selectedId={selectedId} onSelect={select} />
                </Suspense>
              </div>

              <article
                aria-live="polite"
                aria-labelledby="city-card-title"
                className="min-w-0 self-start rounded-[14px] bg-paper-50 p-6 shadow-paper md:p-8 lg:sticky lg:top-[calc(var(--nav-h)+24px)] lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1"
              >
                <p className="label-mono flex items-center gap-1.5 text-muted-foreground">
                  <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                  {city.hub ? 'Hub · Ahmedabad' : `From the Ahmedabad hub`}
                </p>
                <h3 id="city-card-title" className="mt-3 font-display text-h3">
                  {city.name}
                </h3>
                <dl className="mt-5 space-y-4 text-base">
                  <div>
                    <dt className="label-mono text-muted-foreground">Typical transit</dt>
                    <dd className="mt-1">
                      {/* VERIFY-LATER[LOC-02]: placeholder transit band derived from distance */}
                      {transitBand(city.km)}
                      <span className="block text-sm text-muted-foreground">
                        Indicative.{city.km > 0 && ` About ${city.km} km by road.`} Exact timing is confirmed with your quote.
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="label-mono text-muted-foreground">Industries served</dt>
                    <dd className="mt-1">{region.focus}</dd>
                  </div>
                  <div>
                    <dt className="label-mono text-muted-foreground">Common challenge</dt>
                    <dd className="mt-1">{region.problem}</dd>
                  </div>
                  <div>
                    <dt className="label-mono text-muted-foreground">Our approach</dt>
                    <dd className="mt-1 text-muted-foreground">{region.solution}</dd>
                  </div>
                </dl>
                <Cta
                  id="locations.city.quote"
                  intent="quote"
                  href={quoteHref({ src: 'locations' })}
                  meta={{ city: city.id }}
                  arrow
                  className="mt-6"
                >
                  Get a quote for {city.name}
                </Cta>
              </article>

              <div className="lg:col-span-7">
                <h3 className="label-mono text-muted-foreground">Cities we serve in Gujarat</h3>
                <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {CITIES.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => select(c.id)}
                        aria-pressed={c.id === selectedId}
                        className={cn(
                          'flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition-colors duration-quick',
                          c.id === selectedId
                            ? 'border-ink-900 bg-paper-50 text-ink-900'
                            : 'border-ink-900/15 text-ink-900 hover:border-ink-900/40 hover:bg-paper-50/60'
                        )}
                      >
                        <span>{c.name}</span>
                        {c.hub && <span className="label-mono text-green-700">Hub</span>}
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted-foreground">
                  Map is schematic, not to scale. *{FACTS.dispatchFootnote}
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* REGIONS (the six city clusters, kept as crawlable text) */}
        <Section name="regions" aria-labelledby="regions-heading" className="section-y">
          <div className={container}>
            <SectionHeader
              id="regions-heading"
              index="02 — By region"
              title="What each market needs."
              lead="Each cluster has its own handling pattern, so the board spec and supply plan differ."
              align="split"
            />
            <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {REGIONS.map((r) => (
                <li key={r.id} className="flex flex-col rounded-[14px] border border-border p-6">
                  <h3 className="font-display text-h3">{r.title}</h3>
                  <p className="label-mono mt-3 text-kraft-700">{r.focus}</p>
                  <p className="mt-4 text-sm">
                    <span className="font-semibold">Common challenge: </span>
                    {r.problem}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Our approach: </span>
                    {r.solution}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* COMMON CHALLENGES + SEO COPY */}
        <Section name="challenges" theme="kraft" aria-labelledby="challenges-heading" className="section-y">
          <div className={container}>
            <SectionHeader
              id="challenges-heading"
              index="03 — Challenges"
              title="Common packaging challenges we solve."
              align="split"
            />
            <ul className="mt-10 grid gap-4 md:grid-cols-3">
              {USE_CASES.map((u) => (
                <li key={u.problem} className="rounded-[14px] bg-paper-50 p-6">
                  <p className="font-display text-h3">{u.problem}</p>
                  <p className="mt-3 text-muted-foreground">{u.solution}</p>
                </li>
              ))}
            </ul>
            <div className="mt-12 grid gap-4 border-t border-ink-900/15 pt-8 lg:grid-cols-12 lg:gap-10">
              <h3 className="label-mono text-muted-foreground lg:col-span-4">Packaging distribution in Gujarat</h3>
              <div className="max-w-[68ch] space-y-4 text-body-l lg:col-span-8">
                {SEO_PARAGRAPHS.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* FAQ (visible, so the FAQPage schema above is valid) */}
        <Section name="faq" aria-labelledby="faq-heading" className="section-y">
          <div className={container}>
            <SectionHeader id="faq-heading" index="04 — FAQ" title="Delivery questions." align="split" />
            <div className="mt-8 lg:ml-[33.333%]">
              <FaqAccordion items={LOCATION_FAQS} idPrefix="loc-faq" />
            </div>
          </div>
        </Section>

        <CtaBand
          name="locations-cta"
          title="Need packaging support in your city?"
          lead="Share your product type, shipment volume and delivery location. We will suggest the right board strength, material mix and dispatch model."
        >
          <Cta id="locations.cta.quote" intent="quote" size="lg" href={quoteHref({ src: 'locations.cta' })} arrow>
            Request a city-wise quote
          </Cta>
          <Cta id="locations.cta.industries" intent="navigate" variant="link" href="/services">
            Industries &amp; services
          </Cta>
          <Cta id="locations.cta.products" intent="navigate" variant="link" href="/products">
            View products
          </Cta>
        </CtaBand>
      </PageTransition>
    </Layout>
  );
};

export default Locations;
