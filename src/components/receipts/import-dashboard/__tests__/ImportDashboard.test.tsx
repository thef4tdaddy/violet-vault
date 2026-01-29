/**
 */
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ImportDashboard from "../ImportDashboard";
import * as useUnifiedReceiptsModule from "../../../../hooks/platform/receipts/useUnifiedReceipts";
import * as useReceiptScannerModule from "../../../../hooks/platform/receipts/useReceiptScanner";
import type { DashboardReceiptItem } from "../../../../types/import-dashboard.types";
import type { SentinelReceipt } from "../../../../types/sentinel";
import type { ReceiptProcessedData } from "../../../../hooks/platform/receipts/useReceiptScanner";
import type { Receipt } from "../../../../db/types";
import { useReceiptMatching } from "../../../../hooks/platform/receipts/useReceiptMatching";

// Mock feedback and store
const mocks = vi.hoisted(() => ({
  showSuccess: vi.fn(),
  hapticFeedback: vi.fn(),
  closeDashboard: vi.fn(),
}));

vi.mock("../../../../hooks/platform/ux/useToast", () => ({
  default: () => ({
    showSuccess: mocks.showSuccess,
    showError: vi.fn(),
  }),
}));

vi.mock("../../../../utils/ui/feedback/touchFeedback", () => ({
  hapticFeedback: mocks.hapticFeedback,
}));

vi.mock("../../../../stores/ui/importDashboardStore", () => ({
  useImportDashboardStore: vi.fn((fn) => fn({ close: mocks.closeDashboard })),
}));

// Mock hooks
vi.mock("../../../../hooks/platform/receipts/useUnifiedReceipts");
vi.mock("../../../../hooks/platform/receipts/useReceiptScanner");
vi.mock("../../../../hooks/platform/receipts/useReceiptMatching", () => ({
  useReceiptMatching: vi.fn((options: any = {}) => ({
    showConfirmModal: false,
    selectedMatch: null,
    openMatchConfirmation: vi.fn(),
    closeMatchConfirmation: vi.fn(),
    confirmLinkOnly: vi.fn(() => {
      if (options.onMatchSuccess) options.onMatchSuccess();
    }),
    confirmLinkAndUpdate: vi.fn(() => {
      if (options.onMatchSuccess) options.onMatchSuccess();
    }),
    isLinking: false,
    isLinkingAndUpdating: false,
    getMatchSuggestionsForReceipt: vi.fn(() => []),
  })),
}));
vi.mock("@/hooks/platform/data/useReceiptMutations", () => ({
  useReceiptMutations: () => ({
    addReceipt: vi.fn(),
    updateReceipt: vi.fn(),
    deleteReceipt: vi.fn(),
    linkReceiptToTransaction: vi.fn(),
  }),
}));
vi.mock("@/components/sentinel/OCRScanner", () => ({
  default: ({ onClose, preloadedFile }: { onClose: () => void; preloadedFile?: File | null }) => (
    <div data-testid="ocr-scanner-mock">
      {preloadedFile && <div data-testid="preloaded-file-indicator">{preloadedFile.name}</div>}
      <button type="button" onClick={onClose}>
        Close Scanner
      </button>
    </div>
  ),
}));
vi.mock("../ScanUploadZone", () => ({
  default: ({
    onFileSelected,
    isProcessing,
  }: {
    onFileSelected: (f: File) => void;
    isProcessing: boolean;
  }) => (
    <div data-testid="scan-upload-zone-mock">
      {isProcessing && <div data-testid="processing-indicator">Processing...</div>}
      <button type="button" onClick={() => onFileSelected(new File([], "test-ui.jpg"))}>
        Upload Mock
      </button>
    </div>
  ),
}));
vi.mock("@/components/receipts/MatchConfirmationModal", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="match-modal-mock">
      <button onClick={onClose}>Close Modal</button>
    </div>
  ),
}));

