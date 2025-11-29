# Firebase Authentication Domain Setup

## Issue: Auth Not Working on Subdomains

If Firebase Authentication is not working on subdomains like `staging.violetvault.app`, you need to configure authorized domains in the Firebase Console.

## Quick Fix

### 1. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Add these domains:
   - `localhost` (for local development)
   - `violetvault.app` (your main domain)
   - `staging.violetvault.app` (your staging subdomain)
   - `*.vercel.app` (for Vercel deployments)
   - Any other subdomains you use

### 2. Enable Anonymous Authentication

1. In Firebase Console → **Authentication** → **Sign-in method**
2. Click on **Anonymous**
3. Toggle **Enable**
4. Click **Save**

### 3. Domain Pattern Examples

For wildcard subdomain support:

- `*.violetvault.app` (supports all subdomains)
- `*.vercel.app` (supports all Vercel preview deployments)

## Common Errors and Solutions

### Error: "auth/unauthorized-domain"

**Solution:** Add your domain to Firebase Console → Authentication → Authorized domains

### Error: "auth/configuration-not-found"

**Solution:** Enable Anonymous Authentication in Firebase Console

### Error: Silent auth failures

**Solution:** Check browser console for CORS errors and verify domains are properly configured

## Testing Auth Setup

Run this in browser console to test:

```javascript
// Check current auth state
firebase.auth().onAuthStateChanged((user) => {
  console.log("Auth state:", user ? "Authenticated" : "Not authenticated");
});

// Test anonymous sign in
firebase
  .auth()
  .signInAnonymously()
  .then(() => console.log("✅ Anonymous auth successful"))
  .catch((error) => console.error("❌ Auth failed:", error.code, error.message));
```

## Application Integration

The app automatically handles auth domain issues with graceful fallback:

- **Success case:** Anonymous auth works, full cloud sync enabled
- **Failure case:** Falls back to local-only mode, app still functional
- **Auto-retry:** Auth attempts retry on network/config changes

## Environment-Specific Domains

- **Development:** `localhost:5173`
- **Staging/Preview:** `staging.violetvault.app`, `*.vercel.app`
- **Production:** `violetvault.app` (or your production domain)

Make sure all environments are added to Firebase authorized domains.
