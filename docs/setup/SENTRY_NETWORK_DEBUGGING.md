# Sentry Network Request Debugging Guide

**Last Updated:** 2025-11-29

## 🔍 What to Look For in Network Panel

### Network Request Details

**Filter:** Type `sentry.io` in the Network tab filter box

**Expected Requests:**

1. **Initial Handshake (on page load)**
   - **URL Pattern:** `https://<org>.ingest.sentry.io/api/<project-id>/envelope/`
   - **Method:** `POST`
   - **Status:** `200 OK`
   - **When:** Immediately after page loads (if Sentry is initialized)
   - **Payload:** Initial session data, SDK info, environment

2. **Error Reports (when errors occur)**
   - **URL Pattern:** `https://<org>.ingest.sentry.io/api/<project-id>/envelope/`
   - **Method:** `POST`
   - **Status:** `200 OK`
   - **When:** An error is thrown or captured
   - **Payload:** Error details, stack trace, context

3. **Performance Transactions (based on sampling)**
   - **URL Pattern:** `https://<org>.ingest.sentry.io/api/<project-id>/envelope/`
   - **Method:** `POST`
   - **Status:** `200 OK`
   - **When:** User interactions, page navigation, API calls
   - **Payload:** Performance spans, transaction data

4. **Session Replays (based on sampling)**
   - **URL Pattern:** `https://<org>.ingest.sentry.io/api/<project-id>/envelope/`
   - **Method:** `POST`
   - **Status:** `200 OK`
   - **When:** User interactions (clicks, navigation)
   - **Payload:** Replay data (masked for privacy)

## 📍 Where to Be in the App

### Option 1: Any Page (Initialization Check)

**Location:** Any page after app loads (Dashboard, Budget, Transactions, etc.)

**What to Check:**

1. Open DevTools → Network tab
2. Filter by `sentry.io`
3. Refresh the page (F5 or Cmd+R)
4. Look for POST requests immediately after page load

**Expected:** At least 1 POST request within 1-2 seconds of page load

### Option 2: Trigger a Test Error

**Location:** Any page (Dashboard is easiest)

**Steps:**

1. Open DevTools → Network tab
2. Filter by `sentry.io`
3. Open Console tab
4. Run: `throw new Error("Test Sentry error")`
5. Check Network tab for new POST request

**Expected:** A new POST request appears within 1-2 seconds

### Option 3: Navigate Between Pages

**Location:** Navigate from Dashboard → Budget → Transactions

**What to Check:**

1. Open DevTools → Network tab
2. Filter by `sentry.io`
3. Navigate between pages
4. Look for performance transaction requests

**Expected:** POST requests for page navigation transactions (if `tracesSampleRate > 0`)

## 🔬 Detailed Network Request Inspection

### Request Headers

**Expected Headers:**

```
Content-Type: application/x-sentry-envelope
X-Sentry-Auth: Sentry sentry_version=7, sentry_key=<key>, sentry_client=<client>
```

### Request Payload

The payload is in Sentry's envelope format (binary/text). You can inspect it in:

- **Headers tab:** See request headers
- **Payload tab:** See raw request body
- **Preview/Response tab:** See Sentry's response (usually `{"id":"<event-id>"}`)

### Response

**Success Response:**

```json
{
  "id": "abc123def456..."
}
```

**Error Responses:**

- `403 Forbidden` → Domain not allowed or invalid DSN
- `400 Bad Request` → Invalid payload format
- `429 Too Many Requests` → Rate limited (check quota)

## 🧪 Test Scenarios

### Test 1: Verify Initialization

1. **Clear network log** (right-click → Clear)
2. **Refresh page** (F5)
3. **Filter:** `sentry.io`
4. **Expected:** 1-2 POST requests within 2 seconds

**If no requests:**

- Sentry not initializing
- Check console for initialization errors
- Verify environment variables

### Test 2: Trigger Manual Error

1. **Open Console tab**
2. **Run:** `throw new Error("Test Sentry from staging.violetvault.app")`
3. **Check Network tab** (filter: `sentry.io`)
4. **Expected:** New POST request appears

**If no request:**

- Error not being captured
- Check if Sentry is initialized
- Verify `VITE_ERROR_REPORTING_ENABLED` is `"true"`

### Test 3: Check Performance Monitoring

1. **Navigate to:** Dashboard → Budget → Transactions
2. **Filter:** `sentry.io`
3. **Expected:** POST requests for navigation transactions

**Note:** Only appears if `tracesSampleRate > 0` (default is 0.1 for production, 1.0 for staging)

### Test 4: Check Session Replay

1. **Interact with app:** Click buttons, navigate pages
2. **Filter:** `sentry.io`
3. **Expected:** Periodic POST requests with replay data

