/**
 * SoftwareApplication Schema
 * For the Packaging Finder Tool
 */

export interface SoftwareAppSchemaData {
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

export function getSoftwareApplicationSchema(data?: Partial<SoftwareAppSchemaData>) {
  const defaultData: SoftwareAppSchemaData = {
    name: 'Smart Packaging Finder Tool',
    url: 'https://vayupackaging.com/compare-quote',
    description: 'Free online tool to find the perfect corrugated packaging for your products. Get instant recommendations from 1500+ packaging solutions based on product details, with pricing and specifications.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    offers: {
      price: '0',
      priceCurrency: 'INR',
    },
    featureList: [
      'Instant packaging recommendations from 1500+ solutions',
      'Product-specific corrugated box selection',
      'Real-time pricing calculations',
      'Technical specifications (ECT, GSM, Burst strength)',
      'Supplier-ready quote generation',
      'PDF and CSV export options',
      'WhatsApp sharing capability',
      'Free to use, no registration required',
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
    offers: {
      '@type': 'Offer',
      price: defaultData.offers.price,
      priceCurrency: defaultData.offers.priceCurrency,
    },
    featureList: defaultData.featureList,
    provider: {
      '@type': 'Organization',
      name: 'Vayu Packaging Solutions',
      url: 'https://vayupackaging.com',
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

// FAQ Schema specifically for Packaging Tool
export interface ToolFAQItem {
  question: string;
  answer: string;
}

export const PACKAGING_TOOL_FAQS: ToolFAQItem[] = [
  {
    question: 'How do I choose the right packaging for my product?',
    answer: 'Our Smart Packaging Finder tool makes it easy! Simply enter your product details including name, weight, dimensions, and fragility level. The tool analyzes your requirements against our database of 1500+ packaging solutions and recommends the top 3 options with specifications, pricing, and why they\'re suitable for your needs.',
  },
  {
    question: 'What factors determine packaging requirements?',
    answer: 'Key factors include: product weight, dimensions, fragility level, transport method (courier, truck, air), quantity needed, and your priority (cost vs protection). Our tool considers all these factors using advanced scoring algorithms to match you with optimal packaging solutions including box type, board strength (ECT), flute type, and protective materials.',
  },
  {
    question: 'How accurate is the packaging finder tool?',
    answer: 'The tool provides recommendations based on industry standards and real packaging data from 1500+ solutions. However, we recommend sharing the results with your packaging supplier or our experts at +91 85116 58600 for final verification. The tool serves as a reliable starting point, giving you instant insights to make informed decisions.',
  },
  {
    question: 'Can I get quotes for bulk orders through the tool?',
    answer: 'Yes! The tool provides estimated pricing per unit and total costs. You can download supplier-ready specifications as PDF/CSV or share via WhatsApp directly with manufacturers. For bulk orders above 500 boxes, contact us at +91 85116 58600 or info.vayupackaging@gmail.com for volume discounts and custom solutions.',
  },
  {
    question: 'What packaging is best for fragile items?',
    answer: 'For fragile items, the tool automatically recommends packaging with: higher ECT values (44+ lb/in), 5-ply or 7-ply board construction, internal protection like bubble wrap or molded pulp trays, and appropriate cushioning materials. Mark your product as "High" fragility, and our algorithm prioritizes protection over cost.',
  },
  {
    question: 'Is the packaging finder tool really free to use?',
    answer: 'Yes, completely free with no hidden costs or registration required! You can use it unlimited times, download specifications, and share recommendations. We provide this tool to help businesses make informed packaging decisions. For actual orders, standard pricing applies based on quantity and specifications.',
  },
  {
    question: 'Can the tool recommend packaging for heavy products?',
    answer: 'Absolutely! The tool handles products from lightweight items (0.01 kg) to heavy goods (up to 1000 kg). For heavy products, it automatically suggests triple-wall (7-ply) corrugated boxes with high burst strength, appropriate flute types, and reinforcements like strapping and edge protectors for safe transport.',
  },
];

export function getToolFAQSchema(faqs: ToolFAQItem[] = PACKAGING_TOOL_FAQS) {
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
