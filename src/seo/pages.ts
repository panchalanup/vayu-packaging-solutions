/**
 * The list of every indexable page on the site, with the SEO data each one needs.
 * One source for: sitemap.xml, the build-time prerender (static HTML for crawlers), llms.txt and the SEO tests.
 * Pure data (no React, no fs): the markdown reader is injected, so this runs in Node, in Vite SSR and in tests.
 *
 * ADDING A PAGE: add the route in src/App.tsx, then add it here (static page) or to its registry
 * (blog post -> src/constants/blogs.ts; designer landing -> src/content/designerLandings*.ts; product / industry ->
 * src/content/*). A test fails if a registry entry has no sitemap entry.
 */

import { BLOG_POSTS, type BlogPost } from '@/constants/blogs';
import { PRODUCTS } from '@/content/products';
import { INDUSTRY_PAGES } from '@/content/industries';
import { LOCATION_FAQS } from '@/content/locations';
import { FACTS } from '@/content/facts';
import { HOME_FAQ } from '@/content/home';
import { TOOL_PAGES, TOOLS_INDEX_PATH } from '@/content/toolPages';
import { availableLandings, landingOgImage, type DesignerLanding } from '@/content/designerLandings';
import { extractFaqs, countWords, readingMinutes, stripFrontmatter, stripLeadingTitle } from '@/lib/blogMarkdown';
import { SEO_CONFIG } from './config';
import { getToolHowToSchema, getToolWebApplicationSchema } from './schema/tool';
import { PAGE_METADATA } from './metadata/pages';
import { BLOG_SEO_METADATA } from './metadata/blogs';
import { getProductMetadata } from './metadata/products';
import { buildFullTitle, canonicalFor, resolveOgImagePath } from './meta';
import {
  getArticleSchema,
  getBlogBreadcrumbs,
  getBlogIndexSchema,
  getBoxDesignerBreadcrumbSchema,
  getBoxDesignerFAQSchema,
  getBoxDesignerHowToSchema,
  getBoxDesignerSchema,
  getBreadcrumbSchema,
  getFAQSchema,
  getLocalBusinessSchema,
  getOrganizationSchema,
  getProductBreadcrumbs,
  getProductCatalogSchema,
  getProductDetailSchema,
  getProductListSchema,
  getSoftwareApplicationSchema,
  getToolFAQSchema,
  getWebSiteSchema,
  PAGE_BREADCRUMBS,
} from './schema';

export type PageKind =
  | 'home'
  | 'about'
  | 'services'
  | 'products'
  | 'product'
  | 'industry'
  | 'locations'
  | 'contact'
  | 'quote'
  | 'finder'
  | 'tools'
  | 'tool'
  | 'designer'
  | 'landing'
  | 'blogs'
  | 'blog'
  | 'privacy'
  | 'credits';

