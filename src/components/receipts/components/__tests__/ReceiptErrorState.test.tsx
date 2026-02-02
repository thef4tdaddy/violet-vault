import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import ReceiptErrorState from "../ReceiptErrorState";

vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => () => <svg data-testid="mock-icon" />),
}));

vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

describe("ReceiptErrorState", () => {
  const defaultProps = {
    error: "Something went wrong",
    onRetry: vi.fn(),
  };

  it("should render error message", () => {
    render(<ReceiptErrorState {...defaultProps} />);
    expect(screen.getByTestId("error-title")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("should render try again button", () => {
    render(<ReceiptErrorState {...defaultProps} />);
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });
});
