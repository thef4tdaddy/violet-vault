import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AllocationStrategyStep from "../AllocationStrategyStep";

describe("AllocationStrategyStep", () => {
  const mockProps = {
    onNext: vi.fn(),
    onBack: vi.fn(),
    onFinish: vi.fn(),
  };

  it("should render placeholder content correctly", () => {
    render(<AllocationStrategyStep {...mockProps} />);

    expect(screen.getByText(/HOW DO YOU WANT TO ALLOCATE\?/i)).toBeInTheDocument();
    expect(screen.getByText(/USE LAST SPLIT/i)).toBeInTheDocument();
    expect(screen.getByText(/SPLIT EVENLY/i)).toBeInTheDocument();
    expect(screen.getByText(/SMART SPLIT/i)).toBeInTheDocument();
  });

  it("should display the placeholder warning note", () => {
    render(<AllocationStrategyStep {...mockProps} />);

    expect(screen.getByText(/Placeholder Component/i)).toBeInTheDocument();
    expect(screen.getByText(/Full implementation coming in Issue #162/i)).toBeInTheDocument();
  });

  it("should render the allocation list items", () => {
    render(<AllocationStrategyStep {...mockProps} />);

    expect(screen.getByText("Rent")).toBeInTheDocument();
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Utilities")).toBeInTheDocument();
    expect(screen.getByText("Savings")).toBeInTheDocument();
  });
});
