import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import ReceiptImagePreview from "../ReceiptImagePreview";

vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => () => <svg data-testid="mock-icon" />),
}));

describe("ReceiptImagePreview", () => {
  it("should render image when provided", () => {
    const uploadedImage = {
      url: "blob:test",
      name: "test.jpg",
      size: 1024,
    };

    render(
      <ReceiptImagePreview
        uploadedImage={uploadedImage}
        showImagePreview={true}
        onTogglePreview={vi.fn()}
      />
    );

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "blob:test");
    expect(screen.getByRole("heading", { name: /scanned receipt/i })).toBeInTheDocument();
  });

  it("should call onTogglePreview", () => {
    const uploadedImage = {
      url: "blob:test",
      name: "test.jpg",
      size: 1024,
    };
    const onTogglePreview = vi.fn();
    render(
      <ReceiptImagePreview
        uploadedImage={uploadedImage}
        showImagePreview={true}
        onTogglePreview={onTogglePreview}
      />
    );

    // Find toggle button using accessible role
    const button = screen.getByRole("button", { name: /hide image/i });
    fireEvent.click(button!);
    expect(onTogglePreview).toHaveBeenCalled();
  });
});
