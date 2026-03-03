import { motion } from "framer-motion";
import { ShoppingCart, Factory, CheckCircle2, Truck, Image as ImageIcon } from "lucide-react";

const processSteps = [
  {
    id: "PT-1",
    number: "01",
    icon: ShoppingCart,
    title: "Order Placement",
    description: "Share your requirements with our team via phone, email, or website form",
    imageDescription: "Customer service rep on phone",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "PT-2",
    number: "02",
    icon: Factory,
    title: "Manufacturing",
    description: "Your boxes are manufactured using premium quality corrugated sheets",
    imageDescription: "Production line in action",
    color: "from-green-500 to-green-600",
  },
  {
    id: "PT-3",
    number: "03",
    icon: CheckCircle2,
    title: "Quality Check",
    description: "Rigorous testing ensures every box meets BIS standards",
    imageDescription: "Inspector examining product",
    color: "from-amber-500 to-amber-600",
  },
  {
    id: "PT-4",
    number: "04",
    icon: Truck,
    title: "Delivery",
    description: "Fast, secure delivery to your warehouse, anywhere in India",
    imageDescription: "Truck delivery scene",
    color: "from-purple-500 to-purple-600",
  },
];

const ProcessTimeline = () => {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
        >
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4">
            Our Process
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            How It Works
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            From your first inquiry to final delivery, our streamlined process ensures quality and transparency at every step.
          </p>
        </motion.div>

        {/* Process Steps */}
        <div className="relative max-w-7xl mx-auto">
          {/* Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 relative z-10">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                {/* Step Card */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  {/* Image Placeholder */}
                  <div className="relative aspect-[3/2] bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 text-primary/40" />
                        <p className="text-xs font-mono text-primary/60">{step.id}</p>
                        <p className="text-xs text-muted-foreground mt-2">{step.imageDescription}</p>
                      </div>
                    </div>

                    {/* Uncomment when you add images
                    <img
                      src={step.placeholder}
                      alt={step.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    */}

                    {/* Step Number Badge */}
                    <div className={`absolute top-4 left-4 w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                      <span className="text-white font-heading font-bold text-lg">{step.number}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Bottom Accent */}
                  <div className={`h-1 w-full bg-gradient-to-r ${step.color}`} />
                </div>

                {/* Arrow (Desktop only) */}
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-8 -translate-y-1/2 z-20">
                    <div className="w-0 h-0 border-t-[16px] border-t-transparent border-b-[16px] border-b-transparent border-l-[16px] border-l-primary animate-pulse" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 sm:mt-16"
        >
          <p className="text-muted-foreground mb-6 text-base sm:text-lg">
            Experience our seamless process - get started today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold hover:shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-200"
            >
              Start Your Order
              <ShoppingCart className="w-5 h-5" />
            </a>
            <a
              href="/services"
              className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold hover:bg-primary hover:text-white transition-all duration-200"
            >
              Learn More
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessTimeline;
