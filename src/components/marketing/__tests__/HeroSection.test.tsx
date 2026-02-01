import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { HeroSection } from "../HeroSection";

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

    // Check Hypserspeed Demo button
    const demoBtn = screen.getByRole("link", { name: /HYPERSPEED DEMO/i });
    expect(demoBtn).toBeInTheDocument();
    expect(demoBtn).toHaveAttribute("href", "/demo");
  });

  it("renders the version badge", () => {
    renderWithRouter(<HeroSection />);
    expect(screen.getByText("V2.1 POLYGLOT ARCHITECTURE")).toBeInTheDocument();
  });
});
