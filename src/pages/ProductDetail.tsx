/**
 * /products/:slug: product detail (plan §9.3). Everything comes from src/content/products.ts, and the
 * Product, Breadcrumb and FAQPage schema are generated from the same data, so SEO matches what is visible.
 * SECURITY: the slug comes from the URL; it is only used as a lookup key (unknown slug redirects to /products)
 * and is never rendered or interpolated into HTML.
 */

import { Link, Navigate, useParams } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import Layout from '@/components/Layout';
import PageTransition from '@/components/PageTransition';
import { MetaTags, StructuredData, getProductMetadata } from '@/seo';
import { getBreadcrumbSchema, getFAQSchema, getProductBreadcrumbs, getProductDetailSchema } from '@/seo/schema';
import { Section } from '@/components/site/Section';
import { Cta } from '@/components/site/Cta';
import { FactStrip, MadeSourcedBadge, SectionHeader } from '@/components/site/Blocks';
import { ImageSlot } from '@/components/site/ImageSlot';
import { CropMarks } from '@/components/site/Decor';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { BoardCrossSection } from '@/components/home/BoardCrossSection';
import { SpecTable } from '@/components/pages/SpecTable';
import { FaqAccordion } from '@/components/pages/FaqAccordion';
import { CtaBand } from '@/components/pages/CtaBand';
import { ProductCard } from '@/components/pages/ProductCard';
import { getProduct, getRelatedProducts, industryName, moqLabel, PRODUCT_TYPE_LABELS } from '@/content/products';
import { getBoardSpec } from '@/lib/boxDesigner/boardSpecs';
import { FACTS } from '@/content/facts';
import { quoteHref } from '@/lib/quotePrefill';
import { pageWhatsAppMessage, whatsappHref } from '@/lib/contactLinks';
import { cn } from '@/lib/utils';

