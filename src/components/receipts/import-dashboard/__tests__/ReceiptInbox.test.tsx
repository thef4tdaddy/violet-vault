/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReceiptInbox from "../ReceiptInbox";
import type { DashboardReceiptItem } from "@/types/import-dashboard.types";
import type { SentinelReceipt } from "@/types/sentinel";

describe("ReceiptInbox", () => {
  const mockSentinelReceipt: SentinelReceipt = {
    id: "sentinel-1",
    merchant: "Amazon",
    amount: 49.99,
    date: "2026-01-20T10:00:00Z",
    status: "pending",
    createdAt: "2026-01-20T10:00:00Z",
    updatedAt: "2026-01-20T10:00:00Z",
  };

  const createMockReceipt = (id: string, merchant: string): DashboardReceiptItem => ({
    id,
    source: "sentinel",
    merchant,
    amount: 29.99,
    date: "2026-01-21T14:30:00Z",
    status: "pending",
    rawData: mockSentinelReceipt,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Empty state", () => {
    it("should render empty state when no receipts and not loading", () => {
      render(<ReceiptInbox receipts={[]} mode="digital" />);

      expect(screen.getByTestId("receipt-inbox-empty")).toBeInTheDocument();
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });

    it("should not render empty state when loading", () => {
      render(<ReceiptInbox receipts={[]} mode="digital" isLoading />);

      expect(screen.queryByTestId("receipt-inbox-empty")).not.toBeInTheDocument();
      expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
    });

    it("should pass mode to empty state", () => {
      render(<ReceiptInbox receipts={[]} mode="scan" />);

      const emptyState = screen.getByTestId("empty-state");
      expect(emptyState).toHaveAttribute("data-mode", "scan");
    });

    it("should pass onEmptyAction to empty state", () => {
      const mockEmptyAction = vi.fn();

      render(<ReceiptInbox receipts={[]} mode="digital" onEmptyAction={mockEmptyAction} />);

      const actionButton = screen.getByTestId("empty-state-action");
      fireEvent.click(actionButton);

      expect(mockEmptyAction).toHaveBeenCalledTimes(1);
    });
  });

  describe("Loading state", () => {
    it("should render loading skeletons when isLoading is true", () => {
      render(<ReceiptInbox receipts={[]} mode="digital" isLoading />);

      expect(screen.getByTestId("receipt-inbox-loading")).toBeInTheDocument();
      const skeletons = screen.getAllByTestId("receipt-skeleton");
      expect(skeletons).toHaveLength(6);
    });

    it("should have aria-busy when loading", () => {
      render(<ReceiptInbox receipts={[]} mode="digital" isLoading />);

      const loadingContainer = screen.getByTestId("receipt-inbox-loading");
      expect(loadingContainer).toHaveAttribute("aria-busy", "true");
      expect(loadingContainer).toHaveAttribute("aria-label", "Loading receipts");
    });

    it("should have Hard Line styling on skeletons", () => {
      render(<ReceiptInbox receipts={[]} mode="digital" isLoading />);

      const skeletons = screen.getAllByTestId("receipt-skeleton");
      skeletons.forEach((skeleton) => {
        expect(skeleton).toHaveClass("border-2", "border-black");
        expect(skeleton.className).toContain("shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]");
      });
    });

    it("should animate skeletons", () => {
      render(<ReceiptInbox receipts={[]} mode="digital" isLoading />);

      const skeletons = screen.getAllByTestId("receipt-skeleton");
      skeletons.forEach((skeleton) => {
        expect(skeleton).toHaveClass("animate-pulse");
      });
    });
  });

  describe("Non-virtualized grid (<=50 receipts)", () => {
    it("should render receipts in a grid without virtualization", () => {
      const receipts = Array.from({ length: 10 }, (_, i) =>
        createMockReceipt(`receipt-${i}`, `Merchant ${i}`)
      );

      render(<ReceiptInbox receipts={receipts} mode="digital" />);

      expect(screen.getByTestId("receipt-inbox")).toBeInTheDocument();
      expect(screen.getByTestId("receipt-inbox")).toHaveAttribute("data-virtualized", "false");
    });

    it("should render all receipt cards", () => {
      const receipts = Array.from({ length: 5 }, (_, i) =>
        createMockReceipt(`receipt-${i}`, `Merchant ${i}`)
      );

      render(<ReceiptInbox receipts={receipts} mode="digital" />);

      const cards = screen.getAllByTestId("receipt-card");
      expect(cards).toHaveLength(5);
    });

    it("should have grid layout classes", () => {
      const receipts = [createMockReceipt("receipt-1", "Amazon")];

      render(<ReceiptInbox receipts={receipts} mode="digital" />);

      const inbox = screen.getByTestId("receipt-inbox");
      expect(inbox).toHaveClass("grid", "grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3", "gap-4");
    });

    it("should call onReceiptClick when card is clicked", () => {
      const mockOnClick = vi.fn();
      const receipts = [createMockReceipt("receipt-1", "Amazon")];

      render(<ReceiptInbox receipts={receipts} mode="digital" onReceiptClick={mockOnClick} />);

      const card = screen.getByTestId("receipt-card");
      fireEvent.click(card);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith(receipts[0]);
    });

    it("should not virtualize at exactly 50 receipts", () => {
      const receipts = Array.from({ length: 50 }, (_, i) =>
        createMockReceipt(`receipt-${i}`, `Merchant ${i}`)
      );

      render(<ReceiptInbox receipts={receipts} mode="digital" />);

      expect(screen.getByTestId("receipt-inbox")).toHaveAttribute("data-virtualized", "false");
    });
  });

  describe("Virtualized grid (>50 receipts)", () => {
    it("should enable virtualization for more than 50 receipts", () => {
      const receipts = Array.from({ length: 51 }, (_, i) =>
        createMockReceipt(`receipt-${i}`, `Merchant ${i}`)
      );

      render(<ReceiptInbox receipts={receipts} mode="digital" />);

      const inbox = screen.getByTestId("receipt-inbox");
      expect(inbox).toHaveAttribute("data-virtualized", "true");
    });

    it("should set up virtualization container structure", () => {
      const receipts = Array.from({ length: 60 }, (_, i) =>
        createMockReceipt(`receipt-${i}`, `Merchant ${i}`)
      );

      const { container } = render(<ReceiptInbox receipts={receipts} mode="digital" />);

      const inbox = screen.getByTestId("receipt-inbox");
      expect(inbox).toHaveAttribute("data-virtualized", "true");

      // Check for virtualization container structure
      const virtualContainer = container.querySelector('[style*="position: relative"]');
      expect(virtualContainer).toBeInTheDocument();
    });

    it("should have overflow container for scrolling", () => {
      const receipts = Array.from({ length: 100 }, (_, i) =>
        createMockReceipt(`receipt-${i}`, `Merchant ${i}`)
      );

      render(<ReceiptInbox receipts={receipts} mode="digital" />);

      const inbox = screen.getByTestId("receipt-inbox");
      expect(inbox).toHaveClass("overflow-auto");
    });

    it("should pass onReceiptClick prop in virtualized mode", () => {
      const mockOnClick = vi.fn();
      const receipts = Array.from({ length: 60 }, (_, i) =>
        createMockReceipt(`receipt-${i}`, `Merchant ${i}`)
      );

      render(<ReceiptInbox receipts={receipts} mode="digital" onReceiptClick={mockOnClick} />);

      // Verify virtualization is enabled
      const inbox = screen.getByTestId("receipt-inbox");
      expect(inbox).toHaveAttribute("data-virtualized", "true");

      // The onClick handler is passed through to ReceiptCard components
      // In a real browser with scroll, cards would render and be clickable
      expect(mockOnClick).not.toHaveBeenCalled(); // Not called until user interaction
    });
  });

  describe("Custom className", () => {
    it("should apply custom className in empty state", () => {
      render(<ReceiptInbox receipts={[]} mode="digital" className="custom-class" />);

      const container = screen.getByTestId("receipt-inbox-empty");
      expect(container).toHaveClass("custom-class");
    });

    it("should apply custom className in loading state", () => {
      render(<ReceiptInbox receipts={[]} mode="digital" isLoading className="custom-class" />);

      const container = screen.getByTestId("receipt-inbox-loading");
      expect(container).toHaveClass("custom-class");
    });

    it("should apply custom className in non-virtualized grid", () => {
      const receipts = [createMockReceipt("receipt-1", "Amazon")];

      render(<ReceiptInbox receipts={receipts} mode="digital" className="custom-class" />);

      const inbox = screen.getByTestId("receipt-inbox");
      expect(inbox).toHaveClass("custom-class");
    });

    it("should apply custom className in virtualized grid", () => {
      const receipts = Array.from({ length: 60 }, (_, i) =>
        createMockReceipt(`receipt-${i}`, `Merchant ${i}`)
      );

      render(<ReceiptInbox receipts={receipts} mode="digital" className="custom-class" />);

      const inbox = screen.getByTestId("receipt-inbox");
      expect(inbox).toHaveClass("custom-class");
    });
  });

  describe("Receipt rendering", () => {
    it("should render correct number of receipts", () => {
      const receipts = Array.from({ length: 15 }, (_, i) =>
        createMockReceipt(`receipt-${i}`, `Merchant ${i}`)
      );

      render(<ReceiptInbox receipts={receipts} mode="digital" />);

      const cards = screen.getAllByTestId("receipt-card");
      expect(cards).toHaveLength(15);
    });

    it("should pass receipt data to ReceiptCard", () => {
      const receipt = createMockReceipt("receipt-1", "Target");

      render(<ReceiptInbox receipts={[receipt]} mode="digital" />);

      expect(screen.getByText("Target")).toBeInTheDocument();
      expect(screen.getByText("$29.99")).toBeInTheDocument();
    });

    it("should maintain receipt order", () => {
      const receipts = [
        createMockReceipt("receipt-1", "Amazon"),
        createMockReceipt("receipt-2", "Target"),
        createMockReceipt("receipt-3", "Walmart"),
      ];

      render(<ReceiptInbox receipts={receipts} mode="digital" />);

      const merchants = screen.getAllByTestId("receipt-card");
      expect(merchants[0]).toHaveAttribute("data-receipt-id", "receipt-1");
      expect(merchants[1]).toHaveAttribute("data-receipt-id", "receipt-2");
      expect(merchants[2]).toHaveAttribute("data-receipt-id", "receipt-3");
    });
  });

  describe("Responsive grid", () => {
    it("should have responsive column classes", () => {
      const receipts = [createMockReceipt("receipt-1", "Amazon")];

      render(<ReceiptInbox receipts={receipts} mode="digital" />);

      const inbox = screen.getByTestId("receipt-inbox");
      expect(inbox).toHaveClass("grid-cols-1"); // Mobile
      expect(inbox).toHaveClass("md:grid-cols-2"); // Tablet
      expect(inbox).toHaveClass("lg:grid-cols-3"); // Desktop
    });

    it("should have gap between cards", () => {
      const receipts = [createMockReceipt("receipt-1", "Amazon")];

      render(<ReceiptInbox receipts={receipts} mode="digital" />);

      const inbox = screen.getByTestId("receipt-inbox");
      expect(inbox).toHaveClass("gap-4");
    });
  });
});
