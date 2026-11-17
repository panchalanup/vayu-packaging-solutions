import { useEffect, useRef, useState } from 'react';

/**
 * True once the element has been visible (and stays true), so an animation can start when it is seen and play once.
 * Without IntersectionObserver, or with reduced motion, it is true straight away so nothing is ever hidden.
 */
export function useInView<T extends HTMLElement>(threshold = 0.35): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen];
}
