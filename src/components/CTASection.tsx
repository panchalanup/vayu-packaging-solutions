import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle } from "lucide-react";
import { CTA_FEATURES, WHY_VAYU } from "@/constants";

const CTASection = () => {
  return (
    <section id="products" className="py-24">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to streamline your packaging supply?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Get custom corrugated boxes delivered at scale. We offer competitive pricing, 
              fast turnaround, and dedicated account management.
            </p>
            <div className="space-y-4 mb-10">
              {CTA_FEATURES.map((item) => (
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
              Request a Quote
              <ArrowUpRight className="w-5 h-5" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-2xl p-10 glow-amber"
          >
            <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Why Vayu?</h3>
            <p className="text-muted-foreground mb-8">Our competitive advantage</p>
            <div className="space-y-6">
              {WHY_VAYU.map((item) => (
                <div key={item.num} className="flex gap-4">
                  <span className="font-heading text-3xl font-bold text-primary/30">{item.num}</span>
                  <div>
                    <h4 className="font-heading font-semibold text-foreground mb-1">{item.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
