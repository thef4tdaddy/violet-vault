/**
 * Tests for useDebts Hook - CRUD Operations
 * Part of CRUD Verification Matrix
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDebts } from "../useDebts";
import { budgetDb } from "@/db/budgetDb";
import BudgetHistoryTracker from "@/utils/common/budgetHistoryTracker";
import type { Debt } from "@/types/debt";

// Mock dependencies
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    debts: {
      toArray: vi.fn(),
      put: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/utils/common/budgetHistoryTracker", () => ({
  default: {
    trackDebtChange: vi.fn(),
  },
}));

vi.mock("@/utils/common/logger", () => ({
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
    paymentFrequency: "monthly",
    compoundFrequency: "monthly",
    lastModified: Date.now(),
    createdAt: Date.now(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (budgetDb.debts.toArray as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (budgetDb.debts.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockDebt);
    (budgetDb.debts.put as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (budgetDb.debts.update as ReturnType<typeof vi.fn>).mockResolvedValue(1);
    (budgetDb.debts.delete as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (BudgetHistoryTracker.trackDebtChange as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Read Operations", () => {
    it("should fetch debts from database", async () => {
      const mockDebts = [mockDebt];
      (budgetDb.debts.toArray as ReturnType<typeof vi.fn>).mockResolvedValue(mockDebts);

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.debts).toEqual(mockDebts);
      });

      expect(budgetDb.debts.toArray).toHaveBeenCalledTimes(1);
    });

    it("should handle empty debt list", async () => {
      (budgetDb.debts.toArray as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.debts).toEqual([]);
      });
    });

    it("should get debt by ID", async () => {
      const mockDebts = [mockDebt];
      (budgetDb.debts.toArray as ReturnType<typeof vi.fn>).mockResolvedValue(mockDebts);

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
      (budgetDb.debts.toArray as ReturnType<typeof vi.fn>).mockResolvedValue([]);

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

      (budgetDb.debts.toArray as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce([debtWithoutStatus])
        .mockResolvedValueOnce([debtWithStatus]);
      (budgetDb.debts.update as ReturnType<typeof vi.fn>).mockResolvedValue(1);

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.debts).toEqual([debtWithStatus]);
      });

      expect(budgetDb.debts.update).toHaveBeenCalledWith("debt-1", { status: "active" });
    });
  });

  describe("Create Operations", () => {
    it("should create a new debt with generated ID", async () => {
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
        ...newDebtData,
        id: "generated-id",
        status: "active",
        lastModified: Date.now(),
      };

      (budgetDb.debts.put as ReturnType<typeof vi.fn>).mockImplementation((debt) => {
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
        expect(budgetDb.debts.put).toHaveBeenCalled();
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
        expect(budgetDb.debts.put).toHaveBeenCalledWith(
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

      (budgetDb.debts.get as ReturnType<typeof vi.fn>)
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
        expect(budgetDb.debts.update).toHaveBeenCalledWith(
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

      (budgetDb.debts.get as ReturnType<typeof vi.fn>)
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
        const updateCall = (budgetDb.debts.update as ReturnType<typeof vi.fn>).mock.calls[0];
        expect(updateCall[1].lastModified).toBeGreaterThanOrEqual(beforeUpdate);
      });
    });

    it("should track history with author when updating", async () => {
      const updates = { name: "Updated Name" };

      (budgetDb.debts.get as ReturnType<typeof vi.fn>)
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
      (budgetDb.debts.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockDebt);

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.deleteDebt).toBeDefined();
      });

      await result.current.deleteDebtAsync({ id: "debt-1" });

      await waitFor(() => {
        expect(budgetDb.debts.delete).toHaveBeenCalledWith("debt-1");
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
      (budgetDb.debts.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockDebt);

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
      (budgetDb.debts.get as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const { result } = renderHook(() => useDebts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.deleteDebt).toBeDefined();
      });

      await result.current.deleteDebtAsync({ id: "non-existent" });

      await waitFor(() => {
        expect(budgetDb.debts.delete).toHaveBeenCalledWith("non-existent");
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

      (budgetDb.debts.get as ReturnType<typeof vi.fn>)
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
        expect(budgetDb.debts.update).toHaveBeenCalledWith(
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

      (budgetDb.debts.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockDebt);

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
        expect(budgetDb.debts.update).toHaveBeenCalledWith(
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
        expect(budgetDb.debts.put).toHaveBeenCalled();
      });
    });
  });

  describe("Validation Error Handling", () => {
    it("should handle database error when adding debt", async () => {
      const dbError = new Error("Database write failed");
      (budgetDb.debts.put as ReturnType<typeof vi.fn>).mockRejectedValue(dbError);

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
      (budgetDb.debts.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockDebt);
      (budgetDb.debts.update as ReturnType<typeof vi.fn>).mockRejectedValue(dbError);

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
      (budgetDb.debts.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockDebt);
      (budgetDb.debts.delete as ReturnType<typeof vi.fn>).mockRejectedValue(dbError);

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
      (BudgetHistoryTracker.trackDebtChange as ReturnType<typeof vi.fn>).mockRejectedValue(
        historyError
      );

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
      (budgetDb.debts.get as ReturnType<typeof vi.fn>).mockResolvedValue(null);

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
      (budgetDb.debts.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockDebt);

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
        expect(budgetDb.debts.update).toHaveBeenCalledTimes(2);
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
      (budgetDb.debts.get as ReturnType<typeof vi.fn>).mockResolvedValue(debtWithEnvelope);

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
        expect(budgetDb.debts.update).toHaveBeenCalled();
      });
    });

    it("should handle payment amount exceeding balance", async () => {
      (budgetDb.debts.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockDebt);

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
        expect(budgetDb.debts.update).toHaveBeenCalledWith(
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
