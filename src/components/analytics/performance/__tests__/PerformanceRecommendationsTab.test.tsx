import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PerformanceRecommendationsTab from "../PerformanceRecommendationsTab";
import React from "react";
import type { Recommendation } from "@/types/analytics";

// Mock the icons
vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => (props: React.HTMLAttributes<HTMLElement>) => (
    <div data-testid="icon" {...props} />
  )),
}));

describe("PerformanceRecommendationsTab", () => {
  describe("Empty State", () => {
    it("renders empty state when no recommendations provided", () => {
      render(<PerformanceRecommendationsTab recommendations={[]} />);

      expect(screen.getByText("You're doing great!")).toBeDefined();
      expect(screen.getByText("No specific recommendations at this time.")).toBeDefined();
    });

    it("displays CheckCircle icon in empty state", () => {
      render(<PerformanceRecommendationsTab recommendations={[]} />);

      const icons = screen.getAllByTestId("icon");
      expect(icons.length).toBeGreaterThan(0);
    });

    it("applies correct styling to empty state", () => {
      render(<PerformanceRecommendationsTab recommendations={[]} />);

      const emptyState = screen.getByText("You're doing great!").closest("div");
      expect(emptyState?.className).toContain("text-center");
      expect(emptyState?.className).toContain("py-8");
    });
  });

  describe("Recommendations List", () => {
    const mockRecommendations: Recommendation[] = [
      {
        id: "1",
        type: "saving",
        title: "Increase Savings",
        description: "Build your emergency fund",
        impact: "high",
        message: "Consider saving 10% more each month",
      },
      {
        id: "2",
        type: "spending",
        title: "Reduce Spending",
        description: "Cut unnecessary expenses",
        impact: "medium",
        message: "Review your subscription services",
        action: "Review budget",
      },
      {
        id: "3",
        type: "investment",
        title: "Investment Opportunity",
        description: "Invest in retirement",
        impact: "high",
        message: "Consider increasing 401k contributions",
        action: "Consult advisor",
      },
    ];

    it("renders all recommendations", () => {
      render(<PerformanceRecommendationsTab recommendations={mockRecommendations} />);

      expect(screen.getByText("Increase Savings")).toBeDefined();
      expect(screen.getByText("Reduce Spending")).toBeDefined();
      expect(screen.getByText("Investment Opportunity")).toBeDefined();
    });

    it("displays recommendation messages", () => {
      render(<PerformanceRecommendationsTab recommendations={mockRecommendations} />);

      expect(screen.getByText("Consider saving 10% more each month")).toBeDefined();
      expect(screen.getByText("Review your subscription services")).toBeDefined();
      expect(screen.getByText("Consider increasing 401k contributions")).toBeDefined();
    });

    it("displays action when provided", () => {
      render(<PerformanceRecommendationsTab recommendations={mockRecommendations} />);

      expect(screen.getByText("🎯 Review budget")).toBeDefined();
      expect(screen.getByText("🎯 Consult advisor")).toBeDefined();
    });

    it("does not display action when not provided", () => {
      render(<PerformanceRecommendationsTab recommendations={mockRecommendations} />);

      const firstRecommendation = screen
        .getByText("Consider saving 10% more each month")
        .closest("div");
      expect(firstRecommendation?.textContent).not.toContain("🎯");
    });

    it("renders icons for each recommendation", () => {
      render(<PerformanceRecommendationsTab recommendations={mockRecommendations} />);

      const icons = screen.getAllByTestId("icon");
      // 3 recommendation icons
      expect(icons.length).toBe(3);
    });
  });

  describe("Recommendation Types", () => {
    it("handles saving type recommendations", () => {
      const recommendations: Recommendation[] = [
        {
          id: "1",
          type: "saving",
          title: "Save More",
          description: "Increase savings",
          impact: "high",
          message: "Save 10% more",
        },
      ];

      render(<PerformanceRecommendationsTab recommendations={recommendations} />);
      expect(screen.getByText("Save More")).toBeDefined();
    });

    it("handles spending type recommendations", () => {
      const recommendations: Recommendation[] = [
        {
          id: "1",
          type: "spending",
          title: "Spend Less",
          description: "Reduce spending",
          impact: "medium",
          message: "Cut expenses",
        },
      ];

      render(<PerformanceRecommendationsTab recommendations={recommendations} />);
      expect(screen.getByText("Spend Less")).toBeDefined();
    });

    it("handles investment type recommendations", () => {
      const recommendations: Recommendation[] = [
        {
          id: "1",
          type: "investment",
          title: "Invest More",
          description: "Increase investments",
          impact: "high",
          message: "Invest in stocks",
        },
      ];

      render(<PerformanceRecommendationsTab recommendations={recommendations} />);
      expect(screen.getByText("Invest More")).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    it("handles single recommendation", () => {
      const recommendations: Recommendation[] = [
        {
          id: "1",
          type: "saving",
          title: "Single Recommendation",
          description: "Test",
          impact: "low",
          message: "This is a single recommendation",
        },
      ];

      render(<PerformanceRecommendationsTab recommendations={recommendations} />);
      expect(screen.getByText("Single Recommendation")).toBeDefined();
      expect(screen.getByText("This is a single recommendation")).toBeDefined();
    });

    it("handles recommendations with very long messages", () => {
      const recommendations: Recommendation[] = [
        {
          id: "1",
          type: "saving",
          title: "Long Message",
          description: "Test",
          impact: "medium",
          message:
            "This is a very long recommendation message that contains a lot of text to test how the component handles lengthy content and ensures proper rendering without breaking the layout or causing any visual issues.",
        },
      ];

      render(<PerformanceRecommendationsTab recommendations={recommendations} />);
      expect(screen.getByText(/This is a very long recommendation message/)).toBeDefined();
    });

    it("handles recommendations with special characters in title", () => {
      const recommendations: Recommendation[] = [
        {
          id: "1",
          type: "saving",
          title: "Save $100 & More!",
          description: "Special chars",
          impact: "low",
          message: "Test message",
        },
      ];

      render(<PerformanceRecommendationsTab recommendations={recommendations} />);
      expect(screen.getByText("Save $100 & More!")).toBeDefined();
    });

    it("handles recommendations with empty action strings", () => {
      const recommendations: Recommendation[] = [
        {
          id: "1",
          type: "saving",
          title: "Test",
          description: "Test",
          impact: "low",
          message: "Test message",
          action: "",
        },
      ];

      render(<PerformanceRecommendationsTab recommendations={recommendations} />);
      // Empty action should not render
      expect(screen.queryByText("🎯")).toBeNull();
    });

    it("handles recommendations with all optional fields present", () => {
      const recommendations: Recommendation[] = [
        {
          id: "1",
          type: "saving",
          title: "Complete Recommendation",
          description: "Full details",
          impact: "critical",
          message: "This has all fields",
          action: "Take action now",
          customField: "Extra data",
        },
      ];

      render(<PerformanceRecommendationsTab recommendations={recommendations} />);
      expect(screen.getByText("Complete Recommendation")).toBeDefined();
      expect(screen.getByText("This has all fields")).toBeDefined();
      expect(screen.getByText("🎯 Take action now")).toBeDefined();
    });
  });

  describe("Styling and Layout", () => {
    it("applies correct container styling", () => {
      const recommendations: Recommendation[] = [
        {
          id: "1",
          type: "saving",
          title: "Test",
          description: "Test",
          impact: "low",
          message: "Test",
        },
      ];

      const { container } = render(
        <PerformanceRecommendationsTab recommendations={recommendations} />
      );
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv.className).toContain("space-y-3");
    });

    it("applies correct recommendation card styling", () => {
      const recommendations: Recommendation[] = [
        {
          id: "1",
          type: "saving",
          title: "Test Card",
          description: "Test",
          impact: "low",
          message: "Check styling",
        },
      ];

      render(<PerformanceRecommendationsTab recommendations={recommendations} />);
      const card = screen.getByText("Test Card").closest("div")?.parentElement;
      expect(card?.className).toContain("bg-white/60");
      expect(card?.className).toContain("rounded-lg");
      expect(card?.className).toContain("border");
    });

    it("applies correct action styling", () => {
      const recommendations: Recommendation[] = [
        {
          id: "1",
          type: "saving",
          title: "Test",
          description: "Test",
          impact: "low",
          message: "Test",
          action: "Check style",
        },
      ];

      render(<PerformanceRecommendationsTab recommendations={recommendations} />);
      const actionElement = screen.getByText("🎯 Check style");
      expect(actionElement.className).toContain("text-purple-600");
      expect(actionElement.className).toContain("font-medium");
    });
  });

  describe("Multiple Recommendations Rendering", () => {
    it("renders many recommendations without errors", () => {
      const manyRecommendations: Recommendation[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        type: i % 2 === 0 ? "saving" : "spending",
        title: `Recommendation ${i + 1}`,
        description: `Description ${i + 1}`,
        impact: "medium",
        message: `Message ${i + 1}`,
        action: i % 3 === 0 ? `Action ${i + 1}` : undefined,
      }));

      render(<PerformanceRecommendationsTab recommendations={manyRecommendations} />);

      expect(screen.getByText("Recommendation 1")).toBeDefined();
      expect(screen.getByText("Recommendation 10")).toBeDefined();
    });

    it("maintains proper spacing between recommendations", () => {
      const recommendations: Recommendation[] = [
        {
          id: "1",
          type: "saving",
          title: "First",
          description: "Test",
          impact: "low",
          message: "First recommendation",
        },
        {
          id: "2",
          type: "spending",
          title: "Second",
          description: "Test",
          impact: "low",
          message: "Second recommendation",
        },
      ];

      const { container } = render(
        <PerformanceRecommendationsTab recommendations={recommendations} />
      );
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv.className).toContain("space-y-3");
    });
  });
});
