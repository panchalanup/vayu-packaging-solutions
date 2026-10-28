/** /tools: index of the free calculators. Static copy from src/content/toolPages.ts. */

import { Link } from 'react-router-dom';
import { ArrowRight, Boxes, Calculator, Container, Gauge, Layers, Ruler, Scale, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Layout from '@/components/Layout';
import { Section } from '@/components/site/Section';
import { Cta } from '@/components/site/Cta';
import MetaTags from '@/components/SEO/MetaTags';
import { StructuredData } from '@/components/SEO/StructuredData';
import { SEO_CONFIG } from '@/seo/config';
import { PAGE_METADATA } from '@/seo/metadata/pages';
import { getBreadcrumbSchema } from '@/seo/schema/breadcrumb';
import { TOOL_PAGES, TOOLS_INDEX_PATH } from '@/content/toolPages';

const ICONS: Record<string, LucideIcon> = {
  'volumetric-weight-calculator': Scale,
  'cbm-calculator': Container,
  'box-size-calculator': Ruler,
  'box-strength-calculator': Gauge,
  'box-weight-calculator': Layers,
  'packaging-cost-calculator': Wallet,
};

const META = PAGE_METADATA.tools;

export default function ToolsIndex() {
  const url = `${SEO_CONFIG.siteUrl}${TOOLS_INDEX_PATH}`;
  return (
    <Layout>
      <MetaTags
        title={META.title}
        description={META.description}
        keywords={META.keywords}
        canonical={url}
      />
      <StructuredData
        type="BreadcrumbList"
        data={getBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Free tools', url: TOOLS_INDEX_PATH },
        ])}
      />
      <StructuredData
        type="ItemList"
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Free packaging calculators',
          itemListElement: TOOL_PAGES.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, url: `${SEO_CONFIG.siteUrl}${t.path}` })),
        }}
      />

      <Section name="tools-hero" className="paper-grain border-b border-border">
        <div className="mx-auto max-w-content px-4 py-12 md:px-6 md:py-16 lg:px-10">
          <nav aria-label="Breadcrumb" className="label-mono mb-4 text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>{' '}
            / Free tools
          </nav>
          <h1 className="max-w-[20ch] text-balance font-display text-display-l">Free packaging calculators</h1>
          <p className="mt-4 max-w-[62ch] text-body-l text-muted-foreground">
            Work out volumetric weight, CBM, the right box size, stacking strength and packaging cost. Each answer ends with the box itself: open the size in 3D or ask for a quote.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">Free · no sign-up · runs in your browser; nothing is stored or sent</p>
        </div>
      </Section>

      <Section name="tools-grid" className="section-y">
        <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TOOL_PAGES.map((t) => {
              const Icon = ICONS[t.slug] ?? Calculator;
              return (
                <li key={t.slug}>
                  <Link
                    to={t.path}
                    className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-quick hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md motion-reduce:hover:translate-y-0"
                  >
                    <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                    <span className="mt-3 block font-display text-lg">{t.name}</span>
                    <span className="mt-1.5 block flex-1 text-sm text-muted-foreground">{t.summary}</span>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      Open calculator <ArrowRight className="h-4 w-4 transition-transform duration-quick group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl border border-primary/30 bg-paper-100 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <Boxes className="mt-0.5 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="font-display text-lg">Know the size already?</p>
                <p className="text-sm text-muted-foreground">Design the box in 3D, see its dieline and an indicative price.</p>
              </div>
            </div>
            <Cta id="tools.index.designer" intent="designer" href="/box-designer?src=tools.index" arrow>
              Open the 3D Box Designer
            </Cta>
          </div>
        </div>
      </Section>
    </Layout>
  );
}