const WALL = { '3-ply': 'Single wall', '5-ply': 'Double wall', '7-ply': 'Triple wall' } as const;
const LAYERS = {
  '3-ply': 'one fluted layer between two liners',
  '5-ply': 'two fluted layers between three liners',
  '7-ply': 'three fluted layers between four liners',
} as const;

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const product = getProduct(slug);
  const reduceMotion = useReducedMotion();

  if (!product) return <Navigate to="/products" replace />;

  const related = getRelatedProducts(product);
  const isBox = product.group === 'box';
  const meta = getProductMetadata(product);
  const quote = quoteHref({ product: product.quoteProduct, src: `product.${product.slug}` });
  const sample = quoteHref({ intent: 'sample', product: product.quoteProduct, src: `product.${product.slug}.sample` });
  const cta = (what: string) => `product.${product.slug}.${what}`;
  const board = product.crossSection ? getBoardSpec(product.crossSection) : null;

  return (
    <Layout>
      <MetaTags
        title={meta.title}
        description={meta.description}
        keywords={meta.keywords}
        canonical={meta.canonical}
        image={meta.ogImage}
        type="website"
      />
      <StructuredData type="Product" data={getProductDetailSchema(product)} />
      <StructuredData type="BreadcrumbList" data={getBreadcrumbSchema(getProductBreadcrumbs(product.name, product.slug))} />
      <StructuredData type="FAQPage" data={getFAQSchema(product.faq)} />

      <PageTransition>
        {/* Hero: breadcrumb, image, title, badge, CTAs, facts */}
        <Section name="product-hero" aria-labelledby="page-title" className="pb-12 pt-6 md:pb-20 md:pt-8">
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
                    <Link to="/products">Products</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{product.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="mt-8 grid gap-8 md:mt-10 lg:grid-cols-12 lg:items-center lg:gap-14">
              <div className="group relative mx-auto w-full max-w-md text-ink-900/40 lg:col-span-5 lg:max-w-none">
                <CropMarks />
                <ImageSlot
                  slot={product.image}
                  priority
                  className="aspect-[4/3] rounded-[14px] bg-paper-200 lg:aspect-[4/5]"
                  sizes="(min-width: 1024px) 40vw, 90vw"
                />
              </div>

              <div className="lg:col-span-7">
                <p className="label-mono mb-4 text-muted-foreground">{PRODUCT_TYPE_LABELS[product.type]}</p>
                <h1 id="page-title" className="font-display text-display-l text-balance">
                  {product.name}
                </h1>
                <MadeSourcedBadge kind={product.madeOrSourced} className="mt-5" />
                <p className="mt-5 max-w-[56ch] text-body-l">{product.short}</p>
                <p className="mt-3 max-w-[62ch] text-muted-foreground">{product.long}</p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Cta id={cta('quote')} intent="quote" size="lg" href={quote} meta={{ product: product.slug }} arrow>
                    Get price
                  </Cta>
                  <Cta id={cta('sample')} intent="sample" variant="secondary" size="lg" href={sample} meta={{ product: product.slug }}>
                    Order a sample
                  </Cta>
                  {isBox && (
                    <Cta id={cta('designer')} intent="designer" variant="secondary" size="lg" href="/box-designer" meta={{ product: product.slug }}>
                      Design in 3D
                    </Cta>
                  )}
                </div>

                <FactStrip
                  className="mt-8"
                  facts={[
                    { label: isBox ? 'MOQ' : 'Sold', value: isBox ? product.moq : 'Per roll / carton' },
                    { label: 'Lead time', value: product.leadTime },
                    { label: 'Invoice', value: 'GST' },
                  ]}
                />
                <p className="mt-3 text-sm text-muted-foreground">
                  {FACTS.samplePolicy}. {FACTS.dispatchFootnote}
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* Spec table */}
        <Section name="product-specs" theme="kraft" aria-labelledby="specs-heading" className="section-y">
          <div className="mx-auto grid max-w-content gap-10 px-4 md:px-6 lg:grid-cols-12 lg:px-10">
            <SectionHeader
              id="specs-heading"
              index="01 — Specifications"
              title={isBox ? 'The spec sheet' : 'Supply specification'}
              lead={
                isBox
                  ? 'Board thickness is indicative. Strength test values (BCT, ECT, GSM, BF) are shared as a test report on request.'
                  : 'Sizes are confirmed with your quote. Tell us your use and we will match width, thickness and length.'
              }
              className="lg:col-span-4"
            />
            <div className="lg:col-span-8">
              <SpecTable rows={product.specs} caption={`${product.name} specifications`} />
              <div className="mt-6">
                <Cta id={cta('specs.report')} intent="quote" variant="link" href={quote} meta={{ product: product.slug }} arrow>
                  {isBox ? 'Request the test report with a quote' : 'Ask for sizes with a quote'}
                </Cta>
              </div>
            </div>
          </div>
        </Section>

        {/* Cross-section (3, 5 and 7-ply pages only) */}
        {product.crossSection && board && (
          <Section name="product-board" theme="ink" aria-labelledby="board-heading" className="section-y">
            <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
              <SectionHeader
                id="board-heading"
                index="02 — Inside the board"
                title={`How ${product.crossSection} board is built`}
                lead={`${WALL[product.crossSection]}: ${LAYERS[product.crossSection]}. Drawn to scale from indicative flute heights.`}
                align="split"
              />
              <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
                <div className="rounded-lg border border-border bg-card p-4 md:p-8 lg:col-span-8">
                  <BoardCrossSection
                    ply={product.crossSection}
                    animate={!reduceMotion}
                    compact
                    className="mx-auto w-full max-w-sm md:hidden"
                  />
                  <BoardCrossSection
                    ply={product.crossSection}
                    animate={!reduceMotion}
                    className="hidden w-full md:block"
                  />
                </div>
                <dl className="grid grid-cols-2 gap-3 lg:col-span-4 lg:grid-cols-1">
                  {[
                    ['Flutes', board.flutes.map((f) => `${f}-flute`).join(' + ')],
                    ['Thickness', `≈ ${board.caliperMm.toFixed(1)} mm`],
                    ['Layers', `${board.layers.length} fluted · ${board.layers.length + 1} liners`],
                  ].map(([label, value], i) => (
                    <div key={label} className={cn('rounded-lg border border-border p-4', i === 0 && 'col-span-2 lg:col-span-1')}>
                      <dt className="label-mono text-muted-foreground">{label}</dt>
                      <dd className="tabular mt-1 text-lg font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Section>
        )}

        {/* Use cases and industries */}
        <Section name="product-uses" aria-labelledby="uses-heading" className="section-y">
          <div className="mx-auto grid max-w-content gap-10 px-4 md:px-6 lg:grid-cols-12 lg:px-10">
            <SectionHeader
              id="uses-heading"
              index={`${product.crossSection ? '03' : '02'} — Where it is used`}
              title="Use cases and industries"
              className="lg:col-span-4"
            />
            <div className="space-y-8 lg:col-span-8">
              <ul className="grid gap-3 sm:grid-cols-2">
                {product.useCases.map((useCase) => (
                  <li key={useCase} className="rounded-lg border border-border px-4 py-3 font-medium">
                    {useCase}
                  </li>
                ))}
              </ul>
              <div>
                <p className="label-mono mb-3 text-muted-foreground">Industries we supply</p>
                <ul className="flex flex-wrap gap-2">
                  {product.industries.map((industry) => (
                    <li key={industry}>
                      <Link
                        to={`/industries/${industry}`}
                        className="inline-flex min-h-11 items-center rounded-full border border-foreground/20 px-4 text-sm font-semibold transition-colors duration-quick ease-paper hover:border-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {industryName(industry)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Section>

        {/* FAQ (visible; the FAQPage schema above uses the same items) */}
        <Section name="product-faq" theme="kraft" aria-labelledby="faq-heading" className="section-y">
          <div className="mx-auto grid max-w-content gap-10 px-4 md:px-6 lg:grid-cols-12 lg:px-10">
            <SectionHeader
              id="faq-heading"
              index="Questions"
              title={`${product.name}: FAQ`}
              className="lg:col-span-4"
            />
            <div className="lg:col-span-8">
              <FaqAccordion items={product.faq} idPrefix={`faq-${product.slug}`} />
            </div>
          </div>
        </Section>

        {/* Related */}
        {related.length > 0 && (
          <Section name="product-related" aria-labelledby="related-heading" className="section-y">
            <div className="mx-auto max-w-content px-4 md:px-6 lg:px-10">
              <SectionHeader
                id="related-heading"
                index="Goes with it"
                title="Related products"
                lead={isBox ? 'Other plies and the supplies that ship with your boxes.' : 'Boxes and supplies often ordered together.'}
              />
              <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((item) => (
                  <li key={item.slug}>
                    <ProductCard product={item} />
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        )}

        <CtaBand
          name="product-cta"
          title={`Need ${product.name.toLowerCase()}? Get your price.`}
          lead={`${moqLabel(product)} · ${product.leadTime}. ${FACTS.samplePolicy}.`}
          note={`${FACTS.businessHours}. ${FACTS.dispatchFootnote}`}
        >
          <Cta id={cta('band.quote')} intent="quote" size="lg" href={quote} meta={{ product: product.slug }} arrow>
            Get price
          </Cta>
          <Cta
            id={cta('band.whatsapp')}
            intent="whatsapp"
            variant="whatsapp"
            size="lg"
            href={whatsappHref(pageWhatsAppMessage(`/products/${product.slug}`, product.name.toLowerCase()))}
          >
            WhatsApp us
          </Cta>
        </CtaBand>
      </PageTransition>
    </Layout>
  );
}
