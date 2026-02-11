import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import ConfirmationStep from "../ConfirmationStep";

// Mock dependencies
vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => () => <svg data-testid="mock-icon" />),
}));

vi.mock("@/utils/features/receipts/receiptHelpers", () => ({
  formatCurrency: (val: number) => `$${val}`,
  formatDisplayDate: (val: any) => String(val),
  getConfidenceDescription: () => "High",
}));

describe("ConfirmationStep", () => {
  const defaultProps = {
    receiptData: {
      merchant: "Original Store",
      total: 45.0,
      date: "2023-01-01",
      items: [],
      confidence: 0.9,
    },
    transactionForm: {
      description: "Final Store",
      amount: 50.0,
      date: "2023-01-01",
      category: "groceries",
      notes: "My notes",
      envelopeId: "1",
    },
    envelopes: [{ id: "1", name: "Groceries", category: "Food", allocated: 500, spent: 100 }],
  };

  it("should render transaction summary", () => {
    render(<ConfirmationStep {...defaultProps} />);
    expect(screen.getByText("CONFIRM TRANSACTION")).toBeInTheDocument();
    expect(screen.getByText("Final Store")).toBeInTheDocument();
    expect(screen.getByText("$50")).toBeInTheDocument();
    expect(screen.getByText("My notes")).toBeInTheDocument();
  });

  it("should render changes warning when data differs", () => {
    // Data differs: 45 vs 50, Original Store vs Final Store
    render(<ConfirmationStep {...defaultProps} />);
    expect(screen.getByText(/Changes Detected/i)).toBeInTheDocument();
  });

  it("should render envelope impact", () => {
    render(<ConfirmationStep {...defaultProps} />);
    expect(screen.getByText("ENVELOPE ASSIGNMENT")).toBeInTheDocument();
    expect(screen.getByText("Available Before:")).toBeInTheDocument();
    expect(screen.getByText("$400")).toBeInTheDocument(); // 500 - 100
    expect(screen.getByText("Available After:")).toBeInTheDocument();
    expect(screen.getByText("$350")).toBeInTheDocument(); // 400 - 50
  });
});
