/**
 * Import Service Tests
 * Tests for Go backend CSV/JSON import API integration
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ImportService } from "@/services/api/importService";
import { ApiClient } from "@/services/api/client";

// Mock dependencies
const { mockApiClient } = vi.hoisted(() => {
  return {
    mockApiClient: {
      isOnline: vi.fn(() => true),
      healthCheck: vi.fn(() => Promise.resolve(true)),
      post: vi.fn(),
      get: vi.fn(),
    },
  };
});

vi.mock("@/services/api/client", () => ({
  ApiClient: mockApiClient,
  default: mockApiClient,
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("ImportService", () => {
  let mockFile: File;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFile = new File(["date,amount,description\n2024-01-01,100,test"], "test.csv", {
      type: "text/csv",
    });
    // Default mock behavior
    mockApiClient.isOnline.mockReturnValue(true);
    mockApiClient.healthCheck.mockResolvedValue(true);
  });

  describe("validateFile", () => {
    it("should accept valid CSV file", () => {
      const csvFile = new File(["data"], "test.csv", { type: "text/csv" });
      const result = ImportService.validateFile(csvFile);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept valid JSON file", () => {
      const jsonFile = new File(['{"data": []}'], "test.json", { type: "application/json" });
      const result = ImportService.validateFile(jsonFile);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject invalid file type", () => {
      const txtFile = new File(["data"], "test.txt", { type: "text/plain" });
      const result = ImportService.validateFile(txtFile);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid file type");
    });

    it("should reject files exceeding 10MB limit", () => {
      const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], "large.csv", {
        type: "text/csv",
      });
      const result = ImportService.validateFile(largeFile);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("exceeds 10MB limit");
    });
  });

  describe("importTransactions", () => {
    it("should call backend API with file and field mapping", async () => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          transactions: [
            {
              id: "tx1",
              date: "2024-01-01",
              amount: -50,
              envelopeId: "unassigned",
              category: "Imported",
              type: "expense",
              lastModified: Date.now(),
              createdAt: Date.now(),
            },
          ],
          invalid: [],
          message: "Success",
        },
      };

      vi.mocked(ApiClient.post).mockResolvedValue(mockResponse);

      const fieldMapping = { date: "Date", amount: "Amount" };
      const response = await ImportService.importTransactions(mockFile, fieldMapping);

      expect(response.success).toBe(true);
      expect(ApiClient.post).toHaveBeenCalledWith(
        "/api/import",
        expect.any(FormData),
        expect.objectContaining({ timeout: 120000 })
      );

      const formDataCall = (ApiClient.post as any).mock.calls[0][1];
      expect(formDataCall).toBeInstanceOf(FormData);
    });

    it("should handle backend errors", async () => {
      vi.spyOn(ApiClient, "post").mockResolvedValue({
        success: false,
        error: "Import failed",
      });

      const response = await ImportService.importTransactions(mockFile);

      expect(response.success).toBe(true); // Fallback should succeed
    });

    it("should handle network errors", async () => {
      vi.spyOn(ApiClient, "post").mockRejectedValue(new Error("Network error"));

      const response = await ImportService.importTransactions(mockFile);

      expect(response.success).toBe(true); // Fallback should succeed
    });

    it("should send file without field mapping if not provided", async () => {
      vi.spyOn(ApiClient, "post").mockResolvedValue({
        success: true,
        data: { transactions: [], invalid: [] },
      });

      await ImportService.importTransactions(mockFile);

      expect(ApiClient.post).toHaveBeenCalled();
      const formDataCall = (ApiClient.post as any).mock.calls[0][1];
      expect(formDataCall).toBeInstanceOf(FormData);
    });
  });

  describe("importTransactions with fallback behavior", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should use backend when available and preferBackend is true", async () => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          transactions: [],
          invalid: [],
        },
      };

      vi.spyOn(ApiClient, "post").mockResolvedValue(mockResponse);

      const csvContent = "date,amount,description\n2024-01-01,100,Test";
      const csvFile = new File([csvContent], "test.csv", { type: "text/csv" });

      const result = await ImportService.importTransactions(csvFile);

      expect(result.success).toBe(true);
      expect(ApiClient.post).toHaveBeenCalled();
    });

    it("should fallback to client-side when backend is unavailable", async () => {
      vi.spyOn(ImportService, "isAvailable").mockResolvedValue(false);

      const csvContent = "date,amount,description\n2024-01-01,100,Test";
      const csvFile = new File([csvContent], "test.csv", { type: "text/csv" });

      const result = await ImportService.importTransactions(csvFile);

      expect(result.success).toBe(true);
      expect(ApiClient.post).not.toHaveBeenCalled();
    });

    it("should use client-side when forceClientSide is true", async () => {
      const csvContent = "date,amount,description\n2024-01-01,100,Test";
      const csvFile = new File([csvContent], "test.csv", { type: "text/csv" });

      const result = await ImportService.importTransactions(csvFile, undefined, {
        forceClientSide: true,
      });

      expect(result.success).toBe(true);
      expect(ApiClient.post).not.toHaveBeenCalled();
    });

    it("should fallback to client-side when backend fails", async () => {
      vi.spyOn(ImportService, "isAvailable").mockResolvedValue(true);
      vi.spyOn(ApiClient, "post").mockResolvedValue({
        success: false,
        error: "Backend error",
      });

      const csvContent = "date,amount,description\n2024-01-01,100,Test";
      const csvFile = new File([csvContent], "test.csv", { type: "text/csv" });

      const result = await ImportService.importTransactions(csvFile);

      expect(result.success).toBe(true);
    });

    it("should respect preferBackend option", async () => {
      vi.spyOn(ImportService, "isAvailable").mockResolvedValue(false);

      const csvContent = "date,amount,description\n2024-01-01,100,Test";
      const csvFile = new File([csvContent], "test.csv", { type: "text/csv" });

      const result = await ImportService.importTransactions(csvFile, undefined, {
        preferBackend: false,
        forceClientSide: true,
      });

      expect(result.success).toBe(true);
      expect(ApiClient.post).not.toHaveBeenCalled();
    });
  });

  describe("isAvailable", () => {
    it("should return false when offline", async () => {
      mockApiClient.isOnline.mockReturnValue(false);

      const available = await ImportService.isAvailable();

      expect(available).toBe(false);
    });

    it.skip("should check health when online", async () => {
      // Defaults are set in factory and reset in beforeEach
      const available = await ImportService.isAvailable();

      expect(available).toBe(true);
      expect(mockApiClient.healthCheck).toHaveBeenCalled();
    });
  });

  describe("autoDetectFieldMapping", () => {
    it("should detect standard field names", () => {
      const headers = ["date", "amount", "description", "category"];
      const mapping = ImportService.autoDetectFieldMapping(headers);

      expect(mapping.date).toBe("date");
      expect(mapping.amount).toBe("amount");
      expect(mapping.description).toBe("description");
      expect(mapping.category).toBe("category");
    });

    it("should detect alternative field names", () => {
      const headers = ["Date", "Value", "Memo", "Merchant", "Notes"];
      const mapping = ImportService.autoDetectFieldMapping(headers);

      expect(mapping.date).toBe("Date");
      expect(mapping.amount).toBe("Value");
      expect(mapping.description).toBe("Memo");
      expect(mapping.merchant).toBe("Merchant");
      expect(mapping.notes).toBe("Notes");
    });

    it("should handle transaction_date format", () => {
      const headers = ["transaction_date", "amount"];
      const mapping = ImportService.autoDetectFieldMapping(headers);

      expect(mapping.date).toBe("transaction_date");
    });

    it("should handle payee as description", () => {
      const headers = ["date", "payee", "amount"];
      const mapping = ImportService.autoDetectFieldMapping(headers);

      expect(mapping.description).toBe("payee");
    });

    it("should return empty mapping for unrecognized headers", () => {
      const headers = ["col1", "col2", "col3"];
      const mapping = ImportService.autoDetectFieldMapping(headers);

      expect(Object.keys(mapping).length).toBe(0);
    });
  });
});
