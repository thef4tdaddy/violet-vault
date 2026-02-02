import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import ReceiptScannerHeader from "../ReceiptScannerHeader";

vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => () => <svg data-testid="mock-icon" />),
}));

vi.mock("@/components/ui/ModalCloseButton", () => ({
  default: ({ onClick }: any) => (
    <button onClick={onClick} data-testid="close-button">
      X
    </button>
  ),
}));

describe("ReceiptScannerHeader", () => {
  const defaultProps = {
    onClose: vi.fn(),
  };

  it("should render title", () => {
    render(<ReceiptScannerHeader {...defaultProps} />);
    expect(screen.getByTestId("header-title")).toBeInTheDocument();
    expect(screen.getByText(/Upload or capture a receipt/i)).toBeInTheDocument();
  });

  it("should render close button and handle click", () => {
    render(<ReceiptScannerHeader {...defaultProps} />);
    const closeBtn = screen.getByTestId("close-button");
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
