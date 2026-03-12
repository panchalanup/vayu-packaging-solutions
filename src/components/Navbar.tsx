import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight, Phone, ChevronDown, Sparkles, Download } from "lucide-react";
import { LOGO_IMAGES } from "@/constants/images";
import { TOOLS_MENU, CONTACT_INFO } from "@/constants";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import confetti from "canvas-confetti";
import { useEventTracker } from "@/hooks/useAnalytics";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Products", path: "/products" },
  { label: "Blogs", path: "/blogs" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [isCallButtonHovered, setIsCallButtonHovered] = useState(false);
  const location = useLocation();
  const { trackEvent } = useEventTracker();

  // Close mobile menu when route changes
  useEffect(() => {
    setOpen(false);
    setToolsOpen(false);
  }, [location.pathname]);

  // Handle download with celebration effect
  const handleDownloadClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Track analytics event
    trackEvent('brochure_download', {
      type: 'download',
      location: 'navbar',
      device: window.innerWidth < 768 ? 'mobile' : 'desktop',
      fileName: 'Vayu-Packaging-Solutions-Brochure.pdf',
    }, {
      type: 'button',
      text: e.currentTarget.textContent || 'Download Brochure',
      x: e.clientX,
      y: e.clientY,
    });

    // Get button position for confetti origin
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    // Trigger confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x, y },
      colors: ['#16a34a', '#15803d', '#22c55e', '#ffd700', '#ffffff'],
      gravity: 1.2,
      ticks: 200,
    });

    // Optional: Add a second burst for extra celebration
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x, y },
        colors: ['#16a34a', '#15803d', '#22c55e', '#ffd700', '#ffffff'],
        gravity: 1.2,
      });
    }, 200);

    // Trigger download
    const link = document.createElement('a');
    link.href = '/brochures/Vayu-Packaging-Solutions-Company-Brochure.pdf';
    link.download = 'Vayu-Packaging-Solutions-Brochure.pdf';
    link.click();
  };

  return (
    <nav className="relative bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center group relative touch-manipulation"
          aria-label="Vayu Packaging Solutions Home"
        >
          <motion.img
            src={LOGO_IMAGES.horizontal}
            alt="Vayu Packaging Solutions"
            className="w-auto h-10 sm:h-12 md:h-14 lg:h-16 object-contain"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className="relative px-3 lg:px-4 py-2 group"
            >
              <span
                className={`text-sm lg:text-base font-medium transition-colors ${
                  location.pathname === link.path
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {link.label}
              </span>
              <span
                className={`absolute bottom-0 left-3 lg:left-4 right-3 lg:right-4 h-0.5 bg-primary transition-transform origin-left ${
                  location.pathname === link.path
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
          ))}
          
          {/* Tools Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setToolsOpen(true)}
            onMouseLeave={() => setToolsOpen(false)}
          >
            <button
              className={`relative px-3 lg:px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-1.5 ${
                TOOLS_MENU.some(tool => location.pathname === tool.path)
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-gradient-to-r from-primary/10 to-primary/5 text-primary hover:shadow-md hover:scale-105"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm lg:text-base font-semibold">Tools</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
              <span className="relative flex h-2 w-2 ml-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </button>
            
            {/* Dropdown Menu */}
            <AnimatePresence>
              {toolsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
                >
                  {TOOLS_MENU.map((tool) => (
                    <Link
                      key={tool.path}
                      to={tool.path}
                      className="block px-4 py-3 hover:bg-primary/5 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-gray-900 flex items-center gap-2">
                            {tool.name}
                            {tool.isNew && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Download Brochure Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleDownloadClick}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 lg:px-5 py-2.5 lg:py-3 rounded-full text-sm lg:text-base font-semibold hover:shadow-lg hover:shadow-green-600/25 hover:scale-105 transition-all duration-200"
                  aria-label="Download company brochure"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden lg:inline">Brochure</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download the brochure for future reference</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Call to Action Button with Shimmer/Shine Effect */}
        <motion.a
          href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`}
          className="hidden md:inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 lg:px-6 py-2.5 lg:py-3 rounded-full text-sm lg:text-base font-semibold relative overflow-hidden group"
          onMouseEnter={() => setIsCallButtonHovered(true)}
          onMouseLeave={() => setIsCallButtonHovered(false)}
          whileHover={{
            scale: 1.05,
          }}
          animate={{
            boxShadow: isCallButtonHovered
              ? "0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)"
              : "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
          transition={{
            duration: 0.3,
          }}
        >
          {/* Shimmer/Shine Overlay - Only visible on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: "-100%", opacity: 0 }}
            animate={{
              x: isCallButtonHovered ? "100%" : "-100%",
              opacity: isCallButtonHovered ? 1 : 0,
            }}
            transition={{
              duration: 0.8,
              ease: "easeInOut",
            }}
            style={{
              width: "100%",
            }}
          />
          
          {/* Button Content */}
          <span className="relative z-10 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>Call us now</span>
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </motion.a>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-foreground p-2.5 hover:bg-muted rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-card border-b border-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setOpen(false)}
                    className={`block py-3 px-4 rounded-lg transition-colors ${
                      location.pathname === link.path
                        ? "text-primary bg-primary/10 font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              
              {/* Tools Menu - Mobile */}
              {TOOLS_MENU.map((tool, index) => (
                <motion.div
                  key={tool.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (navLinks.length + index) * 0.05 }}
                >
                  <Link
                    to={tool.path}
                    onClick={() => setOpen(false)}
                    className={`block py-3 px-4 rounded-lg transition-all ${
                      location.pathname === tool.path
                        ? "bg-primary text-primary-foreground font-semibold shadow-md"
                        : "bg-gradient-to-r from-primary/10 to-primary/5 text-primary font-semibold hover:shadow-md"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {tool.name}
                      {tool.isNew && (
                        <span className="inline-flex items-center gap-1 text-xs bg-primary/20 px-2 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                    </span>
                  </Link>
                </motion.div>
              ))}
              
              {/* Download Brochure Button - Mobile */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (navLinks.length + TOOLS_MENU.length) * 0.05 }}
              >
                <button
                  onClick={(e) => {
                    handleDownloadClick(e);
                    setOpen(false);
                  }}
                  className="mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-green-600/25 transition-all touch-manipulation min-h-[44px] w-full"
                  aria-label="Download company brochure"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Brochure</span>
                </button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (navLinks.length + TOOLS_MENU.length + 1) * 0.05 }}
              >
                <a
                  href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`}
                  onClick={() => setOpen(false)}
                  className="mt-2 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold hover:shadow-lg transition-all touch-manipulation min-h-[44px]"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call us now</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
