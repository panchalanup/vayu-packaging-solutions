// Analytics Context Provider
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { analytics } from '@/lib/analytics';
import { usePageTracking } from '@/hooks/useAnalytics';

interface AnalyticsContextType {
  trackEvent: (
    eventName: string,
    eventData?: Record<string, any>,
    elementInfo?: {
      type?: string;
      text?: string;
      x?: number;
      y?: number;
    }
  ) => void;
  getVisitorId: () => string | null;
  getSessionId: () => string | null;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
  enabled?: boolean;
  debug?: boolean;
}

export function AnalyticsProvider({ 
  children, 
  enabled = true,
  debug = false 
}: AnalyticsProviderProps) {
  // Auto-track page views
  usePageTracking();

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      analytics.destroy();
    };
  }, []);

  const contextValue: AnalyticsContextType = {
    trackEvent: (eventName, eventData, elementInfo) => {
      analytics.trackEvent(eventName, eventData, elementInfo);
    },
    getVisitorId: () => analytics.getVisitorId(),
    getSessionId: () => analytics.getSessionId(),
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
}
