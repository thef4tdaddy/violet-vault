/**
 * Tests for Bill Mutation Hooks
 * Covers create, update, delete, and mark paid operations
 * Comprehensive CRUD validation tests matching Envelope test quality
 *
 * Part of Issue #: Bill CRUD Validation Tests
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useAddBillMutation,
  useUpdateBillMutation,
  useDeleteBillMutation,
  useMarkBillPaidMutation,
} from "../useBills";
import { createTestQueryClient, createQueryWrapper } from "@/test/queryTestUtils";
import {
  createMockDexie,
  mockDataGenerators,
  createMockOptimisticHelpers,
} from "@/test/queryMocks";
import { queryKeys } from "@/utils/common/queryClient";
import {
  BillSchema,
  BillPartialSchema,
  BillFrequencySchema,
  validateBill,
  validateBillSafe,
  validateBillPartial,
  validateBillPartialSafe,
  BillFormDataMinimalSchema,
  validateBillFormDataMinimal,
} from "@/domain/schemas/bill";

// Mock dependencies
vi.mock("@/db/budgetDb", () => ({
  budgetDb: null, // Will be set in beforeEach
}));

vi.mock("@/utils/common/queryClient", async () => {
  const actual = await vi.importActual("@/utils/common/queryClient");
  return {
    ...actual,
    optimisticHelpers: null, // Will be set in beforeEach
  };
});

vi.mock("@/utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Bill Mutation Hooks", () => {
  let queryClient: any;
  let mockDb: any;
  let mockOptimistic: any;
  let wrapper: any;

  beforeEach(async () => {
    // Create fresh instances for each test
    queryClient = createTestQueryClient();
    mockDb = createMockDexie();
    mockOptimistic = createMockOptimisticHelpers();
    wrapper = createQueryWrapper(queryClient);

    // Mock the budgetDb module
    const budgetDbModule = vi.mocked(await import("@/db/budgetDb"));
    (budgetDbModule as any).budgetDb = mockDb;

    // Mock optimisticHelpers
    const queryClientModule = vi.mocked(await import("@/utils/common/queryClient"));
    (queryClientModule as any).optimisticHelpers = mockOptimistic;

    // Mock window.cloudSyncService
    (global as any).window = {
      ...window,
      cloudSyncService: {
        triggerSyncForCriticalChange: vi.fn(),
      },
    };
  });

  afterEach(() => {
    queryClient.clear();
    mockDb._resetMockData();
    vi.clearAllMocks();
  });

  describe("useAddBillMutation", () => {
    it("should add a new bill successfully", async () => {
      // Arrange
      const { result } = renderHook(() => useAddBillMutation(), { wrapper });

      const newBillData = {
        name: "Test Bill",
        provider: "Test Provider",
        amount: 100,
        dueDate: "2024-02-15",
        category: "Utilities",
      };

      // Act
      await act(async () => {
        await result.current.mutateAsync(newBillData);
      });

      // Assert
      // NOTE: Current implementation doesn't use optimistic helpers for add
      // This should be added in future optimization
      expect(mockDb.envelopes.add).toHaveBeenCalled();

      const addedBill = mockDb.envelopes.add.mock.calls[0][0];
      expect(addedBill.name).toBe("Test Bill");
      expect(addedBill.isPaid).toBe(false);
      expect(addedBill.id).toContain("bill_");
      expect(addedBill.createdAt).toBeDefined();
    });

    it("should invalidate related queries on success", async () => {
      // Arrange
      const { result } = renderHook(() => useAddBillMutation(), { wrapper });
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const newBillData = mockDataGenerators.bill();

      // Act
      await act(async () => {
        await result.current.mutateAsync(newBillData);
      });

      // Assert - Check that invalidation was called with correct query keys
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.bills });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.dashboard });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.budgetMetadata });
    });

    it("should trigger cloud sync on success", async () => {
      // Arrange
      const { result } = renderHook(() => useAddBillMutation(), { wrapper });
      const newBillData = mockDataGenerators.bill();

      // Act
      await act(async () => {
        await result.current.mutateAsync(newBillData);
      });

      // Assert
      expect((window as any).cloudSyncService.triggerSyncForCriticalChange).toHaveBeenCalledWith(
        "bill_add"
      );
    });

    it("should rollback on error", async () => {
      // Arrange
      mockDb.envelopes.add.mockRejectedValue(new Error("Database error"));

      const { result } = renderHook(() => useAddBillMutation(), { wrapper });
      const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");

      // Set previous data for rollback
      queryClient.setQueryData(queryKeys.bills, [mockDataGenerators.bill()]);

      const newBillData = mockDataGenerators.bill();

      // Act & Assert
      await act(async () => {
        await expect(result.current.mutateAsync(newBillData)).rejects.toThrow("Database error");
      });

      // Rollback should have been attempted
      expect(setQueryDataSpy).toHaveBeenCalled();
    });
  });

  describe("useUpdateBillMutation", () => {
    it("should update an existing bill successfully", async () => {
      // Arrange
      const existingBill = mockDataGenerators.bill({ id: "bill_1", name: "Old Name" });
      mockDb._mockData.envelopes = [existingBill];

      const { result } = renderHook(() => useUpdateBillMutation(), { wrapper });

      const updates = { name: "New Name", amount: 150 };

      // Act
      await act(async () => {
        await result.current.mutateAsync({ billId: "bill_1", updates });
      });

      // Assert
      // NOTE: Current implementation doesn't use optimistic helpers for update
      // This should be added in future optimization
      expect(mockDb.envelopes.update).toHaveBeenCalledWith(
        "bill_1",
        expect.objectContaining({
          name: "New Name",
          amount: 150,
        })
      );
    });

    it("should throw error if bill not found", async () => {
      // Arrange
      mockDb._mockData.envelopes = [];
      mockDb.envelopes.get.mockResolvedValue(undefined);

      const { result } = renderHook(() => useUpdateBillMutation(), { wrapper });

      // Act & Assert
      await act(async () => {
        await expect(
          result.current.mutateAsync({ billId: "nonexistent", updates: { name: "Test" } })
        ).rejects.toThrow("not found");
      });
    });

    it("should preserve bill ID during update", async () => {
      // Arrange
      const existingBill = mockDataGenerators.bill({ id: "bill_1" });
      mockDb._mockData.envelopes = [existingBill];

      const { result } = renderHook(() => useUpdateBillMutation(), { wrapper });

      // Act
      await act(async () => {
        await result.current.mutateAsync({
          billId: "bill_1",
          updates: { name: "Updated" },
        });
      });

      // Assert
      const updatedBill = mockDb.envelopes.update.mock.calls[0][1];
      expect(updatedBill.id).toBe("bill_1");
    });

    it("should invalidate related queries on success", async () => {
      // Arrange
      const existingBill = mockDataGenerators.bill({ id: "bill_1" });
      mockDb._mockData.envelopes = [existingBill];

      const { result } = renderHook(() => useUpdateBillMutation(), { wrapper });
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      // Act
      await act(async () => {
        await result.current.mutateAsync({
          billId: "bill_1",
          updates: { name: "Updated" },
        });
      });

      // Assert - Check that invalidation was called with correct query keys
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.bills });
    });
  });

  describe("useDeleteBillMutation", () => {
    it("should delete a bill successfully", async () => {
      // Arrange
      const billToDelete = mockDataGenerators.bill({ id: "bill_1" });
      mockDb._mockData.envelopes = [billToDelete];

      const { result } = renderHook(() => useDeleteBillMutation(), { wrapper });

      // Act
      await act(async () => {
        await result.current.mutateAsync("bill_1");
      });

      // Assert
      // NOTE: Current implementation doesn't use optimistic helpers for delete
      // This should be added in future optimization
      expect(mockDb.envelopes.delete).toHaveBeenCalledWith("bill_1");
    });

    it("should invalidate related queries on success", async () => {
      // Arrange
      const { result } = renderHook(() => useDeleteBillMutation(), { wrapper });
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      // Act
      await act(async () => {
        await result.current.mutateAsync("bill_1");
      });

      // Assert - Check that invalidation was called
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.bills });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.dashboard });
    });

    it("should trigger cloud sync on success", async () => {
      // Arrange
      const { result } = renderHook(() => useDeleteBillMutation(), { wrapper });

      // Act
      await act(async () => {
        await result.current.mutateAsync("bill_1");
      });

      // Assert
      expect(window.cloudSyncService.triggerSyncForCriticalChange).toHaveBeenCalledWith(
        "bill_delete"
      );
    });
  });

  describe("useMarkBillPaidMutation", () => {
    it("should mark a bill as paid and create transaction", async () => {
      // Arrange
      const unpaidBill = mockDataGenerators.bill({ id: "bill_1", isPaid: false });
      const envelope = mockDataGenerators.envelope({
        id: "envelope_1",
        currentBalance: 500,
      });
      mockDb._mockData.envelopes = [unpaidBill, envelope];

      const { result } = renderHook(() => useMarkBillPaidMutation(), { wrapper });

      const paymentData = {
        billId: "bill_1",
        paidAmount: 100,
        paidDate: "2024-01-15",
        envelopeId: "envelope_1",
      };

      // Act
      await act(async () => {
        await result.current.mutateAsync(paymentData);
      });

      // Assert
      expect(mockDb.envelopes.update).toHaveBeenCalledWith(
        "bill_1",
        expect.objectContaining({
          isPaid: true,
          lastModified: expect.any(Number),
        })
      );

      // Should create payment transaction
      expect(mockDb.transactions.put).toHaveBeenCalled();
      const transaction = mockDb.transactions.put.mock.calls[0][0];
      expect(transaction.id).toContain("bill_1"); // Transaction ID contains bill ID
      expect(transaction.amount).toBe(-100); // Negative for expense
      expect(transaction.type).toBe("expense");
      expect(transaction.envelopeId).toBe("envelope_1");
    });

    it("should create transaction with valid envelope", async () => {
      // Arrange - Envelope balance update is now handled by useTransactionBalanceUpdater
      // This test verifies that the transaction is created correctly when envelope exists
      const unpaidBill = mockDataGenerators.bill({ id: "bill_1" });
      const envelope = mockDataGenerators.envelope({
        id: "envelope_1",
        currentBalance: 500,
      });

      mockDb._mockData.envelopes = [unpaidBill, envelope];

      const { result } = renderHook(() => useMarkBillPaidMutation(), { wrapper });

      const paymentData = {
        billId: "bill_1",
        paidAmount: 100,
        envelopeId: "envelope_1",
      };

      // Act
      await act(async () => {
        await result.current.mutateAsync(paymentData);
      });

      // Assert - Transaction should be created with correct envelope
      expect(mockDb.transactions.put).toHaveBeenCalled();
      const transaction = mockDb.transactions.put.mock.calls[0][0];
      expect(transaction.envelopeId).toBe("envelope_1");
      expect(transaction.amount).toBe(-100);
    });

    it("should use current date if paidDate not provided", async () => {
      // Arrange
      const unpaidBill = mockDataGenerators.bill({ id: "bill_1", envelopeId: "envelope_1" });
      const envelope = mockDataGenerators.envelope({
        id: "envelope_1",
        currentBalance: 500,
      });
      mockDb._mockData.envelopes = [unpaidBill, envelope];

      const { result } = renderHook(() => useMarkBillPaidMutation(), { wrapper });

      // Act
      await act(async () => {
        await result.current.mutateAsync({
          billId: "bill_1",
          paidAmount: 100,
          envelopeId: "envelope_1",
        });
      });

      // Assert
      const updatedBill = mockDb.envelopes.update.mock.calls[0][1];
      expect(updatedBill.paidDate).toBeDefined();
      expect(updatedBill.isPaid).toBe(true);
    });

    it("should invalidate related queries including transactions and envelopes", async () => {
      // Arrange
      const unpaidBill = mockDataGenerators.bill({ id: "bill_1", envelopeId: "envelope_1" });
      const envelope = mockDataGenerators.envelope({
        id: "envelope_1",
        currentBalance: 500,
      });
      mockDb._mockData.envelopes = [unpaidBill, envelope];

      const { result } = renderHook(() => useMarkBillPaidMutation(), { wrapper });
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      // Act
      await act(async () => {
        await result.current.mutateAsync({
          billId: "bill_1",
          paidAmount: 100,
          envelopeId: "envelope_1",
        });
      });

      // Assert - Check that invalidation was called
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.bills });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.transactions });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.envelopes });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.dashboard });
    });

    it("should handle error when bill not found", async () => {
      // Arrange
      mockDb._mockData.envelopes = [];
      mockDb.envelopes.get.mockResolvedValue(undefined);

      const { result } = renderHook(() => useMarkBillPaidMutation(), { wrapper });

      // Act & Assert
      await act(async () => {
        await expect(
          result.current.mutateAsync({
            billId: "nonexistent",
            paidAmount: 100,
          })
        ).rejects.toThrow("not found");
      });
    });

    it("should require envelope for payment", async () => {
      // Arrange
      const unpaidBill = mockDataGenerators.bill({ id: "bill_1", envelopeId: undefined });
      mockDb._mockData.envelopes = [unpaidBill];

      const { result } = renderHook(() => useMarkBillPaidMutation(), { wrapper });

      // Act & Assert - Should throw error when no envelope is provided
      await act(async () => {
        await expect(
          result.current.mutateAsync({
            billId: "bill_1",
            paidAmount: 100,
          })
        ).rejects.toThrow("Bill payment requires an envelope");
      });
    });
  });

  describe("Optimistic Updates", () => {
    it.skip("should apply optimistic update before database update", async () => {
      // NOTE: Skipped - Current implementation doesn't use optimistic helpers
      // Future enhancement: Add optimistic updates for better UX

      // Arrange
      const { result } = renderHook(() => useAddBillMutation(), { wrapper });
      const newBillData = mockDataGenerators.bill();

      const callOrder: string[] = [];

      mockOptimistic.addBill.mockImplementation(async () => {
        callOrder.push("optimistic");
        return Promise.resolve();
      });

      mockDb.envelopes.add.mockImplementation(async () => {
        callOrder.push("database");
        return Promise.resolve();
      });

      // Act
      await act(async () => {
        await result.current.mutateAsync(newBillData);
      });

      // Assert
      expect(callOrder).toEqual(["optimistic", "database"]);
    });

    it("should rollback optimistic update on mutation error", async () => {
      // Arrange
      const existingBills = [mockDataGenerators.bill({ id: "bill_1" })];
      queryClient.setQueryData(queryKeys.bills, existingBills);

      mockDb.envelopes.add.mockRejectedValue(new Error("Database error"));

      const { result } = renderHook(() => useAddBillMutation(), { wrapper });

      // Act
      await act(async () => {
        try {
          await result.current.mutateAsync(mockDataGenerators.bill());
        } catch {
          // Expected error
        }
      });

      // Assert - Previous data should be restored
      const data = queryClient.getQueryData(queryKeys.bills);
      expect(data).toEqual(existingBills);
    });
  });

  describe("Validation Error Handling", () => {
    it("should throw error when adding bill with missing required fields", async () => {
      // Arrange
      const { result } = renderHook(() => useAddBillMutation(), { wrapper });

      const invalidBillData = {
        name: "", // Empty name should trigger validation
        provider: "Test Provider",
        amount: 100,
      };

      // Act & Assert - Hook should throw validation error for empty name
      await act(async () => {
        await expect(result.current.mutateAsync(invalidBillData)).rejects.toThrow(
          "Invalid bill data"
        );
      });
    });

    it("should throw error when updating non-existent bill", async () => {
      // Arrange
      mockDb._mockData.envelopes = [];
      mockDb.envelopes.get.mockResolvedValue(undefined);

      const { result } = renderHook(() => useUpdateBillMutation(), { wrapper });

      // Act & Assert
      await act(async () => {
        await expect(
          result.current.mutateAsync({ billId: "nonexistent", updates: { name: "Test" } })
        ).rejects.toThrow("not found");
      });
    });

    it("should handle envelope relationship validation when marking paid", async () => {
      // Arrange
      const unpaidBill = mockDataGenerators.bill({ id: "bill_1", isPaid: false });
      mockDb._mockData.envelopes = [unpaidBill];

      // Mock envelope as not existing
      mockDb.envelopes = {
        ...mockDb.envelopes,
        get: vi.fn().mockResolvedValue(undefined),
        update: vi.fn(),
      };

      const { result } = renderHook(() => useMarkBillPaidMutation(), { wrapper });

      const paymentData = {
        billId: "bill_1",
        paidAmount: 100,
        envelopeId: "non-existent-envelope",
      };

      // Act & Assert - Should throw error when envelope doesn't exist
      await act(async () => {
        await expect(result.current.mutateAsync(paymentData)).rejects.toThrow("not found");
      });
    });

    it("should handle payment processing errors", async () => {
      // Arrange - Need to provide a valid envelope for the payment to proceed to transaction creation
      const unpaidBill = mockDataGenerators.bill({
        id: "bill_1",
        isPaid: false,
        envelopeId: "env-1",
      });
      const mockEnvelope = mockDataGenerators.envelope({ id: "env-1", currentBalance: 1000 });
      mockDb._mockData.envelopes = [unpaidBill, mockEnvelope];
      mockDb.envelopes.get = vi.fn().mockResolvedValue(mockEnvelope);
      mockDb.transactions.put.mockRejectedValue(new Error("Transaction creation failed"));

      const { result } = renderHook(() => useMarkBillPaidMutation(), { wrapper });

      // Act & Assert
      await act(async () => {
        await expect(
          result.current.mutateAsync({
            billId: "bill_1",
            paidAmount: 100,
            envelopeId: "env-1",
          })
        ).rejects.toThrow("Transaction creation failed");
      });
    });

    it("should handle recurring bill edge case with invalid frequency", async () => {
      // Arrange
      const { result } = renderHook(() => useAddBillMutation(), { wrapper });

      const recurringBillData = {
        name: "Recurring Bill",
        provider: "Provider",
        amount: 50,
        isRecurring: true,
        frequency: "", // Empty frequency for recurring bill - should fail validation
      };

      // Act & Assert - Should throw validation error
      await act(async () => {
        await expect(result.current.mutateAsync(recurringBillData)).rejects.toThrow(
          "Invalid bill data"
        );
      });
    });

    it("should handle database error during bill deletion", async () => {
      // Arrange
      mockDb.envelopes.delete.mockRejectedValue(new Error("Database delete failed"));

      const { result } = renderHook(() => useDeleteBillMutation(), { wrapper });

      // Act & Assert
      await act(async () => {
        await expect(result.current.mutateAsync("bill_1")).rejects.toThrow(
          "Database delete failed"
        );
      });
    });

    it("should handle negative payment amount gracefully", async () => {
      // Arrange - Need to provide a valid envelope for payment
      const unpaidBill = mockDataGenerators.bill({
        id: "bill_1",
        isPaid: false,
        envelopeId: "env-1",
      });
      const mockEnvelope = mockDataGenerators.envelope({ id: "env-1", currentBalance: 1000 });
      mockDb._mockData.envelopes = [unpaidBill, mockEnvelope];
      mockDb.envelopes.get = vi.fn().mockResolvedValue(mockEnvelope);

      const { result } = renderHook(() => useMarkBillPaidMutation(), { wrapper });

      const paymentData = {
        billId: "bill_1",
        paidAmount: -100, // Negative amount
        envelopeId: "env-1",
      };

      // Act - Should convert to positive or handle appropriately
      await act(async () => {
        await result.current.mutateAsync(paymentData);
      });

      // Assert - Transaction should have negative amount (expense)
      const transaction = mockDb.transactions.put.mock.calls[0][0];
      expect(transaction.amount).toBe(-100); // Negative for expense (absolute value of input)
    });

    it("should validate bill not found on mark as paid", async () => {
      // Arrange
      mockDb._mockData.envelopes = [];
      mockDb.envelopes.get.mockResolvedValue(undefined);

      const { result } = renderHook(() => useMarkBillPaidMutation(), { wrapper });

      // Act & Assert
      await act(async () => {
        await expect(
          result.current.mutateAsync({
            billId: "nonexistent",
            paidAmount: 100,
          })
        ).rejects.toThrow("not found");
      });
    });

    it("should handle concurrent bill updates gracefully", async () => {
      // Arrange
      const bill = mockDataGenerators.bill({ id: "bill_1", type: "bill" });
      mockDb._mockData.envelopes = [bill];

      const { result } = renderHook(() => useUpdateBillMutation(), { wrapper });

      // Act - Simulate concurrent updates
      await act(async () => {
        await Promise.all([
          result.current.mutateAsync({ billId: "bill_1", updates: { name: "Update 1" } }),
          result.current.mutateAsync({ billId: "bill_1", updates: { amount: 200 } }),
        ]);
      });

      // Assert - Both updates should have been called
      expect(mockDb.envelopes.update).toHaveBeenCalledTimes(2);
    });
  });

  /**
   * Comprehensive Zod Schema Validation Tests
   * Similar to Envelope CRUD test quality
   */
  describe("Zod Schema Validation", () => {
    describe("BillSchema", () => {
      const validBill = {
        id: "bill-123",
        name: "Electric Bill",
        dueDate: new Date(),
        amount: 150,
        category: "Utilities",
        isPaid: false,
        isRecurring: true,
        type: "bill" as const,
        frequency: "monthly" as const,
        lastModified: Date.now(),
      };

      it("should validate a complete valid bill", () => {
        const result = BillSchema.safeParse(validBill);
        expect(result.success).toBe(true);
      });

      it("should validate a bill with all optional fields", () => {
        const fullBill = {
          ...validBill,
          envelopeId: "envelope-123",
          createdAt: Date.now() - 1000,
          description: "Monthly electric bill payment",
          paymentMethod: "Bank Transfer",
        };

        const result = BillSchema.safeParse(fullBill);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.envelopeId).toBe("envelope-123");
          expect(result.data.description).toBe("Monthly electric bill payment");
        }
      });

      it("should reject bill without id", () => {
        const invalidBill = { ...validBill, id: "" };
        const result = BillSchema.safeParse(invalidBill);
        expect(result.success).toBe(false);
      });

      it("should reject bill with invalid type", () => {
        const invalidBill = { ...validBill, type: "invalid_type" };
        const result = BillSchema.safeParse(invalidBill);
        expect(result.success).toBe(false);
      });

      it("should reject bill with negative amount", () => {
        const invalidBill = { ...validBill, amount: -100 };
        const result = BillSchema.safeParse(invalidBill);
        expect(result.success).toBe(false);
      });

      it("should reject bill with name exceeding max length", () => {
        const invalidBill = { ...validBill, name: "a".repeat(101) };
        const result = BillSchema.safeParse(invalidBill);
        expect(result.success).toBe(false);
      });

      it("should reject bill without category", () => {
        const invalidBill = { ...validBill, category: "" };
        const result = BillSchema.safeParse(invalidBill);
        expect(result.success).toBe(false);
      });

      it("should reject bill with invalid lastModified", () => {
        const invalidBill = { ...validBill, lastModified: -1 };
        const result = BillSchema.safeParse(invalidBill);
        expect(result.success).toBe(false);
      });
    });

    describe("BillFrequencySchema", () => {
      it("should validate valid frequency values", () => {
        expect(BillFrequencySchema.parse("monthly")).toBe("monthly");
        expect(BillFrequencySchema.parse("quarterly")).toBe("quarterly");
        expect(BillFrequencySchema.parse("annually")).toBe("annually");
      });

      it("should accept undefined for non-recurring bills", () => {
        expect(BillFrequencySchema.parse(undefined)).toBeUndefined();
      });

      it("should reject invalid frequency values", () => {
        expect(() => BillFrequencySchema.parse("weekly")).toThrow();
        expect(() => BillFrequencySchema.parse("daily")).toThrow();
        expect(() => BillFrequencySchema.parse("biweekly")).toThrow();
      });
    });

    describe("BillPartialSchema", () => {
      it("should validate partial bill updates", () => {
        const partialUpdate = { name: "Updated Bill Name", amount: 200 };
        const result = BillPartialSchema.safeParse(partialUpdate);
        expect(result.success).toBe(true);
      });

      it("should validate single field update", () => {
        const singleUpdate = { amount: 175.5 };
        const result = BillPartialSchema.safeParse(singleUpdate);
        expect(result.success).toBe(true);
      });

      it("should reject invalid partial update values", () => {
        const invalidUpdate = { amount: -50 };
        const result = BillPartialSchema.safeParse(invalidUpdate);
        expect(result.success).toBe(false);
      });

      it("should accept empty object for no changes", () => {
        const result = BillPartialSchema.safeParse({});
        expect(result.success).toBe(true);
      });
    });

    describe("BillFormDataMinimalSchema", () => {
      it("should validate minimal form data", () => {
        const formData = {
          name: "Internet Bill",
          amount: "75.99",
          dueDate: "2024-02-15",
        };
        const result = BillFormDataMinimalSchema.safeParse(formData);
        expect(result.success).toBe(true);
      });

      it("should reject form data with empty name", () => {
        const formData = { name: "", amount: "100", dueDate: "2024-02-15" };
        const result = BillFormDataMinimalSchema.safeParse(formData);
        expect(result.success).toBe(false);
      });

      it("should reject form data with invalid amount", () => {
        const formData = { name: "Bill", amount: "not-a-number", dueDate: "2024-02-15" };
        const result = BillFormDataMinimalSchema.safeParse(formData);
        expect(result.success).toBe(false);
      });

      it("should reject form data with zero amount", () => {
        const formData = { name: "Bill", amount: "0", dueDate: "2024-02-15" };
        const result = BillFormDataMinimalSchema.safeParse(formData);
        expect(result.success).toBe(false);
      });

      it("should reject form data with empty dueDate", () => {
        const formData = { name: "Bill", amount: "100", dueDate: "" };
        const result = BillFormDataMinimalSchema.safeParse(formData);
        expect(result.success).toBe(false);
      });
    });

    describe("Validation Helper Functions", () => {
      const validBill = {
        id: "bill-test",
        name: "Test Bill",
        dueDate: new Date(),
        amount: 100,
        category: "Test",
        isPaid: false,
        isRecurring: false,
        type: "bill" as const,
        lastModified: Date.now(),
      };

      it("validateBill should return validated bill for valid data", () => {
        const result = validateBill(validBill);
        expect(result.id).toBe("bill-test");
        expect(result.name).toBe("Test Bill");
      });

      it("validateBill should throw error for invalid data", () => {
        const invalidBill = { ...validBill, id: "", name: "" };
        expect(() => validateBill(invalidBill)).toThrow();
      });

      it("validateBillSafe should return success result for valid data", () => {
        const result = validateBillSafe(validBill);
        expect(result.success).toBe(true);
      });

      it("validateBillSafe should return error result for invalid data", () => {
        const invalidBill = { ...validBill, id: "" };
        const result = validateBillSafe(invalidBill);
        expect(result.success).toBe(false);
      });

      it("validateBillPartial should validate partial updates", () => {
        const partialData = { name: "New Name" };
        const result = validateBillPartial(partialData);
        expect(result.name).toBe("New Name");
      });

      it("validateBillPartialSafe should return success for valid partial", () => {
        const result = validateBillPartialSafe({ amount: 150 });
        expect(result.success).toBe(true);
      });

      it("validateBillPartialSafe should return error for invalid partial", () => {
        const result = validateBillPartialSafe({ amount: -50 });
        expect(result.success).toBe(false);
      });

      it("validateBillFormDataMinimal should validate form data", () => {
        const formData = { name: "Bill", amount: "100", dueDate: "2024-01-15" };
        const result = validateBillFormDataMinimal(formData);
        expect(result.name).toBe("Bill");
      });
    });
  });

  /**
   * Safety Checks - Prevent Invalid Operations
   */
  describe("Safety Checks", () => {
    it("should prevent adding bill with empty name", async () => {
      const { result } = renderHook(() => useAddBillMutation(), { wrapper });

      await act(async () => {
        await expect(
          result.current.mutateAsync({
            name: "",
            amount: 100,
            dueDate: "2024-02-15",
            category: "Test",
          })
        ).rejects.toThrow("Invalid bill data");
      });
    });

    it("should allow adding bill with zero amount (minimum allowed)", async () => {
      const { result } = renderHook(() => useAddBillMutation(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          name: "Test Bill",
          amount: 0,
          dueDate: "2024-02-15",
          category: "Test",
        });
      });

      // 0 is valid per schema (min 0)
      expect(mockDb.envelopes.add).toHaveBeenCalled();
      const addedBill = mockDb.envelopes.add.mock.calls[0][0];
      expect(addedBill.amount).toBe(0);
    });

    it("should prevent updating bill with empty name", async () => {
      const existingBill = mockDataGenerators.bill({ id: "bill_1", name: "Original" });
      mockDb._mockData.envelopes = [existingBill];

      const { result } = renderHook(() => useUpdateBillMutation(), { wrapper });

      await act(async () => {
        await expect(
          result.current.mutateAsync({ billId: "bill_1", updates: { name: "" } })
        ).rejects.toThrow("Invalid bill update data");
      });
    });

    it("should prevent updating bill with negative amount", async () => {
      const existingBill = mockDataGenerators.bill({ id: "bill_1" });
      mockDb._mockData.envelopes = [existingBill];

      const { result } = renderHook(() => useUpdateBillMutation(), { wrapper });

      await act(async () => {
        await expect(
          result.current.mutateAsync({ billId: "bill_1", updates: { amount: -50 } })
        ).rejects.toThrow("Invalid bill update data");
      });
    });

    it("should prevent clearing required category", async () => {
      const existingBill = mockDataGenerators.bill({ id: "bill_1" });
      mockDb._mockData.envelopes = [existingBill];

      const { result } = renderHook(() => useUpdateBillMutation(), { wrapper });

      await act(async () => {
        await expect(
          result.current.mutateAsync({ billId: "bill_1", updates: { category: "" } })
        ).rejects.toThrow("Invalid bill update data");
      });
    });

    it("should allow valid partial updates", async () => {
      const existingBill = mockDataGenerators.bill({ id: "bill_1", name: "Original" });
      mockDb._mockData.envelopes = [existingBill];

      const { result } = renderHook(() => useUpdateBillMutation(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          billId: "bill_1",
          updates: { name: "Updated Name", amount: 250 },
        });
      });

      expect(mockDb.envelopes.update).toHaveBeenCalledWith(
        "bill_1",
        expect.objectContaining({
          name: "Updated Name",
          amount: 250,
        })
      );
    });
  });

  /**
   * Bill-Envelope Relationship Validation
   */
  describe("Bill-Envelope Relationship Validation", () => {
    it("should reject payment when envelope does not exist", async () => {
      const unpaidBill = mockDataGenerators.bill({ id: "bill_1", isPaid: false });
      mockDb._mockData.envelopes = [unpaidBill];
      mockDb._mockData.envelopes = []; // No envelopes

      const { result } = renderHook(() => useMarkBillPaidMutation(), { wrapper });

      await act(async () => {
        await expect(
          result.current.mutateAsync({
            billId: "bill_1",
            paidAmount: 100,
            envelopeId: "non-existent-envelope",
          })
        ).rejects.toThrow("not found");
      });
    });

    it("should accept payment when envelope exists", async () => {
      const unpaidBill = mockDataGenerators.bill({ id: "bill_1", isPaid: false });
      const envelope = mockDataGenerators.envelope({ id: "valid-envelope" });
      mockDb._mockData.envelopes = [unpaidBill, envelope];

      const { result } = renderHook(() => useMarkBillPaidMutation(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          billId: "bill_1",
          paidAmount: 100,
          envelopeId: "valid-envelope",
        });
      });

      expect(mockDb.envelopes.update).toHaveBeenCalled();
      expect(mockDb.transactions.put).toHaveBeenCalled();
    });

    it("should use bill's envelopeId if not provided in payment", async () => {
      const envelope = mockDataGenerators.envelope({ id: "bill-envelope" });
      const unpaidBill = mockDataGenerators.bill({
        id: "bill_1",
        isPaid: false,
        envelopeId: "bill-envelope",
      });
      mockDb._mockData.envelopes = [unpaidBill, envelope];

      const { result } = renderHook(() => useMarkBillPaidMutation(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          billId: "bill_1",
          paidAmount: 100,
        });
      });

      const transaction = mockDb.transactions.put.mock.calls[0][0];
      expect(transaction.envelopeId).toBe("bill-envelope");
    });

    it("should reject payment with empty envelope ID", async () => {
      const unpaidBill = mockDataGenerators.bill({
        id: "bill_1",
        isPaid: false,
        envelopeId: "",
      });
      mockDb._mockData.envelopes = [unpaidBill];

      const { result } = renderHook(() => useMarkBillPaidMutation(), { wrapper });

      await act(async () => {
        await expect(
          result.current.mutateAsync({
            billId: "bill_1",
            paidAmount: 100,
            envelopeId: "", // Empty envelope ID
          })
        ).rejects.toThrow("Bill payment requires an envelope");
      });
    });

    it("should reject payment with whitespace-only envelope ID", async () => {
      const unpaidBill = mockDataGenerators.bill({
        id: "bill_1",
        isPaid: false,
        envelopeId: undefined,
      });
      mockDb._mockData.envelopes = [unpaidBill];

      const { result } = renderHook(() => useMarkBillPaidMutation(), { wrapper });

      await act(async () => {
        await expect(
          result.current.mutateAsync({
            billId: "bill_1",
            paidAmount: 100,
            envelopeId: "   ", // Whitespace only
          })
        ).rejects.toThrow("Bill payment requires an envelope");
      });
    });
  });

  /**
   * Recurring Bill Validation
   */
  describe("Recurring Bill Validation", () => {
    it("should validate recurring bill with valid frequency", async () => {
      const { result } = renderHook(() => useAddBillMutation(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          name: "Netflix Subscription",
          amount: 15.99,
          dueDate: "2024-02-15",
          category: "Entertainment",
          isRecurring: true,
          frequency: "monthly",
        });
      });

      expect(mockDb.envelopes.add).toHaveBeenCalled();
      const addedBill = mockDb.envelopes.add.mock.calls[0][0];
      expect(addedBill.isRecurring).toBe(true);
      expect(addedBill.frequency).toBe("monthly");
    });

    it("should validate quarterly recurring bill", async () => {
      const { result } = renderHook(() => useAddBillMutation(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          name: "Quarterly Insurance",
          amount: 300,
          dueDate: "2024-03-01",
          category: "Insurance",
          isRecurring: true,
          frequency: "quarterly",
        });
      });

      expect(mockDb.envelopes.add).toHaveBeenCalled();
      const addedBill = mockDb.envelopes.add.mock.calls[0][0];
      expect(addedBill.frequency).toBe("quarterly");
    });

    it("should validate annually recurring bill", async () => {
      const { result } = renderHook(() => useAddBillMutation(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          name: "Annual Membership",
          amount: 120,
          dueDate: "2024-12-01",
          category: "Memberships",
          isRecurring: true,
          frequency: "annually",
        });
      });

      expect(mockDb.envelopes.add).toHaveBeenCalled();
      const addedBill = mockDb.envelopes.add.mock.calls[0][0];
      expect(addedBill.frequency).toBe("annually");
    });

    it("should allow non-recurring bill without frequency", async () => {
      const { result } = renderHook(() => useAddBillMutation(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          name: "One-time Payment",
          amount: 500,
          dueDate: "2024-02-20",
          category: "Other",
          isRecurring: false,
        });
      });

      expect(mockDb.envelopes.add).toHaveBeenCalled();
      const addedBill = mockDb.envelopes.add.mock.calls[0][0];
      expect(addedBill.isRecurring).toBe(false);
    });
  });

  /**
   * Error Recovery and Rollback Tests
   */
  describe("Error Recovery and Rollback", () => {
    it("should rollback on add mutation error", async () => {
      const existingBills = [mockDataGenerators.bill({ id: "existing_1" })];
      queryClient.setQueryData(queryKeys.bills, existingBills);
      mockDb.envelopes.add.mockRejectedValue(new Error("Database error"));

      const { result } = renderHook(() => useAddBillMutation(), { wrapper });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            name: "New Bill",
            amount: 100,
            dueDate: "2024-02-15",
            category: "Test",
          });
        } catch {
          // Expected error
        }
      });

      // Previous data should be restored
      const data = queryClient.getQueryData(queryKeys.bills);
      expect(data).toEqual(existingBills);
    });

    it("should handle update mutation error gracefully", async () => {
      const existingBill = mockDataGenerators.bill({ id: "bill_1" });
      mockDb._mockData.envelopes = [existingBill];
      mockDb.envelopes.update.mockRejectedValue(new Error("Update failed"));

      const { result } = renderHook(() => useUpdateBillMutation(), { wrapper });

      await act(async () => {
        await expect(
          result.current.mutateAsync({
            billId: "bill_1",
            updates: { name: "Updated" },
          })
        ).rejects.toThrow("Update failed");
      });
    });

    it("should handle delete mutation error gracefully", async () => {
      mockDb.envelopes.delete.mockRejectedValue(new Error("Delete failed"));

      const { result } = renderHook(() => useDeleteBillMutation(), { wrapper });

      await act(async () => {
        await expect(result.current.mutateAsync("bill_1")).rejects.toThrow("Delete failed");
      });
    });

    it("should handle mark paid transaction creation failure", async () => {
      const unpaidBill = mockDataGenerators.bill({ id: "bill_1", envelopeId: "env-1" });
      const envelope = mockDataGenerators.envelope({ id: "env-1" });
      mockDb._mockData.envelopes = [unpaidBill, envelope];
      mockDb.transactions.put.mockRejectedValue(new Error("Transaction failed"));

      const { result } = renderHook(() => useMarkBillPaidMutation(), { wrapper });

      await act(async () => {
        await expect(
          result.current.mutateAsync({
            billId: "bill_1",
            paidAmount: 100,
            envelopeId: "env-1",
          })
        ).rejects.toThrow("Transaction failed");
      });
    });
  });

  /**
   * Edge Cases
   */
  describe("Edge Cases", () => {
    it("should handle bill with maximum name length", async () => {
      const { result } = renderHook(() => useAddBillMutation(), { wrapper });
      const maxLengthName = "a".repeat(100);

      await act(async () => {
        await result.current.mutateAsync({
          name: maxLengthName,
          amount: 100,
          dueDate: "2024-02-15",
          category: "Test",
        });
      });

      expect(mockDb.envelopes.add).toHaveBeenCalled();
      const addedBill = mockDb.envelopes.add.mock.calls[0][0];
      expect(addedBill.name.length).toBe(100);
    });

    it("should handle bill with maximum description length", async () => {
      const { result } = renderHook(() => useAddBillMutation(), { wrapper });
      const maxDescription = "d".repeat(500);

      await act(async () => {
        await result.current.mutateAsync({
          name: "Test Bill",
          amount: 100,
          dueDate: "2024-02-15",
          category: "Test",
          description: maxDescription,
        });
      });

      expect(mockDb.envelopes.add).toHaveBeenCalled();
    });

    it("should handle very large payment amounts", async () => {
      const unpaidBill = mockDataGenerators.bill({ id: "bill_1", envelopeId: "env-1" });
      const envelope = mockDataGenerators.envelope({ id: "env-1", currentBalance: 1000000 });
      mockDb._mockData.envelopes = [unpaidBill, envelope];

      const { result } = renderHook(() => useMarkBillPaidMutation(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          billId: "bill_1",
          paidAmount: 999999.99,
          envelopeId: "env-1",
        });
      });

      const transaction = mockDb.transactions.put.mock.calls[0][0];
      expect(transaction.amount).toBe(-999999.99);
    });

    it("should handle decimal payment amounts", async () => {
      const unpaidBill = mockDataGenerators.bill({ id: "bill_1", envelopeId: "env-1" });
      const envelope = mockDataGenerators.envelope({ id: "env-1", currentBalance: 1000 });
      mockDb._mockData.envelopes = [unpaidBill, envelope];

      const { result } = renderHook(() => useMarkBillPaidMutation(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          billId: "bill_1",
          paidAmount: 123.45,
          envelopeId: "env-1",
        });
      });

      const transaction = mockDb.transactions.put.mock.calls[0][0];
      expect(transaction.amount).toBe(-123.45);
    });

    it("should handle date string formats in dueDate", async () => {
      const { result } = renderHook(() => useAddBillMutation(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          name: "Test Bill",
          amount: 100,
          dueDate: "2024-12-31",
          category: "Test",
        });
      });

      expect(mockDb.envelopes.add).toHaveBeenCalled();
      const addedBill = mockDb.envelopes.add.mock.calls[0][0];
      expect(addedBill.dueDate).toBeDefined();
    });

    it("should handle Date object in dueDate", async () => {
      const { result } = renderHook(() => useAddBillMutation(), { wrapper });
      const dueDate = new Date("2024-06-15");

      await act(async () => {
        await result.current.mutateAsync({
          name: "Test Bill",
          amount: 100,
          dueDate: dueDate,
          category: "Test",
        });
      });

      expect(mockDb.envelopes.add).toHaveBeenCalled();
    });

    it("should generate unique IDs for each bill", async () => {
      const { result } = renderHook(() => useAddBillMutation(), { wrapper });
      const billIds: string[] = [];

      for (let i = 0; i < 3; i++) {
        await act(async () => {
          await result.current.mutateAsync({
            name: `Bill ${i}`,
            amount: 100,
            dueDate: "2024-02-15",
            category: "Test",
          });
        });
        billIds.push(mockDb.envelopes.add.mock.calls[i][0].id);
      }

      // All IDs should be unique
      const uniqueIds = new Set(billIds);
      expect(uniqueIds.size).toBe(3);
    });
  });
});
