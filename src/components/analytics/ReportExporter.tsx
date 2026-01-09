import React from "react";
import { getIcon } from "@/utils";
import { Button } from "@/components/ui";
import { useModalAutoScroll } from "@/hooks/platform/ux/useModalAutoScroll";
import { useReportExporter } from "@/hooks/platform/analytics/useReportExporter";
import { ExportFormatSelector } from "./report-exporter/ExportFormatSelector";
import { ExportTemplates } from "./report-exporter/ExportTemplates";
import { ExportOptionsForm } from "./report-exporter/ExportOptionsForm";
import { ExportProgressIndicator } from "./report-exporter/ExportProgressIndicator";
import ModalCloseButton from "@/components/ui/ModalCloseButton";

interface ReportExporterProps {
  analyticsData: {
    balanceData: Record<string, unknown>;
    categoryData: Record<string, unknown>;
    transactionData: Record<string, unknown>;
    envelopeData: Record<string, unknown>;
    savingsData: Record<string, unknown>;
  };
  balanceData: Record<string, unknown>;
  timeFilter: string;
  onExport: () => void;
  onClose: () => void;
}

/**
 * Report Exporter for v1.10.0
 * Refactored using extracted components for better maintainability
 * All logic extracted to useReportExporter hook
 */
const ReportExporter = ({
  analyticsData,
  balanceData,
  timeFilter,
  onExport,
  onClose,
}: ReportExporterProps) => {
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

  const modalRef = useModalAutoScroll(true);

  const handleTemplateSelect = (templateKey: string) => {
    applyTemplate(templateKey);
  };

  const handleOptionChange = (option: string, value: boolean) => {
    setExportOptions((prev) => ({
      ...prev,
      [option]: value,
    }));
  };

  const onExportClick = () => {
    handleExport(analyticsData, balanceData, timeFilter, onExport, onClose);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-black shadow-2xl my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              {React.createElement(getIcon("Download"), {
                className: "h-6 w-6 mr-3 text-blue-600",
              })}
              Export Report
            </h2>
            <p className="text-gray-600 mt-1">Generate comprehensive analytics reports</p>
          </div>
          <ModalCloseButton
            onClick={() => {
              if (!isExporting) {
                onClose();
              }
            }}
            className={isExporting ? "opacity-50 pointer-events-none" : ""}
          />
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Export Format Selection */}
            <div>
              <ExportFormatSelector
                exportFormat={exportFormat}
                onFormatChange={setExportFormat}
                disabled={isExporting}
              />
              <ExportTemplates onTemplateSelect={handleTemplateSelect} disabled={isExporting} />
            </div>

            {/* Export Options */}
            <ExportOptionsForm
              exportOptions={exportOptions as unknown as Record<string, boolean>}
              timeFilter={timeFilter}
              onOptionChange={handleOptionChange}
              disabled={isExporting}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex items-center text-sm text-gray-600">
            {React.createElement(getIcon("FileText"), {
              className: "h-4 w-4 mr-2",
            })}
            {exportFormat.toUpperCase()} export selected
          </div>

          <ExportProgressIndicator isExporting={isExporting} progress={exportProgress} />

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
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
                  {React.createElement(getIcon("Download"), {
                    className: "h-4 w-4 mr-2",
                  })}
                  Export Report
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportExporter;
