/**
 * Blog Constants
 * Metadata and configuration for blog system
 */

// Blog categories
export const BLOG_CATEGORIES = [
  'All',
  'Buying Guide',
  'Technical Guide',
  'Quality Standards',
  'Industry Insights',
] as const;

export type BlogCategory = typeof BLOG_CATEGORIES[number];

// Blog metadata interface
export interface BlogPost {
  title: string;
  slug: string;
  description: string;
  category: BlogCategory;
  date: string;
  readingTime: string;
  author: string;
  thumbnail: string;
  socialImage: string;
  content?: string; // Will be loaded dynamically
}

// Blog posts metadata
export const BLOG_POSTS: BlogPost[] = [
  {
    title: "Understanding Different Types of Corrugated Boxes: A Complete Guide",
    slug: "types-of-corrugated-boxes",
    description: "Discover the differences between 3-ply, 5-ply, 7-ply, die-cut, printed, and heavy-duty corrugated boxes. Learn which type is perfect for your business needs.",
    category: "Buying Guide",
    date: "2025-01-15",
    readingTime: "8 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-01-thumbnail",
    socialImage: "BLOG-01-social",
  },
  {
    title: "Single Wall vs Double Wall vs Triple Wall Corrugated: Which One Do You Need?",
    slug: "corrugated-wall-differences",
    description: "Understand the key differences between single wall, double wall, and triple wall corrugated sheets. Learn how to choose the right wall construction for your packaging needs.",
    category: "Technical Guide",
    date: "2025-01-18",
    readingTime: "7 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-02-thumbnail",
    socialImage: "BLOG-02-social",
  },
  {
    title: "Understanding Flute Types: A, B, C, E, F Flute Guide for Corrugated Packaging",
    slug: "flute-types-guide",
    description: "Learn about different flute types (A, B, C, E, F) in corrugated boxes, their characteristics, and which flute size is best for your packaging needs.",
    category: "Technical Guide",
    date: "2025-01-22",
    readingTime: "6 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-03-thumbnail",
    socialImage: "BLOG-03-social",
  },
  {
    title: "GSM in Corrugated Boxes: How Paper Weight Affects Strength and Cost",
    slug: "gsm-calculation-strength",
    description: "Understand what GSM means in corrugated packaging, how it's calculated, and how paper weight directly impacts box strength, cost, and performance.",
    category: "Quality Standards",
    date: "2025-01-25",
    readingTime: "7 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-04-thumbnail",
    socialImage: "BLOG-04-social",
  },
  {
    title: "Burst Strength vs Edge Crush Test: Understanding Box Quality Standards",
    slug: "burst-strength-ect-guide",
    description: "Learn the difference between Burst Strength (BS) and Edge Crush Test (ECT) in corrugated boxes. Understand which test matters for your packaging needs and how to interpret the values.",
    category: "Quality Standards",
    date: "2025-01-28",
    readingTime: "8 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-05-thumbnail",
    socialImage: "BLOG-05-social",
  },
  {
    title: "How to Measure Corrugated Boxes: The Complete L × B × H Guide",
    slug: "box-measurements-guide",
    description: "Learn how to correctly measure corrugated boxes using Length × Breadth × Height (L × B × H) dimensions. Understand interior vs exterior measurements and avoid costly sizing mistakes.",
    category: "Buying Guide",
    date: "2025-02-01",
    readingTime: "6 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-06-thumbnail",
    socialImage: "BLOG-06-social",
  },
  {
    title: "Virgin vs Recycled Kraft Paper: Understanding Corrugated Box Materials",
    slug: "kraft-paper-grades",
    description: "Learn the differences between virgin and recycled kraft paper in corrugated boxes. Understand performance, cost, sustainability, and which grade is right for your packaging needs.",
    category: "Industry Insights",
    date: "2025-02-05",
    readingTime: "7 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-07-thumbnail",
    socialImage: "BLOG-07-social",
  },
  {
    title: "Stop Wasting Money on Wrong-Sized Boxes: Design Perfect Packaging in 3D Before You Order",
    slug: "3d-box-designer-tool-free",
    description: "Tired of ordering boxes that don't fit? Design and visualize your perfect corrugated packaging in 3D for FREE. No more guesswork, no more costly mistakes. Try our interactive tool now.",
    category: "Industry Insights",
    date: "2025-03-15",
    readingTime: "9 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-08-thumbnail",
    socialImage: "BLOG-08-social",
  },
];

// Get blog posts by category
export const getBlogsByCategory = (category: BlogCategory): BlogPost[] => {
  if (category === 'All') {
    return BLOG_POSTS;
  }
  return BLOG_POSTS.filter(post => post.category === category);
};

// Get a single blog post by slug
export const getBlogBySlug = (slug: string): BlogPost | undefined => {
  return BLOG_POSTS.find(post => post.slug === slug);
};

// Get related blog posts (same category, excluding current)
export const getRelatedBlogs = (currentSlug: string, limit: number = 3): BlogPost[] => {
  const currentBlog = getBlogBySlug(currentSlug);
  if (!currentBlog) return [];
  
  return BLOG_POSTS
    .filter(post => post.slug !== currentSlug && post.category === currentBlog.category)
    .slice(0, limit);
};

// Author information
export const BLOG_AUTHOR = {
  name: "Vayu Packaging Team",
  avatar: "team-avatar", // Placeholder ID
  bio: "Expert insights from Vayu Packaging Solutions team on corrugated packaging, quality standards, and industry best practices.",
} as const;

// Social sharing configuration
export const SOCIAL_SHARE_CONFIG = {
  siteUrl: "https://vayupackaging.vercel.app", // Update with actual domain
  twitterHandle: "@vayupackaging", // Update with actual handle
  hashtags: ["packaging", "corrugatedboxes", "supplychain", "3ddesign", "boxdesigner"],
} as const;
