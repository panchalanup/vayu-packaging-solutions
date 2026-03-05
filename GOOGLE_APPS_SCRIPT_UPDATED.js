/**
 * ========================================
 * VAYU PACKAGING ANALYTICS - GOOGLE APPS SCRIPT
 * ========================================
 * 
 * Updated version with NewUsers tab for IP-based tracking
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets
 * 2. Extensions > Apps Script
 * 3. Replace all code with this script
 * 4. Click "Deploy" > "New deployment"
 * 5. Select "Web app"
 * 6. Execute as: "Me"
 * 7. Who has access: "Anyone"
 * 8. Copy the deployment URL
 * 9. Update src/config/analytics.ts with the URL
 */

// Main entry point for POST requests
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.type === 'batch') {
      processBatch(data.items);
    } else {
      processEvent(data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Data received'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function for GET requests
function doGet() {
  return ContentService.createTextOutput('Analytics API is working! Use POST to send data.');
}

// Process batch of events
function processBatch(items) {
  items.forEach(item => {
    processEvent(item);
  });
}

// Route events to appropriate handlers
function processEvent(data) {
  switch(data.type) {
    case 'pageview':
      logPageView(data);
      break;
    case 'event':
      logEvent(data);
      break;
    case 'session':
      logSession(data);
      break;
    case 'performance':
      logPerformance(data);
      break;
    case 'journey':
      logJourney(data);
      break;
    case 'newuser':
      logNewUser(data);
      break;
    default:
      Logger.log('Unknown event type: ' + data.type);
  }
}

// Get or create sheet
function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

// Format timestamp
function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata'
  });
}

// Log PageView
function logPageView(data) {
  const sheet = getOrCreateSheet('PageViews', [
    'Timestamp', 'Session ID', 'Visitor ID', 'Page', 'Referrer', 
    'Time on Page (s)', 'Entry Page', 'Exit Page', 'Device Type', 
    'Browser', 'OS', 'Screen Size', 'UTM Source', 'UTM Medium', 'UTM Campaign'
  ]);
  
  sheet.appendRow([
    formatTimestamp(data.timestamp),
    data.sessionId,
    data.visitorId,
    data.page,
    data.referrer || '',
    data.timeOnPage || '',
    data.entryPage || '',
    data.exitPage || '',
    data.deviceType,
    data.browser,
    data.os,
    data.screenSize,
    data.utmSource || '',
    data.utmMedium || '',
    data.utmCampaign || ''
  ]);
}

// Log Event
function logEvent(data) {
  const sheet = getOrCreateSheet('Events', [
    'Timestamp', 'Session ID', 'Visitor ID', 'Page', 'Event Type', 
    'Event Name', 'Event Data', 'Element Type', 'Element Text', 'X Position', 'Y Position'
  ]);
  
  sheet.appendRow([
    formatTimestamp(data.timestamp),
    data.sessionId,
    data.visitorId,
    data.page,
    data.eventType,
    data.eventName,
    JSON.stringify(data.eventData || {}),
    data.elementType || '',
    data.elementText || '',
    data.x || '',
    data.y || ''
  ]);
}

// Log Session
function logSession(data) {
  const sheet = getOrCreateSheet('Sessions', [
    'Session Start', 'Session End', 'Session ID', 'Visitor ID', 
    'Pages Viewed', 'Total Duration (s)', 'Bounce', 'Device Type', 
    'Browser', 'OS', 'New/Returning', 'Country', 'City', 'Language', 'IP Hash'
  ]);
  
  sheet.appendRow([
    formatTimestamp(data.sessionStart),
    data.sessionEnd ? formatTimestamp(data.sessionEnd) : '',
    data.sessionId,
    data.visitorId,
    data.pagesViewed,
    data.totalDuration,
    data.bounce,
    data.deviceType,
    data.browser,
    data.os,
    data.isNewVisitor ? 'New' : 'Returning',
    data.country || '',
    data.city || '',
    data.language,
    data.ipHash || ''
  ]);
}

