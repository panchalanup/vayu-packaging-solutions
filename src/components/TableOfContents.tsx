import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List } from "lucide-react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

const TableOfContents = ({ content }: TableOfContentsProps) => {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isHovered, setIsHovered] = useState(false); // For desktop hover
  const [isInBlogSection, setIsInBlogSection] = useState(false); // Track if featured image has crossed the top trigger

  useEffect(() => {
    // Extract headings from markdown content
    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    const matches = Array.from(content.matchAll(headingRegex));
    
    const tocItems: TOCItem[] = matches.map((match, index) => {
      const level = match[1].length; // Number of # symbols
      const text = match[2].trim();
      const id = `heading-${index}`;
      return { id, text, level };
    });

    setHeadings(tocItems);
  }, [content]);

  useEffect(() => {
    // Add IDs to headings in the DOM and setup intersection observer
    const articleElement = document.querySelector('.medium-article');
    if (!articleElement) return;

    const allHeadings = articleElement.querySelectorAll('h2, h3');
    allHeadings.forEach((heading, index) => {
      heading.id = `heading-${index}`;
    });

    // Setup Intersection Observer for active heading
    const observerOptions = {
      rootMargin: '-100px 0px -66%',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    allHeadings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [headings]);

  useEffect(() => {
    // Show TOC button only after the featured image reaches the top trigger area
    const updateTOCVisibility = () => {
      const featuredImage = document.querySelector('.blog-featured-image-wrapper');
      if (!featuredImage) {
        setIsInBlogSection(false);
        return;
      }

      const navbar = document.querySelector('nav');
      const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 80;
      const featuredImageTop = featuredImage.getBoundingClientRect().top;

      setIsInBlogSection(featuredImageTop <= navbarHeight);
    };

    updateTOCVisibility();
    window.addEventListener('scroll', updateTOCVisibility, { passive: true });
    window.addEventListener('resize', updateTOCVisibility);

    return () => {
      window.removeEventListener('scroll', updateTOCVisibility);
      window.removeEventListener('resize', updateTOCVisibility);
    };
  }, [content]);


  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Dynamically calculate navbar height for responsive offset
      const navbar = document.querySelector('nav');
      const navbarHeight = navbar ? navbar.offsetHeight : 80;
      
      // Add extra spacing for better UX (20px on mobile, 30px on desktop)
      const extraSpacing = window.innerWidth < 768 ? 20 : 30;
      const offset = navbarHeight + extraSpacing;
      
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (headings.length === 0) return null;

  return (
    <>
      {/* Desktop TOC - Floating Button with Popup (Right Side) - Only visible after featured image reaches the top */}
      <div className="hidden lg:block">
        <AnimatePresence>
          {isInBlogSection && (
            <motion.div
              initial={{ opacity: 0, x: 72, scale: 0.82 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 56, scale: 0.9 }}
              transition={{ 
                type: "spring",
                stiffness: 420,
                damping: 22,
                mass: 0.7
              }}
              className="fixed right-4 top-24 z-40"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Floating Button - Bubble Style with Horizontal Lines */}
              <motion.button
                className="w-12 h-12 rounded-full bg-card border-2 border-border shadow-lg flex flex-col items-center justify-center gap-1.5 hover:border-primary hover:bg-primary/5 transition-all group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Table of Contents"
              >
                {/* Three horizontal lines */}
                <span className="w-5 h-0.5 bg-foreground rounded-full group-hover:bg-primary transition-colors"></span>
                <span className="w-5 h-0.5 bg-foreground rounded-full group-hover:bg-primary transition-colors"></span>
                <span className="w-5 h-0.5 bg-foreground rounded-full group-hover:bg-primary transition-colors"></span>
              </motion.button>

              {/* Popup TOC - Opens to the LEFT of button with fixed height from top */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-0 right-[calc(100%+12px)] w-[280px] max-w-[calc(100vw-100px)]"
                    style={{ 
                      height: 'calc(100vh - 140px)',
                    }}
                  >
                    <div className="bg-card border border-border rounded-xl p-5 shadow-2xl h-full flex flex-col">
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border flex-shrink-0">
                        <List className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">Table of Contents</h3>
                        <span className="ml-auto text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                          {headings.length}
                        </span>
                      </div>
                      <nav className="overflow-y-auto pr-2 flex-1 min-h-0">
                        <ul className="space-y-1">
                          {headings.map((heading) => (
                            <li key={heading.id}>
                              <button
                                onClick={() => handleClick(heading.id)}
                                className={`text-left w-full text-sm transition-all hover:text-primary rounded-md px-3 py-2 ${
                                  heading.level === 3 ? 'pl-6' : ''
                                } ${
                                  activeId === heading.id
                                    ? 'text-primary font-semibold bg-primary/10'
                                    : 'text-muted-foreground hover:bg-secondary/50'
                                }`}
                              >
                                {heading.text}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </>
  );
};

export default TableOfContents;
