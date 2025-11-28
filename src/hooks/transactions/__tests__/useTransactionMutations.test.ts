import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTransactionMutations } from "../useTransactionMutations";

// Mock dependencies
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as Record<string, unknown>),
    useMutation: vi.fn(),
    useQueryClient: vi.fn(),
  };
});

vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    transactions: {
      put: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    envelopes: {
      get: vi.fn(), // Required for envelope validation
    },
  },
}));

vi.mock("@/hooks/transactions/useTransactionBalanceUpdater", () => ({
  useTransactionBalanceUpdater: () => ({
    updateBalancesForTransaction: vi.fn(),
  }),
}));

vi.mock("@/utils/common/queryClient", () => ({
  queryKeys: {
    transactions: ["transactions"],
    envelopes: ["envelopes"],
    dashboard: ["dashboard"],
    analytics: ["analytics"],
  },
  optimisticHelpers: {
    addTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    removeTransaction: vi.fn(),
  },
}));

vi.mock("@/domain/schemas/transaction", () => ({
  normalizeTransactionAmount: vi.fn((txn) => {
    // Normalize: expense=negative, income=positive
    if (txn.type === "expense" && txn.amount > 0) {
      return { ...txn, amount: -Math.abs(txn.amount) };
    }
    if (txn.type === "income" && txn.amount < 0) {
      return { ...txn, amount: Math.abs(txn.amount) };
    }
    return txn;
  }),
  validateAndNormalizeTransaction: vi.fn((txn) => {
    // Normalize amount sign based on type
    const normalized = txn.type === "expense" ? { ...txn, amount: -Math.abs(txn.amount) } : txn;
    return normalized;
  }),
  validateTransactionPartialSafe: vi.fn((data) => {
    // Simulate validation for description length
    if (data.description && data.description.length > 500) {
      return {
        success: false,
        error: {
          issues: [
            { message: "Description must be 500 characters or less", path: ["description"] },
          ],
        },
      };
    }
    // Simulate validation for merchant length
    if (data.merchant && data.merchant.length > 200) {
      return {
        success: false,
        error: {
          issues: [{ message: "Merchant must be 200 characters or less", path: ["merchant"] }],
        },
      };
    }
    // Simulate validation for receiptUrl
    if (data.receiptUrl && !data.receiptUrl.startsWith("http")) {
      return {
        success: false,
        error: {
          issues: [{ message: "Receipt URL must be a valid URL", path: ["receiptUrl"] }],
        },
      };
    }
    return { success: true, data };
  }),
}));

vi.mock("../../../stores/ui/toastStore", () => ({
  globalToast: {
    showSuccess: vi.fn(),
    showError: vi.fn(),
  },
}));

vi.mock("../../../utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
  },
}));

// Shared types and helpers for mutation testing
interface MutationConfig {
  mutationFn: (data: unknown) => Promise<unknown>;
  onSuccess: (data: unknown) => void;
  onError: (error: Error) => void;
}

// Helper to create mock mutation objects with required methods
const createMockMutation = () => ({
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  isPending: false,
});

