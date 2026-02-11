import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import DebtList from "../DebtList";

// Mock the getIcon utility
vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => () => <svg data-testid="mock-icon" />),
}));

// Mock DebtCardProgressBar
vi.mock("../DebtCardProgressBar", () => ({
  default: () => <div data-testid="mock-progress-bar" />,
}));

describe("DebtList", () => {
  const mockDebts = [
    {
      id: "1",
      name: "Visa Card",
      creditor: "Chase",
      type: "credit_card",
      currentBalance: 5000,
      interestRate: 18.5,
      minimumPayment: 150,
      nextPaymentDate: "2023-12-15",
      status: "active",
      originalBalance: 6000,
    },
    {
      id: "2",
      name: "Student Loan",
      creditor: "Navient",
      type: "student",
      currentBalance: 12000,
      interestRate: 5.5,
      minimumPayment: 200,
      dueDate: "2023-12-20", // Use dueDate variant
      status: "deferred",
      originalBalance: 15000,
    },
  ];

  const defaultProps = {
    debts: mockDebts,
    onDebtClick: vi.fn(),
    onRecordPayment: vi.fn(),
  };

  it("should render a list of debts", () => {
    render(<DebtList {...defaultProps} />);

    expect(screen.getByText("Visa Card")).toBeInTheDocument();
    expect(screen.getByText("Student Loan")).toBeInTheDocument();
    expect(screen.getAllByTestId("mock-progress-bar")).toHaveLength(2);
  });

  it("should handle debt clicks", () => {
    render(<DebtList {...defaultProps} />);

    fireEvent.click(screen.getByText("Visa Card"));
    expect(defaultProps.onDebtClick).toHaveBeenCalledWith(expect.objectContaining({ id: "1" }));
  });

  it("should render empty states gracefully handled by parent (DebtList assumes non-empty array usually, but checking strict nulls)", () => {
    render(<DebtList {...defaultProps} debts={[]} />);
    const cards = screen.queryAllByTestId("mock-progress-bar");
    expect(cards).toHaveLength(0);
  });

  it("should display correct status badges", () => {
    render(<DebtList {...defaultProps} />);

    expect(screen.getByText("Active")).toHaveClass("bg-blue-100");
    expect(screen.getByText("Deferred")).toHaveClass("bg-yellow-100");
  });

  it("should format currency correctly", () => {
    render(<DebtList {...defaultProps} />);
    // Using regex for flexibility with spacing/currency symbols
    expect(screen.getByText(/\$5000/)).toBeInTheDocument();
    expect(screen.getByText(/\$12000/)).toBeInTheDocument();
  });
});
