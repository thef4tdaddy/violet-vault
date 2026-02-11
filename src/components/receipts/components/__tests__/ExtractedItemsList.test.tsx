import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import ExtractedItemsList from "../ExtractedItemsList";

vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => () => <svg data-testid="mock-icon" />),
}));

vi.mock("@/utils/features/receipts/receiptHelpers", () => ({
  formatCurrency: (val: number) => `$${val}`,
}));

describe("ExtractedItemsList", () => {
  const defaultProps = {
    items: [
      { description: "Item 1", amount: 10.0 },
      { description: "Item 2", amount: 5.0 },
    ],
  };

  it("should render items", () => {
    render(<ExtractedItemsList {...defaultProps} />);
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("$10.00")).toBeInTheDocument();
  });

  it("should render empty state", () => {
    const { container } = render(<ExtractedItemsList items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
