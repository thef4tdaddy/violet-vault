import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBulkBillUpdate } from "../useBulkBillUpdate";
import { vi } from "vitest";

// Mock dependencies
vi.mock("../useBillManager", () => ({
  useBillManager: vi.fn(() => ({
    updateBill: vi.fn(),
    deleteBill: vi.fn(),
    isLoading: false,
  })),
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock("@/utils/bills/bulkUpdateValidation", () => ({
  validateBulkUpdateData: vi.fn(),
  validateBulkOperation: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useBulkBillUpdate", () => {
  const mockBills = [
    {
      id: "bill1",
      name: "Electricity",
      amount: 120.0,
      dueDate: "2023-09-15",
      isRecurring: true,
      status: "pending",
    },
    {
      id: "bill2",
      name: "Internet",
      amount: 60.0,
      dueDate: "2023-09-20",
      isRecurring: true,
      status: "pending",
    },
    {
      id: "bill3",
      name: "Water",
      amount: 45.0,
      dueDate: "2023-09-25",
      isRecurring: false,
      status: "overdue",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useBulkBillUpdate(mockBills, false), {
      wrapper: createWrapper(),
    });

    expect(result.current.changes).toEqual({});
    expect(result.current.showConfirmation).toBe(false);
  });

  it("should initialize changes when initializeChanges is called", () => {
    const { result } = renderHook(() => useBulkBillUpdate(mockBills, false), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.initializeChanges();
    });

    expect(result.current.changes).toHaveProperty("bill1");
    expect(result.current.changes).toHaveProperty("bill2");
    expect(result.current.changes).toHaveProperty("bill3");
    expect((result.current.changes as any).bill1.amount).toBe(120.0);
    expect((result.current.changes as any).bill1.originalAmount).toBe(120.0);
  });

  it("should update individual bill change", () => {
    const { result } = renderHook(() => useBulkBillUpdate(mockBills, false), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.initializeChanges();
    });

    act(() => {
      result.current.updateChange("bill1", "amount", 150.0);
    });

    expect((result.current.changes as any).bill1.amount).toBe(150.0);
    expect((result.current.changes as any).bill1.originalAmount).toBe(120.0);
  });

  it("should apply bulk change to all bills", () => {
    const { result } = renderHook(() => useBulkBillUpdate(mockBills, false), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.initializeChanges();
    });

    act(() => {
      result.current.applyBulkChange("dueDate", "2023-10-01");
    });

    expect((result.current.changes as any).bill1.dueDate).toBe("2023-10-01");
    expect((result.current.changes as any).bill2.dueDate).toBe("2023-10-01");
    expect((result.current.changes as any).bill3.dueDate).toBe("2023-10-01");
  });

  it("should reset changes to original values", () => {
    const { result } = renderHook(() => useBulkBillUpdate(mockBills, false), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.initializeChanges();
    });

    act(() => {
      result.current.updateChange("bill1", "amount", 150.0);
    });

    act(() => {
      result.current.resetChanges();
    });

    expect((result.current.changes as any).bill1.amount).toBe(120.0);
  });

  it("should toggle showConfirmation state", () => {
    const { result } = renderHook(() => useBulkBillUpdate(mockBills, false), {
      wrapper: createWrapper(),
    });

    expect(result.current.showConfirmation).toBe(false);

    act(() => {
      result.current.setShowConfirmation(true);
    });

    expect(result.current.showConfirmation).toBe(true);
  });

  it("should handle empty bill list", () => {
    const { result } = renderHook(() => useBulkBillUpdate([], false), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.initializeChanges();
    });

    expect(result.current.changes).toEqual({});
  });

  it("should preserve changes when applyBulkChange is called multiple times", () => {
    const { result } = renderHook(() => useBulkBillUpdate(mockBills, false), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.initializeChanges();
    });

    act(() => {
      result.current.updateChange("bill1", "amount", 150.0);
    });

    act(() => {
      result.current.applyBulkChange("dueDate", "2023-10-01");
    });

    // Custom amount should be preserved
    expect((result.current.changes as any).bill1.amount).toBe(150.0);
    // Bulk update should be applied
    expect((result.current.changes as any).bill1.dueDate).toBe("2023-10-01");
  });
});
