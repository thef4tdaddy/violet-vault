import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import {
  useTransactionArchivingUI,
  useTransactionArchivingProcess,
  useArchivingUIHelpers,
} from "../useTransactionArchiving";

// Mock dependencies
vi.mock("@/utils/common/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

vi.mock("@/utils/core/common/transactionArchiving", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/utils/core/common/transactionArchiving")>();

  return {
    ...actual,
    createArchiver: vi.fn(() => ({
      calculateCutoffDate: vi.fn(
        (months) => new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000)
      ),
      getTransactionsForArchiving: vi.fn(() =>
        Promise.resolve([
          {
            id: 1,
            amount: 100,
            description: "Test transaction 1",
            category: "Food",
            envelopeId: "env1",
            date: "2023-01-01",
          },
          {
            id: 2,
            amount: -50,
            description: "Test transaction 2",
            category: "Entertainment",
            envelopeId: "env2",
            date: "2023-02-01",
          },
        ])
      ),
    })),
  };
});

describe("useTransactionArchivingUI", () => {
  it("should initialize with default state", () => {
    const { result } = renderHook(() => useTransactionArchivingUI());

    expect(result.current.selectedPeriod).toBe(6);
    expect(result.current.showAdvancedOptions).toBe(false);
    expect(result.current.confirmArchiving).toBe(false);
    expect(result.current.showPreview).toBe(false);
    expect(result.current.previewData).toBeNull();
  });

  it("should handle period change", () => {
    const { result } = renderHook(() => useTransactionArchivingUI());

    act(() => {
      result.current.handlePeriodChange("12");
    });

    expect(result.current.selectedPeriod).toBe(12);
  });

  it("should toggle advanced options", () => {
    const { result } = renderHook(() => useTransactionArchivingUI());

    act(() => {
      result.current.toggleAdvancedOptions();
    });

    expect(result.current.showAdvancedOptions).toBe(true);

    act(() => {
      result.current.toggleAdvancedOptions();
    });

    expect(result.current.showAdvancedOptions).toBe(false);
  });

  it("should toggle confirm archiving", () => {
    const { result } = renderHook(() => useTransactionArchivingUI());

    act(() => {
      result.current.toggleConfirmArchiving();
    });

    expect(result.current.confirmArchiving).toBe(true);
  });

  it("should reset archiving state", () => {
    const { result } = renderHook(() => useTransactionArchivingUI());

    // Set some state first
    act(() => {
      result.current.toggleConfirmArchiving();
      result.current.handlePreview();
    });

    // Reset state
    act(() => {
      result.current.resetArchivingState();
    });

    expect(result.current.confirmArchiving).toBe(false);
    expect(result.current.showPreview).toBe(false);
    expect(result.current.previewData).toBeNull();
  });

  it("should handle preview generation", async () => {
    const { result } = renderHook(() => useTransactionArchivingUI());

    await act(async () => {
      await result.current.handlePreview();
    });

    expect(result.current.showPreview).toBe(true);
    expect(result.current.previewData).toBeDefined();
    expect(result.current.previewData?.totalCount).toBe(2);
    expect(result.current.previewData?.categories).toHaveProperty("Food");
    expect(result.current.previewData?.categories).toHaveProperty("Entertainment");
  });

  it("should close preview", () => {
    const { result } = renderHook(() => useTransactionArchivingUI());

    act(() => {
      result.current.closePreview();
    });

    expect(result.current.showPreview).toBe(false);
  });
});

describe("useTransactionArchivingProcess", () => {
  it("should handle successful archiving", async () => {
    const { result } = renderHook(() => useTransactionArchivingProcess());
    const mockExecuteArchiving = vi.fn().mockResolvedValue(undefined);
    const mockOnSuccess = vi.fn();
    const mockOnError = vi.fn();

    await act(async () => {
      await result.current.handleArchive(6, mockExecuteArchiving, {
        onSuccess: mockOnSuccess,
        onError: mockOnError,
      });
    });

    expect(mockExecuteArchiving).toHaveBeenCalledWith(6);
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnError).not.toHaveBeenCalled();
  });

  it("should handle archiving errors", async () => {
    const { result } = renderHook(() => useTransactionArchivingProcess());
    const mockError = new Error("Archiving failed");
    const mockExecuteArchiving = vi.fn().mockRejectedValue(mockError);
    const mockOnSuccess = vi.fn();
    const mockOnError = vi.fn();

    await act(async () => {
      await result.current.handleArchive(6, mockExecuteArchiving, {
        onSuccess: mockOnSuccess,
        onError: mockOnError,
      });
    });

    expect(mockExecuteArchiving).toHaveBeenCalledWith(6);
    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnError).toHaveBeenCalledWith(mockError);
  });
});

describe("useArchivingUIHelpers", () => {
  it("should return correct urgency colors", () => {
    const { result } = renderHook(() => useArchivingUIHelpers());

    expect(result.current.getUrgencyColor("high")).toBe("text-red-600 bg-red-50");
    expect(result.current.getUrgencyColor("medium")).toBe("text-yellow-600 bg-yellow-50");
    expect(result.current.getUrgencyColor("low")).toBe("text-green-600 bg-green-50");
    expect(result.current.getUrgencyColor("unknown")).toBe("text-gray-600 bg-gray-50");
  });

  it("should return correct urgency icons", () => {
    const { result } = renderHook(() => useArchivingUIHelpers());

    expect(result.current.getUrgencyIcon("high")).toBe("AlertTriangle");
    expect(result.current.getUrgencyIcon("medium")).toBe("Clock");
    expect(result.current.getUrgencyIcon("low")).toBe("CheckCircle");
    expect(result.current.getUrgencyIcon("unknown")).toBe("Info");
  });

  it("should format storage sizes correctly", () => {
    const { result } = renderHook(() => useArchivingUIHelpers());

    expect(result.current.formatStorageSize(500)).toBe("500 B");
    expect(result.current.formatStorageSize(1536)).toBe("2 KB");
    expect(result.current.formatStorageSize(1048576)).toBe("1 MB");
  });

  it("should calculate storage impact correctly", () => {
    const { result } = renderHook(() => useArchivingUIHelpers());

    const impact = result.current.calculateStorageImpact(1000);

    expect(impact.bytes).toBe(1000 * 0.35 * 1024);
    expect(impact.megabytes).toBeCloseTo(0.34, 2);
    expect(impact.formatted).toContain("KB");
  });
});
