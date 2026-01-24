import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import StandardFilters, { type FilterConfig } from "./StandardFilters";

// Mock the getIcon utility
vi.mock("@/utils/ui/icons", () => ({
  getIcon: vi.fn(() => () => <svg data-testid="mock-icon" />),
}));

describe("StandardFilters", () => {
  const filterConfigs: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "all", label: "All" },
        { value: "active", label: "Active" },
      ],
    },
    { key: "search", label: "Search", type: "text", placeholder: "Search here" },
    { key: "showPaid", label: "Show Paid", type: "checkbox" },
  ];

  const defaultProps = {
    filters: {},
    filterConfigs,
    onFilterChange: vi.fn(),
    onSearchChange: vi.fn(),
  };

  it("should render correctly", () => {
    render(<StandardFilters {...defaultProps} />);
    expect(screen.getByText("Filters & Sorting")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("should call onSearchChange when search input changes", () => {
    render(<StandardFilters {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText("Search...");
    fireEvent.change(searchInput, { target: { value: "test" } });
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith("test");
  });

  it("should expand and show filters when 'Show' is clicked", () => {
    render(<StandardFilters {...defaultProps} />);
    const showButton = screen.getByText("Show");
    fireEvent.click(showButton);

    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Show Paid")).toBeInTheDocument();
  });

  it("should call onFilterChange when a filter value changes", () => {
    render(<StandardFilters {...defaultProps} mode="inline" />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "active" } });
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith("status", "active");
  });
});
