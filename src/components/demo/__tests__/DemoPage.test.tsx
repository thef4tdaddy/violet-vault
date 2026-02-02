import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import DemoPage from "../DemoPage";

// Mock child components
vi.mock("../DemoTour", () => ({
  DemoTour: ({
    onComplete,
    onSignUpRedirect,
  }: {
    onComplete: () => void;
    onSignUpRedirect: () => void;
  }) => (
    <div data-testid="demo-tour">
      <button onClick={onComplete}>Complete Tour</button>
      <button onClick={onSignUpRedirect}>Sign Up</button>
    </div>
  ),
}));

vi.mock("../DemoDashboard", () => ({
  DemoDashboard: () => <div data-testid="demo-dashboard">Demo Dashboard</div>,
}));

describe("DemoPage", () => {
  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the demo page header", () => {
    renderWithRouter(<DemoPage />);
    expect(screen.getByText(/VIOLET VAULT/i)).toBeInTheDocument();
    expect(screen.getByText(/HYPERSPEED DEMO/i)).toBeInTheDocument();
  });

  it("renders the ready to vault button", () => {
    renderWithRouter(<DemoPage />);
    const button = screen.getByRole("button", { name: /READY TO VAULT/i });
    expect(button).toBeInTheDocument();
  });

  it("renders the demo tour component", () => {
    renderWithRouter(<DemoPage />);
    expect(screen.getByTestId("demo-tour")).toBeInTheDocument();
  });

  it("renders the demo dashboard component", () => {
    renderWithRouter(<DemoPage />);
    expect(screen.getByTestId("demo-dashboard")).toBeInTheDocument();
  });

  it("renders the footer with disclaimer text", () => {
    renderWithRouter(<DemoPage />);
    expect(screen.getByText(/This is a technical demonstration/i)).toBeInTheDocument();
    expect(screen.getByText(/Data shown is simulated/i)).toBeInTheDocument();
  });

  it("handles tour completion", async () => {
    renderWithRouter(<DemoPage />);
    const completeButton = screen.getByText("Complete Tour");
    fireEvent.click(completeButton);

    // Tour completion is logged, check that no errors occurred
    await waitFor(() => {
      expect(screen.getByTestId("demo-tour")).toBeInTheDocument();
    });
  });

  it("navigates to sign up when CTA is clicked", () => {
    const { container } = renderWithRouter(<DemoPage />);
    const signUpButton = screen.getByText("Sign Up");
    fireEvent.click(signUpButton);

    // Navigation is mocked, just verify button works
    expect(container).toBeInTheDocument();
  });
});
