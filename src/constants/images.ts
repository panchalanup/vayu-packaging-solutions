/**
 * Image Constants
 * Central location for all image imports organized by section
 * Update images here to reflect changes across the entire application
 */

// Import all images
import logoMain from "@/assets/logo.png";
import logoHorizontal from "@/assets/logo-horizontal.png";
import heroImage1 from "@/assets/hero-section/h1.png";
import heroImage2 from "@/assets/hero-section/h2.png";
import heroImage3 from "@/assets/hero-section/h3.png";
import heroImage4 from "@/assets/hero-section/h4.png";
import heroImage5 from "@/assets/hero-section/h5.png";
import aboutPackaging from "@/assets/about-packaging.jpg";
import servicesPackaging from "@/assets/services-packaging.jpg";
import placeholderImage from "/placeholder.svg";

// Import videos
import factoryVideo from "@/assets/video/factory-top-view.mp4";

// Import gallery images
import g1 from "@/assets/Gallery/g1.png";
import g2 from "@/assets/Gallery/g2.png";
import g3 from "@/assets/Gallery/g3.png";
import g4 from "@/assets/Gallery/g4.png";
import g5 from "@/assets/Gallery/g5.png";
import g6 from "@/assets/Gallery/g6.png";
import g7 from "@/assets/Gallery/g7.png";
import g8 from "@/assets/Gallery/g8.png";
import g9 from "@/assets/Gallery/g9.png";
import g10 from "@/assets/Gallery/g10.png";
import g11 from "@/assets/Gallery/g11.png";
import g12 from "@/assets/Gallery/g12.png";
import g13 from "@/assets/Gallery/g13.png";
import g14 from "@/assets/Gallery/g14.png";
import g15 from "@/assets/Gallery/g15.png";
import g16 from "@/assets/Gallery/g16.png";
import g17 from "@/assets/Gallery/g17.png";
import g18 from "@/assets/Gallery/g18.png";
import g19 from "@/assets/Gallery/g19.png";

// Import product images
import prod1 from "@/assets/Products/PROD-1.png";
import prod2 from "@/assets/Products/PROD-2.png";
import prod3 from "@/assets/Products/PROD-3.png";
import prod4 from "@/assets/Products/PROD-4.png";
import prod5 from "@/assets/Products/PROD-5.png";
import prod6 from "@/assets/Products/PROD-6.png";

// Import blog images
import blogThumbnail from "@/assets/Blogs/blog-00.png";

// ============================================
// LOGO IMAGES
// ============================================
export const LOGO_IMAGES = {
  main: logoMain,
  horizontal: logoHorizontal,
} as const;

// ============================================
// HERO SECTION IMAGES
// ============================================
export const HERO_IMAGES = [
  {
    src: heroImage1,
    alt: "Modern logistics warehouse with trucks loading boxes",
  },
  {
    src: heroImage2,
    alt: "Cargo airplane loading shipments at sunset",
  },
  {
    src: heroImage3,
    alt: "Container ship on the ocean",
  },
  {
    src: heroImage4,
    alt: "Fleet of delivery trucks on highway",
  },
  {
    src: heroImage5,
    alt: "Inside a modern warehouse with forklifts",
  },
] as const;

// ============================================
// VIDEO ASSETS
// ============================================
export const VIDEO_ASSETS = {
  factoryTour: factoryVideo,
} as const;

// ============================================
// ABOUT SECTION IMAGES
// ============================================
export const ABOUT_IMAGES = {
  main: aboutPackaging,
  alt: "Quality corrugated boxes inspection",
} as const;

// ============================================
// SERVICES SECTION IMAGES
// ============================================
export const SERVICES_IMAGES = {
  main: servicesPackaging,
  alt: "Corrugated boxes on conveyor belt",
} as const;

// ============================================
// PRODUCT IMAGES
// ============================================
/**
 * Product showcase images for the Products page
 * Replace placeholder with actual images by:
 * 1. Create image at 800x800px (see IMAGE_GUIDE.md for specs)
 * 2. Save to src/assets/ with the filename shown in targetFilename
 * 3. Import at top: import prod1 from "@/assets/3-ply-boxes.jpg"
 * 4. Update src: prod1
 */
