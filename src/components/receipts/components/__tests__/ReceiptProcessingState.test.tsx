import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import ReceiptProcessingState from "../ReceiptProcessingState";

vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => () => <svg data-testid="mock-icon" />),
}));

describe("ReceiptProcessingState", () => {
  it("should render processing message", () => {
    render(<ReceiptProcessingState />);
    expect(screen.getByTestId("processing-message")).toBeInTheDocument();
    expect(screen.getByText(/Using AI to extract/i)).toBeInTheDocument();
  });
});
