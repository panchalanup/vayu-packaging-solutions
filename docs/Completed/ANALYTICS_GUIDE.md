# 📊 Advanced Web Analytics - Implementation Guide

## Overview
This document explains the custom web analytics system that tracks user behavior and stores data in Google Sheets without using any third-party analytics tools.

---

## 🎯 What Data is Being Tracked

### 1. **Automatic Tracking** (No code changes needed)
- ✅ **Page Views**: Every page navigation is automatically tracked
- ✅ **Session Data**: User sessions with duration and page count
- ✅ **Performance Metrics**: Page load times, LCP, FCP, INP, CLS, TTFB
- ✅ **Device Information**: Browser, OS, device type, screen size
- ✅ **User Journey**: Complete flow of pages visited in sequence
- ✅ **UTM Parameters**: Campaign tracking (utm_source, utm_medium, utm_campaign)

### 2. **Manual Event Tracking** (Already implemented)
- ✅ **Contact Form**: Submissions, validation errors, success/failure
- ✅ **Export Actions**: CSV downloads, PDF generation
- ✅ **Share Actions**: WhatsApp sharing, email template copying
- ✅ **Scroll Depth**: 25%, 50%, 75%, 100% milestones

---

## 📁 File Structure

```
src/
├── types/
│   └── analytics.ts              # TypeScript interfaces for analytics
├── lib/
│   └── analytics.ts              # Core analytics service (singleton)
├── hooks/
│   └── useAnalytics.ts           # React hooks for tracking
├── contexts/
│   └── AnalyticsContext.tsx      # Analytics provider component
└── App.tsx                        # Analytics provider integration
```

---

## 🔧 How It Works

### **Architecture Flow**

```
User Action → Analytics Hook → Analytics Service → Event Queue → Batch Processor → Google Sheets
                                                                      ↓
                                                            (Every 10 seconds OR 10 events)
```

### **Key Features**

1. **Fingerprinting**: Uses `@fingerprintjs/fingerprintjs` to create unique visitor IDs
2. **Session Management**: 30-minute session timeout with localStorage persistence
3. **Batch Processing**: Events are batched and sent every 10 seconds or when 10 events accumulate
4. **Offline Support**: Events are queued if the network is unavailable
5. **Performance**: Uses `sendBeacon` API for reliable data sending on page exit
6. **Privacy-First**: No cookies, only localStorage for visitor ID

---

## 📊 Google Sheet Structure

Your Google Sheet has **6 tabs** storing different types of data:

### **Tab 1: PageViews**
| Column | Description |
|--------|-------------|
| Timestamp | When the page was viewed |
| Session ID | Unique session identifier |
| Visitor ID | Unique visitor fingerprint |
| Page | Page path (e.g., /about) |
| Referrer | Where the user came from |
| Time on Page (s) | Seconds spent on page |
| Entry Page | First page in session |
| Exit Page | Last page before leaving |
| Device Type | mobile/tablet/desktop |
| Browser | Chrome, Firefox, Safari, etc. |
| OS | Windows, macOS, Android, etc. |
| Screen Size | e.g., 1920x1080 |
| UTM Source | Campaign source |
| UTM Medium | Campaign medium |
| UTM Campaign | Campaign name |

### **Tab 2: Events**
| Column | Description |
|--------|-------------|
| Timestamp | When the event occurred |
| Session ID | Associated session |
| Visitor ID | Who triggered it |
| Page | Where it happened |
| Event Type | Category of event |
| Event Name | Specific event identifier |
| Event Data | JSON with additional details |
| Element Type | HTML element (button, link, etc.) |
| Element Text | Text content of element |
| X Position | Click X coordinate |
| Y Position | Click Y coordinate |

### **Tab 3: Sessions**
| Column | Description |
|--------|-------------|
| Session Start | Session beginning timestamp |
| Session End | Session end timestamp |
| Session ID | Unique identifier |
| Visitor ID | Associated visitor |
| Pages Viewed | Total pages in session |
| Total Duration (s) | Session length in seconds |
| Bounce | true/false (single page visit) |
| Device Type | Device category |
| Browser | Browser name |
| OS | Operating system |
| New/Returning | First-time or returning visitor |
| Country | User location (if available) |
| Language | Browser language |

### **Tab 4: Performance**
| Column | Description |
|--------|-------------|
| Timestamp | Measurement time |
| Session ID | Associated session |
| Page | Page being measured |
| Load Time (ms) | Total page load time |
| FCP (ms) | First Contentful Paint |
| LCP (ms) | Largest Contentful Paint |
| FID (ms) | First Input Delay (now INP) |
| CLS | Cumulative Layout Shift |
| TTI (ms) | Time to Interactive |
| Memory (MB) | JavaScript heap size |
| Connection Type | 3G, 4G, WiFi, etc. |

