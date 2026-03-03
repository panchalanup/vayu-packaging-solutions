import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";
import { VIDEO_ASSETS } from "@/constants/images";

const VideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Intersection Observer to auto-play/pause when in viewport
  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;

    if (!video || !section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Play video when 50% visible
            video.play().then(() => {
              setIsPlaying(true);
            }).catch((error) => {
              console.log("Auto-play prevented:", error);
            });
          } else {
            // Pause when out of viewport
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of section is visible
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Toggle play/pause
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4">
            See Us In Action
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            How Vayu Packaging Works
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            From order to delivery - watch our streamlined process that ensures quality packaging solutions for your business.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Video Player */}
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              src={VIDEO_ASSETS.factoryTour}
              loop
              muted
              playsInline
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>

            {/* Custom Play/Pause Button - Bottom Left */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={togglePlayPause}
              className="absolute bottom-6 left-6 z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-full backdrop-blur-md bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 border border-white/30"
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" />
              ) : (
                <Play className="w-6 h-6 sm:w-7 sm:h-7 ml-0.5" fill="currentColor" />
              )}
            </motion.button>

            {/* Gradient Overlay for Button Visibility */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          </div>
        </motion.div>

        {/* Video Features/Benefits */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto"
        >
          {[
            { icon: "📦", text: "Order Processing" },
            { icon: "🏭", text: "Manufacturing" },
            { icon: "✅", text: "Quality Check" },
            { icon: "🚚", text: "Fast Delivery" },
          ].map((item, index) => (
            <div
              key={index}
              className="text-center p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <span className="text-3xl mb-2 block">{item.icon}</span>
              <p className="text-sm font-medium text-foreground">{item.text}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default VideoSection;
