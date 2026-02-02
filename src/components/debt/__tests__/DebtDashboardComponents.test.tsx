import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { DashboardHeader } from "../DebtDashboardComponents";

// Mock the getIcon utility
vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => () => <svg data-testid="mock-icon" />),
}));

// Mock components used within sections
vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
  StylizedButtonText: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("../ui/DebtList", () => ({
  default: ({ debts }: any) => <div data-testid="mock-debt-list">{debts.length} Debts</div>,
}));

vi.mock("../DebtStrategies", () => ({
  default: () => <div data-testid="mock-strategies">Strategies</div>,
}));

// Mock feature flags
vi.mock("@/utils/domain/debts/debtDebugConfig", () => ({
  isDebtFeatureEnabled: vi.fn().mockReturnValue(true),
}));

import { DashboardHeader, OverviewTab, StrategiesTab } from "../DebtDashboardComponents";
import { isDebtFeatureEnabled } from "@/utils/domain/debts/debtDebugConfig";

describe("DebtDashboardComponents", () => {
  const mockDebtStats = {
    activeDebtCount: 2,
    totalDebt: 5000,
    totalMonthlyPayments: 500,
    averageInterestRate: 15,
    totalInterestPaid: 100,
    totalDebtCount: 2,
    overdueDebtCount: 0,
    nextPaymentDate: null,
    projectedPayoffDate: null,
    dueSoonAmount: 0,
    dueSoonCount: 0,
    debtsByType: {},
  };

  describe("DashboardHeader", () => {
    const defaultProps = {
      debtStats: mockDebtStats,
      handleAddDebt: vi.fn(),
    };

    it("should render correctly with title", () => {
      render(<DashboardHeader {...defaultProps} />);
      expect(screen.getByRole("heading", { name: /DEBT TRACKING/i })).toBeInTheDocument();
    });

    it("should render 'Add Debt' button", () => {
      render(<DashboardHeader {...defaultProps} />);
      expect(screen.getByText("Add Debt")).toBeInTheDocument();
    });

    it("should render stats", () => {
      render(<DashboardHeader {...defaultProps} />);
      expect(screen.getByText(/\$5000.00/)).toBeInTheDocument();
    });
  });

  describe("OverviewTab", () => {
    const defaultProps = {
      debtStats: mockDebtStats,
      filteredDebts: [{ id: "1", name: "Test Debt" }] as any[],
      filterOptions: {} as any,
      setFilterOptions: vi.fn(),
      setShowUpcomingPaymentsModal: vi.fn(),
      handleDebtClick: vi.fn(),
      handleRecordPayment: vi.fn(),
      handleAddDebt: vi.fn(),
    };

    it("should render debt list when enabled", () => {
      vi.mocked(isDebtFeatureEnabled).mockReturnValue(true);
      render(<OverviewTab {...defaultProps} />);
      expect(screen.getByTestId("mock-debt-list")).toBeInTheDocument();
      // Use heading role which aggregates text content of children
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toHaveTextContent(/YOUR\s+DEBTS\s+\(1\)/i);
    });

    it("should render disabled message when feature flag is off", () => {
      vi.mocked(isDebtFeatureEnabled).mockReturnValue(false);
      render(<OverviewTab {...defaultProps} />);
      expect(screen.getByText(/Debt List disabled/i)).toBeInTheDocument();
    });

    it("should render EmptyDebtList when no debts", () => {
      vi.mocked(isDebtFeatureEnabled).mockReturnValue(true);
      render(<OverviewTab {...defaultProps} filteredDebts={[]} />);
      expect(screen.getByText("No Debts Found")).toBeInTheDocument();
      expect(screen.getByText("Add Your First Debt")).toBeInTheDocument();
    });
  });

  describe("StrategiesTab", () => {
    it("should render strategies when enabled", () => {
      vi.mocked(isDebtFeatureEnabled).mockReturnValue(true);
      render(<StrategiesTab debts={[]} />);
      expect(screen.getByTestId("mock-strategies")).toBeInTheDocument();
    });

    it("should render disabled message when off", () => {
      vi.mocked(isDebtFeatureEnabled).mockReturnValue(false);
      render(<StrategiesTab debts={[]} />);
      expect(screen.getByText(/strategies temporarily disabled/i)).toBeInTheDocument();
    });
  });
});
