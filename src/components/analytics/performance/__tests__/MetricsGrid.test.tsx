import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MetricsGrid from "../MetricsGrid";

// Mock MetricCard component
vi.mock("@/components/primitives", () => ({
  MetricCard: ({
    title,
    value,
    icon,
    subtitle,
    variant,
    format,
    customFormatter,
  }: {
    title: string;
    value: number;
    icon: string;
    subtitle: string;
    variant: string;
    format: string;
    customFormatter?: (val: number) => string;
  }) => (
    <div data-testid={`metric-card-${title.toLowerCase().replace(/\s/g, "-")}`}>
      <div data-testid="title">{title}</div>
      <div data-testid="value">{customFormatter ? customFormatter(value) : value}</div>
      <div data-testid="icon">{icon}</div>
      <div data-testid="subtitle">{subtitle}</div>
      <div data-testid="variant">{variant}</div>
      <div data-testid="format">{format}</div>
    </div>
  ),
}));

describe("MetricsGrid", () => {
  const defaultMetrics = {
    budgetAdherence: 85,
    savingsRate: 75,
    spendingEfficiency: 90,
    balanceStability: 95,
  };

  describe("Rendering", () => {
    it("should render all four metric cards", () => {
      render(<MetricsGrid performanceMetrics={defaultMetrics} />);
      expect(screen.getByText("Budget Adherence")).toBeInTheDocument();
      expect(screen.getByText("Savings Rate")).toBeInTheDocument();
      expect(screen.getByText("Spending Efficiency")).toBeInTheDocument();
      expect(screen.getByText("Balance Stability")).toBeInTheDocument();
    });

    it("should render metric values", () => {
      render(<MetricsGrid performanceMetrics={defaultMetrics} />);
      expect(screen.getByText("85/100")).toBeInTheDocument();
      expect(screen.getByText("75/100")).toBeInTheDocument();
      expect(screen.getByText("90/100")).toBeInTheDocument();
      expect(screen.getByText("95/100")).toBeInTheDocument();
    });

    it("should render correct icons for each metric", () => {
      render(<MetricsGrid performanceMetrics={defaultMetrics} />);
      const icons = screen.getAllByTestId("icon");
      expect(icons[0]).toHaveTextContent("Target");
      expect(icons[1]).toHaveTextContent("TrendingUp");
      expect(icons[2]).toHaveTextContent("DollarSign");
      expect(icons[3]).toHaveTextContent("Wallet");
    });

    it("should render correct descriptions", () => {
      render(<MetricsGrid performanceMetrics={defaultMetrics} />);
      expect(
        screen.getByText("How well you're sticking to your planned spending")
      ).toBeInTheDocument();
      expect(screen.getByText("Your ability to save and build wealth")).toBeInTheDocument();
      expect(
        screen.getByText("How balanced your spending is across categories")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Accuracy between your actual and virtual balances")
      ).toBeInTheDocument();
    });
  });

  describe("Variant Assignment", () => {
    it("should assign success variant for scores >= 90", () => {
      const highMetrics = {
        budgetAdherence: 90,
        savingsRate: 95,
        spendingEfficiency: 92,
        balanceStability: 98,
      };
      render(<MetricsGrid performanceMetrics={highMetrics} />);
      const variants = screen.getAllByTestId("variant");
      variants.forEach((variant) => {
        expect(variant).toHaveTextContent("success");
      });
    });

    it("should assign info variant for scores >= 70 and < 90", () => {
      const mediumMetrics = {
        budgetAdherence: 70,
        savingsRate: 75,
        spendingEfficiency: 80,
        balanceStability: 89,
      };
      render(<MetricsGrid performanceMetrics={mediumMetrics} />);
      const variants = screen.getAllByTestId("variant");
      variants.forEach((variant) => {
        expect(variant).toHaveTextContent("info");
      });
    });

    it("should assign warning variant for scores >= 50 and < 70", () => {
      const lowMediumMetrics = {
        budgetAdherence: 50,
        savingsRate: 55,
        spendingEfficiency: 60,
        balanceStability: 69,
      };
      render(<MetricsGrid performanceMetrics={lowMediumMetrics} />);
      const variants = screen.getAllByTestId("variant");
      variants.forEach((variant) => {
        expect(variant).toHaveTextContent("warning");
      });
    });

    it("should assign danger variant for scores < 50", () => {
      const lowMetrics = {
        budgetAdherence: 0,
        savingsRate: 25,
        spendingEfficiency: 40,
        balanceStability: 49,
      };
      render(<MetricsGrid performanceMetrics={lowMetrics} />);
      const variants = screen.getAllByTestId("variant");
      variants.forEach((variant) => {
        expect(variant).toHaveTextContent("danger");
      });
    });

    it("should assign correct variants for mixed scores", () => {
      const mixedMetrics = {
        budgetAdherence: 95, // success
        savingsRate: 45, // danger
        spendingEfficiency: 75, // info
        balanceStability: 60, // warning
      };
      render(<MetricsGrid performanceMetrics={mixedMetrics} />);
      const variants = screen.getAllByTestId("variant");
      expect(variants[0]).toHaveTextContent("success");
      expect(variants[1]).toHaveTextContent("danger");
      expect(variants[2]).toHaveTextContent("info");
      expect(variants[3]).toHaveTextContent("warning");
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero scores", () => {
      const zeroMetrics = {
        budgetAdherence: 0,
        savingsRate: 0,
        spendingEfficiency: 0,
        balanceStability: 0,
      };
      render(<MetricsGrid performanceMetrics={zeroMetrics} />);
      expect(screen.getByText("0/100")).toBeInTheDocument();
    });

    it("should handle perfect scores (100)", () => {
      const perfectMetrics = {
        budgetAdherence: 100,
        savingsRate: 100,
        spendingEfficiency: 100,
        balanceStability: 100,
      };
      render(<MetricsGrid performanceMetrics={perfectMetrics} />);
      const values = screen.getAllByText("100/100");
      expect(values.length).toBe(4);
    });

    it("should handle decimal scores", () => {
      const decimalMetrics = {
        budgetAdherence: 85.5,
        savingsRate: 75.3,
        spendingEfficiency: 90.7,
        balanceStability: 95.2,
      };
      render(<MetricsGrid performanceMetrics={decimalMetrics} />);
      expect(screen.getByText("85.5/100")).toBeInTheDocument();
      expect(screen.getByText("75.3/100")).toBeInTheDocument();
    });

    it("should handle negative scores", () => {
      const negativeMetrics = {
        budgetAdherence: -10,
        savingsRate: -5,
        spendingEfficiency: 0,
        balanceStability: 50,
      };
      render(<MetricsGrid performanceMetrics={negativeMetrics} />);
      expect(screen.getByText("-10/100")).toBeInTheDocument();
      expect(screen.getByText("-5/100")).toBeInTheDocument();
    });

    it("should handle scores greater than 100", () => {
      const highMetrics = {
        budgetAdherence: 150,
        savingsRate: 120,
        spendingEfficiency: 110,
        balanceStability: 105,
      };
      render(<MetricsGrid performanceMetrics={highMetrics} />);
      expect(screen.getByText("150/100")).toBeInTheDocument();
      expect(screen.getByText("120/100")).toBeInTheDocument();
    });

    it("should handle metrics with extra properties", () => {
      const extendedMetrics = {
        budgetAdherence: 85,
        savingsRate: 75,
        spendingEfficiency: 90,
        balanceStability: 95,
        extraProperty: 100,
        anotherProperty: "test",
      };
      render(<MetricsGrid performanceMetrics={extendedMetrics} />);
      expect(screen.getByText("Budget Adherence")).toBeInTheDocument();
    });
  });

  describe("Grid Layout", () => {
    it("should apply correct grid classes", () => {
      const { container } = render(<MetricsGrid performanceMetrics={defaultMetrics} />);
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass(
        "grid",
        "grid-cols-1",
        "md:grid-cols-2",
        "lg:grid-cols-4",
        "gap-4",
        "mb-8"
      );
    });

    it("should render in a single grid", () => {
      const { container } = render(<MetricsGrid performanceMetrics={defaultMetrics} />);
      const grids = container.querySelectorAll(".grid");
      expect(grids.length).toBe(1);
    });
  });

  describe("Custom Formatter", () => {
    it("should apply custom formatter to all values", () => {
      render(<MetricsGrid performanceMetrics={defaultMetrics} />);
      const formats = screen.getAllByTestId("format");
      formats.forEach((format) => {
        expect(format).toHaveTextContent("custom");
      });
    });

    it("should format values with /100 suffix", () => {
      render(<MetricsGrid performanceMetrics={defaultMetrics} />);
      expect(screen.getByText("85/100")).toBeInTheDocument();
      expect(screen.getByText("75/100")).toBeInTheDocument();
      expect(screen.getByText("90/100")).toBeInTheDocument();
      expect(screen.getByText("95/100")).toBeInTheDocument();
    });
  });
});
