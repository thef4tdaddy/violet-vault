import React from "react";

export type ConnectionStatus = "idle" | "testing" | "success" | "error";

interface ConnectionStatusCardProps {
  status: ConnectionStatus;
  details: string;
}

/**
 * Connection Status Card Component
 */
export const ConnectionStatusCard: React.FC<ConnectionStatusCardProps> = ({ status, details }) => {
  return (
    <div className="border rounded-lg p-4 bg-white/50 backdrop-blur-sm">
      <h3 className="font-semibold text-gray-900 mb-3">Connection Status</h3>
      <div className="flex items-center gap-3">
        <StatusIndicator status={status} />
        <div className="flex-1">
          <span className="text-sm font-medium text-gray-900">{getStatusText(status)}</span>
          {details && <p className="text-xs text-gray-600 mt-1">{details}</p>}
        </div>
      </div>
    </div>
  );
};

/**
 * Status indicator component
 */
function StatusIndicator({ status }: { status: ConnectionStatus }): React.ReactElement {
  const colors: Record<ConnectionStatus, string> = {
    idle: "bg-gray-400",
    testing: "bg-yellow-400 animate-pulse",
    success: "bg-green-500",
    error: "bg-red-500",
  };

  return (
    <div
      className={`w-3 h-3 rounded-full ${colors[status]}`}
      role="status"
      aria-live="polite"
      aria-label={getStatusText(status)}
      title={getStatusText(status)}
    />
  );
}

/**
 * Get status text for connection status
 */
function getStatusText(status: ConnectionStatus): string {
  const texts: Record<ConnectionStatus, string> = {
    idle: "Not tested",
    testing: "Testing connection...",
    success: "Connected",
    error: "Connection failed",
  };
  return texts[status];
}
