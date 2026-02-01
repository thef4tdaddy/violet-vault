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
    expect(screen.getByText("React 19")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Go 1.22")).toBeInTheDocument();
    expect(screen.getByText("Python 3.12")).toBeInTheDocument();
  });
});
