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
  'Designer Guides',
  'Use Cases',
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
    category: "Designer Guides",
    date: "2025-03-15",
    readingTime: "8 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-08-thumbnail",
    socialImage: "BLOG-08-social",
  },
  // Designer Guides (Workstream D1): feature guides for the 3D Box Designer
  {
    title: "How to Use the 3D Box Designer: A Complete Step-by-Step Guide",
    slug: "how-to-use-3d-box-designer",
    description: "A walk-through of the free 3D Box Designer: pick a style, set the size in mm, cm or inches, choose the board, add your logo, check the indicative price and send the design for a quote.",
    category: "Designer Guides",
    date: "2026-10-26",
    readingTime: "10 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-DG-01-thumbnail",
    socialImage: "BLOG-DG-01-social",
  },
  {
    title: "8 Box Styles in 3D: Which One Fits Your Product?",
    slug: "box-styles-in-3d",
    description: "RSC, HSC, full overlap, sleeve, telescope lid and base, mailer, pizza box and tray: what each corrugated box style is, what it is good for, and how to try it in 3D before you order.",
    category: "Designer Guides",
    date: "2026-10-26",
    readingTime: "10 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-DG-02-thumbnail",
    socialImage: "BLOG-DG-02-social",
  },
  {
    title: "How to Find the Right Box Size for Your Product (Fit Checker Guide)",
    slug: "find-right-box-size",
    description: "Inside vs outside dimensions, how much padding to leave, mm vs cm vs inches, and how the 3D Box Designer's fit checker turns your product size into the right inside box size.",
    category: "Designer Guides",
    date: "2026-10-26",
    readingTime: "9 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-DG-03-thumbnail",
    socialImage: "BLOG-DG-03-social",
  },
  {
    title: "Instant Box Price Estimates: What Drives Cost Per Box and How to Lower It",
    slug: "box-price-estimate-guide",
    description: "How the 3D Box Designer's indicative estimate works: board area, ply, print colours, finish, set-up costs and quantity tiers. Plus practical ways to bring the price per box down.",
    category: "Designer Guides",
    date: "2026-10-26",
    readingTime: "9 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-DG-04-thumbnail",
    socialImage: "BLOG-DG-04-social",
  },
  {
    title: "Adding Your Logo and Artwork to a Box: Print-Ready Tips",
    slug: "logo-artwork-on-boxes",
    description: "Put your logo on a corrugated box the right way: file formats, resolution, safe areas away from folds, text size, brand colours and finishes, with the 3D Box Designer's print checks to catch mistakes.",
    category: "Designer Guides",
    date: "2026-10-26",
    readingTime: "9 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-DG-05-thumbnail",
    socialImage: "BLOG-DG-05-social",
  },
  {
    title: "Dielines Explained: Download One From the Designer and Hand It to Any Printer",
    slug: "dielines-explained",
    description: "What a box dieline is, how to read cut and crease lines, panel sizes and the glue flap, and how to download a 1:1 mm SVG or PDF dieline from the free 3D Box Designer for your designer or printer.",
    category: "Designer Guides",
    date: "2026-10-26",
    readingTime: "9 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-DG-06-thumbnail",
    socialImage: "BLOG-DG-06-social",
  },
  {
    title: "Packaging Product Shots and 360° Videos Without a Photoshoot",
    slug: "packaging-product-shots-360-video",
    description: "Make clean packaging images and short 360° spin or fold videos of your box straight from the free 3D Box Designer: backgrounds, angles, resolution, video tips, and where renders work best.",
    category: "Designer Guides",
    date: "2026-10-26",
    readingTime: "8 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-DG-07-thumbnail",
    socialImage: "BLOG-DG-07-social",
  },
  {
    title: "Will My Box Stack? Box Strength Made Simple",
    slug: "box-stacking-strength-guide",
    description: "BCT and ECT in plain words: how strong a corrugated box is, how high you can safely stack it, why humidity and time matter, and how the 3D Box Designer's strength guidance helps you pick the right ply.",
    category: "Designer Guides",
    date: "2026-10-26",
    readingTime: "9 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-DG-08-thumbnail",
    socialImage: "BLOG-DG-08-social",
  },
  // Use Cases (Workstream D2): audience and industry guides for the 3D Box Designer
  {
    title: "For Box Manufacturers: Win More Orders by Showing Customers Their Box in 3D",
    slug: "box-manufacturers-3d-presentations",
    description: "Use a free 3D box designer as your sales showroom: present boxes full screen, send a proof PDF for sign-off, share product shots and put a designer on your own website.",
    category: "Use Cases",
    date: "2026-10-26",
    readingTime: "9 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-UC-01-thumbnail",
    socialImage: "BLOG-UC-01-social",
  },
  {
    title: "For Wholesalers and Traders: Spec, Price and Share Corrugated Boxes in Minutes",
    slug: "wholesalers-spec-price-share-boxes",
    description: "A practical workflow for packaging traders: turn a vague buyer request into a clear box spec, see indicative prices across quantity tiers, and share a link or spec sheet in minutes.",
    category: "Use Cases",
    date: "2026-10-26",
    readingTime: "9 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-UC-02-thumbnail",
    socialImage: "BLOG-UC-02-social",
  },
  {
    title: "E-commerce Mailer Boxes: Design an Unboxing Your Customers Remember",
    slug: "ecommerce-mailer-box-unboxing",
    description: "How online sellers can design a branded corrugated mailer box in 3D: right size, right board, a printed inside, and a preview to approve before you order.",
    category: "Use Cases",
    date: "2026-10-26",
    readingTime: "9 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-UC-03-thumbnail",
    socialImage: "BLOG-UC-03-social",
  },
  {
    title: "Pizza and Bakery Boxes: Sizes, Board and Design Tips for Food Businesses",
    slug: "pizza-bakery-box-design",
    description: "A practical guide for pizzerias, bakeries and cloud kitchens: choosing pizza and bakery box sizes, board and print, and designing them in 3D before you order.",
    category: "Use Cases",
    date: "2026-10-26",
    readingTime: "9 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-UC-04-thumbnail",
    socialImage: "BLOG-UC-04-social",
  },
  {
    title: "Apparel and Footwear Packaging: Designing Garment Mailers and Shoe Boxes",
    slug: "apparel-footwear-mailer-shoe-boxes",
    description: "How clothing and footwear brands can design garment mailers and shoe boxes in 3D: sizing for folded garments and shoes, board choice, branding and shipping tips.",
    category: "Use Cases",
    date: "2026-10-26",
    readingTime: "9 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-UC-05-thumbnail",
    socialImage: "BLOG-UC-05-social",
  },
  {
    title: "Festive Gift and Hamper Boxes: Designing Lid-and-Base Boxes for Diwali, Weddings and Corporate Gifting",
    slug: "festive-gift-hamper-boxes",
    description: "Plan and design telescope (lid-and-base) gift and hamper boxes for Diwali, weddings and corporate gifting in 3D: sizes, board, colours, branding and timelines.",
    category: "Use Cases",
    date: "2026-10-26",
    readingTime: "10 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-UC-06-thumbnail",
    socialImage: "BLOG-UC-06-social",
  },
  {
    title: "Export Cartons: Designing 5-Ply and 7-Ply Boxes for Heavy and Long-Distance Shipping",
    slug: "export-cartons-5-ply-7-ply",
    description: "How to plan export and heavy-duty cartons: choosing 5-ply or 7-ply, sizing for pallets and containers, strength and stacking, marking, and designing it all in 3D first.",
    category: "Use Cases",
    date: "2026-10-26",
    readingTime: "10 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-UC-07-thumbnail",
    socialImage: "BLOG-UC-07-social",
  },
  {
    title: "10 Packaging Mistakes Small Businesses Make (and How to Avoid Them)",
    slug: "packaging-mistakes-small-business",
    description: "The ten most common corrugated packaging mistakes small businesses make, from wrong dimensions to over-built boxes, and how a free 3D box designer helps you avoid each one.",
    category: "Use Cases",
    date: "2026-10-26",
    readingTime: "10 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-UC-08-thumbnail",
    socialImage: "BLOG-UC-08-social",
  },
  {
    title: "How to Add Cutouts to Your Box Design: The Complete Guide to Stickers, Patterns and Brand Colours",
    slug: "how-to-add-cutouts-box-design",
    description: "A step-by-step guide to cutouts in the free 3D Box Designer: add ready-made stickers to any box face, resize and recolour them, repeat one as a pattern, match your brand colour and let Surprise me suggest a layout.",
    category: "Designer Guides",
    date: "2026-10-27",
    readingTime: "10 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-DG-09-thumbnail",
    socialImage: "BLOG-DG-09-social",
  },
  {
    title: "Start from a Template: A Tour of 74 Ready Box Designs for Fruit, Food, Fashion, Gifts and More",
    slug: "box-design-templates-tour",
    description: "A tour of the 74 ready-made box templates in the free 3D Box Designer: what is inside a template, how to open one in a tap, what to change first, and which templates suit fruit, bakery, clothing, beauty, gifts, electronics and shipping.",
    category: "Designer Guides",
    date: "2026-10-27",
    readingTime: "9 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-DG-10-thumbnail",
    socialImage: "BLOG-DG-10-social",
  },
  {
    title: "Which of 20 Box Styles Should You Choose? A Picker Guide by Product (Updated)",
    slug: "which-box-style-should-you-choose",
    description: "Updated guide to all 20 box styles in the free 3D Box Designer: a pick-by-product table, the five style groups, what each style is best for, what to watch out for, and a link to try each one on your own size.",
    category: "Designer Guides",
    date: "2026-10-27",
    readingTime: "10 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-DG-11-thumbnail",
    socialImage: "BLOG-DG-11-social",
  },
  {
    title: "20 Box Design Ideas You Can Build in 5 Minutes (by Product Type)",
    slug: "box-design-ideas-in-5-minutes",
    description: "Twenty ready-to-build box design ideas for fruit, bakery, clothing, beauty, gifts, electronics, retail and shipping. Each names the box style, board, size and cutouts to use in the free 3D Box Designer.",
    category: "Use Cases",
    date: "2026-10-27",
    readingTime: "10 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-UC-09-thumbnail",
    socialImage: "BLOG-UC-09-social",
  },
  {
    title: "Vents, Hand Holes and Windows: When to Add Them, What They Cost and How They Affect Strength",
    slug: "vents-hand-holes-windows-box-design",
    description: "An honest guide to cut-outs in corrugated boxes: when vents, hand holes and windows are worth adding, what they add to cost, how they reduce stacking strength, and how to design them in the free 3D Box Designer.",
    category: "Designer Guides",
    date: "2026-10-27",
    readingTime: "9 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-DG-12-thumbnail",
    socialImage: "BLOG-DG-12-social",
  },
  {
    title: "Fruit and Vegetable Boxes: Ventilated Cartons, Open Trays and Hand Holes Explained",
    slug: "fruit-vegetable-ventilated-boxes",
    description: "How to plan ventilated produce cartons, open trays and hand-hole carry boxes for fruit and vegetables: what vents do to strength, how to size them, and how to design one in 3D.",
    category: "Use Cases",
    date: "2026-10-27",
    readingTime: "9 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-UC-10-thumbnail",
    socialImage: "BLOG-UC-10-social",
  },
  {
    title: "Packing Mangoes, Apples and Grapes for Sale and Export: Box Sizes, Board and Design Ideas",
    slug: "mango-apple-grape-packing-boxes",
    description: "Practical box ideas for mangoes, apples and grapes, for local sale and export: starting sizes, board choice, vents, branding and a pallet check, all designed in 3D before you order.",
    category: "Use Cases",
    date: "2026-10-27",
    readingTime: "9 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-UC-11-thumbnail",
    socialImage: "BLOG-UC-11-social",
  },
  {
    title: "Clothing, Saree and Footwear Boxes: Mailers, Tuck-End, Slide and Shoe Boxes in 3D",
    slug: "clothing-saree-footwear-boxes",
    description: "Choose and design boxes for clothing, sarees and footwear: window mailers, tuck-end boxes, saree boxes, shoe and sandal boxes and slide boxes, with sizes, board and branding tips.",
    category: "Use Cases",
    date: "2026-10-27",
    readingTime: "9 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-UC-12-thumbnail",
    socialImage: "BLOG-UC-12-social",
  },
  {
    title: "Cake, Sweet and Bakery Boxes: Window Cake Boxes, Mithai Boxes, Trays and Clamshells",
    slug: "cake-sweet-bakery-boxes",
    description: "Plan window cake boxes, mithai boxes, cupcake and cookie boxes and bakery trays in 3D: sizes, board, windows, branding and careful food-contact notes for bakeries and sweet shops.",
    category: "Use Cases",
    date: "2026-10-27",
    readingTime: "9 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-UC-13-thumbnail",
    socialImage: "BLOG-UC-13-social",
  },
  {
    title: "Takeaway, Tiffin and Pizza Boxes for Cloud Kitchens: Choosing Between Clamshells, Pizza Boxes and Carry Boxes",
    slug: "takeaway-tiffin-pizza-boxes-cloud-kitchens",
    description: "How cloud kitchens and restaurants can choose takeaway clamshells, pizza boxes, tray-and-sleeve combos and carry boxes, size them to the menu and delivery bag, and design them in 3D.",
    category: "Use Cases",
    date: "2026-10-27",
    readingTime: "9 min read",
    author: "Vayu Packaging Team",
    thumbnail: "BLOG-UC-14-thumbnail",
    socialImage: "BLOG-UC-14-social",
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
