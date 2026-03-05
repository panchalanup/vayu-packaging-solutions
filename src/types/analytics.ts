// Analytics Type Definitions

export interface VisitorInfo {
  visitorId: string;
  isNewVisitor: boolean;
  ipAddress?: string; // Hashed IP for privacy
  ipHash?: string; // SHA-256 hash of IP
  country?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
}

export interface SessionInfo {
  sessionId: string;
  sessionStart: number;
  pagesViewed: number;
  lastActivity: number;
}

export interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  screenSize: string;
  language: string;
  timezone: string;
}

export interface PageViewData {
  type: 'pageview';
  timestamp: number;
  sessionId: string;
  visitorId: string;
  page: string;
  referrer: string;
  timeOnPage?: number;
  entryPage?: string;
  exitPage?: string;
  deviceType: string;
  browser: string;
  os: string;
  screenSize: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface EventData {
  type: 'event';
  timestamp: number;
  sessionId: string;
  visitorId: string;
  page: string;
  eventType: string;
  eventName: string;
  eventData?: Record<string, any>;
  elementType?: string;
  elementText?: string;
  x?: number;
  y?: number;
}

export interface SessionData {
  type: 'session';
  sessionStart: number;
  sessionEnd?: number;
  sessionId: string;
  visitorId: string;
  pagesViewed: number;
  totalDuration: number;
  bounce: boolean;
  deviceType: string;
  browser: string;
  os: string;
  isNewVisitor: boolean;
  country?: string;
  city?: string;
  language: string;
  ipHash?: string;
}

export interface NewUserData {
  type: 'newuser';
  timestamp: number;
  visitorId: string;
  ipHash: string;
  ipAddress?: string; // Only for debugging, not sent to sheets
  country?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
  deviceType: string;
  browser: string;
  os: string;
  screenSize: string;
  language: string;
  referrer: string;
  entryPage: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface PerformanceData {
  type: 'performance';
  timestamp: number;
  sessionId: string;
  page: string;
  loadTime?: number;
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  tti?: number; // Time to Interactive
  memory?: number;
  connectionType?: string;
}

export interface UserJourneyData {
  type: 'journey';
  sessionId: string;
  stepNumber: number;
  page: string;
  timestamp: number;
  action: string;
  duration: number;
  scrollDepth?: number;
  clicks?: number;
}

export type AnalyticsData = 
  | PageViewData 
  | EventData 
  | SessionData 
  | PerformanceData 
  | UserJourneyData
  | NewUserData;

export interface BatchData {
  type: 'batch';
  items: AnalyticsData[];
}

export interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  batchSize: number;
  batchInterval: number; // in milliseconds
  endpoint: string;
}
