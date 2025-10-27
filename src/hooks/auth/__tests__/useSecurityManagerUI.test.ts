import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useSecurityManagerUI,
  useSecurityEventManager,
  useAutoLockManager,
  useClipboardSecurity,
} from "../useSecurityManagerUI";

// Mock dependencies
vi.mock("../../../services/security/securityService", () => ({
  securityService: {
    loadSettings: vi.fn(() => ({
      autoLockEnabled: true,
      autoLockTimeout: 15,
      clipboardClearTimeout: 30,
      securityLoggingEnabled: true,
      lockOnPageHide: true,
    })),
    saveSettings: vi.fn(),
    loadSecurityEvents: vi.fn(() => []),
    saveSecurityEvents: vi.fn(),
    createSecurityEvent: vi.fn((event) => ({
      ...event,
      id: "test-id",
      timestamp: "2023-01-01T00:00:00Z",
    })),
    clearSecurityEvents: vi.fn(),
  },
}));

vi.mock("../../../utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock navigator.clipboard
Object.assign(global, {
  navigator: {
    clipboard: {
      writeText: vi.fn(() => Promise.resolve()),
      readText: vi.fn(() => Promise.resolve("")),
    },
  },
});

describe("useSecurityManagerUI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useSecurityManagerUI());

    expect(result.current.isLocked).toBe(false);
    expect(result.current.securitySettings.autoLockEnabled).toBe(true);
    expect(result.current.securitySettings.autoLockTimeout).toBe(15);
    expect(result.current.securityEvents).toEqual([]);
  });

  it("should update security settings", () => {
    const { result } = renderHook(() => useSecurityManagerUI());

    act(() => {
      result.current.updateSecuritySettings({ autoLockEnabled: false });
    });

    expect(result.current.securitySettings.autoLockEnabled).toBe(false);
  });

  it("should add security events", () => {
    const { result } = renderHook(() => useSecurityManagerUI());

    act(() => {
      result.current.addSecurityEvent({
        type: "TEST_EVENT",
        description: "Test event",
      });
    });

    expect(result.current.securityEvents).toHaveLength(1);
    expect(result.current.securityEvents[0].type).toBe("TEST_EVENT");
  });

  it("should clear security events", () => {
    const { result } = renderHook(() => useSecurityManagerUI());

    // Add an event first
    act(() => {
      result.current.addSecurityEvent({
        type: "TEST_EVENT",
        description: "Test event",
      });
    });

    expect(result.current.securityEvents).toHaveLength(1);

    // Clear events
    act(() => {
      result.current.clearSecurityEvents();
    });

    expect(result.current.securityEvents).toHaveLength(0);
  });

  it("should lock and unlock session", () => {
    const { result } = renderHook(() => useSecurityManagerUI());

    act(() => {
      result.current.lockSession();
    });

    expect(result.current.isLocked).toBe(true);

    act(() => {
      result.current.unlockSession();
    });

    expect(result.current.isLocked).toBe(false);
  });
});

