import { motion } from "framer-motion";
import { ArrowUpRight, Mail, Phone, MapPin } from "lucide-react";
import { CONTACT_INFO, CONTACT_CONTENT, FORM_PLACEHOLDERS } from "@/constants";
import { useState } from "react";
import { submitContactForm } from "@/lib/googleSheets";
import { initialContactFormState, ContactFormState } from "@/types/contact";
import { toast } from "sonner";
import { useEventTracker } from "@/hooks/useAnalytics";

const ContactSection = () => {
  const [formData, setFormData] = useState<ContactFormState>(initialContactFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { trackEvent } = useEventTracker();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track form submission attempt
    trackEvent('contact_form_submit_attempt', {
      hasCompany: !!formData.company,
      hasRequirements: !!formData.requirements,
    });
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields");
      trackEvent('contact_form_validation_error', { error: 'missing_required_fields' });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      trackEvent('contact_form_validation_error', { error: 'invalid_email' });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitContactForm(formData);
      
      if (result.success) {
        toast.success(result.message);
        trackEvent('contact_form_submit_success', {
          hasCompany: !!formData.company,
          hasRequirements: !!formData.requirements,
        });
        setFormData(initialContactFormState); // Reset form
      } else {
        toast.error(result.message);
        trackEvent('contact_form_submit_error', { error: 'api_error' });
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      trackEvent('contact_form_submit_error', { error: 'unexpected_error' });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <section id="contact" className="py-24 section-dark">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4">
              Contact Us
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
              {CONTACT_CONTENT.heading}
            </h2>
            <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
              {CONTACT_CONTENT.description}
            </p>

            <div className="space-y-6">
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
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={4}
                placeholder={FORM_PLACEHOLDERS.requirements}
                disabled={isSubmitting}
                className="w-full bg-secondary text-foreground border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full text-base font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send Enquiry"}
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
