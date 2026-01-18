import { renderHook, act } from "@testing-library/react";
import { useImportData } from "../useImportData";
import { useAuth } from "../../../../hooks/auth/useAuth";
import { useToastHelpers } from "@/utils/core/common/toastHelpers";
import { useConfirm } from "../../../../hooks/platform/ux/useConfirm";
import { validateImportedData } from "@/utils/data/dataManagement/validationUtils";
import { budgetDb } from "../../../../db/budgetDb";
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";
import { trackImport } from "@/utils/platform/monitoring/performanceMonitor";

// Mock dependencies with explicit factories
vi.mock("../../../../hooks/auth/useAuth", () => ({
  useAuth: vi.fn(),
  default: vi.fn(),
}));

vi.mock("@/utils/core/common/toastHelpers", () => ({
  useToastHelpers: vi.fn(),
}));

vi.mock("../../../../hooks/platform/ux/useConfirm", () => ({
  useConfirm: vi.fn(),
}));

vi.mock("@/utils/data/dataManagement/validationUtils", () => ({
  validateImportedData: vi.fn(),
}));

vi.mock("@/utils/platform/monitoring/performanceMonitor", () => ({
  trackImport: vi.fn(),
}));

vi.mock("../../../../db/budgetDb", () => ({
  budgetDb: {
    transaction: vi.fn((type, ...args) => {
      const cb = args[args.length - 1];
      return cb();
    }),
    envelopes: { clear: vi.fn(), bulkAdd: vi.fn() },
    transactions: { clear: vi.fn(), bulkAdd: vi.fn() },
  },
}));

describe("useImportData", () => {
  const mockUser = { userName: "testuser", budgetId: "123" };
  const mockData = {
    envelopes: [{ id: "1", name: "Groceries", type: "standard" }],
    transactions: [],
  };

  const mockShowSuccess = vi.fn();
  const mockShowError = vi.fn();
  const mockShowWarning = vi.fn();
  const mockConfirm = vi.fn().mockResolvedValue(true);

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

    vi.mocked(useToastHelpers).mockReturnValue({
      showSuccessToast: mockShowSuccess,
      showErrorToast: mockShowError,
      showWarningToast: mockShowWarning,
    } as any);

    vi.mocked(useConfirm).mockReturnValue(mockConfirm);

    vi.mocked(validateImportedData).mockReturnValue({
      validatedData: mockData,
      hasBudgetIdMismatch: false,
      validationWarnings: [],
    } as any);

    vi.mocked(trackImport).mockImplementation(async (fn: any) => fn());
  });

  it("should import data successfully", async () => {
    const { result } = renderHook(() => useImportData());

    await act(async () => {
      await result.current.executeImport(mockData);
    });

    expect(budgetDb.envelopes.clear).toHaveBeenCalled();
    expect(budgetDb.envelopes.bulkAdd).toHaveBeenCalledWith(mockData.envelopes);
    expect(mockShowSuccess).toHaveBeenCalledWith("Data imported successfully");
  });

  it("should handle validation warnings", async () => {
    vi.mocked(validateImportedData).mockReturnValue({
      validatedData: mockData,
      hasBudgetIdMismatch: false,
      validationWarnings: ["Warning 1"],
    } as any);

    const { result } = renderHook(() => useImportData());

    await act(async () => {
      await result.current.executeImport(mockData);
    });

    expect(mockShowWarning).toHaveBeenCalledWith(
      expect.stringContaining("validation warning"),
      "Import Warnings"
    );
  });

  it("should handle errors during import", async () => {
    vi.mocked(budgetDb.envelopes.clear).mockRejectedValue(new Error("DB error"));

    const { result } = renderHook(() => useImportData());

    await act(async () => {
      await result.current.executeImport(mockData);
    });

    expect(mockShowError).toHaveBeenCalledWith("DB error");
  });
});
