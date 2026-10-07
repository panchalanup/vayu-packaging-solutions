/** Home (§6): S1 The Fold → S2 Trust → S3 Inside the Board → S4 Range → S5 Industries → S6 Process → S7 Ordering → S8 Proof → S9 Talk to us */

import Layout from '@/components/Layout';
import { MetaTags, StructuredData } from '@/seo';
import { PAGE_METADATA } from '@/seo/metadata/pages';
import {
  getBreadcrumbSchema,
  getLocalBusinessSchema,
  getOrganizationSchema,
  getProductCatalogSchema,
  PAGE_BREADCRUMBS,
} from '@/seo/schema';
import { useScrollTracking } from '@/hooks/useAnalytics';
import HeroFold from '@/components/home/hero/HeroFold';
import TrustBar from '@/components/home/TrustBar';
import InsideTheBoard from '@/components/home/InsideTheBoard';
import RangeIndex from '@/components/home/RangeIndex';
import Industries from '@/components/home/Industries';
import DielineToDispatch from '@/components/home/DielineToDispatch';
import OrderYourWay from '@/components/home/OrderYourWay';
import { Proof, TalkToUs } from '@/components/home/ProofAndContact';

export default function Home() {
  useScrollTracking();
  return (
    <Layout>
      <MetaTags {...PAGE_METADATA.home} />
      <StructuredData type="Organization" data={getOrganizationSchema()} />
      <StructuredData type="LocalBusiness" data={getLocalBusinessSchema()} />
      <StructuredData type="BreadcrumbList" data={getBreadcrumbSchema(PAGE_BREADCRUMBS.home)} />
      <StructuredData type="ItemList" data={getProductCatalogSchema()} />

      <HeroFold />
      <TrustBar />
      <InsideTheBoard />
      <RangeIndex />
      <Industries />
      <DielineToDispatch />
      <OrderYourWay />
      <Proof />
      <TalkToUs />
    </Layout>
  );
}
