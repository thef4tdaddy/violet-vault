import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import PageSummaryCard from "../PageSummaryCard";

describe("PageSummaryCard", () => {
  const defaultProps = {
    label: "Total Balance",
    value: "$1,234.56",
    subtext: "Updated just now",
    color: "blue" as const,
  };

  it("should render label and value", () => {
    render(<PageSummaryCard {...defaultProps} />);
    expect(screen.getByText("Total Balance")).toBeInTheDocument();
    expect(screen.getByText("$1,234.56")).toBeInTheDocument();
    expect(screen.getByText("Updated just now")).toBeInTheDocument();
  });

  it("should apply correct color gradient class", () => {
    const { container } = render(<PageSummaryCard {...defaultProps} color="red" />);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("bg-linear-to-br");
    expect(card).toHaveClass("from-red-500");
  });

  it("should call onClick when provided", () => {
    const handleClick = vi.fn();
    render(<PageSummaryCard {...defaultProps} onClick={handleClick} />);
    const card = screen.getByRole("button");
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should render icon when provided", () => {
    const MockIcon = () => <svg data-testid="mock-icon" />;
    render(<PageSummaryCard {...defaultProps} icon={MockIcon} />);
    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
  });
});