describe("ImportDashboard", () => {
  let queryClient: QueryClient;

  const mockSentinelReceipt: SentinelReceipt = {
    id: "sentinel-1",
    merchant: "Amazon",
    amount: 49.99,
    date: "2026-01-20T10:00:00Z",
    status: "pending",
    createdAt: "2026-01-20T10:00:00Z",
    updatedAt: "2026-01-20T10:00:00Z",
    lastModified: 1737367200000,
  } as any;

  const createMockReceipt = (
    id: string,
    merchant: string,
    source: "sentinel" | "ocr"
  ): DashboardReceiptItem => ({
    id,
    source,
    merchant,
    amount: 29.99,
    date: "2026-01-21T14:30:00Z",
    status: "pending",
    rawData: mockSentinelReceipt,
  });

  const mockSentinelReceipts = [
    createMockReceipt("s1", "Amazon", "sentinel"),
    createMockReceipt("s2", "Target", "sentinel"),
    createMockReceipt("s3", "Walmart", "sentinel"),
  ];

  const mockOcrReceipts = [
    createMockReceipt("o1", "Starbucks", "ocr"),
    createMockReceipt("o2", "McDonald's", "ocr"),
  ];

  const defaultMockReturn = {
    allReceipts: [...mockSentinelReceipts, ...mockOcrReceipts],
    pendingReceipts: [...mockSentinelReceipts, ...mockOcrReceipts],
    sentinelReceipts: mockSentinelReceipts,
    ocrReceipts: mockOcrReceipts,
    isLoading: false,
    isError: false,
    error: null,
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.mocked(useUnifiedReceiptsModule.useUnifiedReceipts).mockReturnValue(defaultMockReturn);

    vi.mocked(useReceiptScannerModule.useReceiptScanner).mockReturnValue({
      isProcessing: false,
      uploadedImage: null,
      extractedData: null,
      error: null,
      showImagePreview: false,
      fileInputRef: { current: null } as any,
      cameraInputRef: { current: null } as any,
      handleFileUpload: vi.fn(),
      handleDrop: vi.fn(),
      handleDragOver: vi.fn(),
      handleFileInputChange: vi.fn(),
      handleConfirmReceipt: vi.fn(),
      resetScanner: vi.fn(),
      toggleImagePreview: vi.fn(),
    } as any);
  });

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  };

  describe("Rendering", () => {
    it("should render dashboard with all sections", () => {
      renderWithProvider(<ImportDashboard />);

      expect(screen.getByTestId("import-dashboard")).toBeInTheDocument();
      expect(screen.getByTestId("import-sidebar")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /import receipts/i })).toBeInTheDocument();
    });

    it("should start with digital mode by default", () => {
      renderWithProvider(<ImportDashboard />);

      const digitalButton = screen.getByTestId("import-mode-digital");
      expect(digitalButton).toHaveAttribute("aria-pressed", "true");
      expect(digitalButton).toBeDisabled();
    });

    it("should start with custom initial mode", () => {
      renderWithProvider(<ImportDashboard initialMode="scan" />);

      const scanButton = screen.getByTestId("import-mode-scan");
      expect(scanButton).toHaveAttribute("aria-pressed", "true");
      expect(scanButton).toBeDisabled();
    });

    it("should apply custom className", () => {
      renderWithProvider(<ImportDashboard className="custom-class" />);

      const dashboard = screen.getByTestId("import-dashboard");
      expect(dashboard).toHaveClass("custom-class");
    });

    it("should call onClose when close button is clicked", () => {
      const mockClose = vi.fn();
      renderWithProvider(<ImportDashboard onClose={mockClose} />);

      const closeBtn = screen.getByTestId("close-dashboard-button");
      fireEvent.click(closeBtn);
      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe("Mode switching", () => {
    it("should switch from digital to scan mode", () => {
      renderWithProvider(<ImportDashboard />);

      // Initially in digital mode
      expect(screen.getByText("Digital receipts from connected apps")).toBeInTheDocument();

      // Switch to scan mode
      const scanButton = screen.getByTestId("import-mode-scan");
      fireEvent.click(scanButton);

      // Should show scan mode description
      expect(screen.getByText("Scanned receipts from uploaded images")).toBeInTheDocument();
    });

    it("should switch from scan to digital mode", () => {
      renderWithProvider(<ImportDashboard initialMode="scan" />);

      // Initially in scan mode
      expect(screen.getByText("Scanned receipts from uploaded images")).toBeInTheDocument();

      // Switch to digital mode
      const digitalButton = screen.getByTestId("import-mode-digital");
      fireEvent.click(digitalButton);

      // Should show digital mode description
      expect(screen.getByText("Digital receipts from connected apps")).toBeInTheDocument();
    });
  });

  describe("Receipt filtering", () => {
    it("should display sentinel receipts in digital mode", () => {
      renderWithProvider(<ImportDashboard />);

      expect(screen.getByText("Amazon")).toBeInTheDocument();
      expect(screen.getByText("Target")).toBeInTheDocument();
      expect(screen.getByText("Walmart")).toBeInTheDocument();
    });

    it("should display OCR receipts in scan mode", () => {
      renderWithProvider(<ImportDashboard initialMode="scan" />);

      expect(screen.getByText("Starbucks")).toBeInTheDocument();
      expect(screen.getByText("McDonald's")).toBeInTheDocument();
    });

    it("should not display OCR receipts in digital mode", () => {
      renderWithProvider(<ImportDashboard />);

      expect(screen.queryByText("Starbucks")).not.toBeInTheDocument();
      expect(screen.queryByText("McDonald's")).not.toBeInTheDocument();
    });

    it("should not display sentinel receipts in scan mode", () => {
      renderWithProvider(<ImportDashboard initialMode="scan" />);

      expect(screen.queryByText("Amazon")).not.toBeInTheDocument();
      expect(screen.queryByText("Target")).not.toBeInTheDocument();
    });

    it("should filter out non-pending receipts", () => {
      const mixedReceipts = [
        { ...createMockReceipt("s1", "Amazon", "sentinel"), status: "pending" as const },
        { ...createMockReceipt("s2", "Target", "sentinel"), status: "matched" as const },
        { ...createMockReceipt("s3", "Walmart", "sentinel"), status: "pending" as const },
      ];

      vi.mocked(useUnifiedReceiptsModule.useUnifiedReceipts).mockReturnValue({
        ...defaultMockReturn,
        sentinelReceipts: mixedReceipts,
        isError: false,
      });

      renderWithProvider(<ImportDashboard />);

      // Should only show pending receipts
      expect(screen.getByText("Amazon")).toBeInTheDocument();
      expect(screen.queryByText("Target")).not.toBeInTheDocument();
      expect(screen.getByText("Walmart")).toBeInTheDocument();
    });
  });

  describe("Pending counts", () => {
    it("should display correct pending counts in sidebar", () => {
      renderWithProvider(<ImportDashboard />);

      expect(screen.getByText("3")).toBeInTheDocument(); // 3 Sentinel receipts
      expect(screen.getByText("2")).toBeInTheDocument(); // 2 OCR receipts
    });

    it("should update counts when receipts change", () => {
      const { rerender } = renderWithProvider(<ImportDashboard />);

      expect(screen.getByText("3")).toBeInTheDocument();

      // Update mock to have fewer receipts
      vi.mocked(useUnifiedReceiptsModule.useUnifiedReceipts).mockReturnValue({
        ...defaultMockReturn,
        sentinelReceipts: [mockSentinelReceipts[0]],
        isError: false,
      });

      rerender(
        <QueryClientProvider client={queryClient}>
          <ImportDashboard />
        </QueryClientProvider>
      );

      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  describe("Loading state", () => {
    it("should show loading skeletons when isLoading is true", () => {
      vi.mocked(useUnifiedReceiptsModule.useUnifiedReceipts).mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
      });

      renderWithProvider(<ImportDashboard />);

      expect(screen.getByTestId("receipt-inbox-loading")).toBeInTheDocument();
      const skeletons = screen.getAllByTestId("receipt-skeleton");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("should not show receipts while loading", () => {
      vi.mocked(useUnifiedReceiptsModule.useUnifiedReceipts).mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
      });

      renderWithProvider(<ImportDashboard />);

      expect(screen.queryByText("Amazon")).not.toBeInTheDocument();
    });
  });

  describe("Error handling", () => {
    it("should display error banner when error occurs", () => {
      const mockError = new Error("Failed to fetch receipts");

      vi.mocked(useUnifiedReceiptsModule.useUnifiedReceipts).mockReturnValue({
        ...defaultMockReturn,
        error: mockError,
      });

      renderWithProvider(<ImportDashboard />);

      expect(screen.getByTestId("error-banner")).toBeInTheDocument();
      expect(screen.getByText("Error Loading Receipts")).toBeInTheDocument();
      expect(screen.getByText("Failed to fetch receipts")).toBeInTheDocument();
    });

    it("should have proper ARIA role for error banner", () => {
      const mockError = new Error("Test error");

      vi.mocked(useUnifiedReceiptsModule.useUnifiedReceipts).mockReturnValue({
        ...defaultMockReturn,
        error: mockError,
      });

      renderWithProvider(<ImportDashboard />);

      const errorBanner = screen.getByTestId("error-banner");
      expect(errorBanner).toHaveAttribute("role", "alert");
    });

    it("should still show receipts when error occurs", () => {
      const mockError = new Error("Test error");

      vi.mocked(useUnifiedReceiptsModule.useUnifiedReceipts).mockReturnValue({
        ...defaultMockReturn,
        error: mockError,
      });

      renderWithProvider(<ImportDashboard />);

      // Error shown but receipts still visible
      expect(screen.getByTestId("error-banner")).toBeInTheDocument();
      expect(screen.getByText("Amazon")).toBeInTheDocument();
    });
  });

  describe("Empty state", () => {
    it("should show empty state when no receipts in digital mode", () => {
      vi.mocked(useUnifiedReceiptsModule.useUnifiedReceipts).mockReturnValue({
        ...defaultMockReturn,
        sentinelReceipts: [],
      });

      renderWithProvider(<ImportDashboard />);

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByText("No Digital Receipts")).toBeInTheDocument();
    });

    it("should show empty state when no receipts in scan mode", () => {
      vi.mocked(useUnifiedReceiptsModule.useUnifiedReceipts).mockReturnValue({
        ...defaultMockReturn,
        ocrReceipts: [],
      });

      renderWithProvider(<ImportDashboard initialMode="scan" />);

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByText("No Scanned Receipts")).toBeInTheDocument();
    });

    it("should not open OCR scanner for digital mode empty state action", () => {
      vi.mocked(useUnifiedReceiptsModule.useUnifiedReceipts).mockReturnValue({
        ...defaultMockReturn,
        sentinelReceipts: [],
      });

      renderWithProvider(<ImportDashboard />);

      const actionButton = screen.getByTestId("empty-state-action");
      fireEvent.click(actionButton);

      // OCR scanner should not appear for digital mode
      expect(screen.queryByTestId("ocr-scanner-mock")).not.toBeInTheDocument();
    });

    it("should open OCR scanner for scan mode empty state action", () => {
      vi.mocked(useUnifiedReceiptsModule.useUnifiedReceipts).mockReturnValue({
        ...defaultMockReturn,
        ocrReceipts: [],
      });

      renderWithProvider(<ImportDashboard initialMode="scan" />);

      const actionButton = screen.getByTestId("empty-state-action");
      fireEvent.click(actionButton);

      // OCR scanner should appear
      expect(screen.getByTestId("ocr-scanner-mock")).toBeInTheDocument();
    });
  });

  describe("OCR Scanner integration", () => {
    it("should open OCR scanner in scan mode", () => {
      vi.mocked(useUnifiedReceiptsModule.useUnifiedReceipts).mockReturnValue({
        ...defaultMockReturn,
        ocrReceipts: [],
      });

      renderWithProvider(<ImportDashboard initialMode="scan" />);

      // Click empty state action to open scanner
      const actionButton = screen.getByTestId("empty-state-action");
      fireEvent.click(actionButton);

      expect(screen.getByTestId("ocr-scanner-mock")).toBeInTheDocument();
    });

    it("should close OCR scanner when close button is clicked", () => {
      vi.mocked(useUnifiedReceiptsModule.useUnifiedReceipts).mockReturnValue({
        ...defaultMockReturn,
        ocrReceipts: [],
      });

      renderWithProvider(<ImportDashboard initialMode="scan" />);

      // Open scanner
      const actionButton = screen.getByTestId("empty-state-action");
      fireEvent.click(actionButton);
      expect(screen.getByTestId("ocr-scanner-mock")).toBeInTheDocument();

      // Close scanner
      const closeButton = screen.getByText("Close Scanner");
      fireEvent.click(closeButton);
      expect(screen.queryByTestId("ocr-scanner-mock")).not.toBeInTheDocument();
    });
  });

  describe("Hard Line v2.1 styling", () => {
    it("should have gradient background", () => {
      renderWithProvider(<ImportDashboard />);

      const dashboard = screen.getByTestId("import-dashboard");
      expect(dashboard).toHaveClass("bg-linear-to-br", "from-purple-50", "to-cyan-50");
    });

    it("should use mono font with bold uppercase for heading", () => {
      renderWithProvider(<ImportDashboard />);

      const heading = screen.getByRole("heading", { name: /import receipts/i });
      expect(heading).toHaveClass("font-mono", "font-black", "uppercase", "tracking-tight");
    });

    it("should have Hard Line styling on error banner", () => {
      const mockError = new Error("Test error");

      vi.mocked(useUnifiedReceiptsModule.useUnifiedReceipts).mockReturnValue({
        ...defaultMockReturn,
        error: mockError,
      });

      renderWithProvider(<ImportDashboard />);

      const errorBanner = screen.getByTestId("error-banner");
      expect(errorBanner).toHaveClass("border-2", "border-red-500");
      expect(errorBanner.className).toContain("shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]");
    });
  });

  describe("Layout", () => {
    it("should have flex layout with sidebar and main content", () => {
      renderWithProvider(<ImportDashboard />);

      const dashboard = screen.getByTestId("import-dashboard");
      expect(dashboard).toHaveClass("flex", "flex-col", "lg:flex-row");
    });

    it("should render sidebar in an aside element", () => {
      const { container } = renderWithProvider(<ImportDashboard />);

      const aside = container.querySelector("aside");
      expect(aside).toBeInTheDocument();
      expect(aside?.querySelector('[data-testid="import-sidebar"]')).toBeInTheDocument();
    });

    it("should render content in a main element", () => {
      const { container } = renderWithProvider(<ImportDashboard />);

      const main = container.querySelector("main");
      expect(main).toBeInTheDocument();
    });
  });

  describe("Preloaded file handling", () => {
    it("should auto-trigger OCR scanner when a preloadedFile is provided", () => {
      const mockFile = new File(["test"], "receipt.jpg", { type: "image/jpeg" });
      const mockHandleFileUpload = vi.fn();

      vi.mocked(useReceiptScannerModule.useReceiptScanner).mockReturnValue({
        handleFileUpload: mockHandleFileUpload,
      } as any);

      renderWithProvider(<ImportDashboard preloadedFile={mockFile} />);

      // handleFileUpload should be called automatically
      expect(mockHandleFileUpload).toHaveBeenCalledWith(mockFile);
    });

    it("should render ScanUploadZone in scan mode", () => {
      renderWithProvider(<ImportDashboard initialMode="scan" />);
      expect(screen.getByTestId("scan-upload-zone-mock")).toBeInTheDocument();
    });

    it("should switch to scan mode when a preloadedFile is provided", () => {
      const mockFile = new File(["test"], "receipt.jpg", { type: "image/jpeg" });
      renderWithProvider(<ImportDashboard preloadedFile={mockFile} />);

      // Should show scan mode description
      expect(screen.getByText("Scanned receipts from uploaded images")).toBeInTheDocument();

      // Sidebar should show scan mode as active
      const scanButton = screen.getByTestId("import-mode-scan");
      expect(scanButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("Receipt matching flow", () => {
    it("should open match confirmation when a receipt is clicked", () => {
      const mockOpenMatch = vi.fn();
      const mockReceipt = mockSentinelReceipts[0];

      vi.mocked(useUnifiedReceiptsModule.useUnifiedReceipts).mockReturnValue(defaultMockReturn);

      // Re-mock useReceiptMatching for this specific test
      vi.mocked(useReceiptMatching).mockReturnValue({
        ...vi.mocked(useReceiptMatching)(),
        getMatchSuggestionsForReceipt: vi.fn(() => [{ transactionId: "t1" } as any]),
        openMatchConfirmation: mockOpenMatch,
      } as any);

      renderWithProvider(<ImportDashboard />);

      const receiptCard = screen.getByText("Amazon");
      fireEvent.click(receiptCard);

      expect(mockOpenMatch).toHaveBeenCalled();
    });

    it("should trigger success feedback and close dashboard on match success", () => {
      // Mock useReceiptMatching to call onMatchSuccess immediately on confirmLinkOnly
      vi.mocked(useReceiptMatching).mockImplementation(
        (options: any) =>
          ({
            showConfirmModal: true,
            selectedMatch: { receipt: { id: "r1" } } as any,
            confirmLinkOnly: () => {
              if (options.onMatchSuccess) options.onMatchSuccess();
            },
            // We need to provide dummy implementations for other methods used by the component
            openMatchConfirmation: vi.fn(),
            closeMatchConfirmation: vi.fn(),
            confirmLinkAndUpdate: vi.fn(),
            isLinking: false,
            isLinkingAndUpdating: false,
            getMatchSuggestionsForReceipt: vi.fn(() => []),
          }) as any
      );

      renderWithProvider(<ImportDashboard />);

      // Match modal should be open (mocked)
      expect(screen.getByTestId("match-modal-mock")).toBeInTheDocument();

      // We need a way to trigger the confirm action in our mock
      // Since confirmation happens inside the modal which we mocked,
      // we can just call it from the hook.
      // In a real test we'd click the button in the modal.
      const hookReturn = vi.mocked(useReceiptMatching).mock.results[0].value;
      hookReturn.confirmLinkOnly();

      expect(mocks.hapticFeedback).toHaveBeenCalledWith(20, "success");
      expect(mocks.showSuccess).toHaveBeenCalled();
      expect(mocks.closeDashboard).toHaveBeenCalled();
    });
  });

  describe("Keyboard Shortcuts", () => {
    it("should switch to scan mode when 's' key is pressed", () => {
      renderWithProvider(<ImportDashboard initialMode="digital" />);

      // We need to trigger on an element that isn't an input/textarea to ensure the handler catches it
      // Since our handler is on window, we can trigger on body or create a dummy element
      act(() => {
        fireEvent.keyDown(document.body, { key: "s", bubbles: true });
      });

      expect(screen.getByText("Scanned receipts from uploaded images")).toBeInTheDocument();
      expect(screen.getByTestId("import-mode-scan")).toHaveAttribute("aria-pressed", "true");
    });

    it("should switch to digital mode when 'd' key is pressed", () => {
      renderWithProvider(<ImportDashboard initialMode="scan" />);

      act(() => {
        fireEvent.keyDown(window, { key: "d" });
      });

      expect(screen.getByText("Digital receipts from connected apps")).toBeInTheDocument();
      expect(screen.getByTestId("import-mode-digital")).toHaveAttribute("aria-pressed", "true");
    });

    it("should not switch modes when typing in an input", () => {
      renderWithProvider(<ImportDashboard initialMode="digital" />);

      const input = document.createElement("input");
      document.body.appendChild(input);
      input.focus();

      act(() => {
        fireEvent.keyDown(input, { key: "s", bubbles: true });
      });

      // Should still be in digital mode
      expect(screen.getByText("Digital receipts from connected apps")).toBeInTheDocument();
      document.body.removeChild(input);
    });
  });
});
