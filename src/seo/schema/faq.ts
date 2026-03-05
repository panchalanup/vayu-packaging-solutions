/**
 * FAQ Schema
 * Schema.org structured data for FAQ sections
 */

export interface FAQItem {
  question: string;
  answer: string;
}

export const getFAQSchema = (faqs: FAQItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

// Common FAQs for different pages
export const COMMON_FAQS = {
  products: [
    {
      question: 'What types of corrugated boxes do you supply?',
      answer: 'We supply 3-ply (single wall), 5-ply (double wall), and 7-ply (triple wall) corrugated boxes. We also offer die-cut boxes, printed packaging, and FSSAI-compliant food-grade boxes in custom sizes.',
    },
    {
      question: 'What is the minimum order quantity?',
      answer: 'Our minimum order quantity is 500 boxes. This allows us to offer competitive bulk pricing while maintaining the highest quality standards.',
    },
    {
      question: 'How long does delivery take?',
      answer: 'Standard size boxes are dispatched within 48 hours. Custom boxes typically take 5-7 days depending on specifications. We deliver pan-India with tracking.',
    },
    {
      question: 'Can you provide custom sizes?',
      answer: 'Yes, we specialize in custom-sized corrugated boxes. Simply provide your L × B × H dimensions (or product dimensions), and we\'ll manufacture boxes to fit your exact requirements.',
    },
    {
      question: 'Do you offer printing on boxes?',
      answer: 'Yes, we offer flexo and offset printing for custom branding on corrugated boxes. Minimum order for printed boxes is 1,000 units. We can print logos, product information, and full-color designs.',
    },
  ],
  
  services: [
    {
      question: 'What industries do you serve?',
      answer: 'We serve e-commerce, FMCG, electronics, food & beverage, pharmaceuticals, automotive, and many other industries. Our corrugated boxes are customized to meet industry-specific requirements.',
    },
    {
      question: 'Do you provide quality certifications?',
      answer: 'Yes, all our boxes meet BIS quality standards. We provide test certificates with each order showing burst strength, ECT (Edge Crush Test), and GSM (paper weight) values.',
    },
    {
      question: 'What areas do you deliver to?',
      answer: 'We deliver pan-India including Gujarat, Maharashtra, Delhi, Karnataka, Tamil Nadu, and all major cities. We have partnerships with reliable logistics providers for timely delivery.',
    },
    {
      question: 'Can you help with box design?',
      answer: 'Yes, our team provides design consultation to help you choose the right box type, size, and flute specification for your products. We ensure optimal protection and cost-efficiency.',
    },
  ],
  
  pricing: [
    {
      question: 'How is corrugated box pricing calculated?',
      answer: 'Pricing depends on box size, ply (3-ply, 5-ply, 7-ply), GSM (paper weight), quantity ordered, and any customizations like printing. Larger quantities get better per-unit pricing.',
    },
    {
      question: 'Do you offer bulk discounts?',
      answer: 'Yes, we offer competitive bulk pricing. The more you order, the better the per-box rate. Contact us with your requirements for a detailed quote.',
    },
    {
      question: 'Are there any hidden charges?',
      answer: 'No hidden charges. Our quotes include box manufacturing costs. Shipping charges are calculated separately based on delivery location and order weight.',
    },
  ],
  
  quality: [
    {
      question: 'What is burst strength in corrugated boxes?',
      answer: 'Burst strength measures the pressure required to rupture the corrugated board. It indicates the box\'s ability to withstand impact and rough handling. Measured in kg/cm².',
    },
    {
      question: 'What is ECT (Edge Crush Test)?',
      answer: 'ECT measures the stacking strength of corrugated boxes—how much weight they can support when stacked. Critical for warehouse storage and shipping containers.',
    },
    {
      question: 'What does GSM mean in corrugated boxes?',
      answer: 'GSM (Grams per Square Meter) measures paper weight. Higher GSM means heavier, stronger paper. Total box GSM is the sum of all layers (top liner + fluting + bottom liner).',
    },
    {
      question: 'What is the difference between virgin and recycled kraft paper?',
      answer: 'Virgin kraft paper is made from fresh wood pulp, offering maximum strength and moisture resistance. Recycled kraft uses recovered paper, offering cost savings while being eco-friendly. We offer both options.',
    },
  ],
  
  general: [
    {
      question: 'What is the minimum order quantity for corrugated boxes?',
      answer: 'Our minimum order quantity is 500 boxes. This allows us to offer competitive bulk pricing while maintaining quality standards.',
    },
    {
      question: 'How long does delivery take?',
      answer: 'Standard sizes are dispatched within 48 hours. Custom boxes take 5-7 days. Pan-India delivery available.',
    },
    {
      question: 'Are your boxes BIS certified?',
      answer: 'Yes, all our corrugated boxes meet BIS quality standards. We provide test certificates with each order.',
    },
    {
      question: 'Do you provide samples?',
      answer: 'Yes, we can provide samples before bulk ordering. Contact us with your requirements.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept cash, credit card, debit card, bank transfer, and UPI payments. Payment terms can be discussed for large orders.',
    },
  ],
};

export default getFAQSchema;
