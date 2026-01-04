/**
 * Import Service Tests
 * Tests for Go backend CSV/JSON import API integration
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ImportService } from "../importService";
import { ApiClient } from "../client";

// Mock dependencies
vi.mock("../client");
vi.mock("@/utils/common/logger", () => ({
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
    mockFile = new File(["test content"], "test.csv", { type: "text/csv" });
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

      vi.spyOn(ApiClient, "post").mockResolvedValue(mockResponse);

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

      expect(response.success).toBe(false);
      expect(response.error).toBe("Import failed");
    });

    it("should handle network errors", async () => {
      vi.spyOn(ApiClient, "post").mockRejectedValue(new Error("Network error"));

      const response = await ImportService.importTransactions(mockFile);

      expect(response.success).toBe(false);
      expect(response.error).toContain("Network error");
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

  describe("isAvailable", () => {
    it("should return false when offline", async () => {
      vi.spyOn(ApiClient, "isOnline").mockReturnValue(false);

      const available = await ImportService.isAvailable();

      expect(available).toBe(false);
    });

    it("should check health when online", async () => {
      vi.spyOn(ApiClient, "isOnline").mockReturnValue(true);
      vi.spyOn(ApiClient, "healthCheck").mockResolvedValue(true);

      const available = await ImportService.isAvailable();

      expect(available).toBe(true);
      expect(ApiClient.healthCheck).toHaveBeenCalled();
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
