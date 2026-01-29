import { renderHook, act } from "@testing-library/react";
import { useImportDashboardStore } from "../importDashboardStore";

describe("importDashboardStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useImportDashboardStore.setState({
        isOpen: false,
        preloadedFile: null,
      });
    });
  });

  describe("initial state", () => {
    it("should have isOpen as false", () => {
      const { result } = renderHook(() => useImportDashboardStore());
      expect(result.current.isOpen).toBe(false);
    });

    it("should have preloadedFile as null", () => {
      const { result } = renderHook(() => useImportDashboardStore());
      expect(result.current.preloadedFile).toBeNull();
    });
  });

  describe("open", () => {
    it("should set isOpen to true", () => {
      const { result } = renderHook(() => useImportDashboardStore());

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it("should set preloadedFile when provided", () => {
      const { result } = renderHook(() => useImportDashboardStore());
      const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });

      act(() => {
        result.current.open({ preloadFile: mockFile });
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.preloadedFile).toBe(mockFile);
    });

    it("should leave preloadedFile as null when not provided", () => {
      const { result } = renderHook(() => useImportDashboardStore());

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.preloadedFile).toBeNull();
    });

    it("should handle opening with empty options object", () => {
      const { result } = renderHook(() => useImportDashboardStore());

      act(() => {
        result.current.open({});
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.preloadedFile).toBeNull();
    });
  });

  describe("close", () => {
    it("should set isOpen to false", () => {
      const { result } = renderHook(() => useImportDashboardStore());

      // First open the modal
      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);

      // Then close it
      act(() => {
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it("should clear preloadedFile", () => {
      const { result } = renderHook(() => useImportDashboardStore());
      const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });

      // Open with file
      act(() => {
        result.current.open({ preloadFile: mockFile });
      });

      expect(result.current.preloadedFile).toBe(mockFile);

      // Close
      act(() => {
        result.current.close();
      });

      expect(result.current.preloadedFile).toBeNull();
    });

    it("should reset both isOpen and preloadedFile", () => {
      const { result } = renderHook(() => useImportDashboardStore());
      const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });

      act(() => {
        result.current.open({ preloadFile: mockFile });
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.preloadedFile).toBe(mockFile);

      act(() => {
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.preloadedFile).toBeNull();
    });
  });

  describe("state transitions", () => {
    it("should handle multiple open/close cycles", () => {
      const { result } = renderHook(() => useImportDashboardStore());
      const mockFile1 = new File(["test1"], "test1.jpg", { type: "image/jpeg" });
      const mockFile2 = new File(["test2"], "test2.jpg", { type: "image/jpeg" });

      // First cycle
      act(() => {
        result.current.open({ preloadFile: mockFile1 });
      });
      expect(result.current.isOpen).toBe(true);
      expect(result.current.preloadedFile).toBe(mockFile1);

      act(() => {
        result.current.close();
      });
      expect(result.current.isOpen).toBe(false);
      expect(result.current.preloadedFile).toBeNull();

      // Second cycle with different file
      act(() => {
        result.current.open({ preloadFile: mockFile2 });
      });
      expect(result.current.isOpen).toBe(true);
      expect(result.current.preloadedFile).toBe(mockFile2);

      act(() => {
        result.current.close();
      });
      expect(result.current.isOpen).toBe(false);
      expect(result.current.preloadedFile).toBeNull();
    });

    it("should overwrite previous file when opening with new file", () => {
      const { result } = renderHook(() => useImportDashboardStore());
      const mockFile1 = new File(["test1"], "test1.jpg", { type: "image/jpeg" });
      const mockFile2 = new File(["test2"], "test2.jpg", { type: "image/jpeg" });

      act(() => {
        result.current.open({ preloadFile: mockFile1 });
      });
      expect(result.current.preloadedFile).toBe(mockFile1);

      act(() => {
        result.current.open({ preloadFile: mockFile2 });
      });
      expect(result.current.preloadedFile).toBe(mockFile2);
    });
  });
});
