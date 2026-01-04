/**
 * Budget Calculation Service Tests
 * Tests for hybrid backend/client budget calculations
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { BudgetCalculationService } from "../budgetCalculationService";
import { BudgetEngineService } from "@/services/api/budgetEngineService";
import type { Envelope } from "@/domain/schemas/envelope";
import type { Transaction } from "@/domain/schemas/transaction";
import type { Bill } from "@/domain/schemas/bill";

// Mock dependencies
vi.mock("@/services/api/budgetEngineService");
vi.mock("@/utils/budgeting/envelopeCalculations", () => ({
  calculateEnvelopeData: vi.fn(() => []),
  calculateEnvelopeTotals: vi.fn(() => ({
    totalBiweeklyNeed: 1000,
    totalAllocated: 5000,
    totalBalance: 3000,
    totalSpent: 2000,
    totalUpcoming: 500,
    billsDueCount: 3,
    envelopeCount: 5,
  })),
}));
vi.mock("@/utils/common/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("BudgetCalculationService", () => {
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

  describe("calculate", () => {
    it("should use backend calculation when available and preferred", async () => {
      // Mock backend available
      vi.spyOn(BudgetEngineService, "isAvailable").mockResolvedValue(true);
      vi.spyOn(BudgetEngineService, "calculateBudget").mockResolvedValue({
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
      });

      const result = await BudgetCalculationService.calculate(
        mockEnvelopes,
        mockTransactions,
        mockBills,
        { preferBackend: true }
      );

      expect(result.source).toBe("backend");
      expect(BudgetEngineService.calculateBudget).toHaveBeenCalledWith(
        mockEnvelopes,
        mockTransactions,
        mockBills
      );
    });

    it("should use client-side calculation when backend unavailable", async () => {
      // Mock backend unavailable
      const isAvailableSpy = vi.spyOn(BudgetEngineService, "isAvailable").mockResolvedValue(false);

      // Reset any previous backend status cache
      await BudgetCalculationService.refreshBackendStatus();

      const result = await BudgetCalculationService.calculate(
        mockEnvelopes,
        mockTransactions,
        mockBills,
        { preferBackend: true }
      );

      expect(result.source).toBe("client");
      expect(result.totals).toBeDefined();
      expect(isAvailableSpy).toHaveBeenCalled();
    });

    it("should use client-side calculation when forceClientSide is true", async () => {
      const result = await BudgetCalculationService.calculate(
        mockEnvelopes,
        mockTransactions,
        mockBills,
        { forceClientSide: true }
      );

      expect(result.source).toBe("client");
      expect(BudgetEngineService.isAvailable).not.toHaveBeenCalled();
    });

    it("should fallback to client-side when backend calculation fails", async () => {
      // Mock backend available but calculation fails
      vi.spyOn(BudgetEngineService, "isAvailable").mockResolvedValue(true);
      vi.spyOn(BudgetEngineService, "calculateBudget").mockResolvedValue({
        success: false,
        error: "Backend error",
      });

      const result = await BudgetCalculationService.calculate(
        mockEnvelopes,
        mockTransactions,
        mockBills,
        { preferBackend: true }
      );

      expect(result.source).toBe("client");
    });
  });

  describe("refreshBackendStatus", () => {
    it("should refresh backend availability status", async () => {
      vi.spyOn(BudgetEngineService, "isAvailable").mockResolvedValue(true);

      const status = await BudgetCalculationService.refreshBackendStatus();

      expect(status).toBe(true);
      expect(BudgetEngineService.isAvailable).toHaveBeenCalled();
    });
  });

  describe("getBackendStatus", () => {
    it("should return cached backend status", () => {
      const status = BudgetCalculationService.getBackendStatus();

      expect(typeof status === "boolean" || status === null).toBe(true);
    });
  });
});
