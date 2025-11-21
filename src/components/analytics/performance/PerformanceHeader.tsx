import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";

interface PerformanceHeaderProps {
  alertsEnabled: boolean;
  setAlertsEnabled: (enabled: boolean) => void;
}

/**
 * PerformanceHeader component - header section with controls
 * Extracted from PerformanceMonitor.jsx for better organization
 */
const PerformanceHeader: React.FC<PerformanceHeaderProps> = ({
  alertsEnabled,
  setAlertsEnabled,
}) => {
  const Zap = getIcon("Zap");
  const Bell = getIcon("Bell");
  const BellOff = getIcon("BellOff");
  const Clock = getIcon("Clock");

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <div className="relative mr-3">
            <div className="absolute inset-0 bg-purple-500 rounded-xl blur-lg opacity-30"></div>
            <div className="relative bg-purple-500 p-2 rounded-xl">
              {React.createElement(Zap, { className: "h-5 w-5 text-white" })}
            </div>
          </div>
          Performance Monitor
        </h3>
        <p className="text-gray-600 mt-1">Real-time financial health tracking</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={() => setAlertsEnabled(!alertsEnabled)}
          className={`p-2 rounded-lg transition-colors ${
            alertsEnabled
              ? "text-blue-600 bg-blue-100 hover:bg-blue-200"
              : "text-gray-400 bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {React.createElement(alertsEnabled ? Bell : BellOff, {
            className: "h-4 w-4",
          })}
        </Button>

        <div className="flex items-center gap-1 text-sm text-gray-500">
          {React.createElement(Clock, { className: "h-4 w-4" })}
          Live
        </div>
      </div>
    </div>
  );
};

export default PerformanceHeader;
