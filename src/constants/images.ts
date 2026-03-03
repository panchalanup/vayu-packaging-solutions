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
    src: placeholderImage,
    alt: "3-Ply Corrugated Boxes - Stack of 3-ply boxes, one open showing construction",
    description: "Stack of 3-ply boxes, one open showing construction",
    targetFilename: "3-ply-boxes.jpg",
    requiredSize: "800x800px",
  },
  {
    id: "PROD-2",
    src: placeholderImage,
    alt: "5-Ply Corrugated Boxes - 5-ply boxes with electronics or appliances",
    description: "5-ply boxes with electronics or appliances",
    targetFilename: "5-ply-boxes.jpg",
    requiredSize: "800x800px",
  },
  {
    id: "PROD-3",
    src: placeholderImage,
    alt: "7-Ply Corrugated Boxes - Heavy-duty 7-ply box with industrial product",
    description: "Heavy-duty 7-ply box with industrial product",
    targetFilename: "7-ply-heavy-duty-boxes.jpg",
    requiredSize: "800x800px",
  },
  {
    id: "PROD-4",
    src: placeholderImage,
    alt: "Die-Cut Boxes - Unique shaped boxes, branded examples",
    description: "Unique shaped boxes, branded examples",
    targetFilename: "die-cut-custom-boxes.jpg",
    requiredSize: "800x800px",
  },
  {
    id: "PROD-5",
    src: placeholderImage,
    alt: "Printed Packaging - Full-color printed boxes with vibrant branding",
    description: "Full-color printed boxes with vibrant branding",
    targetFilename: "printed-branded-boxes.jpg",
    requiredSize: "800x800px",
  },
  {
    id: "PROD-6",
    src: placeholderImage,
    alt: "Food-Grade Boxes - Food packaging with safety certifications",
    description: "Food packaging with safety certifications",
    targetFilename: "food-grade-packaging-boxes.jpg",
    requiredSize: "800x800px",
  },
] as const;

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
    id: "WG-1",
    title: "Warehouse Overview",
    description: "Wide shot of main warehouse floor",
    src: placeholderImage,
    alt: "Vayu Packaging warehouse overview showing organized facility",
    targetFilename: "warehouse-overview.jpg",
    requiredSize: "800x600px",
  },
  {
    id: "WG-2",
    title: "Storage Systems",
    description: "Tall racking systems with organized inventory",
    src: placeholderImage,
    alt: "Warehouse storage systems with tall racking and organized inventory",
    targetFilename: "storage-systems.jpg",
    requiredSize: "800x600px",
  },
  {
    id: "WG-3",
    title: "Modern Equipment",
    description: "Forklifts and automated equipment",
    src: placeholderImage,
    alt: "Modern warehouse equipment including forklifts and automation",
    targetFilename: "modern-equipment.jpg",
    requiredSize: "800x600px",
  },
  {
    id: "WG-4",
    title: "Quality Lab",
    description: "Testing area with compression tester",
    src: placeholderImage,
    alt: "Quality control laboratory with compression testing equipment",
    targetFilename: "quality-lab.jpg",
    requiredSize: "800x600px",
  },
  {
    id: "WG-5",
    title: "Team at Work",
    description: "Workers collaborating and organizing",
    src: placeholderImage,
    alt: "Vayu Packaging team members working together",
    targetFilename: "team-at-work.jpg",
    requiredSize: "800x600px",
  },
  {
    id: "WG-6",
    title: "Loading Bay",
    description: "Trucks at loading docks",
    src: placeholderImage,
    alt: "Loading bay with trucks being loaded at docks",
    targetFilename: "loading-bay.jpg",
    requiredSize: "800x600px",
  },
  {
    id: "WG-7",
    title: "Raw Materials",
    description: "Corrugated sheets and rolls",
    src: placeholderImage,
    alt: "Raw materials storage - corrugated sheets and rolls",
    targetFilename: "raw-materials.jpg",
    requiredSize: "800x600px",
  },
  {
    id: "WG-8",
    title: "Finished Products",
    description: "Stacks of completed boxes",
    src: placeholderImage,
    alt: "Finished corrugated boxes ready for shipment",
    targetFilename: "finished-products.jpg",
    requiredSize: "800x600px",
  },
  {
    id: "WG-9",
    title: "Office Space",
    description: "Professional order management area",
    src: placeholderImage,
    alt: "Professional office space for order management",
    targetFilename: "office-space.jpg",
    requiredSize: "800x600px",
  },
] as const;
