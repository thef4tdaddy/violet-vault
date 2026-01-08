/**
 * Utility functions for PDF export
 * Extracted from useReportExporter hook to reduce complexity
 */

interface AnalyticsData {
  totalIncome?: number;
  totalExpenses?: number;
  netAmount?: number;
}

interface BalanceData {
  envelopeAnalysis?: Array<{
    name?: string;
    monthlyBudget?: number;
    spent?: number;
    currentBalance?: number;
    utilizationRate?: number;
  }>;
}

type PDFDocument = {
  setFontSize: (size: number) => void;
  setFont: (font: string, style: string) => void;
  text: (text: string, x: number, y: number) => void;
};

/**
 * Add summary section to PDF
 */
export const addSummaryToPDF = (
  pdf: PDFDocument,
  analyticsData: AnalyticsData,
  yPosition: number,
  margin: number
): number => {
  let y = yPosition;

  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Financial Summary", margin, y);
  y += 10;

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");

  if (analyticsData) {
    pdf.text(`Total Income: $${(analyticsData.totalIncome || 0).toLocaleString()}`, margin, y);
    y += 8;
    pdf.text(`Total Expenses: $${(analyticsData.totalExpenses || 0).toLocaleString()}`, margin, y);
    y += 8;
    pdf.text(`Net Amount: $${(analyticsData.netAmount || 0).toLocaleString()}`, margin, y);
    y += 15;
  }

  return y;
};

/**
 * Add envelope analysis table to PDF
 */
export const addEnvelopeAnalysisToPDF = (
  pdf: PDFDocument,
  balanceData: BalanceData,
  yPosition: number,
  margin: number,
  checkPageBreak: (height?: number) => void
): number => {
  let y = yPosition;

  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Envelope Analysis", margin, y);
  y += 10;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");

  // Table headers
  const headers = ["Envelope", "Budget", "Spent", "Balance", "Utilization"];
  const colWidths = [50, 25, 25, 25, 25];
  let xPosition = margin;

  pdf.setFont("helvetica", "bold");
  headers.forEach((header, index) => {
    pdf.text(header, xPosition, y);
    xPosition += colWidths[index];
  });
  y += 8;

  pdf.setFont("helvetica", "normal");
  if (balanceData.envelopeAnalysis) {
    balanceData.envelopeAnalysis.slice(0, 15).forEach((envelope) => {
      checkPageBreak(8);

      xPosition = margin;
      const rowData = [
        envelope.name?.substring(0, 20) || "Unknown",
        `$${(envelope.monthlyBudget || 0).toFixed(0)}`,
        `$${(envelope.spent || 0).toFixed(0)}`,
        `$${(envelope.currentBalance || 0).toFixed(0)}`,
        `${(envelope.utilizationRate || 0).toFixed(1)}%`,
      ];

      rowData.forEach((data, index) => {
        pdf.text(data, xPosition, y);
        xPosition += colWidths[index];
      });
      y += 6;
    });
  }

  y += 10;
  return y;
};

/**
 * Add insights section to PDF
 */
export const addInsightsToPDF = (pdf: PDFDocument, yPosition: number, margin: number): number => {
  let y = yPosition;

  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Key Insights", margin, y);
  y += 10;

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");

  const insights = [
    "Budget adherence analysis shows areas for improvement",
    "Top spending categories identified for optimization",
    "Seasonal patterns detected in spending behavior",
  ];

  insights.forEach((insight) => {
    pdf.text(`• ${insight}`, margin, y);
    y += 8;
  });

  return y;
};
