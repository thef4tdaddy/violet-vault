import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import AccountCardHeader from "../AccountCardHeader";

// Mock the getIcon utility
vi.mock("../../../utils", () => ({
  getIcon: vi.fn(() => () => <svg data-testid="mock-icon" />),
}));

describe("AccountCardHeader", () => {
  const account = {
    id: "acc1",
    name: "HSA Account",
    type: "hsa",
    currentBalance: 1200,
    annualContribution: 3600,
    expirationDate: null,
    description: "Health Savings",
    color: "#4ade80",
    isActive: true,
    createdBy: "user1",
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    transactions: [],
  };

  const typeInfo = {
    value: "hsa",
    label: "HSA",
    icon: "🏥",
  };

  const defaultProps = {
    account,
    typeInfo,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  it("should render account name and type info", () => {
    render(<AccountCardHeader {...defaultProps} />);
    expect(screen.getByText("HSA Account")).toBeInTheDocument();
    expect(screen.getByText(/🏥 HSA/i)).toBeInTheDocument();
  });

  it("should call onEdit when edit button is clicked", () => {
    render(<AccountCardHeader {...defaultProps} />);
    const editButton = screen.getByTitle("Edit account");
    fireEvent.click(editButton);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(account);
  });

  it("should call onDelete when delete button is clicked", () => {
    render(<AccountCardHeader {...defaultProps} />);
    const deleteButton = screen.getByTitle("Delete account");
    fireEvent.click(deleteButton);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(account.id);
  });

  it("should show inactive label when account is not active", () => {
    render(<AccountCardHeader {...defaultProps} account={{ ...account, isActive: false }} />);
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });
});
