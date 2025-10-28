import { initializeApp, type FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported, type Messaging } from "firebase/messaging";
import { firebaseConfig } from "../utils/common/firebaseConfig";
import logger from "../utils/common/logger";
/// <reference types="../vite-env.d.ts" />

// Type declarations for browser APIs
type NotificationPermission = "default" | "denied" | "granted";

// Extend window interface for debugging
declare global {
  interface Window {
    firebaseMessagingService?: FirebaseMessagingService;
  }
}

/**
 * Firebase Cloud Messaging Service
 * Handles push notification token generation, message reception, and permission management
 */

interface TokenResult {
  success: boolean;
  token?: string | null;
  permission?: NotificationPermission;
  reason?: string;
  error?: string;
}

interface FCMStatus {
  isInitialized: boolean;
  isAvailable: boolean;
  hasToken: boolean;
  permission: NotificationPermission;
  hasVapidKey: boolean;
  tokenAge: number | null;
  shouldRefresh: boolean;
}

interface MessagePayload {
  notification?: {
    title?: string;
    body?: string;
    image?: string;
  };
  data?: Record<string, string>;
}

class FirebaseMessagingService {
  private messaging: Messaging | null;
  private isInitialized: boolean;
  private currentToken: string | null;
  private vapidKey: string | undefined;

  constructor() {
    this.messaging = null;
    this.isInitialized = false;
    this.currentToken = null;
    this.vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

    // Check for required environment variables
    if (!this.vapidKey) {
      logger.warn("VITE_FIREBASE_VAPID_KEY not set - FCM will use default configuration");
    }
  }

  /**
   * Initialize Firebase Messaging
   */
  async initialize(): Promise<boolean> {
    try {
      // Skip FCM initialization if using demo Firebase config to prevent service worker conflicts
      if (firebaseConfig.projectId === "demo-project") {
        logger.info("📱 Skipping FCM initialization (demo Firebase config detected)");
        return false;
      }

      // Check if messaging is supported in this browser
      const supported = await isSupported();
      if (!supported) {
        logger.warn("Firebase Messaging is not supported in this browser");
        return false;
      }

      // Initialize Firebase app (may already be initialized)
      let app: FirebaseApp;
      try {
        app = initializeApp(firebaseConfig);
      } catch (error: unknown) {
        // App might already be initialized
        const firebaseError = error as { code?: string };
        if (firebaseError.code === "app/duplicate-app") {
          const { getApp } = await import("firebase/app");
          app = getApp();
        } else {
          throw error;
        }
      }

      // Initialize messaging
      this.messaging = getMessaging(app);
      this.isInitialized = true;

      // Set up foreground message handling
      this.setupForegroundMessageHandling();

      logger.info("📱 Firebase Messaging initialized successfully");
      return true;
    } catch (error) {
      logger.error("❌ Failed to initialize Firebase Messaging", error);
      return false;
    }
  }

  /**
   * Check if FCM is available and supported
   */
  isAvailable(): boolean {
    return this.isInitialized && this.messaging !== null;
  }

  /**
   * Request notification permission and get FCM token
   */
  async requestPermissionAndGetToken(): Promise<TokenResult> {
    if (!this.isAvailable()) {
      throw new Error("Firebase Messaging not initialized");
    }

    try {
      // Check current permission status
      const permission = Notification.permission;
      logger.debug("Current notification permission:", { permission });

      if (permission === "denied") {
        logger.warn("Notification permission was denied by user");
        return { success: false, reason: "permission_denied", token: null };
      }

      // Request permission if not already granted
      if (permission !== "granted") {
        const result = await Notification.requestPermission();
        logger.info("Notification permission request result:", { result });

        if (result !== "granted") {
          logger.warn("User denied notification permission");
          return { success: false, reason: "permission_denied", token: null };
        }
      }

      // Get FCM token
      const token = await this.getRegistrationToken();
      return { success: true, token, permission: "granted" };
    } catch (error) {
      logger.error("❌ Failed to request permission and get token", error);
      return {
        success: false,
        reason: "error",
        error: (error as Error).message,
        token: null,
      };
    }
  }

  /**
   * Get FCM registration token
   */
  async getRegistrationToken(): Promise<string | null> {
    if (!this.isAvailable()) {
      throw new Error("Firebase Messaging not initialized");
    }

    try {
      const tokenConfig = this.vapidKey ? { vapidKey: this.vapidKey } : undefined;
      const token = await getToken(this.messaging, tokenConfig);

      if (token) {
        logger.info("📱 FCM registration token generated successfully");
        logger.debug("FCM Token (first 20 chars):", { tokenPreview: token.substring(0, 20) + "..." });
        this.currentToken = token;

        // Store token in localStorage for debugging and backup
        localStorage.setItem("fcm_token", token);
        localStorage.setItem("fcm_token_timestamp", Date.now().toString());

        return token;
      } else {
        logger.warn("No FCM registration token available");
        return null;
      }
    } catch (error) {
      logger.error("❌ Failed to get FCM registration token", error);
      throw error;
    }
  }

