import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { GoEngineDemo } from "../components/GoEngineDemo";

// Mock icon utility
vi.mock("@/utils/ui/icons", () => ({
  getIcon: () => () => <svg data-testid="icon-zap" />,
}));

describe("GoEngineDemo", () => {
  it("renders the component title and description", () => {
    render(<GoEngineDemo />);
    expect(screen.getByText("GO ENGINE")).toBeInTheDocument();
    expect(screen.getByText("6,000 TX/SEC PROCESSING POWER")).toBeInTheDocument();
  });

  it("displays initial transaction count of 0", () => {
    render(<GoEngineDemo />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("shows the run demo button", () => {
    render(<GoEngineDemo />);
    const button = screen.getByRole("button", { name: /RUN DEMO/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("starts processing when run demo is clicked", async () => {
    render(<GoEngineDemo />);
    const button = screen.getByRole("button", { name: /RUN DEMO/i });

    fireEvent.click(button);

    // Button should be disabled during processing
    expect(button).toBeDisabled();

    // Button text should change
    await waitFor(() => {
      expect(button).toHaveTextContent(/PROCESSING/i);
    });
  });

  it("displays performance metrics", () => {
    render(<GoEngineDemo />);
    expect(screen.getByText("6,000")).toBeInTheDocument();
    expect(screen.getByText("TX/SEC")).toBeInTheDocument();
    expect(screen.getByText("<10ms")).toBeInTheDocument();
    expect(screen.getByText("LATENCY")).toBeInTheDocument();
    expect(screen.getByText("99.9%")).toBeInTheDocument();
    expect(screen.getByText("UPTIME")).toBeInTheDocument();
  });

  it("updates button text when demo starts", () => {
    render(<GoEngineDemo />);
    const button = screen.getByRole("button", { name: /RUN DEMO/i });

    // Initial state
    expect(button).not.toBeDisabled();

    fireEvent.click(button);

    // After click, button should be disabled and show processing state
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/PROCESSING/i);
  });
});
