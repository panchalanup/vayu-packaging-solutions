/**
 * 404, rendered inside the normal Layout so the nav and footer show (§9.10).
 * SECURITY: the path is read from the router, trimmed, and sent as an analytics event only; it is never rendered
 * into the page. No personal data is attached.
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Layout from '@/components/Layout';
import PageTransition from '@/components/PageTransition';
import { MetaTags } from '@/seo';
import { Section } from '@/components/site/Section';
import { Cta } from '@/components/site/Cta';
import { useEventTracker } from '@/hooks/useAnalytics';
import { quoteHref } from '@/lib/quotePrefill';
import { whatsappHref, pageWhatsAppMessage } from '@/lib/contactLinks';
import { DUR, EASE } from '@/lib/motion/tokens';

/** Flat, unfolded box (dieline) with one top flap that did not fold right. Static unless motion is allowed. */
function BrokenDieline({ animate }: { animate: boolean }) {
  const panels = [0, 1, 2, 3];
  const X0 = 70;
  const PW = 100;
  const TOP = 130;
  const BOTTOM = 250;
  const BROKEN = 2; // which top flap is wrong

  return (
    <svg viewBox="0 0 540 340" role="img" aria-label="A flat, unfolded box with one flap bent the wrong way" className="h-auto w-full text-ink-900">
      {/* Glue tab */}
      <path d={`M${X0} ${TOP} L${X0 - 28} ${TOP + 14} V${BOTTOM - 14} L${X0} ${BOTTOM}Z`} className="fill-paper-100 stroke-current" strokeWidth="1.5" strokeLinejoin="round" />

      {panels.map((i) => {
        const x = X0 + i * PW;
        return (
          <g key={i}>
            {/* Side panel */}
            <rect x={x} y={TOP} width={PW} height={BOTTOM - TOP} className="fill-paper-200 stroke-current" strokeWidth="1.5" />
            {/* Bottom flap */}
            <path d={`M${x} ${BOTTOM} H${x + PW} L${x + PW - 8} ${BOTTOM + 58} H${x + 8}Z`} className="fill-paper-100 stroke-current" strokeWidth="1.5" strokeLinejoin="round" />
            {/* Top flap: the broken one is drawn separately below */}
            {i !== BROKEN && (
              <path d={`M${x} ${TOP} H${x + PW} L${x + PW - 8} ${TOP - 58} H${x + 8}Z`} className="fill-paper-100 stroke-current" strokeWidth="1.5" strokeLinejoin="round" />
            )}
          </g>
        );
      })}

      {/* Crease lines (dashed, the print-production convention) */}
      <g className="stroke-green-600" strokeWidth="1.25" strokeDasharray="5 4" fill="none">
        <path d={`M${X0} ${TOP} H${X0 + PW * 4}`} />
        <path d={`M${X0} ${BOTTOM} H${X0 + PW * 4}`} />
        {[1, 2, 3].map((i) => (
          <path key={i} d={`M${X0 + i * PW} ${TOP - 58} V${BOTTOM + 58}`} />
        ))}
      </g>

      <text x={X0 + PW * 1.5} y={TOP + 78} textAnchor="middle" className="fill-ink-900 font-display" fontSize="44" fontWeight="600">
        404
      </text>

      {/* The flap that did not fold right: it flips over its hinge and folds the wrong way, down onto the panel */}
      {(() => {
        const x = X0 + BROKEN * PW;
        const flap = (
          <path
            d={`M${x} ${TOP} H${x + PW} L${x + PW - 8} ${TOP - 58} H${x + 8}Z`}
            className="fill-paper-50 stroke-warning-700"
            strokeWidth="1.75"
            strokeDasharray="6 4"
            strokeLinejoin="round"
          />
        );
        return animate ? (
          // originX/originY (not transformOrigin): framer-motion owns the transform origin of SVG elements
          <motion.g
            style={{ originX: 0.5, originY: 1 }}
            initial={{ scaleY: 1 }}
            animate={{ scaleY: -0.7 }}
            transition={{ duration: DUR.cinematic, ease: EASE.fold, delay: 0.3 }}
          >
            {flap}
          </motion.g>
        ) : (
          <g style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', transform: 'scaleY(-0.7)' }}>{flap}</g>
        );
      })()}
    </svg>
  );
}

const NotFound = () => {
  const { pathname } = useLocation();
  const { trackEvent } = useEventTracker();
  const reduced = useReducedMotion();
  const reported = useRef<string | null>(null);

  // Report broken links once per path so they can be found and fixed (no console.error)
  useEffect(() => {
    if (reported.current === pathname) return;
    reported.current = pathname;
    trackEvent('404_hit', { path: pathname.slice(0, 120) });
  }, [pathname, trackEvent]);

  return (
    <Layout>
      <MetaTags title="Page not found" description="This page could not be found. Browse Vayu Packaging products, get a quote or use the Packaging Finder." noindex />
      <PageTransition>
        <Section name="not-found" aria-labelledby="page-title" className="section-y">
          <div className="mx-auto grid max-w-content items-center gap-10 px-4 md:px-6 lg:grid-cols-12 lg:gap-14 lg:px-10">
            <div className="lg:col-span-6">
              <p className="label-mono mb-4 text-muted-foreground">Error 404</p>
              <h1 id="page-title" className="font-display text-display-l text-balance">
                This page didn&apos;t fold right.
              </h1>
              <p className="mt-5 max-w-[48ch] text-body-l text-muted-foreground">
                The link may be old or mistyped. Here is where most people want to go next.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Cta id="404.quote" intent="quote" size="lg" href={quoteHref({ src: '404' })} arrow>
                  Get a quote
                </Cta>
                <Cta id="404.products" intent="navigate" size="lg" variant="secondary" href="/products">
                  Products
                </Cta>
                <Cta id="404.finder" intent="finder" size="lg" variant="secondary" href="/compare-quote">
                  Packaging Finder
                </Cta>
                <Cta id="404.whatsapp" intent="whatsapp" size="lg" variant="secondary" href={whatsappHref(pageWhatsAppMessage('/'))}>
                  WhatsApp us
                </Cta>
              </div>
            </div>
            <div className="lg:col-span-6">
              <BrokenDieline animate={!reduced} />
            </div>
          </div>
        </Section>
      </PageTransition>
    </Layout>
  );
};

export default NotFound;
