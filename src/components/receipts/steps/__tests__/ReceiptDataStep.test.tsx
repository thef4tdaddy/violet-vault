import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import ReceiptDataStep from "../ReceiptDataStep";

// Mock dependencies
vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => () => <svg data-testid="mock-icon" />),
}));

vi.mock("@/utils/features/receipts/receiptHelpers", () => ({
  formatCurrency: (val: number) => `$${val}`,
}));

vi.mock("@/components/ui", () => ({
  Select: ({ children, value, onChange, className }: any) => (
    <select value={value} onChange={onChange} className={className}>
      {children}
    </select>
  ),
}));

vi.mock("../components/ReceiptExtractedData", () => ({
  default: ({ extractedData, onUpdateField }: any) => (
    <div data-testid="mock-extracted-data">
      <button onClick={() => onUpdateField("total", 100)}>Update Total</button>
    </div>
  ),
}));

vi.mock("../components/ExtractedItemsList", () => ({
  default: () => <div data-testid="mock-items-list">Items List</div>,
}));

describe("ReceiptDataStep", () => {
  const defaultProps = {
    receiptData: {
      merchant: "Test Store",
      total: 50.0,
      date: "2023-01-01",
      items: [],
      confidence: 0.9,
    },
    transactionForm: {
      description: "Test Transaction",
      amount: 50.0,
      date: "2023-01-01",
      category: "groceries",
      notes: "",
    },
    handleFormChange: vi.fn(),
  };

  it("should render form fields with extracted data", () => {
    render(<ReceiptDataStep {...defaultProps} />);
    expect(screen.getByText("REVIEW EXTRACTED DATA")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter merchant name")).toHaveValue("Test Transaction");
    expect(screen.getByPlaceholderText("0.00")).toHaveValue(50.0);
  });

  it("should call handleFormChange when inputs change", () => {
    render(<ReceiptDataStep {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText("Enter merchant name"), {
      target: { value: "New Store" },
    });
    expect(defaultProps.handleFormChange).toHaveBeenCalledWith("description", "New Store");

    fireEvent.change(screen.getByPlaceholderText("0.00"), { target: { value: "60" } });
    expect(defaultProps.handleFormChange).toHaveBeenCalledWith("amount", 60);
  });
});
