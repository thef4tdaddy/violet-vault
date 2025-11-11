/**
 * Integration Tests for Import Modal + Receipt Scanner Workflow
 * Tests the complete flow from scanning a receipt to importing a transaction
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ImportModal from "../ImportModal";

// Mock dependencies
vi.mock("@/stores/ui/receiptScannerStore", () => ({
  useReceiptScannerStore: vi.fn((selector) => {
    const store = {
      saveRawText: false,
      encryptReceipts: true,
      recordScan: vi.fn(),
      setSaveRawText: vi.fn(),
      setEncryptReceipts: vi.fn(),
    };
    return selector ? selector(store) : store;
  }),
}));

// Mock ReceiptScanner component for integration testing
vi.mock("@/components/receipts/ReceiptScanner", () => ({
  default: ({
    onReceiptProcessed,
    onClose,
  }: {
    onReceiptProcessed: (data: unknown) => void;
    onClose: () => void;
  }) => (
    <div data-testid="receipt-scanner-modal">
      <button
        data-testid="mock-process-receipt"
        onClick={() => {
          onReceiptProcessed({
            merchant: "Test Grocery Store",
            total: "45.67",
            date: "2025-01-15",
            confidence: {
              merchant: "high",
              total: "high",
              date: "high",
            },
            processingTime: 1234,
            rawText: "Mock receipt text",
          });
        }}
      >
        Process Receipt
      </button>
      <button data-testid="mock-close-scanner" onClick={onClose}>
        Close Scanner
      </button>
    </div>
  ),
}));

describe("Import Modal + Receipt Scanner Integration", () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    importStep: 1,
    setImportStep: vi.fn(),
    importData: [],
    setImportData: vi.fn(),
    fieldMapping: {},
    setFieldMapping: vi.fn(),
    importProgress: 0,
    onImport: vi.fn(),
    onFileUpload: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render Import Modal with Scan Receipt button", () => {
    render(<ImportModal {...mockProps} />);

    expect(screen.getByText(/Import Transactions/i)).toBeInTheDocument();
    expect(screen.getByText(/SCAN RECEIPT/i)).toBeInTheDocument();
  });

  it("should open receipt scanner when Scan Receipt button is clicked", async () => {
    render(<ImportModal {...mockProps} />);

    const scanButton = screen.getByText(/SCAN RECEIPT/i);
    fireEvent.click(scanButton);

    await waitFor(() => {
      expect(screen.getByTestId("receipt-scanner-modal")).toBeInTheDocument();
    });
  });

  it("should process receipt and populate import data", async () => {
    render(<ImportModal {...mockProps} />);

    // Open scanner
    const scanButton = screen.getByText(/SCAN RECEIPT/i);
    fireEvent.click(scanButton);

    await waitFor(() => {
      expect(screen.getByTestId("receipt-scanner-modal")).toBeInTheDocument();
    });

    // Process receipt
    const processButton = screen.getByTestId("mock-process-receipt");
    fireEvent.click(processButton);

    // Verify data was set correctly
    await waitFor(() => {
      expect(mockProps.setImportData).toHaveBeenCalledWith([
        expect.objectContaining({
          date: "2025-01-15",
          description: "Test Grocery Store",
          amount: expect.any(Number),
          merchant: "Test Grocery Store",
        }),
      ]);
    });
  });

  it("should set field mapping after receipt processing", async () => {
    render(<ImportModal {...mockProps} />);

    // Open scanner
    fireEvent.click(screen.getByText(/SCAN RECEIPT/i));

    await waitFor(() => {
      expect(screen.getByTestId("receipt-scanner-modal")).toBeInTheDocument();
    });

    // Process receipt
    fireEvent.click(screen.getByTestId("mock-process-receipt"));

    // Verify field mapping was set
    await waitFor(() => {
      expect(mockProps.setFieldMapping).toHaveBeenCalledWith({
        date: "date",
        description: "description",
        amount: "amount",
      });
    });
  });

  it("should advance to field mapper step after processing", async () => {
    render(<ImportModal {...mockProps} />);

    // Open scanner and process receipt
    fireEvent.click(screen.getByText(/SCAN RECEIPT/i));

    await waitFor(() => {
      expect(screen.getByTestId("receipt-scanner-modal")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("mock-process-receipt"));

    // Verify step was advanced to field mapper (step 2)
    await waitFor(() => {
      expect(mockProps.setImportStep).toHaveBeenCalledWith(2);
    });
  });

  it("should close receipt scanner after processing", async () => {
    render(<ImportModal {...mockProps} />);

    // Open scanner
    fireEvent.click(screen.getByText(/SCAN RECEIPT/i));

    await waitFor(() => {
      expect(screen.getByTestId("receipt-scanner-modal")).toBeInTheDocument();
    });

    // Process receipt
    fireEvent.click(screen.getByTestId("mock-process-receipt"));

    // Scanner should close after processing
    await waitFor(() => {
      expect(screen.queryByTestId("receipt-scanner-modal")).not.toBeInTheDocument();
    });
  });

  it("should handle scanner close without processing", async () => {
    render(<ImportModal {...mockProps} />);

    // Open scanner
    fireEvent.click(screen.getByText(/SCAN RECEIPT/i));

    await waitFor(() => {
      expect(screen.getByTestId("receipt-scanner-modal")).toBeInTheDocument();
    });

    // Close without processing
    fireEvent.click(screen.getByTestId("mock-close-scanner"));

    // Scanner should close
    await waitFor(() => {
      expect(screen.queryByTestId("receipt-scanner-modal")).not.toBeInTheDocument();
    });

    // Import data should not be set
    expect(mockProps.setImportData).not.toHaveBeenCalled();
  });

  it("should convert receipt total to negative amount for expense", async () => {
    render(<ImportModal {...mockProps} />);

    // Open scanner and process
    fireEvent.click(screen.getByText(/SCAN RECEIPT/i));

    await waitFor(() => {
      expect(screen.getByTestId("receipt-scanner-modal")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("mock-process-receipt"));

    // Verify amount is negative (expense)
    await waitFor(() => {
      expect(mockProps.setImportData).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            amount: expect.any(Number),
          }),
        ])
      );

      const callArg = mockProps.setImportData.mock.calls[0][0][0];
      expect(callArg.amount).toBeLessThan(0);
    });
  });
});
