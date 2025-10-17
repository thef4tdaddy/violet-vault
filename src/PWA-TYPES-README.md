# PWA TypeScript Type Declarations

This directory contains comprehensive TypeScript type declarations for Progressive Web App (PWA) features, service workers, and Workbox.

## Files

### `service-worker.d.ts`
Complete type declarations for:
- **Service Worker Global Scope**: Types for the service worker environment including `self`, event handlers, and lifecycle methods
- **Workbox Library**: Full type coverage for all Workbox modules including:
  - `workbox-core`: Core utilities, plugins, and configuration
  - `workbox-routing`: Route registration and navigation routing
  - `workbox-strategies`: Caching strategies (CacheFirst, NetworkFirst, StaleWhileRevalidate, etc.)
  - `workbox-precaching`: Precache and route management
  - `workbox-expiration`: Cache expiration and cleanup
  - `workbox-cacheable-response`: Response caching plugins
  - `workbox-background-sync`: Background sync and queue management
  - `workbox-broadcast-update`: Broadcast updates for cache changes
  - `workbox-navigation-preload`: Navigation preload support
  - `workbox-range-requests`: Range request handling
  - `workbox-window`: Client-side Workbox API
- **Window PWA Events**: Types for `beforeinstallprompt` and `appinstalled` events
- **Vite PWA Plugin**: Virtual module declarations for `virtual:pwa-register` and `virtual:pwa-info`
- **Firebase Messaging**: Service worker types for Firebase Cloud Messaging

### `vite-env.d.ts`
Environment variable type declarations for:
- Build-time Git information (branch, commit hash, commit message, etc.)
- Firebase configuration variables
- Bug reporting endpoints
- Highlight.io configuration
- Standard Vite environment variables

## Usage

These type declarations are automatically included in the TypeScript configuration and provide type safety for:

### Service Worker Code
```javascript
// In service worker files (e.g., public/firebase-messaging-sw.js)
// Types are automatically available via the global scope

self.addEventListener('install', (event) => {
  // event is typed as ExtendableEvent
  event.waitUntil(
    self.skipWaiting() // Typed correctly
  );
});

self.addEventListener('notificationclick', (event) => {
  // event is typed as NotificationEvent
  const notification = event.notification; // Typed
  notification.close();
});
```

### Window PWA Events
```javascript
// In React/browser code
window.addEventListener('beforeinstallprompt', (event) => {
  // event is typed as BeforeInstallPromptEvent
  event.preventDefault();
  event.prompt(); // Typed method
  event.userChoice.then(choice => {
    // choice.outcome is 'accepted' | 'dismissed'
  });
});
```

### Vite PWA Plugin
```javascript
// Using the vite-plugin-pwa virtual modules
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    // Callback is typed
  },
  onOfflineReady() {
    // Callback is typed
  }
});
```

### Environment Variables
```javascript
// Type-safe access to environment variables
const gitBranch = import.meta.env.VITE_GIT_BRANCH; // Typed as string
const firebaseKey = import.meta.env.VITE_FIREBASE_API_KEY; // Typed as string | undefined
```

## Type Checking

Run type checking with:
```bash
npm run typecheck        # Check all source files
npm run typecheck:sw     # Check service worker files specifically
```

## Configuration

### `tsconfig.json`
Main TypeScript configuration with:
- `allowJs: true` - Allows JavaScript files to be type-checked
- `checkJs: false` - Doesn't enforce strict checking on all JS files (incremental migration)
- ESNext target for modern JavaScript features
- DOM and WebWorker lib support

### `tsconfig.sw.json`
Service worker specific configuration that:
- Extends main tsconfig
- Uses WebWorker lib instead of DOM
- Enables type checking for service worker files

## Best Practices

1. **Service Worker Files**: Use `// @ts-nocheck` for third-party service worker code that doesn't need type checking
2. **JSDoc Comments**: Add JSDoc comments to JavaScript files for inline type hints
3. **Gradual Migration**: Start with type declarations, then gradually add `@ts-check` to files
4. **Environment Variables**: Always access via `import.meta.env` for type safety

## Contributing

When adding new PWA features:
1. Add type declarations to `service-worker.d.ts`
2. Add environment variables to `vite-env.d.ts`
3. Run `npm run typecheck` to verify
4. Update this README with usage examples

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
