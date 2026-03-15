/**
 * 3D Box Designer Tool Schema
 * Comprehensive structured data for the Box Designer page
 */

import { SEO_CONFIG } from '@/seo/config';

export interface BoxDesignerSchemaData {
  name: string;
  url: string;
  description: string;
  applicationCategory: string;
  operatingSystem?: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
  aggregateRating?: {
    ratingValue: string;
    ratingCount: string;
  };
  featureList?: string[];
}

/**
 * SoftwareApplication Schema for 3D Box Designer
 */
export function getBoxDesignerSchema(data?: Partial<BoxDesignerSchemaData>) {
  const defaultData: BoxDesignerSchemaData = {
    name: '3D Box Designer - Custom Packaging Design Tool',
    url: 'https://vayupackaging.vercel.app/box-designer',
    description: 'Free online 3D box designer tool for creating custom corrugated packaging. Design boxes with real-time visualization, dimension editing, material selection, and instant export. No signup required.',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Any (Web-based)',
    offers: {
      price: '0',
      priceCurrency: 'INR',
    },
    featureList: [
      'Real-time 3D box visualization with WebGL rendering',
      'Custom dimension editor (length, width, height)',
      'Material selector (3-ply, 5-ply, 7-ply corrugated)',
      'Box color and finish customization',
      'Upload custom graphics and logos on box faces',
      'Add text elements with custom fonts and colors',
      'Interactive fold animation preview',
      'Rotate, pan, and zoom 3D controls',
      'Instant screenshot capture and download',
      'Export design specifications as JSON',
      'Share designs via WhatsApp',
      'Mobile and desktop responsive',
      'No registration or credit card required',
      'Free forever with unlimited designs',
    ],
    ...data,
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: defaultData.name,
    url: defaultData.url,
    applicationCategory: defaultData.applicationCategory,
    operatingSystem: defaultData.operatingSystem,
    description: defaultData.description,
    screenshot: 'https://vayupackaging.vercel.app/screenshots/box-designer-preview.jpg',
    offers: {
      '@type': 'Offer',
      price: defaultData.offers.price,
      priceCurrency: defaultData.offers.priceCurrency,
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2030-12-31',
    },
    featureList: defaultData.featureList,
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    softwareVersion: '1.0',
    datePublished: '2025-03-15',
    provider: {
      '@type': 'Organization',
      name: SEO_CONFIG.organizationName,
      url: SEO_CONFIG.siteUrl,
      logo: `${SEO_CONFIG.siteUrl}${SEO_CONFIG.logo}`,
    },
    creator: {
      '@type': 'Organization',
      name: SEO_CONFIG.organizationName,
    },
    ...(defaultData.aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: defaultData.aggregateRating.ratingValue,
        ratingCount: defaultData.aggregateRating.ratingCount,
      },
    }),
  };
}

/**
 * FAQ Items for 3D Box Designer Tool
 */
export interface BoxDesignerFAQItem {
  question: string;
  answer: string;
}

