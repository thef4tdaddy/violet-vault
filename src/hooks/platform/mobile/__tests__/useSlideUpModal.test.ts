import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import useSlideUpModal from "../useSlideUpModal";

describe("useSlideUpModal", () => {
  it("should initialize with default closed state", () => {
    const { result } = renderHook(() => useSlideUpModal());

    expect(result.current.isOpen).toBe(false);
  });

  it("should initialize with default config", () => {
    const { result } = renderHook(() => useSlideUpModal());

    expect(result.current.config).toEqual({
      height: "three-quarters",
      title: "",
      showHandle: true,
      backdrop: true,
    });
  });

  it("should accept initial config", () => {
    const initialConfig = {
      height: "full",
      title: "Test Modal",
      showHandle: false,
    };

    const { result } = renderHook(() => useSlideUpModal(initialConfig));

    expect(result.current.config).toEqual({
      height: "full",
      title: "Test Modal",
      showHandle: false,
      backdrop: true, // Default value should still be present
    });
  });

  it("should open modal", () => {
    const { result } = renderHook(() => useSlideUpModal());

    act(() => {
      result.current.openModal();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it("should close modal", () => {
    const { result } = renderHook(() => useSlideUpModal());

    act(() => {
      result.current.openModal();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it("should toggle modal state", () => {
    const { result } = renderHook(() => useSlideUpModal());

    act(() => {
      result.current.toggleModal();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggleModal();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it("should update config when opening", () => {
    const { result } = renderHook(() => useSlideUpModal());

    act(() => {
      result.current.openModal({ title: "New Title", height: "half" });
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.config.title).toBe("New Title");
    expect(result.current.config.height).toBe("half");
  });

  it("should update config when toggling open", () => {
    const { result } = renderHook(() => useSlideUpModal());

    act(() => {
      result.current.toggleModal({ title: "Toggled Title" });
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.config.title).toBe("Toggled Title");
  });

  it("should not update config when toggling closed", () => {
    const { result } = renderHook(() => useSlideUpModal());

    act(() => {
      result.current.openModal({ title: "First Title" });
    });

    act(() => {
      result.current.toggleModal({ title: "Second Title" });
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.config.title).toBe("First Title"); // Should not change
  });

  it("should update config independently", () => {
    const { result } = renderHook(() => useSlideUpModal());

    act(() => {
      result.current.updateConfig({ title: "Updated Title" });
    });

    expect(result.current.isOpen).toBe(false); // Should not affect open state
    expect(result.current.config.title).toBe("Updated Title");
  });

  it("should merge config updates with existing config", () => {
    const { result } = renderHook(() => useSlideUpModal({ title: "Initial", height: "half" }));

    act(() => {
      result.current.updateConfig({ title: "Updated" });
    });

    expect(result.current.config).toEqual({
      title: "Updated",
      height: "half",
      showHandle: true,
      backdrop: true,
    });
  });

  it("should handle multiple open/close cycles", () => {
    const { result } = renderHook(() => useSlideUpModal());

    for (let i = 0; i < 5; i++) {
      act(() => {
        result.current.openModal();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.closeModal();
      });
      expect(result.current.isOpen).toBe(false);
    }
  });

  it("should preserve config across open/close cycles", () => {
    const { result } = renderHook(() => useSlideUpModal());

    act(() => {
      result.current.openModal({ title: "Persistent Title" });
    });

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.config.title).toBe("Persistent Title");

    act(() => {
      result.current.openModal();
    });

    expect(result.current.config.title).toBe("Persistent Title");
  });

  it("should allow resetting all config properties", () => {
    const { result } = renderHook(() => useSlideUpModal());

    act(() => {
      result.current.updateConfig({
        height: "full",
        title: "Test",
        showHandle: false,
        backdrop: false,
      });
    });

    expect(result.current.config).toEqual({
      height: "full",
      title: "Test",
      showHandle: false,
      backdrop: false,
    });
  });

  it("should handle empty config updates", () => {
    const { result } = renderHook(() => useSlideUpModal({ title: "Initial" }));

    act(() => {
      result.current.openModal({});
    });

    expect(result.current.config.title).toBe("Initial");
  });
});
