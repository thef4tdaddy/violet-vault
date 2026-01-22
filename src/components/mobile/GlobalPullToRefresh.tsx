import React, { createContext, useContext } from "react";
import { createPortal } from "react-dom";
import { motion, MotionValue } from "framer-motion";
import { getIcon } from "@/utils";
import usePullToRefresh from "@/hooks/platform/mobile/usePullToRefresh";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Context to share pull-to-refresh state between Provider and Modal
 */
interface PullToRefreshContextType {
  isPulling: boolean;
  isRefreshing: boolean;
  pullProgress: number;
  pullRotation: MotionValue<number>;
  isReady: boolean;
}

const PullToRefreshContext = createContext<PullToRefreshContextType | null>(null);

/**
 * Hook to consume pull-to-refresh context
 */
const usePullToRefreshContext = () => {
  const context = useContext(PullToRefreshContext);
  if (!context) {
    throw new Error("usePullToRefreshContext must be used within GlobalPullToRefreshProvider");
  }
  return context;
};

/**
 * Global Pull-to-Refresh Modal
 * Shows as a centered modal when user pulls down on mobile
 * Consumes state from context
 */
const GlobalPullToRefresh: React.FC = () => {
  const { isPulling, isRefreshing, pullProgress, pullRotation, isReady } =
    usePullToRefreshContext();

  // Only show modal if pulling or refreshing
  if (!isPulling && !isRefreshing) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-200 pointer-events-none flex items-center justify-center"
      style={{
        opacity: isPulling ? Math.min(pullProgress * 1.5, 1) : 1,
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
            <motion.div
              className={`transition-colors duration-200 ${
                isReady ? "text-green-600" : "text-purple-600"
              }`}
              style={{
                rotate: pullRotation,
                scale: isReady ? 1.1 : 1,
              }}
            >
              {React.createElement(getIcon("ArrowDown"), {
                className: "w-12 h-12",
              })}
            </motion.div>
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
              className={`h-full transition-colors duration-150 ${
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

  const {
    containerRef,
    dragHandlers,
    springY,
    isPulling,
    isRefreshing,
    pullProgress,
    pullRotation,
    isReady,
  } = usePullToRefresh(refreshData, {
    threshold: 80,
    enabled: true,
  });

  const contextValue: PullToRefreshContextType = {
    isPulling,
    isRefreshing,
    pullProgress,
    pullRotation,
    isReady,
  };

  return (
    <PullToRefreshContext.Provider value={contextValue}>
      <motion.div
        ref={containerRef}
        style={{ y: springY }}
        {...dragHandlers}
        className="min-h-screen"
      >
        {children}
        <GlobalPullToRefresh />
      </motion.div>
    </PullToRefreshContext.Provider>
  );
};

export default GlobalPullToRefresh;
