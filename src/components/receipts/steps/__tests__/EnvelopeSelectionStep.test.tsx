import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import EnvelopeSelectionStep from "../EnvelopeSelectionStep";

// Mock Action Buttons
vi.mock("../components/ReceiptActionButtons", () => ({
  default: ({ onNext, onBack }: any) => (
    <div>
      <button onClick={onNext}>Next</button>
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

// Mock utils
vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => () => <svg data-testid="mock-icon" />),
}));

vi.mock("@/utils/features/receipts/receiptHelpers", () => ({
  formatCurrency: (val: number) => `$${val}`,
}));

describe("EnvelopeSelectionStep", () => {
  const defaultProps = {
    transactionForm: {
      description: "Test Transaction",
      amount: 50.0,
      date: "2023-01-01",
      category: "General",
      envelopeId: "",
    },
    envelopes: [
      { id: "1", name: "Groceries", category: "Food", allocated: 500, spent: 100 },
      { id: "2", name: "Gas", category: "Transport", allocated: 200, spent: 50 },
    ],
    handleFormChange: vi.fn(),
  };

  it("should render envelope selection prompt and envelopes", () => {
    render(<EnvelopeSelectionStep {...defaultProps} />);
    expect(screen.getByText(/CHOOSE ENVELOPE/i)).toBeInTheDocument();
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Gas")).toBeInTheDocument();
    expect(screen.getByText("TRANSACTION SUMMARY")).toBeInTheDocument();
  });

  it("should call handleFormChange when an envelope is selected", () => {
    render(<EnvelopeSelectionStep {...defaultProps} />);
    fireEvent.click(screen.getByText("Groceries"));
    expect(defaultProps.handleFormChange).toHaveBeenCalledWith("envelopeId", "1");
  });
});
