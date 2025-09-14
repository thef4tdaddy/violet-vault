import { useState, useCallback } from "react";
// html2canvas loaded dynamically to reduce bundle size
import jsPDF from "jspdf";
import { globalToast } from "../../stores/ui/toastStore";
import logger from "../../utils/common/logger";

/**
 * Hook for handling report export functionality
 * Extracts all export logic from ReportExporter component
 */
export const useReportExporter = () => {
  const [exportFormat, setExportFormat] = useState("pdf");
  const [exportOptions, setExportOptions] = useState({
    includeSummary: true,
    includeCharts: true,
    includeTransactions: false,
    includeEnvelopes: true,
    includeSavings: true,
    includeInsights: true,
    customDateRange: null,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportToPDF = useCallback(
    async (analyticsData, balanceData, timeFilter) => {
      setExportProgress(10);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      let yPosition = 20;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;

      const checkPageBreak = (requiredHeight = 40) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = 20;
        }
      };

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

      setExportProgress(20);

      if (exportOptions.includeSummary) {
        checkPageBreak(50);

        // Financial Summary
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("Financial Summary", margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");

        if (analyticsData) {
          pdf.text(
            `Total Income: $${(analyticsData.totalIncome || 0).toLocaleString()}`,
            margin,
            yPosition
          );
          yPosition += 8;
          pdf.text(
            `Total Expenses: $${(analyticsData.totalExpenses || 0).toLocaleString()}`,
            margin,
            yPosition
          );
          yPosition += 8;
          pdf.text(
            `Net Amount: $${(analyticsData.netAmount || 0).toLocaleString()}`,
            margin,
            yPosition
          );
          yPosition += 15;
        }

        setExportProgress(30);
      }

      if (exportOptions.includeEnvelopes && balanceData?.envelopeAnalysis) {
        checkPageBreak(60);

        // Envelope Analysis
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("Envelope Analysis", margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");

        // Table headers
        const headers = ["Envelope", "Budget", "Spent", "Balance", "Utilization"];
        const colWidths = [50, 25, 25, 25, 25];
        let xPosition = margin;

        pdf.setFont("helvetica", "bold");
        headers.forEach((header, index) => {
          pdf.text(header, xPosition, yPosition);
          xPosition += colWidths[index];
        });
        yPosition += 8;

        pdf.setFont("helvetica", "normal");
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
            pdf.text(data, xPosition, yPosition);
            xPosition += colWidths[index];
          });
          yPosition += 6;
        });

        yPosition += 10;
        setExportProgress(50);
      }

      if (exportOptions.includeInsights) {
        checkPageBreak(40);

        // Insights
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("Key Insights", margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");

        const insights = [
          "Budget adherence analysis shows areas for improvement",
          "Top spending categories identified for optimization",
          "Seasonal patterns detected in spending behavior",
        ];

        insights.forEach((insight) => {
          checkPageBreak(8);
          pdf.text(`• ${insight}`, margin, yPosition);
          yPosition += 8;
        });

        setExportProgress(70);
      }

      setExportProgress(90);

      // Save PDF
      const fileName = `VioletVault-Report-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);

      setExportProgress(100);
    },
    [exportOptions]
  );

  const exportToCSV = useCallback(async (analyticsData) => {
    setExportProgress(10);

    const csvData = [];

    // Headers
    csvData.push(["Date", "Description", "Amount", "Category", "Envelope"]);

    setExportProgress(30);

    // Add transaction data
    if (analyticsData?.transactions) {
      analyticsData.transactions.forEach((transaction) => {
        csvData.push([
          transaction.date || "",
          transaction.description || "",
          transaction.amount || 0,
          transaction.category || "Uncategorized",
          transaction.envelopeName || "None",
        ]);
      });
    }

    setExportProgress(60);

    // Convert to CSV string
    const csvContent = csvData
      .map((row) =>
        row
          .map((field) => (typeof field === "string" && field.includes(",") ? `"${field}"` : field))
          .join(",")
      )
      .join("\\n");

    setExportProgress(80);

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `VioletVault-Data-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    setExportProgress(100);
  }, []);

  const exportChartImages = useCallback(async () => {
    setExportProgress(10);

    const chartElements = document.querySelectorAll("[data-chart-export]");

    for (let i = 0; i < chartElements.length; i++) {
      const element = chartElements[i];
      const chartName = element.getAttribute("data-chart-name") || `chart-${i + 1}`;

      setExportProgress(20 + (i * 60) / chartElements.length);

      try {
        // Dynamic import to avoid adding html2canvas to main bundle
        const html2canvas = (await import("html2canvas")).default;
        const canvas = await html2canvas(element, {
          backgroundColor: "#ffffff",
          scale: 2,
          logging: false,
        });

        // Convert to blob and download
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `VioletVault-${chartName}-${new Date().toISOString().split("T")[0]}.png`;
          link.click();
          URL.revokeObjectURL(url);
        }, "image/png");

        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        logger.warn(`Failed to export chart: ${chartName}`, error);
      }
    }

    setExportProgress(100);
  }, []);

  const handleExport = useCallback(
    async (analyticsData, balanceData, timeFilter, onExport, onClose) => {
      setIsExporting(true);
      setExportProgress(0);

      try {
        logger.info("Starting export", {
          format: exportFormat,
          options: exportOptions,
        });

        switch (exportFormat) {
          case "pdf":
            await exportToPDF(analyticsData, balanceData, timeFilter);
            break;
          case "csv":
            await exportToCSV(analyticsData);
            break;
          case "png":
            await exportChartImages();
            break;
          default:
            throw new Error(`Unsupported export format: ${exportFormat}`);
        }

        logger.info("Export completed successfully");
        globalToast.showSuccess(
          `${exportFormat.toUpperCase()} export completed!`,
          "Export Successful"
        );
        onExport?.(exportFormat, exportOptions);
        onClose?.();
      } catch (error) {
        logger.error("Export failed", error);
        globalToast.showError("Export failed. Please try again.", "Export Failed");
      } finally {
        setIsExporting(false);
        setExportProgress(0);
      }
    },
    [exportFormat, exportOptions, exportToPDF, exportToCSV, exportChartImages]
  );

  const applyTemplate = useCallback((template) => {
    const templateOptions = {
      executive: {
        includeSummary: true,
        includeCharts: false,
        includeTransactions: false,
        includeEnvelopes: false,
        includeSavings: false,
        includeInsights: true,
      },
      detailed: {
        includeSummary: true,
        includeCharts: true,
        includeTransactions: true,
        includeEnvelopes: true,
        includeSavings: true,
        includeInsights: true,
      },
      budget: {
        includeSummary: true,
        includeCharts: false,
        includeTransactions: false,
        includeEnvelopes: true,
        includeSavings: false,
        includeInsights: true,
      },
      trends: {
        includeSummary: false,
        includeCharts: true,
        includeTransactions: false,
        includeEnvelopes: false,
        includeSavings: false,
        includeInsights: true,
      },
    };

    if (templateOptions[template]) {
      setExportOptions((prev) => ({
        ...prev,
        ...templateOptions[template],
      }));
    }
  }, []);

  return {
    // State
    exportFormat,
    exportOptions,
    isExporting,
    exportProgress,

    // Actions
    setExportFormat,
    setExportOptions,
    handleExport,
    applyTemplate,
  };
};
