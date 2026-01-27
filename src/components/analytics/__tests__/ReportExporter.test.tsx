import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import React from "react";
import ReportExporter from "../ReportExporter";
import { useReportExporter } from "@/hooks/platform/analytics/useReportExporter";

// Mock dependencies
vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => () => <span data-testid="mock-icon" />),
}));

vi.mock("@/hooks/platform/ux/useModalAutoScroll", () => ({
  useModalAutoScroll: vi.fn(() => ({ current: null })),
}));

const mockHandleExport = vi.fn();
const mockApplyTemplate = vi.fn();
const mockSetExportFormat = vi.fn();
const mockSetExportOptions = vi.fn();

vi.mock("@/hooks/platform/analytics/useReportExporter", () => ({
  useReportExporter: vi.fn(() => ({
    exportFormat: "pdf",
    exportOptions: {
      includeSummary: true,
      includeCharts: true,
      includeTransactions: false,
      includeEnvelopes: true,
      includeSavings: true,
      includeInsights: true,
      customDateRange: null,
    },
    isExporting: false,
    exportProgress: 0,
    setExportFormat: mockSetExportFormat,
    setExportOptions: mockSetExportOptions,
    handleExport: mockHandleExport,
    applyTemplate: mockApplyTemplate,
  })),
}));

vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/ModalCloseButton", () => ({
  default: ({ onClick, disabled }: any) => (
    <button data-testid="modal-close" onClick={onClick} disabled={disabled}>
      Close
    </button>
  ),
}));

vi.mock("../report-exporter/ExportFormatSelector", () => ({
  ExportFormatSelector: ({ onFormatChange }: any) => (
    <div data-testid="format-selector">
      <button onClick={() => onFormatChange("csv")}>Change to CSV</button>
    </div>
  ),
}));

vi.mock("../report-exporter/ExportTemplates", () => ({
  ExportTemplates: ({ onTemplateSelect }: any) => (
    <div data-testid="template-selector">
      <button onClick={() => onTemplateSelect("basic")}>Basic Template</button>
    </div>
  ),
}));

vi.mock("../report-exporter/ExportOptionsForm", () => ({
  ExportOptionsForm: ({ onOptionChange }: any) => (
    <div data-testid="options-form">
      <button onClick={() => onOptionChange("includeTransactions", true)}>
        Toggle Transactions
      </button>
    </div>
  ),
}));

vi.mock("../report-exporter/ExportProgressIndicator", () => ({
  ExportProgressIndicator: ({ isExporting, progress }: any) => (
    <div data-testid="progress-indicator">{isExporting ? `Progress: ${progress}%` : "Idle"}</div>
  ),
}));

describe("ReportExporter", () => {
  const mockParams = {
    analyticsData: {
      balanceData: {},
      categoryData: {},
      transactionData: {},
      envelopeData: {},
      savingsData: {},
    },
    balanceData: {},
    timeFilter: "month",
    onExport: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly", () => {
    render(<ReportExporter {...mockParams} />);
    // Check heading specifically
    expect(screen.getByRole("heading", { name: /export report/i })).toBeInTheDocument();
    expect(screen.getByTestId("format-selector")).toBeInTheDocument();
    expect(screen.getByTestId("template-selector")).toBeInTheDocument();
    expect(screen.getByTestId("options-form")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(<ReportExporter {...mockParams} />);
    fireEvent.click(screen.getByTestId("modal-close"));
    expect(mockParams.onClose).toHaveBeenCalled();
  });

  it("triggers export process when Export button is clicked", () => {
    render(<ReportExporter {...mockParams} />);
    const exportButton = screen.getByRole("button", { name: /export report/i });
    fireEvent.click(exportButton);
    expect(mockHandleExport).toHaveBeenCalledWith(
      mockParams.analyticsData,
      mockParams.balanceData,
      mockParams.timeFilter,
      mockParams.onExport,
      mockParams.onClose
    );
  });

  it("changes format via ExportFormatSelector", () => {
    render(<ReportExporter {...mockParams} />);
    fireEvent.click(screen.getByText("Change to CSV"));
    expect(mockSetExportFormat).toHaveBeenCalledWith("csv");
  });

  it("applies template via ExportTemplates", () => {
    render(<ReportExporter {...mockParams} />);
    fireEvent.click(screen.getByText("Basic Template"));
    expect(mockApplyTemplate).toHaveBeenCalledWith("basic");
  });

  it("updates options via ExportOptionsForm", () => {
    render(<ReportExporter {...mockParams} />);
    fireEvent.click(screen.getByText("Toggle Transactions"));
    expect(mockSetExportOptions).toHaveBeenCalled();
  });

  it("disables buttons and interaction when exporting", () => {
    vi.mocked(useReportExporter).mockReturnValue({
      exportFormat: "pdf",
      exportOptions: {},
      isExporting: true,
      exportProgress: 50,
      setExportFormat: vi.fn(),
      setExportOptions: vi.fn(),
      handleExport: vi.fn(),
      applyTemplate: vi.fn(),
    } as any);

    render(<ReportExporter {...mockParams} />);

    expect(screen.getByText("Exporting...")).toBeInTheDocument();
    expect(screen.getByText("Progress: 50%")).toBeInTheDocument();

    // Cancel button should be disabled
    const cancelButton = screen.getByText("Cancel");
    expect(cancelButton).toBeDisabled();
  });
});