export type ChangeFreq = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface SeoPage {
  kind: PageKind;
  /** Route path, e.g. "/blogs/flute-types-guide" ("/" for home) */
  path: string;
  /** Registry slug for blog / product / industry / landing pages */
  slug?: string;
  /** Final <title> text (brand suffix included) */
  title: string;
  description: string;
  keywords: string[];
  /** Share image path ("/blog-images/x-og.png"); always one that exists */
  image: string;
  ogType: 'website' | 'article';
  /** YYYY-MM-DD */
  lastmod: string;
  changefreq: ChangeFreq;
  priority: number;
  jsonLd: object[];
  noindex?: boolean;
  /** Extra images for the image sitemap */
  images?: { path: string; title: string }[];
  /** Article only */
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

/**
 * Last material content change per static page (YYYY-MM-DD). Bump the date when a page's copy changes in a way a
 * searcher would care about; Google only trusts lastmod when it is accurate, so do not bump it for cosmetic edits.
 */
export const STATIC_LASTMOD = {
  about: '2026-10-27',
  services: '2026-10-27',
  products: '2026-10-27',
  contact: '2026-10-27',
  finder: '2026-10-27',
  tools: '2026-10-27',
  quote: '2026-10-27',
  locations: '2026-10-27',
  credits: '2026-10-27',
  privacy: '2026-10-27',
  landings: '2026-10-27',
} as const;

const latest = (dates: string[]) => dates.reduce((a, b) => (b > a ? b : a), '1970-01-01');

export const postLastmod = (post: BlogPost): string => post.updated ?? post.date;

export interface SeoPageOptions {
  /** Returns the markdown of a blog post (without reading from the network). Needed for FAQ and word-count schema. */
  readBlogMarkdown?: (slug: string) => string | undefined;
}

const breadcrumb = (items: { name: string; url: string }[]) => getBreadcrumbSchema(items);

function metaFor(key: keyof typeof PAGE_METADATA): { title: string; description: string; keywords: string[]; image: string } {
  const m = PAGE_METADATA[key];
  return { title: buildFullTitle(m.title), description: m.description, keywords: m.keywords, image: resolveOgImagePath(undefined) };
}

function landingPage(landing: DesignerLanding): SeoPage {
  const url = `${SEO_CONFIG.siteUrl}/box-designer/${landing.slug}`;
  const image = resolveOgImagePath(landingOgImage(landing.slug));
  return {
    kind: 'landing',
    path: `/box-designer/${landing.slug}`,
    slug: landing.slug,
    title: buildFullTitle(landing.metaTitle),
    description: landing.metaDescription,
    keywords: landing.keywords,
    image,
    ogType: 'website',
    lastmod: STATIC_LASTMOD.landings,
    changefreq: 'monthly',
    priority: 0.8,
    images: image === SEO_CONFIG.defaultImage ? undefined : [{ path: image, title: landing.metaTitle }],
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: landing.faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      },
      breadcrumb([
        { name: 'Home', url: '/' },
        { name: '3D Box Designer', url: '/box-designer' },
        { name: landing.name, url: `/box-designer/${landing.slug}` },
      ]),
    ],
  };
}

function blogPage(post: BlogPost, raw: string | undefined): SeoPage {
  // Same text the article page renders (frontmatter and the duplicate H1 removed), so counts match the live schema
  const md = raw === undefined ? undefined : stripLeadingTitle(stripFrontmatter(raw), post.title);
  const seo = BLOG_SEO_METADATA[post.slug];
  const image = resolveOgImagePath(seo?.ogImage);
  const faqs = md ? extractFaqs(md) : [];
  const jsonLd: object[] = [
    getArticleSchema(post, seo?.ogImage, {
      keywords: seo?.keywords,
      wordCount: md ? countWords(md) : undefined,
      readingMinutes: md ? readingMinutes(md) : undefined,
    }),
    getBreadcrumbSchema(getBlogBreadcrumbs(post.title, post.slug)),
  ];
  if (faqs.length > 0) jsonLd.push(getFAQSchema(faqs));
  return {
    kind: 'blog',
    path: `/blogs/${post.slug}`,
    slug: post.slug,
    title: buildFullTitle(post.title),
    description: seo?.metaDescription ?? post.description,
    keywords: seo?.keywords ?? [],
    image,
    ogType: 'article',
    lastmod: postLastmod(post),
    changefreq: 'monthly',
    priority: 0.7,
    images: image === SEO_CONFIG.defaultImage ? undefined : [{ path: image, title: post.title }],
    publishedTime: post.date,
    modifiedTime: postLastmod(post),
    author: post.author,
    jsonLd,
  };
}

