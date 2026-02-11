import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import {
  TransactionBasicFields,
  TransactionFormActions,
  TransactionReceiptSection,
} from "../TransactionFormSections";

// Mock utilities
vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => () => <svg data-testid="mock-icon" />),
  logger: { info: vi.fn() },
}));

// Mock sub-components
vi.mock("../receipts/ReceiptButton", () => ({
  default: () => <button data-testid="receipt-button">Receipt</button>,
}));

vi.mock("@/components/ui", () => ({
  Select: ({ children, value, onChange }: any) => (
    <select value={value} onChange={onChange}>
      {children}
    </select>
  ),
  TextInput: ({ value, onChange, placeholder }: any) => (
    <input value={value} onChange={onChange} placeholder={placeholder} />
  ),
  Textarea: ({ value, onChange, placeholder }: any) => (
    <textarea value={value} onChange={onChange} placeholder={placeholder} />
  ),
  Checkbox: ({ checked, onChange }: any) => (
    <input type="checkbox" checked={checked} onChange={onChange} />
  ),
  Button: ({ children, onClick, className, disabled, type, ...props }: any) => (
    <button onClick={onClick} className={className} disabled={disabled} type={type} {...props}>
      {children}
    </button>
  ),
}));

describe("TransactionFormSections", () => {
  const mockSetForm = vi.fn();
  const transactionForm = {
    date: "2024-01-01",
    type: "expense",
    description: "Lunch",
    amount: "15.50",
    category: "Food",
    envelopeId: "env1",
    notes: "",
    reconciled: false,
  };

  describe("TransactionBasicFields", () => {
    it("should render date and type buttons", () => {
      render(
        <TransactionBasicFields
          transactionForm={transactionForm as any}
          setTransactionForm={mockSetForm}
          canEdit={true}
        />
      );

      expect(
        screen.getByRole("button", { name: /Set transaction type to expense/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Set transaction type to income/i })
      ).toBeInTheDocument();
    });
  });

  describe("TransactionReceiptSection", () => {
    it("should render receipt button when not editing", () => {
      render(<TransactionReceiptSection editingTransaction={null} onClose={vi.fn()} />);

      expect(screen.getByText(/Scan Receipt/i)).toBeInTheDocument();
      expect(screen.getByText(/Have a receipt\?/i)).toBeInTheDocument();
    });

    it("should not render when editing an existing transaction", () => {
      const { container } = render(
        <TransactionReceiptSection editingTransaction={{ id: 1 } as any} onClose={vi.fn()} />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("TransactionFormActions", () => {
    it("should render cancel and submit buttons", () => {
      render(<TransactionFormActions editingTransaction={null} canEdit={true} onClose={vi.fn()} />);

      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText("Add Transaction")).toBeInTheDocument();
    });

    it("should show 'Update' when editing", () => {
      render(
        <TransactionFormActions
          editingTransaction={{ id: 1 } as any}
          canEdit={true}
          onClose={vi.fn()}
        />
      );

      expect(screen.getByText("Update Transaction")).toBeInTheDocument();
    });
  });
});
