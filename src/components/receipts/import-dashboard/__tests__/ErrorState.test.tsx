/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ErrorState from "../ErrorState";

describe("ErrorState", () => {
  it("should render error message and default title", () => {
    render(<ErrorState message="Something went wrong" />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Error")).toBeInTheDocument(); // Default title
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("should render custom title", () => {
    render(<ErrorState title="Failed to Upload" message="Network error" />);

    expect(screen.getByText("Failed to Upload")).toBeInTheDocument();
  });

  it("should render retry button when onRetry is provided", () => {
    const mockRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={mockRetry} />);

    const button = screen.getByRole("button", { name: /try again/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockRetry).toHaveBeenCalled();
  });

  it("should not render retry button when onRetry is undefined", () => {
    render(<ErrorState message="Error" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should show loading state when isRetrying is true", () => {
    const mockRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={mockRetry} isRetrying={true} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/retrying/i);
  });

  it("should apply custom className", () => {
    render(<ErrorState message="Error" className="custom-error-class" />);
    expect(screen.getByTestId("error-state")).toHaveClass("custom-error-class");
  });
});
