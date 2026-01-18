import React from "react";
import { useServiceAvailability } from "@/hooks/platform/common/useServiceAvailability";
import type { ServiceName } from "@/services/serviceAvailabilityManager";
import { Button } from "@/components/ui";

interface ServiceStatusBadgeProps {
  service?: ServiceName;
  showLabel?: boolean;
  className?: string;
}

export const ServiceStatusBadge: React.FC<ServiceStatusBadgeProps> = ({
  service,
  showLabel = true,
  className = "",
}) => {
  const { status, isChecking, refresh } = useServiceAvailability(service);

  if (isChecking && !status) {
    return <StatusCheckingBadge showLabel={showLabel} className={className} />;
  }

  if (!status) {
    return null;
  }

  // Single service status
  if (service && "available" in status) {
    return (
      <SingleServiceBadge
        service={service}
        status={status}
        showLabel={showLabel}
        className={className}
        onRefresh={refresh}
      />
    );
  }

  // All services status
  if ("api" in status && "budgetEngine" in status && "import" in status) {
    return (
      <AggregateServiceBadge
        status={status as unknown as Record<string, { available: boolean; error?: string }>}
        showLabel={showLabel}
        className={className}
        onRefresh={refresh}
      />
    );
  }

  return null;
};

const StatusCheckingBadge: React.FC<{ showLabel: boolean; className: string }> = ({
  showLabel,
  className,
}) => (
  <div className={`inline-flex items-center space-x-2 ${className}`}>
    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
    {showLabel && <span className="text-sm text-gray-600">Checking...</span>}
  </div>
);

const SingleServiceBadge: React.FC<{
  service: ServiceName;
  status: { available: boolean; error?: string };
  showLabel: boolean;
  className: string;
  onRefresh: () => void;
}> = ({ service, status, showLabel, className, onRefresh }) => {
  const statusColor = status.available ? "bg-green-500" : "bg-amber-500";
  const statusText = status.available ? "Online" : "Offline";
  const statusTextColor = status.available ? "text-green-700" : "text-amber-700";

  return (
    <Button
      onClick={() => onRefresh()}
      className={`inline-flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity ${className} h-auto p-0 bg-transparent hover:bg-transparent`}
      title={status.error || "Click to refresh"}
      aria-label={`${service} service status: ${statusText}. Click to refresh`}
    >
      <div
        className={`w-2 h-2 rounded-full ${statusColor}`}
        role="status"
        aria-label={statusText}
      ></div>
      {showLabel && <span className={`text-sm font-medium ${statusTextColor}`}>{statusText}</span>}
    </Button>
  );
};

const AggregateServiceBadge: React.FC<{
  status: Record<string, { available: boolean; error?: string }>;
  showLabel: boolean;
  className: string;
  onRefresh: () => void;
}> = ({ status, showLabel, className, onRefresh }) => {
  const allAvailable =
    status.api?.available && status.budgetEngine?.available && status.import?.available;
  const someAvailable =
    status.api?.available || status.budgetEngine?.available || status.import?.available;

  let statusColor = "bg-red-500";
  let statusText = "All Offline";
  let statusTextColor = "text-red-700";

  if (allAvailable) {
    statusColor = "bg-green-500";
    statusText = "All Online";
    statusTextColor = "text-green-700";
  } else if (someAvailable) {
    statusColor = "bg-amber-500";
    statusText = "Partial";
    statusTextColor = "text-amber-700";
  }

  return (
    <Button
      onClick={() => onRefresh()}
      className={`inline-flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity ${className} h-auto p-0 bg-transparent hover:bg-transparent`}
      title="Click to refresh service status"
      aria-label={`All services status: ${statusText}. Click to refresh`}
    >
      <div
        className={`w-2 h-2 rounded-full ${statusColor}`}
        role="status"
        aria-label={statusText}
      ></div>
      {showLabel && <span className={`text-sm font-medium ${statusTextColor}`}>{statusText}</span>}
    </Button>
  );
};

interface ServiceStatusDetailsProps {
  className?: string;
}

/**
 * ServiceStatusDetails - Detailed service availability information
 * Shows status for all backend services
 */
export const ServiceStatusDetails: React.FC<ServiceStatusDetailsProps> = ({ className = "" }) => {
  const { status, isChecking, refresh, isOnline } = useServiceAvailability();

  if (!status || !("api" in status)) {
    return null;
  }

  const services = [
    { name: "API", status: status.api, description: "Core API services" },
    { name: "Budget Engine", status: status.budgetEngine, description: "Budget calculations" },
    { name: "Import", status: status.import, description: "Transaction import" },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Service Status</h3>
        <Button
          onClick={() => refresh()}
          disabled={isChecking}
          className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed h-auto"
        >
          {isChecking ? "Checking..." : "Refresh"}
        </Button>
      </div>

      {/* Device Status */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">Device Connection</span>
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${isOnline() ? "bg-green-500" : "bg-red-500"}`}
          ></div>
          <span className="text-sm text-gray-600">{isOnline() ? "Online" : "Offline"}</span>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-2">
        {services.map((service) => (
          <div
            key={service.name}
            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
          >
            <div className="flex-1">
              <div className="font-medium text-gray-900">{service.name}</div>
              <div className="text-sm text-gray-500">{service.description}</div>
              {service.status.error && (
                <div className="text-xs text-red-600 mt-1">{service.status.error}</div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${service.status.available ? "bg-green-500" : "bg-amber-500"}`}
              ></div>
              <span className="text-sm font-medium text-gray-700">
                {service.status.available ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Fallback Info */}
      {!isOnline() && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <div className="font-medium text-blue-900">Offline Mode Active</div>
              <div className="text-sm text-blue-700 mt-1">
                The app will use local data and client-side calculations. Changes will sync when
                you're back online.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
