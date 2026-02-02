import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReceiptToTransactionModal from "../ReceiptToTransactionModal";

// Mock dependencies
vi.mock("@/components/ui/Modal", () => ({
  Modal: ({ isOpen, children, title }: any) =>
    isOpen ? (
      <div data-testid="mock-modal">
        <h2>{title}</h2>
        {children}
      </div>
    ) : null,
}));

// Mock steps
vi.mock("../steps/ReceiptDataStep", () => ({
  default: () => <div data-testid="mock-data-step">Data Step</div>,
}));
vi.mock("../steps/EnvelopeSelectionStep", () => ({
  default: () => <div data-testid="mock-envelope-step">Envelope Step</div>,
}));
vi.mock("../steps/ConfirmationStep", () => ({
  default: () => <div data-testid="mock-confirmation-step">Confirmation Step</div>,
}));
vi.mock("../components/ReceiptScannerHeader", () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));
vi.mock("../components/ReceiptUploadArea", () => ({
  default: () => <div data-testid="mock-upload">Upload Area</div>,
}));
vi.mock("../components/ReceiptProcessingState", () => ({
  default: () => <div data-testid="mock-processing">Processing</div>,
}));
vi.mock("../components/ReceiptErrorState", () => ({
  default: () => <div data-testid="mock-error">Error</div>,
}));

describe("ReceiptToTransactionModal", () => {
  const defaultProps = {
    receiptData: { merchant: "Test Store", total: 100, date: "2023-01-01", confidence: 0.9 },
    onClose: vi.fn(),
    onComplete: vi.fn(),
  };

  it("should render modal when open", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ReceiptToTransactionModal {...defaultProps} />
      </QueryClientProvider>
    );
    // Internal ModalHeader title
    expect(screen.getByText("CONVERT RECEIPT TO TRANSACTION")).toBeInTheDocument();
    // ReceiptToTransactionModal doesn't use standard Modal but a custom div implementation with internal ModalHeader?
    // Wait, the file uses <div className="fixed inset-0..."><div ...><ModalHeader ...>
    // It does not use the @/components/ui/Modal component!
    // But the test mocked @/components/ui/Modal?
    // And expected `screen.getByTestId("mock-modal")`.
    // Since the component doesn't use the mock, `getByTestId("mock-modal")` will fail.
    // I should check for the actual structure.

    // Actually, looking at ReceiptToTransactionModal.tsx lines 222-244, it renders raw divs with classes.
    // So "mock-modal" won't exist.
    // I should just check for text content.
    expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();
  });

  // Removed "should not render when closed" as component doesn't accept isOpen prop
});
