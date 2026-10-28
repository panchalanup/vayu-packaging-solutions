/**
 * Free calculator pages: /tools/:slug. One template, six calculators (lazy-loaded per slug).
 * All copy is static (src/content/toolPages.ts); JSON-LD is serialised by StructuredData. Everything runs in the browser.
 */

import { lazy, Suspense, useEffect, type ComponentType, type LazyExoticComponent } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, Lock, Zap } from 'lucide-react';
import Layout from '@/components/Layout';
import { Section } from '@/components/site/Section';
import { Cta } from '@/components/site/Cta';
import MetaTags from '@/components/SEO/MetaTags';
import { StructuredData } from '@/components/SEO/StructuredData';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getBlogBySlug } from '@/constants/blogs';
import { SEO_CONFIG } from '@/seo/config';
import { getFAQSchema } from '@/seo/schema/faq';
import { getBreadcrumbSchema } from '@/seo/schema/breadcrumb';
import { getToolHowToSchema, getToolWebApplicationSchema } from '@/seo/schema/tool';
import { getToolPage, TOOL_PAGES, TOOLS_INDEX_PATH } from '@/content/toolPages';
import { useEventTracker } from '@/hooks/useAnalytics';

const CALCULATORS: Record<string, LazyExoticComponent<ComponentType>> = {
  'volumetric-weight-calculator': lazy(() => import('@/components/tools/calculators/VolumetricCalculator')),
  'cbm-calculator': lazy(() => import('@/components/tools/calculators/CbmCalculator')),
  'box-size-calculator': lazy(() => import('@/components/tools/calculators/BoxSizeCalculator')),
  'box-strength-calculator': lazy(() => import('@/components/tools/calculators/BoxStrengthCalculator')),
  'box-weight-calculator': lazy(() => import('@/components/tools/calculators/BoxWeightCalculator')),
  'packaging-cost-calculator': lazy(() => import('@/components/tools/calculators/PackagingCostCalculator')),
};

const CalculatorFallback = () => (
  <div className="flex min-h-[24rem] items-center justify-center rounded-2xl border border-border bg-card" role="status" aria-label="Loading calculator">
    <span aria-hidden="true" className="h-6 w-6 animate-spin rounded-full border-2 border-ink-900/15 border-t-green-600" />
  </div>
);

