import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ReportExportHeader from "../ReportExportHeader";

describe("ReportExportHeader", () => {
  it("renders header with title and description", () => {
    const mockOnClose = vi.fn();
    
    render(<ReportExportHeader onClose={mockOnClose} isExporting={false} />);
    
    expect(screen.getByText("Export Report")).toBeInTheDocument();
    expect(screen.getByText("Generate comprehensive analytics reports")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const mockOnClose = vi.fn();
    
    render(<ReportExportHeader onClose={mockOnClose} isExporting={false} />);
    
    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("disables close button when exporting", () => {
    const mockOnClose = vi.fn();
    
    render(<ReportExportHeader onClose={mockOnClose} isExporting={true} />);
    
    const closeButton = screen.getByRole("button");
    expect(closeButton).toBeDisabled();
  });
});