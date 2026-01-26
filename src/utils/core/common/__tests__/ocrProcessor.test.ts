/**
 * Tests for OCR Processor utility (Backend Service)
 * Target: 85%+ code coverage
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { OCRProcessor, ocrProcessor, processReceiptImage, preloadOCR } from "../ocrProcessor";
import { ocrClient } from "@/utils/core/api/client";

// Mock logger
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock ocrClient
vi.mock("@/utils/core/api/client", () => ({
  ocrClient: {
    post: vi.fn(),
  },
}));

// Sample API response
const mockAPIResponse = {
  success: true,
  data: {
    merchant: "WALMART",
    total: 29.99,
    subtotal: 27.99,
    tax: 2.0,
    date: "2024-01-01",
    currency: "USD",
    line_items: [
      {
        description: "Milk",
        quantity: 1,
        unit_price: 4.99,
        total_price: 4.99,
        confidence: 0.9,
      },
      {
        description: "Bread",
        quantity: 2,
        unit_price: 2.5,
        total_price: 5.0,
        confidence: 0.85,
      },
    ],
    raw_text:
      "WALMART\nDate: 01/01/2024\nMilk $4.99\nBread 2 x $2.50\nSubtotal: $27.99\nTax: $2.00\nTotal: $29.99",
    confidence_scores: {
      merchant: 0.9,
      total: 0.95,
      date: 0.85,
      overall: 0.9,
    },
  },
  error: null,
  metadata: {
    engine: "tesseract",
    version: "5.0.0",
    total_duration_ms: 1500,
  },
};

describe("OCRProcessor", () => {
  let processor: OCRProcessor;

  beforeEach(() => {
    processor = new OCRProcessor();
    vi.clearAllMocks();
    (ocrClient.post as any).mockResolvedValue(mockAPIResponse);
  });

  describe("initialization", () => {
    it("should initialize processor immediately", () => {
      expect(processor.isInitialized).toBe(true);
    });

    it("should mark as initialized after initialize() call", async () => {
      await processor.initialize();
      expect(processor.isInitialized).toBe(true);
    });

    it("should handle multiple initialize() calls", async () => {
      await processor.initialize();
      await processor.initialize();
      expect(processor.isInitialized).toBe(true);
    });
  });

  describe("processImage", () => {
    it("should process base64 image string", async () => {
      const base64Image = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";

      const result = await processor.processImage(base64Image);

      expect(ocrClient.post).toHaveBeenCalledWith(
        "/receipts/extract",
        expect.objectContaining({
          image_base64: base64Image,
          options: expect.objectContaining({
            language: "eng",
            preprocessing: true,
          }),
        }),
        expect.any(Object)
      );

      expect(result.text).toBe(mockAPIResponse.data!.raw_text);
      expect(result.confidence).toBe(90); // 0.9 * 100
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    it("should process File object", async () => {
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: vi.fn(function (this: FileReader) {
          setTimeout(() => {
            // @ts-expect-error - Mocking FileReader result
            this.result = "data:image/jpeg;base64,test123";
            // @ts-expect-error - Mocking FileReader onload
            this.onload?.();
          }, 0);
        }),
      };

      const MockFileReader = vi.fn(function (this: any) {
        Object.assign(this, mockFileReader);
      });
      vi.stubGlobal("FileReader", MockFileReader);

      const result = await processor.processImage(file);

      expect(result.text).toBe(mockAPIResponse.data!.raw_text);
      expect(result.confidence).toBe(90);
    });

    it("should process with custom options", async () => {
      const base64Image = "data:image/jpeg;base64,test";

      await processor.processImage(base64Image, {
        language: "fra",
        preprocessing: false,
        psm: 11,
        oem: 1,
      });

      expect(ocrClient.post).toHaveBeenCalledWith(
        "/receipts/extract",
        expect.objectContaining({
          options: {
            language: "fra",
            preprocessing: false,
            psm: 11,
            oem: 1,
          },
        }),
        expect.any(Object)
      );
    });

    it("should throw error when API returns error", async () => {
      vi.mocked(ocrClient.post).mockResolvedValue({
        success: false,
        data: null,
        error: "Image too large",
        metadata: {},
      });

      await expect(processor.processImage("test")).rejects.toThrow("Image too large");
    });

    it("should throw error when API call fails", async () => {
      vi.mocked(ocrClient.post).mockRejectedValue(new Error("Network error"));

      await expect(processor.processImage("test")).rejects.toThrow("Network error");
    });

    it("should include retry options in request", async () => {
      await processor.processImage("test");

      const callArgs = vi.mocked(ocrClient.post).mock.calls[0]!;
      const options = callArgs[2]!;

      expect(options).toHaveProperty("maxAttempts", 2);
      expect(options).toHaveProperty("retryOptions");
      expect(options.retryOptions).toHaveProperty("shouldRetry");
    });

    it("should not retry on 400 errors", async () => {
      await processor.processImage("test");

      const callArgs = (ocrClient.post as any).mock.calls[0]!;
      const shouldRetry = callArgs[2]!.retryOptions!.shouldRetry!;

      const error400 = new Error("400 Bad Request");
      expect(shouldRetry(error400)).toBe(false);
    });

    it("should not retry on 422 errors", async () => {
      await processor.processImage("test");

      const callArgs = (ocrClient.post as any).mock.calls[0]!;
      const shouldRetry = callArgs[2]!.retryOptions!.shouldRetry!;

      const error422 = new Error("422 Unprocessable Entity");
      expect(shouldRetry(error422)).toBe(false);
    });

    it("should retry on other errors", async () => {
      await processor.processImage("test");

      const callArgs = (ocrClient.post as any).mock.calls[0]!;
      const shouldRetry = callArgs[2]!.retryOptions!.shouldRetry!;

      const error500 = new Error("500 Internal Server Error");
      expect(shouldRetry(error500)).toBe(true);
    });
  });

  describe("processReceipt", () => {
    it("should process receipt and return structured data", async () => {
      const base64Image = "data:image/jpeg;base64,test";

      const result = await processor.processReceipt(base64Image);

      expect(result.merchant).toBe("WALMART");
      expect(result.total).toBe("29.99");
      expect(result.subtotal).toBe("27.99");
      expect(result.tax).toBe("2");
      expect(result.date).toBe("2024-01-01");
      expect(result.time).toBeNull();
      expect(result.items).toHaveLength(2);
      expect(result.rawText).toBe(mockAPIResponse.data!.raw_text);
    });

    it("should map line items correctly", async () => {
      const result = await processor.processReceipt("test");

      expect(result.items[0]).toEqual({
        description: "Milk",
        amount: 4.99,
        rawLine: "Milk",
      });

      expect(result.items[1]).toEqual({
        description: "Bread",
        amount: 5.0,
        rawLine: "Bread",
      });
    });

    it("should map confidence scores", async () => {
      const result = await processor.processReceipt("test");

      expect(result.confidence.merchant).toBe("high"); // 0.9 >= 0.8
      expect(result.confidence.total).toBe("high"); // 0.95 >= 0.8
      expect(result.confidence.date).toBe("high"); // 0.85 >= 0.8
    });

    it("should map medium confidence", async () => {
      vi.mocked(ocrClient.post).mockResolvedValue({
        ...mockAPIResponse,
        data: {
          ...mockAPIResponse.data!,
          confidence_scores: {
            merchant: 0.6,
            total: 0.7,
            date: 0.5,
            overall: 0.6,
          },
        },
      });

      const result = await processor.processReceipt("test");

      expect(result.confidence.merchant).toBe("medium"); // 0.6 >= 0.5
      expect(result.confidence.total).toBe("medium"); // 0.7 >= 0.5
      expect(result.confidence.date).toBe("medium"); // 0.5 >= 0.5
    });

    it("should map low confidence", async () => {
      vi.mocked(ocrClient.post).mockResolvedValue({
        ...mockAPIResponse,
        data: {
          ...mockAPIResponse.data!,
          confidence_scores: {
            merchant: 0.3,
            total: 0.2,
            date: 0.1,
            overall: 0.2,
          },
        },
      });

      const result = await processor.processReceipt("test");

      expect(result.confidence.merchant).toBe("low"); // 0 < 0.3 < 0.5
      expect(result.confidence.total).toBe("low");
      expect(result.confidence.date).toBe("low");
    });

    it("should map no confidence", async () => {
      vi.mocked(ocrClient.post).mockResolvedValue({
        ...mockAPIResponse,
        data: {
          ...mockAPIResponse.data!,
          confidence_scores: {
            merchant: 0,
            total: 0,
            date: 0,
            overall: 0,
          },
        },
      });

      const result = await processor.processReceipt("test");

      expect(result.confidence.merchant).toBe("none");
      expect(result.confidence.total).toBe("none");
      expect(result.confidence.date).toBe("none");
    });

    it("should handle null values", async () => {
      vi.mocked(ocrClient.post).mockResolvedValue({
        ...mockAPIResponse,
        data: {
          ...mockAPIResponse.data!,
          merchant: null,
          total: null,
          subtotal: null,
          tax: null,
          date: null,
        },
      });

      const result = await processor.processReceipt("test");

      expect(result.merchant).toBeNull();
      expect(result.total).toBeNull();
      expect(result.subtotal).toBeNull();
      expect(result.tax).toBeNull();
      expect(result.date).toBeNull();
    });

    it("should handle empty line items", async () => {
      vi.mocked(ocrClient.post).mockResolvedValue({
        ...mockAPIResponse,
        data: {
          ...mockAPIResponse.data!,
          line_items: [],
        },
      });

      const result = await processor.processReceipt("test");

      expect(result.items).toEqual([]);
    });

    it("should throw error on API failure", async () => {
      vi.mocked(ocrClient.post).mockResolvedValue({
        success: false,
        data: null,
        error: "Processing failed",
        metadata: {},
      });

      await expect(processor.processReceipt("test")).rejects.toThrow("Processing failed");
    });
  });

  describe("deprecated methods", () => {
    it("should warn when using extractReceiptData", () => {
      const result = processor.extractReceiptData("test text");

      expect(result).toEqual({
        total: null,
        merchant: null,
        date: null,
        time: null,
        tax: null,
        subtotal: null,
        items: [],
        confidence: {},
      });
    });

    it("should warn when using extractLineItems", () => {
      const result = processor.extractLineItems("test text");

      expect(result).toEqual([]);
    });

    it("should warn when using cleanExtractedData", () => {
      const data = {
        total: null,
        merchant: null,
        date: null,
        time: null,
        tax: null,
        subtotal: null,
        items: [],
        confidence: {},
      };

      processor.cleanExtractedData(data);
      // Should not throw, just warn
    });
  });

  describe("getStats", () => {
    it("should return processor stats", () => {
      const stats = processor.getStats();

      expect(stats.isInitialized).toBe(true);
      expect(stats.workerStatus).toBe("backend_service");
    });
  });

  describe("cleanup", () => {
    it("should cleanup without errors", async () => {
      await expect(processor.cleanup()).resolves.not.toThrow();
    });
  });
});

describe("Utility functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (ocrClient.post as any).mockResolvedValue(mockAPIResponse);
  });

  describe("processReceiptImage", () => {
    it("should process receipt using singleton", async () => {
      const result = await processReceiptImage("test");

      expect(result.merchant).toBe("WALMART");
      expect(result.total).toBe("29.99");
    });

    it("should accept options", async () => {
      await processReceiptImage("test", { language: "fra" });

      expect(ocrClient.post).toHaveBeenCalledWith(
        "/receipts/extract",
        expect.objectContaining({
          options: expect.objectContaining({
            language: "fra",
          }),
        }),
        expect.any(Object)
      );
    });
  });

  describe("preloadOCR", () => {
    it("should preload without errors", async () => {
      await expect(preloadOCR()).resolves.not.toThrow();
    });

    it("should handle errors gracefully", async () => {
      const processor = new OCRProcessor();
      processor.initialize = vi.fn().mockRejectedValue(new Error("Init failed"));

      // Should not throw, just warn
      await expect(preloadOCR()).resolves.not.toThrow();
    });
  });
});

describe("Singleton instance", () => {
  it("should export singleton ocrProcessor", () => {
    expect(ocrProcessor).toBeInstanceOf(OCRProcessor);
    expect(ocrProcessor.isInitialized).toBe(true);
  });
});
