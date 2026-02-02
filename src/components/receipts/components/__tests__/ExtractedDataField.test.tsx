import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import ExtractedDataField from "../ExtractedDataField";

vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => () => <svg data-testid="mock-icon" />),
}));

describe("ExtractedDataField", () => {
  const defaultProps = {
    label: "Test Label",
    fieldName: "testField",
    value: "Test Value",
    confidence: 0.9,
  };

  it("should render label and value", () => {
    render(<ExtractedDataField {...defaultProps} />);
    expect(screen.getByText("Test Label:")).toBeInTheDocument();
    expect(screen.getByText("Test Value")).toBeInTheDocument();
  });
});
