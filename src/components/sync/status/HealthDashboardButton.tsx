import React from "react";
import { Button } from "@/components/ui";
import { renderIcon } from "@/utils/ui/icons";

interface HealthMetrics {
  totalAttempts: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageSyncTime: number;
  lastSyncTime: number | null;
  errorRate: number;
  consecutiveFailures: number;
  sessionStartTime: number;
}

interface HealthData {
  status: "healthy" | "slow" | "degraded" | "unhealthy" | "unknown";
  issues: string[];
  metrics: HealthMetrics;
  recentSyncs: unknown[];
}

interface HealthDashboardButtonProps {
  healthData: HealthData | null;
  onClick?: () => void;
}

export const HealthDashboardButton: React.FC<HealthDashboardButtonProps> = ({
  healthData,
  onClick,
}) => {
  return (
    <Button
      onClick={onClick ?? (() => {})}
      disabled={!onClick}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 border-black transition-all ${
        healthData?.status === "healthy"
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : healthData?.status === "unhealthy"
            ? "bg-red-100 text-red-700 hover:bg-red-200"
            : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
      }`}
      title="View sync health details"
    >
      {renderIcon("Activity", { className: "h-4 w-4" })}
      <span className="text-xs font-bold uppercase">Health</span>
      {healthData?.metrics && (
        <span className="text-xs">
          {(
            (healthData.metrics.successfulSyncs /
              (healthData.metrics.successfulSyncs + healthData.metrics.failedSyncs)) *
              100 || 100
          ).toFixed(0)}
          %
        </span>
      )}
    </Button>
  );
};
