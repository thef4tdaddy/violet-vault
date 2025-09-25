import { renderHook } from "@testing-library/react";
import { useExportData } from "../useExportData";
import { useAuthManager } from "../../auth/useAuthManager";
import { useToastHelpers } from "../../../utils/common/toastHelpers";
import { budgetDb, getBudgetMetadata } from "../../../db/budgetDb";
import { vi } from "vitest";

vi.mock("../../auth/useAuthManager");
vi.mock("../../../utils/common/toastHelpers");
vi.mock("../../../db/budgetDb");

describe("useExportData", () => {
  it("should export data successfully", async () => {
    useAuthManager.mockReturnValue({
      user: { userName: "testuser", budgetId: "123" },
    });
    const showSuccessToast = vi.fn();
    useToastHelpers.mockReturnValue({
      showSuccessToast,
      showErrorToast: vi.fn(),
      showWarningToast: vi.fn(),
    });
    budgetDb.envelopes.toArray.mockResolvedValue([
      { id: 1, name: "Groceries" },
    ]);
    getBudgetMetadata.mockResolvedValue({ unassignedCash: 100 });

    const { result } = renderHook(() => useExportData());
    await result.current.exportData();

    expect(showSuccessToast).toHaveBeenCalledWith(
      expect.stringContaining("Export created with"),
      "Export Completed",
    );
  });

  it("should show a warning if there is no data to export", async () => {
    useAuth.mockReturnValue({
      currentUser: { userName: "testuser", budgetId: "123" },
    });
    const showWarningToast = vi.fn();
    useToastHelpers.mockReturnValue({
      showSuccessToast: vi.fn(),
      showErrorToast: vi.fn(),
      showWarningToast,
    });
    budgetDb.envelopes.toArray.mockResolvedValue([]);
    getBudgetMetadata.mockResolvedValue({});

    const { result } = renderHook(() => useExportData());
    await result.current.exportData();

    expect(showWarningToast).toHaveBeenCalledWith(
      "No data found to export",
      "Export Error",
    );
  });
});
