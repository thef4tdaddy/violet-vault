import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { HeroSection } from "../HeroSection";

// Mock the hook
vi.mock("@/hooks/marketing/useGitHubStats", () => ({
  useGitHubStats: () => ({
    data: { stargazers_count: 100, forks_count: 50 },
    isLoading: false,
    isError: false,
  }),
}));

describe("HeroSection", () => {
  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  it("renders the main headline correctly", () => {
    renderWithRouter(<HeroSection />);
    expect(screen.getByText("YOUR MONEY.")).toBeInTheDocument();
    expect(screen.getByText("YOUR PRIVACY.")).toBeInTheDocument();
    expect(screen.getByText("YOUR VAULT.")).toBeInTheDocument();
  });

  it("renders the subhead text", () => {
    renderWithRouter(<HeroSection />);
    expect(
      screen.getByText(/The open-source, local-first financial supervisor/i)
    ).toBeInTheDocument();
  });

  it("renders the CTA buttons with correct links", () => {
    renderWithRouter(<HeroSection />);

    // Check Launch Vault button
    const launchBtn = screen.getByRole("link", { name: /LAUNCH VAULT/i });
    expect(launchBtn).toBeInTheDocument();
    expect(launchBtn).toHaveAttribute("href", "/vault/dashboard");

    // Check Hyperspeed Demo button
    const demoBtn = screen.getByRole("link", { name: /Hyperspeed Demo/i });
    expect(demoBtn).toBeInTheDocument();
    expect(demoBtn).toHaveAttribute("href", "/demo");
  });

  it("renders the version badge", () => {
    renderWithRouter(<HeroSection />);
    expect(screen.getByText("V2.1 POLYGLOT ARCHITECTURE")).toBeInTheDocument();
  });

  it("renders the GitHub stats badge", () => {
    renderWithRouter(<HeroSection />);
    expect(screen.getByText("100 Stars")).toBeInTheDocument();
    expect(screen.getByText("50 Forks")).toBeInTheDocument();
  });
});
