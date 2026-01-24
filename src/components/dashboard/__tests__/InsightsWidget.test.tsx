import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import InsightsWidget from "../InsightsWidget";
import { useFinancialInsights } from "@/hooks/dashboard/useFinancialInsights";

vi.mock("@/hooks/dashboard/useFinancialInsights", () => ({
  useFinancialInsights: vi.fn(),
}));

describe("InsightsWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", () => {
    (useFinancialInsights as any).mockReturnValue({
      insights: [],
      isLoading: true,
    });
    const { container } = render(<InsightsWidget />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders nothing when no insights", () => {
    (useFinancialInsights as any).mockReturnValue({
      insights: [],
      isLoading: false,
    });
    const { container } = render(<InsightsWidget />);
    expect(container.firstChild).toBeNull();
  });

  it("renders insights when available", () => {
    const mockOnAction = vi.fn();
    (useFinancialInsights as any).mockReturnValue({
      insights: [
        {
          title: "Test Insight",
          description: "This is a test",
          type: "warning",
          iconName: "AlertTriangle",
          actionLabel: "Fix It",
          onAction: mockOnAction,
        },
      ],
      isLoading: false,
    });

    render(<InsightsWidget />);

    expect(screen.getByText("Test Insight")).toBeInTheDocument();
    expect(screen.getByText("This is a test")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Fix It"));
    expect(mockOnAction).toHaveBeenCalled();
  });
});
