import { useState } from "react";
import { motion } from "framer-motion";
import { ZoomIn } from "lucide-react";
import { GALLERY_IMAGES } from "@/constants/images";
import ImageViewer from "./ImageViewer";
import MobileImageViewer from "./MobileImageViewer";
import { useIsMobile } from "@/hooks/use-mobile";

const FacilityGallery = () => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isMobile = useIsMobile();

  // Show only first 9 images in the grid
  const displayedImages = GALLERY_IMAGES.slice(0, 9);

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setIsViewerOpen(true);
  };

  const handleNavigate = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <section className="py-16 sm:py-20 md:py-24 section-dark">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
        >
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4">
            Our Facility
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Inside Vayu Packaging
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Transparency is key to trust. Take a virtual tour of our state-of-the-art facility where quality meets efficiency.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {displayedImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => handleImageClick(index)}
            >
              {/* Gallery Image */}
              <img
                src={image.src}
                alt={image.alt}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />

              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Zoom Icon */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-4">
                    <ZoomIn className="w-8 h-8 text-foreground" />
                  </div>
                </div>
                
                {/* Image Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-semibold text-sm sm:text-base">{image.title}</p>
                  <p className="text-white/80 text-xs mt-1">{image.description}</p>
                </div>
              </div>

              {/* Image ID Badge */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md">
                <p className="text-xs font-mono font-semibold text-foreground">{image.id}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Images Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-muted-foreground text-sm">
            Showing 9 of {GALLERY_IMAGES.length} images • Click any image to view the full gallery
          </p>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-12 sm:mt-16 flex flex-wrap justify-center gap-4 sm:gap-6"
        >
          {[
            { icon: "🏭", label: "ISO Certified Facility" },
            { icon: "✅", label: "BIS Standards Compliant" },
            { icon: "🌱", label: "Eco-Friendly Operations" },
            { icon: "👥", label: "Experienced Team" },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm font-medium text-foreground">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Image Viewer - Conditional based on device */}
      {isMobile ? (
        <MobileImageViewer
          images={GALLERY_IMAGES}
          currentIndex={currentImageIndex}
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          onNavigate={handleNavigate}
        />
      ) : (
        <ImageViewer
          images={GALLERY_IMAGES}
          currentIndex={currentImageIndex}
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          onNavigate={handleNavigate}
        />
      )}
    </section>
  );
};

export default FacilityGallery;