export const BOX_DESIGNER_FAQS: BoxDesignerFAQItem[] = [
  {
    question: 'Is the 3D Box Designer really free to use?',
    answer: 'Yes! Our 3D Box Designer is 100% free with no hidden costs, no credit card required, and no signup needed. You can create unlimited box designs, visualize them in real-time 3D, add custom graphics, and export your designs - all completely free. We provide this tool to help businesses design perfect packaging before ordering.',
  },
  {
    question: 'What can I customize with the 3D Box Designer?',
    answer: 'You can customize box dimensions (length × width × height), select materials (3-ply, 5-ply, or 7-ply corrugated), choose box colors and finishes, upload your own logos/graphics on any box face, add text with custom fonts and colors, preview fold animations, and view your design from all angles with interactive 3D controls.',
  },
  {
    question: 'Can I download or export my box design?',
    answer: 'Absolutely! You can capture high-quality screenshots of your 3D design from any angle, export complete design specifications as JSON files for sharing with suppliers, and share your design directly via WhatsApp. All export features are free with no watermarks.',
  },
  {
    question: 'How accurate is the 3D visualization?',
    answer: 'Our 3D Box Designer uses WebGL rendering for photorealistic visualization. Dimensions are rendered to scale, materials show realistic corrugated textures, and the fold animation accurately represents how the box will look when assembled. However, for critical applications, we recommend confirming specifications with our team at +91 85116 58600.',
  },
  {
    question: 'Can I use the box designer on my mobile phone?',
    answer: 'Yes! The 3D Box Designer is fully responsive and works on mobile phones, tablets, and desktops. On mobile, you get optimized touch controls for rotating and zooming the 3D model. All features including dimension editing, material selection, and export are available on mobile devices.',
  },
  {
    question: 'Do I need to install any software to use the designer?',
    answer: 'No installation needed! The 3D Box Designer runs entirely in your web browser. It works on Chrome, Firefox, Safari, and Edge. Just visit the page and start designing immediately. Make sure JavaScript is enabled for the best experience.',
  },
  {
    question: 'Can I order boxes directly from my design?',
    answer: 'While the designer tool is separate from ordering, you can easily share your design specifications with us to get a quote. Use the "Get Quote" button in the designer, or download your design specs and send them to vayu.packagingsolutions@gmail.com. Our team will provide pricing within 24 hours for orders of 500+ boxes.',
  },
  {
    question: 'What box materials can I visualize in 3D?',
    answer: 'You can visualize 3-ply (single wall), 5-ply (double wall), and 7-ply (triple wall) corrugated boxes in various colors including natural kraft, white, and custom colors. The designer shows realistic textures for each material type so you can see exactly how your box will look before ordering.',
  },
];

/**
 * FAQ Schema for Box Designer
 */
export function getBoxDesignerFAQSchema(faqs: BoxDesignerFAQItem[] = BOX_DESIGNER_FAQS) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * HowTo Schema for using the Box Designer
 */
export function getBoxDesignerHowToSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Design a Custom Box in 3D',
    description: 'Step-by-step guide to designing custom corrugated boxes using our free 3D Box Designer tool',
    totalTime: 'PT5M',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Set Box Dimensions',
        text: 'Enter your desired box dimensions (length, width, height) in millimeters or inches. The 3D model updates in real-time.',
        position: 1,
      },
      {
        '@type': 'HowToStep',
        name: 'Select Material',
        text: 'Choose your corrugated board type: 3-ply for lightweight items, 5-ply for medium-duty, or 7-ply for heavy-duty packaging.',
        position: 2,
      },
      {
        '@type': 'HowToStep',
        name: 'Choose Color & Finish',
        text: 'Select from natural kraft, white, or custom colors. Preview different finishes to match your brand.',
        position: 3,
      },
      {
        '@type': 'HowToStep',
        name: 'Add Graphics & Text',
        text: 'Upload your logo or graphics, add text elements, and position them on any box face. Customize fonts, colors, and sizes.',
        position: 4,
      },
      {
        '@type': 'HowToStep',
        name: 'Preview & Rotate',
        text: 'Use 3D controls to rotate, pan, and zoom. Preview the fold animation to see how your box assembles.',
        position: 5,
      },
      {
        '@type': 'HowToStep',
        name: 'Export or Share',
        text: 'Capture screenshots, download design specs, or share directly via WhatsApp. Use the design to get supplier quotes.',
        position: 6,
      },
    ],
    tool: [
      {
        '@type': 'HowToTool',
        name: '3D Box Designer Tool',
      },
    ],
  };
}

/**
 * Breadcrumb Schema for Box Designer page
 */
export function getBoxDesignerBreadcrumbSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SEO_CONFIG.siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '3D Box Designer',
        item: `${SEO_CONFIG.siteUrl}/box-designer`,
      },
    ],
  };
}
