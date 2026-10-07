/**
 * /blogs: featured first article, category chips and client-side search (plan §9.7).
 * SECURITY: the search text stays in component state and is only compared with static post metadata;
 * it is never written to the URL, stored or sent anywhere, and never rendered as HTML.
 */

import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import Layout from '@/components/Layout';
import PageTransition from '@/components/PageTransition';
import BlogCard from '@/components/BlogCard';
import CategoryFilter from '@/components/CategoryFilter';
import { PageHero } from '@/components/pages/PageHero';
import { CtaBand } from '@/components/pages/CtaBand';
import { Section } from '@/components/site/Section';
import { Cta } from '@/components/site/Cta';
import { BLOG_CATEGORIES, BLOG_POSTS, type BlogCategory } from '@/constants/blogs';
import { FACTS } from '@/content/facts';
import { quoteHref } from '@/lib/quotePrefill';
import { MetaTags, StructuredData, SEO_CONFIG } from '@/seo';
import { PAGE_METADATA } from '@/seo/metadata/pages';
import { getBreadcrumbSchema, PAGE_BREADCRUMBS } from '@/seo/schema';

const norm = (value: string) => value.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}\s]/gu, ' ');

/** Newest first (ISO dates sort lexically) */
const byNewest = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));

const Blogs = () => {
  const [activeCategory, setActiveCategory] = useState<BlogCategory>('All');
  const [query, setQuery] = useState('');

  const counts = useMemo(
    () =>
      Object.fromEntries(
        BLOG_CATEGORIES.map((c) => [c, c === 'All' ? BLOG_POSTS.length : BLOG_POSTS.filter((p) => p.category === c).length])
      ) as Record<BlogCategory, number>,
    []
  );

  const terms = useMemo(() => norm(query).split(/\s+/).filter(Boolean), [query]);
  const filtered = useMemo(
    () =>
      byNewest.filter((post) => {
        if (activeCategory !== 'All' && post.category !== activeCategory) return false;
        if (terms.length === 0) return true;
        const haystack = norm(`${post.title} ${post.description} ${post.category}`);
        return terms.every((term) => haystack.includes(term));
      }),
    [activeCategory, terms]
  );

  // The first article in the list is the pillar guide; it leads the page until the reader filters or searches
  const unfiltered = activeCategory === 'All' && terms.length === 0;
  const featured = unfiltered ? BLOG_POSTS[0] : undefined;
  const grid = featured ? filtered.filter((p) => p.slug !== featured.slug) : filtered;
  const clear = () => {
    setQuery('');
    setActiveCategory('All');
  };

  return (
    <Layout>
      <MetaTags {...PAGE_METADATA.blogs} canonical={`${SEO_CONFIG.siteUrl}/blogs`} />
      <StructuredData type="BreadcrumbList" data={getBreadcrumbSchema(PAGE_BREADCRUMBS.blogs)} />

      <PageTransition>
        <PageHero
          name="blogs-hero"
          index="Blog — packaging guides"
          title="Corrugated packaging guides"
          lead="Plain-language guides on choosing the right board, understanding strength tests and sizing your boxes."
        />

        <Section name="blogs-list" aria-labelledby="articles-heading" className="pb-16 md:pb-24">
          <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
            <h2 id="articles-heading" className="sr-only">
              Articles
            </h2>

            <div className="flex flex-col gap-4 border-y border-border py-5 lg:flex-row lg:items-center lg:justify-between">
              <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} counts={counts} />

              <div role="search" className="relative w-full lg:max-w-xs">
                <label htmlFor="blog-search" className="sr-only">
                  Search articles
                </label>
                <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="blog-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value.slice(0, 80))}
                  placeholder="Search articles"
                  autoComplete="off"
                  className="min-h-11 w-full rounded-lg border border-input bg-background pl-10 pr-10 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-search-cancel-button]:hidden"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X aria-hidden="true" className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <p role="status" aria-live="polite" className="tabular mt-5 text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
              {activeCategory !== 'All' && ` in ${activeCategory}`}
              {terms.length > 0 && ` matching "${query.trim()}"`}
            </p>

            {featured && (
              <div className="mt-6">
                <BlogCard post={featured} variant="featured" />
              </div>
            )}

            {grid.length > 0 && (
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {grid.map((post) => (
                  <li key={post.slug}>
                    <BlogCard post={post} />
                  </li>
                ))}
              </ul>
            )}

            {filtered.length === 0 && (
              <div className="mt-6 rounded-[14px] border border-dashed border-foreground/25 p-8 text-center md:p-12">
                <p className="font-display text-h3 font-semibold">No articles found.</p>
                <p className="mx-auto mt-2 max-w-[48ch] text-muted-foreground">Try another word or category, or ask us directly.</p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={clear}
                    className="inline-flex min-h-11 items-center rounded-lg border border-foreground/20 px-5 text-sm font-semibold hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Show all articles
                  </button>
                  <Cta id="blogs.empty.quote" intent="quote" href={quoteHref({ src: 'blogs.empty' })} arrow>
                    Get a quote
                  </Cta>
                </div>
              </div>
            )}
          </div>
        </Section>

        <CtaBand
          name="blogs-cta"
          title="Need expert guidance on your packaging?"
          lead="Tell us what you ship and we will recommend the board, size and print."
          note={`${FACTS.samplePolicy}. ${FACTS.businessHours}.`}
        >
          <Cta id="blogs.band.quote" intent="quote" size="lg" href={quoteHref({ src: 'blogs.band' })} arrow>
            Get a quote
          </Cta>
          <Cta id="blogs.band.finder" intent="finder" variant="secondary" size="lg" href="/compare-quote">
            Find my spec
          </Cta>
        </CtaBand>
      </PageTransition>
    </Layout>
  );
};

export default Blogs;
