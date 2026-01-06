import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFirebaseMessaging } from "../useFirebaseMessaging";

// Mock dependencies
vi.mock("../../../services/sync/firebaseMessaging", () => ({
  default: {
    initialize: vi.fn(async () => true),
    getCurrentToken: vi.fn(() => null),
    requestPermissionAndGetToken: vi.fn(async () => ({
      success: true,
      token: "test-token-123",
    })),
    clearToken: vi.fn(),
    sendTestMessage: vi.fn(async () => true),
    isAvailable: vi.fn(() => true),
    getStatus: vi.fn(() => ({ initialized: true, hasToken: false })),
  },
}));

vi.mock("../../../utils/notifications/permissionUtils", () => ({
  getPermissionStatusForUI: vi.fn(() => ({
    isSupported: true,
    canShowPrompt: true,
    status: "default",
  })),
  requestNotificationPermission: vi.fn(async () => ({ success: true })),
  trackPermissionDenial: vi.fn(),
}));

vi.mock("../../../utils/common/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useFirebaseMessaging", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize on mount", async () => {
    const firebaseMessagingService = (await import("../../../services/sync/firebaseMessaging"))
      .default;

    const { result } = renderHook(() => useFirebaseMessaging());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(firebaseMessagingService.initialize).toHaveBeenCalled();
  });

  it("should provide initial state", () => {
    const { result } = renderHook(() => useFirebaseMessaging());

    expect(result.current.isInitialized).toBeDefined();
    expect(result.current.isLoading).toBeDefined();
    expect(result.current.token).toBeDefined();
    expect(result.current.permissionStatus).toBeDefined();
    expect(result.current.error).toBeDefined();
    expect(result.current.lastMessage).toBeDefined();
  });

  it("should set initialized state after initialization", async () => {
    const { result } = renderHook(() => useFirebaseMessaging());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });
  });

  it("should request permission and get token", async () => {
    const { result } = renderHook(() => useFirebaseMessaging());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    let response;
    await act(async () => {
      response = await result.current.requestPermissionAndGetToken();
    });

    expect(response!.success).toBe(true);

    await waitFor(() => {
      expect(result.current.token).toBe("test-token-123");
    });
  });

  it("should handle permission denial", async () => {
    const permissionUtils = await import("../../../utils/notifications/permissionUtils");
    vi.mocked(permissionUtils.requestNotificationPermission).mockResolvedValueOnce({
      success: false,
      permission: "denied",
      reason: "denied",
    });

    const { result } = renderHook(() => useFirebaseMessaging());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    let response;
    await act(async () => {
      response = await result.current.requestPermissionAndGetToken();
    });

    expect(response!.success).toBe(false);
    expect(permissionUtils.trackPermissionDenial).toHaveBeenCalled();
  });

  it("should clear token", async () => {
    const firebaseMessagingService = (await import("../../../services/sync/firebaseMessaging"))
      .default;

    const { result } = renderHook(() => useFirebaseMessaging());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    result.current.clearToken();

    expect(firebaseMessagingService.clearToken).toHaveBeenCalled();
  });

  it("should send test message when token available", async () => {
    const firebaseMessagingService = (await import("../../../services/sync/firebaseMessaging"))
      .default;
    vi.mocked(firebaseMessagingService.getCurrentToken).mockReturnValueOnce("test-token");

    const { result } = renderHook(() => useFirebaseMessaging());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    // Get token first
    await result.current.requestPermissionAndGetToken();

    const success = await result.current.sendTestMessage();

    expect(success).toBe(true);
  });

  it("should handle initialization failure", async () => {
    const firebaseMessagingService = (await import("../../../services/sync/firebaseMessaging"))
      .default;
    vi.mocked(firebaseMessagingService.initialize).mockResolvedValueOnce(false);

    const { result } = renderHook(() => useFirebaseMessaging());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isInitialized).toBe(false);
  });

  it("should handle initialization error", async () => {
    const firebaseMessagingService = (await import("../../../services/sync/firebaseMessaging"))
      .default;
    vi.mocked(firebaseMessagingService.initialize).mockRejectedValueOnce(new Error("Init failed"));

    const { result } = renderHook(() => useFirebaseMessaging());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.isInitialized).toBe(false);
  });

  it("should provide availability status", async () => {
    const { result } = renderHook(() => useFirebaseMessaging());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(result.current.isAvailable).toBe(true);
  });

  it("should provide token status", async () => {
    const { result } = renderHook(() => useFirebaseMessaging());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(typeof result.current.hasToken).toBe("boolean");
  });

  it("should provide permission capabilities", async () => {
    const { result } = renderHook(() => useFirebaseMessaging());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(typeof result.current.canRequestPermission).toBe("boolean");
    expect(typeof result.current.isSupported).toBe("boolean");
  });

  it("should handle permission denial gracefully", () => {
    const { result } = renderHook(() => useFirebaseMessaging());

    expect(() => result.current.handlePermissionDenied()).not.toThrow();
  });

  it("should update permission status", async () => {
    const { result } = renderHook(() => useFirebaseMessaging());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    result.current.updatePermissionStatus();

    expect(result.current.permissionStatus).toBeDefined();
  });

  it("should provide service status", async () => {
    const { result } = renderHook(() => useFirebaseMessaging());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    const status = result.current.getServiceStatus();

    expect(status).toBeDefined();
  });

  it("should listen for FCM messages", async () => {
    const { result } = renderHook(() => useFirebaseMessaging());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    const event = new CustomEvent("fcm-message", {
      detail: {
        payload: { title: "Test", body: "Message" },
        timestamp: Date.now(),
      },
    });

    window.dispatchEvent(event);

    await waitFor(() => {
      expect(result.current.lastMessage).toBeDefined();
    });
  });

  it("should clean up message listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useFirebaseMessaging());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("fcm-message", expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });

  it("should not initialize twice", async () => {
    const firebaseMessagingService = (await import("../../../services/sync/firebaseMessaging"))
      .default;
    vi.mocked(firebaseMessagingService.initialize).mockClear();

    const { result } = renderHook(() => useFirebaseMessaging());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    const firstCallCount = vi.mocked(firebaseMessagingService.initialize).mock.calls.length;

    await result.current.initialize();

    expect(vi.mocked(firebaseMessagingService.initialize).mock.calls.length).toBe(firstCallCount);
  });
});
