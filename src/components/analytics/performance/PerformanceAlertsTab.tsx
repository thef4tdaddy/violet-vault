import React from "react";
import { getIcon } from "../../../utils";
import { getAlertIconType } from "@/utils/performanceUtils";

import { Alert } from "@/types/analytics";

interface PerformanceAlertsTabProps {
  alerts: Alert[];
}

/**
 * PerformanceAlertsTab component - alerts tab content
 * Extracted from PerformanceMonitor.jsx for better organization
 */
const PerformanceAlertsTab: React.FC<PerformanceAlertsTabProps> = ({ alerts }) => {
  const CheckCircle = getIcon("CheckCircle");

  const renderAlertIcon = (type: string) => {
    const iconConfig = getAlertIconType(type);
    const Icon = getIcon(iconConfig.name);
    return React.createElement(Icon, {
      className: `h-5 w-5 ${iconConfig.color}`,
    });
  };

  return (
    <div className="space-y-3">
      {alerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {React.createElement(CheckCircle, {
            className: "h-12 w-12 mx-auto mb-4 text-green-500",
          })}
          <p className="text-lg font-medium">All Good!</p>
          <p>No performance alerts at this time.</p>
        </div>
      ) : (
        alerts.map((alert, index) => (
          <div
            key={index}
            className="bg-white/60 rounded-lg p-4 border border-white/20 flex items-start"
          >
            <div className="mr-3 mt-0.5">{renderAlertIcon(alert.type)}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{alert.title}</h4>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${(() => {
                    if (alert.severity === "critical")
                      return "bg-red-100 text-red-800 border-red-200";
                    if (alert.severity === "warning")
                      return "bg-yellow-100 text-yellow-800 border-yellow-200";
                    return "bg-blue-100 text-blue-800 border-blue-200";
                  })()}`}
                >
                  {alert.severity}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{alert.message}</p>
              {alert.action && (
                <p className="text-purple-600 text-sm font-medium">💡 {alert.action}</p>
              )}
              {alert.details && (
                <p className="text-gray-500 text-xs mt-2">Affected: {alert.details}</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PerformanceAlertsTab;
