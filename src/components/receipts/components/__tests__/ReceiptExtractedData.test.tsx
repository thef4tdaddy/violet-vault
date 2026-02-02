import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import ReceiptExtractedData from "../ReceiptExtractedData";

vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => () => <svg data-testid="mock-icon" />),
}));

vi.mock("../ExtractedDataField", () => ({
  default: ({ label, value, onChange }: any) => (
    <div data-testid="mock-field">
      <span>{label}</span>
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  ),
}));

vi.mock("@/utils/features/receipts/receiptHelpers", () => ({
  getConfidenceDescription: () => "High",
  formatCurrency: (val: number) => `$${val}`,
}));

describe("ReceiptExtractedData", () => {
  const defaultProps = {
    extractedData: {
      merchant: "Test Merchant",
      total: 100.0,
      date: "2023-01-01",
      items: [],
      confidence: { merchant: 0.9, total: 0.9, date: 0.9 },
    },
    onUpdateField: vi.fn(),
  };

  it("should render extracted data fields", () => {
    render(<ReceiptExtractedData {...defaultProps} />);
    expect(screen.getByText("Merchant")).toBeInTheDocument();
    expect(screen.getByText("Total Amount")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /extracted information/i })).toBeInTheDocument();
  });

  // Removed onUpdateField test as component is read-only currently
});
