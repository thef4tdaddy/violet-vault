import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import DebtCardProgressBar from "../DebtCardProgressBar";

describe("DebtCardProgressBar", () => {
  it("should render progress information when hasProgress is true", () => {
    render(<DebtCardProgressBar progressData={{ hasProgress: true, percentage: 45 }} />);

    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("45%")).toBeInTheDocument();
  });

  it("should render error message when hasProgress is false", () => {
    render(<DebtCardProgressBar progressData={{ hasProgress: false, percentage: 0 }} />);

    expect(screen.getByText("No progress data")).toBeInTheDocument();
  });

  it("should clamp percentage display at 100% visually in width style but show actual text", () => {
    // NOTE: Component implementation:
    // style={{ width: `${Math.min(percentage, 100)}%` }}
    // text: <span>{percentage.toFixed(0)}%</span>

    const { container } = render(
      <DebtCardProgressBar progressData={{ hasProgress: true, percentage: 120 }} />
    );

    expect(screen.getByText("120%")).toBeInTheDocument();

    // Check the width style is capped
    // We can access via class or inspecting styles
    const progressBar = container.querySelector(".bg-green-500");
    expect(progressBar).toHaveStyle({ width: "100%" });
  });

  it("should display 0% correctly", () => {
    render(<DebtCardProgressBar progressData={{ hasProgress: true, percentage: 0 }} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
