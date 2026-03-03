import { motion } from "framer-motion";
import { Package, Truck, Shield, Ruler, ArrowUpRight } from "lucide-react";
import { SERVICES_CONTENT, INDUSTRIES } from "@/constants";
import { SERVICES_IMAGES } from "@/constants/images";

const services = [
  {
    icon: Package,
    title: "Custom Corrugated Boxes",
    desc: "Tailored box sizes and flute types for your exact product dimensions and weight requirements.",
  },
  {
    icon: Truck,
    title: "Bulk Distribution",
    desc: "Seamless supply chain with bulk orders delivered to your warehouse on schedule, every time.",
  },
  {
    icon: Shield,
    title: "Quality Assurance",
    desc: "Every box meets BIS standards with rigorous burst and compression strength testing.",
  },
  {
    icon: Ruler,
    title: "Design & Prototyping",
    desc: "From die-cut templates to printed packaging, we bring your brand to the box.",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4">
            Our Services
          </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              {SERVICES_CONTENT.heading}
            </h2>
            <p className="text-muted-foreground text-lg">
              {SERVICES_CONTENT.description}
            </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-8 hover:border-primary/40 transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <service.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Feature image row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 grid lg:grid-cols-2 gap-12 items-center"
        >
          <img
            src={SERVICES_IMAGES.main}
            alt={SERVICES_IMAGES.alt}
            className="rounded-2xl w-full object-cover aspect-video"
            loading="lazy"
          />
          <div>
            <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-6">
              {SERVICES_CONTENT.industryHeading}
            </h3>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              {SERVICES_CONTENT.industryDescription}
            </p>
            <div className="flex flex-wrap gap-3">
              {INDUSTRIES.map((tag) => (
                <span
                  key={tag}
                  className="bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
