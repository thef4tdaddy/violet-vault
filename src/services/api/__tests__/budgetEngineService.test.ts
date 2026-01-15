/**
 * Budget Engine Service Tests
 * Tests for Go backend budget calculation API integration
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { BudgetEngineService } from "../budgetEngineService";
import { ApiClient } from "../client";
import type { Envelope } from "@/domain/schemas/envelope";
import type { Transaction } from "@/domain/schemas/transaction";
import type { Bill } from "@/domain/schemas/bill";

// Mock dependencies
vi.mock("../client");
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("BudgetEngineService", () => {
  const mockEnvelopes: Envelope[] = [
    {
      id: "env1",
      name: "Groceries",
      category: "Food",
      currentBalance: 500,
      budget: 600,
      lastModified: Date.now(),
      createdAt: Date.now(),
    },
  ];

  const mockTransactions: Transaction[] = [
    {
      id: "tx1",
      date: "2024-01-01",
      amount: -50,
      envelopeId: "env1",
      category: "Food",
      type: "expense",
      lastModified: Date.now(),
      createdAt: Date.now(),
    },
  ];

  const mockBills: Bill[] = [
    {
      id: "bill1",
      name: "Electric Bill",
      category: "Utilities",
      amount: 100,
      dueDate: "2024-01-15",
      isPaid: false,
      isRecurring: true,
      lastModified: Date.now(),
      createdAt: Date.now(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("calculateBudget", () => {
    it("should return empty result when all input arrays are empty", async () => {
      const response = await BudgetEngineService.calculateBudget([], [], []);

      expect(response.success).toBe(true);
      expect(response.data?.data).toEqual([]);
      expect(response.data?.totals.envelopeCount).toBe(0);
      expect(ApiClient.post).not.toHaveBeenCalled();
    });

    it("should call backend API with valid data", async () => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          data: [],
          totals: {
            totalAllocated: 5000,
            totalSpent: 2000,
            totalBalance: 3000,
            totalUpcoming: 500,
            totalBiweeklyNeed: 1000,
            billsDueCount: 3,
            envelopeCount: 5,
          },
        },
      };

      vi.spyOn(ApiClient, "post").mockResolvedValue(mockResponse);

      const response = await BudgetEngineService.calculateBudget(
        mockEnvelopes,
        mockTransactions,
        mockBills
      );

      expect(response.success).toBe(true);
      expect(ApiClient.post).toHaveBeenCalledWith(
        "/api/budget",
        {
          envelopes: mockEnvelopes,
          transactions: mockTransactions,
          bills: mockBills,
        },
        { timeout: 60000 }
      );
    });

    it("should handle API errors gracefully", async () => {
      vi.spyOn(ApiClient, "post").mockResolvedValue({
        success: false,
        error: "Backend error",
      });

      const response = await BudgetEngineService.calculateBudget(
        mockEnvelopes,
        mockTransactions,
        mockBills
      );

      expect(response.success).toBe(false);
      expect(response.error).toBe("Backend error");
    });

    it("should handle network errors", async () => {
      vi.spyOn(ApiClient, "post").mockRejectedValue(new Error("Network error"));

      const response = await BudgetEngineService.calculateBudget(
        mockEnvelopes,
        mockTransactions,
        mockBills
      );

      expect(response.success).toBe(false);
      expect(response.error).toContain("Network error");
    });

    it("should set appropriate timeout for large datasets", async () => {
      vi.spyOn(ApiClient, "post").mockResolvedValue({
        success: true,
        data: { success: true, data: [], totals: {} },
      });

      await BudgetEngineService.calculateBudget(mockEnvelopes, mockTransactions, mockBills);

      expect(ApiClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({ timeout: 60000 })
      );
    });
  });

  describe("isAvailable", () => {
    it("should return false when offline", async () => {
      vi.spyOn(ApiClient, "isOnline").mockReturnValue(false);

      const available = await BudgetEngineService.isAvailable();

      expect(available).toBe(false);
    });

    it("should check health when online", async () => {
      vi.spyOn(ApiClient, "isOnline").mockReturnValue(true);
      vi.spyOn(ApiClient, "healthCheck").mockResolvedValue(true);

      const available = await BudgetEngineService.isAvailable();

      expect(available).toBe(true);
      expect(ApiClient.healthCheck).toHaveBeenCalled();
    });

    it("should return false when health check fails", async () => {
      vi.spyOn(ApiClient, "isOnline").mockReturnValue(true);
      vi.spyOn(ApiClient, "healthCheck").mockResolvedValue(false);

      const available = await BudgetEngineService.isAvailable();

      expect(available).toBe(false);
    });
  });
});
