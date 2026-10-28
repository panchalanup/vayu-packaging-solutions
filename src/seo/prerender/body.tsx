/* eslint-disable no-restricted-syntax, react-refresh/only-export-components -- static HTML for crawlers: plain <a href> is intended, and the file is never part of the app bundle */
/**
 * Content shells for the prerendered pages: semantic HTML (headings, text, internal links) built from the same
 * content modules the live pages read, so what crawlers get without JavaScript matches what visitors see after it.
 * The shell is shown until the React app is ready, then removed (src/lib/prerender.ts); it is never hydrated.
 * Plain elements only (no app components), so it stays small and cannot break on browser-only code.
 */

import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BLOG_POSTS, getBlogBySlug, type BlogPost } from '@/constants/blogs';
import { BLOG_SEO_METADATA } from '@/seo/metadata/blogs';
import { PRODUCTS, getProduct, getRelatedProducts, industryName, moqLabel } from '@/content/products';
import { INDUSTRY_PAGES, findIndustry, productHref } from '@/content/industries';
import { HOME_FAQ, PROCESS_STEPS } from '@/content/home';
import { CITIES, LOCATION_FAQS, SEO_PARAGRAPHS } from '@/content/locations';
import { ALL_LANDINGS, availableLandings, findLanding, landingDesignerHref, type DesignerLanding } from '@/content/designerLandings';
import { FACTS, FACT_STATS } from '@/content/facts';
import { TOOL_PAGES, getToolPage, TOOLS_INDEX_PATH, type ToolPage } from '@/content/toolPages';
import { CONTACT_INFO } from '@/constants';
import { PACKAGING_TOOL_FAQS } from '@/seo/schema/softwareApplication';
import { BOX_DESIGNER_FAQS } from '@/seo/schema/boxDesigner';
import { getStyle } from '@/lib/boxDesigner/styles';
import { findTemplate } from '@/lib/boxDesigner/templates';
import { quoteHref } from '@/lib/quotePrefill';
import { designerTargetSlug, getAdjacentPosts, getDesignerCard, getRelatedByTags } from '@/lib/blogRelated';
import { countWords, readingMinutes, stripFrontmatter, stripLeadingTitle } from '@/lib/blogMarkdown';
import { SEO_CONFIG } from '@/seo/config';
import { getBoxDesignerHowToSchema } from '@/seo/schema';
import { postLastmod, type SeoPage } from '@/seo/pages';
import { renderArticleHtml } from './markdown';

export interface BodyContext {
  /** Raw markdown of a blog post (with frontmatter), by slug */
  readBlogMarkdown: (slug: string) => string | undefined;
}

const NAV: [string, string][] = [
  ['Home', '/'],
  ['Products', '/products'],
  ['Industries and services', '/services'],
  ['3D Box Designer', '/box-designer'],
  ['Free tools', '/tools'],
  ['Packaging Finder', '/compare-quote'],
  ['Blog', '/blogs'],
  ['Locations', '/locations'],
  ['About', '/about'],
  ['Contact', '/contact'],
  ['Get a quote', '/quote'],
];

