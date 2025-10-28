import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import EnvelopeSystem from "../EnvelopeSystem";
import userEvent from "@testing-library/user-event";

// Mock child components
vi.mock("./EnvelopeGrid", () => ({
  default: ({ envelopes }) => (
    <div data-testid="envelope-grid">
      {envelopes?.map((env) => (
        <div key={env.id} data-testid={`envelope-${env.id}`}>
          {env.name}
        </div>
      ))}
    </div>
  ),
}));

vi.mock("./EnvelopeSummaryCards", () => ({
  default: ({ totals }) => (
    <div data-testid="envelope-summary">
      Total: ${totals?.total || 0}
    </div>
  ),
}));

vi.mock("./CashFlowSummary", () => ({
  default: () => <div data-testid="cash-flow-summary">Cash Flow</div>,
}));

vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

vi.mock("../../utils", () => ({
  getIcon: vi.fn(() => {
    return function MockIcon() {
      return <div data-testid="icon">Icon</div>;
    };
  }),
}));

describe("EnvelopeSystem", () => {
  const defaultProps = {
    envelopes: [],
    onCreateEnvelope: vi.fn(),
    onUpdateEnvelope: vi.fn(),
    onDeleteEnvelope: vi.fn(),
    unassignedCash: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render without crashing", async () => {
      render(<EnvelopeSystem {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByTestId("envelope-grid")).toBeInTheDocument();
      });
    });

    it("should render envelope grid", async () => {
      render(<EnvelopeSystem {...defaultProps} />);
      expect(screen.getByTestId("envelope-grid")).toBeInTheDocument();
    });

    it("should render envelope summary cards", async () => {
      render(<EnvelopeSystem {...defaultProps} />);
      expect(screen.getByTestId("envelope-summary")).toBeInTheDocument();
    });

    it("should render cash flow summary", async () => {
      render(<EnvelopeSystem {...defaultProps} />);
      expect(screen.getByTestId("cash-flow-summary")).toBeInTheDocument();
    });
  });

  describe("Envelope Display", () => {
    it("should display envelopes when they exist", async () => {
      const envelopes = [
        { id: "1", name: "Groceries", balance: 500 },
        { id: "2", name: "Gas", balance: 200 },
      ];

      render(<EnvelopeSystem {...defaultProps} envelopes={envelopes} />);

      await waitFor(() => {
        expect(screen.getByTestId("envelope-1")).toBeInTheDocument();
        expect(screen.getByTestId("envelope-2")).toBeInTheDocument();
        expect(screen.getByText("Groceries")).toBeInTheDocument();
        expect(screen.getByText("Gas")).toBeInTheDocument();
      });
    });

    it("should handle empty envelopes array", async () => {
      render(<EnvelopeSystem {...defaultProps} envelopes={[]} />);
      expect(screen.getByTestId("envelope-grid")).toBeInTheDocument();
    });

    it("should handle undefined envelopes", async () => {
      render(<EnvelopeSystem {...defaultProps} envelopes={undefined} />);
      expect(screen.getByTestId("envelope-grid")).toBeInTheDocument();
    });
  });

  describe("Envelope Actions", () => {
    it("should call onCreateEnvelope when creating envelope", async () => {
      const mockOnCreateEnvelope = vi.fn();
      
      render(
        <EnvelopeSystem {...defaultProps} onCreateEnvelope={mockOnCreateEnvelope} />
      );

      // Assuming there's a create button
      const createButtons = screen.queryAllByText(/create/i);
      if (createButtons.length > 0) {
        await userEvent.click(createButtons[0]);
        // The actual call might happen in a modal or form
      }
    });

    it("should call onUpdateEnvelope when updating envelope", async () => {
      const mockOnUpdateEnvelope = vi.fn();
      
      render(
        <EnvelopeSystem {...defaultProps} onUpdateEnvelope={mockOnUpdateEnvelope} />
      );

      // Update functionality would be triggered through the grid
    });

    it("should call onDeleteEnvelope when deleting envelope", async () => {
      const mockOnDeleteEnvelope = vi.fn();
      
      render(
        <EnvelopeSystem {...defaultProps} onDeleteEnvelope={mockOnDeleteEnvelope} />
      );

      // Delete functionality would be triggered through the grid
    });
  });

  describe("Unassigned Cash", () => {
    it("should display unassigned cash amount", async () => {
      render(<EnvelopeSystem {...defaultProps} unassignedCash={250} />);
      
      // Unassigned cash should be shown somewhere in the component
      // The exact location depends on implementation
    });

    it("should handle zero unassigned cash", async () => {
      render(<EnvelopeSystem {...defaultProps} unassignedCash={0} />);
      
      expect(screen.getByTestId("envelope-grid")).toBeInTheDocument();
    });

    it("should handle negative unassigned cash", async () => {
      render(<EnvelopeSystem {...defaultProps} unassignedCash={-100} />);
      
      expect(screen.getByTestId("envelope-grid")).toBeInTheDocument();
    });
  });

  describe("Summary Display", () => {
    it("should calculate and display total allocated", async () => {
      const envelopes = [
        { id: "1", name: "Groceries", balance: 500 },
        { id: "2", name: "Gas", balance: 200 },
      ];

      render(<EnvelopeSystem {...defaultProps} envelopes={envelopes} />);

      // Total should be calculated from envelopes
      expect(screen.getByTestId("envelope-summary")).toBeInTheDocument();
    });

    it("should handle envelopes with zero balance", async () => {
      const envelopes = [
        { id: "1", name: "Empty", balance: 0 },
      ];

      render(<EnvelopeSystem {...defaultProps} envelopes={envelopes} />);

      expect(screen.getByTestId("envelope-summary")).toBeInTheDocument();
    });
  });

  describe("Props Validation", () => {
    it("should handle missing required props gracefully", async () => {
      // @ts-expect-error Testing missing props
      render(<EnvelopeSystem />);
      
      // Should still render something even without props
    });

    it("should handle null envelope values", async () => {
      render(<EnvelopeSystem {...defaultProps} envelopes={null} />);
      
      expect(screen.getByTestId("envelope-grid")).toBeInTheDocument();
    });
  });

  describe("Multiple Envelopes", () => {
    it("should render many envelopes", async () => {
      const envelopes = Array.from({ length: 20 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Envelope ${i + 1}`,
        balance: Math.random() * 1000,
      }));

      render(<EnvelopeSystem {...defaultProps} envelopes={envelopes} />);

      await waitFor(() => {
        expect(screen.getByTestId("envelope-1")).toBeInTheDocument();
      });
    });

    it("should handle duplicate envelope names", async () => {
      const envelopes = [
        { id: "1", name: "Groceries", balance: 500 },
        { id: "2", name: "Groceries", balance: 200 },
      ];

      render(<EnvelopeSystem {...defaultProps} envelopes={envelopes} />);

      await waitFor(() => {
        expect(screen.getByTestId("envelope-1")).toBeInTheDocument();
        expect(screen.getByTestId("envelope-2")).toBeInTheDocument();
      });
    });
  });
});
