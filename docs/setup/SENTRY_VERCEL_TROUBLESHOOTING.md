# Sentry Vercel Integration Troubleshooting

**Last Updated:** 2025-11-29

## 🔍 Quick Diagnostic Checklist

### 1. Verify Environment Variables in Vercel

**Project Verified:** ✅ `violetvault` (ID: `prj_lW9OBIv3YCZ4WYXEpojf47XuSBDw`)

**Note:** Environment variables cannot be read via API for security reasons. Please verify manually in Vercel dashboard:

1. Go to: [Vercel Project Settings → Environment Variables](https://vercel.com/f4tdaddy/violetvault/settings/environment-variables)
2. Verify the following variables exist:

- [ ] `VITE_SENTRY_DSN` is set (should start with `https://`)
- [ ] `VITE_ERROR_REPORTING_ENABLED` is set to `"true"` (with quotes, not boolean)
- [ ] `VITE_SENTRY_ENVIRONMENT` is set (e.g., `production`, `preview`, `development`)
- [ ] Variables are assigned to the correct environments:
  - **Production:** Should have `production` environment
  - **Preview:** Should have `preview` environment (for staging.violetvault.app)
  - **Development:** Optional, for local development

**Quick Check via Deployment:**

- Check latest deployment: `violetvault-8uhbv1cwv-f4tdaddy.vercel.app`
- View build logs to see if environment variables are being injected

**Common Issue:** `VITE_ERROR_REPORTING_ENABLED` must be the string `"true"`, not boolean `true`.

### 2. Check Browser Console

Open your deployed Vercel app and check the browser console:

**Expected logs (if working):**

```
✅ Sentry initialized successfully
```

**If you see:**

```
Sentry initialization skipped
reason: "Error reporting disabled or no DSN provided"
```

→ Environment variables are not set correctly

**If you see nothing:**
→ Sentry might not be initializing at all

### 3. Test Error Reporting Manually

In the browser console on your Vercel deployment:

```javascript
// Test 1: Check if Sentry is initialized
window.Sentry ? console.log("✅ Sentry loaded") : console.log("❌ Sentry not loaded");

// Test 2: Manually trigger an error
throw new Error("Test Sentry error from Vercel");

// Test 3: Check Sentry status
import("./utils/common/sentry.js").then(({ getErrorReportingStatus }) => {
  console.log("Sentry Status:", getErrorReportingStatus());
});
```

### 4. Verify DSN Format

Your DSN should look like:

```
https://<key>@<org>.ingest.sentry.io/<project-id>
```

**Check:**

- [ ] DSN starts with `https://`
- [ ] Contains `@` symbol
- [ ] Contains `.ingest.sentry.io`
- [ ] Ends with a project ID number

### 5. Check Vercel Build Logs

In Vercel → Deployments → Latest Deployment → Build Logs:

Look for:

- Environment variables being injected
- Build errors related to Sentry
- Missing environment variable warnings

### 6. Verify Sentry Project Settings

1. Go to [Sentry Project Settings](https://sentry.io/settings/f4tdaddy/projects/violet-vault/)
2. Check **Client Keys (DSN)**
3. Verify the DSN matches what's in Vercel
4. Check **Security & Privacy** → **Allowed Domains**
   - Should include: `*.vercel.app`
   - Should include: `staging.violetvault.app` (staging environment)
   - Should include: `*.violetvault.app` (if using custom domain)

### 7. Check Network Requests

**See detailed guide:** [Sentry Network Debugging](./SENTRY_NETWORK_DEBUGGING.md)

**Quick Check:**

1. Open browser DevTools → Network tab
2. Filter by `sentry.io`
3. Refresh the page
4. Look for POST requests to `https://<org>.ingest.sentry.io/api/<project-id>/envelope/`

**Expected:**

- POST requests to `https://<org>.ingest.sentry.io/api/<project-id>/envelope/`
- Status: `200 OK`
- At least 1 request on page load (initialization)
- Additional requests when errors occur

**If you see:**

- `CORS error` or `Fetch API cannot load ... due to access control checks` → **Domain not allowed** (see Issue 3 below)
- `403 Forbidden` → DSN is wrong or domain not allowed (see Issue 3 below)
- `400 Bad Request` → Invalid payload format
- No requests → Sentry not initializing

**Where to test:** Any page in the app (Dashboard is easiest). See [Sentry Network Debugging](./SENTRY_NETWORK_DEBUGGING.md) for detailed instructions.

### 8. Verify Release Tracking

Check if releases are being created:

1. Go to [Sentry Releases](https://sentry.io/organizations/f4tdaddy/projects/violet-vault/releases/)
2. Look for releases matching your deployments
3. If no releases → Check GitHub workflow `.github/workflows/sentry-release-tracking.yml`

## 🐛 Common Issues & Fixes

### Issue 1: Environment Variables Not Available at Build Time

**Symptom:** Sentry initializes but DSN is empty

**Fix:** Ensure environment variables are set in Vercel for the correct environment (Production/Preview/Development)

### Issue 2: DSN Format Incorrect

**Symptom:** Console shows "Sentry initialization skipped" with DSN present

**Fix:** Verify DSN format matches: `https://<key>@<org>.ingest.sentry.io/<project-id>`

### Issue 3: CORS Error - "Fetch API cannot load ... due to access control checks"

**Symptom:**

- Console shows: `Fetch API cannot load https://<org>.ingest.us.sentry.io/api/<project-id>/envelope/ due to access control checks`
- Network tab shows: `CORS error` or `403 Forbidden`
- Console shows: `Content blocker prevented frame displaying ... from loading a resource from ...`

**Root Cause:** Your domain (`staging.violetvault.app`) is not in Sentry's allowed domains list.

**Fix:** Add your domain to Sentry's allowed domains:

1. Go to [Sentry Project Settings → Security & Privacy](https://sentry.io/settings/f4tdaddy/projects/violet-vault/security/)
2. Scroll to **Allowed Domains** section
3. Click **Add Domain**
4. Add these domains:
   - `staging.violetvault.app` (exact match for staging)
   - `*.violetvault.app` (wildcard for all subdomains)
   - `*.vercel.app` (for Vercel preview deployments)
   - `violetvault.app` (production domain)
5. Click **Save**

**Important:** After adding domains, wait 1-2 minutes for changes to propagate, then refresh your app.

**Alternative:** If you see "Content blocker prevented", you may also have a browser extension (ad blocker, privacy tool) blocking Sentry. Try:

- Disable browser extensions temporarily
- Use incognito/private mode
- Check if requests appear in Network tab (they might be blocked by extension, not Sentry)

### Issue 4: Environment Variable Type Mismatch

**Symptom:** `VITE_ERROR_REPORTING_ENABLED` not working

**Fix:** In Vercel, set the value as the string `"true"` (with quotes), not boolean `true`

### Issue 5: Sentry Not Initializing Due to Build Errors

**Symptom:** No Sentry logs in console, app works otherwise

**Fix:** Check Vercel build logs for Sentry-related errors. The initialization is wrapped in try-catch, so it fails silently.

## 🔧 Debug Steps

### Step 1: Add Temporary Debug Logging

Add this to `src/main.tsx` in `initializeSentryEarly()`:

```typescript
console.log("🔍 Sentry Debug:", {
  hasDSN: !!import.meta.env.VITE_SENTRY_DSN,
  dsnLength: import.meta.env.VITE_SENTRY_DSN?.length || 0,
  errorReportingEnabled: import.meta.env.VITE_ERROR_REPORTING_ENABLED,
  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
  mode: import.meta.env.MODE,
});
```

Deploy and check console output.

### Step 2: Verify Environment Variables Are Injected

In Vercel, add a temporary route or check build output:

```typescript
// In your app, temporarily add:
console.log("Environment Check:", {
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN ? "SET" : "MISSING",
  VITE_ERROR_REPORTING_ENABLED: import.meta.env.VITE_ERROR_REPORTING_ENABLED,
  VITE_SENTRY_ENVIRONMENT: import.meta.env.VITE_SENTRY_ENVIRONMENT,
});
```

### Step 3: Test Locally with Vercel Environment

Use Vercel CLI to test locally:

```bash
vercel dev
```

This will use your Vercel environment variables locally.

## 📋 Verification Checklist

After fixing issues, verify:

- [ ] Browser console shows "Sentry initialized successfully"
- [ ] Network tab shows POST requests to `*.ingest.sentry.io`
- [ ] Manual error test (`throw new Error("test")`) appears in Sentry dashboard
- [ ] Sentry dashboard shows your Vercel deployment URL
- [ ] Release tracking shows releases for your deployments
- [ ] Performance monitoring shows transactions

## 🆘 Still Not Working?

1. **Check Sentry Dashboard → Issues** - Are errors appearing but not from Vercel?
2. **Check Sentry Dashboard → Performance** - Are transactions being recorded?
3. **Check Vercel Function Logs** - Are there any errors during initialization?
4. **Verify Sentry Project** - Is the project active and not paused?
5. **Check Sentry Quota** - Is the project within quota limits?

## 📞 Next Steps

If still not working after these steps:

1. Share browser console output
2. Share network tab filtered by "sentry.io"
3. Share Vercel environment variable names (not values)
4. Share Sentry project settings (screenshot, redact DSN)

---

**Related Docs:**

- [Sentry Setup Checklist](./SENTRY_SETUP_CHECKLIST.md)
- [Sentry Rules](./Sentry%20Rules.md)
