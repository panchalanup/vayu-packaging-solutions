import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, MessageCircle } from "lucide-react";
import { CONTACT_INFO, COMPANY_INFO, NAV_LINKS, SOCIAL_LINKS } from "@/constants";
import { LOGO_IMAGES } from "@/constants/images";

const Footer = () => {
  return (
    <footer className="border-t border-border py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link to="/" className="inline-block">
              <img src={LOGO_IMAGES.main} alt="Vayu Packaging Solutions" className="h-14 w-auto object-contain" />
            </Link>
            <p className="text-muted-foreground mt-4 max-w-sm leading-relaxed">
              {COMPANY_INFO.description}
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer"
                aria-label="Email us"
              >
                <Mail className="w-4 h-4 text-foreground" />
              </a>
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-foreground" />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 text-foreground" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Quick Links</h4>
            <div className="space-y-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className="block text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Contact</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span>{CONTACT_INFO.addressFull}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{CONTACT_INFO.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{CONTACT_INFO.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 text-sm text-muted-foreground text-center md:text-left">
          <p className="leading-relaxed">{COMPANY_INFO.copyright}</p>
          <p className="leading-relaxed">{COMPANY_INFO.tagline}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
