/**
 * Page-Specific SEO Metadata
 * Optimized meta tags for all main pages
 */

import { SEO_CONFIG } from '../config';

export interface PageMeta {
  title: string;
  description: string;
  keywords: string[];
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

export const PAGE_METADATA: Record<string, PageMeta> = {
  home: {
    title: 'Packaging Materials Distributor India | Corrugated Boxes, Tapes, Stretch Films',
    description: 'Vayu Packaging Solutions - Leading packaging materials distributor in India. Corrugated boxes (3-7 ply), BOPP tapes, stretch films, bubble wraps, strapping. Bulk supply, competitive pricing. Pan-India delivery.',
    keywords: [
      'packaging materials distributor India',
      'corrugated box distributors India',
      'BOPP tape supplier',
      'stretch film wholesale',
      'bubble wrap bulk',
      'strapping materials India',
      'bulk packaging supplies',
      '3-ply boxes India',
      '5-ply boxes supplier',
      '7-ply heavy duty boxes',
      'packaging tape distributor',
      'pallet wrap supplier',
      'protective packaging materials',
      'packaging wholesaler India',
    ],
    ogImage: '/og-home.jpg',
  },
  
  about: {
    title: 'About Vayu Packaging Solutions | Corrugated Box Supplier, Ahmedabad',
    // Figures follow src/content/facts.ts; unverified claims (BIS, "guaranteed") removed (VERIFY-LATER[CERT-01])
    description: 'Vayu Packaging Solutions supplies corrugated boxes and packaging materials from Ahmedabad: 5+ years, 250+ businesses served. Boxes made to order or sourced from vetted mills, all through one quality check.',
    keywords: [
      'about Vayu Packaging',
      'corrugated box company India',
      'packaging supplier background',
      'box distributor history',
      'trusted packaging company',
      'quality packaging solutions',
    ],
    // Only /og-image.jpg exists in /public (plan B5)
    ogImage: '/og-image.jpg',
  },
  
  products: {
    title: 'Corrugated Boxes & Packaging Supplies | 3, 5 and 7-ply Range',
    description: 'Corrugated boxes in 3, 5 and 7 ply, die-cut, printed and food-grade boxes, plus BOPP tape, stretch film, bubble wrap and PP strapping. Custom sizes, MOQ 500, GST invoice. Request a price.',
    keywords: [
      'corrugated boxes Ahmedabad',
      'types of corrugated boxes',
      '3-ply boxes',
      '5-ply corrugated boxes',
      '7-ply heavy duty boxes',
      'die-cut boxes',
      'printed packaging boxes',
      'food grade boxes',
      'BOPP tape',
      'stretch film',
      'bubble wrap rolls',
      'PP strapping bands',
    ],
    // OG image: only /og-image.jpg exists in /public (plan B5); canonical is set on the page so ?filters never leak into it
    ogImage: '/og-image.jpg',
  },
  
  services: {
    title: 'Industries & Services | Corrugated Packaging by Industry | Vayu Packaging',
    description: 'Corrugated packaging specs for e-commerce, FMCG, electronics, food and beverage, pharma and automotive. Custom sizing, printing, sampling and scheduled supply from Ahmedabad.',
    keywords: [
      'corrugated box distribution services',
      'bulk packaging supplier India',
      'custom box printing services',
      'packaging solutions provider',
      'box design services',
      'e-commerce packaging services',
      'FMCG packaging boxes',
      'automotive heavy duty boxes',
    ],
    ogImage: '/og-image.jpg',
  },
  
  blogs: {
    title: 'Packaging Guides & Industry Insights | Vayu Packaging Blog',
    description: 'Expert guides on corrugated boxes: types, measurements, quality standards, materials, flute types, GSM, burst strength. Learn from packaging industry professionals.',
    keywords: [
      'corrugated box guide',
      'packaging tips India',
      'box quality standards',
      'packaging industry insights',
      'corrugated box buying guide',
      'technical packaging guides',
    ],
    ogImage: '/og-blog.jpg',
  },
  
  contact: {
    title: 'Get Quote - Corrugated Box Supplier Ahmedabad | Contact Us',
    description: 'Contact Vayu Packaging for custom corrugated box quotes. Call +91 85116 58600 or email vayu.packagingsolutions@gmail.com. Minimum 500 boxes. Fast response within 24 hours.',
    keywords: [
      'corrugated box quote India',
      'packaging supplier contact',
      'Ahmedabad box distributor',
      'get packaging quote',
      'bulk order inquiry',
      'custom box quote',
      'contact packaging supplier',
    ],
    ogImage: '/og-contact.jpg',
  },

  locations: {
    title: 'Packaging Distribution Network in Gujarat | Ahmedabad, Surat, Vadodara & More',
    description: 'Vayu Packaging serves major Gujarat cities including Ahmedabad, Surat, Vadodara, Rajkot, Gandhinagar, Mehsana and more. Bulk corrugated boxes, BOPP tapes, stretch films and protective packaging with fast dispatch.',
    keywords: [
      'packaging supplier Gujarat',
      'corrugated box supplier Gujarat',
      'Ahmedabad packaging supplier',
      'Surat corrugated boxes',
      'Vadodara packaging distributor',
      'Rajkot box supplier',
      'bulk packaging materials Gujarat',
      'delivery network Gujarat',
      'industrial packaging Gujarat',
      'packaging distribution Ahmedabad',
    ],
    // Absolute canonical (the relative one was invalid)
    canonical: `${SEO_CONFIG.siteUrl}/locations`,
    ogImage: '/og-image.jpg',
  },
  
  packagingFinder: {
    title: 'Free Packaging Finder Tool | Smart Box Selector & Cost Calculator India',
    description: 'Find the perfect packaging in seconds! Free tool recommends corrugated boxes based on your product details. Get specifications, instant pricing & supplier quotes. 1500+ packaging solutions.',
    keywords: [
      'packaging finder tool',
      'corrugated box selector',
      'packaging calculator free',
      'box recommendation tool',
      'find right packaging for product',
      'packaging cost calculator India',
      'smart packaging tool',
      'box size finder',
      'packaging material selector',
      'corrugated box advisor',
      'packaging recommendation system',
      'box strength calculator',
      'packaging material guide',
      'corrugated box finder India',
      'free packaging tool online',
    ],
    ogImage: '/og-packaging-tool.jpg',
  },
  
  boxDesigner: {
    title: 'FREE 3D Box Designer Tool Online | Custom Packaging Design & Visualization',
    description: 'Design custom corrugated boxes in 3D for FREE! Real-time visualization, dimension editor, material selector. Export designs instantly. No credit card, no signup. Try now!',
    keywords: [
      '3D box designer free',
      'free 3D packaging design tool',
      'custom box designer online',
      'corrugated box design software free',
      '3D box mockup generator',
      'packaging visualization tool',
      'design packaging online free',
      'box dimension visualizer',
      '3D corrugated box designer',
      'custom packaging design tool',
      'free box design software India',
      'packaging mockup tool free',
      'visualize packaging before ordering',
      'interactive box designer',
      '3D packaging preview online',
      'real-time box customization',
      'box graphics designer free',
      'corrugated box 3D model',
      'packaging design visualization',
      'free packaging design software',
      'online box builder 3D',
      'custom box preview tool',
      'packaging design simulator',
      'box design calculator free',
      'no signup box designer',
    ],
    ogImage: '/og-box-designer.jpg',
  },
};

// Location-Specific Metadata (for future location pages)
export const LOCATION_METADATA: Record<string, PageMeta> = {
  ahmedabad: {
    title: 'Corrugated Box Supplier Ahmedabad | Vayu Packaging Gujarat',
    description: 'Top corrugated box supplier in Ahmedabad, Gujarat. Custom sizes, bulk orders, competitive pricing. 48-hour delivery across Ahmedabad. Call +91 85116 58600.',
    keywords: [
      'corrugated box supplier Ahmedabad',
      'packaging company Ahmedabad',
      'cardboard boxes Gujarat',
      'box distributor Ahmedabad',
      'Ahmedabad packaging solutions',
    ],
  },
  
  mumbai: {
    title: 'Corrugated Box Supplier Mumbai | Maharashtra Packaging Distributor',
    description: 'Reliable corrugated box supplier serving Mumbai and Maharashtra. 3-ply to 7-ply boxes, custom printing, bulk orders. Pan-Mumbai delivery.',
    keywords: [
      'corrugated box supplier Mumbai',
      'packaging company Mumbai',
      'Maharashtra box distributor',
      'Mumbai packaging solutions',
    ],
  },
  
  delhi: {
    title: 'Corrugated Box Supplier Delhi NCR | North India Packaging',
    description: 'Premium corrugated box supplier for Delhi, Noida, Gurgaon, Faridabad. Bulk orders, custom sizes, fast delivery across NCR region.',
    keywords: [
      'corrugated box supplier Delhi',
      'packaging company NCR',
      'Delhi box distributor',
      'Noida packaging supplier',
      'Gurgaon corrugated boxes',
    ],
  },
};

// Industry-Specific Metadata (for future industry pages)
export const INDUSTRY_METADATA: Record<string, PageMeta> = {
  ecommerce: {
    title: 'E-commerce Packaging Solutions | Corrugated Boxes for Online Stores',
    description: 'Specialized corrugated packaging for e-commerce businesses. Custom sizes, printed branding, bulk discounts. Perfect for shipping products safely.',
    keywords: [
      'e-commerce packaging solutions',
      'online store boxes',
      'shipping boxes for e-commerce',
      'custom printed boxes',
      'mailer boxes India',
    ],
  },
  
  fmcg: {
    title: 'FMCG Packaging Solutions | Bulk Corrugated Boxes for Consumer Goods',
    description: 'Heavy-duty corrugated boxes for FMCG distribution. Food-grade options, high stacking strength, bulk pricing. Serving major FMCG brands.',
    keywords: [
      'FMCG packaging solutions',
      'consumer goods boxes',
      'food grade packaging',
      'retail packaging boxes',
    ],
  },
  
  electronics: {
    title: 'Electronics Packaging | Protective Corrugated Boxes for Devices',
    description: '5-ply and 7-ply corrugated boxes for electronics. Maximum protection, custom inserts, anti-static options. Safe shipping for laptops, phones, appliances.',
    keywords: [
      'electronics packaging solutions',
      'laptop boxes',
      'mobile phone packaging',
      'appliance boxes',
      'protective packaging',
    ],
  },
  
  food: {
    title: 'Food-Grade Packaging | FSSAI Compliant Corrugated Boxes',
    description: 'FSSAI certified food-grade corrugated boxes. Virgin kraft paper, moisture resistant, safe for direct food contact. Serving food industry across India.',
    keywords: [
      'food grade packaging',
      'FSSAI compliant boxes',
      'food packaging solutions',
      'bakery boxes',
      'food delivery packaging',
    ],
  },
};
