import React from "react";
import { getIcon } from "@/utils";

/**
 * Props for the status cards component
 */
interface EnvelopeIntegrityStatusCardsProps {
  report: {
    healthy: number;
    corrupted: number;
    total: number;
  } | null;
}

/**
 * Status cards component for envelope integrity checker
 * Displays summary statistics with icons and colors
 * Extracted from EnvelopeIntegrityChecker.tsx for reusability
 */
export const EnvelopeIntegrityStatusCards: React.FC<EnvelopeIntegrityStatusCardsProps> = ({
  report,
}) => {
  if (!report) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Healthy Envelopes */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          {React.createElement(getIcon("CheckCircle"), {
            className: "h-8 w-8 text-green-600",
          })}
          <div className="ml-3">
            <p className="text-2xl font-bold text-green-900">{report.healthy}</p>
            <p className="text-sm text-green-700">Healthy Envelopes</p>
          </div>
        </div>
      </div>

      {/* Issues Found */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          {React.createElement(getIcon("AlertTriangle"), {
            className: "h-8 w-8 text-yellow-600",
          })}
          <div className="ml-3">
            <p className="text-2xl font-bold text-yellow-900">{report.corrupted}</p>
            <p className="text-sm text-yellow-700">Issues Found</p>
          </div>
        </div>
      </div>

      {/* Total Envelopes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          {React.createElement(getIcon("FileText"), {
            className: "h-8 w-8 text-blue-600",
          })}
          <div className="ml-3">
            <p className="text-2xl font-bold text-blue-900">{report.total}</p>
            <p className="text-sm text-blue-700">Total Envelopes</p>
          </div>
        </div>
      </div>
    </div>
  );
};