describe("useSecurityEventManager", () => {
  const mockSettings = { securityLoggingEnabled: true };
  const mockAddSecurityEvent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockAddSecurityEvent.mockClear();
  });

  it("should log security events when enabled", () => {
    const { result } = renderHook(() =>
      useSecurityEventManager(mockSettings, mockAddSecurityEvent)
    );

    act(() => {
      result.current.logSecurityEvent({
        type: "TEST_EVENT",
        description: "Test event",
      });
    });

    expect(mockAddSecurityEvent).toHaveBeenCalledWith({
      type: "TEST_EVENT",
      description: "Test event",
    });
  });

  it("should not log events when disabled", () => {
    const disabledSettings = { securityLoggingEnabled: false };
    const { result } = renderHook(() =>
      useSecurityEventManager(disabledSettings, mockAddSecurityEvent)
    );

    act(() => {
      result.current.logSecurityEvent({
        type: "TEST_EVENT",
        description: "Test event",
      });
    });

    expect(mockAddSecurityEvent).not.toHaveBeenCalled();
  });

  it("should log login attempts", () => {
    const { result } = renderHook(() =>
      useSecurityEventManager(mockSettings, mockAddSecurityEvent)
    );

    act(() => {
      result.current.logLoginAttempt(true, { ip: "127.0.0.1" });
    });

    expect(mockAddSecurityEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "LOGIN_SUCCESS",
        description: "User logged in successfully",
        metadata: expect.objectContaining({
          success: true,
          ip: "127.0.0.1",
        }),
      })
    );
  });

  it("should log session activity", () => {
    const { result } = renderHook(() =>
      useSecurityEventManager(mockSettings, mockAddSecurityEvent)
    );

    act(() => {
      result.current.logSessionActivity("page_view", { page: "/dashboard" });
    });

    expect(mockAddSecurityEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "SESSION_ACTIVITY",
        description: "Session activity: page_view",
        metadata: expect.objectContaining({
          activity: "page_view",
          page: "/dashboard",
        }),
      })
    );
  });

  it("should log security actions", () => {
    const { result } = renderHook(() =>
      useSecurityEventManager(mockSettings, mockAddSecurityEvent)
    );

    act(() => {
      result.current.logSecurityAction("password_change", { method: "manual" });
    });

    expect(mockAddSecurityEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "SECURITY_ACTION",
        description: "Security action: password_change",
        metadata: expect.objectContaining({
          action: "password_change",
          method: "manual",
        }),
      })
    );
  });
});

describe("useAutoLockManager", () => {
  const mockSettings = { autoLockEnabled: true, autoLockTimeout: 1 }; // 1 minute for testing
  const mockIsLocked = false;
  const mockLockSession = vi.fn();
  const mockLastActivityRef = { current: Date.now() };
  const mockAutoLockTimerRef = { current: null };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockLockSession.mockClear();
    mockLastActivityRef.current = Date.now();
    mockAutoLockTimerRef.current = null;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should update activity timestamp", () => {
    const { result } = renderHook(() =>
      useAutoLockManager(
        mockSettings,
        mockIsLocked,
        mockLockSession,
        mockLastActivityRef,
        mockAutoLockTimerRef
      )
    );

    const initialTime = mockLastActivityRef.current;

    act(() => {
      vi.advanceTimersByTime(1000);
      result.current.updateActivity();
    });

    expect(mockLastActivityRef.current).toBeGreaterThan(initialTime);
  });

  it("should start auto-lock timer", () => {
    const { result } = renderHook(() =>
      useAutoLockManager(
        mockSettings,
        mockIsLocked,
        mockLockSession,
        mockLastActivityRef,
        mockAutoLockTimerRef
      )
    );

    act(() => {
      result.current.startAutoLockTimer();
    });

    expect(mockAutoLockTimerRef.current).toBeTruthy();
  });

  it("should stop auto-lock timer", () => {
    const { result } = renderHook(() =>
      useAutoLockManager(
        mockSettings,
        mockIsLocked,
        mockLockSession,
        mockLastActivityRef,
        mockAutoLockTimerRef
      )
    );

    // Start timer first
    act(() => {
      result.current.startAutoLockTimer();
    });

    expect(mockAutoLockTimerRef.current).toBeTruthy();

    // Stop timer
    act(() => {
      result.current.stopAutoLockTimer();
    });

    expect(mockAutoLockTimerRef.current).toBe(null);
  });

  it("should trigger auto-lock after timeout", () => {
    const { result } = renderHook(() =>
      useAutoLockManager(
        mockSettings,
        mockIsLocked,
        mockLockSession,
        mockLastActivityRef,
        mockAutoLockTimerRef
      )
    );

    act(() => {
      result.current.startAutoLockTimer();
    });

    // Fast-forward past the auto-lock timeout
    act(() => {
      vi.advanceTimersByTime(60000); // 1 minute
    });

    expect(mockLockSession).toHaveBeenCalled();
  });

  it("should reset auto-lock timer", () => {
    const { result } = renderHook(() =>
      useAutoLockManager(
        mockSettings,
        mockIsLocked,
        mockLockSession,
        mockLastActivityRef,
        mockAutoLockTimerRef
      )
    );

    act(() => {
      result.current.resetAutoLockTimer();
    });

    expect(mockAutoLockTimerRef.current).toBeTruthy();
  });

  it("should not start timer when auto-lock disabled", () => {
    const disabledSettings = { autoLockEnabled: false, autoLockTimeout: 1 };
    const { result } = renderHook(() =>
      useAutoLockManager(
        disabledSettings,
        mockIsLocked,
        mockLockSession,
        mockLastActivityRef,
        mockAutoLockTimerRef
      )
    );

    act(() => {
      result.current.startAutoLockTimer();
    });

    expect(mockAutoLockTimerRef.current).toBe(null);
  });
});

