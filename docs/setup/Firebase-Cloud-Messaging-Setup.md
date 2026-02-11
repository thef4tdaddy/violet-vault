# Firebase Cloud Messaging (FCM) Setup Guide

This guide walks you through setting up Firebase Cloud Messaging for push notifications in VioletVault.

## Overview

Firebase Cloud Messaging (FCM) enables push notifications across:

- **Chrome Desktop** - Full support with service worker
- **Android Chrome PWA** - Native push notifications
- **iOS Safari PWA** - Through Apple Push Notification service (APNs)
- **Firefox/Edge Desktop** - Full support with service worker

## Prerequisites

- Existing Firebase project with VioletVault already configured
- Access to Firebase Console with project admin permissions
- Development environment with VioletVault running

## Step 1: Enable Cloud Messaging in Firebase Console

### 1.1 Navigate to Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your VioletVault project
3. In the left sidebar, click **"Project settings"** (gear icon)

### 1.2 Enable Cloud Messaging

1. Go to the **"Cloud Messaging"** tab
2. If prompted, enable the **Cloud Messaging API**
3. Wait for the API to be enabled (may take a few minutes)

## Step 2: Generate VAPID Keys

### 2.1 Web Push Certificates

1. In **Project settings** → **Cloud Messaging** tab
2. Scroll down to **"Web configuration"** section
3. Under **"Web push certificates"**, click **"Generate key pair"**
4. Copy the generated key (starts with `B...`) - this is your VAPID key

### 2.2 Save the VAPID Key

```bash
# Example VAPID key format
VITE_FIREBASE_VAPID_KEY=BFxz8Hjk9a1bC2dE3fG4hI5jK6lM7nO8pQ9rS0tU1vW2xY3zA4bC5dE6fG7hI8jK9lM0nO1pQ2rS3tU4vW5xY6z
```

## Step 3: Environment Configuration

### 3.1 Add Environment Variable

Create or update your `.env.local` file:

```bash
# Firebase Cloud Messaging VAPID Key
VITE_FIREBASE_VAPID_KEY=your_actual_vapid_key_here
```

### 3.2 Development Environment

```bash
# Restart your development server
npm run dev
```

### 3.3 Production Environment

For production deployments, add the environment variable to your hosting platform:

**Vercel:**

```bash
vercel env add VITE_FIREBASE_VAPID_KEY
```

**Netlify:**

- Site settings → Environment variables
- Add `VITE_FIREBASE_VAPID_KEY`

**Other platforms:**

- Add to your CI/CD environment variables
- Ensure the variable is available at build time

## Step 4: Verify Setup

### 4.1 Check Console Logs

1. Start the development server
2. Open browser developer tools → Console
3. Look for FCM initialization messages:
   ```
   📱 Firebase Messaging initialized successfully
   ```

### 4.2 Test Notification Flow

1. Navigate to **Settings → Notifications**
2. Click **"Enable Notifications"**
3. Grant permission when prompted
4. Look for success message and FCM token generation
5. Click **"Test Message"** to verify token logging

### 4.3 Verify Service Worker

1. Open Developer Tools → Application → Service Workers
2. Confirm `firebase-messaging-sw.js` is registered
3. Status should show "activated and running"

## Step 5: Advanced Configuration (Optional)

### 5.1 Custom Service Worker Registration

If you need custom service worker logic, the FCM service worker is located at:

```
public/firebase-messaging-sw.js
```

### 5.2 iOS Safari Setup (APNs)

For iOS Safari PWA support, additional Apple Developer configuration is required:

1. **Apple Developer Account** with APNs key
2. **Firebase APNs Configuration** in Cloud Messaging settings
3. **APNs Authentication Key** uploaded to Firebase

> Note: iOS Safari push notifications only work in installed PWAs (Add to Home Screen)

### 5.3 Notification Customization

Default notification behavior can be customized in:

```
src/services/firebaseMessaging.js
```

## Troubleshooting

### Common Issues

#### 1. "No VAPID key" Warning

```
🔧 Solution: Add VITE_FIREBASE_VAPID_KEY to your .env.local file
```

#### 2. "Cloud Messaging API not enabled"

```
🔧 Solution: Enable Cloud Messaging API in Firebase Console
```

#### 3. Permission Denied

```
🔧 Solution: Check browser notification settings:
- Chrome: Settings → Privacy and Security → Site Settings → Notifications
- Firefox: Preferences → Privacy & Security → Permissions → Notifications
```

#### 4. Service Worker Not Registering

```
🔧 Solution: Ensure firebase-messaging-sw.js is in public/ directory
```

#### 5. Token Generation Fails

```
🔧 Check:
- VAPID key is correct
- Cloud Messaging API is enabled
- No network connectivity issues
```

### Debug Information

Enable debug mode in Settings → Notifications → Advanced Debug Info to see:

- Service status and configuration
- Permission status details
- Token information
- Error messages

## Security Notes

### Data Privacy

- **FCM tokens are stored locally** in localStorage
- **No sensitive data** in notification payloads
- **User permission required** before any notifications

### VAPID Key Security

- Store VAPID keys securely in environment variables
- **Never commit keys to version control**
- Rotate keys if compromised (requires user re-permission)

### Production Checklist

- [ ] VAPID key added to production environment
- [ ] Cloud Messaging API enabled
- [ ] Service worker deployed correctly
- [ ] HTTPS enabled (required for service workers)
- [ ] Cross-browser testing completed
- [ ] Error monitoring in place

## Testing Checklist

### Browser Testing

- [ ] **Chrome Desktop** - Enable notifications, receive test message
- [ ] **Firefox Desktop** - Enable notifications, receive test message
- [ ] **Edge Desktop** - Enable notifications, receive test message
- [ ] **Android Chrome** - Install PWA, enable notifications, receive test message
- [ ] **iOS Safari** - Install PWA, enable notifications (requires APNs setup)

### Permission Flow Testing

- [ ] First-time permission request works
- [ ] Permission denial handled gracefully
- [ ] Permission reset works after browser settings change
- [ ] Settings UI reflects current permission status

### Error Scenarios

- [ ] Missing VAPID key handled gracefully
- [ ] Network offline scenarios
- [ ] Service worker registration failures
- [ ] Token refresh after expiration

## Next Steps

After successful setup:

1. **Phase 2**: Implement NotificationManager for advanced features
2. **Backend Integration**: Set up server-side FCM message sending
3. **Notification Types**: Define specific notification categories
4. **Analytics**: Track notification engagement and effectiveness

## Support

For issues with this setup:

1. Check the [Firebase Console](https://console.firebase.google.com/) for API status
2. Review browser developer console for error messages
3. Test with Settings → Notifications → Advanced Debug Info
4. Verify environment variables are loaded correctly

---

**Implementation Status**: ✅ Phase 1 Complete - Foundation ready for production use
**Last Updated**: December 2024
**Related Issues**: [#27 (Push notification Epic)](https://github.com/thef4tdaddy/violet-vault/issues/27), [#623 (FCM Foundation - Closed)](https://github.com/thef4tdaddy/violet-vault/issues/623)