describe("useTransactionMutations", () => {
  const mockQueryClient = {
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
  };

  const mockEnvelope = {
    id: "env-1",
    name: "Test Envelope",
    currentBalance: 0,
    category: "expenses",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    (useQueryClient as Mock).mockReturnValue(mockQueryClient);
    // Mock envelope existence check (envelopes are source of truth - where all money is kept)
    // Behind the scenes: Supplemental accounts and savings goals are stored as envelopes
    // (for data consistency and transaction routing), but filtered from envelope UI
    const { budgetDb } = await import("@/db/budgetDb");
    (budgetDb.envelopes.get as Mock).mockResolvedValue(mockEnvelope);
  });

  describe("addTransaction mutation", () => {
    it("should configure add transaction mutation correctly", () => {
      const mockMutate = vi.fn();
      const mockMutation = {
        mutate: mockMutate,
        isPending: false,
        error: null,
      };

      (useMutation as Mock).mockReturnValue(mockMutation);

      const { result } = renderHook(() => useTransactionMutations());

      expect(useMutation).toHaveBeenCalledWith(
        expect.objectContaining({
          mutationFn: expect.any(Function),
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );

      expect(result.current.addTransaction).toBe(mockMutate);
      expect(result.current.isAdding).toBe(false);
    });

    it("should handle successful transaction addition", () => {
      const mockOnSuccess = vi.fn();
      const mockMutation = {
        mutate: vi.fn(),
        isPending: false,
        error: null,
      };

      (useMutation as Mock).mockImplementation(({ onSuccess }) => {
        // Store the onSuccess callback to call later
        mockOnSuccess.mockImplementation(onSuccess);
        return mockMutation;
      });

      renderHook(() => useTransactionMutations());

      const newTransaction = {
        id: "new",
        description: "New Transaction",
        amount: 100,
      };
      act(() => {
        mockOnSuccess(newTransaction);
      });

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["transactions"],
      });
    });

    it("should handle transaction addition errors", () => {
      const mockOnError = vi.fn();
      const mockMutation = {
        mutate: vi.fn(),
        isPending: false,
        error: null,
      };

      (useMutation as Mock).mockImplementation(({ onError }) => {
        mockOnError.mockImplementation(onError);
        return mockMutation;
      });

      renderHook(() => useTransactionMutations());

      const error = new Error("Add failed");
      act(() => {
        mockOnError(error);
      });

      // Error handling would be tested by checking logger calls
    });
  });

  describe("updateTransaction mutation", () => {
    it("should configure update transaction mutation correctly", () => {
      const mockMutations = [
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: null }, // add
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: null }, // reconcile
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: null }, // delete
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: null }, // update
      ];

      (useMutation as Mock).mockImplementation(() => mockMutations.shift());

      const { result } = renderHook(() => useTransactionMutations());

      expect(result.current.updateTransaction).toEqual(expect.any(Function));
      expect(result.current.isUpdating).toBe(false);
    });

    it("should handle successful transaction update", () => {
      let updateOnSuccess;
      const mockMutations = [
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: null }, // add
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: null }, // reconcile
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: null }, // delete
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: null }, // update
      ];

      (useMutation as Mock).mockImplementation(({ onSuccess }) => {
        // Store the update mutation's onSuccess (4th call)
        if ((useMutation as Mock).mock.calls.length === 4) {
          updateOnSuccess = onSuccess;
        }
        return mockMutations.shift();
      });

      renderHook(() => useTransactionMutations());

      const updatedTransaction = {
        id: "1",
        description: "Updated",
        amount: 200,
      };
      act(() => {
        if (updateOnSuccess) updateOnSuccess(updatedTransaction);
      });

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["transactions"],
      });
    });
  });

  describe("deleteTransaction mutation", () => {
    it("should configure delete transaction mutation correctly", () => {
      const mockMutations = [
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: null }, // add
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: null }, // reconcile
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: null }, // delete
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: null }, // update
      ];

      (useMutation as Mock).mockImplementation(() => mockMutations.shift());

      const { result } = renderHook(() => useTransactionMutations());

      expect(result.current.deleteTransaction).toEqual(expect.any(Function));
      expect(result.current.isDeleting).toBe(false);
    });

    it("should handle successful transaction deletion", () => {
      let deleteOnSuccess: ((id: string) => void) | undefined;
      // Hook creates 4 mutations: add, reconcile, delete, update
      const mockMutations = [
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: null }, // add
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: null }, // reconcile
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: null }, // delete
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: null }, // update
      ];

      let callCount = 0;
      (useMutation as Mock).mockImplementation(({ onSuccess }) => {
        callCount++;
        // Third call is delete mutation
        if (callCount === 3) {
          deleteOnSuccess = onSuccess;
        }
        return mockMutations.shift() || mockMutations[0];
      });

      renderHook(() => useTransactionMutations());

      act(() => {
        if (deleteOnSuccess) deleteOnSuccess("deleted-transaction-id");
      });

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["transactions"],
      });
    });
  });

  describe("loading states", () => {
    it("should track loading states correctly", () => {
      // Hook creates 4 mutations: add, reconcile, delete, update
      const mockMutations = [
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: true, error: null }, // add
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: null }, // reconcile
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: true, error: null }, // delete
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: null }, // update
      ];

      (useMutation as Mock).mockImplementation(() => mockMutations.shift() || mockMutations[0]);

      const { result } = renderHook(() => useTransactionMutations());

      expect(result.current.isAdding).toBe(true);
      expect(result.current.isDeleting).toBe(true);
      expect(result.current.isUpdating).toBe(false);
    });
  });

  describe("error handling", () => {
    it("should handle errors internally through onError callbacks", () => {
      const mockError = new Error("Transaction error");
      // Hook creates 4 mutations: add, reconcile, delete, update
      const mockMutations = [
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: mockError }, // add
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: null }, // reconcile
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: mockError }, // delete
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: null }, // update
      ];

      (useMutation as Mock).mockImplementation(() => mockMutations.shift() || mockMutations[0]);

      const { result } = renderHook(() => useTransactionMutations());

      // Hook doesn't expose error states, errors are handled internally
      expect(result.current.addTransaction).toBeDefined();
      expect(result.current.updateTransaction).toBeDefined();
      expect(result.current.deleteTransaction).toBeDefined();
    });
  });

  describe("CRUD Operations - Comprehensive Validation", () => {
    // Use shared MutationConfig type from top level
    let mutationConfigs: MutationConfig[] = [];

    // Helper to setup mutation mocks and capture configs
    const setupMutationMocks = () => {
      mutationConfigs = [];
      const mockMutations = [
        createMockMutation(), // add
        createMockMutation(), // reconcile
        createMockMutation(), // delete
        createMockMutation(), // update
      ];
      (useMutation as Mock).mockImplementation((config: MutationConfig) => {
        mutationConfigs.push(config);
        return mockMutations.shift() || mockMutations[0];
      });
    };

    beforeEach(async () => {
      vi.clearAllMocks();
      mutationConfigs = [];
      (useQueryClient as Mock).mockReturnValue(mockQueryClient);
      // Reset envelope mock to return valid envelope by default
      const { budgetDb } = await import("@/db/budgetDb");
      (budgetDb.envelopes.get as Mock).mockResolvedValue(mockEnvelope);
    });

    describe("Add Transaction - Validation & Safety (Envelopes are Source of Truth)", () => {
      it("should require envelope for transaction creation", async () => {
        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const addMutation = mutationConfigs[0];
        const transactionData = {
          type: "expense",
          amount: 50,
          description: "Test Transaction",
          // Missing envelopeId - should fail
        };

        await act(async () => {
          await expect(addMutation.mutationFn(transactionData)).rejects.toThrow(
            "Transaction must have an envelope"
          );
        });
      });

      it("should validate envelope exists before creating transaction", async () => {
        const { budgetDb } = await import("@/db/budgetDb");
        (budgetDb.envelopes.get as Mock).mockResolvedValueOnce(undefined); // Envelope doesn't exist

        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const addMutation = mutationConfigs[0];
        const transactionData = {
          type: "expense",
          amount: 50,
          description: "Test Transaction",
          envelopeId: "non-existent",
        };

        await act(async () => {
          await expect(addMutation.mutationFn(transactionData)).rejects.toThrow("does not exist");
        });
      });
      it("should create transaction with proper amount normalization (expense=negative)", async () => {
        const { budgetDb } = await import("@/db/budgetDb");
        (budgetDb.transactions.put as Mock).mockResolvedValue(undefined);

        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const addMutation = mutationConfigs[0];
        const transactionData = {
          type: "expense",
          amount: 100, // Positive amount
          description: "Test Expense",
          category: "food",
          envelopeId: "env-1", // REQUIRED - envelopes are source of truth
        };

        await act(async () => {
          const result = (await addMutation.mutationFn(transactionData)) as { amount: number };
          // Expense should be normalized to negative
          expect(result.amount).toBeLessThan(0);
        });
      });

      it("should create transaction with proper amount normalization (income=positive)", async () => {
        const { budgetDb } = await import("@/db/budgetDb");
        (budgetDb.transactions.put as Mock).mockResolvedValue(undefined);

        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const addMutation = mutationConfigs[0];
        const transactionData = {
          type: "income",
          amount: -100, // Negative amount (should be corrected)
          description: "Test Income",
          category: "salary",
          envelopeId: "env-1", // REQUIRED - envelopes are source of truth
        };

        await act(async () => {
          const result = (await addMutation.mutationFn(transactionData)) as { amount: number };
          // Income should be normalized to positive
          expect(result.amount).toBeGreaterThan(0);
        });
      });

      it("should warn and auto-correct sign mismatches", async () => {
        const { default: logger } = await import("@/utils/common/logger");
        const { budgetDb } = await import("@/db/budgetDb");
        (budgetDb.transactions.put as Mock).mockResolvedValue(undefined);

        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const addMutation = mutationConfigs[0];
        const transactionData = {
          type: "expense",
          amount: 100, // Positive for expense (mismatch)
          description: "Mismatch Test",
          envelopeId: "env-1", // REQUIRED - envelopes are source of truth
        };

        await act(async () => {
          await addMutation.mutationFn(transactionData);
        });

        expect(logger.warn).toHaveBeenCalledWith(
          expect.stringContaining("sign mismatch"),
          expect.any(Object)
        );
      });

      it("should apply optimistic update before database write", async () => {
        const { optimisticHelpers } = await import("@/utils/common/queryClient");
        const { budgetDb } = await import("@/db/budgetDb");
        (budgetDb.transactions.put as Mock).mockResolvedValue(undefined);

        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const addMutation = mutationConfigs[0];
        const transactionData = {
          type: "expense",
          amount: 50,
          description: "Optimistic Test",
          envelopeId: "env-1", // REQUIRED - envelopes are source of truth
        };

        await act(async () => {
          await addMutation.mutationFn(transactionData);
        });

        expect(optimisticHelpers.addTransaction).toHaveBeenCalled();
      });

      it("should invalidate all related queries on success", async () => {
        const { budgetDb } = await import("@/db/budgetDb");
        (budgetDb.transactions.put as Mock).mockResolvedValue(undefined);

        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const addMutation = mutationConfigs[0];
        const transactionData = {
          type: "expense",
          amount: 50,
          description: "Query Test",
          envelopeId: "env-1", // REQUIRED - envelopes are source of truth
        };

        await act(async () => {
          const result = await addMutation.mutationFn(transactionData);
          addMutation.onSuccess(result);
        });

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ["transactions"],
        });
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ["envelopes"],
        });
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ["dashboard"],
        });
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ["analytics"],
        });
      });
    });

    describe("Update Transaction - Validation & Safety", () => {
      it("should update transaction with validated data", async () => {
        const { budgetDb } = await import("@/db/budgetDb");
        (budgetDb.transactions.update as Mock).mockResolvedValue(1);

        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const updateMutation = mutationConfigs[3]; // Fourth mutation (update)
        const updateData = {
          id: "txn-1",
          updates: {
            description: "Updated Description",
            amount: -75,
          },
        };

        await act(async () => {
          const result = (await updateMutation.mutationFn(updateData)) as {
            id: string;
            updates: { description: string };
          };
          expect(result.id).toBe("txn-1");
          expect(result.updates.description).toBe("Updated Description");
        });

        expect(budgetDb.transactions.update).toHaveBeenCalledWith(
          "txn-1",
          expect.objectContaining({
            description: "Updated Description",
            amount: -75,
            lastModified: expect.any(Number),
          })
        );
      });

      it("should apply optimistic update before database write", async () => {
        const { optimisticHelpers } = await import("@/utils/common/queryClient");
        const { budgetDb } = await import("@/db/budgetDb");
        (budgetDb.transactions.update as Mock).mockResolvedValue(1);

        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const updateMutation = mutationConfigs[3];
        const updateData = {
          id: "txn-1",
          updates: { description: "Optimistic Update" },
        };

        await act(async () => {
          await updateMutation.mutationFn(updateData);
        });

        expect(optimisticHelpers.updateTransaction).toHaveBeenCalledWith(
          mockQueryClient,
          "txn-1",
          expect.objectContaining({
            description: "Optimistic Update",
          })
        );
      });

      it("should invalidate queries and rollback on error", async () => {
        const { default: logger } = await import("@/utils/common/logger");
        const { budgetDb } = await import("@/db/budgetDb");
        const dbError = new Error("Update failed");
        (budgetDb.transactions.update as Mock).mockRejectedValue(dbError);

        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const updateMutation = mutationConfigs[3];
        const updateData = {
          id: "txn-1",
          updates: { description: "Error Test" },
        };

        await act(async () => {
          try {
            await updateMutation.mutationFn(updateData);
          } catch (error) {
            updateMutation.onError(error as Error);
          }
        });

        expect(logger.error).toHaveBeenCalledWith(
          "Failed to update transaction",
          dbError,
          expect.any(Object)
        );
        // Should invalidate to rollback optimistic update
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ["transactions"],
        });
      });
    });

    describe("Delete Transaction - Validation & Safety", () => {
      it("should delete transaction and update balances", async () => {
        const { budgetDb } = await import("@/db/budgetDb");
        const mockTransaction = {
          id: "txn-1",
          amount: -50,
          envelopeId: "env-1",
        };
        (budgetDb.transactions.get as Mock).mockResolvedValue(mockTransaction);
        (budgetDb.transactions.delete as Mock).mockResolvedValue(undefined);

        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const deleteMutation = mutationConfigs[2]; // Third mutation (delete)

        await act(async () => {
          const result = await deleteMutation.mutationFn("txn-1");
          expect(result).toBe("txn-1");
        });

        expect(budgetDb.transactions.get).toHaveBeenCalledWith("txn-1");
        expect(budgetDb.transactions.delete).toHaveBeenCalledWith("txn-1");
      });

      it("should handle deletion of non-existent transaction gracefully", async () => {
        const { budgetDb } = await import("@/db/budgetDb");
        (budgetDb.transactions.get as Mock).mockResolvedValue(undefined);
        (budgetDb.transactions.delete as Mock).mockResolvedValue(undefined);

        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const deleteMutation = mutationConfigs[2];

        await act(async () => {
          const result = await deleteMutation.mutationFn("non-existent");
          expect(result).toBe("non-existent");
        });

        // Should still attempt deletion (idempotent)
        expect(budgetDb.transactions.delete).toHaveBeenCalledWith("non-existent");
      });

      it("should invalidate all related queries on successful deletion", async () => {
        const { budgetDb } = await import("@/db/budgetDb");
        const mockTransaction = { id: "txn-1", amount: -50 };
        (budgetDb.transactions.get as Mock).mockResolvedValue(mockTransaction);
        (budgetDb.transactions.delete as Mock).mockResolvedValue(undefined);

        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const deleteMutation = mutationConfigs[2];

        await act(async () => {
          const result = await deleteMutation.mutationFn("txn-1");
          deleteMutation.onSuccess(result);
        });

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ["transactions"],
        });
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ["envelopes"],
        });
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ["dashboard"],
        });
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ["analytics"],
        });
      });
    });

    describe("Validation Error Handling", () => {
      it("should reject transaction without envelopeId (Zod schema validation)", async () => {
        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const addMutation = mutationConfigs[0];
        const transactionData = {
          type: "expense",
          amount: 50,
          description: "Missing Envelope",
          // Missing envelopeId
        };

        await act(async () => {
          await expect(addMutation.mutationFn(transactionData)).rejects.toThrow(
            "Transaction must have an envelope"
          );
        });
      });

      it("should reject transaction with empty envelopeId", async () => {
        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const addMutation = mutationConfigs[0];
        const transactionData = {
          type: "expense",
          amount: 50,
          description: "Empty Envelope ID",
          envelopeId: "",
        };

        await act(async () => {
          await expect(addMutation.mutationFn(transactionData)).rejects.toThrow(
            "Transaction must have an envelope"
          );
        });
      });

      it("should reject transaction with whitespace-only envelopeId", async () => {
        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const addMutation = mutationConfigs[0];
        const transactionData = {
          type: "expense",
          amount: 50,
          description: "Whitespace Envelope ID",
          envelopeId: "   ",
        };

        await act(async () => {
          await expect(addMutation.mutationFn(transactionData)).rejects.toThrow(
            "Transaction must have an envelope"
          );
        });
      });

      it("should reject update with invalid data (Zod validation)", async () => {
        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const updateMutation = mutationConfigs[3]; // Fourth mutation (update)
        const updateData = {
          id: "txn-1",
          updates: {
            description: "a".repeat(501), // Exceeds 500 char limit
          },
        };

        await act(async () => {
          await expect(updateMutation.mutationFn(updateData)).rejects.toThrow(
            "Invalid transaction update data"
          );
        });
      });

      it("should log validation errors for debugging", async () => {
        const { default: logger } = await import("@/utils/common/logger");
        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const updateMutation = mutationConfigs[3];
        const updateData = {
          id: "txn-1",
          updates: {
            description: "a".repeat(501), // Invalid
          },
        };

        await act(async () => {
          try {
            await updateMutation.mutationFn(updateData);
          } catch {
            // Expected to throw
          }
        });

        expect(logger.error).toHaveBeenCalledWith(
          "Transaction update validation failed",
          expect.objectContaining({
            transactionId: "txn-1",
            errors: expect.any(Array),
          })
        );
      });

      it("should handle balance calculation errors gracefully", async () => {
        const { budgetDb } = await import("@/db/budgetDb");
        const balanceError = new Error("Balance calculation overflow");
        (budgetDb.transactions.put as Mock).mockRejectedValue(balanceError);

        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const addMutation = mutationConfigs[0];
        const transactionData = {
          type: "expense",
          amount: Number.MAX_SAFE_INTEGER,
          description: "Large Amount Test",
          envelopeId: "env-1",
        };

        await act(async () => {
          await expect(addMutation.mutationFn(transactionData)).rejects.toThrow(
            "Balance calculation overflow"
          );
        });
      });

      it("should rollback optimistic update on add transaction failure", async () => {
        const { optimisticHelpers } = await import("@/utils/common/queryClient");
        const { budgetDb } = await import("@/db/budgetDb");
        const dbError = new Error("Database write failed");
        (budgetDb.transactions.put as Mock).mockRejectedValue(dbError);

        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const addMutation = mutationConfigs[0];
        const transactionData = {
          type: "expense",
          amount: 50,
          description: "Rollback Test",
          envelopeId: "env-1",
        };

        await act(async () => {
          try {
            await addMutation.mutationFn(transactionData);
          } catch (error) {
            addMutation.onError(error as Error);
          }
        });

        // Optimistic update was called before failure
        expect(optimisticHelpers.addTransaction).toHaveBeenCalled();
        // Error is logged
        const { default: logger } = await import("@/utils/common/logger");
        expect(logger.error).toHaveBeenCalledWith(
          "Failed to add transaction",
          dbError,
          expect.any(Object)
        );
      });

      it("should validate merchant field max length", async () => {
        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const updateMutation = mutationConfigs[3];
        const updateData = {
          id: "txn-1",
          updates: {
            merchant: "a".repeat(201), // Exceeds 200 char limit
          },
        };

        await act(async () => {
          await expect(updateMutation.mutationFn(updateData)).rejects.toThrow(
            "Invalid transaction update data"
          );
        });
      });

      it("should validate receiptUrl is a valid URL", async () => {
        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const updateMutation = mutationConfigs[3];
        const updateData = {
          id: "txn-1",
          updates: {
            receiptUrl: "not-a-valid-url",
          },
        };

        await act(async () => {
          await expect(updateMutation.mutationFn(updateData)).rejects.toThrow(
            "Invalid transaction update data"
          );
        });
      });
    });
  });

  describe("Optimistic Update Rollback Tests", () => {
    // Use shared MutationConfig type from top level
    let mutationConfigs: MutationConfig[] = [];

    // Helper to setup mutation mocks and capture configs
    const setupMutationMocks = () => {
      mutationConfigs = [];
      const mockMutations = [
        createMockMutation(), // add
        createMockMutation(), // reconcile
        createMockMutation(), // delete
        createMockMutation(), // update
      ];
      (useMutation as Mock).mockImplementation((config: MutationConfig) => {
        mutationConfigs.push(config);
        return mockMutations.shift() || mockMutations[0];
      });
    };

    beforeEach(async () => {
      vi.clearAllMocks();
      mutationConfigs = [];
      (useQueryClient as Mock).mockReturnValue(mockQueryClient);
      // Reset envelope mock to return valid envelope by default
      const { budgetDb } = await import("@/db/budgetDb");
      (budgetDb.envelopes.get as Mock).mockResolvedValue(mockEnvelope);
    });

    describe("Transaction Creation Rollback on Validation Failure", () => {
      it("should rollback optimistic update when transaction creation fails validation", async () => {
        const { budgetDb } = await import("@/db/budgetDb");
        const validationError = new Error("Invalid transaction data: amount must be positive");
        (budgetDb.transactions.put as Mock).mockRejectedValue(validationError);

        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const addMutation = mutationConfigs[0];

        // Test onError callback is properly set up
        expect(addMutation.onError).toBeDefined();

        // Simulate error handling
        const { default: logger } = await import("@/utils/common/logger");

        await act(async () => {
          addMutation.onError(validationError);
        });

        expect(logger.error).toHaveBeenCalledWith(
          "Failed to add transaction",
          validationError,
          expect.objectContaining({ source: "addTransactionMutation" })
        );
      });

      it("should not call optimistic helpers when envelope validation fails early", async () => {
        const { budgetDb } = await import("@/db/budgetDb");
        const { optimisticHelpers } = await import("@/utils/common/queryClient");

        // Envelope does not exist
        (budgetDb.envelopes.get as Mock).mockResolvedValueOnce(undefined);

        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const addMutation = mutationConfigs[0];

        // Clear any previous calls
        (optimisticHelpers.addTransaction as Mock).mockClear();

        const transactionData = {
          type: "expense",
          amount: 50,
          description: "Invalid Envelope Test",
          envelopeId: "non-existent-envelope",
        };

        await act(async () => {
          try {
            await addMutation.mutationFn(transactionData);
          } catch {
            // Expected - envelope doesn't exist
          }
        });

        // Optimistic update should NOT have been called since validation failed early
        expect(optimisticHelpers.addTransaction).not.toHaveBeenCalled();
      });
    });

    describe("Transaction Update Rollback on Error", () => {
      it("should invalidate transaction queries on update error to rollback UI", async () => {
        const { budgetDb } = await import("@/db/budgetDb");
        const dbError = new Error("Database constraint violation");
        (budgetDb.transactions.update as Mock).mockRejectedValue(dbError);

        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const updateMutation = mutationConfigs[3];

        // Verify onError includes query invalidation for rollback
        expect(updateMutation.onError).toBeDefined();

        // Clear previous calls
        mockQueryClient.invalidateQueries.mockClear();

        await act(async () => {
          updateMutation.onError(dbError);
        });

        // Rollback should invalidate transaction queries
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ["transactions"],
        });
      });
    });

    describe("Transaction Deletion Rollback on Error", () => {
      it("should log error when transaction deletion fails", async () => {
        setupMutationMocks();
        renderHook(() => useTransactionMutations());

        const deleteMutation = mutationConfigs[2];
        const deleteError = new Error("Transaction locked by another process");

        const { default: logger } = await import("@/utils/common/logger");

        await act(async () => {
          deleteMutation.onError(deleteError);
        });

        expect(logger.error).toHaveBeenCalledWith(
          "Failed to delete transaction",
          deleteError,
          expect.objectContaining({ source: "deleteTransactionMutation" })
        );

        // Verify rollback via query invalidation
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ["transactions"],
        });
      });
    });

    describe("UI State Consistency After Rollback", () => {
      it("should reset loading states after mutation failure", () => {
        // Hook creates 4 mutations: add, reconcile, delete, update
        const mockMutations = [
          { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: new Error("Failed") },
          { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: null },
          { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: new Error("Failed") },
          { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false, error: null },
        ];

        (useMutation as Mock).mockImplementation(() => mockMutations.shift() || mockMutations[0]);

        const { result } = renderHook(() => useTransactionMutations());

        // After failure, loading states should be false
        expect(result.current.isAdding).toBe(false);
        expect(result.current.isDeleting).toBe(false);
        expect(result.current.isUpdating).toBe(false);
      });

      it("should provide consistent mutation function references after error", () => {
        // Mock returns the same mutation object for all calls
        const mockMutationObject = {
          mutate: vi.fn(),
          mutateAsync: vi.fn(),
          isPending: false,
        };

        (useMutation as Mock).mockReturnValue(mockMutationObject);

        const { result, rerender } = renderHook(() => useTransactionMutations());

        // Verify functions are defined
        expect(typeof result.current.addTransaction).toBe("function");
        expect(typeof result.current.deleteTransaction).toBe("function");
        expect(typeof result.current.updateTransaction).toBe("function");

        // Simulate rerender after error
        rerender();

        // Function references should remain stable after rerender
        expect(typeof result.current.addTransaction).toBe("function");
        expect(typeof result.current.deleteTransaction).toBe("function");
        expect(typeof result.current.updateTransaction).toBe("function");
      });
    });
  });
});
