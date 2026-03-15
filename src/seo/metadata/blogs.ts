/**
 * Blog-Specific SEO Metadata
 * Optimized SEO data for all blog posts
 */

export interface BlogSEOMeta {
  focusKeyword: string;
  keywords: string[];
  metaDescription: string;
  breadcrumbs: string[];
  relatedKeywords: string[]; // LSI keywords
  targetAudience: string[];
  ogImage?: string;
}

export const BLOG_SEO_METADATA: Record<string, BlogSEOMeta> = {
  'types-of-corrugated-boxes': {
    focusKeyword: 'types of corrugated boxes',
    keywords: [
      'types of corrugated boxes',
      '3-ply boxes',
      '5-ply boxes',
      '7-ply boxes',
      'die-cut boxes',
      'printed corrugated boxes',
      'food-grade boxes',
      'corrugated box types',
    ],
    metaDescription: 'Complete guide to corrugated box types: 3-ply, 5-ply, 7-ply, die-cut, printed & food-grade. Learn which box is perfect for your products with comparison table and real examples.',
    breadcrumbs: ['Home', 'Blogs', 'Types of Corrugated Boxes'],
    relatedKeywords: [
      'corrugated packaging types',
      'box ply meaning',
      'single wall vs double wall',
      'corrugated box specifications',
      'choosing corrugated boxes',
    ],
    targetAudience: ['e-commerce owners', 'FMCG distributors', 'procurement managers', 'packaging buyers'],
    ogImage: '/blog-images/types-of-boxes-og.jpg',
  },
  
  'corrugated-wall-differences': {
    focusKeyword: 'single wall vs double wall corrugated',
    keywords: [
      'single wall corrugated',
      'double wall corrugated',
      'triple wall corrugated',
      '3-ply vs 5-ply',
      '5-ply vs 7-ply',
      'corrugated wall differences',
    ],
    metaDescription: 'Understand single wall, double wall, and triple wall corrugated boxes. Learn the strength differences, applications, and how to choose the right wall construction for your packaging needs.',
    breadcrumbs: ['Home', 'Blogs', 'Corrugated Wall Differences'],
    relatedKeywords: [
      'corrugated board structure',
      'wall construction packaging',
      'box strength comparison',
    ],
    targetAudience: ['packaging engineers', 'quality managers', 'export businesses'],
  },
  
  'flute-types-guide': {
    focusKeyword: 'corrugated box flute types',
    keywords: [
      'A flute corrugated',
      'B flute boxes',
      'C flute packaging',
      'E flute retail',
      'F flute luxury',
      'corrugated flute sizes',
      'flute types comparison',
    ],
    metaDescription: 'A, B, C, E, F flute guide for corrugated boxes. Learn which flute type offers best cushioning, printability, or stacking strength for your specific packaging requirements.',
    breadcrumbs: ['Home', 'Blogs', 'Flute Types Guide'],
    relatedKeywords: [
      'flute profile corrugated',
      'corrugation types',
      'box cushioning strength',
      'packaging flute selection',
    ],
    targetAudience: ['packaging engineers', 'quality managers', 'technical buyers', 'product designers'],
    ogImage: '/blog-images/flute-types-og.jpg',
  },
  
  'gsm-calculation-strength': {
    focusKeyword: 'GSM in corrugated boxes',
    keywords: [
      'GSM corrugated boxes',
      'paper weight GSM',
      'kraft paper GSM',
      'box strength GSM',
      'GSM calculation',
      'corrugated board GSM',
    ],
    metaDescription: 'Understand GSM (Grams per Square Meter) in corrugated packaging. Learn how paper weight affects box strength, cost, and performance. Complete calculation guide with examples.',
    breadcrumbs: ['Home', 'Blogs', 'GSM Calculation & Strength'],
    relatedKeywords: [
      'paper weight packaging',
      'kraft paper thickness',
      'box material weight',
      'GSM to strength ratio',
    ],
    targetAudience: ['procurement managers', 'quality engineers', 'packaging buyers', 'cost analysts'],
    ogImage: '/blog-images/gsm-guide-og.jpg',
  },
  
  'burst-strength-ect-guide': {
    focusKeyword: 'burst strength vs ECT',
    keywords: [
      'burst strength corrugated',
      'ECT edge crush test',
      'box quality standards',
      'burst strength meaning',
      'ECT rating boxes',
      'corrugated box testing',
    ],
    metaDescription: 'Learn the difference between Burst Strength (BS) and Edge Crush Test (ECT) in corrugated boxes. Understand which test matters for your packaging and how to interpret values.',
    breadcrumbs: ['Home', 'Blogs', 'Burst Strength vs ECT Guide'],
    relatedKeywords: [
      'box strength testing',
      'quality standards packaging',
      'compression strength',
      'stacking strength boxes',
    ],
    targetAudience: ['quality managers', 'packaging engineers', 'procurement teams', 'warehouse managers'],
    ogImage: '/blog-images/burst-ect-og.jpg',
  },
  
  'box-measurements-guide': {
    focusKeyword: 'how to measure corrugated boxes',
    keywords: [
      'box measurements guide',
      'L x B x H dimensions',
      'measuring corrugated boxes',
      'interior vs exterior dimensions',
      'box sizing guide',
      'corrugated box dimensions',
    ],
    metaDescription: 'Learn how to correctly measure corrugated boxes using L × B × H dimensions. Understand interior vs exterior measurements and avoid costly sizing mistakes with our complete guide.',
    breadcrumbs: ['Home', 'Blogs', 'Box Measurements Guide'],
    relatedKeywords: [
      'box dimension calculation',
      'packaging size guide',
      'measuring boxes correctly',
      'box clearance requirements',
    ],
    targetAudience: ['e-commerce businesses', 'packaging buyers', 'warehouse staff', 'product managers'],
    ogImage: '/blog-images/measurements-og.jpg',
  },
  
  'kraft-paper-grades': {
    focusKeyword: 'virgin vs recycled kraft paper',
    keywords: [
      'virgin kraft paper',
      'recycled kraft paper',
      'kraft paper grades',
      'kraft paper quality',
      'corrugated box materials',
      'sustainable packaging',
    ],
    metaDescription: 'Learn the differences between virgin and recycled kraft paper in corrugated boxes. Understand performance, cost, sustainability, and which grade is right for your packaging needs.',
    breadcrumbs: ['Home', 'Blogs', 'Kraft Paper Grades'],
    relatedKeywords: [
      'kraft paper comparison',
      'packaging material choice',
      'sustainable kraft paper',
      'paper quality packaging',
    ],
    targetAudience: ['sustainability managers', 'procurement teams', 'packaging buyers', 'FMCG companies'],
    ogImage: '/blog-images/kraft-paper-og.jpg',
  },
  
  '3d-box-designer-tool-free': {
    focusKeyword: '3D box designer tool free',
    keywords: [
      '3D box designer',
      'free box design tool',
      'custom packaging design',
      '3D packaging visualization',
      'corrugated box design online',
      'box mockup generator',
      'packaging design software free',
      'visualize packaging before ordering',
      'interactive box designer',
    ],
    metaDescription: 'Design custom corrugated boxes in 3D for FREE. Visualize dimensions, materials, and branding before ordering. No more guesswork or costly mistakes. Try our interactive tool now - no credit card required.',
    breadcrumbs: ['Home', 'Blogs', '3D Box Designer Tool'],
    relatedKeywords: [
      'packaging visualization tool',
      'box design software online',
      'custom box mockup',
      '3D packaging preview',
      'design packaging online',
      'box dimension calculator',
      'packaging cost estimator',
      'real-time box design',
      'corrugated box customization',
      'packaging design tool',
    ],
    targetAudience: [
      'e-commerce businesses',
      'product manufacturers',
      'FMCG distributors',
      'import/export companies',
      'sales teams',
      'packaging buyers',
      'startup founders',
      'product designers',
    ],
    ogImage: '/blog-images/3d-box-designer-og.jpg',
  },
};

