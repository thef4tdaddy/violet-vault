import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { ImportService } from "../importService";
import { ApiClient } from "@/services/api/client";
import logger from "@/utils/core/common/logger";
import * as csvParser from "@/utils/data/dataManagement/csvParser";
import * as transactionMapper from "@/utils/data/dataManagement/transactionMapper";
import type { Transaction } from "@/domain/schemas/transaction";
import type { ImportResponse } from "../importService";

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

  // Helper function to create mock transaction
  const createMockTransaction = (id: string): Transaction => ({
    id,
    date: new Date("2023-01-01"),
    amount: -100,
    type: "expense",
    description: "Test Transaction",
    category: "Test",
    envelopeId: "env-1",
    isScheduled: false,
    createdAt: Date.now(),
    lastModified: Date.now(),
  });

  describe("importTransactions", () => {
    const mockFile = new File(["test"], "test.csv", { type: "text/csv" });

    it("should use backend when available and preferred", async () => {
      const mockResponse = {
        success: true,
        data: { transactions: [createMockTransaction("1")], invalid: [] },
      };
      (ApiClient.post as Mock).mockResolvedValue(mockResponse);

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
      (ApiClient.post as Mock).mockResolvedValue({ success: false, error: "Backend error" });

      // Client-side mocks
      (csvParser.readFileAsText as Mock).mockResolvedValue("date,amount\n2023-01-01,10");
      (csvParser.parseCSV as Mock).mockReturnValue({
        headers: ["date", "amount"],
        rows: [["2023-01-01", "10"]],
        errors: [],
      });
      (csvParser.autoDetectFieldMapping as Mock).mockReturnValue({
        date: "date",
        amount: "amount",
      });
      (transactionMapper.mapRowsToTransactions as Mock).mockReturnValue({
        transactions: [createMockTransaction("client-1")],
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
      (csvParser.readFileAsText as Mock).mockResolvedValue("date,amount\n2023-01-01,10");
      (csvParser.parseCSV as Mock).mockReturnValue({
        headers: ["date", "amount"],
        rows: [["2023-01-01", "10"]],
        errors: [],
      });
      (csvParser.autoDetectFieldMapping as Mock).mockReturnValue({
        date: "date",
        amount: "amount",
      });
      (transactionMapper.mapRowsToTransactions as Mock).mockReturnValue({
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

    it("should fallback to client-side when backend throws exception", async () => {
      // Backend throws error
      (ApiClient.post as Mock).mockRejectedValue(new Error("Network error"));

      // Client-side mocks
      (csvParser.readFileAsText as Mock).mockResolvedValue("date,amount\n2023-01-01,10");
      (csvParser.parseCSV as Mock).mockReturnValue({
        headers: ["date", "amount"],
        rows: [["2023-01-01", "10"]],
        errors: [],
      });
      (csvParser.autoDetectFieldMapping as Mock).mockReturnValue({
        date: "date",
        amount: "amount",
      });
      (transactionMapper.mapRowsToTransactions as Mock).mockReturnValue({
        transactions: [createMockTransaction("client-1")],
        invalid: [],
      });

      const result = await ImportService.importTransactions(mockFile);

      expect(result.success).toBe(true);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Backend import"),
        expect.anything()
      );
    });

    it("should use client-side when backend is unavailable", async () => {
      // Backend unavailable
      (ApiClient.isOnline as Mock).mockReturnValue(false);

      // Client-side mocks
      (csvParser.readFileAsText as Mock).mockResolvedValue("date,amount\n2023-01-01,10");
      (csvParser.parseCSV as Mock).mockReturnValue({
        headers: ["date", "amount"],
        rows: [["2023-01-01", "10"]],
        errors: [],
      });
      (csvParser.autoDetectFieldMapping as Mock).mockReturnValue({
        date: "date",
        amount: "amount",
      });
      (transactionMapper.mapRowsToTransactions as Mock).mockReturnValue({
        transactions: [],
        invalid: [],
      });

      await ImportService.importTransactions(mockFile);

      expect(ApiClient.post).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith("Backend unavailable, using client-side import");
    });

    it("should skip backend when preferBackend is false", async () => {
      // Client-side mocks
      (csvParser.readFileAsText as Mock).mockResolvedValue("date,amount\n2023-01-01,10");
      (csvParser.parseCSV as Mock).mockReturnValue({
        headers: ["date", "amount"],
        rows: [["2023-01-01", "10"]],
        errors: [],
      });
      (csvParser.autoDetectFieldMapping as Mock).mockReturnValue({
        date: "date",
        amount: "amount",
      });
      (transactionMapper.mapRowsToTransactions as Mock).mockReturnValue({
        transactions: [],
        invalid: [],
      });

      await ImportService.importTransactions(mockFile, undefined, { preferBackend: false });

      expect(ApiClient.post).not.toHaveBeenCalled();
      expect(ApiClient.isOnline).not.toHaveBeenCalled();
    });
  });

  describe("importCSVClientSide", () => {
    const mockFile = new File(["test"], "test.csv", { type: "text/csv" });

    it("should successfully import valid CSV with field mapping", async () => {
      (csvParser.readFileAsText as Mock).mockResolvedValue("date,amount\n2023-01-01,10");
      (csvParser.parseCSV as Mock).mockReturnValue({
        headers: ["date", "amount"],
        rows: [["2023-01-01", "10"]],
        errors: [],
      });
      (transactionMapper.mapRowsToTransactions as Mock).mockReturnValue({
        transactions: [createMockTransaction("1")],
        invalid: [],
      });

      const result = await ImportService.importTransactions(
        mockFile,
        { date: "date", amount: "amount" },
        { forceClientSide: true }
      );

      expect(result.success).toBe(true);
      expect(result.data?.transactions).toHaveLength(1);
      expect(csvParser.autoDetectFieldMapping).not.toHaveBeenCalled();
    });

    it("should auto-detect field mapping when not provided", async () => {
      (csvParser.readFileAsText as Mock).mockResolvedValue("date,amount\n2023-01-01,10");
      (csvParser.parseCSV as Mock).mockReturnValue({
        headers: ["date", "amount"],
        rows: [["2023-01-01", "10"]],
        errors: [],
      });
      (csvParser.autoDetectFieldMapping as Mock).mockReturnValue({
        date: "date",
        amount: "amount",
      });
      (transactionMapper.mapRowsToTransactions as Mock).mockReturnValue({
        transactions: [createMockTransaction("1")],
        invalid: [],
      });

      const result = await ImportService.importTransactions(mockFile, undefined, {
        forceClientSide: true,
      });

      expect(result.success).toBe(true);
      expect(csvParser.autoDetectFieldMapping).toHaveBeenCalledWith(["date", "amount"]);
    });

    it("should return error when CSV parsing fails completely", async () => {
      (csvParser.readFileAsText as Mock).mockResolvedValue("invalid csv data");
      (csvParser.parseCSV as Mock).mockReturnValue({
        headers: [],
        rows: [],
        errors: [{ line: 1, error: "Parse error" }],
      });

      const result = await ImportService.importTransactions(mockFile, undefined, {
        forceClientSide: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to parse CSV");
    });

    it("should return error when required fields are missing", async () => {
      (csvParser.readFileAsText as Mock).mockResolvedValue("name,value\ntest,10");
      (csvParser.parseCSV as Mock).mockReturnValue({
        headers: ["name", "value"],
        rows: [["test", "10"]],
        errors: [],
      });
      (csvParser.autoDetectFieldMapping as Mock).mockReturnValue({
        description: "name",
        // Missing date and amount
      });

      const result = await ImportService.importTransactions(mockFile, undefined, {
        forceClientSide: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Could not detect required fields");
    });

    it("should return error when date field is missing", async () => {
      (csvParser.readFileAsText as Mock).mockResolvedValue("amount,desc\n10,test");
      (csvParser.parseCSV as Mock).mockReturnValue({
        headers: ["amount", "desc"],
        rows: [["10", "test"]],
        errors: [],
      });
      (csvParser.autoDetectFieldMapping as Mock).mockReturnValue({
        amount: "amount",
        description: "desc",
        // Missing date
      });

      const result = await ImportService.importTransactions(mockFile, undefined, {
        forceClientSide: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Could not detect required fields");
    });

    it("should return error when amount field is missing", async () => {
      (csvParser.readFileAsText as Mock).mockResolvedValue("date,desc\n2023-01-01,test");
      (csvParser.parseCSV as Mock).mockReturnValue({
        headers: ["date", "desc"],
        rows: [["2023-01-01", "test"]],
        errors: [],
      });
      (csvParser.autoDetectFieldMapping as Mock).mockReturnValue({
        date: "date",
        description: "desc",
        // Missing amount
      });

      const result = await ImportService.importTransactions(mockFile, undefined, {
        forceClientSide: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Could not detect required fields");
    });

    it("should handle CSV with partial parse errors", async () => {
      (csvParser.readFileAsText as Mock).mockResolvedValue("date,amount\n2023-01-01,10\nbad,line");
      (csvParser.parseCSV as Mock).mockReturnValue({
        headers: ["date", "amount"],
        rows: [["2023-01-01", "10"]],
        errors: [{ line: 2, error: "Parse error" }],
      });
      (csvParser.autoDetectFieldMapping as Mock).mockReturnValue({
        date: "date",
        amount: "amount",
      });
      (transactionMapper.mapRowsToTransactions as Mock).mockReturnValue({
        transactions: [createMockTransaction("1")],
        invalid: [],
      });

      const result = await ImportService.importTransactions(mockFile, undefined, {
        forceClientSide: true,
      });

      expect(result.success).toBe(true);
      expect(result.data?.transactions).toHaveLength(1);
    });

    it("should handle file read errors", async () => {
      (csvParser.readFileAsText as Mock).mockRejectedValue(new Error("File read error"));

      const result = await ImportService.importTransactions(mockFile, undefined, {
        forceClientSide: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("File read error");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should pass all field mappings to transaction mapper", async () => {
      (csvParser.readFileAsText as Mock).mockResolvedValue(
        "date,amount,desc,cat,merch,note\n2023-01-01,10,test,food,store,memo"
      );
      (csvParser.parseCSV as Mock).mockReturnValue({
        headers: ["date", "amount", "desc", "cat", "merch", "note"],
        rows: [["2023-01-01", "10", "test", "food", "store", "memo"]],
        errors: [],
      });
      (transactionMapper.mapRowsToTransactions as Mock).mockReturnValue({
        transactions: [createMockTransaction("1")],
        invalid: [],
      });

      const mapping = {
        date: "date",
        amount: "amount",
        description: "desc",
        category: "cat",
        merchant: "merch",
        notes: "note",
      };

      await ImportService.importTransactions(mockFile, mapping, { forceClientSide: true });

      expect(transactionMapper.mapRowsToTransactions).toHaveBeenCalledWith(
        [["2023-01-01", "10", "test", "food", "store", "memo"]],
        mapping
      );
    });
  });

  describe("importJSONClientSide", () => {
    it("should successfully import valid JSON array", async () => {
      const jsonData = [
        {
          id: "txn-1",
          date: "2023-01-01",
          amount: -100,
          type: "expense",
          description: "Test",
          category: "Food",
          envelopeId: "env-1",
          isScheduled: false,
          createdAt: Date.now(),
          lastModified: Date.now(),
        },
      ];

      const mockFile = new File([JSON.stringify(jsonData)], "test.json", {
        type: "application/json",
      });
      (csvParser.readFileAsText as Mock).mockResolvedValue(JSON.stringify(jsonData));

      const result = await ImportService.importTransactions(mockFile, undefined, {
        forceClientSide: true,
      });

      expect(result.success).toBe(true);
      expect(result.data?.transactions).toHaveLength(1);
      expect(result.data?.transactions[0].id).toBe("txn-1");
    });

    it("should return error for non-array JSON", async () => {
      const jsonData = { transactions: [] };
      const mockFile = new File([JSON.stringify(jsonData)], "test.json", {
        type: "application/json",
      });
      (csvParser.readFileAsText as Mock).mockResolvedValue(JSON.stringify(jsonData));

      const result = await ImportService.importTransactions(mockFile, undefined, {
        forceClientSide: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid JSON format");
      expect(result.error).toContain("Expected an array");
    });

    it("should return error for invalid JSON syntax", async () => {
      const mockFile = new File(["{ invalid json }"], "test.json", {
        type: "application/json",
      });
      (csvParser.readFileAsText as Mock).mockResolvedValue("{ invalid json }");

      const result = await ImportService.importTransactions(mockFile, undefined, {
        forceClientSide: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(logger.error).toHaveBeenCalled();
    });

    it("should handle items with missing required fields", async () => {
      const jsonData = [
        {
          id: "txn-1",
          date: "2023-01-01",
          amount: -100,
          type: "expense",
          description: "Valid",
          category: "Food",
          envelopeId: "env-1",
          isScheduled: false,
          createdAt: Date.now(),
          lastModified: Date.now(),
        },
        {
          id: "txn-2",
          // Missing date
          amount: -50,
          type: "expense",
        },
        {
          // Missing id
          date: "2023-01-01",
          amount: -30,
          type: "expense",
        },
      ];

      const mockFile = new File([JSON.stringify(jsonData)], "test.json", {
        type: "application/json",
      });
      (csvParser.readFileAsText as Mock).mockResolvedValue(JSON.stringify(jsonData));

      const result = await ImportService.importTransactions(mockFile, undefined, {
        forceClientSide: true,
      });

      expect(result.success).toBe(true);
      expect(result.data?.transactions).toHaveLength(1);
      expect(result.data?.invalid).toHaveLength(2);
      expect(result.data?.invalid[0].errors).toContain("Missing date");
      expect(result.data?.invalid[1].errors).toContain("Missing id");
    });

    it("should handle items with missing amount field", async () => {
      const jsonData = [
        {
          id: "txn-1",
          date: "2023-01-01",
          // Missing amount
          type: "expense",
          description: "Test",
          category: "Food",
          envelopeId: "env-1",
        },
      ];

      const mockFile = new File([JSON.stringify(jsonData)], "test.json", {
        type: "application/json",
      });
      (csvParser.readFileAsText as Mock).mockResolvedValue(JSON.stringify(jsonData));

      const result = await ImportService.importTransactions(mockFile, undefined, {
        forceClientSide: true,
      });

      expect(result.success).toBe(true);
      expect(result.data?.transactions).toHaveLength(0);
      expect(result.data?.invalid).toHaveLength(1);
      expect(result.data?.invalid[0].errors).toContain("Missing amount");
    });

    it("should handle items with invalid type field", async () => {
      const jsonData = [
        {
          id: "txn-1",
          date: "2023-01-01",
          amount: -100,
          type: "invalid-type",
          description: "Test",
        },
      ];

      const mockFile = new File([JSON.stringify(jsonData)], "test.json", {
        type: "application/json",
      });
      (csvParser.readFileAsText as Mock).mockResolvedValue(JSON.stringify(jsonData));

      const result = await ImportService.importTransactions(mockFile, undefined, {
        forceClientSide: true,
      });

      expect(result.success).toBe(true);
      expect(result.data?.transactions).toHaveLength(0);
      expect(result.data?.invalid).toHaveLength(1);
      expect(result.data?.invalid[0].errors).toContain("Missing or invalid type");
    });

    it("should map JSON items with various data types correctly", async () => {
      const jsonData = [
        {
          id: "txn-1",
          date: "2023-01-01T00:00:00Z",
          amount: "100.50", // String amount
          type: "income",
          description: "Paycheck",
          category: "Income",
          envelopeId: "env-1",
          merchant: "Acme Corp",
          notes: "Monthly salary",
          isScheduled: true,
          createdAt: 1234567890,
          lastModified: 1234567890,
        },
      ];

      const mockFile = new File([JSON.stringify(jsonData)], "test.json", {
        type: "application/json",
      });
      (csvParser.readFileAsText as Mock).mockResolvedValue(JSON.stringify(jsonData));

      const result = await ImportService.importTransactions(mockFile, undefined, {
        forceClientSide: true,
      });

      expect(result.success).toBe(true);
      expect(result.data?.transactions).toHaveLength(1);
      const txn = result.data?.transactions[0];
      expect(txn?.amount).toBe(100.5);
      expect(txn?.type).toBe("income");
      expect(txn?.merchant).toBe("Acme Corp");
      expect(txn?.description).toContain("Monthly salary");
      expect(txn?.isScheduled).toBe(true);
    });

    it("should append notes to description when present", async () => {
      const jsonData = [
        {
          id: "txn-1",
          date: "2023-01-01",
          amount: -100,
          type: "expense",
          description: "Grocery shopping",
          notes: "Weekly groceries",
          category: "Food",
          envelopeId: "env-1",
        },
      ];

      const mockFile = new File([JSON.stringify(jsonData)], "test.json", {
        type: "application/json",
      });
      (csvParser.readFileAsText as Mock).mockResolvedValue(JSON.stringify(jsonData));

      const result = await ImportService.importTransactions(mockFile, undefined, {
        forceClientSide: true,
      });

      expect(result.success).toBe(true);
      expect(result.data?.transactions[0].description).toBe("Grocery shopping (Weekly groceries)");
    });

    it("should use default description when missing", async () => {
      const jsonData = [
        {
          id: "txn-1",
          date: "2023-01-01",
          amount: -100,
          type: "expense",
          category: "Food",
          envelopeId: "env-1",
        },
      ];

      const mockFile = new File([JSON.stringify(jsonData)], "test.json", {
        type: "application/json",
      });
      (csvParser.readFileAsText as Mock).mockResolvedValue(JSON.stringify(jsonData));

      const result = await ImportService.importTransactions(mockFile, undefined, {
        forceClientSide: true,
      });

      expect(result.success).toBe(true);
      expect(result.data?.transactions[0].description).toBe("Transaction");
    });

    it("should use default category when missing", async () => {
      const jsonData = [
        {
          id: "txn-1",
          date: "2023-01-01",
          amount: -100,
          type: "expense",
          description: "Test",
          envelopeId: "env-1",
        },
      ];

      const mockFile = new File([JSON.stringify(jsonData)], "test.json", {
        type: "application/json",
      });
      (csvParser.readFileAsText as Mock).mockResolvedValue(JSON.stringify(jsonData));

      const result = await ImportService.importTransactions(mockFile, undefined, {
        forceClientSide: true,
      });

      expect(result.success).toBe(true);
      expect(result.data?.transactions[0].category).toBe("uncategorized");
    });

    it("should handle empty JSON array", async () => {
      const mockFile = new File(["[]"], "test.json", { type: "application/json" });
      (csvParser.readFileAsText as Mock).mockResolvedValue("[]");

      const result = await ImportService.importTransactions(mockFile, undefined, {
        forceClientSide: true,
      });

      expect(result.success).toBe(true);
      expect(result.data?.transactions).toHaveLength(0);
      expect(result.data?.invalid).toHaveLength(0);
    });

    it("should handle JSON with null amount as invalid", async () => {
      const jsonData = [
        {
          id: "txn-1",
          date: "2023-01-01",
          amount: null,
          type: "expense",
          description: "Test",
        },
      ];

      const mockFile = new File([JSON.stringify(jsonData)], "test.json", {
        type: "application/json",
      });
      (csvParser.readFileAsText as Mock).mockResolvedValue(JSON.stringify(jsonData));

      const result = await ImportService.importTransactions(mockFile, undefined, {
        forceClientSide: true,
      });

      expect(result.success).toBe(true);
      expect(result.data?.transactions).toHaveLength(0);
      expect(result.data?.invalid).toHaveLength(1);
      expect(result.data?.invalid[0].errors).toContain("Missing amount");
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
      (ApiClient.isOnline as Mock).mockReturnValue(true);
      (ApiClient.healthCheck as Mock).mockResolvedValue(true);
      expect(await ImportService.isAvailable()).toBe(true);
    });

    it("should return false when ApiClient is offline", async () => {
      (ApiClient.isOnline as Mock).mockReturnValue(false);
      expect(await ImportService.isAvailable()).toBe(false);
    });

    it("should return false when healthCheck fails", async () => {
      (ApiClient.isOnline as Mock).mockReturnValue(true);
      (ApiClient.healthCheck as Mock).mockResolvedValue(false);
      expect(await ImportService.isAvailable()).toBe(false);
    });

    it("should return false when healthCheck throws error", async () => {
      (ApiClient.isOnline as Mock).mockReturnValue(true);
      (ApiClient.healthCheck as Mock).mockRejectedValue(new Error("Health check failed"));
      expect(await ImportService.isAvailable()).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith(
        "Import service not available",
        expect.objectContaining({ error: "Health check failed" })
      );
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

    it("should detect exact date field", () => {
      const headers = ["date", "amount", "description"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.date).toBe("date");
    });

    it("should detect transaction_date field", () => {
      const headers = ["transaction_date", "amount"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.date).toBe("transaction_date");
    });

    it("should detect posting date field", () => {
      const headers = ["Posting Date", "Amount"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.date).toBe("Posting Date");
    });

    it("should detect txn date variations", () => {
      const headers = ["Txn-Date", "Amount"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.date).toBe("Txn-Date");
    });

    it("should detect exact amount field", () => {
      const headers = ["date", "amount", "description"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.amount).toBe("amount");
    });

    it("should detect value field as amount", () => {
      const headers = ["date", "value", "description"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.amount).toBe("value");
    });

    it("should detect transaction amount field", () => {
      const headers = ["date", "Transaction Amount", "description"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.amount).toBe("Transaction Amount");
    });

    it("should detect amt field as amount", () => {
      const headers = ["date", "Amt", "description"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.amount).toBe("Amt");
    });

    it("should detect total field as amount", () => {
      const headers = ["date", "Total", "description"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.amount).toBe("Total");
    });

    it("should detect exact description field", () => {
      const headers = ["date", "amount", "description"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.description).toBe("description");
    });

    it("should detect memo field as description", () => {
      const headers = ["date", "amount", "memo"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.description).toBe("memo");
    });

    it("should detect payee field as description", () => {
      const headers = ["date", "amount", "payee"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.description).toBe("payee");
    });

    it("should detect desc field as description", () => {
      const headers = ["date", "amount", "Desc"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.description).toBe("Desc");
    });

    it("should detect details field as description", () => {
      const headers = ["date", "amount", "Details"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.description).toBe("Details");
    });

    it("should detect exact category field", () => {
      const headers = ["date", "amount", "category"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.category).toBe("category");
    });

    it("should detect cat field as category", () => {
      const headers = ["date", "amount", "Cat"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.category).toBe("Cat");
    });

    it("should detect category name field", () => {
      const headers = ["date", "amount", "Category Name"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.category).toBe("Category Name");
    });

    it("should detect exact merchant field", () => {
      const headers = ["date", "amount", "merchant"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.merchant).toBe("merchant");
    });

    it("should detect vendor field as merchant", () => {
      const headers = ["date", "amount", "vendor"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.merchant).toBe("vendor");
    });

    it("should detect store field as merchant", () => {
      const headers = ["date", "amount", "Store Name"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.merchant).toBe("Store Name");
    });

    it("should detect merchant name field", () => {
      const headers = ["date", "amount", "Merchant Name"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.merchant).toBe("Merchant Name");
    });

    it("should detect exact notes field", () => {
      const headers = ["date", "amount", "notes"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.notes).toBe("notes");
    });

    it("should detect note field as notes", () => {
      const headers = ["date", "amount", "note"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.notes).toBe("note");
    });

    it("should detect comment field as notes", () => {
      const headers = ["date", "amount", "Comments"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.notes).toBe("Comments");
    });

    it("should detect remark field as notes", () => {
      const headers = ["date", "amount", "Remarks"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.notes).toBe("Remarks");
    });

    it("should detect all field types together", () => {
      const headers = ["Transaction Date", "Amount", "Payee", "Category", "Merchant", "Notes"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.date).toBe("Transaction Date");
      expect(mapping.amount).toBe("Amount");
      expect(mapping.description).toBe("Payee");
      expect(mapping.category).toBe("Category");
      expect(mapping.merchant).toBe("Merchant");
      expect(mapping.notes).toBe("Notes");
    });

    it("should handle headers with special characters", () => {
      const headers = ["Txn-Date", "Transaction_Amount", "Payee/Merchant"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.date).toBe("Txn-Date");
      expect(mapping.amount).toBe("Transaction_Amount");
    });

    it("should handle case-insensitive matching", () => {
      const headers = ["DATE", "AMOUNT", "DESCRIPTION", "CATEGORY", "MERCHANT", "NOTES"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(mapping.date).toBe("DATE");
      expect(mapping.amount).toBe("AMOUNT");
      expect(mapping.description).toBe("DESCRIPTION");
      expect(mapping.category).toBe("CATEGORY");
      expect(mapping.merchant).toBe("MERCHANT");
      expect(mapping.notes).toBe("NOTES");
    });

    it("should return empty mapping for unrecognized headers", () => {
      const headers = ["Unknown1", "Unknown2", "Unknown3"];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(Object.keys(mapping)).toHaveLength(0);
    });

    it("should handle empty headers array", () => {
      const headers: string[] = [];
      const mapping = ImportService.autoDetectFieldMapping(headers);
      expect(Object.keys(mapping)).toHaveLength(0);
    });
  });

  describe("backend import errors", () => {
    const mockFile = new File(["test"], "test.csv", { type: "text/csv" });

    beforeEach(() => {
      // Reset to default: backend available
      (ApiClient.isOnline as Mock).mockReturnValue(true);
      (ApiClient.healthCheck as Mock).mockResolvedValue(true);
    });

    it("should handle backend returning success: false", async () => {
      (ApiClient.post as Mock).mockResolvedValue({
        success: false,
        error: "Backend processing failed",
      });

      // Setup client-side fallback
      (csvParser.readFileAsText as Mock).mockResolvedValue("date,amount\n2023-01-01,10");
      (csvParser.parseCSV as Mock).mockReturnValue({
        headers: ["date", "amount"],
        rows: [["2023-01-01", "10"]],
        errors: [],
      });
      (csvParser.autoDetectFieldMapping as Mock).mockReturnValue({
        date: "date",
        amount: "amount",
      });
      (transactionMapper.mapRowsToTransactions as Mock).mockReturnValue({
        transactions: [createMockTransaction("1")],
        invalid: [],
      });

      const result = await ImportService.importTransactions(mockFile);

      expect(result.success).toBe(true);
      expect(logger.error).toHaveBeenCalledWith(
        "Backend import failed",
        expect.objectContaining({ error: "Backend processing failed" })
      );
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Backend import failed"),
        expect.objectContaining({ error: "Backend processing failed" })
      );
    });

    it("should log backend errors correctly", async () => {
      (ApiClient.post as Mock).mockResolvedValue({
        success: false,
        error: "File too large",
      });

      // Setup client-side fallback
      (csvParser.readFileAsText as Mock).mockResolvedValue("date,amount\n2023-01-01,10");
      (csvParser.parseCSV as Mock).mockReturnValue({
        headers: ["date", "amount"],
        rows: [["2023-01-01", "10"]],
        errors: [],
      });
      (csvParser.autoDetectFieldMapping as Mock).mockReturnValue({
        date: "date",
        amount: "amount",
      });
      (transactionMapper.mapRowsToTransactions as Mock).mockReturnValue({
        transactions: [],
        invalid: [],
      });

      await ImportService.importTransactions(mockFile);

      expect(logger.error).toHaveBeenCalledWith(
        "Backend import failed",
        expect.objectContaining({ error: "File too large" })
      );
    });

    it("should handle backend exception during post", async () => {
      (ApiClient.post as Mock).mockRejectedValue(new Error("Network timeout"));

      // Setup client-side fallback
      (csvParser.readFileAsText as Mock).mockResolvedValue("date,amount\n2023-01-01,10");
      (csvParser.parseCSV as Mock).mockReturnValue({
        headers: ["date", "amount"],
        rows: [["2023-01-01", "10"]],
        errors: [],
      });
      (csvParser.autoDetectFieldMapping as Mock).mockReturnValue({
        date: "date",
        amount: "amount",
      });
      (transactionMapper.mapRowsToTransactions as Mock).mockReturnValue({
        transactions: [createMockTransaction("1")],
        invalid: [],
      });

      const result = await ImportService.importTransactions(mockFile);

      expect(result.success).toBe(true);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Backend import"),
        expect.anything()
      );
    });

    it("should send field mapping to backend when provided", async () => {
      const mockResponse = {
        success: true,
        data: { transactions: [createMockTransaction("1")], invalid: [] },
      };
      (ApiClient.post as Mock).mockResolvedValue(mockResponse);

      const mapping = { date: "Date", amount: "Amount" };
      await ImportService.importTransactions(mockFile, mapping);

      expect(ApiClient.post).toHaveBeenCalledWith(
        "/api/import",
        expect.any(FormData),
        expect.objectContaining({ timeout: 120000 })
      );

      const formData = (ApiClient.post as Mock).mock.calls[0][1] as FormData;
      expect(formData.get("file")).toBe(mockFile);
      expect(formData.get("fieldMapping")).toBe(JSON.stringify(mapping));
    });

    it("should not send field mapping to backend when not provided", async () => {
      const mockResponse = {
        success: true,
        data: { transactions: [createMockTransaction("1")], invalid: [] },
      };
      (ApiClient.post as Mock).mockResolvedValue(mockResponse);

      await ImportService.importTransactions(mockFile);

      expect(ApiClient.post).toHaveBeenCalled();
      const formData = (ApiClient.post as Mock).mock.calls[0][1] as FormData;
      expect(formData.get("file")).toBe(mockFile);
      expect(formData.get("fieldMapping")).toBeNull();
    });
  });

  describe("unsupported file type", () => {
    it("should return error for unsupported file extension", async () => {
      const txtFile = new File(["test"], "test.txt", { type: "text/plain" });

      const result = await ImportService.importTransactions(txtFile, undefined, {
        forceClientSide: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unsupported file type");
    });

    it("should return error for file with no extension", async () => {
      const noExtFile = new File(["test"], "test", { type: "text/plain" });

      const result = await ImportService.importTransactions(noExtFile, undefined, {
        forceClientSide: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unsupported file type");
    });
  });
});
