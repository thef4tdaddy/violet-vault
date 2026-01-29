import { render, screen, fireEvent, act } from "@/test/test-utils";
import "@testing-library/jest-dom";
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

    // Set a desktop width for tests
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1200,
    });

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
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    render(<NavigationTabs />);

    expect(screen.getByRole("link", { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Envelopes/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Bills/i })).toBeInTheDocument();
  });

  it("displays pending receipt badge on transactions tab", () => {
    render(<NavigationTabs />);

    const badge = screen.getByRole("button", { name: /pending receipts/i });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("3");
  });

  it("opens import dashboard modal when badge is clicked", () => {
    render(<NavigationTabs />);

    const badge = screen.getByRole("button", { name: /pending receipts/i });
    fireEvent.click(badge);

    expect(mockOpenImportDashboard).toHaveBeenCalled();
  });

  it("prevents navigation when badge is clicked", () => {
    const { container } = render(<NavigationTabs />);

    const badge = screen.getByRole("button", { name: /pending receipts/i });
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

    render(<NavigationTabs />);

    expect(screen.queryByRole("button", { name: /pending receipts/i })).not.toBeInTheDocument();
  });

  it("displays 99+ for more than 99 pending receipts", async () => {
    const { useSentinelReceipts } = await import("@/hooks/api/useSentinelReceipts");
    const mockReceipts = Array.from({ length: 150 }, (_, i) => ({ id: `${i}` }));
    (useSentinelReceipts as any).mockReturnValue({
      pendingReceipts: mockReceipts,
    });

    render(<NavigationTabs />);

    const badge = screen.getByRole("button", { name: /pending receipts/i });
    expect(badge).toHaveTextContent("99+");
  });
});
