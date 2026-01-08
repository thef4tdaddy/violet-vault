import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useLayoutData } from "../useLayoutData";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock hooks
vi.mock("@/hooks/budgeting/core/useBudgetData", () => ({
  default: vi.fn(),
}));

vi.mock("@/hooks/budgeting/metadata/useBudgetMetadata", () => ({
  useUnassignedCash: vi.fn(),
  useActualBalance: vi.fn(),
  useBudgetMetadataQuery: vi.fn(() => ({
    metadata: null,
    unassignedCash: 250,
    actualBalance: 5000,
    isActualBalanceManual: false,
    biweeklyAllocation: 0,
    supplementalAccounts: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
}));

vi.mock("@/hooks/budgeting/transactions/scheduled/expenses/useBills", () => ({
  default: vi.fn(),
}));

// Mock envelope calculations
vi.mock("@/utils/budgeting/envelopeCalculations", () => ({
  calculateEnvelopeData: vi.fn(),
  calculateEnvelopeTotals: vi.fn(),
}));

describe("useLayoutData", () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;
  let mockUseBudgetData: ReturnType<typeof vi.fn>;
  let mockUseUnassignedCash: ReturnType<typeof vi.fn>;
  let mockUseActualBalance: ReturnType<typeof vi.fn>;
  let mockUseBills: ReturnType<typeof vi.fn>;
  let mockCalculateEnvelopeData: ReturnType<typeof vi.fn>;
  let mockCalculateEnvelopeTotals: ReturnType<typeof vi.fn>;

  const mockEnvelopes = [
    { id: "env-1", name: "Groceries", balance: 500, allocated: 500 },
    { id: "env-2", name: "Rent", balance: 1000, allocated: 1000 },
  ];

  const mockTransactions = [
    {
      id: "txn-1",
      amount: 50,
      date: "2024-01-01",
      envelopeId: "env-1",
      category: "Groceries",
      type: "income",
      lastModified: 1000,
    },
    {
      id: "txn-2",
      amount: 100,
      date: "2024-01-02",
      envelopeId: "env-2",
      category: "Rent",
      type: "expense",
      lastModified: 1001,
    },
  ];

  const mockBills = [
    {
      id: "bill-1",
      name: "Electric",
      amount: 100,
      dueDate: "2024-01-15",
      category: "Utilities",
      isPaid: false,
      isRecurring: true,
      lastModified: 1002,
    },
  ];

  beforeEach(async () => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    // Import mocked modules
    const budgetDataModule = await import("@/hooks/budgeting/core/useBudgetData");
    const budgetMetadataModule = await import("@/hooks/budgeting/metadata/useBudgetMetadata");
    const billsModule = await import("@/hooks/budgeting/transactions/scheduled/expenses/useBills");
    const envelopeCalcs = await import("@/utils/budgeting/envelopeCalculations");

    mockUseBudgetData = budgetDataModule.default as ReturnType<typeof vi.fn>;
    mockUseUnassignedCash = budgetMetadataModule.useUnassignedCash as ReturnType<typeof vi.fn>;
    mockUseActualBalance = budgetMetadataModule.useActualBalance as ReturnType<typeof vi.fn>;
    mockUseBills = billsModule.default as ReturnType<typeof vi.fn>;
    mockCalculateEnvelopeData = envelopeCalcs.calculateEnvelopeData as ReturnType<typeof vi.fn>;
    mockCalculateEnvelopeTotals = envelopeCalcs.calculateEnvelopeTotals as ReturnType<typeof vi.fn>;

    // Default mock implementations
    mockUseBudgetData.mockReturnValue({
      envelopes: mockEnvelopes,
      transactions: mockTransactions,
      isLoading: false,
      error: null,
    });

    mockUseUnassignedCash.mockReturnValue({
      unassignedCash: 250,
    });

    mockUseActualBalance.mockReturnValue({
      actualBalance: 5000,
    });

    mockUseBills.mockReturnValue({
      bills: mockBills,
      isLoading: false,
      error: null,
    });

    mockCalculateEnvelopeData.mockReturnValue(mockEnvelopes);

    mockCalculateEnvelopeTotals.mockReturnValue({
      totalBiweeklyNeed: 1500,
      totalAllocated: 1500,
      totalBalance: 1500,
      totalSpent: 0,
      totalUpcoming: 0,
      billsDueCount: 0,
    });
  });

  it("should combine data from all hooks", () => {
    const { result } = renderHook(() => useLayoutData(), { wrapper });

    expect(result.current.envelopes).toEqual(mockEnvelopes);
    expect(result.current.transactions).toBeDefined();
    expect(result.current.unassignedCash).toBe(250);
    // bills is the entire object returned from useBills
    expect(result.current.bills).toEqual({
      bills: mockBills,
      isLoading: false,
      error: null,
    });
  });

  it("should calculate envelope summary", () => {
    const { result } = renderHook(() => useLayoutData(), { wrapper });

    expect(result.current.envelopeSummary).toEqual({
      totalBiweeklyNeed: 1500,
      totalAllocated: 1500,
      totalBalance: 1500,
      totalSpent: 0,
      totalUpcoming: 0,
      billsDueCount: 0,
    });
    expect(result.current.totalBiweeklyNeed).toBe(1500);
  });

  it("should filter out invalid transactions", () => {
    const invalidTransactions = [
      {
        id: "txn-1",
        amount: 50,
        date: "2024-01-01",
        envelopeId: "env-1",
        category: "G",
        type: "income",
        lastModified: 1,
      },
      null,
      undefined,
      { id: "txn-2", amount: "invalid", date: "2024-01-02", envelopeId: "env-1" },
      {
        id: "txn-3",
        amount: 100,
        date: "2024-01-03",
        envelopeId: "env-1",
        category: "G",
        type: "income",
        lastModified: 2,
      },
    ];

    mockUseBudgetData.mockReturnValue({
      envelopes: mockEnvelopes,
      transactions: invalidTransactions,
      isLoading: false,
      envelopesError: null,
      transactionsError: null,
      billsError: null,
      dashboardError: null,
    });

    const { result } = renderHook(() => useLayoutData(), { wrapper });

    expect(result.current.transactions).toHaveLength(2);
    expect(result.current.transactions.every((t) => typeof t.amount === "number")).toBe(true);
  });

  it("should handle empty envelopes array", () => {
    mockUseBudgetData.mockReturnValue({
      envelopes: [],
      transactions: mockTransactions,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useLayoutData(), { wrapper });

    expect(result.current.envelopeSummary).toEqual({
      totalBiweeklyNeed: 0,
      totalAllocated: 0,
      totalBalance: 0,
      totalSpent: 0,
      totalUpcoming: 0,
      billsDueCount: 0,
    });
    expect(result.current.totalBiweeklyNeed).toBe(0);
  });

  it("should handle null envelopes", () => {
    mockUseBudgetData.mockReturnValue({
      envelopes: null,
      transactions: mockTransactions,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useLayoutData(), { wrapper });

    expect(result.current.envelopeSummary).toEqual({
      totalBiweeklyNeed: 0,
      totalAllocated: 0,
      totalBalance: 0,
      totalSpent: 0,
      totalUpcoming: 0,
      billsDueCount: 0,
    });
  });

  it("should combine loading states", () => {
    mockUseBudgetData.mockReturnValue({
      envelopes: mockEnvelopes,
      transactions: mockTransactions,
      isLoading: true,
      error: null,
    });

    mockUseBills.mockReturnValue({
      bills: mockBills,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useLayoutData(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it("should combine loading states when bills are loading", () => {
    mockUseBudgetData.mockReturnValue({
      envelopes: mockEnvelopes,
      transactions: mockTransactions,
      isLoading: false,
      error: null,
    });

    mockUseBills.mockReturnValue({
      bills: mockBills,
      isLoading: true,
      error: null,
    });

    const { result } = renderHook(() => useLayoutData(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it("should combine error states", () => {
    mockUseBudgetData.mockReturnValue({
      envelopes: mockEnvelopes,
      transactions: mockTransactions,
      isLoading: false,
      envelopesError: new Error("Budget data error"),
    });

    mockUseBills.mockReturnValue({
      bills: mockBills,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useLayoutData(), { wrapper });

    expect(result.current.hasError).toBe(true);
  });

  it("should combine error states when bills have error", () => {
    mockUseBudgetData.mockReturnValue({
      envelopes: mockEnvelopes,
      transactions: mockTransactions,
      isLoading: false,
      envelopesError: null,
      billsError: new Error("Bills error"),
    });

    mockUseBills.mockReturnValue({
      bills: mockBills,
      isLoading: false,
      error: new Error("Bills error"),
    });

    const { result } = renderHook(() => useLayoutData(), { wrapper });

    expect(result.current.hasError).toBe(true);
  });

  it("should call useActualBalance for side effects", () => {
    renderHook(() => useLayoutData(), { wrapper });

    expect(mockUseActualBalance).toHaveBeenCalled();
  });

  it("should handle null/undefined transactions", () => {
    mockUseBudgetData.mockReturnValue({
      envelopes: mockEnvelopes,
      transactions: null,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useLayoutData(), { wrapper });

    expect(result.current.transactions).toEqual([]);
  });

  it("should recalculate envelope summary when envelopes change", () => {
    const { result, rerender } = renderHook(() => useLayoutData(), { wrapper });

    const initialSummary = result.current.envelopeSummary;

    // Change envelopes
    mockUseBudgetData.mockReturnValue({
      envelopes: [{ id: "env-3", name: "New Envelope", balance: 2000, allocated: 2000 }],
      transactions: mockTransactions,
      isLoading: false,
      envelopesError: null,
      transactionsError: null,
      billsError: null,
      dashboardError: null,
    });

    mockCalculateEnvelopeTotals.mockReturnValue({
      totalBiweeklyNeed: 2000,
      totalAllocated: 2000,
      totalBalance: 2000,
      totalSpent: 0,
      totalUpcoming: 0,
      billsDueCount: 0,
    });

    rerender();

    expect(result.current.envelopeSummary).not.toEqual(initialSummary);
    expect(result.current.totalBiweeklyNeed).toBe(2000);
  });
});
