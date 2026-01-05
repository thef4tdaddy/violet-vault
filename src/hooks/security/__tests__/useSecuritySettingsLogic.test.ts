import { renderHook, act } from "@testing-library/react";
import { useSecuritySettingsLogic } from "../useSecuritySettingsLogic";
import { vi, beforeEach, it, describe, expect } from "vitest";
import { useSecurityManager } from "../../auth/useSecurityManager";

// Mock the useSecurityManager hook
vi.mock("../../auth/useSecurityManager", () => ({
  useSecurityManager: vi.fn(() => ({
    isLocked: false,
    securitySettings: {
      autoLockEnabled: true,
      autoLockTimeout: 30,
      lockOnPageHide: false,
      securityLoggingEnabled: true,
      clipboardClearTimeout: 60,
    },
    securityEvents: [
      {
        id: 1,
        type: "LOGIN",
        description: "User logged in",
        timestamp: Date.now(),
      },
    ],
    updateSettings: vi.fn(),
    clearSecurityEvents: vi.fn(),
  })),
}));

describe("useSecuritySettingsLogic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with correct default values", () => {
    const { result } = renderHook(() => useSecuritySettingsLogic());

    expect(result.current.showEvents).toBe(false);
    expect(result.current.showClearConfirm).toBe(false);
    expect(result.current.securitySettings.autoLockEnabled).toBe(true);
    expect(result.current.securityEvents).toHaveLength(1);
  });

  it("should handle setting changes", () => {
    const mockUpdateSettings = vi.fn();
    vi.mocked(useSecurityManager).mockReturnValueOnce({
      isLocked: false,
      securitySettings: {
        autoLockEnabled: true,
        autoLockTimeout: 30,
        lockOnPageHide: false,
        securityLoggingEnabled: true,
        clipboardClearTimeout: 60,
      },
      securityEvents: [
        {
          id: 1,
          type: "LOGIN",
          description: "User logged in",
          timestamp: Date.now(),
        },
      ],
      updateSettings: mockUpdateSettings,
      clearSecurityEvents: vi.fn(),
    } as ReturnType<typeof useSecurityManager>);

    const { result } = renderHook(() => useSecuritySettingsLogic());

    act(() => {
      result.current.handleSettingChange("autoLockEnabled", false);
    });

    expect(mockUpdateSettings).toHaveBeenCalledWith({ autoLockEnabled: false });
  });

  it("should toggle events display", () => {
    const { result } = renderHook(() => useSecuritySettingsLogic());

    expect(result.current.showEvents).toBe(false);

    act(() => {
      result.current.toggleEventsDisplay();
    });

    expect(result.current.showEvents).toBe(true);
  });

  it("should handle clear confirmation flow", () => {
    const { result } = renderHook(() => useSecuritySettingsLogic());

    // Show confirmation dialog
    act(() => {
      result.current.showClearConfirmDialog();
    });
    expect(result.current.showClearConfirm).toBe(true);

    // Hide confirmation dialog
    act(() => {
      result.current.hideClearConfirmDialog();
    });
    expect(result.current.showClearConfirm).toBe(false);
  });

  it("should calculate time until auto-lock correctly", () => {
    const { result } = renderHook(() => useSecuritySettingsLogic());

    const timeResult = result.current.timeUntilAutoLock();
    expect(timeResult).toBe("Active");
  });

  it("should export security events", () => {
    const { result } = renderHook(() => useSecuritySettingsLogic());

    // Mock document.createElement and click
    const mockClick = vi.fn();
    const mockSetAttribute = vi.fn();
    const mockElement = {
      setAttribute: mockSetAttribute,
      click: mockClick,
    } as unknown as HTMLElement;
    vi.spyOn(document, "createElement").mockReturnValue(mockElement);

    act(() => {
      result.current.exportSecurityEvents();
    });

    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(mockSetAttribute).toHaveBeenCalledWith(
      "href",
      expect.stringContaining("data:application/json")
    );
    expect(mockSetAttribute).toHaveBeenCalledWith(
      "download",
      expect.stringContaining("security-events")
    );
    expect(mockClick).toHaveBeenCalled();
  });
});
