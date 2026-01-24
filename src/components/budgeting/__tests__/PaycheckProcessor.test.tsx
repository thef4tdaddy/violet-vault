import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import PaycheckProcessor from "../PaycheckProcessor";

// Mock the getIcon utility
vi.mock("../../utils", () => ({
  getIcon: vi.fn(() => () => <svg data-testid="mock-icon" />),
}));

// Mock StylizedButtonText
vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick, className, disabled, ...props }: any) => (
    <button onClick={onClick} className={className} disabled={disabled} {...props}>
      {children}
    </button>
  ),
  StylizedButtonText: ({ children }: any) => <span>{children}</span>,
}));

// Mock hooks
vi.mock("@/hooks/budgeting/transactions/scheduled/income/usePaycheckProcessor", () => ({
  usePaycheckProcessor: vi.fn(() => ({
    paycheckAmount: "1000",
    payerName: "Test Company",
    isProcessing: false,
    canSubmit: true,
    showPreview: false,
    allocationPreview: null,
    setPaycheckAmount: vi.fn(),
    handlePayerChange: vi.fn(),
    handleAddNewPayer: vi.fn(),
    setShowAddNewPayer: vi.fn(),
    setAllocationMode: vi.fn(),
    setShowPreview: vi.fn(),
    handleProcessPaycheck: vi.fn(),
  })),
}));

vi.mock("@/hooks/budgeting/transactions/scheduled/income/usePaycheckHistory", () => ({
  usePaycheckHistory: vi.fn(() => ({
    handleDeletePaycheck: vi.fn(),
    deletingPaycheckId: null,
  })),
}));

// Mock sub-components
vi.mock("../paycheck/PaycheckAmountInput", () => ({
  default: () => <div data-testid="amount-input" />,
}));
vi.mock("../paycheck/PaycheckPayerSelector", () => ({
  default: () => <div data-testid="payer-selector" />,
}));
vi.mock("../paycheck/PaycheckAllocationModes", () => ({
  default: () => <div data-testid="allocation-modes" />,
}));
vi.mock("../paycheck/PaycheckAllocationPreview", () => ({
  default: () => <div data-testid="allocation-preview" />,
}));
vi.mock("../paycheck/PaycheckHistory", () => ({
  default: () => <div data-testid="paycheck-history" />,
}));

describe("PaycheckProcessor", () => {
  const defaultProps = {
    envelopes: [],
    paycheckHistory: [],
    onProcessPaycheck: vi.fn(),
    onDeletePaycheck: vi.fn(),
    currentUser: { userName: "Test User" },
  };

  it("should render correctly with title", () => {
    render(<PaycheckProcessor {...defaultProps} />);

    expect(screen.getByText(/ADD PAYCHECK/i)).toBeInTheDocument();
  });

  it("should render all main form sections", () => {
    render(<PaycheckProcessor {...defaultProps} />);

    expect(screen.getByTestId("amount-input")).toBeInTheDocument();
    expect(screen.getByTestId("payer-selector")).toBeInTheDocument();
    expect(screen.getByTestId("allocation-modes")).toBeInTheDocument();
    expect(screen.getByTestId("allocation-preview")).toBeInTheDocument();
    expect(screen.getByTestId("paycheck-history")).toBeInTheDocument();
  });

  it("should render action buttons", () => {
    render(<PaycheckProcessor {...defaultProps} />);

    expect(screen.getByText("Preview Allocation")).toBeInTheDocument();
  });
});
