/**
 * SEO Configuration
 * Central configuration for all SEO-related settings
 */

import { CONTACT_INFO } from '@/constants';

export const SEO_CONFIG = {
  // Site Information
  siteName: 'Vayu Packaging Solutions',
  siteUrl: 'https://vayupackaging.vercel.app',
  defaultTitle: 'Vayu Packaging Solutions - Corrugated Box Distributors India',
  titleTemplate: '%s | Vayu Packaging Solutions',
  defaultDescription: 'India\'s trusted distributor of corrugated boxes. Custom sizes, bulk supply, 3-ply to 7-ply boxes, pan-India delivery. Get quote for packaging solutions.',
  
  // Social Media
  twitterHandle: '@vayupackaging',
  facebookPage: 'https://facebook.com/vayupackaging',
  linkedInPage: 'https://linkedin.com/company/vayu-packaging',
  instagramHandle: '@vayupackaging',
  
  // Organization Details
  organizationName: 'Vayu Packaging Solutions',
  logo: '/logo-horizontal.png',
  foundingDate: '2020',
  
  // Contact Information
  telephone: '+91 85116 58600',
  email: CONTACT_INFO.email,
  whatsapp: '+91 85116 58600',
  
  // Address
  address: {
    streetAddress: 'Mondeal Heights, SG Highway',
    addressLocality: 'Ahmedabad',
    addressRegion: 'Gujarat',
    postalCode: '380015',
    addressCountry: 'IN',
  },
  
  // Business Information
  areaServed: [
    'Gujarat',
    'Maharashtra', 
    'Delhi',
    'Karnataka',
    'Tamil Nadu',
    'Rajasthan',
    'Uttar Pradesh',
    'West Bengal',
    'Punjab',
    'Haryana',
  ],
  priceRange: '₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Cash, Credit Card, Debit Card, Bank Transfer, UPI',
  
  // Business Hours
  openingHours: 'Mo-Sa 09:00-18:00',
  
  // Products & Services
  productsOffered: [
    '3-Ply Corrugated Boxes',
    '5-Ply Corrugated Boxes',
    '7-Ply Corrugated Boxes',
    'Die-Cut Boxes',
    'Printed Packaging',
    'Food-Grade Boxes',
    'Custom Corrugated Solutions',
  ],
  
  // SEO Defaults
  defaultLanguage: 'en-IN',
  defaultLocale: 'en_IN',
  alternateLanguages: ['hi-IN', 'gu-IN'], // Future: Hindi, Gujarati
  defaultImage: '/og-image.jpg',
  imageWidth: 1200,
  imageHeight: 630,
  
  // Robots
  robotsFollow: true,
  robotsIndex: true,
  
  // Analytics & Tracking (add when ready)
  googleAnalyticsId: '', // GA4 measurement ID
  googleSiteVerification: '', // Google Search Console verification
  bingVerification: '', // Bing Webmaster verification
  
  // Business Identifiers
  vatId: '', // GST number if you want to add
  duns: '', // DUNS number if available
  
  // Additional
  minimumOrder: '500 boxes',
  deliveryTime: '48-72 hours for standard sizes',
  certifications: ['BIS Certified', 'ISO Compliant', 'FSSAI Approved'],
} as const;

// SEO Keywords Configuration
export const SEO_KEYWORDS = {
  // Brand Keywords
  brand: [
    'Vayu Packaging',
    'Vayu Packaging Solutions',
  ],
  
  // Primary Business Keywords
  primary: [
    'corrugated box distributors',
    'corrugated box supplier',
    'bulk corrugated boxes',
    'custom packaging solutions',
  ],
  
  // Product Keywords
  products: [
    '3-ply boxes',
    '5-ply boxes',
    '7-ply boxes',
    'corrugated packaging',
    'cardboard boxes',
  ],
  
  // Location Keywords
  location: [
    'Ahmedabad',
    'Gujarat',
    'India',
  ],
  
  // Industry Keywords
  industries: [
    'e-commerce packaging',
    'FMCG packaging',
    'electronics packaging',
    'food packaging',
  ],
} as const;

// Open Graph Defaults
export const OG_DEFAULTS = {
  type: 'website',
  siteName: SEO_CONFIG.siteName,
  locale: SEO_CONFIG.defaultLocale,
  imageWidth: SEO_CONFIG.imageWidth,
  imageHeight: SEO_CONFIG.imageHeight,
} as const;

// Twitter Card Defaults
export const TWITTER_DEFAULTS = {
  card: 'summary_large_image',
  site: SEO_CONFIG.twitterHandle,
} as const;
