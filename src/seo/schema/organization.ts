/**
 * Organization Schema
 * Schema.org structured data for the organization
 */

import { SEO_CONFIG } from '../config';

export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SEO_CONFIG.organizationName,
  url: SEO_CONFIG.siteUrl,
  logo: {
    '@type': 'ImageObject',
    url: `${SEO_CONFIG.siteUrl}${SEO_CONFIG.logo}`,
    width: 400,
    height: 100,
  },
  description: SEO_CONFIG.defaultDescription,
  
  // Contact Information
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: SEO_CONFIG.telephone,
      contactType: 'Sales',
      areaServed: 'IN',
      availableLanguage: ['en', 'hi', 'gu'],
      contactOption: 'TollFree',
    },
    {
      '@type': 'ContactPoint',
      email: SEO_CONFIG.email,
      contactType: 'Customer Service',
      areaServed: 'IN',
      availableLanguage: ['en'],
    },
  ],
  
  // Address
  address: {
    '@type': 'PostalAddress',
    streetAddress: SEO_CONFIG.address.streetAddress,
    addressLocality: SEO_CONFIG.address.addressLocality,
    addressRegion: SEO_CONFIG.address.addressRegion,
    postalCode: SEO_CONFIG.address.postalCode,
    addressCountry: SEO_CONFIG.address.addressCountry,
  },
  
  // Social Media
  sameAs: [
    SEO_CONFIG.facebookPage,
    SEO_CONFIG.linkedInPage,
    `https://twitter.com/${SEO_CONFIG.twitterHandle.replace('@', '')}`,
    `https://instagram.com/${SEO_CONFIG.instagramHandle.replace('@', '')}`,
  ],
  
  // Business Details
  foundingDate: SEO_CONFIG.foundingDate,
  
  // Area Served
  areaServed: SEO_CONFIG.areaServed.map(area => ({
    '@type': 'State',
    name: area,
    containedInPlace: {
      '@type': 'Country',
      name: 'India',
    },
  })),
  
  // Products/Services Offered
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Corrugated Box Products',
    itemListElement: SEO_CONFIG.productsOffered.map((product, index) => ({
      '@type': 'OfferCatalog',
      name: product,
      position: index + 1,
    })),
  },
  
  // Awards & Certifications
  award: SEO_CONFIG.certifications,
  
  // Know As
  alternateName: [
    'Vayu Packaging',
    'Vayu Corrugated Solutions',
  ],
});

export default getOrganizationSchema;
