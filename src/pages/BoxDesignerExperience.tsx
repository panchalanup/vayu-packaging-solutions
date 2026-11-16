/**
 * /3d-box-designer/experience: the film. One full-screen sticky stage (the live 3D box that opens into its printable
 * dieline) with a few big words over it, then a wall of box styles, the share-and-approve drawing, two tiles and a close.
 * Almost no text on purpose: motion explains, words only name. The same stage engine as /3d-box-designer, in its
 * "cinema" layout. SECURITY: all copy is static; JSON-LD is serialised by StructuredData.
 */

import { useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import MetaTags from '@/components/SEO/MetaTags';
import { StructuredData } from '@/components/SEO/StructuredData';
import { SEO_CONFIG } from '@/seo/config';
import { getBreadcrumbSchema } from '@/seo/schema';
import { EXPERIENCE_META, EXPERIENCE_PATH } from '@/content/designerShowcase';
import { DEFAULT_STAGE_DESIGN, createStageStore, sceneFor } from '@/lib/showcase/stage';
import { useEventTracker } from '@/hooks/useAnalytics';
import ScrollyShowcase from '@/components/showcase/ScrollyShowcase';
import { ShowcaseDesignContext } from '@/components/showcase/stageContext';
import { useShowcaseValue } from '@/components/showcase/useShowcaseValue';
import { CinemaHero, CinemaPrint, CinemaUnfold, CinemaWords } from '@/components/showcase/cinema/CinemaScenes';
import { AnyBoxScene, CloseScene, ShareScene, SidesScene } from '@/components/showcase/cinema/CinemaSections';
import PriceScene from '@/components/showcase/cinema/PriceScene';
import { BoardScene, MakeScene, SizeScene, StackScene } from '@/components/showcase/cinema/ToolScenes';
import ScrollProgress from '@/components/showcase/fx/ScrollProgress';

export default function BoxDesignerExperience() {
  const { trackEvent } = useEventTracker();
  const store = useMemo(() => createStageStore(sceneFor({ phase: 1, p: 0, slider: 1, has3d: false, variant: 'cinema' }), DEFAULT_STAGE_DESIGN), []);
  useEffect(() => () => store.dispose(), [store]);
  const value = useShowcaseValue(store);

  useEffect(() => {
    trackEvent('experience_view', {});
    // once per visit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout>
      <MetaTags
        title={EXPERIENCE_META.title}
        description={EXPERIENCE_META.description}
        keywords={[...EXPERIENCE_META.keywords]}
        canonical={`${SEO_CONFIG.siteUrl}${EXPERIENCE_PATH}`}
        image={EXPERIENCE_META.ogImage}
      />
      <StructuredData
        type="BreadcrumbList"
        data={getBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: '3D Box Designer', url: '/box-designer' },
          { name: 'See it in action', url: EXPERIENCE_PATH },
        ])}
      />

      <ShowcaseDesignContext.Provider value={value}>
        <ScrollProgress />
        {/* the film starts under the navbar (Layout pads the page by the navbar height) */}
        <div data-theme="ink" className="-mt-[72px] bg-ink-900 text-paper-50">
          <ScrollyShowcase store={store} layout="cinema" hero={<CinemaHero />} unfold={<CinemaUnfold />} anatomy={<CinemaPrint />} overlay={<CinemaWords />} />
          <AnyBoxScene />
          <SizeScene />
          <BoardScene />
          <PriceScene />
          <StackScene />
          <ShareScene />
          <SidesScene />
          <MakeScene />
          <CloseScene />
        </div>
      </ShowcaseDesignContext.Provider>
    </Layout>
  );
}
