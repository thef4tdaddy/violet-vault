import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useMainContentModals } from "../useMainContentModals";

describe("useMainContentModals", () => {
  beforeEach(() => {
    // No specific setup needed for this simple hook
  });

  it("should initialize with all modals closed", () => {
    const { result } = renderHook(() => useMainContentModals());

    expect(result.current.security.isOpen).toBe(false);
    expect(result.current.settings.isOpen).toBe(false);
  });

  it("should have correct initial settings section", () => {
    const { result } = renderHook(() => useMainContentModals());

    expect(result.current.settings.initialSection).toBe("general");
  });

  it("should provide security modal state management", () => {
    const { result } = renderHook(() => useMainContentModals());

    expect(result.current.security.isOpen).toBe(false);
    expect(typeof result.current.security.setOpen).toBe("function");

    act(() => {
      result.current.security.setOpen(true);
    });

    expect(result.current.security.isOpen).toBe(true);

    act(() => {
      result.current.security.setOpen(false);
    });

    expect(result.current.security.isOpen).toBe(false);
  });

  it("should provide settings modal state management", () => {
    const { result } = renderHook(() => useMainContentModals());

    expect(result.current.settings.isOpen).toBe(false);
    expect(typeof result.current.settings.setOpen).toBe("function");

    act(() => {
      result.current.settings.setOpen(true);
    });

    expect(result.current.settings.isOpen).toBe(true);

    act(() => {
      result.current.settings.setOpen(false);
    });

    expect(result.current.settings.isOpen).toBe(false);
  });

  it("should manage security and settings modals independently", () => {
    const { result } = renderHook(() => useMainContentModals());

    // Open security modal
    act(() => {
      result.current.security.setOpen(true);
    });

    expect(result.current.security.isOpen).toBe(true);
    expect(result.current.settings.isOpen).toBe(false);

    // Open settings modal
    act(() => {
      result.current.settings.setOpen(true);
    });

    expect(result.current.security.isOpen).toBe(true);
    expect(result.current.settings.isOpen).toBe(true);

    // Close security modal
    act(() => {
      result.current.security.setOpen(false);
    });

    expect(result.current.security.isOpen).toBe(false);
    expect(result.current.settings.isOpen).toBe(true);

    // Close settings modal
    act(() => {
      result.current.settings.setOpen(false);
    });

    expect(result.current.security.isOpen).toBe(false);
    expect(result.current.settings.isOpen).toBe(false);
  });

  it("should return consistent interface across renders", () => {
    const { result, rerender } = renderHook(() => useMainContentModals());

    const firstRenderSecurity = result.current.security;
    const firstRenderSettings = result.current.settings;

    rerender();

    // Structure should be consistent
    expect(result.current.security).toHaveProperty("isOpen");
    expect(result.current.security).toHaveProperty("setOpen");
    expect(result.current.settings).toHaveProperty("isOpen");
    expect(result.current.settings).toHaveProperty("setOpen");
    expect(result.current.settings).toHaveProperty("initialSection");

    // Note: Function references may change but interface is consistent
    expect(typeof result.current.security.setOpen).toBe("function");
    expect(typeof result.current.settings.setOpen).toBe("function");
  });
});
