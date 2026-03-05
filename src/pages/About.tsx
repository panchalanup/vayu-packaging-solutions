import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle } from "lucide-react";
import { ABOUT_CONTENT, KEY_FEATURES_EXTENDED, STATS_ARRAY, WHY_VAYU_EXTENDED } from "@/constants";
import { ABOUT_IMAGES } from "@/constants/images";
import { MetaTags, StructuredData } from '@/seo';
import { PAGE_METADATA } from '@/seo/metadata/pages';
import { getBreadcrumbSchema, PAGE_BREADCRUMBS } from '@/seo/schema';

const stats = STATS_ARRAY;

const About = () => {
  return (
    <Layout>
      {/* SEO Meta Tags */}
      <MetaTags {...PAGE_METADATA.about} />
      
      {/* Structured Data - Schema.org */}
      <StructuredData type="BreadcrumbList" data={getBreadcrumbSchema(PAGE_BREADCRUMBS.about)} />
      
      <PageTransition>
        {/* Hero banner */}
        <section className="pt-8 sm:pt-12 md:pt-16 pb-12 md:pb-16 section-dark">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4">About Us</p>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              {ABOUT_CONTENT.heading}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {ABOUT_CONTENT.description}
            </p>
          </div>
        </section>

        {/* About content */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
                <img src={ABOUT_IMAGES.main} alt={ABOUT_IMAGES.alt} className="rounded-2xl w-full object-cover aspect-square" loading="lazy" />
                <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground rounded-2xl p-6 shadow-2xl hidden md:block">
                  <p className="font-heading text-3xl font-bold">{stats[0].value}</p>
                  <p className="text-sm font-medium opacity-80">{stats[0].label}</p>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">Our Story</h2>
                <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                  {ABOUT_CONTENT.story.paragraph1}
                </p>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  {ABOUT_CONTENT.story.paragraph2}
                </p>
                <div className="space-y-4 mb-10">
                  {KEY_FEATURES_EXTENDED.map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                <a href="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full text-base font-semibold hover:brightness-110 transition-all">
                  Get in Touch <ArrowUpRight className="w-5 h-5" />
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 section-dark">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                  <p className="font-heading text-4xl md:text-5xl font-bold text-gradient mb-2">{stat.value}</p>
                  <p className="text-muted-foreground uppercase text-sm tracking-wider">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Vayu */}
        <section className="py-24">
          <div className="container mx-auto px-6 max-w-4xl">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground text-center mb-16">Why Choose Vayu?</h2>
            <div className="space-y-8">
              {WHY_VAYU_EXTENDED.map((item) => (
                <motion.div key={item.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex gap-6 items-start">
                  <span className="font-heading text-4xl font-bold text-primary/20">{item.num}</span>
                  <div>
                    <h3 className="font-heading text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
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

export default About;
