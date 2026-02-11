import { describe, it, expect, vi, beforeEach } from "vitest";
import { generatePDFReport } from "../pdfGeneratorUtils";

// Mock jspdf as a constructor
vi.mock("jspdf", () => {
  return {
    default: function () {
      return {
        internal: { pageSize: { height: 297 } },
        addPage: vi.fn(),
        setFontSize: vi.fn(),
        setFont: vi.fn(),
        text: vi.fn(),
        save: vi.fn(),
      };
    },
  };
});

// Mock related utils
vi.mock("../pdfExportUtils", () => ({
  addSummaryToPDF: vi.fn().mockReturnValue(100),
  addEnvelopeAnalysisToPDF: vi.fn().mockReturnValue(200),
  addInsightsToPDF: vi.fn().mockReturnValue(250),
}));

describe("pdfGeneratorUtils.ts", () => {
  const mockAnalyticsData = {
    totalIncome: 5000,
    totalExpenses: 3000,
    netAmount: 2000,
  };

  const mockBalanceData = {
    envelopeAnalysis: [{ name: "Rent", spent: 1000, monthlyBudget: 1000 }],
  };

  const mockExportOptions = {
    includeSummary: true,
    includeEnvelopes: true,
    includeInsights: true,
  };

  const setExportProgress = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should generate a complete report with all sections", async () => {
    await generatePDFReport(
      mockAnalyticsData,
      mockBalanceData,
      "Monthly",
      mockExportOptions,
      setExportProgress
    );

    expect(setExportProgress).toHaveBeenCalledWith(100);
    const { addSummaryToPDF, addEnvelopeAnalysisToPDF, addInsightsToPDF } =
      await import("../pdfExportUtils");
    expect(addSummaryToPDF).toHaveBeenCalled();
    expect(addEnvelopeAnalysisToPDF).toHaveBeenCalled();
    expect(addInsightsToPDF).toHaveBeenCalled();
  });

  it("should respect export options", async () => {
    const limitedOptions = {
      includeSummary: true,
      includeEnvelopes: false,
      includeInsights: false,
    };

    await generatePDFReport(
      mockAnalyticsData,
      mockBalanceData,
      "Yearly",
      limitedOptions,
      setExportProgress
    );

    const { addSummaryToPDF, addEnvelopeAnalysisToPDF, addInsightsToPDF } =
      await import("../pdfExportUtils");
    expect(addSummaryToPDF).toHaveBeenCalled();
    expect(addEnvelopeAnalysisToPDF).not.toHaveBeenCalled();
    expect(addInsightsToPDF).not.toHaveBeenCalled();
  });

  it("should handle missing envelope data", async () => {
    await generatePDFReport(
      mockAnalyticsData,
      {}, // Empty balance data
      "Weekly",
      mockExportOptions,
      setExportProgress
    );

    const { addEnvelopeAnalysisToPDF } = await import("../pdfExportUtils");
    expect(addEnvelopeAnalysisToPDF).not.toHaveBeenCalled();
  });
});