export default function ToolPage() {
  const { slug } = useParams();
  const tool = getToolPage(slug);
  const { trackEvent } = useEventTracker();

  // tool_open: the calculator page was opened (tool slug only)
  useEffect(() => {
    if (tool) trackEvent('tool_open', { tool: tool.slug });
    // trackEvent is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool?.slug]);

  if (!tool || !CALCULATORS[tool.slug]) return <Navigate to={TOOLS_INDEX_PATH} replace />;
  const Calculator = CALCULATORS[tool.slug];
  const url = `${SEO_CONFIG.siteUrl}${tool.path}`;
  const blogs = tool.relatedBlogs.map((s) => getBlogBySlug(s)).filter((b): b is NonNullable<typeof b> => !!b);
  const tools = tool.relatedTools.map((s) => TOOL_PAGES.find((t) => t.slug === s)).filter((t): t is NonNullable<typeof t> => !!t);

  return (
    <Layout>
      <MetaTags title={tool.metaTitle} description={tool.metaDescription} keywords={tool.keywords} canonical={url} />
      <StructuredData type="SoftwareApplication" data={getToolWebApplicationSchema(tool)} />
      <StructuredData type="HowTo" data={getToolHowToSchema(tool)} />
      <StructuredData type="FAQPage" data={getFAQSchema(tool.faqs)} />
      <StructuredData
        type="BreadcrumbList"
        data={getBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Free tools', url: TOOLS_INDEX_PATH },
          { name: tool.name, url: tool.path },
        ])}
      />

      {/* Answer, formula, trust line */}
      <Section name="tool-hero" className="paper-grain border-b border-border">
        <div className="mx-auto max-w-content px-4 py-10 md:px-6 md:py-14 lg:px-10">
          <nav aria-label="Breadcrumb" className="label-mono mb-4 text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>{' '}
            /{' '}
            <Link to={TOOLS_INDEX_PATH} className="hover:text-foreground">
              Free tools
            </Link>{' '}
            / {tool.name}
          </nav>
          <h1 className="max-w-[24ch] text-balance font-display text-display-l">{tool.h1}</h1>
          <p className="mt-4 max-w-[62ch] text-body-l text-muted-foreground">{tool.answer}</p>
          <p className="mt-4 max-w-[70ch] rounded-lg border border-border bg-card px-4 py-3 font-mono text-sm">{tool.formula}</p>
          <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-primary" aria-hidden="true" /> Free, no sign-up
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-primary" aria-hidden="true" /> Runs in your browser; nothing is stored or sent
            </span>
          </p>
        </div>
      </Section>

      {/* Calculator */}
      <Section name="tool-calculator" id="calculator" className="section-y">
        <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
          <h2 className="sr-only">{tool.name}</h2>
          <Suspense fallback={<CalculatorFallback />}>
            <Calculator />
          </Suspense>
        </div>
      </Section>

      {/* How it works and worked example */}
      <Section name="tool-how" className="border-y border-border bg-paper-100 section-y">
        <div className="mx-auto grid max-w-content gap-10 px-4 md:grid-cols-2 md:px-6 lg:px-10">
          <div>
            <h2 className="font-display text-h3">How to use it</h2>
            <ol className="mt-5 space-y-3">
              {tool.howTo.steps.map((s, i) => (
                <li key={s.name} className="flex gap-3">
                  <span className="label-mono flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">{i + 1}</span>
                  <span>
                    <span className="font-semibold">{s.name}.</span> <span className="text-muted-foreground">{s.text}</span>
                  </span>
                </li>
              ))}
            </ol>
            {tool.formulaNote && <p className="mt-5 text-sm text-muted-foreground">{tool.formulaNote}</p>}
          </div>
          <div>
            <h2 className="font-display text-h3">Worked example</h2>
            <div className="mt-5 rounded-2xl border border-border bg-card p-5">
              <p className="font-semibold">{tool.example.title}</p>
              <ul className="mt-3 space-y-2 text-sm">
                {tool.example.steps.map((s) => (
                  <li key={s} className="flex gap-2.5">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-lg bg-paper-100 p-3 text-sm font-medium">{tool.example.result}</p>
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section name="tool-faq" className="section-y">
        <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
          <h2 className="label-mono text-muted-foreground">Questions</h2>
          <Accordion type="single" collapsible className="mt-4 max-w-3xl">
            {tool.faqs.map((f, i) => (
              <AccordionItem key={f.question} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base hover:no-underline">{f.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* Related tools and reading */}
      <Section name="tool-related" className="border-t border-border bg-paper-100 section-y">
        <div className="mx-auto grid max-w-content gap-10 px-4 md:grid-cols-2 md:px-6 lg:px-10">
          <div>
            <h2 className="font-display text-h3">More free tools</h2>
            <ul className="mt-4 space-y-2.5">
              {tools.map((t) => (
                <li key={t.slug}>
                  <Link to={t.path} className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/60">
                    <span>
                      <span className="block font-semibold">{t.name}</span>
                      <span className="block text-sm text-muted-foreground">{t.summary}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-quick group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/box-designer" className="group flex items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/5 p-4 hover:border-primary">
                  <span>
                    <span className="block font-semibold">3D Box Designer</span>
                    <span className="block text-sm text-muted-foreground">Design the box in 3D, see the dieline and an indicative price.</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-display text-h3">Read next</h2>
            <ul className="mt-4 space-y-2.5">
              {blogs.map((b) => (
                <li key={b.slug}>
                  <Link to={`/blogs/${b.slug}`} className="group block rounded-xl border border-border bg-card p-4 hover:border-primary/60">
                    <span className="block font-semibold">{b.title}</span>
                    <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">{b.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Cta id={`tools.${tool.slug}.footer-quote`} intent="quote" href={`/quote?src=tools.${tool.slug}`} arrow meta={{ tool: tool.slug }}>
                Talk to us about your boxes
              </Cta>
            </div>
          </div>
        </div>
      </Section>
    </Layout>
  );
}
