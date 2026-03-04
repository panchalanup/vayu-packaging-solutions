import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [direction, setDirection] = useState(0);

  const handlePrevious = () => {
    setDirection(-1);
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    onNavigate(newIndex);
  };

  const handleNext = () => {
    setDirection(1);
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    onNavigate(newIndex);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex]);

  const currentImage = images[currentIndex];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
        <div className="relative w-full h-[95vh] flex items-center justify-center">
          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
            aria-label="Close viewer"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 z-50 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Previous Button */}
          <Button
            onClick={handlePrevious}
            variant="ghost"
            size="icon"
            className="absolute left-4 z-50 text-white hover:bg-white/20 rounded-full w-12 h-12"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>

          {/* Image Container */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden px-20">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.img
                key={currentIndex}
                src={currentImage.src}
                alt={currentImage.alt}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="max-w-full max-h-full object-contain"
              />
            </AnimatePresence>
          </div>

          {/* Next Button */}
          <Button
            onClick={handleNext}
            variant="ghost"
            size="icon"
            className="absolute right-4 z-50 text-white hover:bg-white/20 rounded-full w-12 h-12"
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>

          {/* Image Info */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/60 backdrop-blur-sm text-white px-6 py-3 rounded-full max-w-2xl text-center">
            <p className="font-semibold text-base">{currentImage.title}</p>
            <p className="text-sm text-white/80 mt-1">{currentImage.description}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
