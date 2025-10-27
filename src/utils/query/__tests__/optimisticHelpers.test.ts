// Optimistic Helpers Tests
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { Mock } from "vitest";
import { optimisticHelpers } from "../optimisticHelpers";
import { budgetDb } from "@/db/budgetDb";
import { budgetDatabaseService } from "@/services/budgetDatabaseService";
import { queryKeys } from "../queryKeys";

// Mock dependencies
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    envelopes: {
      update: vi.fn(),
      add: vi.fn(),
      delete: vi.fn(),
    },
    transactions: {
      update: vi.fn(),
      add: vi.fn(),
    },
    bills: {
      update: vi.fn(),
    },
  },
}));

vi.mock("@/services/budgetDatabaseService", () => ({
  default: {
    saveBudgetMetadata: vi.fn(),
  },
}));

describe("optimisticHelpers", () => {
  let mockQueryClient: {
    setQueryData: Mock;
    setQueriesData: Mock;
    removeQueries: Mock;
    invalidateQueries: Mock;
    cancelQueries: Mock;
    getQueryData: Mock;
  };

  beforeEach(() => {
    mockQueryClient = {
      setQueryData: vi.fn(),
      setQueriesData: vi.fn(),
      removeQueries: vi.fn(),
      invalidateQueries: vi.fn(),
      cancelQueries: vi.fn(),
      getQueryData: vi.fn(),
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("updateEnvelope", () => {
    it("should update envelope optimistically", async () => {
      const envelopeId = "env1";
      const updates = { name: "Updated Food", balance: 500 };
      const existingEnvelope = { id: envelopeId, name: "Food", balance: 300 };

      mockQueryClient.setQueryData.mockImplementation((_key, updater) => {
        if (typeof updater === "function") {
          return updater(existingEnvelope);
        }
        return updater;
      });

      (budgetDb.envelopes.update as Mock).mockResolvedValue(true);

      await optimisticHelpers.updateEnvelope(mockQueryClient, envelopeId, updates);

      // Should update individual envelope query
      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
        queryKeys.envelopeById(envelopeId),
        expect.any(Function)
      );

      // Should update envelope list query
      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
        queryKeys.envelopesList(),
        expect.any(Function)
      );

      // Should update database
      expect(budgetDb.envelopes.update).toHaveBeenCalledWith(
        envelopeId,
        expect.objectContaining({
          ...updates,
          lastModified: expect.any(Number),
        })
      );
    });

    it("should handle database update failures gracefully", async () => {
      const envelopeId = "env1";
      const updates = { name: "Updated Food" };
      const error = new Error("Database update failed");

      (budgetDb.envelopes.update as Mock).mockRejectedValue(error);

      // Should not throw error
      await optimisticHelpers.updateEnvelope(mockQueryClient, envelopeId, updates);

      expect(mockQueryClient.setQueryData).toHaveBeenCalled();
    });

    it("should update envelope list correctly", async () => {
      const envelopeId = "env1";
      const updates = { name: "Updated Food" };
      const existingEnvelopes = [
        { id: "env1", name: "Food", balance: 300 },
        { id: "env2", name: "Gas", balance: 100 },
      ];

      mockQueryClient.setQueryData.mockImplementation((_key, updater) => {
        if (_key === queryKeys.envelopesList() && typeof updater === "function") {
          return updater(existingEnvelopes);
        }
        return updater;
      });

      await optimisticHelpers.updateEnvelope(mockQueryClient, envelopeId, updates);

      // Verify the updater function works correctly
      const updateFn = mockQueryClient.setQueryData.mock.calls.find(
        (call) => call[0] === queryKeys.envelopesList()
      )[1];

      const updatedList = updateFn(existingEnvelopes);
      expect(updatedList[0]).toMatchObject({
        id: "env1",
        name: "Updated Food",
        balance: 300,
        lastModified: expect.any(Number),
      });
      expect(updatedList[1]).toEqual(existingEnvelopes[1]);
    });
  });

  describe("addEnvelope", () => {
    it("should add envelope optimistically", async () => {
      const newEnvelope = { id: "env3", name: "Entertainment", balance: 200 };
      const existingEnvelopes = [
        { id: "env1", name: "Food", balance: 300 },
        { id: "env2", name: "Gas", balance: 100 },
      ];

      mockQueryClient.setQueryData.mockImplementation((_key, updater) => {
        if (typeof updater === "function") {
          return updater(existingEnvelopes);
        }
        return updater;
      });

      (budgetDb.envelopes.add as Mock).mockResolvedValue(true);

      await optimisticHelpers.addEnvelope(mockQueryClient, newEnvelope);

      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
        queryKeys.envelopesList(),
        expect.any(Function)
      );

      expect(budgetDb.envelopes.add).toHaveBeenCalledWith(
        expect.objectContaining({
          ...newEnvelope,
          createdAt: expect.any(Number),
          lastModified: expect.any(Number),
        })
      );
    });

    it("should handle adding to empty list", async () => {
      const newEnvelope = { id: "env1", name: "Food", balance: 300 };

      mockQueryClient.setQueryData.mockImplementation((_key, updater) => {
        if (typeof updater === "function") {
          return updater(null);
        }
        return updater;
      });

      await optimisticHelpers.addEnvelope(mockQueryClient, newEnvelope);

      const updateFn = mockQueryClient.setQueryData.mock.calls[0][1];
      const result = updateFn(null);

      expect(result).toEqual([
        expect.objectContaining({
          ...newEnvelope,
          createdAt: expect.any(Number),
          lastModified: expect.any(Number),
        }),
      ]);
    });
  });

  describe("removeEnvelope", () => {
    it("should remove envelope optimistically", async () => {
      const envelopeId = "env2";
      const existingEnvelopes = [
        { id: "env1", name: "Food", balance: 300 },
        { id: "env2", name: "Gas", balance: 100 },
      ];

      mockQueryClient.setQueryData.mockImplementation((_key, updater) => {
        if (typeof updater === "function") {
          return updater(existingEnvelopes);
        }
        return updater;
      });

      (budgetDb.envelopes.delete as Mock).mockResolvedValue(true);

      await optimisticHelpers.removeEnvelope(mockQueryClient, envelopeId);

      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
        queryKeys.envelopesList(),
        expect.any(Function)
      );

      expect(mockQueryClient.removeQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.envelopeById(envelopeId),
      });

      expect(budgetDb.envelopes.delete).toHaveBeenCalledWith(envelopeId);

      // Test the filter function
      const updateFn = mockQueryClient.setQueryData.mock.calls[0][1];
      const result = updateFn(existingEnvelopes);
      expect(result).toEqual([{ id: "env1", name: "Food", balance: 300 }]);
    });
  });

  describe("updateTransaction", () => {
    it("should update transaction optimistically", async () => {
      const transactionId = "tx1";
      const updates = { amount: 150, description: "Updated transaction" };
      const existingTransaction = { id: transactionId, amount: 100 };

      mockQueryClient.setQueryData.mockImplementation((_key, updater) => {
        if (typeof updater === "function") {
          return updater(existingTransaction);
        }
        return updater;
      });

      (budgetDb.transactions.update as Mock).mockResolvedValue(true);

      await optimisticHelpers.updateTransaction(mockQueryClient, transactionId, updates);

      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
        queryKeys.transactionById(transactionId),
        expect.any(Function)
      );

      expect(mockQueryClient.setQueriesData).toHaveBeenCalledWith(
        { queryKey: queryKeys.transactions },
        expect.any(Function)
      );

      expect(budgetDb.transactions.update).toHaveBeenCalledWith(
        transactionId,
        expect.objectContaining({
          ...updates,
          lastModified: expect.any(Number),
        })
      );
    });
  });

  describe("addTransaction", () => {
    it("should add transaction optimistically", async () => {
      const newTransaction = {
        id: "tx3",
        amount: 75,
        description: "Coffee",
        envelopeId: "env1",
      };

      (budgetDb.transactions.add as Mock).mockResolvedValue(true);

      await optimisticHelpers.addTransaction(mockQueryClient, newTransaction);

      expect(mockQueryClient.setQueriesData).toHaveBeenCalledWith(
        { queryKey: queryKeys.transactions },
        expect.any(Function)
      );

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.analytics,
      });

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.dashboard,
      });

      expect(budgetDb.transactions.add).toHaveBeenCalledWith(
        expect.objectContaining({
          ...newTransaction,
          createdAt: expect.any(Number),
          lastModified: expect.any(Number),
        })
      );
    });
  });

  describe("updateBill", () => {
    it("should update bill optimistically", async () => {
      const billId = "bill1";
      const updates = { isPaid: true, paidDate: new Date() };

      (budgetDb.bills.update as Mock).mockResolvedValue(true);

      await optimisticHelpers.updateBill(mockQueryClient, billId, updates);

      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
        queryKeys.billById(billId),
        expect.any(Function)
      );

      expect(mockQueryClient.setQueriesData).toHaveBeenCalledWith(
        { queryKey: queryKeys.bills },
        expect.any(Function)
      );

      expect(budgetDb.bills.update).toHaveBeenCalledWith(
        billId,
        expect.objectContaining({
          ...updates,
          lastModified: expect.any(Number),
        })
      );
    });
  });

  describe("updateBudgetMetadata", () => {
    it("should update budget metadata optimistically", async () => {
      const updates = { unassignedCash: 1500, actualBalance: 6000 };

      (budgetDatabaseService.saveBudgetMetadata as Mock).mockResolvedValue(true);

      await optimisticHelpers.updateBudgetMetadata(mockQueryClient, updates);

      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
        queryKeys.budgetMetadata,
        expect.any(Function)
      );

      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
        queryKeys.unassignedCash(),
        updates.unassignedCash
      );

      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
        queryKeys.actualBalance(),
        updates.actualBalance
      );

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.dashboard,
      });

      expect(budgetDatabaseService.saveBudgetMetadata).toHaveBeenCalledWith(updates);
    });

    it("should handle partial metadata updates", async () => {
      const updates = { unassignedCash: 1500 };

      await optimisticHelpers.updateBudgetMetadata(mockQueryClient, updates);

      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
        queryKeys.unassignedCash(),
        updates.unassignedCash
      );

      // Should not call actualBalance setter if not in updates
      const actualBalanceCalls = mockQueryClient.setQueryData.mock.calls.filter(
        (call) => call[0] === queryKeys.actualBalance()
      );
      expect(actualBalanceCalls).toHaveLength(0);
    });
  });

  describe("batchUpdate", () => {
    it("should perform batch updates", async () => {
      const updates = {
        envelopes: [{ id: "env1", balance: 500 }],
        transactions: [{ id: "tx1", amount: 150 }],
        bills: [{ id: "bill1", isPaid: true }],
      };

      // Mock the individual update functions
      vi.spyOn(optimisticHelpers, "updateEnvelope").mockResolvedValue();
      vi.spyOn(optimisticHelpers, "updateTransaction").mockResolvedValue();
      vi.spyOn(optimisticHelpers, "updateBill").mockResolvedValue();

      await optimisticHelpers.batchUpdate(mockQueryClient, updates);

      expect(optimisticHelpers.updateEnvelope).toHaveBeenCalledWith(mockQueryClient, "env1", {
        id: "env1",
        balance: 500,
      });

      expect(optimisticHelpers.updateTransaction).toHaveBeenCalledWith(mockQueryClient, "tx1", {
        id: "tx1",
        amount: 150,
      });

      expect(optimisticHelpers.updateBill).toHaveBeenCalledWith(mockQueryClient, "bill1", {
        id: "bill1",
        isPaid: true,
      });

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.dashboard,
      });

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.analytics,
      });
    });

    it("should skip items without IDs", async () => {
      const updates = {
        envelopes: [{ name: "No ID Envelope" }],
        transactions: [],
        bills: [],
      };

      vi.spyOn(optimisticHelpers, "updateEnvelope").mockResolvedValue();

      await optimisticHelpers.batchUpdate(mockQueryClient, updates);

      expect(optimisticHelpers.updateEnvelope).not.toHaveBeenCalled();
    });
  });

  describe("rollbackUpdate", () => {
    it("should rollback with previous data", async () => {
      const queryKey = ["envelopes", "list"];
      const previousData = [{ id: "env1", name: "Food" }];

      await optimisticHelpers.rollbackUpdate(mockQueryClient, queryKey, previousData);

      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(queryKey, previousData);
    });

    it("should invalidate when no previous data", async () => {
      const queryKey = ["envelopes", "list"];

      await optimisticHelpers.rollbackUpdate(mockQueryClient, queryKey, undefined);

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey,
      });
    });
  });

  describe("createOptimisticMutation", () => {
    it("should create mutation config with optimistic updates", () => {
      const mutationKey = ["envelopes", "update"];
      const queryKey = ["envelopes", "list"];
      const updateFn = vi.fn((old, variables) => [...old, variables.newItem]);
      const rollbackFn = vi.fn();

      const config = optimisticHelpers.createOptimisticMutation(mockQueryClient, {
        mutationKey,
        queryKey,
        updateFn,
        rollbackFn,
      });

      expect(config).toHaveProperty("mutationKey", mutationKey);
      expect(config).toHaveProperty("onMutate");
      expect(config).toHaveProperty("onError");
      expect(config).toHaveProperty("onSettled");
      expect(typeof config.onMutate).toBe("function");
      expect(typeof config.onError).toBe("function");
      expect(typeof config.onSettled).toBe("function");
    });

    it("should handle onMutate correctly", async () => {
      const queryKey = ["envelopes", "list"];
      const previousData = [{ id: "env1" }];
      const updateFn = (old, variables) => [...old, variables.newItem];

      mockQueryClient.cancelQueries.mockResolvedValue(undefined);
      mockQueryClient.getQueryData.mockReturnValue(previousData);

      const config = optimisticHelpers.createOptimisticMutation(mockQueryClient, {
        mutationKey: ["test"],
        queryKey,
        updateFn,
        rollbackFn: vi.fn(),
      });

      const variables = { newItem: { id: "env2" } };
      const context = await config.onMutate(variables);

      expect(mockQueryClient.cancelQueries).toHaveBeenCalledWith({ queryKey });
      expect(mockQueryClient.getQueryData).toHaveBeenCalledWith(queryKey);
      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(queryKey, expect.any(Function));
      expect(context.previousData).toEqual(previousData);
    });

    it("should handle onError correctly", () => {
      const queryKey = ["envelopes", "list"];
      const previousData = [{ id: "env1" }];
      const rollbackFn = vi.fn();

      const config = optimisticHelpers.createOptimisticMutation(mockQueryClient, {
        mutationKey: ["test"],
        queryKey,
        updateFn: vi.fn(),
        rollbackFn,
      });

      const error = new Error("Mutation failed");
      const variables = { id: "env1" };
      const context = { previousData };

      config.onError(error, variables, context);

      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(queryKey, previousData);
      expect(rollbackFn).toHaveBeenCalledWith(error, variables, context);
    });

    it("should handle onSettled correctly", () => {
      const queryKey = ["envelopes", "list"];

      const config = optimisticHelpers.createOptimisticMutation(mockQueryClient, {
        mutationKey: ["test"],
        queryKey,
        updateFn: vi.fn(),
        rollbackFn: vi.fn(),
      });

      config.onSettled();

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey,
      });
    });
  });
});
