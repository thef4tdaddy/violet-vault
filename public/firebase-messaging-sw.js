// Firebase Messaging Service Worker
// Handles background push notifications when the app is not in focus

// Skip initialization if using demo config to prevent conflicts
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-ABCDEF"
};

// Only initialize Firebase if we have real config (not demo)
if (firebaseConfig.projectId !== "demo-project") {
  importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  // Initialize Firebase Messaging
  const messaging = firebase.messaging();
} else {
  console.log('[firebase-messaging-sw.js] Skipping Firebase initialization (demo config detected)');
  // Create mock messaging object to prevent errors
  const messaging = null;
}

// Handle background messages (only if messaging is initialized)
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const { notification, data } = payload;

  // Extract notification details
  const notificationTitle = notification?.title || 'VioletVault';
  const notificationOptions = {
    body: notification?.body || 'You have a new notification',
    icon: notification?.icon || '/images/icon-192x192.png',
    badge: '/images/icon-192x192.png',
    tag: data?.type || 'violet-vault',
    data: {
      ...data,
      timestamp: Date.now(),
      url: data?.url || '/app'
    },
    requireInteraction: data?.requireInteraction === 'true',
    actions: []
  };

  // Add action buttons if specified
  if (data?.actions) {
    try {
      const actions = JSON.parse(data.actions);
      notificationOptions.actions = actions.map(action => ({
        action: action.action,
        title: action.title,
        icon: action.icon || '/images/icon-192x192.png'
      }));
    } catch (error) {
      console.warn('[firebase-messaging-sw.js] Failed to parse notification actions:', error);
    }
  }

  // Show the notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  const notification = event.notification;
  const data = notification.data || {};

  // Close the notification
  notification.close();

  // Handle action button clicks
  if (event.action) {
    console.log('[firebase-messaging-sw.js] Action clicked:', event.action);

    // Handle specific actions
    switch (event.action) {
      case 'view':
        event.waitUntil(clients.openWindow(data.url || '/app'));
        break;
      case 'dismiss':
        // Just close, no further action needed
        break;
      default:
        console.log('[firebase-messaging-sw.js] Unknown action:', event.action);
    }
    return;
  }

  // Default click behavior - open or focus the app
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      const targetUrl = data.url || '/app';

      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }

      // If app is not open, open it
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle notification close events
self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw.js] Notification closed:', event);

  // Optional: Track notification dismissals
  const data = event.notification.data || {};

  // Could send analytics event here if needed
  console.log('[firebase-messaging-sw.js] Notification dismissed:', data.type);
});

// Service worker installation
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker installing...');

  // Force activation
  self.skipWaiting();
});

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker activating...');

  // Take control of all clients
  event.waitUntil(clients.claim());
});

// Handle push events (fallback)
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push event received:', event);

  // This should be handled by Firebase Messaging, but providing fallback
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('[firebase-messaging-sw.js] Push payload:', payload);

      const { notification, data } = payload;

      if (notification) {
        const notificationTitle = notification.title || 'VioletVault';
        const notificationOptions = {
          body: notification.body || 'You have a new notification',
          icon: notification.icon || '/images/icon-192x192.png',
          badge: '/images/icon-192x192.png',
          data: data || {},
          tag: 'violet-vault-push'
        };

        event.waitUntil(
          self.registration.showNotification(notificationTitle, notificationOptions)
        );
      }
    } catch (error) {
      console.error('[firebase-messaging-sw.js] Error parsing push data:', error);
    }
  }
});

console.log('[firebase-messaging-sw.js] Firebase Messaging Service Worker loaded');