const Chrome = ({ children }: { children: ReactNode }) => {
  const newest = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  return (
    <>
      <header>
        <p>
          <a href="/">{SEO_CONFIG.siteName}</a>
        </p>
        <nav aria-label="Main">
          <ul>
            {NAV.map(([label, href]) => (
              <li key={href}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <nav aria-label="Products">
          <h2>Products</h2>
          <ul>
            {PRODUCTS.map((p) => (
              <li key={p.slug}>
                <a href={`/products/${p.slug}`}>{p.name}</a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Industries">
          <h2>Industries</h2>
          <ul>
            {INDUSTRY_PAGES.map((i) => (
              <li key={i.slug}>
                <a href={`/industries/${i.slug}`}>{i.name} packaging</a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Box styles">
          <h2>Design a box in 3D</h2>
          <ul>
            {availableLandings().map((l) => (
              <li key={l.slug}>
                <a href={`/box-designer/${l.slug}`}>{l.name} designer</a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Free tools">
          <h2>Free packaging calculators</h2>
          <ul>
            {TOOL_PAGES.map((t) => (
              <li key={t.slug}>
                <a href={t.path}>{t.name}</a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Latest guides">
          <h2>Latest guides</h2>
          <ul>
            {newest.map((p) => (
              <li key={p.slug}>
                <a href={`/blogs/${p.slug}`}>{p.title}</a>
              </li>
            ))}
            <li>
              <a href="/blogs">All guides</a>
            </li>
          </ul>
        </nav>
        <p>
          {FACTS.legalName}, {FACTS.addressFull}. {CONTACT_INFO.phone}. {CONTACT_INFO.email}.
        </p>
      </footer>
    </>
  );
};

const Crumbs = ({ items }: { items: [string, string?][] }) => (
  <nav aria-label="Breadcrumb">
    <ol>
      {items.map(([label, href], i) => (
        <li key={label + i}>{href ? <a href={href}>{label}</a> : label}</li>
      ))}
    </ol>
  </nav>
);

const Faqs = ({ title = 'Frequently asked questions', faqs }: { title?: string; faqs: readonly { question: string; answer: string }[] }) =>
  faqs.length === 0 ? null : (
    <section>
      <h2>{title}</h2>
      {faqs.map((f) => (
        <div key={f.question}>
          <h3>{f.question}</h3>
          <p>{f.answer}</p>
        </div>
      ))}
    </section>
  );

const Links = ({ title, items }: { title: string; items: { href: string; label: string; note?: string }[] }) => (
  <section>
    <h2>{title}</h2>
    <ul>
      {items.map((i) => (
        <li key={i.href}>
          <a href={i.href}>{i.label}</a>
          {i.note ? ` - ${i.note}` : ''}
        </li>
      ))}
    </ul>
  </section>
);

const formatDate = (date: string): string => {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? date : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
};

const postLink = (p: BlogPost) => ({ href: `/blogs/${p.slug}`, label: p.title, note: p.description });

// ---------------------------------------------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------------------------------------------

function Home() {
  const guides = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  return (
    <>
      <p>Corrugated boxes &amp; packaging supplies · {FACTS.city}</p>
      <h1>Corrugated boxes, engineered to your spec — and everything you need to ship them.</h1>
      <p>
        3, 5 &amp; 7-ply · printed · die-cut · food-grade, plus tapes, stretch film &amp; strapping. One partner, one invoice, delivered across Gujarat and India.
      </p>
      <p>
        <a href="/quote">Get a quote</a> · <a href="/box-designer">Design a box in 3D, free</a> · <a href="/compare-quote">Find my box spec</a>
      </p>
      <ul>
        {FACT_STATS.map((s) => (
          <li key={s.label}>
            {s.value}
            {s.suffix} {s.label}
          </li>
        ))}
      </ul>
      <Links title="Our range" items={PRODUCTS.map((p) => ({ href: `/products/${p.slug}`, label: p.name, note: `${p.keySpec}. ${moqLabel(p)}` }))} />
      <section>
        <h2>Packaging by industry</h2>
        <ul>
          {INDUSTRY_PAGES.map((i) => (
            <li key={i.slug}>
              <a href={`/industries/${i.slug}`}>{i.name}</a>: {i.problem} We recommend {i.spec}. {i.why}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>From dieline to dispatch</h2>
        <ol>
          {PROCESS_STEPS.map((s) => (
            <li key={s.n}>
              <strong>{s.title}.</strong> {s.body}
            </li>
          ))}
        </ol>
      </section>
      <Links
        title="Free packaging tools"
        items={[
          { href: '/box-designer', label: '3D Box Designer', note: 'Set the size, pick the board, add your logo, watch the box fold and download the dieline.' },
          { href: '/compare-quote', label: 'Packaging Finder', note: 'Answer three short steps and get the top three box specs with an indicative price.' },
          { href: '/tools', label: 'Packaging calculators', note: 'Volumetric weight, CBM, box size, box strength, box weight and packaging cost.' },
        ]}
      />
      <Links title="Packaging guides" items={guides.map(postLink)} />
      <Faqs faqs={HOME_FAQ} />
    </>
  );
}

function About({ page }: { page: SeoPage }) {
  return (
    <>
      <Crumbs items={[['Home', '/'], ['About']]} />
      <h1>About {FACTS.legalName}</h1>
      <p>{page.description}</p>
      <ul>
        {FACT_STATS.map((s) => (
          <li key={s.label}>
            {s.value}
            {s.suffix} {s.label}
          </li>
        ))}
      </ul>
      <section>
        <h2>Company details</h2>
        <ul>
          <li>Legal name: {FACTS.legalName}</li>
          <li>Registered address: {FACTS.addressFull}</li>
          <li>Minimum order: {FACTS.moqBoxes} boxes</li>
          <li>Business hours: {FACTS.businessHours}</li>
          <li>Reply time: {FACTS.replySla}</li>
        </ul>
      </section>
      <Links
        title="Explore"
        items={[
          { href: '/products', label: 'Products' },
          { href: '/services', label: 'Industries and services' },
          { href: '/locations', label: 'Where we deliver' },
          { href: '/contact', label: 'Contact us' },
        ]}
      />
    </>
  );
}

function Services({ page }: { page: SeoPage }) {
  return (
    <>
      <Crumbs items={[['Home', '/'], ['Industries and services']]} />
      <h1>Packaging built around what you ship.</h1>
      <p>{page.description}</p>
      <section>
        <h2>Industries we pack for</h2>
        <ul>
          {INDUSTRY_PAGES.map((i) => (
            <li key={i.slug}>
              <a href={`/industries/${i.slug}`}>{i.name}</a>: {i.intro}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>What we do</h2>
        <ul>
          <li>Custom sizing: boxes cut to your product dimensions in 3, 5 or 7 ply.</li>
          <li>Printing: flexo print in 1–4 colours; printed orders start at 1,000 boxes.</li>
          <li>Sampling: {FACTS.samplePolicy}.</li>
          <li>Scheduled replenishment: a regular supply of boxes and supplies.</li>
        </ul>
      </section>
      <p>
        <a href={quoteHref({ src: 'services' })}>Get a quote</a>
      </p>
    </>
  );
}

function Products({ page }: { page: SeoPage }) {
  return (
    <>
      <Crumbs items={[['Home', '/'], ['Products']]} />
      <h1>Corrugated boxes and packaging supplies</h1>
      <p>{page.description}</p>
      <ul>
        {PRODUCTS.map((p) => (
          <li key={p.slug}>
            <a href={`/products/${p.slug}`}>{p.name}</a>: {p.short} {p.keySpec}. {moqLabel(p)}. {p.leadTime}.
          </li>
        ))}
      </ul>
      <p>
        Not sure which box? Try the <a href="/compare-quote">Packaging Finder</a> or <a href="/box-designer">design it in 3D</a>.
      </p>
    </>
  );
}

function ProductDetail({ slug }: { slug: string }) {
  const product = getProduct(slug);
  if (!product) return null;
  const related = getRelatedProducts(product);
  return (
    <>
      <Crumbs items={[['Home', '/'], ['Products', '/products'], [product.name]]} />
      <h1>{product.name}</h1>
      <p>{product.short}</p>
      <p>{product.long}</p>
      <section>
        <h2>Specification</h2>
        <table>
          <tbody>
            {product.specs.map((s) => (
              <tr key={s.label}>
                <th scope="row">{s.label}</th>
                <td>{s.value}</td>
              </tr>
            ))}
            <tr>
              <th scope="row">Minimum order</th>
              <td>{moqLabel(product)}</td>
            </tr>
            <tr>
              <th scope="row">Lead time</th>
              <td>{product.leadTime}</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section>
        <h2>Typical uses</h2>
        <ul>
          {product.useCases.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
        <p>
          Industries:{' '}
          {product.industries.map((i, n) => (
            <span key={i}>
              {n > 0 ? ', ' : ''}
              <a href={`/industries/${i}`}>{industryName(i)}</a>
            </span>
          ))}
        </p>
      </section>
      <Faqs faqs={product.faq} />
      <p>
        <a href={quoteHref({ product: product.quoteProduct, src: `product.${product.slug}` })}>Get a price for {product.name.toLowerCase()}</a>
      </p>
      <Links title="Related products" items={related.map((r) => ({ href: `/products/${r.slug}`, label: r.name, note: r.short }))} />
    </>
  );
}

function Industry({ slug }: { slug: string }) {
  const industry = findIndustry(slug);
  if (!industry) return null;
  const others = INDUSTRY_PAGES.filter((i) => i.slug !== industry.slug);
  return (
    <>
      <Crumbs items={[['Home', '/'], ['Industries and services', '/services'], [industry.name]]} />
      <h1>{industry.name} packaging</h1>
      <p>{industry.intro}</p>
      <section>
        <h2>The problem and the spec</h2>
        <p>
          <strong>Problem:</strong> {industry.problem}
        </p>
        <p>
          <strong>Recommended:</strong> {industry.spec}. {industry.why}
        </p>
      </section>
      <section>
        <h2>Boxes we recommend for {industry.name}</h2>
        <ul>
          {industry.specs.map((s) => (
            <li key={s.slug}>
              <a href={productHref(s.slug)}>{s.name}</a>: {s.note}
            </li>
          ))}
        </ul>
      </section>
      <Faqs faqs={industry.faqs} />
      <Links title="Other industries" items={others.map((o) => ({ href: `/industries/${o.slug}`, label: `${o.name} packaging` }))} />
    </>
  );
}

function Locations({ page }: { page: SeoPage }) {
  return (
    <>
      <Crumbs items={[['Home', '/'], ['Locations']]} />
      <h1>Packaging delivered across Gujarat</h1>
      <p>{page.description}</p>
      {SEO_PARAGRAPHS.map((p) => (
        <p key={p}>{p}</p>
      ))}
      <section>
        <h2>Cities we serve</h2>
        <ul>
          {CITIES.map((c) => (
            <li key={c.id}>
              {c.name}
              {c.hub ? ' (our hub)' : ''}
            </li>
          ))}
        </ul>
      </section>
      <Faqs faqs={LOCATION_FAQS} />
    </>
  );
}

function Contact() {
  return (
    <>
      <Crumbs items={[['Home', '/'], ['Contact']]} />
      <h1>Talk to a packaging person.</h1>
      <p>Call, WhatsApp or email us with what you ship. We reply within {FACTS.replySla} in business hours.</p>
      <ul>
        <li>Phone and WhatsApp: {CONTACT_INFO.phone}</li>
        <li>Email: {CONTACT_INFO.email}</li>
        <li>Address: {FACTS.addressFull}</li>
        <li>Hours: {FACTS.businessHours}</li>
      </ul>
      <p>
        <a href="/quote">Ask for a quote</a>
      </p>
    </>
  );
}

function Quote() {
  return (
    <>
      <Crumbs items={[['Home', '/'], ['Get a quote']]} />
      <h1>Get a quote</h1>
      <p>
        Tell us what you ship. Corrugated boxes from {FACTS.moqBoxes} units, stock sizes dispatched in {FACTS.dispatchHours} hours from {FACTS.city}.
      </p>
      <p>
        Not sure of the size? <a href="/box-designer">Design the box in 3D first</a> or use the <a href="/compare-quote">Packaging Finder</a>.
      </p>
    </>
  );
}

function Finder({ page }: { page: SeoPage }) {
  return (
    <>
      <Crumbs items={[['Home', '/'], ['Packaging Finder']]} />
      <h1>Find the right box for your product.</h1>
      <p>{page.description}</p>
      <ol>
        <li>Product: tell us what you pack and how fragile it is.</li>
        <li>Size and weight: add the size and weight if you know them.</li>
        <li>Handling and quantity: how it ships and how many you need.</li>
      </ol>
      <Faqs faqs={PACKAGING_TOOL_FAQS} />
    </>
  );
}

function ToolsIndex({ page }: { page: SeoPage }) {
  return (
    <>
      <Crumbs items={[['Home', '/'], ['Free tools']]} />
      <h1>Free packaging calculators</h1>
      <p>{page.description}</p>
      <ul>
        {TOOL_PAGES.map((t) => (
          <li key={t.slug}>
            <a href={t.path}>{t.name}</a>: {t.summary}
          </li>
        ))}
      </ul>
    </>
  );
}

function Tool({ tool }: { tool: ToolPage }) {
  const blogs = tool.relatedBlogs.map((s) => getBlogBySlug(s)).filter((b): b is BlogPost => !!b);
  const tools = tool.relatedTools.map((s) => TOOL_PAGES.find((t) => t.slug === s)).filter((t): t is ToolPage => !!t);
  return (
    <>
      <Crumbs items={[['Home', '/'], ['Free tools', TOOLS_INDEX_PATH], [tool.name]]} />
      <h1>{tool.h1}</h1>
      <p>{tool.answer}</p>
      <p>
        <strong>Formula:</strong> {tool.formula}
      </p>
      {tool.formulaNote ? <p>{tool.formulaNote}</p> : null}
      <section>
        <h2>Worked example: {tool.example.title}</h2>
        <ol>
          {tool.example.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p>{tool.example.result}</p>
      </section>
      <section>
        <h2>{tool.howTo.name}</h2>
        <ol>
          {tool.howTo.steps.map((s) => (
            <li key={s.name}>
              <strong>{s.name}.</strong> {s.text}
            </li>
          ))}
        </ol>
      </section>
      <Faqs faqs={tool.faqs} />
      {blogs.length > 0 && <Links title="Related guides" items={blogs.map(postLink)} />}
      {tools.length > 0 && <Links title="More calculators" items={tools.map((t) => ({ href: t.path, label: t.name, note: t.summary }))} />}
      <p>
        <a href="/box-designer">Open the 3D Box Designer</a> · <a href={quoteHref({ src: `tool.${tool.slug}` })}>Get a quote</a>
      </p>
    </>
  );
}

function Designer({ page }: { page: SeoPage }) {
  const steps = (getBoxDesignerHowToSchema().step ?? []) as { name: string; text: string }[];
  const guides = BLOG_POSTS.filter((p) => p.category === 'Designer Guides');
  return (
    <>
      <Crumbs items={[['Home', '/'], ['3D Box Designer']]} />
      <p>3D Box Designer · Free · no sign-up</p>
      <h1>Design your box in 3D. Take the dieline to print.</h1>
      <p>Set the size, pick 3, 5 or 7-ply board and colour, add your logo and watch it fold. Then send it to us for a quote.</p>
      <p>{page.description}</p>
      <section>
        <h2>How it works</h2>
        <ol>
          {steps.map((s) => (
            <li key={s.name}>
              <strong>{s.name}.</strong> {s.text}
            </li>
          ))}
        </ol>
      </section>
      <section>
        <h2>Pick a box style</h2>
        <ul>
          {availableLandings().map((l) => (
            <li key={l.slug}>
              <a href={`/box-designer/${l.slug}`}>{l.name}</a>: {l.metaDescription}
            </li>
          ))}
        </ul>
      </section>
      <Faqs faqs={BOX_DESIGNER_FAQS} />
      <Links title="Designer guides" items={guides.map(postLink)} />
    </>
  );
}

function Landing({ landing }: { landing: DesignerLanding }) {
  const style = getStyle(landing.style);
  const template = findTemplate(landing.templateId);
  const all = availableLandings();
  const related = (landing.related ?? []).map((r) => all.find((l) => l.slug === r)).filter((l): l is DesignerLanding => !!l);
  const others = all.filter((l) => l.slug !== landing.slug && !related.includes(l));
  const guides = BLOG_POSTS.filter((p) => designerTargetSlug(p.slug) === landing.slug).slice(0, 4);
  return (
    <>
      <Crumbs items={[['Home', '/'], ['3D Box Designer', '/box-designer'], [landing.name]]} />
      <h1>{landing.h1}</h1>
      <p>{landing.intro}</p>
      <p>
        <a href={landingDesignerHref(landing)}>Design my {landing.name.toLowerCase()}</a> · Free · no sign-up · dieline and spec sheet included
      </p>
      <section>
        <h2>What a {landing.name.toLowerCase()} is good for</h2>
        <p>
          {style.name}
          {style.fefco ? ` · FEFCO ${style.fefco}` : ''}. {style.bestFor}.
          {template ? ` Starting template: ${template.name}.` : ''}
        </p>
        <ul>
          {landing.bestFor.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Typical sizes</h2>
        <ul>
          {landing.sizes.map((s) => (
            <li key={s.label}>
              <a href={landingDesignerHref(landing, s.dims)}>
                {s.label}: {s.dims.length} × {s.dims.width} × {s.dims.height} cm
              </a>
            </li>
          ))}
        </ul>
      </section>
      {landing.benefits && landing.benefits.length > 0 && (
        <section>
          <h2>Why choose a {landing.name.toLowerCase()}</h2>
          <ul>
            {landing.benefits.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <h2>Tips for a better box</h2>
        <ol>
          {landing.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
      </section>
      <Faqs faqs={landing.faqs} />
      {related.length > 0 && <Links title="Related box styles" items={related.map((l) => ({ href: `/box-designer/${l.slug}`, label: l.name, note: l.metaDescription }))} />}
      <Links title="More box styles" items={others.map((l) => ({ href: `/box-designer/${l.slug}`, label: l.name }))} />
      {guides.length > 0 && <Links title="Guides" items={guides.map(postLink)} />}
    </>
  );
}

function BlogIndex({ page }: { page: SeoPage }) {
  const byCategory = new Map<string, BlogPost[]>();
  for (const p of [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date))) byCategory.set(p.category, [...(byCategory.get(p.category) ?? []), p]);
  return (
    <>
      <Crumbs items={[['Home', '/'], ['Blog']]} />
      <h1>Corrugated packaging guides</h1>
      <p>{page.description}</p>
      {[...byCategory.entries()].map(([category, posts]) => (
        <section key={category}>
          <h2>{category}</h2>
          <ul>
            {posts.map((p) => (
              <li key={p.slug}>
                <a href={`/blogs/${p.slug}`}>{p.title}</a>: {p.description} ({p.readingTime})
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

function Blog({ slug, ctx }: { slug: string; ctx: BodyContext }) {
  const post = getBlogBySlug(slug);
  const raw = ctx.readBlogMarkdown(slug);
  if (!post || raw === undefined) return null;
  const md = stripLeadingTitle(stripFrontmatter(raw), post.title);
  const { html, headings } = renderArticleHtml(md);
  const sections = headings.filter((h) => h.level === 2);
  const toc = sections.length >= 3 ? sections : headings;
  const minutes = readingMinutes(md);
  const related = getRelatedByTags(slug, 3);
  const { previous, next } = getAdjacentPosts(slug);
  const designer = getDesignerCard(slug);
  const seo = BLOG_SEO_METADATA[slug];
  const image = seo?.ogImage ?? SEO_CONFIG.defaultImage;
  const updated = postLastmod(post);
  return (
    <article>
      <Crumbs items={[['Home', '/'], ['Blog', '/blogs'], [post.title]]} />
      <p>{post.category}</p>
      <h1>{post.title}</h1>
      <p>{post.description}</p>
      <p>
        By {post.author} · Published <time dateTime={post.date}>{formatDate(post.date)}</time>
        {updated !== post.date ? (
          <>
            {' '}
            · Updated <time dateTime={updated}>{formatDate(updated)}</time>
          </>
        ) : null}{' '}
        · {minutes} min read · {countWords(md).toLocaleString('en-IN')} words
      </p>
      <img src={image} alt={`Illustration for the article: ${post.title}`} width={1200} height={630} />
      {toc.length >= 2 && (
        <nav aria-label="On this page">
          <h2>On this page</h2>
          <ul>
            {toc.map((h) => (
              <li key={h.id}>
                <a href={`#${h.id}`}>{h.text}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div className="medium-article" dangerouslySetInnerHTML={{ __html: html }} />
      <aside aria-label="Try it in the 3D designer">
        <h2>{designer.title}</h2>
        <p>{designer.body}</p>
        <p>
          <a href={designer.href}>{designer.label}</a>
        </p>
      </aside>
      {related.length > 0 && <Links title="Related articles" items={related.map(postLink)} />}
      <nav aria-label="More articles">
        <ul>
          {previous && (
            <li>
              Previous: <a href={`/blogs/${previous.slug}`}>{previous.title}</a>
            </li>
          )}
          {next && (
            <li>
              Next: <a href={`/blogs/${next.slug}`}>{next.title}</a>
            </li>
          )}
        </ul>
      </nav>
      <p>
        {FACTS.legalName}, {FACTS.city}. <a href={quoteHref({ src: `blog.${post.slug}` })}>Get a quote</a> · <a href="/blogs">All guides</a>
      </p>
    </article>
  );
}

function Simple({ title, page }: { title: string; page: SeoPage }) {
  return (
    <>
      <Crumbs items={[['Home', '/'], [title]]} />
      <h1>{title}</h1>
      <p>{page.description}</p>
    </>
  );
}

/** Static HTML (string) of the page body, wrapped in the shared header and footer */
export function renderBody(page: SeoPage, ctx: BodyContext): string {
  const slug = page.slug ?? '';
  let content: ReactNode;
  switch (page.kind) {
    case 'home':
      content = <Home />;
      break;
    case 'about':
      content = <About page={page} />;
      break;
    case 'services':
      content = <Services page={page} />;
      break;
    case 'products':
      content = <Products page={page} />;
      break;
    case 'product':
      content = <ProductDetail slug={slug} />;
      break;
    case 'industry':
      content = <Industry slug={slug} />;
      break;
    case 'locations':
      content = <Locations page={page} />;
      break;
    case 'contact':
      content = <Contact />;
      break;
    case 'quote':
      content = <Quote />;
      break;
    case 'finder':
      content = <Finder page={page} />;
      break;
    case 'tools':
      content = <ToolsIndex page={page} />;
      break;
    case 'tool': {
      const tool = getToolPage(slug);
      content = tool ? <Tool tool={tool} /> : null;
      break;
    }
    case 'designer':
      content = <Designer page={page} />;
      break;
    case 'landing': {
      const landing = findLanding(slug) ?? ALL_LANDINGS.find((l) => l.slug === slug);
      content = landing ? <Landing landing={landing} /> : null;
      break;
    }
    case 'blogs':
      content = <BlogIndex page={page} />;
      break;
    case 'blog':
      content = <Blog slug={slug} ctx={ctx} />;
      break;
    case 'privacy':
      content = <Simple title="Privacy notice" page={page} />;
      break;
    case 'credits':
      content = <Simple title="Image credits" page={page} />;
      break;
  }
  if (content === null || content === undefined) throw new Error(`prerender: no content for ${page.path}`);
  return renderToStaticMarkup(<Chrome>{content}</Chrome>);
}

