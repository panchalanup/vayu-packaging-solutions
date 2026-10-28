/**
 * Structured data for the free calculator pages (/tools/<slug>): WebApplication and HowTo.
 * (FAQPage and BreadcrumbList come from faq.ts and breadcrumb.ts.) Pure; no ratings or reviews are ever added.
 */

import { SEO_CONFIG } from '../config';
import type { ToolPage } from '@/content/toolPages';

export const getToolWebApplicationSchema = (tool: ToolPage) => ({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: tool.name,
  url: `${SEO_CONFIG.siteUrl}${tool.path}`,
  description: tool.metaDescription,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any (runs in the browser)',
  browserRequirements: 'Requires JavaScript',
  inLanguage: 'en-IN',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  provider: { '@type': 'Organization', name: SEO_CONFIG.organizationName, url: SEO_CONFIG.siteUrl },
});

export const getToolHowToSchema = (tool: ToolPage) => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: tool.howTo.name,
  description: tool.answer,
  totalTime: 'PT2M',
  tool: [{ '@type': 'HowToTool', name: tool.name }],
  step: tool.howTo.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text })),
});
