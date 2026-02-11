import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import ReceiptActionButtons from "../ReceiptActionButtons";
import * as receiptHelpers from "../../../../utils/features/receipts/receiptHelpers";

// Mock dependencies
vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("@/utils/features/receipts/receiptHelpers", () => ({
  hasMinimumExtractedData: vi.fn((data) => data.total > 0),
}));

describe("ReceiptActionButtons", () => {
  const defaultProps = {
    extractedData: { total: "100.00" },
    onReset: vi.fn(),
    onConfirm: vi.fn(),
  };

  it("should render buttons", () => {
    render(<ReceiptActionButtons {...defaultProps} />);
    expect(screen.getByRole("button", { name: /scan another/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create transaction/i })).toBeInTheDocument();
  });

  it("should call handlers", () => {
    render(<ReceiptActionButtons {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /scan another/i }));
    expect(defaultProps.onReset).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /create transaction/i }));
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it("should disable confirm button when data is invalid", () => {
    // Mock helper to return false
    vi.mocked(receiptHelpers.hasMinimumExtractedData).mockReturnValue(false);

    render(<ReceiptActionButtons {...defaultProps} />);
    expect(screen.getByRole("button", { name: /create transaction/i })).toBeDisabled();
  });
});
