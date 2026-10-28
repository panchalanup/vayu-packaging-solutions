import { useEffect, useRef, useState, type ReactNode } from 'react';

interface LazyOnViewProps {
  children: ReactNode;
  className?: string;
  /** How far before the viewport the children start loading */
  rootMargin?: string;
}

/**
 * Renders its children only once the block is about to scroll into view. Use it around heavy, below-the-fold
 * components (with a lazy() import inside) so their code is not downloaded or run during the first load.
 * Give `className` a min-height so the page does not jump when the content appears. Without IntersectionObserver the
 * children render immediately.
 */
export function LazyOnView({ children, className, rootMargin = '600px 0px' }: LazyOnViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    if (show) return undefined;
    const el = ref.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [show, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {show ? children : null}
    </div>
  );
}
