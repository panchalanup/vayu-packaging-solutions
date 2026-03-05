import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import VideoSection from "@/components/VideoSection";
import ProcessTimeline from "@/components/ProcessTimeline";
import FacilityGallery from "@/components/FacilityGallery";
import PageTransition from "@/components/PageTransition";
import { STATS_ARRAY } from "@/constants";
import { motion } from "framer-motion";
import { ArrowUpRight, Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Rajesh Sharma",
    role: "Operations Head, ShopEase",
    text: "Vayu Packaging has been our go-to supplier for over 3 years. Their boxes are sturdy, pricing is competitive, and delivery is always on time.",
  },
  {
    name: "Priya Mehta",
    role: "Founder, FreshBite Foods",
    text: "We needed food-grade corrugated boxes with custom printing. Vayu delivered exactly what we needed, and our brand looks amazing on every box.",
  },
  {
    name: "Anil Kapoor",
    role: "Supply Chain Manager, TechVista",
    text: "Their quality assurance process gives us confidence. Zero damage complaints since we switched to Vayu Packaging Solutions.",
  },
];

const Index = () => {
  return (
    <Layout>
      <PageTransition>
        <HeroSection />

        {/* Stats */}
        <section className="py-20 section-dark">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {STATS_ARRAY.map((stat, i) => (
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

        {/* Video Section - NEW */}
        <VideoSection />

        {/* Process Timeline - NEW */}
        <ProcessTimeline />

        {/* Facility Gallery - NEW */}
        <FacilityGallery />

        {/* Quick CTA */}
        <section className="py-24">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                Ready to streamline your packaging supply?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Get custom corrugated boxes delivered at scale. Competitive pricing, fast turnaround, and dedicated account management.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full text-base font-semibold hover:brightness-110 transition-all">
                  Get a Quote <ArrowUpRight className="w-5 h-5" />
                </a>
                <a href="/services" className="inline-flex items-center gap-2 border border-border text-foreground px-7 py-3.5 rounded-full text-base font-semibold hover:bg-secondary transition-all">
                  Our Services
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 section-dark">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4">Testimonials</p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Trusted by businesses across India</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-card border border-border rounded-2xl p-8 relative"
                >
                  <Quote className="w-10 h-10 text-primary/20 absolute top-6 right-6" />
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-primary fill-primary" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 leading-relaxed">"{t.text}"</p>
                  <div>
                    <p className="font-heading font-semibold text-foreground">{t.name}</p>
                    <p className="text-muted-foreground text-sm">{t.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </PageTransition>
    </Layout>
  );
};

export default Index;
