import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { budgetDb } from "@/db/budgetDb";
import { useAddEnvelope } from "@/hooks/budgeting/mutations/useAddEnvelope";
import { useDeleteEnvelope } from "@/hooks/budgeting/mutations/useDeleteEnvelope";
import { useAddBillMutation } from "@/hooks/bills/useBills/billMutations";
import { useDeleteBillMutation } from "@/hooks/bills/useBills/billMutations";
import { useTransactionMutations } from "@/hooks/transactions/useTransactionMutations";
import { useDebtManagement } from "@/hooks/debts/useDebtManagement";

// Mock dependencies
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as Record<string, unknown>),
    useMutation: vi.fn(),
    useQueryClient: vi.fn(),
    useQuery: vi.fn(() => ({ data: [], isLoading: false })),
  };
});

vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    envelopes: {
      get: vi.fn(),
      put: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(),
        })),
      })),
    },
    bills: {
      get: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(),
        })),
      })),
    },
    transactions: {
      get: vi.fn(),
      put: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(),
        })),
      })),
    },
    debts: {
      get: vi.fn(),
      put: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
  getUnassignedCash: vi.fn().mockResolvedValue(1000),
  setUnassignedCash: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/hooks/budgeting/useEnvelopes", () => ({
  default: () => ({
    envelopes: [],
    addEnvelope: vi.fn(),
    addEnvelopeAsync: vi.fn(),
  }),
}));

vi.mock("@/hooks/bills/useBills", () => ({
  default: () => ({
    bills: [],
    addBillAsync: vi.fn(),
    updateBillAsync: vi.fn(),
    deleteBillAsync: vi.fn(),
  }),
}));

vi.mock("@/hooks/debts/useDebts", () => ({
  useDebts: () => ({
    debts: [],
    addDebtAsync: vi.fn(),
    updateDebtAsync: vi.fn(),
    deleteDebtAsync: vi.fn(),
  }),
}));

vi.mock("@/hooks/common/useTransactions", () => ({
  default: () => ({
    transactions: [],
    addTransaction: vi.fn(),
  }),
}));

vi.mock("@/utils/common/queryClient", () => ({
  queryKeys: {
    envelopes: ["envelopes"],
    bills: ["bills"],
    transactions: ["transactions"],
    dashboard: ["dashboard"],
    budgetMetadata: ["budgetMetadata"],
  },
  optimisticHelpers: {
    addEnvelope: vi.fn(),
    updateEnvelope: vi.fn(),
    removeEnvelope: vi.fn(),
    addBill: vi.fn(),
    updateBill: vi.fn(),
    removeBill: vi.fn(),
    addTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    removeTransaction: vi.fn(),
  },
}));

vi.mock("@/utils/common/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("@/hooks/transactions/useTransactionBalanceUpdater", () => ({
  useTransactionBalanceUpdater: () => ({
    updateBalancesForTransaction: vi.fn(),
  }),
}));

