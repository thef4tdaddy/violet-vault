/**
 * ActivityItem Component Tests
 *
 * Tests for the ActivityItem reusable row component.
 * Covers transaction, bill, and paycheck rendering, click interactions,
 * and visual indicators for various states.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ActivityItem, { type ActivityItemData } from "../ActivityItem";
import "@testing-library/jest-dom";

describe("ActivityItem", () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ========================================================================
  // Transaction Tests
  // ========================================================================
  describe("Transaction Rendering", () => {
    const transactionItem: ActivityItemData = {
      id: "txn-1",
      type: "transaction",
      date: new Date("2025-01-20"),
      title: "Coffee Shop",
      amount: -4.5,
      category: "Food & Drink",
      isIncome: false,
      originalData: {},
    };

    it("should render transaction with correct title", () => {
      render(<ActivityItem item={transactionItem} />);
      expect(screen.getByText("Coffee Shop")).toBeInTheDocument();
    });

    it("should render transaction with correct amount", () => {
      render(<ActivityItem item={transactionItem} />);
      expect(screen.getByText("$4.50")).toBeInTheDocument();
    });

    it("should render transaction category", () => {
      render(<ActivityItem item={transactionItem} />);
      expect(screen.getByText("Food & Drink")).toBeInTheDocument();
    });

    it("should render expense with red amount color", () => {
      const { container } = render(<ActivityItem item={transactionItem} />);
      const amountElement = container.querySelector(".text-red-600");
      expect(amountElement).toBeInTheDocument();
    });

    it("should render income with green amount and plus sign", () => {
      const incomeItem: ActivityItemData = {
        ...transactionItem,
        amount: 100,
        isIncome: true,
        title: "Refund",
      };
      render(<ActivityItem item={incomeItem} />);
      expect(screen.getByText("+$100.00")).toBeInTheDocument();
    });

    it("should render income with green styling", () => {
      const incomeItem: ActivityItemData = {
        ...transactionItem,
        amount: 100,
        isIncome: true,
      };
      const { container } = render(<ActivityItem item={incomeItem} />);
      const amountElement = container.querySelector(".text-green-600");
      expect(amountElement).toBeInTheDocument();
    });
  });

  // ========================================================================
  // Bill Tests
  // ========================================================================
  describe("Bill Rendering", () => {
    const billItem: ActivityItemData = {
      id: "bill-1",
      type: "bill",
      date: new Date("2025-01-25"),
      title: "Electric Bill",
      amount: 150,
      category: "Utilities",
      isIncome: false,
      billStatus: "upcoming",
      isPaid: false,
      originalData: {},
    };

    it("should render bill with correct title", () => {
      render(<ActivityItem item={billItem} />);
      expect(screen.getByText("Electric Bill")).toBeInTheDocument();
    });

    it("should render bill with correct amount", () => {
      render(<ActivityItem item={billItem} />);
      expect(screen.getByText("$150.00")).toBeInTheDocument();
    });

    it("should render overdue bill with red indicator", () => {
      const overdueItem: ActivityItemData = {
        ...billItem,
        billStatus: "overdue",
        date: new Date("2025-01-10"),
      };
      const { container } = render(<ActivityItem item={overdueItem} />);
      expect(container.querySelector(".bg-red-50")).toBeInTheDocument();
    });

    it("should render due-soon bill with yellow indicator", () => {
      const dueSoonItem: ActivityItemData = {
        ...billItem,
        billStatus: "due-soon",
      };
      const { container } = render(<ActivityItem item={dueSoonItem} />);
      expect(container.querySelector(".bg-yellow-50")).toBeInTheDocument();
    });

    it("should render upcoming bill with default styling", () => {
      const { container } = render(<ActivityItem item={billItem} />);
      expect(container.querySelector(".bg-purple-50")).toBeInTheDocument();
    });

    it("should render paid bill with check icon", () => {
      const paidItem: ActivityItemData = {
        ...billItem,
        isPaid: true,
      };
      const { container } = render(<ActivityItem item={paidItem} />);
      expect(container.querySelector(".text-green-500")).toBeInTheDocument();
    });
  });

  // ========================================================================
  // Paycheck Tests
  // ========================================================================
  describe("Paycheck Rendering", () => {
    const paycheckItem: ActivityItemData = {
      id: "paycheck-1",
      type: "paycheck",
      date: new Date("2025-01-15"),
      title: "Acme Corp",
      amount: 2500,
      category: "Income",
      isIncome: true,
      allocationStatus: "allocated",
      originalData: {},
    };

    it("should render paycheck with correct title", () => {
      render(<ActivityItem item={paycheckItem} />);
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    });

    it("should render paycheck with correct amount and + sign for income", () => {
      render(<ActivityItem item={paycheckItem} />);
      expect(screen.getByText("+$2500.00")).toBeInTheDocument();
    });

    it("should render allocated paycheck with check icon", () => {
      const { container } = render(<ActivityItem item={paycheckItem} />);
      expect(container.querySelector(".text-green-500")).toBeInTheDocument();
    });

    it("should render partial allocation with yellow icon", () => {
      const partialItem: ActivityItemData = {
        ...paycheckItem,
        allocationStatus: "partial",
      };
      const { container } = render(<ActivityItem item={partialItem} />);
      expect(container.querySelector(".text-yellow-500")).toBeInTheDocument();
    });

    it("should render unallocated paycheck with orange icon", () => {
      const unallocatedItem: ActivityItemData = {
        ...paycheckItem,
        allocationStatus: "unallocated",
      };
      const { container } = render(<ActivityItem item={unallocatedItem} />);
      expect(container.querySelector(".text-orange-500")).toBeInTheDocument();
    });

    it("should have green styling for paychecks", () => {
      const { container } = render(<ActivityItem item={paycheckItem} />);
      expect(container.querySelector(".bg-green-50")).toBeInTheDocument();
    });
  });

  // ========================================================================
  // Date Formatting Tests
  // ========================================================================
  describe("Date Formatting", () => {
    it("should display 'Today' for current date", () => {
      const todayItem: ActivityItemData = {
        id: "txn-today",
        type: "transaction",
        date: new Date(),
        title: "Today Transaction",
        amount: -10,
        isIncome: false,
        originalData: {},
      };
      render(<ActivityItem item={todayItem} />);
      expect(screen.getByText("Today")).toBeInTheDocument();
    });

    it("should display 'Yesterday' for previous day", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayItem: ActivityItemData = {
        id: "txn-yesterday",
        type: "transaction",
        date: yesterday,
        title: "Yesterday Transaction",
        amount: -10,
        isIncome: false,
        originalData: {},
      };
      render(<ActivityItem item={yesterdayItem} />);
      expect(screen.getByText("Yesterday")).toBeInTheDocument();
    });

    it("should display 'Tomorrow' for next day", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowItem: ActivityItemData = {
        id: "bill-tomorrow",
        type: "bill",
        date: tomorrow,
        title: "Tomorrow Bill",
        amount: 50,
        isIncome: false,
        billStatus: "upcoming",
        originalData: {},
      };
      render(<ActivityItem item={tomorrowItem} />);
      expect(screen.getByText("Tomorrow")).toBeInTheDocument();
    });

    it("should display formatted date for other dates", () => {
      const pastDate = new Date("2025-01-10");
      const pastItem: ActivityItemData = {
        id: "txn-past",
        type: "transaction",
        date: pastDate,
        title: "Past Transaction",
        amount: -10,
        isIncome: false,
        originalData: {},
      };
      render(<ActivityItem item={pastItem} />);
      expect(screen.getByText("Jan 10")).toBeInTheDocument();
    });
  });

  // ========================================================================
  // Click Interaction Tests
  // ========================================================================
  describe("Click Interactions", () => {
    const clickableItem: ActivityItemData = {
      id: "txn-click",
      type: "transaction",
      date: new Date(),
      title: "Clickable Item",
      amount: -25,
      isIncome: false,
      originalData: {},
    };

    it("should call onClick when clicked", () => {
      render(<ActivityItem item={clickableItem} onClick={mockOnClick} />);
      fireEvent.click(screen.getByText("Clickable Item"));
      expect(mockOnClick).toHaveBeenCalledWith(clickableItem);
    });

    it("should call onClick when Enter key is pressed", () => {
      render(<ActivityItem item={clickableItem} onClick={mockOnClick} />);
      const element = screen.getByTestId(`activity-item-${clickableItem.id}`);
      fireEvent.keyDown(element, { key: "Enter" });
      expect(mockOnClick).toHaveBeenCalledWith(clickableItem);
    });

    it("should call onClick when Space key is pressed", () => {
      render(<ActivityItem item={clickableItem} onClick={mockOnClick} />);
      const element = screen.getByTestId(`activity-item-${clickableItem.id}`);
      fireEvent.keyDown(element, { key: " " });
      expect(mockOnClick).toHaveBeenCalledWith(clickableItem);
    });

    it("should have cursor-pointer when onClick is provided", () => {
      const { container } = render(<ActivityItem item={clickableItem} onClick={mockOnClick} />);
      expect(container.querySelector(".cursor-pointer")).toBeInTheDocument();
    });

    it("should not have cursor-pointer when no onClick", () => {
      const { container } = render(<ActivityItem item={clickableItem} />);
      expect(container.querySelector(".cursor-pointer")).not.toBeInTheDocument();
    });

    it("should have button role when onClick is provided", () => {
      render(<ActivityItem item={clickableItem} onClick={mockOnClick} />);
      const element = screen.getByTestId(`activity-item-${clickableItem.id}`);
      expect(element).toHaveAttribute("role", "button");
    });

    it("should be focusable when onClick is provided", () => {
      render(<ActivityItem item={clickableItem} onClick={mockOnClick} />);
      const element = screen.getByTestId(`activity-item-${clickableItem.id}`);
      expect(element).toHaveAttribute("tabIndex", "0");
    });
  });

  // ========================================================================
  // Accessibility Tests
  // ========================================================================
  describe("Accessibility", () => {
    const accessibleItem: ActivityItemData = {
      id: "txn-a11y",
      type: "transaction",
      date: new Date(),
      title: "Accessible Item",
      amount: -50,
      isIncome: false,
      originalData: {},
    };

    it("should have appropriate aria-label", () => {
      render(<ActivityItem item={accessibleItem} onClick={mockOnClick} />);
      const element = screen.getByTestId(`activity-item-${accessibleItem.id}`);
      expect(element).toHaveAttribute("aria-label", "transaction: Accessible Item, $50.00");
    });

    it("should have data-testid attribute", () => {
      render(<ActivityItem item={accessibleItem} />);
      expect(screen.getByTestId(`activity-item-${accessibleItem.id}`)).toBeInTheDocument();
    });
  });

  // ========================================================================
  // Edge Cases
  // ========================================================================
  describe("Edge Cases", () => {
    it("should handle zero amount", () => {
      const zeroItem: ActivityItemData = {
        id: "txn-zero",
        type: "transaction",
        date: new Date(),
        title: "Zero Transaction",
        amount: 0,
        isIncome: false,
        originalData: {},
      };
      render(<ActivityItem item={zeroItem} />);
      expect(screen.getByText("$0.00")).toBeInTheDocument();
    });

    it("should handle very long title by truncating", () => {
      const longTitleItem: ActivityItemData = {
        id: "txn-long",
        type: "transaction",
        date: new Date(),
        title: "This is a very long transaction title that should be truncated in the UI",
        amount: -10,
        isIncome: false,
        originalData: {},
      };
      const { container } = render(<ActivityItem item={longTitleItem} />);
      expect(container.querySelector(".truncate")).toBeInTheDocument();
    });

    it("should handle missing category gracefully", () => {
      const noCategoryItem: ActivityItemData = {
        id: "txn-no-cat",
        type: "transaction",
        date: new Date(),
        title: "No Category",
        amount: -10,
        isIncome: false,
        originalData: {},
      };
      render(<ActivityItem item={noCategoryItem} />);
      expect(screen.queryByText("•")).not.toBeInTheDocument();
    });

    it("should handle additional className", () => {
      const item: ActivityItemData = {
        id: "txn-class",
        type: "transaction",
        date: new Date(),
        title: "Custom Class",
        amount: -10,
        isIncome: false,
        originalData: {},
      };
      const { container } = render(<ActivityItem item={item} className="custom-class" />);
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });

    it("should handle large amounts", () => {
      const largeAmountItem: ActivityItemData = {
        id: "txn-large",
        type: "transaction",
        date: new Date(),
        title: "Large Amount",
        amount: -99999.99,
        isIncome: false,
        originalData: {},
      };
      render(<ActivityItem item={largeAmountItem} />);
      expect(screen.getByText("$99999.99")).toBeInTheDocument();
    });
  });
});
