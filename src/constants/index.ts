/**
 * Application Constants
 * Central location for all hardcoded values used across the application
 */

// ============================================
// CONTACT INFORMATION
// ============================================
export const CONTACT_INFO = {
  phone: '+91 85116 58600',
  email: 'vayu.packagingsolutions@gmail.com',
  address: 'Mondeal Heights, Ahmedabad',
  addressFull: 'Mondeal Heights, SG Highway Ahmedabad, Gujarat 380015',
} as const;

// ============================================
// COMPANY INFORMATION
// ============================================
export const COMPANY_INFO = {
  name: 'Vayu Packaging Solutions',
  tagline: 'Delivering quality, one box at a time',
  description: 'Your trusted partner for premium corrugated packaging solutions. Quality boxes, competitive pricing, pan-India delivery.',
  copyright: '© 2025 Vayu Packaging Solutions. All rights reserved.',
} as const;

// ============================================
// STATISTICS
// ============================================
export const STATS = {
  yearsExperience: {
    value: '5+',
    label: 'Years of Experience',
  },
  happyClients: {
    value: '250+',
    label: 'Happy Clients',
  },
  boxesDelivered: {
    value: '5M+',
    label: 'Boxes Delivered',
  },
  citiesServed: {
    value: '50+',
    label: 'Cities Served',
  },
} as const;

// Export as array for easy iteration
export const STATS_ARRAY = [
  STATS.yearsExperience,
  STATS.happyClients,
  STATS.boxesDelivered,
  STATS.citiesServed,
] as const;

// ============================================
// BUSINESS DETAILS
// ============================================
export const BUSINESS_DETAILS = {
  minOrderQuantity: 500,
  minOrderText: 'Minimum order from 500 boxes',
  dispatchTime: '48 hours',
  dispatchText: '48-Hour Dispatch',
  dispatchDescription: 'Standard sizes dispatched within 48 hours from our strategically located warehouses across India.',
} as const;

// ============================================
// INDUSTRIES SERVED
// ============================================
export const INDUSTRIES = [
  'E-Commerce',
  'FMCG',
  'Electronics',
  'Food & Beverage',
  'Pharmaceuticals',
  'Automotive',
] as const;

// ============================================
// NAVIGATION LINKS
// ============================================
export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Services', path: '/services' },
  { label: 'Products', path: '/products' },
  { label: 'Blogs', path: '/blogs' },
  { label: 'Contact', path: '/contact' },
] as const;

// ============================================
// FEATURES & BENEFITS
// ============================================
export const KEY_FEATURES = [
  'Custom box sizes for any industry',
  'Bulk supply with competitive pricing',
  'On-time delivery guarantee',
] as const;

export const KEY_FEATURES_EXTENDED = [
  'Custom box sizes for any industry',
  'Bulk supply with competitive pricing',
  'On-time delivery guarantee',
  'BIS certified quality standards',
] as const;

export const CTA_FEATURES = [
  '3-ply, 5-ply & 7-ply corrugated boxes',
  'Custom printing & branding options',
  'Pan-India delivery network',
  'Minimum order from 500 boxes',
] as const;

// ============================================
// WHY CHOOSE VAYU
// ============================================
export const WHY_VAYU = [
  {
    num: '01',
    title: 'Direct Mill Sourcing',
    desc: 'We source directly from top corrugated manufacturers, cutting middlemen costs and passing savings to you.',
  },
  {
    num: '02',
    title: '48-Hour Dispatch',
    desc: 'Standard sizes dispatched within 48 hours from our strategically located warehouses across India.',
  },
  {
    num: '03',
    title: 'Eco-Friendly Materials',
    desc: '100% recyclable and biodegradable packaging materials that are kind to the planet.',
  },
] as const;

export const WHY_VAYU_EXTENDED = [
  {
    num: '01',
    title: 'Direct Mill Sourcing',
    desc: 'We source directly from top corrugated manufacturers, cutting middlemen costs and passing savings to you.',
  },
  {
    num: '02',
    title: '48-Hour Dispatch',
    desc: 'Standard sizes dispatched within 48 hours from our strategically located warehouses across India.',
  },
  {
    num: '03',
    title: 'Eco-Friendly Materials',
    desc: '100% recyclable and biodegradable packaging that are kind to the planet.',
  },
  {
    num: '04',
    title: 'Dedicated Account Manager',
    desc: 'Every client gets a dedicated point of contact for seamless communication and order management.',
  },
] as const;