// Category-wise keyword mapping
export const BLOG_CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Buying Guide': [
    'how to buy corrugated boxes',
    'choosing packaging',
    'box buying tips',
    'packaging selection guide',
  ],
  'Technical Guide': [
    'corrugated box specifications',
    'technical packaging guide',
    'box engineering',
    'packaging standards',
  ],
  'Quality Standards': [
    'box quality testing',
    'packaging standards India',
    'BIS certification',
    'quality assurance packaging',
  ],
  'Industry Insights': [
    'packaging industry trends',
    'corrugated box market',
    'packaging innovations',
    'industry best practices',
  ],
};

// Common FAQs for all blogs (can be customized per blog)
export const BLOG_COMMON_FAQS = [
  {
    question: 'What is the minimum order quantity for corrugated boxes?',
    answer: 'Our minimum order quantity is 500 boxes. This allows us to offer competitive bulk pricing while maintaining quality standards.',
  },
  {
    question: 'How long does delivery take?',
    answer: 'Standard size boxes are dispatched within 48 hours. Custom boxes typically take 5-7 days depending on specifications. We deliver pan-India.',
  },
  {
    question: 'Do you provide custom printing on boxes?',
    answer: 'Yes, we offer flexo and offset printing options for custom branding on corrugated boxes. Minimum order for printed boxes is 1,000 units.',
  },
  {
    question: 'Are your boxes BIS certified?',
    answer: 'Yes, all our corrugated boxes meet BIS quality standards. We provide test certificates with each order showing burst strength, ECT, and GSM values.',
  },
];
