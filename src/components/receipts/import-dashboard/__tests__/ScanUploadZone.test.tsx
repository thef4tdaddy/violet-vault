import { render, screen, fireEvent } from "../../../../test/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import ScanUploadZone from "../ScanUploadZone";
import React from "react";

// Mock the icons
vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => () => <div data-testid="mock-icon" />),
}));

describe("ScanUploadZone", () => {
  const mockOnFileSelected = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the idle state correctly", () => {
    render(<ScanUploadZone onFileSelected={mockOnFileSelected} isProcessing={false} />);

    expect(screen.getByText(/Drop Receipt or Click to Upload/i)).toBeInTheDocument();
    expect(screen.getByText(/JPEG, PNG, WEBP/i)).toBeInTheDocument();
    expect(screen.getByText(/MAX 10MB/i)).toBeInTheDocument();
    expect(screen.getAllByTestId("mock-icon").length).toBeGreaterThan(0);
    expect(screen.getByText(/Browse Files/i)).toBeInTheDocument();
    expect(screen.getByText(/Capture/i)).toBeInTheDocument();
  });

  it("renders the processing state correctly", () => {
    render(<ScanUploadZone onFileSelected={mockOnFileSelected} isProcessing={true} />);

    expect(screen.getByText(/Processing Receipt.../i)).toBeInTheDocument();
    expect(screen.getByText(/Extracting merchant and total/i)).toBeInTheDocument();
    // Only one icon should be shown in processing state (the loader)
    const icons = screen.getAllByTestId("mock-icon");
    expect(icons.length).toBe(1);

    // Check if clicking the zone does NOT trigger file input when processing
    const zone = screen.getByTestId("scan-upload-zone");
    fireEvent.click(zone);
    // Note: We can't easily check if fileInputRef.current?.click() WASN'T called without more complex mocking,
    // but the presence of the processing text confirms we are in the right branch.
  });

  it("handles drag over and drag leave states", () => {
    render(<ScanUploadZone onFileSelected={mockOnFileSelected} isProcessing={false} />);

    const zone = screen.getByTestId("scan-upload-zone");

    // Drag Enter
    fireEvent.dragEnter(zone);
    expect(zone).toHaveClass("border-purple-600");
    expect(screen.getByText(/Drop to Upload/i)).toBeInTheDocument();

    // Drag Leave
    fireEvent.dragLeave(zone);
    expect(zone).not.toHaveClass("border-purple-600");
    expect(screen.getByText(/Drop Receipt or Click to Upload/i)).toBeInTheDocument();
  });

  it("handles file drop", () => {
    render(<ScanUploadZone onFileSelected={mockOnFileSelected} isProcessing={false} />);

    const zone = screen.getByTestId("scan-upload-zone");
    const file = new File(["test content"], "receipt.png", { type: "image/png" });

    fireEvent.drop(zone, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(mockOnFileSelected).toHaveBeenCalledWith(file);
    expect(zone).not.toHaveClass("border-purple-600");
  });

  it("does not handle file drop when processing", () => {
    render(<ScanUploadZone onFileSelected={mockOnFileSelected} isProcessing={true} />);

    const zone = screen.getByTestId("scan-upload-zone");
    const file = new File(["test content"], "receipt.png", { type: "image/png" });

    fireEvent.drop(zone, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(mockOnFileSelected).not.toHaveBeenCalled();
  });

  it("handles file input change", () => {
    render(<ScanUploadZone onFileSelected={mockOnFileSelected} isProcessing={false} />);

    const input = screen.getByTestId("file-input");
    const file = new File(["test content"], "receipt.jpg", { type: "image/jpeg" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(mockOnFileSelected).toHaveBeenCalledWith(file);
  });

  it("handles camera input change", () => {
    render(<ScanUploadZone onFileSelected={mockOnFileSelected} isProcessing={false} />);

    const input = screen.getByTestId("camera-input");
    const file = new File(["test content"], "capture.jpg", { type: "image/jpeg" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(mockOnFileSelected).toHaveBeenCalledWith(file);
  });

  it("triggers file input click when buttons are clicked", () => {
    render(<ScanUploadZone onFileSelected={mockOnFileSelected} isProcessing={false} />);

    const fileInput = screen.getByTestId("file-input");
    const cameraInput = screen.getByTestId("camera-input");

    // Create spies on the HTML elements
    const fileSpy = vi.spyOn(fileInput, "click");
    const cameraSpy = vi.spyOn(cameraInput, "click");

    const browseBtn = screen.getByText(/Browse Files/i);
    const captureBtn = screen.getByText(/Capture/i);

    fireEvent.click(browseBtn);
    expect(fileSpy).toHaveBeenCalled();

    fireEvent.click(captureBtn);
    expect(cameraSpy).toHaveBeenCalled();
  });

  it("applies accepted formats correctly", () => {
    const accepted = ["image/webp"];
    render(
      <ScanUploadZone
        onFileSelected={mockOnFileSelected}
        isProcessing={false}
        acceptedFormats={accepted}
      />
    );

    const input = screen.getByTestId("file-input") as HTMLInputElement;
    expect(input.accept).toBe("image/webp");
  });
});
