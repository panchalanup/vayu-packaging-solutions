import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import { Package, Truck, Shield, Ruler, ArrowUpRight } from "lucide-react";
import { SERVICES_CONTENT, INDUSTRIES } from "@/constants";
import { SERVICES_IMAGES } from "@/constants/images";
import { MetaTags, StructuredData } from '@/seo';
import { PAGE_METADATA } from '@/seo/metadata/pages';
import { getBreadcrumbSchema, PAGE_BREADCRUMBS, getFAQSchema, COMMON_FAQS } from '@/seo/schema';

const services = [
  { icon: Package, title: "Custom Corrugated Boxes", desc: "Tailored box sizes and flute types for your exact product dimensions and weight requirements." },
  { icon: Truck, title: "Bulk Distribution", desc: "Seamless supply chain with bulk orders delivered to your warehouse on schedule, every time." },
  { icon: Shield, title: "Quality Assurance", desc: "Every box meets BIS standards with rigorous burst and compression strength testing." },
  { icon: Ruler, title: "Design & Prototyping", desc: "From die-cut templates to printed packaging, we bring your brand to the box." },
];


const Services = () => {
  return (
    <Layout>
      {/* SEO Meta Tags */}
      <MetaTags {...PAGE_METADATA.services} />
      
      {/* Structured Data - Schema.org */}
      <StructuredData type="BreadcrumbList" data={getBreadcrumbSchema(PAGE_BREADCRUMBS.services)} />
      <StructuredData type="FAQPage" data={getFAQSchema(COMMON_FAQS.services)} />
      
      <PageTransition>
        {/* Hero */}
        <section className="pt-8 sm:pt-12 md:pt-16 pb-12 md:pb-16 section-dark">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4">Our Services</p>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              {SERVICES_CONTENT.heading}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {SERVICES_CONTENT.description}
            </p>
          </div>
        </section>

        {/* Service cards */}
        <section className="py-24">
          <div className="container mx-auto px-6">
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
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-3">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{service.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Industries */}
        <section className="py-24 section-dark">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.img
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                src={SERVICES_IMAGES.main}
                alt={SERVICES_IMAGES.alt}
                className="rounded-2xl w-full object-cover aspect-video"
                loading="lazy"
              />
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-6">
                  {SERVICES_CONTENT.industryHeading}
                </h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  {SERVICES_CONTENT.industryDescription}
                </p>
                <div className="flex flex-wrap gap-3">
                  {INDUSTRIES.map((tag) => (
                    <span key={tag} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium">{tag}</span>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="container mx-auto px-6 text-center max-w-2xl">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">Need a custom packaging solution?</h2>
            <p className="text-muted-foreground text-lg mb-8">Tell us your requirements and we'll get back to you within 24 hours.</p>
            <a href="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full text-base font-semibold hover:brightness-110 transition-all">
              Request a Quote <ArrowUpRight className="w-5 h-5" />
            </a>
          </div>
        </section>
      </PageTransition>
    </Layout>
  );
};

export default Services;
