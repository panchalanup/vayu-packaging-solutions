/**
 * Box designer landing pages (#33): /box-designer/:style (mailer-box, pizza-box, shoe-box, gift-box, ...).
 * Plain-language SEO copy for one box type, typical sizes that open the designer at that size, and a share card
 * per style (#34). Unknown or unavailable slugs go to the designer itself.
 * SECURITY: all copy is static (src/content/designerLandings.ts); JSON-LD is serialised by StructuredData.
 */

import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import Layout from '@/components/Layout';
import { Section } from '@/components/site/Section';
import { Cta } from '@/components/site/Cta';
import MetaTags from '@/components/SEO/MetaTags';
import { StructuredData } from '@/components/SEO/StructuredData';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import BoxThumbnail from '@/components/BoxDesigner/BoxThumbnail';
import { SEO_CONFIG } from '@/seo/config';
import { availableLandings, findLanding, landingDesignerHref, landingOgImage } from '@/content/designerLandings';
import { findTemplate } from '@/lib/boxDesigner/templates';
import { templateArtUrl } from '@/lib/boxDesigner/templateArt';
import { getStyle } from '@/lib/boxDesigner/styles';

export default function BoxDesignerLanding() {
  const { style: slug } = useParams();
  const landing = findLanding(slug);
  if (!landing) return <Navigate to="/box-designer" replace />;
  const style0 = getStyle(landing.style);

  // Template landings show the template's colour and sample art; preset landings use the preset
  const template = findTemplate(landing.templateId);
  const baseDims = template?.dimensions ?? landing.preset?.dims ?? style0.defaultDims;
  const baseColour = template?.colorHex ?? landing.preset?.colorHex ?? '#C9A87C';
  const style = style0;
  const url = `${SEO_CONFIG.siteUrl}/box-designer/${landing.slug}`;
  const all = availableLandings();
  const related = (landing.related ?? []).map((r) => all.find((l) => l.slug === r)).filter((l): l is NonNullable<typeof l> => !!l);
  const others = all.filter((l) => l.slug !== landing.slug && !related.includes(l));
  const designerHref = landingDesignerHref(landing);

  return (
    <Layout>
      <MetaTags
        title={landing.metaTitle}
        description={landing.metaDescription}
        keywords={landing.keywords}
        canonical={url}
        image={landingOgImage(landing.slug)}
      />
      <StructuredData
        type="FAQPage"
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: landing.faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
        }}
      />
      <StructuredData
        type="BreadcrumbList"
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SEO_CONFIG.siteUrl },
            { '@type': 'ListItem', position: 2, name: '3D Box Designer', item: `${SEO_CONFIG.siteUrl}/box-designer` },
            { '@type': 'ListItem', position: 3, name: landing.name, item: url },
          ],
        }}
      />

      {/* Hero */}
      <Section name="designer-landing-hero" className="paper-grain border-b border-border">
        <div className="mx-auto grid max-w-content items-center gap-10 px-4 py-14 md:grid-cols-[1.1fr_0.9fr] md:px-6 md:py-20 lg:px-10">
          <div>
            <nav aria-label="Breadcrumb" className="label-mono mb-4 text-muted-foreground">
              <Link to="/box-designer" className="hover:text-foreground">
                3D Box Designer
              </Link>{' '}
              / {landing.name}
            </nav>
            <h1 className="max-w-[18ch] text-balance font-display text-display-l">{landing.h1}</h1>
            <p className="mt-4 max-w-[58ch] text-body-l text-muted-foreground">{landing.intro}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Cta id={`designer.landing.${landing.slug}.open`} intent="designer" href={designerHref} arrow size="lg">
                Design my {landing.name.toLowerCase()}
              </Cta>
              <Cta id={`designer.landing.${landing.slug}.wizard`} intent="designer" variant="secondary" href="/box-designer?wizard=1">
                Not sure? Find my box
              </Cta>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Free · no sign-up · dieline and spec sheet included</p>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-md rounded-3xl bg-paper-100 p-10 shadow-inner">
            <BoxThumbnail
              style={landing.style}
              dimensions={baseDims}
              colorHex={baseColour}
              artUrl={template?.art ? templateArtUrl(template.art.id) : null}
              className="h-full w-full drop-shadow-xl"
              title={`${landing.name} illustration`}
            />
          </div>
        </div>
      </Section>

      {/* Best for + tips */}
      <Section name="designer-landing-about" className="section-y">
        <div className="mx-auto grid max-w-content gap-10 px-4 md:grid-cols-2 md:px-6 lg:px-10">
          <div>
            <h2 className="font-display text-h3">What a {landing.name.toLowerCase()} is good for</h2>
            <p className="mt-2 text-muted-foreground">
              {style.name}
              {style.fefco ? ` · FEFCO ${style.fefco}` : ''}. {style.bestFor}.
            </p>
            <ul className="mt-5 space-y-2.5">
              {landing.bestFor.map((b) => (
                <li key={b} className="flex gap-2.5">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-h3">Tips for a better box</h2>
            <ol className="mt-5 space-y-3">
              {landing.tips.map((t, i) => (
                <li key={t} className="flex gap-3">
                  <span className="label-mono flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">{i + 1}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {/* Benefits */}
      {landing.benefits && landing.benefits.length > 0 && (
        <Section name="designer-landing-benefits" className="border-t border-border section-y">
          <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
            <h2 className="font-display text-h3">Why choose a {landing.name.toLowerCase()}</h2>
            <ul className="mt-5 grid gap-4 md:grid-cols-3">
              {landing.benefits.map((b, i) => (
                <li key={b} className="rounded-xl border border-border bg-card p-5">
                  <span className="label-mono flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">{i + 1}</span>
                  <p className="mt-3">{b}</p>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      {/* Typical sizes */}
      <Section name="designer-landing-sizes" className="border-y border-border bg-paper-100 section-y">
        <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
          <h2 className="font-display text-h3">Start from a common size</h2>
          <p className="mt-2 text-muted-foreground">Inside dimensions. Open one and change anything.</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {landing.sizes.map((s) => (
              <li key={s.label}>
                <Link
                  to={landingDesignerHref(landing, s.dims)}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-quick hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md motion-reduce:hover:translate-y-0"
                >
                  <BoxThumbnail style={landing.style} dimensions={s.dims} colorHex={baseColour} className="h-16 w-16 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{s.label}</span>
                    <span className="block text-sm tabular text-muted-foreground">
                      {s.dims.length} × {s.dims.width} × {s.dims.height} cm
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-quick group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* FAQ */}
      <Section name="designer-landing-faq" className="section-y">
        <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
          <h2 className="label-mono text-muted-foreground">Questions</h2>
          <Accordion type="single" collapsible className="mt-4 max-w-3xl">
            {landing.faqs.map((f, i) => (
              <AccordionItem key={f.question} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base hover:no-underline">{f.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {related.length > 0 && (
            <div className="mt-14">
              <h2 className="font-display text-h3">Related boxes</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {related.map((o) => (
                  <li key={o.slug}>
                    <Link to={`/box-designer/${o.slug}`} className="inline-flex rounded-full border border-primary/40 bg-primary/5 px-4 py-2 text-sm hover:border-primary">
                      {o.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {others.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-h3">Other boxes you can design</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link to={`/box-designer/${o.slug}`} className="inline-flex rounded-full border border-border px-4 py-2 text-sm hover:border-foreground/40">
                      {o.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>
    </Layout>
  );
}
