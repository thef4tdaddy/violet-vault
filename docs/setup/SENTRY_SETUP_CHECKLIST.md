# Sentry Setup Checklist

**Status:** Partially Complete  
**Last Updated:** 2025-11-28

## ✅ Completed

1. **Sentry SDK Integration**
   - ✅ Sentry packages installed (`@sentry/react`)
   - ✅ Sentry initialization in `src/utils/common/sentry.ts`
   - ✅ Lazy loading via `SentryLoader` component
   - ✅ Error boundaries using Sentry
   - ✅ User identification hooks updated
   - ✅ Bug report integration updated

2. **Environment Variables (Vercel)**
   - ✅ `VITE_SENTRY_DSN` - Added to all environments
   - ✅ `VITE_ERROR_REPORTING_ENABLED` - Added to all environments
   - ✅ `VITE_SENTRY_ENVIRONMENT` - Added to all environments

3. **Release Tracking**
   - ✅ Workflow created (`.github/workflows/sentry-release-tracking.yml`)
   - ✅ Pre-release versioning for develop branch
   - ✅ Release name format: `violetvault@2.0.0` (production) or `violetvault@2.0.1-dev.1` (develop)

4. **Code Integration**
   - ✅ Error capture via `captureError()` function
   - ✅ Performance monitoring setup
   - ✅ Session replay configured (privacy: masks all text, blocks all media)

5. **Performance Monitoring (PR #1397)**
   - ✅ Performance monitor utility (`src/utils/monitoring/performanceMonitor.ts`)
   - ✅ Query performance tracking (TanStack Query spans)
   - ✅ Import/Export operation tracking
   - ✅ Sync performance tracking (syncHealthMonitor integration)
   - ✅ Backup/Restore operation tracking
   - ✅ Slow operation detection and warnings (>1s queries, >5s operations, >10s syncs)

## ❌ Still Needed

### 1. GitHub Secret: `SENTRY_AUTH_TOKEN` (CRITICAL)

**Required for:** Workflow to create Sentry releases automatically

**How to get:**

1. Go to [Sentry Settings → Auth Tokens](https://sentry.io/settings/account/api/auth-tokens/)
2. Click "Create New Token"
3. Select scopes:
   - `project:read`
   - `project:releases`
   - `org:read`
4. Copy the token

**How to add:**

```bash
gh secret set SENTRY_AUTH_TOKEN --body "YOUR_TOKEN_HERE"
```

**Or via GitHub UI:**

1. Go to: `https://github.com/thef4tdaddy/violet-vault/settings/secrets/actions`
2. Click "New repository secret"
3. Name: `SENTRY_AUTH_TOKEN`
4. Value: Your Sentry auth token
5. Click "Add secret"

### 2. Optional: Release Name Environment Variable

**For better release tracking**, you can set `VITE_SENTRY_RELEASE` in Vercel to match the workflow's release format.

**Vercel Environment Variables:**

- `VITE_SENTRY_RELEASE` (optional) - Will be used if set, otherwise falls back to auto-generated format

**Note:** The workflow automatically creates releases, so this is only needed if you want the client-side release name to exactly match the workflow-created release.

### 3. Optional: Sampling Rate Configuration

**For production optimization**, you can set these in Vercel:

- `VITE_TRACES_SAMPLE_RATE` (default: 0.1 for production, 1.0 for staging/dev)
- `VITE_REPLAYS_SESSION_SAMPLE_RATE` (default: 0.1 for production, 1.0 for staging/dev)
- `VITE_REPLAYS_ON_ERROR_SAMPLE_RATE` (default: 1.0 - always capture replays on errors)

## Verification Steps

### 1. Check Sentry Initialization

Open browser console and check for:

```
✅ Sentry initialized successfully
```

### 2. Test Error Reporting

1. Open browser console
2. Run: `throw new Error("Test Sentry error")`
3. Check Sentry dashboard for the error

### 3. Verify Release Tracking

1. Push to `main` or `develop`
2. Check workflow run: `.github/workflows/sentry-release-tracking.yml`
3. Verify release created in [Sentry Releases](https://sentry.io/organizations/f4tdaddy/projects/violet-vault/releases/)

### 4. Check User Identification

1. Log in to the app
2. Check Sentry dashboard → Users
3. Verify user appears with correct ID/email

## Current Status

- **Error Tracking:** ✅ Active (once DSN is configured)
- **Performance Monitoring:** ✅ Complete (PR #1397) - Custom spans for queries, import/export, sync, backup
- **Session Replay:** ✅ Active (once DSN is configured)
- **Release Tracking:** ⏳ Waiting for `SENTRY_AUTH_TOKEN` secret
- **User Identification:** ✅ Active (once DSN is configured)

## Next Steps

1. **Add `SENTRY_AUTH_TOKEN` secret** to enable automatic release creation
2. **Deploy to Vercel** to activate Sentry in production
3. **Monitor first errors** in Sentry dashboard
4. **Verify release tracking** after first deploy

## Troubleshooting

### Sentry not initializing

- Check `VITE_ERROR_REPORTING_ENABLED` is set to `"true"`
- Check `VITE_SENTRY_DSN` is set correctly
- Check browser console for initialization errors

### Releases not being created

- Verify `SENTRY_AUTH_TOKEN` secret exists in GitHub
- Check workflow run logs for authentication errors
- Verify Sentry org/project names match: `f4tdaddy` / `violet-vault`

### Release names don't match

- The workflow creates releases with format: `violetvault@2.0.1-dev.1`
- Client-side uses: `violetvault@2.0.0-staging-abc1234` (fallback)
- To match exactly, set `VITE_SENTRY_RELEASE` in Vercel with the workflow's release name
