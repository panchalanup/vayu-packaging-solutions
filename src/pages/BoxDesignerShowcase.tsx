/**
 * /3d-box-designer: the pitch page for the free 3D Box Designer, for box buyers and box manufacturers.
 * Ten chapters (docs/3D-Model-page/BOX_DESIGNER_SHOWCASE_PAGE_PLAN.md):
 *   1-3 share a sticky stage (hero, the unfold, dieline anatomy)   4-10 are ordinary sections
 * One audience switch ("I buy boxes" / "I make boxes") swaps copy and call-to-action wording, never content.
 * SECURITY: all copy is static (src/content/designerShowcase.ts); ?for= is an enum; JSON-LD is serialised by StructuredData.
 */

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import Layout from '@/components/Layout';
import MetaTags from '@/components/SEO/MetaTags';
import { StructuredData } from '@/components/SEO/StructuredData';
import { SEO_CONFIG } from '@/seo/config';
import { SHOWCASE_SCHEMA_TYPES, getShowcaseSchemas } from '@/seo/schema';
import { SHOWCASE_META, SHOWCASE_PATH, UNFOLD_BEATS, type Audience, type Variants } from '@/content/designerShowcase';
import { DEFAULT_DESIGN } from '@/lib/boxDesigner/designCodec';
import { DEFAULT_STAGE_DESIGN, createStageStore, sceneFor } from '@/lib/showcase/stage';
import { useEventTracker } from '@/hooks/useAnalytics';
import AudienceSwitch from '@/components/showcase/AudienceSwitch';
import { AudienceContext, initialAudience, rememberAudience, type AudienceApi } from '@/components/showcase/audienceContext';
import { ShowcaseDesignContext } from '@/components/showcase/stageContext';
import { useShowcaseValue } from '@/components/showcase/useShowcaseValue';
import ScrollyShowcase from '@/components/showcase/ScrollyShowcase';
import HeroDesign from '@/components/showcase/chapters/HeroDesign';
import Unfold from '@/components/showcase/chapters/Unfold';
import DielineAnatomy from '@/components/showcase/chapters/DielineAnatomy';
import { ShareSection, StyleSection, TakeawaySection } from '@/components/showcase/chapters/StorySections';
import ClosingHero from '@/components/showcase/chapters/ClosingHero';

/** Chapters the reader can have viewed, reported once each (names only, no personal data) */
const CHAPTER_IDS = ['unfold', 'anatomy', 'styles', 'share', 'exports', 'start'] as const;

export default function BoxDesignerShowcase() {
  const { trackEvent } = useEventTracker();
  const [audience, setAudienceState] = useState<Audience>(() => initialAudience(window.location.search));

  const setAudience = useCallback<AudienceApi['setAudience']>(
    (next, source = 'switch') => {
      setAudienceState((prev) => {
        if (prev !== next) trackEvent('showcase_audience_switch', { to: next, source });
        return next;
      });
      rememberAudience(next);
    },
    [trackEvent]
  );

  const audienceApi = useMemo<AudienceApi>(
    () => ({ audience, setAudience, pick: <T,>(variants: Variants<T>) => variants[audience] }),
    [audience, setAudience]
  );

  // The visitor's design (hero) lives in one store, shared by the sticky stage and the later chapters
  const store = useMemo(() => createStageStore(sceneFor({ phase: 1, p: 0, slider: 1, has3d: false }), DEFAULT_STAGE_DESIGN), []);
  useEffect(() => () => store.dispose(), [store]);
  const showcaseDesign = useShowcaseValue(store);

  // One event on arrival and one per chapter, the first time it is reached
  useEffect(() => {
    trackEvent('showcase_view', { audience });
    // once per visit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const seen = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).id;
          if (e.isIntersecting && !seen.has(id)) {
            seen.add(id);
            trackEvent('showcase_chapter_view', { chapter: id });
          }
        }
      },
      { threshold: 0.35 }
    );
    CHAPTER_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [trackEvent]);

  const url = `${SEO_CONFIG.siteUrl}${SHOWCASE_PATH}`;

  return (
    <Layout>
      <MetaTags
        title={`${SHOWCASE_META.title} | Vayu Packaging`}
        description={SHOWCASE_META.description}
        keywords={[...SHOWCASE_META.keywords]}
        canonical={url}
        image={SHOWCASE_META.ogImage}
      />
      {getShowcaseSchemas().map((data, i) => (
        <StructuredData key={i} type={SHOWCASE_SCHEMA_TYPES[i]} data={data} />
      ))}

      <AudienceContext.Provider value={audienceApi}>
        <ShowcaseDesignContext.Provider value={showcaseDesign}>
          <div className="paper-grain">
            <ScrollyShowcase
              store={store}
              hero={<HeroDesign />}
              unfold={<Unfold />}
              anatomy={<DielineAnatomy />}
              caption={(phase, beat) =>
                phase === 1
                  ? { index: '01', title: 'Your box, live. Change the size and it follows.' }
                  : phase === 2
                    ? { index: `02.${beat + 1}`, title: UNFOLD_BEATS[audience][beat].title }
                    : { index: '03', title: 'Point at a panel. Find it on the box.' }
              }
            />
          </div>
          <StyleSection />
          <ShareSection />
          <TakeawaySection />
          <ClosingHero />

          {/* the switch stays within reach on larger screens; on phones it sits in the hero and in chapter 6 */}
          <div className="pointer-events-none fixed inset-x-0 bottom-5 z-30 hidden justify-center md:flex">
            <div className="pointer-events-auto">
              <AudienceSwitch compact />
            </div>
          </div>
        </ShowcaseDesignContext.Provider>
      </AudienceContext.Provider>
    </Layout>
  );
}
