import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import AccountsHeader from "../AccountsHeader";

// Mock the getIcon utility
vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => () => <svg data-testid="mock-icon" />),
}));

describe("AccountsHeader", () => {
  const defaultProps = {
    totalValue: 1250.5,
    onAddAccount: vi.fn(),
    showBalances: true,
    onToggleBalances: vi.fn(),
  };

  it("should render correctly with total value", () => {
    render(<AccountsHeader {...defaultProps} />);

    // Header text is split by spans for styling, use a function matcher
    expect(screen.getByRole("heading", { name: /SUPPLEMENTAL ACCOUNTS/i })).toBeInTheDocument();

    expect(screen.getByText(/Total: \$1250.50/i)).toBeInTheDocument();
  });

  it("should show asterisks when showBalances is false", () => {
    render(<AccountsHeader {...defaultProps} showBalances={false} />);
    expect(screen.getByText(/Total: \*\*\*\*/i)).toBeInTheDocument();
  });

  it("should call onAddAccount when button is clicked", () => {
    render(<AccountsHeader {...defaultProps} />);

    const addButton = screen.getByRole("button", { name: /add account/i });
    fireEvent.click(addButton);

    expect(defaultProps.onAddAccount).toHaveBeenCalledTimes(1);
  });

  it("should render the credit card icon", () => {
    render(<AccountsHeader {...defaultProps} />);
    const icons = screen.getAllByTestId("mock-icon");
    expect(icons.length).toBeGreaterThanOrEqual(1);
  });
});
