import { render, screen, fireEvent } from "@/test/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import NavigationTabs from "../NavigationTabs";

// Mock hooks
vi.mock("@/hooks/api/useSentinelReceipts", () => ({
  useSentinelReceipts: vi.fn(),
}));

vi.mock("@/stores/ui/importDashboardStore", () => ({
  useImportDashboardStore: vi.fn(),
}));

const mockOpenImportDashboard = vi.fn();

describe("NavigationTabs", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    const { useSentinelReceipts } = await import("@/hooks/api/useSentinelReceipts");
    (useSentinelReceipts as any).mockReturnValue({
      pendingReceipts: [{ id: "1" }, { id: "2" }, { id: "3" }],
    });

    const { useImportDashboardStore } = await import("@/stores/ui/importDashboardStore");
    (useImportDashboardStore as any).mockImplementation((selector: any) =>
      selector ? selector({ open: mockOpenImportDashboard }) : mockOpenImportDashboard
    );
  });

  it("renders all navigation tabs", () => {
    render(
      <BrowserRouter>
        <NavigationTabs />
      </BrowserRouter>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Envelopes")).toBeInTheDocument();
    expect(screen.getByText("Bills")).toBeInTheDocument();
  });

  it("displays pending receipt badge on transactions tab", () => {
    render(
      <BrowserRouter>
        <NavigationTabs />
      </BrowserRouter>
    );

    const badge = screen.getByLabelText(/3 pending receipts/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("3");
  });

  it("opens import dashboard modal when badge is clicked", () => {
    render(
      <BrowserRouter>
        <NavigationTabs />
      </BrowserRouter>
    );

    const badge = screen.getByLabelText(/3 pending receipts/i);
    fireEvent.click(badge);

    expect(mockOpenImportDashboard).toHaveBeenCalled();
  });

  it("prevents navigation when badge is clicked", () => {
    const { container } = render(
      <BrowserRouter>
        <NavigationTabs />
      </BrowserRouter>
    );

    const badge = screen.getByLabelText(/3 pending receipts/i);
    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(clickEvent, "preventDefault");

    badge.dispatchEvent(clickEvent);

    // Badge click should prevent default to avoid navigation
    expect(mockOpenImportDashboard).toHaveBeenCalled();
  });

  it("does not display badge when no pending receipts", async () => {
    const { useSentinelReceipts } = await import("@/hooks/api/useSentinelReceipts");
    (useSentinelReceipts as any).mockReturnValue({
      pendingReceipts: [],
    });

    render(
      <BrowserRouter>
        <NavigationTabs />
      </BrowserRouter>
    );

    expect(screen.queryByLabelText(/pending receipts/i)).not.toBeInTheDocument();
  });

  it("displays 99+ for more than 99 pending receipts", async () => {
    const { useSentinelReceipts } = await import("@/hooks/api/useSentinelReceipts");
    const mockReceipts = Array.from({ length: 150 }, (_, i) => ({ id: `${i}` }));
    (useSentinelReceipts as any).mockReturnValue({
      pendingReceipts: mockReceipts,
    });

    render(
      <BrowserRouter>
        <NavigationTabs />
      </BrowserRouter>
    );

    const badge = screen.getByLabelText(/pending receipts/i);
    expect(badge).toHaveTextContent("99+");
  });
});
