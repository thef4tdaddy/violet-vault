import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import QuickActions from "../QuickActions";
import "@testing-library/jest-dom";
import { useManualSync } from "../../../hooks/platform/sync/useManualSync";
import { useToastHelpers } from "../../../utils/core/common/toastHelpers";
import { useSentinelReceipts } from "../../../hooks/api/useSentinelReceipts";

vi.mock("@/hooks/platform/sync/useManualSync", () => ({
  useManualSync: vi.fn(),
}));

vi.mock("@/utils/core/common/toastHelpers", () => ({
  useToastHelpers: vi.fn(),
}));

vi.mock("@/stores/ui/importDashboardStore", () => ({
  useImportDashboardStore: vi.fn(),
}));

vi.mock("@/hooks/api/useSentinelReceipts", () => ({
  useSentinelReceipts: vi.fn(() => ({
    pendingReceipts: [],
    isLoading: false,
    error: null,
  })),
}));

describe("QuickActions", () => {
  const mockForceFullSync = vi.fn();
  const mockShowSuccessToast = vi.fn();
  const mockShowErrorToast = vi.fn();
  const mockOpenImportDashboard = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    (useManualSync as any).mockReturnValue({
      forceFullSync: mockForceFullSync,
      isSyncInProgress: false,
    });
    (useToastHelpers as any).mockReturnValue({
      showSuccessToast: mockShowSuccessToast,
      showErrorToast: mockShowErrorToast,
    });
    // Mock the Zustand store selector
    const { useImportDashboardStore } = await import("../../../stores/ui/importDashboardStore");
    (useImportDashboardStore as any).mockImplementation((selector: any) =>
      selector ? selector({ open: mockOpenImportDashboard }) : mockOpenImportDashboard
    );
  });

  it("renders all five quick actions", () => {
    render(<QuickActions />);
    expect(screen.getByText("Add Transaction")).toBeInTheDocument();
    expect(screen.getByText("Import Receipts")).toBeInTheDocument();
    expect(screen.getByText("Add Bill")).toBeInTheDocument();
    expect(screen.getByText("Add Paycheck")).toBeInTheDocument();
    expect(screen.getByText("Sync Now")).toBeInTheDocument();
  });

  it("opens import dashboard modal when Import Receipts is clicked", () => {
    render(<QuickActions />);

    fireEvent.click(screen.getByText("Import Receipts"));

    expect(mockOpenImportDashboard).toHaveBeenCalled();
  });

  it("handles sync success", async () => {
    mockForceFullSync.mockResolvedValueOnce({ success: true });
    render(<QuickActions />);

    fireEvent.click(screen.getByText("Sync Now"));

    await waitFor(() => expect(mockForceFullSync).toHaveBeenCalled());
    expect(mockShowSuccessToast).toHaveBeenCalledWith("Synchronization complete");
  });

  it("handles sync failure", async () => {
    mockForceFullSync.mockResolvedValueOnce({ success: false, error: "Sync failed" });
    render(<QuickActions />);

    fireEvent.click(screen.getByText("Sync Now"));

    await waitFor(() => expect(mockShowErrorToast).toHaveBeenCalledWith("Sync failed"));
  });

  it("renders pending count badge when there are pending receipts", () => {
    (useSentinelReceipts as any).mockReturnValue({
      pendingReceipts: new Array(3).fill({}),
      isLoading: false,
      error: null,
    });

    render(<QuickActions />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
