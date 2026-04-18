import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import VideoSection from "@/components/VideoSection";
import ProcessTimeline from "@/components/ProcessTimeline";
import FacilityGallery from "@/components/FacilityGallery";
import PageTransition from "@/components/PageTransition";
import { STATS_ARRAY } from "@/constants";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Star, Quote } from "lucide-react";
import { MetaTags, StructuredData } from '@/seo';
import { PAGE_METADATA } from '@/seo/metadata/pages';
import { getOrganizationSchema, getLocalBusinessSchema, getBreadcrumbSchema, PAGE_BREADCRUMBS, getProductCatalogSchema } from '@/seo/schema';

const DistributionMap = lazy(() => import("@/components/DistributionMap"));

const distributionCities = [
  "Ahmedabad (HQ)",
  "Gandhinagar",
  "Mehsana",
  "Himmatnagar",
  "Modasa",
  "Surat",
  "Vadodara",
  "Rajkot",
  "Bhavnagar",
  "Jamnagar",
  "Morbi",
  "Vapi",
];

const distributionUseCases = [
  {
    problem: "Transit damage in long-distance dispatch",
    solution: "Recommended 5-ply and 7-ply corrugated configurations with stronger burst and stacking performance.",
  },
  {
    problem: "Urgent replenishment for fast-moving SKUs",
    solution: "Ahmedabad hub-based planning supports faster dispatch cycles across major Gujarat industrial corridors.",
  },
  {
    problem: "Inconsistent packaging quality across suppliers",
    solution: "Single-vendor quality process for box strength, dimensions, and packaging consumables at scale.",
  },
];

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
  const mapSectionRef = useRef<HTMLElement | null>(null);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);

  useEffect(() => {
    const section = mapSectionRef.current;
    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoadMap(true);
            observer.disconnect();
          }
        });
      },
      {
        root: null,
        rootMargin: "250px 0px",
        threshold: 0.15,
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Layout>
      {/* SEO Meta Tags */}
      <MetaTags {...PAGE_METADATA.home} />
      
      {/* Structured Data - Schema.org */}
      <StructuredData type="Organization" data={getOrganizationSchema()} />
      <StructuredData type="LocalBusiness" data={getLocalBusinessSchema()} />
      <StructuredData type="BreadcrumbList" data={getBreadcrumbSchema(PAGE_BREADCRUMBS.home)} />
      
      {/* Product Catalog - Shows all products in search results */}
      <StructuredData type="ItemList" data={getProductCatalogSchema()} />
      
      <PageTransition>
        <HeroSection />

        {/* Stats */}
        <section className="py-20 section-dark">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {STATS_ARRAY.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ filter: "blur(3px)", opacity: 0, y: 20 }}
                  whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
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

        {/* Distribution Network Map */}
        <section ref={mapSectionRef} className="py-24 section-dark" aria-labelledby="distribution-network-heading">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-4xl text-center mb-10">
              <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4">Delivery Coverage</p>
              <h2 id="distribution-network-heading" className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-5">
                Our Distribution Network Across Gujarat
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                We provide packaging distribution services across major cities in Gujarat including Ahmedabad, Surat, Vadodara,
                Rajkot, and surrounding industrial zones. Ahmedabad serves as our central hub, enabling fast and dependable
                delivery operations throughout the state.
              </p>
            </div>

            <div className="mx-auto max-w-6xl">
              {shouldLoadMap ? (
                <Suspense
                  fallback={<div className="h-[420px] w-full rounded-2xl bg-secondary/80 animate-pulse border border-border md:h-[500px]" />}
                >
                  <DistributionMap />
                </Suspense>
              ) : (
                <div className="h-[420px] w-full rounded-2xl bg-secondary/80 animate-pulse border border-border md:h-[500px]" />
              )}
            </div>

            <div className="mx-auto mt-8 max-w-6xl grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">Cities We Serve in Gujarat</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We actively support industrial and business delivery requirements across key Gujarat markets.
                </p>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-foreground">
                  {distributionCities.map((city) => (
                    <li key={city} className="rounded-lg bg-secondary/60 px-3 py-2">
                      {city}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">Common Packaging Challenges We Solve</h3>
                <ul className="space-y-3">
                  {distributionUseCases.map((item) => (
                    <li key={item.problem} className="rounded-xl border border-border bg-secondary/30 p-4">
                      <p className="text-sm font-semibold text-foreground">{item.problem}</p>
                      <p className="text-sm text-muted-foreground mt-1">{item.solution}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mx-auto mt-8 max-w-5xl rounded-2xl border border-border bg-card p-6 text-center">
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Looking for city-wise packaging support?</h3>
              <p className="text-muted-foreground text-sm md:text-base mb-5">
                Explore our Gujarat coverage details and choose packaging solutions by city, industry, and delivery urgency.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a href="/locations" className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all">
                  View Gujarat Service Locations
                </a>
                <a href="/services" className="inline-flex items-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary transition-all">
                  Explore Industry Solutions
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Quick CTA */}
        <section className="py-24">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <motion.div initial={{ filter: "blur(5px)", opacity: 0, y: 30 }} whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }} viewport={{ once: true }}>
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
                  initial={{ filter: "blur(5px)", opacity: 0, y: 30 }}
                  whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
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
