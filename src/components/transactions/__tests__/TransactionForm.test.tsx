import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import TransactionForm from "../TransactionForm";

// Mock the hooks
vi.mock("@/hooks/core/auth/security/useEditLock", () => ({
  default: () => ({
    lockedBy: null,
    timeRemaining: 60000,
    isExpired: false,
    isLocked: false,
    isOwnLock: false, // Set to false so releaseLock isn't awaited in tests for simplicity
    canEdit: true,
    releaseLock: vi.fn(() => Promise.resolve()),
    breakLock: vi.fn(),
  }),
}));

vi.mock("@/hooks/core/auth/security/useEditLockInit", () => ({
  useEditLockInit: vi.fn(),
}));

vi.mock("@/hooks/auth/useAuth", () => ({
  useAuth: vi.fn(() => ({
    budgetId: "test-budget-id",
    user: { id: "test-user-id", name: "Test User" },
  })),
}));

vi.mock("@/hooks/platform/ux/useModalAutoScroll", () => ({
  useModalAutoScroll: vi.fn(() => ({ current: null })),
}));

// Mock sub-components
vi.mock("../TransactionModalHeader", () => ({
  default: ({ onClose }: any) => (
    <div>
      <span>Transaction Header</span>
      <button onClick={onClose}>Close Header</button>
    </div>
  ),
}));

vi.mock("../TransactionFormFields", () => ({
  default: ({ handleFormSubmit, onClose, transactionForm }: any) => (
    <form onSubmit={handleFormSubmit}>
      <input
        data-testid="desc-input"
        defaultValue={transactionForm?.description || ""}
        onChange={() => {}}
      />
      <button type="submit">Submit Form</button>
      <button type="button" onClick={onClose}>
        Cancel Form
      </button>
    </form>
  ),
}));

describe("TransactionForm", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    transactionForm: {
      description: "Test Transaction",
      amount: "100.00",
      date: "2024-01-01",
      type: "expense" as const,
      category: "",
      envelopeId: "",
      notes: "",
      reconciled: false,
    },
    setTransactionForm: vi.fn(),
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when isOpen is false", () => {
    render(<TransactionForm {...defaultProps} isOpen={false} />);
    expect(screen.queryByText("Transaction Header")).not.toBeInTheDocument();
  });

  it("should render when isOpen is true", () => {
    render(<TransactionForm {...defaultProps} />);
    expect(screen.getByText("Transaction Header")).toBeInTheDocument();
  });

  it("should call onSubmit when form is submitted with valid data", () => {
    render(<TransactionForm {...defaultProps} />);

    const submitBtn = screen.getByText("Submit Form");
    fireEvent.click(submitBtn);

    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  it("should call onClose when header close button is clicked", () => {
    render(<TransactionForm {...defaultProps} />);

    const closeBtn = screen.getByText("Close Header");
    fireEvent.click(closeBtn);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("should call onClose when cancel button is clicked", () => {
    render(<TransactionForm {...defaultProps} />);

    const cancelBtn = screen.getByText("Cancel Form");
    fireEvent.click(cancelBtn);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
