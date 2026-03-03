import { motion } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";

const facilityImages = [
  {
    id: "WG-1",
    title: "Warehouse Overview",
    description: "Wide shot of main warehouse floor",
    placeholder: "/placeholder.svg",
  },
  {
    id: "WG-2",
    title: "Storage Systems",
    description: "Tall racking systems with organized inventory",
    placeholder: "/placeholder.svg",
  },
  {
    id: "WG-3",
    title: "Modern Equipment",
    description: "Forklifts and automated equipment",
    placeholder: "/placeholder.svg",
  },
  {
    id: "WG-4",
    title: "Quality Lab",
    description: "Testing area with compression tester",
    placeholder: "/placeholder.svg",
  },
  {
    id: "WG-5",
    title: "Team at Work",
    description: "Workers collaborating and organizing",
    placeholder: "/placeholder.svg",
  },
  {
    id: "WG-6",
    title: "Loading Bay",
    description: "Trucks at loading docks",
    placeholder: "/placeholder.svg",
  },
  {
    id: "WG-7",
    title: "Raw Materials",
    description: "Corrugated sheets and rolls",
    placeholder: "/placeholder.svg",
  },
  {
    id: "WG-8",
    title: "Finished Products",
    description: "Stacks of completed boxes",
    placeholder: "/placeholder.svg",
  },
  {
    id: "WG-9",
    title: "Office Space",
    description: "Professional order management area",
    placeholder: "/placeholder.svg",
  },
];

const FacilityGallery = () => {
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
          {facilityImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 hover:shadow-xl transition-all duration-300"
            >
              {/* Placeholder Image */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-center p-4">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 text-primary/40" />
                  <p className="text-xs font-mono text-primary/60">{image.id}</p>
                  <p className="text-sm font-semibold text-foreground mt-2">{image.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{image.description}</p>
                </div>
              </div>

              {/* Uncomment when you add actual images
              <img
                src={image.placeholder}
                alt={image.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              */}

              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
    </section>
  );
};

export default FacilityGallery;
