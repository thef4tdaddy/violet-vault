/// <reference lib="webworker" />

/* eslint-disable no-console */
/// <reference lib="webworker" />
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// Declare global scope for Service Worker logic
declare const self: ServiceWorkerGlobalScope & typeof globalThis;

const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-ABCDEF",
};

// Only initialize Firebase if we have real config (not demo)
if (firebaseConfig.projectId !== "demo-project") {
  const app = initializeApp(firebaseConfig);
  const messaging = getMessaging(app);

  onBackgroundMessage(messaging, (payload) => {
    console.log("[firebase-messaging-sw.ts] Received background message:", payload);

    const { notification, data } = payload;

    const notificationTitle = notification?.title || "VioletVault";
    const notificationOptions: any = {
      body: notification?.body || "You have a new notification",
      icon: notification?.icon || "/images/icon-192x192.png",
      badge: "/images/icon-192x192.png",
      tag: data?.type || "violet-vault",
      data: {
        ...data,
        timestamp: Date.now(),
        url: data?.url || "/app",
      },
      requireInteraction: data?.requireInteraction === "true",
      actions: [],
    };

    if (data?.actions) {
      try {
        const actions = JSON.parse(data.actions);
        notificationOptions.actions = actions.map((action: any) => ({
          action: action.action,
          title: action.title,
          icon: action.icon || "/images/icon-192x192.png",
        }));
      } catch (error) {
        console.warn("[firebase-messaging-sw.ts] Failed to parse notification actions:", error);
      }
    }

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
} else {
  console.log("[firebase-messaging-sw.ts] Skipping Firebase initialization (demo config detected)");
}

self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.ts] Notification clicked:", event);

  const notification = event.notification;
  const data = notification.data || {};

  notification.close();

  if (event.action) {
    console.log("[firebase-messaging-sw.ts] Action clicked:", event.action);

    switch (event.action) {
      case "view":
        event.waitUntil(self.clients.openWindow(data.url || "/app"));
        break;
      case "dismiss":
        break;
      default:
        console.log("[firebase-messaging-sw.ts] Unknown action:", event.action);
    }
    return;
  }

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        const targetUrl = data.url || "/app";

        for (const client of clientList) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            return (client as WindowClient).focus();
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

self.addEventListener("notificationclose", (event) => {
  console.log("[firebase-messaging-sw.ts] Notification closed:", event);
  const data = event.notification.data || {};
  console.log("[firebase-messaging-sw.ts] Notification dismissed:", data.type);
});

self.addEventListener("install", () => {
  console.log("[firebase-messaging-sw.ts] Service worker installing...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[firebase-messaging-sw.ts] Service worker activating...");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  console.log("[firebase-messaging-sw.ts] Push event received:", event);

  if (event.data) {
    try {
      const payload = event.data.json();
      console.log("[firebase-messaging-sw.ts] Push payload:", payload);

      const { notification, data } = payload;

      if (notification) {
        const notificationTitle = notification.title || "VioletVault";
        const notificationOptions: NotificationOptions = {
          body: notification.body || "You have a new notification",
          icon: notification.icon || "/images/icon-192x192.png",
          badge: "/images/icon-192x192.png",
          data: data || {},
          tag: "violet-vault-push",
        };

        event.waitUntil(self.registration.showNotification(notificationTitle, notificationOptions));
      }
    } catch (error) {
      console.error("[firebase-messaging-sw.ts] Error parsing push data:", error);
    }
  }
});

console.log("[firebase-messaging-sw.ts] Firebase Messaging Service Worker loaded");
