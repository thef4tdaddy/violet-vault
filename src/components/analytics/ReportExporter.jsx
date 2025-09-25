import React from "react";
import { useReportExporter } from "../../hooks/analytics/useReportExporter";
import ReportExportHeader from "./components/ReportExportHeader";
import ReportFormatSelector from "./components/ReportFormatSelector";
import ReportTemplateSelector from "./components/ReportTemplateSelector";
import ReportOptionsPanel from "./components/ReportOptionsPanel";
import ReportExportFooter from "./components/ReportExportFooter";

/**
 * Report Exporter for v1.10.0
 * Refactored into focused components following established patterns
 * Main component reduced from 340 lines to focused orchestration
 */
const ReportExporter = ({
  analyticsData,
  balanceData,
  timeFilter,
  onExport,
  onClose,
}) => {
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
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-black shadow-lg">
        <ReportExportHeader onClose={onClose} isExporting={isExporting} />
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <ReportFormatSelector 
                exportFormat={exportFormat}
                setExportFormat={setExportFormat}
              />
              <ReportTemplateSelector 
                applyTemplate={applyTemplate}
                isExporting={isExporting}
              />
            </div>
            
            <ReportOptionsPanel 
              exportOptions={exportOptions}
              onOptionChange={handleOptionChange}
              timeFilter={timeFilter}
              isExporting={isExporting}
            />
          </div>
        </div>

        <ReportExportFooter 
          exportFormat={exportFormat}
          isExporting={isExporting}
          exportProgress={exportProgress}
          onExport={onExportClick}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default ReportExporter;
