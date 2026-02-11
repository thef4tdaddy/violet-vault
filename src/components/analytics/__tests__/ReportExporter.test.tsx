import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReportExporter from "../ReportExporter";

// Mock dependencies
vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => () => <div data-testid="icon" />),
}));

vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("@/hooks/platform/ux/useModalAutoScroll", () => ({
  useModalAutoScroll: vi.fn(() => ({ current: null })),
}));

const mockUseReportExporter = {
  exportFormat: "pdf",
  exportOptions: { includeTransactions: true },
  isExporting: false,
  exportProgress: 0,
  setExportFormat: vi.fn(),
  setExportOptions: vi.fn(),
  handleExport: vi.fn(),
  applyTemplate: vi.fn(),
};

vi.mock("@/hooks/platform/analytics/useReportExporter", () => ({
  useReportExporter: vi.fn(() => mockUseReportExporter),
}));

// Mock subcomponents
vi.mock("../report-exporter/ExportFormatSelector", () => ({
  ExportFormatSelector: ({ onFormatChange }: any) => (
    <div data-testid="format-selector" onClick={() => onFormatChange("csv")} />
  ),
}));

vi.mock("../report-exporter/ExportTemplates", () => ({
  ExportTemplates: ({ onTemplateSelect }: any) => (
    <div data-testid="templates" onClick={() => onTemplateSelect("full")} />
  ),
}));

vi.mock("../report-exporter/ExportOptionsForm", () => ({
  ExportOptionsForm: ({ onOptionChange }: any) => (
    <div data-testid="options-form" onClick={() => onOptionChange("includeTransactions", true)} />
  ),
}));

vi.mock("../report-exporter/ExportProgressIndicator", () => ({
  ExportProgressIndicator: () => <div data-testid="progress" />,
}));

vi.mock("@/components/ui/ModalCloseButton", () => ({
  default: ({ onClick }: any) => <button data-testid="close-button" onClick={onClick} />,
}));

describe("ReportExporter", () => {
  const mockProps = {
    analyticsData: {
      balanceData: {},
      categoryData: {},
      transactionData: {},
      envelopeData: {},
      savingsData: {},
    },
    balanceData: {},
    timeFilter: "all",
    onExport: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset isExporting to false
    (mockUseReportExporter as any).isExporting = false;
  });

  it("renders correctly", () => {
    render(<ReportExporter {...mockProps} />);
    expect(screen.getByRole("heading", { name: /Export Report/i })).toBeDefined();

    expect(screen.getByTestId("format-selector")).toBeDefined();
    expect(screen.getByTestId("templates")).toBeDefined();
    expect(screen.getByTestId("options-form")).toBeDefined();
    expect(screen.getByTestId("progress")).toBeDefined();
  });

  it("handles format change", () => {
    render(<ReportExporter {...mockProps} />);
    fireEvent.click(screen.getByTestId("format-selector"));
    expect(mockUseReportExporter.setExportFormat).toHaveBeenCalledWith("csv");
  });

  it("handles template selection", () => {
    render(<ReportExporter {...mockProps} />);
    fireEvent.click(screen.getByTestId("templates"));
    expect(mockUseReportExporter.applyTemplate).toHaveBeenCalledWith("full");
  });

  it("handles option change", () => {
    render(<ReportExporter {...mockProps} />);
    fireEvent.click(screen.getByTestId("options-form"));
    expect(mockUseReportExporter.setExportOptions).toHaveBeenCalled();

    // Verify the function passed to setExportOptions
    const updater = vi.mocked(mockUseReportExporter.setExportOptions).mock.calls[0][0];
    const result = updater({ existing: true });
    expect(result).toEqual({ existing: true, includeTransactions: true });
  });

  it("calls handleExport on export click", () => {
    render(<ReportExporter {...mockProps} />);
    // There are two "Export Report" texts: header and button. Button has icon.
    const exportButtons = screen.getAllByText("Export Report");
    fireEvent.click(exportButtons[exportButtons.length - 1]);
    expect(mockUseReportExporter.handleExport).toHaveBeenCalledWith(
      mockProps.analyticsData,
      mockProps.balanceData,
      mockProps.timeFilter,
      mockProps.onExport,
      mockProps.onClose
    );
  });

  it("calls onClose when clicking close or cancel", () => {
    render(<ReportExporter {...mockProps} />);
    fireEvent.click(screen.getByTestId("close-button"));
    expect(mockProps.onClose).toHaveBeenCalled();

    fireEvent.click(screen.getByText("Cancel"));
    expect(mockProps.onClose).toHaveBeenCalledTimes(2);
  });

  it("disables interactions when exporting", () => {
    (mockUseReportExporter as any).isExporting = true;
    render(<ReportExporter {...mockProps} />);

    expect(screen.getByText("Exporting...")).toBeDefined();
    // Buttons should be disabled
    expect(screen.getByText("Cancel")).toHaveProperty("disabled", true);
    expect(screen.getByText("Exporting...")).toHaveProperty("disabled", true);

    // Close button should not call onClose when exporting
    fireEvent.click(screen.getByTestId("close-button"));
    expect(mockProps.onClose).not.toHaveBeenCalled();
  });
});
