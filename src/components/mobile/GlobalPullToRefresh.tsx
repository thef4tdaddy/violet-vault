import React from "react";
import { createPortal } from "react-dom";
import { getIcon } from "@/utils";
import usePullToRefresh from "@/hooks/platform/mobile/usePullToRefresh";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Global Pull-to-Refresh Modal
 * Shows as a centered modal when user pulls down on mobile
 * Works app-wide from MainLayout
 */
const GlobalPullToRefresh: React.FC = () => {
  const queryClient = useQueryClient();

  const refreshData = async () => {
    await queryClient.invalidateQueries();
  };

  const { isPulling, isRefreshing, pullProgress, pullRotation, isReady } = usePullToRefresh(
    refreshData,
    {
      threshold: 80,
      enabled: true,
    }
  );

  // Only show modal if pulling or refreshing
  if (!isPulling && !isRefreshing) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center"
      style={{
        opacity: isPulling ? pullProgress : 1,
      }}
    >
      {/* Modal backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" />

      {/* Modal content */}
      <div className="relative bg-white/95 backdrop-blur-md rounded-2xl p-8 border-2 border-black shadow-2xl pointer-events-auto">
        {/* Icon */}
        <div className="flex items-center justify-center mb-4">
          {isRefreshing ? (
            <div className="animate-spin">
              {React.createElement(getIcon("RotateCw"), {
                className: "w-12 h-12 text-purple-600",
              })}
            </div>
          ) : (
            <div
              className={`transition-all duration-200 ${
                isReady ? "text-green-600 scale-110" : "text-purple-600"
              }`}
              style={{
                transform: `rotate(${pullRotation}deg)`,
              }}
            >
              {React.createElement(getIcon("ArrowDown"), {
                className: "w-12 h-12",
              })}
            </div>
          )}
        </div>

        {/* Status text */}
        <p className="text-center text-lg font-semibold text-gray-800">
          {isRefreshing ? "Refreshing..." : isReady ? "Release to refresh" : "Pull to refresh"}
        </p>

        {/* Progress indicator */}
        {!isRefreshing && (
          <div className="mt-4 w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${
                isReady ? "bg-green-500" : "bg-purple-500"
              }`}
              style={{
                width: `${Math.min(pullProgress * 100, 100)}%`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Export a wrapper component that attaches the ref to the main app container
export const GlobalPullToRefreshProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();

  const refreshData = async () => {
    await queryClient.invalidateQueries();
  };

  const { containerRef, pullStyles } = usePullToRefresh(refreshData, {
    threshold: 80,
    enabled: true,
  });

  return (
    <div ref={containerRef} style={pullStyles} className="min-h-screen">
      {children}
      <GlobalPullToRefresh />
    </div>
  );
};

export default GlobalPullToRefresh;
