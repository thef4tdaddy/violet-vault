import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFABModalIntegration } from "../useFABModalIntegration";

// Mock useModalManager
const mockOpenModal = vi.fn();
const mockCloseModal = vi.fn();

vi.mock("@/hooks/common/useModalManager", () => ({
  useModalManager: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
  }),
}));

describe("useFABModalIntegration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should provide all modal handler functions", () => {
    const { result } = renderHook(() => useFABModalIntegration());

    // Dashboard actions
    expect(typeof result.current.handlePaycheckProcessor).toBe("function");
    expect(typeof result.current.handleQuickTransaction).toBe("function");

    // Envelope actions
    expect(typeof result.current.handleCreateEnvelope).toBe("function");

    // Bills actions
    expect(typeof result.current.handleAddBill).toBe("function");
    expect(typeof result.current.handleBillDiscovery).toBe("function");

    // Savings actions
    expect(typeof result.current.handleAddSavingsGoal).toBe("function");
    expect(typeof result.current.handleDistributeSavings).toBe("function");

    // Transaction actions
    expect(typeof result.current.handleTransactionImport).toBe("function");
    expect(typeof result.current.handleReceiptScan).toBe("function");

    // Debt actions
    expect(typeof result.current.handleAddDebt).toBe("function");

    // Utility
    expect(typeof result.current.closeModal).toBe("function");
  });

  it("should open paycheck-processor modal", () => {
    const { result } = renderHook(() => useFABModalIntegration());

    act(() => {
      result.current.handlePaycheckProcessor();
    });

    expect(mockOpenModal).toHaveBeenCalledWith("paycheck-processor");
  });

  it("should open quick-transaction modal", () => {
    const { result } = renderHook(() => useFABModalIntegration());

    act(() => {
      result.current.handleQuickTransaction();
    });

    expect(mockOpenModal).toHaveBeenCalledWith("quick-transaction");
  });

  it("should open create-envelope modal", () => {
    const { result } = renderHook(() => useFABModalIntegration());

    act(() => {
      result.current.handleCreateEnvelope();
    });

    expect(mockOpenModal).toHaveBeenCalledWith("create-envelope");
  });

  it("should open add-bill modal", () => {
    const { result } = renderHook(() => useFABModalIntegration());

    act(() => {
      result.current.handleAddBill();
    });

    expect(mockOpenModal).toHaveBeenCalledWith("add-bill");
  });

  it("should open bill-discovery modal", () => {
    const { result } = renderHook(() => useFABModalIntegration());

    act(() => {
      result.current.handleBillDiscovery();
    });

    expect(mockOpenModal).toHaveBeenCalledWith("bill-discovery");
  });

  it("should open add-savings-goal modal", () => {
    const { result } = renderHook(() => useFABModalIntegration());

    act(() => {
      result.current.handleAddSavingsGoal();
    });

    expect(mockOpenModal).toHaveBeenCalledWith("add-savings-goal");
  });

  it("should open distribute-savings modal", () => {
    const { result } = renderHook(() => useFABModalIntegration());

    act(() => {
      result.current.handleDistributeSavings();
    });

    expect(mockOpenModal).toHaveBeenCalledWith("distribute-savings");
  });

  it("should open transaction-import modal", () => {
    const { result } = renderHook(() => useFABModalIntegration());

    act(() => {
      result.current.handleTransactionImport();
    });

    expect(mockOpenModal).toHaveBeenCalledWith("transaction-import");
  });

  it("should open receipt-scan modal", () => {
    const { result } = renderHook(() => useFABModalIntegration());

    act(() => {
      result.current.handleReceiptScan();
    });

    expect(mockOpenModal).toHaveBeenCalledWith("receipt-scan");
  });

  it("should open add-debt modal", () => {
    const { result } = renderHook(() => useFABModalIntegration());

    act(() => {
      result.current.handleAddDebt();
    });

    expect(mockOpenModal).toHaveBeenCalledWith("add-debt");
  });

  it("should provide closeModal function", () => {
    const { result } = renderHook(() => useFABModalIntegration());

    act(() => {
      result.current.closeModal();
    });

    expect(mockCloseModal).toHaveBeenCalled();
  });

  it("should maintain stable function references", () => {
    const { result, rerender } = renderHook(() => useFABModalIntegration());

    const firstHandlePaycheck = result.current.handlePaycheckProcessor;
    const firstHandleQuick = result.current.handleQuickTransaction;

    rerender();

    expect(result.current.handlePaycheckProcessor).toBe(firstHandlePaycheck);
    expect(result.current.handleQuickTransaction).toBe(firstHandleQuick);
  });
});
