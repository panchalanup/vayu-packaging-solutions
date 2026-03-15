/**
 * Schema Export Index
 * Centralized exports for all schema types
 */

export { getOrganizationSchema } from './organization';
export { getLocalBusinessSchema } from './localBusiness';
export { getArticleSchema, getBlogPostingSchema } from './article';
export { getProductSchema, PRODUCT_SCHEMAS, type ProductSchemaData } from './product';
export { getBreadcrumbSchema, PAGE_BREADCRUMBS, getBlogBreadcrumbs, getProductBreadcrumbs, type BreadcrumbItem } from './breadcrumb';
export { getFAQSchema, COMMON_FAQS, type FAQItem } from './faq';
export { getSoftwareApplicationSchema, getToolFAQSchema, PACKAGING_TOOL_FAQS, type SoftwareAppSchemaData, type ToolFAQItem } from './softwareApplication';
export { 
  getBoxDesignerSchema, 
  getBoxDesignerFAQSchema, 
  getBoxDesignerBreadcrumbSchema,
  getBoxDesignerHowToSchema,
  BOX_DESIGNER_FAQS,
  type BoxDesignerSchemaData,
  type BoxDesignerFAQItem 
} from './boxDesigner';
