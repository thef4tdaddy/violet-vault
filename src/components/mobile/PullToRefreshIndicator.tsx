import React from "react";
import { getIcon } from "../../utils";

/**
 * Pull-to-refresh indicator component
 * Shows visual feedback during pull-to-refresh interaction
 */
interface PullToRefreshIndicatorProps {
  isVisible: boolean;
  isRefreshing: boolean;
  pullProgress: number;
  pullRotation: number;
  isReady: boolean;
}

const PullToRefreshIndicator = ({
  isVisible,
  isRefreshing,
  pullProgress,
  pullRotation,
  isReady,
}: PullToRefreshIndicatorProps) => {
  if (!isVisible) return null;

  return (
    <div
      className="absolute top-0 left-0 right-0 flex items-center justify-center z-10"
      style={{
        height: "60px",
        marginTop: "-60px",
        opacity: pullProgress,
      }}
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 border-2 border-black shadow-lg">
        {isRefreshing ? (
          <div className="animate-spin">
            {React.createElement(getIcon("RotateCw"), {
              className: "w-6 h-6 text-purple-600",
            })}
          </div>
        ) : (
          <div
            className={`transition-transform duration-200 ${
              isReady ? "text-green-600" : "text-purple-600"
            }`}
            style={{
              transform: `rotate(${pullRotation}deg)`,
            }}
          >
            {React.createElement(getIcon("ArrowDown"), {
              className: "w-6 h-6",
            })}
          </div>
        )}
      </div>

      {/* Status text */}
      <div className="absolute top-16 left-0 right-0 text-center">
        <p className="text-sm font-medium text-gray-700">
          {isRefreshing ? "Refreshing..." : isReady ? "Release to refresh" : "Pull to refresh"}
        </p>
      </div>
    </div>
  );
};

export default PullToRefreshIndicator;
