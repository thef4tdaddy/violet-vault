import { renderHook } from "@testing-library/react";
import { useExportData } from "../useExportData";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastHelpers } from "../../../utils/common/toastHelpers";
import { budgetDb, getBudgetMetadata } from "../../../db/budgetDb";
import { vi, Mock } from "vitest";

vi.mock("../../../contexts/AuthContext");
vi.mock("../../../utils/common/toastHelpers");
vi.mock("../../../db/budgetDb");

describe("useExportData", () => {
  it("should export data successfully", async () => {
    (useAuth as Mock).mockReturnValue({
      currentUser: { userName: "testuser", budgetId: "123" },
    });
    const showSuccessToast = vi.fn();
    (useToastHelpers as Mock).mockReturnValue({
      showSuccessToast,
      showErrorToast: vi.fn(),
      showWarningToast: vi.fn(),
    });
    (budgetDb.envelopes.toArray as Mock).mockResolvedValue([{ id: 1, name: "Groceries" }]);
    (getBudgetMetadata as Mock).mockResolvedValue({ unassignedCash: 100 });

    const { result } = renderHook(() => useExportData());
    await result.current.exportData();

    expect(showSuccessToast).toHaveBeenCalledWith(
      expect.stringContaining("Export created with"),
      "Export Completed"
    );
  });

  it("should show a warning if there is no data to export", async () => {
    (useAuth as Mock).mockReturnValue({
      currentUser: { userName: "testuser", budgetId: "123" },
    });
    const showWarningToast = vi.fn();
    (useToastHelpers as Mock).mockReturnValue({
      showSuccessToast: vi.fn(),
      showErrorToast: vi.fn(),
      showWarningToast,
    });
    (budgetDb.envelopes.toArray as Mock).mockResolvedValue([]);
    (getBudgetMetadata as Mock).mockResolvedValue({});

    const { result } = renderHook(() => useExportData());
    await result.current.exportData();

    expect(showWarningToast).toHaveBeenCalledWith("No data found to export", "Export Error");
  });
});
