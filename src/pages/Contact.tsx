import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import { ArrowUpRight, Mail, Phone, MapPin } from "lucide-react";
import { CONTACT_INFO, CONTACT_CONTENT, FORM_PLACEHOLDERS } from "@/constants";
import { MetaTags, StructuredData } from '@/seo';
import { PAGE_METADATA } from '@/seo/metadata/pages';
import { getLocalBusinessSchema, getBreadcrumbSchema, PAGE_BREADCRUMBS } from '@/seo/schema';
import { useState } from "react";
import { submitContactForm } from "@/lib/googleSheets";
import { initialContactFormState, ContactFormState } from "@/types/contact";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState<ContactFormState>(initialContactFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitContactForm(formData);
      
      if (result.success) {
        toast.success(result.message);
        setFormData(initialContactFormState); // Reset form
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Layout>
      {/* SEO Meta Tags */}
      <MetaTags {...PAGE_METADATA.contact} />
      
      {/* Structured Data - Schema.org */}
      <StructuredData type="LocalBusiness" data={getLocalBusinessSchema()} />
      <StructuredData type="BreadcrumbList" data={getBreadcrumbSchema(PAGE_BREADCRUMBS.contact)} />
      
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
                onSubmit={handleSubmit}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={FORM_PLACEHOLDERS.name} 
                      required
                      disabled={isSubmitting}
                      className="w-full bg-secondary text-foreground border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed" 
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Company</label>
                    <input 
                      type="text" 
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder={FORM_PLACEHOLDERS.company} 
                      disabled={isSubmitting}
                      className="w-full bg-secondary text-foreground border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={FORM_PLACEHOLDERS.email} 
                    required
                    disabled={isSubmitting}
                    className="w-full bg-secondary text-foreground border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed" 
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={FORM_PLACEHOLDERS.phone} 
                    required
                    disabled={isSubmitting}
                    className="w-full bg-secondary text-foreground border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed" 
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Requirements</label>
                  <textarea 
                    rows={4} 
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    placeholder={FORM_PLACEHOLDERS.requirementsShort} 
                    disabled={isSubmitting}
                    className="w-full bg-secondary text-foreground border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground resize-none disabled:opacity-50 disabled:cursor-not-allowed" 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full text-base font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send Enquiry"} <ArrowUpRight className="w-5 h-5" />
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