/** Every indexable page, in sitemap order */
export function getSeoPages(options: SeoPageOptions = {}): SeoPage[] {
  const read = options.readBlogMarkdown;
  const blogDate = latest(BLOG_POSTS.map(postLastmod));
  const pages: SeoPage[] = [];

  pages.push({
    kind: 'home',
    path: '/',
    ...metaFor('home'),
    ogType: 'website',
    lastmod: latest([blogDate, STATIC_LASTMOD.products]),
    changefreq: 'weekly',
    priority: 1.0,
    jsonLd: [
      getOrganizationSchema(),
      getWebSiteSchema(),
      getLocalBusinessSchema(),
      breadcrumb(PAGE_BREADCRUMBS.home),
      getProductCatalogSchema(),
      getFAQSchema(HOME_FAQ),
    ],
  });

  pages.push({ kind: 'about', path: '/about', ...metaFor('about'), ogType: 'website', lastmod: STATIC_LASTMOD.about, changefreq: 'monthly', priority: 0.8, jsonLd: [breadcrumb(PAGE_BREADCRUMBS.about)] });
  pages.push({ kind: 'services', path: '/services', ...metaFor('services'), ogType: 'website', lastmod: STATIC_LASTMOD.services, changefreq: 'monthly', priority: 0.9, jsonLd: [breadcrumb(PAGE_BREADCRUMBS.services)] });
  pages.push({
    kind: 'products',
    path: '/products',
    ...metaFor('products'),
    ogType: 'website',
    lastmod: STATIC_LASTMOD.products,
    changefreq: 'monthly',
    priority: 0.9,
    jsonLd: [breadcrumb(PAGE_BREADCRUMBS.products), getProductListSchema()],
  });
  pages.push({
    kind: 'blogs',
    path: '/blogs',
    ...metaFor('blogs'),
    ogType: 'website',
    lastmod: blogDate,
    changefreq: 'weekly',
    priority: 0.9,
    jsonLd: [breadcrumb(PAGE_BREADCRUMBS.blogs), getBlogIndexSchema(BLOG_POSTS)],
  });
  pages.push({
    kind: 'contact',
    path: '/contact',
    ...metaFor('contact'),
    ogType: 'website',
    lastmod: STATIC_LASTMOD.contact,
    changefreq: 'monthly',
    priority: 0.8,
    jsonLd: [getLocalBusinessSchema(), breadcrumb(PAGE_BREADCRUMBS.contact)],
  });
  pages.push({
    kind: 'finder',
    path: '/compare-quote',
    ...metaFor('packagingFinder'),
    ogType: 'website',
    lastmod: STATIC_LASTMOD.finder,
    changefreq: 'monthly',
    priority: 0.8,
    jsonLd: [getSoftwareApplicationSchema(), breadcrumb([{ name: 'Home', url: '/' }, { name: 'Packaging Finder', url: '/compare-quote' }]), getToolFAQSchema()],
  });
  pages.push({
    kind: 'tools',
    path: TOOLS_INDEX_PATH,
    ...metaFor('tools'),
    ogType: 'website',
    lastmod: STATIC_LASTMOD.tools,
    changefreq: 'monthly',
    priority: 0.8,
    jsonLd: [
      breadcrumb([{ name: 'Home', url: '/' }, { name: 'Free tools', url: TOOLS_INDEX_PATH }]),
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Free packaging calculators',
        itemListElement: TOOL_PAGES.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, url: `${SEO_CONFIG.siteUrl}${t.path}` })),
      },
    ],
  });
  for (const tool of TOOL_PAGES) {
    pages.push({
      kind: 'tool',
      path: tool.path,
      slug: tool.slug,
      title: buildFullTitle(tool.metaTitle),
      description: tool.metaDescription,
      keywords: tool.keywords,
      image: SEO_CONFIG.defaultImage,
      ogType: 'website',
      lastmod: STATIC_LASTMOD.tools,
      changefreq: 'monthly',
      priority: 0.8,
      jsonLd: [
        getToolWebApplicationSchema(tool),
        getToolHowToSchema(tool),
        getFAQSchema(tool.faqs),
        breadcrumb([{ name: 'Home', url: '/' }, { name: 'Free tools', url: TOOLS_INDEX_PATH }, { name: tool.name, url: tool.path }]),
      ],
    });
  }
  pages.push({
    kind: 'designer',
    path: '/box-designer',
    ...metaFor('boxDesigner'),
    ogType: 'website',
    lastmod: latest([blogDate, STATIC_LASTMOD.landings]),
    changefreq: 'weekly',
    priority: 0.9,
    jsonLd: [getBoxDesignerSchema(), getBoxDesignerFAQSchema(), getBoxDesignerBreadcrumbSchema(), getBoxDesignerHowToSchema()],
  });

  for (const landing of availableLandings()) pages.push(landingPage(landing));

  pages.push({
    kind: 'quote',
    path: '/quote',
    title: buildFullTitle('Get a quote | Vayu Packaging Solutions'),
    description: 'Tell us what you ship. Corrugated boxes from 500 units, stock sizes dispatched in 48 hours from Ahmedabad.',
    keywords: [],
    image: SEO_CONFIG.defaultImage,
    ogType: 'website',
    lastmod: STATIC_LASTMOD.quote,
    changefreq: 'monthly',
    priority: 0.8,
    jsonLd: [breadcrumb([{ name: 'Home', url: '/' }, { name: 'Get a quote', url: '/quote' }])],
  });
  pages.push({
    kind: 'locations',
    path: '/locations',
    ...metaFor('locations'),
    ogType: 'website',
    lastmod: STATIC_LASTMOD.locations,
    changefreq: 'monthly',
    priority: 0.7,
    jsonLd: [breadcrumb(PAGE_BREADCRUMBS.locations), getFAQSchema([...LOCATION_FAQS])],
  });

  for (const product of PRODUCTS) {
    const meta = getProductMetadata(product);
    pages.push({
      kind: 'product',
      path: `/products/${product.slug}`,
      slug: product.slug,
      title: buildFullTitle(meta.title),
      description: meta.description,
      keywords: meta.keywords,
      image: SEO_CONFIG.defaultImage,
      ogType: 'website',
      lastmod: STATIC_LASTMOD.products,
      changefreq: 'monthly',
      priority: 0.8,
      jsonLd: [getProductDetailSchema(product), getBreadcrumbSchema(getProductBreadcrumbs(product.name, product.slug)), getFAQSchema(product.faq)],
    });
  }

  for (const industry of INDUSTRY_PAGES) {
    const path = `/industries/${industry.slug}`;
    pages.push({
      kind: 'industry',
      path,
      slug: industry.slug,
      title: buildFullTitle(`${industry.name} Packaging | Corrugated Boxes by Vayu Packaging Solutions`),
      description: `${industry.problem} Vayu Packaging recommends ${industry.spec}: ${industry.metaFocus}. Minimum order ${FACTS.moqBoxes} boxes, GST invoice.`,
      keywords: [`${industry.name} packaging`, `${industry.name} corrugated boxes`, 'corrugated boxes Gujarat', 'Vayu Packaging Solutions'],
      image: SEO_CONFIG.defaultImage,
      ogType: 'website',
      lastmod: STATIC_LASTMOD.services,
      changefreq: 'monthly',
      priority: 0.7,
      jsonLd: [
        breadcrumb([{ name: 'Home', url: '/' }, { name: 'Industries & Services', url: '/services' }, { name: industry.name, url: path }]),
        getFAQSchema(industry.faqs),
      ],
    });
  }

  for (const post of BLOG_POSTS) pages.push(blogPage(post, read?.(post.slug)));

  pages.push({ kind: 'credits', path: '/image-credits', title: buildFullTitle('Image credits'), description: 'Authors, licences and sources for the photographs used on the Vayu Packaging Solutions website.', keywords: [], image: SEO_CONFIG.defaultImage, ogType: 'website', lastmod: STATIC_LASTMOD.credits, changefreq: 'yearly', priority: 0.2, jsonLd: [breadcrumb([{ name: 'Home', url: '/' }, { name: 'Image credits', url: '/image-credits' }])] });
  pages.push({ kind: 'privacy', path: '/privacy', title: buildFullTitle('Privacy notice'), description: 'How Vayu Packaging Solutions handles the details you send us and website analytics.', keywords: [], image: SEO_CONFIG.defaultImage, ogType: 'website', lastmod: STATIC_LASTMOD.privacy, changefreq: 'yearly', priority: 0.3, jsonLd: [breadcrumb([{ name: 'Home', url: '/' }, { name: 'Privacy notice', url: '/privacy' }])] });

  return pages;
}

export const canonicalOf = (page: SeoPage): string => canonicalFor(page.path);
