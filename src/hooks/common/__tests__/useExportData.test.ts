import { renderHook, waitFor } from "@testing-library/react";
import { useExportData } from "../useExportData";
import { useAuth } from "@/hooks/auth/useAuth";
import { useToastHelpers } from "@/utils/common/toastHelpers";
import { budgetDb, getBudgetMetadata } from "@/db/budgetDb";
import { constructExportObject } from "../useExportDataHelpers";
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";

vi.mock("@/hooks/auth/useAuth");
vi.mock("../../../utils/common/toastHelpers");
vi.mock("../../../db/budgetDb");
vi.mock("../useExportDataHelpers");

describe("useExportData", () => {
  const mockUser = { userName: "testuser", budgetId: "123", userColor: "#000000" };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as Mock).mockReturnValue({
      user: mockUser,
    });
    (constructExportObject as Mock).mockImplementation((data, user) => ({
      envelopes: data[0],
      bills: data[1],
      transactions: data[2],
      debts: data[3],
      paycheckHistory: data[4],
      auditLog: data[5],
      metadata: data[6],
      exportMetadata: {
        version: "2.0",
        exportedAt: new Date().toISOString(),
        exportedBy: user?.userName || "unknown",
      },
    }));
    // Mock URL methods
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  it("should export data successfully", async () => {
    const showSuccessToast = vi.fn();
    (useToastHelpers as Mock).mockReturnValue({
      showSuccessToast,
      showErrorToast: vi.fn(),
      showWarningToast: vi.fn(),
    });
    (budgetDb.envelopes.toArray as Mock).mockResolvedValue([{ id: 1, name: "Groceries" }]);
    (budgetDb.bills.toArray as Mock).mockResolvedValue([]);
    (budgetDb.transactions.toArray as Mock).mockResolvedValue([]);
    (budgetDb.debts.toArray as Mock).mockResolvedValue([]);
    (budgetDb.paycheckHistory.toArray as Mock).mockResolvedValue([]);
    (budgetDb.auditLog.toArray as Mock).mockResolvedValue([]);
    (getBudgetMetadata as Mock).mockResolvedValue({ unassignedCash: 100 });

    const { result } = renderHook(() => useExportData());
    await result.current.exportData();

    expect(showSuccessToast).toHaveBeenCalledWith(
      expect.stringContaining("Export created with"),
      "Export Completed"
    );
  });

  it("should show a warning if there is no data to export", async () => {
    const showWarningToast = vi.fn();
    (useToastHelpers as Mock).mockReturnValue({
      showSuccessToast: vi.fn(),
      showErrorToast: vi.fn(),
      showWarningToast,
    });
    (budgetDb.envelopes.toArray as Mock).mockResolvedValue([]);
    (budgetDb.bills.toArray as Mock).mockResolvedValue([]);
    (budgetDb.transactions.toArray as Mock).mockResolvedValue([]);
    (budgetDb.debts.toArray as Mock).mockResolvedValue([]);
    (budgetDb.paycheckHistory.toArray as Mock).mockResolvedValue([]);
    (budgetDb.auditLog.toArray as Mock).mockResolvedValue([]);
    (getBudgetMetadata as Mock).mockResolvedValue(null); // Changed from {} to null

    const { result } = renderHook(() => useExportData());
    await result.current.exportData();

    expect(showWarningToast).toHaveBeenCalledWith("No data found to export", "Export Error");
  });

  it("should handle database query errors", async () => {
    const showErrorToast = vi.fn();
    (useToastHelpers as Mock).mockReturnValue({
      showSuccessToast: vi.fn(),
      showErrorToast,
      showWarningToast: vi.fn(),
    });
    (budgetDb.envelopes.toArray as Mock).mockRejectedValue(new Error("Database query failed"));

    const { result } = renderHook(() => useExportData());
    // Function doesn't throw, it catches errors and shows toast
    await result.current.exportData();

    expect(showErrorToast).toHaveBeenCalledWith(
      expect.stringContaining("Database query failed"),
      "Export Failed"
    );
  });

  it("should handle metadata fetch errors", async () => {
    const showErrorToast = vi.fn();
    (useToastHelpers as Mock).mockReturnValue({
      showSuccessToast: vi.fn(),
      showErrorToast,
      showWarningToast: vi.fn(),
    });
    (budgetDb.envelopes.toArray as Mock).mockResolvedValue([{ id: 1, name: "Groceries" }]);
    (budgetDb.bills.toArray as Mock).mockResolvedValue([]);
    (budgetDb.transactions.toArray as Mock).mockResolvedValue([]);
    (budgetDb.debts.toArray as Mock).mockResolvedValue([]);
    (budgetDb.paycheckHistory.toArray as Mock).mockResolvedValue([]);
    (budgetDb.auditLog.toArray as Mock).mockResolvedValue([]);
    (getBudgetMetadata as Mock).mockRejectedValue(new Error("Metadata fetch failed"));

    const { result } = renderHook(() => useExportData());
    // Function doesn't throw, it catches errors and shows toast
    await result.current.exportData();

    expect(showErrorToast).toHaveBeenCalledWith(
      expect.stringContaining("Metadata fetch failed"),
      "Export Failed"
    );
  });

  it("should export partial data when some tables are empty", async () => {
    const showSuccessToast = vi.fn();
    (useToastHelpers as Mock).mockReturnValue({
      showSuccessToast,
      showErrorToast: vi.fn(),
      showWarningToast: vi.fn(),
    });
    (budgetDb.envelopes.toArray as Mock).mockResolvedValue([{ id: 1, name: "Groceries" }]);
    (budgetDb.bills.toArray as Mock).mockResolvedValue([]);
    (budgetDb.transactions.toArray as Mock).mockResolvedValue([]);
    (budgetDb.debts.toArray as Mock).mockResolvedValue([]);
    (budgetDb.paycheckHistory.toArray as Mock).mockResolvedValue([]);
    (budgetDb.auditLog.toArray as Mock).mockResolvedValue([]);
    (getBudgetMetadata as Mock).mockResolvedValue({ unassignedCash: 100 });

    const { result } = renderHook(() => useExportData());
    await result.current.exportData();

    expect(showSuccessToast).toHaveBeenCalled();
  });

  it("should handle file creation errors", async () => {
    const showErrorToast = vi.fn();
    (useToastHelpers as Mock).mockReturnValue({
      showSuccessToast: vi.fn(),
      showErrorToast,
      showWarningToast: vi.fn(),
    });
    (budgetDb.envelopes.toArray as Mock).mockResolvedValue([{ id: 1, name: "Groceries" }]);
    (budgetDb.bills.toArray as Mock).mockResolvedValue([]);
    (budgetDb.transactions.toArray as Mock).mockResolvedValue([]);
    (budgetDb.debts.toArray as Mock).mockResolvedValue([]);
    (budgetDb.paycheckHistory.toArray as Mock).mockResolvedValue([]);
    (budgetDb.auditLog.toArray as Mock).mockResolvedValue([]);
    (getBudgetMetadata as Mock).mockResolvedValue({ unassignedCash: 100 });

    // Mock URL.createObjectURL to throw
    const originalCreateObjectURL = global.URL.createObjectURL;
    global.URL.createObjectURL = vi.fn(() => {
      throw new Error("Failed to create object URL");
    });

    const { result } = renderHook(() => useExportData());
    await result.current.exportData();

    await waitFor(() => {
      expect(showErrorToast).toHaveBeenCalledWith(
        expect.stringContaining("Export failed"),
        "Export Failed"
      );
    });

    // Restore original
    global.URL.createObjectURL = originalCreateObjectURL;
  });
});