export const PRODUCT_IMAGES = [
  {
    id: "PROD-1",
    src: prod1,
    alt: "3-Ply Corrugated Boxes - Stack of 3-ply boxes, one open showing construction",
    description: "Stack of 3-ply boxes, one open showing construction",
    targetFilename: "3-ply-boxes.jpg",
    requiredSize: "800x800px",
  },
  {
    id: "PROD-2",
    src: prod2,
    alt: "5-Ply Corrugated Boxes - 5-ply boxes with electronics or appliances",
    description: "5-ply boxes with electronics or appliances",
    targetFilename: "5-ply-boxes.jpg",
    requiredSize: "800x800px",
  },
  {
    id: "PROD-3",
    src: prod3,
    alt: "7-Ply Corrugated Boxes - Heavy-duty 7-ply box with industrial product",
    description: "Heavy-duty 7-ply box with industrial product",
    targetFilename: "7-ply-heavy-duty-boxes.jpg",
    requiredSize: "800x800px",
  },
  {
    id: "PROD-4",
    src: prod4,
    alt: "Die-Cut Boxes - Unique shaped boxes, branded examples",
    description: "Unique shaped boxes, branded examples",
    targetFilename: "die-cut-custom-boxes.jpg",
    requiredSize: "800x800px",
  },
  {
    id: "PROD-5",
    src: prod5,
    alt: "Printed Packaging - Full-color printed boxes with vibrant branding",
    description: "Full-color printed boxes with vibrant branding",
    targetFilename: "printed-branded-boxes.jpg",
    requiredSize: "800x800px",
  },
  {
    id: "PROD-6",
    src: prod6,
    alt: "Food-Grade Boxes - Food packaging with safety certifications",
    description: "Food packaging with safety certifications",
    targetFilename: "food-grade-packaging-boxes.jpg",
    requiredSize: "800x800px",
  },
] as const;

// ============================================
// BLOG IMAGES
// ============================================
export const BLOG_IMAGES = {
  defaultThumbnail: blogThumbnail,
  alt: "Vayu Packaging Solutions - Corrugated boxes and packaging",
} as const;

// ============================================
// FACILITY GALLERY IMAGES
// ============================================
/**
 * Warehouse/facility gallery images for homepage
 * Replace placeholder with actual facility photos by:
 * 1. Create image at 800x600px (4:3 ratio - see IMAGE_GUIDE.md)
 * 2. Save to src/assets/ with the filename shown in targetFilename
 * 3. Import at top: import gallery1 from "@/assets/warehouse-overview.jpg"
 * 4. Update src: gallery1
 */
export const GALLERY_IMAGES = [
  {
    id: "G-1",
    title: "Facility View 1",
    description: "Vayu Packaging facility",
    src: g1,
    alt: "Vayu Packaging facility view 1",
  },
  {
    id: "G-2",
    title: "Facility View 2",
    description: "Vayu Packaging facility",
    src: g2,
    alt: "Vayu Packaging facility view 2",
  },
  {
    id: "G-3",
    title: "Facility View 3",
    description: "Vayu Packaging facility",
    src: g3,
    alt: "Vayu Packaging facility view 3",
  },
  {
    id: "G-4",
    title: "Facility View 4",
    description: "Vayu Packaging facility",
    src: g4,
    alt: "Vayu Packaging facility view 4",
  },
  {
    id: "G-5",
    title: "Facility View 5",
    description: "Vayu Packaging facility",
    src: g5,
    alt: "Vayu Packaging facility view 5",
  },
  {
    id: "G-6",
    title: "Facility View 6",
    description: "Vayu Packaging facility",
    src: g6,
    alt: "Vayu Packaging facility view 6",
  },
  {
    id: "G-7",
    title: "Facility View 7",
    description: "Vayu Packaging facility",
    src: g7,
    alt: "Vayu Packaging facility view 7",
  },
  {
    id: "G-8",
    title: "Facility View 8",
    description: "Vayu Packaging facility",
    src: g8,
    alt: "Vayu Packaging facility view 8",
  },
  {
    id: "G-9",
    title: "Facility View 9",
    description: "Vayu Packaging facility",
    src: g9,
    alt: "Vayu Packaging facility view 9",
  },
  {
    id: "G-10",
    title: "Facility View 10",
    description: "Vayu Packaging facility",
    src: g10,
    alt: "Vayu Packaging facility view 10",
  },
  {
    id: "G-11",
    title: "Facility View 11",
    description: "Vayu Packaging facility",
    src: g11,
    alt: "Vayu Packaging facility view 11",
  },
  {
    id: "G-12",
    title: "Facility View 12",
    description: "Vayu Packaging facility",
    src: g12,
    alt: "Vayu Packaging facility view 12",
  },
  {
    id: "G-13",
    title: "Facility View 13",
    description: "Vayu Packaging facility",
    src: g13,
    alt: "Vayu Packaging facility view 13",
  },
  {
    id: "G-14",
    title: "Facility View 14",
    description: "Vayu Packaging facility",
    src: g14,
    alt: "Vayu Packaging facility view 14",
  },
  {
    id: "G-15",
    title: "Facility View 15",
    description: "Vayu Packaging facility",
    src: g15,
    alt: "Vayu Packaging facility view 15",
  },
  {
    id: "G-16",
    title: "Facility View 16",
    description: "Vayu Packaging facility",
    src: g16,
    alt: "Vayu Packaging facility view 16",
  },
  {
    id: "G-17",
    title: "Facility View 17",
    description: "Vayu Packaging facility",
    src: g17,
    alt: "Vayu Packaging facility view 17",
  },
  {
    id: "G-18",
    title: "Facility View 18",
    description: "Vayu Packaging facility",
    src: g18,
    alt: "Vayu Packaging facility view 18",
  },
  {
    id: "G-19",
    title: "Facility View 19",
    description: "Vayu Packaging facility",
    src: g19,
    alt: "Vayu Packaging facility view 19",
  },
] as const;
