import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ReportExporter from "../../ReportExporter";

// Mock the hook to avoid external dependencies
vi.mock("../../../hooks/analytics/useReportExporter", () => ({
  useReportExporter: () => ({
    exportFormat: "pdf",
    exportOptions: {
      includeSummary: true,
      includeCharts: true,
      includeTransactions: false,
      includeEnvelopes: true,
      includeSavings: true,
      includeInsights: true,
    },
    isExporting: false,
    exportProgress: 0,
    setExportFormat: vi.fn(),
    setExportOptions: vi.fn(),
    handleExport: vi.fn(),
    applyTemplate: vi.fn(),
  }),
}));

describe("ReportExporter Integration", () => {
  const mockProps = {
    analyticsData: {},
    balanceData: {},
    timeFilter: "30 Days",
    onExport: vi.fn(),
    onClose: vi.fn(),
  };

  it("renders all component sections", () => {
    render(<ReportExporter {...mockProps} />);
    
    // Header
    expect(screen.getByRole("heading", { name: /Export Report/i })).toBeInTheDocument();
    
    // Format Selection
    expect(screen.getByText("Export Format")).toBeInTheDocument();
    expect(screen.getByText("PDF Report")).toBeInTheDocument();
    
    // Templates
    expect(screen.getByText("Quick Templates")).toBeInTheDocument();
    
    // Options
    expect(screen.getByText("Include in Report")).toBeInTheDocument();
    expect(screen.getByText("Financial Summary")).toBeInTheDocument();
    
    // Footer
    expect(screen.getByText("PDF export selected")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Export Report/i })).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(<ReportExporter {...mockProps} />);
    
    const closeButtons = screen.getAllByText("Cancel");
    fireEvent.click(closeButtons[0]);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it("applies design standards with hard black borders", () => {
    const { container } = render(<ReportExporter {...mockProps} />);
    
    // Check main modal has hard black border
    const modal = container.querySelector(".border-2.border-black");
    expect(modal).toBeInTheDocument();
  });
});