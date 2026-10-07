/**
 * /products: filterable range (plan §9.3). Filtering is client-side over src/content/products.ts.
 * SECURITY: filter values come from the URL (?ply=5&type=…) so each one is checked against an allow-list
 * before use; they are only ever compared with static data, never rendered as HTML.
 * SEO: the canonical is fixed to /products so filter query strings never become indexable URLs, and the
 * ItemList schema describes the full range, which is what the page shows before any filter is applied.
 */

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import PageTransition from '@/components/PageTransition';
import { MetaTags, StructuredData, SEO_CONFIG } from '@/seo';
import { PAGE_METADATA } from '@/seo/metadata/pages';
import { getBreadcrumbSchema, getProductListSchema, PAGE_BREADCRUMBS } from '@/seo/schema';
import { Section } from '@/components/site/Section';
import { Cta } from '@/components/site/Cta';
import { FactStrip } from '@/components/site/Blocks';
import { PageHero } from '@/components/pages/PageHero';
import { CtaBand } from '@/components/pages/CtaBand';
import { ProductCard } from '@/components/pages/ProductCard';
import {
  PRODUCTS,
  PRODUCT_TYPE_LABELS,
  INDUSTRY_NAMES,
  type PlyNumber,
  type ProductType,
  type IndustrySlug,
} from '@/content/products';
import type { MadeOrSourced } from '@/components/site/Blocks';
import { INDUSTRY_SLUGS } from '@/lib/quoteSchema';
import { FACTS } from '@/content/facts';
import { quoteHref } from '@/lib/quotePrefill';
import { whatsappHref, pageWhatsAppMessage } from '@/lib/contactLinks';
import { cn } from '@/lib/utils';

type FilterKey = 'ply' | 'type' | 'industry' | 'source';

interface Option {
  value: string;
  label: string;
}

const PLY_OPTIONS: Option[] = [
  { value: '3', label: '3-ply' },
  { value: '5', label: '5-ply' },
  { value: '7', label: '7-ply' },
];
const TYPE_OPTIONS: Option[] = (Object.keys(PRODUCT_TYPE_LABELS) as ProductType[]).map((value) => ({
  value,
  label: PRODUCT_TYPE_LABELS[value],
}));
const INDUSTRY_OPTIONS: Option[] = INDUSTRY_SLUGS.map((value) => ({ value, label: INDUSTRY_NAMES[value] }));
const SOURCE_OPTIONS: Option[] = [
  { value: 'made', label: 'Custom-made' },
  { value: 'sourced', label: 'Sourced & QC-checked' },
];

const GROUPS: { key: FilterKey; label: string; options: Option[] }[] = [
  { key: 'ply', label: 'Ply', options: PLY_OPTIONS },
  { key: 'type', label: 'Type', options: TYPE_OPTIONS },
  { key: 'industry', label: 'Industry', options: INDUSTRY_OPTIONS },
  { key: 'source', label: 'Made or sourced', options: SOURCE_OPTIONS },
];

/** Reads one filter from the URL, accepting only values in its allow-list */
const readFilter = (params: URLSearchParams, key: FilterKey): string | null => {
  const raw = params.get(key);
  const group = GROUPS.find((g) => g.key === key);
  return raw && group?.options.some((o) => o.value === raw) ? raw : null;
};

