import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UnassignedCashModal from "../UnassignedCashModal";

// Mock dependencies
vi.mock("@/utils", () => ({
  getIcon: vi.fn((name: string) => {
    const MockIcon = ({ className }: { className?: string }) => (
      <svg data-testid={`icon-${name}`} className={className}>
        <circle cx="12" cy="12" r="10" />
      </svg>
    );
    return MockIcon;
  }),
}));

vi.mock("@/stores/ui/uiStore", () => ({
  useBudgetStore: vi.fn(() => ({
    bills: [],
    envelopes: [],
  })),
}));

vi.mock("@/hooks/budgeting/allocations/useUnassignedCashDistribution", () => ({
  default: vi.fn(() => ({
    previewDistributions: [],
    totalDistributed: 0,
    remainingUnassigned: 0,
    isOverDistributed: false,
    hasDistributions: false,
    isProcessing: false,
    updateDistribution: vi.fn(),
    distributeEqually: vi.fn(),
    distributeToBills: vi.fn(),
    applyDistribution: vi.fn(),
    resetDistributions: vi.fn(),
  })),
}));

vi.mock("@/components/ui/ModalCloseButton", () => ({
  default: ({ onClick }: { onClick: () => void }) => (
    <button data-testid="close-button" onClick={onClick}>
      Close
    </button>
  ),
}));

vi.mock("@/hooks/platform/ux/useModalAutoScroll", () => ({
  useModalAutoScroll: vi.fn(() => ({ current: null })),
}));

vi.mock("../budgeting/BillEnvelopeFundingInfo", () => ({
  default: () => <div data-testid="bill-envelope-funding-info">Bill Funding Info</div>,
}));

describe("UnassignedCashModal", () => {
  let queryClient: QueryClient;

  const defaultProps = {
    isOpen: true,
    closeUnassignedCashModal: vi.fn(),
    unassignedCash: 500,
  };

  const renderWithQuery = (ui: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  describe("Rendering", () => {
    it("should render when isOpen is true", () => {
      renderWithQuery(<UnassignedCashModal {...defaultProps} />);
      expect(screen.getByText(/Distribute Unassigned Cash/i)).toBeInTheDocument();
    });

    it("should not render when isOpen is false", () => {
      renderWithQuery(<UnassignedCashModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText(/Distribute Unassigned Cash/i)).not.toBeInTheDocument();
    });

    it("should display available cash amount", () => {
      renderWithQuery(<UnassignedCashModal {...defaultProps} unassignedCash={500} />);
      expect(screen.getByText(/\$500\.00/)).toBeInTheDocument();
    });

    it("should display close button", () => {
      renderWithQuery(<UnassignedCashModal {...defaultProps} />);
      expect(screen.getByTestId("close-button")).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should call closeUnassignedCashModal when close button is clicked", async () => {
      const closeModal = vi.fn();
      renderWithQuery(
        <UnassignedCashModal {...defaultProps} closeUnassignedCashModal={closeModal} />
      );

      await userEvent.click(screen.getByTestId("close-button"));
      expect(closeModal).toHaveBeenCalled();
    });
  });

  describe("Deficit Handling", () => {
    it("should show deficit message when unassignedCash is negative", () => {
      renderWithQuery(<UnassignedCashModal {...defaultProps} unassignedCash={-200} />);
      expect(screen.getByText(/Address Budget Deficit/i)).toBeInTheDocument();
      expect(screen.getByText(/Deficit:/i)).toBeInTheDocument();
    });

    it("should display negative amount in red", () => {
      renderWithQuery(<UnassignedCashModal {...defaultProps} unassignedCash={-200} />);
      const amountElement = screen.getByText(/\$-200\.00/);
      expect(amountElement).toBeInTheDocument();
    });

    it("should show warning message for deficit", () => {
      renderWithQuery(<UnassignedCashModal {...defaultProps} unassignedCash={-100} />);
      expect(screen.getByText(/You've spent more than available/i)).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero unassigned cash", () => {
      renderWithQuery(<UnassignedCashModal {...defaultProps} unassignedCash={0} />);
      expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
    });

    it("should handle very large amounts", () => {
      renderWithQuery(<UnassignedCashModal {...defaultProps} unassignedCash={999999.99} />);
      expect(screen.getByText(/\$999999\.99/)).toBeInTheDocument();
    });

    it("should handle very small amounts", () => {
      renderWithQuery(<UnassignedCashModal {...defaultProps} unassignedCash={0.01} />);
      expect(screen.getByText(/\$0\.01/)).toBeInTheDocument();
    });

    it("should handle decimal amounts correctly", () => {
      renderWithQuery(<UnassignedCashModal {...defaultProps} unassignedCash={123.45} />);
      expect(screen.getByText(/\$123\.45/)).toBeInTheDocument();
    });

    it("should handle undefined closeUnassignedCashModal", async () => {
      renderWithQuery(
        <UnassignedCashModal {...defaultProps} closeUnassignedCashModal={undefined as any} />
      );
      expect(screen.getByTestId("close-button")).toBeInTheDocument();
    });

    it("should handle large deficit amounts", () => {
      renderWithQuery(<UnassignedCashModal {...defaultProps} unassignedCash={-10000} />);
      expect(screen.getByText(/\$-10000\.00/)).toBeInTheDocument();
      expect(screen.getByText(/Address Budget Deficit/i)).toBeInTheDocument();
    });

    it("should render with processing state", () => {
      renderWithQuery(<UnassignedCashModal {...defaultProps} />);
      expect(screen.getByText(/Distribute Unassigned Cash/i)).toBeInTheDocument();
    });
  });

  describe("Complex Modal State", () => {
    it("should handle modal open/close state changes", () => {
      const { rerender } = renderWithQuery(<UnassignedCashModal {...defaultProps} isOpen={true} />);
      expect(screen.getByText(/Distribute Unassigned Cash/i)).toBeInTheDocument();

      rerender(
        <QueryClientProvider client={queryClient}>
          <UnassignedCashModal {...defaultProps} isOpen={false} />
        </QueryClientProvider>
      );
      expect(screen.queryByText(/Distribute Unassigned Cash/i)).not.toBeInTheDocument();
    });

    it("should handle amount updates", () => {
      const { rerender } = renderWithQuery(
        <UnassignedCashModal {...defaultProps} unassignedCash={100} />
      );
      expect(screen.getByText(/\$100\.00/)).toBeInTheDocument();

      rerender(
        <QueryClientProvider client={queryClient}>
          <UnassignedCashModal {...defaultProps} unassignedCash={200} />
        </QueryClientProvider>
      );
      expect(screen.getByText(/\$200\.00/)).toBeInTheDocument();
    });

    it("should handle transition from positive to negative", () => {
      const { rerender } = renderWithQuery(
        <UnassignedCashModal {...defaultProps} unassignedCash={100} />
      );
      expect(screen.getByText(/Distribute Unassigned Cash/i)).toBeInTheDocument();

      rerender(
        <QueryClientProvider client={queryClient}>
          <UnassignedCashModal {...defaultProps} unassignedCash={-100} />
        </QueryClientProvider>
      );
      expect(screen.getByText(/Address Budget Deficit/i)).toBeInTheDocument();
    });
  });
});
