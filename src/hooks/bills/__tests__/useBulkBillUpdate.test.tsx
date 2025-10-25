import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBulkBillUpdate } from "../useBulkBillUpdate";

// Mock dependencies
vi.mock("../useBillManager", () => ({
  useBillManager: vi.fn(() => ({
    updateBill: vi.fn(),
    deleteBill: vi.fn(),
    isLoading: false,
  })),
}));

vi.mock("../../../utils/common/logger", () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock("../../../utils/bills/bulkUpdateValidation", () => ({
  validateBulkUpdateData: vi.fn(),
  validateBulkOperation: vi.fn(),
}));

const { useBillManager } = require("../useBillManager");
const {
  validateBulkUpdateData,
  validateBulkOperation,
} = require("../../../utils/bills/bulkUpdateValidation");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }) => (
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

  const mockUpdateBill = vi.fn();
  const mockDeleteBill = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useBillManager.mockReturnValue({
      updateBill: mockUpdateBill,
      deleteBill: mockDeleteBill,
      isLoading: false,
    });

    validateBulkUpdateData.mockReturnValue({ isValid: true, errors: [] });
    validateBulkOperation.mockReturnValue({ isValid: true, errors: [] });
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useBulkBillUpdate(mockBills), {
      wrapper: createWrapper(),
    });

    expect(result.current.selectedBills).toEqual([]);
    expect(result.current.bulkOperation).toBe(null);
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.progress).toEqual({ current: 0, total: 0 });
    expect(result.current.operationResults).toEqual([]);
    expect(result.current.validationErrors).toEqual([]);
  });

  it("should select and deselect bills", () => {
    const { result } = renderHook(() => useBulkBillUpdate(mockBills), {
      wrapper: createWrapper(),
    });

    // Select single bill
    act(() => {
      result.current.selectBill("bill1");
    });

    expect(result.current.selectedBills).toContain("bill1");

    // Deselect bill
    act(() => {
      result.current.selectBill("bill1");
    });

    expect(result.current.selectedBills).not.toContain("bill1");
  });

  it("should select all bills", () => {
    const { result } = renderHook(() => useBulkBillUpdate(mockBills), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.selectAllBills();
    });

    expect(result.current.selectedBills).toEqual(["bill1", "bill2", "bill3"]);
  });

  it("should clear all selections", () => {
    const { result } = renderHook(() => useBulkBillUpdate(mockBills), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.selectAllBills();
    });

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedBills).toEqual([]);
  });

  it("should set bulk operation with validation", () => {
    const { result } = renderHook(() => useBulkBillUpdate(mockBills), {
      wrapper: createWrapper(),
    });

    const operation = {
      type: "update",
      data: { status: "paid" },
    };

    act(() => {
      result.current.selectBill("bill1");
      result.current.setBulkOperation(operation);
    });

    expect(result.current.bulkOperation).toEqual(operation);
    expect(validateBulkOperation).toHaveBeenCalledWith(operation, [mockBills[0]]);
  });

  it("should handle validation errors", () => {
    validateBulkOperation.mockReturnValue({
      isValid: false,
      errors: ["Invalid status value"],
    });

    const { result } = renderHook(() => useBulkBillUpdate(mockBills), {
      wrapper: createWrapper(),
    });

    const operation = {
      type: "update",
      data: { status: "invalid" },
    };

    act(() => {
      result.current.selectBill("bill1");
      result.current.setBulkOperation(operation);
    });

    expect(result.current.validationErrors).toEqual(["Invalid status value"]);
  });

  it("should execute bulk update operation", async () => {
    mockUpdateBill.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useBulkBillUpdate(mockBills), {
      wrapper: createWrapper(),
    });

    const operation = {
      type: "update",
      data: { status: "paid" },
    };

    act(() => {
      result.current.selectBill("bill1");
      result.current.selectBill("bill2");
      result.current.setBulkOperation(operation);
    });

    await act(async () => {
      await result.current.executeBulkOperation();
    });

    expect(mockUpdateBill).toHaveBeenCalledTimes(2);
    expect(mockUpdateBill).toHaveBeenCalledWith("bill1", { status: "paid" });
    expect(mockUpdateBill).toHaveBeenCalledWith("bill2", { status: "paid" });
    expect(result.current.isProcessing).toBe(false);
  });

  it("should execute bulk delete operation", async () => {
    mockDeleteBill.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useBulkBillUpdate(mockBills), {
      wrapper: createWrapper(),
    });

    const operation = {
      type: "delete",
    };

    act(() => {
      result.current.selectBill("bill3");
      result.current.setBulkOperation(operation);
    });

    await act(async () => {
      await result.current.executeBulkOperation();
    });

    expect(mockDeleteBill).toHaveBeenCalledWith("bill3");
    expect(result.current.isProcessing).toBe(false);
  });

  it("should track progress during bulk operations", async () => {
    mockUpdateBill.mockImplementation(
      (id) => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
    );

    const { result } = renderHook(() => useBulkBillUpdate(mockBills), {
      wrapper: createWrapper(),
    });

    const operation = {
      type: "update",
      data: { status: "paid" },
    };

    act(() => {
      result.current.selectAllBills();
      result.current.setBulkOperation(operation);
    });

    const executionPromise = act(async () => {
      await result.current.executeBulkOperation();
    });

    // Check initial progress
    expect(result.current.progress.total).toBe(3);
    expect(result.current.isProcessing).toBe(true);

    await executionPromise;

    expect(result.current.progress.current).toBe(3);
    expect(result.current.isProcessing).toBe(false);
  });

  it("should handle operation errors gracefully", async () => {
    mockUpdateBill
      .mockResolvedValueOnce({ success: true })
      .mockRejectedValueOnce(new Error("Update failed"))
      .mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useBulkBillUpdate(mockBills), {
      wrapper: createWrapper(),
    });

    const operation = {
      type: "update",
      data: { status: "paid" },
    };

    act(() => {
      result.current.selectAllBills();
      result.current.setBulkOperation(operation);
    });

    await act(async () => {
      await result.current.executeBulkOperation();
    });

    expect(result.current.operationResults).toHaveLength(3);
    expect(result.current.operationResults[0]).toEqual({
      billId: "bill1",
      success: true,
      error: null,
    });
    expect(result.current.operationResults[1]).toEqual({
      billId: "bill2",
      success: false,
      error: "Update failed",
    });
    expect(result.current.operationResults[2]).toEqual({
      billId: "bill3",
      success: true,
      error: null,
    });
  });

  it("should provide operation statistics", async () => {
    mockUpdateBill
      .mockResolvedValueOnce({ success: true })
      .mockRejectedValueOnce(new Error("Update failed"));

    const { result } = renderHook(() => useBulkBillUpdate(mockBills), {
      wrapper: createWrapper(),
    });

    const operation = {
      type: "update",
      data: { status: "paid" },
    };

    act(() => {
      result.current.selectBill("bill1");
      result.current.selectBill("bill2");
      result.current.setBulkOperation(operation);
    });

    await act(async () => {
      await result.current.executeBulkOperation();
    });

    const stats = result.current.getOperationStats();

    expect(stats).toEqual({
      total: 2,
      successful: 1,
      failed: 1,
      successRate: 0.5,
    });
  });

  it("should reset operation state", () => {
    const { result } = renderHook(() => useBulkBillUpdate(mockBills), {
      wrapper: createWrapper(),
    });

    // Set up some state
    act(() => {
      result.current.selectAllBills();
      result.current.setBulkOperation({
        type: "update",
        data: { status: "paid" },
      });
    });

    act(() => {
      result.current.resetOperation();
    });

    expect(result.current.selectedBills).toEqual([]);
    expect(result.current.bulkOperation).toBe(null);
    expect(result.current.operationResults).toEqual([]);
    expect(result.current.validationErrors).toEqual([]);
    expect(result.current.progress).toEqual({ current: 0, total: 0 });
  });

  it("should filter bills by predicate", () => {
    const { result } = renderHook(() => useBulkBillUpdate(mockBills), {
      wrapper: createWrapper(),
    });

    // Select overdue bills only
    act(() => {
      result.current.selectBillsByPredicate((bill) => bill.status === "overdue");
    });

    expect(result.current.selectedBills).toEqual(["bill3"]);
  });

  it("should get selected bills data", () => {
    const { result } = renderHook(() => useBulkBillUpdate(mockBills), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.selectBill("bill1");
      result.current.selectBill("bill3");
    });

    const selectedBillsData = result.current.getSelectedBillsData();

    expect(selectedBillsData).toEqual([mockBills[0], mockBills[2]]);
  });

  it("should validate operation before execution", async () => {
    validateBulkOperation.mockReturnValue({
      isValid: false,
      errors: ["No bills selected"],
    });

    const { result } = renderHook(() => useBulkBillUpdate(mockBills), {
      wrapper: createWrapper(),
    });

    const operation = {
      type: "update",
      data: { status: "paid" },
    };

    act(() => {
      result.current.setBulkOperation(operation);
    });

    await act(async () => {
      await result.current.executeBulkOperation();
    });

    expect(mockUpdateBill).not.toHaveBeenCalled();
    expect(result.current.validationErrors).toEqual(["No bills selected"]);
  });

  it("should handle empty bills array", () => {
    const { result } = renderHook(() => useBulkBillUpdate([]), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.selectAllBills();
    });

    expect(result.current.selectedBills).toEqual([]);
  });
});
