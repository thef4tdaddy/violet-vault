/**
 * Tests for useDebtManagement Hook
 * Comprehensive test coverage for debt management operations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDebtManagement } from "../useDebtManagement";
import { useDebts } from "../useDebts";
import useBills from "@/hooks/budgeting/transactions/scheduled/expenses/useBills";
import useEnvelopes from "@/hooks/budgeting/envelopes/useEnvelopes";
import { useTransactionQuery } from "@/hooks/budgeting/transactions/useTransactionQuery";
import { useTransactionOperations } from "@/hooks/budgeting/transactions/useTransactionOperations";
import * as debtManagementHelpers from "../helpers/debtManagementHelpers";

// Mock all dependencies
vi.mock("../useDebts");
vi.mock("@/hooks/budgeting/transactions/scheduled/expenses/useBills");
vi.mock("@/hooks/budgeting/envelopes/useEnvelopes");
vi.mock("@/hooks/budgeting/transactions/useTransactionQuery");
vi.mock("@/hooks/budgeting/transactions/useTransactionOperations");
vi.mock("../helpers/debtManagementHelpers");
vi.mock("@/utils/debts/debtCalculations");
vi.mock("@/constants/debts", () => ({
  DEBT_TYPES: {
    CREDIT_CARD: "credit_card",
    LOAN: "loan",
    MORTGAGE: "mortgage",
  },
  DEBT_STATUS: {
    ACTIVE: "active",
    PAID_OFF: "paid_off",
  },
  PAYMENT_FREQUENCIES: {
    MONTHLY: "monthly",
    BIWEEKLY: "biweekly",
  },
  COMPOUND_FREQUENCIES: {
    MONTHLY: "monthly",
    DAILY: "daily",
  },
  calculateDebtStats: vi.fn(() => ({
    totalDebt: 0,
    totalMonthlyPayments: 0,
    averageInterestRate: 0,
    debtsByType: {},
    totalInterestPaid: 0,
    activeDebtCount: 0,
    totalDebtCount: 0,
    dueSoonAmount: 0,
    dueSoonCount: 0,
  })),
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

describe("useDebtManagement", () => {
  const mockDebts = [
    {
      id: "debt1",
      name: "Credit Card",
      currentBalance: 5000,
      minimumPayment: 150,
      interestRate: 18.5,
      paymentDueDate: "2024-02-01",
      paymentFrequency: "monthly",
      status: "active",
    },
    {
      id: "debt2",
      name: "Auto Loan",
      currentBalance: 15000,
      minimumPayment: 350,
      interestRate: 4.5,
      paymentDueDate: "2024-02-05",
      paymentFrequency: "monthly",
      status: "active",
    },
  ];

  const mockBills = [
    {
      id: "bill1",
      name: "Credit Card Payment",
      amount: 150,
      dueDate: new Date("2024-02-01"),
      debtId: "debt1",
      envelopeId: "env1",
    },
  ];

  const mockEnvelopes = [
    {
      id: "env1",
      name: "Debt Payments",
      currentBalance: 500,
      targetAmount: 1000,
    },
  ];

  const mockTransactions = [
    {
      id: "trans1",
      amount: 150,
      description: "Credit Card Payment",
      debtId: "debt1",
      date: "2024-01-15",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useDebts
    vi.mocked(useDebts).mockReturnValue({
      debts: mockDebts,
      addDebtAsync: vi.fn().mockResolvedValue({ id: "new-debt" }),
      updateDebtAsync: vi.fn().mockResolvedValue(undefined),
      deleteDebtAsync: vi.fn().mockResolvedValue(undefined),
    } as never);

    // Mock useBills
    vi.mocked(useBills).mockReturnValue({
      bills: mockBills,
      addBillAsync: vi.fn().mockResolvedValue({ id: "new-bill" }),
      updateBillAsync: vi.fn().mockResolvedValue(undefined),
      deleteBillAsync: vi.fn().mockResolvedValue(undefined),
    } as never);

    // Mock useEnvelopes
    vi.mocked(useEnvelopes).mockReturnValue({
      envelopes: mockEnvelopes,
      addEnvelope: vi.fn(),
      addEnvelopeAsync: vi.fn().mockResolvedValue({ id: "new-envelope" }),
    } as never);

    // Mock useTransactionQuery
    vi.mocked(useTransactionQuery).mockReturnValue({
      transactions: mockTransactions,
    } as never);

    // Mock useTransactionOperations
    vi.mocked(useTransactionOperations).mockReturnValue({
      addTransaction: vi.fn(),
    } as never);

    // Mock helper functions
    vi.mocked(debtManagementHelpers.enrichDebtsWithRelations).mockReturnValue(mockDebts as never);
    vi.mocked(debtManagementHelpers.createDebtOperation).mockResolvedValue({ id: "new-debt" });
    vi.mocked(debtManagementHelpers.recordPaymentOperation).mockResolvedValue(undefined);
    vi.mocked(debtManagementHelpers.linkDebtToBillOperation).mockResolvedValue(undefined);
    vi.mocked(debtManagementHelpers.syncDebtDueDatesOperation).mockResolvedValue(undefined);
    vi.mocked(debtManagementHelpers.updateDebtOperation).mockResolvedValue(undefined);
    vi.mocked(debtManagementHelpers.deleteDebtOperation).mockResolvedValue(undefined);
    vi.mocked(debtManagementHelpers.createAPIWrappers).mockReturnValue({
      createEnvelopeWrapper: vi.fn(),
      createBillWrapper: vi.fn(),
      updateBillWrapper: vi.fn(),
      createTransactionWrapper: vi.fn(),
    } as never);
    vi.mocked(debtManagementHelpers.groupDebtsByStatus).mockReturnValue({
      active: mockDebts,
      paid_off: [],
    } as never);
    vi.mocked(debtManagementHelpers.groupDebtsByType).mockReturnValue({
      credit_card: [mockDebts[0]],
      loan: [mockDebts[1]],
    } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with debts from useDebts hook", () => {
      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      expect(result.current.debts).toEqual(mockDebts);
    });

    it("should handle empty debts array", () => {
      vi.mocked(useDebts).mockReturnValue({
        debts: [],
        addDebtAsync: vi.fn(),
        updateDebtAsync: vi.fn(),
        deleteDebtAsync: vi.fn(),
      } as never);

      vi.mocked(debtManagementHelpers.enrichDebtsWithRelations).mockReturnValue([]);

      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      expect(result.current.debts).toEqual([]);
    });

    it("should handle null/undefined debts from hook", () => {
      vi.mocked(useDebts).mockReturnValue({
        debts: undefined,
        addDebtAsync: vi.fn(),
        updateDebtAsync: vi.fn(),
        deleteDebtAsync: vi.fn(),
      } as never);

      vi.mocked(debtManagementHelpers.enrichDebtsWithRelations).mockReturnValue([]);

      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      expect(result.current.debts).toEqual([]);
    });
  });

  describe("enriched debts", () => {
    it("should enrich debts with bill relations", () => {
      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      expect(debtManagementHelpers.enrichDebtsWithRelations).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        mockEnvelopes,
        mockTransactions
      );

      expect(result.current.debts).toEqual(mockDebts);
    });

    it("should normalize bill dueDate to string format", () => {
      renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      expect(debtManagementHelpers.enrichDebtsWithRelations).toHaveBeenCalled();
      const callArgs = vi.mocked(debtManagementHelpers.enrichDebtsWithRelations).mock.calls[0];
      const bills = callArgs[1] as Array<{ dueDate?: string }>;

      // Check that all bills have dueDate as string
      bills.forEach((bill) => {
        if (bill.dueDate) {
          expect(typeof bill.dueDate).toBe("string");
        }
      });
    });

    it("should handle bills without dueDate", () => {
      vi.mocked(useBills).mockReturnValue({
        bills: [{ id: "bill1", name: "Test Bill", amount: 100, dueDate: undefined }],
        addBillAsync: vi.fn(),
        updateBillAsync: vi.fn(),
        deleteBillAsync: vi.fn(),
      } as never);

      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      expect(result.current.debts).toBeDefined();
    });
  });

  describe("debt statistics", () => {
    it("should calculate debt statistics", () => {
      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      expect(result.current.debtStats).toBeDefined();
      expect(result.current.debtStats).toHaveProperty("totalDebt");
      expect(result.current.debtStats).toHaveProperty("totalMonthlyPayments");
      expect(result.current.debtStats).toHaveProperty("averageInterestRate");
    });

    it("should return default stats when no debts exist", () => {
      vi.mocked(useDebts).mockReturnValue({
        debts: [],
        addDebtAsync: vi.fn(),
        updateDebtAsync: vi.fn(),
        deleteDebtAsync: vi.fn(),
      } as never);

      vi.mocked(debtManagementHelpers.enrichDebtsWithRelations).mockReturnValue([]);

      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      expect(result.current.debtStats.totalDebt).toBe(0);
      expect(result.current.debtStats.totalMonthlyPayments).toBe(0);
      expect(result.current.debtStats.averageInterestRate).toBe(0);
    });
  });

  describe("debts by status", () => {
    it("should group debts by status", () => {
      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      expect(result.current.debtsByStatus).toBeDefined();
      expect(result.current.debtsByStatus).toHaveProperty("active");
    });

    it("should call groupDebtsByStatus helper", () => {
      renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      expect(debtManagementHelpers.groupDebtsByStatus).toHaveBeenCalled();
    });
  });

  describe("debts by type", () => {
    it("should group debts by type", () => {
      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      expect(result.current.debtsByType).toBeDefined();
    });

    it("should call groupDebtsByType helper", () => {
      renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      expect(debtManagementHelpers.groupDebtsByType).toHaveBeenCalled();
    });
  });

  describe("createDebt", () => {
    const newDebtData = {
      name: "New Credit Card",
      currentBalance: 3000,
      minimumPayment: 100,
      interestRate: 15.5,
      paymentDueDate: "2024-03-01",
      paymentFrequency: "monthly",
      connectionData: {
        createBill: true,
        newEnvelopeName: "CC Payments",
      },
    };

    it("should create a new debt", async () => {
      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      await result.current.createDebt(newDebtData as never);

      expect(debtManagementHelpers.createDebtOperation).toHaveBeenCalledWith(
        newDebtData,
        expect.objectContaining({
          connectionData: newDebtData.connectionData,
        })
      );
    });

    it("should throw error when createDebtData is not available", async () => {
      vi.mocked(useDebts).mockReturnValue({
        debts: mockDebts,
        addDebtAsync: undefined,
        updateDebtAsync: vi.fn(),
        deleteDebtAsync: vi.fn(),
      } as never);

      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.createDebt(newDebtData as never)).rejects.toThrow(
        "Create functions not available"
      );
    });

    it("should throw error when addBillAsync is not available", async () => {
      vi.mocked(useBills).mockReturnValue({
        bills: mockBills,
        addBillAsync: undefined,
        updateBillAsync: vi.fn(),
        deleteBillAsync: vi.fn(),
      } as never);

      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.createDebt(newDebtData as never)).rejects.toThrow(
        "Create functions not available"
      );
    });
  });

  describe("recordPayment", () => {
    const paymentData = {
      amount: 150,
      paymentDate: "2024-01-20",
      notes: "Monthly payment",
    };

    it("should record a payment for a debt", async () => {
      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      await result.current.recordPayment("debt1", paymentData);

      expect(debtManagementHelpers.recordPaymentOperation).toHaveBeenCalledWith(
        expect.objectContaining({
          debt: expect.objectContaining({ id: "debt1" }),
          paymentData,
        })
      );
    });

    it("should throw error when updateDebtData is not available", async () => {
      vi.mocked(useDebts).mockReturnValue({
        debts: mockDebts,
        addDebtAsync: vi.fn(),
        updateDebtAsync: undefined,
        deleteDebtAsync: vi.fn(),
      } as never);

      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.recordPayment("debt1", paymentData)).rejects.toThrow(
        "Update debt function not available"
      );
    });

    it("should throw error when debt is not found", async () => {
      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.recordPayment("non-existent", paymentData)).rejects.toThrow(
        "Debt not found"
      );
    });
  });

  describe("linkDebtToBill", () => {
    it("should link a debt to a bill", async () => {
      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      await result.current.linkDebtToBill("debt1", "bill1");

      expect(debtManagementHelpers.linkDebtToBillOperation).toHaveBeenCalledWith(
        expect.objectContaining({
          debtId: "debt1",
          billId: "bill1",
        })
      );
    });

    it("should throw error when update functions are not available", async () => {
      vi.mocked(useDebts).mockReturnValue({
        debts: mockDebts,
        addDebtAsync: vi.fn(),
        updateDebtAsync: undefined,
        deleteDebtAsync: vi.fn(),
      } as never);

      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.linkDebtToBill("debt1", "bill1")).rejects.toThrow(
        "Update functions not available"
      );
    });
  });

  describe("syncDebtDueDates", () => {
    it("should sync debt due dates", async () => {
      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      await result.current.syncDebtDueDates();

      expect(debtManagementHelpers.syncDebtDueDatesOperation).toHaveBeenCalled();
    });

    it("should throw error when updateDebtData is not available", async () => {
      vi.mocked(useDebts).mockReturnValue({
        debts: mockDebts,
        addDebtAsync: vi.fn(),
        updateDebtAsync: undefined,
        deleteDebtAsync: vi.fn(),
      } as never);

      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.syncDebtDueDates()).rejects.toThrow(
        "Update debt function not available"
      );
    });
  });

  describe("updateDebt", () => {
    const updates = {
      currentBalance: 4500,
      minimumPayment: 140,
    };

    it("should update a debt", async () => {
      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      await result.current.updateDebt("debt1", updates);

      expect(debtManagementHelpers.updateDebtOperation).toHaveBeenCalledWith(
        expect.objectContaining({
          debtId: "debt1",
          updates,
          author: "Unknown User",
        })
      );
    });

    it("should update a debt with custom author", async () => {
      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      await result.current.updateDebt("debt1", updates, "Test User");

      expect(debtManagementHelpers.updateDebtOperation).toHaveBeenCalledWith(
        expect.objectContaining({
          debtId: "debt1",
          updates,
          author: "Test User",
        })
      );
    });

    it("should throw error when updateDebtData is not available", async () => {
      vi.mocked(useDebts).mockReturnValue({
        debts: mockDebts,
        addDebtAsync: vi.fn(),
        updateDebtAsync: undefined,
        deleteDebtAsync: vi.fn(),
      } as never);

      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.updateDebt("debt1", updates)).rejects.toThrow(
        "Update debt function not available"
      );
    });
  });

  describe("deleteDebt", () => {
    it("should delete a debt", async () => {
      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      await result.current.deleteDebt("debt1");

      expect(debtManagementHelpers.deleteDebtOperation).toHaveBeenCalled();
    });

    it("should throw error when delete functions are not available", async () => {
      vi.mocked(useDebts).mockReturnValue({
        debts: mockDebts,
        addDebtAsync: vi.fn(),
        updateDebtAsync: vi.fn(),
        deleteDebtAsync: undefined,
      } as never);

      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.deleteDebt("debt1")).rejects.toThrow(
        "Delete functions not available"
      );
    });

    it("should handle bills with string dueDate during delete", async () => {
      vi.mocked(useBills).mockReturnValue({
        bills: [
          {
            id: "bill1",
            name: "Test Bill",
            dueDate: "2024-02-01",
          } as never,
        ],
        addBillAsync: vi.fn(),
        updateBillAsync: vi.fn(),
        deleteBillAsync: vi.fn().mockResolvedValue(undefined),
      } as never);

      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      await result.current.deleteDebt("debt1");

      expect(debtManagementHelpers.deleteDebtOperation).toHaveBeenCalled();
    });
  });

  describe("getUpcomingPayments", () => {
    it("should get upcoming payments with default days ahead", () => {
      vi.doMock("@/utils/debts/debtCalculations", () => ({
        getUpcomingPayments: vi.fn().mockReturnValue([
          {
            debtId: "debt1",
            amount: 150,
            dueDate: "2024-02-01",
          },
        ]),
      }));

      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      const upcoming = result.current.getUpcomingPayments();

      expect(upcoming).toBeDefined();
    });

    it("should get upcoming payments with custom days ahead", () => {
      vi.doMock("@/utils/debts/debtCalculations", () => ({
        getUpcomingPayments: vi.fn().mockReturnValue([
          {
            debtId: "debt1",
            amount: 150,
            dueDate: "2024-02-01",
          },
        ]),
      }));

      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      const upcoming = result.current.getUpcomingPayments(60);

      expect(upcoming).toBeDefined();
    });
  });

  describe("constants export", () => {
    it("should export DEBT_TYPES", () => {
      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      expect(result.current.DEBT_TYPES).toBeDefined();
    });

    it("should export DEBT_STATUS", () => {
      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      expect(result.current.DEBT_STATUS).toBeDefined();
    });

    it("should export PAYMENT_FREQUENCIES", () => {
      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      expect(result.current.PAYMENT_FREQUENCIES).toBeDefined();
    });

    it("should export COMPOUND_FREQUENCIES", () => {
      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      expect(result.current.COMPOUND_FREQUENCIES).toBeDefined();
    });
  });

  describe("API wrapper functions", () => {
    it("should create API wrappers", () => {
      renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      expect(debtManagementHelpers.createAPIWrappers).toHaveBeenCalled();
    });

    it("should pass correct functions to createAPIWrappers", () => {
      renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      const callArgs = vi.mocked(debtManagementHelpers.createAPIWrappers).mock.calls[0];
      expect(callArgs).toHaveLength(6);
    });
  });

  describe("data wrapper functions", () => {
    it("should handle missing addDebtAsync gracefully", () => {
      vi.mocked(useDebts).mockReturnValue({
        debts: mockDebts,
        addDebtAsync: undefined,
        updateDebtAsync: vi.fn(),
        deleteDebtAsync: vi.fn(),
      } as never);

      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      expect(result.current.debts).toBeDefined();
    });

    it("should handle missing updateDebtAsync gracefully", () => {
      vi.mocked(useDebts).mockReturnValue({
        debts: mockDebts,
        addDebtAsync: vi.fn(),
        updateDebtAsync: undefined,
        deleteDebtAsync: vi.fn(),
      } as never);

      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      expect(result.current.debts).toBeDefined();
    });

    it("should handle missing deleteDebtAsync gracefully", () => {
      vi.mocked(useDebts).mockReturnValue({
        debts: mockDebts,
        addDebtAsync: vi.fn(),
        updateDebtAsync: vi.fn(),
        deleteDebtAsync: undefined,
      } as never);

      const { result } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      expect(result.current.debts).toBeDefined();
    });
  });

  describe("bill normalization", () => {
    it("should normalize bills with Date objects to ISO strings", () => {
      const billWithDate = {
        id: "bill1",
        name: "Test Bill",
        dueDate: new Date("2024-02-15"),
      };

      vi.mocked(useBills).mockReturnValue({
        bills: [billWithDate] as never,
        addBillAsync: vi.fn(),
        updateBillAsync: vi.fn(),
        deleteBillAsync: vi.fn(),
      } as never);

      renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      const callArgs = vi.mocked(debtManagementHelpers.enrichDebtsWithRelations).mock.calls[0];
      const normalizedBills = callArgs[1] as Array<{ dueDate?: string }>;

      expect(normalizedBills[0].dueDate).toBe("2024-02-15T00:00:00.000Z");
    });

    it("should keep string dueDate as-is", () => {
      const billWithString = {
        id: "bill1",
        name: "Test Bill",
        dueDate: "2024-02-20T10:00:00.000Z",
      };

      vi.mocked(useBills).mockReturnValue({
        bills: [billWithString] as never,
        addBillAsync: vi.fn(),
        updateBillAsync: vi.fn(),
        deleteBillAsync: vi.fn(),
      } as never);

      renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      const callArgs = vi.mocked(debtManagementHelpers.enrichDebtsWithRelations).mock.calls[0];
      const normalizedBills = callArgs[1] as Array<{ dueDate?: string }>;

      expect(normalizedBills[0].dueDate).toBe("2024-02-20T10:00:00.000Z");
    });
  });

  describe("memoization", () => {
    it("should memoize enriched debts", () => {
      const { result, rerender } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      const firstDebts = result.current.debts;
      rerender();
      const secondDebts = result.current.debts;

      expect(firstDebts).toBe(secondDebts);
    });

    it("should recalculate when dependencies change", () => {
      const { rerender } = renderHook(() => useDebtManagement(), {
        wrapper: createWrapper(),
      });

      vi.mocked(debtManagementHelpers.enrichDebtsWithRelations).mockClear();

      // Update mock to return different data
      vi.mocked(useDebts).mockReturnValue({
        debts: [...mockDebts, { id: "debt3", name: "New Debt" }] as never,
        addDebtAsync: vi.fn(),
        updateDebtAsync: vi.fn(),
        deleteDebtAsync: vi.fn(),
      } as never);

      rerender();

      expect(debtManagementHelpers.enrichDebtsWithRelations).toHaveBeenCalled();
    });
  });
});
