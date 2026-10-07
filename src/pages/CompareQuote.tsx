/**
 * Packaging Finder (/compare-quote, §9.8). The URL stays, the UI is called "Packaging Finder".
 * Hand-off: reads ?l,w,h,ply,style,qty and location.state.boxDesign; results lead to /quote (pre-filled) or 3D.
 * SECURITY: query params and router state are untrusted and parsed in src/lib/finderPrefill.ts (allow-lists and
 * numeric ranges). Analytics events carry the board and category only, never free text or personal data.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import Layout from '@/components/Layout';
import { InputForm } from '@/components/CompareQuote/InputForm';
import { ResultsOverview } from '@/components/CompareQuote/ResultsOverview';
import { loadPackagingData, getUniqueCategories, getUniqueTransportTypes } from '@/lib/csvParser';
import { matchAndScoreOptions } from '@/lib/matchingEngine';
import { parseFinderPrefill } from '@/lib/finderPrefill';
import type { PackagingOption, UserInput, ScoredResult } from '@/types/packaging';
import type { PlyType } from '@/types/boxDesigner';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MetaTags, StructuredData } from '@/seo';
import { PAGE_METADATA } from '@/seo/metadata/pages';
import { getSoftwareApplicationSchema, getToolFAQSchema, PACKAGING_TOOL_FAQS } from '@/seo/schema';
import { WEBSITE_URL } from '@/constants';
import { Section } from '@/components/site/Section';
import { Cta } from '@/components/site/Cta';
import { useEventTracker } from '@/hooks/useAnalytics';
import { prefersReducedMotion } from '@/lib/motion/tokens';

interface Outcome {
  results: ScoredResult[];
  input: UserInput;
  plyFallback: boolean;
}

const STEPS_COPY = [
  ['01', 'Product', 'Tell us what you pack and how fragile it is.'],
  ['02', 'Size & weight', 'Add the size and weight if you know them.'],
  ['03', 'Handling & quantity', 'How it ships and how many you need.'],
] as const;

export default function CompareQuote() {
  const location = useLocation();
  const { trackEvent } = useEventTracker();
  const prefill = useMemo(() => parseFinderPrefill(location.search, location.state), [location.search, location.state]);

  const [data, setData] = useState<PackagingOption[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [transportTypes, setTransportTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [plyFilter, setPlyFilter] = useState<PlyType | null>(prefill.ply ?? null);
  const resultsHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let cancelled = false;
    loadPackagingData()
      .then((packagingData) => {
        if (cancelled) return;
        setData(packagingData);
        setCategories(getUniqueCategories(packagingData));
        setTransportTypes(getUniqueTransportTypes(packagingData));
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Failed to load packaging data. Please refresh the page.');
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // A new link (for example from the Home page or the 3D designer) resets the board filter
  useEffect(() => {
    setPlyFilter(prefill.ply ?? null);
  }, [prefill.ply]);

  const defaults = useMemo<Partial<UserInput>>(
    () => ({
      length_mm: prefill.length_mm,
      width_mm: prefill.width_mm,
      height_mm: prefill.height_mm,
      ...(prefill.quantity ? { quantity: prefill.quantity } : {}),
    }),
    [prefill]
  );
  const hasPrefilledSize = !!(prefill.length_mm || prefill.width_mm || prefill.height_mm);

  const handleSearch = (input: UserInput) => {
    // Matching 1,500 rows takes a few milliseconds, so there is no artificial delay
    const pool = plyFilter ? data.filter((item) => item.board_type === plyFilter) : data;
    let results = matchAndScoreOptions(pool, input);
    let plyFallback = false;
    if (results.length === 0 && plyFilter) {
      results = matchAndScoreOptions(data, input);
      plyFallback = results.length > 0;
    }
    setOutcome({ results, input, plyFallback });
    trackEvent('finder_result', {
      ply: results[0]?.board_type ?? 'none',
      category: results[0]?.product_category ?? 'none',
      matches: results.length,
    });
  };

  // Bring the results into view and tell assistive tech where we are
  useEffect(() => {
    if (!outcome) return;
    const frame = requestAnimationFrame(() => {
      resultsHeading.current?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      resultsHeading.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [outcome]);

  const toolMeta = PAGE_METADATA.packagingFinder;
  const optionCount = data.length ? data.length.toLocaleString('en-IN') : '';

  return (
    <Layout>
      <MetaTags
        title={toolMeta.title}
        description={toolMeta.description}
        keywords={toolMeta.keywords}
        canonical={`${WEBSITE_URL}/compare-quote`}
      />
      <StructuredData type="SoftwareApplication" data={getSoftwareApplicationSchema()} />
      {/* The FAQ below is visible on the page, so its FAQPage schema stays valid */}
      <StructuredData type="FAQPage" data={getToolFAQSchema()} />

      <Section name="finder-hero" className="paper-grain">
        <div className="mx-auto max-w-content px-4 pb-8 pt-12 md:px-6 md:pb-12 md:pt-20 lg:px-10">
          <p className="label-mono mb-4 text-muted-foreground">Packaging Finder · Free</p>
          <h1 className="max-w-3xl text-balance font-display text-display-l">Find the right box for your product.</h1>
          <p className="mt-4 max-w-[60ch] text-body-l text-muted-foreground">
            Answer three short steps. We match your product against {optionCount ? `${optionCount} ` : ''}packaging specs in our database and show the top three, with an indicative price.
          </p>
        </div>
      </Section>

      <Section name="finder-tool" className="pb-12 pt-8 md:pb-16 md:pt-12">
        <div className="mx-auto grid max-w-content gap-10 px-4 md:px-6 lg:grid-cols-12 lg:gap-12 lg:px-10">
          <aside className="lg:col-span-4">
            <h2 className="label-mono text-muted-foreground">How it works</h2>
            <ol className="mt-4 divide-y divide-border border-y border-border">
              {STEPS_COPY.map(([n, title, text]) => (
                <li key={n} className="flex gap-4 py-4">
                  <span className="label-mono pt-1 text-green-700">{n}</span>
                  <span>
                    <span className="block font-semibold">{title}</span>
                    <span className="block text-sm text-muted-foreground">{text}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-sm text-muted-foreground">
              Prefer to talk it through?{' '}
              <Cta id="finder.aside.contact" intent="navigate" variant="link" href="/contact">
                Contact us
              </Cta>
            </p>
          </aside>

          <div className="min-w-0 lg:col-span-8" data-hide-fab>
            {error && (
              <p role="alert" className="mb-4 rounded-lg border border-error-700/40 p-4 text-sm text-error-700">
                {error}
              </p>
            )}

            {(plyFilter || hasPrefilledSize) && (
              <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
                {hasPrefilledSize && (
                  <span className="rounded-md border border-foreground/15 px-3 py-1.5">
                    Size filled in from your link. Check it and adjust.
                  </span>
                )}
                {plyFilter && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-primary/40 py-1 pl-3 pr-1">
                    Showing {plyFilter} boards
                    <button
                      type="button"
                      onClick={() => setPlyFilter(null)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`Show all board types instead of ${plyFilter} only`}
                    >
                      <X aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {isLoading ? (
              <Skeleton className="h-[520px] w-full rounded-lg" />
            ) : (
              <InputForm
                key={`${location.search}|${location.key}`}
                categories={categories}
                transportTypes={transportTypes}
                defaults={defaults}
                onStart={() => trackEvent('finder_start', { ply: plyFilter ?? 'any', source: hasPrefilledSize ? 'handoff' : 'direct' })}
                onSubmit={handleSearch}
              />
            )}
          </div>
        </div>
      </Section>

      {outcome && (
        <Section name="finder-results" theme="kraft" className="section-y" aria-labelledby="finder-results-heading">
          <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
            <p className="label-mono text-muted-foreground">Your matches</p>
            <h2 id="finder-results-heading" ref={resultsHeading} tabIndex={-1} className="mt-3 font-display text-h2 outline-none">
              {outcome.results.length ? `Top ${outcome.results.length} for ${outcome.input.product_name}` : 'No close match'}
            </h2>
            {outcome.plyFallback && plyFilter && (
              <p className="mt-2 text-sm text-muted-foreground">No {plyFilter} option fit those details, so we searched all board types.</p>
            )}
            <div className="mt-8" aria-live="polite">
              <ResultsOverview results={outcome.results} input={outcome.input} />
            </div>
          </div>
        </Section>
      )}

      <Section name="finder-faq" className="section-y" aria-labelledby="finder-faq-heading">
        <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
          <h2 id="finder-faq-heading" className="label-mono text-muted-foreground">
            Questions
          </h2>
          <Accordion type="single" collapsible className="mt-4 grid gap-x-10 md:grid-cols-2">
            {PACKAGING_TOOL_FAQS.map((faq, i) => (
              <AccordionItem key={faq.question} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base hover:no-underline">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>
    </Layout>
  );
}
