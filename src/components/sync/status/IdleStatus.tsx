import React from "react";
import { renderIcon } from "@/utils/icons";

/**
 * Props for IdleStatus component
 */
interface IdleStatusProps {
  color: string;
  message: string;
  lastSyncTime: number | null;
  formatLastSync: (timestamp: number | null) => string;
}

/**
 * Component for displaying idle status (blocked, slow, degraded, unhealthy)
 */
export const IdleStatus: React.FC<IdleStatusProps> = ({
  color,
  message,
  lastSyncTime,
  formatLastSync,
}) => {
  return (
    <div className="flex items-center space-x-3">
      <div className={`relative p-2 rounded-full bg-${color}-50`}>
        {renderIcon("Wifi", {
          className: `h-5 w-5 text-${color}-600`,
        })}
      </div>

      <div>
        <div className={`font-semibold text-${color}-700`}>{message}</div>
        <div className="flex items-center text-sm text-gray-600">
          {renderIcon("Clock", { className: "h-3 w-3 mr-1" })}
          <span>{formatLastSync(lastSyncTime)}</span>
        </div>
      </div>
    </div>
  );
};
