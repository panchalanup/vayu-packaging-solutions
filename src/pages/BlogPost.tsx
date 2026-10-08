/**
 * /blogs/:slug: article page (plan §9.7).
 * SECURITY:
 * - The slug is validated against the BLOG_POSTS list before it is used to build the fetch URL, so it can never
 *   point at another path.
 * - Markdown is rendered with react-markdown + rehype-raw (kept deliberately for the existing articles). Because raw
 *   HTML is enabled, dangerous elements are disallowed and every link and image URL is allow-listed by scheme
 *   (see src/lib/blogMarkdown.ts); unsafe URLs are dropped, never rendered.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { AlertTriangle, Calendar, Clock, RefreshCw, User } from 'lucide-react';
import Layout from '@/components/Layout';
import PageTransition from '@/components/PageTransition';
import ShareButtons from '@/components/ShareButtons';
import BlogCard from '@/components/BlogCard';
import { CategoryChip, formatBlogDate } from '@/components/BlogMeta';
import ReadingProgress from '@/components/ReadingProgress';
import TableOfContents from '@/components/TableOfContents';
import { CtaBand } from '@/components/pages/CtaBand';
import { Section } from '@/components/site/Section';
import { Cta } from '@/components/site/Cta';
import { SectionHeader } from '@/components/site/Blocks';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { BLOG_AUTHOR, getBlogBySlug, getRelatedBlogs } from '@/constants/blogs';
import { BLOG_IMAGES, BLOG_IMAGE_CREDITS } from '@/constants/images';
import { ImageCredit } from '@/components/site/ImageCredit';
import { pickBlogCta } from '@/content/blogCtas';
import { FACTS } from '@/content/facts';
import { classifyHref, isSafeImageSrc, looksLikeHtmlShell, splitAtMidHeading, stripFrontmatter, stripLeadingTitle } from '@/lib/blogMarkdown';
import { quoteHref } from '@/lib/quotePrefill';
import { pageWhatsAppMessage, whatsappHref } from '@/lib/contactLinks';
import '@/styles/blog.css';
import { MetaTags, StructuredData, SEO_CONFIG } from '@/seo';
import { BLOG_SEO_METADATA } from '@/seo/metadata/blogs';
import { getArticleSchema, getBlogBreadcrumbs, getBreadcrumbSchema } from '@/seo/schema';

type Status = 'loading' | 'ready' | 'error';

/** Elements that must never reach the DOM even though raw HTML is enabled */
const DISALLOWED = ['script', 'iframe', 'object', 'embed', 'style', 'form'];

const markdownComponents: Components = {
  // The page title is the only H1; stray "# " headings in an article become H2 so the outline stays valid
  h1: ({ node: _node, ...props }) => <h2 {...props} />,
  table: ({ node: _node, children, ...props }) => (
    <div className="table-wrapper">
      <table {...props}>{children}</table>
    </div>
  ),
  // Real images (the old renderer replaced every image with a placeholder). Only safe sources are rendered.
  img: ({ node: _node, src, alt, title }) =>
    isSafeImageSrc(src) ? <img src={src} alt={alt ?? ''} title={title} loading="lazy" decoding="async" /> : null,
  a: ({ node: _node, href, children, ...props }) => {
    switch (classifyHref(href)) {
      case 'internal':
        return (
          <Link to={href as string} {...props}>
            {children}
          </Link>
        );
      case 'external':
        return (
          <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
            {children}
          </a>
        );
      case 'anchor':
      case 'contact':
        return (
          <a href={href} {...props}>
            {children}
          </a>
        );
      default:
        // Unsafe scheme (javascript:, data:, http:, protocol-relative): keep the text, drop the link
        return <span>{children}</span>;
    }
  },
};

function Markdown({ children }: { children: string }) {
  return (
    <article className="medium-article">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        disallowedElements={DISALLOWED}
        components={markdownComponents}
      >
        {children}
      </ReactMarkdown>
    </article>
  );
}

function ArticleSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading article" className="min-h-[60vh] animate-pulse space-y-4 motion-reduce:animate-none">
      <div className="h-6 w-2/3 rounded bg-foreground/10" />
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} className={`h-4 rounded bg-foreground/10 ${i % 4 === 3 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  );
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogBySlug(slug) : undefined;
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<Status>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!post) return;
    const controller = new AbortController();
    setStatus('loading');
    window.scrollTo(0, 0);

    (async () => {
      try {
        // post.slug comes from our own list, never from the raw URL
        const response = await fetch(`/content/blogs/${post.slug}.md`, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();
        if (looksLikeHtmlShell(text)) throw new Error('Received the app shell instead of markdown');
        setContent(stripLeadingTitle(stripFrontmatter(text), post.title));
        setStatus('ready');
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Error loading blog content:', error);
        setStatus('error');
      }
    })();

    return () => controller.abort();
  }, [post, attempt]);

  const parts = useMemo(() => splitAtMidHeading(content), [content]);

  if (!post) return <Navigate to="/blogs" replace />;

  const relatedPosts = getRelatedBlogs(post.slug, 3);
  const featuredImage = BLOG_IMAGES[post.thumbnail as keyof typeof BLOG_IMAGES] || BLOG_IMAGES.defaultThumbnail;
  const featuredCredit = BLOG_IMAGE_CREDITS[post.thumbnail as keyof typeof BLOG_IMAGE_CREDITS];
  const seoData = BLOG_SEO_METADATA[post.slug];
  const url = `${SEO_CONFIG.siteUrl}/blogs/${post.slug}`;
  const midCta = pickBlogCta(post.slug);

  return (
    <Layout>
      <MetaTags
        title={post.title}
        description={seoData?.metaDescription ?? post.description}
        keywords={seoData?.keywords}
        canonical={url}
        type="article"
        publishedTime={post.date}
        author={post.author}
      />
      <StructuredData type="Article" data={getArticleSchema(post)} />
      <StructuredData type="BreadcrumbList" data={getBreadcrumbSchema(getBlogBreadcrumbs(post.title, post.slug))} />

      <ReadingProgress />

      <PageTransition>
        <Section name="blog-hero" aria-labelledby="page-title" className="pb-8 pt-6 md:pb-12 md:pt-8">
          <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/blogs">Blog</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="min-w-0">
                  <BreadcrumbPage className="block max-w-[28ch] truncate sm:max-w-[48ch]">{post.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <header className="mt-8 max-w-4xl">
              <CategoryChip category={post.category} />
              <h1 id="page-title" className="mt-5 font-display text-h2 text-balance">
                {post.title}
              </h1>
              <p className="mt-4 max-w-[68ch] text-body-l text-muted-foreground">{post.description}</p>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <User aria-hidden="true" className="h-4 w-4" />
                  {post.author}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar aria-hidden="true" className="h-4 w-4" />
                  <time dateTime={post.date}>{formatBlogDate(post.date, true)}</time>
                </span>
                <span className="flex items-center gap-2">
                  <Clock aria-hidden="true" className="h-4 w-4" />
                  {post.readingTime}
                </span>
              </div>

              <div className="mt-6 border-t border-border pt-6">
                <ShareButtons url={url} title={post.title} description={post.description} />
              </div>
            </header>

            <div className="blog-featured-image-wrapper mt-8">
              <img
                src={featuredImage}
                alt={`${featuredCredit ? 'Photo' : 'Illustration'} for the article: ${post.title}`}
                width={1600}
                height={900}
                className="blog-featured-image"
                decoding="async"
              />
              {featuredCredit && <ImageCredit credit={featuredCredit} variant="inline" className="mt-2 block" />}
            </div>
          </div>
        </Section>

        <Section name="blog-body" className="pb-16 md:pb-24">
          <div className="mx-auto grid max-w-content gap-6 px-4 md:px-6 lg:grid-cols-12 lg:gap-12 lg:px-10">
            {/* ToC first in the DOM so phones get "On this page" above the article; placed to the right on desktop */}
            <aside className="lg:col-span-3 lg:col-start-10 lg:row-start-1" aria-label="Article navigation">
              {status === 'ready' && <TableOfContents content={content} className="lg:h-full" />}
            </aside>

            <div className="min-w-0 lg:col-span-9 lg:row-start-1 xl:col-span-8">
              {status === 'loading' && <ArticleSkeleton />}

              {status === 'error' && (
                <div role="alert" className="rounded-[14px] border border-border bg-card p-6 md:p-8">
                  <AlertTriangle aria-hidden="true" className="h-6 w-6 text-warning-700" />
                  <h2 className="mt-3 font-display text-h3 font-semibold">We could not load this article.</h2>
                  <p className="mt-2 max-w-[56ch] text-muted-foreground">
                    Check your connection and try again. If it keeps failing, you can read our other guides or message us.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAttempt((n) => n + 1)}
                      className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <RefreshCw aria-hidden="true" className="h-4 w-4" />
                      Try again
                    </button>
                    <Cta id={`blog.${post.slug}.error.all`} intent="navigate" variant="secondary" href="/blogs">
                      All articles
                    </Cta>
                  </div>
                </div>
              )}

              {status === 'ready' && (
                <>
                  <Markdown>{parts[0]}</Markdown>

                  {parts.length > 1 && (
                    <>
                      {/* Mid-article spec card, chosen by the article's tags */}
                      <aside
                        aria-label="Related product"
                        data-theme="kraft"
                        className="my-10 rounded-[14px] border border-border bg-background p-6 text-foreground md:p-8"
                      >
                        <p className="label-mono text-muted-foreground">{midCta.eyebrow}</p>
                        <p className="mt-2 font-display text-h3 font-semibold">{midCta.title}</p>
                        <p className="mt-2 max-w-[56ch] text-muted-foreground">{midCta.body}</p>
                        <Cta
                          id={`blog.${post.slug}.mid`}
                          intent={midCta.intent}
                          href={midCta.href(post.slug)}
                          meta={{ blog: post.slug, tag: midCta.tag }}
                          className="mt-5"
                          arrow
                        >
                          {midCta.label}
                        </Cta>
                      </aside>
                      <Markdown>{parts[1]}</Markdown>
                    </>
                  )}
                </>
              )}

              {/* Author box */}
              <aside aria-label="About the author" className="mt-12 flex gap-4 rounded-[14px] border border-border bg-card p-5 md:p-6">
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink-900 font-display text-sm font-semibold text-paper-50"
                >
                  VP
                </span>
                <div>
                  <p className="label-mono text-muted-foreground">Written by</p>
                  {/* VERIFY-LATER[BLOG-01]: replace the team byline with the founder's name and role once supplied. */}
                  <p className="mt-1 font-semibold">{post.author}</p>
                  <p className="text-sm text-muted-foreground">{FACTS.legalName}, {FACTS.city}</p>
                  <p className="mt-2 max-w-[60ch] text-sm text-muted-foreground">{BLOG_AUTHOR.bio}</p>
                  <Cta id={`blog.${post.slug}.author.about`} intent="navigate" variant="link" href="/about" className="mt-2" arrow>
                    About Vayu
                  </Cta>
                </div>
              </aside>

              <div className="mt-8 flex flex-col items-start justify-between gap-4 border-y border-border py-6 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold">Found this article helpful?</p>
                  <p className="text-sm text-muted-foreground">Share it with your team.</p>
                </div>
                <ShareButtons url={url} title={post.title} description={post.description} />
              </div>
            </div>
          </div>
        </Section>

        {relatedPosts.length > 0 && (
          <Section name="blog-related" theme="kraft" aria-labelledby="related-heading" className="section-y">
            <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
              <SectionHeader
                id="related-heading"
                index="Keep reading"
                title="Related articles"
                lead={`More from ${post.category}.`}
              />
              <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((related) => (
                  <li key={related.slug}>
                    <BlogCard post={related} />
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        )}

        <CtaBand
          name="blog-cta"
          title="Ready to discuss your packaging?"
          lead="Tell us what you ship. We recommend the spec, sample it and quote it."
          note={`${FACTS.samplePolicy}. ${FACTS.businessHours}.`}
        >
          <Cta id={`blog.${post.slug}.end.quote`} intent="quote" size="lg" href={quoteHref({ src: `blog.${post.slug}` })} arrow>
            Get a quote
          </Cta>
          <Cta
            id={`blog.${post.slug}.end.whatsapp`}
            intent="whatsapp"
            variant="whatsapp"
            size="lg"
            href={whatsappHref(pageWhatsAppMessage(`/blogs/${post.slug}`, post.title))}
          >
            WhatsApp us
          </Cta>
        </CtaBand>
      </PageTransition>
    </Layout>
  );
};

export default BlogPost;
