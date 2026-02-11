import { describe, it, expect, vi, beforeEach } from "vitest";
import { TransactionImportOrchestrator } from "../transactionImportOrchestrator";
import { ImportService } from "@/services/api/importService";
import * as importHelpers from "@/utils/domain/transactions/importHelpers";
import { validateAndNormalizeTransaction } from "@/domain/schemas/transaction";
import logger from "@/utils/core/common/logger";

// Mock dependencies
vi.mock("@/services/api/importService", () => ({
  ImportService: {
    isAvailable: vi.fn(),
    validateFile: vi.fn(),
    importTransactions: vi.fn(),
  },
}));

vi.mock("@/utils/domain/transactions/importHelpers", () => ({
  parseContentToRows: vi.fn(),
  processTransactionRow: vi.fn(),
}));

vi.mock("@/domain/schemas/transaction", () => ({
  validateAndNormalizeTransaction: vi.fn(),
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("TransactionImportOrchestrator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("processFileImport", () => {
    const mockFile = new File(["test"], "test.csv", { type: "text/csv" });
    const mockFieldMapping = { date: "Date", amount: "Amount", description: "Description" };
    const mockOnProgress = vi.fn();

    it("should process file with backend when available and preferred", async () => {
      const mockTransactions = [
        { id: "1", amount: 100, date: new Date(), type: "expense" as const },
      ];
      const mockBackendResponse = {
        success: true,
        data: {
          transactions: mockTransactions,
          invalid: [],
        },
      };

      vi.mocked(ImportService.isAvailable).mockResolvedValue(true);
      vi.mocked(ImportService.validateFile).mockReturnValue({ valid: true });
      vi.mocked(ImportService.importTransactions).mockResolvedValue(mockBackendResponse);
      vi.mocked(validateAndNormalizeTransaction).mockImplementation((tx) => tx);

      const result = await TransactionImportOrchestrator.processFileImport(
        mockFile,
        mockFieldMapping,
        true,
        mockOnProgress
      );

      expect(result.source).toBe("backend");
      expect(result.valid).toHaveLength(1);
      expect(ImportService.isAvailable).toHaveBeenCalled();
      expect(ImportService.importTransactions).toHaveBeenCalledWith(mockFile, mockFieldMapping);
      expect(mockOnProgress).toHaveBeenCalledWith(10);
      expect(mockOnProgress).toHaveBeenCalledWith(100);
    });

    it("should fallback to client-side when backend is unavailable", async () => {
      vi.mocked(ImportService.isAvailable).mockResolvedValue(false);
      vi.mocked(importHelpers.parseContentToRows).mockResolvedValue([
        { Date: "2023-01-01", Amount: "100", Description: "Test" },
      ]);
      vi.mocked(importHelpers.processTransactionRow).mockReturnValue({
        success: true,
        transaction: {
          id: "1",
          amount: 100,
          date: new Date("2023-01-01"),
          type: "expense" as const,
          description: "Test",
          category: "test",
          envelopeId: "",
          isScheduled: false,
          createdAt: Date.now(),
          lastModified: Date.now(),
        },
      });

      const result = await TransactionImportOrchestrator.processFileImport(
        mockFile,
        mockFieldMapping,
        true,
        mockOnProgress
      );

      expect(result.source).toBe("client");
      expect(result.valid).toHaveLength(1);
      expect(logger.info).toHaveBeenCalledWith("Backend not available, using client-side import");
      expect(importHelpers.parseContentToRows).toHaveBeenCalled();
    });

    it("should fallback to client-side when backend fails", async () => {
      vi.mocked(ImportService.isAvailable).mockResolvedValue(true);
      vi.mocked(ImportService.validateFile).mockReturnValue({ valid: true });
      vi.mocked(ImportService.importTransactions).mockRejectedValue(new Error("Backend error"));
      vi.mocked(importHelpers.parseContentToRows).mockResolvedValue([
        { Date: "2023-01-01", Amount: "100", Description: "Test" },
      ]);
      vi.mocked(importHelpers.processTransactionRow).mockReturnValue({
        success: true,
        transaction: {
          id: "1",
          amount: 100,
          date: new Date("2023-01-01"),
          type: "expense" as const,
          description: "Test",
          category: "test",
          envelopeId: "",
          isScheduled: false,
          createdAt: Date.now(),
          lastModified: Date.now(),
        },
      });

      const result = await TransactionImportOrchestrator.processFileImport(
        mockFile,
        mockFieldMapping,
        true,
        mockOnProgress
      );

      expect(result.source).toBe("client");
      expect(logger.warn).toHaveBeenCalledWith(
        "Backend import failed, falling back to client-side",
        expect.objectContaining({ error: "Backend error" })
      );
    });

    it("should use client-side when preferBackend is false", async () => {
      vi.mocked(importHelpers.parseContentToRows).mockResolvedValue([
        { Date: "2023-01-01", Amount: "100", Description: "Test" },
      ]);
      vi.mocked(importHelpers.processTransactionRow).mockReturnValue({
        success: true,
        transaction: {
          id: "1",
          amount: 100,
          date: new Date("2023-01-01"),
          type: "expense" as const,
          description: "Test",
          category: "test",
          envelopeId: "",
          isScheduled: false,
          createdAt: Date.now(),
          lastModified: Date.now(),
        },
      });

      const result = await TransactionImportOrchestrator.processFileImport(
        mockFile,
        mockFieldMapping,
        false,
        mockOnProgress
      );

      expect(result.source).toBe("client");
      expect(ImportService.isAvailable).not.toHaveBeenCalled();
    });

    it("should handle client-side file parsing errors", async () => {
      vi.mocked(ImportService.isAvailable).mockResolvedValue(false);
      vi.mocked(importHelpers.parseContentToRows).mockRejectedValue(
        new Error("File parsing failed")
      );

      await expect(
        TransactionImportOrchestrator.processFileImport(
          mockFile,
          mockFieldMapping,
          true,
          mockOnProgress
        )
      ).rejects.toThrow("File parsing failed");

      expect(logger.error).toHaveBeenCalledWith(
        "Client-side file parsing failed",
        expect.any(Error)
      );
    });

    it("should filter out transactions that fail client-side validation", async () => {
      const mockTransactions = [
        { id: "1", amount: 100, date: new Date(), type: "expense" as const },
        { id: "2", amount: 200, date: new Date(), type: "income" as const },
      ];
      const mockBackendResponse = {
        success: true,
        data: {
          transactions: mockTransactions,
          invalid: [],
        },
      };

      vi.mocked(ImportService.isAvailable).mockResolvedValue(true);
      vi.mocked(ImportService.validateFile).mockReturnValue({ valid: true });
      vi.mocked(ImportService.importTransactions).mockResolvedValue(mockBackendResponse);
      vi.mocked(validateAndNormalizeTransaction)
        .mockImplementationOnce((tx) => tx)
        .mockImplementationOnce(() => {
          throw new Error("Validation failed");
        });

      const result = await TransactionImportOrchestrator.processFileImport(
        mockFile,
        mockFieldMapping,
        true,
        mockOnProgress
      );

      expect(result.valid).toHaveLength(1);
      expect(result.valid[0].id).toBe("1");
      expect(logger.warn).toHaveBeenCalledWith(
        "Backend transaction failed client-side validation",
        expect.anything()
      );
    });

    it("should handle backend returning invalid data structure", async () => {
      vi.mocked(ImportService.isAvailable).mockResolvedValue(true);
      vi.mocked(ImportService.validateFile).mockReturnValue({ valid: true });
      vi.mocked(ImportService.importTransactions).mockResolvedValue({
        success: false,
        error: "Import failed",
      });
      vi.mocked(importHelpers.parseContentToRows).mockResolvedValue([]);
      vi.mocked(importHelpers.processTransactionRow).mockReturnValue({
        success: false,
        errors: ["Error"],
      });

      const result = await TransactionImportOrchestrator.processFileImport(
        mockFile,
        mockFieldMapping,
        true,
        mockOnProgress
      );

      expect(result.source).toBe("client");
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe("processTransactions", () => {
    const mockFieldMapping = {
      amount: "Amount",
      date: "Date",
      description: "Description",
      category: "Category",
      notes: "Notes",
    };
    const mockOnProgress = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should process valid transactions from array", async () => {
      const mockData = [
        { Date: "2023-01-01", Amount: "100", Description: "Test 1" },
        { Date: "2023-01-02", Amount: "200", Description: "Test 2" },
      ];

      vi.mocked(importHelpers.processTransactionRow)
        .mockReturnValueOnce({
          success: true,
          transaction: {
            id: "1",
            amount: 100,
            date: new Date("2023-01-01"),
            type: "expense" as const,
            description: "Test 1",
            category: "test",
            envelopeId: "",
            isScheduled: false,
            createdAt: Date.now(),
            lastModified: Date.now(),
          },
        })
        .mockReturnValueOnce({
          success: true,
          transaction: {
            id: "2",
            amount: 200,
            date: new Date("2023-01-02"),
            type: "expense" as const,
            description: "Test 2",
            category: "test",
            envelopeId: "",
            isScheduled: false,
            createdAt: Date.now(),
            lastModified: Date.now(),
          },
        });

      const result = await TransactionImportOrchestrator.processTransactions(
        mockData,
        mockFieldMapping,
        mockOnProgress
      );

      expect(result.valid).toHaveLength(2);
      expect(result.invalid).toHaveLength(0);
      expect(result.source).toBe("client");
      expect(mockOnProgress).toHaveBeenCalledWith(100);
    });

    it("should handle object with data property", async () => {
      const mockData = {
        data: [{ Date: "2023-01-01", Amount: "100", Description: "Test" }],
      };

      vi.mocked(importHelpers.processTransactionRow).mockReturnValue({
        success: true,
        transaction: {
          id: "1",
          amount: 100,
          date: new Date("2023-01-01"),
          type: "expense" as const,
          description: "Test",
          category: "test",
          envelopeId: "",
          isScheduled: false,
          createdAt: Date.now(),
          lastModified: Date.now(),
        },
      });

      const result = await TransactionImportOrchestrator.processTransactions(
        mockData,
        mockFieldMapping,
        mockOnProgress
      );

      expect(result.valid).toHaveLength(1);
    });

    it("should collect invalid rows with errors", async () => {
      const mockData = [
        { Date: "2023-01-01", Amount: "100", Description: "Test 1" },
        { Date: "invalid", Amount: "not-a-number", Description: "Test 2" },
      ];

      vi.mocked(importHelpers.processTransactionRow)
        .mockReturnValueOnce({
          success: true,
          transaction: {
            id: "1",
            amount: 100,
            date: new Date("2023-01-01"),
            type: "expense" as const,
            description: "Test 1",
            category: "test",
            envelopeId: "",
            isScheduled: false,
            createdAt: Date.now(),
            lastModified: Date.now(),
          },
        })
        .mockReturnValueOnce({
          success: false,
          errors: ["Invalid date", "Invalid amount"],
        });

      const result = await TransactionImportOrchestrator.processTransactions(
        mockData,
        mockFieldMapping,
        mockOnProgress
      );

      expect(result.valid).toHaveLength(1);
      expect(result.invalid).toHaveLength(1);
      expect(result.invalid[0]).toEqual({
        index: 1,
        row: mockData[1],
        errors: ["Invalid date", "Invalid amount"],
      });
    });

    it("should handle empty data arrays", async () => {
      const result = await TransactionImportOrchestrator.processTransactions(
        [],
        mockFieldMapping,
        mockOnProgress
      );

      expect(result.valid).toHaveLength(0);
      expect(result.invalid).toHaveLength(0);
      expect(mockOnProgress).toHaveBeenCalledWith(100);
    });

    it("should call progress callback during processing", async () => {
      const mockData = Array.from({ length: 100 }, (_, i) => ({
        Date: "2023-01-01",
        Amount: "100",
        Description: `Test ${i}`,
      }));

      vi.mocked(importHelpers.processTransactionRow).mockReturnValue({
        success: true,
        transaction: {
          id: "1",
          amount: 100,
          date: new Date("2023-01-01"),
          type: "expense" as const,
          description: "Test",
          category: "test",
          envelopeId: "",
          isScheduled: false,
          createdAt: Date.now(),
          lastModified: Date.now(),
        },
      });

      await TransactionImportOrchestrator.processTransactions(
        mockData,
        mockFieldMapping,
        mockOnProgress
      );

      // Progress should be called multiple times
      expect(mockOnProgress.mock.calls.length).toBeGreaterThan(10);
      // Last call should be 100
      expect(mockOnProgress).toHaveBeenCalledWith(100);
    });

    it("should yield control every 50 items for large datasets", async () => {
      const mockData = Array.from({ length: 150 }, (_, i) => ({
        Date: "2023-01-01",
        Amount: "100",
        Description: `Test ${i}`,
      }));

      vi.mocked(importHelpers.processTransactionRow).mockReturnValue({
        success: true,
        transaction: {
          id: "1",
          amount: 100,
          date: new Date("2023-01-01"),
          type: "expense" as const,
          description: "Test",
          category: "test",
          envelopeId: "",
          isScheduled: false,
          createdAt: Date.now(),
          lastModified: Date.now(),
        },
      });

      const result = await TransactionImportOrchestrator.processTransactions(
        mockData,
        mockFieldMapping,
        mockOnProgress
      );

      expect(result.valid).toHaveLength(150);
    });

    it("should handle rows with missing success/errors properties", async () => {
      const mockData = [{ Date: "2023-01-01", Amount: "100", Description: "Test" }];

      vi.mocked(importHelpers.processTransactionRow).mockReturnValue({
        success: false,
      } as never);

      const result = await TransactionImportOrchestrator.processTransactions(
        mockData,
        mockFieldMapping,
        mockOnProgress
      );

      expect(result.valid).toHaveLength(0);
      expect(result.invalid).toHaveLength(1);
      expect(result.invalid[0].errors).toEqual(["Unknown error"]);
    });
  });
});
