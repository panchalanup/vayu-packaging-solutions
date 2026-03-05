import { useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards, Keyboard, Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/navigation";

interface GalleryImage {
  id: string;
  title: string;
  description: string;
  src: string;
  alt: string;
}

interface ImageViewerProps {
  images: readonly GalleryImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const ImageViewer = ({ images, currentIndex, isOpen, onClose, onNavigate }: ImageViewerProps) => {
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
      <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 bg-gradient-to-br from-gray-950 via-black to-gray-950 border-none overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 md:top-6 md:right-6 z-[100] text-white hover:bg-white/20 rounded-full backdrop-blur-md bg-black/40 border border-white/20 shadow-xl transition-all hover:scale-110 w-10 h-10 md:w-12 md:h-12"
            aria-label="Close viewer"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </Button>

          {/* Image Counter */}
          <div className="absolute top-3 left-3 md:top-6 md:left-6 z-[100] bg-black/60 backdrop-blur-md text-white px-3 py-1.5 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-semibold border border-white/20 shadow-xl">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Previous Button */}
          <Button
            onClick={handlePrev}
            variant="ghost"
            size="icon"
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-[100] text-white hover:bg-white/20 rounded-full w-10 h-10 md:w-14 md:h-14 backdrop-blur-md bg-black/40 border border-white/20 shadow-xl transition-all hover:scale-110"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
          </Button>

          {/* Next Button */}
          <Button
            onClick={handleNext}
            variant="ghost"
            size="icon"
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-[100] text-white hover:bg-white/20 rounded-full w-10 h-10 md:w-14 md:h-14 backdrop-blur-md bg-black/40 border border-white/20 shadow-xl transition-all hover:scale-110"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
          </Button>

          {/* Swiper Card Stack */}
          <div className="w-full h-full flex items-center justify-center px-2 py-16 md:px-4 md:py-20">
            <Swiper
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              onSlideChange={(swiper) => {
                onNavigate(swiper.activeIndex);
              }}
              effect="cards"
              grabCursor={true}
              modules={[EffectCards, Keyboard, Navigation]}
              className="gallery-swiper"
              cardsEffect={{
                perSlideOffset: 12,
                perSlideRotate: 0,
                rotate: false,
                slideShadows: true,
              }}
              keyboard={{
                enabled: true,
                onlyInViewport: true,
              }}
              speed={350}
              initialSlide={currentIndex}
              loop={true}
            >
              {images.map((image, index) => (
                <SwiperSlide key={image.id} className="swiper-card-slide">
                  {({ isActive }: { isActive: boolean }) => (
                    <div className="relative w-full h-full flex items-center justify-center p-2 md:p-4">
                      <div className="relative max-w-full md:max-w-6xl max-h-[75vh] md:max-h-[90vh] rounded-xl md:rounded-2xl overflow-hidden shadow-[0_25px_100px_rgba(0,0,0,0.8)]">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-full object-contain"
                          draggable={false}
                          style={{
                            maxHeight: "75vh",
                          }}
                        />
                        {/* Dark overlay on background cards only */}
                        {!isActive && (
                          <div className="absolute inset-0 bg-black/50 pointer-events-none" />
                        )}
                      </div>
                    </div>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Drag Instruction */}
          <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 z-[100] text-white/70 text-xs md:text-sm backdrop-blur-md bg-black/40 px-4 py-2 md:px-6 md:py-3 rounded-full border border-white/20 shadow-xl">
            Drag to navigate
          </div>
        </div>

        <style>{`
          .gallery-swiper {
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 80vh;
          }

          @media (min-width: 768px) {
            .gallery-swiper {
              max-width: 1200px;
              max-height: 92vh;
            }
          }

          .swiper-card-slide {
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 18px;
            background: transparent;
          }

          .swiper-slide-shadow-left,
          .swiper-slide-shadow-right {
            background-image: linear-gradient(to right, rgba(0, 0, 0, 0.4), transparent) !important;
          }

          /* Custom shadow for depth */
          .swiper-slide-shadow {
            background: rgba(0, 0, 0, 0.5);
            border-radius: 18px;
          }

          /* Smooth cursor feedback */
          .gallery-swiper.swiper-grab {
            cursor: grab;
          }

          .gallery-swiper.swiper-grabbing {
            cursor: grabbing;
          }

          /* Make sure images center properly */
          .swiper-card-slide img {
            display: block;
            max-width: 100%;
            max-height: 100%;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
