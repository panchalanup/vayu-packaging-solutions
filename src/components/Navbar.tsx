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
  const [isDownloadAnimating, setIsDownloadAnimating] = useState(false);
  const location = useLocation();
  const { trackEvent } = useEventTracker();

  // Close mobile menu when route changes
  useEffect(() => {
    setOpen(false);
    setToolsOpen(false);
  }, [location.pathname]);

  // Handle download with enhanced celebration effect
  const handleDownloadClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent multiple rapid clicks
    if (isDownloadAnimating) return;
    setIsDownloadAnimating(true);

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

    // Optional haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 30, 10]); // Short vibration pattern
    }

    // Get button position for confetti origin
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Mobile optimization - reduce particle count on smaller screens
    const isMobile = window.innerWidth < 768;
    const particleMultiplier = isMobile ? 0.7 : 1;

    if (prefersReducedMotion) {
      // Simple single burst for reduced motion preference
      confetti({
        particleCount: Math.floor(50 * particleMultiplier),
        spread: 60,
        origin: { x, y },
        colors: ['#16a34a', '#15803d', '#22c55e', '#ffd700', '#ffffff'],
      });
    } else {
      // Brand colors with variations
      const colors = ['#16a34a', '#15803d', '#22c55e', '#84cc16', '#ffd700', '#fbbf24', '#ffffff'];
      
      // Stage 1: Inner Core Explosion (Tight, Fast, Bright)
      confetti({
        particleCount: Math.floor(35 * particleMultiplier),
        spread: 30,
        startVelocity: 45,
        origin: { x, y },
        colors: ['#ffd700', '#fbbf24', '#ffffff'],
        scalar: 1.2,
        gravity: 0.8,
        ticks: 180,
        shapes: ['circle', 'square'],
      });

      // Stage 2: Main Burst (Medium spread, Mixed particles)
      setTimeout(() => {
        confetti({
          particleCount: Math.floor(80 * particleMultiplier),
          spread: 70,
          startVelocity: 55,
          origin: { x, y },
          colors: colors,
          scalar: 1.0,
          gravity: 1.0,
          ticks: 200,
          shapes: ['circle', 'square'],
          drift: 0.5,
        });
      }, 80);

      // Stage 3: Outer Wave (Wide spread, Slower)
      setTimeout(() => {
        confetti({
          particleCount: Math.floor(50 * particleMultiplier),
          spread: 120,
          startVelocity: 35,
          origin: { x, y },
          colors: colors,
          scalar: 0.8,
          gravity: 1.1,
          ticks: 220,
          shapes: ['circle', 'square'],
          drift: 1,
        });
      }, 180);

      // Stage 4: Sparkle Trail (Small, Slow floating particles)
      setTimeout(() => {
        confetti({
          particleCount: Math.floor(30 * particleMultiplier),
          spread: 100,
          startVelocity: 25,
          origin: { x, y },
          colors: ['#ffd700', '#ffffff', '#fbbf24'],
          scalar: 0.5,
          gravity: 0.6,
          ticks: 250,
          shapes: ['circle'],
          drift: 0.8,
        });
      }, 300);
    }

    // Trigger download after slight delay to feel the effect
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = '/brochures/Vayu-Packaging-Solutions-Company-Brochure.pdf';
      link.download = 'Vayu-Packaging-Solutions-Brochure.pdf';
      link.click();
      
      // Reset animation state
      setTimeout(() => setIsDownloadAnimating(false), 500);
    }, 100);
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
          
          {/* Download Brochure Button with Enhanced Animation */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={handleDownloadClick}
                  disabled={isDownloadAnimating}
                  className="relative inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 lg:px-5 py-2.5 lg:py-3 rounded-full text-sm lg:text-base font-semibold overflow-hidden touch-manipulation"
                  style={{ touchAction: 'manipulation' }}
                  aria-label="Download company brochure"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 10px 25px rgba(22, 163, 74, 0.3)",
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  animate={isDownloadAnimating ? {
                    scale: [1, 0.95, 1.1, 1],
                    boxShadow: [
                      "0 4px 6px rgba(0, 0, 0, 0.1)",
                      "0 8px 16px rgba(22, 163, 74, 0.2)",
                      "0 12px 30px rgba(22, 163, 74, 0.4)",
                      "0 4px 6px rgba(0, 0, 0, 0.1)",
                    ],
                  } : {}}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut",
                  }}
                >
                  {/* Ripple effect overlay */}
                  {isDownloadAnimating && (
                    <>
                      <motion.span
                        className="absolute inset-0 rounded-full bg-white"
                        initial={{ scale: 0, opacity: 0.6 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                      <motion.span
                        className="absolute inset-0 rounded-full bg-white"
                        initial={{ scale: 0, opacity: 0.4 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                      />
                    </>
                  )}
                  
                  {/* Button content */}
                  <Download className="w-4 h-4 relative z-10" />
                  <span className="hidden lg:inline relative z-10">Brochure</span>
                </motion.button>
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
              
              {/* Download Brochure Button - Mobile with Enhanced Animation */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (navLinks.length + TOOLS_MENU.length) * 0.05 }}
              >
                <motion.button
                  onClick={(e) => {
                    handleDownloadClick(e);
                    setOpen(false);
                  }}
                  disabled={isDownloadAnimating}
                  className="relative mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-full text-sm font-semibold touch-manipulation min-h-[44px] w-full overflow-hidden"
                  style={{ touchAction: 'manipulation' }}
                  aria-label="Download company brochure"
                  whileTap={{
                    scale: 0.95,
                  }}
                  animate={isDownloadAnimating ? {
                    scale: [1, 0.95, 1.1, 1],
                    boxShadow: [
                      "0 4px 6px rgba(0, 0, 0, 0.1)",
                      "0 8px 16px rgba(22, 163, 74, 0.2)",
                      "0 12px 30px rgba(22, 163, 74, 0.4)",
                      "0 4px 6px rgba(0, 0, 0, 0.1)",
                    ],
                  } : {}}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut",
                  }}
                >
                  {/* Ripple effect overlay for mobile */}
                  {isDownloadAnimating && (
                    <>
                      <motion.span
                        className="absolute inset-0 rounded-full bg-white"
                        initial={{ scale: 0, opacity: 0.6 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                      <motion.span
                        className="absolute inset-0 rounded-full bg-white"
                        initial={{ scale: 0, opacity: 0.4 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                      />
                    </>
                  )}
                  
                  {/* Button content */}
                  <Download className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Download Brochure</span>
                </motion.button>
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
