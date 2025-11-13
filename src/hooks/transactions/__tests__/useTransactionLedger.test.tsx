import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTransactionLedger } from "../useTransactionLedger";

const mockUseTransactions = vi.hoisted(() =>
  vi.fn(() => ({
    transactions: [],
    addTransactionAsync: vi.fn(),
    deleteTransaction: vi.fn(),
    updateTransactionAsync: vi.fn(),
    isLoading: false,
  }))
);

const mockUseEnvelopes = vi.hoisted(() =>
  vi.fn(() => ({
    envelopes: [],
    isLoading: false,
  }))
);

const mockUseBudgetStore = vi.hoisted(() =>
  vi.fn(() => ({
    updateTransaction: vi.fn(),
    setAllTransactions: vi.fn(),
    updateBill: vi.fn(),
  }))
);

const mockUseTransactionForm = vi.hoisted(() =>
  vi.fn(() => ({
    transactionForm: {},
    setTransactionForm: vi.fn(),
    resetForm: vi.fn(),
    populateForm: vi.fn(),
    createTransaction: vi.fn(),
  }))
);

const mockUseTransactionImport = vi.hoisted(() =>
  vi.fn(() => ({
    importData: [],
    importStep: 1,
    setImportStep: vi.fn(),
    fieldMapping: {},
    setFieldMapping: vi.fn(),
    importProgress: 0,
    handleFileUpload: vi.fn(),
    handleImport: vi.fn(),
    resetImport: vi.fn(),
  }))
);

const mockUseTransactionFilters = vi.hoisted(() => vi.fn(() => []));

// Mock dependencies
vi.mock("../../common/useTransactions", () => ({
  useTransactions: mockUseTransactions,
}));

vi.mock("../../budgeting/useEnvelopes", () => ({
  useEnvelopes: mockUseEnvelopes,
}));

vi.mock("../../../stores/ui/uiStore", () => ({
  useBudgetStore: mockUseBudgetStore,
}));

vi.mock("../useTransactionForm", () => ({
  useTransactionForm: mockUseTransactionForm,
}));

vi.mock("../useTransactionImport", () => ({
  useTransactionImport: mockUseTransactionImport,
}));

vi.mock("../useTransactionFilters", () => ({
  useTransactionFilters: mockUseTransactionFilters,
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
    vi.clearAllMocks();
    mockUseTransactionFilters.mockReturnValue([]);
    mockUseTransactions.mockReturnValue({
      transactions: [],
      addTransactionAsync: vi.fn(),
      deleteTransaction: vi.fn(),
      updateTransactionAsync: vi.fn(),
      isLoading: false,
    });
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
    mockUseTransactionFilters.mockReturnValue(new Array(25).fill({}));

    const { result } = renderHook(() => useTransactionLedger(mockCurrentUser), {
      wrapper: createWrapper(),
    });

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
    mockUseTransactionFilters.mockReturnValue(new Array(25).fill({})); // 25 items

    const { result } = renderHook(() => useTransactionLedger(mockCurrentUser), {
      wrapper: createWrapper(),
    });

    // 25 items with pageSize 10 should give 3 pages
    expect(result.current.totalPages).toBe(3);
  });

  it("should return loading state from dependencies", () => {
    // Mock loading state
    mockUseTransactions.mockReturnValue({
      transactions: [],
      addTransactionAsync: vi.fn(),
      deleteTransaction: vi.fn(),
      updateTransactionAsync: vi.fn(),
      isLoading: true,
    });

    const { result } = renderHook(() => useTransactionLedger(mockCurrentUser), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });
});
