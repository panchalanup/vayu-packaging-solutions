/**
 * ========================================
 * ANALYTICS CONFIGURATION
 * ========================================
 * 
 * Master control for web analytics system.
 * Change ENABLED to false to completely disable analytics.
 */

export const ANALYTICS_CONFIG = {
  /**
   * MASTER SWITCH - Set to false to disable ALL analytics
   * 
   * When FALSE:
   * - No data collection
   * - No API calls to Google Sheets
   * - No fingerprinting
   * - No localStorage usage
   * - Zero performance impact
   * 
   * When TRUE:
   * - Full analytics enabled
   * - Tracks page views, events, performance
   * - Sends data to Google Sheets
   */
  ENABLED: true,  // 👈 Change to false to turn OFF analytics

  /**
   * DEBUG MODE - Shows console logs
   * 
   * Set to true to see detailed tracking logs in browser console.
   * Useful for development and troubleshooting.
   * 
   * Recommended: false for production, true for development
   */
  DEBUG: false,  // 👈 Change to true to see console logs

  /**
   * GOOGLE SHEETS ENDPOINT
   * 
   * The deployed Google Apps Script URL that receives analytics data.
   * Update this if you deploy a new version of the script.
   */
  ENDPOINT: 'https://script.google.com/macros/s/AKfycbyef43VWVnHxANmIzFfQH_zWmwPrH76cCnSYY_zIv10EEqN_ivMTpQRI3dGFa_CEme9kw/exec',

  /**
   * BATCH SIZE
   * 
   * Number of events to collect before sending to server.
   * Lower = more frequent updates, higher = fewer API calls.
   * 
   * Default: 10 events
   */
  BATCH_SIZE: 10,

  /**
   * BATCH INTERVAL (milliseconds)
   * 
   * Time to wait before sending queued events.
   * Events are sent when EITHER batch size OR interval is reached.
   * 
   * Default: 10000 (10 seconds)
   */
  BATCH_INTERVAL: 10000,
} as const;

/**
 * Quick Reference:
 * 
 * To disable analytics:
 *   ENABLED: false
 * 
 * To enable debug logs:
 *   DEBUG: true
 * 
 * To change Google Sheet:
 *   ENDPOINT: 'your-new-url'
 */