describe("useClipboardSecurity", () => {
  const mockSettings = { clipboardClearTimeout: 5 }; // 5 seconds for testing
  const mockClipboardTimerRef = { current: null };
  const mockLogSecurityEvent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockLogSecurityEvent.mockClear();
    mockClipboardTimerRef.current = null;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should copy text to clipboard securely", async () => {
    const { result } = renderHook(() =>
      useClipboardSecurity(mockSettings, mockClipboardTimerRef, mockLogSecurityEvent)
    );

    await act(async () => {
      const success = await result.current.secureClipboardCopy("secret text", "test data");
      expect(success).toBe(true);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("secret text");
    expect(mockLogSecurityEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "CLIPBOARD_COPY",
        description: "Copied test data to clipboard",
        metadata: expect.objectContaining({
          description: "test data",
          length: 11,
        }),
      })
    );
  });

  it("should auto-clear clipboard after timeout", async () => {
    (navigator.clipboard.readText as any).mockResolvedValueOnce("secret text");

    const { result } = renderHook(() =>
      useClipboardSecurity(mockSettings, mockClipboardTimerRef, mockLogSecurityEvent)
    );

    await act(async () => {
      await result.current.secureClipboardCopy("secret text");
    });

    // Fast-forward past the timeout
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    await vi.waitFor(() => {
      expect(navigator.clipboard.readText).toHaveBeenCalled();
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("");
    });

    expect(mockLogSecurityEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "CLIPBOARD_CLEAR",
        description: "Clipboard automatically cleared",
      })
    );
  });

  it("should handle clipboard copy errors", async () => {
    (navigator.clipboard.writeText as any).mockRejectedValueOnce(new Error("Clipboard error"));

    const { result } = renderHook(() =>
      useClipboardSecurity(mockSettings, mockClipboardTimerRef, mockLogSecurityEvent)
    );

    await act(async () => {
      const success = await result.current.secureClipboardCopy("secret text");
      expect(success).toBe(false);
    });

    expect(mockLogSecurityEvent).not.toHaveBeenCalled();
  });

  it("should clear clipboard timer", () => {
    const { result } = renderHook(() =>
      useClipboardSecurity(mockSettings, mockClipboardTimerRef, mockLogSecurityEvent)
    );

    // Set a mock timer
    mockClipboardTimerRef.current = setTimeout(() => {}, 1000);

    act(() => {
      result.current.clearClipboardTimer();
    });

    expect(mockClipboardTimerRef.current).toBe(null);
  });

  it("should not clear clipboard if content changed", async () => {
    (navigator.clipboard.readText as any).mockResolvedValueOnce("different text"); // Different from what was copied

    const { result } = renderHook(() =>
      useClipboardSecurity(mockSettings, mockClipboardTimerRef, mockLogSecurityEvent)
    );

    await act(async () => {
      await result.current.secureClipboardCopy("secret text");
    });

    // Reset the call count
    (navigator.clipboard.writeText as any).mockClear();

    // Fast-forward past the timeout
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    await vi.waitFor(() => {
      expect(navigator.clipboard.readText).toHaveBeenCalled();
    });

    // Should not clear clipboard since content changed
    expect(navigator.clipboard.writeText).not.toHaveBeenCalledWith("");
  });
});
