import React from "react";
import { Button } from "@/components/ui";

/**
 * Props for the export templates component
 */
interface ExportTemplatesProps {
  onTemplateSelect: (templateKey: string) => void;
  disabled?: boolean;
}

/**
 * Export templates component
 * Displays quick template options for common export configurations
 * Extracted from ReportExporter.tsx for reusability
 */
export const ExportTemplates: React.FC<ExportTemplatesProps> = ({
  onTemplateSelect,
  disabled = false,
}) => {
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

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Templates</h3>
      <div className="grid grid-cols-1 gap-3">
        {reportTemplates.map((template) => (
          <Button
            key={template.key}
            onClick={() => onTemplateSelect(template.key)}
            className="text-left border border-gray-200 rounded-lg p-3 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            disabled={disabled}
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
          </Button>
        ))}
      </div>
    </div>
  );
};
