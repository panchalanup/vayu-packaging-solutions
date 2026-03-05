// Core Analytics Service
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from 'web-vitals';
import { v4 as uuidv4 } from 'uuid';
import { ANALYTICS_CONFIG } from '@/config/analytics';
import {
  AnalyticsData,
  AnalyticsConfig,
  VisitorInfo,
  SessionInfo,
  DeviceInfo,
  PageViewData,
  EventData,
  SessionData,
  PerformanceData,
  UserJourneyData,
  BatchData,
  NewUserData,
} from '@/types/analytics';

class AnalyticsService {
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsData[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private visitorInfo: VisitorInfo | null = null;
  private sessionInfo: SessionInfo | null = null;
  private deviceInfo: DeviceInfo | null = null;
  private pageStartTime: number = 0;
  private currentPage: string = '';
  private journeyStep: number = 0;
  private performanceMetrics: Partial<PerformanceData> = {};
  private entryPage: string = '';

  constructor(config: Partial<AnalyticsConfig> = {}) {
    // Use centralized config from src/config/analytics.ts
    this.config = {
      enabled: ANALYTICS_CONFIG.ENABLED,
      debug: ANALYTICS_CONFIG.DEBUG,
      batchSize: ANALYTICS_CONFIG.BATCH_SIZE,
      batchInterval: ANALYTICS_CONFIG.BATCH_INTERVAL,
      endpoint: ANALYTICS_CONFIG.ENDPOINT,
      ...config,
    };

    // Only initialize if analytics is enabled
    if (this.config.enabled) {
      this.initialize();
    } else if (this.config.debug) {
      console.log('📊 Analytics is DISABLED via config');
    }
  }

  private async initialize() {
    await this.initializeVisitor();
    this.initializeSession();      // Must be before fetchIPLocation
    this.initializeDevice();       // Must be before fetchIPLocation
    await this.fetchIPLocation();  // Now session & device are ready for trackNewUser
    this.setupWebVitals();
    this.setupBeforeUnload();
    this.startBatchTimer();
  }

  private async initializeVisitor() {
    try {
      // Try to get existing visitor ID and IP hash
      const storedVisitorId = localStorage.getItem('analytics_visitor_id');
      const storedIPHash = localStorage.getItem('analytics_ip_hash');
      const storedGeoData = localStorage.getItem('analytics_geo_data');
      
      if (storedVisitorId) {
        this.visitorInfo = {
          visitorId: storedVisitorId,
          isNewVisitor: false,
          ipHash: storedIPHash || undefined,
        };
        
        // Restore geolocation data if available
        if (storedGeoData) {
          try {
            const geoData = JSON.parse(storedGeoData);
            this.visitorInfo = { ...this.visitorInfo, ...geoData };
          } catch (e) {
            // Ignore parsing errors
          }
        }
      } else {
        // Generate fingerprint for new visitor
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const visitorId = result.visitorId;
        
        localStorage.setItem('analytics_visitor_id', visitorId);
        
        this.visitorInfo = {
          visitorId,
          isNewVisitor: true,
        };
      }
    } catch (error) {
      console.error('Error initializing visitor:', error);
      // Fallback to UUID
      const fallbackId = uuidv4();
      localStorage.setItem('analytics_visitor_id', fallbackId);
      this.visitorInfo = {
        visitorId: fallbackId,
        isNewVisitor: true,
      };
    }
  }

  private async fetchIPLocation() {
    // Only fetch if we don't have IP data stored
    const storedIPHash = localStorage.getItem('analytics_ip_hash');
    if (storedIPHash || !this.visitorInfo) {
      return;
    }

    try {
      // Use ipapi.co free API (1000 requests/day, no key needed)
      // Alternative: https://api.ipify.org?format=json (IP only, no limits)
      const response = await fetch('https://ipapi.co/json/', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch IP data');
      }

      const data = await response.json();

      // Hash the IP address for privacy (SHA-256)
      const ipHash = await this.hashIP(data.ip);

      // Store IP hash and location data
      localStorage.setItem('analytics_ip_hash', ipHash);
      
      const geoData = {
        country: data.country_name,
        city: data.city,
        region: data.region,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        isp: data.org,
      };
      
      localStorage.setItem('analytics_geo_data', JSON.stringify(geoData));

      // Update visitor info
      this.visitorInfo = {
        ...this.visitorInfo,
        ipHash,
        ...geoData,
      };

      // Track new user if this is their first visit
      if (this.visitorInfo.isNewVisitor) {
        this.trackNewUser(data.ip);
      }

      if (this.config.debug) {
        console.log('📍 IP Location Detected:', {
          ipHash,
          country: data.country_name,
          city: data.city,
        });
      }
    } catch (error) {
      if (this.config.debug) {
        console.warn('⚠️ Could not fetch IP location:', error);
      }
      // Continue without IP data - not critical for analytics
    }
  }

  private async hashIP(ip: string): Promise<string> {
    // Hash IP using SHA-256 for privacy
    const encoder = new TextEncoder();
    const data = encoder.encode(ip);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, 16); // Use first 16 chars for shorter storage
  }

