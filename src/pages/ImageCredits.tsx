/**
 * Image credits: lists every third-party photo on the site with author, licence and source, and says which
 * artwork is our own. Required for CC BY / CC BY-SA attribution and good practice for CC0.
 * SECURITY: all content comes from the static registry in src/content/imageCredits.ts; JSON-LD is serialised
 * with JSON.stringify, never concatenated into HTML; external links use rel="noopener noreferrer".
 */

import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import { Section } from '@/components/site/Section';
import { SectionHeader } from '@/components/site/Blocks';
import MetaTags from '@/components/SEO/MetaTags';
import { SEO_CONFIG } from '@/seo/config';
import { IMAGE_CREDITS, OWN_ARTWORK_NOTE, type ImageCreditId } from '@/content/imageCredits';
import conveyor from '@/assets/photos/corrugated-conveyor.jpg';
import tester from '@/assets/photos/compression-tester.jpg';
import closeup from '@/assets/photos/corrugated-closeup.jpg';

const FILES: Record<ImageCreditId, string> = {
  'corrugated-conveyor': conveyor,
  'compression-tester': tester,
  'corrugated-closeup': closeup,
};

const abs = (path: string) => new URL(path, SEO_CONFIG.siteUrl).href;

const ext = 'text-accent underline underline-offset-4';

export default function ImageCredits() {
  const credits = Object.values(IMAGE_CREDITS);
  // schema.org ImageObject with the licence fields Google reads for licensable images
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': credits.map((c) => ({
      '@type': 'ImageObject',
      contentUrl: abs(FILES[c.id as ImageCreditId]),
      name: c.title.replace(/\.[a-z]+$/i, ''),
      creator: { '@type': 'Person', name: c.author },
      creditText: `${c.author} / ${c.sourceName}`,
      copyrightNotice: c.author,
      license: c.licenseUrl,
      acquireLicensePage: c.sourceUrl,
    })),
  };

  return (
    <Layout>
      <MetaTags
        title="Image credits"
        description="Authors, licences and sources for the photographs used on the Vayu Packaging Solutions website."
        canonical="/image-credits"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Section name="image-credits" className="paper-grain">
        <div className="mx-auto max-w-content px-4 py-16 md:px-6 lg:px-10 lg:py-24">
          <SectionHeader index="Legal" title="Image credits" lead="Where our photographs come from, and who made them." />

          <div className="mt-10 grid max-w-3xl gap-10">
            <div>
              <h2 className="text-h3 font-bold">Our own artwork</h2>
              <p className="mt-2 text-body-l text-muted-foreground">{OWN_ARTWORK_NOTE}</p>
            </div>

            <div>
              <h2 className="text-h3 font-bold">Licensed photographs</h2>
              <p className="mt-2 text-body-l text-muted-foreground">
                These photos are used under open licences. None of them shows Vayu&apos;s own premises, people or products unless the credit
                says so. Each photo carries its credit on the image.
              </p>
              <ul className="mt-6 grid gap-6">
                {credits.map((c) => (
                  <li key={c.id} className="rounded-xl border border-ink-900/15 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <img
                        src={FILES[c.id as ImageCreditId]}
                        alt={`Thumbnail of ${c.title}`}
                        width={160}
                        height={120}
                        loading="lazy"
                        decoding="async"
                        className="h-24 w-32 shrink-0 rounded-lg bg-paper-200 object-cover"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold">{c.title}</p>
                        <p className="mt-1 text-muted-foreground">
                          By {c.author} ·{' '}
                          <a className={ext} href={c.licenseUrl} target="_blank" rel="noopener noreferrer">
                            {c.license}
                          </a>{' '}
                          ·{' '}
                          <a className={ext} href={c.sourceUrl} target="_blank" rel="noopener noreferrer">
                            Original on {c.sourceName}
                          </a>
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">Used on: {c.usedOn}</p>
                        <p className="mt-1 text-sm text-muted-foreground">Changes: {c.changes}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-muted-foreground">
                Photos under CC BY-SA stay under that licence when adapted, so you may reuse our resized copies on the same terms and with the
                same credit.
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              Spotted a credit that is wrong or missing? Tell us through the <Link className={ext} to="/contact">contact page</Link> and we will fix it quickly.
            </p>
          </div>
        </div>
      </Section>
    </Layout>
  );
}
