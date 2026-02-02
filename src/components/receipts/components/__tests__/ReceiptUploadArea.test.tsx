import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import ReceiptUploadArea from "../ReceiptUploadArea";

vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => () => <svg data-testid="mock-icon" />),
}));

vi.mock("react-dropzone", () => ({
  useDropzone: ({ onDrop }: any) => ({
    getRootProps: () => ({ onClick: vi.fn() }),
    getInputProps: () => ({ onChange: (e: any) => onDrop(e.target.files) }),
    isDragActive: false,
  }),
}));

describe("ReceiptUploadArea", () => {
  const defaultProps = {
    onFileSelect: vi.fn(),
    isProcessing: false,
    error: null,
    onDrop: vi.fn(),
    onDragOver: vi.fn(),
    fileInputRef: { current: null },
    cameraInputRef: { current: null },
    onFileInputChange: vi.fn(),
  };

  it("should render upload prompt", () => {
    render(<ReceiptUploadArea {...defaultProps} />);
    expect(screen.getByTestId("upload-instruction")).toBeInTheDocument();
  });
});
