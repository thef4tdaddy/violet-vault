/**
 * Tests for ScreenshotService
 * Testing screenshot capture, compression, and utility functions
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ScreenshotService } from "../screenshotService.js";

// Mock logger
vi.mock("../../../utils/common/logger.js", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("ScreenshotService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("detectMobileDevice", () => {
    it("should detect mobile user agents", () => {
      const originalUserAgent = navigator.userAgent;

      // Mock mobile user agent
      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        value: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
      });

      expect(ScreenshotService.detectMobileDevice()).toBe(true);

      // Restore original
      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        value: originalUserAgent,
      });
    });

    it("should detect desktop user agents", () => {
      const originalUserAgent = navigator.userAgent;

      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      });

      expect(ScreenshotService.detectMobileDevice()).toBe(false);

      Object.defineProperty(navigator, "userAgent", {
        writable: true,
        value: originalUserAgent,
      });
    });

    it("should detect mobile based on window width", () => {
      const originalInnerWidth = window.innerWidth;

      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 500,
      });

      expect(ScreenshotService.detectMobileDevice()).toBe(true);

      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: originalInnerWidth,
      });
    });
  });

  describe("getScreenshotInfo", () => {
    it("should return null for null input", () => {
      expect(ScreenshotService.getScreenshotInfo(null)).toBeNull();
    });

    it("should calculate file size correctly", () => {
      const testDataUrl =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
      const info = ScreenshotService.getScreenshotInfo(testDataUrl);

      expect(info).toBeTruthy();
      expect(info.format).toBe("png");
      expect(info.sizeKB).toBe(0); // Very small test image
      expect(info.timestamp).toBeTruthy();
    });

    it("should detect JPEG format", () => {
      const testDataUrl =
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/AP/Z";
      const info = ScreenshotService.getScreenshotInfo(testDataUrl);

      expect(info.format).toBe("jpeg");
    });

    it("should detect WebP format", () => {
      const testDataUrl =
        "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA";
      const info = ScreenshotService.getScreenshotInfo(testDataUrl);

      expect(info.format).toBe("webp");
    });
  });

  describe("compressScreenshot", () => {
    // Create a mock canvas and context for testing
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
        drawImage: vi.fn(),
      })),
      toDataURL: vi.fn(() => "data:image/jpeg;base64,compressed"),
    };

    beforeEach(() => {
      // Mock document.createElement for canvas
      vi.spyOn(document, "createElement").mockImplementation((tagName: string): HTMLElement => {
        if (tagName === "canvas") return mockCanvas as unknown as HTMLElement;
        return document.createElement(tagName);
      });

      // Mock Image constructor
      global.Image = class MockImage {
        width = 0;
        height = 0;
        onload: (() => void) | null = null;
        onerror: ((error: Error) => void) | null = null;
        
        constructor() {
          setTimeout(() => {
            this.width = 1920;
            this.height = 1080;
            if (this.onload) this.onload();
          }, 0);
        }
      } as unknown as typeof Image;
    });

    it("should compress screenshot with default options", async () => {
      const testDataUrl = "data:image/png;base64,test";

      const compressed = await ScreenshotService.compressScreenshot(testDataUrl);

      expect(compressed).toBe("data:image/jpeg;base64,compressed");
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith("image/jpeg", 0.7);
    });

    it("should use custom compression options", async () => {
      const testDataUrl = "data:image/png;base64,test";
      const options = {
        quality: 0.5,
        maxWidth: 1280,
        maxHeight: 720,
        format: "webp",
      };

      await ScreenshotService.compressScreenshot(testDataUrl, options);

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith("image/webp", 0.5);
    });

    it("should return original on compression error", async () => {
      global.Image = class MockImage {
        width = 0;
        height = 0;
        onload: (() => void) | null = null;
        onerror: ((error: Error) => void) | null = null;
        
        constructor() {
          setTimeout(() => {
            if (this.onerror) this.onerror(new Error("Test error"));
          }, 0);
        }
      } as unknown as typeof Image;

      const testDataUrl = "data:image/png;base64,test";
      const result = await ScreenshotService.compressScreenshot(testDataUrl);

      expect(result).toBe(testDataUrl);
    });
  });

  describe("autoCompressScreenshot", () => {
    it("should not compress small screenshots", async () => {
      const smallDataUrl = "data:image/png;base64,small"; // <200KB

      vi.spyOn(ScreenshotService, "getScreenshotInfo").mockReturnValue({
        size: 100 * 1024,
        sizeKB: 100,
        format: "png",
        timestamp: new Date().toISOString(),
      });

      const result = await ScreenshotService.autoCompressScreenshot(smallDataUrl);
      expect(result).toBe(smallDataUrl);
    });

    it("should apply light compression for medium screenshots", async () => {
      const mediumDataUrl = "data:image/png;base64,medium";

      vi.spyOn(ScreenshotService, "getScreenshotInfo").mockReturnValue({
        size: 300 * 1024,
        sizeKB: 300,
        format: "png",
        timestamp: new Date().toISOString(),
      });

      vi.spyOn(ScreenshotService, "compressScreenshot").mockResolvedValue("compressed");

      const result = await ScreenshotService.autoCompressScreenshot(mediumDataUrl);
      expect(result).toBe("compressed");
      expect(ScreenshotService.compressScreenshot).toHaveBeenCalledWith(mediumDataUrl, {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
        format: "jpeg",
      });
    });

    it("should apply moderate compression for large screenshots", async () => {
      const largeDataUrl = "data:image/png;base64,large";

      vi.spyOn(ScreenshotService, "getScreenshotInfo").mockReturnValue({
        size: 700 * 1024,
        sizeKB: 700,
        format: "png",
        timestamp: new Date().toISOString(),
      });

      vi.spyOn(ScreenshotService, "compressScreenshot").mockResolvedValue("compressed");

      await ScreenshotService.autoCompressScreenshot(largeDataUrl);

      expect(ScreenshotService.compressScreenshot).toHaveBeenCalledWith(largeDataUrl, {
        quality: 0.6,
        maxWidth: 1600,
        maxHeight: 900,
        format: "jpeg",
      });
    });

    it("should apply aggressive compression for very large screenshots", async () => {
      const veryLargeDataUrl = "data:image/png;base64,verylarge";

      vi.spyOn(ScreenshotService, "getScreenshotInfo").mockReturnValue({
        size: 1500 * 1024,
        sizeKB: 1500,
        format: "png",
        timestamp: new Date().toISOString(),
      });

      vi.spyOn(ScreenshotService, "compressScreenshot").mockResolvedValue("compressed");

      await ScreenshotService.autoCompressScreenshot(veryLargeDataUrl);

      expect(ScreenshotService.compressScreenshot).toHaveBeenCalledWith(veryLargeDataUrl, {
        quality: 0.5,
        maxWidth: 1280,
        maxHeight: 720,
        format: "jpeg",
      });
    });
  });

  describe("captureManualCanvas", () => {
    beforeEach(() => {
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          fillStyle: "",
          fillRect: vi.fn(),
          fillText: vi.fn(),
          font: "",
          textAlign: "",
        })),
        toDataURL: vi.fn(() => "data:image/png;base64,manual"),
      };

      vi.spyOn(document, "createElement").mockImplementation((tagName: string): HTMLElement => {
        if (tagName === "canvas") return mockCanvas as unknown as HTMLElement;
        return document.createElement(tagName);
      });
    });

    it("should create manual canvas screenshot", async () => {
      const result = await ScreenshotService.captureManualCanvas();

      expect(result).toBe("data:image/png;base64,manual");
    });

    it("should handle errors gracefully", async () => {
      vi.spyOn(document, "createElement").mockImplementation(() => {
        throw new Error("Canvas creation failed");
      });

      const result = await ScreenshotService.captureManualCanvas();

      expect(result).toBeNull();
    });
  });
});
