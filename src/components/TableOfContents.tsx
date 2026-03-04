import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, ChevronDown, ChevronUp } from "lucide-react";

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
  const [isOpen, setIsOpen] = useState(false); // Changed to false for mobile
  const [isHovered, setIsHovered] = useState(false); // For desktop hover
  const [isInBlogSection, setIsInBlogSection] = useState(false); // Track if in blog content area

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
    // Observe blog title to show TOC button only after it scrolls past top
    const articleElement = document.querySelector('.medium-article');
    if (!articleElement) return;

    // Find the main title (h1) in the article
    const blogTitle = articleElement.querySelector('h1');
    if (!blogTitle) return;

    const titleObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Show button when title is NOT intersecting (has scrolled past)
          setIsInBlogSection(!entry.isIntersecting);
        });
      },
      {
        rootMargin: '-80px 0px 0px 0px', // Trigger when title reaches navbar
        threshold: 0
      }
    );

    titleObserver.observe(blogTitle);

    return () => titleObserver.disconnect();
  }, []);


  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
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
      {/* Desktop TOC - Floating Button with Popup (Right Side) - Only visible after title scrolls past */}
      <div className="hidden lg:block">
        <AnimatePresence>
          {isInBlogSection && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20
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

      {/* Mobile TOC - Collapsible (Collapsed by Default) */}
      <div className="lg:hidden mb-8">
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <List className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Table of Contents</h3>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {headings.length}
              </span>
            </div>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <nav className="p-4 pt-0 border-t border-border">
                  <ul className="space-y-1">
                    {headings.map((heading) => (
                      <li key={heading.id}>
                        <button
                          onClick={() => {
                            handleClick(heading.id);
                            setIsOpen(false);
                          }}
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default TableOfContents;
