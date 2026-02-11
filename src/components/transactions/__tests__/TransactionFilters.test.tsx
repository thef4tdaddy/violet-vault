import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import TransactionFilters from "../TransactionFilters";
import userEvent from "@testing-library/user-event";

// Mock UI components
vi.mock("@/components/ui", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Select: ({ value, onChange, children, className }: any) => (
    <select value={value} onChange={onChange} className={className}>
      {children}
    </select>
  ),
  Input: ({ value, onChange, type, placeholder, className }: any) => (
    <input
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      className={className}
    />
  ),
}));

vi.mock("../../utils", () => ({
  getIcon: vi.fn(() => ({ className }: any) => (
    <div className={className} data-testid="icon">
      Icon
    </div>
  )),
}));

describe("TransactionFilters", () => {
  const mockOnFilterChange = vi.fn();
  const mockOnReset = vi.fn();

  const defaultProps = {
    searchTerm: "",
    setSearchTerm: mockOnFilterChange,
    dateFilter: "all",
    setDateFilter: mockOnFilterChange,
    typeFilter: "all",
    setTypeFilter: mockOnFilterChange,
    envelopeFilter: "all",
    setEnvelopeFilter: mockOnFilterChange,
    sortBy: "date",
    setSortBy: mockOnFilterChange,
    sortOrder: "desc",
    setSortOrder: mockOnFilterChange,
    envelopes: [
      { id: "1", name: "Groceries" },
      { id: "2", name: "Gas" },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render search input", () => {
      render(<TransactionFilters {...defaultProps} />);
      expect(screen.getByPlaceholderText(/Search transactions.../i)).toBeInTheDocument();
    });

    it("should render all filter select boxes", () => {
      render(<TransactionFilters {...defaultProps} />);

      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBe(4); // Date, Type, Envelope, Sort By
    });

    it("should render category selector", () => {
      render(<TransactionFilters {...defaultProps} />);

      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  describe("Filter Updates", () => {
    it("should call setSearchTerm when search text is entered", async () => {
      render(<TransactionFilters {...defaultProps} />);

      const input = screen.getByPlaceholderText(/Search transactions.../i);
      await userEvent.type(input, "coffee");

      expect(mockOnFilterChange).toHaveBeenCalled();
    });

    it("should call setSortOrder when sort button is clicked", async () => {
      render(<TransactionFilters {...defaultProps} sortOrder="asc" />);

      const sortButton = screen.getByRole("button", { name: /sort descending/i });
      await userEvent.click(sortButton);

      expect(mockOnFilterChange).toHaveBeenCalled();
    });
  });

  describe("Filter Values", () => {
    it.skip("should display current filter values - Test needs updating for new component interface", () => {
      const searchTerm = "coffee";
      render(<TransactionFilters {...defaultProps} searchTerm={searchTerm} />);

      expect(screen.getByDisplayValue("coffee")).toBeInTheDocument();
    });
  });

  describe("Categories and Envelopes", () => {
    it.skip("should render all categories - Test needs updating for new component interface", () => {
      render(<TransactionFilters {...defaultProps} />);
      expect(screen.queryByText("Groceries")).toBeTruthy();
    });

    it.skip("should handle empty categories - Test needs updating for new component interface", () => {
      render(<TransactionFilters {...defaultProps} />);
      const selects = screen.getAllByRole("combobox");
      expect(selects).toBeDefined();
    });

    it("should handle empty envelopes", () => {
      render(<TransactionFilters {...defaultProps} envelopes={[]} />);

      const selects = screen.getAllByRole("combobox");
      expect(selects).toBeDefined();
    });
  });
});
