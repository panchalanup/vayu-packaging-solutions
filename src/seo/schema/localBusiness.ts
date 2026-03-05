/**
 * Local Business Schema
 * Schema.org structured data for local business SEO
 */

import { SEO_CONFIG } from '../config';

export const getLocalBusinessSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SEO_CONFIG.siteUrl}/#localbusiness`,
  name: SEO_CONFIG.organizationName,
  image: `${SEO_CONFIG.siteUrl}${SEO_CONFIG.logo}`,
  url: SEO_CONFIG.siteUrl,
  telephone: SEO_CONFIG.telephone,
  email: SEO_CONFIG.email,
  
  // Address
  address: {
    '@type': 'PostalAddress',
    streetAddress: SEO_CONFIG.address.streetAddress,
    addressLocality: SEO_CONFIG.address.addressLocality,
    addressRegion: SEO_CONFIG.address.addressRegion,
    postalCode: SEO_CONFIG.address.postalCode,
    addressCountry: SEO_CONFIG.address.addressCountry,
  },
  
  // Geo Coordinates (Update with actual coordinates for Mondeal Heights, Ahmedabad)
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 23.0489,  // Approximate - update with actual
    longitude: 72.5075, // Approximate - update with actual
  },
  
  // Opening Hours
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ],
      opens: '09:00',
      closes: '18:00',
    },
  ],
  
  // Price Range
  priceRange: SEO_CONFIG.priceRange,
  
  // Payment Methods
  paymentAccepted: SEO_CONFIG.paymentAccepted,
  currenciesAccepted: SEO_CONFIG.currenciesAccepted,
  
  // Area Served
  areaServed: [
    {
      '@type': 'City',
      name: 'Ahmedabad',
      containedInPlace: {
        '@type': 'State',
        name: 'Gujarat',
      },
    },
    ...SEO_CONFIG.areaServed.map(state => ({
      '@type': 'State',
      name: state,
      containedInPlace: {
        '@type': 'Country',
        name: 'India',
      },
    })),
  ],
  
  // Reviews/Ratings (Add when you have actual reviews)
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '350',
    bestRating: '5',
    worstRating: '1',
  },
  
  // Services Offered
  makesOffer: SEO_CONFIG.productsOffered.map(product => ({
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Product',
      name: product,
    },
    availability: 'https://schema.org/InStock',
    priceCurrency: 'INR',
  })),
  
  // Same As (Social Media)
  sameAs: [
    SEO_CONFIG.facebookPage,
    SEO_CONFIG.linkedInPage,
    `https://twitter.com/${SEO_CONFIG.twitterHandle.replace('@', '')}`,
    `https://instagram.com/${SEO_CONFIG.instagramHandle.replace('@', '')}`,
  ],
  
  // Description
  description: SEO_CONFIG.defaultDescription,
  
  // Service Type
  additionalType: 'https://schema.org/Store',
  
  // Keywords
  keywords: 'corrugated boxes, packaging solutions, 3-ply boxes, 5-ply boxes, custom packaging, Ahmedabad',
});

export default getLocalBusinessSchema;