  /**
   * Get current stored token
   */
  getCurrentToken(): string | null {
    return this.currentToken;
  }

  /**
   * Check if token needs refresh (older than 7 days)
   */
  shouldRefreshToken(): boolean {
    const timestamp = localStorage.getItem("fcm_token_timestamp");
    if (!timestamp) return true;

    const tokenAge = Date.now() - parseInt(timestamp);
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return tokenAge > sevenDays;
  }

  /**
   * Refresh FCM token if needed
   */
  async refreshTokenIfNeeded(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      if (this.shouldRefreshToken() || !this.currentToken) {
        logger.info("🔄 Refreshing FCM token...");
        const token = await this.getRegistrationToken();
        return token !== null;
      }
      return true;
    } catch (error) {
      logger.error("❌ Failed to refresh FCM token", error);
      return false;
    }
  }

  /**
   * Set up foreground message handling
   */
  setupForegroundMessageHandling(): void {
    if (!this.isAvailable() || !this.messaging) {
      return;
    }

    onMessage(this.messaging, (payload: MessagePayload) => {
      logger.info("📨 Received foreground message", { payload });

      // Extract notification data
      const { notification, data } = payload;

      if (notification) {
        this.displayNotification(notification, data);
      }

      // Emit custom event for app-specific handling
      window.dispatchEvent(
        new CustomEvent("fcm-message", {
          detail: { payload, timestamp: Date.now() },
        })
      );
    });

    logger.debug("🔔 Foreground message handling configured");
  }

  /**
   * Display notification in foreground
   */
  displayNotification(
    notification: { title?: string; body?: string; image?: string },
    data: Record<string, string> = {}
  ): void {
    const { title, body, image } = notification;

    // Check if we can show notifications
    if (Notification.permission !== "granted") {
      logger.warn("Cannot display notification - permission not granted");
      return;
    }

    try {
      const notificationOptions = {
        body,
        icon: image || "/images/icon-192x192.png",
        badge: "/images/icon-192x192.png",
        data: data,
        tag: data.type || "violet-vault",
        requireInteraction: data.requireInteraction === "true",
        silent: false,
      };

      const notif = new Notification(title, notificationOptions);

      // Auto-close after 10 seconds unless requireInteraction is true
      if (!notificationOptions.requireInteraction) {
        setTimeout(() => notif.close(), 10000);
      }

      // Handle notification click
      notif.onclick = (event) => {
        event.preventDefault();
        notif.close();

        // Focus app window
        if (window.focus) window.focus();

        // Handle action based on data
        if (data.url) {
          window.location.href = data.url;
        }

        logger.info("📱 Notification clicked", { data });
      };
    } catch (error) {
      logger.error("❌ Failed to display notification", error);
    }
  }

  /**
   * Test message sending (development only)
   */
  async sendTestMessage(): Promise<boolean> {
    if (!this.currentToken) {
      logger.warn("No FCM token available for test message");
      return false;
    }

    // This would typically be done from your backend
    logger.info(
      "🧪 Test message would be sent to token:",
      { tokenPreview: this.currentToken.substring(0, 20) + "..." }
    );
    logger.info(
      "💡 Use this token in your Firebase Console or backend service to send test messages"
    );

    return true;
  }

  /**
   * Get FCM service status for debugging
   */
  getStatus(): FCMStatus {
    return {
      isInitialized: this.isInitialized,
      isAvailable: this.isAvailable(),
      hasToken: !!this.currentToken,
      permission: Notification.permission,
      hasVapidKey: !!this.vapidKey,
      tokenAge: this.getTokenAge(),
      shouldRefresh: this.shouldRefreshToken(),
    };
  }

  /**
   * Get token age in hours
   */
  getTokenAge(): number | null {
    const timestamp = localStorage.getItem("fcm_token_timestamp");
    if (!timestamp) return null;

    const ageMs = Date.now() - parseInt(timestamp);
    return Math.round(ageMs / (1000 * 60 * 60)); // Convert to hours
  }

  /**
   * Clear stored token and reset service
   */
  clearToken(): void {
    this.currentToken = null;
    localStorage.removeItem("fcm_token");
    localStorage.removeItem("fcm_token_timestamp");
    logger.info("🧹 FCM token cleared");
  }
}

// Create singleton instance
const firebaseMessagingService = new FirebaseMessagingService();

// Expose to window for debugging
if (typeof window !== "undefined") {
  window.firebaseMessagingService = firebaseMessagingService;
}

export default firebaseMessagingService;
