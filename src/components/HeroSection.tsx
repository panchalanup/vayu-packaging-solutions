import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import heroImage1 from "@/assets/hero-packaging.jpg";
import heroImage2 from "@/assets/hero-packaging-2.jpg";
import heroImage3 from "@/assets/hero-packaging-3.jpg";
import heroImage4 from "@/assets/hero-packaging-4.jpg";
import heroImage5 from "@/assets/hero-packaging-5.jpg";

const slides = [
  { src: heroImage1, alt: "Modern logistics warehouse with trucks loading boxes" },
  { src: heroImage2, alt: "Cargo airplane loading shipments at sunset" },
  { src: heroImage3, alt: "Container ship on the ocean" },
  { src: heroImage4, alt: "Fleet of delivery trucks on highway" },
  { src: heroImage5, alt: "Inside a modern warehouse with forklifts" },
];

const INTERVAL = 5000;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-50%" : "50%",
    opacity: 0,
  }),
};

const HeroSection = () => {
  const [[current, direction], setSlide] = useState([0, 1]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSlide(([prev]) => [(prev + 1) % slides.length, 1]);
    }, INTERVAL);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const goTo = (index: number) => {
    setSlide(([prev]) => [index, index > prev ? 1 : -1]);
    resetTimer();
  };

  const goNext = () => {
    setSlide(([prev]) => [(prev + 1) % slides.length, 1]);
    resetTimer();
  };

  const goPrev = () => {
    setSlide(([prev]) => [(prev - 1 + slides.length) % slides.length, -1]);
    resetTimer();
  };

  return (
    <section id="home" className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
      {/* Background images with slide animation */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.img
          key={current}
          src={slides[current].src}
          alt={slides[current].alt}
          className="absolute inset-0 w-full h-full object-cover"
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.8, ease: [0.42, 0, 0.58, 1] }}
          loading="eager"
          draggable={false}
        />
      </AnimatePresence>

      {/* Dark overlay */}
      <div className="hero-overlay absolute inset-0 z-[1]" />

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10 pt-24">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-blue-200 font-semibold text-sm uppercase tracking-widest mb-6"
          >
            Trusted Corrugated Box Distributor
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
          >
            Packaging solutions that{" "}
            <span className="text-gradient">protect</span> what matters most
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-blue-100/80 text-lg md:text-xl max-w-lg mb-10"
          >
            India's reliable partner for high-quality corrugated boxes — custom sizes, bulk supply, and on-time delivery for every industry.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="flex flex-wrap gap-4"
          >
            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full text-base font-semibold hover:brightness-110 transition-all"
            >
              Get a Quote
              <ArrowUpRight className="w-5 h-5" />
            </a>
            <a
              href="#services"
              className="inline-flex items-center gap-2 border border-white/30 text-white px-7 py-3.5 rounded-full text-base font-semibold hover:bg-white/10 transition-all"
            >
              Our Services
            </a>
          </motion.div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-500 ${
              i === current
                ? "w-10 h-2.5 bg-white"
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
