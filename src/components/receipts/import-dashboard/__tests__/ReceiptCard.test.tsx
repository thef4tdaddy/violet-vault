/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from "@/test/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReceiptCard from "../ReceiptCard";
import type { DashboardReceiptItem } from "@/types/import-dashboard.types";
import type { SentinelReceipt } from "@/types/sentinel";

// Mock useOCRJobStatus hook
const mockUseOCRJobStatus = vi.fn(() => ({
  status: "idle",
  progress: 0,
  error: null,
}));

vi.mock("@/hooks/platform/receipts/useOCRJobStatus", () => ({
  useOCRJobStatus: mockUseOCRJobStatus,
}));

describe("ReceiptCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default idle state
    mockUseOCRJobStatus.mockReturnValue({
      status: "idle",
      progress: 0,
      error: null,
    });
  });
  const mockSentinelReceipt: SentinelReceipt = {
    id: "sentinel-1",
    merchant: "Amazon",
    amount: 49.99,
    date: "2026-01-20T10:00:00Z",
    status: "pending",
    createdAt: "2026-01-20T10:00:00Z",
    updatedAt: "2026-01-20T10:00:00Z",
  };

  const baseDashboardReceipt: DashboardReceiptItem = {
    id: "receipt-1",
    source: "sentinel",
    merchant: "Target",
    amount: 29.99,
    date: "2026-01-21T14:30:00Z",
    status: "pending",
    rawData: mockSentinelReceipt,
  };

  describe("Rendering", () => {
    it("should render receipt with all basic information", () => {
      render(<ReceiptCard receipt={baseDashboardReceipt} />);

      expect(screen.getByText("Target")).toBeInTheDocument();
      expect(screen.getByText("$29.99")).toBeInTheDocument();
      expect(screen.getByText("Jan 21, 2026")).toBeInTheDocument();
      expect(screen.getByText("PENDING")).toBeInTheDocument();
    });

    it("should display source badge for Sentinel receipts", () => {
      render(<ReceiptCard receipt={baseDashboardReceipt} />);

      expect(screen.getByText("DGTL")).toBeInTheDocument();
      expect(screen.getByLabelText("Source: sentinel")).toBeInTheDocument();
    });

    it("should display source badge for OCR receipts", () => {
      const ocrReceipt: DashboardReceiptItem = {
        ...baseDashboardReceipt,
        source: "ocr",
      };

      render(<ReceiptCard receipt={ocrReceipt} />);

      expect(screen.getByText("SCAN")).toBeInTheDocument();
      expect(screen.getByLabelText("Source: ocr")).toBeInTheDocument();
    });

    it("should render icons for merchant, amount, and date", () => {
      const { container } = render(<ReceiptCard receipt={baseDashboardReceipt} />);

      const icons = container.querySelectorAll("svg");
      expect(icons.length).toBeGreaterThanOrEqual(3); // Store, DollarSign, Calendar
    });

    it("should have proper aria-label", () => {
      render(<ReceiptCard receipt={baseDashboardReceipt} />);

      const card = screen.getByTestId("receipt-card");
      expect(card).toHaveAttribute("aria-label", "Receipt from Target for $29.99");
    });
  });

  describe("Status badges", () => {
    const statusTests: Array<{
      status: DashboardReceiptItem["status"];
      label: string;
      bgClass: string;
    }> = [
      { status: "pending", label: "PENDING", bgClass: "bg-amber-100" },
      { status: "matched", label: "MATCHED", bgClass: "bg-green-100" },
      { status: "ignored", label: "IGNORED", bgClass: "bg-gray-100" },
    ];

    statusTests.forEach(({ status, label, bgClass }) => {
      it(`should display ${status} status correctly`, () => {
        const receipt: DashboardReceiptItem = {
          ...baseDashboardReceipt,
          status,
        };

        render(<ReceiptCard receipt={receipt} />);

        const badge = screen.getByText(label);
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass(bgClass);
      });
    });

    it("should display processing status correctly", () => {
      mockUseOCRJobStatus.mockReturnValue({
        status: "processing",
        progress: 50,
        error: null,
      });

      const receipt: DashboardReceiptItem = {
        ...baseDashboardReceipt,
        status: "processing",
      };

      render(<ReceiptCard receipt={receipt} />);

      // Should show progress bar instead of status badge
      expect(screen.getByText("processing")).toBeInTheDocument();
      expect(screen.getByText("50%")).toBeInTheDocument();
    });

    it("should display failed status correctly", () => {
      mockUseOCRJobStatus.mockReturnValue({
        status: "failed",
        progress: 0,
        error: { message: "Processing failed" } as Error,
      });

      const receipt: DashboardReceiptItem = {
        ...baseDashboardReceipt,
        status: "failed",
      };

      render(<ReceiptCard receipt={receipt} />);

      // Should show error state instead of regular card
      expect(screen.getByText("Processing Failed")).toBeInTheDocument();
      expect(screen.getByText("Could not extract receipt data.")).toBeInTheDocument();
    });
  });

  describe("Confidence glow styling", () => {
    it("should have green glow for high confidence (>= 80%)", () => {
      const receipt: DashboardReceiptItem = {
        ...baseDashboardReceipt,
        matchConfidence: 0.85,
      };

      render(<ReceiptCard receipt={receipt} />);

      const card = screen.getByTestId("receipt-card");
      expect(card).toHaveClass("border-green-500");
      expect(card.className).toContain("shadow-[0_0_8px_rgba(34,197,94,0.5)]");
    });

    it("should have yellow glow for medium confidence (60-79%)", () => {
      const receipt: DashboardReceiptItem = {
        ...baseDashboardReceipt,
        matchConfidence: 0.7,
      };

      render(<ReceiptCard receipt={receipt} />);

      const card = screen.getByTestId("receipt-card");
      expect(card).toHaveClass("border-yellow-500");
      expect(card.className).toContain("shadow-[0_0_8px_rgba(234,179,8,0.5)]");
    });

    it("should have no glow for low confidence (< 60%)", () => {
      const receipt: DashboardReceiptItem = {
        ...baseDashboardReceipt,
        matchConfidence: 0.5,
      };

      render(<ReceiptCard receipt={receipt} />);

      const card = screen.getByTestId("receipt-card");
      expect(card).toHaveClass("border-black");
      expect(card.className).not.toContain("shadow-[0_0_8px");
    });

    it("should have no glow when confidence is undefined", () => {
      const receipt: DashboardReceiptItem = {
        ...baseDashboardReceipt,
        matchConfidence: undefined,
      };

      render(<ReceiptCard receipt={receipt} />);

      const card = screen.getByTestId("receipt-card");
      expect(card).toHaveClass("border-black");
    });

    it("should display confidence percentage for medium/high confidence", () => {
      const receipt: DashboardReceiptItem = {
        ...baseDashboardReceipt,
        matchConfidence: 0.82,
      };

      render(<ReceiptCard receipt={receipt} />);

      expect(screen.getByText("82% match")).toBeInTheDocument();
    });

    it("should not display confidence percentage for low confidence", () => {
      const receipt: DashboardReceiptItem = {
        ...baseDashboardReceipt,
        matchConfidence: 0.45,
      };

      render(<ReceiptCard receipt={receipt} />);

      expect(screen.queryByText(/match/i)).not.toBeInTheDocument();
    });
  });

  describe("Click handling", () => {
    it("should call onClick when card is clicked", () => {
      const mockOnClick = vi.fn();

      render(<ReceiptCard receipt={baseDashboardReceipt} onClick={mockOnClick} />);

      const card = screen.getByTestId("receipt-card");
      fireEvent.click(card);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith(baseDashboardReceipt);
    });

    it("should not be clickable when onClick is not provided", () => {
      render(<ReceiptCard receipt={baseDashboardReceipt} />);

      const card = screen.getByTestId("receipt-card");
      expect(card).not.toHaveClass("cursor-pointer");
      expect(card).not.toHaveAttribute("role");
    });

    it("should be keyboard accessible when onClick is provided", () => {
      const mockOnClick = vi.fn();

      render(<ReceiptCard receipt={baseDashboardReceipt} onClick={mockOnClick} />);

      const card = screen.getByTestId("receipt-card");
      expect(card).toHaveAttribute("role", "button");
      expect(card).toHaveAttribute("tabIndex", "0");

      // Test Enter key
      fireEvent.keyDown(card, { key: "Enter", code: "Enter" });
      expect(mockOnClick).toHaveBeenCalledWith(baseDashboardReceipt);

      // Test Space key
      mockOnClick.mockClear();
      fireEvent.keyDown(card, { key: " ", code: "Space" });
      expect(mockOnClick).toHaveBeenCalledWith(baseDashboardReceipt);
    });

    it("should not trigger onClick for other keys", () => {
      const mockOnClick = vi.fn();

      render(<ReceiptCard receipt={baseDashboardReceipt} onClick={mockOnClick} />);

      const card = screen.getByTestId("receipt-card");
      fireEvent.keyDown(card, { key: "Escape", code: "Escape" });

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe("Currency and date formatting", () => {
    it("should format currency with two decimal places", () => {
      const receipt: DashboardReceiptItem = {
        ...baseDashboardReceipt,
        amount: 123.456,
      };

      render(<ReceiptCard receipt={receipt} />);

      expect(screen.getByText("$123.46")).toBeInTheDocument();
    });

    it("should format whole number amounts correctly", () => {
      const receipt: DashboardReceiptItem = {
        ...baseDashboardReceipt,
        amount: 100,
      };

      render(<ReceiptCard receipt={receipt} />);

      expect(screen.getByText("$100.00")).toBeInTheDocument();
    });

    it("should format dates correctly", () => {
      const receipt: DashboardReceiptItem = {
        ...baseDashboardReceipt,
        date: "2026-12-31T23:59:59Z",
      };

      render(<ReceiptCard receipt={receipt} />);

      expect(screen.getByText("Dec 31, 2026")).toBeInTheDocument();
    });
  });

  describe("Hard Line v2.1 styling", () => {
    it("should have thick black borders", () => {
      render(<ReceiptCard receipt={baseDashboardReceipt} />);

      const card = screen.getByTestId("receipt-card");
      expect(card).toHaveClass("border-2");
    });

    it("should have shadow offset", () => {
      render(<ReceiptCard receipt={baseDashboardReceipt} />);

      const card = screen.getByTestId("receipt-card");
      expect(card.className).toContain("shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]");
    });

    it("should use mono font with bold uppercase text for merchant", () => {
      render(<ReceiptCard receipt={baseDashboardReceipt} />);

      const merchant = screen.getByText("Target");
      expect(merchant).toHaveClass("font-mono", "font-black", "uppercase", "tracking-tight");
    });

    it("should have hover effect when clickable", () => {
      render(<ReceiptCard receipt={baseDashboardReceipt} onClick={() => {}} />);

      const card = screen.getByTestId("receipt-card");
      expect(card).toHaveClass("cursor-pointer");
      expect(card).toHaveClass("hover:shadow-none");
    });
  });

  describe("Custom className", () => {
    it("should apply custom className", () => {
      render(<ReceiptCard receipt={baseDashboardReceipt} className="custom-class" />);

      const card = screen.getByTestId("receipt-card");
      expect(card).toHaveClass("custom-class");
    });
  });

  describe("Data attributes", () => {
    it("should have data-receipt-id attribute", () => {
      render(<ReceiptCard receipt={baseDashboardReceipt} />);

      const card = screen.getByTestId("receipt-card");
      expect(card).toHaveAttribute("data-receipt-id", "receipt-1");
    });
  });
});
