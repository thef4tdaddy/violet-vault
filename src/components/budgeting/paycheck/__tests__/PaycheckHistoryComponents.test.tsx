import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import {
  PaycheckEmptyState,
  PaycheckStatsDisplay,
  PaycheckHistoryItemCard,
} from "../PaycheckHistoryComponents";

// Mock the getIcon utility
vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => () => <svg data-testid="mock-icon" />),
}));

// Mock formatPaycheckAmount
vi.mock("@/utils/domain/budgeting/paycheckUtils", () => ({
  formatPaycheckAmount: vi.fn((amt) => `$${amt}`),
}));

// Mock Button component
vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick, disabled, type, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} type={type} {...props}>
      {children}
    </button>
  ),
}));

describe("PaycheckHistoryComponents", () => {
  describe("PaycheckEmptyState", () => {
    it("should render empty state message", () => {
      render(<PaycheckEmptyState />);
      expect(screen.getByText(/No paycheck history available/i)).toBeInTheDocument();
    });
  });

  describe("PaycheckStatsDisplay", () => {
    it("should render stats correctly", () => {
      const stats = {
        count: 5,
        averageAmount: 2000,
        totalAmount: 10000,
        minAmount: 1800,
        maxAmount: 2200,
      };
      render(<PaycheckStatsDisplay paycheckStats={stats} />);
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("$2000")).toBeInTheDocument();
      expect(screen.getByText("$10000")).toBeInTheDocument();
      expect(screen.getByText("$1800 - $2200")).toBeInTheDocument();
    });
  });

  describe("PaycheckHistoryItemCard", () => {
    const paycheck = {
      id: "p1",
      payerName: "Test Employer",
      allocationMode: "allocate",
      amount: 2500,
      processedAt: "2024-01-01T12:00:00Z",
      processedBy: "Test User",
      totalAllocated: 2000,
      remainingAmount: 500,
      allocations: [{ envelopeName: "Rent" }, { envelopeName: "Food" }],
    };

    it("should render paycheck details", () => {
      render(<PaycheckHistoryItemCard paycheck={paycheck} />);
      expect(screen.getByText("Test Employer")).toBeInTheDocument();
      expect(screen.getByText("$2500")).toBeInTheDocument();
      expect(screen.getByText("Standard")).toBeInTheDocument(); // mode label
      expect(screen.getByText(/Jan 1, 2024/i)).toBeInTheDocument();
    });

    it("should call onDeletePaycheck when delete button is clicked", () => {
      const handleDelete = vi.fn();
      render(<PaycheckHistoryItemCard paycheck={paycheck} onDeletePaycheck={handleDelete} />);
      const deleteButton = screen.getByTitle("Delete historical paycheck");
      fireEvent.click(deleteButton);
      expect(handleDelete).toHaveBeenCalledWith(paycheck);
    });

    it("should show spinning loader when deleting", () => {
      render(
        <PaycheckHistoryItemCard
          paycheck={paycheck}
          deletingPaycheckId="p1"
          onDeletePaycheck={vi.fn()}
        />
      );
      const icons = screen.getAllByTestId("mock-icon");
      expect(icons.length).toBe(2); // User and Calendar icons remain, Trash icon is replaced
      expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    });
  });
});
