import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";
import {
  useMainDashboardUI,
  useDashboardCalculations,
  useTransactionReconciliation,
  usePaydayManager,
  useDashboardHelpers,
} from "../useMainDashboard";

// Mock dependencies
vi.mock("../../../stores/ui/toastStore", () => ({
  globalToast: {
    showError: vi.fn(),
    showInfo: vi.fn(),
  },
}));

vi.mock("../../../utils/budgeting/paydayPredictor", () => ({
  predictNextPayday: vi.fn(),
}));

vi.mock("../../../utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
  },
}));

describe("useMainDashboardUI", () => {
  it("should initialize with default state", () => {
    const { result } = renderHook(() => useMainDashboardUI());

    expect(result.current.showReconcileModal).toBe(false);
    expect(result.current.newTransaction).toEqual({
      amount: "",
      description: "",
      type: "expense",
      envelopeId: "",
      date: expect.any(String),
    });
  });

  it("should handle modal state changes", () => {
    const { result } = renderHook(() => useMainDashboardUI());

    act(() => {
      result.current.openReconcileModal();
    });
    expect(result.current.showReconcileModal).toBe(true);

    act(() => {
      result.current.closeReconcileModal();
    });
    expect(result.current.showReconcileModal).toBe(false);
  });

  it("should update transaction data", () => {
    const { result } = renderHook(() => useMainDashboardUI());

    act(() => {
      result.current.updateNewTransaction({ amount: "100", type: "income" });
    });

    expect(result.current.newTransaction.amount).toBe("100");
    expect(result.current.newTransaction.type).toBe("income");
  });

  it("should reset transaction data", () => {
    const { result } = renderHook(() => useMainDashboardUI());

    // Set some data first
    act(() => {
      result.current.updateNewTransaction({
        amount: "100",
        description: "Test",
      });
    });

    // Reset
    act(() => {
      result.current.resetNewTransaction();
    });

    expect(result.current.newTransaction.amount).toBe("");
    expect(result.current.newTransaction.description).toBe("");
  });
});

describe("useDashboardCalculations", () => {
  const mockEnvelopes = [
    { id: 1, currentBalance: "100.50" },
    { id: 2, currentBalance: "200.25" },
    { id: 3, currentBalance: "0" },
  ];

  const mockSavingsGoals = [
    { id: 1, currentAmount: "500.00" },
    { id: 2, currentAmount: "250.75" },
  ];

  it("should calculate totals correctly", () => {
    const { result } = renderHook(() =>
      useDashboardCalculations(mockEnvelopes, mockSavingsGoals, 150.0, 1200.0)
    );

    expect(result.current.totalEnvelopeBalance).toBe(300.75);
    expect(result.current.totalSavingsBalance).toBe(750.75);
    expect(result.current.safeUnassignedCash).toBe(150.0);
    expect(result.current.totalVirtualBalance).toBe(1201.5);
    expect(result.current.difference).toBe(-1.5);
    expect(result.current.isBalanced).toBe(false);
  });

  it("should handle balanced accounts", () => {
    const { result } = renderHook(() =>
      useDashboardCalculations(mockEnvelopes, mockSavingsGoals, 149.75, 1201.5)
    );

    expect(Math.abs(result.current.difference)).toBeLessThan(0.01);
    expect(result.current.isBalanced).toBe(true);
  });

  it("should handle NaN values safely", () => {
    const invalidEnvelopes = [
      { id: 1, currentBalance: "invalid" },
      { id: 2, currentBalance: null },
    ];

    const { result } = renderHook(() => useDashboardCalculations(invalidEnvelopes, [], NaN, 100));

    expect(result.current.totalEnvelopeBalance).toBe(0);
    expect(result.current.safeUnassignedCash).toBe(0);
    expect(result.current.totalVirtualBalance).toBe(0);
  });

  it("should handle empty arrays", () => {
    const { result } = renderHook(() => useDashboardCalculations([], [], 0, 0));

    expect(result.current.totalEnvelopeBalance).toBe(0);
    expect(result.current.totalSavingsBalance).toBe(0);
    expect(result.current.totalVirtualBalance).toBe(0);
    expect(result.current.isBalanced).toBe(true);
  });
});