### **Tab 5: UserJourney**
| Column | Description |
|--------|-------------|
| Session ID | Session identifier |
| Step Number | Sequence in journey |
| Page | Page visited |
| Timestamp | When visited |
| Action | What happened (page_view, etc.) |
| Duration (s) | Time spent |
| Scroll Depth (%) | How far scrolled |
| Clicks | Number of clicks |

### **Tab 6: NewUsers** 🆕
| Column | Description |
|--------|-------------|
| First Visit | When user first visited |
| Visitor ID | Browser fingerprint |
| IP Hash | Hashed IP (privacy-safe) |
| Country | User's country |
| City | User's city |
| Region | State/region |
| Latitude | Geographic coordinate |
| Longitude | Geographic coordinate |
| Timezone | User's timezone |
| ISP | Internet service provider |
| Device Type | mobile/desktop/tablet |
| Browser | Browser name |
| OS | Operating system |
| Screen Size | Device resolution |
| Language | Browser language |
| Referrer | Where they came from |
| Entry Page | First page visited |
| UTM Source | Campaign source |
| UTM Medium | Campaign medium |
| UTM Campaign | Campaign name |

**Note:** This tab tracks unique new users by IP address (hashed for privacy). Each IP hash is logged only once, giving you accurate new user counts. See `IP_TRACKING_GUIDE.md` for detailed information.

---

## 💻 How to Use in Code

### **Automatic Tracking** (Already Working)
Page views are tracked automatically through the `AnalyticsProvider` in `App.tsx`.

### **Track Custom Events**
```typescript
import { useEventTracker } from '@/hooks/useAnalytics';

function MyComponent() {
  const { trackEvent } = useEventTracker();

  const handleClick = () => {
    trackEvent('button_click', {
      buttonName: 'Get Quote',
      location: 'hero_section'
    });
  };

  return <button onClick={handleClick}>Get Quote</button>;
}
```

### **Track Scroll Depth** (Optional)
```typescript
import { useScrollTracking } from '@/hooks/useAnalytics';

function MyPage() {
  useScrollTracking(); // Automatically tracks 25%, 50%, 75%, 100%
  return <div>Your content</div>;
}
```

### **Get Visitor/Session IDs**
```typescript
import { useAnalyticsIds } from '@/hooks/useAnalytics';

function MyComponent() {
  const { visitorId, sessionId } = useAnalyticsIds();
  return <div>Visitor: {visitorId}</div>;
}
```

---

## 📈 Analyzing Your Data

### **Quick Analysis Formulas** (Add to a Dashboard tab)

**Total Unique Visitors (All Time)**
```
=COUNTA(UNIQUE(PageViews!C:C))-1
```

**Total New Users (by IP) 🆕**
```
=COUNTA(NewUsers!B:B)-1
```

**New Users Today 🆕**
```
=COUNTIF(NewUsers!A:A,">="&TEXT(TODAY(),"yyyy-mm-dd"))
```

**New Users This Week 🆕**
```
=COUNTIF(NewUsers!A:A,">="&TEXT(TODAY()-7,"yyyy-mm-dd"))
```

**Total Page Views Today**
```
=COUNTIF(PageViews!A:A,">="&TODAY())
```

**Average Session Duration (minutes)**
```
=AVERAGE(Sessions!F:F)/60
```

**Bounce Rate**
```
=COUNTIF(Sessions!G:G,TRUE)/COUNTA(Sessions!G:G)
```

**Most Popular Pages**
```
=QUERY(PageViews!A:D,"SELECT D, COUNT(D) WHERE D != '' GROUP BY D ORDER BY COUNT(D) DESC LABEL D 'Page', COUNT(D) 'Views'")
```

**Conversion Funnel** (Contact Form Submissions)
```
=COUNTIF(Events!F:F,"contact_form_submit_success")
```

**Device Breakdown**
```
=QUERY(Sessions!A:H,"SELECT H, COUNT(H) WHERE H != '' GROUP BY H ORDER BY COUNT(H) DESC LABEL H 'Device', COUNT(H) 'Sessions'")
```

**Top Referrers**
```
=QUERY(PageViews!A:E,"SELECT E, COUNT(E) WHERE E != '' AND E != '' GROUP BY E ORDER BY COUNT(E) DESC LIMIT 10 LABEL E 'Referrer', COUNT(E) 'Visits'")
```

