// Analytics Hooks
import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/lib/analytics';

// Hook to track page views automatically
export function usePageTracking() {
  const location = useLocation();
  const previousPath = useRef<string>('');

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Only track if path actually changed
    if (currentPath !== previousPath.current) {
      analytics.trackPageView(currentPath);
      previousPath.current = currentPath;
    }
  }, [location]);
}

// Hook to track custom events
export function useEventTracker() {
  const trackEvent = useCallback((
    eventName: string,
    eventData?: Record<string, any>,
    elementInfo?: {
      type?: string;
      text?: string;
      x?: number;
      y?: number;
    }
  ) => {
    analytics.trackEvent(eventName, eventData, elementInfo);
  }, []);

  return { trackEvent };
}

// Hook to track scroll depth
export function useScrollTracking() {
  const maxScrollDepth = useRef(0);
  const tracked25 = useRef(false);
  const tracked50 = useRef(false);
  const tracked75 = useRef(false);
  const tracked100 = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercent = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);

      if (scrollPercent > maxScrollDepth.current) {
        maxScrollDepth.current = scrollPercent;
      }

      // Track milestones
      if (scrollPercent >= 25 && !tracked25.current) {
        tracked25.current = true;
        analytics.trackEvent('scroll_depth', { depth: 25 });
      } else if (scrollPercent >= 50 && !tracked50.current) {
        tracked50.current = true;
        analytics.trackEvent('scroll_depth', { depth: 50 });
      } else if (scrollPercent >= 75 && !tracked75.current) {
        tracked75.current = true;
        analytics.trackEvent('scroll_depth', { depth: 75 });
      } else if (scrollPercent >= 100 && !tracked100.current) {
        tracked100.current = true;
        analytics.trackEvent('scroll_depth', { depth: 100 });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return maxScrollDepth.current;
}

// Hook to track clicks
export function useClickTracking(elementRef: React.RefObject<HTMLElement>, eventName: string) {
  const { trackEvent } = useEventTracker();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLElement;
      trackEvent(eventName, {
        type: 'click',
      }, {
        type: target.tagName.toLowerCase(),
        text: target.textContent?.slice(0, 50) || '',
        x: e.clientX,
        y: e.clientY,
      });
    };

    element.addEventListener('click', handleClick);
    return () => element.removeEventListener('click', handleClick);
  }, [elementRef, eventName, trackEvent]);
}

// Hook to get visitor and session IDs
export function useAnalyticsIds() {
  return {
    visitorId: analytics.getVisitorId(),
    sessionId: analytics.getSessionId(),
  };
}