**Note:** Only appears if `replaysSessionSampleRate > 0` (default is 0.1 for production, 1.0 for staging)

## 🐛 Troubleshooting Network Requests

### No Requests at All

**Possible Causes:**

1. Sentry not initialized
   - Check console for: `✅ Sentry initialized successfully`
   - If missing: Check environment variables

2. Environment variables not set
   - Verify `VITE_SENTRY_DSN` is set
   - Verify `VITE_ERROR_REPORTING_ENABLED` is `"true"`

3. Domain not allowed
   - Check Sentry project settings → Allowed Domains
   - Add `staging.violetvault.app` if missing

### CORS Error - "Fetch API cannot load ... due to access control checks"

**Symptom:**

- Console error: `Fetch API cannot load https://<org>.ingest.us.sentry.io/api/<project-id>/envelope/ due to access control checks`
- Network tab shows: Request blocked or CORS error
- Console shows: `Content blocker prevented frame displaying ... from loading a resource from ...`

**Cause:** Your domain is not in Sentry's allowed domains list, OR a content blocker is interfering.

**Fix:**

1. **Add Domain to Sentry:**
   - Go to [Sentry Project Settings → Security & Privacy](https://sentry.io/settings/f4tdaddy/projects/violet-vault/security/)
   - Scroll to **Allowed Domains**
   - Add: `staging.violetvault.app` (exact match)
   - Add: `*.violetvault.app` (wildcard for all subdomains)
   - Add: `*.vercel.app` (for Vercel preview deployments)
   - Add: `violetvault.app` (production domain)
   - Click **Save**
   - Wait 1-2 minutes for changes to propagate

2. **Check for Content Blockers:**
   - Disable browser extensions (ad blockers, privacy tools)
   - Try incognito/private mode
   - Check if requests appear in Network tab (they might be blocked by extension, not Sentry)

3. **Verify Fix:**
   - Refresh the app
   - Check Network tab for `200 OK` responses to Sentry
   - Console should no longer show CORS errors

### 403 Forbidden

**Cause:** Domain not allowed in Sentry settings (same as CORS error above)

**Fix:** See "CORS Error" section above - add your domain to Sentry's allowed domains list.

### 400 Bad Request

**Cause:** Invalid payload format or DSN

**Fix:**

1. Verify DSN format: `https://<key>@<org>.ingest.sentry.io/<project-id>`
2. Check console for Sentry initialization errors
3. Verify Sentry SDK version is compatible

### Requests Appear But No Data in Sentry Dashboard

**Possible Causes:**

1. **Wrong project/org:** Verify DSN matches Sentry project
2. **Filter settings:** Check Sentry dashboard filters (environment, date range)
3. **Quota exceeded:** Check Sentry quota limits
4. **Processing delay:** Wait 1-2 minutes for events to appear

## 📊 Expected Request Frequency

### Staging Environment (`staging.violetvault.app`)

- **Initialization:** 1-2 requests on page load
- **Errors:** 1 request per error (immediate)
- **Performance:** ~10% of page navigations (if `tracesSampleRate = 0.1`)
- **Replays:** ~10% of sessions (if `replaysSessionSampleRate = 0.1`)

### Development Environment

- **Initialization:** 1-2 requests on page load
- **Errors:** 1 request per error (immediate)
- **Performance:** 100% of page navigations (if `tracesSampleRate = 1.0`)
- **Replays:** 100% of sessions (if `replaysSessionSampleRate = 1.0`)

## 🔍 Quick Verification Checklist

- [ ] Network tab open with `sentry.io` filter
- [ ] Page refreshed (to see initialization request)
- [ ] At least 1 POST request to `*.ingest.sentry.io` appears
- [ ] Request status is `200 OK`
- [ ] Response contains `{"id":"..."}`
- [ ] Console shows `✅ Sentry initialized successfully`

## 🎯 Quick Test Commands

**In Browser Console:**

```javascript
// Check if Sentry is loaded
window.Sentry ? console.log("✅ Sentry loaded") : console.log("❌ Sentry not loaded");

// Check Sentry status
import("./utils/common/sentry.js").then(({ getErrorReportingStatus }) => {
  console.log("Sentry Status:", getErrorReportingStatus());
});

// Trigger test error
throw new Error("Test Sentry error - check network tab");

// Check Sentry DSN (partial)
console.log("DSN present:", !!import.meta.env.VITE_SENTRY_DSN);
```

---

**Related Docs:**

- [Sentry Setup Checklist](./SENTRY_SETUP_CHECKLIST.md)
- [Sentry Vercel Troubleshooting](./SENTRY_VERCEL_TROUBLESHOOTING.md)