**New Users by Country 🆕**
```
=QUERY(NewUsers!A:D,"SELECT D, COUNT(D) WHERE D != '' GROUP BY D ORDER BY COUNT(D) DESC LABEL D 'Country', COUNT(D) 'New Users'")
```

**New Users by Traffic Source 🆕**
```
=QUERY(NewUsers!A:S,"SELECT R, COUNT(R) WHERE R != '' GROUP BY R ORDER BY COUNT(R) DESC LABEL R 'UTM Source', COUNT(R) 'New Users'")
```

---

## ⚙️ Configuration

### **Enable/Disable Analytics**
In `src/App.tsx`:
```typescript
<AnalyticsProvider enabled={true} debug={false}>
```

- `enabled`: Set to `false` to disable all tracking
- `debug`: Set to `true` to see console logs for debugging

### **Change Batch Settings**
In `src/lib/analytics.ts` (constructor):
```typescript
this.config = {
  enabled: true,
  debug: false,
  batchSize: 10,          // Send after 10 events
  batchInterval: 10000,   // Or after 10 seconds (in milliseconds)
  endpoint: 'YOUR_GOOGLE_SCRIPT_URL'
};
```

---

## 🔍 Debugging

### **Check if Analytics is Running**
Open browser console and look for:
```
📊 Page View Tracked: {page: "/", sessionId: "...", ...}
📊 Event Tracked: {eventName: "contact_form_submit", ...}
📊 Batch Sent: 5 events
```

### **Check localStorage**
Open DevTools → Application → Local Storage → Check for:
- `analytics_visitor_id`: Your unique visitor ID

### **Check sessionStorage**
Open DevTools → Application → Session Storage → Check for:
- `analytics_session`: Current session data

### **Network Tab**
Check for POST requests to your Google Apps Script URL with batched data.

---

## 🚀 Key Events Being Tracked

### **Contact Form**
- `contact_form_submit_attempt`: When user clicks submit
- `contact_form_validation_error`: When validation fails
- `contact_form_submit_success`: Successful submission
- `contact_form_submit_error`: API or network error

### **Compare/Quote Tool**
- `export_csv`: CSV file downloaded
- `export_pdf`: PDF file downloaded
- `copy_email_template`: Email template copied
- `share_whatsapp`: WhatsApp sharing initiated

### **Engagement**
- `scroll_depth`: User scrolled to 25%, 50%, 75%, or 100%

---

## 📊 Data Insights You Can Extract

1. **User Behavior**
   - Which pages are most visited?
   - Where do users drop off?
   - What's the typical user journey?

2. **Performance Issues**
   - Which pages load slowly?
   - Are there performance problems on mobile?
   - Which browser has the worst performance?

3. **Marketing Effectiveness**
   - Which campaigns drive the most traffic?
   - What's the conversion rate by source?
   - Which referrers provide quality traffic?

4. **Device/Browser Analysis**
   - Mobile vs desktop usage
   - Browser compatibility issues
   - Screen size distribution

5. **Conversion Tracking**
   - Contact form completion rate
   - Export/download engagement
   - Form abandonment points

---

## 🔒 Privacy & Compliance

- ✅ **No Cookies**: Uses localStorage only
- ✅ **Anonymous**: Fingerprinting doesn't collect personal data
- ✅ **Local Storage**: Visitor ID stored locally, not server-side
- ✅ **No Third-Party**: All data goes directly to your Google Sheet
- ✅ **User Control**: Users can clear localStorage to reset tracking

---

## 🛠️ Troubleshooting

### **No Data Appearing in Sheets**

1. **Check Google Apps Script URL** in `src/lib/analytics.ts`
2. **Verify script is deployed** as web app with "Anyone" access
3. **Check browser console** for errors
4. **Test the script** by visiting the URL directly (should show "Analytics API is working!")

### **Duplicate Entries**

- This is normal! Multiple tracking points create comprehensive data
- Page views are tracked on entry AND exit (to capture time on page)

### **Session Not Persisting**

- Sessions expire after 30 minutes of inactivity
- Check if sessionStorage is enabled in browser

---

## 📝 Next Steps

1. ✅ **Test the implementation** by browsing your website
2. ✅ **Check your Google Sheet** for incoming data
3. ✅ **Create a Dashboard tab** with analysis formulas
4. ✅ **Set up Google Data Studio** (optional) for visual dashboards
5. ✅ **Monitor and iterate** based on insights

---

## 📧 Support

If you need to track additional events, use:
```typescript
trackEvent('your_event_name', { key: 'value' });
```

Enjoy your custom analytics system! 🎉
