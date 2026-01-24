import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import QuickActions from "../QuickActions";
import { useManualSync } from "@/hooks/platform/sync/useManualSync";
import { useToastHelpers } from "@/utils/core/common/toastHelpers";

vi.mock("@/hooks/platform/sync/useManualSync", () => ({
  useManualSync: vi.fn(),
}));

vi.mock("@/utils/core/common/toastHelpers", () => ({
  useToastHelpers: vi.fn(),
}));

describe("QuickActions", () => {
  const mockForceFullSync = vi.fn();
  const mockShowSuccessToast = vi.fn();
  const mockShowErrorToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useManualSync as any).mockReturnValue({
      forceFullSync: mockForceFullSync,
      isSyncInProgress: false,
    });
    (useToastHelpers as any).mockReturnValue({
      showSuccessToast: mockShowSuccessToast,
      showErrorToast: mockShowErrorToast,
    });
  });

  it("renders all five quick actions", () => {
    render(<QuickActions />);
    expect(screen.getByText("Add Transaction")).toBeInTheDocument();
    expect(screen.getByText("Scan Receipt")).toBeInTheDocument();
    expect(screen.getByText("Add Bill")).toBeInTheDocument();
    expect(screen.getByText("Add Paycheck")).toBeInTheDocument();
    expect(screen.getByText("Sync Now")).toBeInTheDocument();
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
});
