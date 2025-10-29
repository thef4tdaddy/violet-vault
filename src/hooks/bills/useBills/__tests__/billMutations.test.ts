/**
 * Tests for Bill Mutation Hooks
 * Covers create, update, delete, and mark paid operations
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import {
  useAddBillMutation,
  useUpdateBillMutation,
  useDeleteBillMutation,
  useMarkBillPaidMutation,
} from "../billMutations";
import { createTestQueryClient, createQueryWrapper } from "@/test/queryTestUtils";
import {
  createMockDexie,
  mockDataGenerators,
  createMockOptimisticHelpers,
} from "@/test/queryMocks";
import { queryKeys } from "@/utils/common/queryClient";

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
      expect(mockOptimistic.addBill).toHaveBeenCalled();
      expect(mockDb.bills.add).toHaveBeenCalled();

      const addedBill = mockDb.bills.add.mock.calls[0][0];
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

      // Assert - Check that invalidation was called (synchronously after mutation success)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.bills });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.billsList });
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
      expect(window.cloudSyncService.triggerSyncForCriticalChange).toHaveBeenCalledWith("bill_add");
    });

    it("should rollback on error", async () => {
      // Arrange
      mockDb.bills.add.mockRejectedValue(new Error("Database error"));

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
      mockDb._mockData.bills = [existingBill];

      const { result } = renderHook(() => useUpdateBillMutation(), { wrapper });

      const updates = { name: "New Name", amount: 150 };

      // Act
      await act(async () => {
        await result.current.mutateAsync({ billId: "bill_1", updates });
      });

      // Assert
      expect(mockOptimistic.updateBill).toHaveBeenCalledWith(
        "bill_1",
        expect.objectContaining({
          name: "New Name",
          amount: 150,
        })
      );
      expect(mockDb.bills.update).toHaveBeenCalledWith(
        "bill_1",
        expect.objectContaining({
          name: "New Name",
          amount: 150,
        })
      );
    });

    it("should throw error if bill not found", async () => {
      // Arrange
      mockDb._mockData.bills = [];
      mockDb.bills.get.mockResolvedValue(undefined);

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
      mockDb._mockData.bills = [existingBill];

      const { result } = renderHook(() => useUpdateBillMutation(), { wrapper });

      // Act
      await act(async () => {
        await result.current.mutateAsync({
          billId: "bill_1",
          updates: { name: "Updated" },
        });
      });

      // Assert
      const updatedBill = mockDb.bills.update.mock.calls[0][1];
      expect(updatedBill.id).toBe("bill_1");
    });

    it("should invalidate related queries on success", async () => {
      // Arrange
      const existingBill = mockDataGenerators.bill({ id: "bill_1" });
      mockDb._mockData.bills = [existingBill];

      const { result } = renderHook(() => useUpdateBillMutation(), { wrapper });
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      // Act
      await act(async () => {
        await result.current.mutateAsync({
          billId: "bill_1",
          updates: { name: "Updated" },
        });
      });

      // Assert - Check that invalidation was called
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.bills });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.billsList });
    });
  });

  describe("useDeleteBillMutation", () => {
    it("should delete a bill successfully", async () => {
      // Arrange
      const billToDelete = mockDataGenerators.bill({ id: "bill_1" });
      mockDb._mockData.bills = [billToDelete];

      const { result } = renderHook(() => useDeleteBillMutation(), { wrapper });

      // Act
      await act(async () => {
        await result.current.mutateAsync("bill_1");
      });

      // Assert
      expect(mockOptimistic.deleteBill).toHaveBeenCalledWith("bill_1");
      expect(mockDb.bills.delete).toHaveBeenCalledWith("bill_1");
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
      mockDb._mockData.bills = [unpaidBill];

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
      expect(mockDb.bills.update).toHaveBeenCalledWith(
        "bill_1",
        expect.objectContaining({
          isPaid: true,
          paidAmount: 100,
          paidDate: "2024-01-15",
          envelopeId: "envelope_1",
        })
      );

      // Should create payment transaction
      expect(mockDb.transactions.put).toHaveBeenCalled();
      const transaction = mockDb.transactions.put.mock.calls[0][0];
      expect(transaction.billId).toBe("bill_1");
      expect(transaction.amount).toBe(-100); // Negative for expense
    });

    it("should update envelope balance when envelope is specified", async () => {
      // Arrange
      const unpaidBill = mockDataGenerators.bill({ id: "bill_1" });
      const envelope = mockDataGenerators.envelope({
        id: "envelope_1",
        currentBalance: 500,
      });

      mockDb._mockData.bills = [unpaidBill];
      mockDb._mockData.envelopes = [envelope];

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

      // Assert
      expect(mockDb.envelopes.update).toHaveBeenCalledWith(
        "envelope_1",
        expect.objectContaining({
          currentBalance: 400, // 500 - 100
        })
      );
    });

    it("should use current date if paidDate not provided", async () => {
      // Arrange
      const unpaidBill = mockDataGenerators.bill({ id: "bill_1" });
      mockDb._mockData.bills = [unpaidBill];

      const { result } = renderHook(() => useMarkBillPaidMutation(), { wrapper });

      // Act
      await act(async () => {
        await result.current.mutateAsync({
          billId: "bill_1",
          paidAmount: 100,
        });
      });

      // Assert
      const updatedBill = mockDb.bills.update.mock.calls[0][1];
      expect(updatedBill.paidDate).toBeDefined();
      expect(updatedBill.isPaid).toBe(true);
    });

    it("should invalidate related queries including transactions and envelopes", async () => {
      // Arrange
      const unpaidBill = mockDataGenerators.bill({ id: "bill_1" });
      mockDb._mockData.bills = [unpaidBill];

      const { result } = renderHook(() => useMarkBillPaidMutation(), { wrapper });
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      // Act
      await act(async () => {
        await result.current.mutateAsync({
          billId: "bill_1",
          paidAmount: 100,
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
      mockDb._mockData.bills = [];
      mockDb.bills.get.mockResolvedValue(undefined);

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
  });

  describe("Optimistic Updates", () => {
    it("should apply optimistic update before database update", async () => {
      // Arrange
      const { result } = renderHook(() => useAddBillMutation(), { wrapper });
      const newBillData = mockDataGenerators.bill();

      const callOrder: string[] = [];

      mockOptimistic.addBill.mockImplementation(async () => {
        callOrder.push("optimistic");
        return Promise.resolve();
      });

      mockDb.bills.add.mockImplementation(async () => {
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

      mockDb.bills.add.mockRejectedValue(new Error("Database error"));

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
});
