import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTransactionLedger } from "../useTransactionLedger";

// Mock dependencies
jest.mock("../../common/useTransactions", () => ({
  useTransactions: jest.fn(() => ({
    transactions: [],
    addTransaction: jest.fn(),
    deleteTransaction: jest.fn(),
    isLoading: false,
  })),
}));

jest.mock("../../budgeting/useEnvelopes", () => ({
  useEnvelopes: jest.fn(() => ({
    envelopes: [],
    isLoading: false,
  })),
}));

jest.mock("../../../stores/ui/uiStore", () => ({
  useBudgetStore: jest.fn(() => ({
    updateTransaction: jest.fn(),
    setAllTransactions: jest.fn(),
    updateBill: jest.fn(),
  })),
}));

jest.mock("../useTransactionForm", () => ({
  useTransactionForm: jest.fn(() => ({
    transactionForm: {},
    setTransactionForm: jest.fn(),
    resetForm: jest.fn(),
    populateForm: jest.fn(),
    createTransaction: jest.fn(),
  })),
}));

jest.mock("../useTransactionImport", () => ({
  useTransactionImport: jest.fn(() => ({
    importData: [],
    importStep: 1,
    setImportStep: jest.fn(),
    fieldMapping: {},
    setFieldMapping: jest.fn(),
    importProgress: 0,
    handleFileUpload: jest.fn(),
    handleImport: jest.fn(),
    resetImport: jest.fn(),
  })),
}));

jest.mock("../useTransactionFilters", () => ({
  useTransactionFilters: jest.fn(() => []),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useTransactionLedger", () => {
  const mockCurrentUser = { userName: "TestUser", userColor: "#a855f7" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with default state values", () => {
    const { result } = renderHook(() => useTransactionLedger(mockCurrentUser), {
      wrapper: createWrapper(),
    });

    expect(result.current.showAddModal).toBe(false);
    expect(result.current.showImportModal).toBe(false);
    expect(result.current.editingTransaction).toBe(null);
    expect(result.current.splittingTransaction).toBe(null);
    expect(result.current.searchTerm).toBe("");
    expect(result.current.currentPage).toBe(1);
  });

  it("should provide filter state and handlers", () => {
    const { result } = renderHook(() => useTransactionLedger(mockCurrentUser), {
      wrapper: createWrapper(),
    });

    expect(result.current.dateFilter).toBe("all");
    expect(result.current.typeFilter).toBe("all");
    expect(result.current.envelopeFilter).toBe("all");
    expect(result.current.sortBy).toBe("date");
    expect(result.current.sortOrder).toBe("desc");
    expect(typeof result.current.handleFilterChange).toBe("function");
  });

  it("should handle filter changes correctly", () => {
    const { result } = renderHook(() => useTransactionLedger(mockCurrentUser), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleFilterChange("search", "test search");
    });
    expect(result.current.searchTerm).toBe("test search");

    act(() => {
      result.current.handleFilterChange("dateFilter", "month");
    });
    expect(result.current.dateFilter).toBe("month");

    act(() => {
      result.current.handleFilterChange("sortBy", "amount");
    });
    expect(result.current.sortBy).toBe("amount");
  });

  it("should handle pagination correctly", () => {
    const { result } = renderHook(() => useTransactionLedger(mockCurrentUser), {
      wrapper: createWrapper(),
    });

    // Mock totalPages to be > 1
    result.current.totalPages = 3;

    act(() => {
      result.current.handlePagination("next");
    });
    expect(result.current.currentPage).toBe(2);

    act(() => {
      result.current.handlePagination("prev");
    });
    expect(result.current.currentPage).toBe(1);

    // Should not go below 1
    act(() => {
      result.current.handlePagination("prev");
    });
    expect(result.current.currentPage).toBe(1);
  });

  it("should provide modal state management", () => {
    const { result } = renderHook(() => useTransactionLedger(mockCurrentUser), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.setShowAddModal).toBe("function");
    expect(typeof result.current.setShowImportModal).toBe("function");
    expect(typeof result.current.setSplittingTransaction).toBe("function");
  });

  it("should provide transaction operations", () => {
    const { result } = renderHook(() => useTransactionLedger(mockCurrentUser), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.handleSubmitTransaction).toBe("function");
    expect(typeof result.current.startEdit).toBe("function");
    expect(typeof result.current.handleCloseModal).toBe("function");
    expect(typeof result.current.handleSplitTransaction).toBe("function");
    expect(typeof result.current.deleteTransaction).toBe("function");
  });

  it("should provide import operations", () => {
    const { result } = renderHook(() => useTransactionLedger(mockCurrentUser), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.handleCloseImportModal).toBe("function");
    expect(typeof result.current.handleFileUpload).toBe("function");
    expect(typeof result.current.handleImport).toBe("function");
  });

  it("should calculate total pages correctly", () => {
    // Mock filtered transactions
    require("../useTransactionFilters").useTransactionFilters.mockReturnValue(new Array(25)); // 25 items

    const { result } = renderHook(() => useTransactionLedger(mockCurrentUser), {
      wrapper: createWrapper(),
    });

    // 25 items with pageSize 10 should give 3 pages
    expect(result.current.totalPages).toBe(3);
  });

  it("should return loading state from dependencies", () => {
    // Mock loading state
    require("../../common/useTransactions").useTransactions.mockReturnValue({
      transactions: [],
      addTransaction: jest.fn(),
      deleteTransaction: jest.fn(),
      isLoading: true,
    });

    const { result } = renderHook(() => useTransactionLedger(mockCurrentUser), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });
});
