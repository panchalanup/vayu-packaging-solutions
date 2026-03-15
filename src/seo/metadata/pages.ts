/**
 * Page-Specific SEO Metadata
 * Optimized meta tags for all main pages
 */

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
    title: 'Corrugated Box Distributors India | 3-Ply, 5-Ply, 7-Ply Boxes',
    description: 'Vayu Packaging Solutions - Leading corrugated box distributor in India. Custom packaging, bulk supply, competitive pricing. 500+ boxes minimum order. Pan-India delivery within 48 hours.',
    keywords: [
      'corrugated box distributors India',
      'bulk corrugated boxes',
      'custom packaging solutions',
      '3-ply boxes India',
      '5-ply boxes supplier',
      '7-ply heavy duty boxes',
      'cardboard boxes wholesale',
      'packaging company India',
      'custom printed boxes',
      'corrugated packaging supplier',
    ],
    ogImage: '/og-home.jpg',
  },
  
  about: {
    title: 'About Us - Trusted Corrugated Box Supplier Since 2020',
    description: 'Vayu Packaging Solutions: 5+ years of excellence in corrugated box distribution. Serving 250+ clients across 50+ cities in India. BIS certified quality, on-time delivery guaranteed.',
    keywords: [
      'about Vayu Packaging',
      'corrugated box company India',
      'packaging supplier background',
      'box distributor history',
      'trusted packaging company',
      'BIS certified boxes',
      'quality packaging solutions',
    ],
    ogImage: '/og-about.jpg',
  },
  
  products: {
    title: '3-Ply, 5-Ply, 7-Ply Corrugated Boxes | Custom Packaging Products',
    description: 'Complete range of corrugated boxes: 3-ply (lightweight), 5-ply (medium-duty), 7-ply (heavy-duty), die-cut boxes, printed packaging, and food-grade boxes. Custom sizes available. Get instant quote.',
    keywords: [
      'types of corrugated boxes',
      '3-ply boxes price',
      '5-ply corrugated boxes',
      '7-ply heavy duty boxes',
      'custom die-cut boxes India',
      'printed packaging boxes',
      'food grade boxes FSSAI',
      'corrugated box products',
      'single wall boxes',
      'double wall boxes',
      'triple wall boxes',
    ],
    ogImage: '/og-products.jpg',
  },
  
  services: {
    title: 'Bulk Corrugated Box Distribution Services | Custom Printing India',
    description: 'End-to-end packaging solutions: custom box design, bulk distribution, quality testing, custom printing, pan-India delivery. Serving e-commerce, FMCG, electronics, food industries.',
    keywords: [
      'corrugated box distribution services',
      'bulk packaging supplier India',
      'custom box printing services',
      'packaging solutions provider',
      'box design services',
      'quality assurance packaging',
      'pan-India delivery',
      'e-commerce packaging services',
    ],
    ogImage: '/og-services.jpg',
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
