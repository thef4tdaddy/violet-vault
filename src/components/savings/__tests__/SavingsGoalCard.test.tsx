import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import SavingsGoalCard from "../SavingsGoalCard";

// Mock the getIcon utility
vi.mock("../../utils", () => ({
  getIcon: vi.fn(() => () => <svg data-testid="mock-icon" />),
}));

// Mock Button component
vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick, disabled, className, title }: any) => (
    <button onClick={onClick} disabled={disabled} className={className} title={title}>
      {children}
    </button>
  ),
}));

describe("SavingsGoalCard", () => {
  const goal = {
    id: "goal1",
    name: "New Car",
    targetAmount: 20000,
    currentBalance: 5000,
    color: "#3b82f6",
    targetDate: "2025-12-31",
    priority: "high",
    description: "Saving for a Tesla",
    isActive: true,
    createdBy: "user1",
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    envelopeType: "savings",
    // Added missing DetailedSavingsGoal properties
    category: "savings",
    archived: false,
    lastModified: Date.now(),
    autoAllocate: true,
    type: "goal",
    icon: "Target",
  };

  const priorities = [{ value: "high", label: "High Priority", color: "text-red-600" }];

  const defaultProps = {
    goal,
    priorities,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  it("should render goal details", () => {
    render(<SavingsGoalCard {...defaultProps} />);
    expect(screen.getByText("New Car")).toBeInTheDocument();
    expect(screen.getByText("High Priority")).toBeInTheDocument();
    expect(screen.getByText("$5000.00")).toBeInTheDocument();
    expect(screen.getByText(/25.0%/i)).toBeInTheDocument(); // 5000/20000
  });

  it("should call onEdit when edit button is clicked", () => {
    render(<SavingsGoalCard {...defaultProps} />);
    const editButton = screen.getByTitle("Edit goal");
    fireEvent.click(editButton);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(goal);
  });

  it("should call onDelete when delete button is clicked", () => {
    render(<SavingsGoalCard {...defaultProps} />);
    const deleteButton = screen.getByTitle("Delete goal");
    fireEvent.click(deleteButton);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(goal);
  });
});
