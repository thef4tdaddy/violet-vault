/**
 * Main PDF generation logic
 * Extracted from useReportExporter hook to reduce complexity
 */

import { addSummaryToPDF, addEnvelopeAnalysisToPDF, addInsightsToPDF } from "./pdfExportUtils";

interface ExportOptions {
  includeSummary: boolean;
  includeEnvelopes: boolean;
  includeInsights: boolean;
}

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
  internal: { pageSize: { height: number } };
  addPage: () => void;
  setFontSize: (size: number) => void;
  setFont: (font: string, style: string) => void;
  text: (text: string, x: number, y: number) => void;
  save: (fileName: string) => void;
};

/**
 * Initialize PDF with header
 */
const initializePDF = (
  pdf: PDFDocument,
  timeFilter: string,
  margin: number
): { yPosition: number } => {
  let yPosition = 20;

  // Title
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("VioletVault Analytics Report", margin, yPosition);
  yPosition += 15;

  // Report metadata
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
  yPosition += 8;
  pdf.text(`Period: ${timeFilter}`, margin, yPosition);
  yPosition += 15;

  return { yPosition };
};

/**
 * Configuration for PDF section generation
 */
export interface PDFSectionConfig {
  pdf: PDFDocument;
  yPosition: number;
  margin: number;
  pageHeight: number;
  checkPageBreak: (height?: number) => void;
  analyticsData: AnalyticsData;
  balanceData: BalanceData;
  exportOptions: ExportOptions;
  setExportProgress: (progress: number) => void;
}

/**
 * Add sections to PDF based on options
 */
const addSections = (config: PDFSectionConfig): number => {
  const {
    pdf,
    yPosition,
    margin,
    pageHeight: _pageHeight,
    checkPageBreak,
    analyticsData,
    balanceData,
    exportOptions,
    setExportProgress,
  } = config;

  let y = yPosition;

  if (exportOptions.includeSummary) {
    checkPageBreak(50);
    y = addSummaryToPDF(pdf, analyticsData, y, margin);
    setExportProgress(30);
  }

  if (
    exportOptions.includeEnvelopes &&
    (balanceData as Record<string, unknown>)?.envelopeAnalysis
  ) {
    checkPageBreak(60);
    y = addEnvelopeAnalysisToPDF(pdf, balanceData, y, margin, checkPageBreak);
    setExportProgress(50);
  }

  if (exportOptions.includeInsights) {
    checkPageBreak(40);
    y = addInsightsToPDF(pdf, y, margin);
    setExportProgress(70);
  }

  return y;
};

/**
 * Generate complete PDF report
 */
export const generatePDFReport = async (
  analyticsData: AnalyticsData,
  balanceData: BalanceData,
  timeFilter: string,
  exportOptions: ExportOptions,
  setExportProgress: (progress: number) => void
): Promise<void> => {
  setExportProgress(10);

  const jsPDF = (await import("jspdf")).default;
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" }) as PDFDocument;

  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  let yPosition = 20;

  const checkPageBreak = (requiredHeight = 40) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      pdf.addPage();
      yPosition = 20;
    }
  };

  const initResult = initializePDF(pdf, timeFilter, margin);
  yPosition = initResult.yPosition;

  setExportProgress(20);

  yPosition = addSections({
    pdf,
    yPosition,
    margin,
    pageHeight,
    checkPageBreak,
    analyticsData,
    balanceData,
    exportOptions,
    setExportProgress,
  });

  setExportProgress(90);

  const fileName = `VioletVault-Report-${new Date().toISOString().split("T")[0]}.pdf`;
  pdf.save(fileName);

  setExportProgress(100);
};
