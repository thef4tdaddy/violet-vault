import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useToastStore, globalToast } from "../toastStore";

describe("useToastStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useToastStore.setState({ toasts: [] });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("should initialize with empty toasts array", () => {
      const state = useToastStore.getState();
      expect(state.toasts).toEqual([]);
    });
  });

  describe("addToast", () => {
    it("should add a toast with default type (info)", () => {
      const id = useToastStore.getState().addToast({ message: "Test message" });

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0]).toEqual(
        expect.objectContaining({
          id,
          type: "info",
          message: "Test message",
          duration: 5000,
        })
      );
    });

    it("should add a toast with custom type", () => {
      const id = useToastStore.getState().addToast({
        type: "error",
        message: "Error message",
        duration: 8000,
      });

      const state = useToastStore.getState();
      expect(state.toasts[0]).toEqual(
        expect.objectContaining({
          id,
          type: "error",
          message: "Error message",
          duration: 8000,
        })
      );
    });

    it("should add a toast with custom title", () => {
      useToastStore.getState().addToast({
        message: "Test",
        title: "Custom Title",
      });

      const state = useToastStore.getState();
      expect(state.toasts[0].title).toBe("Custom Title");
    });

    it("should increment toast ID for each new toast", () => {
      const id1 = useToastStore.getState().addToast({ message: "Toast 1" });
      const id2 = useToastStore.getState().addToast({ message: "Toast 2" });
      const id3 = useToastStore.getState().addToast({ message: "Toast 3" });

      expect(id2).toBe(id1 + 1);
      expect(id3).toBe(id2 + 1);
    });

    it("should auto-remove toast after duration", () => {
      useToastStore.getState().addToast({ message: "Test", duration: 5000 });

      let state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);

      vi.advanceTimersByTime(5000);

      state = useToastStore.getState();
      expect(state.toasts).toHaveLength(0);
    });

    it("should not auto-remove toast with duration 0", () => {
      useToastStore.getState().addToast({ message: "Test", duration: 0 });

      vi.advanceTimersByTime(10000);

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
    });

    it("should return the toast ID", () => {
      const id = useToastStore.getState().addToast({ message: "Test" });

      expect(typeof id).toBe("number");
      expect(id).toBeGreaterThan(0);
    });
  });

  describe("removeToast", () => {
    it("should remove a toast by ID", () => {
      const id = useToastStore.getState().addToast({ message: "Test" });

      useToastStore.getState().removeToast(id);

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(0);
    });

    it("should remove only the specified toast from multiple", () => {
      const id1 = useToastStore.getState().addToast({ message: "Toast 1" });
      const id2 = useToastStore.getState().addToast({ message: "Toast 2" });
      const id3 = useToastStore.getState().addToast({ message: "Toast 3" });

      useToastStore.getState().removeToast(id2);

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(2);
      expect(state.toasts[0].id).toBe(id1);
      expect(state.toasts[1].id).toBe(id3);
    });

    it("should handle removing non-existent toast gracefully", () => {
      useToastStore.getState().addToast({ message: "Test" });

      useToastStore.getState().removeToast(9999);

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
    });
  });

  describe("clearAllToasts", () => {
    it("should clear all toasts", () => {
      useToastStore.getState().addToast({ message: "Toast 1" });
      useToastStore.getState().addToast({ message: "Toast 2" });
      useToastStore.getState().addToast({ message: "Toast 3" });

      useToastStore.getState().clearAllToasts();

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(0);
    });

    it("should handle clearing empty toasts", () => {
      useToastStore.getState().clearAllToasts();

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(0);
    });
  });

  describe("showSuccess", () => {
    it("should create a success toast with default title and duration", () => {
      useToastStore.getState().showSuccess("Success message");

      const state = useToastStore.getState();
      expect(state.toasts[0]).toEqual(
        expect.objectContaining({
          type: "success",
          message: "Success message",
          title: "Success",
          duration: 5000,
        })
      );
    });

    it("should create a success toast with custom title", () => {
      useToastStore.getState().showSuccess("Message", "Custom Title");

      const state = useToastStore.getState();
      expect(state.toasts[0].title).toBe("Custom Title");
    });

    it("should create a success toast with custom duration", () => {
      useToastStore.getState().showSuccess("Message", "Title", 3000);

      const state = useToastStore.getState();
      expect(state.toasts[0].duration).toBe(3000);
    });
  });

  describe("showError", () => {
    it("should create an error toast with correct defaults", () => {
      useToastStore.getState().showError("Error message");

      const state = useToastStore.getState();
      expect(state.toasts[0]).toEqual(
        expect.objectContaining({
          type: "error",
          message: "Error message",
          title: "Error",
          duration: 8000,
        })
      );
    });
  });

  describe("showWarning", () => {
    it("should create a warning toast with correct defaults", () => {
      useToastStore.getState().showWarning("Warning message");

      const state = useToastStore.getState();
      expect(state.toasts[0]).toEqual(
        expect.objectContaining({
          type: "warning",
          message: "Warning message",
          title: "Warning",
          duration: 6000,
        })
      );
    });
  });

  describe("showInfo", () => {
    it("should create an info toast with correct defaults", () => {
      useToastStore.getState().showInfo("Info message");

      const state = useToastStore.getState();
      expect(state.toasts[0]).toEqual(
        expect.objectContaining({
          type: "info",
          message: "Info message",
          title: "Info",
          duration: 5000,
        })
      );
    });
  });

  describe("showPayday", () => {
    it("should create a payday toast with correct defaults", () => {
      useToastStore.getState().showPayday("Payday message");

      const state = useToastStore.getState();
      expect(state.toasts[0]).toEqual(
        expect.objectContaining({
          type: "payday",
          message: "Payday message",
          title: "Payday",
          duration: 6000,
        })
      );
    });
  });

  describe("globalToast utility", () => {
    it("should show success toast via globalToast", () => {
      globalToast.showSuccess("Global success");

      const state = useToastStore.getState();
      expect(state.toasts[0]).toEqual(
        expect.objectContaining({
          type: "success",
          message: "Global success",
        })
      );
    });

    it("should show error toast via globalToast", () => {
      globalToast.showError("Global error");

      const state = useToastStore.getState();
      expect(state.toasts[0]).toEqual(
        expect.objectContaining({
          type: "error",
          message: "Global error",
        })
      );
    });

    it("should show warning toast via globalToast", () => {
      globalToast.showWarning("Global warning");

      const state = useToastStore.getState();
      expect(state.toasts[0]).toEqual(
        expect.objectContaining({
          type: "warning",
          message: "Global warning",
        })
      );
    });

    it("should show info toast via globalToast", () => {
      globalToast.showInfo("Global info");

      const state = useToastStore.getState();
      expect(state.toasts[0]).toEqual(
        expect.objectContaining({
          type: "info",
          message: "Global info",
        })
      );
    });

    it("should show payday toast via globalToast", () => {
      globalToast.showPayday("Global payday");

      const state = useToastStore.getState();
      expect(state.toasts[0]).toEqual(
        expect.objectContaining({
          type: "payday",
          message: "Global payday",
        })
      );
    });
  });

  describe("multiple toast scenarios", () => {
    it("should handle multiple concurrent toasts with different timers", () => {
      useToastStore.getState().addToast({ message: "Toast 1", duration: 2000 });
      useToastStore.getState().addToast({ message: "Toast 2", duration: 5000 });
      useToastStore.getState().addToast({ message: "Toast 3", duration: 3000 });

      let state = useToastStore.getState();
      expect(state.toasts).toHaveLength(3);

      vi.advanceTimersByTime(2000);
      state = useToastStore.getState();
      expect(state.toasts).toHaveLength(2);

      vi.advanceTimersByTime(1000);
      state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);

      vi.advanceTimersByTime(2000);
      state = useToastStore.getState();
      expect(state.toasts).toHaveLength(0);
    });

    it("should maintain toast order", () => {
      useToastStore.getState().addToast({ message: "First" });
      useToastStore.getState().addToast({ message: "Second" });
      useToastStore.getState().addToast({ message: "Third" });

      const state = useToastStore.getState();
      expect(state.toasts[0].message).toBe("First");
      expect(state.toasts[1].message).toBe("Second");
      expect(state.toasts[2].message).toBe("Third");
    });
  });
});
