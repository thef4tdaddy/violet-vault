import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import TransactionPagination from "../TransactionPagination";

// Mock Button component
vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick, disabled, className, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} className={className} {...props}>
      {children}
    </button>
  ),
}));

describe("TransactionPagination", () => {
  const defaultProps = {
    currentPage: 2,
    totalPages: 5,
    onPageChange: vi.fn(),
  };

  it("should render current page and total pages", () => {
    render(<TransactionPagination {...defaultProps} />);
    expect(screen.getByText(/Page 2 of 5/i)).toBeInTheDocument();
  });

  it("should call onPageChange when buttons are clicked", () => {
    render(<TransactionPagination {...defaultProps} />);

    const prevButton = screen.getByText("Previous");
    const nextButton = screen.getByText("Next");

    fireEvent.click(prevButton);
    expect(defaultProps.onPageChange).toHaveBeenCalledWith("prev");

    fireEvent.click(nextButton);
    expect(defaultProps.onPageChange).toHaveBeenCalledWith("next");
  });

  it("should disable previous button on first page", () => {
    render(<TransactionPagination {...defaultProps} currentPage={1} />);
    const prevButton = screen.getByText("Previous");
    expect(prevButton).toBeDisabled();
  });

  it("should disable next button on last page", () => {
    render(<TransactionPagination {...defaultProps} currentPage={5} />);
    const nextButton = screen.getByText("Next");
    expect(nextButton).toBeDisabled();
  });
});
