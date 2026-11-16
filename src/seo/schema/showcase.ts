/**
 * Structured data for the 3D Box Designer showcase page (/3d-box-designer): the tool as a SoftwareApplication, its
 * FAQ and the breadcrumb. Copy comes from src/content/designerShowcase.ts so the page and its markup cannot disagree.
 */

import { SEO_CONFIG } from '@/seo/config';
import { SHOWCASE_FAQS, SHOWCASE_FEATURE_LIST, SHOWCASE_META, SHOWCASE_PATH } from '@/content/designerShowcase';
import { getBoxDesignerSchema } from './boxDesigner';
import { getBreadcrumbSchema } from './breadcrumb';
import { getFAQSchema } from './faq';

/** Order matches getShowcaseSchemas() */
export const SHOWCASE_SCHEMA_TYPES = ['SoftwareApplication', 'FAQPage', 'BreadcrumbList'] as const;

export const getShowcaseSchemas = (): object[] => [
  getBoxDesignerSchema({
    name: 'Vayu 3D Box Designer',
    url: `${SEO_CONFIG.siteUrl}${SHOWCASE_PATH}`,
    description: SHOWCASE_META.description,
    featureList: [...SHOWCASE_FEATURE_LIST],
  }),
  getFAQSchema(SHOWCASE_FAQS),
  getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: '3D Box Designer', url: '/box-designer' },
    { name: 'How it works', url: SHOWCASE_PATH },
  ]),
];
