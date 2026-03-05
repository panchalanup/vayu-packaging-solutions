import { useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Keyboard, Zoom } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/zoom";

interface GalleryImage {
  id: string;
  title: string;
  description: string;
  src: string;
  alt: string;
}

interface MobileImageViewerProps {
  images: readonly GalleryImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const MobileImageViewer = ({ images, currentIndex, isOpen, onClose, onNavigate }: MobileImageViewerProps) => {
  const swiperRef = useRef<SwiperType | null>(null);

  // Sync Swiper with currentIndex when dialog opens
  useEffect(() => {
    if (swiperRef.current && isOpen) {
      swiperRef.current.slideTo(currentIndex, 0);
    }
  }, [isOpen, currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handlePrev = useCallback(() => {
    swiperRef.current?.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    swiperRef.current?.slideNext();
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 bg-black border-none overflow-hidden">
        <div className="relative w-full h-full flex flex-col">
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
            {/* Image Counter */}
            <div className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold">
              {currentIndex + 1} / {images.length}
            </div>

            {/* Close Button */}
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full backdrop-blur-sm bg-black/40 w-10 h-10"
              aria-label="Close viewer"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Swiper Container */}
          <div className="absolute inset-0 flex items-center justify-center pt-16 pb-20">
            <Swiper
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              onSlideChange={(swiper) => {
                onNavigate(swiper.activeIndex);
              }}
              spaceBetween={0}
              slidesPerView={1}
              centeredSlides={true}
              modules={[Pagination, Keyboard, Zoom]}
              className="mobile-gallery-swiper"
              keyboard={{
                enabled: true,
                onlyInViewport: true,
              }}
              zoom={{
                maxRatio: 3,
                minRatio: 1,
              }}
              speed={350}
              initialSlide={currentIndex}
              loop={true}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
            >
              {images.map((image) => (
                <SwiperSlide key={image.id}>
                  <div className="swiper-zoom-container">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-auto h-auto max-w-full max-h-[75vh] object-contain"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Navigation Buttons - Positioned at bottom corners */}
          <div className="absolute bottom-20 left-0 right-0 flex items-center justify-between px-4 z-50">
            <Button
              onClick={handlePrev}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full w-12 h-12 backdrop-blur-sm bg-black/50 border border-white/20"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-7 h-7" />
            </Button>

            <Button
              onClick={handleNext}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full w-12 h-12 backdrop-blur-sm bg-black/50 border border-white/20"
              aria-label="Next image"
            >
              <ChevronRight className="w-7 h-7" />
            </Button>
          </div>

          {/* Bottom Instruction */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 text-white/70 text-xs backdrop-blur-sm bg-black/40 px-4 py-2 rounded-full">
            Swipe or pinch to zoom
          </div>
        </div>

        <style>{`
          .mobile-gallery-swiper {
            width: 100%;
            height: 100%;
          }

          .mobile-gallery-swiper .swiper-slide {
            display: flex;
            align-items: center;
            justify-center;
          }

          .mobile-gallery-swiper .swiper-pagination {
            bottom: 60px !important;
          }

          .mobile-gallery-swiper .swiper-pagination-bullet {
            background: white;
            opacity: 0.5;
          }

          .mobile-gallery-swiper .swiper-pagination-bullet-active {
            opacity: 1;
            background: white;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default MobileImageViewer;
