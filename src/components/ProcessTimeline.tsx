import { motion } from "framer-motion";
import { ShoppingCart, Factory, CheckCircle2, Truck, ArrowRight } from "lucide-react";

const processSteps = [
  {
    number: "01",
    icon: ShoppingCart,
    title: "Order Placement",
    description: "Share your requirements with our team via phone, email, or website form",
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    borderColor: "border-blue-500",
  },
  {
    number: "02",
    icon: Factory,
    title: "Manufacturing",
    description: "Your boxes are manufactured using premium quality corrugated sheets",
    color: "bg-green-500",
    lightColor: "bg-green-50",
    borderColor: "border-green-500",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Quality Check",
    description: "Rigorous testing ensures every box meets BIS standards",
    color: "bg-amber-500",
    lightColor: "bg-amber-50",
    borderColor: "border-amber-500",
  },
  {
    number: "04",
    icon: Truck,
    title: "Delivery",
    description: "Fast, secure delivery to your warehouse, anywhere in India",
    color: "bg-purple-500",
    lightColor: "bg-purple-50",
    borderColor: "border-purple-500",
  },
];

const ProcessTimeline = () => {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16 sm:mb-20"
        >
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-primary font-semibold text-sm uppercase tracking-widest mb-3"
          >
            Our Process
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground text-base sm:text-lg leading-relaxed"
          >
            From your first inquiry to final delivery, our streamlined process ensures quality and transparency at every step.
          </motion.p>
        </motion.div>

        {/* Process Steps */}
        <div className="relative max-w-7xl mx-auto">
          {/* Desktop Connection Line */}
          <div className="hidden lg:block absolute top-[120px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent z-0" />

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative z-10">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  delay: index * 0.15,
                  duration: 0.5,
                  ease: "easeOut"
                }}
                className="relative group"
              >
                {/* Step Card */}
                <div className="relative bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-primary/20 h-full flex flex-col">
                  {/* Step Number - Large and Prominent */}
                  <div className="absolute -top-4 -left-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <span className="text-white font-heading font-bold text-2xl">{step.number}</span>
                  </div>

                  {/* Icon Circle */}
                  <div className={`w-20 h-20 rounded-full ${step.lightColor} flex items-center justify-center mb-6 mx-auto mt-4 group-hover:scale-110 transition-all duration-300 relative`}>
                    <div className={`absolute inset-0 rounded-full ${step.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                    <step.icon className={`w-10 h-10 ${step.color.replace('bg-', 'text-')} relative z-10 group-hover:scale-110 transition-transform duration-300`} />
                  </div>

                  {/* Content */}
                  <div className="text-center flex-1 flex flex-col">
                    <h3 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed flex-1">
                      {step.description}
                    </p>
                  </div>

                  {/* Bottom Accent Bar */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl`} />
                </div>

                {/* Arrow Connector (Desktop) */}
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:flex absolute top-[120px] -right-3 w-6 h-6 items-center justify-center z-20">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15 + 0.3 }}
                    >
                      <ArrowRight className="w-6 h-6 text-primary drop-shadow-sm" />
                    </motion.div>
                  </div>
                )}

                {/* Mobile Connector */}
                {index < processSteps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15 + 0.3 }}
                      className="flex flex-col items-center"
                    >
                      <div className="w-0.5 h-8 bg-gradient-to-b from-primary to-primary/30" />
                      <ArrowRight className="w-6 h-6 text-primary rotate-90" />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="text-center mt-16 sm:mt-20"
        >
          <p className="text-muted-foreground mb-6 text-base sm:text-lg font-medium">
            Experience our seamless process - get started today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/contact"
              className="group inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300 min-w-[200px]"
            >
              Start Your Order
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            </a>
            <a
              href="/services"
              className="group inline-flex items-center justify-center gap-2 border-2 border-primary text-primary bg-white px-8 py-4 rounded-full font-semibold hover:bg-primary hover:text-white hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300 min-w-[200px]"
            >
              Learn More
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessTimeline;
