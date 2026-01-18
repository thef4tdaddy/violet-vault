import { renderHook, act } from "@testing-library/react";
import { useExportData } from "../useExportData";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useAuth } from "../../../../hooks/auth/useAuth";
import { useToastHelpers } from "@/utils/core/common/toastHelpers";
import { budgetDb, getBudgetMetadata } from "../../../../db/budgetDb";
import { constructExportObject, triggerDownload } from "../useExportDataHelpers";
import { trackExport } from "@/utils/platform/monitoring/performanceMonitor";

// Mock dependencies
vi.mock("../../../../hooks/auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/utils/data/dataManagement/validationUtils", () => ({
  validateImportedData: vi.fn(),
}));

vi.mock("@/utils/core/common/toastHelpers", () => ({
  useToastHelpers: vi.fn(),
}));

vi.mock("../../../../db/budgetDb", () => ({
  budgetDb: {
    envelopes: { toArray: vi.fn() },
    transactions: { toArray: vi.fn() },
    auditLog: { toArray: vi.fn() },
  },
  getBudgetMetadata: vi.fn(),
}));

vi.mock("../useExportDataHelpers", () => ({
  constructExportObject: vi.fn(),
  triggerDownload: vi.fn(),
}));

vi.mock("@/utils/platform/monitoring/performanceMonitor", () => ({
  trackExport: vi.fn(),
}));

vi.mock("@/utils/core/common/logger");

vi.mock("@/utils/core/common/ocrProcessor");
vi.mock("@/utils/core/common/logger");

describe("useExportData", () => {
  const mockShowSuccess = vi.fn();
  const mockShowError = vi.fn();
  const mockShowWarning = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuth).mockReturnValue({
      user: { userName: "testuser", budgetId: "budget-1" },
    } as any);

    vi.mocked(useToastHelpers).mockReturnValue({
      showSuccessToast: mockShowSuccess,
      showErrorToast: mockShowError,
      showWarningToast: mockShowWarning,
    } as any);

    vi.mocked(trackExport).mockImplementation(async (fn: any) => fn());
  });

  it("should export data successfully", async () => {
    vi.mocked(budgetDb.envelopes.toArray).mockResolvedValue([
      { id: "1", name: "Env 1", type: "standard" } as any,
    ]);
    vi.mocked(budgetDb.transactions.toArray).mockResolvedValue([]);
    vi.mocked(budgetDb.auditLog.toArray).mockResolvedValue([]);
    vi.mocked(getBudgetMetadata).mockResolvedValue({ unassignedCash: 0 } as any);

    vi.mocked(constructExportObject).mockReturnValue({
      envelopes: [],
      transactions: [],
      auditLog: [],
      exportMetadata: {},
    } as any);

    vi.mocked(triggerDownload).mockReturnValue(1024);

    const { result } = renderHook(() => useExportData());

    await act(async () => {
      await result.current.exportData();
    });

    expect(mockShowSuccess).toHaveBeenCalledWith(
      expect.stringContaining("Export created"),
      "Export Completed"
    );
    expect(triggerDownload).toHaveBeenCalled();
  });

  it("should show warning if no data to export", async () => {
    vi.mocked(budgetDb.envelopes.toArray).mockResolvedValue([]);
    vi.mocked(budgetDb.transactions.toArray).mockResolvedValue([]);
    vi.mocked(budgetDb.auditLog.toArray).mockResolvedValue([]);
    vi.mocked(getBudgetMetadata).mockResolvedValue(null as any);

    const { result } = renderHook(() => useExportData());

    await act(async () => {
      await result.current.exportData();
    });

    expect(mockShowWarning).toHaveBeenCalledWith("No data found to export", "Export Error");
  });
});
