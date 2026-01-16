import { describe, it, expect, vi, beforeEach } from "vitest";
import { ImportService } from "../importService";
import { ApiClient } from "@/services/api/client";
import logger from "@/utils/core/common/logger";
import * as csvParser from "@/utils/data/dataManagement/csvParser";
import * as transactionMapper from "@/utils/data/dataManagement/transactionMapper";

// Mock dependencies
vi.mock("@/services/api/client", () => ({
  ApiClient: {
    post: vi.fn(),
    isOnline: vi.fn().mockReturnValue(true),
    healthCheck: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/utils/data/dataManagement/csvParser", () => ({
  parseCSV: vi.fn(),
  readFileAsText: vi.fn(),
  autoDetectFieldMapping: vi.fn(),
}));

vi.mock("@/utils/data/dataManagement/transactionMapper", () => ({
  mapRowsToTransactions: vi.fn(),
}));

describe("Import Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("importTransactions", () => {
    const mockFile = new File(["test"], "test.csv", { type: "text/csv" });

    it("should use backend when available and preferred", async () => {
      (ApiClient.post as any).mockResolvedValue({
        success: true,
        data: { transactions: [{ id: "1" }], invalid: [] },
      });

      const result = await ImportService.importTransactions(mockFile);

      expect(result.success).toBe(true);
      expect(ApiClient.post).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("via Go backend"),
        expect.anything()
      );
    });

    it("should fallback to client-side if backend fails", async () => {
      // Backend fail
      (ApiClient.post as any).mockResolvedValue({ success: false, error: "Backend error" });

      // Client-side mocks
      (csvParser.readFileAsText as any).mockResolvedValue("date,amount\n2023-01-01,10");
      (csvParser.parseCSV as any).mockReturnValue({
        headers: ["date", "amount"],
        rows: [["2023-01-01", "10"]],
        errors: [],
      });
      (csvParser.autoDetectFieldMapping as any).mockReturnValue({ date: "date", amount: "amount" });
      (transactionMapper.mapRowsToTransactions as any).mockReturnValue({
        transactions: [{ id: "client-1" }],
        invalid: [],
      });

      const result = await ImportService.importTransactions(mockFile);

      expect(result.success).toBe(true);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Backend import failed"),
        expect.anything()
      );
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("via client-side parsing"),
        expect.anything()
      );
    });

    it("should use client-side immediately if forced", async () => {
      (csvParser.readFileAsText as any).mockResolvedValue("date,amount\n2023-01-01,10");
      (csvParser.parseCSV as any).mockReturnValue({
        headers: ["date", "amount"],
        rows: [["2023-01-01", "10"]],
        errors: [],
      });
      (csvParser.autoDetectFieldMapping as any).mockReturnValue({ date: "date", amount: "amount" });
      (transactionMapper.mapRowsToTransactions as any).mockReturnValue({
        transactions: [],
        invalid: [],
      });

      await ImportService.importTransactions(mockFile, undefined, { forceClientSide: true });

      expect(ApiClient.post).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("client-side import (forced)"),
        expect.anything()
      );
    });
  });

  describe("validateFile", () => {
    it("should accept valid CSV and JSON files under 10MB", () => {
      const csvFile = new File(["test"], "test.csv", { type: "text/csv" });
      const jsonFile = new File(["test"], "test.json", { type: "application/json" });

      expect(ImportService.validateFile(csvFile).valid).toBe(true);
      expect(ImportService.validateFile(jsonFile).valid).toBe(true);
    });

    it("should reject unsupported file types", () => {
      const txtFile = new File(["test"], "test.txt", { type: "text/plain" });
      const result = ImportService.validateFile(txtFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid file type");
    });

    it("should reject files over 10MB", () => {
      const largeFile = new File(["".padStart(11 * 1024 * 1024, "a")], "large.csv");
      const result = ImportService.validateFile(largeFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("exceeds 10MB limit");
    });
  });

  describe("isAvailable", () => {
    it("should return true when ApiClient is online and healthCheck passes", async () => {
      (ApiClient.isOnline as any).mockReturnValue(true);
      (ApiClient.healthCheck as any).mockResolvedValue(true);
      expect(await ImportService.isAvailable()).toBe(true);
    });

    it("should return false when ApiClient is offline", async () => {
      (ApiClient.isOnline as any).mockReturnValue(false);
      expect(await ImportService.isAvailable()).toBe(false);
    });
  });

  describe("autoDetectFieldMapping", () => {
    it("should correctly detect date and amount fields", () => {
      const headers = ["Txn Date", "Transaction Amount", "Payee"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.date).toBe("Txn Date");
      expect(mapping.amount).toBe("Transaction Amount");
      expect(mapping.description).toBe("Payee");
    });
  });
});
