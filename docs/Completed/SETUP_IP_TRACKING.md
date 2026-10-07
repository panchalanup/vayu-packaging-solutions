# 🚀 Quick Setup: IP-Based New User Tracking

## ✅ What's Been Implemented

Your analytics system now tracks **new users by IP address** with:
- ✅ Privacy-safe IP hashing (SHA-256)
- ✅ Geographic location data (country, city, region)
- ✅ Campaign attribution (UTM parameters)
- ✅ Device and browser information
- ✅ Entry page and referrer tracking
- ✅ Automatic deduplication

---

## 🎯 Quick Setup (3 Steps)

### **Step 1: Update Google Apps Script** ⭐ REQUIRED

1. Open your **Google Sheet** (the one receiving analytics data)
2. Click **Extensions → Apps Script**
3. **Replace ALL code** with the content from `GOOGLE_APPS_SCRIPT_UPDATED.js`
4. Click **💾 Save** (or press Ctrl+S)
5. Click **Deploy → Manage deployments**
6. Click the **✏️ Edit** icon (pencil) on your existing deployment
7. Change version to "**New version**"
8. Click **Deploy**
9. **Done!** The script now handles the NewUsers tab

### **Step 2: Enable Debug Mode** (Optional, for Testing)

Edit `src/config/analytics.ts`:
```typescript
export const ANALYTICS_CONFIG = {
  ENABLED: true,
  DEBUG: true,  // 👈 Set to true to see console logs
  // ... rest of config
};
```

### **Step 3: Test It!**

1. Open your website in an **incognito/private window**
2. Open **DevTools** (F12) → **Console** tab
3. Look for these logs:
   ```
   📍 IP Location Detected: {ipHash: "...", country: "...", city: "..."}
   🆕 New User Tracked: {...}
   📊 Batch Sent: X events
   ```
4. Check your **Google Sheet → NewUsers tab** (it will be auto-created)
5. You should see a new row with your data!

---

## 📊 What Data You'll See

Your Google Sheet will have a new **"NewUsers"** tab with these columns:

| Data Point | Example |
|------------|---------|
| First Visit | 2026-05-03 18:30:45 |
| Visitor ID | abc123xyz456 |
| IP Hash | a1b2c3d4e5f6g7h8 |
| Country | India |
| City | Mumbai |
| Device Type | mobile |
| Browser | Chrome |
| Entry Page | /products |
| UTM Source | facebook |

Each unique IP is logged **only once** - perfect for tracking true new user growth!

---

## 🔍 Verify It's Working

### **Check localStorage**
Open **DevTools → Application → Local Storage** and look for:
- `analytics_visitor_id` - Your visitor fingerprint
- `analytics_ip_hash` - Your hashed IP (added after first visit)
- `analytics_geo_data` - Your location data (JSON)

### **Manual IP Test**
Open browser console and run:
```javascript
fetch('https://ipapi.co/json/')
  .then(r => r.json())
  .then(console.log);
```

Should return your IP, country, city, etc.

---

## 📈 Analyze Your Data

Add these formulas to a "Dashboard" sheet in Google Sheets:

**Total New Users:**
```
=COUNTA(NewUsers!B:B)-1
```

**New Users Today:**
```
=COUNTIF(NewUsers!A:A,">="&TEXT(TODAY(),"yyyy-mm-dd"))
```

**Top Countries:**
```
=QUERY(NewUsers!A:D,"SELECT D, COUNT(D) WHERE D != '' GROUP BY D ORDER BY COUNT(D) DESC LABEL D 'Country', COUNT(D) 'Users'")
```

**Mobile vs Desktop:**
```
=COUNTIF(NewUsers!K:K,"mobile")  // Mobile
=COUNTIF(NewUsers!K:K,"desktop") // Desktop
```

---

## 🛑 Troubleshooting

### **Problem: No NewUsers tab appearing**
✅ **Solution:** Make sure you updated the Google Apps Script (Step 1)

### **Problem: IP Hash is empty or says "unknown"**
✅ **Solution:** 
- Check if `ipapi.co` is accessible in your region
- Try testing manually (see "Manual IP Test" above)
- Wait a few seconds for the API to respond

### **Problem: Duplicate entries**
✅ **Solution:** 
- The script includes deduplication logic
- Make sure you're using the latest `GOOGLE_APPS_SCRIPT_UPDATED.js`

### **Problem: Not seeing console logs**
✅ **Solution:** Enable DEBUG mode in `src/config/analytics.ts`

---

## 📝 Files Modified

These files were updated to add IP tracking:

1. ✅ `src/types/analytics.ts` - Added NewUserData type
2. ✅ `src/lib/analytics.ts` - Added IP detection & tracking
3. ✅ `GOOGLE_APPS_SCRIPT_UPDATED.js` - Added NewUsers tab handler
4. ✅ `ANALYTICS_GUIDE.md` - Updated with NewUsers info
5. ✅ `IP_TRACKING_GUIDE.md` - Detailed implementation guide (NEW)

---

## 🔐 Privacy & Security

✅ **IPs are hashed** using SHA-256 (irreversible)
✅ **No cookies used** - only localStorage
✅ **Free API** - ipapi.co (1000 requests/day)
✅ **GDPR friendly** - anonymous tracking
✅ **User control** - can clear localStorage anytime

---

## 📖 More Information

- **Detailed Guide:** See `IP_TRACKING_GUIDE.md`
- **Analytics Overview:** See `ANALYTICS_GUIDE.md`
- **API Limits:** 1000 new visitors/day (free tier)
- **Alternative APIs:** See IP_TRACKING_GUIDE.md for options

---

## 🎉 That's It!

Your IP-based new user tracking is now active! 

**After deploying:**
- New users are automatically tracked
- Each IP is logged only once
- Location data is included
- No code changes needed in your app

Just update the Google Apps Script and you're good to go! 🚀

---

## ❓ Questions?

1. **How do I test again?** Clear localStorage and reload in incognito
2. **How do I disable it?** Set `ENABLED: false` in `src/config/analytics.ts`
3. **How do I see real-time data?** Keep the Google Sheet open and refresh
4. **How do I export data?** File → Download → CSV in Google Sheets

Happy tracking! 📊✨
