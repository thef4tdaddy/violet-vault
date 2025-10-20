import React from "react";
import { getIcon } from "@/utils";

/**
 * Props for the export options form component
 */
interface ExportOptionsFormProps {
  exportOptions: Record<string, boolean>;
  timeFilter: string;
  onOptionChange: (option: string, value: boolean) => void;
  disabled?: boolean;
}

/**
 * Export options form component
 * Displays checkboxes for including different sections in the export
 * Extracted from ReportExporter.tsx for reusability
 */
export const ExportOptionsForm: React.FC<ExportOptionsFormProps> = ({
  exportOptions,
  timeFilter,
  onOptionChange,
  disabled = false,
}) => {
  const optionConfigs = [
    {
      key: "includeSummary",
      label: "Financial Summary",
      icon: "DollarSign",
    },
    {
      key: "includeCharts",
      label: "Charts & Visualizations",
      icon: "Image",
    },
    {
      key: "includeTransactions",
      label: "Transaction Details",
      icon: "Table",
    },
    {
      key: "includeEnvelopes",
      label: "Envelope Analysis",
      icon: "FileText",
    },
    {
      key: "includeSavings",
      label: "Savings Goals",
      icon: "CheckCircle",
    },
    {
      key: "includeInsights",
      label: "AI Insights",
      icon: "Settings",
    },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Include in Report</h3>
      <div className="space-y-4">
        {optionConfigs.map((option) => (
          <label
            key={option.key}
            className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={exportOptions[option.key]}
              onChange={(e) => onOptionChange(option.key, e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              disabled={disabled}
            />
            {React.createElement(getIcon(option.icon), {
              className: "h-5 w-5 text-gray-500 ml-3 mr-3",
            })}
            <span className="font-medium text-gray-900">{option.label}</span>
          </label>
        ))}
      </div>

      {/* Date Range */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          {React.createElement(getIcon("Calendar"), {
            className: "h-4 w-4 mr-2",
          })}
          Report Period
        </h4>
        <div className="bg-gray-50 rounded-lg p-3">
          <span className="text-sm text-gray-600">Current filter: </span>
          <span className="font-medium text-gray-900">{timeFilter}</span>
        </div>
      </div>
    </div>
  );
};