// ============================================
// HERO SECTION
// ============================================
export const HERO_CONTENT = {
  tagline: 'Trusted Corrugated Box Distributor',
  heading: 'Packaging solutions that protect what matters most',
  description: "India's reliable partner for high-quality corrugated boxes — custom sizes, bulk supply, and on-time delivery for every industry.",
  primaryCTA: 'Get a Quote',
  secondaryCTA: 'Our Services',
} as const;

// ============================================
// ABOUT SECTION
// ============================================
export const ABOUT_CONTENT = {
  heading: 'Reliable corrugated box distribution built on trust & quality',
  description: 'Vayu Packaging Solutions is a leading distributor of corrugated boxes across India. We source from certified manufacturers and deliver custom packaging solutions tailored to your business — from e-commerce to FMCG, electronics to food.',
  story: {
    paragraph1: 'Founded over a decade ago, Vayu Packaging started with a simple mission — deliver high-quality corrugated boxes at fair prices with unmatched reliability.',
    paragraph2: 'Today, we serve 5,000+ businesses across e-commerce, FMCG, electronics, food, pharmaceuticals, and automotive industries with a pan-India delivery network.',
  },
} as const;

// ============================================
// SERVICES CONTENT
// ============================================
export const SERVICES_CONTENT = {
  heading: 'End-to-end corrugated packaging solutions',
  description: 'From sourcing raw materials to final delivery, we handle the complete packaging lifecycle.',
  industryHeading: 'Serving industries that demand excellence',
  industryDescription: "Whether you're shipping electronics, food products, pharmaceuticals, or e-commerce goods — our corrugated solutions are engineered to protect and impress.",
} as const;

// ============================================
// CONTACT SECTION
// ============================================
export const CONTACT_CONTENT = {
  heading: "Let's discuss your packaging needs",
  description: 'Whether you need a quote for bulk orders or want to explore custom packaging, our team is here to help.',
} as const;

// ============================================
// FORM PLACEHOLDERS
// ============================================
export const FORM_PLACEHOLDERS = {
  name: 'John Doe',
  company: 'Acme Inc.',
  email: 'john@company.com',
  phone: '+91 XXXXX XXXXX',
  requirements: 'Tell us about your packaging needs — box sizes, quantity, delivery timeline...',
  requirementsShort: 'Tell us about your packaging needs...',
} as const;

// ============================================
// WEBSITE & SOCIAL LINKS
// ============================================
export const WEBSITE_URL = 'https://vayupackaging.vercel.app' as const;

export const SOCIAL_LINKS = {
  whatsapp: 'https://wa.me/918511658600',
  whatsappBase: 'https://wa.me/',
  phone: 'https://wa.me/918511658600',
  instagram: 'https://www.instagram.com/vayu_packaging_solutions?igsh=bnJsN2EzZTdja3Nn',
} as const;

// ============================================
// TOOLS INFORMATION
// ============================================
export const TOOL_INFO = {
  packagingFinder: {
    name: 'Smart Packaging Finder',
    path: '/compare-quote',
    description: 'Find the perfect packaging solution for your products',
    tagline: 'Get expert-verified packaging recommendations instantly',
  },
  boxDesigner: {
    name: '3D Box Designer',
    path: '/box-designer',
    description: 'Design and visualize custom boxes in 3D',
    tagline: 'Create your perfect box design with interactive 3D visualization',
  },
} as const;

export const TOOLS_MENU = [
  {
    name: TOOL_INFO.packagingFinder.name,
    path: TOOL_INFO.packagingFinder.path,
    description: TOOL_INFO.packagingFinder.description,
    isNew: true,
    icon: 'Sparkles',
  },
  {
    name: TOOL_INFO.boxDesigner.name,
    path: TOOL_INFO.boxDesigner.path,
    description: TOOL_INFO.boxDesigner.description,
    isNew: true,
    icon: 'Box',
  },
] as const;