  private trackNewUser(ipAddress?: string) {
    if (!this.visitorInfo || !this.sessionInfo || !this.deviceInfo) {
      return;
    }

    // Extract UTM parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    const newUserData: NewUserData = {
      type: 'newuser',
      timestamp: Date.now(),
      visitorId: this.visitorInfo.visitorId,
      ipHash: this.visitorInfo.ipHash || 'unknown',
      country: this.visitorInfo.country,
      city: this.visitorInfo.city,
      region: this.visitorInfo.region,
      latitude: this.visitorInfo.latitude,
      longitude: this.visitorInfo.longitude,
      timezone: this.visitorInfo.timezone,
      isp: this.visitorInfo.isp,
      deviceType: this.deviceInfo.deviceType,
      browser: this.deviceInfo.browser,
      os: this.deviceInfo.os,
      screenSize: this.deviceInfo.screenSize,
      language: this.deviceInfo.language,
      referrer: document.referrer,
      entryPage: window.location.pathname,
      utmSource: urlParams.get('utm_source') || undefined,
      utmMedium: urlParams.get('utm_medium') || undefined,
      utmCampaign: urlParams.get('utm_campaign') || undefined,
    };

    this.queueEvent(newUserData);

    if (this.config.debug) {
      console.log('🆕 New User Tracked:', newUserData);
    }
  }

  private initializeSession() {
    const storedSession = sessionStorage.getItem('analytics_session');
    const now = Date.now();

    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        // Check if session is still valid (within 30 minutes of last activity)
        if (now - session.lastActivity < 30 * 60 * 1000) {
          this.sessionInfo = session;
          this.sessionInfo!.lastActivity = now;
          this.entryPage = session.entryPage || window.location.pathname;
        } else {
          // Session expired, create new one
          this.createNewSession();
        }
      } catch {
        this.createNewSession();
      }
    } else {
      this.createNewSession();
    }

    this.saveSession();
  }

  private createNewSession() {
    this.sessionInfo = {
      sessionId: uuidv4(),
      sessionStart: Date.now(),
      pagesViewed: 0,
      lastActivity: Date.now(),
    };
    this.entryPage = window.location.pathname;
    this.journeyStep = 0;
  }

  private saveSession() {
    if (this.sessionInfo) {
      sessionStorage.setItem('analytics_session', JSON.stringify({
        ...this.sessionInfo,
        entryPage: this.entryPage,
      }));
    }
  }

  private initializeDevice() {
    const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
      const width = window.innerWidth;
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      return 'desktop';
    };

    const getBrowser = (): string => {
      const ua = navigator.userAgent;
      if (ua.includes('Firefox')) return 'Firefox';
      if (ua.includes('Chrome')) return 'Chrome';
      if (ua.includes('Safari')) return 'Safari';
      if (ua.includes('Edge')) return 'Edge';
      return 'Other';
    };

    const getOS = (): string => {
      const ua = navigator.userAgent;
      if (ua.includes('Windows')) return 'Windows';
      if (ua.includes('Mac')) return 'macOS';
      if (ua.includes('Linux')) return 'Linux';
      if (ua.includes('Android')) return 'Android';
      if (ua.includes('iOS')) return 'iOS';
      return 'Other';
    };

    this.deviceInfo = {
      deviceType: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      screenSize: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  private setupWebVitals() {
    const handleMetric = (metric: Metric) => {
      if (!this.performanceMetrics.page) {
        this.performanceMetrics.page = this.currentPage;
      }

      switch (metric.name) {
        case 'CLS':
          this.performanceMetrics.cls = metric.value;
          break;
        case 'FCP':
          this.performanceMetrics.fcp = metric.value;
          break;
        case 'INP':
          this.performanceMetrics.fid = metric.value;
          break;
        case 'LCP':
          this.performanceMetrics.lcp = metric.value;
          break;
        case 'TTFB':
          this.performanceMetrics.tti = metric.value;
          break;
      }
    };

    onCLS(handleMetric);
    onFCP(handleMetric);
    onINP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
  }

  private setupBeforeUnload() {
    window.addEventListener('beforeunload', () => {
      this.trackPageExit();
      this.trackSessionEnd();
      this.flushQueue(true); // Force synchronous send
    });
  }

  private startBatchTimer() {
    this.batchTimer = setInterval(() => {
      this.flushQueue();
    }, this.config.batchInterval);
  }

  public trackPageView(page?: string) {
    if (!this.config.enabled || !this.visitorInfo || !this.sessionInfo || !this.deviceInfo) {
      return;
    }

    // Track exit from previous page
    if (this.currentPage) {
      this.trackPageExit();
    }

    const currentPage = page || window.location.pathname;
    this.currentPage = currentPage;
    this.pageStartTime = Date.now();
    
    // Update session
    this.sessionInfo.pagesViewed++;
    this.sessionInfo.lastActivity = Date.now();
    this.saveSession();

    // Extract UTM parameters
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source') || undefined;
    const utmMedium = urlParams.get('utm_medium') || undefined;
    const utmCampaign = urlParams.get('utm_campaign') || undefined;

    const pageViewData: PageViewData = {
      type: 'pageview',
      timestamp: Date.now(),
      sessionId: this.sessionInfo.sessionId,
      visitorId: this.visitorInfo.visitorId,
      page: currentPage,
      referrer: document.referrer,
      entryPage: this.entryPage,
      deviceType: this.deviceInfo.deviceType,
      browser: this.deviceInfo.browser,
      os: this.deviceInfo.os,
      screenSize: this.deviceInfo.screenSize,
      utmSource,
      utmMedium,
      utmCampaign,
    };

    this.queueEvent(pageViewData);
    
    // Track journey step
    this.trackJourneyStep('page_view');
    
    // Track performance after load
    setTimeout(() => {
      this.trackPerformance();
    }, 2000);

    if (this.config.debug) {
      console.log('📊 Page View Tracked:', pageViewData);
    }
  }

  private trackPageExit() {
    if (!this.currentPage || !this.pageStartTime) return;

    const timeOnPage = Math.round((Date.now() - this.pageStartTime) / 1000);

    const exitData: Partial<PageViewData> = {
      type: 'pageview',
      timestamp: Date.now(),
      sessionId: this.sessionInfo!.sessionId,
      visitorId: this.visitorInfo!.visitorId,
      page: this.currentPage,
      timeOnPage,
      exitPage: this.currentPage,
      referrer: '',
      deviceType: this.deviceInfo!.deviceType,
      browser: this.deviceInfo!.browser,
      os: this.deviceInfo!.os,
      screenSize: this.deviceInfo!.screenSize,
    };

    this.queueEvent(exitData as PageViewData);
  }

  public trackEvent(eventName: string, eventData?: Record<string, any>, elementInfo?: {
    type?: string;
    text?: string;
    x?: number;
    y?: number;
  }) {
    if (!this.config.enabled || !this.visitorInfo || !this.sessionInfo) {
      return;
    }

    const event: EventData = {
      type: 'event',
      timestamp: Date.now(),
      sessionId: this.sessionInfo.sessionId,
      visitorId: this.visitorInfo.visitorId,
      page: this.currentPage,
      eventType: eventData?.type || 'custom',
      eventName,
      eventData,
      elementType: elementInfo?.type,
      elementText: elementInfo?.text,
      x: elementInfo?.x,
      y: elementInfo?.y,
    };

    this.queueEvent(event);

    if (this.config.debug) {
      console.log('📊 Event Tracked:', event);
    }
  }

  private trackPerformance() {
    if (!this.sessionInfo || !this.performanceMetrics.page) return;

    const performance = window.performance;
    const timing = performance.timing;
    const memory = (performance as any).memory;

    const loadTime = timing.loadEventEnd - timing.navigationStart;
    const connection = (navigator as any).connection;

    const perfData: PerformanceData = {
      type: 'performance',
      timestamp: Date.now(),
      sessionId: this.sessionInfo.sessionId,
      page: this.currentPage,
      loadTime,
      fcp: this.performanceMetrics.fcp,
      lcp: this.performanceMetrics.lcp,
      fid: this.performanceMetrics.fid,
      cls: this.performanceMetrics.cls,
      tti: this.performanceMetrics.tti,
      memory: memory ? Math.round(memory.usedJSHeapSize / 1048576) : undefined,
      connectionType: connection?.effectiveType,
    };

    this.queueEvent(perfData);

    if (this.config.debug) {
      console.log('📊 Performance Tracked:', perfData);
    }
  }

  private trackJourneyStep(action: string, scrollDepth?: number, clicks?: number) {
    if (!this.sessionInfo) return;

    this.journeyStep++;
    const duration = this.pageStartTime ? Math.round((Date.now() - this.pageStartTime) / 1000) : 0;

    const journeyData: UserJourneyData = {
      type: 'journey',
      sessionId: this.sessionInfo.sessionId,
      stepNumber: this.journeyStep,
      page: this.currentPage,
      timestamp: Date.now(),
      action,
      duration,
      scrollDepth,
      clicks,
    };

    this.queueEvent(journeyData);
  }

  private trackSessionEnd() {
    if (!this.sessionInfo || !this.visitorInfo || !this.deviceInfo) return;

    const duration = Math.round((Date.now() - this.sessionInfo.sessionStart) / 1000);
    const bounce = this.sessionInfo.pagesViewed <= 1;

    const sessionData: SessionData = {
      type: 'session',
      sessionStart: this.sessionInfo.sessionStart,
      sessionEnd: Date.now(),
      sessionId: this.sessionInfo.sessionId,
      visitorId: this.visitorInfo.visitorId,
      pagesViewed: this.sessionInfo.pagesViewed,
      totalDuration: duration,
      bounce,
      deviceType: this.deviceInfo.deviceType,
      browser: this.deviceInfo.browser,
      os: this.deviceInfo.os,
      isNewVisitor: this.visitorInfo.isNewVisitor,
      country: this.visitorInfo.country,
      city: this.visitorInfo.city,
      language: this.deviceInfo.language,
      ipHash: this.visitorInfo.ipHash,
    };

    this.queueEvent(sessionData);
  }

  private queueEvent(event: AnalyticsData) {
    this.eventQueue.push(event);

    // Check if we should flush immediately
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flushQueue();
    }
  }

  private async flushQueue(sync = false) {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    const batchData: BatchData = {
      type: 'batch',
      items: events,
    };

    try {
      if (this.config.debug) {
        console.log('📊 Sending Batch:', events.length, 'events');
        console.log('📊 Endpoint:', this.config.endpoint);
        console.log('📊 Data:', batchData);
      }

      // Use fetch with no-cors mode (same as contact form)
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchData),
      });

      if (this.config.debug) {
        console.log('✅ Batch Sent Successfully!', events.length, 'events');
      }
    } catch (error) {
      console.error('❌ Failed to send analytics:', error);
      if (this.config.debug) {
        console.error('Failed data:', batchData);
      }
      // Re-queue events on failure
      this.eventQueue.unshift(...events);
    }
  }

  public destroy() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }
    this.flushQueue(true);
  }

  // Public API
  public getVisitorId(): string | null {
    return this.visitorInfo?.visitorId || null;
  }

  public getSessionId(): string | null {
    return this.sessionInfo?.sessionId || null;
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();
export default AnalyticsService;
