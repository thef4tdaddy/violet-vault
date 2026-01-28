import { render, screen } from "../../../test/test-utils";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BottomNavigationBar from "../BottomNavigationBar";
import React from "react";
import { useBottomNavigation } from "../../../hooks/platform/mobile/useBottomNavigation";
import { useImportDashboardStore } from "../../../stores/ui/importDashboardStore";

// Mock hooks
vi.mock("@/hooks/platform/mobile/useBottomNavigation", () => ({
  useBottomNavigation: vi.fn(),
}));

vi.mock("@/stores/ui/importDashboardStore", () => ({
  useImportDashboardStore: vi.fn(),
}));

vi.mock("../BottomNavItem", () => ({
  default: ({ label, badgeCount }: any) => (
    <div data-testid={`nav-item-${label}`}>
      {label} {badgeCount > 0 && <span data-testid={`badge-${label}`}>{badgeCount}</span>}
    </div>
  ),
}));

describe("BottomNavigationBar", () => {
  const mockVisibleItems = [
    { key: "dashboard", path: "/dashboard", icon: () => null, label: "Dashboard" },
    {
      key: "transactions",
      path: "/transactions",
      icon: () => null,
      label: "Transactions",
      badgeCount: 3,
    },
    { key: "bills", path: "/bills", icon: () => null, label: "Bills" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useBottomNavigation as any).mockReturnValue({
      isVisible: true,
      getVisibleItems: vi.fn(() => mockVisibleItems),
      isItemActive: vi.fn((key) => key === "dashboard"),
    });
    (useImportDashboardStore as any).mockImplementation((selector: any) =>
      selector ? selector({ open: vi.fn() }) : vi.fn()
    );
  });

  it("renders nothing when not visible", () => {
    (useBottomNavigation as any).mockReturnValue({
      isVisible: false,
      getVisibleItems: vi.fn(),
      isItemActive: vi.fn(),
    });

    const { container } = render(<BottomNavigationBar />);
    expect(container.firstChild).toBeNull();
  });

  it("renders visible items", () => {
    render(<BottomNavigationBar />);
    expect(screen.getByTestId("nav-item-Dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("nav-item-Transactions")).toBeInTheDocument();
    expect(screen.getByTestId("nav-item-Bills")).toBeInTheDocument();
  });

  it("passes badgeCount to Transactions item", () => {
    render(<BottomNavigationBar />);
    expect(screen.getByTestId("bottom-nav-badge")).toHaveTextContent("3");
  });
});
