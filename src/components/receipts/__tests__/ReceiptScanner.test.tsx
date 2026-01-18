import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";
import ReceiptScanner from "../ReceiptScanner";
import "@testing-library/jest-dom";
import { useReceiptScanner as useReceiptScannerOriginal } from "../../../hooks/platform/receipts/useReceiptScanner";

// Mock the custom hook
vi.mock("../../../hooks/platform/receipts/useReceiptScanner");

// Type cast the mocked hook
const useReceiptScanner = useReceiptScannerOriginal as unknown as Mock;

// Mock child components to focus on main component behavior
vi.mock("../components/ReceiptScannerHeader", () => ({
  default: ({ onClose }: any) => (
    <div data-testid="receipt-header">
      <button onClick={onClose} data-testid="close-button">
        Close
      </button>
    </div>
  ),
}));

vi.mock("../components/ReceiptUploadArea", () => ({
  default: ({ onDrop }: any) => (
    <div data-testid="upload-area" onDrop={onDrop}>
      Upload Area
    </div>
  ),
}));

vi.mock("../components/ReceiptProcessingState", () => ({
  default: () => <div data-testid="processing-state">Processing...</div>,
}));

vi.mock("../components/ReceiptErrorState", () => ({
  default: ({ error, onRetry }: any) => (
    <div data-testid="error-state">
      <span>Error: {error}</span>
      <button onClick={onRetry} data-testid="retry-button">
        Retry
      </button>
    </div>
  ),
}));

vi.mock("../components/ReceiptImagePreview", () => ({
  default: ({ uploadedImage }: any) =>
    uploadedImage ? <div data-testid="image-preview">Image: {uploadedImage.name}</div> : null,
}));

vi.mock("../components/ReceiptExtractedData", () => ({
  default: ({ extractedData }: any) => (
    <div data-testid="extracted-data">Merchant: {extractedData?.merchant || "None"}</div>
  ),
}));

vi.mock("../components/ReceiptActionButtons", () => ({
  default: ({ onReset, onConfirm }: any) => (
    <div data-testid="action-buttons">
      <button onClick={onReset} data-testid="reset-button">
        Reset
      </button>
      <button onClick={onConfirm} data-testid="confirm-button">
        Confirm
      </button>
    </div>
  ),
}));

describe("ReceiptScanner", () => {
  const mockProps = {
    onReceiptProcessed: vi.fn(),
    onClose: vi.fn(),
  };

  const mockHookReturn = {
    isProcessing: false,
    uploadedImage: null,
    extractedData: null,
    error: null,
    showImagePreview: false,
    fileInputRef: { current: null },
    cameraInputRef: { current: null },
    handleDrop: vi.fn(),
    handleDragOver: vi.fn(),
    handleFileInputChange: vi.fn(),
    handleConfirmReceipt: vi.fn(),
    resetScanner: vi.fn(),
    toggleImagePreview: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useReceiptScanner.mockReturnValue(mockHookReturn);
  });

  it("should render with initial state", () => {
    render(<ReceiptScanner {...mockProps} />);

    expect(screen.getByTestId("receipt-header")).toBeInTheDocument();
    expect(screen.getByTestId("upload-area")).toBeInTheDocument();
    expect(screen.queryByTestId("processing-state")).not.toBeInTheDocument();
    expect(screen.queryByTestId("error-state")).not.toBeInTheDocument();
  });

  it("should show processing state when processing", () => {
    useReceiptScanner.mockReturnValue({
      ...mockHookReturn,
      isProcessing: true,
    });

    render(<ReceiptScanner {...mockProps} />);

    expect(screen.getByTestId("processing-state")).toBeInTheDocument();
    expect(screen.queryByTestId("upload-area")).not.toBeInTheDocument();
  });

  it("should show error state when there is an error", () => {
    useReceiptScanner.mockReturnValue({
      ...mockHookReturn,
      error: "Processing failed",
    });

    render(<ReceiptScanner {...mockProps} />);

    expect(screen.getByTestId("error-state")).toBeInTheDocument();
    expect(screen.getByText("Error: Processing failed")).toBeInTheDocument();
  });

  it("should show results when data is extracted", () => {
    const mockExtractedData = {
      merchant: "Test Store",
      total: 25.99,
    };

    const mockUploadedImage = {
      name: "receipt.jpg",
      url: "mock-url",
    };

    useReceiptScanner.mockReturnValue({
      ...mockHookReturn,
      extractedData: mockExtractedData,
      uploadedImage: mockUploadedImage,
    });

    render(<ReceiptScanner {...mockProps} />);

    expect(screen.getByTestId("image-preview")).toBeInTheDocument();
    expect(screen.getByTestId("extracted-data")).toBeInTheDocument();
    expect(screen.getByTestId("action-buttons")).toBeInTheDocument();
    expect(screen.getByText("Merchant: Test Store")).toBeInTheDocument();
    expect(screen.queryByTestId("upload-area")).not.toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", () => {
    render(<ReceiptScanner {...mockProps} />);

    fireEvent.click(screen.getByTestId("close-button"));

    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("should call resetScanner when retry button is clicked", () => {
    const mockReset = vi.fn();
    useReceiptScanner.mockReturnValue({
      ...mockHookReturn,
      error: "Processing failed",
      resetScanner: mockReset,
    });

    render(<ReceiptScanner {...mockProps} />);

    fireEvent.click(screen.getByTestId("retry-button"));

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("should call resetScanner when reset button is clicked", () => {
    const mockReset = vi.fn();
    useReceiptScanner.mockReturnValue({
      ...mockHookReturn,
      extractedData: { merchant: "Store" },
      resetScanner: mockReset,
    });

    render(<ReceiptScanner {...mockProps} />);

    fireEvent.click(screen.getByTestId("reset-button"));

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("should call handleConfirmReceipt when confirm button is clicked", () => {
    const mockConfirm = vi.fn();
    useReceiptScanner.mockReturnValue({
      ...mockHookReturn,
      extractedData: { merchant: "Store" },
      handleConfirmReceipt: mockConfirm,
    });

    render(<ReceiptScanner {...mockProps} />);

    fireEvent.click(screen.getByTestId("confirm-button"));

    expect(mockConfirm).toHaveBeenCalledTimes(1);
  });

  it("should apply correct styling classes", () => {
    render(<ReceiptScanner {...mockProps} />);

    const modal = screen.getByTestId("receipt-scanner-overlay");
    expect(modal).toHaveClass("fixed", "inset-0", "bg-black/50", "backdrop-blur-sm");

    const container = screen.getByTestId("receipt-scanner-container");
    expect(container).toHaveClass("bg-purple-100/60", "rounded-2xl", "border-2");
  });

  it("should hide upload area when image is uploaded", () => {
    useReceiptScanner.mockReturnValue({
      ...mockHookReturn,
      uploadedImage: { name: "receipt.jpg", url: "mock-url" },
    });

    render(<ReceiptScanner {...mockProps} />);

    expect(screen.queryByTestId("upload-area")).not.toBeInTheDocument();
  });

  it("should pass correct props to useReceiptScanner hook", () => {
    render(<ReceiptScanner {...mockProps} />);

    expect(useReceiptScanner).toHaveBeenCalledWith(expect.any(Function));
  });
});
