import React, { useState, useEffect } from "react";
import { useOfflineQueueStatus } from "@/hooks/sync/useOfflineQueueStatus";
import { WifiOff, Wifi, RefreshCw, AlertCircle, CheckCircle } from "@/utils/ui/icons";
import { Button } from "@/components/ui";

/**
 * Offline Queue Status Component
 *
 * Displays the current status of the offline request queue
 * and allows users to manually retry failed requests.
 */

export const OfflineQueueStatus: React.FC = () => {
  const { status, retryRequest, clearFailedRequests, processQueue } = useOfflineQueueStatus();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Expand automatically if there are failed requests - defer to avoid cascading renders warning
    if (status?.failedCount && status.failedCount > 0) {
      const timeout = setTimeout(() => {
        setIsExpanded(true);
      }, 0);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [status?.failedCount]);

  if (!status) {
    return null;
  }

  // Don't show if there's nothing in the queue
  if (status.pendingCount === 0 && status.failedCount === 0 && status.processingCount === 0) {
    return null;
  }

  const totalCount = status.pendingCount + status.failedCount + status.processingCount;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="rounded-lg border border-gray-300 bg-white shadow-lg">
        {/* Header */}
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 h-auto font-normal"
        >
          <div className="flex items-center gap-3">
            {status.isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-orange-500" />
            )}
            <div>
              <div className="font-semibold text-gray-900">
                {status.isOnline ? "Online" : "Offline"}
              </div>
              <div className="text-sm text-gray-600">
                {totalCount} {totalCount === 1 ? "request" : "requests"} queued
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {status.processingQueue && <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />}
            <svg
              className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </Button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-200 p-4">
            {/* Status Summary */}
            <div className="mb-4 grid grid-cols-3 gap-2 text-sm">
              <div className="rounded bg-yellow-50 p-2 text-center">
                <div className="font-semibold text-yellow-900">{status.pendingCount}</div>
                <div className="text-yellow-700">Pending</div>
              </div>
              <div className="rounded bg-blue-50 p-2 text-center">
                <div className="font-semibold text-blue-900">{status.processingCount}</div>
                <div className="text-blue-700">Processing</div>
              </div>
              <div className="rounded bg-red-50 p-2 text-center">
                <div className="font-semibold text-red-900">{status.failedCount}</div>
                <div className="text-red-700">Failed</div>
              </div>
            </div>

            {/* Actions */}
            <div className="mb-4 flex gap-2">
              <Button
                onClick={() => processQueue()}
                disabled={!status.isOnline || status.processingQueue || status.pendingCount === 0}
                className="flex-1"
              >
                <RefreshCw className="mr-1 inline h-4 w-4" />
                Process Queue
              </Button>
              {status.failedCount > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => clearFailedRequests()}
                  className="flex-1"
                >
                  Clear Failed
                </Button>
              )}
            </div>

            {/* Request List */}
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {status.requests.map((request) => (
                <div
                  key={request.requestId}
                  className="rounded border border-gray-200 bg-gray-50 p-3 text-sm"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                          request.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : request.status === "processing"
                              ? "bg-blue-100 text-blue-800"
                              : request.status === "failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                        }`}
                      >
                        {request.status === "pending" && <AlertCircle className="mr-1 h-3 w-3" />}
                        {request.status === "processing" && <RefreshCw className="mr-1 h-3 w-3" />}
                        {request.status === "failed" && <AlertCircle className="mr-1 h-3 w-3" />}
                        {request.status === "completed" && <CheckCircle className="mr-1 h-3 w-3" />}
                        {request.status}
                      </span>
                      <span className="font-medium text-gray-900">{request.method}</span>
                    </div>
                    <span className="text-xs text-gray-500">{request.priority}</span>
                  </div>
                  <div className="mb-1 truncate text-xs text-gray-600">{request.url}</div>
                  {request.errorMessage && (
                    <div className="mb-2 text-xs text-red-600">{request.errorMessage}</div>
                  )}
                  {request.status === "pending" && request.nextRetryAt && (
                    <div className="mb-2 text-xs text-gray-500">
                      Next retry: {new Date(request.nextRetryAt).toLocaleTimeString()}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Retries: {request.retryCount}/{request.maxRetries}
                    </span>
                    {request.status === "failed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => retryRequest(request.requestId)}
                        className="h-auto p-0 font-medium text-blue-600 hover:text-blue-800"
                      >
                        Retry Now
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
