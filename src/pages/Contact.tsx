import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import { ArrowUpRight, Mail, Phone, MapPin } from "lucide-react";
import { CONTACT_INFO, CONTACT_CONTENT, FORM_PLACEHOLDERS } from "@/constants";

const Contact = () => {
  return (
    <Layout>
      <PageTransition>
        {/* Hero */}
        <section className="pt-8 sm:pt-12 md:pt-16 pb-12 md:pb-16 section-dark">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4">Contact Us</p>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              {CONTACT_CONTENT.heading}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {CONTACT_CONTENT.description}
            </p>
          </div>
        </section>

        {/* Contact form + info */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="font-heading text-3xl font-bold text-foreground mb-8">Get in touch</h2>
                <div className="space-y-6 mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Call us</p>
                      <p className="text-foreground font-medium">{CONTACT_INFO.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Email us</p>
                      <p className="text-foreground font-medium">{CONTACT_INFO.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Visit us</p>
                      <p className="text-foreground font-medium">{CONTACT_INFO.address}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.form
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-card border border-border rounded-2xl p-8 space-y-6"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Full Name</label>
                    <input type="text" placeholder={FORM_PLACEHOLDERS.name} className="w-full bg-secondary text-foreground border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Company</label>
                    <input type="text" placeholder={FORM_PLACEHOLDERS.company} className="w-full bg-secondary text-foreground border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
                  <input type="email" placeholder={FORM_PLACEHOLDERS.email} className="w-full bg-secondary text-foreground border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Phone</label>
                  <input type="tel" placeholder={FORM_PLACEHOLDERS.phone} className="w-full bg-secondary text-foreground border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Requirements</label>
                  <textarea rows={4} placeholder={FORM_PLACEHOLDERS.requirementsShort} className="w-full bg-secondary text-foreground border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground resize-none" />
                </div>
                <button type="submit" className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full text-base font-semibold hover:brightness-110 transition-all">
                  Send Enquiry <ArrowUpRight className="w-5 h-5" />
                </button>
              </motion.form>
            </div>
          </div>
        </section>
      </PageTransition>
    </Layout>
  );
};

export default Contact;
