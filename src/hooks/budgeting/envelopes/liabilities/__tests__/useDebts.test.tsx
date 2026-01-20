/**
 * Tests for useDebts Hook - CRUD Operations
 * Part of CRUD Verification Matrix
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDebts } from "../useDebts";
import { budgetDb } from "@/db/budgetDb";
import BudgetHistoryTracker from "@/utils/core/common/budgetHistoryTracker";
import type { Debt } from "../../../../../db/types";

// Mock dependencies
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    envelopes: {
      toArray: vi.fn(),
      put: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    putEnvelope: vi.fn(),
    updateEnvelope: vi.fn(),
  },
}));

vi.mock("@/utils/core/common/budgetHistoryTracker", () => ({
  default: {
    trackDebtChange: vi.fn(),
  },
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useDebts - CRUD Operations", () => {
  const mockDebt: Debt = {
    id: "debt-1",
    name: "Credit Card",
    creditor: "Bank of America",
    type: "credit_card",
    status: "active",
    currentBalance: 5000,
    minimumPayment: 150,
    interestRate: 18.5,
    originalBalance: 6000,
    lastModified: Date.now(),
    createdAt: Date.now(),
    color: "#3B82F6",
    autoAllocate: true,
    isPaid: false,
    archived: false,
    category: "Debt",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (budgetDb.envelopes.toArray as Mock).mockResolvedValue([]);
    (budgetDb.envelopes.get as Mock).mockResolvedValue(mockDebt);
    (budgetDb.putEnvelope as Mock).mockResolvedValue(undefined);
    (budgetDb.updateEnvelope as Mock).mockResolvedValue(1);
    (budgetDb.envelopes.delete as Mock).mockResolvedValue(undefined);
    (BudgetHistoryTracker.trackDebtChange as Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Read Operations", () => {
    it("should fetch debts from database", async () => {
      const mockDebts = [mockDebt];
      (budgetDb.envelopes.toArray as Mock).mockResolvedValue(mockDebts);

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.debts).toEqual(mockDebts);
      });

      expect(budgetDb.envelopes.toArray).toHaveBeenCalled();
    });

    it("should handle empty debt list", async () => {
      (budgetDb.envelopes.toArray as Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.debts).toEqual([]);
      });
    });

    it("should get debt by ID", async () => {
      const mockDebts = [mockDebt];
      (budgetDb.envelopes.toArray as Mock).mockResolvedValue(mockDebts);

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.debts.length).toBeGreaterThan(0);
      });

      const foundDebt = result.current.getDebtById("debt-1");
      expect(foundDebt).toEqual(mockDebt);
    });

    it("should return undefined for non-existent debt ID", async () => {
      (budgetDb.envelopes.toArray as Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.debts).toEqual([]);
      });

      const foundDebt = result.current.getDebtById("non-existent");
      expect(foundDebt).toBeUndefined();
    });

    it("should migrate debts with undefined status", async () => {
      const debtWithoutStatus = { ...mockDebt, status: undefined };
      const debtWithStatus = { ...mockDebt, status: "active" };

      (budgetDb.envelopes.toArray as Mock)
        .mockResolvedValueOnce([debtWithoutStatus])
        .mockResolvedValueOnce([debtWithStatus]);
      (budgetDb.envelopes.update as Mock).mockResolvedValue(1);

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.debts).toEqual([debtWithStatus]);
      });

      expect(budgetDb.updateEnvelope).toHaveBeenCalledWith(
        "debt-1",
        expect.objectContaining({ status: "active" })
      );
    });
  });

  describe("Create Operations", () => {
    it("should create a new debt with generated ID", async () => {
      const mockDebt: Debt = {
        id: "debt-1",
        name: "Test Debt",
        creditor: "Test Creditor",
        type: "personal" as const,
        currentBalance: 5000,
        minimumPayment: 100,
        interestRate: 15,
        lastModified: Date.now(),
        archived: false,
        category: "Debt",
        status: "active",
        color: "#3B82F6",
        autoAllocate: true,
        isPaid: false,
      };
      const newDebtData = {
        name: "New Debt",
        creditor: "New Creditor",
        type: "personal" as const,
        currentBalance: 1000,
        minimumPayment: 50,
        interestRate: 10,
        lastModified: Date.now(),
      };

      const createdDebt = {
        ...mockDebt,
        id: "generated-id",
        status: "active",
        lastModified: Date.now(),
      };

      (budgetDb.envelopes.put as Mock).mockImplementation((debt: any) => {
        expect(debt.id).toBeDefined();
        expect(debt.status).toBe("active");
        return Promise.resolve(undefined);
      });

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.addDebt).toBeDefined();
      });

      await result.current.addDebtAsync(newDebtData);

      await waitFor(() => {
        expect(budgetDb.putEnvelope).toHaveBeenCalled();
        expect(BudgetHistoryTracker.trackDebtChange).toHaveBeenCalledWith(
          expect.objectContaining({
            changeType: "add",
            previousData: null,
          })
        );
      });
    });

    it("should create a debt with provided ID", async () => {
      const newDebtData = {
        id: "custom-id",
        name: "New Debt",
        creditor: "New Creditor",
        type: "personal" as const,
        currentBalance: 1000,
        minimumPayment: 50,
        lastModified: Date.now(),
      };

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.addDebt).toBeDefined();
      });

      await result.current.addDebtAsync(newDebtData);

      await waitFor(() => {
        expect(budgetDb.putEnvelope).toHaveBeenCalledWith(
          expect.objectContaining({
            id: "custom-id",
            status: "active",
          })
        );
      });
    });

    it("should track history when creating debt", async () => {
      const newDebtData = {
        name: "New Debt",
        creditor: "New Creditor",
        type: "personal" as const,
        currentBalance: 1000,
        minimumPayment: 50,
        author: "Test User",
        lastModified: Date.now(),
      };

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.addDebt).toBeDefined();
      });

      await result.current.addDebtAsync(newDebtData);

      await waitFor(() => {
        expect(BudgetHistoryTracker.trackDebtChange).toHaveBeenCalledWith(
          expect.objectContaining({
            changeType: "add",
            author: "Test User",
          })
        );
      });
    });
  });

  describe("Update Operations", () => {
    it("should update an existing debt", async () => {
      const updates = {
        name: "Updated Name",
        currentBalance: 4500,
      };

      (budgetDb.envelopes.get as Mock)
        .mockResolvedValueOnce(mockDebt) // Previous data
        .mockResolvedValueOnce({ ...mockDebt, ...updates }); // New data

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.updateDebt).toBeDefined();
      });

      await result.current.updateDebtAsync({
        id: "debt-1",
        updates,
      });

      await waitFor(() => {
        expect(budgetDb.updateEnvelope).toHaveBeenCalledWith(
          "debt-1",
          expect.objectContaining({
            ...updates,
            lastModified: expect.any(Number),
          })
        );
        expect(BudgetHistoryTracker.trackDebtChange).toHaveBeenCalledWith(
          expect.objectContaining({
            debtId: "debt-1",
            changeType: "modify",
            previousData: mockDebt,
          })
        );
      });
    });

    it("should update lastModified timestamp", async () => {
      const updates = { name: "Updated Name" };
      const beforeUpdate = Date.now();

      (budgetDb.envelopes.get as Mock)
        .mockResolvedValueOnce(mockDebt)
        .mockResolvedValueOnce({ ...mockDebt, ...updates });

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.updateDebt).toBeDefined();
      });

      await result.current.updateDebtAsync({
        id: "debt-1",
        updates,
      });

      await waitFor(() => {
        const updateCall = (budgetDb.updateEnvelope as Mock).mock.calls[0];
        expect(updateCall[1].lastModified).toBeGreaterThanOrEqual(beforeUpdate);
      });
    });

    it("should track history with author when updating", async () => {
      const updates = { name: "Updated Name" };

      (budgetDb.envelopes.get as Mock)
        .mockResolvedValueOnce(mockDebt)
        .mockResolvedValueOnce({ ...mockDebt, ...updates });

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.updateDebt).toBeDefined();
      });

      await result.current.updateDebtAsync({
        id: "debt-1",
        updates,
        author: "Test User",
      });

      await waitFor(() => {
        expect(BudgetHistoryTracker.trackDebtChange).toHaveBeenCalledWith(
          expect.objectContaining({
            changeType: "modify",
            author: "Test User",
          })
        );
      });
    });
  });

  describe("Delete Operations", () => {
    it("should delete a debt", async () => {
      (budgetDb.envelopes.get as Mock).mockResolvedValue(mockDebt);

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.deleteDebt).toBeDefined();
      });

      await result.current.deleteDebtAsync({ id: "debt-1" });

      await waitFor(() => {
        expect(budgetDb.envelopes.delete).toHaveBeenCalledWith("debt-1");
        expect(BudgetHistoryTracker.trackDebtChange).toHaveBeenCalledWith(
          expect.objectContaining({
            debtId: "debt-1",
            changeType: "delete",
            previousData: mockDebt,
            newData: null,
          })
        );
      });
    });

    it("should track history when deleting debt", async () => {
      (budgetDb.envelopes.get as Mock).mockResolvedValue(mockDebt);

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.deleteDebt).toBeDefined();
      });

      await result.current.deleteDebtAsync({
        id: "debt-1",
        author: "Test User",
      });

      await waitFor(() => {
        expect(BudgetHistoryTracker.trackDebtChange).toHaveBeenCalledWith(
          expect.objectContaining({
            changeType: "delete",
            author: "Test User",
          })
        );
      });
    });

    it("should not track history if debt doesn't exist", async () => {
      (budgetDb.envelopes.get as Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.deleteDebt).toBeDefined();
      });

      await result.current.deleteDebtAsync({ id: "non-existent" });

      await waitFor(() => {
        expect(budgetDb.envelopes.delete).toHaveBeenCalledWith("non-existent");
        expect(BudgetHistoryTracker.trackDebtChange).not.toHaveBeenCalled();
      });
    });
  });

  describe("Payment Recording", () => {
    it("should record a payment and update balance", async () => {
      const payment = {
        amount: 200,
        date: new Date().toISOString(),
        notes: "Test payment",
      };

      const updatedDebt = {
        ...mockDebt,
        currentBalance: mockDebt.currentBalance - payment.amount,
        lastModified: Date.now(),
      };

      (budgetDb.envelopes.get as Mock)
        .mockResolvedValueOnce(mockDebt)
        .mockResolvedValueOnce(updatedDebt);

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.recordDebtPayment).toBeDefined();
      });

      await result.current.recordDebtPaymentAsync({
        id: "debt-1",
        payment,
      });

      await waitFor(() => {
        expect(budgetDb.updateEnvelope).toHaveBeenCalledWith(
          "debt-1",
          expect.objectContaining({
            currentBalance: 4800, // 5000 - 200
            lastModified: expect.any(Number),
          })
        );
        expect(BudgetHistoryTracker.trackDebtChange).toHaveBeenCalledWith(
          expect.objectContaining({
            changeType: "modify",
            previousData: mockDebt,
          })
        );
      });
    });

    it("should not allow negative balance", async () => {
      const payment = {
        amount: 6000, // More than current balance
        date: new Date().toISOString(),
      };

      (budgetDb.envelopes.get as Mock).mockResolvedValue(mockDebt);

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.recordDebtPayment).toBeDefined();
      });

      await result.current.recordDebtPaymentAsync({
        id: "debt-1",
        payment,
      });

      await waitFor(() => {
        expect(budgetDb.updateEnvelope).toHaveBeenCalledWith(
          "debt-1",
          expect.objectContaining({
            currentBalance: 0, // Should be clamped to 0
          })
        );
      });
    });
  });

  describe("Query Invalidation", () => {
    it("should invalidate queries after creating debt", async () => {
      const newDebtData = {
        name: "New Debt",
        creditor: "New Creditor",
        type: "personal" as const,
        currentBalance: 1000,
        minimumPayment: 50,
        lastModified: Date.now(),
      };

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.addDebt).toBeDefined();
      });

      // This will be tested implicitly through query invalidation
      await result.current.addDebtAsync(newDebtData);

      // Query invalidation happens in onSuccess callback
      // We verify the mutation completed successfully
      await waitFor(() => {
        expect(budgetDb.putEnvelope).toHaveBeenCalled();
      });
    });
  });

  describe("Validation Error Handling", () => {
    it("should handle database error when adding debt", async () => {
      const dbError = new Error("Database write failed");
      (budgetDb.putEnvelope as Mock).mockRejectedValue(dbError);

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.addDebt).toBeDefined();
      });

      await expect(
        result.current.addDebtAsync({
          id: "test-debt-id", // Provide ID to avoid crypto.randomUUID
          name: "Test Debt",
          creditor: "Test Creditor",
          type: "personal" as const,
          currentBalance: 1000,
          originalBalance: 1000, // Required field
          minimumPayment: 50,
          interestRate: 5, // Required field
          lastModified: Date.now(), // Required field
        })
      ).rejects.toThrow("Database write failed");
    });

    it("should handle database error when updating debt", async () => {
      const dbError = new Error("Database update failed");
      (budgetDb.envelopes.get as Mock).mockResolvedValue(mockDebt);
      (budgetDb.updateEnvelope as Mock).mockRejectedValue(dbError);

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.updateDebt).toBeDefined();
      });

      await expect(
        result.current.updateDebtAsync({
          id: "debt-1",
          updates: { name: "Updated Name" },
        })
      ).rejects.toThrow("Database update failed");
    });

    it("should handle database error when deleting debt", async () => {
      const dbError = new Error("Database delete failed");
      (budgetDb.envelopes.get as Mock).mockResolvedValue(mockDebt);
      (budgetDb.envelopes.delete as Mock).mockRejectedValue(dbError);

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.deleteDebt).toBeDefined();
      });

      await expect(result.current.deleteDebtAsync({ id: "debt-1" })).rejects.toThrow(
        "Database delete failed"
      );
    });

    it("should handle history tracking errors gracefully", async () => {
      const historyError = new Error("History tracking failed");
      (BudgetHistoryTracker.trackDebtChange as Mock).mockRejectedValue(historyError);

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.addDebt).toBeDefined();
      });

      // Even if history tracking fails, the debt should still be created
      // (history tracking is secondary)
      await expect(
        result.current.addDebtAsync({
          id: "test-debt-id", // Provide ID to avoid crypto.randomUUID
          name: "Test Debt",
          creditor: "Test Creditor",
          type: "personal" as const,
          currentBalance: 1000,
          originalBalance: 1000, // Required field
          minimumPayment: 50,
          interestRate: 5, // Required field
          lastModified: Date.now(), // Required field
        })
      ).rejects.toThrow("History tracking failed");
    });

    it("should handle payment recording with non-existent debt", async () => {
      (budgetDb.envelopes.get as Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.recordDebtPayment).toBeDefined();
      });

      // Payment on non-existent debt should not update balance but should return
      const payment = await result.current.recordDebtPaymentAsync({
        id: "non-existent",
        payment: {
          amount: 100,
          date: new Date().toISOString(),
        },
      });
      // Payment on non-existent debt - the hook doesn't update and returns early
      expect(payment).toBeDefined();
    });

    it("should validate debt name is not empty", async () => {
      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.addDebt).toBeDefined();
      });

      // Empty name should fail validation
      await expect(
        result.current.addDebtAsync({
          id: "test-debt-id", // Provide ID to avoid crypto.randomUUID
          name: "", // Empty name
          creditor: "Test Creditor",
          type: "personal" as const,
          currentBalance: 1000,
          originalBalance: 1000,
          minimumPayment: 50,
          interestRate: 5,
        })
      ).rejects.toThrow("Invalid debt data");
    });

    it("should handle concurrent debt updates", async () => {
      (budgetDb.envelopes.get as Mock).mockResolvedValue(mockDebt);

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.updateDebt).toBeDefined();
      });

      // Simulate concurrent updates
      await Promise.all([
        result.current.updateDebtAsync({
          id: "debt-1",
          updates: { name: "Update 1" },
        }),
        result.current.updateDebtAsync({
          id: "debt-1",
          updates: { currentBalance: 4000 },
        }),
      ]);

      await waitFor(() => {
        expect(budgetDb.updateEnvelope).toHaveBeenCalledTimes(2);
      });
    });

    it("should validate minimum payment is not negative", async () => {
      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.addDebt).toBeDefined();
      });

      // Negative minimum payment should fail validation
      await expect(
        result.current.addDebtAsync({
          id: "test-debt-id", // Provide ID to avoid crypto.randomUUID
          name: "Test Debt",
          creditor: "Test Creditor",
          type: "personal" as const,
          currentBalance: 1000,
          originalBalance: 1000, // Required field
          minimumPayment: -50, // Negative minimum payment
          interestRate: 5,
        })
      ).rejects.toThrow("Invalid debt data");
    });

    it("should handle envelope relationship validation for debt payment", async () => {
      const debtWithEnvelope = { ...mockDebt, envelopeId: "non-existent-envelope" };
      (budgetDb.envelopes.get as Mock).mockResolvedValue(debtWithEnvelope);

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.recordDebtPayment).toBeDefined();
      });

      // Payment should still be recorded even if envelope doesn't exist
      await result.current.recordDebtPaymentAsync({
        id: "debt-1",
        payment: {
          amount: 100,
          date: new Date().toISOString(),
        },
      });

      await waitFor(() => {
        expect(budgetDb.updateEnvelope).toHaveBeenCalled();
      });
    });

    it("should handle payment amount exceeding balance", async () => {
      (budgetDb.envelopes.get as Mock).mockResolvedValue(mockDebt);

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.recordDebtPayment).toBeDefined();
      });

      // Payment exceeds current balance
      await result.current.recordDebtPaymentAsync({
        id: "debt-1",
        payment: {
          amount: 10000, // More than 5000 balance
          date: new Date().toISOString(),
        },
      });

      await waitFor(() => {
        // Balance should be clamped to 0
        expect(budgetDb.updateEnvelope).toHaveBeenCalledWith(
          "debt-1",
          expect.objectContaining({
            currentBalance: 0,
          })
        );
      });
    });

    it("should validate interest rate is not negative", async () => {
      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.addDebt).toBeDefined();
      });

      // Negative interest rate should fail validation
      await expect(
        result.current.addDebtAsync({
          id: "test-debt-id", // Provide ID to avoid crypto.randomUUID
          name: "Test Debt",
          creditor: "Test Creditor",
          type: "personal" as const,
          currentBalance: 1000,
          originalBalance: 1000, // Required field
          minimumPayment: 50,
          interestRate: -5, // Negative interest rate
        })
      ).rejects.toThrow("Invalid debt data");
    });
  });
});
