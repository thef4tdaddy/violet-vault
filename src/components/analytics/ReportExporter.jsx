import React from "react";
import {
  Download,
  FileText,
  Image,
  Table,
  X,
  Calendar,
  DollarSign,
  Settings,
  CheckCircle,
} from "lucide-react";
import { useReportExporter } from "../../hooks/analytics/useReportExporter";

/**
 * Report Exporter for v1.10.0
 * Pure UI component - all logic extracted to useReportExporter hook
 */
const ReportExporter = ({ analyticsData, balanceData, timeFilter, onExport, onClose }) => {
  const {
    exportFormat,
    exportOptions,
    isExporting,
    exportProgress,
    setExportFormat,
    setExportOptions,
    handleExport,
    applyTemplate,
  } = useReportExporter();

  const exportFormats = [
    {
      key: "pdf",
      label: "PDF Report",
      icon: FileText,
      description: "Comprehensive report with charts and analysis",
      recommended: true,
    },
    {
      key: "csv",
      label: "CSV Data",
      icon: Table,
      description: "Raw data export for spreadsheet analysis",
    },
    {
      key: "png",
      label: "Chart Images",
      icon: Image,
      description: "Export charts as PNG images",
    },
  ];

  const reportTemplates = [
    {
      key: "executive",
      name: "Executive Summary",
      description: "High-level overview for quick review",
      includes: ["summary", "insights", "charts"],
    },
    {
      key: "detailed",
      name: "Detailed Analysis",
      description: "Comprehensive report with all data",
      includes: ["summary", "charts", "transactions", "envelopes", "savings", "insights"],
    },
    {
      key: "budget",
      name: "Budget Performance",
      description: "Focus on budget adherence and envelope analysis",
      includes: ["summary", "envelopes", "budget_charts", "insights"],
    },
    {
      key: "trends",
      name: "Trend Analysis",
      description: "Historical trends and forecasting",
      includes: ["charts", "trends", "insights"],
    },
  ];

  const handleTemplateSelect = (templateKey) => {
    applyTemplate(templateKey);
  };

  const handleOptionChange = (option, value) => {
    setExportOptions((prev) => ({
      ...prev,
      [option]: value,
    }));
  };

  const onExportClick = () => {
    handleExport(analyticsData, balanceData, timeFilter, onExport, onClose);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Download className="h-6 w-6 mr-3 text-blue-600" />
              Export Report
            </h2>
            <p className="text-gray-600 mt-1">Generate comprehensive analytics reports</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            disabled={isExporting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Export Format Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h3>
              <div className="space-y-3">
                {exportFormats.map((format) => (
                  <div
                    key={format.key}
                    className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                      exportFormat === format.key
                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setExportFormat(format.key)}
                  >
                    {format.recommended && (
                      <span className="absolute -top-2 -right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Recommended
                      </span>
                    )}
                    <div className="flex items-start">
                      <format.icon className="h-6 w-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">{format.label}</h4>
                        <p className="text-sm text-gray-600 mt-1">{format.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Templates */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Templates</h3>
                <div className="grid grid-cols-1 gap-3">
                  {reportTemplates.map((template) => (
                    <button
                      key={template.key}
                      onClick={() => handleTemplateSelect(template.key)}
                      className="text-left border border-gray-200 rounded-lg p-3 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                      disabled={isExporting}
                    >
                      <div className="font-medium text-gray-900">{template.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{template.description}</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.includes.map((include) => (
                          <span
                            key={include}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {include}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Include in Report</h3>
              <div className="space-y-4">
                {[
                  {
                    key: "includeSummary",
                    label: "Financial Summary",
                    icon: DollarSign,
                  },
                  {
                    key: "includeCharts",
                    label: "Charts & Visualizations",
                    icon: Image,
                  },
                  {
                    key: "includeTransactions",
                    label: "Transaction Details",
                    icon: Table,
                  },
                  {
                    key: "includeEnvelopes",
                    label: "Envelope Analysis",
                    icon: FileText,
                  },
                  {
                    key: "includeSavings",
                    label: "Savings Goals",
                    icon: CheckCircle,
                  },
                  {
                    key: "includeInsights",
                    label: "AI Insights",
                    icon: Settings,
                  },
                ].map((option) => (
                  <label
                    key={option.key}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={exportOptions[option.key]}
                      onChange={(e) => handleOptionChange(option.key, e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      disabled={isExporting}
                    />
                    <option.icon className="h-5 w-5 text-gray-500 ml-3 mr-3" />
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>

              {/* Date Range */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Report Period
                </h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-sm text-gray-600">Current filter: </span>
                  <span className="font-medium text-gray-900">{timeFilter}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex items-center text-sm text-gray-600">
            <FileText className="h-4 w-4 mr-2" />
            {exportFormat.toUpperCase()} export selected
          </div>

          {isExporting && (
            <div className="flex items-center">
              <div className="flex items-center mr-4">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">{exportProgress}%</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              disabled={isExporting}
            >
              Cancel
            </button>
            <button
              onClick={onExportClick}
              disabled={isExporting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportExporter;
