import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";

const VideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Placeholder - replace with actual video URL when available
  const videoUrl = "/placeholder-video.mp4";
  const thumbnailUrl = "/placeholder.svg";

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-background">
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
          className="relative max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-2xl group"
        >
          {/* Video Player Placeholder */}
          <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
            {/* Thumbnail / Placeholder */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={thumbnailUrl}
                  alt="Video Thumbnail"
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
                
                {/* Play Button Overlay */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsPlaying(true)}
                  className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center text-white hover:bg-primary transition-all duration-300 shadow-2xl group-hover:shadow-primary/50"
                  aria-label="Play video"
                >
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1" />
                </motion.button>

                {/* Video Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white font-semibold text-lg sm:text-xl">
                    How Vayu Packaging Works - From Order to Delivery
                  </p>
                  <p className="text-white/80 text-sm mt-1">60 seconds</p>
                </div>
              </div>
            )}

            {/* Actual Video (when playing) */}
            {isPlaying && (
              <div className="relative w-full h-full">
                {/* Placeholder for actual video element */}
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <div className="text-center text-white p-8">
                    <Pause className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl font-semibold mb-2">Video Player</p>
                    <p className="text-sm text-white/60 max-w-md">
                      Replace this placeholder with your actual video element.
                      <br />
                      Add video file to public folder and reference it here.
                    </p>
                    <button
                      onClick={() => setIsPlaying(false)}
                      className="mt-4 px-6 py-2 bg-primary rounded-full text-sm font-semibold hover:brightness-110 transition-all"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
                
                {/* Uncomment and configure when video is ready
                <video
                  className="w-full h-full"
                  controls
                  autoPlay
                  src={videoUrl}
                  onEnded={() => setIsPlaying(false)}
                >
                  Your browser does not support the video tag.
                </video>
                */}
              </div>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="absolute top-4 right-4 flex gap-2 z-20">
            <span className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-foreground shadow-lg">
              🎥 1 min
            </span>
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