describe("useTransactionReconciliation", () => {
  let mockReconcileTransaction;
  let mockEnvelopes;
  let mockSavingsGoals;

  beforeEach(() => {
    mockReconcileTransaction = vi.fn();
    mockEnvelopes = [
      { id: "env1", name: "Groceries" },
      { id: "env2", name: "Entertainment" },
    ];
    mockSavingsGoals = [{ id: "goal1", name: "Emergency Fund" }];
  });

  it("should handle successful reconciliation", () => {
    const { result } = renderHook(() =>
      useTransactionReconciliation(mockReconcileTransaction, mockEnvelopes, mockSavingsGoals)
    );

    const mockTransaction = {
      amount: "100",
      description: "Test transaction",
      type: "expense",
    };

    const mockOnSuccess = vi.fn();

    act(() => {
      const success = result.current.handleReconcileTransaction(mockTransaction, mockOnSuccess);
      expect(success).toBe(true);
    });

    expect(mockReconcileTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: -100,
        description: "Test transaction",
        reconciledAt: expect.any(String),
      })
    );
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it("should handle income transactions correctly", () => {
    const { result } = renderHook(() =>
      useTransactionReconciliation(mockReconcileTransaction, mockEnvelopes, mockSavingsGoals)
    );

    const mockTransaction = {
      amount: "100",
      description: "Income",
      type: "income",
    };

    act(() => {
      result.current.handleReconcileTransaction(mockTransaction, vi.fn());
    });

    expect(mockReconcileTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 100,
      })
    );
  });

  it("should validate required fields", () => {
    const { globalToast } = require("../../../stores/ui/toastStore");
    const { result } = renderHook(() =>
      useTransactionReconciliation(mockReconcileTransaction, mockEnvelopes, mockSavingsGoals)
    );

    // Test missing amount
    act(() => {
      const success = result.current.handleReconcileTransaction(
        {
          amount: "",
          description: "Test",
          type: "expense",
        },
        undefined
      );
      expect(success).toBe(false);
    });

    expect(globalToast.showError).toHaveBeenCalledWith(
      "Please enter amount and description",
      "Required Fields"
    );

    // Test missing description
    act(() => {
      const success = result.current.handleReconcileTransaction(
        {
          amount: "100",
          description: "   ",
          type: "expense",
        },
        undefined
      );
      expect(success).toBe(false);
    });
  });

  it("should handle auto-reconcile positive difference", () => {
    const { result } = renderHook(() =>
      useTransactionReconciliation(mockReconcileTransaction, mockEnvelopes, mockSavingsGoals)
    );

    act(() => {
      result.current.handleAutoReconcileDifference(50.25);
    });

    expect(mockReconcileTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 50.25,
        description: "Balance reconciliation - added extra funds",
        type: "income",
        envelopeId: "unassigned",
      })
    );
  });

  it("should handle auto-reconcile negative difference", () => {
    const { result } = renderHook(() =>
      useTransactionReconciliation(mockReconcileTransaction, mockEnvelopes, mockSavingsGoals)
    );

    act(() => {
      result.current.handleAutoReconcileDifference(-25.5);
    });

    expect(mockReconcileTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: -25.5,
        description: "Balance reconciliation - adjusted for discrepancy",
        type: "expense",
        envelopeId: "unassigned",
      })
    );
  });

  it("should generate correct envelope options", () => {
    const { result } = renderHook(() =>
      useTransactionReconciliation(mockReconcileTransaction, mockEnvelopes, mockSavingsGoals)
    );

    const options = result.current.getEnvelopeOptions();

    expect(options).toEqual([
      { id: "unassigned", name: "Unassigned Cash" },
      { id: "env1", name: "Groceries" },
      { id: "env2", name: "Entertainment" },
      { id: "savings_goal1", name: "💰 Emergency Fund" },
    ]);
  });
});

