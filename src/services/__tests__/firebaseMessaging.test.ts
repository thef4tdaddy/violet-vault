// Firebase Messaging Service Tests
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { Mock } from "vitest";

// Mock Firebase modules before importing the service
vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({ name: "test-app" })),
  getApp: vi.fn(() => ({ name: "test-app" })),
}));

vi.mock("firebase/messaging", () => ({
  getMessaging: vi.fn(() => ({ name: "test-messaging" })),
  getToken: vi.fn(),
  onMessage: vi.fn(),
  isSupported: vi.fn(),
}));

vi.mock("../../utils/common/firebaseConfig", () => ({
  firebaseConfig: {
    apiKey: "test-api-key",
    authDomain: "test-domain",
    projectId: "test-project",
    storageBucket: "test-bucket",
    messagingSenderId: "test-sender-id",
    appId: "test-app-id",
  },
}));

vi.mock("../../utils/common/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// Import after mocks are set up
import firebaseMessagingService from "../firebaseMessaging";
import { getToken, onMessage, isSupported } from "firebase/messaging";
import logger from "@/utils/common/logger";

describe("FirebaseMessagingService", () => {
  let mockLocalStorage: Record<string, string> = {};

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock localStorage
    mockLocalStorage = {};
    Storage.prototype.getItem = vi.fn((key: string) => mockLocalStorage[key] || null);
    Storage.prototype.setItem = vi.fn((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });
    Storage.prototype.removeItem = vi.fn((key: string) => {
      delete mockLocalStorage[key];
    });

    // Mock Notification API
    Object.defineProperty(global, "Notification", {
      value: {
        permission: "default" as NotificationPermission,
        requestPermission: vi.fn().mockResolvedValue("granted"),
      },
      writable: true,
      configurable: true,
    });

    // Mock window.dispatchEvent
    global.window.dispatchEvent = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("initialize", () => {
    it("should initialize successfully when supported", async () => {
      (isSupported as Mock).mockResolvedValue(true);

      const result = await firebaseMessagingService.initialize();

      expect(result).toBe(true);
      expect(isSupported).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Firebase Messaging initialized successfully")
      );
    });

    it("should return false when messaging is not supported", async () => {
      (isSupported as Mock).mockResolvedValue(false);

      const result = await firebaseMessagingService.initialize();

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("not supported in this browser")
      );
    });

    it("should handle initialization errors", async () => {
      (isSupported as Mock).mockRejectedValue(new Error("Init error"));

      const result = await firebaseMessagingService.initialize();

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to initialize"),
        expect.any(Error)
      );
    });
  });

  describe("isAvailable", () => {
    it("should return true after successful initialization", async () => {
      (isSupported as Mock).mockResolvedValue(true);
      await firebaseMessagingService.initialize();

      const result = firebaseMessagingService.isAvailable();

      expect(result).toBe(true);
    });
  });

  describe("requestPermissionAndGetToken", () => {
    beforeEach(async () => {
      (isSupported as Mock).mockResolvedValue(true);
      await firebaseMessagingService.initialize();
    });

    it("should request permission and get token successfully", async () => {
      const mockToken = "test-token-12345";
      (getToken as Mock).mockResolvedValue(mockToken);
      Notification.requestPermission = vi.fn().mockResolvedValue("granted");

      const result = await firebaseMessagingService.requestPermissionAndGetToken();

      expect(result.success).toBe(true);
      expect(result.token).toBe(mockToken);
      expect(result.permission).toBe("granted");
    });

    it("should return error when permission is denied", async () => {
      Object.defineProperty(Notification, "permission", {
        value: "denied",
        writable: true,
      });

      const result = await firebaseMessagingService.requestPermissionAndGetToken();

      expect(result.success).toBe(false);
      expect(result.reason).toBe("permission_denied");
      expect(result.token).toBeNull();
    });

    it("should handle user denying permission request", async () => {
      Object.defineProperty(Notification, "permission", {
        value: "default",
        writable: true,
      });
      Notification.requestPermission = vi.fn().mockResolvedValue("denied");

      const result = await firebaseMessagingService.requestPermissionAndGetToken();

      expect(result.success).toBe(false);
      expect(result.reason).toBe("permission_denied");
    });

    it("should handle errors during token generation", async () => {
      Notification.requestPermission = vi.fn().mockResolvedValue("granted");
      (getToken as Mock).mockRejectedValue(new Error("Token error"));

      const result = await firebaseMessagingService.requestPermissionAndGetToken();

      expect(result.success).toBe(false);
      expect(result.reason).toBe("error");
      expect(result.error).toBeDefined();
    });
  });

  describe("getRegistrationToken", () => {
    beforeEach(async () => {
      (isSupported as Mock).mockResolvedValue(true);
      await firebaseMessagingService.initialize();
    });

    it("should get token successfully", async () => {
      const mockToken = "test-token-67890";
      (getToken as Mock).mockResolvedValue(mockToken);

      const result = await firebaseMessagingService.getRegistrationToken();

      expect(result).toBe(mockToken);
      expect(mockLocalStorage["fcm_token"]).toBe(mockToken);
      expect(mockLocalStorage["fcm_token_timestamp"]).toBeDefined();
    });

    it("should return null when no token available", async () => {
      (getToken as Mock).mockResolvedValue(null);

      const result = await firebaseMessagingService.getRegistrationToken();

      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("No FCM registration token available")
      );
    });

    it("should throw error when not initialized", async () => {
      const uninitializedService = Object.create(Object.getPrototypeOf(firebaseMessagingService));
      uninitializedService.messaging = null;

      await expect(uninitializedService.getRegistrationToken()).rejects.toThrow(
        "Firebase Messaging not initialized"
      );
    });
  });

  describe("getCurrentToken", () => {
    it("should return current token after getting one", async () => {
      (isSupported as Mock).mockResolvedValue(true);
      await firebaseMessagingService.initialize();

      const mockToken = "test-token-def";
      (getToken as Mock).mockResolvedValue(mockToken);
      await firebaseMessagingService.getRegistrationToken();

      const result = firebaseMessagingService.getCurrentToken();

      expect(result).toBe(mockToken);
    });
  });

  describe("shouldRefreshToken", () => {
    it("should return true when no timestamp exists", () => {
      const result = firebaseMessagingService.shouldRefreshToken();

      expect(result).toBe(true);
    });

    it("should return true when token is older than 7 days", () => {
      const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
      mockLocalStorage["fcm_token_timestamp"] = eightDaysAgo.toString();

      const result = firebaseMessagingService.shouldRefreshToken();

      expect(result).toBe(true);
    });

    it("should return false when token is fresh", () => {
      const oneDayAgo = Date.now() - 1 * 24 * 60 * 60 * 1000;
      mockLocalStorage["fcm_token_timestamp"] = oneDayAgo.toString();

      const result = firebaseMessagingService.shouldRefreshToken();

      expect(result).toBe(false);
    });
  });

  describe("refreshTokenIfNeeded", () => {
    beforeEach(async () => {
      (isSupported as Mock).mockResolvedValue(true);
      await firebaseMessagingService.initialize();
    });

    it("should refresh token when needed", async () => {
      const mockToken = "refreshed-token";
      (getToken as Mock).mockResolvedValue(mockToken);

      // No timestamp, should refresh
      const result = await firebaseMessagingService.refreshTokenIfNeeded();

      expect(result).toBe(true);
      expect(getToken).toHaveBeenCalled();
    });

    it("should not refresh when token is fresh", async () => {
      // Set recent timestamp
      mockLocalStorage["fcm_token_timestamp"] = Date.now().toString();

      // Set current token
      const mockToken = "existing-token";
      (getToken as Mock).mockResolvedValue(mockToken);
      await firebaseMessagingService.getRegistrationToken();

      vi.clearAllMocks();

      const result = await firebaseMessagingService.refreshTokenIfNeeded();

      expect(result).toBe(true);
      expect(getToken).not.toHaveBeenCalled();
    });

    it("should handle refresh errors", async () => {
      (getToken as Mock).mockRejectedValue(new Error("Refresh error"));

      const result = await firebaseMessagingService.refreshTokenIfNeeded();

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to refresh FCM token"),
        expect.any(Error)
      );
    });

    it("should return false when not initialized", async () => {
      const uninitializedService = Object.create(Object.getPrototypeOf(firebaseMessagingService));
      uninitializedService.messaging = null;
      uninitializedService.isInitialized = false;

      const result = await uninitializedService.refreshTokenIfNeeded();

      expect(result).toBe(false);
    });
  });

  describe("displayNotification", () => {
    let mockNotification: any;

    beforeEach(() => {
      mockNotification = {
        close: vi.fn(),
        onclick: null,
      };

      Object.defineProperty(global, "Notification", {
        value: vi.fn().mockImplementation(() => mockNotification),
        writable: true,
        configurable: true,
      });

      Object.defineProperty(Notification, "permission", {
        value: "granted",
        writable: true,
      });

      // Mock setTimeout
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should display notification with correct options", () => {
      const notification = { title: "Test Title", body: "Test Body" };
      const data = { type: "test" };

      firebaseMessagingService.displayNotification(notification, data);

      expect(Notification).toHaveBeenCalledWith(
        "Test Title",
        expect.objectContaining({
          body: "Test Body",
          tag: "test",
        })
      );
    });

    it("should not display notification when permission not granted", () => {
      Object.defineProperty(Notification, "permission", {
        value: "denied",
        writable: true,
      });

      firebaseMessagingService.displayNotification({ title: "Test" });

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Cannot display notification")
      );
    });

    it("should auto-close notification after 10 seconds", () => {
      const notification = { title: "Test" };

      firebaseMessagingService.displayNotification(notification);

      // Fast-forward 10 seconds
      vi.advanceTimersByTime(10000);

      expect(mockNotification.close).toHaveBeenCalled();
    });

    it("should not auto-close when requireInteraction is true", () => {
      const notification = { title: "Test" };
      const data = { requireInteraction: "true" };

      firebaseMessagingService.displayNotification(notification, data);

      // Fast-forward 10 seconds
      vi.advanceTimersByTime(10000);

      expect(mockNotification.close).not.toHaveBeenCalled();
    });

    it("should handle notification click", () => {
      const notification = { title: "Test" };
      const data = { url: "/test-url" };

      window.focus = vi.fn();
      window.location.href = "/";

      firebaseMessagingService.displayNotification(notification, data);

      // Simulate click
      const clickEvent = { preventDefault: vi.fn() };
      mockNotification.onclick(clickEvent);

      expect(clickEvent.preventDefault).toHaveBeenCalled();
      expect(mockNotification.close).toHaveBeenCalled();
      expect(window.focus).toHaveBeenCalled();
      expect(window.location.href).toBe("/test-url");
    });
  });

  describe("setupForegroundMessageHandling", () => {
    beforeEach(async () => {
      (isSupported as Mock).mockResolvedValue(true);
      await firebaseMessagingService.initialize();
    });

    it("should set up message handler", () => {
      expect(onMessage).toHaveBeenCalled();
    });

    it("should handle incoming messages", async () => {
      // Get the callback passed to onMessage
      const messageHandler = (onMessage as Mock).mock.calls[0][1];

      const payload = {
        notification: { title: "Test", body: "Message" },
        data: { type: "test" },
      };

      // Mock displayNotification
      const displaySpy = vi.spyOn(firebaseMessagingService as any, "displayNotification");

      // Call the handler
      messageHandler(payload);

      expect(displaySpy).toHaveBeenCalledWith(payload.notification, payload.data);
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "fcm-message",
        })
      );
    });
  });

  describe("getStatus", () => {
    it("should return correct status", () => {
      const status = firebaseMessagingService.getStatus();

      expect(status).toHaveProperty("isInitialized");
      expect(status).toHaveProperty("isAvailable");
      expect(status).toHaveProperty("hasToken");
      expect(status).toHaveProperty("permission");
      expect(status).toHaveProperty("hasVapidKey");
      expect(status).toHaveProperty("tokenAge");
      expect(status).toHaveProperty("shouldRefresh");
    });

    it("should reflect initialization state", async () => {
      (isSupported as Mock).mockResolvedValue(true);
      await firebaseMessagingService.initialize();

      const status = firebaseMessagingService.getStatus();

      expect(status.isInitialized).toBe(true);
      expect(status.isAvailable).toBe(true);
    });
  });

  describe("getTokenAge", () => {
    it("should return null when no token timestamp exists", () => {
      const age = firebaseMessagingService.getTokenAge();

      expect(age).toBeNull();
    });

    it("should calculate token age in hours", () => {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      mockLocalStorage["fcm_token_timestamp"] = twoHoursAgo.toString();

      const age = firebaseMessagingService.getTokenAge();

      expect(age).toBe(2);
    });
  });

  describe("clearToken", () => {
    beforeEach(async () => {
      (isSupported as Mock).mockResolvedValue(true);
      await firebaseMessagingService.initialize();

      // Set a token
      const mockToken = "test-token";
      (getToken as Mock).mockResolvedValue(mockToken);
      await firebaseMessagingService.getRegistrationToken();
    });

    it("should clear stored token", () => {
      firebaseMessagingService.clearToken();

      expect(firebaseMessagingService.getCurrentToken()).toBeNull();
      expect(mockLocalStorage["fcm_token"]).toBeUndefined();
      expect(mockLocalStorage["fcm_token_timestamp"]).toBeUndefined();
    });
  });

  describe("sendTestMessage", () => {
    it("should return false when no token exists", async () => {
      const result = await firebaseMessagingService.sendTestMessage();

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("No FCM token available"));
    });

    it("should log test message info when token exists", async () => {
      (isSupported as Mock).mockResolvedValue(true);
      await firebaseMessagingService.initialize();

      const mockToken = "test-token";
      (getToken as Mock).mockResolvedValue(mockToken);
      await firebaseMessagingService.getRegistrationToken();

      const result = await firebaseMessagingService.sendTestMessage();

      expect(result).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Test message would be sent"),
        expect.any(String)
      );
    });
  });
});
