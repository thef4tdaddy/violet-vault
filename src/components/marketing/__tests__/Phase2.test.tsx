import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { ComparisonSection } from "../ComparisonSection";
import { TechStackBar } from "../TechStackBar";

describe("ComparisonSection", () => {
  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  it("renders both cards", () => {
    renderWithRouter(<ComparisonSection />);
    expect(screen.getByText("THE VAULT")).toBeInTheDocument();
    expect(screen.getByText("HYPERSPEED")).toBeInTheDocument();
  });

  it("renders feature lists", () => {
    renderWithRouter(<ComparisonSection />);
    expect(screen.getByText(/End-to-End Encrypted Persistence/i)).toBeInTheDocument();
    expect(screen.getByText(/Volatile In-Memory Storage/i)).toBeInTheDocument();
  });

  it("has correct links", () => {
    renderWithRouter(<ComparisonSection />);
    const vaultLink = screen.getByRole("link", { name: /LAUNCH PRODUCTION/i });
    const demoLink = screen.getByRole("link", { name: /ENTER THE SIMULATION/i });

    expect(vaultLink).toHaveAttribute("href", "/vault/dashboard");
    expect(demoLink).toHaveAttribute("href", "/demo");
  });
});

describe("TechStackBar", () => {
  it("renders all tech labels", () => {
    render(<TechStackBar />);
    // Since we use infinite marquee duplication, there will be multiple instances of each label.
    expect(screen.getAllByText("React 19").length).toBeGreaterThan(0);
    expect(screen.getAllByText("TypeScript").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Go 1.22").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Python 3.12").length).toBeGreaterThan(0);
  });
});