export default function Products() {
  const [params, setParams] = useSearchParams();

  const active = useMemo(
    () => ({
      ply: readFilter(params, 'ply'),
      type: readFilter(params, 'type'),
      industry: readFilter(params, 'industry'),
      source: readFilter(params, 'source'),
    }),
    [params]
  );
  const activeCount = Object.values(active).filter(Boolean).length;

  const results = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          (!active.ply || p.plies.includes(Number(active.ply) as PlyNumber)) &&
          (!active.type || p.type === (active.type as ProductType)) &&
          (!active.industry || p.industries.includes(active.industry as IndustrySlug)) &&
          (!active.source || p.madeOrSourced === (active.source as MadeOrSourced))
      ),
    [active]
  );

  const toggle = useCallback(
    (key: FilterKey, value: string) => {
      const next = new URLSearchParams(params);
      if (next.get(key) === value) next.delete(key);
      else next.set(key, value);
      setParams(next, { replace: true, preventScrollReset: true });
    },
    [params, setParams]
  );

  const clear = useCallback(() => setParams({}, { replace: true, preventScrollReset: true }), [setParams]);

  return (
    <Layout>
      <MetaTags {...PAGE_METADATA.products} canonical={`${SEO_CONFIG.siteUrl}/products`} />
      <StructuredData type="BreadcrumbList" data={getBreadcrumbSchema(PAGE_BREADCRUMBS.products)} />
      <StructuredData type="ItemList" data={getProductListSchema()} />

      <PageTransition>
        <PageHero
          name="products-hero"
          index={`Products — ${PRODUCTS.length} items`}
          title="Corrugated boxes and packaging supplies"
          lead="3, 5 and 7-ply boxes in your size, die-cut and printed boxes, and the tape, film and strapping that go with them. Every item is labelled as custom-made or sourced and QC-checked."
          actions={
            <>
              <Cta id="products.hero.quote" intent="quote" size="lg" href={quoteHref({ src: 'products.hero' })} arrow>
                Get a quote
              </Cta>
              <Cta id="products.hero.finder" intent="finder" variant="secondary" size="lg" href="/compare-quote">
                Find my spec
              </Cta>
            </>
          }
          footer={
            <FactStrip
              facts={[
                { label: 'MOQ', value: `${FACTS.moqBoxes} boxes` },
                { label: 'Dispatch', value: `${FACTS.dispatchHours} hrs stock sizes*` },
                { label: 'Invoice', value: 'GST' },
              ]}
            />
          }
        />

        <Section name="products-range" aria-labelledby="range-heading" className="pb-16 md:pb-24">
          <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
            <h2 id="range-heading" className="sr-only">
              Product range
            </h2>

            <div
              role="group"
              aria-label="Filter products"
              className="grid grid-cols-1 gap-5 border-y border-border py-6 sm:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_auto] lg:gap-x-10"
            >
              {GROUPS.map((group) => (
                <div key={group.key} role="group" aria-labelledby={`filter-${group.key}`}>
                  <p id={`filter-${group.key}`} className="label-mono mb-2.5 text-muted-foreground">
                    {group.label}
                  </p>
                  <div className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:py-0">
                    {group.options.map((option) => {
                      const pressed = active[group.key] === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={pressed}
                          onClick={() => toggle(group.key, option.value)}
                          className={cn(
                            'min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors duration-quick ease-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                            pressed
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-foreground/20 hover:border-foreground/50'
                          )}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex min-h-11 flex-wrap items-center justify-between gap-3">
              <p role="status" aria-live="polite" className="tabular text-sm text-muted-foreground">
                Showing {results.length} of {PRODUCTS.length} products
              </p>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={clear}
                  className="min-h-11 rounded-md px-2 text-sm font-semibold text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Clear filters
                </button>
              )}
            </div>

            {results.length > 0 ? (
              <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((product) => (
                  <li key={product.slug}>
                    <ProductCard product={product} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-[14px] border border-dashed border-foreground/25 p-8 text-center md:p-12">
                <p className="font-display text-h3 font-semibold">No product matches all of those filters.</p>
                <p className="mx-auto mt-2 max-w-[52ch] text-muted-foreground">
                  Clear a filter, or tell us what you ship and we will recommend a spec.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={clear}
                    className="inline-flex min-h-11 items-center rounded-lg border border-foreground/20 px-5 text-sm font-semibold hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Clear filters
                  </button>
                  <Cta id="products.empty.quote" intent="quote" href={quoteHref({ src: 'products.empty' })} arrow>
                    Get a quote
                  </Cta>
                </div>
              </div>
            )}

            <p className="mt-8 text-sm text-muted-foreground">*{FACTS.dispatchFootnote} Custom sizes take longer; see each product.</p>
          </div>
        </Section>

        <CtaBand
          name="products-cta"
          title="Not sure which board you need?"
          lead="Tell us what you ship, the weight and the size. We recommend the ply, sample it and quote it."
          note={`${FACTS.samplePolicy}. ${FACTS.businessHours}.`}
        >
          <Cta id="products.band.quote" intent="quote" size="lg" href={quoteHref({ src: 'products.band' })} arrow>
            Get a quote
          </Cta>
          <Cta
            id="products.band.whatsapp"
            intent="whatsapp"
            variant="whatsapp"
            size="lg"
            href={whatsappHref(pageWhatsAppMessage('/products'))}
          >
            WhatsApp us
          </Cta>
        </CtaBand>
      </PageTransition>
    </Layout>
  );
}
