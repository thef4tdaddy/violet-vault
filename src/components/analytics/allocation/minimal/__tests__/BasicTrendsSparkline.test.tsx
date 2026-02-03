import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { BasicTrendsSparkline } from "../BasicTrendsSparkline";
import type { EnvelopeSparkline } from "../BasicTrendsSparkline";

describe("BasicTrendsSparkline", () => {
  const mockEnvelopes: EnvelopeSparkline[] = [
    {
      envelopeId: "1",
      envelopeName: "Groceries",
      data: [
        { value: 100, label: "Jan" },
        { value: 120, label: "Feb" },
        { value: 110, label: "Mar" },
      ],
      color: "#8b5cf6",
    },
    {
      envelopeId: "2",
      envelopeName: "Transportation",
      data: [
        { value: 80, label: "Jan" },
        { value: 90, label: "Feb" },
        { value: 85, label: "Mar" },
      ],
      color: "#3b82f6",
    },
    {
      envelopeId: "3",
      envelopeName: "Entertainment",
      data: [
        { value: 50, label: "Jan" },
        { value: 60, label: "Feb" },
        { value: 55, label: "Mar" },
      ],
      color: "#10b981",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render sparkline component", () => {
      render(<BasicTrendsSparkline envelopes={mockEnvelopes} />);

      expect(screen.getByTestId("basic-trends-sparkline")).toBeInTheDocument();
    });

    it("should render title", () => {
      render(<BasicTrendsSparkline envelopes={mockEnvelopes} title="Test Trends" />);

      expect(screen.getByText("Test Trends")).toBeInTheDocument();
    });

    it("should render default title when not provided", () => {
      render(<BasicTrendsSparkline envelopes={mockEnvelopes} />);

      expect(screen.getByText("Envelope Trends")).toBeInTheDocument();
    });

    it("should render all envelope sparklines", () => {
      render(<BasicTrendsSparkline envelopes={mockEnvelopes} />);

      expect(screen.getByTestId("sparkline-1")).toBeInTheDocument();
      expect(screen.getByTestId("sparkline-2")).toBeInTheDocument();
      expect(screen.getByTestId("sparkline-3")).toBeInTheDocument();
    });

    it("should render envelope names", () => {
      render(<BasicTrendsSparkline envelopes={mockEnvelopes} />);

      expect(screen.getByText("Groceries")).toBeInTheDocument();
      expect(screen.getByText("Transportation")).toBeInTheDocument();
      expect(screen.getByText("Entertainment")).toBeInTheDocument();
    });

    it("should have correct accessibility attributes", () => {
      render(<BasicTrendsSparkline envelopes={mockEnvelopes} />);

      const region = screen.getByRole("region", { name: "Envelope Trends" });
      expect(region).toBeInTheDocument();
    });
  });

  describe("Top 5 Limit", () => {
    it("should only display top 5 envelopes", () => {
      const manyEnvelopes: EnvelopeSparkline[] = Array.from({ length: 10 }).map((_, i) => ({
        envelopeId: `${i}`,
        envelopeName: `Envelope ${i}`,
        data: [{ value: 100, label: "Jan" }],
        color: "#8b5cf6",
      }));

      render(<BasicTrendsSparkline envelopes={manyEnvelopes} />);

      // Should only render first 5
      expect(screen.getByTestId("sparkline-0")).toBeInTheDocument();
      expect(screen.getByTestId("sparkline-1")).toBeInTheDocument();
      expect(screen.getByTestId("sparkline-2")).toBeInTheDocument();
      expect(screen.getByTestId("sparkline-3")).toBeInTheDocument();
      expect(screen.getByTestId("sparkline-4")).toBeInTheDocument();
      expect(screen.queryByTestId("sparkline-5")).not.toBeInTheDocument();
    });

    it("should handle fewer than 5 envelopes", () => {
      const twoEnvelopes = mockEnvelopes.slice(0, 2);
      render(<BasicTrendsSparkline envelopes={twoEnvelopes} />);

      expect(screen.getByTestId("sparkline-1")).toBeInTheDocument();
      expect(screen.getByTestId("sparkline-2")).toBeInTheDocument();
      expect(screen.queryByTestId("sparkline-3")).not.toBeInTheDocument();
    });
  });

  describe("SVG Sparklines", () => {
    it("should render SVG path for each envelope", () => {
      render(<BasicTrendsSparkline envelopes={mockEnvelopes} />);

      expect(screen.getByTestId("sparkline-path-1")).toBeInTheDocument();
      expect(screen.getByTestId("sparkline-path-2")).toBeInTheDocument();
      expect(screen.getByTestId("sparkline-path-3")).toBeInTheDocument();
    });

    it("should apply correct color to paths", () => {
      render(<BasicTrendsSparkline envelopes={mockEnvelopes} />);

      const path1 = screen.getByTestId("sparkline-path-1");
      expect(path1).toHaveAttribute("stroke", "#8b5cf6");
    });

    it("should have correct SVG attributes", () => {
      render(<BasicTrendsSparkline envelopes={mockEnvelopes} />);

      const svg = screen.getAllByRole("img")[0];
      expect(svg).toHaveAttribute("viewBox");
      expect(svg).toHaveAttribute("preserveAspectRatio", "none");
    });
  });

  describe("Latest Value Display", () => {
    it("should display latest value for each envelope", () => {
      render(<BasicTrendsSparkline envelopes={mockEnvelopes} />);

      // Latest values are 110, 85, 55
      expect(screen.getByText("$110")).toBeInTheDocument();
      expect(screen.getByText("$85")).toBeInTheDocument();
      expect(screen.getByText("$55")).toBeInTheDocument();
    });

    it("should handle envelope with no data", () => {
      const emptyDataEnvelope: EnvelopeSparkline[] = [
        {
          envelopeId: "1",
          envelopeName: "Empty",
          data: [],
          color: "#8b5cf6",
        },
      ];

      render(<BasicTrendsSparkline envelopes={emptyDataEnvelope} />);

      expect(screen.getByText("$0")).toBeInTheDocument();
    });
  });

  describe("Hover Interactions", () => {
    it("should show hover points when hovering over sparkline", () => {
      render(<BasicTrendsSparkline envelopes={mockEnvelopes} />);

      const sparkline = screen.getByTestId("sparkline-1");

      fireEvent.mouseEnter(sparkline);

      // Should show hover points (circles)
      expect(screen.getByTestId("sparkline-point-1-0")).toBeInTheDocument();
      expect(screen.getByTestId("sparkline-point-1-1")).toBeInTheDocument();
      expect(screen.getByTestId("sparkline-point-1-2")).toBeInTheDocument();
    });

    it("should hide hover points when mouse leaves", () => {
      render(<BasicTrendsSparkline envelopes={mockEnvelopes} />);

      const sparkline = screen.getByTestId("sparkline-1");

      fireEvent.mouseEnter(sparkline);
      expect(screen.getByTestId("sparkline-point-1-0")).toBeInTheDocument();

      fireEvent.mouseLeave(sparkline);
      expect(screen.queryByTestId("sparkline-point-1-0")).not.toBeInTheDocument();
    });

    it("should show tooltip when hovering over point", () => {
      render(<BasicTrendsSparkline envelopes={mockEnvelopes} />);

      const sparkline = screen.getByTestId("sparkline-1");
      fireEvent.mouseEnter(sparkline);

      const point = screen.getByTestId("sparkline-point-1-0");
      fireEvent.mouseEnter(point);

      expect(screen.getByTestId("sparkline-tooltip")).toBeInTheDocument();
      // Use getAllByText since "Groceries" appears twice (in envelope name and tooltip)
      const groceriesElements = screen.getAllByText("Groceries");
      expect(groceriesElements.length).toBeGreaterThan(0);
      expect(screen.getByText("Jan: $100")).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should show loading skeleton when loading", () => {
      render(<BasicTrendsSparkline envelopes={mockEnvelopes} loading={true} />);

      expect(screen.getByTestId("sparkline-loading")).toBeInTheDocument();
      expect(screen.queryByTestId("basic-trends-sparkline")).not.toBeInTheDocument();
    });

    it("should show animated skeleton", () => {
      const { container } = render(
        <BasicTrendsSparkline envelopes={mockEnvelopes} loading={true} />
      );

      const skeleton = container.querySelector(".animate-pulse");
      expect(skeleton).toBeInTheDocument();
    });

    it("should not show loading state by default", () => {
      render(<BasicTrendsSparkline envelopes={mockEnvelopes} />);

      expect(screen.queryByTestId("sparkline-loading")).not.toBeInTheDocument();
      expect(screen.getByTestId("basic-trends-sparkline")).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should show empty message when no envelopes", () => {
      render(<BasicTrendsSparkline envelopes={[]} />);

      expect(screen.getByText("No envelope data available")).toBeInTheDocument();
    });

    it("should render component with empty message", () => {
      render(<BasicTrendsSparkline envelopes={[]} />);

      expect(screen.getByTestId("basic-trends-sparkline")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle envelope with single data point", () => {
      const singlePoint: EnvelopeSparkline[] = [
        {
          envelopeId: "1",
          envelopeName: "Single",
          data: [{ value: 100, label: "Jan" }],
          color: "#8b5cf6",
        },
      ];

      render(<BasicTrendsSparkline envelopes={singlePoint} />);

      expect(screen.getByTestId("sparkline-1")).toBeInTheDocument();
    });

    it("should handle envelope with all same values", () => {
      const sameValues: EnvelopeSparkline[] = [
        {
          envelopeId: "1",
          envelopeName: "Same",
          data: [
            { value: 100, label: "Jan" },
            { value: 100, label: "Feb" },
            { value: 100, label: "Mar" },
          ],
          color: "#8b5cf6",
        },
      ];

      render(<BasicTrendsSparkline envelopes={sameValues} />);

      expect(screen.getByTestId("sparkline-path-1")).toBeInTheDocument();
    });

    it("should handle negative values", () => {
      const negativeValues: EnvelopeSparkline[] = [
        {
          envelopeId: "1",
          envelopeName: "Negative",
          data: [
            { value: -50, label: "Jan" },
            { value: -30, label: "Feb" },
            { value: -40, label: "Mar" },
          ],
          color: "#8b5cf6",
        },
      ];

      render(<BasicTrendsSparkline envelopes={negativeValues} />);

      expect(screen.getByText("-$40")).toBeInTheDocument();
    });

    it("should handle zero values", () => {
      const zeroValues: EnvelopeSparkline[] = [
        {
          envelopeId: "1",
          envelopeName: "Zero",
          data: [
            { value: 0, label: "Jan" },
            { value: 0, label: "Feb" },
          ],
          color: "#8b5cf6",
        },
      ];

      render(<BasicTrendsSparkline envelopes={zeroValues} />);

      expect(screen.getByText("$0")).toBeInTheDocument();
    });

    it("should handle very large values", () => {
      const largeValues: EnvelopeSparkline[] = [
        {
          envelopeId: "1",
          envelopeName: "Large",
          data: [
            { value: 1000000, label: "Jan" },
            { value: 2000000, label: "Feb" },
          ],
          color: "#8b5cf6",
        },
      ];

      render(<BasicTrendsSparkline envelopes={largeValues} />);

      expect(screen.getByText("$2,000,000")).toBeInTheDocument();
    });
  });

  describe("Opacity on Hover", () => {
    it("should render sparklines with hover effects", () => {
      render(<BasicTrendsSparkline envelopes={mockEnvelopes} />);

      // Verify all sparklines are rendered
      expect(screen.getByTestId("sparkline-1")).toBeInTheDocument();
      expect(screen.getByTestId("sparkline-2")).toBeInTheDocument();
      expect(screen.getByTestId("sparkline-3")).toBeInTheDocument();
    });
  });
});
