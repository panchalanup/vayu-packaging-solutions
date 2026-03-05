import { useEffect, useState } from 'react';

const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / documentHeight) * 100;

      // Update progress
      setProgress(Math.min(progress, 100));

      // Show bar only when scrolled past 50px
      setIsVisible(scrolled > 50);
    };

    // Add scroll listener with passive flag for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial calculation
    handleScroll();

    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] h-1 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ pointerEvents: 'none' }}
    >
      {/* Background track */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 opacity-20" />
      
      {/* Progress bar with gradient */}
      <div
        className="h-full bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#667eea] shadow-lg transition-all duration-100 ease-out relative"
        style={{
          width: `${progress}%`,
          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.5), 0 0 12px rgba(118, 75, 162, 0.3)',
        }}
      >
        {/* Glow effect at the end */}
        <div 
          className="absolute right-0 top-0 h-full w-8 bg-gradient-to-r from-transparent to-white opacity-40"
          style={{
            filter: 'blur(4px)',
          }}
        />
      </div>
    </div>
  );
};

export default ReadingProgress;