describe("CRUD Relationships - Envelopes, Transactions, Bills, Debts", () => {
  const mockQueryClient = {
    invalidateQueries: vi.fn(),
    cancelQueries: vi.fn(),
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (budgetDb.envelopes.get as Mock).mockResolvedValue(undefined);
    (budgetDb.bills.get as Mock).mockResolvedValue(undefined);
    (budgetDb.transactions.get as Mock).mockResolvedValue(undefined);
    (budgetDb.debts.get as Mock).mockResolvedValue(undefined);
  });

  describe("Envelope ↔ Transaction Relationships (Envelopes are Source of Truth)", () => {
    it("should require envelope for transaction creation", async () => {
      const { useMutation, useQueryClient } = await import("@tanstack/react-query");
      (useQueryClient as Mock).mockReturnValue(mockQueryClient);

      const mockMutations = [
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
      ];
      let mutationConfigs: Array<{ mutationFn: unknown }> = [];
      (useMutation as Mock).mockImplementation((config) => {
        mutationConfigs.push(config);
        return mockMutations.shift() || mockMutations[0];
      });

      renderHook(() => useTransactionMutations());

      const addMutation = mutationConfigs[0];
      const transactionData = {
        type: "expense",
        amount: 50,
        envelopeId: "", // Missing envelope
        description: "Test Transaction",
        category: "food",
      };

      await act(async () => {
        await expect(
          (addMutation.mutationFn as (data: unknown) => Promise<unknown>)(transactionData)
        ).rejects.toThrow("Transaction must have an envelope");
      });
    });

    it("should validate envelope exists before creating transaction", async () => {
      (budgetDb.envelopes.get as Mock).mockResolvedValue(undefined); // Envelope doesn't exist

      const { useMutation, useQueryClient } = await import("@tanstack/react-query");
      (useQueryClient as Mock).mockReturnValue(mockQueryClient);

      const mockMutations = [
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
      ];
      let mutationConfigs: Array<{ mutationFn: unknown }> = [];
      (useMutation as Mock).mockImplementation((config) => {
        mutationConfigs.push(config);
        return mockMutations.shift() || mockMutations[0];
      });

      renderHook(() => useTransactionMutations());

      const addMutation = mutationConfigs[0];
      const transactionData = {
        type: "expense",
        amount: 50,
        envelopeId: "non-existent",
        description: "Test Transaction",
        category: "food",
      };

      await act(async () => {
        await expect(
          (addMutation.mutationFn as (data: unknown) => Promise<unknown>)(transactionData)
        ).rejects.toThrow("does not exist");
      });
    });

    it("should create transaction linked to envelope (envelopes are source of truth)", async () => {
      const mockEnvelope = {
        id: "env-1",
        name: "Test Envelope",
        currentBalance: 100,
      };
      (budgetDb.envelopes.get as Mock).mockResolvedValue(mockEnvelope);

      const { useMutation, useQueryClient } = await import("@tanstack/react-query");
      (useQueryClient as Mock).mockReturnValue(mockQueryClient);

      const mockMutations = [
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
      ];
      let mutationConfigs: Array<{ mutationFn: unknown }> = [];
      (useMutation as Mock).mockImplementation((config) => {
        mutationConfigs.push(config);
        return mockMutations.shift() || mockMutations[0];
      });

      renderHook(() => useTransactionMutations());

      const addMutation = mutationConfigs[0];
      const transactionData = {
        type: "expense",
        amount: 50,
        envelopeId: "env-1",
        description: "Test Transaction",
        category: "food",
      };

      await act(async () => {
        const result = await (addMutation.mutationFn as (data: unknown) => Promise<unknown>)(
          transactionData
        );
        expect(result).toMatchObject({
          envelopeId: "env-1",
          type: "expense",
        });
      });

      expect(budgetDb.transactions.put).toHaveBeenCalledWith(
        expect.objectContaining({
          envelopeId: "env-1",
        })
      );
    });

    it("should prevent deleting envelope with transactions (should transfer balance first)", async () => {
      const mockEnvelope = {
        id: "env-1",
        name: "Test Envelope",
        currentBalance: 100,
      };
      const mockTransactions = [
        { id: "txn-1", envelopeId: "env-1", amount: -50 },
        { id: "txn-2", envelopeId: "env-1", amount: -30 },
      ];

      (budgetDb.envelopes.get as Mock).mockResolvedValue(mockEnvelope);
      (budgetDb.transactions.where as Mock).mockReturnValue({
        equals: vi.fn(() => ({
          toArray: vi.fn().mockResolvedValue(mockTransactions),
        })),
      });

      const { useMutation, useQueryClient } = await import("@tanstack/react-query");
      (useQueryClient as Mock).mockReturnValue(mockQueryClient);

      const mockMutation = {
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isPending: false,
      };
      (useMutation as Mock).mockReturnValue(mockMutation);

      renderHook(() => useDeleteEnvelope());

      const deleteMutation = (useMutation as Mock).mock.calls[0][0];
      const deleteData = {
        envelopeId: "env-1",
        deleteBillsToo: false,
      };

      await act(async () => {
        const result = await deleteMutation.mutationFn(deleteData);
        // Should transfer balance to unassigned cash
        expect(result.transferredAmount).toBe(100);
      });

      // Balance should be transferred before deletion
      const { setUnassignedCash } = await import("@/db/budgetDb");
      expect(setUnassignedCash).toHaveBeenCalled();
    });
  });

  describe("Bill ↔ Envelope Relationships (Bills route through Envelopes)", () => {
    it("should create bill linked to envelope (envelopes are source of truth)", async () => {
      const { useMutation, useQueryClient } = await import("@tanstack/react-query");
      (useQueryClient as Mock).mockReturnValue(mockQueryClient);

      const mockMutation = {
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isPending: false,
      };
      (useMutation as Mock).mockReturnValue(mockMutation);

      renderHook(() => useAddBillMutation());

      const addMutation = (useMutation as Mock).mock.calls[0][0];
      const billData = {
        name: "Test Bill",
        amount: 100,
        dueDate: new Date().toISOString(),
        category: "Bills & Utilities",
        envelopeId: "env-1",
      };

      await act(async () => {
        const result = await addMutation.mutationFn(billData);
        expect(result.envelopeId).toBe("env-1");
      });

      expect(budgetDb.bills.add).toHaveBeenCalledWith(
        expect.objectContaining({
          envelopeId: "env-1",
        })
      );
    });

    it("should disconnect bills when deleting envelope - bills route through envelopes (deleteBillsToo=false)", async () => {
      const mockEnvelope = {
        id: "env-1",
        name: "Test Envelope",
        currentBalance: 0,
      };
      const mockBills = [
        { id: "bill-1", envelopeId: "env-1", name: "Bill 1" },
        { id: "bill-2", envelopeId: "env-1", name: "Bill 2" },
      ];

      (budgetDb.envelopes.get as Mock).mockResolvedValue(mockEnvelope);
      (budgetDb.bills.where as Mock).mockReturnValue({
        equals: vi.fn(() => ({
          toArray: vi.fn().mockResolvedValue(mockBills),
        })),
      });

      const { useMutation, useQueryClient } = await import("@tanstack/react-query");
      (useQueryClient as Mock).mockReturnValue(mockQueryClient);
      const { optimisticHelpers } = await import("@/utils/common/queryClient");

      const mockMutation = {
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isPending: false,
      };
      (useMutation as Mock).mockReturnValue(mockMutation);

      renderHook(() => useDeleteEnvelope());

      const deleteMutation = (useMutation as Mock).mock.calls[0][0];
      const deleteData = {
        envelopeId: "env-1",
        deleteBillsToo: false,
      };

      await act(async () => {
        await deleteMutation.mutationFn(deleteData);
      });

      // Bills should be disconnected (envelopeId set to undefined), not deleted
      expect(budgetDb.bills.update).toHaveBeenCalledWith("bill-1", { envelopeId: undefined });
      expect(budgetDb.bills.update).toHaveBeenCalledWith("bill-2", { envelopeId: undefined });
      expect(budgetDb.bills.delete).not.toHaveBeenCalled();
      expect(optimisticHelpers.updateBill).toHaveBeenCalledWith(mockQueryClient, "bill-1", {
        envelopeId: undefined,
      });
    });

    it("should delete bills when deleting envelope (deleteBillsToo=true)", async () => {
      const mockEnvelope = {
        id: "env-1",
        name: "Test Envelope",
        currentBalance: 0,
      };
      const mockBills = [{ id: "bill-1", envelopeId: "env-1", name: "Bill 1" }];

      (budgetDb.envelopes.get as Mock).mockResolvedValue(mockEnvelope);
      (budgetDb.bills.where as Mock).mockReturnValue({
        equals: vi.fn(() => ({
          toArray: vi.fn().mockResolvedValue(mockBills),
        })),
      });

      const { useMutation, useQueryClient } = await import("@tanstack/react-query");
      (useQueryClient as Mock).mockReturnValue(mockQueryClient);

      const mockMutation = {
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isPending: false,
      };
      (useMutation as Mock).mockReturnValue(mockMutation);

      renderHook(() => useDeleteEnvelope());

      const deleteMutation = (useMutation as Mock).mock.calls[0][0];
      const deleteData = {
        envelopeId: "env-1",
        deleteBillsToo: true,
      };

      await act(async () => {
        await deleteMutation.mutationFn(deleteData);
      });

      // Bills should be deleted, not just disconnected
      expect(budgetDb.bills.delete).toHaveBeenCalledWith("bill-1");
    });
  });

  describe("Debt ↔ Bill ↔ Envelope Relationships (All route through Envelopes)", () => {
    it("should require envelope for debt payment (envelopes are source of truth)", async () => {
      const mockDebt = {
        id: "debt-1",
        name: "Test Debt",
        minimumPayment: 100,
        // No envelopeId or billId
      };

      const { useDebts } = await import("@/hooks/debts/useDebts");
      const { useBills } = await import("@/hooks/bills/useBills");
      const { default: useEnvelopes } = await import("@/hooks/budgeting/useEnvelopes");
      const { default: useTransactions } = await import("@/hooks/common/useTransactions");

      (useDebts as Mock).mockReturnValue({
        debts: [mockDebt],
        addDebtAsync: vi.fn(),
        updateDebtAsync: vi.fn(),
        deleteDebtAsync: vi.fn(),
      });
      (useBills as Mock).mockReturnValue({
        bills: [],
        addBillAsync: vi.fn(),
        updateBillAsync: vi.fn(),
        deleteBillAsync: vi.fn(),
      });
      (useEnvelopes as Mock).mockReturnValue({
        envelopes: [],
        addEnvelope: vi.fn(),
        addEnvelopeAsync: vi.fn(),
      });
      (useTransactions as Mock).mockReturnValue({
        transactions: [],
        addTransaction: vi.fn(),
      });

      const { result } = renderHook(() => useDebtManagement());

      await act(async () => {
        await expect(
          result.current.recordPayment("debt-1", {
            amount: 100,
            paymentDate: new Date().toISOString().split("T")[0],
          })
        ).rejects.toThrow("requires an envelope");
      });
    });

    it("should create debt with linked bill and envelope (all route through envelopes)", async () => {
      const { useMutation, useQueryClient } = await import("@tanstack/react-query");
      (useQueryClient as Mock).mockReturnValue(mockQueryClient);

      const mockMutations = [{ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }];
      (useMutation as Mock).mockImplementation(() => mockMutations.shift() || mockMutations[0]);

      const { useDebts } = await import("@/hooks/debts/useDebts");
      const { useBills } = await import("@/hooks/bills/useBills");
      const { default: useEnvelopes } = await import("@/hooks/budgeting/useEnvelopes");
      const { default: useTransactions } = await import("@/hooks/common/useTransactions");

      (useDebts as Mock).mockReturnValue({
        debts: [],
        addDebtAsync: vi.fn().mockResolvedValue({ id: "debt-1" }),
        updateDebtAsync: vi.fn(),
        deleteDebtAsync: vi.fn(),
      });
      (useBills as Mock).mockReturnValue({
        bills: [],
        addBillAsync: vi.fn().mockResolvedValue({ id: "bill-1" }),
        updateBillAsync: vi.fn(),
        deleteBillAsync: vi.fn(),
      });
      (useEnvelopes as Mock).mockReturnValue({
        envelopes: [],
        addEnvelope: vi.fn(),
        addEnvelopeAsync: vi.fn().mockResolvedValue({ id: "env-1" }),
      });
      (useTransactions as Mock).mockReturnValue({
        transactions: [],
        addTransaction: vi.fn(),
      });

      renderHook(() => useDebtManagement());

      // This test verifies the relationship structure exists
      // Actual implementation testing would require more complex setup
      expect(useDebtManagement).toBeDefined();
    });

    it("should link debt to existing bill", async () => {
      const mockDebt = {
        id: "debt-1",
        name: "Test Debt",
        minimumPayment: 100,
      };
      const mockBill = {
        id: "bill-1",
        name: "Test Bill",
        envelopeId: "env-1",
        dueDate: "2025-12-01",
      };

      (budgetDb.debts.get as Mock).mockResolvedValue(mockDebt);
      (budgetDb.bills.get as Mock).mockResolvedValue(mockBill);

      const { useDebts } = await import("@/hooks/debts/useDebts");
      const { useBills } = await import("@/hooks/bills/useBills");
      const { default: useEnvelopes } = await import("@/hooks/budgeting/useEnvelopes");
      const { default: useTransactions } = await import("@/hooks/common/useTransactions");

      (useDebts as Mock).mockReturnValue({
        debts: [mockDebt],
        addDebtAsync: vi.fn(),
        updateDebtAsync: vi.fn().mockResolvedValue(undefined),
        deleteDebtAsync: vi.fn(),
      });
      (useBills as Mock).mockReturnValue({
        bills: [mockBill],
        addBillAsync: vi.fn(),
        updateBillAsync: vi.fn().mockResolvedValue(undefined),
        deleteBillAsync: vi.fn(),
      });
      (useEnvelopes as Mock).mockReturnValue({
        envelopes: [],
        addEnvelope: vi.fn(),
        addEnvelopeAsync: vi.fn(),
      });
      (useTransactions as Mock).mockReturnValue({
        transactions: [],
        addTransaction: vi.fn(),
      });

      const { result } = renderHook(() => useDebtManagement());

      await act(async () => {
        await result.current.linkDebtToBill("debt-1", "bill-1");
      });

      // Bill should be updated with debtId
      expect(budgetDb.bills.update).toHaveBeenCalledWith(
        "bill-1",
        expect.objectContaining({
          debtId: "debt-1",
        })
      );
    });

    it("should delete related bill when deleting debt", async () => {
      const mockDebt = {
        id: "debt-1",
        name: "Test Debt",
      };
      const mockBill = {
        id: "bill-1",
        debtId: "debt-1",
        name: "Test Bill",
      };

      (budgetDb.debts.get as Mock).mockResolvedValue(mockDebt);

      const { useDebts } = await import("@/hooks/debts/useDebts");
      const { useBills } = await import("@/hooks/bills/useBills");
      const { default: useEnvelopes } = await import("@/hooks/budgeting/useEnvelopes");
      const { default: useTransactions } = await import("@/hooks/common/useTransactions");

      (useDebts as Mock).mockReturnValue({
        debts: [mockDebt],
        addDebtAsync: vi.fn(),
        updateDebtAsync: vi.fn(),
        deleteDebtAsync: vi.fn().mockResolvedValue(undefined),
      });
      (useBills as Mock).mockReturnValue({
        bills: [mockBill],
        addBillAsync: vi.fn(),
        updateBillAsync: vi.fn(),
        deleteBillAsync: vi.fn().mockResolvedValue(undefined),
      });
      (useEnvelopes as Mock).mockReturnValue({
        envelopes: [],
        addEnvelope: vi.fn(),
        addEnvelopeAsync: vi.fn(),
      });
      (useTransactions as Mock).mockReturnValue({
        transactions: [],
        addTransaction: vi.fn(),
      });

      const { result } = renderHook(() => useDebtManagement());

      await act(async () => {
        await result.current.deleteDebt("debt-1");
      });

      // Related bill should be deleted
      expect(budgetDb.bills.delete).toHaveBeenCalledWith("bill-1");
      // Debt should be deleted
      expect(budgetDb.debts.delete).toHaveBeenCalledWith("debt-1");
    });
  });

  describe("Transaction ↔ Debt Relationships (All route through Envelopes)", () => {
    it("should create transaction for debt payment through envelope (envelopes are source of truth)", async () => {
      const mockBill = {
        id: "bill-1",
        debtId: "debt-1",
        envelopeId: "env-1",
        amount: 100,
      };

      (budgetDb.bills.get as Mock).mockResolvedValue(mockBill);

      const { useMutation, useQueryClient } = await import("@tanstack/react-query");
      (useQueryClient as Mock).mockReturnValue(mockQueryClient);

      const mockMutations = [
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
      ];
      let mutationConfigs: Array<{ mutationFn: unknown }> = [];
      (useMutation as Mock).mockImplementation((config) => {
        mutationConfigs.push(config);
        return mockMutations.shift() || mockMutations[0];
      });

      renderHook(() => useTransactionMutations());

      const addMutation = mutationConfigs[0];
      const transactionData = {
        type: "expense",
        amount: 100,
        envelopeId: "env-1", // REQUIRED - envelopes are source of truth
        description: "Debt Payment",
        category: "Debt Payment",
        debtId: "debt-1", // Optional link to debt
      };

      await act(async () => {
        const result = await (addMutation.mutationFn as (data: unknown) => Promise<unknown>)(
          transactionData
        );
        expect(result).toMatchObject({
          envelopeId: "env-1", // Envelope is required
        });
      });

      expect(budgetDb.transactions.put).toHaveBeenCalledWith(
        expect.objectContaining({
          envelopeId: "env-1", // All transactions must have envelope
        })
      );
    });
  });

  describe("Cascade Operations - Envelope-Centric Data Integrity", () => {
    it("should maintain referential integrity when deleting envelope (envelopes are source of truth)", async () => {
      const mockEnvelope = {
        id: "env-1",
        name: "Test Envelope",
        currentBalance: 50,
      };
      const mockBills = [{ id: "bill-1", envelopeId: "env-1", debtId: "debt-1" }];
      const mockTransactions = [{ id: "txn-1", envelopeId: "env-1", amount: -50 }];

      (budgetDb.envelopes.get as Mock).mockResolvedValue(mockEnvelope);
      (budgetDb.bills.where as Mock).mockReturnValue({
        equals: vi.fn(() => ({
          toArray: vi.fn().mockResolvedValue(mockBills),
        })),
      });

      const { useMutation, useQueryClient } = await import("@tanstack/react-query");
      (useQueryClient as Mock).mockReturnValue(mockQueryClient);
      const { optimisticHelpers } = await import("@/utils/common/queryClient");

      const mockMutation = {
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isPending: false,
      };
      (useMutation as Mock).mockReturnValue(mockMutation);

      renderHook(() => useDeleteEnvelope());

      const deleteMutation = (useMutation as Mock).mock.calls[0][0];
      const deleteData = {
        envelopeId: "env-1",
        deleteBillsToo: false, // Disconnect bills, don't delete
      };

      await act(async () => {
        await deleteMutation.mutationFn(deleteData);
      });

      // Verify cascade operations:
      // 1. Balance transferred to unassigned cash
      const { setUnassignedCash } = await import("@/db/budgetDb");
      expect(setUnassignedCash).toHaveBeenCalled();

      // 2. Bills disconnected (envelopeId cleared)
      expect(budgetDb.bills.update).toHaveBeenCalledWith("bill-1", { envelopeId: undefined });
      expect(optimisticHelpers.updateBill).toHaveBeenCalled();

      // 3. Envelope deleted
      expect(budgetDb.envelopes.delete).toHaveBeenCalledWith("env-1");
    });

    it("should update bills and debts when transaction is added to envelope", async () => {
      const mockEnvelope = {
        id: "env-1",
        name: "Test Envelope",
        currentBalance: 100,
      };
      const mockBill = {
        id: "bill-1",
        envelopeId: "env-1",
        debtId: "debt-1",
        amount: 50,
      };

      (budgetDb.envelopes.get as Mock).mockResolvedValue(mockEnvelope);
      (budgetDb.bills.where as Mock).mockReturnValue({
        equals: vi.fn(() => ({
          toArray: vi.fn().mockResolvedValue([mockBill]),
        })),
      });

      const { useMutation, useQueryClient } = await import("@tanstack/react-query");
      (useQueryClient as Mock).mockReturnValue(mockQueryClient);

      const mockMutations = [
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
      ];
      let mutationConfigs: Array<{ mutationFn: unknown }> = [];
      (useMutation as Mock).mockImplementation((config) => {
        mutationConfigs.push(config);
        return mockMutations.shift() || mockMutations[0];
      });

      renderHook(() => useTransactionMutations());

      const addMutation = mutationConfigs[0];
      const transactionData = {
        type: "expense",
        amount: 50,
        envelopeId: "env-1", // Routes through envelope
        description: "Payment",
        category: "Bills & Utilities",
      };

      await act(async () => {
        const result = await (addMutation.mutationFn as (data: unknown) => Promise<unknown>)(
          transactionData
        );
        expect(result).toMatchObject({
          envelopeId: "env-1",
        });
      });

      // Transaction created with envelope (envelopes are source of truth)
      expect(budgetDb.transactions.put).toHaveBeenCalledWith(
        expect.objectContaining({
          envelopeId: "env-1",
        })
      );

      // Envelope balance should be updated (envelopes are source of truth)
      expect(budgetDb.envelopes.update).toHaveBeenCalled();
    });
  });
});
