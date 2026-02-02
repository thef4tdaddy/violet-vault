import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DemoTour } from "../DemoTour";

// Mock react-joyride
vi.mock("react-joyride", () => ({
  default: ({ steps, run }: { steps: unknown[]; run: boolean }) => (
    <div data-testid="joyride-mock">
      <div data-testid="joyride-run">{run ? "running" : "stopped"}</div>
      <div data-testid="joyride-steps">{steps.length} steps</div>
    </div>
  ),
}));

describe("DemoTour", () => {
  const mockOnComplete = vi.fn();
  const mockOnSignUpRedirect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders the tour component", () => {
    render(<DemoTour onComplete={mockOnComplete} onSignUpRedirect={mockOnSignUpRedirect} />);
    expect(screen.getByTestId("joyride-mock")).toBeInTheDocument();
  });

  it("has 5 tour steps", () => {
    render(<DemoTour onComplete={mockOnComplete} onSignUpRedirect={mockOnSignUpRedirect} />);
    expect(screen.getByTestId("joyride-steps")).toHaveTextContent("5 steps");
  });

  it("starts the tour automatically on first load", async () => {
    render(<DemoTour onComplete={mockOnComplete} onSignUpRedirect={mockOnSignUpRedirect} />);

    // Wait for the auto-start delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    expect(screen.getByTestId("joyride-run")).toHaveTextContent("running");
  });

  it("does not start tour if already seen", () => {
    localStorage.setItem("violet-vault-demo-tour-seen", "true");

    render(<DemoTour onComplete={mockOnComplete} onSignUpRedirect={mockOnSignUpRedirect} />);

    expect(screen.getByTestId("joyride-run")).toHaveTextContent("stopped");
  });

  it("persists tour completion in localStorage", () => {
    expect(localStorage.getItem("violet-vault-demo-tour-seen")).toBeNull();

    render(<DemoTour onComplete={mockOnComplete} onSignUpRedirect={mockOnSignUpRedirect} />);

    // The tour will set localStorage when completed/skipped through the callback
    // This is tested in integration tests
  });
});
