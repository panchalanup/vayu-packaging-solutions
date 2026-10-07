import { useEffect, useRef } from 'react';

/**
 * Reading progress bar (green-600, §9.7). Writes a transform through a ref inside requestAnimationFrame,
 * so scrolling never re-renders React. Purely decorative, so it is hidden from assistive tech.
 */
const ReadingProgress = () => {
  const barRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const ratio = max > 0 ? Math.min(Math.max(scrolled / max, 0), 1) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${ratio})`;
      if (wrapRef.current) wrapRef.current.style.opacity = scrolled > 50 ? '1' : '0';
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-foreground/10 opacity-0 transition-opacity duration-base motion-reduce:transition-none"
    >
      <div ref={barRef} className="h-full origin-left scale-x-0 bg-green-600" />
    </div>
  );
};

export default ReadingProgress;
