import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, beforeEach, describe, it, expect, afterEach } from "vitest";
import { useReportExporter } from "../useReportExporter";
import * as csvImageExportUtils from "../utils/csvImageExportUtils";
import * as exportHandlerUtils from "../utils/exportHandlerUtils";
import * as pdfGeneratorUtils from "../utils/pdfGeneratorUtils";
import logger from "@/utils/common/logger";

// Mock dependencies
vi.mock("@/utils/common/logger");
vi.mock("../utils/csvImageExportUtils");
vi.mock("../utils/exportHandlerUtils");
vi.mock("../utils/pdfGeneratorUtils");

describe("useReportExporter", () => {
  const mockAnalyticsData = {
    transactions: [
      {
        date: "2024-01-01",
        description: "Test Transaction",
        amount: 100,
        category: "Food",
        envelopeName: "Groceries",
      },
    ],
  };

  const mockBalanceData = {
    envelopeAnalysis: [
      {
        name: "Groceries",
        monthlyBudget: 500,
        spent: 300,
        currentBalance: 200,
        utilizationRate: 0.6,
      },
    ],
  };

  const mockTimeFilter = "30days";
  const mockOnExport = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock URL methods
    global.URL.createObjectURL = vi.fn(() => "mock-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with default state", () => {
      const { result } = renderHook(() => useReportExporter());

      expect(result.current.exportFormat).toBe("pdf");
      expect(result.current.exportOptions).toEqual({
        includeSummary: true,
        includeCharts: true,
        includeTransactions: false,
        includeEnvelopes: true,
        includeSavings: true,
        includeInsights: true,
        customDateRange: null,
      });
      expect(result.current.isExporting).toBe(false);
      expect(result.current.exportProgress).toBe(0);
    });
  });

  describe("State Setters", () => {
    it("should update export format", () => {
      const { result } = renderHook(() => useReportExporter());

      act(() => {
        result.current.setExportFormat("csv");
      });

      expect(result.current.exportFormat).toBe("csv");
    });

    it("should update export options", () => {
      const { result } = renderHook(() => useReportExporter());

      const newOptions = {
        includeSummary: false,
        includeCharts: false,
        includeTransactions: true,
        includeEnvelopes: false,
        includeSavings: false,
        includeInsights: false,
        customDateRange: { start: "2024-01-01", end: "2024-01-31" },
      };

      act(() => {
        result.current.setExportOptions(newOptions);
      });

      expect(result.current.exportOptions).toEqual(newOptions);
    });

    it("should partially update export options", () => {
      const { result } = renderHook(() => useReportExporter());

      act(() => {
        result.current.setExportOptions((prev) => ({
          ...prev,
          includeTransactions: true,
        }));
      });

      expect(result.current.exportOptions.includeTransactions).toBe(true);
      expect(result.current.exportOptions.includeSummary).toBe(true);
    });
  });

  describe("applyTemplate", () => {
    it("should apply executive template", () => {
      vi.mocked(exportHandlerUtils.getTemplateOptions).mockReturnValue({
        includeSummary: true,
        includeCharts: false,
        includeTransactions: false,
        includeEnvelopes: false,
        includeSavings: false,
        includeInsights: true,
      });

      const { result } = renderHook(() => useReportExporter());

      act(() => {
        result.current.applyTemplate("executive");
      });

      expect(exportHandlerUtils.getTemplateOptions).toHaveBeenCalledWith("executive");
      expect(result.current.exportOptions.includeCharts).toBe(false);
      expect(result.current.exportOptions.includeInsights).toBe(true);
    });

    it("should apply detailed template", () => {
      vi.mocked(exportHandlerUtils.getTemplateOptions).mockReturnValue({
        includeSummary: true,
        includeCharts: true,
        includeTransactions: true,
        includeEnvelopes: true,
        includeSavings: true,
        includeInsights: true,
      });

      const { result } = renderHook(() => useReportExporter());

      act(() => {
        result.current.applyTemplate("detailed");
      });

      expect(exportHandlerUtils.getTemplateOptions).toHaveBeenCalledWith("detailed");
      expect(result.current.exportOptions.includeTransactions).toBe(true);
    });

    it("should apply budget template", () => {
      vi.mocked(exportHandlerUtils.getTemplateOptions).mockReturnValue({
        includeSummary: true,
        includeCharts: false,
        includeTransactions: false,
        includeEnvelopes: true,
        includeSavings: false,
        includeInsights: true,
      });

      const { result } = renderHook(() => useReportExporter());

      act(() => {
        result.current.applyTemplate("budget");
      });

      expect(exportHandlerUtils.getTemplateOptions).toHaveBeenCalledWith("budget");
      expect(result.current.exportOptions.includeEnvelopes).toBe(true);
    });

    it("should apply trends template", () => {
      vi.mocked(exportHandlerUtils.getTemplateOptions).mockReturnValue({
        includeSummary: false,
        includeCharts: true,
        includeTransactions: false,
        includeEnvelopes: false,
        includeSavings: false,
        includeInsights: true,
      });

      const { result } = renderHook(() => useReportExporter());

      act(() => {
        result.current.applyTemplate("trends");
      });

      expect(exportHandlerUtils.getTemplateOptions).toHaveBeenCalledWith("trends");
      expect(result.current.exportOptions.includeSummary).toBe(false);
      expect(result.current.exportOptions.includeCharts).toBe(true);
    });

    it("should not update options if template not found", () => {
      vi.mocked(exportHandlerUtils.getTemplateOptions).mockReturnValue(null);

      const { result } = renderHook(() => useReportExporter());
      const initialOptions = result.current.exportOptions;

      act(() => {
        result.current.applyTemplate("nonexistent");
      });

      expect(result.current.exportOptions).toEqual(initialOptions);
    });
  });

  describe("handleExport - PDF", () => {
    it("should handle PDF export successfully", async () => {
      vi.mocked(pdfGeneratorUtils.generatePDFReport).mockResolvedValue(undefined);
      vi.mocked(exportHandlerUtils.executeExport).mockResolvedValue(undefined);
      vi.mocked(exportHandlerUtils.handleExportComplete).mockImplementation(() => {});

      const { result } = renderHook(() => useReportExporter());

      await act(async () => {
        await result.current.handleExport(
          mockAnalyticsData,
          mockBalanceData,
          mockTimeFilter,
          mockOnExport,
          mockOnClose
        );
      });

      expect(logger.info).toHaveBeenCalledWith("Starting export", {
        format: "pdf",
        options: expect.any(Object),
      });
      expect(exportHandlerUtils.executeExport).toHaveBeenCalled();
      expect(exportHandlerUtils.handleExportComplete).toHaveBeenCalledWith(
        "pdf",
        expect.any(Object),
        mockOnExport,
        mockOnClose
      );
      expect(result.current.isExporting).toBe(false);
      expect(result.current.exportProgress).toBe(0);
    });

    it("should track isExporting state during PDF export", async () => {
      let resolveExport: () => void;
      const exportPromise = new Promise<void>((resolve) => {
        resolveExport = resolve;
      });

      vi.mocked(exportHandlerUtils.executeExport).mockImplementation(() => exportPromise);

      const { result } = renderHook(() => useReportExporter());

      // Start the export (don't await yet)
      act(() => {
        void result.current.handleExport(
          mockAnalyticsData,
          mockBalanceData,
          mockTimeFilter,
          mockOnExport,
          mockOnClose
        );
      });

      // Check that it's exporting
      await waitFor(() => {
        expect(result.current.isExporting).toBe(true);
      });

      // Resolve and wait for completion
      await act(async () => {
        resolveExport!();
        await exportPromise;
      });

      expect(result.current.isExporting).toBe(false);
    });
  });

  describe("handleExport - CSV", () => {
    it("should handle CSV export successfully", async () => {
      vi.mocked(csvImageExportUtils.convertToCSV).mockReturnValue("csv,content");
      vi.mocked(csvImageExportUtils.downloadCSV).mockImplementation(() => {});
      vi.mocked(exportHandlerUtils.executeExport).mockResolvedValue(undefined);
      vi.mocked(exportHandlerUtils.handleExportComplete).mockImplementation(() => {});

      const { result } = renderHook(() => useReportExporter());

      act(() => {
        result.current.setExportFormat("csv");
      });

      await act(async () => {
        await result.current.handleExport(
          mockAnalyticsData,
          mockBalanceData,
          mockTimeFilter,
          mockOnExport,
          mockOnClose
        );
      });

      expect(exportHandlerUtils.executeExport).toHaveBeenCalled();
      expect(exportHandlerUtils.handleExportComplete).toHaveBeenCalledWith(
        "csv",
        expect.any(Object),
        mockOnExport,
        mockOnClose
      );
      expect(result.current.isExporting).toBe(false);
    });
  });

  describe("handleExport - PNG", () => {
    it("should handle chart images export successfully", async () => {
      vi.mocked(csvImageExportUtils.getChartElements).mockReturnValue([]);
      vi.mocked(exportHandlerUtils.executeExport).mockResolvedValue(undefined);
      vi.mocked(exportHandlerUtils.handleExportComplete).mockImplementation(() => {});

      const { result } = renderHook(() => useReportExporter());

      act(() => {
        result.current.setExportFormat("png");
      });

      await act(async () => {
        await result.current.handleExport(
          mockAnalyticsData,
          mockBalanceData,
          mockTimeFilter,
          mockOnExport,
          mockOnClose
        );
      });

      expect(exportHandlerUtils.executeExport).toHaveBeenCalled();
      expect(exportHandlerUtils.handleExportComplete).toHaveBeenCalledWith(
        "png",
        expect.any(Object),
        mockOnExport,
        mockOnClose
      );
      expect(result.current.isExporting).toBe(false);
    });
  });

  describe("handleExport - Error Handling", () => {
    it("should handle export errors", async () => {
      const mockError = new Error("Export failed");
      vi.mocked(exportHandlerUtils.executeExport).mockRejectedValue(mockError);
      vi.mocked(exportHandlerUtils.handleExportError).mockImplementation(() => {});

      const { result } = renderHook(() => useReportExporter());

      await act(async () => {
        await result.current.handleExport(
          mockAnalyticsData,
          mockBalanceData,
          mockTimeFilter,
          mockOnExport,
          mockOnClose
        );
      });

      expect(exportHandlerUtils.handleExportError).toHaveBeenCalledWith(mockError);
      expect(result.current.isExporting).toBe(false);
      expect(result.current.exportProgress).toBe(0);
    });

    it("should reset state after error", async () => {
      vi.mocked(exportHandlerUtils.executeExport).mockRejectedValue(new Error("Test error"));
      vi.mocked(exportHandlerUtils.handleExportError).mockImplementation(() => {});

      const { result } = renderHook(() => useReportExporter());

      await act(async () => {
        await result.current.handleExport(
          mockAnalyticsData,
          mockBalanceData,
          mockTimeFilter,
          mockOnExport,
          mockOnClose
        );
      });

      expect(result.current.isExporting).toBe(false);
      expect(result.current.exportProgress).toBe(0);
    });
  });

  describe("Export Callbacks", () => {
    it("should call onExport and onClose callbacks on success", async () => {
      vi.mocked(exportHandlerUtils.executeExport).mockResolvedValue(undefined);
      vi.mocked(exportHandlerUtils.handleExportComplete).mockImplementation(
        (format, options, onExport, onClose) => {
          onExport?.(format, options);
          onClose?.();
        }
      );

      const { result } = renderHook(() => useReportExporter());

      await act(async () => {
        await result.current.handleExport(
          mockAnalyticsData,
          mockBalanceData,
          mockTimeFilter,
          mockOnExport,
          mockOnClose
        );
      });

      expect(mockOnExport).toHaveBeenCalledWith("pdf", expect.any(Object));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("Export Options Persistence", () => {
    it("should maintain export options across multiple exports", async () => {
      vi.mocked(exportHandlerUtils.executeExport).mockResolvedValue(undefined);
      vi.mocked(exportHandlerUtils.handleExportComplete).mockImplementation(() => {});

      const { result } = renderHook(() => useReportExporter());

      const customOptions = {
        includeSummary: false,
        includeCharts: true,
        includeTransactions: true,
        includeEnvelopes: false,
        includeSavings: false,
        includeInsights: true,
        customDateRange: null,
      };

      act(() => {
        result.current.setExportOptions(customOptions);
      });

      await act(async () => {
        await result.current.handleExport(
          mockAnalyticsData,
          mockBalanceData,
          mockTimeFilter,
          mockOnExport,
          mockOnClose
        );
      });

      expect(result.current.exportOptions).toEqual(customOptions);
      expect(result.current.isExporting).toBe(false);
    });
  });

  describe("Multiple Format Exports", () => {
    it("should handle switching between export formats", async () => {
      vi.mocked(exportHandlerUtils.executeExport).mockResolvedValue(undefined);
      vi.mocked(exportHandlerUtils.handleExportComplete).mockImplementation(() => {});

      const { result } = renderHook(() => useReportExporter());

      // First export as PDF
      await act(async () => {
        result.current.setExportFormat("pdf");
        await result.current.handleExport(
          mockAnalyticsData,
          mockBalanceData,
          mockTimeFilter,
          mockOnExport,
          mockOnClose
        );
      });

      expect(result.current.isExporting).toBe(false);

      // Then export as CSV
      await act(async () => {
        result.current.setExportFormat("csv");
        await result.current.handleExport(
          mockAnalyticsData,
          mockBalanceData,
          mockTimeFilter,
          mockOnExport,
          mockOnClose
        );
      });

      expect(result.current.isExporting).toBe(false);
      expect(exportHandlerUtils.executeExport).toHaveBeenCalledTimes(2);
    });
  });

  describe("Template Application with Custom Date Range", () => {
    it("should preserve custom date range when applying template", () => {
      const customDateRange = { start: "2024-01-01", end: "2024-12-31" };

      vi.mocked(exportHandlerUtils.getTemplateOptions).mockReturnValue({
        includeSummary: true,
        includeCharts: false,
        includeTransactions: false,
        includeEnvelopes: false,
        includeSavings: false,
        includeInsights: true,
      });

      const { result } = renderHook(() => useReportExporter());

      act(() => {
        result.current.setExportOptions((prev) => ({
          ...prev,
          customDateRange,
        }));
      });

      act(() => {
        result.current.applyTemplate("executive");
      });

      // Template should update other options but preserve custom date range
      expect(result.current.exportOptions.customDateRange).toEqual(customDateRange);
    });
  });

  describe("Direct Export Function Tests", () => {
    it("should call executeExport with correct format and handlers", async () => {
      vi.mocked(exportHandlerUtils.executeExport).mockImplementation(
        async (format, handlers, data) => {
          // Call the exportToPDF handler directly to test it
          if (format === "pdf") {
            await handlers.exportToPDF(data.analyticsData, data.balanceData, data.timeFilter);
          }
        }
      );
      vi.mocked(pdfGeneratorUtils.generatePDFReport).mockResolvedValue(undefined);
      vi.mocked(exportHandlerUtils.handleExportComplete).mockImplementation(() => {});

      const { result } = renderHook(() => useReportExporter());

      await act(async () => {
        await result.current.handleExport(
          mockAnalyticsData,
          mockBalanceData,
          mockTimeFilter,
          mockOnExport,
          mockOnClose
        );
      });

      expect(pdfGeneratorUtils.generatePDFReport).toHaveBeenCalledWith(
        mockAnalyticsData,
        mockBalanceData,
        mockTimeFilter,
        expect.any(Object),
        expect.any(Function)
      );
    });

    it("should call executeExport with CSV handler", async () => {
      vi.mocked(exportHandlerUtils.executeExport).mockImplementation(
        async (format, handlers, data) => {
          // Call the exportToCSV handler directly to test it
          if (format === "csv") {
            await handlers.exportToCSV(data.analyticsData);
          }
        }
      );
      vi.mocked(csvImageExportUtils.convertToCSV).mockReturnValue("csv,content");
      vi.mocked(csvImageExportUtils.downloadCSV).mockImplementation(() => {});
      vi.mocked(exportHandlerUtils.handleExportComplete).mockImplementation(() => {});

      const { result } = renderHook(() => useReportExporter());

      act(() => {
        result.current.setExportFormat("csv");
      });

      await act(async () => {
        await result.current.handleExport(
          mockAnalyticsData,
          mockBalanceData,
          mockTimeFilter,
          mockOnExport,
          mockOnClose
        );
      });

      expect(csvImageExportUtils.convertToCSV).toHaveBeenCalledWith(mockAnalyticsData);
      expect(csvImageExportUtils.downloadCSV).toHaveBeenCalled();
    });

    it("should call executeExport with chart images handler", async () => {
      const mockChartElement = {
        getAttribute: vi.fn(() => "test-chart"),
      } as unknown as Element;

      vi.mocked(exportHandlerUtils.executeExport).mockImplementation(async (format, handlers) => {
        // Call the exportChartImages handler directly to test it
        if (format === "png") {
          await handlers.exportChartImages();
        }
      });
      vi.mocked(csvImageExportUtils.getChartElements).mockReturnValue([mockChartElement]);
      vi.mocked(csvImageExportUtils.exportChartAsImage).mockResolvedValue(undefined);
      vi.mocked(exportHandlerUtils.handleExportComplete).mockImplementation(() => {});

      // Mock html2canvas dynamic import
      vi.mock("html2canvas", () => ({
        default: vi.fn(),
      }));

      const { result } = renderHook(() => useReportExporter());

      act(() => {
        result.current.setExportFormat("png");
      });

      await act(async () => {
        await result.current.handleExport(
          mockAnalyticsData,
          mockBalanceData,
          mockTimeFilter,
          mockOnExport,
          mockOnClose
        );
      });

      expect(csvImageExportUtils.getChartElements).toHaveBeenCalled();
    });

    it("should handle chart export with default chart name", async () => {
      const mockChartElement = {
        getAttribute: vi.fn(() => null), // No data-chart-name attribute
      } as unknown as Element;

      vi.mocked(exportHandlerUtils.executeExport).mockImplementation(async (format, handlers) => {
        if (format === "png") {
          await handlers.exportChartImages();
        }
      });
      vi.mocked(csvImageExportUtils.getChartElements).mockReturnValue([mockChartElement]);
      vi.mocked(csvImageExportUtils.exportChartAsImage).mockResolvedValue(undefined);
      vi.mocked(exportHandlerUtils.handleExportComplete).mockImplementation(() => {});

      const { result } = renderHook(() => useReportExporter());

      act(() => {
        result.current.setExportFormat("png");
      });

      await act(async () => {
        await result.current.handleExport(
          mockAnalyticsData,
          mockBalanceData,
          mockTimeFilter,
          mockOnExport,
          mockOnClose
        );
      });

      expect(csvImageExportUtils.getChartElements).toHaveBeenCalled();
      expect(mockChartElement.getAttribute).toHaveBeenCalledWith("data-chart-name");
    });
  });
});
