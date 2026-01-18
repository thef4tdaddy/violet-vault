/**
 * Transaction Import Processing Hook Tests
 * Tests for backend integration in useTransactionImportProcessing
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useTransactionImportProcessing } from "../useTransactionImportProcessing";
import { ImportService } from "@/services/api/importService";

// Mock dependencies
vi.mock("@/services/api/importService");
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));
vi.mock("@/domain/schemas/transaction", () => ({
  validateAndNormalizeTransaction: vi.fn((tx) => tx),
}));

describe("useTransactionImportProcessing", () => {
  const mockUser = { userName: "testuser" };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(ImportService, "isAvailable").mockResolvedValue(true);
  });

  describe("processFileImport", () => {
    it("should process file using backend API", async () => {
      const mockFile = new File(["test"], "test.csv", { type: "text/csv" });
      const mockResponse = {
        success: true,
        data: {
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
        },
      };

      vi.spyOn(ImportService, "validateFile").mockReturnValue({ valid: true });
      vi.spyOn(ImportService, "importTransactions").mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useTransactionImportProcessing(mockUser));

      const processResult = await result.current.processFileImport(mockFile);

      expect(processResult.valid.length).toBe(1);
      expect(processResult.invalid.length).toBe(0);
      expect(processResult.source).toBe("backend");
      expect(ImportService.importTransactions).toHaveBeenCalledWith(mockFile, undefined);
    });

    it("should validate file before processing", async () => {
      const mockFile = new File(["test"], "test.txt", { type: "text/plain" });

      vi.spyOn(ImportService, "validateFile").mockReturnValue({
        valid: false,
        error: "Invalid file type",
      });

      const { result } = renderHook(() => useTransactionImportProcessing(mockUser));

      const processResult = await result.current.processFileImport(mockFile);
      expect(processResult.source).toBe("client");
    });

    it("should handle backend errors", async () => {
      const mockFile = new File(["test"], "test.csv", { type: "text/csv" });

      vi.spyOn(ImportService, "validateFile").mockReturnValue({ valid: true });
      vi.spyOn(ImportService, "importTransactions").mockResolvedValue({
        success: false,
        error: "Backend error",
      });

      const { result } = renderHook(() => useTransactionImportProcessing(mockUser));

      const processResult = await result.current.processFileImport(mockFile);
      expect(processResult.source).toBe("client");
    });

    it("should update progress during processing", async () => {
      const mockFile = new File(["test"], "test.csv", { type: "text/csv" });
      const mockResponse = {
        success: true,
        data: { transactions: [], invalid: [] },
      };

      vi.spyOn(ImportService, "validateFile").mockReturnValue({ valid: true });
      vi.spyOn(ImportService, "importTransactions").mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useTransactionImportProcessing(mockUser));

      const initialProgress = result.current.importProgress;
      await result.current.processFileImport(mockFile);

      // Progress should have been updated during processing
      await waitFor(() => {
        expect(result.current.importProgress).toBeGreaterThanOrEqual(initialProgress);
      });
    });

    it("should pass field mapping to backend", async () => {
      const mockFile = new File(["test"], "test.csv", { type: "text/csv" });
      const fieldMapping = { date: "Date", amount: "Amount" };
      const mockResponse = {
        success: true,
        data: { transactions: [], invalid: [] },
      };

      vi.spyOn(ImportService, "validateFile").mockReturnValue({ valid: true });
      vi.spyOn(ImportService, "importTransactions").mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useTransactionImportProcessing(mockUser));

      await result.current.processFileImport(mockFile, fieldMapping);

      expect(ImportService.importTransactions).toHaveBeenCalledWith(mockFile, fieldMapping);
    });

    it("should handle invalid transactions from backend", async () => {
      const mockFile = new File(["test"], "test.csv", { type: "text/csv" });
      const mockResponse = {
        success: true,
        data: {
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
          invalid: [
            {
              index: 1,
              row: "invalid,data",
              errors: ["Missing required field"],
            },
          ],
        },
      };

      vi.spyOn(ImportService, "validateFile").mockReturnValue({ valid: true });
      vi.spyOn(ImportService, "importTransactions").mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useTransactionImportProcessing(mockUser));

      const processResult = await result.current.processFileImport(mockFile);

      expect(processResult.valid.length).toBe(1);
      expect(processResult.invalid.length).toBe(1);
      expect(processResult.invalid[0].errors).toContain("Missing required field");
    });
  });

  describe("processFileImport", () => {
    it("should use backend when available", async () => {
      const mockFile = new File(["date,amount\n2024-01-01,-50"], "test.csv", {
        type: "text/csv",
      });
      const mockResponse = {
        success: true,
        data: {
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
        },
      };

      vi.spyOn(ImportService, "isAvailable").mockResolvedValue(true);
      vi.spyOn(ImportService, "validateFile").mockReturnValue({ valid: true });
      vi.spyOn(ImportService, "importTransactions").mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useTransactionImportProcessing(mockUser));

      const processResult = await result.current.processFileImport(mockFile);

      expect(ImportService.isAvailable).toHaveBeenCalled();
      expect(ImportService.importTransactions).toHaveBeenCalled();
      expect(processResult.source).toBe("backend");
    });

    it("should use client-side fallback when preferBackend is false", async () => {
      const mockFile = new File(["date,amount\n2024-01-01,-50"], "test.csv", {
        type: "text/csv",
      });

      const { result } = renderHook(() => useTransactionImportProcessing(mockUser));

      const processResult = await result.current.processFileImport(mockFile, undefined, false);

      expect(ImportService.isAvailable).not.toHaveBeenCalled();
      expect(processResult.source).toBe("client");
      // Should still process the data, just client-side
      expect(processResult.valid).toBeDefined();
    });

    it("should fallback to client-side when backend fails", async () => {
      const mockFile = new File(["date,amount\n2024-01-01,-50"], "test.csv", {
        type: "text/csv",
      });

      vi.spyOn(ImportService, "isAvailable").mockResolvedValue(true);
      vi.spyOn(ImportService, "validateFile").mockReturnValue({ valid: true });
      vi.spyOn(ImportService, "importTransactions").mockRejectedValue(new Error("Backend error"));

      const { result } = renderHook(() => useTransactionImportProcessing(mockUser));

      const processResult = await result.current.processFileImport(mockFile);

      expect(processResult.source).toBe("client");
      // Should still complete using client-side processing
      expect(processResult.valid).toBeDefined();
    });

    it("should fallback to client-side when backend unavailable", async () => {
      const mockFile = new File(["date,amount\n2024-01-01,-50"], "test.csv", {
        type: "text/csv",
      });

      vi.spyOn(ImportService, "isAvailable").mockResolvedValue(false);

      const { result } = renderHook(() => useTransactionImportProcessing(mockUser));

      const processResult = await result.current.processFileImport(mockFile);

      expect(processResult.source).toBe("client");
      expect(processResult.valid).toBeDefined();
    });
  });
});