// Log Performance
function logPerformance(data) {
  const sheet = getOrCreateSheet('Performance', [
    'Timestamp', 'Session ID', 'Page', 'Load Time (ms)', 
    'FCP (ms)', 'LCP (ms)', 'FID (ms)', 'CLS', 'TTI (ms)', 
    'Memory (MB)', 'Connection Type'
  ]);
  
  sheet.appendRow([
    formatTimestamp(data.timestamp),
    data.sessionId,
    data.page,
    data.loadTime || '',
    data.fcp || '',
    data.lcp || '',
    data.fid || '',
    data.cls || '',
    data.tti || '',
    data.memory || '',
    data.connectionType || ''
  ]);
}

// Log User Journey
function logJourney(data) {
  const sheet = getOrCreateSheet('UserJourney', [
    'Session ID', 'Step Number', 'Page', 'Timestamp', 
    'Action', 'Duration (s)', 'Scroll Depth (%)', 'Clicks'
  ]);
  
  sheet.appendRow([
    data.sessionId,
    data.stepNumber,
    data.page,
    formatTimestamp(data.timestamp),
    data.action,
    data.duration,
    data.scrollDepth || '',
    data.clicks || ''
  ]);
}

// Log New User (NEW!)
function logNewUser(data) {
  const sheet = getOrCreateSheet('NewUsers', [
    'First Visit', 'Visitor ID', 'IP Hash', 'Country', 'City', 
    'Region', 'Latitude', 'Longitude', 'Timezone', 'ISP',
    'Device Type', 'Browser', 'OS', 'Screen Size', 'Language',
    'Referrer', 'Entry Page', 'UTM Source', 'UTM Medium', 'UTM Campaign'
  ]);
  
  // Check if this IP hash already exists to avoid duplicates
  const existingData = sheet.getDataRange().getValues();
  const ipHashColumn = 2; // IP Hash is in column 3 (index 2)
  
  for (let i = 1; i < existingData.length; i++) {
    if (existingData[i][ipHashColumn] === data.ipHash) {
      Logger.log('IP Hash already exists, skipping duplicate: ' + data.ipHash);
      return; // Skip duplicate
    }
  }
  
  // Add new user record
  sheet.appendRow([
    formatTimestamp(data.timestamp),
    data.visitorId,
    data.ipHash,
    data.country || '',
    data.city || '',
    data.region || '',
    data.latitude || '',
    data.longitude || '',
    data.timezone || '',
    data.isp || '',
    data.deviceType,
    data.browser,
    data.os,
    data.screenSize,
    data.language,
    data.referrer || '',
    data.entryPage,
    data.utmSource || '',
    data.utmMedium || '',
    data.utmCampaign || ''
  ]);
  
  Logger.log('New user tracked: ' + data.ipHash);
}

/**
 * ========================================
 * HELPER FUNCTIONS FOR DATA ANALYSIS
 * ========================================
 * 
 * Use these in a separate "Dashboard" sheet to analyze your data
 */

// Count unique new users by IP hash
function countUniqueNewUsers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('NewUsers');
  
  if (!sheet) return 0;
  
  const data = sheet.getDataRange().getValues();
  return data.length - 1; // Subtract header row
}

// Get new users by country
function getNewUsersByCountry() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('NewUsers');
  
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const countries = {};
  
  for (let i = 1; i < data.length; i++) {
    const country = data[i][3]; // Country column
    countries[country] = (countries[country] || 0) + 1;
  }
  
  return countries;
}

// Get new users today
function getNewUsersToday() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('NewUsers');
  
  if (!sheet) return 0;
  
  const data = sheet.getDataRange().getValues();
  const today = new Date().toDateString();
  let count = 0;
  
  for (let i = 1; i < data.length; i++) {
    const timestamp = new Date(data[i][0]);
    if (timestamp.toDateString() === today) {
      count++;
    }
  }
  
  return count;
}
