import { describe, it, expect, vi, beforeEach } from "vitest";
import { addSummaryToPDF, addEnvelopeAnalysisToPDF, addInsightsToPDF } from "../pdfExportUtils";

// Mock PDF document type matching the interface in pdfExportUtils.ts
type MockPDFDocument = {
  setFontSize: ReturnType<typeof vi.fn>;
  setFont: ReturnType<typeof vi.fn>;
  text: ReturnType<typeof vi.fn>;
};

describe("pdfExportUtils", () => {
  let mockPdf: MockPDFDocument;

  beforeEach(() => {
    mockPdf = {
      setFontSize: vi.fn(),
      setFont: vi.fn(),
      text: vi.fn(),
    };
  });

  describe("addSummaryToPDF", () => {
    it("should add financial summary header to PDF", () => {
      const analyticsData = {
        totalIncome: 5000,
        totalExpenses: 3000,
        netAmount: 2000,
      };
      const yPosition = 20;
      const margin = 10;

      addSummaryToPDF(mockPdf, analyticsData, yPosition, margin);

      // Check header was added with correct font
      expect(mockPdf.setFontSize).toHaveBeenCalledWith(16);
      expect(mockPdf.setFont).toHaveBeenCalledWith("helvetica", "bold");
      expect(mockPdf.text).toHaveBeenCalledWith("Financial Summary", margin, yPosition);
    });

    it("should add all financial data with formatted numbers", () => {
      const analyticsData = {
        totalIncome: 5000,
        totalExpenses: 3000,
        netAmount: 2000,
      };
      const yPosition = 20;
      const margin = 10;

      addSummaryToPDF(mockPdf, analyticsData, yPosition, margin);

      // Check all financial data was added
      expect(mockPdf.text).toHaveBeenCalledWith("Total Income: $5,000", margin, yPosition + 10);
      expect(mockPdf.text).toHaveBeenCalledWith("Total Expenses: $3,000", margin, yPosition + 18);
      expect(mockPdf.text).toHaveBeenCalledWith("Net Amount: $2,000", margin, yPosition + 26);
    });

    it("should return correct y position after adding summary", () => {
      const analyticsData = {
        totalIncome: 5000,
        totalExpenses: 3000,
        netAmount: 2000,
      };
      const yPosition = 20;
      const margin = 10;

      const result = addSummaryToPDF(mockPdf, analyticsData, yPosition, margin);

      // Should add: 10 (header) + 8 + 8 + 15 (spacing) = 41
      expect(result).toBe(yPosition + 41);
    });

    it("should handle missing analytics data gracefully", () => {
      const analyticsData = {};
      const yPosition = 20;
      const margin = 10;

      const result = addSummaryToPDF(mockPdf, analyticsData, yPosition, margin);

      // Header should still be added
      expect(mockPdf.text).toHaveBeenCalledWith("Financial Summary", margin, yPosition);
      // Should return position accounting for missing data section
      expect(result).toBe(yPosition + 41);
    });

    it("should handle zero values correctly", () => {
      const analyticsData = {
        totalIncome: 0,
        totalExpenses: 0,
        netAmount: 0,
      };
      const yPosition = 20;
      const margin = 10;

      addSummaryToPDF(mockPdf, analyticsData, yPosition, margin);

      expect(mockPdf.text).toHaveBeenCalledWith("Total Income: $0", margin, yPosition + 10);
      expect(mockPdf.text).toHaveBeenCalledWith("Total Expenses: $0", margin, yPosition + 18);
      expect(mockPdf.text).toHaveBeenCalledWith("Net Amount: $0", margin, yPosition + 26);
    });

    it("should handle undefined values with defaults", () => {
      const analyticsData = {
        totalIncome: undefined,
        totalExpenses: undefined,
        netAmount: undefined,
      };
      const yPosition = 20;
      const margin = 10;

      addSummaryToPDF(mockPdf, analyticsData, yPosition, margin);

      expect(mockPdf.text).toHaveBeenCalledWith("Total Income: $0", margin, yPosition + 10);
      expect(mockPdf.text).toHaveBeenCalledWith("Total Expenses: $0", margin, yPosition + 18);
      expect(mockPdf.text).toHaveBeenCalledWith("Net Amount: $0", margin, yPosition + 26);
    });

    it("should format large numbers with commas", () => {
      const analyticsData = {
        totalIncome: 1234567,
        totalExpenses: 987654,
        netAmount: 246913,
      };
      const yPosition = 20;
      const margin = 10;

      addSummaryToPDF(mockPdf, analyticsData, yPosition, margin);

      expect(mockPdf.text).toHaveBeenCalledWith("Total Income: $1,234,567", margin, yPosition + 10);
      expect(mockPdf.text).toHaveBeenCalledWith("Total Expenses: $987,654", margin, yPosition + 18);
      expect(mockPdf.text).toHaveBeenCalledWith("Net Amount: $246,913", margin, yPosition + 26);
    });

    it("should switch to normal font for data", () => {
      const analyticsData = {
        totalIncome: 5000,
        totalExpenses: 3000,
        netAmount: 2000,
      };
      const yPosition = 20;
      const margin = 10;

      addSummaryToPDF(mockPdf, analyticsData, yPosition, margin);

      // Should set bold for header, then normal for data
      expect(mockPdf.setFont).toHaveBeenCalledWith("helvetica", "bold");
      expect(mockPdf.setFont).toHaveBeenCalledWith("helvetica", "normal");
      expect(mockPdf.setFontSize).toHaveBeenCalledWith(16); // header size
      expect(mockPdf.setFontSize).toHaveBeenCalledWith(12); // data size
    });
  });

  describe("addEnvelopeAnalysisToPDF", () => {
    it("should add envelope analysis header to PDF", () => {
      const balanceData = { envelopeAnalysis: [] };
      const yPosition = 20;
      const margin = 10;
      const checkPageBreak = vi.fn();

      addEnvelopeAnalysisToPDF(mockPdf, balanceData, yPosition, margin, checkPageBreak);

      expect(mockPdf.setFontSize).toHaveBeenCalledWith(16);
      expect(mockPdf.setFont).toHaveBeenCalledWith("helvetica", "bold");
      expect(mockPdf.text).toHaveBeenCalledWith("Envelope Analysis", margin, yPosition);
    });

    it("should add table headers", () => {
      const balanceData = { envelopeAnalysis: [] };
      const yPosition = 20;
      const margin = 10;
      const checkPageBreak = vi.fn();

      addEnvelopeAnalysisToPDF(mockPdf, balanceData, yPosition, margin, checkPageBreak);

      // Check that headers are added
      expect(mockPdf.text).toHaveBeenCalledWith("Envelope", margin, yPosition + 10);
      expect(mockPdf.text).toHaveBeenCalledWith("Budget", margin + 50, yPosition + 10);
      expect(mockPdf.text).toHaveBeenCalledWith("Spent", margin + 75, yPosition + 10);
      expect(mockPdf.text).toHaveBeenCalledWith("Balance", margin + 100, yPosition + 10);
      expect(mockPdf.text).toHaveBeenCalledWith("Utilization", margin + 125, yPosition + 10);
    });

    it("should add envelope data rows", () => {
      const balanceData = {
        envelopeAnalysis: [
          {
            name: "Groceries",
            monthlyBudget: 500,
            spent: 300,
            currentBalance: 200,
            utilizationRate: 0.6,
          },
          {
            name: "Gas",
            monthlyBudget: 200,
            spent: 150,
            currentBalance: 50,
            utilizationRate: 0.75,
          },
        ],
      };
      const yPosition = 20;
      const margin = 10;
      const checkPageBreak = vi.fn();

      addEnvelopeAnalysisToPDF(mockPdf, balanceData, yPosition, margin, checkPageBreak);

      // Check first envelope row
      expect(mockPdf.text).toHaveBeenCalledWith("Groceries", margin, yPosition + 18);
      expect(mockPdf.text).toHaveBeenCalledWith("$500", margin + 50, yPosition + 18);
      expect(mockPdf.text).toHaveBeenCalledWith("$300", margin + 75, yPosition + 18);
      expect(mockPdf.text).toHaveBeenCalledWith("$200", margin + 100, yPosition + 18);
      expect(mockPdf.text).toHaveBeenCalledWith("60%", margin + 125, yPosition + 18);

      // Check second envelope row
      expect(mockPdf.text).toHaveBeenCalledWith("Gas", margin, yPosition + 24);
      expect(mockPdf.text).toHaveBeenCalledWith("$200", margin + 50, yPosition + 24);
      expect(mockPdf.text).toHaveBeenCalledWith("$150", margin + 75, yPosition + 24);
      expect(mockPdf.text).toHaveBeenCalledWith("$50", margin + 100, yPosition + 24);
      expect(mockPdf.text).toHaveBeenCalledWith("75%", margin + 125, yPosition + 24);
    });

    it("should truncate long envelope names", () => {
      const balanceData = {
        envelopeAnalysis: [
          {
            name: "Very Long Envelope Name That Should Be Truncated",
            monthlyBudget: 500,
            spent: 300,
            currentBalance: 200,
            utilizationRate: 0.6,
          },
        ],
      };
      const yPosition = 20;
      const margin = 10;
      const checkPageBreak = vi.fn();

      addEnvelopeAnalysisToPDF(mockPdf, balanceData, yPosition, margin, checkPageBreak);

      // Should truncate to 20 characters
      expect(mockPdf.text).toHaveBeenCalledWith("Very Long Envelope N", margin, yPosition + 18);
    });

    it("should handle missing envelope data with defaults", () => {
      const balanceData = {
        envelopeAnalysis: [
          {
            name: undefined,
            monthlyBudget: undefined,
            spent: undefined,
            currentBalance: undefined,
            utilizationRate: undefined,
          },
        ],
      };
      const yPosition = 20;
      const margin = 10;
      const checkPageBreak = vi.fn();

      addEnvelopeAnalysisToPDF(mockPdf, balanceData, yPosition, margin, checkPageBreak);

      expect(mockPdf.text).toHaveBeenCalledWith("Unknown", margin, yPosition + 18);
      expect(mockPdf.text).toHaveBeenCalledWith("$0", margin + 50, yPosition + 18);
      expect(mockPdf.text).toHaveBeenCalledWith("$0", margin + 75, yPosition + 18);
      expect(mockPdf.text).toHaveBeenCalledWith("$0", margin + 100, yPosition + 18);
      expect(mockPdf.text).toHaveBeenCalledWith("0.0%", margin + 125, yPosition + 18);
    });

    it("should limit envelopes to maximum of 15", () => {
      const envelopes = Array.from({ length: 20 }, (_, i) => ({
        name: `Envelope ${i + 1}`,
        monthlyBudget: 100,
        spent: 50,
        currentBalance: 50,
        utilizationRate: 0.5,
      }));
      const balanceData = { envelopeAnalysis: envelopes };
      const yPosition = 20;
      const margin = 10;
      const checkPageBreak = vi.fn();

      addEnvelopeAnalysisToPDF(mockPdf, balanceData, yPosition, margin, checkPageBreak);

      // Should only call checkPageBreak 15 times (once per envelope row)
      expect(checkPageBreak).toHaveBeenCalledTimes(15);
    });

    it("should call checkPageBreak for each envelope row", () => {
      const balanceData = {
        envelopeAnalysis: [
          {
            name: "Groceries",
            monthlyBudget: 500,
            spent: 300,
            currentBalance: 200,
            utilizationRate: 0.6,
          },
          {
            name: "Gas",
            monthlyBudget: 200,
            spent: 150,
            currentBalance: 50,
            utilizationRate: 0.75,
          },
        ],
      };
      const yPosition = 20;
      const margin = 10;
      const checkPageBreak = vi.fn();

      addEnvelopeAnalysisToPDF(mockPdf, balanceData, yPosition, margin, checkPageBreak);

      expect(checkPageBreak).toHaveBeenCalledTimes(2);
      expect(checkPageBreak).toHaveBeenCalledWith(8);
    });

    it("should return correct y position after adding envelopes", () => {
      const balanceData = {
        envelopeAnalysis: [
          {
            name: "Groceries",
            monthlyBudget: 500,
            spent: 300,
            currentBalance: 200,
            utilizationRate: 0.6,
          },
          {
            name: "Gas",
            monthlyBudget: 200,
            spent: 150,
            currentBalance: 50,
            utilizationRate: 0.75,
          },
        ],
      };
      const yPosition = 20;
      const margin = 10;
      const checkPageBreak = vi.fn();

      const result = addEnvelopeAnalysisToPDF(
        mockPdf,
        balanceData,
        yPosition,
        margin,
        checkPageBreak
      );

      // Should add: 10 (header) + 8 (headers) + 6 + 6 (rows) + 10 (spacing) = 40
      expect(result).toBe(yPosition + 40);
    });

    it("should handle empty envelope analysis", () => {
      const balanceData = { envelopeAnalysis: [] };
      const yPosition = 20;
      const margin = 10;
      const checkPageBreak = vi.fn();

      const result = addEnvelopeAnalysisToPDF(
        mockPdf,
        balanceData,
        yPosition,
        margin,
        checkPageBreak
      );

      // Should still add header and return position
      expect(mockPdf.text).toHaveBeenCalledWith("Envelope Analysis", margin, yPosition);
      expect(checkPageBreak).not.toHaveBeenCalled();
      expect(result).toBe(yPosition + 28); // 10 (header) + 8 (table headers) + 10 (spacing)
    });

    it("should handle undefined envelope analysis", () => {
      const balanceData = {};
      const yPosition = 20;
      const margin = 10;
      const checkPageBreak = vi.fn();

      const result = addEnvelopeAnalysisToPDF(
        mockPdf,
        balanceData,
        yPosition,
        margin,
        checkPageBreak
      );

      // Should still add header
      expect(mockPdf.text).toHaveBeenCalledWith("Envelope Analysis", margin, yPosition);
      expect(checkPageBreak).not.toHaveBeenCalled();
      expect(result).toBe(yPosition + 28);
    });

    it("should format decimal values correctly", () => {
      const balanceData = {
        envelopeAnalysis: [
          {
            name: "Test",
            monthlyBudget: 123.456,
            spent: 78.912,
            currentBalance: 44.544,
            utilizationRate: 0.6397,
          },
        ],
      };
      const yPosition = 20;
      const margin = 10;
      const checkPageBreak = vi.fn();

      addEnvelopeAnalysisToPDF(mockPdf, balanceData, yPosition, margin, checkPageBreak);

      // Budget, spent, balance should be rounded to 0 decimals
      expect(mockPdf.text).toHaveBeenCalledWith("$123", margin + 50, yPosition + 18);
      expect(mockPdf.text).toHaveBeenCalledWith("$79", margin + 75, yPosition + 18);
      expect(mockPdf.text).toHaveBeenCalledWith("$45", margin + 100, yPosition + 18);
      // Utilization rate should be 1 decimal
      expect(mockPdf.text).toHaveBeenCalledWith("0.6%", margin + 125, yPosition + 18);
    });

    it("should use correct font styles for headers and data", () => {
      const balanceData = {
        envelopeAnalysis: [
          {
            name: "Test",
            monthlyBudget: 100,
            spent: 50,
            currentBalance: 50,
            utilizationRate: 0.5,
          },
        ],
      };
      const yPosition = 20;
      const margin = 10;
      const checkPageBreak = vi.fn();

      addEnvelopeAnalysisToPDF(mockPdf, balanceData, yPosition, margin, checkPageBreak);

      // Should set bold for section header, then normal for table
      expect(mockPdf.setFont).toHaveBeenCalledWith("helvetica", "bold");
      expect(mockPdf.setFont).toHaveBeenCalledWith("helvetica", "normal");
      expect(mockPdf.setFontSize).toHaveBeenCalledWith(16); // section header
      expect(mockPdf.setFontSize).toHaveBeenCalledWith(10); // table
    });
  });

  describe("addInsightsToPDF", () => {
    it("should add insights header to PDF", () => {
      const yPosition = 20;
      const margin = 10;

      addInsightsToPDF(mockPdf, yPosition, margin);

      expect(mockPdf.setFontSize).toHaveBeenCalledWith(16);
      expect(mockPdf.setFont).toHaveBeenCalledWith("helvetica", "bold");
      expect(mockPdf.text).toHaveBeenCalledWith("Key Insights", margin, yPosition);
    });

    it("should add all three insights", () => {
      const yPosition = 20;
      const margin = 10;

      addInsightsToPDF(mockPdf, yPosition, margin);

      // Check all insights are added with bullet points
      expect(mockPdf.text).toHaveBeenCalledWith(
        "• Budget adherence analysis shows areas for improvement",
        margin,
        yPosition + 10
      );
      expect(mockPdf.text).toHaveBeenCalledWith(
        "• Top spending categories identified for optimization",
        margin,
        yPosition + 18
      );
      expect(mockPdf.text).toHaveBeenCalledWith(
        "• Seasonal patterns detected in spending behavior",
        margin,
        yPosition + 26
      );
    });

    it("should return correct y position after adding insights", () => {
      const yPosition = 20;
      const margin = 10;

      const result = addInsightsToPDF(mockPdf, yPosition, margin);

      // Should add: 10 (header) + 8 + 8 + 8 (insights) = 34
      expect(result).toBe(yPosition + 34);
    });

    it("should use correct font styles", () => {
      const yPosition = 20;
      const margin = 10;

      addInsightsToPDF(mockPdf, yPosition, margin);

      // Should set bold for header, then normal for insights
      expect(mockPdf.setFont).toHaveBeenCalledWith("helvetica", "bold");
      expect(mockPdf.setFont).toHaveBeenCalledWith("helvetica", "normal");
      expect(mockPdf.setFontSize).toHaveBeenCalledWith(16); // header
      expect(mockPdf.setFontSize).toHaveBeenCalledWith(12); // insights
    });

    it("should add insights in correct order", () => {
      const yPosition = 20;
      const margin = 10;

      addInsightsToPDF(mockPdf, yPosition, margin);

      const textCalls = mockPdf.text.mock.calls.filter((call) => call[0].startsWith("•"));

      expect(textCalls).toHaveLength(3);
      expect(textCalls[0][0]).toContain("Budget adherence");
      expect(textCalls[1][0]).toContain("Top spending categories");
      expect(textCalls[2][0]).toContain("Seasonal patterns");
    });

    it("should space insights correctly", () => {
      const yPosition = 20;
      const margin = 10;

      addInsightsToPDF(mockPdf, yPosition, margin);

      const textCalls = mockPdf.text.mock.calls.filter((call) => call[0].startsWith("•"));

      expect(textCalls[0][2]).toBe(yPosition + 10);
      expect(textCalls[1][2]).toBe(yPosition + 18);
      expect(textCalls[2][2]).toBe(yPosition + 26);
    });
  });
});
