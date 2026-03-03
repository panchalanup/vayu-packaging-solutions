import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle } from "lucide-react";

const products = [
  {
    title: "3-Ply Corrugated Boxes",
    desc: "Lightweight yet durable. Ideal for small and medium-weight products like apparel, accessories, and books.",
    features: ["Single wall construction", "Cost-effective", "Ideal for light goods"],
  },
  {
    title: "5-Ply Corrugated Boxes",
    desc: "Double wall strength for heavier products. Perfect for electronics, home appliances, and FMCG goods.",
    features: ["Double wall protection", "High stacking strength", "Industry standard"],
  },
  {
    title: "7-Ply Corrugated Boxes",
    desc: "Maximum protection for heavy-duty shipping. Used for industrial parts, machinery, and export packaging.",
    features: ["Triple wall construction", "Export-grade quality", "Maximum load capacity"],
  },
  {
    title: "Die-Cut Boxes",
    desc: "Custom-shaped boxes designed to fit your product perfectly. Reduces material waste and enhances unboxing experience.",
    features: ["Custom shapes & sizes", "Brand-focused design", "Minimal material waste"],
  },
  {
    title: "Printed Packaging",
    desc: "Full-color printed corrugated boxes that showcase your brand. Available in flexo and offset printing.",
    features: ["Flexo & offset printing", "CMYK full color", "Brand visibility"],
  },
  {
    title: "Food-Grade Boxes",
    desc: "FSSAI compliant corrugated boxes for food and beverage packaging with food-safe coatings.",
    features: ["FSSAI compliant", "Food-safe coating", "Moisture resistant"],
  },
];

const Products = () => {
  return (
    <Layout>
      <PageTransition>
        {/* Hero */}
        <section className="pt-32 pb-16 section-dark">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4">Our Products</p>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Corrugated boxes for every need
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              From 3-ply lightweight to 7-ply heavy-duty, we offer the full range of corrugated packaging solutions.
            </p>
          </div>
        </section>

        {/* Product grid */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, i) => (
                <motion.div
                  key={product.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-8 hover:border-primary/40 transition-all"
                >
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-3">{product.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">{product.desc}</p>
                  <div className="space-y-2">
                    {product.features.map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                        <span className="text-foreground text-sm">{f}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 section-dark">
          <div className="container mx-auto px-6 text-center max-w-2xl">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">Minimum order from 500 boxes</h2>
            <p className="text-muted-foreground text-lg mb-8">Get competitive bulk pricing with pan-India delivery. Custom sizes available on request.</p>
            <a href="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full text-base font-semibold hover:brightness-110 transition-all">
              Get a Quote <ArrowUpRight className="w-5 h-5" />
            </a>
          </div>
        </section>
      </PageTransition>
    </Layout>
  );
};

export default Products;
