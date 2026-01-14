import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { useLayoutLifecycle } from "../useLayoutLifecycle";
import logger from "@/utils/core/common/logger";

// Mock logger
vi.mock("@/utils/common/logger", () => ({
  default: {
    warn: vi.fn(),
  },
}));

describe("useLayoutLifecycle", () => {
  const defaultProps = {
    isUnlocked: true,
    currentUser: { id: "user1" },
    isOnboarded: true,
    hasAcknowledgedSecurity: false,
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("Corruption Detection", () => {
    it("should listen for syncCorruptionDetected event and show modal", () => {
      const { result } = renderHook(() => useLayoutLifecycle(defaultProps));

      expect(result.current.showCorruptionModal).toBe(false);

      act(() => {
        const event = new CustomEvent("syncCorruptionDetected", {
          detail: { reason: "hash_mismatch" },
        });
        window.dispatchEvent(event);
      });

      expect(result.current.showCorruptionModal).toBe(true);
      expect(logger.warn).toHaveBeenCalledWith("🚨 Corruption modal triggered by sync service", {
        reason: "hash_mismatch",
      });
    });

    it("should allow closing the corruption modal", () => {
      const { result } = renderHook(() => useLayoutLifecycle(defaultProps));

      act(() => {
        result.current.setShowCorruptionModal(true);
      });
      expect(result.current.showCorruptionModal).toBe(true);

      act(() => {
        result.current.setShowCorruptionModal(false);
      });
      expect(result.current.showCorruptionModal).toBe(false);
    });
  });

  describe("Security Warning", () => {
    it("should show security warning after 1 second if conditions are met", () => {
      const { result } = renderHook(() => useLayoutLifecycle(defaultProps));

      expect(result.current.showSecurityWarning).toBe(false);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.showSecurityWarning).toBe(true);
    });

    it("should NOT show security warning if user has acknowledged", () => {
      const { result } = renderHook(() =>
        useLayoutLifecycle({ ...defaultProps, hasAcknowledgedSecurity: true })
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.showSecurityWarning).toBe(false);
    });

    it("should NOT show security warning if not onboarded", () => {
      const { result } = renderHook(() =>
        useLayoutLifecycle({ ...defaultProps, isOnboarded: false })
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.showSecurityWarning).toBe(false);
    });
  });
});
