import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { HERO_CONTENT } from "@/constants";
import { HERO_IMAGES } from "@/constants/images";

const slides = HERO_IMAGES;

const INTERVAL = 5000;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    y: direction > 0 ? -30 : 30,
    opacity: 0,
  }),
  center: {
    x: 0,
    y: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    y: direction > 0 ? 30 : -30,
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
    <section id="home" className="relative h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)] flex items-center overflow-hidden -mt-20 pt-20">
      {/* Background images with Parallax Slide effect */}
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
          transition={{
            duration: 1,
            ease: [0.43, 0.13, 0.23, 0.96], // Custom smooth easing
          }}
          loading="eager"
          draggable={false}
        />
      </AnimatePresence>

      {/* Dark overlay */}
      <div className="hero-overlay absolute inset-0 z-[1]" />

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10 py-8 sm:py-12">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-blue-200 font-semibold text-xs sm:text-sm uppercase tracking-widest mb-4 sm:mb-6"
          >
            {HERO_CONTENT.tagline}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-4 sm:mb-6"
          >
            {HERO_CONTENT.heading.split('protect')[0]}
            <span className="text-gradient">protect</span>
            {HERO_CONTENT.heading.split('protect')[1]}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-blue-100/80 text-base sm:text-lg md:text-xl max-w-lg mb-8 sm:mb-10 leading-relaxed"
          >
            {HERO_CONTENT.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
          >
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 sm:px-7 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-semibold hover:brightness-110 transition-all touch-manipulation"
            >
              {HERO_CONTENT.primaryCTA}
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-6 sm:px-7 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-semibold hover:bg-white/10 transition-all touch-manipulation"
            >
              {HERO_CONTENT.secondaryCTA}
            </a>
          </motion.div>
        </div>
      </div>

      {/* Navigation arrows - hidden on mobile */}
      <button
        onClick={goPrev}
        className="hidden sm:flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/30 backdrop-blur-sm items-center justify-center text-white hover:bg-black/50 transition-colors touch-manipulation"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={goNext}
        className="hidden sm:flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/30 backdrop-blur-sm items-center justify-center text-white hover:bg-black/50 transition-colors touch-manipulation"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2 sm:gap-2.5 pb-safe">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-500 touch-manipulation ${
              i === current
                ? "w-8 sm:w-10 h-2 sm:h-2.5 bg-white"
                : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
