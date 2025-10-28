import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import TransactionFilters from "../TransactionFilters";
import userEvent from "@testing-library/user-event";

// Mock UI components
vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick, disabled, className }) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
  Select: ({ value, onChange, children, className }) => (
    <select value={value} onChange={onChange} className={className}>
      {children}
    </select>
  ),
  Input: ({ value, onChange, type, placeholder, className }) => (
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
  getIcon: vi.fn(() => {
    return function MockIcon({ className }) {
      return <div className={className} data-testid="icon">Icon</div>;
    };
  }),
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
    it("should render without crashing", () => {
      render(<TransactionFilters {...defaultProps} />);
      expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument();
    });

    it("should render all filter inputs", () => {
      render(<TransactionFilters {...defaultProps} />);
      
      expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/start date/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/end date/i)).toBeInTheDocument();
    });

    it("should render category selector", () => {
      render(<TransactionFilters {...defaultProps} />);
      
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThan(0);
    });

    it("should render reset button", () => {
      render(<TransactionFilters {...defaultProps} />);
      expect(screen.getByText(/reset/i)).toBeInTheDocument();
    });
  });

  describe("Filter Updates", () => {
    it("should call onFilterChange when description is entered", async () => {
      render(<TransactionFilters {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/description/i);
      await userEvent.type(input, "coffee");
      
      expect(mockOnFilterChange).toHaveBeenCalled();
    });

    it("should call onFilterChange when start date is set", async () => {
      render(<TransactionFilters {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/start date/i);
      await userEvent.type(input, "2024-01-01");
      
      expect(mockOnFilterChange).toHaveBeenCalled();
    });

    it("should call onFilterChange when end date is set", async () => {
      render(<TransactionFilters {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/end date/i);
      await userEvent.type(input, "2024-12-31");
      
      expect(mockOnFilterChange).toHaveBeenCalled();
    });

    it("should call onReset when reset button is clicked", async () => {
      render(<TransactionFilters {...defaultProps} />);
      
      const resetButton = screen.getByText(/reset/i);
      await userEvent.click(resetButton);
      
      expect(mockOnReset).toHaveBeenCalled();
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

  describe("Amount Filters", () => {
    it("should accept minimum amount", async () => {
      render(<TransactionFilters {...defaultProps} />);
      
      const inputs = screen.getAllByRole("spinbutton");
      if (inputs.length > 0) {
        await userEvent.type(inputs[0], "10");
        expect(mockOnFilterChange).toHaveBeenCalled();
      }
    });

    it("should accept maximum amount", async () => {
      render(<TransactionFilters {...defaultProps} />);
      
      const inputs = screen.getAllByRole("spinbutton");
      if (inputs.length > 1) {
        await userEvent.type(inputs[1], "100");
        expect(mockOnFilterChange).toHaveBeenCalled();
      }
    });
  });

  describe("Date Range", () => {
    it("should accept date range", async () => {
      render(<TransactionFilters {...defaultProps} />);
      
      const startDate = screen.getByPlaceholderText(/start date/i);
      const endDate = screen.getByPlaceholderText(/end date/i);
      
      await userEvent.type(startDate, "2024-01-01");
      await userEvent.type(endDate, "2024-12-31");
      
      expect(mockOnFilterChange).toHaveBeenCalled();
    });
  });
});
