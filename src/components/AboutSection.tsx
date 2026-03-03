import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle } from "lucide-react";
import { ABOUT_CONTENT, KEY_FEATURES, STATS } from "@/constants";
import { ABOUT_IMAGES } from "@/constants/images";

const stats = [
  STATS.yearsExperience,
  STATS.happyClients,
  STATS.boxesDelivered,
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 section-dark">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <img
              src={ABOUT_IMAGES.main}
              alt={ABOUT_IMAGES.alt}
              className="rounded-2xl w-full object-cover aspect-square glow-amber"
              loading="lazy"
            />
            <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground rounded-2xl p-6 shadow-2xl hidden md:block">
              <p className="font-heading text-3xl font-bold">{STATS.yearsExperience.value}</p>
              <p className="text-sm font-medium opacity-80">{STATS.yearsExperience.label}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4">
              About Us
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
              {ABOUT_CONTENT.heading}
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              {ABOUT_CONTENT.description}
            </p>

            <div className="space-y-4 mb-10">
              {KEY_FEATURES.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full text-base font-semibold hover:brightness-110 transition-all"
            >
              Get in Touch
              <ArrowUpRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-12 border-t border-border">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <p className="font-heading text-4xl md:text-5xl font-bold text-gradient mb-2">{stat.value}</p>
              <p className="text-muted-foreground uppercase text-sm tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
