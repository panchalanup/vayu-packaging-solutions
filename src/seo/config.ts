/**
 * SEO Configuration
 * Central configuration for all SEO-related settings
 */

import { CONTACT_INFO } from '@/constants';

export const GUJARAT_SERVICE_CITIES = [
  'Ahmedabad',
  'Gandhinagar',
  'Mehsana',
  'Himmatnagar',
  'Modasa',
  'Surat',
  'Vadodara',
  'Rajkot',
  'Bhavnagar',
  'Jamnagar',
  'Morbi',
  'Vapi',
] as const;

export const SEO_CONFIG = {
  // Site Information
  siteName: 'Vayu Packaging Solutions',
  siteUrl: 'https://vayupackaging.vercel.app',
  defaultTitle: 'Vayu Packaging Solutions - Packaging Materials Distributor India',
  titleTemplate: '%s | Vayu Packaging Solutions',
  defaultDescription: 'India\'s trusted distributor of packaging materials. Corrugated boxes (3-7 ply), BOPP tapes, stretch films, bubble wraps, strapping. Bulk supply, pan-India delivery.',
  
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
  
  // Products & Services - Complete Range
  productsOffered: [
    // Corrugated Boxes
    '3-Ply Corrugated Boxes',
    '5-Ply Corrugated Boxes',
    '7-Ply Corrugated Boxes',
    'Die-Cut Boxes',
    'Printed Packaging',
    'Food-Grade Boxes',
    // Packaging Materials
    'BOPP Packaging Tapes',
    'Masking Tape',
    'Double-Sided Tape',
    'PP Strapping Bands',
    'PET Strapping',
    'Stretch Films (Manual & Machine)',
    'Bubble Wrap Rolls',
    'Anti-Static Bubble Wrap',
  ],
  
  // Product Categories
  productCategories: [
    {
      name: 'Corrugated Boxes',
      description: 'Custom corrugated boxes from 3-ply to 7-ply for all packaging needs',
      items: ['3-Ply', '5-Ply', '7-Ply', 'Die-Cut', 'Printed', 'Food-Grade'],
    },
    {
      name: 'Packaging Tapes',
      description: 'High-quality adhesive tapes for secure packaging and shipping',
      items: ['BOPP Tape', 'Masking Tape', 'Double-Sided Tape', 'Duct Tape'],
    },
    {
      name: 'Strapping Materials',
      description: 'Durable strapping solutions for heavy-duty packaging',
      items: ['PP Strapping', 'PET Strapping', 'Strapping Tools'],
    },
    {
      name: 'Stretch Films',
      description: 'Protective stretch wrap for pallet wrapping and bundling',
      items: ['Manual Stretch Film', 'Machine Stretch Film', 'Colored Stretch Wrap'],
    },
    {
      name: 'Bubble Wraps',
      description: 'Protective bubble packaging for fragile items',
      items: ['Small Bubble', 'Large Bubble', 'Anti-Static Bubble Wrap'],
    },
  ],
  
  // Reviews & Ratings
  aggregateRating: {
    ratingValue: '4.8',
    reviewCount: '150',
    bestRating: '5',
    worstRating: '1',
  },
  
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
  googleSiteVerification: 'urbp6GuM4utEKeBi3a3iLVf68akri2sVvPwzgZ8rinE', // Google Search Console verification
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
    'packaging materials distributor',
    'corrugated box distributors',
    'bulk packaging supplies',
    'custom packaging solutions',
    'packaging wholesaler India',
  ],
  
  // Product Keywords - Corrugated Boxes
  boxes: [
    '3-ply boxes',
    '5-ply boxes',
    '7-ply boxes',
    'corrugated packaging',
    'cardboard boxes',
    'die-cut boxes',
    'custom printed boxes',
  ],
  
  // Product Keywords - Packaging Materials
  materials: [
    'BOPP tape',
    'packaging tape',
    'stretch film',
    'bubble wrap',
    'strapping bands',
    'PP strapping',
    'pallet wrap',
    'protective packaging',
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
