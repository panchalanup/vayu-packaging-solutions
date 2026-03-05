import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight, Phone, ChevronDown, Sparkles } from "lucide-react";
import { LOGO_IMAGES } from "@/constants/images";
import { TOOLS_MENU } from "@/constants";

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
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setOpen(false);
    setToolsOpen(false);
  }, [location.pathname]);

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
        </div>

        {/* Call to Action Button */}
        <Link
          to="/contact"
          className="hidden md:inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 lg:px-6 py-2.5 lg:py-3 rounded-full text-sm lg:text-base font-semibold hover:shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-200"
        >
          <Phone className="w-4 h-4" />
          <span>Call us now</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>

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
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.05 }}
              >
                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className="mt-4 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold hover:shadow-lg transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call us now</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
