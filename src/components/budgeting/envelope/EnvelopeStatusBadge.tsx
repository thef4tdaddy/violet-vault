import React from "react";
import { getIcon } from "@/utils";

interface EnvelopeStatusBadgeProps {
  status: string;
  utilizationRate: number;
  statusIcon: string;
  utilizationColorClass: string;
}

export const EnvelopeStatusBadge: React.FC<EnvelopeStatusBadgeProps> = React.memo(
  ({ status, utilizationRate, statusIcon, utilizationColorClass }) => {
    return (
      <div className={`flex items-center px-2 py-1 rounded-full text-xs ${utilizationColorClass}`}>
        {status !== "healthy" &&
          React.createElement(getIcon(statusIcon), {
            className: "h-4 w-4",
          })}
        <span className="ml-1">{(utilizationRate * 100).toFixed(0)}%</span>
      </div>
    );
  }
);

EnvelopeStatusBadge.displayName = "EnvelopeStatusBadge";