describe("usePaydayManager", () => {
  let mockSetActiveView;
  let mockPaycheckHistory;

  beforeEach(() => {
    mockSetActiveView = vi.fn();
    mockPaycheckHistory = [
      { date: "2023-01-01", amount: 2000 },
      { date: "2023-01-15", amount: 2000 },
      { date: "2023-02-01", amount: 2000 },
    ];
  });

  it("should generate payday prediction with sufficient history", () => {
    const { predictNextPayday } = require("../../../utils/budgeting/paydayPredictor");
    const mockPrediction = { nextPayday: "2023-02-15", confidence: 0.95 };
    predictNextPayday.mockReturnValue(mockPrediction);

    const { result } = renderHook(() => usePaydayManager(mockPaycheckHistory, mockSetActiveView));

    expect(result.current.paydayPrediction).toBe(mockPrediction);
    expect(predictNextPayday).toHaveBeenCalledWith(mockPaycheckHistory);
  });

  it("should not generate prediction with insufficient history", () => {
    const { result } = renderHook(() =>
      usePaydayManager([{ date: "2023-01-01", amount: 2000 }], mockSetActiveView)
    );

    expect(result.current.paydayPrediction).toBeNull();
  });

  it("should handle process paycheck navigation", () => {
    const logger = require("../../../utils/common/logger");
    const { result } = renderHook(() => usePaydayManager(mockPaycheckHistory, mockSetActiveView));

    act(() => {
      result.current.handleProcessPaycheck();
    });

    expect(mockSetActiveView).toHaveBeenCalledWith("paycheck");
    expect(logger.default.debug).toHaveBeenCalledWith("Navigating to paycheck processor");
  });

  it("should handle envelope preparation", () => {
    const { globalToast } = require("../../../stores/ui/toastStore");
    const { result } = renderHook(() => usePaydayManager(mockPaycheckHistory, mockSetActiveView));

    act(() => {
      result.current.handlePrepareEnvelopes();
    });

    expect(globalToast.showInfo).toHaveBeenCalledWith(
      "Navigate to envelope management for funding planning!",
      "Funding Planning"
    );
  });
});

describe("useDashboardHelpers", () => {
  it("should get recent transactions with limit", () => {
    const { result } = renderHook(() => useDashboardHelpers());

    const transactions = [
      { id: 1, description: "Trans 1" },
      { id: 2, description: "Trans 2" },
      { id: 3, description: "Trans 3" },
      { id: 4, description: "Trans 4" },
    ];

    const recent = result.current.getRecentTransactions(transactions, 2);
    expect(recent).toHaveLength(2);
    expect(recent[0]).toBe(transactions[0]);
    expect(recent[1]).toBe(transactions[1]);
  });

  it("should format currency correctly", () => {
    const { result } = renderHook(() => useDashboardHelpers());

    expect(result.current.formatCurrency(100.123)).toBe("$100.12");
    expect(result.current.formatCurrency(-50.567)).toBe("$50.57");
    expect(result.current.formatCurrency(0)).toBe("$0.00");
    expect(result.current.formatCurrency(null)).toBe("$0.00");
  });

  it("should return correct transaction icons", () => {
    const { result } = renderHook(() => useDashboardHelpers());

    expect(result.current.getTransactionIcon(100)).toBe("TrendingUp");
    expect(result.current.getTransactionIcon(-50)).toBe("TrendingDown");
    expect(result.current.getTransactionIcon(0)).toBe("TrendingDown");
  });

  it("should return correct transaction colors", () => {
    const { result } = renderHook(() => useDashboardHelpers());

    expect(result.current.getTransactionColor(100)).toBe("text-green-600");
    expect(result.current.getTransactionColor(-50)).toBe("text-red-600");
    expect(result.current.getTransactionColor(0)).toBe("text-red-600");
  });

  it("should return correct balance status colors", () => {
    const { result } = renderHook(() => useDashboardHelpers());

    expect(result.current.getBalanceStatusColor(true, 0)).toBe("bg-green-50");
    expect(result.current.getBalanceStatusColor(false, 15)).toBe("bg-red-50");
    expect(result.current.getBalanceStatusColor(false, 5)).toBe("bg-yellow-50");
  });

  it("should return correct balance status icons", () => {
    const { result } = renderHook(() => useDashboardHelpers());

    expect(result.current.getBalanceStatusIcon(true, 0)).toBe("CheckCircle");
    expect(result.current.getBalanceStatusIcon(false, 15)).toBe("AlertTriangle");
    expect(result.current.getBalanceStatusIcon(false, 5)).toBe("AlertTriangle");
  });
});
