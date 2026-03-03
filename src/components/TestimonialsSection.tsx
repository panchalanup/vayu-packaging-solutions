import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

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

const TestimonialsSection = () => {
  return (
    <section className="py-24 section-dark">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4">
            Testimonials
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            Trusted by businesses across India
          </h2>
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
  );
};

export default TestimonialsSection;
